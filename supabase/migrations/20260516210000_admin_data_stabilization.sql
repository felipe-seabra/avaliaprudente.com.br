-- Stabilization migration for Admin data visibility and schema consistency

-- 1. Ensure businesses has is_verified column
alter table public.businesses add column if not exists is_verified boolean default false;

-- 2. Fix foreign key for profiles join
-- PostgREST needs a direct relationship to join businesses and profiles easily
-- We'll add a foreign key constraint from businesses(owner_id) to profiles(id)
-- Note: Both reference auth.users(id), so this is safe.
alter table public.businesses 
  drop constraint if exists businesses_owner_id_fkey,
  add constraint businesses_owner_id_fkey 
    foreign key (owner_id) 
    references public.profiles(id) 
    on delete cascade;

-- 3. Sync missing profiles
-- Ensure every auth user has a profile record
insert into public.profiles (id, full_name, email, created_at, updated_at)
select 
  id, 
  raw_user_meta_data->>'full_name', 
  email, 
  created_at, 
  last_sign_in_at
from auth.users
on conflict (id) do update set
  email = excluded.email,
  updated_at = now()
where public.profiles.email is null or public.profiles.updated_at is null;

-- 4. Harden Admin RLS policies to prevent recursion and ensure bypass
-- We usejwt check as primary for performance, and fallback to function
drop policy if exists "Admins can view all profiles" on profiles;
create policy "Admins can view all profiles"
  on profiles for select
  using (
    (auth.jwt() ->> 'role' = 'admin') or 
    is_admin(auth.uid())
  );

drop policy if exists "Admins can view all businesses" on businesses;
create policy "Admins can view all businesses"
  on businesses for select
  using (
    (auth.jwt() ->> 'role' = 'admin') or 
    is_admin(auth.uid())
  );

drop policy if exists "Admins can view all reviews" on reviews;
create policy "Admins can view all reviews"
  on reviews for select
  using (
    (auth.jwt() ->> 'role' = 'admin') or 
    is_admin(auth.uid())
  );

drop policy if exists "Admins can view all analytics" on analytics_events;
create policy "Admins can view all analytics"
  on analytics_events for select
  using (
    (auth.jwt() ->> 'role' = 'admin') or 
    is_admin(auth.uid())
  );
