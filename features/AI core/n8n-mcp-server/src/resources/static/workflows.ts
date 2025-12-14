/**
 * Static Workflows Resource Handler
 * 
 * This module provides the MCP resource implementation for listing all workflows.
 */

import { N8nApiService } from '../../api/n8n-client.js';
import { formatWorkflowSummary, formatResourceUri } from '../../utils/resource-formatter.js';
import { McpError, ErrorCode } from '../../errors/index.js';

/**
 * Get workflows resource data
 * 
 * @param apiService n8n API service
 * @returns Formatted workflows resource data
 */
export async function getWorkflowsResource(apiService: N8nApiService): Promise<string> {
  try {
    // Get all workflows from the API
    const workflows = await apiService.getWorkflows();
    
    // Format the workflows for resource consumption
    const formattedWorkflows = workflows.map(workflow => formatWorkflowSummary(workflow));
    
    // Add metadata about the resource
    const result = {
      resourceType: 'workflows',
      count: formattedWorkflows.length,
      workflows: formattedWorkflows,
      _links: {
        self: formatResourceUri('workflows'),
      },
      lastUpdated: new Date().toISOString(),
    };
    
    return JSON.stringify(result, null, 2);
  } catch (error) {
    console.error('Error fetching workflows resource:', error);
    throw new McpError(
      ErrorCode.InternalError, 
      `Failed to retrieve workflows: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Get workflows resource URI
 * 
 * @returns Formatted resource URI
 */
export function getWorkflowsResourceUri(): string {
  return formatResourceUri('workflows');
}

/**
 * Get workflows resource metadata
 * 
 * @returns Resource metadata object
 */
export function getWorkflowsResourceMetadata(): Record<string, any> {
  return {
    uri: getWorkflowsResourceUri(),
    name: 'n8n Workflows',
    mimeType: 'application/json',
    description: 'List of all workflows in the n8n instance with their basic information',
  };
}
