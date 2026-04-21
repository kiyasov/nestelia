# Interface: GqlExecutionContext\<TContext\>

Defined in: [packages/apollo/src/interfaces/apollo-options.interface.ts:244](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L244)

Context accessor for GraphQL resolvers - mirrors the GqlExecutionContext API.

## Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `TContext` | [`GraphQLContext`](GraphQLContext.md) |

## Methods

### getArgs()

```ts
getArgs<T>(): T;
```

Defined in: [packages/apollo/src/interfaces/apollo-options.interface.ts:246](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L246)

Gets the resolver arguments.

#### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `T` | `Record`\<`string`, `unknown`\> |

#### Returns

`T`

***

### getContext()

```ts
getContext(): TContext;
```

Defined in: [packages/apollo/src/interfaces/apollo-options.interface.ts:254](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L254)

Gets the GraphQL context.

#### Returns

`TContext`

***

### getFieldName()

```ts
getFieldName(): string;
```

Defined in: [packages/apollo/src/interfaces/apollo-options.interface.ts:248](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L248)

Gets the name of the current field being resolved.

#### Returns

`string`

***

### getInfo()

```ts
getInfo(): GraphQLResolveInfo;
```

Defined in: [packages/apollo/src/interfaces/apollo-options.interface.ts:258](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L258)

Gets the GraphQL resolve info.

#### Returns

`GraphQLResolveInfo`

***

### getOperation()

```ts
getOperation(): string | undefined;
```

Defined in: [packages/apollo/src/interfaces/apollo-options.interface.ts:250](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L250)

Gets the operation type (query, mutation, subscription).

#### Returns

`string` \| `undefined`

***

### getParent()

```ts
getParent<T>(): T;
```

Defined in: [packages/apollo/src/interfaces/apollo-options.interface.ts:256](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L256)

Gets the parent object (for field resolvers).

#### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `T` | `unknown` |

#### Returns

`T`

***

### getVariables()

```ts
getVariables<T>(): T;
```

Defined in: [packages/apollo/src/interfaces/apollo-options.interface.ts:252](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L252)

Gets the GraphQL variables.

#### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `T` | `Record`\<`string`, `unknown`\> |

#### Returns

`T`
