/**
 * @fileoverview Abstract Workflow class
 * @module @expert-dollop/n8n-workflow
 * 
 * This provides the core workflow abstraction for managing workflow nodes,
 * connections, and traversal operations.
 */

import {
  getChildNodes,
  getConnectedNodes,
  getParentNodes,
  mapConnectionsByDestination,
} from './common';

import {
  MANUAL_CHAT_TRIGGER_LANGCHAIN_NODE_TYPE,
  NODES_WITH_RENAMABLE_CONTENT,
  NODES_WITH_RENAMABLE_FORM_HTML_CONTENT,
  NODES_WITH_RENAMEABLE_TOPLEVEL_HTML_CONTENT,
  STARTING_NODE_TYPES,
} from './constants';

import { UserError } from './errors/base/user-errors';

import type {
  IConnections,
  INode,
  INodeExecutionData,
  INodeParameters,
  INodes,
  INodeType,
  INodeTypes,
  IPinData,
  IWorkflowSettings,
  IConnection,
  IConnectedNode,
  IDataObject,
  INodeConnection,
  IObservableObject,
  NodeParameterValueType,
  NodeConnectionType,
} from './interfaces';
import { NodeConnectionTypes } from './interfaces';

/**
 * Parameters for creating a Workflow instance
 */
export interface WorkflowParameters {
  id?: string;
  name?: string;
  nodes: INode[];
  connections: IConnections;
  active: boolean;
  nodeTypes: INodeTypes;
  staticData?: IDataObject;
  settings?: IWorkflowSettings;
  pinData?: IPinData;
}

/**
 * Abstract Workflow class providing core workflow functionality
 * 
 * This class manages workflow nodes, their connections, and provides
 * methods for traversing the workflow graph.
 */
export abstract class AbstractWorkflow {
  /**
   * Unique identifier for the workflow
   */
  id: string;
  
  /**
   * Human-readable name of the workflow
   */
  name: string | undefined;
  
  /**
   * Map of node names to node objects
   */
  nodes: INodes = {};
  
  /**
   * Connections indexed by source node
   */
  connectionsBySourceNode: IConnections = {};
  
  /**
   * Connections indexed by destination node
   */
  connectionsByDestinationNode: IConnections = {};
  
  /**
   * Node types registry
   */
  nodeTypes: INodeTypes;
  
  /**
   * Whether the workflow is currently active
   */
  active: boolean;
  
  /**
   * Workflow settings
   */
  settings: IWorkflowSettings = {};
  
  /**
   * Timezone for the workflow
   */
  readonly timezone: string;
  
  /**
   * Static data persisted across executions
   */
  staticData: IDataObject;
  
  /**
   * Test static data for testing scenarios
   */
  testStaticData: IDataObject | undefined;
  
  /**
   * Pinned node data
   */
  pinData?: IPinData;
  
  constructor(parameters: WorkflowParameters) {
    this.id = parameters.id ?? '';
    this.name = parameters.name;
    this.nodeTypes = parameters.nodeTypes;
    this.active = parameters.active || false;
    this.staticData = parameters.staticData || {};
    
    // Initialize nodes
    this.setNodes(parameters.nodes);
    this.setConnections(parameters.connections);
    this.setPinData(parameters.pinData);
    this.setSettings(parameters.settings ?? {});
    
    // Set timezone from settings or use UTC as default
    this.timezone = this.settings.timezone === 'DEFAULT' || !this.settings.timezone 
      ? 'UTC' 
      : this.settings.timezone;
  }
  
  /**
   * Sets the nodes for the workflow
   */
  setNodes(nodes: INode[]): void {
    this.nodes = {};
    for (const node of nodes) {
      this.nodes[node.name] = node;
    }
  }
  
  /**
   * Sets the connections for the workflow
   */
  setConnections(connections: IConnections): void {
    this.connectionsBySourceNode = connections;
    this.connectionsByDestinationNode = mapConnectionsByDestination(this.connectionsBySourceNode);
  }
  
  /**
   * Sets pinned data for nodes
   */
  setPinData(pinData: IPinData | undefined): void {
    this.pinData = pinData;
  }
  
  /**
   * Sets workflow settings
   */
  setSettings(settings: IWorkflowSettings): void {
    this.settings = settings;
  }
  
  /**
   * Gets a node by name
   */
  getNode(nodeName: string): INode | null {
    return this.nodes[nodeName] ?? null;
  }
  
