/**
 * Lazily-populated WeakMap cache for class-level Reflect metadata.
 * Automatically garbage-collects entries when the class is collected.
 */
export function createClassMetadataCache<T>() {
  let cache = new WeakMap<object, T>();
  return {
    get(target: object, factory: () => T): T {
      let value = cache.get(target);
      if (value === undefined && !cache.has(target)) {
        value = factory();
        cache.set(target, value);
      }
      return value!;
    },
    reset(): void {
      cache = new WeakMap();
    },
  };
}

/**
 * Lazily-populated cache for method-level Reflect metadata.
 * Two-level lookup: WeakMap<object, Map<string | symbol, T>>.
 */
export function createMethodMetadataCache<T>() {
  let cache = new WeakMap<object, Map<string | symbol, T>>();
  return {
    get(target: object, method: string | symbol, factory: () => T): T {
      let methodMap = cache.get(target);
      if (!methodMap) {
        methodMap = new Map();
        cache.set(target, methodMap);
      }
      let value = methodMap.get(method);
      if (value === undefined && !methodMap.has(method)) {
        value = factory();
        methodMap.set(method, value);
      }
      return value!;
    },
    reset(): void {
      cache = new WeakMap();
    },
  };
}
