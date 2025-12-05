/**
 * Prompt Repository Interface
 * 
 * Domain repository interface defining the contract for prompt persistence.
 * Follows repository pattern and dependency inversion principle.
 * Infrastructure layer will provide concrete implementation.
 */

import { PromptEntity } from '../entities/prompt.entity';

export interface PromptFilter {
  projectId?: number;
  genaiType?: number;
  enabled?: boolean;
}

export interface PromptPagination {
  items: PromptEntity[];
  total: number;
  page: number;
  perPage: number;
}

export interface IPromptRepository {
  /**
   * Find a prompt by its ID
   */
  findById(id: number): Promise<PromptEntity | null>;

  /**
   * Find an enabled prompt by type and project
   */
  findByTypeAndProject(genaiType: number, projectId: number): Promise<PromptEntity | null>;

  /**
   * Find all prompts matching the filter
   */
  findAll(filter?: PromptFilter): Promise<PromptEntity[]>;

  /**
   * Find prompts with pagination
   */
  findPaginated(
    filter?: PromptFilter,
    page?: number,
    perPage?: number
  ): Promise<PromptPagination>;

  /**
   * Save a new prompt
   */
  create(prompt: PromptEntity): Promise<PromptEntity>;

  /**
   * Update an existing prompt
   */
  update(prompt: PromptEntity): Promise<PromptEntity>;

  /**
   * Delete a prompt by ID
   */
  delete(id: number): Promise<void>;

  /**
   * Check if another enabled prompt of the same type exists for a project
   */
  hasEnabledPromptOfType(genaiType: number, projectId: number, excludeId?: number): Promise<boolean>;
}
