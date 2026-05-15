-- Create businesses table
create table businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users on delete cascade not null,
  name text not null,
  slug text unique not null,
  google_place_id text,
  logo_url text,
  address text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Create review_links table
create table review_links (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses on delete cascade not null,
  slug text unique not null,
  redirect_url text not null,
  is_active boolean default true not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Create qr_codes table
create table qr_codes (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses on delete cascade not null,
  review_link_id uuid references review_links on delete cascade not null,
  style_config jsonb default '{}'::jsonb not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Create reviews table
create table reviews (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses on delete cascade not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  feedback text,
  customer_name text,
  customer_email text,
  source text default 'direct' not null,
  is_internal boolean default false not null,
  created_at timestamp with time zone default now() not null
);

-- Enable RLS
alter table businesses enable row level security;
alter table review_links enable row level security;
alter table qr_codes enable row level security;
alter table reviews enable row level security;

-- Policies for businesses
create policy "Owners can view their own businesses"
  on businesses for select
  using (auth.uid() = owner_id);

create policy "Owners can insert their own businesses"
  on businesses for insert
  with check (auth.uid() = owner_id);

create policy "Owners can update their own businesses"
  on businesses for update
  using (auth.uid() = owner_id);

create policy "Owners can delete their own businesses"
  on businesses for delete
  using (auth.uid() = owner_id);

-- Policies for review_links
create policy "Owners can view their review links"
  on review_links for select
  using (exists (
    select 1 from businesses
    where businesses.id = review_links.business_id
    and businesses.owner_id = auth.uid()
  ));

create policy "Public can view active review links"
  on review_links for select
  using (is_active = true);

create policy "Owners can manage their review links"
  on review_links for all
  using (exists (
    select 1 from businesses
    where businesses.id = review_links.business_id
    and businesses.owner_id = auth.uid()
  ));

-- Policies for qr_codes
create policy "Owners can manage their qr codes"
  on qr_codes for all
  using (exists (
    select 1 from businesses
    where businesses.id = qr_codes.business_id
    and businesses.owner_id = auth.uid()
  ));

-- Policies for reviews
create policy "Owners can view their business reviews"
  on reviews for select
  using (exists (
    select 1 from businesses
    where businesses.id = reviews.business_id
    and businesses.owner_id = auth.uid()
  ));

create policy "Anyone can insert a review"
  on reviews for insert
  with check (true);

-- Indexes
create index idx_businesses_owner on businesses(owner_id);
create index idx_businesses_slug on businesses(slug);
create index idx_review_links_business on review_links(business_id);
create index idx_review_links_slug on review_links(slug);
create index idx_qr_codes_business on qr_codes(business_id);
create index idx_reviews_business on reviews(business_id);
create index idx_reviews_rating on reviews(rating);
create index idx_reviews_created_at on reviews(created_at);
