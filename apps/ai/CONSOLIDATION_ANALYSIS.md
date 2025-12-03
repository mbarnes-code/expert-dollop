# Code Consolidation Analysis - apps/ai Directory

**Date:** 2025-12-03  
**Analysis by:** GitHub Copilot Agent  

## Executive Summary

This document identifies duplicate and similar code patterns across subdirectories in the `apps/ai` directory that can be consolidated into higher-level shared services. The analysis found **significant code duplication** across four Next.js applications and opportunities for shared utilities.

## Key Findings

### 1. Nearly Identical Next.js Applications (CRITICAL)

**Affected Services:**
- `apps/ai/analytics`
- `apps/ai/chat`
- `apps/ai/models`
- `apps/ai/training`

**Duplication Level:** ~95% identical code

#### Detailed Analysis

##### A. Layout Files (`src/app/layout.tsx`)
**All four services have IDENTICAL layout files** with only the title differing:

```typescript
// Pattern found in all 4 services
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ai-[SERVICE_NAME]',  // Only difference
  description: 'ai domain application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

**Similarities:**
- Identical structure and imports
- Same description text
- Same component implementation
- Only difference: `ai-analytics`, `ai-chat`, `ai-models`, `ai-training` in title

##### B. Page Files (`src/app/page.tsx`)
**All four services have IDENTICAL page files** with only the heading text differing:

```typescript
// Pattern found in all 4 services
export default function Home() {
  return (
    <main style={{ padding: '2rem' }}>
      <h1>ai-[SERVICE_NAME]</h1>  // Only difference
      <p>Welcome to the ai domain application.</p>
    </main>
  );
}
```

**Similarities:**
- Identical structure
- Same welcome message
- Same inline styling
- Only difference: service name in h1 tag

##### C. TypeScript Configuration (`tsconfig.json`)
**All four services have BYTE-FOR-BYTE IDENTICAL tsconfig.json files:**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "jsx": "preserve",
    "allowJs": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "incremental": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "plugins": [{ "name": "next" }]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

**Similarities:**
- 100% identical configuration
- Same compiler options
- Same includes/excludes
- No differences at all

##### D. Next.js Configuration (`next.config.mjs`)
**All four services have BYTE-FOR-BYTE IDENTICAL next.config.mjs files:**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: [
    '@expert-dollop/shared-ui',
    '@expert-dollop/shared-utils',
    '@expert-dollop/ai-feature',
    '@expert-dollop/ai-data-access'
  ],
};

export default nextConfig;
```

**Similarities:**
- 100% identical configuration
- Same output mode
- Same transpile packages list
- No differences at all

##### E. Package Configuration (`package.json`)
**All four services have NEARLY IDENTICAL package.json files:**

```json
{
  "name": "@expert-dollop/ai-[SERVICE_NAME]",  // Only difference
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "typescript": "^5.9.0"
  }
}
```

**Similarities:**
- Identical scripts
- Identical dependencies
- Identical devDependencies
- Same versions across all services
- Only difference: package name

##### F. NX Project Configuration (`project.json`)
**All four services have NEARLY IDENTICAL project.json files:**

```json
{
  "name": "ai-[SERVICE_NAME]",  // Difference
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "apps/ai/[SERVICE_NAME]/src",  // Difference
  "projectType": "application",
  "tags": ["scope:ai", "type:app"],
  "targets": {
    "build": {
      "executor": "@nx/next:build",
      "outputs": ["{options.outputPath}"],
      "options": {
        "outputPath": "dist/apps/ai/[SERVICE_NAME]"  // Difference
      }
    },
    "dev": {
      "executor": "@nx/next:server",
      "options": {
        "buildTarget": "ai-[SERVICE_NAME]:build",  // Difference
        "dev": true
      }
    },
    "start": {
      "executor": "@nx/next:server",
      "options": {
        "buildTarget": "ai-[SERVICE_NAME]:build",  // Difference
        "dev": false
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    }
  }
}
```

**Similarities:**
- Identical structure
- Same executors
- Same targets
- Same tags
- Only differences: service name in various paths

#### Impact & Recommendation

**Files per service:** 6 configuration files + 2 source files = 8 files  
**Total duplicate files:** 8 files × 4 services = 32 files  
**Maintainability issue:** Changes must be replicated 4 times

**Recommendation:** Create a shared Next.js application template/base component that can be:
1. Extended by each service with service-specific configuration
2. Generated via NX generator/schematic for new services
3. Maintained in a single location (`libs/ai/next-app-base` or similar)

---

### 2. HTTP Error Handling Utilities

**Affected Services:**
- `apps/ai/playwright-service` 
- `apps/ai/firecrawl-api`

