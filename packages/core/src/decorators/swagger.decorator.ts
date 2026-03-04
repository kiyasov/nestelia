import "reflect-metadata";

export const API_DOCS_METADATA = "api:docs";

/**
 * Response example configuration
 */
export interface ApiResponseExample {
  description: string;
  schema?: any;
  example?: any;
  examples?: {
    [name: string]: {
      summary: string;
      value: any;
    };
  };
}

/**
 * API documentation options
 */
export interface ApiDocsOptions {
  /**
   * Summary of the endpoint
   */
  summary?: string;

  /**
   * Detailed description of the endpoint
   */
  description?: string;

  /**
   * Response descriptions and examples for different status codes
   */
  responses?: {
    [statusCode: string]: ApiResponseExample;
  };

  /**
   * Mark this operation as deprecated
   */
  deprecated?: boolean;

  /**
   * Custom tags to apply to this operation
   */
  tags?: string[];

  /**
   * Request body configuration
   */
  requestBody?: {
    description?: string;
    required?: boolean;
  };

  /**
   * Request DTO type for validation
   */
  request?: any;

  /**
   * Example object for request body
   */
  requestExample?: any;

  /**
   * Multiple examples for request body
   */
  requestExamples?: {
    [name: string]: {
      summary: string;
      value: any;
    };
  };

  /**
   * Description for the request body
   */
  requestBodyDescription?: string;

  /**
   * Flag indicating this is a form data submission
   */
  formData?: boolean;

  /**
   * Flag indicating this endpoint involves file uploads
   */
  fileUpload?: boolean;

  /**
   * Explicit content type for the request
   */
  contentType?: string;

  /**
   * Examples for individual fields in a form
   */
  fieldExamples?: {
    [fieldName: string]: {
      value: any;
      summary: string;
    };
  };
}

/**
 * Decorator for adding API documentation to route handlers
 * @param options Documentation options
 * @returns Method decorator
 */
export function ApiDocs(options: ApiDocsOptions) {
  return function (target: object, propertyKey: string | symbol) {
    Reflect.defineMetadata(
      API_DOCS_METADATA,
      options,
      target.constructor,
      propertyKey,
    );
  };
}

/**
 * Decorator for adding schema and examples to a route
 * @param schemaConfig Configuration object from a schema file
 * @returns Method decorator
 */
export function ApiSchema(schemaConfig: any) {
  // Extract all properties from the schema config
  const {
    summary,
    description,
    responses,
    request,
    requestExample,
    requestExamples,
    requestBodyDescription,
    formData,
    fileUpload,
    contentType,
    fieldExamples,
    ...rest
  } = schemaConfig;

  // If no explicit contentType is specified but there is a request and example,
  // automatically add form handling based on the presence of file parameters
  let autoFormData = formData;
  let autoContentType = contentType;

  if (request && requestExample && !autoFormData) {
    // Check if any of the field examples is for a file
    const hasFileField =
      fieldExamples &&
      Object.keys(fieldExamples).some(
        (key) =>
          key === "file" ||
          key === "files" ||
          (fieldExamples[key].summary &&
            (fieldExamples[key].summary.toLowerCase().includes("file") ||
              fieldExamples[key].summary.toLowerCase().includes("upload"))),
      );

    // If there's any indication of file handling, make it multipart/form-data
    if (hasFileField || fileUpload) {
      autoFormData = true;
      autoContentType = "multipart/form-data";
    }
    // Otherwise, default to making it JSON form data for better Swagger UI display
    else {
      autoFormData = true;
      // Keep the content type as is if explicitly specified, otherwise default to JSON
      autoContentType = autoContentType || "application/json";
    }
  }

  return ApiDocs({
    summary,
    description,
    responses,
    request,
    requestExample,
    requestExamples,
    requestBodyDescription,
    formData: autoFormData,
    fileUpload,
    contentType: autoContentType,
    fieldExamples,
    requestBody: {
      description: requestBodyDescription,
      required: true,
    },
    ...rest,
  });
}

/**
 * Get API documentation for a method
 * @param controller Controller class
 * @param methodName Method name
 * @returns API documentation options or undefined
 */
export function getApiDocs(
  controller: any,
  methodName: string | symbol,
): ApiDocsOptions | undefined {
  return Reflect.getMetadata(API_DOCS_METADATA, controller, methodName);
}

/**
 * Helper function to create properly formatted examples for Swagger UI
 * @param examples An object mapping example names to {summary, value} objects
 * @returns Formatted examples object
 */
export function createExamples(examples: {
  [name: string]: {
    summary: string;
    value: any;
  };
}) {
  return examples;
}
