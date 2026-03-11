# Interface: ConfigurableModuleBuilderOptions

Defined in: [packages/core/src/module-utils/configurable-module.builder.ts:22](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/module-utils/configurable-module.builder.ts#L22)

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="alwaystransient"></a> `alwaysTransient?` | `boolean` | Indicates whether module should always be "transient" - meaning, every time you call the static method to construct a dynamic module, regardless of what arguments you pass in, a new "unique" module will be created. **Default** `false` | [packages/core/src/module-utils/configurable-module.builder.ts:43](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/module-utils/configurable-module.builder.ts#L43) |
| <a id="modulename"></a> `moduleName?` | `string` | By default, an UUID will be used as a module options provider token. Explicitly specifying the "moduleName" will instruct the "ConfigurableModuleBuilder" to use a more descriptive provider token. For example, `moduleName: "Cache"` will auto-generate the provider token: "CACHE_MODULE_OPTIONS". | [packages/core/src/module-utils/configurable-module.builder.ts:35](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/module-utils/configurable-module.builder.ts#L35) |
| <a id="optionsinjectiontoken"></a> `optionsInjectionToken?` | `string` \| `symbol` | Specifies what injection token should be used for the module options provider. By default, an auto-generated UUID will be used. | [packages/core/src/module-utils/configurable-module.builder.ts:27](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/module-utils/configurable-module.builder.ts#L27) |
