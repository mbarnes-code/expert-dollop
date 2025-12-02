/**
 * Tests for execution helpers
 */

import {
  wrapData,
  wrapDataArray,
  extractJsonData,
  createEmptyOutput,
  createOutputAt,
  mergeOutputs,
  filterItems,
  transformItems,
  processInBatches,
  addPairedItem,
  addMultiplePairedItems,
  createErrorItem,
  handleContinueOnFail,
  getValueByPath,
  setValueByPath,
  removeEmptyValues,
  flattenItem,
  unflattenItem,
  validateRequiredFields,
  createFromApiResponse,
  type INodeExecutionData,
} from '../execution/execution-helpers';

describe('wrapData', () => {
  it('should wrap a single object', () => {
    const result = wrapData({ name: 'test' });
    expect(result).toEqual({ json: { name: 'test' } });
  });
});

describe('wrapDataArray', () => {
  it('should wrap an array of objects', () => {
    const result = wrapDataArray([{ name: 'test1' }, { name: 'test2' }]);
    expect(result).toEqual([
      { json: { name: 'test1' } },
      { json: { name: 'test2' } },
    ]);
  });
});

describe('extractJsonData', () => {
  it('should extract JSON data from items', () => {
    const items: INodeExecutionData[] = [
      { json: { name: 'test1' } },
      { json: { name: 'test2' } },
    ];
    const result = extractJsonData(items);
    expect(result).toEqual([{ name: 'test1' }, { name: 'test2' }]);
  });
});

describe('createEmptyOutput', () => {
  it('should create empty output arrays', () => {
    const result = createEmptyOutput(3);
    expect(result).toEqual([[], [], []]);
  });
});

describe('createOutputAt', () => {
  it('should create output with items at specific index', () => {
    const items: INodeExecutionData[] = [{ json: { name: 'test' } }];
    const result = createOutputAt(items, 1, 3);
    expect(result).toEqual([[], items, []]);
  });
});

describe('mergeOutputs', () => {
  it('should merge multiple outputs', () => {
    const output1: INodeExecutionData[][] = [[{ json: { a: 1 } }], []];
    const output2: INodeExecutionData[][] = [[{ json: { b: 2 } }], [{ json: { c: 3 } }]];
    
    const result = mergeOutputs(output1, output2);
    
    expect(result[0]).toHaveLength(2);
    expect(result[1]).toHaveLength(1);
  });

  it('should handle empty outputs', () => {
    const result = mergeOutputs();
    expect(result).toEqual([[]]);
  });
});

describe('filterItems', () => {
  it('should filter items based on predicate', () => {
    const items: INodeExecutionData[] = [
      { json: { value: 1 } },
      { json: { value: 2 } },
      { json: { value: 3 } },
    ];
    
    const result = filterItems(items, item => (item.json.value as number) > 1);
    
    expect(result).toHaveLength(2);
    expect(result[0].json.value).toBe(2);
  });
});

describe('transformItems', () => {
  it('should transform items using async mapper', async () => {
    const items: INodeExecutionData[] = [
      { json: { value: 1 } },
      { json: { value: 2 } },
    ];
    
    const result = await transformItems(items, async (item) => {
      return (item.json.value as number) * 2;
    });
    
    expect(result).toEqual([2, 4]);
  });
});

describe('processInBatches', () => {
  it('should process items in batches', async () => {
    const items: INodeExecutionData[] = Array.from({ length: 5 }, (_, i) => ({
      json: { value: i },
    }));
    
    const batchIndices: number[] = [];
    const result = await processInBatches(items, 2, async (batch, batchIndex) => {
      batchIndices.push(batchIndex);
      return batch.map(item => item.json.value as number);
    });
    
    expect(result).toEqual([0, 1, 2, 3, 4]);
    expect(batchIndices).toEqual([0, 1, 2]);
  });
});

describe('addPairedItem', () => {
  it('should add paired item reference', () => {
    const item: INodeExecutionData = { json: { name: 'test' } };
    const result = addPairedItem(item, 5);
    
    expect(result.pairedItem).toEqual({ item: 5 });
  });
});

describe('addMultiplePairedItems', () => {
  it('should add multiple paired item references', () => {
    const item: INodeExecutionData = { json: { name: 'test' } };
    const result = addMultiplePairedItems(item, [1, 2, 3]);
    
    expect(result.pairedItem).toEqual([{ item: 1 }, { item: 2 }, { item: 3 }]);
  });
});

describe('createErrorItem', () => {
  it('should create error item with original data', () => {
    const error = new Error('Test error');
    const original: INodeExecutionData = { json: { name: 'test' } };
    
    const result = createErrorItem(error, original);
    
    expect(result.json).toEqual({ name: 'test' });
    expect(result.error).toBe(error);
  });

  it('should create error item without original data', () => {
    const error = new Error('Test error');
    
    const result = createErrorItem(error);
    
    expect(result.json).toEqual({});
    expect(result.error).toBe(error);
  });
});

