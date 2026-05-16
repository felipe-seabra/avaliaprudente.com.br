-- 1. Ensure public permissions on schema and tables
grant usage on schema public to anon;
grant usage on schema public to authenticated;

grant select on table public.businesses to anon;
grant select on table public.businesses to authenticated;

grant select on table public.business_pages to anon;
grant select on table public.business_pages to authenticated;

grant select on table public.page_links to anon;
grant select on table public.page_links to authenticated;

grant select on table public.reviews to anon;
grant select on table public.reviews to authenticated;

-- 2. Explicitly open SELECT access for reviews anonymously
drop policy if exists "Public can view reviews" on reviews;
create policy "Public can view reviews"
  on reviews for select
  using (true);

-- 3. Ensure businesses are readable by everyone to resolve slugs
drop policy if exists "Public can view businesses" on businesses;
create policy "Public can view businesses"
  on businesses for select
  using (true);

-- 4. Ensure pages are readable
drop policy if exists "Public can view published business pages" on business_pages;
create policy "Public can view published business pages"
  on business_pages for select
  using (true);

-- 5. Ensure links are readable
drop policy if exists "Public can view active page links" on page_links;
create policy "Public can view active page links"
  on page_links for select
  using (true);
