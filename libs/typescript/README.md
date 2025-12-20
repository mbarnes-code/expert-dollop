# TypeScript Shared Libraries

Minimal shared TypeScript code used across multiple domains.

## Packages

- `common/` - Common utilities (logging, config, etc.)
- `ui-components/` - Shared UI components (only if used by 3+ frontends)
- `utils/` - Utility functions

## Usage

Each package is independently versioned and can be imported by modules:

```typescript
import { logger } from '@expert-dollop/typescript-common';
```
