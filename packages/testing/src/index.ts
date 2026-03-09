/**
 * @packageDocumentation
 *
 * Elysia-Nest Testing Module
 *
 * A comprehensive testing module for Elysia-Nest applications, providing:
 * - Testing module builder for isolated unit tests
 * - Provider override capabilities for mocking
 * - Factory-based dependency injection
 * - Support for all provider types (value, class, factory)
 *
 * @example
 * Quick start:
 * ```typescript
 * import { Test } from '@nestelia/testing';
 *
 * describe('MyService', () => {
 *   let moduleRef: TestingModule;
 *   let service: MyService;
 *
 *   beforeAll(async () => {
 *     moduleRef = await Test.createTestingModule({
 *       providers: [MyService, DatabaseService],
 *     })
 *       .overrideProvider(DatabaseService)
 *       .useValue({ query: () => [] })
 *       .compile();
 *
 *     service = moduleRef.get(MyService);
 *   });
 *
 *   it('should work', () => {
 *     expect(service).toBeDefined();
 *   });
 * });
 * ```
 *
 * @module
 */

export type { OverridesMetadata } from "./interfaces";
export { Test } from "./test";
export { TestingModule, TestingModuleBuilder } from "./testing.module-builder";
