import { Transport } from "../enums/transport.enum";
import type {
  CustomTransportStrategy,
  MicroserviceConfiguration,
  MicroserviceOptions,
  RabbitMQOptions,
  RedisOptions,
  TcpOptions,
} from "../interfaces";
import type { Server } from "../interfaces";
import { RabbitMQServer } from "./rabbitmq.server";
import { RedisServer } from "./redis.server";
import { TcpServer } from "./tcp.server";

/**
 * Factory that instantiates the correct transport server based on the
 * provided {@link MicroserviceOptions}.
 *
 * When the options object already implements {@link CustomTransportStrategy}
 * (i.e. it has a `listen` function), it is returned as-is.
 */
export class ServerFactory {
  /**
   * Creates and returns the appropriate transport server.
   *
   * @param options - Either a built-in transport configuration or a custom
   *   transport strategy instance.
   * @throws When `options.transport` is not a supported built-in transport.
   */
  public static create(
    options: MicroserviceOptions,
  ): Server | CustomTransportStrategy {
    if (ServerFactory.isCustomStrategy(options)) {
      return options;
    }

    const config = options as MicroserviceConfiguration;

    switch (config.transport) {
      case Transport.REDIS:
        return new RedisServer(config.options as RedisOptions);
      case Transport.RABBITMQ:
        return new RabbitMQServer(config.options as RabbitMQOptions);
      case Transport.TCP:
        return new TcpServer(config.options as TcpOptions);
      default:
        throw new Error(
          `Unsupported transport: "${config.transport}". ` +
            `Install the required package and use a custom transport strategy, ` +
            `or use one of: ${[Transport.REDIS, Transport.RABBITMQ, Transport.TCP].join(", ")}.`,
        );
    }
  }

  private static isCustomStrategy(
    options: MicroserviceOptions,
  ): options is CustomTransportStrategy {
    return (
      "listen" in options &&
      typeof (options as CustomTransportStrategy).listen === "function"
    );
  }
}
