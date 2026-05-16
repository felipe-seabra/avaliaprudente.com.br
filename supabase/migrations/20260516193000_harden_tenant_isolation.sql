-- 1. Hardening Businesses RLS
-- We want to allow public access for the public page, but restrict "listing" to owners/admins
drop policy if exists "Public can view businesses" on businesses;
drop policy if exists "Owners can manage their businesses" on businesses;
drop policy if exists "Admins can view all businesses" on businesses;

-- Policy for Public Access (Select only)
create policy "Anyone can view businesses"
  on businesses for select
  using (true);

-- Policy for Owners (All operations)
-- We use a separate policy for manage to ensure isolation for insert/update/delete
create policy "Owners can manage their businesses"
  on businesses for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- Policy for Admins (Select global)
create policy "Admins can view all businesses"
  on businesses for select
  using (is_admin(auth.uid()));

-- 2. Hardening Reviews RLS
drop policy if exists "Public can view reviews" on reviews;
drop policy if exists "Owners can view their business reviews" on reviews;
drop policy if exists "Admins can view all reviews" on reviews;

-- Allow public to see reviews (needed for public pages)
create policy "Anyone can view reviews"
  on reviews for select
  using (true);

-- Owners can only manage reviews for their own businesses
-- Note: Insert is usually public, but update/delete is owner/admin
create policy "Owners can manage their business reviews"
  on reviews for all
  using (exists (
    select 1 from businesses
    where businesses.id = reviews.business_id
    and businesses.owner_id = auth.uid()
  ));

-- Admins can see all
create policy "Admins can view all reviews"
  on reviews for select
  using (is_admin(auth.uid()));

-- 3. Hardening Analytics RLS
drop policy if exists "Owners can view their business analytics" on analytics_events;
drop policy if exists "Admins can view all analytics" on analytics_events;

-- Strict isolation for analytics
create policy "Owners can view their business analytics"
  on analytics_events for select
  using (exists (
    select 1 from businesses
    where businesses.id = analytics_events.business_id
    and businesses.owner_id = auth.uid()
  ));

create policy "Admins can view all analytics"
  on analytics_events for select
  using (is_admin(auth.uid()));

-- 4. Hardening Profiles RLS
drop policy if exists "Users can view own profile" on profiles;
drop policy if exists "Admins can view all profiles" on profiles;

create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Admins can view all profiles"
  on profiles for select
  using (is_admin(auth.uid()));
