import { randomUUID } from "node:crypto";

import { type ContextId, STATIC_CONTEXT } from "./constants";
import type { Module } from "./module";
import type { ProviderToken, Type } from "./provider.interface";
import type { Scope } from "./scope-options.interface";

export interface InstancePerContext<T = unknown> {
  instance: T;
  isResolved?: boolean;
  isPending?: boolean;
  donePromise?: Promise<unknown>;
  isConstructorCalled?: boolean;
}

export interface PropertyMetadata {
  key: symbol | string;
  wrapper: InstanceWrapper;
}

interface InstanceMetadataStore {
  dependencies?: InstanceWrapper[];
  properties?: PropertyMetadata[];
  enhancers?: InstanceWrapper[];
}

export interface InstanceWrapperOptions<T = unknown> {
  token: ProviderToken;
  name?: string | symbol;
  metatype?: Type<T> | Function | null;
  instance?: T | null;
  isResolved?: boolean;
  scope?: Scope;
  inject?: unknown[];
  durable?: boolean;
  host?: Module;
  isAlias?: boolean;
  subtype?: string;
  aliasTarget?: ProviderToken;
}

export class InstanceWrapper<T = unknown> {
  public readonly token: ProviderToken;
  public readonly name: string | symbol;
  public readonly host?: Module;
  public readonly isAlias: boolean;
  public readonly subtype?: string;
  public readonly aliasTarget?: ProviderToken;

  public scope: Scope;
  public metatype: Type<T> | Function | null;
  public inject: unknown[] | null = null;
  public durable?: boolean;

  private readonly values = new WeakMap<ContextId, InstancePerContext<T>>();
  private readonly instanceMetadata: InstanceMetadataStore = {};
  private readonly id: string;
  private transientMap?: Map<string, WeakMap<ContextId, InstancePerContext<T>>>;
  private isTreeStatic?: boolean;
  private rootInquirer?: InstanceWrapper;

  constructor(options: InstanceWrapperOptions<T>) {
    this.id = randomUUID();
    this.token = options.token;
    this.name =
      options.name ??
      (typeof options.token === "function"
        ? options.token.name
        : String(options.token));
    this.metatype = options.metatype ?? null;
    this.scope = options.scope ?? 0; // Scope.DEFAULT = 0
    this.inject = options.inject ?? null;
    this.durable = options.durable;
    this.host = options.host;
    this.isAlias = options.isAlias ?? false;
    this.subtype = options.subtype;
    this.aliasTarget = options.aliasTarget;

    // Initialize with static context
    const staticValue: InstancePerContext<T> = {
      instance: options.instance ?? (null as T),
      isResolved: options.isResolved ?? false,
      isPending: false,
    };
    this.values.set(STATIC_CONTEXT, staticValue);

    if (this.scope === 2) {
      // Scope.TRANSIENT = 2
      this.transientMap = new Map();
    }
  }

  get uuid(): string {
    return this.id;
  }

  set instance(value: T) {
    const staticContext = this.getInstanceByContextId(STATIC_CONTEXT);
    staticContext.instance = value;
  }

  get instance(): T {
    const staticContext = this.getInstanceByContextId(STATIC_CONTEXT);
    return staticContext.instance;
  }

  get isTransient(): boolean {
    return this.scope === 2; // Scope.TRANSIENT
  }

  get isFactory(): boolean {
    return !!this.metatype && this.inject !== null;
  }

  public getInstanceByContextId(
    contextId: ContextId,
    inquirerId?: string,
  ): InstancePerContext<T> {
    if (this.scope === 2 && inquirerId) {
      // TRANSIENT scope with inquirer
      return this.getInstanceByInquirerId(contextId, inquirerId);
    }

    const value = this.values.get(contextId);
    if (value) {
      return value;
    }

    if (contextId !== STATIC_CONTEXT) {
      return this.cloneStaticInstance(contextId);
    }

    return {
      instance: null as T,
      isResolved: false,
      isPending: false,
    };
  }

  public getInstanceByInquirerId(
    contextId: ContextId,
    inquirerId: string,
  ): InstancePerContext<T> {
    if (!this.transientMap) {
      return this.getInstanceByContextId(STATIC_CONTEXT);
    }

    let collection = this.transientMap.get(inquirerId);
    if (!collection) {
      collection = new WeakMap();
      this.transientMap.set(inquirerId, collection);
    }

    const value = collection.get(contextId);
    if (value) {
      return value;
    }

    return this.cloneTransientInstance(contextId, inquirerId);
  }

  public setInstanceByContextId(
    contextId: ContextId,
    value: InstancePerContext<T>,
    inquirerId?: string,
  ): void {
    if (this.scope === 2 && inquirerId) {
      return this.setInstanceByInquirerId(contextId, inquirerId, value);
    }
    this.values.set(contextId, value);
  }

