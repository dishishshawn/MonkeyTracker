create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 30),
  avatar_accent text not null default '#996744',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.troops (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  ended_at timestamptz
);

create table public.troop_members (
  troop_id uuid not null references public.troops(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  accepted_at timestamptz not null default now(),
  left_at timestamptz,
  primary key (troop_id, user_id)
);

create unique index one_active_troop_per_user
  on public.troop_members(user_id) where left_at is null;

create table public.troop_invites (
  id uuid primary key default gen_random_uuid(),
  troop_id uuid not null references public.troops(id) on delete cascade,
  created_by uuid not null references auth.users(id),
  code_hash bytea not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.monkey_updates (
  id uuid primary key default gen_random_uuid(),
  troop_id uuid not null references public.troops(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  activity text not null check (activity in ('Studying', 'Working', 'Eating', 'Chilling', 'Sleeping', 'Commuting', 'At the gym', 'Cooking', 'Gaming', 'Out & about')),
  mood text not null check (mood in ('Crispy', 'Cozy', 'Focused', 'Wobbly', 'Happy', 'Tender', 'Sleepy', 'Frazzled', 'Social', 'Quiet')),
  availability text not null check (availability in ('Free', 'Text only', 'Busy', 'Asleep')),
  caption text check (caption is null or char_length(caption) <= 140),
  location_level text not null check (location_level in ('Hidden', 'Perch', 'Nearby', 'Trail')),
  place text check (place is null or char_length(place) <= 80),
  expiration text not null check (expiration in ('15 min', '30 min', '1 hour', '2 hours', '4 hours', '8 hours', 'End of day')),
  scene text not null check (scene in ('Auto', 'Desk nest', 'Couch mode', 'Outdoors', 'Café', 'Blanket fort')),
  pose text not null check (pose in ('Auto', 'Waving', 'Locked in', 'Flopped', 'Victory')),
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  check (location_level <> 'Hidden' or place is null),
  check (location_level <> 'Trail' or expiration in ('15 min', '30 min', '1 hour')),
  check (expires_at > updated_at)
);

create index monkey_updates_troop_created on public.monkey_updates(troop_id, created_at desc);
create index monkey_updates_current on public.monkey_updates(troop_id, expires_at desc);

create or replace function public.stamp_monkey_update()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := statement_timestamp();
  return new;
end;
$$;

create trigger stamp_monkey_update_before_insert
  before insert on public.monkey_updates
  for each row execute procedure public.stamp_monkey_update();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles(id, display_name, avatar_accent)
  values (
    new.id,
    left(coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), split_part(coalesce(new.email, 'Monkey'), '@', 1)), 30),
    coalesce(nullif(new.raw_user_meta_data ->> 'avatar_accent', ''), '#996744')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.is_active_troop_member(target_troop_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.troop_members tm
    join public.troops t on t.id = tm.troop_id
    where tm.troop_id = target_troop_id
      and tm.user_id = auth.uid()
      and tm.left_at is null
      and t.ended_at is null
  );
$$;

create or replace function public.shares_active_troop(other_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.troop_members mine
    join public.troop_members theirs on theirs.troop_id = mine.troop_id
    join public.troops t on t.id = mine.troop_id
    where mine.user_id = auth.uid()
      and theirs.user_id = other_user_id
      and mine.left_at is null
      and theirs.left_at is null
      and t.ended_at is null
  );
$$;

create or replace function public.create_troop_invite()
returns text
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  caller uuid := auth.uid();
  troop uuid;
  invite_code text;
begin
  if caller is null then raise exception 'Authentication required'; end if;
  select tm.troop_id into troop
  from public.troop_members tm
  join public.troops t on t.id = tm.troop_id
  where tm.user_id = caller and tm.left_at is null and t.ended_at is null;

  if troop is not null then
    if (select count(*) from public.troop_members where troop_id = troop and left_at is null) >= 2 then
      raise exception 'User already belongs to a paired troop';
    end if;
    update public.troop_invites set used_at = now()
      where troop_id = troop and used_at is null;
  else
    insert into public.troops(created_by) values (caller) returning id into troop;
    insert into public.troop_members(troop_id, user_id) values (troop, caller);
  end if;

  loop
    invite_code := lpad(floor(random() * 1000000)::int::text, 6, '0');
    begin
      insert into public.troop_invites(troop_id, created_by, code_hash, expires_at)
      values (troop, caller, digest(invite_code, 'sha256'), now() + interval '15 minutes');
      exit;
    exception when unique_violation then
      -- Generate another short-lived code on collision.
    end;
  end loop;
  return invite_code;
end;
$$;

create or replace function public.accept_troop_invite(invite_code text)
returns uuid
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  caller uuid := auth.uid();
  invite public.troop_invites%rowtype;
begin
  if caller is null then raise exception 'Authentication required'; end if;
  if exists (select 1 from public.troop_members where user_id = caller and left_at is null) then
    raise exception 'User already belongs to an active troop';
  end if;

  select * into invite from public.troop_invites
  where code_hash = digest(trim(invite_code), 'sha256')
    and used_at is null
    and expires_at > now()
  for update;

  if invite.id is null then raise exception 'Invite is invalid or expired'; end if;
  if (select count(*) from public.troop_members where troop_id = invite.troop_id and left_at is null) >= 2 then
    raise exception 'Troop already has two active members';
  end if;

  insert into public.troop_members(troop_id, user_id) values (invite.troop_id, caller);
  update public.troop_invites set used_at = now() where id = invite.id;
  return invite.troop_id;
end;
$$;

create or replace function public.leave_troop(target_troop_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_active_troop_member(target_troop_id) then raise exception 'Active membership required'; end if;
  update public.troops set ended_at = now() where id = target_troop_id and ended_at is null;
  update public.troop_members set left_at = now() where troop_id = target_troop_id and left_at is null;
end;
$$;

alter table public.profiles enable row level security;
alter table public.troops enable row level security;
alter table public.troop_members enable row level security;
alter table public.troop_invites enable row level security;
alter table public.monkey_updates enable row level security;

create policy "profiles visible within active troop" on public.profiles for select
  using (id = auth.uid() or public.shares_active_troop(id));
create policy "users insert own profile" on public.profiles for insert
  with check (id = auth.uid());
create policy "users update own profile" on public.profiles for update
  using (id = auth.uid()) with check (id = auth.uid());

create policy "active members read troop" on public.troops for select
  using (public.is_active_troop_member(id));
create policy "active members read membership" on public.troop_members for select
  using (public.is_active_troop_member(troop_id));

create policy "active members read retained updates" on public.monkey_updates for select
  using (public.is_active_troop_member(troop_id) and created_at >= now() - interval '30 days');
create policy "members publish own updates" on public.monkey_updates for insert
  with check (user_id = auth.uid() and public.is_active_troop_member(troop_id));
create policy "users update own updates" on public.monkey_updates for update
  using (user_id = auth.uid() and public.is_active_troop_member(troop_id))
  with check (user_id = auth.uid() and public.is_active_troop_member(troop_id));
create policy "users delete own updates" on public.monkey_updates for delete
  using (user_id = auth.uid() and public.is_active_troop_member(troop_id));

grant execute on function public.create_troop_invite() to authenticated;
grant execute on function public.accept_troop_invite(text) to authenticated;
grant execute on function public.leave_troop(uuid) to authenticated;
revoke all on public.troop_invites from anon, authenticated;

alter publication supabase_realtime add table public.monkey_updates;
