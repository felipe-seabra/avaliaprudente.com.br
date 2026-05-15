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
