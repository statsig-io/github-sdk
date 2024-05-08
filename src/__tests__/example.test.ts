import Evaluator from "../evaluator";
import { Inputs } from "../utils";

test("example", async () => {
  const user = { userID: "test-local", email: "test-local@statsig.com" };
  const inputs: Inputs = {
    sdkKey: "secret-Tpyw9SiCPwilEpeabun0kKRxiGaHHGQrHs9tbzzlGcy", //process.env.TEST_SDK_KEY ?? "secret-",
    environment: 'test',
    user: user,
    gates: ["test_wink", "always_fail", "statsig_email"],
    configs: ["statsig_pets"],
    experiments: ["test_experiment"],
    logExposures: true,
    events: [
      {
        eventName: "example_event",
        user: user,
        value: "some string",
        metadata: { "some key": "some value" },
      },
    ],
  };
  await Evaluator.evaluate(inputs);
});
