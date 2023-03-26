import core from "@actions/core";

export default class Utils {
  public static parseInputString(
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

  public static parseInputJSON(
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

  public static parseInputArray(
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

  public static parseInputBoolean(
    key: string,
    required: boolean = false,
    defaultValue: boolean = false,
  ): boolean {
    try {
      return core.getBooleanInput(key, { required: required });
    } catch (e: unknown) {
      core.setFailed(`Invalid Input (${key}): ${(e as Error).message}`);
    }
    return defaultValue;
  }
}
