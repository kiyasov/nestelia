# packages/event-emitter/src

Nestelia EventEmitter Module

Integrates a typed, wildcard-capable event emitter with nestelia's
dependency injection system.

## Example

```typescript
import { EventEmitterModule, EventEmitter2, OnEvent } from 'nestelia/event-emitter';

@Module({
  imports: [EventEmitterModule.forRoot({ wildcard: true })],
})
export class AppModule {}
```

## Classes

| Class | Description |
| ------ | ------ |
| [EventEmitter2](classes/EventEmitter2.md) | Injectable event emitter service. |
| [EventEmitterModule](classes/EventEmitterModule.md) | Module that integrates a typed, wildcard-capable event emitter into nestelia's dependency injection system. |

## Functions

| Function | Description |
| ------ | ------ |
| [InjectEventEmitter](functions/InjectEventEmitter.md) | Parameter decorator that injects the `EventEmitter2` instance. |
| [OnEvent](functions/OnEvent.md) | Marks a method as a listener for the given event (or wildcard pattern). |

## Interfaces

| Interface | Description |
| ------ | ------ |
| [EventEmitterModuleOptions](interfaces/EventEmitterModuleOptions.md) | Options for configuring the EventEmitterModule. |
| [OnEventMetadata](interfaces/OnEventMetadata.md) | Metadata stored per `@OnEvent` decorated method. |
| [OnEventOptions](interfaces/OnEventOptions.md) | Options for `@OnEvent`. |

## Variables

| Variable | Description |
| ------ | ------ |
| [EVENT\_EMITTER\_TOKEN](variables/EVENT_EMITTER_TOKEN.md) | Injection token for the EventEmitter2 instance. |
| [ON\_EVENT\_METADATA](variables/ON_EVENT_METADATA.md) | Metadata key used by |
