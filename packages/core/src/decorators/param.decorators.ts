import "reflect-metadata";

import { plainToInstance } from "class-transformer";
import { validate, ValidationError } from "class-validator";

import { BadRequestException } from "../exceptions/bad-request.exception";
import { Logger } from "../logger/logger.service";

// Capture the global File before it is shadowed by the exported File decorator
const WebApiFile = globalThis.File;

// Metadata keys for parameter decorators
export const PARAM_TYPES_METADATA = "design:paramtypes";
export const PARAMS_METADATA = "route:params";

// Parameter types
export enum ParamType {
  BODY = "body",
  FORM = "form",
  PARAMS = "params",
  QUERY = "query",
  FILE = "file",
  FILES = "files",
}

// File validation options
export interface FileValidationOptions {
  /** Maximum file size in bytes */
  maxSize?: number;
  /** Allowed MIME types (e.g., ['image/jpeg', 'image/png']) */
  allowedMimeTypes?: string[];
  /** Maximum number of files for multi-file upload */
  maxFiles?: number;
}

// Parameter info interface
export interface ParamInfo {
  index: number;
  type: ParamType;
  dto: unknown;
  paramName?: string;
  fileOptions?: FileValidationOptions;
}

// Utility function to create parameter decorators
function createParamDecorator(type: ParamType) {
  return (
      paramNameOrDtoOrOptions?: string | unknown,
      dtoTypeOrFileOptions?: unknown,
    ) =>
    (target: object, propertyKey: string | symbol, parameterIndex: number) => {
      // Get existing params metadata or initialize an empty array
      const existingParams: ParamInfo[] =
        Reflect.getMetadata(PARAMS_METADATA, target.constructor, propertyKey) ||
        [];

      // Handle different parameter signatures
      let paramName: string | undefined;
      let dto: unknown;
      let fileOptions: FileValidationOptions | undefined;

      if (typeof paramNameOrDtoOrOptions === "string") {
        // Case: @Params('id'), @Query('filter'), @File('avatar')
        paramName = paramNameOrDtoOrOptions;
        // For FILE/FILES, second param can be FileValidationOptions
        if (type === ParamType.FILE || type === ParamType.FILES) {
          fileOptions = dtoTypeOrFileOptions as FileValidationOptions;
        } else {
          dto = dtoTypeOrFileOptions;
        }
      } else if (
        type === ParamType.FILE ||
        (type === ParamType.FILES && paramNameOrDtoOrOptions)
      ) {
        // Case: @File({ maxSize: 1024 * 1024 })
        const opts = paramNameOrDtoOrOptions as FileValidationOptions;
        if (opts && (opts.maxSize || opts.allowedMimeTypes || opts.maxFiles)) {
          fileOptions = opts;
        }
      } else {
        // Case: @Body(UserDto), or @Query()
        dto = paramNameOrDtoOrOptions;
      }

      // Add parameter info (omit undefined optional fields for clean equality checks)
      const paramInfo: ParamInfo = { index: parameterIndex, type, dto, paramName };
      if (fileOptions !== undefined) {
        paramInfo.fileOptions = fileOptions;
      }
      existingParams.push(paramInfo);

      // Keep sorted by index for consistent ordering
      existingParams.sort((a, b) => a.index - b.index);

      // Update metadata
      Reflect.defineMetadata(
        PARAMS_METADATA,
        existingParams,
        target.constructor,
        propertyKey,
      );
    };
}

/**
 * Detects if a request is multipart/form-data
 */
function isMultipartFormData(ctx: {
  request: { headers: { get: (name: string) => string | null } };
}): boolean {
  const contentType = ctx.request.headers.get("content-type") || "";
  return contentType.includes("multipart/form-data");
}

// File validation error
export class FileValidationError extends Error {
  constructor(
    public readonly field: string,
    public readonly code:
      | "SIZE_LIMIT"
      | "INVALID_TYPE"
      | "MAX_FILES"
      | "MISSING_FILE",
    message: string,
  ) {
    super(message);
    this.name = "FileValidationError";
  }
}

/**
 * Validates a single file against validation options
 */