#### Playwright Service - Error Handler

**File:** `apps/ai/playwright-service/helpers/get_error.ts`

```typescript
export const getError = (statusCode: number | null): string | null => {
  if (statusCode === null) {
    return 'No response received';
  }

  const errorMessages: { [key: number]: string } = {
    300: "Multiple Choices",
    301: "Moved Permanently",
    // ... 60+ HTTP status codes mapped
    599: "Network Connect Timeout Error"
  };

  if (statusCode < 300) {
    return null;
  }

  return errorMessages[statusCode] || "Unknown Error";
};
```

**Purpose:** Maps HTTP status codes to human-readable error messages

#### Firecrawl API - Error System

**File:** `apps/ai/firecrawl-api/src/lib/error.ts`

```typescript
export type ErrorCodes =
  | "SCRAPE_TIMEOUT"
  | "MAP_TIMEOUT"
  | "UNKNOWN_ERROR"
  // ... 20+ custom error codes

export class TransportableError extends Error {
  public readonly code: ErrorCodes;
  
  constructor(code: ErrorCodes, message?: string, options?: ErrorOptions) {
    super(message, options);
    this.code = code;
  }

  serialize() { /* ... */ }
  static deserialize() { /* ... */ }
}

// Multiple specialized error classes:
// - ScrapeJobTimeoutError
// - UnknownError
// - MapTimeoutError
// - RacedRedirectError
// - SitemapError
// - CrawlDenialError
```

**Purpose:** Provides structured, serializable error classes for distributed systems

#### Similarities

Both services handle errors in web scraping/crawling contexts:

1. **HTTP Status Handling**
   - Both need to interpret and handle HTTP response codes
   - Both translate technical errors to user-friendly messages
   
2. **Error Context**
   - Both services deal with network requests
   - Both need timeout handling
   - Both handle SSL/TLS errors

3. **Error Propagation**
   - Both services need to communicate errors to clients
   - Both need structured error responses

#### Differences

1. **Complexity Level**
   - Playwright: Simple status code mapping
   - Firecrawl: Complex error hierarchy with serialization

2. **Error Types**
   - Playwright: HTTP-focused
   - Firecrawl: Domain-specific (scraping, crawling, mapping)

3. **Transport Requirements**
   - Playwright: Direct API responses
   - Firecrawl: Queue-based, needs serialization

#### Recommendation

Create a layered shared error library (`libs/ai/error-handling`):

```
libs/ai/error-handling/
├── src/
│   ├── http/
│   │   ├── status-codes.ts       # Shared HTTP status mappings
│   │   └── http-errors.ts        # HTTP-specific error classes
│   ├── base/
│   │   ├── transportable.ts      # Base serializable error
│   │   └── error-factory.ts      # Error creation utilities
│   └── index.ts
```

**Benefits:**
1. Single source of truth for HTTP status codes
2. Reusable error serialization logic
3. Consistent error handling patterns
4. Easier testing and maintenance

**Migration Path:**
1. Extract common HTTP status code mappings
2. Create base `TransportableError` class
3. Migrate playwright-service to use shared HTTP utilities
4. Extend firecrawl-api to use base classes while keeping domain-specific errors

---

### 3. Additional Patterns Identified

#### A. Next.js Type Definitions

**File:** `next-env.d.ts` (appears in all 4 services)

All services have identical Next.js type definition files. These are auto-generated by Next.js and shouldn't be duplicated.

#### B. Configuration Pattern

All services follow the same configuration pattern:
- Environment-based configuration
- TypeScript strict mode
- NX workspace integration
- Standalone output mode

This suggests a need for:
1. Shared configuration presets
2. Configuration generators
3. Standard environment variable patterns

---

## Recommended Action Items

### Priority 1: High Impact (Do First)

1. **Create Shared Next.js Application Base**
   - **Location:** `libs/ai/next-app-base`
   - **Contents:**
     - Base layout component with configurable title
     - Base page component with configurable content
     - Shared tsconfig preset
     - Shared Next.js config factory
     - NX generator for new AI services
   - **Impact:** Eliminates 32 duplicate files, prevents future duplication

2. **Create Shared Error Handling Library**
   - **Location:** `libs/ai/error-handling`
   - **Contents:**
     - HTTP status code utilities
     - Base error classes
     - Serialization utilities
   - **Impact:** Improves consistency, reduces duplicate error handling

### Priority 2: Medium Impact

3. **Create AI Service Generator**
   - **Tool:** NX Generator/Schematic
   - **Purpose:** Scaffold new AI services with consistent structure
   - **Benefits:** 
     - Enforces patterns
     - Reduces setup time
     - Ensures consistency

