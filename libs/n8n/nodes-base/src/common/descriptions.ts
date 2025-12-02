/**
 * Common property descriptions for n8n nodes.
 * Reusable property definitions used across multiple nodes.
 */

import type { INodeProperty, IDisplayOptions } from './types';

/**
 * Standard pagination properties.
 */
export const paginationProperties: INodeProperty[] = [
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    default: false,
    description: 'Whether to return all results or only up to a given limit',
  },
  {
    displayName: 'Limit',
    name: 'limit',
    type: 'number',
    default: 50,
    description: 'Max number of results to return',
    displayOptions: {
      show: {
        returnAll: [false],
      },
    },
  },
];

/**
 * Standard options for batch operations.
 */
export const batchOperationProperties: INodeProperty[] = [
  {
    displayName: 'Batch Size',
    name: 'batchSize',
    type: 'number',
    default: 10,
    description: 'Number of items to process in each batch',
  },
  {
    displayName: 'Continue On Fail',
    name: 'continueOnFail',
    type: 'boolean',
    default: false,
    description: 'Whether to continue processing if an item fails',
  },
];

/**
 * Standard filter properties.
 */
export const filterProperties: INodeProperty[] = [
  {
    displayName: 'Filter Field',
    name: 'filterField',
    type: 'string',
    default: '',
    description: 'Field to filter by',
  },
  {
    displayName: 'Filter Value',
    name: 'filterValue',
    type: 'string',
    default: '',
    description: 'Value to filter by',
  },
  {
    displayName: 'Filter Operator',
    name: 'filterOperator',
    type: 'options',
    options: [
      { name: 'Equals', value: 'equals' },
      { name: 'Not Equals', value: 'notEquals' },
      { name: 'Contains', value: 'contains' },
      { name: 'Not Contains', value: 'notContains' },
      { name: 'Starts With', value: 'startsWith' },
      { name: 'Ends With', value: 'endsWith' },
      { name: 'Greater Than', value: 'greaterThan' },
      { name: 'Less Than', value: 'lessThan' },
    ],
    default: 'equals',
    description: 'Comparison operator to use',
  },
];

/**
 * Standard sort properties.
 */
export const sortProperties: INodeProperty[] = [
  {
    displayName: 'Sort Field',
    name: 'sortField',
    type: 'string',
    default: '',
    description: 'Field to sort by',
  },
  {
    displayName: 'Sort Direction',
    name: 'sortDirection',
    type: 'options',
    options: [
      { name: 'Ascending', value: 'asc' },
      { name: 'Descending', value: 'desc' },
    ],
    default: 'asc',
    description: 'Direction to sort',
  },
];

/**
 * Standard date range properties.
 */
export const dateRangeProperties: INodeProperty[] = [
  {
    displayName: 'Start Date',
    name: 'startDate',
    type: 'dateTime',
    default: '',
    description: 'Start date for the date range',
  },
  {
    displayName: 'End Date',
    name: 'endDate',
    type: 'dateTime',
    default: '',
    description: 'End date for the date range',
  },
];

/**
 * Standard binary data properties.
 */
export const binaryDataProperties: INodeProperty[] = [
  {
    displayName: 'Binary Property',
    name: 'binaryPropertyName',
    type: 'string',
    default: 'data',
    description: 'Name of the binary property to use',
  },
];

/**
 * Standard output properties.
 */
export const outputProperties: INodeProperty[] = [
  {
    displayName: 'Output Format',
    name: 'outputFormat',
    type: 'options',
    options: [
      { name: 'JSON', value: 'json' },
      { name: 'Raw', value: 'raw' },
      { name: 'Binary', value: 'binary' },
    ],
    default: 'json',
    description: 'Format for the output data',
  },
];

/**
 * Standard retry properties.
 */
