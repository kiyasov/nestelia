export interface Type<T = unknown> {
  new (...args: any[]): T;
}

export interface AbstractType<T = unknown> {
  prototype: T;
}

import type { ScopeOptions } from "./scope-options.interface";

export interface ForwardReference<T = unknown> {
  forwardRef: () => T;
}

export type ProviderToken =
  | Type<unknown>
  | AbstractType<unknown>
  | string
  | symbol
  | ForwardReference;

export function forwardRef<T>(fn: () => T): ForwardReference<T> {
  return {
    forwardRef: fn,
  };
}

export function isForwardRef<T>(token: unknown): token is ForwardReference<T> {
  return (
    typeof token === "object" &&
    token !== null &&
    "forwardRef" in token &&
    typeof (token as ForwardReference).forwardRef === "function"
  );
}

export interface BaseProvider extends ScopeOptions {
  provide: ProviderToken;
}

export type TypeProvider = Type;

export interface ValueProvider extends BaseProvider {
  useValue: unknown;
}

export interface ClassProvider extends BaseProvider {
  useClass: Type;
}

export interface FactoryProvider<T = unknown> extends BaseProvider {
  // Method signature (not a function-property type) is intentionally bivariant
  // in TypeScript, which allows typed factory functions like
  // `(svc: MyService) => value` to be assigned here without widening to `any`.
  // The DI container resolves `inject` tokens at runtime and passes them
  // positionally, so the concrete parameter types are always safe.
  useFactory(...args: unknown[]): T | Promise<T>;
  inject?: Array<ProviderToken | { token: ProviderToken; optional?: boolean }>;
  durable?: boolean;
}

export interface ExistingProvider extends BaseProvider {
  useExisting: ProviderToken;
}

export type Provider =
  | TypeProvider
  | ValueProvider
  | ClassProvider
  | FactoryProvider
  | ExistingProvider;

export type InjectionToken = ProviderToken;
export type OptionalFactoryDependency = { token: ProviderToken; optional?: boolean };

/**
 * Dynamic module configuration
 */
export interface DynamicModule {
  module: Type;
  providers?: Provider[];
  exports?: Array<ProviderToken | Provider>;
  imports?: Array<Type | DynamicModule>;
  global?: boolean;
}

// Type guard to check if a provider is a TypeProvider (just a class)
export function isTypeProvider(provider: Provider): provider is TypeProvider {
  return typeof provider === "function";
}

// Type guard to check if a provider is a CustomProvider (object with 'provide' key)
export function isCustomProvider(
  provider: Provider,
): provider is
  | ValueProvider
  | ClassProvider
  | FactoryProvider
  | ExistingProvider {
  return (
    typeof provider === "object" && provider !== null && "provide" in provider
  );
}

// Type guard for FactoryProvider
export function isFactoryProvider(
  provider: Provider,
): provider is FactoryProvider {
  return isCustomProvider(provider) && "useFactory" in provider;
}

// Type guard for ValueProvider
export function isValueProvider(provider: Provider): provider is ValueProvider {
  return isCustomProvider(provider) && "useValue" in provider;
}

// Type guard for ClassProvider
export function isClassProvider(provider: Provider): provider is ClassProvider {
  return isCustomProvider(provider) && "useClass" in provider;
}

// Type guard for ExistingProvider
export function isExistingProvider(
  provider: Provider,
): provider is ExistingProvider {
  return isCustomProvider(provider) && "useExisting" in provider;
}
