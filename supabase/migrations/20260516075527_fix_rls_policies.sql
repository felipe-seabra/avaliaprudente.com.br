-- Fix RLS recursion and explicit permissions

-- 1. Profiles: Simplify to avoid recursion
drop policy if exists "Admins can view all profiles" on profiles;
drop policy if exists "Public profiles are viewable by everyone." on profiles;

create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

-- For admin access to all profiles, we use a more direct approach if possible, 
-- but usually, admins are managed via dashboard logic or a security definer function.
-- For now, let's just allow users to see their own.

-- 2. Business Pages: Add explicit insert with check
drop policy if exists "Owners can manage their business pages" on business_pages;

create policy "Owners can insert their business pages"
  on business_pages for insert
  with check (exists (
    select 1 from businesses
    where businesses.id = business_pages.business_id
    and businesses.owner_id = auth.uid()
  ));

create policy "Owners can select their business pages"
  on business_pages for select
  using (exists (
    select 1 from businesses
    where businesses.id = business_pages.business_id
    and businesses.owner_id = auth.uid()
  ));

create policy "Owners can update their business pages"
  on business_pages for update
  using (exists (
    select 1 from businesses
    where businesses.id = business_pages.business_id
    and businesses.owner_id = auth.uid()
  ));

create policy "Owners can delete their business pages"
  on business_pages for delete
  using (exists (
    select 1 from businesses
    where businesses.id = business_pages.business_id
    and businesses.owner_id = auth.uid()
  ));

-- 3. Page Links: Ensure all operations are covered
drop policy if exists "Owners can manage their page links" on page_links;

create policy "Owners can manage their page links"
  on page_links for all
  using (exists (
    select 1 from business_pages bp
    join businesses b on b.id = bp.business_id
    where bp.id = page_links.page_id
    and b.owner_id = auth.uid()
  ));

-- 4. Analytics: Ensure everyone can track (insert)
drop policy if exists "Anyone can insert an analytics event" on analytics_events;

create policy "Anyone can insert an analytics event"
  on analytics_events for insert
  with check (true);
