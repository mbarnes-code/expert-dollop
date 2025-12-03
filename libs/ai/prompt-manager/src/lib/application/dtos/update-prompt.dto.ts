/**
 * Update Prompt DTO
 * 
 * Data Transfer Object for updating an existing prompt.
 * All fields are optional to support partial updates.
 */

export interface UpdatePromptDto {
  genaiType?: number;
  genaiPrompt?: string;
  genaiSystemMessage?: string;
  enabled?: boolean;
}

export function validateUpdatePromptDto(dto: UpdatePromptDto): string[] {
  const errors: string[] = [];

  if (dto.genaiPrompt !== undefined) {
    if (!dto.genaiPrompt || dto.genaiPrompt.trim().length === 0) {
      errors.push('genaiPrompt cannot be empty if provided');
    }
    if (dto.genaiPrompt.length > 10000) {
      errors.push('genaiPrompt cannot exceed 10000 characters');
    }
  }

  if (dto.genaiSystemMessage !== undefined && dto.genaiSystemMessage.length > 5000) {
    errors.push('genaiSystemMessage cannot exceed 5000 characters');
  }

  return errors;
}
