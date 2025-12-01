/**
 * Combos export service for the TCG data access layer.
 * Provides export functionality for Commander Spellbook combos.
 */

import { Variant } from '@space-cow-media/spellbook-client';
import { getPrerequisiteList } from './prerequisites-processor';

const LINE_BREAK = '\n';
const CSV_SEPARATOR = ';';

/**
 * Get color identity symbols for a combo.
 */
function getIdentity(combo: Variant): string {
  let identity = '';
  for (const color of combo.identity.split('')) {
    identity += '{' + color + '}';
  }
  return identity;
}

/**
 * Escape a value for CSV format.
 */
function escapeForCsv(value: string): string {
  if (
    value.startsWith('"') ||
    value.endsWith('"') ||
    value.startsWith(' ') ||
    value.endsWith(' ') ||
    value.includes(CSV_SEPARATOR) ||
    value.includes('\n') ||
    value.includes('\r') ||
    value.includes('"')
  ) {
    return `"${value.replaceAll('"', '""')}"`;
  }
  return value;
}

/**
 * Abstract base class for combo export services.
 */
export abstract class BaseCombosExportService {
  /**
   * Export combos to text format.
   * @param combos - The combos to export
   */
  abstract exportToText(combos: Variant[]): string;

  /**
   * Export combos to CSV format.
   * @param combos - The combos to export
   */
  abstract exportToCsv(combos: Variant[]): string;
}

/**
 * Combos export service implementation.
 */
export class CombosExportServiceImpl extends BaseCombosExportService {
  private static instance: CombosExportServiceImpl | null = null;

  private constructor() {
    super();
  }

  /**
   * Get or create the singleton instance.
   */
  static getInstance(): CombosExportServiceImpl {
    if (!CombosExportServiceImpl.instance) {
      CombosExportServiceImpl.instance = new CombosExportServiceImpl();
    }
    return CombosExportServiceImpl.instance;
  }

  /**
   * Reset the singleton instance (useful for testing).
   */
  static resetInstance(): void {
    CombosExportServiceImpl.instance = null;
  }

  /**
   * Export combos to text format.
   * @param combos - The combos to export
   */
  exportToText(combos: Variant[]): string {
    if (!combos) {
      return '';
    }

    const lines: string[] = [];

    for (let indexCombo = 0; indexCombo < combos.length; indexCombo++) {
      const combo = combos[indexCombo];

      lines.push(`${indexCombo + 1}. --------------------------------------`);
      lines.push(getIdentity(combo));
      lines.push(LINE_BREAK);

      lines.push('Cards Required:');
      for (const comboCard of combo.uses) {
        lines.push(`- ${comboCard.card.name}`);
      }
      lines.push(LINE_BREAK);

      lines.push('Prerequisites:');
      const prerequisites = getPrerequisiteList(combo);
      for (const prereq of prerequisites) {
        lines.push(`- ${prereq.description}`);
      }
      lines.push(LINE_BREAK);

      lines.push('Steps:');
      const steps = combo.description.split(LINE_BREAK);

      for (let stepIndex = 0; stepIndex < steps.length; stepIndex++) {
        lines.push(`${stepIndex + 1}. ${steps[stepIndex]}`);
      }
      lines.push(LINE_BREAK);

      lines.push('Results:');
      for (const result of combo.produces) {
        lines.push(`- ${result.feature.name}`);
      }
    }

    return lines.join(LINE_BREAK);
  }

  /**
   * Export combos to CSV format.
   * @param combos - The combos to export
   */
  exportToCsv(combos: Variant[]): string {
    const lines: string[] = [
      `ID${CSV_SEPARATOR}${[...Array(10).keys()].map((i) => `Card ${i + 1}`).join(CSV_SEPARATOR)}${CSV_SEPARATOR}${[
        'Color Identity',
        'Prerequisites',
        'Steps',
        'Results',
      ].join(CSV_SEPARATOR)}`,
    ];

    for (const combo of combos) {
      const cardNames = Array(10)
        .fill('')
        .map((_, i) => {
          return combo.uses.length > i ? escapeForCsv(combo.uses[i].card.name) : '';
        });
      const prerequisites = escapeForCsv(
        getPrerequisiteList(combo)
          .map((p) => p.description)
          .join(' '),
      );
      const steps = escapeForCsv(combo.description.split('\n').join(' '));
      const results = escapeForCsv(combo.produces.map((r) => r.feature.name).join('. ') + '.');
      const identity = escapeForCsv(
        combo.identity
          .split('')
          .map((c) => c.toLowerCase())
          .join(','),
      );
      lines.push(
        `${combo.id}${CSV_SEPARATOR}${cardNames.join(CSV_SEPARATOR)}${CSV_SEPARATOR}${identity}${CSV_SEPARATOR}${prerequisites}${CSV_SEPARATOR}${steps}${CSV_SEPARATOR}${results}`,
      );
    }

    return lines.join(LINE_BREAK);
  }
}

// Legacy default export for backward compatibility
const CombosExportService = {
  exportToText: (combos: Variant[]) => CombosExportServiceImpl.getInstance().exportToText(combos),
  exportToCsv: (combos: Variant[]) => CombosExportServiceImpl.getInstance().exportToCsv(combos),
};

export default CombosExportService;
