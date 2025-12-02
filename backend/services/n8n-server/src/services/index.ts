/**
 * Service base classes and utilities.
 * Common patterns for business logic services.
 */

/**
 * Abstract service class.
 * Extend this to create business logic services.
 */
export abstract class AbstractService {
  /**
   * Initialize the service.
   */
  abstract init(): Promise<void>;

  /**
   * Shutdown the service.
   */
  abstract shutdown(): Promise<void>;
}

/**
 * Abstract CRUD service.
 * Provides standard CRUD operations for an entity.
 */
export abstract class AbstractCrudService<T, CreateDto, UpdateDto> extends AbstractService {
  /**
   * Create a new entity.
   */
  abstract create(data: CreateDto): Promise<T>;

  /**
   * Find an entity by ID.
   */
  abstract findById(id: string): Promise<T | null>;

  /**
   * Find all entities with optional filtering.
   */
  abstract findAll(options?: FindAllOptions): Promise<T[]>;

  /**
   * Count entities.
   */
  abstract count(filter?: Record<string, unknown>): Promise<number>;

  /**
   * Update an entity.
   */
  abstract update(id: string, data: UpdateDto): Promise<T>;

  /**
   * Delete an entity.
   */
  abstract delete(id: string): Promise<void>;

  /**
   * Check if an entity exists.
   */
  async exists(id: string): Promise<boolean> {
    const entity = await this.findById(id);
    return entity !== null;
  }
}

/**
 * Find all options interface.
 */
export interface FindAllOptions {
  filter?: Record<string, unknown>;
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
  pagination?: {
    limit: number;
    offset: number;
  };
  include?: string[];
}

/**
 * Abstract workflow service.
 * Handles workflow-specific operations.
 */
export abstract class AbstractWorkflowService extends AbstractCrudService<
  Workflow,
  CreateWorkflowDto,
  UpdateWorkflowDto
> {
  /**
   * Execute a workflow.
   */
  abstract execute(
    workflowId: string,
    options: WorkflowExecuteOptions,
  ): Promise<WorkflowExecution>;

  /**
   * Activate a workflow.
   */
  abstract activate(workflowId: string): Promise<void>;

  /**
   * Deactivate a workflow.
   */
  abstract deactivate(workflowId: string): Promise<void>;

  /**
   * Get workflow execution history.
   */
  abstract getExecutions(
    workflowId: string,
    options?: FindAllOptions,
  ): Promise<WorkflowExecution[]>;
}

/**
 * Workflow interface.
 */
export interface Workflow {
  id: string;
  name: string;
  active: boolean;
  nodes: unknown[];
  connections: unknown;
  settings?: Record<string, unknown>;
  staticData?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create workflow DTO.
 */
export interface CreateWorkflowDto {
  name: string;
  nodes: unknown[];
  connections: unknown;
  settings?: Record<string, unknown>;
}

/**
 * Update workflow DTO.
 */
export interface UpdateWorkflowDto {
  name?: string;
  nodes?: unknown[];
  connections?: unknown;
  settings?: Record<string, unknown>;
  active?: boolean;
}

/**
 * Workflow execute options.
 */
export interface WorkflowExecuteOptions {
  mode: 'manual' | 'trigger' | 'cli';
  startNodes?: string[];
  destinationNode?: string;
  data?: Record<string, unknown>;
}

/**
 * Workflow execution interface.
 */
export interface WorkflowExecution {
  id: string;
  workflowId: string;
  finished: boolean;
  mode: string;
  retryOf?: string;
  retrySuccessId?: string;
  startedAt: Date;
  stoppedAt?: Date;
  status: 'new' | 'running' | 'success' | 'error' | 'canceled' | 'waiting';
  data?: unknown;
}

/**
 * Abstract credentials service.
 * Handles credential-specific operations.
 */
export abstract class AbstractCredentialsService extends AbstractCrudService<
  Credential,
  CreateCredentialDto,
  UpdateCredentialDto
> {
  /**
   * Encrypt credential data.
   */
  abstract encrypt(data: Record<string, unknown>): Promise<string>;

  /**
   * Decrypt credential data.
   */
  abstract decrypt(encryptedData: string): Promise<Record<string, unknown>>;

  /**
   * Test credentials.
   */
  abstract test(credentialId: string): Promise<CredentialTestResult>;

  /**
   * Get credentials by type.
   */
  abstract findByType(credentialType: string): Promise<Credential[]>;
}

/**
 * Credential interface.
 */
export interface Credential {
  id: string;
  name: string;
  type: string;
  data: string; // Encrypted
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create credential DTO.
 */
export interface CreateCredentialDto {
  name: string;
  type: string;
  data: Record<string, unknown>;
}

/**
 * Update credential DTO.
 */
export interface UpdateCredentialDto {
  name?: string;
  data?: Record<string, unknown>;
}

/**
 * Credential test result.
 */
export interface CredentialTestResult {
  status: 'OK' | 'Error';
  message?: string;
}

/**
 * Abstract execution service.
 * Handles workflow execution operations.
 */
export abstract class AbstractExecutionService extends AbstractService {
  /**
   * Get execution by ID.
   */
  abstract getById(id: string): Promise<WorkflowExecution | null>;

  /**
   * Get executions for a workflow.
   */
  abstract getByWorkflow(
    workflowId: string,
    options?: FindAllOptions,
  ): Promise<WorkflowExecution[]>;

  /**
   * Stop a running execution.
   */
  abstract stop(executionId: string): Promise<void>;

  /**
   * Retry a failed execution.
   */
  abstract retry(executionId: string): Promise<WorkflowExecution>;

  /**
   * Delete executions.
   */
  abstract deleteMany(executionIds: string[]): Promise<number>;

  /**
   * Get execution statistics.
   */
  abstract getStats(options?: {
    workflowId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<ExecutionStats>;
}

/**
 * Execution statistics.
 */
export interface ExecutionStats {
  total: number;
  success: number;
  error: number;
  running: number;
  waiting: number;
  averageDuration: number;
}

/**
 * Service container for dependency injection.
 */
export class ServiceContainer {
  private readonly services: Map<string, AbstractService> = new Map();

  /**
   * Register a service.
   */
  register<T extends AbstractService>(name: string, service: T): void {
    this.services.set(name, service);
  }

  /**
   * Get a service.
   */
  get<T extends AbstractService>(name: string): T {
    const service = this.services.get(name);
    if (!service) {
      throw new Error(`Service not found: ${name}`);
    }
    return service as T;
  }

  /**
   * Initialize all services.
   */
  async initAll(): Promise<void> {
    for (const service of this.services.values()) {
      await service.init();
    }
  }

  /**
   * Shutdown all services.
   */
  async shutdownAll(): Promise<void> {
    for (const service of this.services.values()) {
      await service.shutdown();
    }
  }
}
