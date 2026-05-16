# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added

- Initial project structure with Next.js 15 and TypeScript.
- Clean Architecture folder structure (`src/core`, `src/components`, etc).
- Supabase integration with `@supabase/ssr` (client, server, and middleware).
- Auth foundation with callback route.
- Theme support with `next-themes` and `ThemeProvider`.
- shadcn/ui initialization with Tailwind CSS 4.
- Design system foundation and constants.
- Strict TypeScript configuration.
- ESLint and Prettier configuration.
- Technical documentation (`README.md`, `ARCHITECTURE.md`).
- `.env.example` file.
- Local Supabase development environment with Docker.
- Initial database schema with `profiles` table and RLS policies.
- npm scripts for local Supabase management.
- Documentation for local development (`docs/LOCAL_SUPABASE.md`).
- Complete authentication flow (Login, Register, Forgot Password, Reset Password).
- Reusable form system with React Hook Form, Zod, and shadcn/ui.
- Protected routes and auth redirection in Middleware.
- Database schema expansion: `businesses`, `review_links`, `qr_codes`, and `reviews` tables.
- Comprehensive RLS policies and indexes for all tables.
- Generated TypeScript types for the entire database.
- Dashboard test page and logout flow.
- Sonner integration for UI feedback.
- Fixed missing Radix UI dependencies (`@radix-ui/react-label`, `@radix-ui/react-slot`).
- Fixed Next.js 15 metadata viewport warning in RootLayout.
- Validated complete UI component system and build success.
- Premium SaaS visual identity with purple accent and elegant dark mode tokens in `globals.css`.
- Complete Landing Page with Hero, Features, How It Works, Pricing, FAQ, and Footer sections.
- Reusable Dashboard Shell with Sidebar, Top Navigation, Breadcrumbs, User dropdown, and Theme Toggle.
- Extensive use of new shadcn/ui components (`sidebar`, `dropdown-menu`, `avatar`, `sheet`, `accordion`, etc) integrated with `@base-ui`.
- Core SaaS logic implementation with Clean Architecture (Infrastructure, Domain, Application layers).
- Business Onboarding flow with `CreateBusinessDialog` and `BusinessSwitcher`.
- Business Context Provider (`BusinessProvider`) to manage active business state across the dashboard.
- Review Link management (CRUD) for each business.
- Public Review Flow (`/r/[slug]`) with premium 1-5 star rating interaction.
- Conditional redirection logic: Positive ratings (>= 4) redirect to Google; negative ratings (< 4) show a private feedback form.
- Internal feedback capture system to preserve business reputation.
- Dashboard summary with total reviews, average rating, and redirection stats.
- Robust data fetching hooks (`useBusiness`, `useReviewLink`).
- Full TypeScript validation and lint cleanup across the entire Phase 4 implementation.
- NFC-First Product Evolution: Transitioned from simple review site to NFC-powered business platform.
- Modular Business Pages: Created `business_pages` and `page_links` tables for customizable landing pages.
- Public Page Root Route: Implemented `/[slug]` to serve business pages with modular CTAs.
- Page Editor: Built a comprehensive dashboard interface for customizing business description and CTA links.
- Modular CTA System: Support for Google Reviews, WhatsApp, Instagram, Facebook, Website, and Portfolio buttons.
- Role-Based Access Control (RBAC): Implemented 'admin' and 'customer' roles in `profiles` and Middleware.
- Admin Foundation: Created `/admin` route with layout shell and role-aware navigation.
- Automatic Page Initialization: New businesses now automatically generate a public page shell.
- Reusable `ReviewFlow` component integrated into the modular page experience.
