import { Module } from "nestelia";
import type { OnModuleDestroy } from "nestelia";

import { clearStrategyRegistries } from "./passport-strategy";

/**
 * PassportModule clears strategy registries on module destroy
 * to prevent memory leaks across application restarts.
 */
@Module({})
export class PassportModule implements OnModuleDestroy {
  onModuleDestroy(): void {
    clearStrategyRegistries();
  }
}
