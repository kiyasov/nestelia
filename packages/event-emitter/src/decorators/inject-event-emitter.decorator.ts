import { Inject } from "nestelia";

import { EVENT_EMITTER_TOKEN } from "../event-emitter.constants";

/**
 * Parameter decorator that injects the `EventEmitterService` instance.
 *
 * Shorthand for `@Inject(EVENT_EMITTER_TOKEN)`.
 *
 * @example
 * ```typescript
 * @Injectable()
 * export class OrderService {
 *   constructor(@InjectEventEmitter() private readonly events: EventEmitterService) {}
 * }
 * ```
 *
 */
export const InjectEventEmitter = (): ParameterDecorator =>
  Inject(EVENT_EMITTER_TOKEN);
