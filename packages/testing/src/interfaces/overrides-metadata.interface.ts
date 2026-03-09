import type {
  ProviderToken,
  Type,
} from "nestelia";

/**
 * Metadata for provider overrides in testing module
 */
export interface OverridesMetadata {
  token: ProviderToken;
  type: "value" | "class" | "factory";
  value?: unknown;
  metatype?: Type;
  factory?: (...args: unknown[]) => unknown;
  inject?: ProviderToken[];
}
