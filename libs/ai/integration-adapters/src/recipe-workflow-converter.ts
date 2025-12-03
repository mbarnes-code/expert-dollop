/**
 * Recipe-Workflow Converter
 * 
 * Converts between Goose recipes and n8n workflows bidirectionally.
 * This enables:
 * - Running Goose recipes as n8n workflows
 * - Converting n8n workflows to Goose recipes
 * - Hybrid execution models
 */

export interface GooseRecipe {
	name: string;
	description?: string;
	steps: RecipeStep[];
	parameters?: Record<string, RecipeParameter>;
	metadata?: Record<string, unknown>;
}

export interface RecipeStep {
	type: 'tool' | 'prompt' | 'condition' | 'loop';
	name: string;
	tool?: string;
	prompt?: string;
	condition?: string;
	input?: Record<string, unknown>;
	output?: string;
}

export interface RecipeParameter {
	type: 'string' | 'number' | 'boolean' | 'object';
	description?: string;
	default?: unknown;
	required?: boolean;
}

export interface N8nWorkflow {
	name: string;
	nodes: N8nNode[];
	connections: Record<string, unknown>;
	active: boolean;
	settings?: Record<string, unknown>;
}

export interface N8nNode {
	parameters: Record<string, unknown>;
	name: string;
	type: string;
	typeVersion: number;
	position: [number, number];
	id?: string;
}

/**
 * RecipeWorkflowConverter enables bidirectional conversion
 */
export class RecipeWorkflowConverter {
	/**
	 * Convert a Goose recipe to an n8n workflow
	 */
	recipeToWorkflow(recipe: GooseRecipe): N8nWorkflow {
		const nodes: N8nNode[] = [];
		const connections: Record<string, unknown> = {};
		let yPosition = 0;

		// Add start trigger
		nodes.push({
			parameters: {},
			name: 'When clicking "Execute Workflow"',
			type: 'n8n-nodes-base.manualTrigger',
			typeVersion: 1,
			position: [250, yPosition],
			id: 'trigger',
		});

		yPosition += 100;

		// Convert each recipe step to n8n nodes
		recipe.steps.forEach((step, index) => {
			const nodeId = `step_${index}`;
			
			if (step.type === 'tool') {
				// Convert tool step to Goose Agent node
				nodes.push({
					parameters: {
						operation: 'executeConversation',
						message: `Execute tool: ${step.tool}\n${JSON.stringify(step.input, null, 2)}`,
						options: {
							waitForCompletion: true,
						},
					},
					name: step.name || `Execute ${step.tool}`,
					type: 'gooseAgent',
					typeVersion: 1,
					position: [250, yPosition],
					id: nodeId,
				});
			} else if (step.type === 'prompt') {
				// Convert prompt step to Goose Agent node
				nodes.push({
					parameters: {
						operation: 'executeConversation',
						message: step.prompt || '',
						options: {
							waitForCompletion: true,
						},
					},
					name: step.name || 'Execute Prompt',
					type: 'gooseAgent',
					typeVersion: 1,
					position: [250, yPosition],
					id: nodeId,
				});
			} else if (step.type === 'condition') {
				// Convert condition to IF node
				nodes.push({
					parameters: {
						conditions: {
							string: [
								{
									value1: step.condition || '',
									operation: 'contains',
								},
							],
						},
					},
					name: step.name || 'Condition',
					type: 'n8n-nodes-base.if',
					typeVersion: 1,
					position: [250, yPosition],
					id: nodeId,
				});
			} else if (step.type === 'loop') {
				// Convert loop to Loop Over Items node
				nodes.push({
					parameters: {},
					name: step.name || 'Loop',
					type: 'n8n-nodes-base.splitInBatches',
					typeVersion: 1,
					position: [250, yPosition],
					id: nodeId,
				});
			}

			// Connect to previous node
			if (index === 0) {
				connections['trigger'] = {
					main: [[{ node: nodeId, type: 'main', index: 0 }]],
				};
			} else {
				const prevNodeId = `step_${index - 1}`;
				connections[prevNodeId] = {
					main: [[{ node: nodeId, type: 'main', index: 0 }]],
				};
			}

			yPosition += 100;
		});

		return {
			name: recipe.name,
			nodes,
			connections,
			active: false,
			settings: {
				executionOrder: 'v1',
			},
		};
	}