function validateFile(
  file: File,
  options: FileValidationOptions,
  fieldName: string,
): void {
  // Check file size
  if (options.maxSize && file.size > options.maxSize) {
    throw new FileValidationError(
      fieldName,
      "SIZE_LIMIT",
      `File "${file.name}" exceeds maximum size of ${options.maxSize} bytes`,
    );
  }

  // Check MIME type
  if (options.allowedMimeTypes && options.allowedMimeTypes.length > 0) {
    if (!options.allowedMimeTypes.includes(file.type)) {
      throw new FileValidationError(
        fieldName,
        "INVALID_TYPE",
        `File "${file.name}" has invalid type "${file.type}". Allowed types: ${options.allowedMimeTypes.join(", ")}`,
      );
    }
  }
}

/**
 * Validates multiple files against validation options
 */
function validateFiles(
  files: File[],
  options: FileValidationOptions,
  fieldName: string,
): void {
  // Check max files limit
  if (options.maxFiles && files.length > options.maxFiles) {
    throw new FileValidationError(
      fieldName,
      "MAX_FILES",
      `Too many files. Maximum allowed: ${options.maxFiles}`,
    );
  }

  // Validate each file
  for (const file of files) {
    validateFile(file, options, fieldName);
  }
}

/**
 * Elysia context interface for type safety
 */
interface ElysiaContext {
  request: { headers: { get: (name: string) => string | null } };
  body: Record<string, unknown>;
  params: Record<string, string>;
  query: Record<string, string | undefined>;
}

/**
 * Extract and validate parameters based on metadata
 * @param ctx Elysia context
 * @param target Controller class
 * @param propertyKey Route handler method name
 * @returns Array of processed parameters or error object
 */
