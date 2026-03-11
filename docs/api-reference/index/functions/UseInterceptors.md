# Function: UseInterceptors()

```ts
function UseInterceptors(...interceptors): MethodDecorator & ClassDecorator;
```

Defined in: [packages/core/src/interceptors/use-interceptors.decorator.ts:13](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/interceptors/use-interceptors.decorator.ts#L13)

Decorator that binds interceptors to the scope of the controller or method,
depending on its context.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| ...`interceptors` | (`object` \| (...`args`) => `any`)[] | A single interceptor instance or class, or an array of interceptor instances or classes. |

## Returns

`MethodDecorator` & `ClassDecorator`
