import { type ASTNode, GraphQLError, GraphQLScalarType } from "graphql";

type MultipartBody = FormData | Record<string, unknown>;

/** Keys that could be used for prototype pollution attacks. */
const POLLUTION_KEYS = new Set<string>([
  "__proto__",
  "constructor",
  "prototype",
]);

/** Maximum allowed path depth to prevent ReDoS. */
const MAX_PATH_DEPTH = 20;

/** Default maximum number of files per request to prevent DoS. */
const MAX_FILES_PER_REQUEST = 10;

/** Maximum allowed path length. */
const MAX_PATH_LENGTH = 500;

/**
 * Checks if a key is a prototype pollution risk.
 * @param key - The key to check.
 * @returns True if the key is unsafe.
 */
function isUnsafeKey(key: string): boolean {
  return POLLUTION_KEYS.has(key);
}

/**
 * Validates that a value is a non-empty string path.
 * @param value - The value to validate.
 * @returns True if the value is a valid path.
 */
function isValidPath(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

/**
 * Represents an uploaded file in a GraphQL multipart request.
 * Provides access to file metadata and streaming capabilities.
 *
 * @example
 * ```typescript
 * const resolve = async (_, { file }: { file: Promise<UploadedFile> }) => {
 *   const upload = await file;
 *   const stream = upload.stream;
 *   // Process stream...
 * };
 * ```
 */
export interface UploadedFile {
  /** The form field name for this file upload. */
  readonly fieldName: string;
  /** The original filename provided by the client. */
  readonly filename: string;
  /** The MIME type of the file (e.g., 'image/jpeg', 'application/pdf'). */
  readonly mimetype: string;
  /** The file size in bytes. */
  readonly size: number;
  /** A readable stream of the file contents. Native Web Streams API. */
  readonly stream: ReadableStream<Uint8Array>;
  /** Returns the file as a Blob. */
  blob(): Promise<Blob>;
  /** Reads the entire file into an ArrayBuffer. */
  arrayBuffer(): Promise<ArrayBuffer>;
  /** Reads the entire file as UTF-8 text. */
  text(): Promise<string>;
}

/** Internal implementation of UploadedFile. */
class UploadedFileImpl implements UploadedFile {
  readonly fieldName: string;
  readonly filename: string;
  readonly mimetype: string;
  readonly size: number;
  private readonly _file: File;

  constructor(fieldName: string, file: File) {
    this.fieldName = fieldName;
    this._file = file;
    this.filename = file.name;
    this.mimetype = file.type;
    this.size = file.size;
  }

  get stream(): ReadableStream<Uint8Array> {
    return this._file.stream();
  }

  blob(): Promise<Blob> {
    return Promise.resolve(this._file);
  }

  arrayBuffer(): Promise<ArrayBuffer> {
    return this._file.arrayBuffer();
  }

  text(): Promise<string> {
    return this._file.text();
  }
}

/**
 * GraphQL scalar type for handling file uploads.
 * Implements the GraphQL multipart request specification.
 *
 * @example
 * ```typescript
 * @ObjectType()
 * class Mutation {
 *   @Mutation(() => Boolean)
 *   async uploadFile(@Arg('file', () => GraphQLUpload) file: Promise<UploadedFile>) {
 *     const upload = await file;
 *     // Process upload...
 *     return true;
 *   }
 * }
 * ```
 */
export const GraphQLUpload = new GraphQLScalarType({
  name: "Upload",
  description: "The `Upload` scalar type represents a file upload.",
  parseValue(value: unknown): Promise<UploadedFile> {
    if (value instanceof UploadedFileImpl) {
      return Promise.resolve(value);
    }
    throw new GraphQLError("Upload value invalid.");
  },
  parseLiteral(node: ASTNode): never {
    throw new GraphQLError("Upload literal unsupported.", { nodes: node });
  },
  serialize(): never {
    throw new GraphQLError("Upload serialization unsupported.");
  },
});

/**
 * Retrieves a field value from a multipart body.
 * @param body - The multipart body (FormData or plain object).
 * @param key - The field key.
 * @returns The field value or undefined.
 */
function getField(body: MultipartBody, key: string): unknown {
  return body instanceof FormData
    ? body.get(key)
    : (body as Record<string, unknown>)[key];
}

/**
 * Parses a value as JSON if it's a string, or returns as-is if object.
 * Returns null if parsing fails.
 *
 * @param value - The value to parse.
 * @returns Parsed object or null.
 */
function parseJson(value: unknown): Record<string, unknown> | null {
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
  if (value && typeof value === "object") {
    return value as Record<string, unknown>;
  }
  return null;
}

/**
 * Sets a value at a nested path within an object.
 * Creates intermediate objects as needed.
 * Throws Error for prototype pollution keys or excessive path depth.
 *
 * @param obj - The object to modify.
 * @param path - The dot-separated path.
 * @param value - The value to set.
 */
function setPath(
  obj: Record<string, unknown>,
  path: string,
  value: unknown,
): void {
  if (path.length > MAX_PATH_LENGTH) {
    throw new Error(`Path exceeds maximum length of ${MAX_PATH_LENGTH}`);
  }

  let current = obj;
  let start = 0;
  let idx = path.indexOf(".");
  let depth = 0;

  while (idx !== -1) {
    if (depth >= MAX_PATH_DEPTH) {
      throw new Error(`Path exceeds maximum depth of ${MAX_PATH_DEPTH}`);
    }
    const key = path.slice(start, idx);
    if (isUnsafeKey(key)) {
      throw new Error(`Invalid path key: ${key}`);
    }
    let next = current[key] as Record<string, unknown> | undefined;
    if (next === undefined || typeof next !== "object") {
      next = {};
      current[key] = next;
    }
    current = next;
    start = idx + 1;
    idx = path.indexOf(".", start);
    depth++;
  }

  if (depth >= MAX_PATH_DEPTH) {
    throw new Error(`Path exceeds maximum depth of ${MAX_PATH_DEPTH}`);
  }

  const lastKey = path.slice(start);
  if (isUnsafeKey(lastKey)) {
    throw new Error(`Invalid path key: ${lastKey}`);
  }
  current[lastKey] = value;
}

/**
 * Options for controlling file upload limits in a GraphQL multipart request.
 */
export interface UploadOptions {
  /**
   * Maximum number of files allowed per request.
   * @default 10
   */
  maxFiles?: number;
  /**
   * Maximum allowed size per file in bytes.
   * Requests containing a file that exceeds this limit will throw an error.
   */
  maxFileSize?: number;
}

/**
 * Processes a GraphQL multipart request per the
 * [GraphQL multipart request spec](https://github.com/jaydenseric/graphql-multipart-request-spec).
 *
 * @param body - The multipart request body.
 * @param options - Optional upload limits.
 * @returns Operations object with uploaded files injected.
 * @throws Error if 'operations' field is missing or limits are exceeded.
 */
export async function processMultipartRequest(
  body: MultipartBody,
  options?: UploadOptions,
): Promise<Record<string, unknown>> {
  const maxFiles = options?.maxFiles ?? MAX_FILES_PER_REQUEST;

  const operations = parseJson(getField(body, "operations"));
  if (!operations) {
    throw new Error("Missing 'operations' field in multipart request");
  }

  const fileMap = parseJson(getField(body, "map"));
  if (!fileMap) {
    return operations;
  }

  const keys = Object.keys(fileMap);
  if (keys.length > maxFiles) {
    throw new Error(
      `Too many files: ${keys.length}. Maximum allowed: ${maxFiles}`,
    );
  }

  for (let i = 0; i < keys.length; i++) {
    const fieldName = keys[i];
    const paths = fileMap[fieldName];
    const file = getField(body, fieldName);

    if (!(file instanceof File) || !Array.isArray(paths)) {
      continue;
    }

    if (options?.maxFileSize !== undefined && file.size > options.maxFileSize) {
      throw new Error(
        `File "${file.name}" exceeds the size limit of ${options.maxFileSize} bytes (got ${file.size})`,
      );
    }

    const uploadedFile = new UploadedFileImpl(fieldName, file);

    for (let j = 0; j < paths.length; j++) {
      const path = paths[j];
      if (isValidPath(path)) {
        setPath(operations, path, uploadedFile);
      }
    }
  }

  return operations;
}
