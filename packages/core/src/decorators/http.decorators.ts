
import type { ExecutionContext } from "../interfaces/execution-context.interface";
import { PARAMS_METADATA, ROUTE_METADATA } from "./constants";
import type { ParamMetadata, RouteMetadata } from "./types";

function isTypeBoxSchema(value: unknown): value is object {
  return typeof value === "object" && value !== null && Symbol.for("TypeBox.Kind") in value;
}

type CustomParamFactory = (data: unknown, context: ExecutionContext) => unknown;

const createMappingDecorator =
  (method: RouteMetadata["method"]) =>
  (path = ""): MethodDecorator =>
  (
    target: object,
    propertyKey: string | symbol,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _descriptor: PropertyDescriptor,
  ) => {
    const routes =
      Reflect.getOwnMetadata(ROUTE_METADATA, target.constructor) || [];
    routes.push({ method, path, propertyKey: propertyKey as string });
    Reflect.defineMetadata(ROUTE_METADATA, routes, target.constructor);
  };

export const Get = createMappingDecorator("GET");
export const Post = createMappingDecorator("POST");
export const Put = createMappingDecorator("PUT");
export const Delete = createMappingDecorator("DELETE");
export const Patch = createMappingDecorator("PATCH");
export const Options = createMappingDecorator("OPTIONS");
export const Head = createMappingDecorator("HEAD");
export const All = createMappingDecorator("ALL");

export function createParamDecorator(
  factory: CustomParamFactory,
): () => ParameterDecorator;
export function createParamDecorator(
  type: string,
  data?: string,
): () => ParameterDecorator;
export function createParamDecorator(
  typeOrFactory: string | CustomParamFactory,
  dataArg?: string,
) {
  return (): ParameterDecorator =>
    (
      target: object,
      propertyKey: string | symbol | undefined,
      parameterIndex: number,
    ) => {
      const params =
        Reflect.getOwnMetadata(
          PARAMS_METADATA,
          target.constructor,
          propertyKey as string,
        ) || [];
      if (typeof typeOrFactory === "function") {
        params.push({
          index: parameterIndex,
          type: "__factory__",
          factory: typeOrFactory,
        });
      } else {
        params.push({
          index: parameterIndex,
          type: typeOrFactory,
          data: dataArg,
        });
      }
      params.sort((a: ParamMetadata, b: ParamMetadata) => a.index - b.index);
      Reflect.defineMetadata(
        PARAMS_METADATA,
        params,
        target.constructor,
        propertyKey as string,
      );
    };
}

function createSchemaParamDecorator(paramType: string) {
  return (schema: object): ParameterDecorator => {
    if (!isTypeBoxSchema(schema)) {
      throw new Error(`Schema is required for ${paramType} decorator`);
    }
    return (
      target: object,
      propertyKey: string | symbol | undefined,
      parameterIndex: number,
    ) => {
      const params: ParamMetadata[] =
        Reflect.getOwnMetadata(
          PARAMS_METADATA,
          target.constructor,
          propertyKey as string,
        ) || [];
      params.push({
        index: parameterIndex,
        type: paramType,
        schema,
      });
      params.sort((a: ParamMetadata, b: ParamMetadata) => a.index - b.index);
      Reflect.defineMetadata(
        PARAMS_METADATA,
        params,
        target.constructor,
        propertyKey as string,
      );
    };
  };
}

export const Body = createSchemaParamDecorator("body") as (
  schema: object,
) => ParameterDecorator;
export const Param = createSchemaParamDecorator("param") as (
  schema: object,
) => ParameterDecorator;
export const Query = createSchemaParamDecorator("query") as (
  schema: object,
) => ParameterDecorator;
export const Headers = (property?: string): ParameterDecorator =>
  createParamDecorator("headers", property)();

export const Cookies = (property?: string): ParameterDecorator =>
  createParamDecorator("cookies", property)();

export const Req = createParamDecorator("request");
export const Request = Req;
export const Res = createParamDecorator("response");
export const Response = Res;
export const Ip = createParamDecorator("ip");
export const Session = createParamDecorator("session");

export const RawBody = createParamDecorator("raw-body");
export const Ctx = createParamDecorator("context");
export const ElysiaContext = createParamDecorator("elysiaContext");
