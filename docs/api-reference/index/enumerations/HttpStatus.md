# Enumeration: HttpStatus

Defined in: [packages/core/src/enums/http-status.enum.ts:28](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/enums/http-status.enum.ts#L28)

Standard HTTP status codes.

Used to indicate the result of HTTP request processing.
Codes are grouped into categories:
- 1xx: Informational
- 2xx: Success
- 3xx: Redirection
- 4xx: Client Error
- 5xx: Server Error

## Example

```typescript
@Get()
findAll() {
  return HttpStatus.OK; // 200
}

@Post()
create() {
  return HttpStatus.CREATED; // 201
}
```

## See

https://developer.mozilla.org/en-US/docs/Web/HTTP/Status

## Enumeration Members

### ACCEPTED

```ts
ACCEPTED: 202;
```

Defined in: [packages/core/src/enums/http-status.enum.ts:50](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/enums/http-status.enum.ts#L50)

The request has been accepted for processing but not yet completed

***

### AMBIGUOUS

```ts
AMBIGUOUS: 300;
```

Defined in: [packages/core/src/enums/http-status.enum.ts:66](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/enums/http-status.enum.ts#L66)

Multiple response options available, client must choose

***

### BAD\_GATEWAY

```ts
BAD_GATEWAY: 502;
```

Defined in: [packages/core/src/enums/http-status.enum.ts:167](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/enums/http-status.enum.ts#L167)

Bad response from upstream server

***

### BAD\_REQUEST

```ts
BAD_REQUEST: 400;
```

Defined in: [packages/core/src/enums/http-status.enum.ts:88](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/enums/http-status.enum.ts#L88)

The server cannot understand the request due to malformed syntax

***

### CONFLICT

```ts
CONFLICT: 409;
```

Defined in: [packages/core/src/enums/http-status.enum.ts:115](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/enums/http-status.enum.ts#L115)

There is a conflict with the current state of the resource

***

### CONTINUE

```ts
CONTINUE: 100;
```

Defined in: [packages/core/src/enums/http-status.enum.ts:31](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/enums/http-status.enum.ts#L31)

The server has received the initial part of the request and the client may continue sending

***

### CREATED

```ts
CREATED: 201;
```

Defined in: [packages/core/src/enums/http-status.enum.ts:47](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/enums/http-status.enum.ts#L47)

The resource has been created successfully (typically after POST or PUT)

***

### EARLYHINTS

```ts
EARLYHINTS: 103;
```

Defined in: [packages/core/src/enums/http-status.enum.ts:40](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/enums/http-status.enum.ts#L40)

Preliminary response with headers that the client may use

***

### EXPECTATION\_FAILED

```ts
EXPECTATION_FAILED: 417;
```

Defined in: [packages/core/src/enums/http-status.enum.ts:139](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/enums/http-status.enum.ts#L139)

The expectation given in the Expect header cannot be met

***

### FAILED\_DEPENDENCY

```ts
FAILED_DEPENDENCY: 424;
```

Defined in: [packages/core/src/enums/http-status.enum.ts:151](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/enums/http-status.enum.ts#L151)

Error due to failure of a previous request (WebDAV)

***

### FORBIDDEN

```ts
FORBIDDEN: 403;
```

Defined in: [packages/core/src/enums/http-status.enum.ts:97](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/enums/http-status.enum.ts#L97)

Access is forbidden (no rights to the resource)

***

### FOUND

```ts
FOUND: 302;
```

Defined in: [packages/core/src/enums/http-status.enum.ts:72](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/enums/http-status.enum.ts#L72)

The resource is temporarily available at a different URL

***

### GATEWAY\_TIMEOUT

```ts
GATEWAY_TIMEOUT: 504;
```

Defined in: [packages/core/src/enums/http-status.enum.ts:173](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/enums/http-status.enum.ts#L173)

The upstream server did not respond in time

***

### GONE

```ts
GONE: 410;
```

Defined in: [packages/core/src/enums/http-status.enum.ts:118](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/enums/http-status.enum.ts#L118)

The resource has been removed and is no longer available

***

### HTTP\_VERSION\_NOT\_SUPPORTED

```ts
HTTP_VERSION_NOT_SUPPORTED: 505;
```

Defined in: [packages/core/src/enums/http-status.enum.ts:176](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/enums/http-status.enum.ts#L176)

The HTTP version is not supported by the server

***

### I\_AM\_A\_TEAPOT

```ts
I_AM_A_TEAPOT: 418;
```

Defined in: [packages/core/src/enums/http-status.enum.ts:142](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/enums/http-status.enum.ts#L142)

I'm a teapot (Easter Egg from RFC 2324)

***

### INTERNAL\_SERVER\_ERROR

```ts
INTERNAL_SERVER_ERROR: 500;
```

Defined in: [packages/core/src/enums/http-status.enum.ts:161](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/enums/http-status.enum.ts#L161)

Internal server error

***

### LENGTH\_REQUIRED

```ts
LENGTH_REQUIRED: 411;
```

Defined in: [packages/core/src/enums/http-status.enum.ts:121](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/enums/http-status.enum.ts#L121)

Content-Length header is required

***

### METHOD\_NOT\_ALLOWED

```ts
METHOD_NOT_ALLOWED: 405;
```

Defined in: [packages/core/src/enums/http-status.enum.ts:103](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/enums/http-status.enum.ts#L103)

The HTTP method is not allowed for this resource

***

### MISDIRECTED

```ts
MISDIRECTED: 421;
```

Defined in: [packages/core/src/enums/http-status.enum.ts:145](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/enums/http-status.enum.ts#L145)

The request was directed to a server that cannot produce a response

***

### MOVED\_PERMANENTLY

```ts
MOVED_PERMANENTLY: 301;
```

Defined in: [packages/core/src/enums/http-status.enum.ts:69](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/enums/http-status.enum.ts#L69)

The resource has been moved permanently to a new URL

***

### NO\_CONTENT

```ts
NO_CONTENT: 204;
```

Defined in: [packages/core/src/enums/http-status.enum.ts:56](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/enums/http-status.enum.ts#L56)

The request succeeded but the response body is empty

***

### NON\_AUTHORITATIVE\_INFORMATION

```ts
NON_AUTHORITATIVE_INFORMATION: 203;
```

Defined in: [packages/core/src/enums/http-status.enum.ts:53](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/enums/http-status.enum.ts#L53)

The information comes from a third-party source

***

### NOT\_ACCEPTABLE

```ts
NOT_ACCEPTABLE: 406;
```

Defined in: [packages/core/src/enums/http-status.enum.ts:106](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/enums/http-status.enum.ts#L106)

The server cannot produce a response in the requested format

***

### NOT\_FOUND

```ts
NOT_FOUND: 404;
```

Defined in: [packages/core/src/enums/http-status.enum.ts:100](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/enums/http-status.enum.ts#L100)

The resource could not be found

***

### NOT\_IMPLEMENTED

```ts
NOT_IMPLEMENTED: 501;
```

Defined in: [packages/core/src/enums/http-status.enum.ts:164](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/enums/http-status.enum.ts#L164)

The server does not support the functionality required to fulfill the request

***

### NOT\_MODIFIED

```ts
NOT_MODIFIED: 304;
```

Defined in: [packages/core/src/enums/http-status.enum.ts:78](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/enums/http-status.enum.ts#L78)

The resource has not changed since the last request (caching)

***

### OK

```ts
OK: 200;
```

Defined in: [packages/core/src/enums/http-status.enum.ts:44](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/enums/http-status.enum.ts#L44)

The request has succeeded

***

### PARTIAL\_CONTENT

```ts
PARTIAL_CONTENT: 206;
```

Defined in: [packages/core/src/enums/http-status.enum.ts:62](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/enums/http-status.enum.ts#L62)

The server is returning only part of the resource (for range requests)

***

### PAYLOAD\_TOO\_LARGE

```ts
PAYLOAD_TOO_LARGE: 413;
```

Defined in: [packages/core/src/enums/http-status.enum.ts:127](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/enums/http-status.enum.ts#L127)

The request payload is too large

***

### PAYMENT\_REQUIRED

```ts
PAYMENT_REQUIRED: 402;
```

Defined in: [packages/core/src/enums/http-status.enum.ts:94](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/enums/http-status.enum.ts#L94)

Payment required (reserved for future use)

***

### PERMANENT\_REDIRECT

```ts
PERMANENT_REDIRECT: 308;
```

Defined in: [packages/core/src/enums/http-status.enum.ts:84](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/enums/http-status.enum.ts#L84)

The resource has been moved permanently to a new URL (do not change request method)

***

### PRECONDITION\_FAILED

```ts
PRECONDITION_FAILED: 412;
```

Defined in: [packages/core/src/enums/http-status.enum.ts:124](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/enums/http-status.enum.ts#L124)

A precondition given in the headers is not met

***

### PRECONDITION\_REQUIRED

```ts
PRECONDITION_REQUIRED: 428;
```

Defined in: [packages/core/src/enums/http-status.enum.ts:154](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/enums/http-status.enum.ts#L154)

The server requires conditional headers

***

### PROCESSING

```ts
PROCESSING: 102;
```

Defined in: [packages/core/src/enums/http-status.enum.ts:37](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/enums/http-status.enum.ts#L37)

The server is processing the request but no response is available yet (WebDAV)

***

### PROXY\_AUTHENTICATION\_REQUIRED

```ts
PROXY_AUTHENTICATION_REQUIRED: 407;
```

Defined in: [packages/core/src/enums/http-status.enum.ts:109](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/enums/http-status.enum.ts#L109)

Authentication through proxy is required

***

### REQUEST\_TIMEOUT

```ts
REQUEST_TIMEOUT: 408;
```

Defined in: [packages/core/src/enums/http-status.enum.ts:112](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/enums/http-status.enum.ts#L112)

The server timed out waiting for the request

***

### REQUESTED\_RANGE\_NOT\_SATISFIABLE

```ts
REQUESTED_RANGE_NOT_SATISFIABLE: 416;
```

Defined in: [packages/core/src/enums/http-status.enum.ts:136](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/enums/http-status.enum.ts#L136)

The requested range cannot be returned

***

### RESET\_CONTENT

```ts
RESET_CONTENT: 205;
```

Defined in: [packages/core/src/enums/http-status.enum.ts:59](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/enums/http-status.enum.ts#L59)

The client should reset the document (e.g., clear form)

***

### SEE\_OTHER

```ts
SEE_OTHER: 303;
```

Defined in: [packages/core/src/enums/http-status.enum.ts:75](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/enums/http-status.enum.ts#L75)

The client should retrieve the resource via GET from another URL

***

### SERVICE\_UNAVAILABLE

```ts
SERVICE_UNAVAILABLE: 503;
```

Defined in: [packages/core/src/enums/http-status.enum.ts:170](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/enums/http-status.enum.ts#L170)

The server is temporarily unavailable (overload or maintenance)

***

### SWITCHING\_PROTOCOLS

```ts
SWITCHING_PROTOCOLS: 101;
```

Defined in: [packages/core/src/enums/http-status.enum.ts:34](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/enums/http-status.enum.ts#L34)

The server agrees to switch protocols (e.g., to WebSocket)

***

### TEMPORARY\_REDIRECT

```ts
TEMPORARY_REDIRECT: 307;
```

Defined in: [packages/core/src/enums/http-status.enum.ts:81](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/enums/http-status.enum.ts#L81)

The resource is temporarily available at a different URL (do not change request method)

***

### TOO\_MANY\_REQUESTS

```ts
TOO_MANY_REQUESTS: 429;
```

Defined in: [packages/core/src/enums/http-status.enum.ts:157](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/enums/http-status.enum.ts#L157)

Too many requests (rate limiting)

***

### UNAUTHORIZED

```ts
UNAUTHORIZED: 401;
```

Defined in: [packages/core/src/enums/http-status.enum.ts:91](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/enums/http-status.enum.ts#L91)

Authentication is required (not authorized)

***

### UNPROCESSABLE\_ENTITY

```ts
UNPROCESSABLE_ENTITY: 422;
```

Defined in: [packages/core/src/enums/http-status.enum.ts:148](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/enums/http-status.enum.ts#L148)

Semantic error in the request (cannot be processed)

***

### UNSUPPORTED\_MEDIA\_TYPE

```ts
UNSUPPORTED_MEDIA_TYPE: 415;
```

Defined in: [packages/core/src/enums/http-status.enum.ts:133](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/enums/http-status.enum.ts#L133)

The request media format is not supported by the server

***

### URI\_TOO\_LONG

```ts
URI_TOO_LONG: 414;
```

Defined in: [packages/core/src/enums/http-status.enum.ts:130](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/enums/http-status.enum.ts#L130)

The request URL is too long
