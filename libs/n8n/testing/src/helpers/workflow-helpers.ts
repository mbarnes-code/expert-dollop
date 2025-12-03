/**
 * Test helpers for workflow operations
 */

import type { IWorkflow, INode, IConnections } from '../factories/workflow.factory';

/**
 * Validate workflow structure
 */
export function validateWorkflowStructure(workflow: IWorkflow): boolean {
  // Check required fields
  if (!workflow.name) {
    throw new Error('Workflow must have a name');
  }
  
  if (!Array.isArray(workflow.nodes)) {
    throw new Error('Workflow must have a nodes array');
  }
  
  if (typeof workflow.connections !== 'object') {
    throw new Error('Workflow must have a connections object');
  }
  
  // Validate nodes
  for (const node of workflow.nodes) {
    if (!node.id || !node.name || !node.type) {
      throw new Error(`Invalid node: ${JSON.stringify(node)}`);
    }
  }
  
  // Validate connections reference existing nodes
  const nodeNames = new Set(workflow.nodes.map(n => n.name));
  
  for (const [sourceName, outputs] of Object.entries(workflow.connections)) {
    if (!nodeNames.has(sourceName)) {
      throw new Error(`Connection source "${sourceName}" does not exist in nodes`);
    }
    
    for (const [outputType, connections] of Object.entries(outputs)) {
      for (const connectionList of connections) {
        for (const conn of connectionList) {
          if (!nodeNames.has(conn.node)) {
            throw new Error(`Connection target "${conn.node}" does not exist in nodes`);
          }
        }
      }
    }
  }
  
  return true;
}

/**
 * Count nodes in a workflow by type
 */
export function countNodesByType(workflow: IWorkflow): Record<string, number> {
  const counts: Record<string, number> = {};
  
  for (const node of workflow.nodes) {
    counts[node.type] = (counts[node.type] || 0) + 1;
  }
  
  return counts;
}

/**
 * Find a node by name in a workflow
 */
export function findNodeByName(workflow: IWorkflow, name: string): INode | undefined {
  return workflow.nodes.find(n => n.name === name);
}

/**
 * Get all node types used in a workflow
 */
export function getNodeTypes(workflow: IWorkflow): string[] {
  return Array.from(new Set(workflow.nodes.map(n => n.type)));
}

/**
 * Check if a workflow is valid for execution
 */
export function isExecutable(workflow: IWorkflow): boolean {
  try {
    validateWorkflowStructure(workflow);
    
    // Must have at least one node
    if (workflow.nodes.length === 0) {
      return false;
    }
    
    // Should have a start node or trigger
    const hasStartNode = workflow.nodes.some(n =>
      n.type.includes('start') || n.type.includes('trigger') || n.type.includes('webhook')
    );
    
    return hasStartNode;
  } catch {
    return false;
  }
}
