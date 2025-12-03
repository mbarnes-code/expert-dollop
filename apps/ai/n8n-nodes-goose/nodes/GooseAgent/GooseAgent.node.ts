import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IDataObject,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

/**
 * Goose Agent Node
 * 
 * This node enables direct integration with the Goose AI Agent from within n8n workflows.
 * Unlike MCP-based integration, this provides native code-level access to Goose's agent
 * execution engine, allowing for tighter integration and lower latency.
 * 
 * Integration points:
 * - Direct execution of Goose agent conversations
 * - Access to Goose's extension system
 * - Shared execution context with n8n workflows
 * - Recipe execution from workflow nodes
 */
export class GooseAgent implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Goose Agent',
		name: 'gooseAgent',
		icon: 'file:goose.svg',
		group: ['transform'],
		version: 1,
		description: 'Execute Goose AI Agent directly from n8n workflows',
		defaults: {
			name: 'Goose Agent',
		},
		inputs: ['main'],
		outputs: ['main'],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Execute Conversation',
						value: 'executeConversation',
						description: 'Run a conversation with the Goose agent',
						action: 'Execute a conversation with Goose',
					},
					{
						name: 'Execute Recipe',
						value: 'executeRecipe',
						description: 'Execute a Goose recipe',
						action: 'Execute a Goose recipe',
					},
					{
						name: 'Execute Skill',
						value: 'executeSkill',
						description: 'Execute a Goose skill',
						action: 'Execute a Goose skill',
					},
					{
						name: 'Get Context',
						value: 'getContext',
						description: 'Retrieve current agent context',
						action: 'Get agent context',
					},
				],
				default: 'executeConversation',
			},
			// Execute Conversation options
			{
				displayName: 'Message',
				name: 'message',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				required: true,
				displayOptions: {
					show: {
						operation: ['executeConversation'],
					},
				},
				description: 'The message to send to the Goose agent',
			},
			{
				displayName: 'Session ID',
				name: 'sessionId',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						operation: ['executeConversation', 'getContext'],
					},
				},
				description: 'Optional session ID to continue an existing conversation. If not provided, a new session will be created.',
			},
			{
				displayName: 'Model',
				name: 'model',
				type: 'options',
				options: [
					{
						name: 'GPT-4',
						value: 'gpt-4',
					},
					{
						name: 'GPT-4 Turbo',
						value: 'gpt-4-turbo-preview',
					},
					{
						name: 'GPT-3.5 Turbo',
						value: 'gpt-3.5-turbo',
					},
					{
						name: 'Claude 3 Opus',
						value: 'claude-3-opus',
					},
					{
						name: 'Claude 3 Sonnet',
						value: 'claude-3-sonnet',
					},
				],
				default: 'gpt-4-turbo-preview',
				displayOptions: {
					show: {
						operation: ['executeConversation', 'executeRecipe'],
					},
				},
				description: 'The AI model to use',
			},
			{
				displayName: 'Extensions',
				name: 'extensions',
				type: 'multiOptions',
				options: [
					{
						name: 'Developer',
						value: 'developer',
						description: 'Software development tools',
					},
					{
						name: 'TODO',
						value: 'todo',
						description: 'Task management',
					},
					{
						name: 'Chat Recall',
						value: 'chatrecall',
						description: 'Search past conversations',
					},
					{
						name: 'Skills',
						value: 'skills',
						description: 'Custom skills from .goose/skills',
					},
				],
				default: ['developer', 'todo'],
				displayOptions: {
					show: {
						operation: ['executeConversation'],
					},
				},
				description: 'Extensions to enable for this execution',
			},
			// Execute Recipe options
			{
				displayName: 'Recipe Name',
				name: 'recipeName',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						operation: ['executeRecipe'],
					},
				},
				description: 'Name of the recipe to execute',
			},
			{
				displayName: 'Recipe Parameters',
				name: 'recipeParameters',
				type: 'json',
				default: '{}',
				displayOptions: {
					show: {
						operation: ['executeRecipe'],
					},
				},
				description: 'Parameters to pass to the recipe as JSON',
			},
			// Execute Skill options
			{
				displayName: 'Skill Name',
				name: 'skillName',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						operation: ['executeSkill'],
					},
				},
				description: 'Name of the skill to execute',
			},
			{
				displayName: 'Skill Input',
				name: 'skillInput',
				type: 'string',
				typeOptions: {
					rows: 2,
				},
				default: '',
				displayOptions: {
					show: {
						operation: ['executeSkill'],
					},
				},
				description: 'Input to provide to the skill',
			},
			// Common options
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Timeout',
						name: 'timeout',
						type: 'number',
						default: 300000,
						description: 'Maximum time in milliseconds to wait for completion',
					},
					{
						displayName: 'Wait for Completion',
						name: 'waitForCompletion',
						type: 'boolean',
						default: true,
						description: 'Whether to wait for the agent to complete before continuing',
					},
					{
						displayName: 'Include Context',
						name: 'includeContext',
						type: 'boolean',
						default: false,
						description: 'Whether to include full agent context in the response',
					},
					{
						displayName: 'Workflow Execution ID',
						name: 'workflowExecutionId',
						type: 'string',
						default: '={{$execution.id}}',
						description: 'Link to n8n workflow execution for tracking',
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const operation = this.getNodeParameter('operation', itemIndex) as string;

				// Get the goose-agent-bridge from the shared library
				const { GooseAgentBridge } = await import('@expert-dollop/integration-adapters');

				const bridge = new GooseAgentBridge({
					// Configuration would come from credentials or settings
					agentEndpoint: process.env.GOOSE_AGENT_ENDPOINT || 'http://localhost:8000',
				});

				let result: IDataObject;

				switch (operation) {
					case 'executeConversation': {
						const message = this.getNodeParameter('message', itemIndex) as string;
						const sessionId = this.getNodeParameter('sessionId', itemIndex, '') as string;
						const model = this.getNodeParameter('model', itemIndex) as string;
						const extensions = this.getNodeParameter('extensions', itemIndex, []) as string[];
						const options = this.getNodeParameter('options', itemIndex, {}) as IDataObject;

						result = await bridge.executeConversation({
							message,
							sessionId: sessionId || undefined,
							model,
							extensions,
							timeout: (options.timeout as number) || 300000,
							waitForCompletion: (options.waitForCompletion as boolean) ?? true,
							includeContext: (options.includeContext as boolean) || false,
							metadata: {
								workflowExecutionId: (options.workflowExecutionId as string) || this.getExecutionId(),
								workflowId: this.getWorkflow().id,
								nodeId: this.getNode().id,
							},
						});
						break;
					}

					case 'executeRecipe': {
						const recipeName = this.getNodeParameter('recipeName', itemIndex) as string;
						const recipeParametersStr = this.getNodeParameter('recipeParameters', itemIndex, '{}') as string;
						const model = this.getNodeParameter('model', itemIndex) as string;
						const options = this.getNodeParameter('options', itemIndex, {}) as IDataObject;

						let recipeParameters: IDataObject;
						try {
							recipeParameters = JSON.parse(recipeParametersStr);
						} catch (error) {
							throw new NodeOperationError(
								this.getNode(),
								`Invalid JSON in Recipe Parameters: ${(error as Error).message}`,
								{ itemIndex }
							);
						}

						result = await bridge.executeRecipe({
							recipeName,
							parameters: recipeParameters,
							model,
							timeout: (options.timeout as number) || 300000,
							metadata: {
								workflowExecutionId: (options.workflowExecutionId as string) || this.getExecutionId(),
								workflowId: this.getWorkflow().id,
								nodeId: this.getNode().id,
							},
						});
						break;
					}

					case 'executeSkill': {
						const skillName = this.getNodeParameter('skillName', itemIndex) as string;
						const skillInput = this.getNodeParameter('skillInput', itemIndex, '') as string;
						const options = this.getNodeParameter('options', itemIndex, {}) as IDataObject;

						result = await bridge.executeSkill({
							skillName,
							input: skillInput,
							timeout: (options.timeout as number) || 300000,
							metadata: {
								workflowExecutionId: (options.workflowExecutionId as string) || this.getExecutionId(),
								workflowId: this.getWorkflow().id,
								nodeId: this.getNode().id,
							},
						});
						break;
					}

					case 'getContext': {
						const sessionId = this.getNodeParameter('sessionId', itemIndex) as string;

						if (!sessionId) {
							throw new NodeOperationError(
								this.getNode(),
								'Session ID is required for Get Context operation',
								{ itemIndex }
							);
						}

						result = await bridge.getContext({ sessionId });
						break;
					}

					default:
						throw new NodeOperationError(
							this.getNode(),
							`Unknown operation: ${operation}`,
							{ itemIndex }
						);
				}

				returnData.push({
					json: result,
					pairedItem: { item: itemIndex },
				});
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: (error as Error).message,
						},
						pairedItem: { item: itemIndex },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
