/**
 * Project schema definitions.
 */
import { z } from 'zod';

export const projectNameSchema = z.string().min(1).max(255);

export const projectTypeSchema = z.enum(['personal', 'team']);
export type ProjectType = z.infer<typeof projectTypeSchema>;

export const projectIconSchema = z.object({
  type: z.enum(['emoji', 'icon']),
  value: z.string().min(1),
});
export type ProjectIcon = z.infer<typeof projectIconSchema>;

export const projectDescriptionSchema = z.string().max(512);

/** Project role schema - defines available roles for project members */
export const assignableProjectRoleSchema = z.enum([
  'project:viewer',
  'project:editor',
  'project:admin',
]);

export const projectRelationSchema = z.object({
  userId: z.string().min(1),
  role: assignableProjectRoleSchema,
});
export type ProjectRelation = z.infer<typeof projectRelationSchema>;
