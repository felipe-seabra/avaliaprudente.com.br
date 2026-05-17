-- 1. Add verification columns to businesses table
alter table public.businesses 
  add column if not exists is_verified boolean not null default false,
  add column if not exists verification_status text default 'pending' check (verification_status in ('pending', 'approved', 'rejected')),
  add column if not exists verified_at timestamp with time zone,
  add column if not exists verified_by uuid references public.profiles(id) on delete set null,
  add column if not exists verification_requested_at timestamp with time zone;

-- 2. Trigger for auto-verification of admin-created businesses
create or replace function public.handle_admin_business_verification()
returns trigger as $$
declare
  creator_role text;
begin
  -- Get the role of the creator
  select role into creator_role 
  from public.profiles 
  where id = auth.uid();

  -- If admin, auto-verify
  if creator_role = 'admin' then
    new.is_verified := true;
    new.verification_status := 'approved';
    new.verified_at := now();
    new.verified_by := auth.uid();
  else
    -- Standard initialization for non-admins
    new.is_verified := false;
    new.verification_status := 'pending';
    new.verified_at := null;
    new.verified_by := null;
  end if;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_business_created_verification on public.businesses;
create trigger on_business_created_verification
  before insert on public.businesses
  for each row execute procedure public.handle_admin_business_verification();

-- 3. Ensure we don't break existing RLS
-- (Assuming stabilization migration already handled general select access)

-- 4. Audit Log / Verification History (Optional but good practice)
-- For now, the requested fields on the businesses table are sufficient.

-- 5. Fix Admin Middleware role check (ensure role is available in profiles)
-- This was likely failing because profiles RLS didn't allow the middleware to see the role correctly
-- Middleware uses the authenticated user's session.
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Ensure admins can see all profiles (needed for the admin panel and verified_by join)
drop policy if exists "Admins can view all profiles" on public.profiles;
create policy "Admins can view all profiles"
  on public.profiles for select
  using (
    (select role from public.profiles where id = auth.uid()) = 'admin'
  );
