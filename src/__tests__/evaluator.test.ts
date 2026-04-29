import * as core from "@actions/core";
import { Statsig, StatsigUser } from "@statsig/statsig-node-core";
import Evaluator from "../evaluator";
import type { Inputs } from "../utils";

jest.mock("@actions/core", () => ({
  group: jest.fn(async (_name: string, callback: () => Promise<void>) =>
    callback()
  ),
  setOutput: jest.fn(),
}));

jest.mock("@statsig/statsig-node-core", () => ({
  Statsig: jest.fn().mockImplementation(() => ({
    initialize: jest.fn(async () => ({ isSuccess: true })),
    checkGate: jest.fn(
      (
        _user: unknown,
        _name: string,
        options?: { disableExposureLogging?: boolean }
      ) =>
      options?.disableExposureLogging ? false : true
    ),
    getDynamicConfig: jest.fn(
      (
        _user: unknown,
        _name: string,
        options?: { disableExposureLogging?: boolean }
      ) => ({
        value: { color: options?.disableExposureLogging ? "green" : "blue" },
      })
    ),
    getExperiment: jest.fn(
      (
        _user: unknown,
        _name: string,
        options?: { disableExposureLogging?: boolean }
      ) => ({
        value: { variant: options?.disableExposureLogging ? "B" : "A" },
      })
    ),
    logEvent: jest.fn(),
    shutdown: jest.fn(async () => undefined),
  })),
  StatsigUser: jest.fn().mockImplementation((args: unknown) => args),
}));

const mockedCore = jest.mocked(core);
const MockedStatsig = jest.mocked(Statsig);

function makeInputs(logExposures: boolean): Inputs {
  const user = new StatsigUser({ userID: "test-user" });
  return {
    sdkKey: "secret-key",
    user,
    environment: "production",
    gates: ["sample_gate"],
    configs: ["sample_config"],
    experiments: ["sample_experiment"],
    logExposures,
    events: [{ eventName: "sample_event", user }],
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

function getStatsigInstance() {
  return MockedStatsig.mock.results[0]?.value;
}

test("evaluates through the core sdk methods", async () => {
  await Evaluator.evaluate(makeInputs(true));

  expect(MockedStatsig).toHaveBeenCalledWith("secret-key", {
    environment: "production",
  });
  expect(getStatsigInstance().initialize).toHaveBeenCalledTimes(1);
  expect(getStatsigInstance().checkGate).toHaveBeenCalledTimes(1);
  expect(getStatsigInstance().getDynamicConfig).toHaveBeenCalledTimes(1);
  expect(getStatsigInstance().getExperiment).toHaveBeenCalledTimes(1);
  expect(getStatsigInstance().logEvent).toHaveBeenCalledTimes(1);
  expect(getStatsigInstance().shutdown).toHaveBeenCalledTimes(1);
  expect(mockedCore.setOutput).toHaveBeenCalledWith("gate::sample_gate", true);
  expect(mockedCore.setOutput).toHaveBeenCalledWith(
    "config::sample_config::color",
    "blue"
  );
  expect(mockedCore.setOutput).toHaveBeenCalledWith(
    "experiment::sample_experiment::variant",
    "A"
  );
});

test("fails when core sdk initialization reports failure", async () => {
  MockedStatsig.mockImplementationOnce(
    () =>
      ({
        initialize: jest.fn(async () => ({
          isSuccess: false,
          error: "init failed",
        })),
        checkGate: jest.fn(),
        getDynamicConfig: jest.fn(),
        getExperiment: jest.fn(),
        logEvent: jest.fn(),
        shutdown: jest.fn(async () => undefined),
      }) as never
  );

  await expect(Evaluator.evaluate(makeInputs(true))).rejects.toThrow("init failed");
  expect(getStatsigInstance().checkGate).not.toHaveBeenCalled();
});

test("passes exposure-disabled core options when requested", async () => {
  await Evaluator.evaluate(makeInputs(false));

  expect(getStatsigInstance().checkGate).toHaveBeenCalledWith(
    expect.anything(),
    "sample_gate",
    { disableExposureLogging: true }
  );
  expect(getStatsigInstance().getDynamicConfig).toHaveBeenCalledWith(
    expect.anything(),
    "sample_config",
    { disableExposureLogging: true }
  );
  expect(getStatsigInstance().getExperiment).toHaveBeenCalledWith(
    expect.anything(),
    "sample_experiment",
    { disableExposureLogging: true }
  );
  expect(mockedCore.setOutput).toHaveBeenCalledWith("gate::sample_gate", false);
  expect(mockedCore.setOutput).toHaveBeenCalledWith(
    "config::sample_config::color",
    "green"
  );
  expect(mockedCore.setOutput).toHaveBeenCalledWith(
    "experiment::sample_experiment::variant",
    "B"
  );
});
