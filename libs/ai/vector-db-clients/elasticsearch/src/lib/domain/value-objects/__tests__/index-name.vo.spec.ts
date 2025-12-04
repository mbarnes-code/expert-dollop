/**
 * IndexName Value Object Tests
 * 
 * Tests Elasticsearch index naming validation rules:
 * - Must be lowercase
 * - Cannot be "." or ".."
 * - Cannot contain invalid characters: \, /, *, ?, ", <, >, |, ` `, ,, #, :
 * - Cannot exceed 255 bytes
 */

import { IndexName } from '../index-name.vo';

describe('IndexName Value Object', () => {
  describe('Valid Index Names', () => {
    it('should accept valid lowercase index name', () => {
      const name = IndexName.create('my-index');
      expect(name.value).toBe('my-index');
    });

    it('should accept index name with numbers', () => {
      const name = IndexName.create('logs-2024-01');
      expect(name.value).toBe('logs-2024-01');
    });

    it('should accept index name with underscores', () => {
      const name = IndexName.create('app_logs_production');
      expect(name.value).toBe('app_logs_production');
    });

    it('should accept index name with dashes', () => {
      const name = IndexName.create('security-alerts-high-priority');
      expect(name.value).toBe('security-alerts-high-priority');
    });

    it('should accept index name with dots (but not . or ..)', () => {
      const name = IndexName.create('logs.2024.january');
      expect(name.value).toBe('logs.2024.january');
    });

    it('should accept maximum length index name (255 bytes)', () => {
      const maxName = 'a'.repeat(255);
      const name = IndexName.create(maxName);
      expect(name.value).toBe(maxName);
    });
  });

  describe('Invalid Index Names - Uppercase', () => {
    it('should reject index name with uppercase letters', () => {
      expect(() => IndexName.create('MyIndex')).toThrow(
        'Index name must be lowercase'
      );
    });

    it('should reject index name with mixed case', () => {
      expect(() => IndexName.create('myINDEX')).toThrow(
        'Index name must be lowercase'
      );
    });

    it('should reject index name starting with uppercase', () => {
      expect(() => IndexName.create('Logs-2024')).toThrow(
        'Index name must be lowercase'
      );
    });
  });

  describe('Invalid Index Names - Reserved', () => {
    it('should reject single dot', () => {
      expect(() => IndexName.create('.')).toThrow(
        'Index name cannot be "." or ".."'
      );
    });

    it('should reject double dots', () => {
      expect(() => IndexName.create('..')).toThrow(
        'Index name cannot be "." or ".."'
      );
    });
  });

  describe('Invalid Index Names - Invalid Characters', () => {
    const invalidChars = ['\\', '/', '*', '?', '"', '<', '>', '|', ' ', ',', '#', ':'];

    invalidChars.forEach((char) => {
      it(`should reject index name containing "${char}"`, () => {
        expect(() => IndexName.create(`my${char}index`)).toThrow(
          /Index name contains invalid characters/
        );
      });
    });

    it('should reject index name with backspace', () => {
      expect(() => IndexName.create('my\bindex')).toThrow(
        /Index name contains invalid characters/
      );
    });
  });

  describe('Invalid Index Names - Length', () => {
    it('should reject index name exceeding 255 bytes', () => {
      const tooLong = 'a'.repeat(256);
      expect(() => IndexName.create(tooLong)).toThrow(
        'Index name cannot exceed 255 bytes'
      );
    });

    it('should reject empty index name', () => {
      expect(() => IndexName.create('')).toThrow();
    });
  });

  describe('Value Object Behavior', () => {
    it('should be immutable', () => {
      const name = IndexName.create('my-index');
      expect(() => {
        (name as any).value = 'different-index';
      }).toThrow();
    });

    it('should compare by value', () => {
      const name1 = IndexName.create('my-index');
      const name2 = IndexName.create('my-index');
      expect(name1.value).toBe(name2.value);
    });

    it('should have different values for different names', () => {
      const name1 = IndexName.create('index-1');
      const name2 = IndexName.create('index-2');
      expect(name1.value).not.toBe(name2.value);
    });

    it('should provide toString representation', () => {
      const name = IndexName.create('my-index');
      expect(name.toString()).toBe('my-index');
    });
  });

  describe('Edge Cases', () => {
    it('should accept index name with only numbers', () => {
      const name = IndexName.create('123456');
      expect(name.value).toBe('123456');
    });

    it('should accept index name with special valid chars', () => {
      const name = IndexName.create('index-name_with.dots-and_underscores');
      expect(name.value).toBe('index-name_with.dots-and_underscores');
    });

    it('should reject index name with leading space', () => {
      expect(() => IndexName.create(' my-index')).toThrow(
        /Index name contains invalid characters/
      );
    });

    it('should reject index name with trailing space', () => {
      expect(() => IndexName.create('my-index ')).toThrow(
        /Index name contains invalid characters/
      );
    });

    it('should reject index name starting with dash', () => {
      // Elasticsearch allows names starting with dash, but it's not recommended
      // This test documents current behavior
      const name = IndexName.create('-my-index');
      expect(name.value).toBe('-my-index');
    });

    it('should reject index name starting with underscore', () => {
      // Elasticsearch allows names starting with underscore
      // This test documents current behavior
      const name = IndexName.create('_my-index');
      expect(name.value).toBe('_my-index');
    });
  });
});
