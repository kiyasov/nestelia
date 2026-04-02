import "reflect-metadata";

import { afterEach, beforeEach, describe, expect, it } from "bun:test";

import { Logger } from "~/src/logger/logger.service";

/**
 * Memory leak test: Logger static buffer grows unboundedly when attached.
 *
 * When `Logger.attachBuffer()` is called, all subsequent log calls are stored
 * in a static array.  If `flush()` is never called (or `detachBuffer()` is
 * called without flushing), the buffer retains all closure references.
 */
describe("Logger buffer — memory leak", () => {
  beforeEach(() => {
    // Override logger to suppress console output during tests
    Logger.overrideLogger({
      log: () => {},
      error: () => {},
      warn: () => {},
      debug: () => {},
      verbose: () => {},
      fatal: () => {},
    });
  });

  afterEach(() => {
    // Clear buffer without flushing to console, then detach
    (Logger as any).logBuffer = [];
    (Logger as any).isBufferAttached = false;
    Logger.detachBuffer();
  });

  it("should accumulate log entries in buffer while attached", () => {
    Logger.attachBuffer();

    const logger = new Logger("TestContext");

    // Simulate heavy logging during app bootstrap
    for (let i = 0; i < 1000; i++) {
      logger.log(`Message ${i}`);
    }

    // Access the static buffer to verify accumulation
    const buffer = (Logger as any).logBuffer;
    expect(buffer.length).toBe(1000);
  });

  it("should hold closure references in buffer entries", () => {
    Logger.attachBuffer();

    // Create a large object that will be captured in the log closure
    const largePayload = { data: new Array(10000).fill("x").join("") };
    const logger = new Logger("TestContext");
    logger.log(`Payload size: ${largePayload.data.length}`);

    const buffer = (Logger as any).logBuffer;
    expect(buffer.length).toBe(1);

    // The buffer entry holds a methodRef (closure) that captures largePayload
    // via the log message string — if payload were an object reference, it
    // would be retained by the closure.
    expect(typeof buffer[0].methodRef).toBe("function");
  });

  it("should clear buffer on detachBuffer() without flush()", () => {
    Logger.attachBuffer();

    const logger = new Logger("TestContext");
    logger.log("message 1");
    logger.log("message 2");

    Logger.detachBuffer();

    const buffer = (Logger as any).logBuffer;
    expect(buffer.length).toBe(0);
  });

  it("should clear buffer on flush()", () => {
    Logger.attachBuffer();

    const logger = new Logger("TestContext");
    for (let i = 0; i < 100; i++) {
      logger.log(`msg ${i}`);
    }

    Logger.flush();

    const buffer = (Logger as any).logBuffer;
    expect(buffer.length).toBe(0);
  });
});
