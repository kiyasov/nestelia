import "reflect-metadata";

import type { TSchema } from "@sinclair/typebox";

import { ROUTE_SCHEMA_METADATA } from "./constants";

export interface RouteSchemaOptions {
  body?: TSchema;
  query?: TSchema;
  params?: TSchema;
  headers?: TSchema;
  response?: TSchema | Record<number, TSchema>;
}

export function Schema(options: RouteSchemaOptions): MethodDecorator {
  return (
    target: object,
    propertyKey: string | symbol,
    _descriptor: PropertyDescriptor,
  ) => {
    Reflect.defineMetadata(
      ROUTE_SCHEMA_METADATA,
      options,
      target.constructor,
      propertyKey,
    );
  };
}
