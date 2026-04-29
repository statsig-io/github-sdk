import * as core from "@actions/core";
import { Statsig, type StatsigOptions } from "@statsig/statsig-node-core";
import type { Inputs } from "./utils";

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

    const statsig = new Statsig(sdkKey, {
      ...(environment ? { environment } : {}),
    } satisfies StatsigOptions);

    await core.group("Initializing", async () => {
      const result = await statsig.initialize();
      if (!result.isSuccess) {
        throw new Error(result.error ?? "Failed to initialize Statsig");
      }
    });
    await core.group(`Evaluating gates ${gates.join(", ")}`, async () => {
      await Promise.all(
        gates.map(async (gateName) => {
          const result = logExposures
            ? statsig.checkGate(user, gateName)
            : statsig.checkGate(user, gateName, {
                disableExposureLogging: true,
              });

          core.setOutput(`gate::${gateName}`, result);
        })
      );
    });
    await core.group(`Evaluating configs ${configs.join(", ")}`, async () => {
      await Promise.all(
        configs.map(async (configName) => {
          const config = logExposures
            ? statsig.getDynamicConfig(user, configName)
            : statsig.getDynamicConfig(user, configName, {
                disableExposureLogging: true,
              });
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
              ? statsig.getExperiment(user, experimentName)
              : statsig.getExperiment(user, experimentName, {
                  disableExposureLogging: true,
                });
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
          statsig.logEvent(event.user, event.eventName, event.value, event.metadata);
        });
      }
    );
    await statsig.shutdown();
  }
}
