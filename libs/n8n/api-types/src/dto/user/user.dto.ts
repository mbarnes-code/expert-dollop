/**
 * User DTOs.
 */
import { z } from 'zod';

import { passwordSchema } from '../../schemas/password.schema';

export const passwordUpdateRequestSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: passwordSchema,
});

export type PasswordUpdateRequestDto = z.infer<typeof passwordUpdateRequestSchema>;

export const roleChangeRequestSchema = z.object({
  newRole: z.enum(['global:admin', 'global:member']),
});

export type RoleChangeRequestDto = z.infer<typeof roleChangeRequestSchema>;

export const settingsUpdateRequestSchema = z.object({
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
});

export type SettingsUpdateRequestDto = z.infer<typeof settingsUpdateRequestSchema>;

export const userUpdateRequestSchema = z.object({
  firstName: z.string().min(1).max(32).optional(),
  lastName: z.string().min(1).max(32).optional(),
  email: z.string().email().optional(),
});

export type UserUpdateRequestDto = z.infer<typeof userUpdateRequestSchema>;

export const usersListFilterSchema = z.object({
  role: z.enum(['global:admin', 'global:member', 'global:owner']).optional(),
  isOwner: z.boolean().optional(),
  isPending: z.boolean().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['firstName', 'lastName', 'email', 'createdAt', 'updatedAt']).optional(),
  sortDir: z.enum(['asc', 'desc']).optional(),
});

export type UsersListFilterDto = z.infer<typeof usersListFilterSchema>;

export const USERS_LIST_SORT_OPTIONS = [
  'firstName',
  'lastName',
  'email',
  'createdAt',
  'updatedAt',
] as const;

export type UsersListSortOptions = (typeof USERS_LIST_SORT_OPTIONS)[number];
