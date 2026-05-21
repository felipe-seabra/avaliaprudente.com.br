# System Map: Avalia Prudente

## Routes
- `/(auth)`: Auth flows (Supabase).
- `/admin`: Moderation (Verifications, Users, Stats).
- `/dashboard`: Tenant panel (Analytics, Page Editor, QR).
- `/[slug]`: Public business page (NFC Target).
- `/r/[slug]`: Review acquisition flow.

## Directories
- `src/core/domain`: Entity definitions.
- `src/core/infrastructure/repositories`: Supabase logic.
- `src/components/shared/review-flow.tsx`: Core logic for ratings.
- `src/app/auth/callback/route.ts`: Supabase session exchange and validated internal redirect handling for auth flows.
- `src/lib/auth-redirect.ts`: Internal-only redirect validation helper used by auth callbacks.
- `src/app/api/reviews/route.ts`: Authenticated review submission, LGPD-safe identity attribution, and trusted anti-abuse fingerprints.
- `src/hooks/use-business.ts`: Tenant state manager.
- `supabase/migrations`: DB Schema & RLS history.

## State Management
- **Auth:** Supabase SSR (Cookies).
- **Business:** `BusinessContext` (Current active tenant).
- **Forms:** React Hook Form + Zod.
