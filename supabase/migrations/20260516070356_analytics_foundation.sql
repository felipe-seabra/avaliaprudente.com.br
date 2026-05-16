-- Create analytics_events table
create table analytics_events (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses on delete cascade,
  page_id uuid references business_pages on delete cascade,
  link_id uuid references page_links on delete cascade,
  event_type text not null, -- 'page_visit', 'cta_click', 'qr_scan'
  source text, -- 'nfc', 'qr', 'direct', 'social'
  user_agent text,
  metadata jsonb default '{}'::jsonb not null,
  created_at timestamp with time zone default now() not null
);

-- Enable RLS
alter table analytics_events enable row level security;

-- Policies for analytics_events
create policy "Owners can view their business analytics"
  on analytics_events for select
  using (exists (
    select 1 from businesses
    where businesses.id = analytics_events.business_id
    and businesses.owner_id = auth.uid()
  ));

create policy "Anyone can insert an analytics event"
  on analytics_events for insert
  with check (true);

-- Indexes for performance
create index idx_analytics_business on analytics_events(business_id);
create index idx_analytics_page on analytics_events(page_id);
create index idx_analytics_event_type on analytics_events(event_type);
create index idx_analytics_created_at on analytics_events(created_at);
