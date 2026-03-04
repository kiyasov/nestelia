import { Transport } from "../enums/transport.enum";
import type {
  MicroserviceConfiguration,
  RabbitMQOptions,
  RedisOptions,
  TcpOptions,
} from "../interfaces";
import { ClientProxy } from "./client-proxy";
import { RabbitMQClient } from "./rabbitmq.client";
import { RedisClient } from "./redis.client";
import { TcpClient } from "./tcp.client";

/**
 * Factory that creates the correct {@link ClientProxy} implementation for the
 * given transport configuration.
 */
export class ClientFactory {
  /**
   * Instantiates and returns a transport-specific {@link ClientProxy}.
   *
   * @param options - Transport configuration containing `transport` and `options`.
   * @throws When `options.transport` is not a supported transport.
   */
  public static create(options: MicroserviceConfiguration): ClientProxy {
    switch (options.transport) {
      case Transport.REDIS:
        return new RedisClient(options.options as RedisOptions);
      case Transport.RABBITMQ:
        return new RabbitMQClient(options.options as RabbitMQOptions);
      case Transport.TCP:
        return new TcpClient(options.options as TcpOptions);
      default:
        throw new Error(
          `Unsupported transport: "${options.transport}". ` +
            `Supported: ${[Transport.REDIS, Transport.RABBITMQ, Transport.TCP].join(", ")}.`,
        );
    }
  }
}
