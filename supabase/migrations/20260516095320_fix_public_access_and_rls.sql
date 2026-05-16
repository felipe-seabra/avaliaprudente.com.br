-- Fix public access to businesses so public pages can be resolved by slug
drop policy if exists "Public can view businesses" on businesses;
create policy "Public can view businesses"
  on businesses for select
  using (true);

-- Fix page_links RLS for drag-and-drop (ensure insert/update work correctly)
drop policy if exists "Owners can manage their page links" on page_links;

create policy "Owners can insert page links"
  on page_links for insert
  with check (exists (
    select 1 from business_pages bp
    join businesses b on b.id = bp.business_id
    where bp.id = page_links.page_id
    and b.owner_id = auth.uid()
  ));

create policy "Owners can select page links"
  on page_links for select
  using (exists (
    select 1 from business_pages bp
    join businesses b on b.id = bp.business_id
    where bp.id = page_links.page_id
    and b.owner_id = auth.uid()
  ));

create policy "Owners can update page links"
  on page_links for update
  using (exists (
    select 1 from business_pages bp
    join businesses b on b.id = bp.business_id
    where bp.id = page_links.page_id
    and b.owner_id = auth.uid()
  ));

create policy "Owners can delete page links"
  on page_links for delete
  using (exists (
    select 1 from business_pages bp
    join businesses b on b.id = bp.business_id
    where bp.id = page_links.page_id
    and b.owner_id = auth.uid()
  ));
