/**
 * String utility functions for n8n nodes.
 * Common string operations used across multiple nodes.
 */

/**
 * Capitalizes the first letter of a string.
 *
 * @param str The string to capitalize
 */
export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Unescape HTML entities back to their original characters.
 * Converts encoded entities like &amp;, &lt;, etc. back to &, <, etc.
 *
 * @param text The text with HTML entities to unescape
 */
export function unescapeHtml(text: string): string {
  if (!text) return '';
  return text.replace(/&amp;|&lt;|&gt;|&#39;|&quot;/g, (match) => {
    switch (match) {
      case '&amp;':
        return '&';
      case '&lt;':
        return '<';
      case '&gt;':
        return '>';
      case '&#39;':
        return "'";
      case '&quot;':
        return '"';
      default:
        return match;
    }
  });
}

/**
 * Escape HTML special characters to prevent XSS.
 * Converts <, >, &, ", ' to their HTML entity equivalents.
 *
 * @param text The text to escape
 */
export function escapeHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Formats a private key by removing unnecessary whitespace and adding line breaks.
 *
 * @param privateKey The private key to format
 * @param keyIsPublic Whether the key is a public key
 */
export function formatPrivateKey(privateKey: string, keyIsPublic = false): string {
  const regex = keyIsPublic ? /(PUBLIC KEY)/ : /(PRIVATE KEY|CERTIFICATE)/;

  if (!privateKey || /\n/.test(privateKey)) {
    return privateKey;
  }

  let formattedPrivateKey = '';
  const parts = privateKey.split('-----').filter((item) => item !== '');

  parts.forEach((part) => {
    if (regex.test(part)) {
      formattedPrivateKey += `-----${part}-----`;
    } else {
      const passRegex = /Proc-Type|DEK-Info/;
      if (passRegex.test(part)) {
        part = part.replace(/:\s+/g, ':');
        formattedPrivateKey += part.replace(/\\n/g, '\n').replace(/\s+/g, '\n');
      } else {
        formattedPrivateKey += part.replace(/\\n/g, '\n').replace(/\s+/g, '\n');
      }
    }
  });

  return formattedPrivateKey;
}

/**
 * Get resolvable expressions from a string.
 * Extracts {{...}} expressions.
 *
 * @param expression The expression string to parse
 */
export function getResolvables(expression: string): string[] {
  if (!expression) return [];

  const resolvables: string[] = [];
  const resolvableRegex = /({{[\s\S]*?}})/g;

  let match;
  while ((match = resolvableRegex.exec(expression)) !== null) {
    if (match[1]) {
      resolvables.push(match[1]);
    }
  }

  return resolvables;
}

/**
 * Sanitize a data path key by removing bracket notation.
 *
 * @param item The data object
 * @param key The key to sanitize
 */
export function sanitizeDataPathKey(
  item: Record<string, unknown>,
  key: string,
): string {
  if (item[key] !== undefined) {
    return key;
  }

  if (
    (key.startsWith("['") && key.endsWith("']")) ||
    (key.startsWith('["') && key.endsWith('"]'))
  ) {
    const cleanKey = key.slice(2, -2);
    if (item[cleanKey] !== undefined) {
      return cleanKey;
    }
  }

  return key;
}

/**
 * Remove trailing slash from a URL.
 *
 * @param url The URL to process
 */
export function removeTrailingSlash(url: string): string {
  if (url.endsWith('/')) {
    return url.slice(0, -1);
  }
  return url;
}

/**
 * Add trailing slash to a URL if not present.
 *
 * @param url The URL to process
 */
export function ensureTrailingSlash(url: string): string {
  if (!url.endsWith('/')) {
    return url + '/';
  }
  return url;
}

/**
 * Truncate a string to a maximum length, adding ellipsis if truncated.
 *
 * @param str The string to truncate
 * @param maxLength The maximum length
 * @param ellipsis The ellipsis string (default: '...')
 */
export function truncate(str: string, maxLength: number, ellipsis = '...'): string {
  if (!str || str.length <= maxLength) return str;
  return str.slice(0, maxLength - ellipsis.length) + ellipsis;
}

/**
 * Convert a string to snake_case.
 *
 * @param str The string to convert
 */
export function toSnakeCase(str: string): string {
  return str
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/^_/, '');
}

/**
 * Convert a string to camelCase.
 *
 * @param str The string to convert
 */
export function toCamelCase(str: string): string {
  return str.replace(/[-_](.)/g, (_, char) => char.toUpperCase());
}

/**
 * Convert a string to PascalCase.
 *
 * @param str The string to convert
 */
export function toPascalCase(str: string): string {
  const camel = toCamelCase(str);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}

/**
 * Convert a string to kebab-case.
 *
 * @param str The string to convert
 */
export function toKebabCase(str: string): string {
  return str
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .replace(/^-/, '')
    .replace(/_/g, '-');
}

/**
 * Generate a UTM campaign link.
 *
 * @param nodeType The node type
 * @param instanceId The instance ID
 */
export function createUtmCampaignLink(nodeType: string, instanceId?: string): string {
  return `https://n8n.io/?utm_source=n8n-internal&utm_medium=powered_by&utm_campaign=${encodeURIComponent(
    nodeType,
  )}${instanceId ? '_' + instanceId : ''}`;
}

/**
 * Parse a string as JSON, returning the original value if parsing fails.
 *
 * @param value The value to parse
 * @param errorMessage The error message if parsing fails
 */
export function parseJsonString<T>(value: string | T, errorMessage?: string): T {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T;
    } catch {
      if (errorMessage) {
        throw new Error(errorMessage);
      }
      return value as unknown as T;
    }
  }
  return value;
}

/**
 * Check if a string is valid JSON.
 *
 * @param str The string to check
 */
export function isValidJson(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

/**
 * Generate a random string of specified length.
 *
 * @param length The length of the string
 * @param charset The character set to use
 */
export function randomString(
  length: number,
  charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
}

/**
 * Interpolate variables in a template string.
 *
 * @param template The template string
 * @param variables The variables to interpolate
 */
export function interpolate(
  template: string,
  variables: Record<string, string | number>,
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) =>
    String(variables[key] ?? ''),
  );
}
