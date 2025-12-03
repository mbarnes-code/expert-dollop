/**
 * Extension Interface (MCP - Model Context Protocol)
 * 
 * This module defines the shared interfaces for MCP extensions.
 * Extracted from Goose AI Agent (Phase 2 - Shared Abstractions)
 */

import { z } from 'zod';
import { Tool } from './agent.types';

/**
 * Extension status
 */
export enum ExtensionStatus {
  Inactive = 'inactive',
  Loading = 'loading',
  Active = 'active',
  Error = 'error',
  Disabled = 'disabled',
}

/**
 * Extension metadata schema
 */
export const ExtensionMetadataSchema = z.object({
  name: z.string(),
  version: z.string(),
  description: z.string(),
  author: z.string().optional(),
  homepage: z.string().optional(),
  license: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  icon: z.string().optional(),
});

export type ExtensionMetadata = z.infer<typeof ExtensionMetadataSchema>;

/**
 * Extension capabilities schema
 */
export const ExtensionCapabilitiesSchema = z.object({
  tools: z.boolean().default(false),
  prompts: z.boolean().default(false),
  resources: z.boolean().default(false),
  streaming: z.boolean().default(false),
});

export type ExtensionCapabilities = z.infer<typeof ExtensionCapabilitiesSchema>;

/**
 * Extension configuration schema
 */
export const ExtensionConfigSchema = z.object({
  enabled: z.boolean().default(true),
  autoStart: z.boolean().default(false),
  settings: z.record(z.any()).optional(),
  permissions: z.array(z.string()).optional(),
});

export type ExtensionConfig = z.infer<typeof ExtensionConfigSchema>;

/**
 * Extension schema
 */
export const ExtensionSchema = z.object({
  id: z.string(),
  metadata: ExtensionMetadataSchema,
  capabilities: ExtensionCapabilitiesSchema,
  config: ExtensionConfigSchema,
  status: z.nativeEnum(ExtensionStatus),
  loadedAt: z.date().optional(),
  error: z.string().optional(),
});

export type Extension = z.infer<typeof ExtensionSchema>;

/**
 * Prompt template schema
 */
export const PromptTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  template: z.string(),
  parameters: z.array(z.object({
    name: z.string(),
    description: z.string(),
    required: z.boolean().default(false),
    default: z.string().optional(),
  })),
});

export type PromptTemplate = z.infer<typeof PromptTemplateSchema>;

/**
 * Resource schema
 */
export const ResourceSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  uri: z.string(),
  mimeType: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export type Resource = z.infer<typeof ResourceSchema>;

/**
 * Extension Interface
 * 
 * This interface defines the contract for MCP extension implementations.
 */
export interface ExtensionInterface {
  /**
   * Get extension metadata
   */
  getMetadata(): ExtensionMetadata;

  /**
   * Get extension capabilities
   */
  getCapabilities(): ExtensionCapabilities;

  /**
   * Initialize the extension
   */
  initialize(config: ExtensionConfig): Promise<void>;

  /**
   * Shutdown the extension
   */
  shutdown(): Promise<void>;

  /**
   * Get available tools (if capability enabled)
   */
  getTools?(): Promise<Tool[]>;

  /**
   * Get available prompts (if capability enabled)
   */
  getPrompts?(): Promise<PromptTemplate[]>;

  /**
   * Get available resources (if capability enabled)
   */
  getResources?(): Promise<Resource[]>;

  /**
   * Execute a tool
   */
  executeTool?(toolName: string, parameters: Record<string, any>): Promise<any>;

  /**
   * Render a prompt
   */
  renderPrompt?(promptId: string, parameters: Record<string, any>): Promise<string>;

  /**
   * Get a resource
   */
  getResource?(resourceId: string): Promise<any>;
}

/**
 * Extension Repository Interface
 * 
 * This interface defines the contract for extension persistence.
 */
export interface ExtensionRepository {
  /**
   * Save extension configuration
   */
  save(extension: Extension): Promise<void>;

  /**
   * Find an extension by ID
   */
  findById(id: string): Promise<Extension | null>;

  /**
   * List all extensions
   */
  list(options?: {
    enabled?: boolean;
    status?: ExtensionStatus;
  }): Promise<Extension[]>;

  /**
   * Update extension
   */
  update(id: string, updates: Partial<Extension>): Promise<void>;

  /**
   * Delete extension
   */
  delete(id: string): Promise<void>;
}

/**
 * Extension Manager Interface
 * 
 * This interface defines the contract for extension lifecycle management.
 */
export interface ExtensionManager {
  /**
   * Discover available extensions
   */
  discover(): Promise<ExtensionMetadata[]>;

  /**
   * Load an extension
   */
  load(extensionId: string): Promise<Extension>;

  /**
   * Unload an extension
   */
  unload(extensionId: string): Promise<void>;

  /**
   * Get a loaded extension
   */
  getExtension(extensionId: string): Extension | null;

  /**
   * List all loaded extensions
   */
  listExtensions(filter?: {
    status?: ExtensionStatus;
    enabled?: boolean;
  }): Extension[];

  /**
   * Enable an extension
   */
  enable(extensionId: string): Promise<void>;

  /**
   * Disable an extension
   */
  disable(extensionId: string): Promise<void>;

  /**
   * Get all tools from all loaded extensions
   */
  getAllTools(): Promise<Tool[]>;

  /**
   * Get all prompts from all loaded extensions
   */
  getAllPrompts(): Promise<PromptTemplate[]>;

  /**
   * Get all resources from all loaded extensions
   */
  getAllResources(): Promise<Resource[]>;
}

/**
 * Extension event types
 */
export enum ExtensionEventType {
  Loaded = 'extension:loaded',
  Unloaded = 'extension:unloaded',
  Error = 'extension:error',
  Enabled = 'extension:enabled',
  Disabled = 'extension:disabled',
}

/**
 * Extension event schema
 */
export const ExtensionEventSchema = z.object({
  type: z.nativeEnum(ExtensionEventType),
  extensionId: z.string(),
  timestamp: z.date(),
  data: z.any().optional(),
  error: z.string().optional(),
});

export type ExtensionEvent = z.infer<typeof ExtensionEventSchema>;

/**
 * Extension event listener
 */
export type ExtensionEventListener = (event: ExtensionEvent) => void;
