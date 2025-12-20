# Next.js 15 Unified Frontend Implementation Plan

## Project Overview
Build a Next.js 15 application with Node.js backend that serves as a unified frontend to integrate multiple existing applications from the `features/` directory into a cohesive root application using Domain-Driven Design (DDD) principles.

## Current State Analysis

### Existing Structure
- **Monorepo**: Nx workspace with multiple apps and libs
- **Package Manager**: pnpm with workspaces
- **Features to Integrate**:
  - `features/actual/` - Budget/Finance app (JavaScript/TypeScript)
  - `features/commander-spellbook-site/` - MTG combo site (Next.js)
  - `features/commander-spellbook-backend/` - MTG backend (Python/Django)
  - `features/AI core/firecrawl/` - Data ingestion tools
  - `features/AI core/goose/` - AI agent system
  - `features/AI core/n8n/` - Workflow automation
  - `features/AI core/inspector/` - MCP Inspector
  - `features/security/` - Security tools (Nemesis + Ghostwriter patterns)
  - `features/it-tools/` - Various IT utilities

### Target Architecture
- **Framework**: Next.js 15 with App Router
- **Runtime**: Node.js
- **State Management**: Zustand for client state, React Server Components for server state
- **Styling**: Tailwind CSS + shadcn/ui components
- **Forms**: Server Actions with React 19 hooks (useFormStatus, useOptimistic, useActionState)
- **TypeScript**: Strict mode throughout
- **Architecture Pattern**: Domain-Driven Design (DDD) with bounded contexts

## Implementation Phases

### Phase 1: Foundation Setup (Base Structure)
**Objective**: Create the base Next.js 15 application structure with empty directories following the DDD architecture layout.

**Tasks**:
1. Create new Next.js 15 app in `apps/unified-frontend/`
2. Set up directory structure per the design document
3. Configure TypeScript with strict mode
4. Set up Tailwind CSS and shadcn/ui
5. Create Nx project configuration
6. Set up basic routing structure with route groups
7. Create empty placeholder files for key components

**Deliverables**:
- `apps/unified-frontend/` with complete directory structure
- `package.json` with all required dependencies
- `tsconfig.json` with proper configurations
- `tailwind.config.ts` and `postcss.config.js`
- `next.config.js` with optimal settings
- Basic `app/layout.tsx` and `app/page.tsx`
- Empty domain directories with README placeholders

**Directory Structure to Create**:
```
apps/unified-frontend/
├── app/
│   ├── (marketing)/
│   ├── (domains)/
│   │   ├── mtg/
│   │   ├── security/
│   │   ├── finance/
│   │   ├── ai/
│   │   └── ingestion/
│   ├── api/
│   └── actions/
├── src/
│   ├── domains/
│   │   ├── mtg/
│   │   ├── security/
│   │   ├── finance/
│   │   ├── ai/
│   │   └── ingestion/
│   ├── shared/
│   ├── infrastructure/
│   ├── providers/
│   └── config/
├── public/
├── tests/
└── docs/
```

### Phase 2: Shared Infrastructure (Common Layer)
**Objective**: Build the shared kernel and infrastructure layer that all domains will use.

**Tasks**:
1. Set up shadcn/ui components in `src/shared/components/ui/`
2. Create shared layout components (AppShell, Header, Footer, Sidebar)
3. Build navigation components (MainNav, DomainNav, Breadcrumbs)
4. Implement authentication infrastructure (NextAuth.js setup)
5. Create shared hooks (useAuth, useTheme, useDebounce, etc.)
6. Set up global state stores (auth, theme, navigation)
7. Configure API clients (fetch wrapper, WebSocket, stream reader)
8. Set up error boundaries and error handling
9. Implement monitoring and logging infrastructure

**Deliverables**:
- Complete `src/shared/` directory with all components
- Complete `src/infrastructure/` with auth, routing, error handling
- `src/providers/RootProviders.tsx` with all context providers
- Working authentication system
- Base API client with interceptors
- Error boundary components

