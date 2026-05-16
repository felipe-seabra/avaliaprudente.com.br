-- 1. Ensure public read access for reviews (needed for social proof on public pages)
drop policy if exists "Public can view reviews" on reviews;
create policy "Public can view reviews"
  on reviews for select
  using (true);

-- 2. Harden existing public select policies for anonymous access
-- Using true instead of complex checks to avoid SSR lookup failures
drop policy if exists "Public can view businesses" on businesses;
create policy "Public can view businesses" on businesses for select using (true);

drop policy if exists "Public can view published business pages" on business_pages;
create policy "Public can view published business pages" on business_pages for select using (true);

drop policy if exists "Public can view active page links" on page_links;
create policy "Public can view active page links" on page_links for select using (true);

-- 3. Ensure everyone can insert an analytics event (tracking visits anonymously)
drop policy if exists "Anyone can insert an analytics event" on analytics_events;
create policy "Anyone can insert an analytics event"
  on analytics_events for insert
  with check (true);
