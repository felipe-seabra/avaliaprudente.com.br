-- 1. Add fingerprint column to analytics_events
alter table public.analytics_events add column if not exists fingerprint text;

-- Create index for faster deduplication lookups
create index if not exists idx_analytics_fingerprint_lookup 
on public.analytics_events(business_id, event_type, fingerprint, created_at);

-- 2. Function to deduplicate analytics events
-- Returns NULL to silently cancel insertion if a duplicate event exists within cooldown
create or replace function public.deduplicate_analytics_events()
returns trigger as $$
declare
    recent_exists boolean;
begin
    -- Only deduplicate if fingerprint is provided
    if new.fingerprint is not null then
        select exists (
            select 1 from public.analytics_events
            where business_id is not distinct from new.business_id
              and event_type = new.event_type
              and fingerprint = new.fingerprint
              and link_id is not distinct from new.link_id
              and created_at > now() - interval '15 minutes'
        ) into recent_exists;
          
        if recent_exists then
            return null; -- Silently drop the duplicate event
        end if;
    end if;
    
    return new;
end;
$$ language plpgsql security definer;

-- 3. Trigger to enforce deduplication
drop trigger if exists tr_enforce_analytics_deduplication on public.analytics_events;
create trigger tr_enforce_analytics_deduplication
before insert on public.analytics_events
for each row
execute function public.deduplicate_analytics_events();