4. **Document Configuration Patterns**
   - Create ADR (Architecture Decision Record)
   - Document standard patterns
   - Create configuration guide

### Priority 3: Low Impact (Future Improvements)

5. **Consider Service Consolidation**
   - Evaluate if `analytics`, `chat`, `models`, `training` need to be separate apps
   - Could they be routes in a single Next.js application?
   - Could they be feature libraries instead?

6. **Standardize Development Patterns**
   - Shared linting configurations
   - Shared testing utilities
   - Shared build optimizations

---

## Metrics

### Current State
- **Total files analyzed:** ~350 files
- **Duplicate configuration files:** 24 files (6 files × 4 services)
- **Duplicate source files:** 8 files (2 files × 4 services)
- **Maintainability cost:** Changes require 4× effort

### After Consolidation (Projected)
- **Duplicate configuration files:** 0
- **Duplicate source files:** 0
- **Maintainability cost:** Single source of truth
- **New service creation time:** Reduced from ~1 hour to ~5 minutes

---

## Existing Infrastructure

The repository already has a well-organized library structure:

```
libs/
├── ai/
│   ├── agent-dapr
│   ├── agent-interface
│   ├── data-access
│   ├── feature
│   ├── integration-adapters
│   ├── ui              # Already has shared UI components!
│   └── workflow-agent-types
└── shared/
    ├── ui
    └── utils
```

**Key Observation:** The `libs/ai/ui` library already exists and contains shared AI UI components. The four duplicate Next.js apps should leverage these existing libraries more effectively.

---

## Additional Investigation: Are the 4 Services Placeholders?

### Background
After creating shared libraries, investigation was needed to determine if `analytics`, `chat`, `models`, and `training` are actual placeholders that should be removed, or if they represent real AI capabilities needed by the migrated projects.

### Findings

#### Real AI Capabilities in Migrated Projects

**1. n8n - AI Workflow Builder**
- **Location:** `features/n8n/packages/@n8n/ai-workflow-builder.ee/`
- **Technologies:** LangChain, LangGraph, Anthropic Claude
- **Capabilities:**
  - AI-powered workflow generation
  - LLM-based code generation (uses `gpt-4.1-mini`, Claude models)
  - AI agents for automation building
  - Evaluation chains using LangChain
  - Test case generation
  - Pairwise evaluation
- **Key Files:**
  - `ai-workflow-builder-agent.service.ts` - Main AI agent service
  - `workflow-builder-agent.ts` - Workflow construction agent
  - Multiple evaluator chains using `BaseChatModel` from LangChain

**2. Firecrawl - LLM Extract & Content Processing**
- **Location:** `features/firecrawl/apps/api/src/lib/extract/`
- **Technologies:** Vercel AI SDK, Various LLM providers
- **Capabilities:**
  - LLM-powered content extraction from scraped pages
  - Schema-based data extraction using LLMs
  - Token usage tracking and cost calculation
  - Support for multiple models (GPT-4, Claude, Gemini, etc.)
- **Key Files:**
  - `llmExtract-f0.ts` - LLM extraction implementation
  - `model-prices.ts` - Model pricing and limits configuration
  - `llm-cost.ts` - Cost calculation utilities

**3. Goose - AI Agent System**
- **Location:** `features/goose/crates/goose/src/`
- **Technologies:** Rust-based model handling, multiple LLM providers
- **Capabilities:**
  - AI agent orchestration
  - Model abstraction layer
  - Support for 50+ different AI models (GPT, Claude, Gemini, etc.)
  - Context window management
  - Agent scheduling and execution
- **Key Files:**
  - `model.rs` - Model configuration and limits
  - `agents/agent.rs` - Main agent implementation
  - `scheduler_trait.rs` - Agent scheduling

### Analysis: What AI Services Are Actually Needed?

Based on the investigation, here are the **actual AI capabilities** that exist:

#### 1. **Chat/Conversational AI** ✅ EXISTS
- **Where:** n8n AI workflow builder, Goose agents
- **Evidence:** 
  - n8n uses `BaseChatModel` from LangChain extensively
  - Chat-based workflow generation
  - Interactive AI agents in Goose
- **Potential Service:** `apps/ai/chat` could be refactored to provide a unified chat interface for these systems

#### 2. **Model Management** ✅ EXISTS
- **Where:** All three projects
- **Evidence:**
  - Firecrawl: `model-prices.ts` with 100+ model configurations
  - Goose: `model.rs` with 50+ model definitions and context limits
  - n8n: LLM configuration in `llm-config.ts`
- **Potential Service:** `apps/ai/models` could provide a centralized model registry, pricing, and configuration service

