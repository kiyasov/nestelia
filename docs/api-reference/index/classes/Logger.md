# Class: Logger

Defined in: [packages/core/src/logger/logger.service.ts:15](https://github.com/nestelia/nestelia/blob/main/packages/core/src/logger/logger.service.ts#L15)

## Implements

- [`LoggerService`](../interfaces/LoggerService.md)

## Accessors

### localInstance

#### Get Signature

```ts
get localInstance(): LoggerService;
```

Defined in: [packages/core/src/logger/logger.service.ts:32](https://github.com/nestelia/nestelia/blob/main/packages/core/src/logger/logger.service.ts#L32)

##### Returns

[`LoggerService`](../interfaces/LoggerService.md)

## Constructors

### Constructor

```ts
new Logger(): Logger;
```

Defined in: [packages/core/src/logger/logger.service.ts:24](https://github.com/nestelia/nestelia/blob/main/packages/core/src/logger/logger.service.ts#L24)

#### Returns

`Logger`

### Constructor

```ts
new Logger(context): Logger;
```

Defined in: [packages/core/src/logger/logger.service.ts:25](https://github.com/nestelia/nestelia/blob/main/packages/core/src/logger/logger.service.ts#L25)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `context` | `string` |

#### Returns

`Logger`

### Constructor

```ts
new Logger(context, options): Logger;
```

Defined in: [packages/core/src/logger/logger.service.ts:26](https://github.com/nestelia/nestelia/blob/main/packages/core/src/logger/logger.service.ts#L26)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `context` | `string` |
| `options` | \{ `timestamp?`: `boolean`; \} |
| `options.timestamp?` | `boolean` |

#### Returns

`Logger`

## Methods

### debug()

```ts
debug(message, ...optionalParams): void;
```

Defined in: [packages/core/src/logger/logger.service.ts:87](https://github.com/nestelia/nestelia/blob/main/packages/core/src/logger/logger.service.ts#L87)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `unknown` |
| ...`optionalParams` | `unknown`[] |

#### Returns

`void`

#### Implementation of

[`LoggerService`](../interfaces/LoggerService.md).[`debug`](../interfaces/LoggerService.md#debug)

***

### error()

```ts
error(message, ...optionalParams): void;
```

Defined in: [packages/core/src/logger/logger.service.ts:58](https://github.com/nestelia/nestelia/blob/main/packages/core/src/logger/logger.service.ts#L58)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `unknown` |
| ...`optionalParams` | `unknown`[] |

#### Returns

`void`

#### Implementation of

[`LoggerService`](../interfaces/LoggerService.md).[`error`](../interfaces/LoggerService.md#error)

***

### fatal()

```ts
fatal(message, ...optionalParams): void;
```

Defined in: [packages/core/src/logger/logger.service.ts:105](https://github.com/nestelia/nestelia/blob/main/packages/core/src/logger/logger.service.ts#L105)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `unknown` |
| ...`optionalParams` | `unknown`[] |

#### Returns

`void`

#### Implementation of

[`LoggerService`](../interfaces/LoggerService.md).[`fatal`](../interfaces/LoggerService.md#fatal)

***

### log()

```ts
log(message, ...optionalParams): void;
```

Defined in: [packages/core/src/logger/logger.service.ts:69](https://github.com/nestelia/nestelia/blob/main/packages/core/src/logger/logger.service.ts#L69)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `unknown` |
| ...`optionalParams` | `unknown`[] |

#### Returns

`void`

#### Implementation of

[`LoggerService`](../interfaces/LoggerService.md).[`log`](../interfaces/LoggerService.md#log)

***

### verbose()

```ts
verbose(message, ...optionalParams): void;
```

Defined in: [packages/core/src/logger/logger.service.ts:96](https://github.com/nestelia/nestelia/blob/main/packages/core/src/logger/logger.service.ts#L96)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `unknown` |
| ...`optionalParams` | `unknown`[] |

#### Returns

`void`

#### Implementation of

[`LoggerService`](../interfaces/LoggerService.md).[`verbose`](../interfaces/LoggerService.md#verbose)

***

### warn()

```ts
warn(message, ...optionalParams): void;
```

Defined in: [packages/core/src/logger/logger.service.ts:78](https://github.com/nestelia/nestelia/blob/main/packages/core/src/logger/logger.service.ts#L78)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `unknown` |
| ...`optionalParams` | `unknown`[] |

#### Returns

`void`

#### Implementation of

[`LoggerService`](../interfaces/LoggerService.md).[`warn`](../interfaces/LoggerService.md#warn)

***

### attachBuffer()

```ts
static attachBuffer(): void;
```

Defined in: [packages/core/src/logger/logger.service.ts:158](https://github.com/nestelia/nestelia/blob/main/packages/core/src/logger/logger.service.ts#L158)

#### Returns

`void`

***

### debug()

```ts
static debug(message, ...optionalParams): void;
```

Defined in: [packages/core/src/logger/logger.service.ts:132](https://github.com/nestelia/nestelia/blob/main/packages/core/src/logger/logger.service.ts#L132)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `unknown` |
| ...`optionalParams` | `unknown`[] |

#### Returns

`void`

***

### detachBuffer()

```ts
static detachBuffer(): void;
```

Defined in: [packages/core/src/logger/logger.service.ts:162](https://github.com/nestelia/nestelia/blob/main/packages/core/src/logger/logger.service.ts#L162)

#### Returns

`void`

***

### error()

```ts
static error(message, ...optionalParams): void;
```

Defined in: [packages/core/src/logger/logger.service.ts:114](https://github.com/nestelia/nestelia/blob/main/packages/core/src/logger/logger.service.ts#L114)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `unknown` |
| ...`optionalParams` | `unknown`[] |

#### Returns

`void`

***

### fatal()

```ts
static fatal(message, ...optionalParams): void;
```

Defined in: [packages/core/src/logger/logger.service.ts:144](https://github.com/nestelia/nestelia/blob/main/packages/core/src/logger/logger.service.ts#L144)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `unknown` |
| ...`optionalParams` | `unknown`[] |

#### Returns

`void`

***

### flush()

```ts
static flush(): void;
```

Defined in: [packages/core/src/logger/logger.service.ts:150](https://github.com/nestelia/nestelia/blob/main/packages/core/src/logger/logger.service.ts#L150)

#### Returns

`void`

***

### getTimestamp()

```ts
static getTimestamp(): string;
```

Defined in: [packages/core/src/logger/logger.service.ts:167](https://github.com/nestelia/nestelia/blob/main/packages/core/src/logger/logger.service.ts#L167)

#### Returns

`string`

***

### isLevelEnabled()

```ts
static isLevelEnabled(level): boolean;
```

Defined in: [packages/core/src/logger/logger.service.ts:188](https://github.com/nestelia/nestelia/blob/main/packages/core/src/logger/logger.service.ts#L188)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `level` | `"error"` \| `"verbose"` \| `"debug"` \| `"log"` \| `"warn"` \| `"fatal"` |

#### Returns

`boolean`

***

### log()

```ts
static log(message, ...optionalParams): void;
```

Defined in: [packages/core/src/logger/logger.service.ts:120](https://github.com/nestelia/nestelia/blob/main/packages/core/src/logger/logger.service.ts#L120)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `unknown` |
| ...`optionalParams` | `unknown`[] |

#### Returns

`void`

***

### overrideLogger()

```ts
static overrideLogger(logger): void;
```

Defined in: [packages/core/src/logger/logger.service.ts:171](https://github.com/nestelia/nestelia/blob/main/packages/core/src/logger/logger.service.ts#L171)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `logger` | \| `boolean` \| [`LoggerService`](../interfaces/LoggerService.md) \| (`"error"` \| `"verbose"` \| `"debug"` \| `"log"` \| `"warn"` \| `"fatal"`)[] |

#### Returns

`void`

***

### verbose()

```ts
static verbose(message, ...optionalParams): void;
```

Defined in: [packages/core/src/logger/logger.service.ts:138](https://github.com/nestelia/nestelia/blob/main/packages/core/src/logger/logger.service.ts#L138)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `unknown` |
| ...`optionalParams` | `unknown`[] |

#### Returns

`void`

***

### warn()

```ts
static warn(message, ...optionalParams): void;
```

Defined in: [packages/core/src/logger/logger.service.ts:126](https://github.com/nestelia/nestelia/blob/main/packages/core/src/logger/logger.service.ts#L126)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `unknown` |
| ...`optionalParams` | `unknown`[] |

#### Returns

`void`

## Properties

| Property | Modifier | Type | Default value | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="context"></a> `context?` | `protected` | `string` | `undefined` | [packages/core/src/logger/logger.service.ts:28](https://github.com/nestelia/nestelia/blob/main/packages/core/src/logger/logger.service.ts#L28) |
| <a id="localinstanceref"></a> `localInstanceRef?` | `protected` | [`LoggerService`](../interfaces/LoggerService.md) | `undefined` | [packages/core/src/logger/logger.service.ts:22](https://github.com/nestelia/nestelia/blob/main/packages/core/src/logger/logger.service.ts#L22) |
| <a id="options"></a> `options` | `protected` | \{ `timestamp?`: `boolean`; \} | `{}` | [packages/core/src/logger/logger.service.ts:29](https://github.com/nestelia/nestelia/blob/main/packages/core/src/logger/logger.service.ts#L29) |
| `options.timestamp?` | `public` | `boolean` | `undefined` | [packages/core/src/logger/logger.service.ts:29](https://github.com/nestelia/nestelia/blob/main/packages/core/src/logger/logger.service.ts#L29) |
| <a id="logbuffer"></a> `logBuffer` | `static` | `LogBufferRecord`[] | `undefined` | [packages/core/src/logger/logger.service.ts:16](https://github.com/nestelia/nestelia/blob/main/packages/core/src/logger/logger.service.ts#L16) |
| <a id="loglevels"></a> `logLevels?` | `static` | (`"error"` \| `"verbose"` \| `"debug"` \| `"log"` \| `"warn"` \| `"fatal"`)[] | `undefined` | [packages/core/src/logger/logger.service.ts:18](https://github.com/nestelia/nestelia/blob/main/packages/core/src/logger/logger.service.ts#L18) |
| <a id="staticinstanceref"></a> `staticInstanceRef?` | `static` | [`LoggerService`](../interfaces/LoggerService.md) | `DEFAULT_LOGGER` | [packages/core/src/logger/logger.service.ts:17](https://github.com/nestelia/nestelia/blob/main/packages/core/src/logger/logger.service.ts#L17) |
