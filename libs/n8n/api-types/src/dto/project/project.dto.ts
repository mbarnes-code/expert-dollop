/**
 * Project DTOs.
 */
import { z } from 'zod';

import { projectNameSchema, projectIconSchema, projectRelationSchema } from '../../schemas/project.schema';

export const createProjectSchema = z.object({
  name: projectNameSchema,
  icon: projectIconSchema.optional(),
  uiContext: z.string().optional(),
});

export type CreateProjectDto = z.infer<typeof createProjectSchema>;

export const updateProjectSchema = z.object({
  name: projectNameSchema.optional(),
  icon: projectIconSchema.optional(),
});

export type UpdateProjectDto = z.infer<typeof updateProjectSchema>;

export const updateProjectWithRelationsSchema = updateProjectSchema.extend({
  relations: z.array(projectRelationSchema).optional(),
});

export type UpdateProjectWithRelationsDto = z.infer<typeof updateProjectWithRelationsSchema>;

export const deleteProjectSchema = z.object({
  transferId: z.string().optional(),
});

export type DeleteProjectDto = z.infer<typeof deleteProjectSchema>;

export const addUsersToProjectSchema = z.object({
  relations: z.array(projectRelationSchema),
});

export type AddUsersToProjectDto = z.infer<typeof addUsersToProjectSchema>;

export const changeUserRoleInProjectSchema = z.object({
  role: z.enum(['project:viewer', 'project:editor', 'project:admin']),
});

export type ChangeUserRoleInProject = z.infer<typeof changeUserRoleInProjectSchema>;
