/**
 * Message serialization and deserialization for RabbitMQ
 */

const DEFAULT_MAX_MESSAGE_SIZE = 10 * 1024 * 1024; // 10MB

// Valid RabbitMQ name pattern (alphanumeric, hyphens, underscores, dots)
const VALID_NAME_PATTERN = /^[a-zA-Z0-9_.-]+$/;

// Maximum name lengths per AMQP spec
const MAX_EXCHANGE_NAME_LENGTH = 255;
const MAX_QUEUE_NAME_LENGTH = 255;

/**
 * Message serializer class
 */
export class MessageSerializer {
  private maxMessageSize: number;

  constructor(maxMessageSize?: number) {
    this.maxMessageSize = maxMessageSize ?? DEFAULT_MAX_MESSAGE_SIZE;
  }

  /**
   * Serialize message to Buffer with size validation
   */
  serialize<T>(message: T): Buffer {
    const content = Buffer.from(JSON.stringify(message));

    if (content.length > this.maxMessageSize) {
      throw new Error(
        `Message size ${content.length} bytes exceeds maximum allowed size of ${this.maxMessageSize} bytes`,
      );
    }

    return content;
  }

  /**
   * Parse message content safely
   * Returns object if JSON parsing succeeds, or Buffer if not
   */
  parse<T>(content: Buffer): T | Buffer {
    try {
      // Use a reviver function to prevent prototype pollution
      return JSON.parse(content.toString(), (key, value) => {
        // Block __proto__ and constructor properties
        if (key === "__proto__" || key === "constructor") {
          return undefined;
        }
        return value;
      }) as T;
    } catch {
      // Return raw buffer instead of casting string to unknown type
      return content;
    }
  }

  /**
   * Validate RabbitMQ connection URL
   */
  static validateUrl(url: string): void {
    // Support various AMQP URL formats:
    // - amqp://localhost:5672
    // - amqp://user:pass@host:port
    // - amqp://user:pass@host:port/vhost
    // - amqps://host:port
    const AMQP_URL_PATTERN =
      /^amqps?:\/\/([^:@]+(:[^@]+)?@)?[^:/]+(:\d+)?(\/.*)?$/;
    if (!AMQP_URL_PATTERN.test(url)) {
      throw new Error(
        `Invalid RabbitMQ URL format. Expected: amqp(s)://[user:pass@]host[:port][/vhost]`,
      );
    }
  }

  /**
   * Sanitize and validate exchange name
   */
  static sanitizeExchangeName(name: string): string {
    if (name.length > MAX_EXCHANGE_NAME_LENGTH) {
      throw new Error(
        `Exchange name exceeds maximum length of ${MAX_EXCHANGE_NAME_LENGTH} characters`,
      );
    }
    if (!VALID_NAME_PATTERN.test(name)) {
      throw new Error(
        `Invalid exchange name "${name}". Only alphanumeric characters, hyphens, underscores, and dots are allowed`,
      );
    }
    return name;
  }

  /**
   * Sanitize and validate queue name
   */
  static sanitizeQueueName(name: string): string {
    if (name.length > MAX_QUEUE_NAME_LENGTH) {
      throw new Error(
        `Queue name exceeds maximum length of ${MAX_QUEUE_NAME_LENGTH} characters`,
      );
    }
    // Empty string is allowed for auto-generated queues
    if (name && !VALID_NAME_PATTERN.test(name)) {
      throw new Error(
        `Invalid queue name "${name}". Only alphanumeric characters, hyphens, underscores, and dots are allowed`,
      );
    }
    return name;
  }
}
