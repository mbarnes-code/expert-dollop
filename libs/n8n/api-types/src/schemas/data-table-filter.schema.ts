/**
 * Data table filter schema definitions.
 */
import { z } from 'zod';

export const dataTableFilterConditionTypeSchema = z.enum([
  'equals',
  'notEquals',
  'contains',
  'notContains',
  'startsWith',
  'endsWith',
  'greaterThan',
  'lessThan',
  'greaterThanOrEqual',
  'lessThanOrEqual',
  'isEmpty',
  'isNotEmpty',
  'isTrue',
  'isFalse',
]);

export type DataTableFilterConditionType = z.infer<typeof dataTableFilterConditionTypeSchema>;

export const dataTableFilterSchema = z.object({
  column: z.string(),
  condition: dataTableFilterConditionTypeSchema,
  value: z.union([z.string(), z.number(), z.boolean(), z.null()]).optional(),
});

export type DataTableFilter = z.infer<typeof dataTableFilterSchema>;
