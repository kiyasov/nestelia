# Interface: ConfigurableModuleHost\<ModuleOptions, MethodKey, FactoryClassMethodKey, ExtraModuleDefinitionOptions\>

Defined in: [packages/core/src/module-utils/interfaces/configurable-module-host.interface.ts:9](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/module-utils/interfaces/configurable-module-host.interface.ts#L9)

Configurable module host. See properties for more details

## Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `ModuleOptions` | `Record`\<`string`, `unknown`\> |
| `MethodKey` *extends* `string` | `string` |
| `FactoryClassMethodKey` *extends* `string` | `string` |
| `ExtraModuleDefinitionOptions` | \{ \} |

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="async_options_type"></a> `ASYNC_OPTIONS_TYPE` | [`ConfigurableModuleAsyncOptions`](ConfigurableModuleAsyncOptions.md)\<`ModuleOptions`, `FactoryClassMethodKey`\> & `Partial`\<`ExtraModuleDefinitionOptions`\> | Can be used to auto-infer the compound "async module options" type. Note: this property is not supposed to be used as a value. **Example** `@Module({}) class IntegrationModule extends ConfigurableModuleCls { static module = initializer(IntegrationModule); static registerAsync(options: typeof ASYNC_OPTIONS_TYPE): DynamicModule { return super.registerAsync(options); }` | [packages/core/src/module-utils/interfaces/configurable-module-host.interface.ts:56](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/module-utils/interfaces/configurable-module-host.interface.ts#L56) |
| <a id="configurablemoduleclass"></a> `ConfigurableModuleClass` | [`ConfigurableModuleCls`](../type-aliases/ConfigurableModuleCls.md)\<`ModuleOptions`, `MethodKey`, `FactoryClassMethodKey`, `ExtraModuleDefinitionOptions`\> | Class that represents a blueprint/prototype for a configurable Nest module. This class provides static methods for constructing dynamic modules. Their names can be controlled through the "MethodKey" type argument. Your module class should inherit from this class to make the static methods available. **Example** `@Module({}) class IntegrationModule extends ConfigurableModuleCls { // ... }` | [packages/core/src/module-utils/interfaces/configurable-module-host.interface.ts:30](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/module-utils/interfaces/configurable-module-host.interface.ts#L30) |
| <a id="module_options_token"></a> `MODULE_OPTIONS_TOKEN` | `string` \| `symbol` | Module options provider token. Can be used to inject the "options object" to providers registered within the host module. | [packages/core/src/module-utils/interfaces/configurable-module-host.interface.ts:40](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/module-utils/interfaces/configurable-module-host.interface.ts#L40) |
| <a id="options_type"></a> `OPTIONS_TYPE` | `ModuleOptions` & `Partial`\<`ExtraModuleDefinitionOptions`\> | Can be used to auto-infer the compound "module options" type (options interface + extra module definition options). Note: this property is not supposed to be used as a value. **Example** `@Module({}) class IntegrationModule extends ConfigurableModuleCls { static module = initializer(IntegrationModule); static register(options: typeof OPTIONS_TYPE): DynamicModule { return super.register(options); }` | [packages/core/src/module-utils/interfaces/configurable-module-host.interface.ts:76](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/module-utils/interfaces/configurable-module-host.interface.ts#L76) |
