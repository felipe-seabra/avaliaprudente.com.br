# GEMINI.md

Read:
- docs/ai/agents.md

You are the main engineer of this project.

Project:
Avalia Prudente

---

# Product Vision

Avalia Prudente is primarily an NFC-powered business platform.

Core product:
NFC cards/tags that redirect users to customizable business pages.

Google Reviews is one module/CTA of the platform, not the entire product.

Main experience:

NFC Tag →
Business Page →
User chooses an action

Possible actions:
- Google Reviews
- WhatsApp
- Instagram
- Facebook
- Portfolio
- Website
- Menu
- Promotions
- Contact buttons
- Custom links

---

# Architecture Direction

The platform must evolve as a modular business page system.

Core entities:
- business
- business_page
- page_links
- review_cta
- custom_blocks
- themes

Requirements:
- reusable CTA blocks
- reorderable links
- customizable business pages
- scalable modular architecture
- reusable link system
- future-ready structure

---

# NFC Product Flow

Primary business goal:
sell NFC cards/tags for businesses.

The onboarding experience must be extremely simple for non-technical users.

Flow:
1. Business owner receives NFC tag
2. Business owner configures business page
3. NFC redirects users to business page
4. Users choose actions/buttons

The business page must support:
- custom slug
- logo
- description
- CTA ordering
- social links
- review CTA
- theme customization
- enable/disable links

---

# Google Review Flow

Google Reviews remains an important feature.

Flow:
1. Business owner configures Google review CTA
2. NFC page displays review button
3. User clicks review CTA
4. Internal rating flow can filter negative feedback
5. Positive users redirect to Google Reviews

---

# Google Review UX

Primary goal:
make NFC setup extremely easy for non-technical business owners.

Requirements:
- Google review URL can be manually pasted
- support helper onboarding flows
- support business name + city onboarding
- support "Find my Google Business" helper flow

MVP approach:
- avoid Google API integration for now
- use lightweight helper UX
- minimize onboarding friction

Future-ready:
- Google Places API integration
- automatic business lookup
- autocomplete suggestions
- business verification

Accepted review URL formats:
- https://g.page/.../review
- https://search.google.com/local/writereview?placeid=...

---

# Admin Platform Architecture

The platform must support two separated experiences:

1. Customer Dashboard
2. Platform Admin Dashboard

Customer dashboard:
- /dashboard

Admin dashboard:
- /admin

---

# Roles System

The platform must implement role-based access control (RBAC).

Required roles:
- admin
- customer

Requirements:
- secure role validation
- reusable permission helpers
- SSR-compatible role checks
- scalable RBAC architecture

The profiles table must support:
- role field
- default role = customer

---

# Admin Dashboard

The platform owner must have access to:
- customer management
- business management
- NFC tag management
- analytics overview
- platform settings
- feature flags
- support tools

Important:
The admin system must be prepared architecturally now, even if advanced admin features are implemented later.

---

# Admin Middleware

Requirements:
- protect /admin routes
- admin-only access
- redirect unauthorized users
- reusable middleware helpers
- reusable role guards

---

# Initial Admin Foundation

The platform should implement:
- /admin route
- admin layout shell
- admin sidebar
- role-aware navigation
- role-aware redirects

Focus:
- architecture
- permissions
- scalability
- security

Avoid:
- overengineering
- duplicated role logic
- hardcoded permissions

---

# Mandatory Rules

Always:
- reply in Portuguese
- write code in English
- use Conventional Commits
- create frequent commits
- document everything

Never:
- generate duplicated code
- create unnecessary abstractions
- ignore accessibility
- ignore performance
- ignore TypeScript errors
- ignore ESLint errors

---

# Stack

- Next.js 15
- TypeScript
- TailwindCSS
- shadcn/ui
- Supabase
- npm
- ESLint
- Prettier

---

# Technical Goals

- scalable architecture
- production-ready setup
- clean architecture
- clean code
- mobile-first
- accessibility
- SEO-ready
- Lighthouse 95+

---

# UI Direction

Style references:
- Linear
- Stripe
- Raycast
- Vercel
- Notion

Visual requirements:
- premium purple accent
- elegant dark mode
- subtle gradients
- soft glow effects
- modern SaaS aesthetic

Avoid:
- visual pollution
- exaggerated gradients
- excessive animations
- oversized shadows

---

# Roadmap

## Phase 1 — Foundation
Goals:
- project architecture
- Next.js setup
- Supabase setup
- local Docker environment
- ESLint and Prettier
- documentation
- clean architecture foundation

Status:
- completed

---

## Phase 2 — Authentication & Database
Goals:
- login/register
- password recovery
- auth middleware
- protected routes
- reusable forms
- database schema
- RLS policies

Status:
- completed

---

## Phase 3 — UI Foundation & Landing Page
Goals:
- premium SaaS identity
- dashboard shell
- sidebar
- landing page
- design system
- dark mode
- responsive UI

Status:
- completed

---

## Phase 4 — Core Business Logic
Goals:
- business CRUD
- review flow
- public pages
- onboarding
- business pages
- review links
- modular CTA system

Status:
- in progress

---

## Phase 5 — NFC & QR System
Goals:
- QR generation
- NFC management
- tag linking
- short links
- QR customization
- QR analytics foundation

Do NOT overengineer yet.

---

## Phase 6 — Analytics
Goals:
- dashboard metrics
- CTA analytics
- NFC analytics
- conversion metrics
- review metrics
- charts
- reports

---

## Phase 7 — Production Polish
Goals:
- accessibility improvements
- SEO improvements
- performance optimization
- error boundaries
- empty states
- loading UX
- edge-case handling
- testing

---

## Phase 8 — Premium SaaS Features
Future possibilities:
- subscriptions
- Stripe integration
- white-label
- custom domains
- advanced analytics
- AI integrations
- automations
- team management

---

# Workflow

Always work in small phases.

Never build the entire platform at once.

Before creating new files:
- search for existing implementations
- reuse abstractions
- avoid duplicate code

After every phase:
- run lint
- fix issues
- run full build
- create commit
- update changelog
- update documentation
- explain architecture decisions

If context becomes too large:
- summarize architecture
- summarize progress
- explain next steps
- wait for new instructions
