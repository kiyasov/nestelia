/**
 * Interface for lifecycle hooks called when a module is initialized
 * This method is called once all the modules are instantiated but before
 * the application is fully started
 */
export interface OnModuleInit {
  onModuleInit(): Promise<void> | void;
}

/**
 * Interface for lifecycle hooks called when the application is bootstrapped
 * This method is called after all modules have been initialized
 */
export interface OnApplicationBootstrap {
  onApplicationBootstrap(): Promise<void> | void;
}

/**
 * Interface for lifecycle hooks called before a module is destroyed
 * This method is called when the application is shutting down
 */
export interface OnModuleDestroy {
  onModuleDestroy(): Promise<void> | void;
}

/**
 * Interface for lifecycle hooks called before the application is closed
 * This method is called after all OnModuleDestroy hooks have been called
 */
export interface BeforeApplicationShutdown {
  beforeApplicationShutdown(): Promise<void> | void;
}

/**
 * Interface for lifecycle hooks called when the application is shutting down
 * This method is called when all connections are closed and the application is about to exit
 */
export interface OnApplicationShutdown {
  onApplicationShutdown(): Promise<void> | void;
}
