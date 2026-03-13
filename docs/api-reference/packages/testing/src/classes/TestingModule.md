# Class: TestingModule

Defined in: [packages/testing/src/testing.module-builder.ts:284](https://github.com/nestelia/nestelia/blob/main/packages/testing/src/testing.module-builder.ts#L284)

Compiled testing module with methods to access providers

## Accessors

### container

#### Get Signature

```ts
get container(): Container;
```

Defined in: [packages/testing/src/testing.module-builder.ts:362](https://github.com/nestelia/nestelia/blob/main/packages/testing/src/testing.module-builder.ts#L362)

Get the container instance

##### Returns

[`Container`](../../../../index/classes/Container.md)

***

### module

#### Get Signature

```ts
get module(): Module;
```

Defined in: [packages/testing/src/testing.module-builder.ts:355](https://github.com/nestelia/nestelia/blob/main/packages/testing/src/testing.module-builder.ts#L355)

Get the module reference

##### Returns

`Module`

## Constructors

### Constructor

```ts
new TestingModule(_module, _container): TestingModule;
```

Defined in: [packages/testing/src/testing.module-builder.ts:285](https://github.com/nestelia/nestelia/blob/main/packages/testing/src/testing.module-builder.ts#L285)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `_module` | `Module` |
| `_container` | [`Container`](../../../../index/classes/Container.md) |

#### Returns

`TestingModule`

## Methods

### get()

```ts
get<T>(token): T;
```

Defined in: [packages/testing/src/testing.module-builder.ts:294](https://github.com/nestelia/nestelia/blob/main/packages/testing/src/testing.module-builder.ts#L294)

Get a provider instance from the module.
Synchronous - returns already resolved instance.

#### Type Parameters

| Type Parameter |
| ------ |
| `T` |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `token` | [`ProviderToken`](../../../../index/type-aliases/ProviderToken.md) |

#### Returns

`T`

***

### has()

```ts
has(token): boolean;
```

Defined in: [packages/testing/src/testing.module-builder.ts:343](https://github.com/nestelia/nestelia/blob/main/packages/testing/src/testing.module-builder.ts#L343)

Check if provider exists in module

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `token` | [`ProviderToken`](../../../../index/type-aliases/ProviderToken.md) |

#### Returns

`boolean`

***

### resolve()

```ts
resolve<T>(token): Promise<T>;
```

Defined in: [packages/testing/src/testing.module-builder.ts:328](https://github.com/nestelia/nestelia/blob/main/packages/testing/src/testing.module-builder.ts#L328)

Resolve a provider instance (async, for request-scoped providers)

#### Type Parameters

| Type Parameter |
| ------ |
| `T` |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `token` | [`ProviderToken`](../../../../index/type-aliases/ProviderToken.md) |

#### Returns

`Promise`\<`T`\>
