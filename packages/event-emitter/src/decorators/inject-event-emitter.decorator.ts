import { Inject } from "nestelia";

import { EVENT_EMITTER_TOKEN } from "../event-emitter.constants";

/**
 * Parameter decorator that injects the `EventEmitter2` instance.
 *
 * Shorthand for `@Inject(EVENT_EMITTER_TOKEN)`.
 *
 * @example
 * ```typescript
 * @Injectable()
 * export class OrderService {
 *   constructor(@InjectEventEmitter() private readonly events: EventEmitter2) {}
 * }
 * ```
 *
 * @publicApi
 */
export const InjectEventEmitter = (): ParameterDecorator =>
  Inject(EVENT_EMITTER_TOKEN);
