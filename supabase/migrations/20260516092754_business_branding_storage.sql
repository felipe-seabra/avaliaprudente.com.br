-- Create a bucket for business assets
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'business-assets', 
  'business-assets', 
  true, 
  5242880, 
  array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];

-- Storage Policies for 'business-assets'

-- 1. Public Read Access
drop policy if exists "Public Access to Business Assets" on storage.objects;
create policy "Public Access to Business Assets"
  on storage.objects for select
  using ( bucket_id = 'business-assets' );

-- 2. Owner Upload Access
drop policy if exists "Owners can upload business assets" on storage.objects;
create policy "Owners can upload business assets"
  on storage.objects for insert
  with check (
    bucket_id = 'business-assets' AND
    auth.role() = 'authenticated'
  );

-- 3. Owner Update/Delete Access
drop policy if exists "Owners can update their own business assets" on storage.objects;
create policy "Owners can update their own business assets"
  on storage.objects for update
  using (
    bucket_id = 'business-assets' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Owners can delete their own business assets" on storage.objects;
create policy "Owners can delete their own business assets"
  on storage.objects for delete
  using (
    bucket_id = 'business-assets' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
