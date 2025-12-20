/**
 * Dynamic Workflow Resource Handler
 * 
 * This module provides the MCP resource implementation for retrieving
 * detailed workflow information by ID.
 */

import { N8nApiService } from '../../api/n8n-client.js';
import { formatWorkflowDetails, formatResourceUri } from '../../utils/resource-formatter.js';
import { McpError, ErrorCode } from '../../errors/index.js';

/**
 * Get workflow resource data by ID
 * 
 * @param apiService n8n API service
 * @param workflowId Workflow ID
 * @returns Formatted workflow resource data
 */
export async function getWorkflowResource(apiService: N8nApiService, workflowId: string): Promise<string> {
  try {
    // Get the specific workflow from the API
    const workflow = await apiService.getWorkflow(workflowId);
    
    // Format the workflow for resource consumption
    const formattedWorkflow = formatWorkflowDetails(workflow);
    
    // Add metadata about the resource
    const result = {
      resourceType: 'workflow',
      id: workflowId,
      ...formattedWorkflow,
      _links: {
        self: formatResourceUri('workflow', workflowId),
        // Include links to related resources
        executions: `n8n://executions?workflowId=${workflowId}`,
      },
      lastUpdated: new Date().toISOString(),
    };
    
    return JSON.stringify(result, null, 2);
  } catch (error) {
    console.error(`Error fetching workflow resource (ID: ${workflowId}):`, error);
    
    // Handle not found errors specifically
    if (error instanceof McpError && error.code === ErrorCode.NotFoundError) {
      throw error;
    }
    
    throw new McpError(
      ErrorCode.InternalError, 
      `Failed to retrieve workflow (ID: ${workflowId}): ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Get workflow resource template URI
 * 
 * @returns Formatted resource template URI
 */
export function getWorkflowResourceTemplateUri(): string {
  return 'n8n://workflows/{id}';
}

/**
 * Get workflow resource template metadata
 * 
 * @returns Resource template metadata object
 */
export function getWorkflowResourceTemplateMetadata(): Record<string, any> {
  return {
    uriTemplate: getWorkflowResourceTemplateUri(),
    name: 'n8n Workflow Details',
    mimeType: 'application/json',
    description: 'Detailed information about a specific n8n workflow including all nodes, connections, and settings',
  };
}

/**
 * Extract workflow ID from resource URI
 * 
 * @param uri Resource URI
 * @returns Workflow ID or null if URI format is invalid
 */
export function extractWorkflowIdFromUri(uri: string): string | null {
  const match = uri.match(/^n8n:\/\/workflows\/([^/]+)$/);
  return match ? match[1] : null;
}
