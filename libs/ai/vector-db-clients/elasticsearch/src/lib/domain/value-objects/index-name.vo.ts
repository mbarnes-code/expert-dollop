/**
 * IndexName Value Object
 * 
 * Represents a validated Elasticsearch index name.
 * Ensures index names follow Elasticsearch naming conventions.
 * 
 * Domain-Driven Design: Value Object
 * - Immutable
 * - Self-validating
 * - Replaceable
 */

export class IndexName {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  /**
   * Create IndexName from string
   * @throws Error if invalid index name
   */
  static create(value: string): IndexName {
    // Validate index name
    if (!value || value.trim().length === 0) {
      throw new Error('Index name cannot be empty');
    }

    // Elasticsearch index naming rules:
    // - Must be lowercase
    // - Cannot include \, /, *, ?, ", <, >, |, ` ` (space character), ,, #
    // - Cannot start with -, _, +
    // - Cannot be . or ..
    // - Cannot be longer than 255 bytes
    const trimmedValue = value.trim();

    if (trimmedValue === '.' || trimmedValue === '..') {
      throw new Error('Index name cannot be "." or ".."');
    }

    if (trimmedValue !== trimmedValue.toLowerCase()) {
      throw new Error('Index name must be lowercase');
    }

    if (/^[-_+]/.test(trimmedValue)) {
      throw new Error('Index name cannot start with -, _, or +');
    }

    if (/[\\/*?"<>|` ,#]/.test(trimmedValue)) {
      throw new Error('Index name contains invalid characters');
    }

    const byteLength = Buffer.byteLength(trimmedValue, 'utf8');
    if (byteLength > 255) {
      throw new Error('Index name cannot exceed 255 bytes');
    }

    return new IndexName(trimmedValue);
  }

  get value(): string {
    return this._value;
  }

  equals(other: IndexName): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
