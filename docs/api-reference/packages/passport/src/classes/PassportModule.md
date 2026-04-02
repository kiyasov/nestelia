# Class: PassportModule

Defined in: [packages/passport/src/passport.module.ts:11](https://github.com/nestelia/nestelia/blob/main/packages/passport/src/passport.module.ts#L11)

PassportModule clears strategy registries on module destroy
to prevent memory leaks across application restarts.

## Implements

- [`OnModuleDestroy`](../../../../index/interfaces/OnModuleDestroy.md)

## Constructors

### Constructor

```ts
new PassportModule(): PassportModule;
```

#### Returns

`PassportModule`

## Methods

### onModuleDestroy()

```ts
onModuleDestroy(): void;
```

Defined in: [packages/passport/src/passport.module.ts:12](https://github.com/nestelia/nestelia/blob/main/packages/passport/src/passport.module.ts#L12)

#### Returns

`void`

#### Implementation of

[`OnModuleDestroy`](../../../../index/interfaces/OnModuleDestroy.md).[`onModuleDestroy`](../../../../index/interfaces/OnModuleDestroy.md#onmoduledestroy)
