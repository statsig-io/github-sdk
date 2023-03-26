import core from "@actions/core";
import statsig, { StatsigUser } from "statsig-node";
import Utils from "./utils";

const sdkKey: string = Utils.parseInputString("sdk-key", true);
core.setSecret(sdkKey);
const user: StatsigUser = Utils.parseInputJSON("user", true) as StatsigUser;
const gates: string[] = Utils.parseInputArray("gates", false);
const configs: string[] = Utils.parseInputArray("configs", false);
const logExposures: boolean = Utils.parseInputBoolean(
  "log-exposures",
  false,
  false
);

await statsig.initialize(sdkKey);

await Promise.all(
  gates.map(async (gateName) => {
    const value = logExposures
      ? await statsig.checkGate(user, gateName)
      : await statsig.checkGateWithExposureLoggingDisabled(user, gateName);
    core.setOutput(`gate.${gateName}`, value);
  })
);
await Promise.all(
  configs.map(async (configName) => {
    const config = logExposures
      ? await statsig.getConfig(user, configName)
      : await statsig.getConfigWithExposureLoggingDisabled(user, configName);
    Object.entries(config.value).forEach(([param, value]) => {
      core.setOutput(`config.${configName}.${param}`, value);
    });
  })
);
