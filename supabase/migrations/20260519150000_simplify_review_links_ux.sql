-- Drop constraints that enforce strict slug format on review_links
alter table review_links drop constraint if exists review_links_slug_lowercase_check;
alter table review_links drop constraint if exists review_links_slug_format_check;

-- Update is_slug_available to be more permissive with review_links but still enforce uniqueness
-- We keep businesses strict because they are main page URLs, but review_links can be more flexible
create or replace function is_slug_available(slug_to_check text, exclude_business_id uuid default null)
returns boolean as $$
declare
  is_reserved boolean;
  business_exists boolean;
  link_exists boolean;
begin
  -- 1. Check reserved slugs (case-insensitive for safety)
  is_reserved := lower(slug_to_check) = any(array[
    'admin', 'dashboard', 'login', 'register', 'api', 'blocked', 
    'terms-reaccept', 'privacy', 'terms', 'auth', 'reset-password', 
    'forgot-password', 'favicon.ico', 'sitemap.xml', 'robots.txt', 
    'demo', 'demonstracao', 'new', 'edit', 'delete', 'settings',
    'support', 'help', 'pricing', 'about', 'contact'
  ]);
  
  if is_reserved then
    return false;
  end if;

  -- 2. Check businesses (businesses still use strict lowercase slugs)
  if exclude_business_id is not null then
    select exists(select 1 from businesses where lower(slug) = lower(slug_to_check) and id != exclude_business_id) into business_exists;
  else
    select exists(select 1 from businesses where lower(slug) = lower(slug_to_check)) into business_exists;
  end if;
  
  if business_exists then
    return false;
  end if;

  -- 3. Check review_links (now supporting case-sensitive storage but case-insensitive uniqueness)
  select exists(select 1 from review_links where lower(slug) = lower(slug_to_check)) into link_exists;
  if link_exists then
    return false;
  end if;

  return true;
end;
$$ language plpgsql security definer;
