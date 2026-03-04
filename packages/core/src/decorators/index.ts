export * from "./apply-decorators";
export * from "./middleware.decorator";
export * from "./constants";
export * from "./controller.decorator";
export * from "./header.decorator";
export * from "./http.decorators";
export {
  File,
  Files,
  Form,
  FileValidationError,
  processParameters,
} from "./param.decorators";
export type { FileValidationOptions, ParamInfo } from "./param.decorators";
export * from "./http-code.decorator";
export * from "./lifecycle.decorators";
export * from "./schema.decorator";
export * from "./set-metadata.decorator";
export * from "./types";

import { GLOBAL_MODULE_METADATA } from "./constants";

/**
 * Marks a module as global, meaning its providers can be accessed from any other module
 * without explicitly importing it.
 *
 * @example
 * ```typescript
 * @Global()
 * @Module({
 *   providers: [ConfigService],
 *   exports: [ConfigService],
 * })
 * export class ConfigModule {}
 * ```
 */
export function Global(): ClassDecorator {
  return (target: object) => {
    Reflect.defineMetadata(GLOBAL_MODULE_METADATA, true, target);
  };
}
