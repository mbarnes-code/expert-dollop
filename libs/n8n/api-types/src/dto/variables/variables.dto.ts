/**
 * Variables DTOs.
 */
import { z } from 'zod';

export const variableListRequestSchema = z.object({
  state: z.enum(['active', 'inactive', 'all']).optional(),
});

export type VariableListRequestDto = z.infer<typeof variableListRequestSchema>;

export const createVariableRequestSchema = z.object({
  key: z.string().min(1).max(50),
  value: z.string().max(255),
});

export type CreateVariableRequestDto = z.infer<typeof createVariableRequestSchema>;

export const updateVariableRequestSchema = z.object({
  key: z.string().min(1).max(50).optional(),
  value: z.string().max(255).optional(),
});

export type UpdateVariableRequestDto = z.infer<typeof updateVariableRequestSchema>;
