import type { ModuleOptions } from "../../core/src/decorators/types";
import type { Transport } from "../enums/transport.enum";

/** Base configuration shared by all built-in transport strategies. */
export interface MicroserviceConfiguration {
  transport: Transport;
  options: RedisOptions | RabbitMQOptions | TcpOptions;
}

/** Connection options for the Redis (ioredis) transport. */
export interface RedisOptions {
  /** Redis hostname. Defaults to `"localhost"`. */
  host?: string;
  /** Redis port. Defaults to `6379`. */
  port?: number;
  /** Optional password for Redis AUTH. */
  password?: string;
  /** Redis database index. Defaults to `0`. */
  db?: number;
  /** Full Redis connection URL (overrides host/port when provided). */
  url?: string;
  /** Maximum number of reconnection attempts. Defaults to `3`. */
  retryAttempts?: number;
  /** Delay in milliseconds between reconnection attempts. Defaults to `1000`. */
  retryDelay?: number;
}

/** Connection options for the RabbitMQ (amqplib) transport. */
export interface RabbitMQOptions {
  /** AMQP URLs to try in order (e.g. `["amqp://localhost"]`). */
  urls: string[];
  /** Name of the queue to consume from. */
  queue: string;
  /** Optional queue-declaration parameters. */
  queueOptions?: {
    durable?: boolean;
    exclusive?: boolean;
    autoDelete?: boolean;
    arguments?: Record<string, unknown>;
  };
  /** Number of messages to prefetch per consumer. */
  prefetchCount?: number;
  /** When `true`, messages are auto-acknowledged (no manual ack/nack). */
  noAck?: boolean;
  /** When `true`, published messages are marked as persistent. */
  persistent?: boolean;
  /** Exchange name to publish to / consume from. */
  exchange?: string;
  /** Exchange type. Defaults to `"topic"`. */
  exchangeType?: "direct" | "topic" | "fanout" | "headers";
  /** Routing key used when binding queue to exchange or publishing messages. */
  routingKey?: string;
}

/** Connection options for the TCP transport. */
export interface TcpOptions {
  /** Hostname to bind/connect. Defaults to `"0.0.0.0"` for server, `"localhost"` for client. */
  host?: string;
  /** TCP port. Defaults to `3000`. */
  port?: number;
  /** Maximum reconnection attempts (client only). Defaults to `3`. */
  retryAttempts?: number;
  /** Delay in milliseconds between reconnection attempts. Defaults to `1000`. */
  retryDelay?: number;
}

/**
 * Interface that custom transport strategies must implement.
 * Pass an object conforming to this interface to {@link connectMicroservice}
 * to use a transport not provided by this package.
 */
export interface CustomTransportStrategy {
  listen(callback: (err?: unknown, ...optionalParams: unknown[]) => void): void;
  close(): void;
}

/** Union type accepted by {@link connectMicroservice}. */
export type MicroserviceOptions =
  | MicroserviceConfiguration
  | CustomTransportStrategy;

/** Shape of metadata stored by the {@link MessagePattern} decorator. */
export interface MessagePatternMetadata {
  pattern: string | Record<string, unknown>;
  transport?: Transport | symbol;
}

/** Shape of metadata stored by the {@link EventPattern} decorator. */
export interface EventPatternMetadata {
  pattern: string | Record<string, unknown>;
  transport?: Transport | symbol;
}

/** Subset of module options relevant to microservice modules. */
export type MicroserviceModuleMetadata = Pick<
  ModuleOptions,
  "controllers" | "providers" | "imports" | "exports"
>;
