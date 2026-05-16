-- Ensure public insert access for reviews (needed for anonymous customers)
drop policy if exists "Anyone can insert a review" on reviews;
create policy "Anyone can insert a review"
  on reviews for insert
  with check (true);

-- Ensure public select access for reviews (needed for social proof)
drop policy if exists "Public can view reviews" on reviews;
create policy "Public can view reviews"
  on reviews for select
  using (true);
