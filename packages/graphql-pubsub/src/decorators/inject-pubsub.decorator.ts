import { Inject } from "@kiyasov/elysia-nest";
import { GRAPHQL_PUBSUB } from "../graphql-pubsub.module";

/**
 * Parameter decorator that injects the {@link RedisPubSub} instance
 * registered under the {@link GRAPHQL_PUBSUB} token.
 *
 * Requires {@link GraphQLPubSubModule} (or its global variant) to be imported
 * in the application module.
 *
 * @example
 * ```typescript
 * @Injectable()
 * class SubscriptionsService {
 *   constructor(@InjectPubSub() private readonly pubsub: RedisPubSub) {}
 *
 *   publish(event: string, payload: unknown): Promise<void> {
 *     return this.pubsub.publish(event, payload);
 *   }
 * }
 * ```
 */
export function InjectPubSub(): ParameterDecorator {
  return Inject(GRAPHQL_PUBSUB);
}
