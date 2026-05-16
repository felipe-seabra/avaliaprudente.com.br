-- 1. Create a helper function to check if a user is an admin without recursion
-- We use a SECURITY DEFINER function to bypass RLS during the check itself
create or replace function public.is_admin(user_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = user_id
    and role = 'admin'
  );
end;
$$ language plpgsql security definer;

-- 2. Profiles Table RLS
drop policy if exists "Users can view own profile" on profiles;
drop policy if exists "Admins can view all profiles" on profiles;

create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Admins can view all profiles"
  on profiles for select
  using (is_admin(auth.uid()));

-- 3. Businesses Table RLS
drop policy if exists "Public can view businesses" on businesses;
drop policy if exists "Owners can manage their businesses" on businesses;
drop policy if exists "Admins can view all businesses" on businesses;

create policy "Public can view businesses"
  on businesses for select
  using (true);

create policy "Owners can manage their businesses"
  on businesses for all
  using (auth.uid() = owner_id);

create policy "Admins can view all businesses"
  on businesses for select
  using (is_admin(auth.uid()));

-- 4. Reviews Table RLS
drop policy if exists "Public can view reviews" on reviews;
drop policy if exists "Owners can view their business reviews" on reviews;
drop policy if exists "Admins can view all reviews" on reviews;

create policy "Public can view reviews"
  on reviews for select
  using (true);

create policy "Owners can view their business reviews"
  on reviews for select
  using (exists (
    select 1 from businesses
    where businesses.id = reviews.business_id
    and businesses.owner_id = auth.uid()
  ));

create policy "Admins can view all reviews"
  on reviews for select
  using (is_admin(auth.uid()));

-- 5. Analytics Events Table RLS
drop policy if exists "Owners can view their business analytics" on analytics_events;
drop policy if exists "Admins can view all analytics" on analytics_events;

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
