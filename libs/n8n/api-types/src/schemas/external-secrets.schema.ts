/**
 * External secrets provider schema definitions.
 */
import { z } from 'zod';

export const externalSecretsProviderStateSchema = z.enum([
  'initializing',
  'connected',
  'error',
  'disconnected',
]);

export type ExternalSecretsProviderState = z.infer<typeof externalSecretsProviderStateSchema>;

export const externalSecretsProviderPropertySchema = z.object({
  name: z.string(),
  displayName: z.string(),
  type: z.enum(['string', 'number', 'boolean', 'select']),
  required: z.boolean().optional(),
  default: z.union([z.string(), z.number(), z.boolean()]).optional(),
  options: z
    .array(
      z.object({
        name: z.string(),
        value: z.union([z.string(), z.number(), z.boolean()]),
      }),
    )
    .optional(),
});

export type ExternalSecretsProviderProperty = z.infer<typeof externalSecretsProviderPropertySchema>;

export const externalSecretsProviderSecretSchema = z.object({
  key: z.string(),
});

export type ExternalSecretsProviderSecret = z.infer<typeof externalSecretsProviderSecretSchema>;

export const externalSecretsProviderDataSchema = z.record(
  z.string(),
  z.union([z.string(), z.number(), z.boolean()]),
);

export type ExternalSecretsProviderData = z.infer<typeof externalSecretsProviderDataSchema>;

export const externalSecretsProviderSchema = z.object({
  displayName: z.string(),
  name: z.string(),
  state: externalSecretsProviderStateSchema,
  connected: z.boolean(),
  connectedAt: z.string().nullable(),
  data: externalSecretsProviderDataSchema.optional(),
  properties: z.array(externalSecretsProviderPropertySchema).optional(),
});

export type ExternalSecretsProvider = z.infer<typeof externalSecretsProviderSchema>;
