-- Normalize existing slugs to lowercase
update businesses set slug = lower(slug);
update review_links set slug = lower(slug);

-- Add check constraints to enforce slug format at DB level
-- businesses table
alter table businesses add constraint businesses_slug_lowercase_check check (slug = lower(slug));
alter table businesses add constraint businesses_slug_format_check check (slug ~ '^[a-z0-9-]+$');

-- review_links table
alter table review_links add constraint review_links_slug_lowercase_check check (slug = lower(slug));
alter table review_links add constraint review_links_slug_format_check check (slug ~ '^[a-z0-9-]+$');

-- Create a function to check if a slug is available across both businesses and review_links
create or replace function is_slug_available(slug_to_check text, exclude_business_id uuid default null)
returns boolean as $$
declare
  is_reserved boolean;
  business_exists boolean;
  link_exists boolean;
begin
  -- 1. Check reserved slugs
  is_reserved := slug_to_check = any(array[
    'admin', 'dashboard', 'login', 'register', 'api', 'blocked', 
    'terms-reaccept', 'privacy', 'terms', 'auth', 'reset-password', 
    'forgot-password', 'favicon.ico', 'sitemap.xml', 'robots.txt', 
    'demo', 'demonstracao', 'new', 'edit', 'delete', 'settings',
    'support', 'help', 'pricing', 'about', 'contact'
  ]);
  
  if is_reserved then
    return false;
  end if;

  -- 2. Check businesses
  if exclude_business_id is not null then
    select exists(select 1 from businesses where slug = slug_to_check and id != exclude_business_id) into business_exists;
  else
    select exists(select 1 from businesses where slug = slug_to_check) into business_exists;
  end if;
  
  if business_exists then
    return false;
  end if;

  -- 3. Check review_links
  select exists(select 1 from review_links where slug = slug_to_check) into link_exists;
  if link_exists then
    return false;
  end if;

  return true;
end;
$$ language plpgsql security definer;
