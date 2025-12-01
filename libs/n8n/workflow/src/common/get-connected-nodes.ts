/**
 * @fileoverview Get connected nodes from workflow connections
 * @module @expert-dollop/n8n-workflow/common
 */

import type { IConnections, IConnection, NodeConnectionType } from '../interfaces';
import { NodeConnectionTypes, nodeConnectionTypes } from '../interfaces';

/**
 * Gets all nodes connected to a given node following specified connection types
 * @param connections - The workflow connections object
 * @param nodeName - The starting node name
 * @param connectionType - The connection type to follow
 * @param depth - Maximum depth to traverse (-1 for unlimited)
 * @param checkedNodesIncoming - Set of already visited nodes
 * @returns Array of connected node names
 */
export function getConnectedNodes(
  connections: IConnections,
  nodeName: string,
  connectionType: NodeConnectionType | 'ALL' | 'ALL_NON_MAIN' = NodeConnectionTypes.Main,
  depth = -1,
  checkedNodesIncoming?: string[],
): string[] {
  const checkedNodes = checkedNodesIncoming ?? [];
  
  if (checkedNodes.includes(nodeName)) {
    return [];
  }
  checkedNodes.push(nodeName);

  if (!connections[nodeName]) {
    return [];
  }

  const returnNodes: string[] = [];
  
  // Determine which connection types to follow
  let typesToCheck: NodeConnectionType[];
  if (connectionType === 'ALL') {
    typesToCheck = nodeConnectionTypes;
  } else if (connectionType === 'ALL_NON_MAIN') {
    typesToCheck = nodeConnectionTypes.filter(t => t !== NodeConnectionTypes.Main);
  } else {
    typesToCheck = [connectionType];
  }

  for (const type of typesToCheck) {
    if (!connections[nodeName][type]) {
      continue;
    }

    for (const connectionsByIndex of connections[nodeName][type]) {
      if (!connectionsByIndex) {
        continue;
      }

      for (const connection of connectionsByIndex) {
        if (!connection || checkedNodes.includes(connection.node)) {
          continue;
        }

        returnNodes.push(connection.node);

        if (depth !== 0) {
          const childNodes = getConnectedNodes(
            connections,
            connection.node,
            connectionType,
            depth === -1 ? -1 : depth - 1,
            checkedNodes,
          );
          returnNodes.push(...childNodes);
        }
      }
    }
  }

  return returnNodes;
}