### Phase 3: MTG Domain Implementation
**Objective**: Implement the Magic: The Gathering domain as the first complete domain example.

**Integration Points**:
- Source: `features/commander-spellbook-site/` (Next.js app)
- Source: `features/commander-spellbook-backend/` (Django API)

**Tasks**:
1. Create MTG domain structure in `src/domains/mtg/`
2. Define TypeScript types and interfaces
3. Implement repository pattern for combo data
4. Create service layer for business logic
5. Build API clients for Django backend
6. Implement Server Components for combo list and detail pages
7. Build Client Components (search, filters)
8. Create Server Actions for combo submission
9. Implement MTG-specific hooks (useComboSearch, useCardData)
10. Set up Zustand stores for client state
11. Create MTG route group in `app/(domains)/mtg/`

**Deliverables**:
- Complete MTG domain implementation
- Working combo list, detail, and search pages
- Integration with commander-spellbook-backend API
- MTG-specific components reusable across features
- Tests for MTG domain

### Phase 4: Security Domain Implementation
**Objective**: Implement the security domain integrating Nemesis and Ghostwriter patterns.

**Integration Points**:
- Source: `features/security/` patterns
- Existing security apps in workspace

**Tasks**:
1. Create security domain structure in `src/domains/security/`
2. Define security types (files, findings, YARA rules, reports)
3. Implement file repository and analysis service
4. Create GraphQL client for security backend
5. Build file browser and viewer components
6. Implement file upload with progress tracking
7. Create findings list and triage interface
8. Build YARA rule editor with Monaco
9. Implement report builder (from Ghostwriter)
10. Create security route group in `app/(domains)/security/`
11. Set up WebSocket for real-time updates

**Deliverables**:
- Complete security domain implementation
- File browser with multi-format viewer
- Findings triage workflow
- YARA rule management
- Report generation system
- Real-time analysis updates

### Phase 5: Finance Domain Implementation
**Objective**: Integrate the Actual Budget application into the finance domain.

**Integration Points**:
- Source: `features/actual/` (Actual Budget app)

**Tasks**:
1. Create finance domain structure in `src/domains/finance/`
2. Analyze Actual Budget's data structures and API
3. Implement account and transaction repositories
4. Create budget service with calculation logic
5. Build account list and detail components
6. Implement transaction table with virtualization
7. Create budget editor interface
8. Build financial reports and charts
9. Implement sync service for data synchronization
10. Create finance route group in `app/(domains)/finance/`

**Deliverables**:
- Complete finance domain implementation
- Budget management interface
- Transaction tracking system
- Financial reports and visualizations
- Integration with Actual Budget backend

### Phase 6: AI Domain Implementation
**Objective**: Integrate Goose, MCP Inspector, and NVIDIA tools into the AI domain.

**Integration Points**:
- Source: `features/AI core/goose/` (AI agent)
- Source: `features/AI core/inspector/` (MCP Inspector)
- Source: `features/AI core/n8n/` (workflow automation)
- Source: `features/AI core/NVIDIA/` (knowledge graph tools)

**Tasks**:
1. Create AI domain structure in `src/domains/ai/`
2. Define chat and message types
3. Implement chat repository and service
4. Create MCP protocol client
5. Build Goose agent integration client
6. Implement NVIDIA knowledge graph client
7. Create chat interface with streaming
8. Build MCP Inspector UI
9. Implement knowledge graph visualization (3D)
10. Create multi-agent coordination interface
11. Set up Server-Sent Events for chat streaming
12. Create AI route group in `app/(domains)/ai/`

**Deliverables**:
- Complete AI domain implementation
- Real-time chat interface with streaming
- MCP Inspector with protocol viewer
- Knowledge graph visualization
- Multi-agent chatbot system
- Integration with all AI backend services

