import core from "@actions/core";

/**
 * SlackError is a custom error wrapper for known errors of Slack GitHub Action.
 */
export default class SlackError extends Error {
  /**
   * @typedef Options
   * @property {Error} [cause] - thrown exception of this error.
   */

  /**
   * @param {core} _core - GitHub Actions core utilities.
   * @param {any} error - The error message to throw.
   * @param {Options} options - configurations of erroring.
   */
  constructor(_core, error, options = {}) {
    if (error instanceof Error) {
      super(error.message, { cause: options.cause });
    } else {
      super(error, { cause: options.cause });
    }
    this.name = "SlackError";
    if (error.stack) {
      this.stack = error.stack;
    }
  }
}