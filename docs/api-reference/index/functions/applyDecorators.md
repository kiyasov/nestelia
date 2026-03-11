# Function: applyDecorators()

```ts
function applyDecorators(...decorators): (target, propertyKey?, descriptor?) => void;
```

Defined in: [packages/core/src/decorators/apply-decorators.ts:8](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/decorators/apply-decorators.ts#L8)

Applies multiple decorators to a target (class, method, or property).
Useful for composing multiple decorators into a single one.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| ...`decorators` | ( \| `ClassDecorator` \| `MethodDecorator` \| `PropertyDecorator` \| `ParameterDecorator`)[] | Array of decorators to apply. |

## Returns

```ts
(
   target, 
   propertyKey?, 
   descriptor?): void;
```

### Parameters

| Parameter | Type |
| ------ | ------ |
| `target` | `object` |
| `propertyKey?` | `string` \| `symbol` |
| `descriptor?` | `number` \| `TypedPropertyDescriptor`\<`unknown`\> |

### Returns

`void`
