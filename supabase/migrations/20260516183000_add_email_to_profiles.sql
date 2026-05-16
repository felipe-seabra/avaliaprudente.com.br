-- 1. Add email column to profiles
alter table public.profiles add column if not exists email text;

-- 2. Update existing profiles with emails from auth.users (if possible)
update public.profiles
set email = auth.users.email
from auth.users
where public.profiles.id = auth.users.id;

-- 3. Update the handle_new_user function to include email
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', new.email);
  return new;
end;
$$ language plpgsql security definer;

-- 4. Fix Admin Repository query fields
-- The previous AdminRepository was using created_at on profiles which doesn't exist (it's updated_at or id-based)
-- We'll add created_at to profiles for better sorting if not exists
alter table public.profiles add column if not exists created_at timestamp with time zone default now();
