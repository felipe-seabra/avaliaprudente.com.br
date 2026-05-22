-- Authenticated Review Ownership

-- 1. Add updated_at if not exists
alter table public.reviews
  add column if not exists updated_at timestamp with time zone default now() not null;

-- 2. Enforce unique review per user per business for authenticated users
create unique index if not exists idx_reviews_unique_user_business
  on public.reviews (user_id, business_id)
  where user_id is not null;

-- 3. Add RLS for Update and Delete
drop policy if exists "Users can update their own reviews" on public.reviews;
create policy "Users can update their own reviews"
  on public.reviews for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own reviews" on public.reviews;
create policy "Users can delete their own reviews"
  on public.reviews for delete
  using (auth.uid() = user_id);

-- 4. Trigger to automatically update updated_at
create or replace function update_reviews_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trigger_update_reviews_updated_at on public.reviews;
create trigger trigger_update_reviews_updated_at
  before update on public.reviews
  for each row
  execute function update_reviews_updated_at();
