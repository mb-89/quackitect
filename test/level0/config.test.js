// The resolver, driven over a fake disk. Three layers stand in memory, a write
// lands in the per-box file, and every ask reads that file again.
// [[spec/guidance/testing]]

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  coerce,
  configOf,
  faultsIn,
  flatten,
  keyOf,
  keysOf,
  LOCAL,
  TRACKED,
  varOf,
} from "../../.claude/skills/level0/lib/config.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";

const SCHEMA = {
  type: "object",
  required: ["stop", "log"],
  properties: {
    comment: { type: "string" },
    stop: {
      type: "object",
      required: ["enabled", "mostInARow"],
      properties: {
        comment: { type: "string" },
        enabled: { type: "boolean" },
        mostInARow: { type: "number" },
      },
    },
    log: {
      type: "object",
      required: ["level"],
      properties: { level: { type: "string" } },
    },
  },
};

const TREE = {
  comment: "what the team ships",
  stop: { comment: "the tooth", enabled: true, mostInARow: 3 },
  log: { level: "info" },
};

function resolver(seed = {}, env = {}) {
  const files = fakeDisk({
    "spec/config/level0.schema.json": JSON.stringify(SCHEMA),
    "spec/config/level0.json": JSON.stringify(TREE),
    ...seed,
  });
  const it = configOf({
    read: async (path) => files.read(path),
    write: async (path, text) => files.write(path, text),
    makeDir: async (path) => files.makeDir(path),
    readEnv: async (names) => {
      const said = {};
      for (const name of names) said[name] = env[name] ?? "";
      return said;
    },
  });
  return { it, files };
}

test("a value comes back from the tracked file, which names itself", async () => {
  const { it } = resolver();

  assert.equal(await it.ask("stop.mostInARow"), 3);
  assert.equal(await it.layerOf("stop.mostInARow"), TRACKED);
  assert.equal(await it.ask("stop.comment"), undefined, "a comment is no key");
});

test("the environment beats the tracked file, and says so", async () => {
  const { it } = resolver({}, { SE_STOP_MOST_IN_A_ROW: "7" });

  assert.equal(await it.ask("stop.mostInARow"), 7, "the text lands as a number");
  assert.equal(await it.layerOf("stop.mostInARow"), "SE_STOP_MOST_IN_A_ROW");
});

test("the per-box file beats the environment", async () => {
  const { it } = resolver(
    { [LOCAL]: JSON.stringify({ stop: { mostInARow: 9 } }) },
    { SE_STOP_MOST_IN_A_ROW: "7" },
  );

  assert.equal(await it.ask("stop.mostInARow"), 9);
  assert.equal(await it.layerOf("stop.mostInARow"), LOCAL);
  assert.equal(await it.ask("log.level"), "info", "the layer under it stands");
});

test("a key only the per-box file names still resolves", async () => {
  const { it } = resolver({ [LOCAL]: JSON.stringify({ later: { key: 4 } }) });

  assert.equal(await it.ask("later.key"), 4);
  assert.equal(await it.layerOf("later.key"), LOCAL);
});

test("an unreadable per-box file leaves every other layer standing", async () => {
  const { it } = resolver({ [LOCAL]: "{ this is no json" }, { SE_LOG_LEVEL: "warn" });

  assert.equal(await it.ask("stop.enabled"), true);
  assert.equal(await it.ask("log.level"), "warn");
});

test("a write to the per-box file reaches the next ask", async () => {
  const { it, files } = resolver();
  assert.equal(await it.ask("stop.mostInARow"), 3);

  await it.write("stop.mostInARow", "5");

  assert.equal(await it.ask("stop.mostInARow"), 5, "the next ask reads the file");
  assert.equal(await it.layerOf("stop.mostInARow"), LOCAL);
  assert.deepEqual(JSON.parse(files.read(LOCAL)), { stop: { mostInARow: 5 } });
});

test("a write makes the folder where the file stands missing", async () => {
  const { it, files } = resolver();
  await it.write("log.level", "warn");

  assert.equal(files.exists(".se"), true);
  assert.equal(await it.ask("log.level"), "warn");
});

test("a second write keeps the key beside it", async () => {
  const { it, files } = resolver();
  await it.write("stop.enabled", "false");
  await it.write("log.level", "error");

  assert.deepEqual(JSON.parse(files.read(LOCAL)), {
    stop: { enabled: false },
    log: { level: "error" },
  });
});

test("a write the schema knows no type for lands as the text", async () => {
  const { it } = resolver();
  await it.write("later.key", "4");

  assert.equal(await it.ask("later.key"), "4");
});

test("every key stands beside its value and its layer", async () => {
  const { it } = resolver(
    { [LOCAL]: JSON.stringify({ log: { level: "warn" } }) },
    { SE_STOP_ENABLED: "false" },
  );

  assert.deepEqual(await it.all(), [
    { key: "log.level", value: "warn", layer: LOCAL },
    { key: "stop.enabled", value: false, layer: "SE_STOP_ENABLED" },
    { key: "stop.mostInARow", value: 3, layer: TRACKED },
  ]);
});

test("the schema refuses a tracked file missing a field", async () => {
  const missing = { stop: { enabled: true }, log: { level: "info" } };
  const { it } = resolver({ "spec/config/level0.json": JSON.stringify(missing) });

  assert.deepEqual(await it.faults(), ["stop.mostInARow is missing"]);
});

test("the schema refuses a field carrying another type", async () => {
  const wrong = { stop: { enabled: "yes", mostInARow: 3 }, log: { level: "info" } };
  const { it } = resolver({ "spec/config/level0.json": JSON.stringify(wrong) });

  assert.deepEqual(await it.faults(), [
    "stop.enabled carries a string, and the schema says boolean",
  ]);
});

test("the schema passes a whole file, and reads every key out of it", () => {
  assert.deepEqual(faultsIn(SCHEMA, flatten(TREE)), []);
  assert.deepEqual(
    keysOf(SCHEMA).map((one) => one.key),
    ["stop.enabled", "stop.mostInARow", "log.level"],
  );
});

// [[spec/design_output/config#a-variable-names-a-key]]
test("a key names one variable, and that variable names the key back", () => {
  const both = [
    ["stop.mostInARow", "SE_STOP_MOST_IN_A_ROW"],
    ["judge.maxSpans", "SE_JUDGE_MAX_SPANS"],
    ["log.level", "SE_LOG_LEVEL"],
    ["names.words", "SE_NAMES_WORDS"],
  ];
  for (const [key, name] of both) {
    assert.equal(varOf(key), name, `${key} reads ${name}`);
    assert.equal(keyOf(name), key, `${name} names ${key}`);
  }
});

test("a variable outside this mapping names no key", () => {
  assert.equal(keyOf("CLAUDE_CODE_REMOTE"), "");
  assert.equal(keyOf("SE_CLOUD"), "");
});

test("a text coerces to the type the schema says", () => {
  assert.equal(coerce("5", "number"), 5);
  assert.equal(coerce("5", "string"), "5", "a string type keeps the text");
  assert.equal(coerce("true", "boolean"), true);
  assert.equal(coerce("false", "boolean"), false);
  assert.equal(coerce("haiku", "number"), "haiku", "no number reads as the text");
  assert.equal(coerce("5", undefined), "5", "no type reads as the text");
});

test("a flat reading skips a comment and holds every leaf", () => {
  assert.deepEqual([...flatten(TREE)], [
    ["stop.enabled", true],
    ["stop.mostInARow", 3],
    ["log.level", "info"],
  ]);
});
