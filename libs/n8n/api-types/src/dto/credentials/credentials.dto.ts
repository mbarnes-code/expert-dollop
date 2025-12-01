/**
 * Credentials DTOs.
 */
import { z } from 'zod';

export const createCredentialSchema = z.object({
  name: z.string().min(1).max(128),
  type: z.string().min(1),
  data: z.record(z.string(), z.unknown()),
});

export type CreateCredentialDto = z.infer<typeof createCredentialSchema>;

export const credentialsGetOneQuerySchema = z.object({
  includeData: z.enum(['true', 'false']).optional(),
});

export type CredentialsGetOneRequestQuery = z.infer<typeof credentialsGetOneQuerySchema>;

export const credentialsGetManyQuerySchema = z.object({
  filter: z.string().optional(),
  includeScopes: z.enum(['true', 'false']).optional(),
  includeData: z.enum(['true', 'false']).optional(),
});

export type CredentialsGetManyRequestQuery = z.infer<typeof credentialsGetManyQuerySchema>;

export const generateCredentialNameQuerySchema = z.object({
  type: z.string(),
});

export type GenerateCredentialNameRequestQuery = z.infer<typeof generateCredentialNameQuerySchema>;
