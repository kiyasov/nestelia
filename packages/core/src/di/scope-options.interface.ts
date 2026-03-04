export enum Scope {
  SINGLETON = 0, // Default: One instance shared across the application
  REQUEST = 1, // One instance per incoming request
  TRANSIENT = 2, // New instance created every time it's injected
}

export interface ScopeOptions {
  scope?: Scope;
}
