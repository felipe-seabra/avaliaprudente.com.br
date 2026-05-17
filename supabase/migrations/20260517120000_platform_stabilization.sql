-- Platform Stabilization Migration
-- This migration ensures core visibility and accessibility rules are maintained

-- 1. Ensure public visibility for businesses (Crucial for public pages and rankings)
drop policy if exists "Public can view businesses" on public.businesses;
drop policy if exists "Anyone can view businesses" on public.businesses;
create policy "Anyone can view businesses"
  on public.businesses for select
  using (true);

-- 2. Ensure public visibility for business pages
drop policy if exists "Public can view published business pages" on public.business_pages;
drop policy if exists "Anyone can view published pages" on public.business_pages;
create policy "Anyone can view published business pages"
  on public.business_pages for select
  using (is_published = true);

-- 3. Ensure public visibility for page links
drop policy if exists "Public can view active page links" on public.page_links;
drop policy if exists "Anyone can view active page links" on public.page_links;
create policy "Anyone can view active page links"
  on public.page_links for select
  using (exists (
    select 1 from public.business_pages
    where public.business_pages.id = public.page_links.page_id
    and public.business_pages.is_published = true
  ) and is_active = true);

-- 4. Ensure public visibility for reviews
drop policy if exists "Public can view reviews" on public.reviews;
drop policy if exists "Anyone can view reviews" on public.reviews;
create policy "Anyone can view reviews"
  on public.reviews for select
  using (true);

-- 5. Profiles visibility (Users can see themselves, admins see all)
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- 6. Verification Requests (Users see own, admins see all)
drop policy if exists "Users can view their own verification requests" on public.verification_requests;
create policy "Users can view their own verification requests"
  on public.verification_requests for select
  using (auth.uid() = user_id);

-- 7. Notifications (Users see own)
drop policy if exists "Users can manage their own notifications" on public.notifications;
create policy "Users can manage their own notifications"
  on public.notifications for all
  using (auth.uid() = user_id);

-- 8. Fix possible join issues by ensuring FKs are named and indexed
-- Businesses owner
alter table public.businesses 
  drop constraint if exists businesses_owner_id_fkey,
  add constraint businesses_owner_id_fkey 
    foreign key (owner_id) 
    references public.profiles(id) 
    on delete cascade;

-- Businesses verifier
alter table public.businesses 
  drop constraint if exists businesses_verified_by_fkey,
  add constraint businesses_verified_by_fkey 
    foreign key (verified_by) 
    references public.profiles(id) 
    on delete set null;

-- Verification requests business
alter table public.verification_requests 
  drop constraint if exists verification_requests_business_id_fkey,
  add constraint verification_requests_business_id_fkey 
    foreign key (business_id) 
    references public.businesses(id) 
    on delete cascade;

-- Verification requests user
alter table public.verification_requests 
  drop constraint if exists verification_requests_user_id_fkey,
  add constraint verification_requests_user_id_fkey 
    foreign key (user_id) 
    references public.profiles(id) 
    on delete cascade;
