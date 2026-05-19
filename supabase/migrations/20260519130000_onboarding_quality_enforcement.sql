-- Update the business creation trigger to start with is_published = false
-- This enforces the new onboarding rules where a business must configure 
-- its Google Review link before becoming fully public.

create or replace function public.handle_new_business()
returns trigger as $$
begin
  insert into public.business_pages (business_id, description, theme_config, is_published)
  values (
    new.id, 
    'Bem-vindo à nossa página! Em breve, você encontrará aqui todos os nossos links e avaliações.', 
    '{"primary_color": "#7c3aed", "layout": "standard"}'::jsonb, 
    false -- Start as unpublished (draft mode)
  )
  on conflict (business_id) do nothing;
  return new;
end;
$$ language plpgsql security definer;
