/**
 * @fileoverview Get node by name utility
 * @module @expert-dollop/n8n-workflow/common
 */

import type { INode, INodes } from '../interfaces';

/**
 * Gets a node by name from the nodes object
 * @param nodes - The nodes object containing all workflow nodes
 * @param nodeName - The name of the node to retrieve
 * @returns The node if found, null otherwise
 */
export function getNodeByName(nodes: INodes, nodeName: string): INode | null {
  return nodes[nodeName] ?? null;
}

/**
 * Gets multiple nodes by their names
 * @param nodes - The nodes object containing all workflow nodes
 * @param nodeNames - Array of node names to retrieve
 * @returns Array of found nodes (may be smaller than input if some nodes not found)
 */
export function getNodesByNames(nodes: INodes, nodeNames: string[]): INode[] {
  const result: INode[] = [];
  for (const name of nodeNames) {
    const node = getNodeByName(nodes, name);
    if (node) {
      result.push(node);
    }
  }
  return result;
}
