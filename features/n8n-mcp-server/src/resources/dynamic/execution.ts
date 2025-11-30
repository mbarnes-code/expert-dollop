/**
 * Dynamic Execution Resource Handler
 * 
 * This module provides the MCP resource implementation for retrieving
 * detailed execution information by ID.
 */

import { N8nApiService } from '../../api/n8n-client.js';
import { formatExecutionDetails } from '../../utils/execution-formatter.js';
import { formatResourceUri } from '../../utils/resource-formatter.js';
import { McpError, ErrorCode } from '../../errors/index.js';

/**
 * Get execution resource data by ID
 * 
 * @param apiService n8n API service
 * @param executionId Execution ID
 * @returns Formatted execution resource data
 */
export async function getExecutionResource(apiService: N8nApiService, executionId: string): Promise<string> {
  try {
    // Get the specific execution from the API
    const execution = await apiService.getExecution(executionId);
    
    // Format the execution for resource consumption
    const formattedExecution = formatExecutionDetails(execution);
    
    // Add metadata about the resource
    const result = {
      resourceType: 'execution',
      id: executionId,
      ...formattedExecution,
      _links: {
        self: formatResourceUri('execution', executionId),
        // Include link to related workflow
        workflow: `n8n://workflows/${execution.workflowId}`,
      },
      lastUpdated: new Date().toISOString(),
    };
    
    return JSON.stringify(result, null, 2);
  } catch (error) {
    console.error(`Error fetching execution resource (ID: ${executionId}):`, error);
    
    // Handle not found errors specifically
    if (error instanceof McpError && error.code === ErrorCode.NotFoundError) {
      throw error;
    }
    
    throw new McpError(
      ErrorCode.InternalError, 
      `Failed to retrieve execution (ID: ${executionId}): ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Get execution resource template URI
 * 
 * @returns Formatted resource template URI
 */
export function getExecutionResourceTemplateUri(): string {
  return 'n8n://executions/{id}';
}

/**
 * Get execution resource template metadata
 * 
 * @returns Resource template metadata object
 */
export function getExecutionResourceTemplateMetadata(): Record<string, any> {
  return {
    uriTemplate: getExecutionResourceTemplateUri(),
    name: 'n8n Execution Details',
    mimeType: 'application/json',
    description: 'Detailed information about a specific n8n workflow execution including node results and error information',
  };
}

/**
 * Extract execution ID from resource URI
 * 
 * @param uri Resource URI
 * @returns Execution ID or null if URI format is invalid
 */
export function extractExecutionIdFromUri(uri: string): string | null {
  const match = uri.match(/^n8n:\/\/executions\/([^/]+)$/);
  return match ? match[1] : null;
}