export async function processParameters(
  ctx: ElysiaContext,
  target: object,
  propertyKey: string | symbol,
): Promise<unknown[]> {
  // target may be the class constructor (when called directly) or a prototype.
  // Metadata is stored on the class, so use target directly if it looks like a
  // constructor, otherwise fall back to target.constructor.
  const metaTarget =
    typeof target === "function" ? target : target.constructor;
  const paramsMetadata: ParamInfo[] =
    Reflect.getMetadata(PARAMS_METADATA, metaTarget, propertyKey) || [];

  // If no param decorators, return an empty array
  if (!paramsMetadata || paramsMetadata.length === 0) {
    return [];
  }

  // Prepare parameters array to be returned
  const params: unknown[] = [];

  // Check if this is a multipart form request
  const isFormData = isMultipartFormData(ctx);

  // Process each parameter
  for (const paramInfo of paramsMetadata) {
    const { index, type, dto, paramName, fileOptions } = paramInfo;

    // Extract raw data from context based on parameter type
    let rawValue: unknown;

    switch (type) {
      case ParamType.BODY:
        // If it's a multipart form, body might be empty or parsed differently
        if (isFormData) {
          // In multipart forms, JSON data might be in a field named 'json' or similar
          const body = ctx.body as { json?: unknown };
          rawValue = body?.json ?? {};
        } else {
          rawValue = ctx.body;
        }
        break;
      case ParamType.FORM:
        // For form data, get all form fields except files
        if (isFormData) {
          // Extract form fields from multipart form
          const formData = ctx.body;

          // Remove file fields
          const fileFields = Object.keys(formData || {}).filter((key) => {
            const value = formData[key];
            return (
              value instanceof WebApiFile ||
              (Array.isArray(value) && value[0] instanceof WebApiFile)
            );
          });

          // Create a new object without file fields
          rawValue = { ...formData };
          fileFields.forEach(
            (field) => delete (rawValue as Record<string, unknown>)[field],
          );
        } else {
          // If not multipart/form-data, use body as is (for application/x-www-form-urlencoded)
          rawValue = ctx.body;
        }
        break;
      case ParamType.FILE:
        if (isFormData && ctx.body) {
          // Get single file
          if (paramName) {
            const file = ctx.body[paramName];
            rawValue = file instanceof WebApiFile ? file : null;
            // Validate file if options provided
            if (fileOptions && rawValue instanceof WebApiFile) {
              try {
                validateFile(rawValue, fileOptions, paramName);
              } catch (error) {
                throw new BadRequestException({
                  error:
                    error instanceof FileValidationError
                      ? error.message
                      : "File validation failed",
                  details: [
                    {
                      property: paramName,
                      constraints: { file: String(error) },
                    } as ValidationError,
                  ],
                });
              }
            }
          } else {
            // Find first file in the request
            for (const key in ctx.body) {
              const value = ctx.body[key];
              if (value instanceof WebApiFile) {
                rawValue = value;
                // Validate file if options provided
                if (fileOptions) {
                  try {
                    validateFile(value, fileOptions, key);
                  } catch (error) {
                    throw new BadRequestException({
                      error:
                        error instanceof FileValidationError
                          ? error.message
                          : "File validation failed",
                      details: [
                        {
                          property: key,
                          constraints: { file: String(error) },
                        } as ValidationError,
                      ],
                    });
                  }
                }
                break;
              }
            }
          }
        } else {
          rawValue = null;
        }
        break;
      case ParamType.FILES:
        if (isFormData && ctx.body) {
          if (paramName) {
            // Get specific files array or single file converted to array
            const filesOrFile = ctx.body[paramName];
            if (Array.isArray(filesOrFile)) {
              rawValue = filesOrFile.filter(
                (f): f is File => f instanceof WebApiFile,
              );
            } else if (filesOrFile instanceof WebApiFile) {
              rawValue = [filesOrFile];
            } else {
              rawValue = [];
            }
            // Validate files if options provided
            if (fileOptions && Array.isArray(rawValue) && rawValue.length > 0) {
              try {
                validateFiles(rawValue, fileOptions, paramName);
              } catch (error) {
                throw new BadRequestException({
                  error:
                    error instanceof FileValidationError
                      ? error.message
                      : "Files validation failed",
                  details: [
                    {
                      property: paramName,
                      constraints: { files: String(error) },
                    } as ValidationError,
                  ],
                });
              }
            }
          } else {
            // Get all files from request
            const allFiles: File[] = [];
            for (const key in ctx.body) {
              const value = ctx.body[key];
              if (value instanceof WebApiFile) {
                allFiles.push(value);
              } else if (Array.isArray(value) && value[0] instanceof WebApiFile) {
                allFiles.push(
                  ...value.filter((f): f is File => f instanceof WebApiFile),
                );
              }
            }
            rawValue = allFiles;
            // Validate files if options provided
            if (fileOptions && allFiles.length > 0) {
              try {
                validateFiles(allFiles, fileOptions, "files");
              } catch (error) {
                throw new BadRequestException({
                  error:
                    error instanceof FileValidationError
                      ? error.message
                      : "Files validation failed",
                  details: [
                    {
                      property: "files",
                      constraints: { files: String(error) },
                    } as ValidationError,
                  ],
                });
              }
            }
          }
        } else {
          rawValue = [];
        }
        break;
      case ParamType.PARAMS:
        rawValue = paramName ? ctx.params[paramName] : ctx.params;
        break;
      case ParamType.QUERY:
        rawValue = paramName ? ctx.query[paramName] : ctx.query;
        break;
    }

    // Skip DTO validation for File/Files parameters (validation already done above)
    if (type === ParamType.FILE || type === ParamType.FILES) {
      params[index] = rawValue;
      continue;
    }

    // If DTO type is provided, validate and transform
    if (dto) {
      try {
        // Transform plain object to class instance
        const transformed = plainToInstance(dto as any, rawValue);

        // Validate the instance
        const errors = await validate(transformed as object, {
          whitelist: true,
          forbidNonWhitelisted: true,
          validationError: { target: false },
        });

        if (errors.length > 0) {
          throw new BadRequestException({
            error: `Validation failed for ${type}${paramName ? `.${paramName}` : ""}`,
            details: errors,
          });
        }

        // Set the validated value
        params[index] = transformed;
      } catch (error) {
        Logger.error(`Error processing parameter at index ${index}:`, error);
        throw new BadRequestException({
          error: `Error processing ${type}${paramName ? `.${paramName}` : ""}`,
          details: [
            {
              property: type,
              constraints: { processing: "Processing error" },
            } as ValidationError,
          ],
        });
      }
    } else {
      // No DTO, just use raw value
      params[index] = rawValue;
    }
  }

  return params;
}

// Create parameter decorators
export const Body = createParamDecorator(ParamType.BODY);
export const Form = createParamDecorator(ParamType.FORM);
export const Params = createParamDecorator(ParamType.PARAMS);
export const Query = createParamDecorator(ParamType.QUERY);
export const File = createParamDecorator(ParamType.FILE);
export const Files = createParamDecorator(ParamType.FILES);
