-- Retention purge and daily poke limit.
--
-- PRD 11.6 promises a 30-day default retention, but retention was enforced only
-- by read policies and by client-side pruning, so rows outlived the window they
-- are promised to live in. PRD 11.5 caps pokes at three per user per day;
-- nothing enforced that.

-- 1. Retention purge --------------------------------------------------------

-- Deletes what has aged out of the retention window. This is retention, not
-- expiration: an update whose `expires_at` has passed stops being current but
-- stays in the private timeline for the rest of the 30 days.
--
-- Postcard objects are deliberately not touched here. `storage.objects` is
-- owned by `supabase_storage_admin`, so a purge running as `postgres` is
-- subject to its row-level security, and a DELETE that silently matches nothing
-- is the good outcome — the bad one is an orphan query that reads no rows and
-- therefore treats every live postcard as an orphan. Deleting the row would
-- also leave the underlying file behind. Postcards are cleaned up out of band
-- by `npm run backend:purge-postcards`; see docs/BACKEND.md.
create or replace function public.purge_expired_monkey_data()
returns table (updates_deleted bigint, interactions_deleted bigint)
language plpgsql
security definer
set search_path = public
as $$
declare
  retention constant interval := interval '30 days';
begin
  delete from public.monkey_updates where created_at < now() - retention;
  get diagnostics updates_deleted = row_count;

  delete from public.monkey_interactions where created_at < now() - retention;
  get diagnostics interactions_deleted = row_count;

  return next;
end;
$$;

revoke all on function public.purge_expired_monkey_data() from public, anon, authenticated;

-- Scheduled daily. The guard keeps the migration applicable on a project where
-- pg_cron is unavailable; that project keeps the function and must schedule it
-- another way. See docs/BACKEND.md.
do $do$
begin
  execute 'create extension if not exists pg_cron';
  execute $cron$
    select cron.schedule(
      'monkey-retention-purge',
      '20 4 * * *',
      'select public.purge_expired_monkey_data()'
    )
  $cron$;
exception when others then
  raise notice 'Retention purge was not scheduled (%). Schedule public.purge_expired_monkey_data() manually.', sqlerrm;
end;
$do$;

-- 2. Daily poke limit -------------------------------------------------------

-- Counted over a rolling 24 hours rather than a calendar day, because the
-- server's midnight is not the sender's midnight and a rolling window cannot be
-- gamed by waiting for a date boundary.
--
-- SECURITY DEFINER so the insert policy below can count rows without recursing
-- into that same policy. `authenticated` needs EXECUTE because a policy is
-- evaluated as the calling role; the grant also lets a client show how many
-- pokes are left.
create or replace function public.pokes_sent_recently()
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::int
  from public.monkey_interactions
  where sender_id = auth.uid()
    and kind = 'poke'
    and created_at >= now() - interval '24 hours';
$$;

grant execute on function public.pokes_sent_recently() to authenticated;

create index if not exists monkey_interactions_sender_poke_recent
  on public.monkey_interactions(sender_id, created_at desc)
  where kind = 'poke';

drop policy "members send interactions to partner" on public.monkey_interactions;

create policy "members send interactions to partner" on public.monkey_interactions for insert
  with check (
    sender_id = auth.uid()
    and recipient_id <> auth.uid()
    and public.is_active_troop_member(troop_id)
    and exists (
      select 1 from public.troop_members recipient
      where recipient.troop_id = monkey_interactions.troop_id
        and recipient.user_id = monkey_interactions.recipient_id
        and recipient.left_at is null
    )
    and (kind <> 'poke' or public.pokes_sent_recently() < 3)
  );
