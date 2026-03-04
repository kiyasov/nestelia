import "reflect-metadata";

import { CLIENT_PROXY_METADATA } from "../constants";
import type { MicroserviceConfiguration } from "../interfaces";

/**
 * Marks a class property for automatic {@link ClientProxy} injection.
 * The injected client is created using `config` and is ready to use after
 * the application starts.
 *
 * @param config - Transport configuration for the client to connect to.
 *
 * @example
 * ```typescript
 * class AppController {
 *   @Client({ transport: Transport.REDIS, options: { host: 'localhost' } })
 *   private client: ClientProxy;
 * }
 * ```
 */
export function Client(config: MicroserviceConfiguration): PropertyDecorator {
  return (target: object, propertyKey: string | symbol) => {
    Reflect.defineMetadata(CLIENT_PROXY_METADATA, config, target, propertyKey);
  };
}
