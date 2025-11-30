/**
 * Get Execution Tool
 * 
 * This tool retrieves detailed information about a specific workflow execution.
 */

import { BaseExecutionToolHandler } from './base-handler.js';
import { ToolCallResult, ToolDefinition } from '../../types/index.js';
import { McpError } from '@modelcontextprotocol/sdk/types.js';
import { ErrorCode } from '../../errors/error-codes.js';
import { formatExecutionDetails } from '../../utils/execution-formatter.js';

/**
 * Handler for the get_execution tool
 */
export class GetExecutionHandler extends BaseExecutionToolHandler {
  /**
   * Execute the tool
   * 
   * @param args Tool arguments (executionId)
   * @returns Execution details
   */
  async execute(args: Record<string, any>): Promise<ToolCallResult> {
    return this.handleExecution(async () => {
      // Validate required parameters
      if (!args.executionId) {
        throw new McpError(
          ErrorCode.InvalidRequest,
          'Missing required parameter: executionId'
        );
      }
      
      // Get execution details
      const execution = await this.apiService.getExecution(args.executionId);
      
      // Format the execution for display
      const formattedExecution = formatExecutionDetails(execution);
      
      return this.formatSuccess(
        formattedExecution,
        `Execution Details for ID: ${args.executionId}`
      );
    }, args);
  }
  
}

/**
 * Get tool definition for the get_execution tool
 * 
 * @returns Tool definition
 */
export function getGetExecutionToolDefinition(): ToolDefinition {
  return {
    name: 'get_execution',
    description: 'Retrieve detailed information about a specific workflow execution',
    inputSchema: {
      type: 'object',
      properties: {
        executionId: {
          type: 'string',
          description: 'ID of the execution to retrieve',
        },
      },
      required: ['executionId'],
    },
  };
}
