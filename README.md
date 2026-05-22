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
  </p>
</div>

---

## 🌟 Product Overview

**Avalia Prudente** is a premium Reputation-as-a-Service (RaaS) platform designed to bridge the gap between local businesses and their customers. It provides a sophisticated ecosystem for verified feedback, official business interactions, and a transparent reputation scoring system.

Built with a focus on **security**, **governance**, and **performance**, Avalia Prudente empowers business owners to manage their digital presence while offering reviewers a gamified, trustworthy platform to share their experiences.

### The Ecosystem
- **Reviewers:** Earn reputation, badges, and recognition for high-quality, authentic feedback.
- **Businesses:** Claim professional profiles, respond officially to customers, and boost visibility through verified performance.
- **Platform Governance:** Robust moderation, anti-abuse systems, and automated ranking algorithms ensure a fair and clean marketplace.

---

## 🚀 Core Features

### 👤 For Reviewers
- **Magic Link & Social Auth:** Seamless onboarding via Google OAuth or secure Magic Links.
- **Reputation System:** Dynamic tiers (Recurrent to Elite) based on contribution quality.
- **Review Ownership:** Full control over your history and profile visibility.
- **Identity Consistency:** LGPD-conscious data synchronization across the platform.

### 🏢 For Businesses
- **Dynamic Branding:** Personalized public pages with custom logos, colors, and social CTAs.
- **Official Responses:** Engage directly with customers through verified response threads.
- **Google Review Gate:** Smart filtering that promotes high-rating reviews to Google Business.
- **Verified Status:** Official verification workflow to build trust with the community.
- **Analytics Anti-Inflation:** Protection against metric manipulation and spam clicks.

### 🛡️ Governance & Security
- **RBAC & RLS:** Enterprise-grade security with Row Level Security and Role-Based Access Control.
- **Moderation Center:** Full transparency for sanctions (Warnings, Suspensions, Bans) and an integrated Appeals system.
- **Abuse Prevention:** SHA-256 fingerprinting and server-side cooldowns to prevent review spam.
- **Anti-Recursion Safety:** Hardened RLS policies optimized for production scale.

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
| **Infrastructure** | Vercel (Edge Runtime for OG Images), Resend (Transactional Email) |

---

## 🏗 Architecture Overview

The project follows a **Clean Architecture** approach to ensure long-term maintainability and technical decoupling:

- **Domain Layer (`src/core/domain`):** Pure business logic, entities, and repository interfaces. No external dependencies.
- **Application Layer (`src/core/application`):** Orchestrates use cases (e.g., submitting reviews, processing appeals).
- **Infrastructure Layer (`src/core/infrastructure`):** Technical implementations, Supabase repositories, and data mappers.
- **UI Layer (`src/components` & `src/app`):** SSR-first React components, context providers, and domain-specific hooks.

### Performance & SEO
- **SSR-First:** All public pages are server-side rendered for maximum SEO and performance.
- **Edge Runtime:** Dynamic OG Images generated via Satori on Vercel Edge.
- **Intelligent Hydration:** Minimal client-side JS for a snappy, app-like feel.
- **Optimized RPCs:** Database-level logic for complex aggregations (Bayesian rankings, reputation stats).

---

## 🔐 Authentication & Security

### Hybrid Onboarding & Auth
Avalia Prudente implements a dual-mode authentication strategy designed for both convenience and high-security SaaS ownership:

- **Reviewers:** Lightweight onboarding via Google OAuth or Magic Links. No password required for casual feedback submission.
- **Businesses:** Premium, multi-step onboarding flow (`/onboarding`) that leverages Google OAuth to prefill identity while mandating the creation of a traditional secure password. This ensures business accounts support multi-channel login and are "billing-ready" for long-term operational ownership.

### SSR-Safe Auth
We leverage `@supabase/ssr` to handle authentication entirely via secure cookies. This allows:
- Seamless route protection in `middleware.ts`.
- Instant session validation in Server Components.
- Secure token refresh without LocalStorage vulnerabilities.

### Governance Model
- **Super Admin:** Platform-wide oversight and manual override capabilities.
- **Business Owner:** Full management of their specific tenant (isolation via `owner_id`).
- **Reviewer:** Standard profile with verified identity attributions.
- **Audit Logging:** Every critical action is tracked through database triggers and moderation logs.

---

## 💻 Local Development

### Prerequisites
- Node.js >= 20.0.0
- Docker (for local Supabase instance)
- Supabase CLI

### Setup
1. **Clone and Install:**
   ```bash
   git clone https://github.com/your-repo/avaliaprudente.git
   cd avaliaprudente
   npm install
   ```

2. **Environment Configuration:**
   Copy `.env.example` to `.env.local` and fill in your Supabase credentials.

3. **Start Local Database:**
   ```bash
   npm run supabase:start
   ```

4. **Run Development Server:**
   ```bash
   npm run dev
   ```

### 🛡️ Developer Experience: Safety Guard
We use a custom `db-safety.sh` script to prevent accidental destructive operations on production databases.
- `npm run supabase:reset`: Safe reset of local environment.
- `npm run db:push`: Securely pushes migrations with mandatory confirmation.

---

## 🚢 Deployment

The platform is optimized for a hybrid **Vercel + Supabase** architecture:

1. **Migrations:** Managed via Supabase CLI and synchronized with GitHub Actions.
2. **Compute:** Next.js deployment on Vercel, utilizing both Node.js and Edge runtimes.
3. **Database:** PostgreSQL on Supabase with strict RLS policies enabled.
4. **Safety:** All production deployments require passing the `lint` and `test` suites.

---

## 📁 Project Structure

```text
src/
├── app/             # Next.js 15 App Router (Routes & Server Components)
├── components/      # UI Components (Domain-driven: admin, dashboard, marketing)
├── core/            # Clean Architecture Core (Domain, Application, Infrastructure)
├── hooks/           # Domain-specific React hooks
├── lib/             # Shared utilities (supabase client, validators, constants)
├── providers/       # React Context Providers
└── types/           # Global TypeScript definitions
supabase/
├── migrations/      # Versioned SQL migrations
└── seed.sql         # Local development seed data
```

---

## 📖 Documentation Reference

Detailed technical guides can be found in the `docs/` directory:
- [Architecture & Patterns](docs/ARCHITECTURE.md)
- [Multi-tenant Strategy](docs/adr/001-multi-tenant-strategy.md)
- [Authentication Workflow](docs/adr/002-auth-strategy.md)
- [Verification System](docs/adr/003-verification-flow.md)

---

## 🗺 Future Roadmap
- [ ] **Stripe Integration:** Premium tiers for businesses with advanced analytics.
- [ ] **AI Assistant:** Automated response suggestions for business owners.
- [ ] **Mobile App:** Native experience for reviewers with NFC quick-tap.
- [ ] **Advanced Moderation:** ML-based spam detection and sentiment analysis.

---

<div align="center">
  <p>Built with ❤️ for a more transparent local commerce.</p>
  <p>© 2026 Avalia Prudente. All rights reserved.</p>
</div>
