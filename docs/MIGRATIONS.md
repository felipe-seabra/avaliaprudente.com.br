# Database Migrations

This document tracks and explains all database schema changes.

## [20260517130000] Full Verification System

### Purpose
Implements the formal verification workflow for businesses, moving from a manual boolean flag to a request-based moderation system.

### Affected Tables
- `public.businesses`: Added `is_verified`, `verification_status`, `verified_at`, `verified_by`, and `verification_requested_at`.
- `public.verification_requests`: (Created in previous steps or stabilized here) Tracks the history of requests.
- `public.profiles`: Updated RLS policies to allow admins to view all profiles (necessary for showing who verified a business).

### Triggers
- `on_business_created_verification`: Automatically verifies businesses created by an administrator.

### Security Impact
- **RLS:** Hardened access to the `verification_status` field.
- **Integrity:** Uses foreign keys to link verifiers (`verified_by`) to the `profiles` table.

### Rollback Considerations
- Dropping the columns in `businesses` will lose all verification history.
- Ensure `is_verified` is not being used as a hard dependency for critical auth logic before rolling back.

---

## Earlier Migrations (Summary)

- **20260516193000 - 20260516194500:** Tenant Isolation & RBAC Hardening.
- **20260516092754:** Storage & Branding (Logo support).
- **20260515160302:** Initial Schema (Profiles & Base Auth).
