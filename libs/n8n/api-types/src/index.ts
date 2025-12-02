/**
 * @expert-dollop/n8n-api-types
 *
 * API type definitions and DTOs for the n8n REST API.
 * Provides Zod schemas for request/response validation.
 *
 * ## Overview
 *
 * This package contains:
 * - DTOs (Data Transfer Objects) for API requests/responses
 * - Zod schemas for validation
 * - Push message types for WebSocket communication
 * - Scaling types for worker management
 *
 * ## Example Usage
 *
 * ```typescript
 * import {
 *   LoginRequestDto,
 *   CreateProjectDto,
 *   passwordSchema,
 *   User,
 * } from '@expert-dollop/n8n-api-types';
 *
 * // Validate login request
 * const loginData = loginRequestSchema.parse(requestBody);
 *
 * // Access user types
 * const user: User = await getUser(id);
 * ```
 */

// Date/time types
export type { Iso8601DateTimeString } from './datetime';

// DTOs
export * from './dto';

// Push message types
export * from './push';

// Scaling types
export type {
  ExecutionStatus,
  WorkflowExecuteMode,
  RunningJobSummary,
  WorkerStatus,
} from './scaling';

// User types
export type { MinimalUser } from './user';

// API key types
export type {
  ApiKey,
  ApiKeyWithRawValue,
  ApiKeyAudience,
  ApiKeyScope,
  UnixTimestamp,
} from './api-keys';

// Community node types
export type { CommunityNodeType, INodeTypeDescription } from './community-node-types';

// Schemas
export * from './schemas';
