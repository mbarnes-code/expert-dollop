# Architecture Documentation

## Domain-Driven Design (DDD) Principles

This application follows DDD principles with clear bounded contexts for each domain.

### Bounded Contexts

Each domain is a separate bounded context:

1. **MTG Domain**: Magic: The Gathering combo database
2. **Security Domain**: Security analysis and reporting
3. **Finance Domain**: Budget and financial management
4. **AI Domain**: AI-powered tools and knowledge graphs
5. **Ingestion Domain**: Web crawling and data collection

### Layers

#### Presentation Layer
- `app/` - Next.js routes (Server Components by default)
- `src/domains/*/components/` - Domain-specific UI components

#### Application Layer
- `app/actions/` - Server Actions for mutations
- `src/domains/*/services/` - Business logic orchestration

#### Domain Layer
- `src/domains/*/types/` - Domain entities and value objects
- `src/domains/*/factories/` - Factory pattern for object creation
- `src/domains/*/validators/` - Domain validation rules

#### Infrastructure Layer
- `src/infrastructure/` - Cross-cutting concerns
- `src/domains/*/api/repositories/` - Data access
- `src/domains/*/api/clients/` - External API integration

### Shared Kernel
- `src/shared/` - Code shared across all domains
- Acts as an Anti-Corruption Layer between domains

## Next.js 15 Features

### App Router
Using the App Router with route groups for organization:
- `(marketing)` - Public pages
- `(domains)` - Authenticated domain routes

### Server Components
Default for all components unless marked with `'use client'`.

### Server Actions
Used for all form submissions and mutations.

### React 19 Features
- `use()` hook for promise handling
- `useFormStatus` for form state
- `useOptimistic` for optimistic updates
- `useActionState` for action state management

## Technology Choices

### Why Next.js 15?
- Server Components for optimal performance
- Server Actions for progressive enhancement
- Built-in TypeScript support
- Excellent developer experience

### Why Zustand?
- Simple and lightweight
- TypeScript-first
- No boilerplate
- Perfect for client state

### Why shadcn/ui?
- Not a component library, but a collection
- Full control over components
- Built on Radix UI (accessible)
- Customizable with Tailwind

## Directory Structure Rationale

### Domain Structure
Each domain follows the same structure for consistency:
```
domain/
├── api/           # Data layer
├── components/    # UI layer
├── hooks/         # React hooks
├── stores/        # State management
├── types/         # TypeScript types
├── factories/     # DDD factories
├── validators/    # Validation
└── utils/         # Utilities
```

This makes it easy to:
- Navigate the codebase
- Understand domain boundaries
- Add new domains
- Maintain consistency

## Next Steps

Phase 2 will implement the shared infrastructure that all domains will use.
