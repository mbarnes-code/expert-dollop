/**
 * @fileoverview Get child nodes from workflow connections
 * @module @expert-dollop/n8n-workflow/common
 */

import type { IConnections, NodeConnectionType } from '../interfaces';
import { NodeConnectionTypes } from '../interfaces';
import { getConnectedNodes } from './get-connected-nodes';

/**
 * Gets all child nodes connected to a given node
 * @param connections - The workflow connections object
 * @param nodeName - The name of the node to find children for
 * @param type - The connection type to filter by
 * @param depth - Maximum depth to traverse (-1 for unlimited)
 * @returns Array of child node names
 */
export function getChildNodes(
  connections: IConnections,
  nodeName: string,
  type: NodeConnectionType | 'ALL' | 'ALL_NON_MAIN' = NodeConnectionTypes.Main,
  depth = -1,
): string[] {
  return getConnectedNodes(connections, nodeName, type, depth);
}
