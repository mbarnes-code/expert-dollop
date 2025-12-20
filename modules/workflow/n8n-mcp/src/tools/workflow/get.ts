/**
 * Get Workflow Tool
 * 
 * This tool retrieves a specific workflow from n8n by ID.
 */

import { BaseWorkflowToolHandler } from './base-handler.js';
import { ToolCallResult, ToolDefinition } from '../../types/index.js';
import { N8nApiError } from '../../errors/index.js';

/**
 * Handler for the get_workflow tool
 */
export class GetWorkflowHandler extends BaseWorkflowToolHandler {
  /**
   * Execute the tool
   * 
   * @param args Tool arguments containing workflowId
   * @returns Workflow details
   */
  async execute(args: Record<string, any>): Promise<ToolCallResult> {
    return this.handleExecution(async (args) => {
      const { workflowId } = args;
      
      if (!workflowId) {
        throw new N8nApiError('Missing required parameter: workflowId');
      }
      
      const workflow = await this.apiService.getWorkflow(workflowId);
      
      return this.formatSuccess(workflow, `Retrieved workflow: ${workflow.name}`);
    }, args);
  }
}

/**
 * Get tool definition for the get_workflow tool
 * 
 * @returns Tool definition
 */
export function getGetWorkflowToolDefinition(): ToolDefinition {
  return {
    name: 'get_workflow',
    description: 'Retrieve a specific workflow by ID',
    inputSchema: {
      type: 'object',
      properties: {
        workflowId: {
          type: 'string',
          description: 'ID of the workflow to retrieve',
        },
      },
      required: ['workflowId'],
    },
  };
}
