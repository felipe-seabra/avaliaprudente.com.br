-- 1. Add abuse protection columns to reviews table
alter table public.reviews add column if not exists submission_fingerprint text;
alter table public.reviews add column if not exists browser_fingerprint text;

-- Create index for faster lookups during validation
create index if not exists idx_reviews_fingerprint on public.reviews(submission_fingerprint, created_at);
create index if not exists idx_reviews_business_fingerprint on public.reviews(business_id, submission_fingerprint);

-- 2. Function to check if a review is considered spam/throttled
-- This is a hybrid approach: per-business cooldown + identical content check
create or replace function public.check_review_abuse(
    target_business_id uuid,
    target_fingerprint text,
    target_feedback text default null
)
returns boolean as $$
declare
    recent_count integer;
    duplicate_content boolean;
begin
    -- A. Check for any review from same fingerprint for this business in the last 60 minutes
    select count(*) into recent_count
    from public.reviews
    where business_id = target_business_id
      and submission_fingerprint = target_fingerprint
      and created_at > now() - interval '60 minutes';

    if recent_count > 0 then
        return false; -- Throttled
    end if;

    -- B. Check for identical content from same fingerprint across any business (cooldown 10 mins)
    if target_feedback is not null and length(trim(target_feedback)) > 0 then
        select exists (
            select 1 from public.reviews
            where submission_fingerprint = target_fingerprint
              and feedback = target_feedback
              and created_at > now() - interval '10 minutes'
        ) into duplicate_content;

        if duplicate_content then
            return false; -- Duplicate spam
        end if;
    end if;

    return true;
end;
$$ language plpgsql security definer;

-- 3. Trigger function to enforce abuse protection
create or replace function public.enforce_review_abuse_protection()
returns trigger as $$
begin
    if not public.check_review_abuse(new.business_id, new.submission_fingerprint, new.feedback) then
        raise exception 'Você já enviou uma avaliação recentemente para esta empresa. Tente novamente em alguns minutos.';
    end if;
    return new;
end;
$$ language plpgsql security definer;

-- 4. Apply trigger to reviews table
drop trigger if exists tr_enforce_review_abuse_protection on public.reviews;
create trigger tr_enforce_review_abuse_protection
before insert on public.reviews
for each row
execute function public.enforce_review_abuse_protection();
