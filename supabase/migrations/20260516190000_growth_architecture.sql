-- 1. Add growth and product columns to businesses
alter table public.businesses add column if not exists has_nfc_tag boolean default false;
alter table public.businesses add column if not exists is_featured boolean default false;
alter table public.businesses add column if not exists plan_type text default 'free';

-- 2. Create a function to check business limits securely
-- This can be used in a trigger or from the application
create or replace function public.check_business_limit()
returns trigger as $$
declare
  business_count int;
  user_role text;
  max_allowed int := 1; -- Default for free plan
begin
  -- Get user role
  select role into user_role from public.profiles where id = auth.uid();
  
  -- Admins have no limits
  if user_role = 'admin' then
    return new;
  end if;

  -- Check current count
  select count(*) into business_count from public.businesses where owner_id = auth.uid();
  
  if business_count >= max_allowed then
    raise exception 'Limite de empresas atingido para o plano gratuito.';
  end if;
  
  return new;
end;
$$ language plpgsql security definer;

-- 3. Add trigger for limit enforcement
drop trigger if exists enforce_business_limit on public.businesses;
create trigger enforce_business_limit
  before insert on public.businesses
  for each row execute procedure public.check_business_limit();
