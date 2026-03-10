import { DynamicModule, Module } from "nestelia";

import { EVENT_EMITTER_TOKEN } from "./event-emitter.constants";
import { EventEmitterExplorer } from "./event-emitter.explorer";
import { EventEmitter2 } from "./event-emitter.service";
import type { EventEmitterModuleOptions } from "./interfaces";

/**
 * Module that integrates a typed, wildcard-capable event emitter into nestelia's
 * dependency injection system.
 *
 * Register once at the application root and inject `EventEmitter2` anywhere.
 * Methods decorated with `@OnEvent()` on any provider are automatically wired
 * up during bootstrap — no manual registration needed.
 *
 * @example
 * ```typescript
 * @Module({
 *   imports: [EventEmitterModule.forRoot({ wildcard: true })],
 * })
 * export class AppModule {}
 * ```
 *
 * @example
 * Emitting events:
 * ```typescript
 * @Injectable()
 * export class OrderService {
 *   constructor(private readonly events: EventEmitter2) {}
 *
 *   async placeOrder(order: Order) {
 *     await this.events.emitAsync('order.created', order);
 *   }
 * }
 * ```
 *
 * @example
 * Listening to events:
 * ```typescript
 * @Injectable()
 * export class NotificationService {
 *   @OnEvent('order.created')
 *   handleOrderCreated(order: Order) {
 *     console.log('Sending confirmation to', order.email);
 *   }
 *
 *   @OnEvent('order.*')
 *   handleAnyOrderEvent(payload: unknown) {
 *     console.log('An order event fired');
 *   }
 * }
 * ```
 *
 * @publicApi
 */
@Module({})
export class EventEmitterModule {
  /**
   * Configure and register the `EventEmitterModule`.
   *
   * @param options - Optional configuration.
   */
  static forRoot(options: EventEmitterModuleOptions = {}): DynamicModule {
    const emitterService = new EventEmitter2(options);

    return {
      module: EventEmitterModule,
      global: options.global ?? false,
      providers: [
        {
          provide: EVENT_EMITTER_TOKEN,
          useValue: emitterService,
        },
        {
          provide: EventEmitter2,
          useValue: emitterService,
        },
        EventEmitterExplorer,
      ],
      exports: [EVENT_EMITTER_TOKEN, EventEmitter2],
    };
  }
}
