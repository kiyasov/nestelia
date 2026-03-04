/** Metadata key for the {@link MessagePattern} decorator. */
export const MESSAGE_PATTERN_METADATA = "messagePattern";

/** Metadata key for the {@link EventPattern} decorator. */
export const EVENT_PATTERN_METADATA = "eventPattern";

/** Metadata key for the {@link Payload} parameter decorator. */
export const MESSAGE_DATA_METADATA = "messageData";

/** Metadata key for the {@link MessageCtx} parameter decorator. */
export const MESSAGE_PATTERN_CTX_METADATA = "messagePatternCtx";

/** Metadata key for the {@link Client} property decorator. */
export const CLIENT_PROXY_METADATA = "clientProxy";

/** Metadata key used to register a class as a microservice module. */
export const MICROSERVICE_METADATA = "microservice";

/**
 * Metadata key for the {@link Catch} decorator.
 * Must match the key used in `src/exceptions/catch.decorator.ts`.
 */
export const CATCH_EXCEPTIONS_METADATA = "__catchExceptions__";
