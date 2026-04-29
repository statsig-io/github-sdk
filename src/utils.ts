import * as core from "@actions/core";
import {
  StatsigUser,
  type StatsigUserArgs,
} from "@statsig/statsig-node-core";

type ActionEventInput = {
  eventName: string;
  user?: StatsigUser | StatsigUserArgs;
  value?: string | number | null;
  metadata?: Record<string, string | number | boolean | null | undefined>;
};

type ConcreteStatsigUserArgs =
  | (StatsigUserArgs & { userID: string })
  | (StatsigUserArgs & { customIDs: Record<string, string> });

export type ActionEvent = {
  eventName: string;
  user: StatsigUser;
  value?: string | number | null;
  metadata?: Record<string, string | number | boolean | null | undefined>;
};

export type Inputs = {
  sdkKey: string;
  user: StatsigUser;
  environment: string;
  gates: string[];
  configs: string[];
  experiments: string[];
  logExposures: boolean;
  events: ActionEvent[];
};

export default class Utils {
  public static getInputs(): Inputs {
    const sdkKey: string = this.parseInputString("sdk-key", true);
    core.setSecret(sdkKey);
    const user = this.parseStatsigUser(this.parseInputJSON("user", true));
    const environment = this.parseInputString("environment");
    const gates: string[] = this.parseInputArray("gates");
    const configs: string[] = this.parseInputArray("configs");
    const experiments: string[] = this.parseInputArray("experiments");
    const logExposures: boolean = this.parseInputBoolean("log-exposures");
    const eventsRaw: Partial<ActionEventInput>[] =
      this.parseInputArrayOfJSON("events");
    const events: ActionEvent[] = eventsRaw
      .filter((event) => event.eventName != null)
      .map((event) => {
        return {
          eventName: event.eventName as string,
          user: event.user ? this.parseStatsigUser(event.user) : user,
          value: event.value,
          metadata: event.metadata,
        };
      });
    return {
      sdkKey,
      environment,
      user,
      gates,
      configs,
      experiments,
      logExposures,
      events,
    };
  }

  private static parseInputString(
    key: string,
    required: boolean = false,
    defaultValue: string = ""
  ): string {
    try {
      return core.getInput(key, { required: required });
    } catch (e: unknown) {
      core.setFailed(`Invalid Input (${key}): ${(e as Error).message}`);
    }
    return defaultValue;
  }

  private static parseInputJSON(
    key: string,
    required: boolean = false,
    defaultValue: object = {}
  ): object {
    const input = this.parseInputString(key, required);
    try {
      return JSON.parse(input);
    } catch (e: unknown) {
      if (required) {
        throw new Error(`Invalid Input (${key}): ${(e as Error).message}`);
      }
    }
    return defaultValue;
  }

  private static parseStatsigUser(input: object): StatsigUser {
    if (input instanceof StatsigUser) {
      return input;
    }

    const args = input as StatsigUserArgs;
    if (typeof args.userID === "string") {
      return new StatsigUser(args as ConcreteStatsigUserArgs);
    }

    if (args.customIDs && Object.keys(args.customIDs).length > 0) {
      return new StatsigUser(args as ConcreteStatsigUserArgs);
    }

    throw new Error("Invalid Input (user): expected userID or customIDs");
  }

  private static parseInputArray(
    key: string,
    required: boolean = false,
    defaultValue: string[] = []
  ): string[] {
    try {
      return core.getMultilineInput(key, { required: required });
    } catch (e: unknown) {
      core.setFailed(`Invalid Input (${key}): ${(e as Error).message}`);
    }
    return defaultValue;
  }

  private static parseInputArrayOfJSON<T>(
    key: string,
    required: boolean = false,
    defaultValue: T[] = []
  ): T[] {
    try {
      return core
        .getMultilineInput(key, { required: required })
        .map((value) => JSON.parse(value) as T);
    } catch (e: unknown) {
      core.setFailed(`Invalid Input (${key}): ${(e as Error).message}`);
    }
    return defaultValue;
  }

  private static parseInputBoolean(
    key: string,
    required: boolean = false,
    defaultValue: boolean = false
  ): boolean {
    try {
      return core.getBooleanInput(key, { required: required });
    } catch (e: unknown) {
      core.setFailed(`Invalid Input (${key}): ${(e as Error).message}`);
    }
    return defaultValue;
  }
}
