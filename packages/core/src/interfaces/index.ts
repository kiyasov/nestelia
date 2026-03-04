import type { DynamicModule, Type } from "../di";
export type { DynamicModule, FactoryProvider, InjectionToken, OptionalFactoryDependency, Provider, Type } from "../di";
export * from "./execution-context.interface";
export * from "./lifecycle.interface";
export type { ElysiaNestMiddleware, FunctionalMiddleware, MiddlewareType } from "./middleware.interface";
export { isClassMiddleware } from "./middleware.interface";

export interface ModuleMetadata {
  imports?: Array<Type | DynamicModule>;
}
