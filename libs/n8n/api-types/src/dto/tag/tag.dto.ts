/**
 * Tag DTOs.
 */
import { z } from 'zod';

export const createOrUpdateTagRequestSchema = z.object({
  name: z.string().min(1).max(24),
});

export type CreateOrUpdateTagRequestDto = z.infer<typeof createOrUpdateTagRequestSchema>;

export const retrieveTagQuerySchema = z.object({
  withUsageCount: z.enum(['true', 'false']).optional(),
});

export type RetrieveTagQueryDto = z.infer<typeof retrieveTagQuerySchema>;
