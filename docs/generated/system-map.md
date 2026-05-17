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
- `src/hooks/use-business.ts`: Tenant state manager.
- `supabase/migrations`: DB Schema & RLS history.

## State Management
- **Auth:** Supabase SSR (Cookies).
- **Business:** `BusinessContext` (Current active tenant).
- **Forms:** React Hook Form + Zod.
