# Interface: DrizzleModuleOptions

Defined in: [packages/drizzle/src/interfaces/drizzle-module.interface.ts:7](https://github.com/kiyasov/nestelia/blob/main/packages/drizzle/src/interfaces/drizzle-module.interface.ts#L7)

Options for synchronously configuring the Drizzle module.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="db"></a> `db` | `unknown` | A pre-configured drizzle-orm database instance. Create the instance using drizzle-orm's dialect-specific helpers before passing it to the module: - PostgreSQL: `drizzle(pool, { schema })` - MySQL: `drizzle(connection, { schema })` - SQLite: `drizzle(database, { schema })` | [packages/drizzle/src/interfaces/drizzle-module.interface.ts:17](https://github.com/kiyasov/nestelia/blob/main/packages/drizzle/src/interfaces/drizzle-module.interface.ts#L17) |
| <a id="isglobal"></a> `isGlobal?` | `boolean` | If `true`, registers `DrizzleModule` as a global module so the db instance is available throughout the application without re-importing. **Default** `false` | [packages/drizzle/src/interfaces/drizzle-module.interface.ts:35](https://github.com/kiyasov/nestelia/blob/main/packages/drizzle/src/interfaces/drizzle-module.interface.ts#L35) |
| <a id="tag"></a> `tag?` | `string` \| `symbol` | Custom injection token for this database instance. Useful when registering multiple `DrizzleModule` instances in the same application (e.g. primary + analytics databases). **Default** `DRIZZLE_INSTANCE` | [packages/drizzle/src/interfaces/drizzle-module.interface.ts:27](https://github.com/kiyasov/nestelia/blob/main/packages/drizzle/src/interfaces/drizzle-module.interface.ts#L27) |
