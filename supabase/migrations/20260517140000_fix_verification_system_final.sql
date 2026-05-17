-- 1. Ensure verification_requests table exists
create table if not exists public.verification_requests (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  message text,
  admin_response text,
  created_at timestamp with time zone default now() not null,
  reviewed_at timestamp with time zone,
  reviewed_by uuid references public.profiles(id) on delete set null
);

-- 2. Ensure notifications table exists
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  message text not null,
  type text not null default 'info',
  is_read boolean default false not null,
  action_url text,
  created_at timestamp with time zone default now() not null
);

-- 3. Fix verification_status constraint and data
-- First, temporarily disable the constraint if it exists
DO $$ 
BEGIN
    ALTER TABLE public.businesses DROP CONSTRAINT IF EXISTS businesses_verification_status_check;
END $$;

-- Update any 'verified' to 'approved'
UPDATE public.businesses SET verification_status = 'approved' WHERE verification_status = 'verified';

-- Re-add the correct constraint
ALTER TABLE public.businesses ADD CONSTRAINT businesses_verification_status_check 
CHECK (verification_status IN ('pending', 'approved', 'rejected'));

-- 4. Robust auto-verification trigger for admins
create or replace function public.handle_admin_business_verification()
returns trigger as $$
declare
  creator_role text;
begin
  -- Get the role of the creator from profiles
  -- We use the owner_id instead of auth.uid() to be more robust for admin panel creations
  select role into creator_role 
  from public.profiles 
  where id = new.owner_id;

  -- If admin, auto-verify
  if creator_role = 'admin' then
    new.is_verified := true;
    new.verification_status := 'approved';
    new.verified_at := now();
    -- We can't easily know which admin created it if it's not the owner, 
    -- but usually admins create businesses for themselves or as a platform admin.
    -- If owner is admin, they are verifying themselves.
    if new.verified_by is null then
        new.verified_by := new.owner_id;
    end if;
  end if;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_business_created_verification on public.businesses;
create trigger on_business_created_verification
  before insert on public.businesses
  for each row execute procedure public.handle_admin_business_verification();

-- 5. Auto-verify existing admin-owned businesses
UPDATE public.businesses b
SET 
  is_verified = true,
  verification_status = 'approved',
  verified_at = COALESCE(b.verified_at, now()),
  verified_by = COALESCE(b.verified_by, b.owner_id)
FROM public.profiles p
WHERE b.owner_id = p.id AND p.role = 'admin' AND b.is_verified = false;

-- 6. Enable RLS and Policies (Ensure they exist)
alter table public.verification_requests enable row level security;
alter table public.notifications enable row level security;

-- Drop existing to avoid conflicts
drop policy if exists "Users can view their own verification requests" on public.verification_requests;
drop policy if exists "Users can insert their own verification requests" on public.verification_requests;
drop policy if exists "Admins can manage all verification requests" on public.verification_requests;

create policy "Users can view their own verification requests"
  on public.verification_requests for select
  using (auth.uid() = user_id);

create policy "Users can insert their own verification requests"
  on public.verification_requests for insert
  with check (auth.uid() = user_id);

create policy "Admins can manage all verification requests"
  on public.verification_requests for all
  using ((select role from public.profiles where id = auth.uid()) = 'admin');

-- Notifications policies
drop policy if exists "Users can manage their own notifications" on public.notifications;
drop policy if exists "Admins can create notifications for anyone" on public.notifications;

create policy "Users can manage their own notifications"
  on public.notifications for all
  using (auth.uid() = user_id);

create policy "Admins can create notifications for anyone"
  on public.notifications for insert
  with check ((select role from public.profiles where id = auth.uid()) = 'admin');

