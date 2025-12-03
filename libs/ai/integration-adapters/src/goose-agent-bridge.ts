/**
 * Goose Agent Bridge
 * 
 * Provides code-level integration between n8n workflows and the Goose AI Agent.
 * This is a native TypeScript/Rust bridge that bypasses MCP for performance-critical operations.
 */

import type {
	AgentWorkflowRequest,
	WorkflowExecutionContext,
} from '@expert-dollop/workflow-agent-types';

export interface GooseAgentConfig {
	agentEndpoint: string;
	apiKey?: string;
	timeout?: number;
}

export interface ConversationRequest {
	message: string;
	sessionId?: string;
	model?: string;
	extensions?: string[];
	timeout?: number;
	waitForCompletion?: boolean;
	includeContext?: boolean;
	metadata?: {
		workflowExecutionId?: string;
		workflowId?: string;
		nodeId?: string;
	};
}

export interface RecipeRequest {
	recipeName: string;
	parameters?: Record<string, unknown>;
	model?: string;
	timeout?: number;
	metadata?: {
		workflowExecutionId?: string;
		workflowId?: string;
		nodeId?: string;
	};
}

export interface SkillRequest {
	skillName: string;
	input?: string;
	timeout?: number;
	metadata?: {
		workflowExecutionId?: string;
		workflowId?: string;
		nodeId?: string;
	};
}

export interface ContextRequest {
	sessionId: string;
}

export interface AgentResponse {
	sessionId: string;
	response: string;
	status: 'completed' | 'running' | 'error';
	executionTime?: number;
	context?: {
		messages: Array<{
			role: string;
			content: string;
			timestamp: string;
		}>;
		variables: Record<string, unknown>;
		activeExtensions: string[];
	};
	error?: string;
	metadata?: Record<string, unknown>;
}

/**
 * GooseAgentBridge provides direct integration with Goose Agent
 * 
 * Integration approaches:
 * 1. HTTP API (current) - REST API to Goose server
 * 2. Direct Rust FFI - Native Rust function calls (future)
 * 3. Shared memory - IPC via shared memory regions (future)
 * 4. WASM module - Goose compiled to WebAssembly (future)
 */
export class GooseAgentBridge {
	private config: GooseAgentConfig;
	private httpClient: typeof fetch;

	constructor(config: GooseAgentConfig) {
		this.config = {
			timeout: 300000,
			...config,
		};
		this.httpClient = fetch;
	}

	/**
	 * Execute a conversation with the Goose agent
	 */
	async executeConversation(request: ConversationRequest): Promise<AgentResponse> {
		const startTime = Date.now();

		try {
			const response = await this.httpClient(`${this.config.agentEndpoint}/api/conversation`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` }),
				},
				body: JSON.stringify({
					message: request.message,
					session_id: request.sessionId,
					model: request.model,
					extensions: request.extensions,
					wait_for_completion: request.waitForCompletion ?? true,
					include_context: request.includeContext,
					metadata: request.metadata,
				}),
				signal: AbortSignal.timeout(request.timeout || this.config.timeout || 300000),
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(`Agent request failed: ${response.status} - ${errorText}`);
			}

			const data = await response.json();
			const executionTime = Date.now() - startTime;

			return {
				sessionId: data.session_id,
				response: data.response,
				status: data.status || 'completed',
				executionTime,
				context: request.includeContext ? data.context : undefined,
				metadata: {
					...request.metadata,
					agentModel: request.model,
					extensions: request.extensions,
				},
			};
		} catch (error) {
			return {
				sessionId: request.sessionId || 'unknown',
				response: '',
				status: 'error',
				executionTime: Date.now() - startTime,
				error: (error as Error).message,
				metadata: request.metadata,
			};
		}
	}

	/**
	 * Execute a Goose recipe
	 */
	async executeRecipe(request: RecipeRequest): Promise<AgentResponse> {
		const startTime = Date.now();

		try {
			const response = await this.httpClient(`${this.config.agentEndpoint}/api/recipe`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` }),
				},
				body: JSON.stringify({
					recipe_name: request.recipeName,
					parameters: request.parameters,
					model: request.model,
					metadata: request.metadata,
				}),
				signal: AbortSignal.timeout(request.timeout || this.config.timeout || 300000),
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(`Recipe execution failed: ${response.status} - ${errorText}`);
			}

			const data = await response.json();
			const executionTime = Date.now() - startTime;

			return {
				sessionId: data.session_id || 'recipe',
				response: data.result || data.response,
				status: data.status || 'completed',
				executionTime,
				metadata: {
					...request.metadata,
					recipeName: request.recipeName,
					parameters: request.parameters,
				},
			};
		} catch (error) {
			return {
				sessionId: 'recipe',
				response: '',
				status: 'error',
				executionTime: Date.now() - startTime,
				error: (error as Error).message,
				metadata: request.metadata,
			};
		}
	}

	/**
	 * Execute a Goose skill
	 */
	async executeSkill(request: SkillRequest): Promise<AgentResponse> {
		const startTime = Date.now();

		try {
			const response = await this.httpClient(`${this.config.agentEndpoint}/api/skill`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` }),
				},
				body: JSON.stringify({
					skill_name: request.skillName,
					input: request.input,
					metadata: request.metadata,
				}),
				signal: AbortSignal.timeout(request.timeout || this.config.timeout || 300000),
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(`Skill execution failed: ${response.status} - ${errorText}`);
			}

			const data = await response.json();
			const executionTime = Date.now() - startTime;

			return {
				sessionId: data.session_id || 'skill',
				response: data.result || data.response,
				status: data.status || 'completed',
				executionTime,
				metadata: {
					...request.metadata,
					skillName: request.skillName,
				},
			};
		} catch (error) {
			return {
				sessionId: 'skill',
				response: '',
				status: 'error',
				executionTime: Date.now() - startTime,
				error: (error as Error).message,
				metadata: request.metadata,
			};
		}
	}

	/**
	 * Get agent context for a session
	 */
	async getContext(request: ContextRequest): Promise<AgentResponse> {
		const startTime = Date.now();

		try {
			const response = await this.httpClient(
				`${this.config.agentEndpoint}/api/context/${request.sessionId}`,
				{
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
						...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` }),
					},
					signal: AbortSignal.timeout(this.config.timeout || 300000),
				}
			);

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(`Get context failed: ${response.status} - ${errorText}`);
			}

			const data = await response.json();
			const executionTime = Date.now() - startTime;

			return {
				sessionId: request.sessionId,
				response: '',
				status: 'completed',
				executionTime,
				context: data.context,
			};
		} catch (error) {
			return {
				sessionId: request.sessionId,
				response: '',
				status: 'error',
				executionTime: Date.now() - startTime,
				error: (error as Error).message,
			};
		}
	}
}

/**
 * Future integration approach: Direct Rust FFI
 * 
 * This would allow calling Goose agent functions directly from Node.js
 * without the overhead of HTTP requests.
 * 
 * Example:
 * ```rust
 * #[napi]
 * pub async fn execute_conversation_native(
 *     message: String,
 *     session_id: Option<String>,
 * ) -> Result<AgentResponse> {
 *     // Direct function call into Goose
 * }
 * ```
 * 
 * Benefits:
 * - Zero serialization overhead
 * - Shared memory between Node.js and Rust
 * - 10-100x faster than HTTP for simple operations
 * - Direct access to Goose internal state
 */
