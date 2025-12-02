/**
 * Source controlled file schema definitions.
 */
import { z } from 'zod';

export const SOURCE_CONTROL_FILE_TYPE = {
  Workflow: 'workflow',
  Credential: 'credential',
  Variables: 'variables',
  Tags: 'tags',
  Folders: 'folders',
} as const;

export const SOURCE_CONTROL_FILE_STATUS = {
  New: 'new',
  Modified: 'modified',
  Deleted: 'deleted',
  Renamed: 'renamed',
  Conflicted: 'conflicted',
  Unknown: 'unknown',
  Ignored: 'ignored',
  Created: 'created',
} as const;

export const SOURCE_CONTROL_FILE_LOCATION = {
  Local: 'local',
  Remote: 'remote',
} as const;

export const sourceControlFileTypeSchema = z.enum([
  SOURCE_CONTROL_FILE_TYPE.Workflow,
  SOURCE_CONTROL_FILE_TYPE.Credential,
  SOURCE_CONTROL_FILE_TYPE.Variables,
  SOURCE_CONTROL_FILE_TYPE.Tags,
  SOURCE_CONTROL_FILE_TYPE.Folders,
]);

export const sourceControlFileStatusSchema = z.enum([
  SOURCE_CONTROL_FILE_STATUS.New,
  SOURCE_CONTROL_FILE_STATUS.Modified,
  SOURCE_CONTROL_FILE_STATUS.Deleted,
  SOURCE_CONTROL_FILE_STATUS.Renamed,
  SOURCE_CONTROL_FILE_STATUS.Conflicted,
  SOURCE_CONTROL_FILE_STATUS.Unknown,
  SOURCE_CONTROL_FILE_STATUS.Ignored,
  SOURCE_CONTROL_FILE_STATUS.Created,
]);

export const sourceControlFileLocationSchema = z.enum([
  SOURCE_CONTROL_FILE_LOCATION.Local,
  SOURCE_CONTROL_FILE_LOCATION.Remote,
]);

export const sourceControlledFileSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: sourceControlFileTypeSchema,
  status: sourceControlFileStatusSchema,
  location: sourceControlFileLocationSchema,
  conflict: z.boolean().optional(),
  updatedAt: z.string().optional(),
});

export type SourceControlledFile = z.infer<typeof sourceControlledFileSchema>;
