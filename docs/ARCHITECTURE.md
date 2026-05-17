# Technical Architecture

## Principles

1. **Separation of Concerns:** Each layer has a specific responsibility.
2. **Dependency Inversion:** High-level modules should not depend on low-level modules. Both should depend on abstractions.
3. **Single Source of Truth:** Data should have one authoritative source.

## Layers

### 1. Domain (`src/core/domain`)
- **Entities:** Pure business objects.
- **Interfaces:** Repository and Service definitions.
- **Value Objects:** Simple objects without identity.

### 2. Application (`src/core/application`)
- **Use Cases:** Orchestrate the flow of data to and from the domain entities.
- **DTOs:** Data Transfer Objects for input/output.

### 3. Infrastructure (`src/core/infrastructure`)
- **Repositories:** Implementations of domain interfaces (e.g., Supabase, LocalStorage).
- **Mappers:** Transform data between infrastructure and domain formats.
- **Services:** External integrations (e.g., Google Maps API).

### 4. UI Layer (`src/components`, `src/app`)
- **Next.js Pages:** Entry points for the application.
- **Hooks:** Local state and side-effect management.
- **Providers:** Global state and context.

## State Management

- **Server State:** Handled by Next.js Server Components and Server Actions.
- **Client State:** Handled by React `useState`, `useContext`, or specialized hooks.
- **Persistence:** Supabase (PostgreSQL + Auth).

## Authentication Flow

1. User logs in via Supabase Auth.
2. Middleware refreshes the session on each request.
3. Server Components access the user session via `createClient` from `@/lib/supabase/server`.

## Data Isolation & Security

### Multi-tenant Isolation
The platform uses a strict tenant isolation model based on `owner_id`.
- **Businesses:** Users can only view and modify businesses where `owner_id = auth.uid()`.
- **Pages & Links:** Access is cascaded via the `business_id` or `page_id`.
- **Analytics:** Data is strictly isolated; owners only see events related to their own businesses.

### Row Level Security (RLS) Logic
- **Public Access:** Anonymous users can read `businesses`, `business_pages`, and `page_links` to view public profiles, but cannot modify anything.
- **Admin Access:** Users with the `admin` role (in `profiles`) have broad read/write access to moderate the platform.
- **Customer Access:** Restricted to their own created entities.

## Core Workflows

### Verification System
1. **Request:** A business owner submits a request via `VerificationRequestModal`. A record is created in `verification_requests` with status `pending`.
2. **Moderation:** Admins view the request in `/admin/verifications`.
3. **Approval:** Admin approves the request. This triggers:
   - Update of `verification_requests.status` to `approved`.
   - Update of `businesses.is_verified` to `true`.
   - Notification of the business owner.
4. **Rejection:** Admin rejects the request with a reason. The business status is set to `rejected`.

### Ranking System (Bayesian Average)
To prevent businesses with a single 5-star review from outranking those with hundreds of 4.8-star reviews, we use a Bayesian Average algorithm:
- **Formula:** `(v*R + m*C) / (v+m)`
  - `v`: Number of reviews for the business.
  - `m`: Minimum reviews required to be considered (threshold).
  - `R`: Average rating of the business.
  - `C`: Mean rating across the entire platform.
- **Boosts:** Verified businesses and "Featured" (is_featured) businesses receive additional weighting in the final score.

## Storage Management
- **Logo Cleanup:** When a business logo is updated or deleted, the system automatically removes the old file from Supabase Storage (`business-assets` bucket) to prevent orphaned files.
