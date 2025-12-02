/**
 * Binary data utility functions for n8n nodes.
 * Common binary data operations used across multiple nodes.
 */

import type { IBinaryData, INodeExecutionData } from './workflow-utils';

/**
 * Binary file metadata interface.
 */
export interface IBinaryFileMetadata {
  fileName: string;
  mimeType: string;
  fileSize?: number;
  fileExtension?: string;
  directory?: string;
}

/**
 * Prepare binary data from a buffer.
 *
 * @param buffer The buffer containing the binary data
 * @param metadata The file metadata
 */
export function prepareBinaryData(
  buffer: Buffer,
  metadata: IBinaryFileMetadata,
): IBinaryData {
  return {
    data: buffer.toString('base64'),
    mimeType: metadata.mimeType,
    fileName: metadata.fileName,
    fileExtension: metadata.fileExtension || getFileExtension(metadata.fileName),
    fileSize: metadata.fileSize?.toString() || buffer.length.toString(),
    directory: metadata.directory,
  };
}

/**
 * Get file extension from a filename.
 *
 * @param fileName The filename to extract extension from
 */
export function getFileExtension(fileName: string): string {
  const parts = fileName.split('.');
  if (parts.length > 1) {
    return parts[parts.length - 1].toLowerCase();
  }
  return '';
}

/**
 * Get MIME type from file extension.
 *
 * @param extension The file extension
 */
export function getMimeTypeFromExtension(extension: string): string {
  const mimeTypes: Record<string, string> = {
    // Documents
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    txt: 'text/plain',
    csv: 'text/csv',
    rtf: 'application/rtf',

    // Images
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    bmp: 'image/bmp',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    ico: 'image/x-icon',

    // Audio
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    ogg: 'audio/ogg',
    m4a: 'audio/mp4',
    flac: 'audio/flac',

    // Video
    mp4: 'video/mp4',
    webm: 'video/webm',
    avi: 'video/x-msvideo',
    mov: 'video/quicktime',
    mkv: 'video/x-matroska',

    // Archives
    zip: 'application/zip',
    rar: 'application/x-rar-compressed',
    '7z': 'application/x-7z-compressed',
    tar: 'application/x-tar',
    gz: 'application/gzip',

    // Data
    json: 'application/json',
    xml: 'application/xml',
    html: 'text/html',
    css: 'text/css',
    js: 'application/javascript',
    ts: 'application/typescript',

    // Other
    eml: 'message/rfc822',
    ics: 'text/calendar',
  };

  return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
}

/**
 * Get file extension from MIME type.
 *
 * @param mimeType The MIME type
 */
export function getExtensionFromMimeType(mimeType: string): string {
  const extensions: Record<string, string> = {
    'application/pdf': 'pdf',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/vnd.ms-excel': 'xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
    'text/plain': 'txt',
    'text/csv': 'csv',
    'text/html': 'html',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/svg+xml': 'svg',
    'audio/mpeg': 'mp3',
    'video/mp4': 'mp4',
    'application/json': 'json',
    'application/xml': 'xml',
    'application/zip': 'zip',
  };

  return extensions[mimeType] || 'bin';
}

/**
 * Check if a MIME type is an image type.
 *
 * @param mimeType The MIME type to check
 */
export function isImageMimeType(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

/**
 * Check if a MIME type is a text type.
 *
 * @param mimeType The MIME type to check
 */
export function isTextMimeType(mimeType: string): boolean {
  return (
    mimeType.startsWith('text/') ||
    mimeType === 'application/json' ||
    mimeType === 'application/xml' ||
    mimeType === 'application/javascript'
  );
}

/**
 * Extract binary data buffer from execution data.
 *
 * @param binaryData The binary data object
 */
export function getBinaryDataBuffer(binaryData: IBinaryData): Buffer {
  return Buffer.from(binaryData.data, 'base64');
}

/**
 * Set binary data on execution data item.
 *
 * @param item The execution data item
 * @param propertyName The property name for the binary data
 * @param binaryData The binary data to set
 */
export function setBinaryData(
  item: INodeExecutionData,
  propertyName: string,
  binaryData: IBinaryData,
): INodeExecutionData {
  if (!item.binary) {
    item.binary = {};
  }
  item.binary[propertyName] = binaryData;
  return item;
}

/**
 * Check if an item has binary data for a specific property.
 *
 * @param item The execution data item
 * @param propertyName The property name to check
 */
export function hasBinaryData(
  item: INodeExecutionData,
  propertyName: string,
): boolean {
  return !!(item.binary && item.binary[propertyName]);
}

/**
 * Get all binary property names from an item.
 *
 * @param item The execution data item
 */
export function getBinaryPropertyNames(item: INodeExecutionData): string[] {
  if (!item.binary) {
    return [];
  }
  return Object.keys(item.binary);
}

/**
 * Create binary data from a string with specified encoding.
 *
 * @param data The string data
 * @param encoding The encoding of the string
 * @param metadata The file metadata
 */
export function createBinaryDataFromString(
  data: string,
  encoding: BufferEncoding,
  metadata: IBinaryFileMetadata,
): IBinaryData {
  const buffer = Buffer.from(data, encoding);
  return prepareBinaryData(buffer, metadata);
}

/**
 * Merge binary data from multiple items.
 *
 * @param items The items containing binary data
 * @param propertyName The property name to merge
 */
export function mergeBinaryData(
  items: INodeExecutionData[],
  propertyName: string,
): Buffer {
  const buffers: Buffer[] = [];

  for (const item of items) {
    if (item.binary && item.binary[propertyName]) {
      buffers.push(getBinaryDataBuffer(item.binary[propertyName]));
    }
  }

  return Buffer.concat(buffers);
}

/**
 * Generate a unique filename for binary data.
 *
 * @param baseName The base name for the file
 * @param extension The file extension
 */
export function generateUniqueFileName(baseName: string, extension: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${baseName}_${timestamp}_${random}.${extension}`;
}
