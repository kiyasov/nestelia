import "reflect-metadata";

import { typeMetadataStorage } from "../storages/type-metadata.storage";
import { getOperationArgsDefinitions } from "./args.decorator";
import { SUBSCRIPTION_METADATA } from "./constants";

/** Subscribe function type for subscriptions. */
export type SubscribeFn = (
  root: unknown,
  args: Record<string, unknown>,
  context: unknown,
  info: unknown,
) => AsyncIterator<unknown>;

/** Resolve function type for subscriptions. */
export type ResolveFn = (payload: unknown) => unknown;

/** Options for the @Subscription decorator. */
export interface SubscriptionOptions {
  /** Subscription name (defaults to method name). */
  name?: string;
  /** Description for documentation. */
  description?: string;
  /** Whether the subscription can return null. */
  nullable?: boolean;
  /** Deprecation reason. */
  deprecationReason?: string;
  /** Subscribe function (async iterator). */
  subscribe?: SubscribeFn;
  /** Resolve function to transform the payload. */
  resolve?: ResolveFn;
  /** Additional extensions. */
  extensions?: Record<string, unknown>;
  /** Return type factory function. */
  returnType?: () => unknown;
}

/** Subscription metadata stored in Reflect. */
export interface SubscriptionMetadata {
  kind: "subscription";
  methodName: string | symbol;
  name: string | symbol;
  description?: string;
  nullable?: boolean;
  deprecationReason?: string;
  subscribe?: SubscribeFn;
  resolve?: ResolveFn;
  extensions?: Record<string, unknown>;
  returnType?: () => unknown;
}

/**
 * Decorator for a GraphQL Subscription.
 * @param typeFn - Return type factory, options object, or subscription name.
 * @param options - Subscription options when typeFn is a function.
 *
 * @example
 * ```typescript
 * @Subscription()
 * async userCreated() {
 *   return pubSub.asyncIterator('userCreated');
 * }
 *
 * @Subscription(() => User)
 * async userCreated() {
 *   return pubSub.asyncIterator('userCreated');
 * }
 *
 * @Subscription('userUpdated')
 * async onUserUpdated() {
 *   return pubSub.asyncIterator('userUpdated');
 * }
 *
 * @Subscription({
 *   name: 'messageAdded',
 *   subscribe: () => pubSub.asyncIterator('messageAdded'),
 *   resolve: (payload) => payload.message
 * })
 * async onMessageAdded() {}
 * ```
 */
export function Subscription(
  typeFn?: (() => unknown) | SubscriptionOptions | string,
  options?: SubscriptionOptions,
): MethodDecorator {
  return (target, propertyKey) => {
    let opts: SubscriptionOptions;
    let returnType: (() => unknown) | undefined;

    if (typeof typeFn === "function") {
      returnType = typeFn;
      opts = options || {};
    } else if (typeof typeFn === "string") {
      opts = { name: typeFn };
    } else {
      opts = typeFn || {};
    }

    const metadata: SubscriptionMetadata = {
      kind: "subscription",
      methodName: propertyKey,
      name: opts.name || propertyKey,
      description: opts.description,
      nullable: opts.nullable,
      deprecationReason: opts.deprecationReason,
      subscribe: opts.subscribe,
      resolve: opts.resolve,
      extensions: opts.extensions,
      returnType: returnType || opts.returnType,
    };

    Reflect.defineMetadata(
      SUBSCRIPTION_METADATA,
      metadata,
      target,
      propertyKey,
    );

    typeMetadataStorage.addSubscription({
      kind: "subscription",
      target,
      methodName: propertyKey as string,
      name: opts.name || propertyKey.toString(),
      returnType: returnType || opts.returnType,
      nullable: opts.nullable,
      description: opts.description,
      deprecationReason: opts.deprecationReason,
      args: getOperationArgsDefinitions(target, propertyKey as string),
    });
  };
}
