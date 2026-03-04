import type { Type } from "../../di";
import { INJECT_METADATA } from "../../di/injectable.decorator";

/**
 * Get constructor dependencies for a class.
 *
 * @param target The class to get dependencies for
 * @returns Array of dependency metadata
 */
export function getConstructorDependencies(
  target: Type,
): Array<{ index: number; token: unknown }> {
  const paramTypes: (Type | undefined)[] =
    Reflect.getMetadata("design:paramtypes", target) || [];
  const injectionMetadata: Array<{ index: number; token: unknown }> =
    Reflect.getMetadata(INJECT_METADATA, target) || [];

  const dependencies: Array<{ index: number; token: unknown }> = [];

  for (let i = 0; i < paramTypes.length; i++) {
    const paramType = paramTypes[i];
    const customInjection = injectionMetadata.find((meta) => meta.index === i);
    const token = customInjection ? customInjection.token : paramType;

    if (token !== undefined) {
      dependencies.push({ index: i, token });
    }
  }

  return dependencies;
}
