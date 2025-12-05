/**
 * Prompt Response DTO
 * 
 * Data Transfer Object for returning prompt data to clients.
 */

export interface PromptResponseDto {
  id: number;
  genaiType: number;
  genaiPrompt: string;
  genaiSystemMessage?: string;
  enabled: boolean;
  projectId: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PromptPaginationResponseDto {
  items: PromptResponseDto[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}
