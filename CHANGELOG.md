# Changelog

All notable changes to this project will be documented in this file.

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
