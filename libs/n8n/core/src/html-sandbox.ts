/**
 * @fileoverview HTML Sandbox utilities for safe content handling
 * @module @expert-dollop/n8n-core
 */

/**
 * Default allowed HTML tags for sanitization
 */
export const ALLOWED_TAGS = new Set([
  'a', 'abbr', 'b', 'blockquote', 'br', 'code', 'div', 'em', 'h1', 'h2', 'h3',
  'h4', 'h5', 'h6', 'hr', 'i', 'li', 'ol', 'p', 'pre', 'span', 'strong', 'table',
  'tbody', 'td', 'th', 'thead', 'tr', 'u', 'ul',
]);

/**
 * Allowed attributes per tag
 */
export const ALLOWED_ATTRIBUTES: Record<string, Set<string>> = {
  a: new Set(['href', 'target', 'rel']),
  '*': new Set(['class', 'id', 'style']),
};

/**
 * Sanitizes HTML content by removing potentially dangerous elements
 */
export function sanitizeHtml(html: string): string {
  // Basic sanitization - in production use a proper library like DOMPurify
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/javascript:/gi, '');
}

/**
 * Escapes HTML entities
 */
export function escapeHtml(text: string): string {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  
  return text.replace(/[&<>"']/g, char => htmlEntities[char] || char);
}

/**
 * Unescapes HTML entities
 */
export function unescapeHtml(text: string): string {
  const htmlEntities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&#x27;': "'",
    '&#x2F;': '/',
  };
  
  return text.replace(/&(?:amp|lt|gt|quot|#39|#x27|#x2F);/g, entity => 
    htmlEntities[entity] || entity
  );
}

/**
 * Strips HTML tags from content
 */
export function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

/**
 * Checks if a URL is safe (not javascript: or data:)
 */
export function isSafeUrl(url: string): boolean {
  const trimmed = url.trim().toLowerCase();
  return !trimmed.startsWith('javascript:') && !trimmed.startsWith('data:');
}