#### 3. **Analytics/Monitoring** ⚠️ PARTIALLY EXISTS
- **Where:** Firecrawl (token usage), n8n (LangSmith tracing)
- **Evidence:**
  - Firecrawl tracks token usage and costs
  - n8n uses LangChain tracers for debugging
  - No centralized analytics dashboard
- **Potential Service:** `apps/ai/analytics` could provide:
  - Centralized LLM usage tracking
  - Cost monitoring across all services
  - Performance analytics for AI operations

#### 4. **Training/Fine-tuning** ❌ DOES NOT EXIST
- **Where:** None found
- **Evidence:** No training pipelines, fine-tuning code, or model training found in any migrated project
- **Recommendation:** `apps/ai/training` appears to be a placeholder with no current use case and **should be removed**

### Recommendation: Refactor vs Remove

#### REMOVE:
- ✅ **`apps/ai/training`** - No evidence of training/fine-tuning capabilities needed

#### REFACTOR (Convert to Real Services):
These services should be converted from empty placeholders to actual services:

1. **`apps/ai/models`** → **Model Registry Service**
   - Centralized model configuration
   - Pricing information
   - Context window limits
   - Provider abstraction
   - Consolidate model configs from Firecrawl, Goose, n8n

2. **`apps/ai/chat`** → **Unified Chat/LLM Interface Service**
   - Common chat API for all AI services
   - Abstraction over LangChain, Vercel AI SDK, etc.
   - Request/response logging
   - Rate limiting

3. **`apps/ai/analytics`** → **AI Operations Analytics Dashboard**
   - LLM usage tracking
   - Cost monitoring
   - Performance metrics
   - Token usage visualization

### Specific Code to Consolidate

#### Model Configuration (Found in 3 places)
```typescript
// From firecrawl/apps/api/src/lib/extract/usage/model-prices.ts
export const modelPrices: { [key: string]: ModelPrice } = {
  "gpt-4o": { max_tokens: 128000, ... },
  "claude-3-5-sonnet": { max_tokens: 200000, ... },
  // 100+ more models
}

// From goose/crates/goose/src/model.rs
static MODEL_SPECIFIC_LIMITS: Lazy<Vec<(&'static str, usize)>> = Lazy::new(|| {
    vec![
        ("gpt-5", 272_000),
        ("claude", 200_000),
        // 50+ more models
    ]
});

// From n8n
export const anthropicClaudeSonnet45 = () => new ChatAnthropic({ model: "claude-3-5-sonnet-20241022" });
```
**→ Should be consolidated into `libs/ai/model-registry` or `apps/ai/models`**

#### LLM Cost Tracking (Found in 2 places)
```typescript
// From firecrawl/apps/api/src/lib/extract/usage/llm-cost.ts
export function calculateLLMCost(usage: TokenUsage, model: string): number

// From n8n tracking
// Token usage is tracked but cost calculation is not centralized
```
**→ Should be consolidated into shared analytics service**

## Updated Conclusion

The analysis reveals:

1. **Next.js Application Boilerplate** - Near-total duplication across 4 services ✅ ADDRESSED
   - Created `libs/ai/next-app-base` shared library

2. **Error Handling Utilities** - Common patterns across multiple services ✅ ADDRESSED
   - Created `libs/ai/error-handling` shared library

3. **Configuration Management** - Identical configs ✅ ADDRESSED
   - Shared configs in base libraries

4. **AI Services** - **New Discovery:**
   - 🗑️ **Remove:** `apps/ai/training` (not needed)
   - 🔧 **Refactor:** `apps/ai/models` → Model Registry Service
   - 🔧 **Refactor:** `apps/ai/chat` → Unified Chat/LLM Service
   - 🔧 **Refactor:** `apps/ai/analytics` → AI Operations Dashboard

5. **Model Configuration Duplication** - **New Discovery:**
   - Model configs duplicated across Firecrawl, Goose, and n8n
   - Should create `libs/ai/model-registry` to consolidate

### Next Steps

Priority 1 (Completed):
- ✅ Create shared Next.js base library
- ✅ Create shared error handling library

Priority 2 (Recommended):
- 🗑️ Remove `apps/ai/training` service
- 📝 Create `libs/ai/model-registry` library
  - Consolidate model configurations from all 3 projects
  - Include pricing, limits, and capabilities
- 🔧 Refactor `apps/ai/models` to use the model registry
- 🔧 Refactor `apps/ai/chat` to provide unified LLM interface
- 🔧 Refactor `apps/ai/analytics` to track AI operations

Priority 3:
- Update Firecrawl, Goose, and n8n to use centralized services
- Create migration guides for each project
