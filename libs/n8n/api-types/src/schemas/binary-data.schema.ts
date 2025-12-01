/**
 * Binary data schemas for file handling.
 */
import { z } from 'zod';

/**
 * MIME types that can be viewed directly in the browser.
 */
export const ViewableMimeTypes = [
  'image/',
  'video/',
  'audio/',
  'text/',
  'application/json',
  'application/pdf',
] as const;

export type ViewableMimeType = (typeof ViewableMimeTypes)[number];

/**
 * Schema for binary data metadata.
 */
export const binaryDataMetadataSchema = z.object({
  id: z.string(),
  fileName: z.string().optional(),
  mimeType: z.string().optional(),
  fileSize: z.number().optional(),
  fileExtension: z.string().optional(),
});

export type BinaryDataMetadata = z.infer<typeof binaryDataMetadataSchema>;
