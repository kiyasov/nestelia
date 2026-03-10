# Interface: DrizzleModuleAsyncOptions

Defined in: [packages/drizzle/src/interfaces/drizzle-module.interface.ts:59](https://github.com/kiyasov/nestelia/blob/main/packages/drizzle/src/interfaces/drizzle-module.interface.ts#L59)

Options for asynchronously configuring the Drizzle module.

## Public Api

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="extraproviders"></a> `extraProviders?` | [`Provider`](../../../../index/type-aliases/Provider.md)[] | Extra providers registered within the scope of this dynamic module. | [packages/drizzle/src/interfaces/drizzle-module.interface.ts:114](https://github.com/kiyasov/nestelia/blob/main/packages/drizzle/src/interfaces/drizzle-module.interface.ts#L114) |
| <a id="imports"></a> `imports?` | `unknown`[] | Modules whose exported providers should be available as dependencies within this dynamic module's scope. | [packages/drizzle/src/interfaces/drizzle-module.interface.ts:78](https://github.com/kiyasov/nestelia/blob/main/packages/drizzle/src/interfaces/drizzle-module.interface.ts#L78) |
| <a id="inject"></a> `inject?` | ( \| [`ProviderToken`](../../../../index/type-aliases/ProviderToken.md) \| \{ `optional?`: `boolean`; `token`: [`ProviderToken`](../../../../index/type-aliases/ProviderToken.md); \})[] | Dependencies injected into the factory function. | [packages/drizzle/src/interfaces/drizzle-module.interface.ts:109](https://github.com/kiyasov/nestelia/blob/main/packages/drizzle/src/interfaces/drizzle-module.interface.ts#L109) |
| <a id="isglobal"></a> `isGlobal?` | `boolean` | If `true`, registers `DrizzleModule` as a global module. **Default** `false` | [packages/drizzle/src/interfaces/drizzle-module.interface.ts:72](https://github.com/kiyasov/nestelia/blob/main/packages/drizzle/src/interfaces/drizzle-module.interface.ts#L72) |
| <a id="tag"></a> `tag?` | `string` \| `symbol` | Custom injection token for the database instance. **Default** `DRIZZLE_INSTANCE` | [packages/drizzle/src/interfaces/drizzle-module.interface.ts:65](https://github.com/kiyasov/nestelia/blob/main/packages/drizzle/src/interfaces/drizzle-module.interface.ts#L65) |
| <a id="useclass"></a> `useClass?` | [`Type`](../../../../index/interfaces/Type.md)\<[`DrizzleOptionsFactory`](DrizzleOptionsFactory.md)\> | Class that implements `DrizzleOptionsFactory`. An instance will be created and its `createDrizzleOptions()` method called. | [packages/drizzle/src/interfaces/drizzle-module.interface.ts:84](https://github.com/kiyasov/nestelia/blob/main/packages/drizzle/src/interfaces/drizzle-module.interface.ts#L84) |
| <a id="useexisting"></a> `useExisting?` | [`Type`](../../../../index/interfaces/Type.md)\<[`DrizzleOptionsFactory`](DrizzleOptionsFactory.md)\> | Existing provider that implements `DrizzleOptionsFactory`. | [packages/drizzle/src/interfaces/drizzle-module.interface.ts:89](https://github.com/kiyasov/nestelia/blob/main/packages/drizzle/src/interfaces/drizzle-module.interface.ts#L89) |
| <a id="usefactory"></a> `useFactory?` | (...`args`) => \| [`DrizzleModuleOptions`](DrizzleModuleOptions.md) \| `Promise`\<[`DrizzleModuleOptions`](DrizzleModuleOptions.md)\> | Factory function that returns options (or a Promise of options). **Example** `useFactory: (config: ConfigService) => ({ db: drizzle(new Pool({ connectionString: config.get('DATABASE_URL') }), { schema }), }), inject: [ConfigService],` | [packages/drizzle/src/interfaces/drizzle-module.interface.ts:102](https://github.com/kiyasov/nestelia/blob/main/packages/drizzle/src/interfaces/drizzle-module.interface.ts#L102) |
