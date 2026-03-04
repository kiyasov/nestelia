import "reflect-metadata";

import { getMetadataStorage } from "class-validator";
import { ValidationMetadata } from "class-validator/types/metadata/ValidationMetadata";

/**
 * OpenAPI Schema Types
 */
export enum SchemaType {
  STRING = "string",
  NUMBER = "number",
  INTEGER = "integer",
  BOOLEAN = "boolean",
  ARRAY = "array",
  OBJECT = "object",
}

/**
 * OpenAPI Schema Format
 */
export enum SchemaFormat {
  DATE = "date",
  DATE_TIME = "date-time",
  EMAIL = "email",
  UUID = "uuid",
  URI = "uri",
  BYTE = "byte",
}

/**
 * OpenAPI Property Schema
 */
export interface PropertySchema {
  type: SchemaType;
  format?: SchemaFormat;
  nullable?: boolean;
  required?: boolean;
  description?: string;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  enum?: any[];
  items?: PropertySchema | OpenAPISchema;
  properties?: Record<string, PropertySchema>;
  [key: string]: any; // Allow additional properties
}

/**
 * OpenAPI Schema with required array
 */
export interface OpenAPISchema {
  type: SchemaType;
  required?: string[];
  properties: Record<string, PropertySchema>;
  description?: string;
  [key: string]: any; // Allow additional properties
}

/**
 * Alias to maintain backward compatibility
 */
export type Schema = OpenAPISchema;

/**
 * Maps class-validator decorators to OpenAPI schema types
 */
const VALIDATOR_TO_SCHEMA_TYPE: Record<string, Partial<PropertySchema>> = {
  isString: { type: SchemaType.STRING },
  isNumber: { type: SchemaType.NUMBER },
  isInt: { type: SchemaType.INTEGER },
  isBoolean: { type: SchemaType.BOOLEAN },
  isDate: { type: SchemaType.STRING, format: SchemaFormat.DATE_TIME },
  isEmail: { type: SchemaType.STRING, format: SchemaFormat.EMAIL },
  isUUID: { type: SchemaType.STRING, format: SchemaFormat.UUID },
  isUrl: { type: SchemaType.STRING, format: SchemaFormat.URI },
  isArray: { type: SchemaType.ARRAY },
  min: { type: SchemaType.NUMBER },
  max: { type: SchemaType.NUMBER },
  minLength: { type: SchemaType.STRING },
  maxLength: { type: SchemaType.STRING },
  isLength: { type: SchemaType.STRING },
  matches: { type: SchemaType.STRING },
  minDate: { type: SchemaType.STRING, format: SchemaFormat.DATE_TIME },
  maxDate: { type: SchemaType.STRING, format: SchemaFormat.DATE_TIME },
};

/**
 * Maps class-validator decorator constraints to OpenAPI schema properties
 */
const CONSTRAINT_TO_SCHEMA_PROP: Record<string, string> = {
  min: "minimum",
  max: "maximum",
  minLength: "minLength",
  maxLength: "maxLength",
  isLength: "minLength", // isLength({ min: x, max: y }) - handled specially
  matches: "pattern",
};

/**
 * Extracts OpenAPI schema from class-validator metadata
 * @param dto DTO class with class-validator decorators
 * @returns OpenAPI Schema
 */
export function dtoToSchema(dto: any): OpenAPISchema {
  if (!dto) {
    throw new Error("DTO class must be provided");
  }

  const schema: OpenAPISchema = {
    type: SchemaType.OBJECT,
    properties: {},
    required: [],
  };

  // Extract class-validator metadata
  const validationMetadata = getMetadataStorage().getTargetValidationMetadatas(
    dto,
    dto.name,
    true,
    false,
  );

  // Group validation metadata by property
  const propValidations: Record<string, ValidationMetadata[]> = {};
  validationMetadata.forEach((meta) => {
    if (!meta.propertyName) {
      return;
    } // Skip metadata without a property name

    if (!propValidations[meta.propertyName]) {
      propValidations[meta.propertyName] = [];
    }

    // Now it's safe to push since we've verified both the key exists and the array is initialized
    const validationsForProperty = propValidations[meta.propertyName];
    if (validationsForProperty) {
      validationsForProperty.push(meta);
    }
  });

  // Process each property
  for (const propName in propValidations) {
    if (!propValidations[propName]) {
      continue;
    }

    const validations = propValidations[propName];
    if (!validations) {
      continue;
    }

    const propSchema: PropertySchema = { type: SchemaType.STRING }; // Default type

    // Check if property is required
    const isNotEmpty = validations.some((meta) => meta.type === "isNotEmpty");
    const isOptional = validations.some((meta) => meta.type === "isOptional");

    if (isNotEmpty && !isOptional) {
      // Make sure schema.required exists
      schema.required = schema.required || [];
      schema.required.push(propName);
      propSchema.required = true;
    } else if (isOptional) {
      propSchema.nullable = true;
    }

    // Extract property type and format
    for (const meta of validations) {
      const schemaTypeDef = VALIDATOR_TO_SCHEMA_TYPE[meta.type];
      if (schemaTypeDef) {
        Object.assign(propSchema, schemaTypeDef);

        // Handle constraints
        if (meta.constraints && meta.constraints.length > 0) {
          const constraintProp = CONSTRAINT_TO_SCHEMA_PROP[meta.type];
          if (constraintProp) {
            propSchema[constraintProp] = meta.constraints[0];
          }

          // Special case for isLength with min/max
          if (meta.type === "isLength" && meta.constraints.length > 1) {
            propSchema.minLength = meta.constraints[0];
            propSchema.maxLength = meta.constraints[1];
          }
        }
      }

      // Extract description from validation message
      if (meta.validationTypeOptions?.message && !propSchema.description) {
        propSchema.description = meta.validationTypeOptions.message.toString();
      }
    }

    // Add property to schema
    schema.properties[propName] = propSchema;
  }

  // If no required properties, remove the required array
  if (schema.required && schema.required.length === 0) {
    delete schema.required;
  }

  return schema;
}

/**
 * Extracts OpenAPI schema from class-validator metadata for arrays
 * @param dto DTO class with class-validator decorators
 * @returns OpenAPI array schema with items
 */
export function dtoToArraySchema(dto: any): PropertySchema {
  const itemSchema = dtoToSchema(dto);
  return {
    type: SchemaType.ARRAY,
    items: itemSchema, // OpenAPISchema is compatible with PropertySchema due to index signature
  };
}

/**
 * Cache for storing generated schemas to avoid duplicate work
 */
const schemaCache = new Map<any, OpenAPISchema>();

/**
 * Gets or creates a schema for a DTO, using cache for performance
 * @param dto DTO class
 * @returns OpenAPI Schema or null if no DTO provided
 */
export function getOrCreateSchema(dto: any): OpenAPISchema | null {
  if (!dto) {
    return null;
  }

  if (schemaCache.has(dto)) {
    const cachedSchema = schemaCache.get(dto);
    return cachedSchema || null;
  }

  const schema = dtoToSchema(dto);
  schemaCache.set(dto, schema);

  return schema;
}
