import path from "node:path";
import core from "@actions/core";
import { assert } from "chai";
import Config from "../src/config.js";
import Content from "../src/content.js";
import send from "../src/send.js";
import { mocks } from "./index.spec.js";

/**
 * Confirm values from the action input or environment variables are gathered
 */
describe("content", () => {
  beforeEach(() => {
    mocks.reset();
  });

  describe("get", () => {
    it("errors if both a payload and file path are provided", async () => {
      mocks.core.getInput.withArgs("method").returns("chat.postMessage");
      mocks.core.getInput.withArgs("token").returns("xoxb-example");
      mocks.core.getInput.withArgs("payload").returns(`"message"="hello"`);
      mocks.core.getInput.withArgs("payload-file-path").returns("example.json");
      try {
        await send(mocks.core);
        assert.fail("Failed to throw for invalid input");
      } catch {
        assert.include(
          mocks.core.setFailed.lastCall.firstArg,
          "Invalid input! Just the payload or payload file path is required.",
        );
      }
    });
  });

  describe("content", async () => {
    it("accepts and parses yaml as a valid payload format", async () => {
      mocks.core.getInput.withArgs("method").returns("chat.postMessage");
      mocks.core.getInput.withArgs("token").returns("xoxb-example");
      mocks.core.getInput.withArgs("payload").returns(`
          message: "this is wrapped"
          channel: "C0123456789"
      `);
      const config = new Config(mocks.core);
      const expected = {
        message: "this is wrapped",
        channel: "C0123456789",
      };
      assert.deepEqual(config.content.values, expected);
    });

    it("accepts and parses complete json as payload input", async () => {
      mocks.core.getInput.withArgs("method").returns("chat.postMessage");
      mocks.core.getInput.withArgs("token").returns("xoxb-example");
      mocks.core.getInput.withArgs("payload").returns(`{
          "message": "this is wrapped",
          "channel": "C0123456789"
        }
      `);
      const config = new Config(mocks.core);
      const expected = {
        message: "this is wrapped",
        channel: "C0123456789",
      };
      assert.deepEqual(config.content.values, expected);
    });

    it("wraps incomplete payload in braces for valid JSON", async () => {
      mocks.core.getInput.withArgs("method").returns("chat.postMessage");
      mocks.core.getInput.withArgs("token").returns("xoxb-example");
      mocks.core.getInput.withArgs("payload").returns(`
        "message": "LGTM!",
        "channel": "C0123456789",
        "blocks": [
          {
            "type": "section",
            "text": {
              "text": "LGTM! :+1:"
            }
          }
        ]
      `);
      const config = new Config(mocks.core);
      const expected = {
        message: "LGTM!",
        channel: "C0123456789",
        blocks: [
          {
            type: "section",
            text: {
              text: "LGTM! :+1:",
            },
          },
        ],
      };
      assert.deepEqual(config.content.values, expected);
    });

    it("fails if no payload content is provided as input", async () => {
      /**
       * @type {Config}
       */
      const config = {
        core: core,
        inputs: {
          payloadFilePath: "unknown.json",
        },
      };
      try {
        new Content().getContentPayload(config);
        assert.fail("Failed to throw for missing payload content");
      } catch (err) {
        assert.include(
          mocks.core.setFailed.lastCall.firstArg,
          "Invalid input! No payload content found",
        );
      }
    });

    it("fails if the provided input payload is invalid JSON", async () => {
      mocks.core.getInput.withArgs("method").returns("chat.postMessage");
      mocks.core.getInput.withArgs("token").returns("xoxb-example");
      mocks.core.getInput.withArgs("payload").returns("{");
      try {
        await send(mocks.core);
        assert.fail("Failed to throw for invalid JSON");
      } catch {
        assert.include(
          mocks.core.setFailed.lastCall.firstArg.toString(),
          "Invalid input! Failed to parse contents of the provided payload",
        );
      }
    });
  });

  describe("file", async () => {
    it("parses JSON from a known file without replacements", async () => {
      mocks.core.getInput.withArgs("method").returns("chat.postMessage");
      mocks.core.getInput.withArgs("token").returns("xoxb-example");
      mocks.core.getInput.withArgs("payload-file-path").returns("example.json");
      mocks.fs.readFileSync
        .withArgs(path.resolve("example.json"), "utf-8")
        .returns(`{
            "message": "drink water",
            "channel": "C6H12O6H2O2"
          }`);
      const config = new Config(mocks.core);
      const expected = {
        message: "drink water",
        channel: "C6H12O6H2O2",
      };
      assert.deepEqual(config.content.values, expected);
    });

    it("parses YAML from a known file without replacements", async () => {
      mocks.core.getInput.withArgs("method").returns("chat.postMessage");
      mocks.core.getInput.withArgs("token").returns("xoxb-example");
      mocks.core.getInput.withArgs("payload-file-path").returns("example.yml");
      mocks.fs.readFileSync
        .withArgs(path.resolve("example.yml"), "utf-8")
        .returns(`
            message: "drink water"
            channel: "C6H12O6H2O2"
          `);
      const config = new Config(mocks.core);
      const expected = {
        message: "drink water",
        channel: "C6H12O6H2O2",
      };
      assert.deepEqual(config.content.values, expected);
    });

    it("parses YAML from the extended file extension", async () => {
      mocks.core.getInput.withArgs("method").returns("chat.postMessage");
      mocks.core.getInput.withArgs("token").returns("xoxb-example");
      mocks.core.getInput.withArgs("payload-file-path").returns("example.yaml");
      mocks.fs.readFileSync
        .withArgs(path.resolve("example.yaml"), "utf-8")
        .returns(`
            message: "drink coffee"
            channel: "C0FFEEEEEEEE"
          `);
      const config = new Config(mocks.core);
      const expected = {
        message: "drink coffee",
        channel: "C0FFEEEEEEEE",
      };
      assert.deepEqual(config.content.values, expected);
    });

    it("fails if no payload file is provided in the input", async () => {
      /**
       * @type {Config}
       */
      const config = {
        core: core,
        inputs: {
          payload: "LGTM",
        },
      };
      try {
        new Content().getContentPayloadFilePath(config);
        assert.fail("Failed to throw for the wrong payload type");
      } catch (err) {
        assert.include(
          mocks.core.setFailed.lastCall.firstArg,
          "Invalid input! No payload found for content",
        );
      }
    });

    it("fails to parse a file path that does not exist", async () => {
      mocks.core.getInput.withArgs("method").returns("chat.postMessage");
      mocks.core.getInput.withArgs("token").returns("xoxb-example");
      mocks.core.getInput.withArgs("payload-file-path").returns("unknown.json");
      try {
        await send(mocks.core);
        assert.fail("Failed to throw for nonexistent files");
      } catch (err) {
        assert.include(
          mocks.core.setFailed.lastCall.firstArg.toString(),
          "Invalid input! Failed to parse contents of the provided payload file",
        );
      }
    });

    it("fails to parse a file with an unknown extension", async () => {
      mocks.core.getInput.withArgs("method").returns("chat.postMessage");
      mocks.core.getInput.withArgs("token").returns("xoxb-example");
      mocks.core.getInput.withArgs("payload-file-path").returns("unknown.md");
      try {
        await send(mocks.core);
        assert.fail("Failed to throw for nonexistent files");
      } catch (err) {
        assert.include(
          mocks.core.setFailed.lastCall.firstArg.toString(),
          "Invalid input! Failed to parse contents of the provided payload file",
        );
      }
    });
  });

  describe("flatten", () => {
    it("flattens nested payloads if a delimiter is provided", async () => {
      mocks.core.getInput.withArgs("method").returns("chat.postMessage");
      mocks.core.getInput.withArgs("token").returns("xoxb-example");
      mocks.core.getInput.withArgs("payload").returns(`
        "apples": "tree",
        "bananas": {
          "truthiness": true
        }
      `);
      mocks.core.getInput.withArgs("payload-delimiter").returns("_");
      const config = new Config(mocks.core);
      const expected = {
        apples: "tree",
        bananas_truthiness: "true",
      };
      assert.deepEqual(config.content.values, expected);
    });
  });
});
