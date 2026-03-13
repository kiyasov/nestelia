import "reflect-metadata";

import { beforeEach, describe, expect, it } from "bun:test";

import { Global } from "~/src/decorators/index";
import { Container } from "~/src/di/container";
import { Inject, Injectable } from "~/src/di/injectable.decorator";
import { ModuleRef } from "~/src/di/module-ref";
import { initializeSingletonProviders } from "~/src/core/module.utils";

describe("Cross-module dependency resolution", () => {
  let container: Container;

  beforeEach(() => {
    Container.instance.clear();
    container = Container.instance;
  });

  it("resolves dependencies of an imported provider in the owning module's context", async () => {
    // Reproduces: "Provider MissionsService not found in module AppModule"
    // MissionsService depends on MissionsRepository — both live in MissionsModule.
    // AppModule imports MissionsModule and has a service that injects MissionsService.
    // Before the fix loadInstance was called with AppModule as context, so
    // MissionsRepository was looked up there and not found.

    @Injectable()
    class MissionsRepository {
      find() {
        return ["mission-1"];
      }
    }

    @Injectable()
    class MissionsService {
      constructor(public repo: MissionsRepository) {}
      getMissions() {
        return this.repo.find();
      }
    }

    @Injectable()
    class SomeAppService {
      constructor(public missions: MissionsService) {}
    }

    class MissionsModule {}
    class AppModule {}

    const missionsModuleRef = container.addModule(MissionsModule, "MissionsModule");
    missionsModuleRef.addProvider(MissionsRepository);
    missionsModuleRef.addProvider(MissionsService);

    const appModuleRef = container.addModule(AppModule, "AppModule");
    appModuleRef.addProvider(SomeAppService);
    appModuleRef.addImport(missionsModuleRef);

    const service = await container.get<SomeAppService>(SomeAppService, AppModule);

    expect(service).toBeDefined();
    expect(service!.missions).toBeInstanceOf(MissionsService);
    expect(service!.missions.getMissions()).toEqual(["mission-1"]);
  });

  it("resolves deeply nested cross-module dependencies", async () => {
    // C depends on B depends on A, each in their own module.
    // AppModule imports C's module only.

    @Injectable()
    class ServiceA {
      value = "A";
    }

    @Injectable()
    class ServiceB {
      constructor(public a: ServiceA) {}
    }

    @Injectable()
    class ServiceC {
      constructor(public b: ServiceB) {}
    }

    @Injectable()
    class AppService {
      constructor(public c: ServiceC) {}
    }

    class ModuleA {}
    class ModuleB {}
    class ModuleC {}
    class AppModule {}

    const modA = container.addModule(ModuleA, "ModuleA");
    modA.addProvider(ServiceA);

    const modB = container.addModule(ModuleB, "ModuleB");
    modB.addProvider(ServiceB);
    modB.addImport(modA);

    const modC = container.addModule(ModuleC, "ModuleC");
    modC.addProvider(ServiceC);
    modC.addImport(modB);

    const appMod = container.addModule(AppModule, "AppModule");
    appMod.addProvider(AppService);
    appMod.addImport(modC);

    const service = await container.get<AppService>(AppService, AppModule);

    expect(service).toBeDefined();
    expect(service!.c.b.a.value).toBe("A");
  });
});

describe("@Global() module", () => {
  let container: Container;

  beforeEach(() => {
    Container.instance.clear();
    container = Container.instance;
  });

  it("makes providers accessible in any module without explicit imports", async () => {
    @Injectable()
    class ConfigService {
      get(key: string) {
        return `value-of-${key}`;
      }
    }

    @Injectable()
    class UserService {
      constructor(public config: ConfigService) {}
    }

    @Global()
    class ConfigModule {}
    class UserModule {}

    const configMod = container.addModule(ConfigModule, "ConfigModule");
    configMod.addProvider(ConfigService);
    container.addGlobalModule(configMod);
    container.bindGlobalScope();

    const userMod = container.addModule(UserModule, "UserModule");
    userMod.addProvider(UserService);
    // Note: UserModule does NOT explicitly import ConfigModule

    const userService = await container.get<UserService>(UserService, UserModule);

    expect(userService).toBeDefined();
    expect(userService!.config).toBeInstanceOf(ConfigService);
    expect(userService!.config.get("PORT")).toBe("value-of-PORT");
  });

  it("new modules added after bindGlobalScope still receive global providers", async () => {
    @Injectable()
    class SharedService {
      name = "shared";
    }

    @Injectable()
    class LateService {
      constructor(public shared: SharedService) {}
    }

    class SharedModule {}
    class LateModule {}

    const sharedMod = container.addModule(SharedModule, "SharedModule");
    sharedMod.addProvider(SharedService);
    container.addGlobalModule(sharedMod);
    container.bindGlobalScope();

    // LateModule is added AFTER bindGlobalScope — addModule calls bindGlobalsToImports internally
    const lateMod = container.addModule(LateModule, "LateModule");
    lateMod.addProvider(LateService);

    const service = await container.get<LateService>(LateService, LateModule);
    expect(service!.shared.name).toBe("shared");
  });
});

