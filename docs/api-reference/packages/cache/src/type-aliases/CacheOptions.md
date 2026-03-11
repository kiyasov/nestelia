# Type Alias: CacheOptions\<T\>

```ts
type CacheOptions<T> = CacheManagerOptions & T;
```

Defined in: [packages/cache/src/interfaces/cache-module.interface.ts:21](https://github.com/kiyasov/nestelia/blob/main/packages/cache/src/interfaces/cache-module.interface.ts#L21)

Cache options combining cache manager options with store-specific configuration.

Store-specific configuration takes precedence over cache module options
due to how `createCacheManager` is implemented.

## Type Parameters

| Type Parameter | Default type | Description |
| ------ | ------ | ------ |
| `T` *extends* `StoreConfigRecord` | `StoreConfigRecord` | Store-specific configuration type. |
