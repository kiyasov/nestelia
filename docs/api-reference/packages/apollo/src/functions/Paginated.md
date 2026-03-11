# Function: Paginated()

```ts
function Paginated<T>(ItemType): AnyConstructor;
```

Defined in: [packages/apollo/src/pagination.ts:47](https://github.com/kiyasov/nestelia/blob/main/packages/apollo/src/pagination.ts#L47)

Creates a simple paginated response type for a given item class.
Fields: `items`, `total`, `hasNextPage`, `hasPreviousPage`.

## Type Parameters

| Type Parameter |
| ------ |
| `T` |

## Parameters

| Parameter | Type |
| ------ | ------ |
| `ItemType` | `Constructor`\<`T`\> |

## Returns

`AnyConstructor`

## Example

```typescript
@ObjectType()
class BooksPage extends Paginated(Book) {}

@Query(() => BooksPage)
books(@Args() args: BooksArgs): BooksPage { ... }
```