  /**
   * Gets multiple nodes by their names
   */
  getNodes(nodeNames: string[]): INode[] {
    const result: INode[] = [];
    for (const name of nodeNames) {
      const node = this.getNode(name);
      if (node) {
        result.push(node);
      }
    }
    return result;
  }
  
  /**
   * Gets pinned data for a specific node
   */
  getPinDataOfNode(nodeName: string): INodeExecutionData[] | undefined {
    return this.pinData?.[nodeName];
  }
  
  /**
   * Gets all trigger nodes in the workflow
   */
  getTriggerNodes(): INode[] {
    return this.queryNodes((nodeType: INodeType) => !!nodeType.trigger);
  }
  
  /**
   * Gets all poll nodes in the workflow
   */
  getPollNodes(): INode[] {
    return this.queryNodes((nodeType: INodeType) => !!nodeType.poll);
  }
  
  /**
   * Queries nodes based on a check function
   */
  queryNodes(checkFunction: (nodeType: INodeType) => boolean): INode[] {
    const returnNodes: INode[] = [];
    
    for (const nodeName of Object.keys(this.nodes)) {
      const node = this.nodes[nodeName];
      
      if (node.disabled === true) {
        continue;
      }
      
      const nodeType = this.nodeTypes.getByNameAndVersion(node.type, node.typeVersion);
      
      if (nodeType !== undefined && checkFunction(nodeType)) {
        returnNodes.push(node);
      }
    }
    
    return returnNodes;
  }
  
  /**
   * Gets static data for a specific type and optional node
   */
  getStaticData(type: 'global' | 'node', node?: INode): IDataObject {
    let key: string;
    
    if (type === 'global') {
      key = 'global';
    } else if (type === 'node') {
      if (!node) {
        throw new Error('Node parameter required for type "node"');
      }
      key = `node:${node.name}`;
    } else {
      throw new Error(`Unknown context type: ${type}`);
    }
    
    if (this.testStaticData?.[key]) {
      return this.testStaticData[key] as IDataObject;
    }
    
    if (this.staticData[key] === undefined) {
      this.staticData[key] = {};
    }
    
    return this.staticData[key] as IDataObject;
  }
  
  /**
   * Sets test static data for testing
   */
  setTestStaticData(testStaticData: IDataObject): void {
    this.testStaticData = testStaticData;
  }
  
  /**
   * Gets all child nodes connected to a given node
   */
  getChildNodes(
    nodeName: string,
    type: NodeConnectionType | 'ALL' | 'ALL_NON_MAIN' = NodeConnectionTypes.Main,
    depth = -1,
  ): string[] {
    return getChildNodes(this.connectionsBySourceNode, nodeName, type, depth);
  }
  
  /**
   * Gets all parent nodes connected to a given node
   */
  getParentNodes(
    nodeName: string,
    type: NodeConnectionType | 'ALL' | 'ALL_NON_MAIN' = NodeConnectionTypes.Main,
    depth = -1,
  ): string[] {
    return getParentNodes(this.connectionsByDestinationNode, nodeName, type, depth);
  }
  
  /**
   * Gets connected nodes starting from a given node
   */
  getConnectedNodes(
    connections: IConnections,
    nodeName: string,
    connectionType: NodeConnectionType | 'ALL' | 'ALL_NON_MAIN' = NodeConnectionTypes.Main,
    depth = -1,
    checkedNodesIncoming?: string[],
  ): string[] {
    return getConnectedNodes(connections, nodeName, connectionType, depth, checkedNodesIncoming);
  }
  
