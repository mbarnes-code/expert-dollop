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
 * Uses a blacklist approach - rejects strings containing HTML tags, script tags, or event handlers.
 * 
 * @param value - The string to validate
 * @returns true if the string is safe (no XSS patterns found), false otherwise
 */
export function isXssSafe(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  
  // Blacklist check - look for HTML tags, script tags, and event handlers
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
 * Validator metadata storage using WeakMap to avoid reflect-metadata dependency
 */
const validatorStorage = new WeakMap<object, Array<{
  propertyName: string;
  name: string;
  validate: (value: unknown) => boolean;
  message: string;
}>>();

/**
 * Get validators for a class
 */
export function getValidators(target: object): Array<{
  propertyName: string;
  name: string;
  validate: (value: unknown) => boolean;
  message: string;
}> {
  return validatorStorage.get(target) || [];
}

/**
 * NoXss validator decorator factory.
 * Creates a property decorator that validates the property does not contain XSS attacks.
 * 
 * Note: This is a simplified version. For full class-validator integration,
 * use the original @n8n/db package with class-validator.
 * 
 * @param options - Validation options
 * @returns Property decorator
 */
export function NoXss(options?: { message?: string }) {
  return function (target: object, propertyName: string) {
    const constructor = target.constructor;
    const existingValidators = validatorStorage.get(constructor) || [];
    existingValidators.push({
      propertyName,
      name: 'NoXss',
      validate: isXssSafe,
      message: options?.message || 'Potentially malicious string',
    });
    validatorStorage.set(constructor, existingValidators);
  };
}

/**
 * NoUrl validator decorator factory.
 * Creates a property decorator that validates the property does not contain URLs.
 * 
 * Note: This is a simplified version. For full class-validator integration,
 * use the original @n8n/db package with class-validator.
 * 
 * @param options - Validation options
 * @returns Property decorator
 */
export function NoUrl(options?: { message?: string }) {
  return function (target: object, propertyName: string) {
    const constructor = target.constructor;
    const existingValidators = validatorStorage.get(constructor) || [];
    existingValidators.push({
      propertyName,
      name: 'NoUrl',
      validate: isUrlFree,
      message: options?.message || 'Potentially malicious string',
    });
    validatorStorage.set(constructor, existingValidators);
  };
}
