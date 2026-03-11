# Interface: DrizzleOptionsFactory

Defined in: [packages/drizzle/src/interfaces/drizzle-module.interface.ts:45](https://github.com/kiyasov/nestelia/blob/main/packages/drizzle/src/interfaces/drizzle-module.interface.ts#L45)

Factory interface for creating Drizzle module options.

Implement this interface in a class and pass it via `useClass` or
`useExisting` in `DrizzleModule.forRootAsync()`.

## Methods

### createDrizzleOptions()

```ts
createDrizzleOptions(): 
  | DrizzleModuleOptions
| Promise<DrizzleModuleOptions>;
```

Defined in: [packages/drizzle/src/interfaces/drizzle-module.interface.ts:49](https://github.com/kiyasov/nestelia/blob/main/packages/drizzle/src/interfaces/drizzle-module.interface.ts#L49)

Returns Drizzle module options or a Promise resolving to them.

#### Returns

  \| [`DrizzleModuleOptions`](DrizzleModuleOptions.md)
  \| `Promise`\<[`DrizzleModuleOptions`](DrizzleModuleOptions.md)\>