export const retryProperties: INodeProperty[] = [
  {
    displayName: 'Retry On Fail',
    name: 'retryOnFail',
    type: 'boolean',
    default: false,
    description: 'Whether to retry the operation on failure',
  },
  {
    displayName: 'Max Retries',
    name: 'maxRetries',
    type: 'number',
    default: 3,
    description: 'Maximum number of retry attempts',
    displayOptions: {
      show: {
        retryOnFail: [true],
      },
    },
  },
  {
    displayName: 'Wait Between Retries (ms)',
    name: 'waitBetweenRetries',
    type: 'number',
    default: 1000,
    description: 'Time to wait between retry attempts',
    displayOptions: {
      show: {
        retryOnFail: [true],
      },
    },
  },
];

/**
 * Standard timeout properties.
 */
export const timeoutProperties: INodeProperty[] = [
  {
    displayName: 'Timeout (ms)',
    name: 'timeout',
    type: 'number',
    default: 30000,
    description: 'Maximum time to wait for the operation to complete',
  },
];

/**
 * Create resource property.
 */
export function createResourceProperty(
  resources: Array<{ name: string; value: string; description?: string }>,
  defaultValue?: string,
): INodeProperty {
  return {
    displayName: 'Resource',
    name: 'resource',
    type: 'options',
    noDataExpression: true,
    options: resources.map((r) => ({
      name: r.name,
      value: r.value,
      description: r.description,
    })),
    default: defaultValue || resources[0]?.value || '',
  };
}

/**
 * Create operation property for a specific resource.
 */
export function createOperationProperty(
  operations: Array<{ name: string; value: string; description?: string; action?: string }>,
  displayOptions?: IDisplayOptions,
): INodeProperty {
  return {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions,
    options: operations.map((o) => ({
      name: o.name,
      value: o.value,
      description: o.description,
      action: o.action,
    })),
    default: operations[0]?.value || '',
  };
}

/**
 * Create a simple text input property.
 */
export function createTextProperty(
  name: string,
  displayName: string,
  description: string,
  options: {
    required?: boolean;
    default?: string;
    placeholder?: string;
    displayOptions?: IDisplayOptions;
  } = {},
): INodeProperty {
  return {
    displayName,
    name,
    type: 'string',
    default: options.default || '',
    description,
    placeholder: options.placeholder,
    required: options.required,
    displayOptions: options.displayOptions,
  };
}

/**
 * Create a JSON input property.
 */
export function createJsonProperty(
  name: string,
  displayName: string,
  description: string,
  options: {
    required?: boolean;
    default?: string;
    displayOptions?: IDisplayOptions;
  } = {},
): INodeProperty {
  return {
    displayName,
    name,
    type: 'json',
    default: options.default || '{}',
    description,
    required: options.required,
    displayOptions: options.displayOptions,
  };
}

/**
 * Create a boolean property.
 */
export function createBooleanProperty(
  name: string,
  displayName: string,
  description: string,
  options: {
    default?: boolean;
    displayOptions?: IDisplayOptions;
  } = {},
): INodeProperty {
  return {
    displayName,
    name,
    type: 'boolean',
    default: options.default ?? false,
    description,
    displayOptions: options.displayOptions,
  };
}

/**
 * Create a number property.
 */
export function createNumberProperty(
  name: string,
  displayName: string,
  description: string,
  options: {
    default?: number;
    required?: boolean;
    displayOptions?: IDisplayOptions;
    typeOptions?: Record<string, unknown>;
  } = {},
): INodeProperty {
  return {
    displayName,
    name,
    type: 'number',
    default: options.default ?? 0,
    description,
    required: options.required,
    displayOptions: options.displayOptions,
    typeOptions: options.typeOptions,
  };
}

/**
 * Create a select (options) property.
 */
export function createSelectProperty(
  name: string,
  displayName: string,
  description: string,
  selectOptions: Array<{ name: string; value: string | number | boolean; description?: string }>,
  options: {
    default?: string | number | boolean;
    required?: boolean;
    displayOptions?: IDisplayOptions;
  } = {},
): INodeProperty {
  return {
    displayName,
    name,
    type: 'options',
    options: selectOptions,
    default: options.default ?? selectOptions[0]?.value ?? '',
    description,
    required: options.required,
    displayOptions: options.displayOptions,
  };
}
