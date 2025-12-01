/**
 * @fileoverview Node loader abstraction
 * @module @expert-dollop/n8n-core/nodes-loader
 */

import type { 
  IDataObject,
  INodeType, 
  INodeTypes,
  IVersionedNodeType,
} from '@expert-dollop/n8n-workflow';
import type { INodeLoader } from '../interfaces';

/**
 * Abstract node loader providing a base implementation
 * for loading and managing node types
 */
export abstract class AbstractNodeLoader implements INodeLoader, INodeTypes {
  protected readonly nodes = new Map<string, INodeType | IVersionedNodeType>();
  protected initialized = false;
  
  /**
   * Loads all available nodes
   */
  abstract loadAll(): Promise<Map<string, INodeType>>;
  
  /**
   * Ensures the loader is initialized
   */
  protected async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.loadAll();
      this.initialized = true;
    }
  }
  
  /**
   * Gets a node type by name
   */
  getByName(name: string): INodeType | IVersionedNodeType {
    const node = this.nodes.get(name);
    if (!node) {
      throw new Error(`Node type not found: ${name}`);
    }
    return node;
  }
  
  /**
   * Gets a node type by name and version
   */
  getByNameAndVersion(name: string, version?: number): INodeType {
    const node = this.nodes.get(name);
    
    if (!node) {
      throw new Error(`Node type not found: ${name}`);
    }
    
    // Check if it's a versioned node type
    if ('nodeVersions' in node) {
      const versionedNode = node as IVersionedNodeType;
      const targetVersion = version ?? versionedNode.currentVersion;
      const nodeType = versionedNode.nodeVersions[targetVersion];
      
      if (!nodeType) {
        throw new Error(`Version ${targetVersion} not found for node: ${name}`);
      }
      
      return nodeType;
    }
    
    return node as INodeType;
  }
  
  /**
   * Gets known node types
   */
  getKnownTypes(): IDataObject {
    const types: IDataObject = {};
    
    for (const [name, node] of this.nodes) {
      if ('nodeVersions' in node) {
        types[name] = Object.keys((node as IVersionedNodeType).nodeVersions);
      } else {
        const nodeType = node as INodeType;
        types[name] = [nodeType.description.version];
      }
    }
    
    return types;
  }
  
  /**
   * Registers a node type
   */
  registerNode(name: string, node: INodeType | IVersionedNodeType): void {
    this.nodes.set(name, node);
  }
  
  /**
   * Unregisters a node type
   */
  unregisterNode(name: string): void {
    this.nodes.delete(name);
  }
  
  /**
   * Gets all registered nodes
   */
  getAllNodes(): Map<string, INodeType | IVersionedNodeType> {
    return new Map(this.nodes);
  }
}

/**
 * Simple in-memory node loader for testing
 */
export class InMemoryNodeLoader extends AbstractNodeLoader {
  async loadAll(): Promise<Map<string, INodeType>> {
    // No-op for in-memory loader
    return new Map();
  }
}
