create table public.monkey_interactions (
  id uuid primary key default gen_random_uuid(),
  troop_id uuid not null references public.troops(id) on delete cascade,
  sender_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('reaction', 'poke')),
  reaction text,
  created_at timestamptz not null default now(),
  check (sender_id <> recipient_id),
  check (
    (kind = 'reaction' and reaction in ('♡', '🍌', '🫡', '😭'))
    or (kind = 'poke' and reaction is null)
  )
);

create index monkey_interactions_troop_created
  on public.monkey_interactions(troop_id, created_at desc);

alter table public.monkey_interactions enable row level security;

create policy "active members read interactions" on public.monkey_interactions for select
  using (
    public.is_active_troop_member(troop_id)
    and (sender_id = auth.uid() or recipient_id = auth.uid())
    and created_at >= now() - interval '30 days'
  );

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
  );

alter publication supabase_realtime add table public.monkey_interactions;