describe("same module imported by multiple parents", () => {
  let container: Container;

  beforeEach(() => {
    Container.instance.clear();
    container = Container.instance;
  });

  it("shared module providers are singletons across all importers", async () => {
    @Injectable()
    class SharedService {
      count = 0;
      inc() {
        return ++this.count;
      }
    }

    @Injectable()
    class ModuleAService {
      constructor(public shared: SharedService) {}
    }

    @Injectable()
    class ModuleBService {
      constructor(public shared: SharedService) {}
    }

    class SharedModule {}
    class ModuleA {}
    class ModuleB {}
    class AppModule {}

    const sharedMod = container.addModule(SharedModule, "SharedModule");
    sharedMod.addProvider(SharedService);

    const modA = container.addModule(ModuleA, "ModuleA");
    modA.addProvider(ModuleAService);
    modA.addImport(sharedMod);

    const modB = container.addModule(ModuleB, "ModuleB");
    modB.addProvider(ModuleBService);
    modB.addImport(sharedMod);

    const appMod = container.addModule(AppModule, "AppModule");
    appMod.addImport(modA);
    appMod.addImport(modB);

    const svcA = await container.get<ModuleAService>(ModuleAService, ModuleA);
    const svcB = await container.get<ModuleBService>(ModuleBService, ModuleB);

    // Both reference the same SharedService singleton
    expect(svcA!.shared).toBe(svcB!.shared);
    svcA!.shared.inc();
    expect(svcB!.shared.count).toBe(1);
  });
});

describe("cross-module onModuleInit", () => {
  let container: Container;

  beforeEach(() => {
    Container.instance.clear();
    container = Container.instance;
  });

  it("onModuleInit in sub-module can access its own cross-module dependencies", async () => {
    const events: string[] = [];

    @Injectable()
    class RepoService {
      find() {
        return ["item-1"];
      }
    }

    @Injectable()
    class BusinessService {
      constructor(public repo: RepoService) {}

      onModuleInit() {
        const items = this.repo.find();
        events.push(`init:${items[0]}`);
      }
    }

    class RepoModule {}
    class BusinessModule {}
    class AppModule {}

    const repoMod = container.addModule(RepoModule, "RepoModule");
    repoMod.addProvider(RepoService);

    const bizMod = container.addModule(BusinessModule, "BusinessModule");
    bizMod.addProvider(BusinessService);
    bizMod.addImport(repoMod);

    const appMod = container.addModule(AppModule, "AppModule");
    appMod.addImport(bizMod);

    await initializeSingletonProviders();

    expect(events).toEqual(["init:item-1"]);
  });

  it("onModuleInit is not called twice when initializeSingletonProviders runs multiple times", async () => {
    const calls: string[] = [];

    class RootModule {}

    @Injectable()
    class SingletonService {
      onModuleInit() {
        calls.push("init");
      }
    }

    const rootMod = container.addModule(RootModule, "RootModule");
    rootMod.addProvider(SingletonService);

    await initializeSingletonProviders();
    await initializeSingletonProviders(); // second call (simulates module factory re-entrant call)

    expect(calls).toHaveLength(1);
  });
});

describe("custom provider tokens in cross-module DI", () => {
  let container: Container;

  beforeEach(() => {
    Container.instance.clear();
    container = Container.instance;
  });

  it("useValue provider from imported module is accessible to dependent service", async () => {
    const CONFIG_TOKEN = "CONFIG";

    @Injectable()
    class AppService {
      constructor(@Inject(CONFIG_TOKEN) public config: { env: string }) {}
    }

    class ConfigModule {}
    class AppModule {}

    const configMod = container.addModule(ConfigModule, "ConfigModule");
    configMod.addProvider({ provide: CONFIG_TOKEN, useValue: { env: "test" } });

    const appMod = container.addModule(AppModule, "AppModule");
    appMod.addProvider(AppService);
    appMod.addImport(configMod);

    const service = await container.get<AppService>(AppService, AppModule);

    expect(service).toBeDefined();
    expect(service!.config.env).toBe("test");
  });
});

describe("onModuleInit lifecycle ordering", () => {
  let container: Container;

  beforeEach(() => {
    Container.instance.clear();
    container = Container.instance;
  });

  it("all providers are resolved before any onModuleInit is called", async () => {
    // Reproduces: 'Provider "PaymentService" is not resolved yet'
    // PlisioService is processed first in the loop but calls moduleRef.get(PaymentService)
    // in onModuleInit — PaymentService must already be loaded at that point.

    const initOrder: string[] = [];

    class RootModule {}

    @Injectable()
    class PaymentService {
      process() {
        return "paid";
      }
    }

    @Injectable()
    class PlisioService {
      constructor(private moduleRef: ModuleRef) {}

      onModuleInit() {
        // This throws "not resolved yet" before the fix
        const paymentService = this.moduleRef.get<PaymentService>(PaymentService);
        initOrder.push(`plisio-init:${paymentService.process()}`);
      }
    }

    const rootMod = container.addModule(RootModule, "RootModule");
    // PlisioService is added FIRST so it appears first in the iteration
    rootMod.addProvider(PlisioService);
    rootMod.addProvider(PaymentService);

    await initializeSingletonProviders();

    expect(initOrder).toEqual(["plisio-init:paid"]);
  });

  it("onModuleInit is called for all providers that implement it", async () => {
    const calls: string[] = [];

    class AppModule {}

    @Injectable()
    class ServiceA {
      onModuleInit() {
        calls.push("ServiceA");
      }
    }

    @Injectable()
    class ServiceB {
      onModuleInit() {
        calls.push("ServiceB");
      }
    }

    @Injectable()
    class ServiceC {
      // no onModuleInit
    }

    const appMod = container.addModule(AppModule, "AppModule");
    appMod.addProvider(ServiceA);
    appMod.addProvider(ServiceB);
    appMod.addProvider(ServiceC);

    await initializeSingletonProviders();

    expect(calls).toContain("ServiceA");
    expect(calls).toContain("ServiceB");
    expect(calls).toHaveLength(2);
  });
});
