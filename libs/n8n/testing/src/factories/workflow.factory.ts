/**
 * Workflow Factory for creating test workflows
 * Used across cross-module integration tests
 */

import { generateNanoId } from '@expert-dollop/n8n-db';

export interface INode {
  id: string;
  name: string;
  type: string;
  typeVersion?: number;
  position: [number, number];
  parameters?: Record<string, any>;
  credentials?: Record<string, any>;
}

export interface IConnections {
  [key: string]: {
    [key: string]: Array<{
      node: string;
      type: string;
      index: number;
    }>;
  };
}

export interface IWorkflow {
  id?: string;
  name: string;
  active: boolean;
  nodes: INode[];
  connections: IConnections;
  settings?: Record<string, any>;
  staticData?: Record<string, any>;
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export class WorkflowFactory {
  /**
   * Create a basic test workflow
   */
  static create(overrides?: Partial<IWorkflow>): IWorkflow {
    return {
      id: overrides?.id || generateNanoId(),
      name: overrides?.name || 'Test Workflow',
      active: overrides?.active ?? false,
      nodes: overrides?.nodes || [
        {
          id: 'start',
          name: 'Start',
          type: 'n8n-nodes-base.start',
          typeVersion: 1,
          position: [250, 300],
          parameters: {}
        }
      ],
      connections: overrides?.connections || {},
      settings: overrides?.settings || {},
      staticData: overrides?.staticData || {},
      tags: overrides?.tags || [],
      createdAt: overrides?.createdAt || new Date(),
      updatedAt: overrides?.updatedAt || new Date()
    };
  }

  /**
   * Create a workflow with custom nodes
   */
  static createWithNodes(nodes: INode[], connections?: IConnections): IWorkflow {
    return this.create({ nodes, connections: connections || {} });
  }

  /**
   * Create a simple two-node workflow (Start -> Set)
   */
  static createSimpleTwoNode(): IWorkflow {
    const nodes: INode[] = [
      {
        id: 'start',
        name: 'Start',
        type: 'n8n-nodes-base.start',
        typeVersion: 1,
        position: [250, 300],
        parameters: {}
      },
      {
        id: 'set',
        name: 'Set',
        type: 'n8n-nodes-base.set',
        typeVersion: 1,
        position: [450, 300],
        parameters: {
          values: {
            string: [
              {
                name: 'test',
                value: 'value'
              }
            ]
          }
        }
      }
    ];

    const connections: IConnections = {
      'Start': {
        'main': [
          [
            {
              node: 'Set',
              type: 'main',
              index: 0
            }
          ]
        ]
      }
    };

    return this.create({ nodes, connections });
  }

  /**
   * Create a workflow with HTTP request node
   */
  static createWithHttpRequest(url: string = 'https://api.example.com/data'): IWorkflow {
    const nodes: INode[] = [
      {
        id: 'start',
        name: 'Start',
        type: 'n8n-nodes-base.start',
        typeVersion: 1,
        position: [250, 300],
        parameters: {}
      },
      {
        id: 'http',
        name: 'HTTP Request',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 1,
        position: [450, 300],
        parameters: {
          url,
          method: 'GET'
        }
      }
    ];

    const connections: IConnections = {
      'Start': {
        'main': [
          [
            {
              node: 'HTTP Request',
              type: 'main',
              index: 0
            }
          ]
        ]
      }
    };

    return this.create({ nodes, connections });
  }

  /**
   * Create an active workflow
   */
  static createActive(overrides?: Partial<IWorkflow>): IWorkflow {
    return this.create({ ...overrides, active: true });
  }
}
