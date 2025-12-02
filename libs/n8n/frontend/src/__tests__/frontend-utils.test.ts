/**
 * Tests for frontend utility functions
 */

import {
  truncate,
  slugify,
  capitalize,
  toTitleCase,
  escapeHtml,
  parseQueryString,
  buildQueryString,
  joinUrl,
  deepClone,
  deepMerge,
  pick,
  omit,
  isEmpty,
  unique,
  groupBy,
  sortBy,
  chunk,
  flatten,
  formatFileSize,
  formatDuration,
  uuid,
  shortId,
} from '../utils/frontend-utils';

describe('String utilities', () => {
  describe('truncate', () => {
    it('should not truncate short strings', () => {
      expect(truncate('hello', 10)).toBe('hello');
    });

    it('should truncate long strings with ellipsis', () => {
      expect(truncate('hello world', 8)).toBe('hello...');
    });

    it('should use custom ellipsis', () => {
      expect(truncate('hello world', 8, '…')).toBe('hello w…');
    });
  });

  describe('slugify', () => {
    it('should convert to lowercase', () => {
      expect(slugify('Hello World')).toBe('hello-world');
    });

    it('should remove special characters', () => {
      expect(slugify('Hello, World!')).toBe('hello-world');
    });

    it('should handle multiple spaces', () => {
      expect(slugify('Hello   World')).toBe('hello-world');
    });
  });

  describe('capitalize', () => {
    it('should capitalize first letter', () => {
      expect(capitalize('hello')).toBe('Hello');
    });

    it('should handle empty string', () => {
      expect(capitalize('')).toBe('');
    });
  });

  describe('toTitleCase', () => {
    it('should convert to title case', () => {
      expect(toTitleCase('hello world')).toBe('Hello World');
    });
  });

  describe('escapeHtml', () => {
    it('should escape HTML entities', () => {
      expect(escapeHtml('<script>alert("xss")</script>')).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
      );
    });
  });
});

describe('URL utilities', () => {
  describe('parseQueryString', () => {
    it('should parse query string', () => {
      expect(parseQueryString('foo=bar&baz=qux')).toEqual({
        foo: 'bar',
        baz: 'qux',
      });
    });
  });

  describe('buildQueryString', () => {
    it('should build query string', () => {
      expect(buildQueryString({ foo: 'bar', baz: 123 })).toBe('foo=bar&baz=123');
    });

    it('should skip undefined values', () => {
      expect(buildQueryString({ foo: 'bar', baz: undefined })).toBe('foo=bar');
    });
  });

  describe('joinUrl', () => {
    it('should join URL parts', () => {
      expect(joinUrl('https://example.com', 'api', 'users')).toBe(
        'https://example.com/api/users'
      );
    });

    it('should handle trailing slashes', () => {
      expect(joinUrl('https://example.com/', '/api/', '/users/')).toBe(
        'https://example.com/api/users'
      );
    });
  });
});

describe('Object utilities', () => {
  describe('deepClone', () => {
    it('should clone objects deeply', () => {
      const original = { a: { b: { c: 1 } } };
      const cloned = deepClone(original);
      
      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned.a).not.toBe(original.a);
    });

    it('should clone arrays', () => {
      const original = [1, [2, [3]]];
      const cloned = deepClone(original);
      
      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
    });

    it('should clone dates', () => {
      const original = new Date('2023-01-01');
      const cloned = deepClone(original);
      
      expect(cloned.getTime()).toBe(original.getTime());
      expect(cloned).not.toBe(original);
    });
  });

  describe('deepMerge', () => {
    it('should merge objects deeply', () => {
      const target = { a: { b: 1 }, c: 3 };
      const source = { a: { d: 2 }, e: 4 };
      
      expect(deepMerge(target, source)).toEqual({
        a: { b: 1, d: 2 },
        c: 3,
        e: 4,
      });
    });
  });

  describe('pick', () => {
    it('should pick specified keys', () => {
      const obj = { a: 1, b: 2, c: 3 };
      expect(pick(obj, ['a', 'c'])).toEqual({ a: 1, c: 3 });
    });
  });

  describe('omit', () => {
    it('should omit specified keys', () => {
      const obj = { a: 1, b: 2, c: 3 };
      expect(omit(obj, ['b'])).toEqual({ a: 1, c: 3 });
    });
  });

  describe('isEmpty', () => {
    it('should return true for empty objects', () => {
      expect(isEmpty({})).toBe(true);
    });

    it('should return false for non-empty objects', () => {
      expect(isEmpty({ a: 1 })).toBe(false);
    });
  });
});

describe('Array utilities', () => {
  describe('unique', () => {
    it('should remove duplicates', () => {
      expect(unique([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3]);
    });

    it('should use key function', () => {
      const items = [
        { id: 1, name: 'a' },
        { id: 2, name: 'b' },
        { id: 1, name: 'c' },
      ];
      expect(unique(items, item => item.id)).toEqual([
        { id: 1, name: 'a' },
        { id: 2, name: 'b' },
      ]);
    });
  });

  describe('groupBy', () => {
    it('should group by key', () => {
      const items = [
        { type: 'a', value: 1 },
        { type: 'b', value: 2 },
        { type: 'a', value: 3 },
      ];
      
      expect(groupBy(items, item => item.type)).toEqual({
        a: [{ type: 'a', value: 1 }, { type: 'a', value: 3 }],
        b: [{ type: 'b', value: 2 }],
      });
    });
  });

  describe('sortBy', () => {
    it('should sort ascending', () => {
      const items = [{ value: 3 }, { value: 1 }, { value: 2 }];
      expect(sortBy(items, item => item.value)).toEqual([
        { value: 1 },
        { value: 2 },
        { value: 3 },
      ]);
    });

    it('should sort descending', () => {
      const items = [{ value: 1 }, { value: 3 }, { value: 2 }];
      expect(sortBy(items, item => item.value, 'desc')).toEqual([
        { value: 3 },
        { value: 2 },
        { value: 1 },
      ]);
    });
  });

  describe('chunk', () => {
    it('should chunk array', () => {
      expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
    });
  });

  describe('flatten', () => {
    it('should flatten one level', () => {
      expect(flatten([[1, 2], [3, 4]])).toEqual([1, 2, 3, 4]);
    });

    it('should flatten with depth', () => {
      expect(flatten([[1, [2, [3]]]], 2)).toEqual([1, 2, [3]]);
    });
  });
});

describe('Format utilities', () => {
  describe('formatFileSize', () => {
    it('should format bytes', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1024 * 1024)).toBe('1 MB');
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB');
    });
  });

  describe('formatDuration', () => {
    it('should format seconds', () => {
      expect(formatDuration(5000)).toBe('5s');
    });

    it('should format minutes', () => {
      expect(formatDuration(65000)).toBe('1m 5s');
    });

    it('should format hours', () => {
      expect(formatDuration(3665000)).toBe('1h 1m');
    });
  });
});

describe('ID utilities', () => {
  describe('uuid', () => {
    it('should generate valid UUID v4', () => {
      const id = uuid();
      expect(id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
    });

    it('should generate unique IDs', () => {
      const ids = new Set(Array.from({ length: 100 }, () => uuid()));
      expect(ids.size).toBe(100);
    });
  });

  describe('shortId', () => {
    it('should generate ID of specified length', () => {
      expect(shortId(12).length).toBe(12);
      expect(shortId(6).length).toBe(6);
    });

    it('should generate alphanumeric IDs', () => {
      const id = shortId();
      expect(id).toMatch(/^[a-zA-Z0-9]+$/);
    });
  });
});
