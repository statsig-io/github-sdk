import * as core from "@actions/core"
import Evaluator from "./evaluator";
import Utils from "./utils";

async function run() {
  try {
    const inputs = Utils.getInputs();
    await Evaluator.evaluate(inputs);
  } catch (e: unknown) {
    core.setFailed((e as Error).message)
  }
}
run();
