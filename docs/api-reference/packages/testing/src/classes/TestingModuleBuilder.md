# Class: TestingModuleBuilder

Defined in: [packages/testing/src/testing.module-builder.ts:80](https://github.com/nestelia/nestelia/blob/main/packages/testing/src/testing.module-builder.ts#L80)

Builder for creating and configuring testing modules.

## Example

```typescript
const moduleRef = await Test.createTestingModule({
  imports: [AppModule],
  providers: [MyService],
})
  .overrideProvider(DatabaseService)
  .useValue(mockDb)
  .compile();

const service = moduleRef.get(MyService);
```

## Constructors

### Constructor

```ts
new TestingModuleBuilder(metadata): TestingModuleBuilder;
```

Defined in: [packages/testing/src/testing.module-builder.ts:84](https://github.com/nestelia/nestelia/blob/main/packages/testing/src/testing.module-builder.ts#L84)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `metadata` | [`ModuleOptions`](../../../../index/interfaces/ModuleOptions.md) |

#### Returns

`TestingModuleBuilder`

## Methods

### addOverride()

```ts
addOverride(override): void;
```

Defined in: [packages/testing/src/testing.module-builder.ts:99](https://github.com/nestelia/nestelia/blob/main/packages/testing/src/testing.module-builder.ts#L99)

**`Internal`**

Add provider override

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `override` | [`OverridesMetadata`](../interfaces/OverridesMetadata.md) |

#### Returns

`void`

***

### compile()

```ts
compile(): Promise<TestingModule>;
```

Defined in: [packages/testing/src/testing.module-builder.ts:124](https://github.com/nestelia/nestelia/blob/main/packages/testing/src/testing.module-builder.ts#L124)

Compile the testing module and initialize all providers.

Each call creates a fully isolated DI container so that unit tests
never interfere with each other or with integration tests that share
the global Container.instance.

#### Returns

`Promise`\<[`TestingModule`](TestingModule.md)\>

***

### overrideClass()

```ts
overrideClass<T>(token): OverrideByBuilder<T>;
```

Defined in: [packages/testing/src/testing.module-builder.ts:113](https://github.com/nestelia/nestelia/blob/main/packages/testing/src/testing.module-builder.ts#L113)

Override a class provider

#### Type Parameters

| Type Parameter |
| ------ |
| `T` |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `token` | [`Type`](../../../../index/interfaces/Type.md)\<`T`\> |

#### Returns

`OverrideByBuilder`\<`T`\>

***

### overrideProvider()

```ts
overrideProvider<T>(token): OverrideByBuilder<T>;
```

Defined in: [packages/testing/src/testing.module-builder.ts:106](https://github.com/nestelia/nestelia/blob/main/packages/testing/src/testing.module-builder.ts#L106)

Override a provider with mock/stub

#### Type Parameters

| Type Parameter |
| ------ |
| `T` |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `token` | [`ProviderToken`](../../../../index/type-aliases/ProviderToken.md) |

#### Returns

`OverrideByBuilder`\<`T`\>
