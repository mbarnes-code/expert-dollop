/**
 * Utils Module Index
 * Re-exports all utility functions and services.
 */

export {
  LogColor,
  applyColor,
  log,
  wordCount,
  isPresentString,
  regexEscape,
  average,
  median,
  standardDeviation,
  toObjectKeyedOn,
  eachAsync,
  toggle,
  permutations,
  splitSeries,
} from './helpers';

export {
  CacheService,
  type CacheConfig,
} from './cache.service';
