/**
 * Create Prompt DTO
 * 
 * Data Transfer Object for creating a new prompt.
 * Used in the application layer to transfer data from API to domain.
 */

export interface CreatePromptDto {
  genaiType: number;
  genaiPrompt: string;
  genaiSystemMessage?: string;
  enabled: boolean;
  projectId: number;
}

export function validateCreatePromptDto(dto: CreatePromptDto): string[] {
  const errors: string[] = [];

  if (dto.genaiType === undefined || dto.genaiType === null) {
    errors.push('genaiType is required');
  }

  if (!dto.genaiPrompt || dto.genaiPrompt.trim().length === 0) {
    errors.push('genaiPrompt is required and cannot be empty');
  }

  if (dto.genaiPrompt && dto.genaiPrompt.length > 10000) {
    errors.push('genaiPrompt cannot exceed 10000 characters');
  }

  if (dto.genaiSystemMessage && dto.genaiSystemMessage.length > 5000) {
    errors.push('genaiSystemMessage cannot exceed 5000 characters');
  }

  if (dto.enabled === undefined || dto.enabled === null) {
    errors.push('enabled is required');
  }

  if (!dto.projectId) {
    errors.push('projectId is required');
  }

  return errors;
}
