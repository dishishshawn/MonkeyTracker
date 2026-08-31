alter table public.profiles
  add column if not exists avatar_skin text not null default '#EBC6A6';

-- Preserve anyone who selected the short-lived combined palette while moving
-- the app to independently selectable fur and face colors.
update public.profiles
set avatar_accent = '#77B9E8', avatar_skin = '#FFD9E8'
where avatar_accent = 'blue-pink';

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_accent text := nullif(new.raw_user_meta_data ->> 'avatar_accent', '');
  requested_skin text := nullif(new.raw_user_meta_data ->> 'avatar_skin', '');
begin
  insert into public.profiles(id, display_name, avatar_accent, avatar_skin)
  values (
    new.id,
    left(coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), split_part(coalesce(new.email, 'Monkey'), '@', 1)), 30),
    case when requested_accent = 'blue-pink' then '#77B9E8' else coalesce(requested_accent, '#996744') end,
    case when requested_accent = 'blue-pink' and requested_skin is null then '#FFD9E8' else coalesce(requested_skin, '#EBC6A6') end
  );
  return new;
end;
$$;
