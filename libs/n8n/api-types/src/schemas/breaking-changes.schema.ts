/**
 * Breaking changes schema definitions.
 */
import { z } from 'zod';

export const breakingChangeRuleSeveritySchema = z.enum(['critical', 'warning', 'info']);
export type BreakingChangeRuleSeverity = z.infer<typeof breakingChangeRuleSeveritySchema>;

export const breakingChangeRecommendationSchema = z.object({
  title: z.string(),
  description: z.string(),
  actionUrl: z.string().optional(),
  actionLabel: z.string().optional(),
});
export type BreakingChangeRecommendation = z.infer<typeof breakingChangeRecommendationSchema>;

export const breakingChangeAffectedWorkflowSchema = z.object({
  id: z.string(),
  name: z.string(),
});
export type BreakingChangeAffectedWorkflow = z.infer<typeof breakingChangeAffectedWorkflowSchema>;

export const breakingChangeInstanceIssueSchema = z.object({
  ruleId: z.string(),
  severity: breakingChangeRuleSeveritySchema,
  title: z.string(),
  description: z.string(),
  recommendation: breakingChangeRecommendationSchema.optional(),
});
export type BreakingChangeInstanceIssue = z.infer<typeof breakingChangeInstanceIssueSchema>;

export const breakingChangeWorkflowIssueSchema = z.object({
  ruleId: z.string(),
  severity: breakingChangeRuleSeveritySchema,
  title: z.string(),
  description: z.string(),
  nodeType: z.string(),
  nodeName: z.string(),
  recommendation: breakingChangeRecommendationSchema.optional(),
});
export type BreakingChangeWorkflowIssue = z.infer<typeof breakingChangeWorkflowIssueSchema>;

export const breakingChangeInstanceRuleResultSchema = z.object({
  ruleId: z.string(),
  passed: z.boolean(),
  issues: z.array(breakingChangeInstanceIssueSchema),
});
export type BreakingChangeInstanceRuleResult = z.infer<typeof breakingChangeInstanceRuleResultSchema>;

export const breakingChangeWorkflowRuleResultSchema = z.object({
  workflowId: z.string(),
  workflowName: z.string(),
  issues: z.array(breakingChangeWorkflowIssueSchema),
});
export type BreakingChangeWorkflowRuleResult = z.infer<typeof breakingChangeWorkflowRuleResultSchema>;

export const breakingChangeReportResultSchema = z.object({
  instanceIssues: z.array(breakingChangeInstanceRuleResultSchema),
  workflowIssues: z.array(breakingChangeWorkflowRuleResultSchema),
  scannedWorkflows: z.number(),
  affectedWorkflows: z.number(),
});
export type BreakingChangeReportResult = z.infer<typeof breakingChangeReportResultSchema>;

export const breakingChangeLightReportResultSchema = z.object({
  affectedWorkflows: z.number(),
  scannedWorkflows: z.number(),
  instanceIssuesCount: z.number(),
});
export type BreakingChangeLightReportResult = z.infer<typeof breakingChangeLightReportResultSchema>;

export const breakingChangeVersionSchema = z.object({
  version: z.string(),
  hasBreakingChanges: z.boolean(),
  isLatest: z.boolean(),
  reportAvailable: z.boolean(),
});
export type BreakingChangeVersion = z.infer<typeof breakingChangeVersionSchema>;
