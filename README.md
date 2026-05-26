# Avalia Prudente

<div align="center">
  <img src="public/branding/logo-horizontal.webp" alt="Avalia Prudente Logo" width="400" />
  <p align="center">
    <strong>The next-generation reputation and review ecosystem for local businesses.</strong>
  </p>

  <p align="center">
    <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-15-black?logo=next.js" alt="Next.js" /></a>
    <a href="https://react.dev"><img src="https://img.shields.io/badge/React-19-blue?logo=react" alt="React" /></a>
    <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5-blue?logo=typescript" alt="TypeScript" /></a>
    <a href="https://supabase.com"><img src="https://img.shields.io/badge/Supabase-DB%20%2F%20Auth-green?logo=supabase" alt="Supabase" /></a>
    <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?logo=tailwind-css" alt="Tailwind CSS" /></a>
    <a href="https://vercel.com"><img src="https://img.shields.io/badge/Vercel-Deployment-black?logo=vercel" alt="Vercel" /></a>
    <a href="https://vitest.dev"><img src="https://img.shields.io/badge/Vitest-Testing-FCC72B?logo=vitest" alt="Vitest" /></a>
  </p>
</div>

---

## 🌟 Product Overview

**Avalia Prudente** is a premium Reputation-as-a-Service (RaaS) platform designed to bridge the gap between local businesses and their customers through **NFC-powered smart interactions**. It provides a sophisticated ecosystem for verified feedback, official business interactions, and a transparent reputation scoring system.

Built with a focus on **security**, **governance**, and **performance**, Avalia Prudente empowers business owners to manage their digital presence while offering reviewers a **cinematic, "tap-and-rate" magic moment** that transforms physical counters into digital growth engines.

### The Ecosystem
- **Reviewers:** Earn reputation, badges, and recognition for high-quality, authentic feedback.
- **Businesses:** Claim professional profiles, respond officially to customers, and boost visibility through verified performance.
- **Platform Governance:** Robust moderation, anti-abuse systems, and automated ranking algorithms ensure a fair and clean marketplace.

---

## 🚀 Core Features

### 🏢 For Businesses (SaaS)
- **NFC Magic Interaction:** Premium, cinematic landing experience demonstrating the "tap-to-rate" flow.
- **Dynamic Branding:** Personalized public pages with custom logos, colors, and social CTAs.
- **Official Responses:** Engage directly with customers through verified response threads.
- **Onboarding Excellence:** Google-aligned multi-step onboarding flow for friction-less setup.
- **Google Review Gate:** Smart filtering that promotes high-rating reviews to Google Business in a non-invasive new-tab flow.
- **Verified Status:** Official verification workflow with visual trust seals.
- **Analytics Anti-Inflation:** Protection against metric manipulation and spam clicks.

### 👤 For Reviewers
- **Magic Link & Social Auth:** Seamless onboarding via Google OAuth (branded compliance) or secure Magic Links.
- **Reputation System:** Dynamic tiers (Recurrent to Elite) based on contribution quality.
- **Review Ownership:** Full control over history, profile visibility, and LGPD-safe data sync.
- **Gamified Badges:** Visual recognition for trusted community contributors.

### 🛡️ Governance & Security
- **RBAC & RLS:** Enterprise-grade security with Row Level Security and Role-Based Access Control (Super Admin, Admin, Customer, Reviewer).
- **Moderation Center:** Full transparency for sanctions (Warnings, Suspensions, Bans) and an integrated Appeals system.
- **Abuse Prevention:** SHA-256 fingerprinting and server-side cooldowns to prevent review spam.
- **Audit Logging:** Comprehensive tracking of role changes and administrative actions.

---

## 🛠 Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Framework** | Next.js 15 (App Router), React 19 |
| **Language** | TypeScript (Strict Mode) |
| **Database** | PostgreSQL (Supabase) |
| **Realtime / Auth** | Supabase SSR (Auth, Storage, RPC) |
| **Styling** | Tailwind CSS 4, Radix UI, shadcn/ui |
| **Validation** | Zod, React Hook Form |
| **Testing** | Vitest, React Testing Library |
| **Infrastructure** | Vercel (Edge Runtime), Resend (Transactional Email), Stripe (Planned) |

---

## 🏗 Architecture Overview

The project follows a **Clean Architecture** approach with a **Hybrid Rendering Strategy**:

- **Domain Layer:** Pure business logic and entities.
- **Application Layer:** Use cases orchestrating data flow.
- **Infrastructure Layer:** Supabase repositories and technical implementations.
- **UI Layer (Hybrid):** 
  - **SSR-First:** Public pages are server-side rendered for maximum SEO.
  - **Query-Powered:** Authenticated areas use **React Query** for a snappy, app-like experience with optimistic updates and pagination.

### SEO & Discovery Strategy
- **Native Metadata Routes:** Automated `sitemap.ts` and `robots.ts`.
- **Crawler Infrastructure:** Optimized SSR content wrappers ensure rankings are indexable before hydration.
- **ISR Optimization:** Automatic revalidation for high-traffic discovery pages.

---

## 🔐 Security & Safety

- **Multi-tenant Isolation:** Strict data separation via `owner_id` and RLS.
- **Anti-Recursion:** Hardened `is_admin` security definers.
- **Auth Hardening:** Secure cookie-based session management with `@supabase/ssr`.
- **Operational Safety:** Mandatory confirmation for production database operations via `db-safety.sh`.

---

## 💻 Local Development

### Prerequisites
- Node.js >= 20.0.0
- Docker (for local Supabase instance)
- Supabase CLI

### Setup
1. **Clone and Install:** `npm install`
2. **Environment:** Copy `.env.example` to `.env.local`
3. **Database:** `npm run supabase:start`
4. **Run:** `npm run dev`

### 🛡️ Developer Experience
- `npm run lint`: Enforce code quality and branding compliance.
- `npm run test`: Validate critical business logic.
- `npm run build`: Verify production readiness and SSR integrity.

---

## 🚢 Deployment

Optimized for **Vercel + Supabase Cloud**:
1. Continuous Integration via GitHub Actions.
2. Edge Runtime utilization for dynamic branding assets.
3. Versioned migrations and rollback-ready deployment strategy.

---

<div align="center">
  <p>Built with ❤️ for a more transparent local commerce.</p>
  <p>© 2026 Avalia Prudente. All rights reserved.</p>
</div>

