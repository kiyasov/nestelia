# Class: SchedulerRegistry

Defined in: [packages/scheduler/src/services/scheduler.service.ts:218](https://github.com/nestelia/nestelia/blob/main/packages/scheduler/src/services/scheduler.service.ts#L218)

Registry for managing multiple schedulers

## Implements

- [`OnModuleDestroy`](../../../../index/interfaces/OnModuleDestroy.md)

## Constructors

### Constructor

```ts
new SchedulerRegistry(): SchedulerRegistry;
```

#### Returns

`SchedulerRegistry`

## Methods

### addScheduler()

```ts
addScheduler(name, scheduler): void;
```

Defined in: [packages/scheduler/src/services/scheduler.service.ts:228](https://github.com/nestelia/nestelia/blob/main/packages/scheduler/src/services/scheduler.service.ts#L228)

Add a scheduler to the registry

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `name` | `string` |
| `scheduler` | [`Scheduler`](Scheduler.md) |

#### Returns

`void`

***

### clear()

```ts
clear(): void;
```

Defined in: [packages/scheduler/src/services/scheduler.service.ts:260](https://github.com/nestelia/nestelia/blob/main/packages/scheduler/src/services/scheduler.service.ts#L260)

Clear all schedulers

#### Returns

`void`

***

### getScheduler()

```ts
getScheduler(name): Scheduler | undefined;
```

Defined in: [packages/scheduler/src/services/scheduler.service.ts:235](https://github.com/nestelia/nestelia/blob/main/packages/scheduler/src/services/scheduler.service.ts#L235)

Get a scheduler by name

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `name` | `string` |

#### Returns

[`Scheduler`](Scheduler.md) \| `undefined`

***

### getSchedulerNames()

```ts
getSchedulerNames(): string[];
```

Defined in: [packages/scheduler/src/services/scheduler.service.ts:253](https://github.com/nestelia/nestelia/blob/main/packages/scheduler/src/services/scheduler.service.ts#L253)

Get all scheduler names

#### Returns

`string`[]

***

### onModuleDestroy()

```ts
onModuleDestroy(): void;
```

Defined in: [packages/scheduler/src/services/scheduler.service.ts:221](https://github.com/nestelia/nestelia/blob/main/packages/scheduler/src/services/scheduler.service.ts#L221)

#### Returns

`void`

#### Implementation of

[`OnModuleDestroy`](../../../../index/interfaces/OnModuleDestroy.md).[`onModuleDestroy`](../../../../index/interfaces/OnModuleDestroy.md#onmoduledestroy)

***

### removeScheduler()

```ts
removeScheduler(name): void;
```

Defined in: [packages/scheduler/src/services/scheduler.service.ts:242](https://github.com/nestelia/nestelia/blob/main/packages/scheduler/src/services/scheduler.service.ts#L242)

Remove a scheduler from the registry

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `name` | `string` |

#### Returns

`void`
