alter table public.monkey_updates
  add column if not exists accessory text not null default 'None'
    check (accessory in ('None', 'Glasses', 'Beanie', 'Crown', 'Flower')),
  add column if not exists room_decor text not null default 'None'
    check (room_decor in ('None', 'Plant', 'String lights', 'Poster', 'Plushie')),
  add column if not exists photo_path text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'monkey-postcards',
  'monkey-postcards',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "troop members read private postcards" on storage.objects for select
  using (
    bucket_id = 'monkey-postcards'
    and exists (
      select 1 from public.troop_members member
      join public.troops troop on troop.id = member.troop_id
      where member.user_id = auth.uid()
        and member.left_at is null
        and troop.ended_at is null
        and member.troop_id::text = (storage.foldername(name))[1]
    )
  );

create policy "members upload own private postcards" on storage.objects for insert
  with check (
    bucket_id = 'monkey-postcards'
    and (storage.foldername(name))[2] = auth.uid()::text
    and exists (
      select 1 from public.troop_members member
      join public.troops troop on troop.id = member.troop_id
      where member.user_id = auth.uid()
        and member.left_at is null
        and troop.ended_at is null
        and member.troop_id::text = (storage.foldername(name))[1]
    )
  );

create policy "members delete own private postcards" on storage.objects for delete
  using (
    bucket_id = 'monkey-postcards'
    and (storage.foldername(name))[2] = auth.uid()::text
  );
