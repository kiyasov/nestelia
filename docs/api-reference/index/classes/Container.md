# Class: Container

Defined in: [packages/core/src/di/container.ts:18](https://github.com/nestelia/nestelia/blob/main/packages/core/src/di/container.ts#L18)

## Accessors

### instance

#### Get Signature

```ts
get static instance(): Container;
```

Defined in: [packages/core/src/di/container.ts:32](https://github.com/nestelia/nestelia/blob/main/packages/core/src/di/container.ts#L32)

##### Returns

`Container`

## Methods

### addGlobalModule()

```ts
addGlobalModule(module): void;
```

Defined in: [packages/core/src/di/container.ts:75](https://github.com/nestelia/nestelia/blob/main/packages/core/src/di/container.ts#L75)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `module` | `Module` |

#### Returns

`void`

***

### addModule()

```ts
addModule(metatype, token): Module;
```

Defined in: [packages/core/src/di/container.ts:44](https://github.com/nestelia/nestelia/blob/main/packages/core/src/di/container.ts#L44)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `metatype` | [`Type`](../interfaces/Type.md) |
| `token` | `string` |

#### Returns

`Module`

***

### beginInitSession()

```ts
beginInitSession(): void;
```

Defined in: [packages/core/src/di/container.ts:214](https://github.com/nestelia/nestelia/blob/main/packages/core/src/di/container.ts#L214)

#### Returns

`void`

***

### bindGlobalModuleToModule()

```ts
bindGlobalModuleToModule(target, globalModule): void;
```

Defined in: [packages/core/src/di/container.ts:95](https://github.com/nestelia/nestelia/blob/main/packages/core/src/di/container.ts#L95)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `target` | `Module` |
| `globalModule` | `Module` |

#### Returns

`void`

***

### bindGlobalScope()

```ts
bindGlobalScope(): void;
```

Defined in: [packages/core/src/di/container.ts:83](https://github.com/nestelia/nestelia/blob/main/packages/core/src/di/container.ts#L83)

#### Returns

`void`

***

### bindGlobalsToImports()

```ts
bindGlobalsToImports(moduleRef): void;
```

Defined in: [packages/core/src/di/container.ts:89](https://github.com/nestelia/nestelia/blob/main/packages/core/src/di/container.ts#L89)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `moduleRef` | `Module` |

#### Returns

`void`

***

### clear()

```ts
clear(): void;
```

Defined in: [packages/core/src/di/container.ts:207](https://github.com/nestelia/nestelia/blob/main/packages/core/src/di/container.ts#L207)

#### Returns

`void`

***

### get()

#### Call Signature

```ts
get<T>(
   token, 
   moduleKey?, 
contextId?): Promise<T | undefined>;
```

Defined in: [packages/core/src/di/container.ts:102](https://github.com/nestelia/nestelia/blob/main/packages/core/src/di/container.ts#L102)

##### Type Parameters

| Type Parameter |
| ------ |
| `T` |

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `token` | [`Type`](../interfaces/Type.md)\<`T`\> |
| `moduleKey?` | [`Type`](../interfaces/Type.md)\<`unknown`\> |
| `contextId?` | [`ContextId`](../interfaces/ContextId.md) |

##### Returns

`Promise`\<`T` \| `undefined`\>

#### Call Signature

```ts
get<T>(
   token, 
   moduleKey?, 
contextId?): Promise<T | undefined>;
```

Defined in: [packages/core/src/di/container.ts:103](https://github.com/nestelia/nestelia/blob/main/packages/core/src/di/container.ts#L103)

##### Type Parameters

| Type Parameter |
| ------ |
| `T` |

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `token` | [`ProviderToken`](../type-aliases/ProviderToken.md) |
| `moduleKey?` | [`Type`](../interfaces/Type.md)\<`unknown`\> |
| `contextId?` | [`ContextId`](../interfaces/ContextId.md) |

##### Returns

`Promise`\<`T` \| `undefined`\>

***

### getFromModule()

```ts
getFromModule<T>(
   token, 
   moduleKey, 
contextId?): Promise<T | undefined>;
```

Defined in: [packages/core/src/di/container.ts:177](https://github.com/nestelia/nestelia/blob/main/packages/core/src/di/container.ts#L177)

#### Type Parameters

| Type Parameter |
| ------ |
| `T` |

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `token` | [`ProviderToken`](../type-aliases/ProviderToken.md) | `undefined` |
| `moduleKey` | `string` | `undefined` |
| `contextId` | [`ContextId`](../interfaces/ContextId.md) | `STATIC_CONTEXT` |

#### Returns

`Promise`\<`T` \| `undefined`\>

***

### getGlobalModules()

```ts
getGlobalModules(): Set<Module>;
```

Defined in: [packages/core/src/di/container.ts:79](https://github.com/nestelia/nestelia/blob/main/packages/core/src/di/container.ts#L79)

#### Returns

`Set`\<`Module`\>

***

### getModuleByKey()

```ts
getModuleByKey(key): Module | undefined;
```

Defined in: [packages/core/src/di/container.ts:71](https://github.com/nestelia/nestelia/blob/main/packages/core/src/di/container.ts#L71)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `key` | `string` |

#### Returns

`Module` \| `undefined`

***

### getModules()

```ts
getModules(): Map<string, Module>;
```

Defined in: [packages/core/src/di/container.ts:67](https://github.com/nestelia/nestelia/blob/main/packages/core/src/di/container.ts#L67)

#### Returns

`Map`\<`string`, `Module`\>

***

### isInitializedInSession()

```ts
isInitializedInSession(metatype): boolean;
```

Defined in: [packages/core/src/di/container.ts:218](https://github.com/nestelia/nestelia/blob/main/packages/core/src/di/container.ts#L218)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `metatype` | [`Type`](../interfaces/Type.md) |

#### Returns

`boolean`

***

### markInitializedInSession()

```ts
markInitializedInSession(metatype): void;
```

Defined in: [packages/core/src/di/container.ts:222](https://github.com/nestelia/nestelia/blob/main/packages/core/src/di/container.ts#L222)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `metatype` | [`Type`](../interfaces/Type.md) |

#### Returns

`void`

***

### register()

```ts
register(providers, moduleKey?): void;
```

Defined in: [packages/core/src/di/container.ts:256](https://github.com/nestelia/nestelia/blob/main/packages/core/src/di/container.ts#L256)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `providers` | [`Provider`](../type-aliases/Provider.md)[] |
| `moduleKey?` | [`Type`](../interfaces/Type.md)\<`unknown`\> |

#### Returns

`void`

***

### registerControllers()

```ts
registerControllers(controllers, moduleKey?): void;
```

Defined in: [packages/core/src/di/container.ts:227](https://github.com/nestelia/nestelia/blob/main/packages/core/src/di/container.ts#L227)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `controllers` | [`Type`](../interfaces/Type.md)\<`unknown`\>[] |
| `moduleKey?` | [`Type`](../interfaces/Type.md)\<`unknown`\> |

#### Returns

`void`

***

### create()

```ts
static create(): Container;
```

Defined in: [packages/core/src/di/container.ts:40](https://github.com/nestelia/nestelia/blob/main/packages/core/src/di/container.ts#L40)

Creates a new, isolated container instance (for testing).

#### Returns

`Container`

***

### getRequestContext()

```ts
static getRequestContext(): RequestContext | undefined;
```

Defined in: [packages/core/src/di/container.ts:285](https://github.com/nestelia/nestelia/blob/main/packages/core/src/di/container.ts#L285)

#### Returns

[`RequestContext`](../interfaces/RequestContext.md) \| `undefined`

***

### runInRequestContext()

```ts
static runInRequestContext<R>(context, fn): R;
```

Defined in: [packages/core/src/di/container.ts:289](https://github.com/nestelia/nestelia/blob/main/packages/core/src/di/container.ts#L289)

#### Type Parameters

| Type Parameter |
| ------ |
| `R` |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `context` | [`RequestContext`](../interfaces/RequestContext.md) |
| `fn` | () => `R` |

#### Returns

`R`
