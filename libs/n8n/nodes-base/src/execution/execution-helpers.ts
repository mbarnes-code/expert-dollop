/**
 * Node execution helpers for n8n nodes.
 * Provides common patterns for node execution and data processing.
 */

/**
 * Node execution data item
 */
export interface INodeExecutionData {
  json: Record<string, unknown>;
  binary?: Record<string, unknown>;
  pairedItem?: { item: number } | Array<{ item: number }>;
  error?: Error;
}

/**
 * Node execution output
 */
export type NodeExecutionOutput = INodeExecutionData[][];

/**
 * Execution error interface
 */
export interface IExecutionError extends Error {
  node?: string;
  itemIndex?: number;
  context?: Record<string, unknown>;
  description?: string;
  httpCode?: string | number;
}

/**
 * Continue on fail options
 */
export interface IContinueOnFailOptions {
  enabled: boolean;
  errorOutput?: 'errorOutput' | 'mainOutput';
}

/**
 * Wrap a single data object in execution data format
 * @param data The data object
 */
export function wrapData(data: Record<string, unknown>): INodeExecutionData {
  return { json: data };
}

/**
 * Wrap multiple data objects in execution data format
 * @param data Array of data objects
 */
export function wrapDataArray(data: Array<Record<string, unknown>>): INodeExecutionData[] {
  return data.map(item => wrapData(item));
}

/**
 * Extract JSON data from execution data items
 * @param items Execution data items
 */
export function extractJsonData(items: INodeExecutionData[]): Array<Record<string, unknown>> {
  return items.map(item => item.json);
}

/**
 * Create an empty output with the specified number of outputs
 * @param outputCount Number of outputs
 */
export function createEmptyOutput(outputCount: number): NodeExecutionOutput {
  return Array.from({ length: outputCount }, () => []);
}

/**
 * Create output with items on a specific output index
 * @param items Items to output
 * @param outputIndex Index of the output
 * @param totalOutputs Total number of outputs
 */
export function createOutputAt(
  items: INodeExecutionData[],
  outputIndex: number,
  totalOutputs: number,
): NodeExecutionOutput {
  const output = createEmptyOutput(totalOutputs);
  output[outputIndex] = items;
  return output;
}

/**
 * Merge multiple execution outputs
 * @param outputs Array of outputs to merge
 */
export function mergeOutputs(...outputs: NodeExecutionOutput[]): NodeExecutionOutput {
  if (outputs.length === 0) return [[]];
  
  const maxOutputs = Math.max(...outputs.map(o => o.length));
  const result: NodeExecutionOutput = Array.from({ length: maxOutputs }, () => []);
  
  for (const output of outputs) {
    for (let i = 0; i < output.length; i++) {
      result[i].push(...output[i]);
    }
  }
  
  return result;
}

/**
 * Filter items based on a predicate
 * @param items Items to filter
 * @param predicate Filter predicate
 */
export function filterItems(
  items: INodeExecutionData[],
  predicate: (item: INodeExecutionData, index: number) => boolean,
): INodeExecutionData[] {
  return items.filter(predicate);
}

/**
 * Transform items using a mapper function
 * @param items Items to transform
 * @param mapper Mapper function
 */
export async function transformItems<T>(
  items: INodeExecutionData[],
  mapper: (item: INodeExecutionData, index: number) => Promise<T>,
): Promise<T[]> {
  return await Promise.all(items.map(mapper));
}

/**
 * Process items in batches
 * @param items Items to process
 * @param batchSize Batch size
 * @param processor Batch processor function
 */
export async function processInBatches<T>(
  items: INodeExecutionData[],
  batchSize: number,
  processor: (batch: INodeExecutionData[], batchIndex: number) => Promise<T[]>,
): Promise<T[]> {
  const results: T[] = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await processor(batch, Math.floor(i / batchSize));
    results.push(...batchResults);
  }
  
  return results;
}

/**
 * Add paired item information to execution data
 * @param item Execution data item
 * @param sourceItemIndex Source item index
 */
export function addPairedItem(
  item: INodeExecutionData,
  sourceItemIndex: number,
): INodeExecutionData {
  return {
    ...item,
    pairedItem: { item: sourceItemIndex },
  };
}

/**
 * Add multiple paired item references
 * @param item Execution data item
 * @param sourceItemIndices Source item indices
 */
export function addMultiplePairedItems(
  item: INodeExecutionData,
  sourceItemIndices: number[],
): INodeExecutionData {
  return {
    ...item,
    pairedItem: sourceItemIndices.map(index => ({ item: index })),
  };
}

/**
 * Create an error execution data item
 * @param error The error
 * @param originalItem Optional original item
 */
export function createErrorItem(
  error: Error,
  originalItem?: INodeExecutionData,
): INodeExecutionData {
  return {
    json: originalItem?.json ?? {},
    error,
  };
}

/**
 * Handle continue on fail for an item
 * @param error The error
 * @param item Original item
 * @param options Continue on fail options
 */
