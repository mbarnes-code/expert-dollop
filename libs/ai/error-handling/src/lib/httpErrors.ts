/**
 * HTTP Status Code mappings to human-readable error messages
 * Consolidated from playwright-service and firecrawl-api
 */

export const HTTP_STATUS_MESSAGES: { [key: number]: string } = {
  // 3xx Redirection
  300: 'Multiple Choices',
  301: 'Moved Permanently',
  302: 'Found',
  303: 'See Other',
  304: 'Not Modified',
  305: 'Use Proxy',
  307: 'Temporary Redirect',
  308: 'Permanent Redirect',
  309: 'Resume Incomplete',
  310: 'Too Many Redirects',
  311: 'Unavailable For Legal Reasons',
  312: 'Previously Used',
  313: "I'm Used",
  314: 'Switch Proxy',
  315: 'Temporary Redirect',
  316: 'Resume Incomplete',
  317: 'Too Many Redirects',

  // 4xx Client Errors
  400: 'Bad Request',
  401: 'Unauthorized',
  402: 'Payment Required',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  406: 'Not Acceptable',
  407: 'Proxy Authentication Required',
  408: 'Request Timeout',
  409: 'Conflict',
  410: 'Gone',
  411: 'Length Required',
  412: 'Precondition Failed',
  413: 'Payload Too Large',
  414: 'URI Too Long',
  415: 'Unsupported Media Type',
  416: 'Range Not Satisfiable',
  417: 'Expectation Failed',
  418: "I'm a teapot",
  421: 'Misdirected Request',
  422: 'Unprocessable Entity',
  423: 'Locked',
  424: 'Failed Dependency',
  425: 'Too Early',
  426: 'Upgrade Required',
  428: 'Precondition Required',
  429: 'Too Many Requests',
  431: 'Request Header Fields Too Large',
  451: 'Unavailable For Legal Reasons',

  // 5xx Server Errors
  500: 'Internal Server Error',
  501: 'Not Implemented',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Timeout',
  505: 'HTTP Version Not Supported',
  506: 'Variant Also Negotiates',
  507: 'Insufficient Storage',
  508: 'Loop Detected',
  510: 'Not Extended',
  511: 'Network Authentication Required',
  599: 'Network Connect Timeout Error',
};

/**
 * Get human-readable error message for HTTP status code
 * @param statusCode HTTP status code or null
 * @returns Error message or null for successful responses
 */
export function getHttpError(statusCode: number | null): string | null {
  if (statusCode === null) {
    return 'No response received';
  }

  if (statusCode < 300) {
    return null;
  }

  return HTTP_STATUS_MESSAGES[statusCode] || 'Unknown Error';
}

/**
 * Check if status code represents an error
 */
export function isHttpError(statusCode: number | null): boolean {
  return statusCode === null || statusCode >= 300;
}

/**
 * Check if status code is a client error (4xx)
 */
export function isClientError(statusCode: number): boolean {
  return statusCode >= 400 && statusCode < 500;
}

/**
 * Check if status code is a server error (5xx)
 */
export function isServerError(statusCode: number): boolean {
  return statusCode >= 500 && statusCode < 600;
}

/**
 * Check if status code is a redirect (3xx)
 */
export function isRedirect(statusCode: number): boolean {
  return statusCode >= 300 && statusCode < 400;
}
