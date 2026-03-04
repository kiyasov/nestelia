export interface ValidationErrorDetails {
  on: string;
  property: string;
  message: string;
  expected?: unknown;
}

export function isValidationError(error: unknown): error is Error & {
  code: "VALIDATION";
  status: number;
  type: string;
  expected?: unknown;
  validator?: { properties?: Record<string, unknown> };
} {
  return (
    error instanceof Error &&
    "code" in error &&
    (error as { code: unknown }).code === "VALIDATION"
  );
}

export function parseValidationError(error: {
  message: string;
  type?: string;
  validator?: Record<string, unknown>;
}): ValidationErrorDetails {
  let parsed: {
    on?: string;
    property?: string;
    message?: string;
  } = {};

  try {
    parsed = JSON.parse(error.message) as typeof parsed;
  } catch {
    parsed = { message: error.message };
  }

  const expected = extractExpectedSchema(error.validator);

  const property = parsed.property ?? "unknown";
  // Remove leading slash from JSON Pointer format (/ip -> ip)
  const cleanProperty =
    typeof property === "string" && property.startsWith("/")
      ? property.slice(1)
      : property;

  return {
    on: parsed.on ?? error.type ?? "unknown",
    property: cleanProperty,
    message: parsed.message ?? "invalid",
    expected,
  };
}

function extractExpectedSchema(
  validator: Record<string, unknown> | undefined,
): Record<string, string> | undefined {
  if (!validator) {
    return undefined;
  }

  const schema = validator.schema as
    | { properties?: Record<string, { type?: string }>; required?: string[] }
    | undefined;

  const props =
    (validator.properties as Record<string, { type?: string }>) ??
    schema?.properties;

  if (!props) {
    return undefined;
  }

  const required = new Set(
    (validator.required as string[]) ?? schema?.required ?? Object.keys(props),
  );

  return Object.fromEntries(
    Object.entries(props).map(([key, val]) => [
      key,
      `${val.type ?? "unknown"}${required.has(key) ? "" : "?"}`,
    ]),
  );
}
