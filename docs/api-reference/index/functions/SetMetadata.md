# Function: SetMetadata()

```ts
function SetMetadata<K, V>(metadataKey, metadataValue): MethodDecorator & ClassDecorator;
```

Defined in: [packages/core/src/decorators/set-metadata.decorator.ts:12](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/decorators/set-metadata.decorator.ts#L12)

Decorator that assigns metadata to the class using the specified key.

This metadata can be reflected using the `Reflect` API.

## Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `K` | `string` |
| `V` | `any` |

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `metadataKey` | `K` | The key used to store the metadata. |
| `metadataValue` | `V` | The value to store. |

## Returns

`MethodDecorator` & `ClassDecorator`
