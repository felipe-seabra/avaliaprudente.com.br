-- 1. Create a function to migrate existing review_links to page_links
do $$
declare
    link_record record;
    page_id_var uuid;
begin
    for link_record in select * from review_links loop
        -- Find the business page for this link
        select id into page_id_var from business_pages where business_id = link_record.business_id limit 1;
        
        if page_id_var is not null then
            -- Check if a google_review link already exists for this page to avoid duplicates
            if not exists (select 1 from page_links where page_id = page_id_var and type = 'google_review') then
                insert into page_links (page_id, type, title, url, sort_order, is_active)
                values (page_id_var, 'google_review', link_record.slug, link_record.redirect_url, -1, link_record.is_active);
            end if;
        end if;
    end loop;
end $$;

-- 2. Update existing google_review links to have a higher priority (sort_order = -1)
update page_links set sort_order = -1 where type = 'google_review';

-- 3. We keep the review_links table for now to avoid breaking existing QR codes that might point to /r/[slug]
-- but we will update the application to prefer the unified architecture for new links and management.
-- We can also update the is_slug_available function to be more focused on business slugs.

create or replace function is_slug_available(slug_to_check text, exclude_business_id uuid default null)
returns boolean as $$
declare
  is_reserved boolean;
  business_exists boolean;
begin
  -- 1. Check reserved slugs
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

  -- 2. Check businesses (main page URLs)
  if exclude_business_id is not null then
    select exists(select 1 from businesses where lower(slug) = lower(slug_to_check) and id != exclude_business_id) into business_exists;
  else
    select exists(select 1 from businesses where lower(slug) = lower(slug_to_check)) into business_exists;
  end if;
  
  if business_exists then
    return false;
  end if;

  return true;
end;
$$ language plpgsql security definer;
