/**
 * XSS validation constraint interface
 */
export interface XssValidatorConstraint {
  validate(value: unknown): boolean;
  defaultMessage(): string;
}

/**
 * URL Regex pattern for detecting URLs in strings
 */
const URL_REGEX = /^(https?:\/\/|www\.)|(\.[\p{L}\d-]+)/iu;

/**
 * Validates that a string does not contain XSS attacks.
 * Uses a whitelist approach - no HTML tags are allowed.
 * 
 * @param value - The string to validate
 * @returns true if the string is safe, false otherwise
 */
export function isXssSafe(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  
  // Simple XSS check - look for HTML tags
  const htmlTagPattern = /<[^>]*>/g;
  const scriptPattern = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
  const eventPattern = /\bon\w+\s*=/gi;
  
  return !htmlTagPattern.test(value) && 
         !scriptPattern.test(value) && 
         !eventPattern.test(value);
}

/**
 * Validates that a string does not contain a URL.
 * 
 * @param value - The string to validate
 * @returns true if the string does not contain a URL
 */
export function isUrlFree(value: string): boolean {
  return !URL_REGEX.test(value);
}

/**
 * NoXss validator decorator factory.
 * Creates a property decorator that validates the property does not contain XSS attacks.
 * 
 * Note: This is a simplified version. For full class-validator integration,
 * use the original @n8n/db package.
 * 
 * @param options - Validation options
 * @returns Property decorator
 */
export function NoXss(options?: { message?: string }) {
  return function (target: object, propertyName: string) {
    // Store validation metadata on the class
    const existingValidators = Reflect.getMetadata('validators', target.constructor) || [];
    existingValidators.push({
      propertyName,
      name: 'NoXss',
      validate: isXssSafe,
      message: options?.message || 'Potentially malicious string',
    });
    Reflect.defineMetadata('validators', existingValidators, target.constructor);
  };
}

/**
 * NoUrl validator decorator factory.
 * Creates a property decorator that validates the property does not contain URLs.
 * 
 * Note: This is a simplified version. For full class-validator integration,
 * use the original @n8n/db package.
 * 
 * @param options - Validation options
 * @returns Property decorator
 */
export function NoUrl(options?: { message?: string }) {
  return function (target: object, propertyName: string) {
    // Store validation metadata on the class
    const existingValidators = Reflect.getMetadata('validators', target.constructor) || [];
    existingValidators.push({
      propertyName,
      name: 'NoUrl',
      validate: isUrlFree,
      message: options?.message || 'Potentially malicious string',
    });
    Reflect.defineMetadata('validators', existingValidators, target.constructor);
  };
}
