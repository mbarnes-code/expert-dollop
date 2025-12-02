/**
 * Utilities for making errors serializable over the wire.
 */

/**
 * Makes the given error's `message` and `stack` properties enumerable
 * so they can be serialized with JSON.stringify.
 *
 * @param error - Error to make serializable
 * @returns The same error with enumerable message and stack
 */
export function makeSerializable(error: Error): Error {
  Object.defineProperties(error, {
    message: {
      value: error.message,
      enumerable: true,
      configurable: true,
    },
    stack: {
      value: error.stack,
      enumerable: true,
      configurable: true,
    },
  });

  return error;
}

/**
 * Abstract base class for errors that can be serialized over the wire.
 * Used to transport errors between the runner and broker.
 */
export abstract class SerializableError extends Error {
  constructor(message: string) {
    super(message);
    makeSerializable(this);
  }
}
