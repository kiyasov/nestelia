# Interface: GqlExecutionContextStatic

Defined in: [packages/apollo/src/interfaces/apollo-options.interface.ts:262](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L262)

Static interface for creating GqlExecutionContext instances.

## Methods

### create()

```ts
create<TContext>(context): GqlExecutionContext<TContext>;
```

Defined in: [packages/apollo/src/interfaces/apollo-options.interface.ts:268](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L268)

Creates a GqlExecutionContext from an ExecutionContext.

#### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `TContext` | [`GraphQLContext`](GraphQLContext.md) |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `context` | [`ExecutionContext`](../../../../index/interfaces/ExecutionContext.md) | The execution context. |

#### Returns

[`GqlExecutionContext`](GqlExecutionContext.md)\<`TContext`\>

A GqlExecutionContext instance.
