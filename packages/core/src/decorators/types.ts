import { Provider } from "../di/provider.interface"; // Import Provider type
import type { ExecutionContext } from "../interfaces/execution-context.interface";
import { MiddlewareType } from "../interfaces/middleware.interface"; // Import MiddlewareType

// Route metadata
export interface RouteMetadata {
  method:
    | "GET"
    | "POST"
    | "PUT"
    | "PATCH"
    | "DELETE"
    | "OPTIONS"
    | "HEAD"
    | "ALL";
  path: string;
  propertyKey: string;
}

// Module options
export interface ModuleOptions {
  prefix?: string;
  imports?: any[];
  controllers?: any[];
  providers?: Provider[]; // Use the new Provider type
  middlewares?: MiddlewareType[]; // Use the new MiddlewareType
  exports?: any[];
  children?: any[];
}

// Parameter decorator metadata
export interface ParamMetadata {
  index: number;
  type: string;
  data?: string;
  factory?: (data: unknown, context: ExecutionContext) => unknown;
  schema?: unknown;
}

// ExceptionFilter metadata
export interface ExceptionFilterMetadata {
  filter: any;
  exception: any;
}

// Interceptor metadata
export interface InterceptorMetadata {
  interceptor: any;
}
