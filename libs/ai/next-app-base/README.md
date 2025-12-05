# ai-next-app-base

Shared Next.js application base components and configurations for AI services.

## Purpose

This library consolidates common Next.js application patterns used across AI services (`analytics`, `chat`, `models`, `training`). It eliminates code duplication and ensures consistency across all AI Next.js applications.

## What's Included

### Components

- **BaseLayout**: Shared root layout component
- **BasePage**: Shared home page component with customizable service name and message

### Configuration Utilities

- **createNextConfig()**: Factory function for standardized Next.js configuration
- **createMetadata()**: Helper for creating consistent page metadata
- **tsconfig.base.json**: Shared TypeScript configuration preset

## Usage

### 1. Using Shared Layout

```typescript
// apps/ai/[service]/src/app/layout.tsx
import { BaseLayout, createMetadata } from '@expert-dollop/ai-next-app-base';

export const metadata = createMetadata({
  title: 'ai-analytics',
  description: 'AI Analytics Service',
});

export default BaseLayout;
```

### 2. Using Shared Page Component

```typescript
// apps/ai/[service]/src/app/page.tsx
import { BasePage } from '@expert-dollop/ai-next-app-base';

export default function Home() {
  return <BasePage serviceName="ai-analytics" />;
}
```

### 3. Using Shared Next.js Config

```javascript
// apps/ai/[service]/next.config.mjs
import { createNextConfig } from '@expert-dollop/ai-next-app-base';

export default createNextConfig({
  // Optional: add service-specific packages
  additionalTranspilePackages: ['@some/package'],
});
```

### 4. Extending TypeScript Config

```json
// apps/ai/[service]/tsconfig.json
{
  "extends": "@expert-dollop/ai-next-app-base/tsconfig.base.json",
  "compilerOptions": {
    // Service-specific overrides if needed
  }
}
```

## Benefits

- **DRY Principle**: Eliminates duplicate code across 4+ services
- **Consistency**: Ensures all AI services follow the same patterns
- **Maintainability**: Changes to base components propagate to all services
- **Faster Development**: New services can be scaffolded quickly
- **Type Safety**: Shared TypeScript configurations ensure consistent type checking

## Customization

All components accept props for customization:

```typescript
// Custom metadata
createMetadata({
  title: 'My Custom Title',
  description: 'My custom description',
});

// Custom page content
<BasePage
  serviceName="ai-custom-service"
  welcomeMessage="Welcome to my custom AI service!"
/>
```

## Migration Guide

To migrate an existing AI service to use this library:

1. Install the library dependency (it's a workspace package)
2. Replace `layout.tsx` with the shared version
3. Replace `page.tsx` with the shared version
4. Update `next.config.mjs` to use `createNextConfig()`
5. Update `tsconfig.json` to extend the shared config
6. Remove duplicate configuration files

See `apps/ai/analytics`, `apps/ai/chat`, `apps/ai/models`, and `apps/ai/training` for examples of services using this library.

## Related

- See [CONSOLIDATION_ANALYSIS.md](../../CONSOLIDATION_ANALYSIS.md) for details on code duplication that led to this library
- Part of the AI domain shared libraries (`libs/ai/*`)
