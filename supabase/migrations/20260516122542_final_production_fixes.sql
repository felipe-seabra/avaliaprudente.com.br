-- 1. Final Public Access for SSR and Anonymous Users
drop policy if exists "Public can view businesses" on businesses;
create policy "Public can view businesses" on businesses for select using (true);

drop policy if exists "Public can view published business pages" on business_pages;
create policy "Public can view published business pages" on business_pages for select using (is_published = true);

drop policy if exists "Public can view active page links" on page_links;
create policy "Public can view active page links" on page_links for select using (is_active = true);

-- 2. Simplified Owners Management for Page Links (Fixes Reorder)
drop policy if exists "Owners can insert page links" on page_links;
drop policy if exists "Owners can select page links" on page_links;
drop policy if exists "Owners can update page links" on page_links;
drop policy if exists "Owners can delete page links" on page_links;
drop policy if exists "Owners can manage their page links" on page_links;

create policy "Owners can manage their page links"
  on page_links for all
  using (exists (
    select 1 from business_pages bp
    join businesses b on b.id = bp.business_id
    where bp.id = page_links.page_id
    and b.owner_id = auth.uid()
  ));

-- 3. Storage Bucket Configuration & Final RLS
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

drop policy if exists "Public Access to Business Assets" on storage.objects;
create policy "Public Access to Business Assets" on storage.objects for select using (bucket_id = 'business-assets');

drop policy if exists "Owners can upload business assets" on storage.objects;
create policy "Owners can upload business assets"
  on storage.objects for insert
  with check (
    bucket_id = 'business-assets' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Owners can update their own business assets" on storage.objects;
create policy "Owners can update their own business assets"
  on storage.objects for update
  using (
    bucket_id = 'business-assets' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Owners can delete their own business assets" on storage.objects;
create policy "Owners can delete their own business assets"
  on storage.objects for delete
  using (
    bucket_id = 'business-assets' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
