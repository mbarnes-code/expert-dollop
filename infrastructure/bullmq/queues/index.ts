/**
 * Queue Configurations Index
 * Export all predefined queue configurations
 */

// N8N queues
export { createN8NWorkflowQueue, createN8NWebhookQueue } from './n8n';

// Inspector queues
export { createInspectorAnalysisQueue } from './inspector';

// Dispatch queues
export { createDispatchRoutingQueue, createDispatchNotificationsQueue } from './dispatch';

// MCP queues
export { createMCPVirusTotalQueue, createMCPFirecrawlQueue } from './mcp';

// Common queues
export {
  createEmailQueue,
  createNotificationsQueue,
  createAnalyticsQueue,
  createBackgroundJobsQueue,
} from './common';
