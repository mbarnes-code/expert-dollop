/**
 * User settings schema.
 */
import { z } from 'zod';

export const userSettingsSchema = z
  .object({
    isOnboarded: z.boolean().optional(),
    showUserActivationSurvey: z.boolean().optional(),
    firstSuccessfulWorkflowId: z.string().optional(),
    userActivated: z.boolean().optional(),
    npsSurvey: z
      .object({
        responded: z.boolean(),
        lastShownAt: z.number().optional(),
      })
      .optional(),
  })
  .passthrough();

export type UserSettings = z.infer<typeof userSettingsSchema>;
