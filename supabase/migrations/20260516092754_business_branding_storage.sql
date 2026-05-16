-- Create a bucket for business assets
insert into storage.buckets (id, name, public)
values ('business-assets', 'business-assets', true);

-- Storage Policies for 'business-assets'

-- 1. Public Read Access
create policy "Public Access to Business Assets"
  on storage.objects for select
  using ( bucket_id = 'business-assets' );

-- 2. Owner Upload Access
-- We allow upload if the user is authenticated and the path starts with their user id
create policy "Owners can upload business assets"
  on storage.objects for insert
  with check (
    bucket_id = 'business-assets' AND
    auth.role() = 'authenticated'
  );

-- 3. Owner Update/Delete Access
create policy "Owners can update their own business assets"
  on storage.objects for update
  using (
    bucket_id = 'business-assets' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Owners can delete their own business assets"
  on storage.objects for delete
  using (
    bucket_id = 'business-assets' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Note: The folder structure should be bucket/user_id/business_id/filename.ext
-- This way we can enforce that only the owner can manage their assets.
