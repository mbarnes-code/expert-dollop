/**
 * Prompt Entity
 * 
 * Domain entity representing an AI prompt with versioning and project scoping.
 * Follows DDD principles with rich domain behavior.
 * 
 * Migrated from: features/dispatch/src/dispatch/ai/prompt/models.py
 */

export interface PromptProps {
  id?: number;
  genaiType: number;
  genaiPrompt: string;
  genaiSystemMessage?: string;
  enabled: boolean;
  projectId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class PromptEntity {
  private props: PromptProps;

  constructor(props: PromptProps) {
    this.props = { ...props };
    this.validate();
  }

  // Getters
  get id(): number | undefined {
    return this.props.id;
  }

  get genaiType(): number {
    return this.props.genaiType;
  }

  get genaiPrompt(): string {
    return this.props.genaiPrompt;
  }

  get genaiSystemMessage(): string | undefined {
    return this.props.genaiSystemMessage;
  }

  get enabled(): boolean {
    return this.props.enabled;
  }

  get projectId(): number {
    return this.props.projectId;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  // Domain methods
  enable(): void {
    this.props.enabled = true;
    this.props.updatedAt = new Date();
  }

  disable(): void {
    this.props.enabled = false;
    this.props.updatedAt = new Date();
  }

  updatePrompt(newPrompt: string): void {
    if (!newPrompt || newPrompt.trim().length === 0) {
      throw new Error('Prompt content cannot be empty');
    }
    this.props.genaiPrompt = newPrompt;
    this.props.updatedAt = new Date();
  }

  updateSystemMessage(newMessage: string | undefined): void {
    this.props.genaiSystemMessage = newMessage;
    this.props.updatedAt = new Date();
  }

  // Validation
  private validate(): void {
    if (!this.props.genaiPrompt || this.props.genaiPrompt.trim().length === 0) {
      throw new Error('Prompt content is required');
    }
    if (this.props.genaiType === undefined || this.props.genaiType === null) {
      throw new Error('GenAI type is required');
    }
    if (!this.props.projectId) {
      throw new Error('Project ID is required');
    }
  }

  // Equality
  equals(other: PromptEntity): boolean {
    if (!other) return false;
    return this.props.id === other.props.id;
  }

  // Serialization
  toJSON(): PromptProps {
    return { ...this.props };
  }

  static fromJSON(data: PromptProps): PromptEntity {
    return new PromptEntity(data);
  }
}
