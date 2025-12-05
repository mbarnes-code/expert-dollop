/**
 * PromptType Value Object
 * 
 * Represents the type of GenAI operation this prompt is used for.
 * Immutable value object following DDD principles.
 * 
 * Migrated from: features/dispatch/src/dispatch/ai/enums.py (GenAIType)
 */

export enum GenAITypeEnum {
  TAG_RECOMMENDATIONS = 1,
  INCIDENT_SUMMARY = 2,
  TACTICAL_REPORT = 3,
  EXECUTIVE_REPORT = 4,
  SIGNAL_ANALYSIS = 5,
  CASE_SUMMARY = 6,
  READ_IN_SUMMARY = 7,
}

export class PromptType {
  private readonly value: number;
  private readonly displayName: string;

  private static readonly TYPE_NAMES: Record<number, string> = {
    [GenAITypeEnum.TAG_RECOMMENDATIONS]: 'Tag Recommendations',
    [GenAITypeEnum.INCIDENT_SUMMARY]: 'Incident Summary',
    [GenAITypeEnum.TACTICAL_REPORT]: 'Tactical Report',
    [GenAITypeEnum.EXECUTIVE_REPORT]: 'Executive Report',
    [GenAITypeEnum.SIGNAL_ANALYSIS]: 'Signal Analysis',
    [GenAITypeEnum.CASE_SUMMARY]: 'Case Summary',
    [GenAITypeEnum.READ_IN_SUMMARY]: 'Read-in Summary',
  };

  constructor(value: number) {
    if (!PromptType.TYPE_NAMES[value]) {
      throw new Error(`Invalid GenAI type: ${value}`);
    }
    this.value = value;
    this.displayName = PromptType.TYPE_NAMES[value];
  }

  getValue(): number {
    return this.value;
  }

  getDisplayName(): string {
    return this.displayName;
  }

  equals(other: PromptType): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.displayName;
  }

  static getAllTypes(): Array<{ value: number; displayName: string }> {
    return Object.entries(PromptType.TYPE_NAMES).map(([value, displayName]) => ({
      value: parseInt(value),
      displayName,
    }));
  }

  static fromValue(value: number): PromptType {
    return new PromptType(value);
  }
}
