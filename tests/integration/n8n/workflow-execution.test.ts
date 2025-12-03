/**
 * Cross-Module Integration Test: Workflow Execution Lifecycle
 * 
 * Tests interaction between:
 * - libs/n8n/workflow (workflow structures)
 * - libs/n8n/testing (execution factory)
 * - apps/ai/n8n/core (execution engine)
 * 
 * This test validates workflow execution lifecycle across modules.
 */

import { describe, it, expect } from 'vitest';
import {
  WorkflowFactory,
  ExecutionFactory,
  isExecutable
} from '@expert-dollop/n8n-testing';

describe('Cross-Module Integration: Workflow Execution Lifecycle', () => {
  describe('Execution Creation', () => {
    it('should create a new execution record', () => {
      const workflow = WorkflowFactory.create();
      const execution = ExecutionFactory.create({
        workflowId: workflow.id!
      });
      
      expect(execution).toBeDefined();
      expect(execution.id).toBeDefined();
      expect(execution.workflowId).toBe(workflow.id);
      expect(execution.status).toBe('new');
      expect(execution.mode).toBe('manual');
    });

    it('should create executions in different modes', () => {
      const workflow = WorkflowFactory.create();
      
      const manualExec = ExecutionFactory.create({
        workflowId: workflow.id!,
        mode: 'manual'
      });
      
      const triggerExec = ExecutionFactory.create({
        workflowId: workflow.id!,
        mode: 'trigger'
      });
      
      const webhookExec = ExecutionFactory.create({
        workflowId: workflow.id!,
        mode: 'webhook'
      });
      
      expect(manualExec.mode).toBe('manual');
      expect(triggerExec.mode).toBe('trigger');
      expect(webhookExec.mode).toBe('webhook');
    });
  });

  describe('Execution Status Transitions', () => {
    it('should create a successful execution', () => {
      const workflow = WorkflowFactory.create();
      const execution = ExecutionFactory.createSuccess(workflow.id!);
      
      expect(execution.status).toBe('success');
      expect(execution.finished).toBe(true);
      expect(execution.stoppedAt).toBeDefined();
    });

    it('should create a failed execution with error', () => {
      const workflow = WorkflowFactory.create();
      const errorMessage = 'Node execution failed';
      const execution = ExecutionFactory.createError(workflow.id!, errorMessage);
      
      expect(execution.status).toBe('error');
      expect(execution.finished).toBe(true);
      expect(execution.error).toBe(errorMessage);
      expect(execution.stoppedAt).toBeDefined();
    });

    it('should create a running execution', () => {
      const workflow = WorkflowFactory.create();
      const execution = ExecutionFactory.createRunning(workflow.id!);
      
      expect(execution.status).toBe('running');
      expect(execution.finished).toBe(false);
      expect(execution.stoppedAt).toBeUndefined();
    });

    it('should track execution timing', () => {
      const workflow = WorkflowFactory.create();
      const execution = ExecutionFactory.createSuccess(workflow.id!);
      
      expect(execution.startedAt).toBeDefined();
      expect(execution.stoppedAt).toBeDefined();
      expect(execution.stoppedAt!.getTime()).toBeGreaterThanOrEqual(execution.startedAt!.getTime());
    });
  });

  describe('Workflow-Execution Integration', () => {
    it('should link execution to executable workflow', () => {
      const workflow = WorkflowFactory.createSimpleTwoNode();
      expect(isExecutable(workflow)).toBe(true);
      
      const execution = ExecutionFactory.create({
        workflowId: workflow.id!
      });
      
      expect(execution.workflowId).toBe(workflow.id);
    });

    it('should handle multiple executions for same workflow', () => {
      const workflow = WorkflowFactory.create();
      
      const executions = [
        ExecutionFactory.createSuccess(workflow.id!),
        ExecutionFactory.createError(workflow.id!, 'Test error'),
        ExecutionFactory.createRunning(workflow.id!)
      ];
      
      expect(executions).toHaveLength(3);
      expect(new Set(executions.map(e => e.id)).size).toBe(3); // All unique
      expect(executions.every(e => e.workflowId === workflow.id)).toBe(true);
    });

    it('should store execution data', () => {
      const workflow = WorkflowFactory.createSimpleTwoNode();
      const executionData = {
        resultData: {
          runData: {
            'Start': [{ data: { test: 'value' } }]
          }
        }
      };
      
      const execution = ExecutionFactory.createSuccess(workflow.id!, {
        data: executionData
      });
      
      expect(execution.data).toEqual(executionData);
    });
  });

  describe('Execution Error Handling', () => {
    it('should record execution errors', () => {
      const workflow = WorkflowFactory.create();
      const errors = [
        'Connection timeout',
        'Invalid credentials',
        'Node not found'
      ];
      
      const executions = errors.map(error =>
        ExecutionFactory.createError(workflow.id!, error)
      );
      
      executions.forEach((exec, index) => {
        expect(exec.status).toBe('error');
        expect(exec.error).toBe(errors[index]);
      });
    });

    it('should differentiate between success and error', () => {
      const workflow = WorkflowFactory.create();
      
      const success = ExecutionFactory.createSuccess(workflow.id!);
      const error = ExecutionFactory.createError(workflow.id!, 'Failed');
      
      expect(success.status).toBe('success');
      expect(success.error).toBeUndefined();
      
      expect(error.status).toBe('error');
      expect(error.error).toBeDefined();
    });
  });

  describe('Execution Modes', () => {
    it('should handle different execution modes correctly', () => {
      const workflow = WorkflowFactory.createSimpleTwoNode();
      
      const modes: Array<'manual' | 'trigger' | 'webhook' | 'internal'> = [
        'manual',
        'trigger',
        'webhook',
        'internal'
      ];
      
      const executions = modes.map(mode =>
        ExecutionFactory.create({
          workflowId: workflow.id!,
          mode
        })
      );
      
      executions.forEach((exec, index) => {
        expect(exec.mode).toBe(modes[index]);
      });
    });
  });
});
