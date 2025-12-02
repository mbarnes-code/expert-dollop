/**
 * Workflows DTOs.
 */
import { z } from 'zod';

export const importWorkflowFromUrlSchema = z.object({
  url: z.string().url(),
});

export type ImportWorkflowFromUrlDto = z.infer<typeof importWorkflowFromUrlSchema>;

export const transferWorkflowBodySchema = z.object({
  destinationProjectId: z.string(),
});

export type TransferWorkflowBodyDto = z.infer<typeof transferWorkflowBodySchema>;
