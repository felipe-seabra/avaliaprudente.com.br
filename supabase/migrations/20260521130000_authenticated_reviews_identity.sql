-- Authenticated Reviews Identity
-- Adds minimal attribution fields for LGPD-safe authenticated review submissions.
-- Existing anonymous reviews remain intact with null attribution fields.

alter table public.reviews
  add column if not exists user_id uuid references public.profiles(id) on delete set null,
  add column if not exists display_name text,
  add column if not exists auth_provider text;

alter table public.reviews
  drop constraint if exists reviews_display_name_required_for_authenticated,
  add constraint reviews_display_name_required_for_authenticated
    check (user_id is null or nullif(btrim(display_name), '') is not null);

alter table public.reviews
  drop constraint if exists reviews_auth_provider_allowed,
  add constraint reviews_auth_provider_allowed
    check (auth_provider is null or auth_provider in ('google', 'email', 'unknown'));

create index if not exists idx_reviews_user_id on public.reviews(user_id);
create index if not exists idx_reviews_business_user on public.reviews(business_id, user_id);

comment on column public.reviews.user_id is
  'Authenticated reviewer profile id. Nullable for reviews created before authenticated reviews were required.';
comment on column public.reviews.display_name is
  'Public reviewer display name. Never expose raw email or auth metadata as public identity.';
comment on column public.reviews.auth_provider is
  'Minimal provider attribution for moderation/audit purposes: google, email, or unknown.';
