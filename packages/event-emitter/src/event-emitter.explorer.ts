import { Container, Injectable, STATIC_CONTEXT } from "nestelia";
import type { OnApplicationBootstrap } from "nestelia";

import { ON_EVENT_METADATA } from "./event-emitter.constants";
import { EventEmitter2 } from "./event-emitter.service";
import type { OnEventMetadata } from "./interfaces";

/**
 * Scans all providers registered in the DI container for `@OnEvent`-decorated
 * methods and registers them with the `EventEmitter2` instance.
 *
 * Runs automatically during `onApplicationBootstrap`.
 *
 * @internal
 */
@Injectable()
export class EventEmitterExplorer implements OnApplicationBootstrap {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  onApplicationBootstrap(): void {
    for (const moduleRef of Container.instance.getModules().values()) {
      for (const [, wrapper] of moduleRef.getProviders()) {
        const instancePerContext = wrapper.getInstanceByContextId(STATIC_CONTEXT);
        const instance = instancePerContext?.instance;

        if (!instance || typeof instance !== "object") continue;

        const metadata: OnEventMetadata[] | undefined = Reflect.getMetadata(
          ON_EVENT_METADATA,
          instance.constructor,
        );

        if (!metadata || metadata.length === 0) continue;

        for (const { event, methodName, once } of metadata) {
          const method = (instance as Record<string | symbol, unknown>)[methodName];
          if (typeof method !== "function") continue;

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const handler = (method as (payload: unknown) => any).bind(instance);

          if (once) {
            this.eventEmitter.once(event, handler);
          } else {
            this.eventEmitter.on(event, handler);
          }
        }
      }
    }
  }
}
