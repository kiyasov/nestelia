# Interface: ConfigurableModuleAsyncOptions\<ModuleOptions, FactoryClassMethodKey\>

Defined in: [packages/core/src/module-utils/interfaces/configurable-module-async-options.interface.ts:27](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/module-utils/interfaces/configurable-module-async-options.interface.ts#L27)

Interface that represents the module async options object
Factory method name varies depending on the "FactoryClassMethodKey" type argument.

## Extends

- `Pick`\<[`ModuleMetadata`](ModuleMetadata.md), `"imports"`\>

## Extended by

- [`CacheModuleAsyncOptions`](../../packages/cache/src/interfaces/CacheModuleAsyncOptions.md)

## Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `ModuleOptions` | - |
| `FactoryClassMethodKey` *extends* `string` | *typeof* `DEFAULT_FACTORY_CLASS_METHOD_KEY` |

## Properties

| Property | Type | Description | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="imports"></a> `imports?` | ([`Type`](Type.md)\<`unknown`\> \| [`DynamicModule`](DynamicModule.md))[] | - | [`ModuleMetadata`](ModuleMetadata.md).[`imports`](ModuleMetadata.md#imports) | [packages/core/src/interfaces/index.ts:9](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/interfaces/index.ts#L9) |
| <a id="inject"></a> `inject?` | ( \| [`ProviderToken`](../type-aliases/ProviderToken.md) \| \{ `optional?`: `boolean`; `token`: [`ProviderToken`](../type-aliases/ProviderToken.md); \})[] | Dependencies that a Factory may inject. | - | [packages/core/src/module-utils/interfaces/configurable-module-async-options.interface.ts:54](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/module-utils/interfaces/configurable-module-async-options.interface.ts#L54) |
| <a id="provideinjectiontokensfrom"></a> `provideInjectionTokensFrom?` | [`Provider`](../type-aliases/Provider.md)[] | List of parent module's providers that will be filtered to only provide necessary providers for the 'inject' array useful to pass options to nested async modules | - | [packages/core/src/module-utils/interfaces/configurable-module-async-options.interface.ts:60](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/module-utils/interfaces/configurable-module-async-options.interface.ts#L60) |
| <a id="useclass"></a> `useClass?` | [`Type`](Type.md)\<[`ConfigurableModuleOptionsFactory`](../type-aliases/ConfigurableModuleOptionsFactory.md)\<`ModuleOptions`, `FactoryClassMethodKey`\>\> | Injection token resolving to a class that will be instantiated as a provider. The class must implement the corresponding interface. | - | [packages/core/src/module-utils/interfaces/configurable-module-async-options.interface.ts:43](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/module-utils/interfaces/configurable-module-async-options.interface.ts#L43) |
| <a id="useexisting"></a> `useExisting?` | [`Type`](Type.md)\<[`ConfigurableModuleOptionsFactory`](../type-aliases/ConfigurableModuleOptionsFactory.md)\<`ModuleOptions`, `FactoryClassMethodKey`\>\> | Injection token resolving to an existing provider. The provider must implement the corresponding interface. | - | [packages/core/src/module-utils/interfaces/configurable-module-async-options.interface.ts:36](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/module-utils/interfaces/configurable-module-async-options.interface.ts#L36) |
| <a id="usefactory"></a> `useFactory?` | (...`args`) => `ModuleOptions` \| `Promise`\<`ModuleOptions`\> | Function returning options (or a Promise resolving to options) to configure the module. | - | [packages/core/src/module-utils/interfaces/configurable-module-async-options.interface.ts:50](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/module-utils/interfaces/configurable-module-async-options.interface.ts#L50) |
