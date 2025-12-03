/**
 * Queue Configurations Index
 * Export all predefined queue configurations
 */

// N8N queues
export { createN8NWorkflowQueue, createN8NWebhookQueue, createN8NExecutionQueue } from './n8n';

// Inspector queues
export { createInspectorAnalysisQueue } from './inspector';

// Dispatch queues
export { createDispatchRoutingQueue, createDispatchNotificationsQueue } from './dispatch';

// Actual queues
export { createActualSyncQueue, createActualBackupQueue } from './actual';

// Ghostwriter queues
export { createGhostwriterCollabQueue, createGhostwriterExportQueue } from './ghostwriter';

// Mealie queues
export { createMealieRecipeImportQueue, createMealieImageProcessingQueue } from './mealie';

// MTG queues
export { createMTGCardAnalysisQueue, createMTGDeckOptimizationQueue } from './mtg';

// Tool queues
export { 
  createCyberChefOperationQueue, 
  createITToolsConversionQueue, 
  createSpellbookComboSearchQueue 
} from './tools';

// Nemesis queues
export { createNemesisFileEnrichmentQueue, createNemesisDataProcessingQueue } from './nemesis';

// FileScope queues
export { createFileScopeIndexingQueue, createFileScopeDependencyAnalysisQueue } from './filescope';

// Common queues
export {
  createEmailQueue,
  createNotificationsQueue,
  createAnalyticsQueue,
  createBackgroundJobsQueue,
} from './common';

