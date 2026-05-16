-- Update profiles table with roles
alter table profiles 
  add column if not exists role text not null default 'customer' 
  check (role in ('admin', 'customer'));

-- Create business_pages table
create table business_pages (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses on delete cascade not null unique,
  description text,
  theme_config jsonb default '{"primary_color": "#7c3aed", "layout": "standard"}'::jsonb not null,
  is_published boolean default true not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Create page_links table (Modular CTAs)
create table page_links (
  id uuid primary key default gen_random_uuid(),
  page_id uuid references business_pages on delete cascade not null,
  type text not null, -- 'google_review', 'whatsapp', 'instagram', 'facebook', 'website', 'portfolio', 'custom'
  title text not null,
  url text not null,
  icon_name text,
  sort_order integer default 0 not null,
  is_active boolean default true not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Enable RLS
alter table business_pages enable row level security;
alter table page_links enable row level security;

-- Policies for business_pages
create policy "Owners can manage their business pages"
  on business_pages for all
  using (exists (
    select 1 from businesses
    where businesses.id = business_pages.business_id
    and businesses.owner_id = auth.uid()
  ));

create policy "Public can view published business pages"
  on business_pages for select
  using (is_published = true);

-- Policies for page_links
create policy "Owners can manage their page links"
  on page_links for all
  using (exists (
    select 1 from business_pages bp
    join businesses b on b.id = bp.business_id
    where bp.id = page_links.page_id
    and b.owner_id = auth.uid()
  ));

create policy "Public can view active page links"
  on page_links for select
  using (exists (
    select 1 from business_pages
    where business_pages.id = page_links.page_id
    and business_pages.is_published = true
  ) and is_active = true);

-- Indexes
create index idx_business_pages_business on business_pages(business_id);
create index idx_page_links_page on page_links(page_id);
create index idx_page_links_order on page_links(sort_order);

-- Admin Policy (for profiles)
create policy "Admins can view all profiles"
  on profiles for select
  using (auth.jwt() ->> 'role' = 'admin' or (select role from profiles where id = auth.uid()) = 'admin');

-- Admin bypass policies for businesses (example)
create policy "Admins can manage all businesses"
  on businesses for all
  using ((select role from profiles where id = auth.uid()) = 'admin');
