# Function: createMethodMetadataCache()

```ts
function createMethodMetadataCache<T>(): {
  get: T;
  reset: void;
};
```

Defined in: packages/core/src/utils/metadata-cache.ts:26

Lazily-populated cache for method-level Reflect metadata.
Two-level lookup: WeakMap<object, Map<string | symbol, T>>.

## Type Parameters

| Type Parameter |
| ------ |
| `T` |

## Returns

```ts
{
  get: T;
  reset: void;
}
```

| Name | Type | Defined in |
| ------ | ------ | ------ |
| `get()` | ( `target`, `method`, `factory`) => `T` | packages/core/src/utils/metadata-cache.ts:29 |
| `reset()` | () => `void` | packages/core/src/utils/metadata-cache.ts:42 |
