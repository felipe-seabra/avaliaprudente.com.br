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
