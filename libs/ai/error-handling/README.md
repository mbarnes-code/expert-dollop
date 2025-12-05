# ai-error-handling

Shared error handling utilities for AI services.

## Purpose

This library consolidates common error handling patterns across AI services, particularly for HTTP errors and distributed system errors that need to be serialized and transported across network boundaries or message queues.

## What's Included

### HTTP Error Utilities

- **HTTP_STATUS_MESSAGES**: Complete mapping of HTTP status codes to human-readable messages
- **getHttpError()**: Convert status codes to error messages
- **isHttpError()**: Check if a status code represents an error
- **isClientError()**: Check for 4xx errors
- **isServerError()**: Check for 5xx errors
- **isRedirect()**: Check for 3xx redirects

### Transportable Error Classes

Base classes for errors that can be serialized and sent across network/queue boundaries:

- **TransportableError**: Base class with serialization support
- **TimeoutError**: For timeout-related failures
- **UnknownError**: Wrapper for unknown/unexpected errors
- **NetworkError**: For network-related failures with status code and URL

### Helper Functions

- **ensureError()**: Ensure unknown value is an Error object
- **wrapError()**: Wrap unknown errors as TransportableError

## Usage Examples

### HTTP Error Handling

```typescript
import { getHttpError, isServerError } from '@expert-dollop/ai-error-handling';

const statusCode = 404;
const errorMessage = getHttpError(statusCode); // "Not Found"

if (isServerError(statusCode)) {
  // Handle server error
}
```

### Transportable Errors

```typescript
import {
  TransportableError,
  TimeoutError,
  NetworkError,
} from '@expert-dollop/ai-error-handling';

// Create a timeout error
const timeoutError = new TimeoutError('Request timed out', 30000);

// Serialize for transport (e.g., Redis queue)
const serialized = timeoutError.serialize();

// Later, deserialize
const deserialized = TimeoutError.deserialize(serialized);

// Network error with context
const networkError = new NetworkError(
  'Failed to fetch',
  503,
  'https://example.com'
);
```

### Error Wrapping

```typescript
import { wrapError, ensureError } from '@expert-dollop/ai-error-handling';

try {
  // Some operation
} catch (error) {
  // Ensure error is an Error object
  const err = ensureError(error);

  // Or wrap as transportable error
  const transportable = wrapError(error);
  // Can now be serialized and sent to queue
}
```

## Migration from Existing Services

### From playwright-service

The old `get_error.ts` function:

```typescript
// Old code
import { getError } from './helpers/get_error';
const error = getError(statusCode);
```

Becomes:

```typescript
// New code
import { getHttpError } from '@expert-dollop/ai-error-handling';
const error = getHttpError(statusCode);
```

### From firecrawl-api

The firecrawl-api can extend the base transportable error classes:

```typescript
import {
  TransportableError,
  SerializedError,
} from '@expert-dollop/ai-error-handling';

export class ScrapeJobTimeoutError extends TransportableError {
  constructor(message: string) {
    super(message);
  }
}
```

## Benefits

- **DRY Principle**: Single source of truth for HTTP error messages
- **Type Safety**: Full TypeScript support with proper types
- **Consistency**: All services use the same error handling patterns
- **Serialization**: Built-in support for distributed systems
- **Maintainability**: Updates propagate to all services
- **Extensibility**: Easy to extend with domain-specific errors

## Design Decisions

### Why Separate HTTP and Transportable Errors?

- **HTTP errors** are simple status code mappings (stateless)
- **Transportable errors** are complex, stateful objects that need serialization
- Separation allows services to use only what they need

### Why Not Use Standard Error?

Standard JavaScript `Error` objects:
- Cannot be easily serialized/deserialized
- Don't preserve stack traces across serialization
- Don't support typed error codes
- Don't work well with message queues (Redis, RabbitMQ, etc.)

### Compatibility with Existing Systems

This library is designed to be:
- **Compatible** with existing error handling in playwright-service and firecrawl-api
- **Extensible** for domain-specific error types
- **Minimal** to reduce migration effort

## Related

- See [CONSOLIDATION_ANALYSIS.md](../../CONSOLIDATION_ANALYSIS.md) for the analysis that led to this library
- Inspired by `apps/ai/playwright-service/helpers/get_error.ts`
- Inspired by `apps/ai/firecrawl-api/src/lib/error.ts`
- Part of the AI domain shared libraries (`libs/ai/*`)
