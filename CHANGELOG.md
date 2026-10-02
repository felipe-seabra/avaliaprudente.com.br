# Changelog

## [Unreleased]

### SEO
- **Technical Indexability Hardening:** Excluded authenticated account and onboarding routes from crawler access, prevented frozen public business pages from being indexed, and standardized root metadata URLs through `APP_CONFIG.url`.

### Performance
- **Public Route Client Work Reduction:** Limited the subscription provider to authenticated application route families, removed the production-inert React Query Devtools mount, removed a no-op pathname effect, and reduced unnecessary above-the-fold/non-critical image preloads.

### Security
- **Dependency Security Remediation:** Updated vulnerable transitive dependencies identified by CI security audit, including brace-expansion, fast-uri, hono, ip-address, undici, and Vitest packages.

All notable changes to this project will be documented in this file.

## [0.24.0] - 2026-09-06

### Security
- **SEC-08 Remediation (Sudo Secret Hardening):** Removed hardcoded deterministic secret fallback (`'fallback-secret-for-dev'`) and severed coupling to database credentials in Sudo token HMAC signing (`src/lib/sudo.ts`). Production exclusively requires dedicated `SUDO_SECRET` (minimum 32 characters) for HMAC signing and verification, and does not use `SUPABASE_SERVICE_ROLE_KEY` as a secondary or legacy signing secret. Enforced strict fail-closed behavior in production where missing `SUDO_SECRET` raises a fatal exception and rejects forged tokens, and ephemeral non-deterministic cryptographic key generation (`crypto.getRandomValues`) in non-production environments.
- **SEC-09 Remediation (Privacy Pepper Hardening & Enforced Schema):** Removed hardcoded deterministic pepper fallback (`'fallback-secure-pepper-for-dev-only'`) in privacy fingerprinting (`src/lib/privacy.ts`). Enforced strict production environment validation requiring `FINGERPRINT_PEPPER` with minimum 32 characters in `src/lib/env.ts`, preventing unconfigured production deployments. In non-production environments, replaced static fallback with ephemeral per-process cryptographic random pepper generation (`crypto.getRandomValues`).
- **Secret Fallback Regression Test Suite:** Added comprehensive automated regression tests (`src/lib/sudo.test.ts`, `src/lib/env.test.ts`, `src/lib/privacy.test.ts`) validating token forgery rejection, fail-closed production semantics, and secret entropy requirements.

## [0.23.0] - 2026-09-03

### Security
- **SEC-04 Remediation (Protected Business Fields):** Enforced PostgreSQL database-level protection via BEFORE UPDATE trigger (`enforce_business_protected_fields_trigger`) and trigger function (`public.enforce_business_protected_fields()`) on `public.businesses` (`20260903100000_protect_business_privileged_fields.sql`). Prevents unauthorized non-admin users and business owners from directly manipulating privileged fields (`is_verified`, `verification_status`, `verified_at`, `verified_by`, `is_frozen`, `plan_type`) via client-side PostgREST APIs, while preserving administrative operations and legitimate business owner updates to non-protected fields.
- **Dependencies Security Remediation:** Resolved high-severity audit vulnerabilities in transitive dependencies (GHSA-c83g-rgw3-j3cx, GHSA-73wf-gq98-2v4g in `browserslist`; GHSA-5jgf-p345-68v8 in `fast-uri`) to satisfy CI security thresholds.


## [0.22.0] - 2026-07-20

### Fixed
- **Database Security:** Applied critical RLS (Row Level Security) policy fixes (`20260720184110_fix_business_rls_policies.sql`) to production database, restoring platform stability and securing public and administrative business assets.

## [0.21.1] - 2026-07-20

### Fixed
- **Public Business Page Data Fetching:** Switched the data-fetching client in `fetchPublicBusinessData` to use `createAdminClient` to query the database using the service role key. This bypasses select privilege restrictions on the `profiles` table for anonymous public users, resolving the 404 / "Página Indisponível" rendering errors while preserving public/frozen/unpublished page constraints in the application layer.
- **Public Business Page Lookup:** Normalized business slug lookup to prevent case-sensitivity and URL-encoding mismatches, and removed temporary debug instrumentation.

## [0.21.0] - 2026-05-28

### Added
- **Subscription Foundation:** Implemented a provider-agnostic entitlement architecture decoupled from billing event sources.
- **Internal Authorization Authority:** Established the internal database as the primary source of truth for platform permissions.
- **Entitlement Governance:** Hardened the entitlement resolver with explicit `super_admin` bypass for unlimited operational access.
- **Centralized Subscription Config:** Established `src/lib/subscription-config.ts` as the Single Source of Truth (SSOT) for all plans, features, and quotas.
- **Feature Gating System:** Implemented unified SSR and client-side feature enforcement with graceful upgrade prompts.
- **Admin Subscription Management:** Added administrative tools to assign, update, and suspend user subscriptions directly from the admin panel with full audit logging.
- **Quota Enforcement Model:** Real-time enforcement of business limits and monthly review volumes.

### Fixed
- **Build Integrity:** Resolved architectural violation where Client Components were importing server-only dependencies from `subscriptions.ts`.
- **Commercial Inconsistency:** Resolved mismatches between landing page promises and technical plan definitions.
- **Plan Type Safety:** Standardized subscription and plan types across the entire application by centralizing them in `subscription-config.ts`.
- **Admin UX:** Enhanced the billing page with super_admin badges and clear plan status indicators.

## [0.20.0] - 2026-05-27

### Added
- **Subscription & Entitlement Foundation:** Implemented a production-grade, billing-agnostic foundation for plans and feature gating.
- **Normalized Schema:** Created `subscription_plans`, `user_subscriptions`, and `subscription_audit_logs` tables with strict RLS policies.
- **Entitlement Layer:** Centralized logic for feature and quota resolution (`canUseFeature`, `getQuota`).
- **Subscription Context:** Added `SubscriptionProvider` to manage and react to entitlement state globally on the frontend.
- **Feature Gating Components:** Created `FeatureGate` component for easy UI-level access control with upgrade prompts.
- **Admin Management:** Implemented `SubscriptionManager` component and Server Actions for manual plan assignments by super_admins.
- **Dashboard Integration:** Added `PlanBadge` to the TopNav and a dedicated `Billing & Plans` page for users.
- **Seed Data:** Initial plans (Free, Starter, Pro, Enterprise) with defined features and quotas.
- **Automated Provisioning:** Database trigger to automatically assign the "Free" plan to new users upon profile creation.

### Fixed
- **UI Composition:** Resolved `asChild` vs `render` property conflicts in Base UI components (Tooltip, Button).
- **Type Safety:** Manually synchronized Supabase types to support the new subscription schema without compromising strict typing.
