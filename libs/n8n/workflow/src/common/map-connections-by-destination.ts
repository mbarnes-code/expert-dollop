/**
 * @fileoverview Map connections by destination node
 * @module @expert-dollop/n8n-workflow/common
 */

import type { IConnections, IConnection, NodeConnectionType } from '../interfaces';

/**
 * Transforms connections from source-indexed to destination-indexed format
 * @param connectionsBySource - Connections indexed by source node
 * @returns Connections indexed by destination node
 */
export function mapConnectionsByDestination(connectionsBySource: IConnections): IConnections {
  const returnConnection: IConnections = {};

  for (const sourceNode in connectionsBySource) {
    if (!Object.prototype.hasOwnProperty.call(connectionsBySource, sourceNode)) {
      continue;
    }

    for (const type of Object.keys(connectionsBySource[sourceNode]) as NodeConnectionType[]) {
      if (!Object.prototype.hasOwnProperty.call(connectionsBySource[sourceNode], type)) {
        continue;
      }

      const typeConnections = connectionsBySource[sourceNode][type];
      
      for (let inputIndex = 0; inputIndex < typeConnections.length; inputIndex++) {
        const connectionsByIndex = typeConnections[inputIndex];
        if (!connectionsByIndex) {
          continue;
        }

        for (const connectionInfo of connectionsByIndex) {
          if (!connectionInfo) {
            continue;
          }

          // Initialize destination node if needed
          if (!returnConnection[connectionInfo.node]) {
            returnConnection[connectionInfo.node] = {};
          }
          if (!returnConnection[connectionInfo.node][connectionInfo.type]) {
            returnConnection[connectionInfo.node][connectionInfo.type] = [];
          }

          // Ensure array has enough slots
          const destArray = returnConnection[connectionInfo.node][connectionInfo.type];
          while (destArray.length <= connectionInfo.index) {
            destArray.push([]);
          }

          // Add the reverse connection
          if (!destArray[connectionInfo.index]) {
            destArray[connectionInfo.index] = [];
          }
          destArray[connectionInfo.index]!.push({
            node: sourceNode,
            type,
            index: inputIndex,
          });
        }
      }
    }
  }

  return returnConnection;
}
