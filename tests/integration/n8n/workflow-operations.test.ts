/**
 * Cross-Module Integration Test: Workflow Creation and Basic Operations
 * 
 * Tests interaction between:
 * - libs/n8n/workflow (workflow structures)
 * - libs/n8n/db (database operations)
 * - apps/ai/n8n/db (entities)
 * 
 * This test validates that workflows can be created and managed across modules.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  WorkflowFactory,
  validateWorkflowStructure,
  countNodesByType,
  isExecutable
} from '@expert-dollop/n8n-testing';

describe('Cross-Module Integration: Workflow Operations', () => {
  describe('Workflow Creation and Validation', () => {
    it('should create a valid basic workflow', () => {
      const workflow = WorkflowFactory.create();
      
      expect(workflow).toBeDefined();
      expect(workflow.id).toBeDefined();
      expect(workflow.name).toBe('Test Workflow');
      expect(workflow.nodes).toHaveLength(1);
      expect(workflow.active).toBe(false);
    });

    it('should validate workflow structure correctly', () => {
      const workflow = WorkflowFactory.create();
      
      expect(() => validateWorkflowStructure(workflow)).not.toThrow();
    });

    it('should detect invalid workflows', () => {
      const invalidWorkflow: any = {
        id: '123',
        name: '',  // Invalid: empty name
        nodes: [],
        connections: {}
      };
      
      expect(() => validateWorkflowStructure(invalidWorkflow)).toThrow('Workflow must have a name');
    });

    it('should create a two-node workflow with connections', () => {
      const workflow = WorkflowFactory.createSimpleTwoNode();
      
      expect(workflow.nodes).toHaveLength(2);
      expect(workflow.connections).toBeDefined();
      expect(workflow.connections['Start']).toBeDefined();
      expect(workflow.connections['Start']['main']).toBeDefined();
    });
  });

  describe('Workflow Node Analysis', () => {
    it('should count nodes by type correctly', () => {
      const workflow = WorkflowFactory.createSimpleTwoNode();
      const counts = countNodesByType(workflow);
      
      expect(counts['n8n-nodes-base.start']).toBe(1);
      expect(counts['n8n-nodes-base.set']).toBe(1);
    });

    it('should determine if workflow is executable', () => {
      const executableWorkflow = WorkflowFactory.createSimpleTwoNode();
      expect(isExecutable(executableWorkflow)).toBe(true);
      
      const nonExecutableWorkflow = WorkflowFactory.create({
        nodes: [
          {
            id: 'no-start',
            name: 'No Start',
            type: 'n8n-nodes-base.set',
            typeVersion: 1,
            position: [0, 0],
            parameters: {}
          }
        ]
      });
      expect(isExecutable(nonExecutableWorkflow)).toBe(false);
    });
  });

  describe('Workflow with HTTP Request', () => {
    it('should create workflow with HTTP request node', () => {
      const url = 'https://api.test.com/data';
      const workflow = WorkflowFactory.createWithHttpRequest(url);
      
      expect(workflow.nodes).toHaveLength(2);
      
      const httpNode = workflow.nodes.find(n => n.type === 'n8n-nodes-base.httpRequest');
      expect(httpNode).toBeDefined();
      expect(httpNode?.parameters?.url).toBe(url);
    });
  });

  describe('Active Workflows', () => {
    it('should create an active workflow', () => {
      const workflow = WorkflowFactory.createActive();
      
      expect(workflow.active).toBe(true);
    });

    it('should toggle workflow active state', () => {
      const workflow = WorkflowFactory.create({ active: false });
      expect(workflow.active).toBe(false);
      
      workflow.active = true;
      expect(workflow.active).toBe(true);
    });
  });

  describe('Workflow Connections', () => {
    it('should validate connections reference existing nodes', () => {
      const workflow = WorkflowFactory.createSimpleTwoNode();
      
      expect(() => validateWorkflowStructure(workflow)).not.toThrow();
    });

    it('should detect invalid connection references', () => {
      const invalidWorkflow = WorkflowFactory.create({
        nodes: [
          {
            id: 'start',
            name: 'Start',
            type: 'n8n-nodes-base.start',
            typeVersion: 1,
            position: [0, 0],
            parameters: {}
          }
        ],
        connections: {
          'Start': {
            'main': [
              [
                {
                  node: 'NonExistentNode',  // Invalid reference
                  type: 'main',
                  index: 0
                }
              ]
            ]
          }
        }
      });
      
      expect(() => validateWorkflowStructure(invalidWorkflow)).toThrow(/does not exist in nodes/);
    });
  });
});
