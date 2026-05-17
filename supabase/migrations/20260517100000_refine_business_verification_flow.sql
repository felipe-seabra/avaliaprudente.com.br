-- Refine business verification logic

-- Update the sync_business_verification trigger function to handle initial state based on creator role
create or replace function public.handle_business_verification_initial_state()
returns trigger as 20622
declare
  is_admin boolean;
begin
  -- Check if the user creating/updating is an admin
  -- We check both JWT role and the profiles table role for extra security
  select (role = 'admin') into is_admin 
  from public.profiles 
  where id = auth.uid();

  -- If it's a new business
  if (TG_OP = 'INSERT') then
    if (is_admin is true) then
      new.verification_status := 'verified';
      new.is_verified := true;
      new.verified_at := now();
      new.verified_by := auth.uid();
    else
      new.verification_status := 'pending';
      new.is_verified := false;
      new.verified_at := null;
      new.verified_by := null;
    end if;
  end if;

  return new;
end;
20622 language plpgsql security definer;

-- Create the trigger for INSERT only to handle initial state
drop trigger if exists handle_verification_initial_state on public.businesses;
create trigger handle_verification_initial_state
  before insert on public.businesses
  for each row execute procedure public.handle_business_verification_initial_state();

-- Update sync_business_verification to be more robust
create or replace function public.sync_business_verification()
returns trigger as 20622
begin
  -- If status changed to verified
  if new.verification_status = 'verified' and (old.verification_status is null or old.verification_status != 'verified') then
    new.is_verified := true;
    if new.verified_at is null then
      new.verified_at := now();
    end if;
    -- verified_by should be set by the application/repository but we can fallback to auth.uid()
    if new.verified_by is null then
      new.verified_by := auth.uid();
    end if;
  
  -- If status changed from verified to something else
  elsif new.verification_status != 'verified' and (old.verification_status = 'verified') then
    new.is_verified := false;
    new.verified_at := null;
    new.verified_by := null;
  end if;

  return new;
end;
20622 language plpgsql security definer;
