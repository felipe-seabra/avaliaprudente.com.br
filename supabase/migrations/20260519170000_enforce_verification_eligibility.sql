-- Function to check if a business is eligible for verification
create or replace function public.check_business_verification_eligibility()
returns trigger as $$
declare
    has_google_review boolean;
    has_social_links boolean;
    page_id_var uuid;
begin
    -- 1. Get the page_id for the business
    select id into page_id_var from public.business_pages where business_id = new.business_id limit 1;
    
    if page_id_var is null then
        raise exception 'Empresa não possui uma página configurada. Configure sua página antes de solicitar verificação.';
    end if;

    -- 2. Check for google_review link
    select exists (
        select 1 from public.page_links 
        where page_id = page_id_var and type = 'google_review' and is_active = true
    ) into has_google_review;

    if not has_google_review then
        raise exception 'Link do Google Review não configurado. Este item é obrigatório para verificação.';
    end if;

    -- 3. Check for at least one other social/business link
    select exists (
        select 1 from public.page_links 
        where page_id = page_id_var and type != 'google_review' and is_active = true
    ) into has_social_links;

    if not has_social_links then
        raise exception 'Você precisa configurar pelo menos um link social ou de contato (WhatsApp, Instagram, etc.) antes de solicitar verificação.';
    end if;

    return new;
end;
$$ language plpgsql security definer;

-- Trigger to enforce eligibility before insert
drop trigger if exists tr_enforce_verification_eligibility on public.verification_requests;
create trigger tr_enforce_verification_eligibility
before insert on public.verification_requests
for each row
execute function public.check_business_verification_eligibility();