  /**
   * Finds the highest parent nodes of the given node
   */
  getHighestNode(
    nodeName: string,
    nodeConnectionIndex?: number,
    checkedNodes?: string[],
  ): string[] {
    const currentHighest: string[] = [];
    
    if (this.nodes[nodeName]?.disabled === false) {
      currentHighest.push(nodeName);
    }
    
    if (!this.connectionsByDestinationNode[nodeName]) {
      return currentHighest;
    }
    
    if (!this.connectionsByDestinationNode[nodeName][NodeConnectionTypes.Main]) {
      return currentHighest;
    }
    
    checkedNodes = checkedNodes || [];
    
    if (checkedNodes.includes(nodeName)) {
      return currentHighest;
    }
    
    checkedNodes.push(nodeName);
    
    const returnNodes: string[] = [];
    
    const mainConnections = this.connectionsByDestinationNode[nodeName][NodeConnectionTypes.Main];
    
    for (let connectionIndex = 0; connectionIndex < mainConnections.length; connectionIndex++) {
      if (nodeConnectionIndex !== undefined && nodeConnectionIndex !== connectionIndex) {
        continue;
      }
      
      const connectionsByIndex = mainConnections[connectionIndex];
      
      connectionsByIndex?.forEach((connection) => {
        if (checkedNodes!.includes(connection.node)) {
          return;
        }
        
        if (!(connection.node in this.nodes)) {
          return;
        }
        
        let addNodes = this.getHighestNode(connection.node, undefined, checkedNodes);
        
        if (addNodes.length === 0) {
          if (this.nodes[connection.node].disabled !== true) {
            addNodes = [connection.node];
          }
        }
        
        for (const name of addNodes) {
          if (!returnNodes.includes(name)) {
            returnNodes.push(name);
          }
        }
      });
    }
    
    return returnNodes;
  }
  
  /**
   * Gets the start node for workflow execution
   */
  getStartNode(destinationNode?: string): INode | undefined {
    if (destinationNode) {
      const nodeNames = this.getHighestNode(destinationNode);
      
      if (nodeNames.length === 0) {
        nodeNames.push(destinationNode);
      }
      
      const node = this.findStartNode(nodeNames);
      if (node) {
        return node;
      }
      
      return this.nodes[nodeNames[0]];
    }
    
    return this.findStartNode(Object.keys(this.nodes));
  }
  
  /**
   * Finds the start node from a list of node names
   */
  private findStartNode(nodeNames: string[]): INode | undefined {
    if (nodeNames.length === 1) {
      const node = this.nodes[nodeNames[0]];
      if (node && !node.disabled) {
        return node;
      }
    }
    
    // Check for trigger or poll nodes
    for (const nodeName of nodeNames) {
      const node = this.nodes[nodeName];
      const nodeType = this.nodeTypes.getByNameAndVersion(node.type, node.typeVersion);
      
      if (nodeType?.description?.name === MANUAL_CHAT_TRIGGER_LANGCHAIN_NODE_TYPE) {
        continue;
      }
      
      if (nodeType && (nodeType.trigger !== undefined || nodeType.poll !== undefined)) {
        if (node.disabled === true) {
          continue;
        }
        return node;
      }
    }
    
    // Check for known starting node types
    const sortedNodeNames = Object.values(this.nodes)
      .sort((a, b) => STARTING_NODE_TYPES.indexOf(a.type) - STARTING_NODE_TYPES.indexOf(b.type))
      .map((n) => n.name);
    
    for (const nodeName of sortedNodeNames) {
      const node = this.nodes[nodeName];
      if (STARTING_NODE_TYPES.includes(node.type)) {
        if (node.disabled === true) {
          continue;
        }
        return node;
      }
    }
    
    return undefined;
  }
  
  /**
   * Renames a node in the workflow, updating all references
   */
  renameNode(currentName: string, newName: string): void {
    const restrictedKeys = [
      'hasOwnProperty',
      'isPrototypeOf',
      'propertyIsEnumerable',
      'toLocaleString',
      'toString',
      'valueOf',
      'constructor',
      'prototype',
      '__proto__',
    ];
    
    if (restrictedKeys.map(k => k.toLowerCase()).includes(newName.toLowerCase())) {
      throw new UserError(`Node name "${newName}" is a restricted name.`, {
        description: `Node names cannot be any of the following: ${restrictedKeys.join(', ')}`,
      });
    }
    
    // Rename the node itself
    if (this.nodes[currentName] !== undefined) {
      this.nodes[newName] = this.nodes[currentName];
      this.nodes[newName].name = newName;
      delete this.nodes[currentName];
    }
    
    // Update source connections
    if (Object.prototype.hasOwnProperty.call(this.connectionsBySourceNode, currentName)) {
      this.connectionsBySourceNode[newName] = this.connectionsBySourceNode[currentName];
      delete this.connectionsBySourceNode[currentName];
    }
    
    // Update destination connections
    for (const sourceNode of Object.keys(this.connectionsBySourceNode)) {
      for (const type of Object.keys(this.connectionsBySourceNode[sourceNode])) {
        for (let sourceIndex = 0; sourceIndex < this.connectionsBySourceNode[sourceNode][type].length; sourceIndex++) {
          const connections = this.connectionsBySourceNode[sourceNode][type][sourceIndex];
          if (!connections) continue;
          
          for (const connection of connections) {
            if (connection?.node === currentName) {
              connection.node = newName;
            }
          }
        }
      }
    }
  }
  
