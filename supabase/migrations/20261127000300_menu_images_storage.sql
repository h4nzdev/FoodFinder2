-- ============================================================================
-- Migration 3: Supabase Storage Bucket & RLS for Verified Owner Menu Images
-- (100% Idempotent — safe to re-run in Supabase SQL Editor)
-- ============================================================================

-- Ensure restaurant_claims exists even if this script is run out of order
create table if not exists public.restaurant_claims (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users on delete cascade,
  restaurant_osm_type text not null,
  restaurant_osm_id text not null check (restaurant_osm_id ~ '^[1-9][0-9]{0,18}$'),
  restaurant_name text not null check (length(btrim(restaurant_name)) between 1 and 200),
  evidence text not null check (length(btrim(evidence)) between 20 and 3000),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'menu-images',
  'menu-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Anyone can view published menu images" on storage.objects;
create policy "Anyone can view published menu images"
  on storage.objects for select
  to public
  using (bucket_id = 'menu-images');

drop policy if exists "Approved owners upload menu images for their claim" on storage.objects;
create policy "Approved owners upload menu images for their claim"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'menu-images'
    and exists (
      select 1 from public.restaurant_claims c
      where c.id::text = (storage.foldername(name))[1]
        and c.owner_id = (select auth.uid())
        and c.status = 'approved'
    )
  );

drop policy if exists "Approved owners update their menu images" on storage.objects;
create policy "Approved owners update their menu images"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'menu-images'
    and exists (
      select 1 from public.restaurant_claims c
      where c.id::text = (storage.foldername(name))[1]
        and c.owner_id = (select auth.uid())
        and c.status = 'approved'
    )
  );

drop policy if exists "Approved owners delete their menu images" on storage.objects;
create policy "Approved owners delete their menu images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'menu-images'
    and exists (
      select 1 from public.restaurant_claims c
      where c.id::text = (storage.foldername(name))[1]
        and c.owner_id = (select auth.uid())
        and c.status = 'approved'
    )
  );

notify pgrst, 'reload schema';
