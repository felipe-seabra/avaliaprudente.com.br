-- 1. Explicit Schema and Table Permissions for Public Access
grant usage on schema public to anon;
grant usage on schema public to authenticated;

grant select, insert on table public.reviews to anon;
grant select, insert on table public.reviews to authenticated;

grant select, insert on table public.analytics_events to anon;
grant select, insert on table public.analytics_events to authenticated;

grant select on table public.businesses to anon;
grant select on table public.businesses to authenticated;

grant select on table public.business_pages to anon;
grant select on table public.business_pages to authenticated;

grant select on table public.page_links to anon;
grant select on table public.page_links to authenticated;

-- 2. Refine Reviews RLS
drop policy if exists "Anyone can insert a review" on reviews;
create policy "Anyone can insert a review"
  on reviews for insert
  with check (true);

drop policy if exists "Public can view reviews" on reviews;
create policy "Public can view reviews"
  on reviews for select
  using (true);

-- 3. Refine Page Links RLS (Simplified for Reorder)
drop policy if exists "Owners can manage their page links" on page_links;
create policy "Owners can manage their page links"
  on page_links for all
  using (exists (
    select 1 from business_pages bp
    join businesses b on b.id = bp.business_id
    where bp.id = page_links.page_id
    and b.owner_id = auth.uid()
  ))
  with check (exists (
    select 1 from business_pages bp
    join businesses b on b.id = bp.business_id
    where bp.id = page_links.page_id
    and b.owner_id = auth.uid()
  ));

-- 4. Analytics RLS
drop policy if exists "Anyone can insert an analytics event" on analytics_events;
create policy "Anyone can insert an analytics event"
  on analytics_events for insert
  with check (true);

-- 5. Business and Pages (Public View)
drop policy if exists "Public can view businesses" on businesses;
create policy "Public can view businesses" on businesses for select using (true);

drop policy if exists "Public can view published business pages" on business_pages;
create policy "Public can view published business pages" on business_pages for select using (true);