### Phase 7: Ingestion Domain Implementation
**Objective**: Integrate Firecrawl for data ingestion and web crawling.

**Integration Points**:
- Source: `features/AI core/firecrawl/` (Firecrawl API)

**Tasks**:
1. Create ingestion domain structure in `src/domains/ingestion/`
2. Define crawler types and job types
3. Implement crawl job repository
4. Create crawler service with orchestration
5. Build Firecrawl API client
6. Create crawler configuration interface
7. Build job status monitoring component
8. Implement crawl history viewer
9. Create ingestion route group in `app/(domains)/ingestion/`
10. Set up WebSocket for job progress updates

**Deliverables**:
- Complete ingestion domain implementation
- Crawler configuration UI
- Job monitoring dashboard
- Crawl history tracking
- Integration with Firecrawl API

### Phase 8: Integration & Polish
**Objective**: Connect all domains, implement cross-domain features, and polish the UX.

**Tasks**:
1. Implement domain switcher in navigation
2. Create unified dashboard showing all domains
3. Set up domain event bus for cross-domain communication
4. Implement global search across domains
5. Create notification system for cross-domain events
6. Build user preferences and settings
7. Implement theme customization
8. Add keyboard shortcuts
9. Optimize bundle size with code splitting
10. Implement progressive loading strategies
11. Add accessibility features (ARIA, keyboard nav)
12. Create comprehensive error pages

**Deliverables**:
- Unified navigation and domain switching
- Global dashboard
- Cross-domain search
- Notification system
- User settings and preferences
- Optimized performance
- Accessible interface

### Phase 9: Testing & Documentation
**Objective**: Ensure code quality, reliability, and maintainability.

**Tasks**:
1. Write unit tests for all services and repositories
2. Create component tests with React Testing Library
3. Implement integration tests for API routes
4. Write E2E tests with Playwright for critical flows
5. Document architecture and DDD principles
6. Create domain-specific documentation
7. Write API documentation
8. Create component storybook
9. Document deployment procedures
10. Create developer onboarding guide

**Deliverables**:
- Comprehensive test suite with >80% coverage
- Architecture documentation
- Domain documentation
- API documentation
- Developer guides
- Deployment procedures

### Phase 10: Deployment & DevOps
**Objective**: Prepare for production deployment and set up CI/CD.

**Tasks**:
1. Create Docker configuration for Next.js app
2. Set up environment variable management
3. Configure database migrations
4. Set up Redis for caching
5. Implement health check endpoints
6. Create CI/CD pipeline (GitHub Actions)
7. Set up staging environment
8. Configure production environment
9. Implement monitoring and alerting
10. Set up error tracking (Sentry)
11. Configure logging aggregation
12. Create backup and recovery procedures

**Deliverables**:
- Production-ready Docker setup
- CI/CD pipeline
- Staging and production environments
- Monitoring and alerting
- Error tracking
- Logging infrastructure
- Backup procedures

## Technical Specifications

### Dependencies
**Core**:
- next@15.x
- react@19.x
- react-dom@19.x
- typescript@5.x

**State Management**:
- zustand@4.x
- @tanstack/react-query@5.x

