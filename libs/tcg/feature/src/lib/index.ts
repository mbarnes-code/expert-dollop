// tcg-feature library implementation
export const tcg_feature_VERSION = '0.0.1';

// Base classes
export { BaseFeature } from './base-feature';

// Spellbook feature
export { SpellbookFeature, type SpellbookConfig } from './spellbook-feature';

// MTG Scripting Toolkit feature (strangler fig integration)
export * from './scripting-toolkit';
