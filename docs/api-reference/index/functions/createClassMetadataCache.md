# Function: createClassMetadataCache()

```ts
function createClassMetadataCache<T>(): {
  get: T;
  reset: void;
};
```

Defined in: [packages/core/src/utils/metadata-cache.ts:5](https://github.com/nestelia/nestelia/blob/main/packages/core/src/utils/metadata-cache.ts#L5)

Lazily-populated WeakMap cache for class-level Reflect metadata.
Automatically garbage-collects entries when the class is collected.

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
| `get()` | (`target`, `factory`) => `T` | [packages/core/src/utils/metadata-cache.ts:8](https://github.com/nestelia/nestelia/blob/main/packages/core/src/utils/metadata-cache.ts#L8) |
| `reset()` | () => `void` | [packages/core/src/utils/metadata-cache.ts:16](https://github.com/nestelia/nestelia/blob/main/packages/core/src/utils/metadata-cache.ts#L16) |
