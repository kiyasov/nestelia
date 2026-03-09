---
title: API Reference
description: Complete reference for all nestelia APIs, decorators, and modules
---

# API Reference

Complete reference for the `nestelia` package and all its subpath modules.

## Core

| Page | Description |
|------|-------------|
| [Controllers](/core-concepts/controllers) | `@Controller`, `@Get`, `@Post`, `@Put`, `@Patch`, `@Delete`, `@All`, `@Head`, `@Options` |
| [Modules](/core-concepts/modules) | `@Module`, `@Global` — encapsulate controllers, providers, and imports |
| [Dependency Injection](/features/dependency-injection) | `@Injectable`, `@Inject`, `@Optional` — constructor-based DI with multiple scopes |
| [Parameter Decorators](/features/parameter-decorators) | `@Body`, `@Param`, `@Query`, `@Headers`, `@Req`, `@Res`, `@Ip`, `@HostParam` |
| [HTTP Decorators](/features/http-decorators) | `@HttpCode`, `@Header`, `@Redirect`, `@Schema` |
| [Guards](/features/guards) | `@UseGuards`, `CanActivate` |
| [Interceptors](/features/interceptors) | `@UseInterceptors`, `ElysiaInterceptor` |
| [Pipes](/features/pipes) | `@UsePipes`, `PipeTransform` |
| [Middleware](/features/middleware) | `@Middleware`, `ElysiaNestMiddleware` |
| [Exception Handling](/features/exception-handling) | `@Catch`, `ExceptionFilter`, `HttpException` |
| [Lifecycle Hooks](/features/lifecycle-hooks) | `OnModuleInit`, `OnApplicationBootstrap`, `OnModuleDestroy`, `BeforeApplicationShutdown` |

## Packages

| Package | Description |
|---------|-------------|
| [nestelia/scheduler](/packages/scheduler) | `@Cron`, `@Interval`, `@Timeout`, `ScheduleModule` |
| [nestelia/microservices](/packages/microservices) | `@MessagePattern`, `@EventPattern`, `@Client`, `ClientProxy` |
| [nestelia/apollo](/packages/apollo) | `@Resolver`, `@Query`, `@Mutation`, `@Subscription`, `@ObjectType`, `@Field` |
| [nestelia/passport](/packages/passport) | `AuthGuard`, `PassportStrategy` |
| [nestelia/cache](/packages/cache) | `CacheModule`, `@CacheKey`, `@CacheTTL`, `CacheInterceptor` |
| [nestelia/rabbitmq](/packages/rabbitmq) | `@RabbitSubscribe`, `@RabbitRPC`, `@RabbitRetry`, `@RabbitDLQ` |
| [nestelia/graphql-pubsub](/packages/graphql-pubsub) | `RedisPubSub`, `GraphQLPubSubModule`, `@InjectPubSub` |
| [nestelia/testing](/packages/testing) | `Test`, `TestingModule`, `TestingModuleBuilder` |
