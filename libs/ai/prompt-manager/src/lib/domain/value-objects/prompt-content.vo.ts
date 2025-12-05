/**
 * PromptContent Value Object
 * 
 * Represents the content of a prompt with validation.
 * Immutable value object following DDD principles.
 */

export class PromptContent {
  private readonly promptText: string;
  private readonly systemMessage?: string;

  constructor(promptText: string, systemMessage?: string) {
    if (!promptText || promptText.trim().length === 0) {
      throw new Error('Prompt text cannot be empty');
    }
    if (promptText.length > 10000) {
      throw new Error('Prompt text cannot exceed 10000 characters');
    }
    if (systemMessage && systemMessage.length > 5000) {
      throw new Error('System message cannot exceed 5000 characters');
    }

    this.promptText = promptText.trim();
    this.systemMessage = systemMessage?.trim();
  }

  getPromptText(): string {
    return this.promptText;
  }

  getSystemMessage(): string | undefined {
    return this.systemMessage;
  }

  hasSystemMessage(): boolean {
    return !!this.systemMessage;
  }

  equals(other: PromptContent): boolean {
    return (
      this.promptText === other.promptText &&
      this.systemMessage === other.systemMessage
    );
  }

  toString(): string {
    return this.promptText;
  }

  static create(promptText: string, systemMessage?: string): PromptContent {
    return new PromptContent(promptText, systemMessage);
  }
}
