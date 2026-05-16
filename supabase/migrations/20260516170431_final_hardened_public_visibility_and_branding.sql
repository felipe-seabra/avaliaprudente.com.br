-- 1. Final Schema Grant Hardening for Anonymous Role
-- This ensures the 'anon' role can actually use the tables even if RLS says yes.
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

grant select on table public.analytics_events to anon;
grant select on table public.analytics_events to authenticated;

-- 2. Ensure RLS SELECT policies are wide open for public tables
-- We use drop first to avoid conflicts
drop policy if exists "Public can view businesses" on businesses;
create policy "Public can view businesses" on businesses for select using (true);

drop policy if exists "Public can view published business pages" on business_pages;
create policy "Public can view published business pages" on business_pages for select using (true);

drop policy if exists "Public can view active page links" on page_links;
create policy "Public can view active page links" on page_links for select using (true);

drop policy if exists "Public can view reviews" on reviews;
create policy "Public can view reviews" on reviews for select using (true);

-- 3. Ensure INSERT access for public submissions (Reviews & Analytics)
grant insert on table public.reviews to anon;
grant insert on table public.reviews to authenticated;

drop policy if exists "Anyone can insert a review" on reviews;
create policy "Anyone can insert a review" on reviews for insert with check (true);

grant insert on table public.analytics_events to anon;
grant insert on table public.analytics_events to authenticated;

drop policy if exists "Anyone can insert an analytics event" on analytics_events;
create policy "Anyone can insert an analytics event" on analytics_events for insert with check (true);
