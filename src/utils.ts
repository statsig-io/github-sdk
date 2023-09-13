import * as core from "@actions/core";
import type { StatsigUser } from "statsig-node";

export type Inputs = {
  sdkKey: string;
  user: StatsigUser;
  gates: string[];
  configs: string[];
  experiments: string[];
  logExposures: boolean;
};

export default class Utils {
  public static getInputs(): Inputs {
    const sdkKey: string = this.parseInputString("sdk-key", true);
    core.setSecret(sdkKey);
    const user: StatsigUser = this.parseInputJSON("user", true) as StatsigUser;
    const gates: string[] = this.parseInputArray("gates", false);
    const configs: string[] = this.parseInputArray("configs", false);
    const experiments: string[] = this.parseInputArray("experiments", false);
    const logExposures: boolean = this.parseInputBoolean("log-exposures", false);
    return { sdkKey, user, gates, configs, experiments, logExposures };
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
