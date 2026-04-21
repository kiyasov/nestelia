# Variable: GqlExecutionContext

```ts
GqlExecutionContext: GqlExecutionContextStatic;
```

Defined in: [packages/apollo/src/interfaces/apollo-options.interface.ts:244](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L244)

Utility for creating GraphQL execution contexts.
Provides access to resolver arguments, context, and GraphQL-specific information.

## Example

```typescript
@Injectable()
class MyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const gqlContext = GqlExecutionContext.create(context);
    const user = gqlContext.getContext().user;
    return !!user;
  }
}
```
