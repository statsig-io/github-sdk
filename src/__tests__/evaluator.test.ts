import * as core from "@actions/core";
import statsig from "statsig-node";
import Evaluator from "../evaluator";
import type { Inputs } from "../utils";

jest.mock("@actions/core", () => ({
  group: jest.fn(async (_name: string, callback: () => Promise<void>) =>
    callback()
  ),
  setOutput: jest.fn(),
}));

jest.mock("statsig-node/dist/utils/core", () => ({
  getSDKVersion: jest.fn(),
  getSDKType: jest.fn(),
}));

jest.mock("statsig-node", () => ({
  __esModule: true,
  default: {
    initialize: jest.fn(async () => undefined),
    checkGate: jest.fn(() => true),
    checkGateWithExposureLoggingDisabled: jest.fn(() => false),
    getConfig: jest.fn(() => ({ value: { color: "blue" } })),
    getConfigWithExposureLoggingDisabled: jest.fn(() => ({
      value: { color: "green" },
    })),
    getExperiment: jest.fn(() => ({ value: { variant: "A" } })),
    getExperimentWithExposureLoggingDisabled: jest.fn(() => ({
      value: { variant: "B" },
    })),
    logEventObject: jest.fn(),
    shutdown: jest.fn(async () => undefined),
  },
}));

const mockedCore = jest.mocked(core);
const mockedStatsig = jest.mocked(statsig);

function makeInputs(logExposures: boolean): Inputs {
  const user = { userID: "test-user" };
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

test("evaluates through the standard legacy sdk methods", async () => {
  await Evaluator.evaluate(makeInputs(true));

  expect(mockedStatsig.initialize).toHaveBeenCalledWith("secret-key", {
    environment: { tier: "production" },
  });
  expect(mockedStatsig.checkGate).toHaveBeenCalledTimes(1);
  expect(mockedStatsig.getConfig).toHaveBeenCalledTimes(1);
  expect(mockedStatsig.getExperiment).toHaveBeenCalledTimes(1);
  expect(mockedStatsig.logEventObject).toHaveBeenCalledTimes(1);
  expect(mockedStatsig.shutdown).toHaveBeenCalledTimes(1);
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

test("uses exposure-disabled legacy sdk methods when requested", async () => {
  await Evaluator.evaluate(makeInputs(false));

  expect(mockedStatsig.checkGateWithExposureLoggingDisabled).toHaveBeenCalledTimes(
    1
  );
  expect(mockedStatsig.getConfigWithExposureLoggingDisabled).toHaveBeenCalledTimes(
    1
  );
  expect(
    mockedStatsig.getExperimentWithExposureLoggingDisabled
  ).toHaveBeenCalledTimes(1);
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
