/**
 * Workflow Tools Handler
 * 
 * This module handles calls to workflow-related tools.
 */

import { ToolCallResult } from '../../types/index.js';
import { N8nApiError } from '../../errors/index.js';
import {
  ListWorkflowsHandler,
  GetWorkflowHandler,
  CreateWorkflowHandler,
  UpdateWorkflowHandler,
  DeleteWorkflowHandler,
  ActivateWorkflowHandler,
  DeactivateWorkflowHandler,
} from './index.js';

/**
 * Handle workflow tool calls
 * 
 * @param toolName Name of the tool being called
 * @param args Arguments passed to the tool
 * @returns Tool call result
 */
export default async function workflowHandler(
  toolName: string,
  args: Record<string, any>
): Promise<ToolCallResult> {
  try {
    // Route to the appropriate handler based on the tool name
    switch (toolName) {
      case 'list_workflows':
        return await new ListWorkflowsHandler().execute(args);
        
      case 'get_workflow':
        return await new GetWorkflowHandler().execute(args);
        
      case 'create_workflow':
        return await new CreateWorkflowHandler().execute(args);
        
      case 'update_workflow':
        return await new UpdateWorkflowHandler().execute(args);
        
      case 'delete_workflow':
        return await new DeleteWorkflowHandler().execute(args);
        
      case 'activate_workflow':
        return await new ActivateWorkflowHandler().execute(args);
        
      case 'deactivate_workflow':
        return await new DeactivateWorkflowHandler().execute(args);
        
      default:
        throw new N8nApiError(`Unknown workflow tool: ${toolName}`);
    }
  } catch (error) {
    if (error instanceof N8nApiError) {
      return {
        content: [
          {
            type: 'text',
            text: error.message,
          },
        ],
        isError: true,
      };
    }
    
    // Handle unexpected errors
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Unknown error occurred';
      
    return {
      content: [
        {
          type: 'text',
          text: `Error executing workflow tool: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
}