	/**
	 * Convert an n8n workflow to a Goose recipe
	 */
	workflowToRecipe(workflow: N8nWorkflow): GooseRecipe {
		const steps: RecipeStep[] = [];
		const parameters: Record<string, RecipeParameter> = {};

		// Filter out trigger nodes
		const processableNodes = workflow.nodes.filter(
			(node) => !node.type.includes('Trigger') && !node.type.includes('trigger')
		);

		processableNodes.forEach((node) => {
			if (node.type === 'gooseAgent') {
				// Convert Goose Agent node to recipe step
				const operation = node.parameters.operation as string;
				
				if (operation === 'executeConversation') {
					steps.push({
						type: 'prompt',
						name: node.name,
						prompt: node.parameters.message as string,
					});
				} else if (operation === 'executeRecipe') {
					steps.push({
						type: 'tool',
						name: node.name,
						tool: 'execute_recipe',
						input: {
							recipeName: node.parameters.recipeName,
							parameters: node.parameters.recipeParameters,
						},
					});
				} else if (operation === 'executeSkill') {
					steps.push({
						type: 'tool',
						name: node.name,
						tool: node.parameters.skillName as string,
						input: {
							input: node.parameters.skillInput,
						},
					});
				}
			} else if (node.type.includes('if') || node.type.includes('If')) {
				// Convert IF node to condition step
				steps.push({
					type: 'condition',
					name: node.name,
					condition: JSON.stringify(node.parameters.conditions),
				});
			} else if (node.type.includes('loop') || node.type.includes('Loop')) {
				// Convert loop node
				steps.push({
					type: 'loop',
					name: node.name,
				});
			} else {
				// Convert other nodes to tool steps
				steps.push({
					type: 'tool',
					name: node.name,
					tool: node.type.replace('n8n-nodes-base.', ''),
					input: node.parameters,
				});
			}
		});

		return {
			name: workflow.name,
			description: `Converted from n8n workflow`,
			steps,
			parameters,
			metadata: {
				convertedFrom: 'n8n',
				originalActive: workflow.active,
			},
		};
	}

	/**
	 * Validate a recipe
	 */
	validateRecipe(recipe: GooseRecipe): { valid: boolean; errors: string[] } {
		const errors: string[] = [];

		if (!recipe.name) {
			errors.push('Recipe name is required');
		}

		if (!recipe.steps || recipe.steps.length === 0) {
			errors.push('Recipe must have at least one step');
		}

		recipe.steps.forEach((step, index) => {
			if (!step.type) {
				errors.push(`Step ${index}: type is required`);
			}

			if (step.type === 'tool' && !step.tool) {
				errors.push(`Step ${index}: tool name is required for tool steps`);
			}

			if (step.type === 'prompt' && !step.prompt) {
				errors.push(`Step ${index}: prompt is required for prompt steps`);
			}
		});

		return {
			valid: errors.length === 0,
			errors,
		};
	}

	/**
	 * Validate a workflow
	 */
	validateWorkflow(workflow: N8nWorkflow): { valid: boolean; errors: string[] } {
		const errors: string[] = [];

		if (!workflow.name) {
			errors.push('Workflow name is required');
		}

		if (!workflow.nodes || workflow.nodes.length === 0) {
			errors.push('Workflow must have at least one node');
		}

		// Check for trigger node
		const hasTrigger = workflow.nodes.some(
			(node) => node.type.includes('Trigger') || node.type.includes('trigger')
		);

		if (!hasTrigger) {
			errors.push('Workflow must have a trigger node');
		}

		return {
			valid: errors.length === 0,
			errors,
		};
	}
}
