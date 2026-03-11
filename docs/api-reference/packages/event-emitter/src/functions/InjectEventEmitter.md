# Function: InjectEventEmitter()

```ts
function InjectEventEmitter(): ParameterDecorator;
```

Defined in: [packages/event-emitter/src/decorators/inject-event-emitter.decorator.ts:19](https://github.com/kiyasov/nestelia/blob/main/packages/event-emitter/src/decorators/inject-event-emitter.decorator.ts#L19)

Parameter decorator that injects the `EventEmitterService` instance.

Shorthand for `@Inject(EVENT_EMITTER_TOKEN)`.

## Returns

`ParameterDecorator`

## Example

```typescript
@Injectable()
export class OrderService {
  constructor(@InjectEventEmitter() private readonly events: EventEmitterService) {}
}
```
