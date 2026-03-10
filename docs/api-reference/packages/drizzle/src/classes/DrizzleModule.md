# Class: DrizzleModule

Defined in: [packages/drizzle/src/drizzle.module.ts:74](https://github.com/kiyasov/nestelia/blob/main/packages/drizzle/src/drizzle.module.ts#L74)

DrizzleModule — integrates drizzle-orm with nestelia's dependency injection.

Accepts any pre-configured drizzle-orm database instance and makes it
injectable throughout the application. Supports all drizzle-orm dialects
(PostgreSQL, MySQL, SQLite) and multiple simultaneous database instances
via the `tag` option.

## Examples

Synchronous registration:
```typescript
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

@Module({
  imports: [
    DrizzleModule.forRoot({
      db: drizzle(new Pool({ connectionString: process.env.DATABASE_URL }), { schema }),
      isGlobal: true,
    }),
  ],
})
export class AppModule {}
```

Asynchronous registration:
```typescript
@Module({
  imports: [
    DrizzleModule.forRootAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        db: drizzle(
          new Pool({ connectionString: config.get('DATABASE_URL') }),
          { schema },
        ),
      }),
    }),
  ],
})
export class AppModule {}
```

Multiple databases using `tag`:
```typescript
@Module({
  imports: [
    DrizzleModule.forRoot({ db: primaryDb }),
    DrizzleModule.forRoot({ db: analyticsDb, tag: 'analytics' }),
  ],
})
export class AppModule {}
```

## Public Api

## Constructors

### Constructor

```ts
new DrizzleModule(): DrizzleModule;
```

#### Returns

`DrizzleModule`

## Methods

### forRoot()

```ts
static forRoot(options): DynamicModule;
```

Defined in: [packages/drizzle/src/drizzle.module.ts:80](https://github.com/kiyasov/nestelia/blob/main/packages/drizzle/src/drizzle.module.ts#L80)

Synchronously configure the Drizzle module.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`DrizzleModuleOptions`](../interfaces/DrizzleModuleOptions.md) | Configuration including the drizzle db instance. |

#### Returns

[`DynamicModule`](../../../../index/interfaces/DynamicModule.md)

***

### forRootAsync()

```ts
static forRootAsync(options): DynamicModule;
```

Defined in: [packages/drizzle/src/drizzle.module.ts:98](https://github.com/kiyasov/nestelia/blob/main/packages/drizzle/src/drizzle.module.ts#L98)

Asynchronously configure the Drizzle module.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`DrizzleModuleAsyncOptions`](../interfaces/DrizzleModuleAsyncOptions.md) | Async configuration options. |

#### Returns

[`DynamicModule`](../../../../index/interfaces/DynamicModule.md)

***

### register()

```ts
static register(options): DynamicModule;
```

Defined in: [packages/drizzle/src/drizzle.module.ts:115](https://github.com/kiyasov/nestelia/blob/main/packages/drizzle/src/drizzle.module.ts#L115)

Alias for `forRoot`.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `options` | [`DrizzleModuleOptions`](../interfaces/DrizzleModuleOptions.md) |

#### Returns

[`DynamicModule`](../../../../index/interfaces/DynamicModule.md)

***

### registerAsync()

```ts
static registerAsync(options): DynamicModule;
```

Defined in: [packages/drizzle/src/drizzle.module.ts:120](https://github.com/kiyasov/nestelia/blob/main/packages/drizzle/src/drizzle.module.ts#L120)

Alias for `forRootAsync`.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `options` | [`DrizzleModuleAsyncOptions`](../interfaces/DrizzleModuleAsyncOptions.md) |

#### Returns

[`DynamicModule`](../../../../index/interfaces/DynamicModule.md)
