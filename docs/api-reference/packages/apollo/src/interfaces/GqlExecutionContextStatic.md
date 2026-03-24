# Interface: GqlExecutionContextStatic

Defined in: [packages/apollo/src/interfaces/apollo-options.interface.ts:229](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L229)

Static interface for creating GqlExecutionContext instances.

## Methods

### create()

```ts
create<TContext>(context): GqlExecutionContext<TContext>;
```

Defined in: [packages/apollo/src/interfaces/apollo-options.interface.ts:235](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L235)

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
