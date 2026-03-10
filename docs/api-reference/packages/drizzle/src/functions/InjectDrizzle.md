# Function: InjectDrizzle()

```ts
function InjectDrizzle(tag?): ParameterDecorator;
```

Defined in: [packages/drizzle/src/decorators/inject-drizzle.decorator.ts:36](https://github.com/kiyasov/nestelia/blob/main/packages/drizzle/src/decorators/inject-drizzle.decorator.ts#L36)

Parameter/property decorator that injects a Drizzle ORM database instance.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `tag?` | `string` \| `symbol` | Custom injection token registered via `DrizzleModuleOptions.tag`. Defaults to `DRIZZLE_INSTANCE`. |

## Returns

`ParameterDecorator`

## Examples

Default instance:
```typescript
@Injectable()
export class UserService {
  constructor(
    @InjectDrizzle() private db: NodePgDatabase<typeof schema>,
  ) {}
}
```

Named instance (multiple databases):
```typescript
@Injectable()
export class ReportService {
  constructor(
    @InjectDrizzle() private primaryDb: NodePgDatabase,
    @InjectDrizzle('analytics') private analyticsDb: NodePgDatabase,
  ) {}
}
```

## Public Api
