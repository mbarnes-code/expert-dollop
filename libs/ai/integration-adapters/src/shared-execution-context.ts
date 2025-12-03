/**
 * Shared Execution Context
 * 
 * Provides a shared execution context bridge between Goose agent and n8n workflows.
 * This enables:
 * - Shared variables between agent and workflows
 * - Execution tracking across both systems
 * - Correlation of agent conversations with workflow executions
 * - State persistence and recovery
 */

import type {
	WorkflowExecutionContext,
	AgentConversationContext,
} from '@expert-dollop/workflow-agent-types';

export interface SharedContextConfig {
	storageBackend: 'memory' | 'postgres' | 'redis';
	connectionString?: string;
	ttl?: number; // Time to live in seconds
}

export interface ContextEntry {
	key: string;
	value: unknown;
	createdAt: Date;
	updatedAt: Date;
	expiresAt?: Date;
	metadata?: {
		source: 'agent' | 'workflow';
		conversationId?: string;
		workflowId?: string;
		executionId?: string;
	};
}

/**
 * SharedExecutionContext provides a bridge for state sharing
 */
export class SharedExecutionContext {
	private config: SharedContextConfig;
	private memoryStore: Map<string, ContextEntry>;

	constructor(config: SharedContextConfig) {
		this.config = {
			ttl: 3600, // 1 hour default
			...config,
		};
		this.memoryStore = new Map();
	}

	/**
	 * Set a value in the shared context
	 */
	async set(
		key: string,
		value: unknown,
		metadata?: ContextEntry['metadata']
	): Promise<void> {
		const now = new Date();
		const entry: ContextEntry = {
			key,
			value,
			createdAt: now,
			updatedAt: now,
			expiresAt: this.config.ttl
				? new Date(now.getTime() + this.config.ttl * 1000)
				: undefined,
			metadata,
		};

		if (this.config.storageBackend === 'memory') {
			this.memoryStore.set(key, entry);
		} else if (this.config.storageBackend === 'postgres') {
			await this.setInPostgres(entry);
		} else if (this.config.storageBackend === 'redis') {
			await this.setInRedis(entry);
		}
	}

	/**
	 * Get a value from the shared context
	 */
	async get(key: string): Promise<ContextEntry | null> {
		if (this.config.storageBackend === 'memory') {
			const entry = this.memoryStore.get(key);
			if (!entry) return null;

			// Check expiration
			if (entry.expiresAt && entry.expiresAt < new Date()) {
				this.memoryStore.delete(key);
				return null;
			}

			return entry;
		} else if (this.config.storageBackend === 'postgres') {
			return await this.getFromPostgres(key);
		} else if (this.config.storageBackend === 'redis') {
			return await this.getFromRedis(key);
		}

		return null;
	}

	/**
	 * Delete a value from the shared context
	 */
	async delete(key: string): Promise<void> {
		if (this.config.storageBackend === 'memory') {
			this.memoryStore.delete(key);
		} else if (this.config.storageBackend === 'postgres') {
			await this.deleteFromPostgres(key);
		} else if (this.config.storageBackend === 'redis') {
			await this.deleteFromRedis(key);
		}
	}

	/**
	 * List all keys in the context
	 */
	async list(filter?: {
		source?: 'agent' | 'workflow';
		conversationId?: string;
		workflowId?: string;
	}): Promise<string[]> {
		if (this.config.storageBackend === 'memory') {
			const keys: string[] = [];
			for (const [key, entry] of this.memoryStore.entries()) {
				// Check expiration
				if (entry.expiresAt && entry.expiresAt < new Date()) {
					this.memoryStore.delete(key);
					continue;
				}

				// Apply filter
				if (filter) {
					if (filter.source && entry.metadata?.source !== filter.source) continue;
					if (
						filter.conversationId &&
						entry.metadata?.conversationId !== filter.conversationId
					)
						continue;
					if (filter.workflowId && entry.metadata?.workflowId !== filter.workflowId)
						continue;
				}

				keys.push(key);
			}
			return keys;
		} else if (this.config.storageBackend === 'postgres') {
			return await this.listFromPostgres(filter);
		} else if (this.config.storageBackend === 'redis') {
			return await this.listFromRedis(filter);
		}

		return [];
	}

