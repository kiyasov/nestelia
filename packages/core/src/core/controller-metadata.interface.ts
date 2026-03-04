import type { RouteMetadata } from "../decorators/types";

/**
 * Controller metadata type
 */
export interface ControllerMetadata {
  prefix: string;
  routes: RouteMetadata[];
}
