import passport from "passport";

type Constructor<T = object> = new (...args: unknown[]) => T;
type AbstractConstructor<T = object> = abstract new (...args: unknown[]) => T;
type Done = (error: unknown, user?: unknown, info?: unknown) => void;
type StrategyConstructor = Constructor<passport.Strategy>;
type StrategyInstance = passport.Strategy & {
  validate?: (...args: unknown[]) => unknown;
};

const strategyClassRegistry = new Map<string, StrategyConstructor>();
const strategyInstanceRegistry = new Map<string, StrategyInstance>();
const registeredNames = new Set<string>();

export interface PassportStrategyMixin<TValidationResult> {
  validate(...args: unknown[]): Promise<TValidationResult> | TValidationResult;
}

export function PassportStrategy<
  TBase extends Constructor,
  TValidationResult = unknown,
>(Strategy: TBase, name?: string) {
  const BaseStrategy = Strategy as unknown as Constructor<passport.Strategy>;

  abstract class StrategyWithMixin
    extends BaseStrategy
    implements PassportStrategyMixin<TValidationResult>
  {
    public abstract validate(
      ...args: unknown[]
    ): Promise<TValidationResult> | TValidationResult;

    constructor(...args: unknown[]) {
      const callback = async (...params: unknown[]) => {
        const done = params[params.length - 1];
        if (typeof done !== "function") {
          throw new Error(
            "Passport strategy callback is missing done function",
          );
        }

        const doneFn = done as Done;

        try {
          const validateArgs = params.slice(0, -1);
          const user = await this.validate(...validateArgs);
          doneFn(null, user);
        } catch (error) {
          doneFn(error);
        }
      };

      super(...args, callback);
      if (name) {
        strategyInstanceRegistry.set(name, this as StrategyInstance);
        passport.use(name, this as passport.Strategy);
      } else {
        passport.use(this as passport.Strategy);
      }
    }
  }

  if (name) {
    if (registeredNames.has(name)) {
      throw new Error(`Passport strategy "${name}" is already registered`);
    }
    registeredNames.add(name);
    strategyClassRegistry.set(
      name,
      StrategyWithMixin as AbstractConstructor<passport.Strategy> as StrategyConstructor,
    );
  }

  return StrategyWithMixin as AbstractConstructor<
    PassportStrategyMixin<TValidationResult>
  > as Constructor<PassportStrategyMixin<TValidationResult>>;
}

export function getRegisteredStrategyClass(
  name: string,
): StrategyConstructor | undefined {
  return strategyClassRegistry.get(name);
}

export function getRegisteredStrategyInstance(
  name: string,
): StrategyInstance | undefined {
  return strategyInstanceRegistry.get(name);
}

export function clearStrategyRegistries(): void {
  strategyClassRegistry.clear();
  strategyInstanceRegistry.clear();
  registeredNames.clear();
}
