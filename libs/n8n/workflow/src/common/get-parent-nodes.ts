/**
 * @fileoverview Get parent nodes from workflow connections
 * @module @expert-dollop/n8n-workflow/common
 */

import type { IConnections, NodeConnectionType } from '../interfaces';
import { NodeConnectionTypes, nodeConnectionTypes } from '../interfaces';

/**
 * Gets all parent nodes connected to a given node
 * @param connectionsByDestination - Connections indexed by destination node
 * @param nodeName - The name of the node to find parents for
 * @param type - The connection type to filter by
 * @param depth - Maximum depth to traverse (-1 for unlimited)
 * @returns Array of parent node names
 */
export function getParentNodes(
  connectionsByDestination: IConnections,
  nodeName: string,
  type: NodeConnectionType | 'ALL' | 'ALL_NON_MAIN' = NodeConnectionTypes.Main,
  depth = -1,
): string[] {
  const checkedNodes = new Set<string>();
  const returnNodes: string[] = [];

  function traverse(currentNode: string, currentDepth: number) {
    if (checkedNodes.has(currentNode)) {
      return;
    }
    checkedNodes.add(currentNode);

    if (!connectionsByDestination[currentNode]) {
      return;
    }

    // Determine which connection types to check
    let typesToCheck: NodeConnectionType[];
    if (type === 'ALL') {
      typesToCheck = nodeConnectionTypes;
    } else if (type === 'ALL_NON_MAIN') {
      typesToCheck = nodeConnectionTypes.filter(t => t !== NodeConnectionTypes.Main);
    } else {
      typesToCheck = [type];
    }

    for (const connectionType of typesToCheck) {
      const typeConnections = connectionsByDestination[currentNode][connectionType];
      if (!typeConnections) {
        continue;
      }

      for (const connectionsByIndex of typeConnections) {
        if (!connectionsByIndex) {
          continue;
        }

        for (const connection of connectionsByIndex) {
          if (!connection || checkedNodes.has(connection.node)) {
            continue;
          }

          if (!returnNodes.includes(connection.node)) {
            returnNodes.push(connection.node);
          }

          if (currentDepth !== 0) {
            traverse(
              connection.node,
              currentDepth === -1 ? -1 : currentDepth - 1,
            );
          }
        }
      }
    }
  }

  traverse(nodeName, depth);
  return returnNodes;
}
