/**
 * Banner name schema for UI dismissible banners.
 */
import { z } from 'zod';

/** Known banner names in the application */
export const bannerNameSchema = z.enum([
  'V1',
  'TRIAL',
  'TRIAL_OVER',
  'NON_PRODUCTION_LICENSE',
  'EMAIL_CONFIRMATION',
]);

export type BannerName = z.infer<typeof bannerNameSchema>;
