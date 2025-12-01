import type { IDataObject, INodeExecutionData } from '@expert-dollop/n8n-types';

/**
 * Abstract base class for node execution contexts.
 * Provides common functionality for executing nodes across different modules.
 * 
 * Following DDD modular monolith best practices with class abstraction.
 */
export abstract class AbstractNodeExecutionContext {
  protected readonly nodeName: string;
  protected readonly nodeType: string;
  protected readonly runIndex: number;

  constructor(nodeName: string, nodeType: string, runIndex: number = 0) {
    this.nodeName = nodeName;
    this.nodeType = nodeType;
    this.runIndex = runIndex;
  }

  /**
   * Get the node name
   */
  getNodeName(): string {
    return this.nodeName;
  }

  /**
   * Get the node type
   */
  getNodeType(): string {
    return this.nodeType;
  }

  /**
   * Get the current run index
   */
  getRunIndex(): number {
    return this.runIndex;
  }

  /**
   * Get input data for the node
   */
  abstract getInputData(inputIndex?: number): INodeExecutionData[];

  /**
   * Get a node parameter value
   */
  abstract getNodeParameter<T = unknown>(parameterName: string, fallbackValue?: T): T;

  /**
   * Get the workflow static data
   */
  abstract getWorkflowStaticData(type: 'global' | 'node'): IDataObject;

  /**
   * Get credentials for the node
   */
  abstract getCredentials<T extends object = IDataObject>(type: string): Promise<T>;

  /**
   * Check if the node should continue on fail
   */
  abstract continueOnFail(): boolean;

  /**
   * Get the execution ID
   */
  abstract getExecutionId(): string;

  /**
   * Get the workflow ID
   */
  abstract getWorkflowId(): string;

  /**
   * Helper to prepare output data
   */
  protected prepareOutputData(outputData: INodeExecutionData[]): INodeExecutionData[][] {
    return [outputData];
  }

  /**
   * Helper to return JSON array
   */
  protected returnJsonArray(jsonData: IDataObject | IDataObject[]): INodeExecutionData[] {
    const items = Array.isArray(jsonData) ? jsonData : [jsonData];
    return items.map((json) => ({ json }));
  }
}
