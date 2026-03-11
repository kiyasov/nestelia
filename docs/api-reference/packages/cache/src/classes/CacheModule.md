# Class: CacheModule

Defined in: [packages/cache/src/cache.module.ts:77](https://github.com/kiyasov/nestelia/blob/main/packages/cache/src/cache.module.ts#L77)

Module that provides caching functionality for nestelia.

This module wraps the cache-manager library and provides:
- In-memory caching by default
- Support for Redis and other stores
- Configurable TTL and refresh thresholds
- CacheInterceptor for automatic HTTP caching

## Examples

```typescript
@Module({
  imports: [CacheModule.register({ ttl: 60000 })],
})
export class AppModule {}
```

With async configuration:
```typescript
@Module({
  imports: [
    CacheModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        store: redisStore,
        ttl: config.get('CACHE_TTL'),
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

## Extends

- `ConfigurableModuleClass`

## Indexable

```ts
[key: string]: any
```

## Constructors

### Constructor

```ts
new CacheModule(): CacheModule;
```

Defined in: [packages/core/src/module-utils/interfaces/configurable-module-cls.interface.ts:22](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/module-utils/interfaces/configurable-module-cls.interface.ts#L22)

#### Returns

`CacheModule`

#### Inherited from

```ts
ConfigurableModuleClass.constructor
```

## Methods

### forRoot()

```ts
static forRoot<T>(options?): DynamicModule;
```

Defined in: [packages/cache/src/cache.module.ts:90](https://github.com/kiyasov/nestelia/blob/main/packages/cache/src/cache.module.ts#L90)

#### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `T` *extends* `Record`\<`string`, `unknown`\> | `Record`\<`string`, `unknown`\> |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `options` | [`CacheModuleOptions`](../type-aliases/CacheModuleOptions.md)\<`T`\> |

#### Returns

[`DynamicModule`](../../../../index/interfaces/DynamicModule.md)

***

### forRootAsync()

```ts
static forRootAsync<T>(options): DynamicModule;
```

Defined in: [packages/cache/src/cache.module.ts:96](https://github.com/kiyasov/nestelia/blob/main/packages/cache/src/cache.module.ts#L96)

#### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `T` *extends* `Record`\<`string`, `unknown`\> | `Record`\<`string`, `unknown`\> |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `options` | [`CacheModuleAsyncOptions`](../interfaces/CacheModuleAsyncOptions.md)\<`T`\> |

#### Returns

[`DynamicModule`](../../../../index/interfaces/DynamicModule.md)

***

### register()

```ts
static register<T>(options?): DynamicModule;
```

Defined in: [packages/cache/src/cache.module.ts:78](https://github.com/kiyasov/nestelia/blob/main/packages/cache/src/cache.module.ts#L78)

#### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `T` *extends* `Record`\<`string`, `unknown`\> | `Record`\<`string`, `unknown`\> |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `options` | [`CacheModuleOptions`](../type-aliases/CacheModuleOptions.md)\<`T`\> |

#### Returns

[`DynamicModule`](../../../../index/interfaces/DynamicModule.md)

#### Overrides

```ts
ConfigurableModuleClass.register
```

***

### registerAsync()

```ts
static registerAsync<T>(options): DynamicModule;
```

Defined in: [packages/cache/src/cache.module.ts:84](https://github.com/kiyasov/nestelia/blob/main/packages/cache/src/cache.module.ts#L84)

#### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `T` *extends* `Record`\<`string`, `unknown`\> | `Record`\<`string`, `unknown`\> |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `options` | [`CacheModuleAsyncOptions`](../interfaces/CacheModuleAsyncOptions.md)\<`T`\> |

#### Returns

[`DynamicModule`](../../../../index/interfaces/DynamicModule.md)

#### Overrides

```ts
ConfigurableModuleClass.registerAsync
```
