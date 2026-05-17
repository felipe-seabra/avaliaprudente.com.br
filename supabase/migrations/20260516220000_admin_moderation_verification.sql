-- Migration for Admin Moderation and Verification System

-- 1. Update Profiles with Moderation Fields
alter table public.profiles 
  add column if not exists is_blocked boolean default false not null,
  add column if not exists blocked_at timestamp with time zone,
  add column if not exists blocked_reason text,
  add column if not exists last_login_at timestamp with time zone;

-- 2. Update Businesses with Verification Fields
alter table public.businesses 
  add column if not exists verified_at timestamp with time zone,
  add column if not exists verified_by uuid references public.profiles(id) on delete set null,
  add column if not exists verification_status text default 'pending' not null check (verification_status in ('pending', 'verified', 'rejected'));

-- Update existing businesses to ensure they are pending (except if already explicitly marked as verified)
update public.businesses set verification_status = 'pending' where is_verified = false;
update public.businesses set verification_status = 'verified' where is_verified = true;

-- 3. Sync trigger for verification status
create or replace function public.sync_business_verification()
returns trigger as $$
begin
  if new.verification_status = 'verified' then
    new.is_verified := true;
    if new.verified_at is null then
      new.verified_at := now();
    end if;
  else
    new.is_verified := false;
    new.verified_at := null;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists sync_verification_status on public.businesses;
create trigger sync_verification_status
  before insert or update on public.businesses
  for each row execute procedure public.sync_business_verification();
