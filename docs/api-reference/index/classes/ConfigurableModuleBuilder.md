# Class: ConfigurableModuleBuilder\<ModuleOptions, StaticMethodKey, FactoryClassMethodKey, ExtraModuleDefinitionOptions\>

Defined in: [packages/core/src/module-utils/configurable-module.builder.ts:51](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/module-utils/configurable-module.builder.ts#L51)

Factory that lets you create configurable modules and
provides a way to reduce the majority of dynamic module boilerplate.

## Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `ModuleOptions` | - |
| `StaticMethodKey` *extends* `string` | *typeof* `DEFAULT_METHOD_KEY` |
| `FactoryClassMethodKey` *extends* `string` | *typeof* `DEFAULT_FACTORY_CLASS_METHOD_KEY` |
| `ExtraModuleDefinitionOptions` | \{ \} |

## Constructors

### Constructor

```ts
new ConfigurableModuleBuilder<ModuleOptions, StaticMethodKey, FactoryClassMethodKey, ExtraModuleDefinitionOptions>(options?, parentBuilder?): ConfigurableModuleBuilder<ModuleOptions, StaticMethodKey, FactoryClassMethodKey, ExtraModuleDefinitionOptions>;
```

Defined in: [packages/core/src/module-utils/configurable-module.builder.ts:68](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/module-utils/configurable-module.builder.ts#L68)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `options` | [`ConfigurableModuleBuilderOptions`](../interfaces/ConfigurableModuleBuilderOptions.md) |
| `parentBuilder?` | `ConfigurableModuleBuilder`\<`ModuleOptions`, `"register"`, `"create"`, \{ \}\> |

#### Returns

`ConfigurableModuleBuilder`\<`ModuleOptions`, `StaticMethodKey`, `FactoryClassMethodKey`, `ExtraModuleDefinitionOptions`\>

## Methods

### build()

```ts
build(): ConfigurableModuleHost<ModuleOptions, StaticMethodKey, FactoryClassMethodKey, ExtraModuleDefinitionOptions>;
```

Defined in: [packages/core/src/module-utils/configurable-module.builder.ts:168](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/module-utils/configurable-module.builder.ts#L168)

Returns an object consisting of multiple properties that lets you
easily construct dynamic configurable modules. See "ConfigurableModuleHost" interface for more details.

#### Returns

[`ConfigurableModuleHost`](../interfaces/ConfigurableModuleHost.md)\<`ModuleOptions`, `StaticMethodKey`, `FactoryClassMethodKey`, `ExtraModuleDefinitionOptions`\>

***

### setClassMethodName()

```ts
setClassMethodName<StaticMethodKey>(key): ConfigurableModuleBuilder<ModuleOptions, StaticMethodKey, FactoryClassMethodKey, ExtraModuleDefinitionOptions>;
```

Defined in: [packages/core/src/module-utils/configurable-module.builder.ts:129](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/module-utils/configurable-module.builder.ts#L129)

Dynamic modules must expose public static methods that let you pass in
configuration parameters (control the module's behavior from the outside).
Some frequently used names that you may have seen in other modules are:
"forRoot", "forFeature", "register", "configure".

This method "setClassMethodName" lets you specify the name of the
method that will be auto-generated.

#### Type Parameters

| Type Parameter |
| ------ |
| `StaticMethodKey` *extends* `string` |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `key` | `StaticMethodKey` | name of the method |

#### Returns

`ConfigurableModuleBuilder`\<`ModuleOptions`, `StaticMethodKey`, `FactoryClassMethodKey`, `ExtraModuleDefinitionOptions`\>

***

### setExtras()

```ts
setExtras<ExtraModuleDefinitionOptions>(extras, transformDefinition?): ConfigurableModuleBuilder<ModuleOptions, StaticMethodKey, FactoryClassMethodKey, ExtraModuleDefinitionOptions>;
```

Defined in: [packages/core/src/module-utils/configurable-module.builder.ts:100](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/module-utils/configurable-module.builder.ts#L100)

Registers the "extras" object (a set of extra options that can be used to modify the dynamic module definition).
Values you specify within the "extras" object will be used as default values (that can be overridden by module consumers).

This method also applies the so-called "module definition transform function" that takes the auto-generated
dynamic module object ("DynamicModule") and the actual consumer "extras" object as input parameters.
The "extras" object consists of values explicitly specified by module consumers and default values.

#### Type Parameters

| Type Parameter |
| ------ |
| `ExtraModuleDefinitionOptions` |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `extras` | `ExtraModuleDefinitionOptions` |
| `transformDefinition` | (`definition`, `extras`) => [`DynamicModule`](../interfaces/DynamicModule.md) |

#### Returns

`ConfigurableModuleBuilder`\<`ModuleOptions`, `StaticMethodKey`, `FactoryClassMethodKey`, `ExtraModuleDefinitionOptions`\>

#### Example

```typescript
.setExtras<{ isGlobal?: boolean }>({ isGlobal: false }, (definition, extras) =>
   ({ ...definition, global: extras.isGlobal })
)
```

***

### setFactoryMethodName()

```ts
setFactoryMethodName<FactoryClassMethodKey>(key): ConfigurableModuleBuilder<ModuleOptions, StaticMethodKey, FactoryClassMethodKey, ExtraModuleDefinitionOptions>;
```

Defined in: [packages/core/src/module-utils/configurable-module.builder.ts:151](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/module-utils/configurable-module.builder.ts#L151)

Asynchronously configured modules (that rely on other modules, i.e. "ConfigModule")
let you pass the configuration factory class that will be registered and instantiated as a provider.
This provider then will be used to retrieve the module's configuration. To provide the configuration,
the corresponding factory method must be implemented.

This method ("setFactoryMethodName") lets you control what method name will have to be
implemented by the config factory (default is "create").

#### Type Parameters

| Type Parameter |
| ------ |
| `FactoryClassMethodKey` *extends* `string` |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `key` | `FactoryClassMethodKey` | name of the method |

#### Returns

`ConfigurableModuleBuilder`\<`ModuleOptions`, `StaticMethodKey`, `FactoryClassMethodKey`, `ExtraModuleDefinitionOptions`\>

## Properties

| Property | Modifier | Type | Default value | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="extras"></a> `extras` | `protected` | `ExtraModuleDefinitionOptions` | `undefined` | [packages/core/src/module-utils/configurable-module.builder.ts:60](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/module-utils/configurable-module.builder.ts#L60) |
| <a id="factoryclassmethodkey-1"></a> `factoryClassMethodKey` | `protected` | `FactoryClassMethodKey` | `undefined` | [packages/core/src/module-utils/configurable-module.builder.ts:59](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/module-utils/configurable-module.builder.ts#L59) |
| <a id="logger"></a> `logger` | `readonly` | [`Logger`](Logger.md) | `undefined` | [packages/core/src/module-utils/configurable-module.builder.ts:66](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/module-utils/configurable-module.builder.ts#L66) |
| <a id="options"></a> `options` | `readonly` | [`ConfigurableModuleBuilderOptions`](../interfaces/ConfigurableModuleBuilderOptions.md) | `{}` | [packages/core/src/module-utils/configurable-module.builder.ts:69](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/module-utils/configurable-module.builder.ts#L69) |
| <a id="staticmethodkey-1"></a> `staticMethodKey` | `protected` | `StaticMethodKey` | `undefined` | [packages/core/src/module-utils/configurable-module.builder.ts:58](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/module-utils/configurable-module.builder.ts#L58) |
| <a id="transformmoduledefinition"></a> `transformModuleDefinition` | `protected` | (`definition`, `extraOptions`) => [`DynamicModule`](../interfaces/DynamicModule.md) | `undefined` | [packages/core/src/module-utils/configurable-module.builder.ts:61](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/module-utils/configurable-module.builder.ts#L61) |
