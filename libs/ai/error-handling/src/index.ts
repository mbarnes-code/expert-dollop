// Export HTTP error utilities
export {
  HTTP_STATUS_MESSAGES,
  getHttpError,
  isHttpError,
  isClientError,
  isServerError,
  isRedirect,
} from './lib/httpErrors';

// Export transportable error classes
export {
  TransportableError,
  TimeoutError,
  UnknownError,
  NetworkError,
  ensureError,
  wrapError,
} from './lib/transportableError';

export type { SerializedError } from './lib/transportableError';
