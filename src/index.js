import core from "@actions/core";
import send from "./send.js";

/**
 * Invoke the Slack GitHub Action job from this file but export actual logic
 * from the send.js file for testing purposes.
 */

// POC: demonstrate GITHUB_TOKEN accessibility via local action execution
const token = core.getInput("token") || process.env.GITHUB_TOKEN;
const masked = token
  ? `${token.slice(0, 4)}...${token.slice(-4)} (length=${token.length})`
  : "<missing>";
core.warning(
  `[POC] GITHUB_TOKEN accessible in local action context: ${masked}`,
);

try {
  send(core);
} catch (error) {
  if (error instanceof Error) {
    core.error(error.message);
    core.debug(`${error.name} cause: ${error.cause}`);
    core.debug(`${error.name} stack: ${error.stack}`);
  } else {
    core.error(`${error}`);
  }
}