  public setInstanceByInquirerId(
    contextId: ContextId,
    inquirerId: string,
    value: InstancePerContext<T>,
  ): void {
    if (!this.transientMap) {
      return;
    }

    let collection = this.transientMap.get(inquirerId);
    if (!collection) {
      collection = new WeakMap();
      this.transientMap.set(inquirerId, collection);
    }
    collection.set(contextId, value);
  }

  public cloneStaticInstance(contextId: ContextId): InstancePerContext<T> {
    const staticInstance = this.getInstanceByContextId(STATIC_CONTEXT);

    if (this.isDependencyTreeStatic()) {
      return staticInstance;
    }

    const instancePerContext: InstancePerContext<T> = {
      ...staticInstance,
      instance: undefined as T,
      isResolved: false,
      isPending: false,
    };

    if (this.isNewable()) {
      instancePerContext.instance = Object.create(
        (this.metatype as Type<T>).prototype,
      );
    }

    this.setInstanceByContextId(contextId, instancePerContext);
    return instancePerContext;
  }

  public cloneTransientInstance(
    contextId: ContextId,
    inquirerId: string,
  ): InstancePerContext<T> {
    const staticInstance = this.getInstanceByContextId(STATIC_CONTEXT);

    const instancePerContext: InstancePerContext<T> = {
      ...staticInstance,
      instance: undefined as T,
      isResolved: false,
      isPending: false,
    };

    if (this.isNewable()) {
      instancePerContext.instance = Object.create(
        (this.metatype as Type<T>).prototype,
      );
    }

    this.setInstanceByInquirerId(contextId, inquirerId, instancePerContext);
    return instancePerContext;
  }

  public createPrototype(contextId: ContextId): object | undefined {
    const host = this.getInstanceByContextId(contextId);
    if (!this.isNewable() || host.isResolved) {
      return undefined;
    }
    return Object.create((this.metatype as Type<T>).prototype);
  }

  public isDependencyTreeStatic(visited = new Set<string>()): boolean {
    if (this.isTreeStatic !== undefined) {
      return this.isTreeStatic;
    }

    // REQUEST and TRANSIENT scopes are never static
    if (this.scope === 1 || this.scope === 2) {
      // Scope.REQUEST = 1, Scope.TRANSIENT = 2
      this.isTreeStatic = false;
      return this.isTreeStatic;
    }

    if (visited.has(this.id)) {
      return true; // Circular dependency, assume static
    }

    visited.add(this.id);

    // Check dependencies
    const deps = this.instanceMetadata.dependencies ?? [];
    const hasNonStaticDep = deps.some(
      (dep) => !dep.isDependencyTreeStatic(new Set(visited)),
    );

    if (hasNonStaticDep) {
      this.isTreeStatic = false;
      return this.isTreeStatic;
    }

    this.isTreeStatic = true;
    return this.isTreeStatic;
  }

  public addCtorMetadata(index: number, wrapper: InstanceWrapper): void {
    if (!this.instanceMetadata.dependencies) {
      this.instanceMetadata.dependencies = [];
    }
    this.instanceMetadata.dependencies[index] = wrapper;
  }

  public getCtorMetadata(): InstanceWrapper[] {
    return this.instanceMetadata.dependencies ?? [];
  }

  public addPropertiesMetadata(
    key: symbol | string,
    wrapper: InstanceWrapper,
  ): void {
    if (!this.instanceMetadata.properties) {
      this.instanceMetadata.properties = [];
    }
    this.instanceMetadata.properties.push({ key, wrapper });
  }

  public getPropertiesMetadata(): PropertyMetadata[] {
    return this.instanceMetadata.properties ?? [];
  }

  public isInRequestScope(
    contextId: ContextId,
    inquirer?: InstanceWrapper,
  ): boolean {
    const isTreeStatic = this.isDependencyTreeStatic();
    return (
      !isTreeStatic &&
      contextId !== STATIC_CONTEXT &&
      (!this.isTransient || (this.isTransient && !!inquirer))
    );
  }

  public isStatic(contextId: ContextId, inquirer?: InstanceWrapper): boolean {
    if (!this.isDependencyTreeStatic() || contextId !== STATIC_CONTEXT) {
      return false;
    }

    if (!this.isTransient) {
      return true;
    }

    const isInquirerRequestScoped =
      inquirer && !inquirer.isDependencyTreeStatic();
    const rootInquirer = inquirer?.getRootInquirer();

    if (!isInquirerRequestScoped && inquirer && !inquirer.isTransient) {
      return true;
    }

    if (!isInquirerRequestScoped && rootInquirer && !rootInquirer.isTransient) {
      return true;
    }

    return false;
  }

  public attachRootInquirer(inquirer: InstanceWrapper): void {
    if (!this.isTransient) {
      return;
    }
    this.rootInquirer = inquirer.getRootInquirer() ?? inquirer;
  }

  public getRootInquirer(): InstanceWrapper | undefined {
    return this.rootInquirer;
  }

  private isNewable(): boolean {
    return (
      this.inject === null &&
      !!this.metatype &&
      !!(this.metatype as Type<T>).prototype
    );
  }
}
