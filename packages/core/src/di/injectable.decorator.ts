import "reflect-metadata";

import { INJECTABLE_METADATA } from "../decorators/constants";
import type { Type } from "./provider.interface";
import {
  Scope,
  type ScopeOptions as importedScopeOptions,
} from "./scope-options.interface";

export interface InjectableOptions extends importedScopeOptions {
  providedIn?: "root" | Type | null;
}

const defaultOptions: InjectableOptions = {
  scope: Scope.SINGLETON,
  providedIn: "root",
};

export function Injectable(
  options: InjectableOptions = defaultOptions,
): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata(
      INJECTABLE_METADATA,
      { ...defaultOptions, ...options },
      target,
    );
    return target;
  };
}

// An array for keeping track of dependencies
export const INJECT_METADATA = Symbol("INJECT_METADATA");

export function Inject(token: unknown): ParameterDecorator {
  return (target, _propertyKey, parameterIndex) => {
    const existingParams: Array<{ index: number; token: unknown }> =
      Reflect.getMetadata(INJECT_METADATA, target) || [];
    existingParams.push({ index: parameterIndex, token });
    Reflect.defineMetadata(INJECT_METADATA, existingParams, target);
  };
}

export const OPTIONAL_METADATA = Symbol("OPTIONAL_METADATA");

export function Optional(): ParameterDecorator {
  return (target, _propertyKey, parameterIndex) => {
    const existingOptionalParams: number[] =
      Reflect.getMetadata(OPTIONAL_METADATA, target) || [];
    existingOptionalParams.push(parameterIndex);
    Reflect.defineMetadata(OPTIONAL_METADATA, existingOptionalParams, target);
  };
}
