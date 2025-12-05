/**
 * Prompt Service
 * 
 * Application service for managing prompts.
 * Orchestrates domain logic and coordinates with repository.
 * Follows DDD application service pattern.
 * 
 * Migrated from: features/dispatch/src/dispatch/ai/prompt/service.py
 */

import { PromptEntity } from '../domain/entities/prompt.entity';
import { PromptType } from '../domain/value-objects/prompt-type.vo';
import { IPromptRepository, PromptFilter } from '../domain/repositories/prompt.repository.interface';
import { CreatePromptDto, validateCreatePromptDto } from './dtos/create-prompt.dto';
import { UpdatePromptDto, validateUpdatePromptDto } from './dtos/update-prompt.dto';
import { PromptResponseDto, PromptPaginationResponseDto } from './dtos/prompt-response.dto';

export class PromptService {
  constructor(private readonly promptRepository: IPromptRepository) {}

  /**
   * Get a prompt by ID
   */
  async getPromptById(id: number): Promise<PromptResponseDto | null> {
    const prompt = await this.promptRepository.findById(id);
    return prompt ? this.toResponseDto(prompt) : null;
  }

  /**
   * Get an enabled prompt by type and project
   */
  async getPromptByType(genaiType: number, projectId: number): Promise<PromptResponseDto | null> {
    const prompt = await this.promptRepository.findByTypeAndProject(genaiType, projectId);
    return prompt ? this.toResponseDto(prompt) : null;
  }

  /**
   * Get all prompts with optional filtering
   */
  async getAllPrompts(filter?: PromptFilter): Promise<PromptResponseDto[]> {
    const prompts = await this.promptRepository.findAll(filter);
    return prompts.map(p => this.toResponseDto(p));
  }

  /**
   * Get paginated prompts
   */
  async getPaginatedPrompts(
    filter?: PromptFilter,
    page: number = 1,
    perPage: number = 10
  ): Promise<PromptPaginationResponseDto> {
    const result = await this.promptRepository.findPaginated(filter, page, perPage);
    return {
      items: result.items.map(p => this.toResponseDto(p)),
      total: result.total,
      page: result.page,
      perPage: result.perPage,
      totalPages: Math.ceil(result.total / result.perPage),
    };
  }

  /**
   * Create a new prompt
   */
  async createPrompt(dto: CreatePromptDto): Promise<PromptResponseDto> {
    // Validate DTO
    const errors = validateCreatePromptDto(dto);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // Check if another enabled prompt of the same type exists
    if (dto.enabled) {
      const hasEnabled = await this.promptRepository.hasEnabledPromptOfType(
        dto.genaiType,
        dto.projectId
      );
      if (hasEnabled) {
        const promptType = new PromptType(dto.genaiType);
        throw new Error(
          `Another prompt of type '${promptType.getDisplayName()}' is already enabled for this project. ` +
          'Only one prompt per type can be enabled.'
        );
      }
    }

    // Create domain entity
    const promptEntity = new PromptEntity({
      genaiType: dto.genaiType,
      genaiPrompt: dto.genaiPrompt,
      genaiSystemMessage: dto.genaiSystemMessage,
      enabled: dto.enabled,
      projectId: dto.projectId,
    });

    // Persist
    const created = await this.promptRepository.create(promptEntity);
    return this.toResponseDto(created);
  }

  /**
   * Update an existing prompt
   */
  async updatePrompt(id: number, dto: UpdatePromptDto): Promise<PromptResponseDto> {
    // Validate DTO
    const errors = validateUpdatePromptDto(dto);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // Find existing prompt
    const existingPrompt = await this.promptRepository.findById(id);
    if (!existingPrompt) {
      throw new Error(`Prompt with id ${id} not found`);
    }

    // Check if another enabled prompt of the same type exists
    if (dto.enabled === true) {
      const genaiType = dto.genaiType ?? existingPrompt.genaiType;
      const hasEnabled = await this.promptRepository.hasEnabledPromptOfType(
        genaiType,
        existingPrompt.projectId,
        id
      );
      if (hasEnabled) {
        const promptType = new PromptType(genaiType);
        throw new Error(
          `Another prompt of type '${promptType.getDisplayName()}' is already enabled for this project. ` +
          'Only one prompt per type can be enabled.'
        );
      }
    }

    // Apply updates
    if (dto.genaiPrompt !== undefined) {
      existingPrompt.updatePrompt(dto.genaiPrompt);
    }
    if (dto.genaiSystemMessage !== undefined) {
      existingPrompt.updateSystemMessage(dto.genaiSystemMessage);
    }
    if (dto.enabled !== undefined) {
      dto.enabled ? existingPrompt.enable() : existingPrompt.disable();
    }

    // Persist
    const updated = await this.promptRepository.update(existingPrompt);
    return this.toResponseDto(updated);
  }

  /**
   * Delete a prompt
   */
  async deletePrompt(id: number): Promise<void> {
    const existingPrompt = await this.promptRepository.findById(id);
    if (!existingPrompt) {
      throw new Error(`Prompt with id ${id} not found`);
    }

    await this.promptRepository.delete(id);
  }

  /**
   * Get all available GenAI types
   */
  getAllGenAITypes(): Array<{ value: number; displayName: string }> {
    return PromptType.getAllTypes();
  }

  /**
   * Convert domain entity to response DTO
   */
  private toResponseDto(prompt: PromptEntity): PromptResponseDto {
    return {
      id: prompt.id!,
      genaiType: prompt.genaiType,
      genaiPrompt: prompt.genaiPrompt,
      genaiSystemMessage: prompt.genaiSystemMessage,
      enabled: prompt.enabled,
      projectId: prompt.projectId,
      createdAt: prompt.createdAt?.toISOString(),
      updatedAt: prompt.updatedAt?.toISOString(),
    };
  }
}
