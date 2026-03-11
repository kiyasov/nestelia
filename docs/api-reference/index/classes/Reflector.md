# Class: Reflector

Defined in: [packages/core/src/di/reflector.ts:12](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/di/reflector.ts#L12)

Helper class for retrieving metadata from classes and methods using reflect-metadata.

## Constructors

### Constructor

```ts
new Reflector(): Reflector;
```

#### Returns

`Reflector`

## Methods

### get()

#### Call Signature

```ts
get<T>(metadataKey, target): T | undefined;
```

Defined in: [packages/core/src/di/reflector.ts:21](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/di/reflector.ts#L21)

Retrieve metadata for a specified key from a target object.

##### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `T` | `unknown` |

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `metadataKey` | `string` \| `symbol` | the metadata key |
| `target` | `object` \| `Constructor` | the target object |

##### Returns

`T` \| `undefined`

the metadata value

#### Call Signature

```ts
get<T>(
   metadataKey, 
   target, 
   propertyKey): T | undefined;
```

Defined in: [packages/core/src/di/reflector.ts:35](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/di/reflector.ts#L35)

Retrieve metadata for a specified key from a target object's method.

##### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `T` | `unknown` |

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `metadataKey` | `string` \| `symbol` | the metadata key |
| `target` | `object` \| `Constructor` | the target object |
| `propertyKey` | `string` \| `symbol` | the property key (method name) |

##### Returns

`T` \| `undefined`

the metadata value

***

### getAllAndMerge()

```ts
getAllAndMerge<T>(metadataKey, targets): T | undefined;
```

Defined in: [packages/core/src/di/reflector.ts:117](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/di/reflector.ts#L117)

Retrieve metadata for a specified key from multiple targets and merge the results.
Arrays will be concatenated, objects will be merged, and primitive values will be
collected into an array.

#### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `T` | `unknown` |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `metadataKey` | `string` \| `symbol` | the metadata key |
| `targets` | (`object` \| `Constructor`)[] | array of target objects to check |

#### Returns

`T` \| `undefined`

merged metadata value

***

### getAllAndOverride()

```ts
getAllAndOverride<T>(metadataKey, targets): T | undefined;
```

Defined in: [packages/core/src/di/reflector.ts:94](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/di/reflector.ts#L94)

Retrieve metadata for a specified key from multiple targets and return the first defined value.
This method is useful when you want to get metadata from both class and method, where method
metadata should override class metadata.

#### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `T` | `unknown` |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `metadataKey` | `string` \| `symbol` | the metadata key |
| `targets` | (`object` \| `Constructor`)[] | array of target objects to check |

#### Returns

`T` \| `undefined`

the first defined metadata value

***

### getMetadataKeys()

#### Call Signature

```ts
getMetadataKeys(target): (string | symbol)[];
```

Defined in: [packages/core/src/di/reflector.ts:59](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/di/reflector.ts#L59)

Retrieve all metadata keys from a target object.

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `target` | `object` \| `Constructor` | the target object |

##### Returns

(`string` \| `symbol`)[]

array of metadata keys

#### Call Signature

```ts
getMetadataKeys(target, propertyKey): (string | symbol)[];
```

Defined in: [packages/core/src/di/reflector.ts:69](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/di/reflector.ts#L69)

Retrieve all metadata keys from a target object's method.

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `target` | `object` \| `Constructor` | the target object |
| `propertyKey` | `string` \| `symbol` | the property key (method name) |

##### Returns

(`string` \| `symbol`)[]

array of metadata keys
