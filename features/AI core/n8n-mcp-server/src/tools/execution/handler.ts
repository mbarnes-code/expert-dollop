/**
 * Execution Tools Handler
 * 
 * This module handles calls to execution-related tools.
 */

import { ToolCallResult } from '../../types/index.js';
import { McpError } from '@modelcontextprotocol/sdk/types.js';
import { ErrorCode } from '../../errors/error-codes.js';
import { getErrorMessage } from '../../errors/index.js';
import { 
  ListExecutionsHandler, 
  GetExecutionHandler,
  DeleteExecutionHandler,
  RunWebhookHandler
} from './index.js';

/**
 * Handle execution tool calls
 * 
 * @param toolName Name of the tool being called
 * @param args Arguments passed to the tool
 * @returns Tool call result
 */
export default async function executionHandler(
  toolName: string,
  args: Record<string, any>
): Promise<ToolCallResult> {
  try {
    // Route to the appropriate handler based on tool name
    switch (toolName) {
      case 'list_executions':
        return await new ListExecutionsHandler().execute(args);
        
      case 'get_execution':
        return await new GetExecutionHandler().execute(args);
        
      case 'delete_execution':
        return await new DeleteExecutionHandler().execute(args);
        
      case 'run_webhook':
        return await new RunWebhookHandler().execute(args);
        
      default:
        throw new McpError(
          ErrorCode.NotImplemented,
          `Unknown execution tool: '${toolName}'`
        );
    }
  } catch (error) {
    // Get appropriate error message
    const errorMessage = getErrorMessage(error);
    
    return {
      content: [
        {
          type: 'text',
          text: `Error executing execution tool: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
}
