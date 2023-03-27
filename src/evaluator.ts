import * as core from "@actions/core";
import statsig from "statsig-node";
import type { Inputs } from "./utils";

export default class Evaluator {
  public static async evaluate(inputs: Inputs) {
    const { sdkKey, user, gates, configs, logExposures } = inputs;
    await core.group("Initializing", async () => {
      await statsig.initialize(sdkKey);
    });
    await core.group(`Evaluating gates ${gates.join(", ")}`, async () => {
      await Promise.all(gates.map(async (gateName) => {
        const result = logExposures
          ? await statsig.checkGate(user, gateName)
          : await statsig.checkGateWithExposureLoggingDisabled(user, gateName);
        
        core.setOutput(`gate_${gateName}`, result);
      }));
    });
    await core.group(`Evaluating configs ${configs.join(", ")}`, async () => {
      await Promise.all(configs.map(async (configName) => {
        const config = logExposures
          ? await statsig.getConfig(user, configName)
          : await statsig.getConfigWithExposureLoggingDisabled(user, configName);
        Object.entries(config.value).forEach(([param, value]) => {
          core.setOutput(`config_${configName}_${param}`, value);
        });
      }));
    });
    statsig.shutdown();
  }
}
