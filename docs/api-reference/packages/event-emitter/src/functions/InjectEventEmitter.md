# Function: InjectEventEmitter()

```ts
function InjectEventEmitter(): ParameterDecorator;
```

Defined in: [packages/event-emitter/src/decorators/inject-event-emitter.decorator.ts:20](https://github.com/kiyasov/nestelia/blob/main/packages/event-emitter/src/decorators/inject-event-emitter.decorator.ts#L20)

Parameter decorator that injects the `EventEmitter2` instance.

Shorthand for `@Inject(EVENT_EMITTER_TOKEN)`.

## Returns

`ParameterDecorator`

## Example

```typescript
@Injectable()
export class OrderService {
  constructor(@InjectEventEmitter() private readonly events: EventEmitter2) {}
}
```

## Public Api
