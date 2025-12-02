/**
 * Usage state schema definitions.
 */
import { z } from 'zod';

export const usageStateSchema = z.object({
  executions: z.object({
    value: z.number(),
    limit: z.number(),
    warningThreshold: z.number(),
  }),
});

export type UsageState = z.infer<typeof usageStateSchema>;
