/**
 * QueryDSL Value Object
 * 
 * Represents an Elasticsearch Query DSL object.
 * Provides type-safe query construction.
 * 
 * Domain-Driven Design: Value Object
 * - Immutable
 * - Self-validating
 * - Replaceable
 */

export interface QueryDSLOptions {
  from?: number;
  size?: number;
  query?: Record<string, unknown>;
  sort?: Array<Record<string, unknown>>;
  _source?: string[] | boolean;
  aggs?: Record<string, unknown>;
}

export class QueryDSL {
  private readonly _query: QueryDSLOptions;

  private constructor(query: QueryDSLOptions) {
    this._query = query;
  }

  /**
   * Create QueryDSL from options
   * @throws Error if invalid query structure
   */
  static create(options: QueryDSLOptions): QueryDSL {
    // Validate pagination
    if (options.from !== undefined && options.from < 0) {
      throw new Error('Query "from" must be non-negative');
    }

    if (options.size !== undefined && (options.size < 0 || options.size > 10000)) {
      throw new Error('Query "size" must be between 0 and 10000');
    }

    return new QueryDSL(options);
  }

  /**
   * Create a simple match_all query
   */
  static matchAll(size: number = 10): QueryDSL {
    return QueryDSL.create({
      from: 0,
      size,
      query: {
        match_all: {}
      }
    });
  }

  /**
   * Create a wildcard query
   */
  static wildcard(field: string, value: string, options?: { from?: number; size?: number }): QueryDSL {
    return QueryDSL.create({
      from: options?.from ?? 0,
      size: options?.size ?? 10,
      query: {
        wildcard: {
          [field]: value
        }
      }
    });
  }

  /**
   * Create a bool query with must, should, filter
   */
  static bool(options: {
    must?: Array<Record<string, unknown>>;
    should?: Array<Record<string, unknown>>;
    filter?: Array<Record<string, unknown>> | Record<string, unknown>;
    must_not?: Array<Record<string, unknown>>;
    from?: number;
    size?: number;
  }): QueryDSL {
    return QueryDSL.create({
      from: options.from ?? 0,
      size: options.size ?? 10,
      query: {
        bool: {
          ...(options.must && { must: options.must }),
          ...(options.should && { should: options.should }),
          ...(options.filter && { filter: options.filter }),
          ...(options.must_not && { must_not: options.must_not })
        }
      }
    });
  }

  /**
   * Create a range query
   */
  static range(field: string, options: { gte?: string | number; lte?: string | number; gt?: string | number; lt?: string | number }): Record<string, unknown> {
    return {
      range: {
        [field]: options
      }
    };
  }

  get value(): QueryDSLOptions {
    return { ...this._query };
  }

  toJSON(): QueryDSLOptions {
    return this.value;
  }

  toString(): string {
    return JSON.stringify(this._query);
  }
}
