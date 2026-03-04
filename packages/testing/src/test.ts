import type { ModuleOptions } from "@kiyasov/elysia-nest";
import { TestingModule, TestingModuleBuilder } from "./testing.module-builder";

/**
 * Test utilities for creating testing modules.
 *
 * @example
 * ```typescript
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
 *   it('should be defined', () => {
 *     expect(service).toBeDefined();
 *   });
 * });
 * ```
 */
export class Test {
  /**
   * Create a testing module builder with the given metadata
   */
  static createTestingModule(metadata: ModuleOptions): TestingModuleBuilder {
    return new TestingModuleBuilder(metadata);
  }

  /**
   * Create a testing module and compile it immediately
   */
  static async createTestingModuleAndCompile(
    metadata: ModuleOptions,
  ): Promise<TestingModule> {
    return new TestingModuleBuilder(metadata).compile();
  }
}
