/**
 * Node type registry for the task runner.
 * Manages node type descriptions needed for workflow execution.
 */
import { ApplicationError } from '@expert-dollop/n8n-errors';

import type { NeededNodeType, INodeTypeDescription } from './runner-types';

/** Type alias for versioned node type descriptions */
type VersionedTypes = Map<number, INodeTypeDescription>;

/** Default version for node types that don't specify one */
export const DEFAULT_NODETYPE_VERSION = 1;

/**
 * Interface for node types (simplified from n8n-workflow).
 */
export interface INodeTypes {
  getByName(nodeType: string): unknown;
  getByNameAndVersion(nodeType: string, version?: number): unknown;
  getKnownTypes(): Record<string, unknown>;
}

/**
 * Interface for node type (simplified from n8n-workflow).
 */
export interface INodeType {
  description: INodeTypeDescription;
}

/**
 * Registry for node types used by the task runner.
 * Stores node type descriptions indexed by name and version.
 */
export class TaskRunnerNodeTypes implements INodeTypes {
  private nodeTypesByVersion: Map<string, VersionedTypes>;

  constructor(nodeTypes: INodeTypeDescription[]) {
    this.nodeTypesByVersion = this.parseNodeTypes(nodeTypes);
  }

  /**
   * Parses an array of node types into a map organized by name and version.
   */
  private parseNodeTypes(nodeTypes: INodeTypeDescription[]): Map<string, VersionedTypes> {
    const versionedTypes = new Map<string, VersionedTypes>();

    for (const nt of nodeTypes) {
      const versions = Array.isArray(nt.version)
        ? nt.version
        : [nt.version ?? DEFAULT_NODETYPE_VERSION];

      const versioned: VersionedTypes =
        versionedTypes.get(nt.name) ?? new Map<number, INodeTypeDescription>();

      for (const version of versions) {
        versioned.set(version, { ...versioned.get(version), ...nt });
      }

      versionedTypes.set(nt.name, versioned);
    }

    return versionedTypes;
  }

  /**
   * Get a node type by name.
   * @throws ApplicationError - This method is not implemented.
   */
  getByName(_nodeType: string): never {
    throw new ApplicationError('Unimplemented `getByName`', { level: 'error' });
  }

  /**
   * Get a node type by name and version.
   * If version is not specified, returns the highest available version.
   *
   * @param nodeType - The name of the node type
   * @param version - Optional specific version to retrieve
   * @returns The node type or undefined if not found
   */
  getByNameAndVersion(nodeType: string, version?: number): INodeType | undefined {
    const versions = this.nodeTypesByVersion.get(nodeType);
    if (!versions) {
      return undefined;
    }

    const nodeVersion = versions.get(version ?? Math.max(...versions.keys()));
    if (!nodeVersion) {
      return undefined;
    }

    return {
      description: nodeVersion,
    };
  }

  /**
   * Get known types.
   * @throws ApplicationError - This method is not implemented.
   */
  getKnownTypes(): never {
    throw new ApplicationError('Unimplemented `getKnownTypes`', { level: 'error' });
  }

  /**
   * Adds new node type descriptions to the registry.
   * Updates existing entries if they already exist.
   *
   * @param nodeTypeDescriptions - Array of node types to add
   */
  addNodeTypeDescriptions(nodeTypeDescriptions: INodeTypeDescription[]) {
    const newNodeTypes = this.parseNodeTypes(nodeTypeDescriptions);

    for (const [name, newVersions] of newNodeTypes.entries()) {
      if (!this.nodeTypesByVersion.has(name)) {
        this.nodeTypesByVersion.set(name, newVersions);
      } else {
        const existingVersions = this.nodeTypesByVersion.get(name)!;
        for (const [version, nodeType] of newVersions.entries()) {
          existingVersions.set(version, nodeType);
        }
      }
    }
  }

  /**
   * Filter out node type versions that are already registered.
   *
   * @param nodeTypes - Array of needed node types to check
   * @returns Array of node types that are not yet registered
   */
  onlyUnknown(nodeTypes: NeededNodeType[]): NeededNodeType[] {
    return nodeTypes.filter(({ name, version }) => {
      const existingVersions = this.nodeTypesByVersion.get(name);

      if (!existingVersions) return true;

      return !existingVersions.has(version);
    });
  }
}