export function handleContinueOnFail(
  error: Error,
  item: INodeExecutionData,
  options: IContinueOnFailOptions,
): { success: INodeExecutionData | null; error: INodeExecutionData | null } {
  if (!options.enabled) {
    throw error;
  }

  const errorItem = createErrorItem(error, item);
  
  if (options.errorOutput === 'errorOutput') {
    return { success: null, error: errorItem };
  }
  
  return { success: errorItem, error: null };
}

/**
 * Get value from execution data item by path
 * @param item Execution data item
 * @param path Dot-notation path
 * @param defaultValue Default value if not found
 */
export function getValueByPath<T = unknown>(
  item: INodeExecutionData,
  path: string,
  defaultValue?: T,
): T | undefined {
  const parts = path.split('.');
  let value: unknown = item.json;
  
  for (const part of parts) {
    if (value === null || value === undefined) {
      return defaultValue;
    }
    value = (value as Record<string, unknown>)[part];
  }
  
  return (value as T) ?? defaultValue;
}

/**
 * Set value in execution data item by path
 * @param item Execution data item
 * @param path Dot-notation path
 * @param value Value to set
 */
export function setValueByPath(
  item: INodeExecutionData,
  path: string,
  value: unknown,
): INodeExecutionData {
  const parts = path.split('.');
  const result = { ...item, json: { ...item.json } };
  let current: Record<string, unknown> = result.json;
  
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!(part in current) || typeof current[part] !== 'object') {
      current[part] = {};
    }
    current[part] = { ...(current[part] as Record<string, unknown>) };
    current = current[part] as Record<string, unknown>;
  }
  
  current[parts[parts.length - 1]] = value;
  return result;
}

/**
 * Remove null/undefined values from execution data item
 * @param item Execution data item
 */
export function removeEmptyValues(item: INodeExecutionData): INodeExecutionData {
  const cleanObject = (obj: Record<string, unknown>): Record<string, unknown> => {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== null && value !== undefined) {
        if (typeof value === 'object' && !Array.isArray(value)) {
          result[key] = cleanObject(value as Record<string, unknown>);
        } else {
          result[key] = value;
        }
      }
    }
    return result;
  };
  
  return {
    ...item,
    json: cleanObject(item.json),
  };
}

/**
 * Flatten nested object in execution data item
 * @param item Execution data item
 * @param separator Key separator
 */
export function flattenItem(item: INodeExecutionData, separator = '.'): INodeExecutionData {
  const flatten = (
    obj: Record<string, unknown>,
    prefix = '',
  ): Record<string, unknown> => {
    const result: Record<string, unknown> = {};
    
    for (const [key, value] of Object.entries(obj)) {
      const newKey = prefix ? `${prefix}${separator}${key}` : key;
      
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        Object.assign(result, flatten(value as Record<string, unknown>, newKey));
      } else {
        result[newKey] = value;
      }
    }
    
    return result;
  };
  
  return {
    ...item,
    json: flatten(item.json),
  };
}

/**
 * Unflatten execution data item
 * @param item Execution data item
 * @param separator Key separator
 */
export function unflattenItem(item: INodeExecutionData, separator = '.'): INodeExecutionData {
  const result: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(item.json)) {
    const parts = key.split(separator);
    let current = result;
    
    for (let i = 0; i < parts.length - 1; i++) {
      if (!(parts[i] in current)) {
        current[parts[i]] = {};
      }
      current = current[parts[i]] as Record<string, unknown>;
    }
    
    current[parts[parts.length - 1]] = value;
  }
  
  return {
    ...item,
    json: result,
  };
}

/**
 * Validate required fields in execution data item
 * @param item Execution data item
 * @param requiredFields Array of required field names
 */
export function validateRequiredFields(
  item: INodeExecutionData,
  requiredFields: string[],
): { valid: boolean; missingFields: string[] } {
  const missingFields: string[] = [];
  
  for (const field of requiredFields) {
    const value = getValueByPath(item, field);
    if (value === undefined || value === null || value === '') {
      missingFields.push(field);
    }
  }
  
  return {
    valid: missingFields.length === 0,
    missingFields,
  };
}

/**
 * Create execution data from API response
 * @param response API response data
 * @param dataPath Optional path to extract data from response
 */
export function createFromApiResponse(
  response: unknown,
  dataPath?: string,
): INodeExecutionData[] {
  let data: unknown = response;
  
  if (dataPath) {
    const parts = dataPath.split('.');
    for (const part of parts) {
      if (data && typeof data === 'object') {
        data = (data as Record<string, unknown>)[part];
      }
    }
  }
  
  if (Array.isArray(data)) {
    return wrapDataArray(data as Array<Record<string, unknown>>);
  }
  
  if (data && typeof data === 'object') {
    return [wrapData(data as Record<string, unknown>)];
  }
  
  return [wrapData({ value: data })];
}