**UI/Styling**:
- tailwindcss@3.x
- @radix-ui/* (shadcn/ui dependencies)
- lucide-react (icons)
- clsx & tailwind-merge

**Forms & Validation**:
- zod@3.x
- react-hook-form@7.x (if needed beyond Server Actions)

**Data Fetching**:
- axios@1.x (or native fetch with wrapper)

**Authentication**:
- next-auth@5.x

**Database/ORM**:
- prisma@5.x (or drizzle-orm)
- @prisma/client

**Code Editors**:
- @monaco-editor/react@4.x
- @tiptap/react (rich text)

**Visualization**:
- recharts@2.x (charts)
- react-force-graph-3d (knowledge graph)

**Testing**:
- vitest@1.x
- @testing-library/react@15.x
- @testing-library/jest-dom@6.x
- @playwright/test@1.x

**Development**:
- eslint@9.x
- prettier@3.x
- husky@9.x (git hooks)
- lint-staged@15.x

### Configuration Files

**next.config.js**:
```javascript
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  images: {
    domains: ['api.scryfall.com'],
  },
}
```

**tsconfig.json**:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"],
      "@/domains/*": ["./src/domains/*"],
      "@/shared/*": ["./src/shared/*"],
      "@/infrastructure/*": ["./src/infrastructure/*"]
    }
  }
}
```

## Context Management Strategy

Given the large scope of this project, we should break it into manageable chunks:

### Recommended Approach:
1. **Phase 1** (Foundation) - Complete in one session - this creates the skeleton
2. **Phase 2** (Shared Infrastructure) - Complete in one session - builds common layer
3. **Phases 3-7** (Domains) - Each domain in separate session - allows focus
4. **Phase 8-10** (Integration, Testing, Deployment) - Can be combined or split

### For Each Session:
- Focus on one phase or domain at a time
- Use the directory structure as a checklist
- Create placeholder files with TODO comments for later implementation
- Keep context focused on current domain's requirements
- Document integration points for future sessions

## First Pass: Base Structure Only

For the initial implementation, we'll create:

### Directory Structure
- All directories from the architecture document
- README.md placeholders in each domain directory
- Empty TypeScript files with basic exports
- Basic configuration files

### Minimal Working App
- `app/layout.tsx` with basic HTML structure
- `app/page.tsx` with landing page
- `app/(marketing)/page.tsx` for public home
- `app/(domains)/layout.tsx` with navigation placeholder
- Basic domain route files with placeholder content

### Configuration
- `package.json` with all dependencies
- `tsconfig.json` with path aliases
- `tailwind.config.ts` with basic setup
- `next.config.js` with optimizations
- `.env.example` with required variables

### Nx Integration
- `project.json` for Nx configuration
- Proper integration with monorepo structure

## Success Criteria

### Phase 1 Success:
- [x] Next.js 15 app runs with `npm run dev`
- [x] All directories created per architecture
- [x] TypeScript compiles without errors
- [x] Can navigate between route groups
- [x] Basic styling with Tailwind works

### Overall Project Success:
- [ ] All existing features integrated and functional
- [ ] Consistent UI/UX across all domains
- [ ] Domain boundaries properly enforced
- [ ] Tests passing with >80% coverage
- [ ] Performance metrics meet targets (LCP < 2.5s, FID < 100ms, CLS < 0.1)
- [ ] Accessible (WCAG 2.1 AA compliant)
- [ ] Deployed to production successfully

## Next Steps After This Plan

1. **Review and Confirm**: Ensure this plan aligns with your vision
2. **Begin Phase 1**: Create the base structure with empty directories
3. **Iterative Development**: Work through each phase systematically
4. **Regular Check-ins**: Verify progress and adjust as needed

## Questions for Clarification

1. **Authentication**: Should we use NextAuth.js or another solution?
2. **Database**: Prisma or Drizzle ORM? PostgreSQL as primary DB?
3. **API Strategy**: Should domains call external APIs directly or through a BFF pattern?
4. **State Management**: Zustand for all client state or mix with React Query?
5. **Styling**: Strict shadcn/ui or custom components allowed?
6. **Testing**: Test coverage requirements? E2E test priorities?
7. **Deployment**: Target platform (Vercel, self-hosted, AWS)?

## Estimated Timeline

- **Phase 1**: 2-3 hours
- **Phase 2**: 4-6 hours  
- **Phase 3-7**: 6-8 hours each (30-40 hours total)
- **Phase 8**: 8-10 hours
- **Phase 9**: 10-12 hours
- **Phase 10**: 6-8 hours

**Total**: ~65-85 hours of focused development time

This timeline assumes:
- Working alone without blockers
- Existing backend APIs are stable
- Requirements don't significantly change
- No major technical debt in source features
