/**
 * @fileoverview Deferred promise implementation
 * @module @expert-dollop/n8n-workflow
 */

import type { IDeferredPromise } from './interfaces';

/**
 * Creates a deferred promise that can be resolved or rejected externally
 * @returns A deferred promise object with resolve and reject methods
 */
export function createDeferredPromise<T = void>(): IDeferredPromise<T> {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;
  
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  
  return {
    promise,
    resolve,
    reject,
  };
}

/**
 * Alias for createDeferredPromise for backward compatibility
 */
export const Deferred = createDeferredPromise;