	/**
	 * Clear all entries
	 */
	async clear(): Promise<void> {
		if (this.config.storageBackend === 'memory') {
			this.memoryStore.clear();
		} else if (this.config.storageBackend === 'postgres') {
			await this.clearPostgres();
		} else if (this.config.storageBackend === 'redis') {
			await this.clearRedis();
		}
	}

	/**
	 * Link agent conversation to workflow execution
	 */
	async linkConversationToWorkflow(
		conversationId: string,
		workflowId: string,
		executionId: string
	): Promise<void> {
		const linkKey = `link:conversation:${conversationId}:workflow:${workflowId}`;
		await this.set(linkKey, { conversationId, workflowId, executionId }, {
			source: 'agent',
			conversationId,
			workflowId,
			executionId,
		});
	}

	/**
	 * Get workflow executions for a conversation
	 */
	async getWorkflowExecutionsForConversation(
		conversationId: string
	): Promise<Array<{ workflowId: string; executionId: string }>> {
		const keys = await this.list({ conversationId });
		const executions: Array<{ workflowId: string; executionId: string }> = [];

		for (const key of keys) {
			if (key.startsWith(`link:conversation:${conversationId}:workflow:`)) {
				const entry = await this.get(key);
				if (entry && typeof entry.value === 'object' && entry.value !== null) {
					const value = entry.value as { workflowId: string; executionId: string };
					executions.push({
						workflowId: value.workflowId,
						executionId: value.executionId,
					});
				}
			}
		}

		return executions;
	}

	// Private methods for PostgreSQL backend
	private async setInPostgres(entry: ContextEntry): Promise<void> {
		// TODO: Implement PostgreSQL storage
		// This would use the integration.shared_state table from the database schema
		console.warn('PostgreSQL storage not yet implemented, using memory fallback');
		this.memoryStore.set(entry.key, entry);
	}

	private async getFromPostgres(key: string): Promise<ContextEntry | null> {
		console.warn('PostgreSQL storage not yet implemented, using memory fallback');
		return this.memoryStore.get(key) || null;
	}

	private async deleteFromPostgres(key: string): Promise<void> {
		console.warn('PostgreSQL storage not yet implemented, using memory fallback');
		this.memoryStore.delete(key);
	}

	private async listFromPostgres(
		filter?: {
			source?: 'agent' | 'workflow';
			conversationId?: string;
			workflowId?: string;
		}
	): Promise<string[]> {
		console.warn('PostgreSQL storage not yet implemented, using memory fallback');
		return this.list(filter);
	}

	private async clearPostgres(): Promise<void> {
		console.warn('PostgreSQL storage not yet implemented, using memory fallback');
		this.memoryStore.clear();
	}

	// Private methods for Redis backend
	private async setInRedis(entry: ContextEntry): Promise<void> {
		// TODO: Implement Redis storage
		console.warn('Redis storage not yet implemented, using memory fallback');
		this.memoryStore.set(entry.key, entry);
	}

	private async getFromRedis(key: string): Promise<ContextEntry | null> {
		console.warn('Redis storage not yet implemented, using memory fallback');
		return this.memoryStore.get(key) || null;
	}

	private async deleteFromRedis(key: string): Promise<void> {
		console.warn('Redis storage not yet implemented, using memory fallback');
		this.memoryStore.delete(key);
	}

	private async listFromRedis(
		filter?: {
			source?: 'agent' | 'workflow';
			conversationId?: string;
			workflowId?: string;
		}
	): Promise<string[]> {
		console.warn('Redis storage not yet implemented, using memory fallback');
		return this.list(filter);
	}

	private async clearRedis(): Promise<void> {
		console.warn('Redis storage not yet implemented, using memory fallback');
		this.memoryStore.clear();
	}
}
