# Unified Frontend

A Next.js 15 application with Domain-Driven Design (DDD) architecture integrating multiple specialized domains.

## Features

- **MTG Domain**: Magic: The Gathering combo database and card search
- **Security Domain**: Security analysis, YARA rules, and reporting
- **Finance Domain**: Budget management and financial tracking
- **AI Domain**: AI chat, MCP Inspector, and knowledge graphs
- **Ingestion Domain**: Web crawling and data collection

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **React**: React 19 with Server Components
- **TypeScript**: Strict mode
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **Authentication**: NextAuth.js

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 8+

### Installation

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
apps/unified-frontend/
├── app/                    # Next.js App Router
│   ├── (marketing)/       # Public pages
│   ├── (domains)/         # Domain routes
│   ├── api/               # API routes
│   └── actions/           # Server Actions
├── src/
│   ├── domains/           # Domain modules (DDD)
│   ├── shared/            # Shared kernel
│   ├── infrastructure/    # Infrastructure layer
│   ├── providers/         # React providers
│   └── config/            # Configuration
├── public/                # Static assets
└── tests/                 # Tests
```

## Architecture

This application follows Domain-Driven Design (DDD) principles:

- **Bounded Contexts**: Each domain (MTG, Security, Finance, AI, Ingestion) is a separate bounded context
- **Layered Architecture**: Presentation, Application, Domain, and Infrastructure layers
- **Server Components**: Leveraging React Server Components for optimal performance
- **Server Actions**: Using Server Actions for mutations and form handling

## Development

```bash
# Run development server
pnpm dev

# Build for production
pnpm build

# Run production server
pnpm start

# Type check
pnpm type-check

# Lint
pnpm lint
```

## Implementation Status

### Phase 1: Foundation ✅ (Completed)
- [x] Base directory structure
- [x] Configuration files
- [x] Basic routing structure
- [x] Placeholder pages

### Phase 2: Shared Infrastructure (Next)
- [ ] shadcn/ui components
- [ ] Shared layout components
- [ ] Authentication infrastructure
- [ ] API clients
- [ ] Error boundaries

### Phase 3-7: Domain Implementation
- [ ] MTG Domain
- [ ] Security Domain
- [ ] Finance Domain
- [ ] AI Domain
- [ ] Ingestion Domain

See [docs/architecture/](./docs/architecture/) for detailed documentation.

## License

Apache-2.0
