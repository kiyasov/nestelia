import type { ContextId } from "./constants";
import { STATIC_CONTEXT } from "./constants";
import type { Container } from "./container";
import type { Module } from "./module";
import type { ProviderToken } from "./provider.interface";

/**
 * Options for ModuleRef.get() method
 */
export interface GetOptions {
  /**
   * If true, only search in the current module.
   * If false (default), search in current module and all imported modules.
   */
  strict?: boolean;
}

/**
 * ModuleRef provides a way to access providers within a module.
 * It is automatically injected by the framework and allows retrieving
 * providers dynamically at runtime.
 *
 * @example
 * ```typescript
 * @Injectable()
 * class MyService {
 *   constructor(private moduleRef: ModuleRef) {}
 *
 *   doSomething() {
 *     const configService = this.moduleRef.get(ConfigService);
 *     // use configService
 *   }
 * }
 * ```
 */
export class ModuleRef {
  private readonly _container: Container;
  private readonly _module: Module;

  constructor(container: Container, moduleRef: Module) {
    this._container = container;
    this._module = moduleRef;
  }

  /**
   * Get a provider instance from the module.
   * Returns only already resolved instances (synchronous).
   *
   * @param token The provider token (class or injection token)
   * @param options Options for the lookup
   * @returns The provider instance
   * @throws Error if provider not found or not resolved
   *
   * @example
   * ```typescript
   * // Get from current module and imports
   * const service = this.moduleRef.get(MyService);
   *
   * // Get only from current module (strict mode)
   * const service = this.moduleRef.get(MyService, { strict: true });
   * ```
   */
  get<T>(token: ProviderToken, options: GetOptions = {}): T {
    const { strict = false } = options;
    const tokenName = typeof token === "function" ? token.name : String(token);

    if (strict) {
      // Only search in current module's own providers
      const wrapper = this._module.getProviderByKey<T>(token);
      if (!wrapper) {
        throw new Error(
          `Provider "${tokenName}" not found in module "${this._module.name}"`,
        );
      }

      const contextId: ContextId = STATIC_CONTEXT;
      const instancePerContext = wrapper.getInstanceByContextId(contextId);

      if (!instancePerContext.isResolved) {
        throw new Error(
          `Provider "${tokenName}" is not resolved yet in module "${this._module.name}"`,
        );
      }

      return instancePerContext.instance as T;
    }

    // Search in current module and imports (non-strict)
    // First check own providers
    let wrapper = this._module.getProviderByKey<T>(token);

    // Then check imported modules
    if (!wrapper) {
      for (const importedModule of this._module.imports) {
        wrapper = importedModule.getProviderByKey<T>(token);
        if (wrapper) {
          break;
        }
      }
    }

    if (!wrapper) {
      throw new Error(
        `Provider "${tokenName}" not found in module "${this._module.name}" or its imports`,
      );
    }

    const contextId: ContextId = STATIC_CONTEXT;
    const instancePerContext = wrapper.getInstanceByContextId(contextId);

    if (!instancePerContext.isResolved) {
      throw new Error(`Provider "${tokenName}" is not resolved yet`);
    }

    return instancePerContext.instance as T;
  }

  /**
   * Get the module token/name
   */
  get moduleToken(): string {
    return this._module.token;
  }

  /**
   * Get the module metatype (class)
   */
  get moduleMetatype(): ProviderToken {
    return this._module.metatype;
  }
}
