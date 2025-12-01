/**
 * MTG Scripting Toolkit - Feature Layer
 * 
 * This module provides the feature layer for the mtg-scripting-toolkit
 * strangler fig integration, following DDD modular monolith best practices.
 * 
 * @example
 * ```typescript
 * import { ScriptingToolkitFeature } from '@expert-dollop/tcg/feature';
 * 
 * const toolkit = ScriptingToolkitFeature.getInstance();
 * await toolkit.initialize();
 * 
 * // Analyze and sort cards
 * const sorted = toolkit.sortCards(cards);
 * const analysis = toolkit.analyzeCards(cards);
 * ```
 */

export {
  ScriptingToolkitFeature,
  type ScriptingToolkitConfig,
  type CardAnalysis,
} from './scripting-toolkit.feature';
