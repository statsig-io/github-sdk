import * as core from "@actions/core";
import Utils from "../utils";

jest.mock("@actions/core", () => ({
  getInput: jest.fn(),
  getMultilineInput: jest.fn(),
  getBooleanInput: jest.fn(),
  setFailed: jest.fn(),
  setSecret: jest.fn(),
}));

const mockedCore = jest.mocked(core);

beforeEach(() => {
  jest.clearAllMocks();

  mockedCore.getInput.mockImplementation((key: string) => {
    const values: Record<string, string> = {
      "sdk-key": "secret-key",
      user: '{ "userID": "default-user" }',
      environment: "production",
    };
    return values[key] ?? "";
  });

  mockedCore.getMultilineInput.mockImplementation((key: string) => {
    const values: Record<string, string[]> = {
      gates: ["sample_gate"],
      configs: ["sample_config"],
      experiments: ["sample_experiment"],
      events: ['{ "eventName": "sample_event" }'],
    };
    return values[key] ?? [];
  });

  mockedCore.getBooleanInput.mockReturnValue(false);
});

test("fills a missing event user from the action user", () => {
  const inputs = Utils.getInputs();

  expect(inputs.events).toEqual([
    {
      eventName: "sample_event",
      user: { userID: "default-user" },
    },
  ]);
  expect(mockedCore.setSecret).toHaveBeenCalledWith("secret-key");
});

test("rejects malformed required user JSON", () => {
  mockedCore.getInput.mockImplementation((key: string) => {
    if (key === "user") {
      return "{";
    }
    return key === "sdk-key" ? "secret-key" : "";
  });

  expect(() => Utils.getInputs()).toThrow("Invalid Input (user)");
});
