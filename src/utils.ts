import * as core from "@actions/core";
import type { StatsigUser, LogEventObject } from "statsig-node";

export type Inputs = {
  sdkKey: string;
  user: StatsigUser;
  environment: string;
  gates: string[];
  configs: string[];
  experiments: string[];
  logExposures: boolean;
  events: LogEventObject[];
};

export default class Utils {
  public static getInputs(): Inputs {
    const sdkKey: string = this.parseInputString("sdk-key", true);
    core.setSecret(sdkKey);
    const user: StatsigUser = this.parseInputJSON("user", true) as StatsigUser;
    const environment = this.parseInputString("environment");
    const gates: string[] = this.parseInputArray("gates");
    const configs: string[] = this.parseInputArray("configs");
    const experiments: string[] = this.parseInputArray("experiments");
    const logExposures: boolean = this.parseInputBoolean("log-exposures");
    const eventsRaw: Partial<LogEventObject>[] =
      this.parseInputArrayOfJSON("events");
    const events: LogEventObject[] = eventsRaw
      .filter((event) => event.eventName != null)
      .map((event) => {
        if (!event.user) {
          event.user = user;
        }
        return event;
      }) as LogEventObject[];
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
      if (defaultValue === undefined) {
        core.setFailed(`Invalid Input (${key}): ${(e as Error).message}`);
      }
    }
    return defaultValue;
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
