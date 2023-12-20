import * as core from "@actions/core";

import type { Inputs } from "./utils";
import { StatsigOptions } from "statsig-node";
import statsig from "statsig-node";

export default class Evaluator {
  public static async evaluate(inputs: Inputs) {
    const {
      sdkKey,
      user,
      environment,
      gates,
      configs,
      experiments,
      logExposures,
      events,
    } = inputs;
    await core.group("Initializing", async () => {
      let options: StatsigOptions = {};
      if (environment) {
        options.environment = { tier: environment };
      }
      await statsig.initialize(sdkKey, options);
    });
    await core.group(`Evaluating gates ${gates.join(", ")}`, async () => {
      await Promise.all(
        gates.map(async (gateName) => {
          const result = logExposures
            ? await statsig.checkGateSync(user, gateName)
            : await statsig.checkGateWithExposureLoggingDisabledSync(
                user,
                gateName
              );

          core.setOutput(`gate::${gateName}`, result);
        })
      );
    });
    await core.group(`Evaluating configs ${configs.join(", ")}`, async () => {
      await Promise.all(
        configs.map(async (configName) => {
          const config = logExposures
            ? await statsig.getConfigSync(user, configName)
            : await statsig.getConfigWithExposureLoggingDisabledSync(
                user,
                configName
              );
          Object.entries(config.value).forEach(([param, value]) => {
            core.setOutput(`config::${configName}::${param}`, value);
          });
        })
      );
    });
    await core.group(
      `Evaluating experiments ${experiments.join(", ")}`,
      async () => {
        await Promise.all(
          experiments.map(async (experimentName) => {
            const experiment = logExposures
              ? await statsig.getExperimentSync(user, experimentName)
              : await statsig.getExperimentWithExposureLoggingDisabledSync(
                  user,
                  experimentName
                );
            Object.entries(experiment.value).forEach(([param, value]) => {
              core.setOutput(`experiment::${experimentName}::${param}`, value);
            });
          })
        );
      }
    );
    await core.group(
      `Logging events ${events.map((event) => event.eventName).join(", ")}`,
      async () => {
        events.forEach((event) => {
          statsig.logEventObject(event);
        });
      }
    );
    statsig.shutdown();
  }
}
