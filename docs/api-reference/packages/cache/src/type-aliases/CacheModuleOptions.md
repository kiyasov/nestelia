# Type Alias: CacheModuleOptions\<T\>

```ts
type CacheModuleOptions<T> = CacheOptions<T> & {
  isGlobal?: boolean;
};
```

Defined in: [packages/cache/src/interfaces/cache-module.interface.ts:30](https://github.com/kiyasov/nestelia/blob/main/packages/cache/src/interfaces/cache-module.interface.ts#L30)

Options for configuring the Cache module.

## Type Declaration

| Name | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| `isGlobal?` | `boolean` | If `true`, register `CacheModule` as a global module. **Default** `false` | [packages/cache/src/interfaces/cache-module.interface.ts:38](https://github.com/kiyasov/nestelia/blob/main/packages/cache/src/interfaces/cache-module.interface.ts#L38) |

## Type Parameters

| Type Parameter | Default type | Description |
| ------ | ------ | ------ |
| `T` *extends* `StoreConfigRecord` | `StoreConfigRecord` | Store-specific configuration type. |
