/**
 * Standard HTTP status codes.
 *
 * Used to indicate the result of HTTP request processing.
 * Codes are grouped into categories:
 * - 1xx: Informational
 * - 2xx: Success
 * - 3xx: Redirection
 * - 4xx: Client Error
 * - 5xx: Server Error
 *
 * @example
 * ```typescript
 * @Get()
 * findAll() {
 *   return HttpStatus.OK; // 200
 * }
 *
 * @Post()
 * create() {
 *   return HttpStatus.CREATED; // 201
 * }
 * ```
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
 *
 */
export enum HttpStatus {
  // ============ 1xx Informational ============
  /** The server has received the initial part of the request and the client may continue sending */
  CONTINUE = 100,

  /** The server agrees to switch protocols (e.g., to WebSocket) */
  SWITCHING_PROTOCOLS = 101,

  /** The server is processing the request but no response is available yet (WebDAV) */
  PROCESSING = 102,

  /** Preliminary response with headers that the client may use */
  EARLYHINTS = 103,

  // ============ 2xx Success ============
  /** The request has succeeded */
  OK = 200,

  /** The resource has been created successfully (typically after POST or PUT) */
  CREATED = 201,

  /** The request has been accepted for processing but not yet completed */
  ACCEPTED = 202,

  /** The information comes from a third-party source */
  NON_AUTHORITATIVE_INFORMATION = 203,

  /** The request succeeded but the response body is empty */
  NO_CONTENT = 204,

  /** The client should reset the document (e.g., clear form) */
  RESET_CONTENT = 205,

  /** The server is returning only part of the resource (for range requests) */
  PARTIAL_CONTENT = 206,

  // ============ 3xx Redirection ============
  /** Multiple response options available, client must choose */
  AMBIGUOUS = 300,

  /** The resource has been moved permanently to a new URL */
  MOVED_PERMANENTLY = 301,

  /** The resource is temporarily available at a different URL */
  FOUND = 302,

  /** The client should retrieve the resource via GET from another URL */
  SEE_OTHER = 303,

  /** The resource has not changed since the last request (caching) */
  NOT_MODIFIED = 304,

  /** The resource is temporarily available at a different URL (do not change request method) */
  TEMPORARY_REDIRECT = 307,

  /** The resource has been moved permanently to a new URL (do not change request method) */
  PERMANENT_REDIRECT = 308,

  // ============ 4xx Client Error ============
  /** The server cannot understand the request due to malformed syntax */
  BAD_REQUEST = 400,

  /** Authentication is required (not authorized) */
  UNAUTHORIZED = 401,

  /** Payment required (reserved for future use) */
  PAYMENT_REQUIRED = 402,

  /** Access is forbidden (no rights to the resource) */
  FORBIDDEN = 403,

  /** The resource could not be found */
  NOT_FOUND = 404,

  /** The HTTP method is not allowed for this resource */
  METHOD_NOT_ALLOWED = 405,

  /** The server cannot produce a response in the requested format */
  NOT_ACCEPTABLE = 406,

  /** Authentication through proxy is required */
  PROXY_AUTHENTICATION_REQUIRED = 407,

  /** The server timed out waiting for the request */
  REQUEST_TIMEOUT = 408,

  /** There is a conflict with the current state of the resource */
  CONFLICT = 409,

  /** The resource has been removed and is no longer available */
  GONE = 410,

  /** Content-Length header is required */
  LENGTH_REQUIRED = 411,

  /** A precondition given in the headers is not met */
  PRECONDITION_FAILED = 412,

  /** The request payload is too large */
  PAYLOAD_TOO_LARGE = 413,

  /** The request URL is too long */
  URI_TOO_LONG = 414,

  /** The request media format is not supported by the server */
  UNSUPPORTED_MEDIA_TYPE = 415,

  /** The requested range cannot be returned */
  REQUESTED_RANGE_NOT_SATISFIABLE = 416,

  /** The expectation given in the Expect header cannot be met */
  EXPECTATION_FAILED = 417,

  /** I'm a teapot (Easter Egg from RFC 2324) */
  I_AM_A_TEAPOT = 418,

  /** The request was directed to a server that cannot produce a response */
  MISDIRECTED = 421,

  /** Semantic error in the request (cannot be processed) */
  UNPROCESSABLE_ENTITY = 422,

  /** Error due to failure of a previous request (WebDAV) */
  FAILED_DEPENDENCY = 424,

  /** The server requires conditional headers */
  PRECONDITION_REQUIRED = 428,

  /** Too many requests (rate limiting) */
  TOO_MANY_REQUESTS = 429,

  // ============ 5xx Server Error ============
  /** Internal server error */
  INTERNAL_SERVER_ERROR = 500,

  /** The server does not support the functionality required to fulfill the request */
  NOT_IMPLEMENTED = 501,

  /** Bad response from upstream server */
  BAD_GATEWAY = 502,

  /** The server is temporarily unavailable (overload or maintenance) */
  SERVICE_UNAVAILABLE = 503,

  /** The upstream server did not respond in time */
  GATEWAY_TIMEOUT = 504,

  /** The HTTP version is not supported by the server */
  HTTP_VERSION_NOT_SUPPORTED = 505,
}
