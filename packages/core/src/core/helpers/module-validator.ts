import type { ModuleOptions } from "../../decorators/types";
import { Container, DIContainer, ModuleRef, type Type } from "../../di";
import { getConstructorDependencies } from "./di-helpers";

/**
 * Validate that all controller dependencies can be resolved.
 *
 * @param controllers Array of controller classes
 * @param providers Module providers
 * @param moduleKey Module key for DI container
 * @throws Error if dependencies are missing
 */
export async function validateModuleDependencies(
  controllers: Type[],
  providers: ModuleOptions["providers"],
  moduleKey: Type,
): Promise<void> {
  const registeredTokens = new Set<unknown>();

  // Collect all registered provider tokens
  if (providers) {
    for (const provider of providers) {
      if (typeof provider === "function") {
        registeredTokens.add(provider);
      } else if ("provide" in provider) {
        registeredTokens.add(provider.provide);
        // Also add useClass if present
        if ("useClass" in provider && provider.useClass) {
          registeredTokens.add(provider.useClass);
        }
      }
    }
  }

  const missingDependencies: Array<{
    controller: string;
    dependency: string;
    index: number;
  }> = [];

  // Check each controller's dependencies
  for (const controller of controllers) {
    const dependencies = getConstructorDependencies(controller);

    for (const dep of dependencies) {
      const token = dep.token;

      // Object means TypeScript couldn't emit the real type (e.g. import type was used)
      if (token === Object) {
        continue;
      }

      const tokenName =
        typeof token === "function" ? token.name : String(token);

      // Check if dependency is registered
      let isRegistered = registeredTokens.has(token);

      // Check if it's ModuleRef (built-in provider)
      if (!isRegistered && token === ModuleRef) {
        isRegistered = true;
      }

      // Also check if it's a global provider or already in container
      if (!isRegistered) {
        try {
          const fromContainer = await DIContainer.get(token as Type, moduleKey);
          if (fromContainer !== undefined) {
            isRegistered = true;
          }
        } catch {
          // Not found in container
        }
      }

      // Check global modules
      if (!isRegistered) {
        for (const globalModule of Container.instance.getGlobalModules()) {
          const wrapper = globalModule.getProviderByKey(token as import("../../di").ProviderToken);
          if (wrapper) {
            isRegistered = true;
            break;
          }
        }
      }

      if (!isRegistered) {
        missingDependencies.push({
          controller: controller.name,
          dependency: tokenName,
          index: dep.index,
        });
      }
    }
  }

  if (missingDependencies.length > 0) {
    const errors = missingDependencies.map(
      (m) => `  - ${m.controller}[${m.index}]: ${m.dependency}`,
    );
    throw new Error(
      `Module validation failed. Missing providers for controller dependencies:\n${errors.join("\n")}\n\n` +
        `Make sure to add these providers to the "providers" array in your @Module() decorator.`,
    );
  }
}
