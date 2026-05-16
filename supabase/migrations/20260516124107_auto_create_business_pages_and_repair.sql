-- 1. Create a function to handle automatic business page creation
create or replace function public.handle_new_business()
returns trigger as $$
begin
  insert into public.business_pages (business_id, description, theme_config, is_published)
  values (new.id, 'Bem-vindo à nossa página!', '{"primary_color": "#7c3aed", "layout": "standard"}'::jsonb, true)
  on conflict (business_id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- 2. Create the trigger
drop trigger if exists on_business_created on public.businesses;
create trigger on_business_created
  after insert on public.businesses
  for each row execute procedure public.handle_new_business();

-- 3. Repair existing data: Create missing business_pages for any business that doesn't have one
insert into public.business_pages (business_id, description, theme_config, is_published)
select 
  id, 
  'Bem-vindo à nossa página!', 
  '{"primary_color": "#7c3aed", "layout": "standard"}'::jsonb, 
  true
from public.businesses
where id not in (select business_id from public.business_pages)
on conflict (business_id) do nothing;

-- 4. Ensure RLS allows the trigger (security definer handles this, but let's be sure)
-- The function is security definer, so it runs as the owner (admin).
