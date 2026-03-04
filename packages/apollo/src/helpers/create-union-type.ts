import "reflect-metadata";

import { UNION_TYPE_METADATA } from "../decorators/constants";

/**
 * Creates a GraphQL Union type from the given options.
 * The returned class can be used as a `@Field(() => UnionType)` type.
 *
 * @typeParam T - The union member type.
 * @param options - Union type configuration.
 * @returns A class that can be used as a GraphQL union type.
 *
 * @example
 * ```typescript
 * export const SearchResult = createUnionType({
 *   name: 'SearchResult',
 *   types: () => [User, Post] as const,
 *   resolveType: (value) => value.__typename,
 * });
 *
 * @Query(() => [SearchResult])
 * async search(@Args('query') query: string) {
 *   return this.searchService.search(query);
 * }
 * ```
 */
export function createUnionType<T extends object>(options: {
  /** Name of the union type in the GraphQL schema. */
  name: string;
  /** Factory function returning array of types in the union. */
  types: () => readonly (new (...args: unknown[]) => T)[];
  /** Function to determine the type of a value. */
  resolveType?: (value: T) => string | null;
  /** Description of the union type. */
  description?: string;
}): new (...args: unknown[]) => T {
  class UnionPlaceholder {}
  Reflect.defineMetadata(UNION_TYPE_METADATA, options, UnionPlaceholder);
  return UnionPlaceholder as unknown as new (...args: unknown[]) => T;
}