describe('handleContinueOnFail', () => {
  it('should throw error when disabled', () => {
    const error = new Error('Test error');
    const item: INodeExecutionData = { json: {} };
    
    expect(() => handleContinueOnFail(error, item, { enabled: false })).toThrow('Test error');
  });

  it('should return error item on main output', () => {
    const error = new Error('Test error');
    const item: INodeExecutionData = { json: { name: 'test' } };
    
    const result = handleContinueOnFail(error, item, { enabled: true });
    
    expect(result.success).not.toBeNull();
    expect(result.error).toBeNull();
    expect(result.success?.error).toBe(error);
  });

  it('should return error item on error output', () => {
    const error = new Error('Test error');
    const item: INodeExecutionData = { json: { name: 'test' } };
    
    const result = handleContinueOnFail(error, item, {
      enabled: true,
      errorOutput: 'errorOutput',
    });
    
    expect(result.success).toBeNull();
    expect(result.error).not.toBeNull();
    expect(result.error?.error).toBe(error);
  });
});

describe('getValueByPath', () => {
  it('should get value by dot-notation path', () => {
    const item: INodeExecutionData = {
      json: { user: { name: { first: 'John' } } },
    };
    
    const result = getValueByPath(item, 'user.name.first');
    expect(result).toBe('John');
  });

  it('should return default value when path not found', () => {
    const item: INodeExecutionData = { json: {} };
    
    const result = getValueByPath(item, 'missing.path', 'default');
    expect(result).toBe('default');
  });
});

describe('setValueByPath', () => {
  it('should set value by dot-notation path', () => {
    const item: INodeExecutionData = { json: {} };
    
    const result = setValueByPath(item, 'user.name', 'John');
    expect(result.json).toEqual({ user: { name: 'John' } });
  });

  it('should preserve existing values', () => {
    const item: INodeExecutionData = { json: { existing: 'value' } };
    
    const result = setValueByPath(item, 'new', 'value');
    expect(result.json).toEqual({ existing: 'value', new: 'value' });
  });
});

describe('removeEmptyValues', () => {
  it('should remove null and undefined values', () => {
    const item: INodeExecutionData = {
      json: { a: 'value', b: null, c: undefined, d: 0 },
    };
    
    const result = removeEmptyValues(item);
    expect(result.json).toEqual({ a: 'value', d: 0 });
  });

  it('should handle nested objects', () => {
    const item: INodeExecutionData = {
      json: { outer: { inner: null, value: 'test' } },
    };
    
    const result = removeEmptyValues(item);
    expect(result.json).toEqual({ outer: { value: 'test' } });
  });
});

describe('flattenItem', () => {
  it('should flatten nested objects', () => {
    const item: INodeExecutionData = {
      json: { user: { name: 'John', address: { city: 'NYC' } } },
    };
    
    const result = flattenItem(item);
    expect(result.json).toEqual({
      'user.name': 'John',
      'user.address.city': 'NYC',
    });
  });

  it('should support custom separator', () => {
    const item: INodeExecutionData = {
      json: { user: { name: 'John' } },
    };
    
    const result = flattenItem(item, '_');
    expect(result.json).toEqual({ 'user_name': 'John' });
  });
});

describe('unflattenItem', () => {
  it('should unflatten keys to nested objects', () => {
    const item: INodeExecutionData = {
      json: { 'user.name': 'John', 'user.age': 30 },
    };
    
    const result = unflattenItem(item);
    expect(result.json).toEqual({ user: { name: 'John', age: 30 } });
  });
});

describe('validateRequiredFields', () => {
  it('should return valid for all fields present', () => {
    const item: INodeExecutionData = {
      json: { name: 'John', email: 'john@example.com' },
    };
    
    const result = validateRequiredFields(item, ['name', 'email']);
    expect(result.valid).toBe(true);
    expect(result.missingFields).toEqual([]);
  });

  it('should return missing fields', () => {
    const item: INodeExecutionData = {
      json: { name: 'John' },
    };
    
    const result = validateRequiredFields(item, ['name', 'email', 'phone']);
    expect(result.valid).toBe(false);
    expect(result.missingFields).toEqual(['email', 'phone']);
  });

  it('should consider empty strings as missing', () => {
    const item: INodeExecutionData = {
      json: { name: '' },
    };
    
    const result = validateRequiredFields(item, ['name']);
    expect(result.valid).toBe(false);
  });
});

describe('createFromApiResponse', () => {
  it('should wrap array response', () => {
    const response = [{ id: 1 }, { id: 2 }];
    
    const result = createFromApiResponse(response);
    expect(result).toHaveLength(2);
    expect(result[0].json).toEqual({ id: 1 });
  });

  it('should wrap object response', () => {
    const response = { id: 1, name: 'test' };
    
    const result = createFromApiResponse(response);
    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual({ id: 1, name: 'test' });
  });

  it('should extract data from path', () => {
    const response = { data: { items: [{ id: 1 }] } };
    
    const result = createFromApiResponse(response, 'data.items');
    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual({ id: 1 });
  });

  it('should handle primitive values', () => {
    const response = 'simple value';
    
    const result = createFromApiResponse(response);
    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual({ value: 'simple value' });
  });
});