  /**
   * Gets connection information between two nodes
   */
  getNodeConnectionIndexes(
    nodeName: string,
    parentNodeName: string,
    type: NodeConnectionType = NodeConnectionTypes.Main,
  ): INodeConnection | undefined {
    const parentNode = this.getNode(parentNodeName);
    if (!parentNode) {
      return undefined;
    }
    
    const visitedNodes = new Set<string>();
    const queue: string[] = [nodeName];
    
    while (queue.length > 0) {
      const currentNodeName = queue.shift()!;
      
      if (visitedNodes.has(currentNodeName)) {
        continue;
      }
      
      visitedNodes.add(currentNodeName);
      
      const typeConnections = this.connectionsByDestinationNode[currentNodeName]?.[type];
      if (!typeConnections) {
        continue;
      }
      
      for (let typedConnectionIdx = 0; typedConnectionIdx < typeConnections.length; typedConnectionIdx++) {
        const connectionsByIndex = typeConnections[typedConnectionIdx];
        if (!connectionsByIndex) {
          continue;
        }
        
        for (let destinationIndex = 0; destinationIndex < connectionsByIndex.length; destinationIndex++) {
          const connection = connectionsByIndex[destinationIndex];
          
          if (parentNodeName === connection.node) {
            return {
              sourceIndex: connection.index,
              destinationIndex,
            };
          }
          
          if (!visitedNodes.has(connection.node)) {
            queue.push(connection.node);
          }
        }
      }
    }
    
    return undefined;
  }
  
  /**
   * Gets connections between source and target node sets
   */
  getConnectionsBetweenNodes(
    sources: string[],
    targets: string[],
  ): Array<[IConnection, IConnection]> {
    const result: Array<[IConnection, IConnection]> = [];
    
    for (const source of sources) {
      const sourceConnections = this.connectionsBySourceNode[source];
      if (!sourceConnections) continue;
      
      for (const type of Object.keys(sourceConnections)) {
        for (let sourceIndex = 0; sourceIndex < sourceConnections[type].length; sourceIndex++) {
          const connections = sourceConnections[type][sourceIndex];
          if (!connections) continue;
          
          for (const targetConnection of connections) {
            if (targetConnection && targets.includes(targetConnection.node)) {
              result.push([
                {
                  node: source,
                  index: sourceIndex,
                  type: type as NodeConnectionType,
                },
                targetConnection,
              ]);
            }
          }
        }
      }
    }
    
    return result;
  }
  
  /**
   * Gets parent nodes by depth using BFS traversal
   */
  getParentNodesByDepth(nodeName: string, maxDepth = -1): IConnectedNode[] {
    return this.searchNodesBFS(this.connectionsByDestinationNode, nodeName, maxDepth);
  }
  
  /**
   * Searches nodes using BFS traversal
   */
  searchNodesBFS(connections: IConnections, sourceNode: string, maxDepth = -1): IConnectedNode[] {
    const returnConns: IConnectedNode[] = [];
    const type: NodeConnectionType = NodeConnectionTypes.Main;
    
    let queue: IConnectedNode[] = [{
      name: sourceNode,
      depth: 0,
      indices: [],
    }];
    
    const visited: { [key: string]: IConnectedNode } = {};
    let depth = 0;
    
    while (queue.length > 0) {
      if (maxDepth !== -1 && depth > maxDepth) {
        break;
      }
      depth++;
      
      const toAdd = [...queue];
      queue = [];
      
      for (const curr of toAdd) {
        if (visited[curr.name]) {
          visited[curr.name].indices = [...new Set([...visited[curr.name].indices, ...curr.indices])];
          continue;
        }
        
        visited[curr.name] = curr;
        if (curr.name !== sourceNode) {
          returnConns.push(curr);
        }
        
        if (!connections[curr.name] || !connections[curr.name][type]) {
          continue;
        }
        
        for (const connectionsByIndex of connections[curr.name][type]) {
          if (!connectionsByIndex) continue;
          
          for (const connection of connectionsByIndex) {
            queue.push({
              name: connection.node,
              indices: [connection.index],
              depth,
            });
          }
        }
      }
    }
    
    return returnConns;
  }
}
