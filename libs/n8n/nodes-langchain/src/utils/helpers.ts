/**
 * Helper utilities for LangChain node implementations
 */

/**
 * Checks if an object has specific methods, useful for type narrowing
 * @param obj - Object to check
 * @param methodNames - Names of methods to check for
 * @returns True if the object has all specified methods
 */
export function hasMethods<T>(
  obj: unknown,
  ...methodNames: Array<string | symbol>
): obj is T {
  return methodNames.every(
    (methodName) =>
      typeof obj === 'object' &&
      obj !== null &&
      methodName in obj &&
      typeof (obj as Record<string | symbol, unknown>)[methodName] === 'function',
  );
}

/**
 * Checks if a model is a chat model based on its namespace
 * @param model - Model to check
 * @returns True if the model is a chat model
 */
export function isChatModel(model: unknown): boolean {
  const namespace = (model as { lc_namespace?: string[] })?.lc_namespace ?? [];
  return namespace.includes('chat_models');
}

/**
 * Checks if a model is a tools instance based on its namespace
 * @param model - Model to check
 * @returns True if the model is a tools instance
 */
export function isToolsInstance(model: unknown): boolean {
  const namespace = (model as { lc_namespace?: string[] })?.lc_namespace ?? [];
  return namespace.includes('tools');
}

/**
 * Escapes single curly brackets to prevent template interpretation issues
 * Converts single { to {{ and single } to }}
 * @param text - Text to escape
 * @returns Escaped text or undefined if input was undefined
 */
export function escapeSingleCurlyBrackets(text?: string): string | undefined {
  if (text === undefined) return undefined;

  let result = text;

  result = result
    // First handle triple brackets to avoid interference with double brackets
    .replace(/(?<!{){{{(?!{)/g, '{{{{')
    .replace(/(?<!})}}}(?!})/g, '}}}}')
    // Then handle single brackets, but only if they're not part of double brackets
    // Convert single { to {{ if it's not already part of {{ or {{{
    .replace(/(?<!{){(?!{)/g, '{{')
    // Convert single } to }} if it's not already part of }} or }}}
    .replace(/(?<!})}(?!})/g, '}}');

  return result;
}

/**
 * Serializes chat history to a human-readable string format
 * @param chatHistory - Array of chat messages
 * @returns Serialized chat history string
 */
export function serializeChatHistory(
  chatHistory: Array<{ _getType: () => string; content: string | unknown }>
): string {
  return chatHistory
    .map((chatMessage) => {
      if (chatMessage._getType() === 'human') {
        return `Human: ${chatMessage.content}`;
      } else if (chatMessage._getType() === 'ai') {
        return `Assistant: ${chatMessage.content}`;
      } else {
        return `${chatMessage.content}`;
      }
    })
    .join('\n');
}

/**
 * Sometimes model output is wrapped in an additional object property.
 * This function unwraps the output if it is in the format { output: { output: { ... } } }
 * @param output - Output to unwrap
 * @returns Unwrapped output
 */
export function unwrapNestedOutput(
  output: Record<string, unknown>
): Record<string, unknown> {
  if (
    'output' in output &&
    Object.keys(output).length === 1 &&
    typeof output.output === 'object' &&
    output.output !== null &&
    'output' in output.output &&
    Object.keys(output.output).length === 1
  ) {
    return output.output as Record<string, unknown>;
  }

  return output;
}

/**
 * Detects if a text contains a character that repeats sequentially for a specified threshold.
 * This is used to prevent performance issues with tiktoken on highly repetitive content.
 * @param text - The text to check
 * @param threshold - The minimum number of sequential repeats to detect (default: 1000)
 * @returns true if a character repeats sequentially for at least the threshold amount
 */
export function hasLongSequentialRepeat(text: string, threshold = 1000): boolean {
  try {
    // Validate inputs
    if (
      text === null ||
      typeof text !== 'string' ||
      text.length === 0 ||
      threshold <= 0 ||
      text.length < threshold
    ) {
      return false;
    }
    
    // Use string iterator to avoid creating array copy (memory efficient)
    const iterator = text[Symbol.iterator]();
    let prev = iterator.next();

    if (prev.done) {
      return false;
    }

    let count = 1;
    for (const char of iterator) {
      if (char === prev.value) {
        count++;
        if (count >= threshold) {
          return true;
        }
      } else {
        count = 1;
        prev = { value: char, done: false };
      }
    }

    return false;
  } catch {
    // On any error, return false to allow normal processing
    return false;
  }
}

/**
 * Gets metadata filter values from execution context
 * @param options - Options object with metadata values
 * @returns Metadata filter object or undefined
 */
export function getMetadataFiltersValues(
  options: Record<string, unknown>
): Record<string, never> | undefined {
  if (options.metadata) {
    const { metadataValues: metadata } = options.metadata as {
      metadataValues: Array<{
        name: string;
        value: string;
      }>;
    };
    if (metadata && metadata.length > 0) {
      return metadata.reduce(
        (acc, { name, value }) => ({ ...acc, [name]: value }),
        {} as Record<string, never>
      );
    }
  }

  return undefined;
}

/**
 * Validates that a string is a valid JSON object
 * @param str - String to validate
 * @returns True if the string is valid JSON
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
 * Safely parses JSON with error handling
 * @param str - String to parse
 * @param fallback - Fallback value if parsing fails
 * @returns Parsed object or fallback
 */
export function safeJsonParse<T>(str: string, fallback: T): T {
  try {
    return JSON.parse(str) as T;
  } catch {
    return fallback;
  }
}

/**
 * Truncates text to a maximum length with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Generates a unique session ID
 * @returns Unique session ID
 */
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Extracts text content from various input formats
 * @param input - Input to extract text from
 * @returns Extracted text content
 */
export function extractTextContent(input: unknown): string {
  if (typeof input === 'string') {
    return input;
  }
  if (typeof input === 'object' && input !== null) {
    if ('content' in input && typeof (input as { content: unknown }).content === 'string') {
      return (input as { content: string }).content;
    }
    if ('text' in input && typeof (input as { text: unknown }).text === 'string') {
      return (input as { text: string }).text;
    }
    return JSON.stringify(input);
  }
  return String(input);
}
