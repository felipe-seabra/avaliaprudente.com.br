# 🛡️ Full Platform Security & Architecture Audit

## 📋 Executive Summary
This audit evaluated the Next.js 15 App Router and Supabase architecture for security vulnerabilities, architectural risks, and payment readiness. The most critical findings revolve around **Row Level Security (RLS) bypasses** that allow unauthenticated API abuse, and **distributed architectural flaws** in rate limiting. If left unpatched, these vulnerabilities could lead to severe data poisoning (review spam) and DDoS attacks. 

## 🕸️ Threat Model & Attack Surface Map

**Trust Boundaries:**
- **Client (Untrusted):** Web browser, unauthenticated visitors, public API consumers.
- **Next.js Edge/Serverless (Semi-Trusted):** Middleware, API Routes, Server Actions. Acts as a gatekeeper but shares some untrusted state.
- **Supabase Database (Trusted Core):** Holds sensitive user profiles, businesses, and platform analytics.

**Attack Surface:**
1. Next.js Middleware (Auth bypassing, Rate limit abuse).
2. Supabase REST API (Direct database access via `anon` key).
3. Next.js API Routes (`/api/reviews`, `/api/analytics`).

---

## 🚨 Confirmed Vulnerabilities

### 1. [FIXED] Unauthenticated RLS Bypass for Reviews and Analytics (Data Poisoning)
- **Status:** **REMEDIATED** (2026-05-24)
- **Affected Files:** `supabase/migrations/20260524000000_harden_rls_anonymous_inserts.sql`
- **Description:** Direct `INSERT` grants were revoked from `anon` and `authenticated` roles. Permissive RLS policies were dropped.
- **Remediation:** All inserts now strictly go through Next.js API Routes using the `service_role` key. Direct PostgREST inserts are blocked at the database level.

### 2. [HIGH] Distributed Rate Limiting Failure (DDoS / Brute Force)
- **Affected Files:** `src/middleware.ts`
- **Description:** The application implements rate limiting using an in-memory `Map` (`ipCache`). Next.js Middleware runs in edge/serverless environments (like Vercel), where memory state is isolated per invocation/instance. 
- **Exploitation Scenario:** An attacker launches a brute-force or spam attack. Because each request hits a different edge node, the `ipCache` is constantly reset or split, effectively bypassing the limit.
- **Business Impact:** High risk of API abuse, excessive billing from Supabase/Vercel, and potential denial of service.
- **Remediation:** Replace in-memory rate limiting with a distributed store (e.g., Upstash Redis or Supabase RPC rate-limiting tables).

### 3. [MEDIUM] Fallback Role Evaluation Risk
- **Affected Files:** `src/lib/supabase/middleware.ts`
- **Description:** The `updateSession` function reads `user.app_metadata?.role` as a fast path before checking the database. While `app_metadata` is theoretically secure, if any backend flaw accidentally updates it, it grants immediate `admin` access across the platform.
- **Remediation:** Enforce the DB as the single source of truth for critical roles like `super_admin` and `admin`, or ensure strict synchronization triggers between `profiles.role` and `app_metadata`.

---

## 🏗️ Architectural Risks

### 1. SSR / Cache / ISR Security Boundaries
- **Status:** **Secure**. The implementation in `src/app/r/[slug]/page.tsx` correctly segregates cached public data (`unstable_cache` via `getBusinessData`) from dynamic authentication states (`getAuthStatus` via `cookies()`).
- **Risk:** Developers might accidentally move `cookies()` checks inside the `unstable_cache` block in the future, poisoning the global cache with an admin's view. Strict linting rules must be applied to prevent this.

---

## 💳 Phase 10: Payment Readiness Blockers

Before integrating Stripe or any payment gateway, the following blockers must be resolved:
1. **Webhook Integrity:** Ensure you have a robust infrastructure for Stripe webhooks that does NOT rely on the current in-memory rate limiter.
2. **Database Isolation:** Billing data must not be exposed to the `anon` key. A new schema or highly restricted table is required.
3. **Session Replay:** Payment flows must require fresh authentication (re-auth) before sensitive billing modifications.