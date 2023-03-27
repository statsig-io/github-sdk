import Evaluator from "../evaluator";

test("example", async () => {
  const inputs = {
    sdkKey: process.env.TEST_SDK_KEY ?? "secret-",
    user: { userID: "test123", email: "test123@statsig.com" },
    gates: ["always_pass", "always_fail", "statsig_email"],
    configs: ["statsig_pets"],
    logExposures: false,
  };
  await Evaluator.evaluate(inputs);
});
