// Inheritance between the two roots, driven with no disk.
// [[spec/guidance/code/testing]]

import assert from "node:assert/strict";
import test from "node:test";
import { configOf } from "../../.claude/skills/level0/lib/config.js";
import { deeply, layered, stylesIn } from "../../.claude/skills/level0/lib/layer.js";

test("a name the work root repeats replaces the method's", () => {
  const said = layered(
    [
      { name: "voice.md", text: "the method says" },
      { name: "working.md", text: "stands" },
    ],
    [{ name: "voice.md", text: "the work says" }],
  );
  assert.equal(said.length, 2);
  assert.equal(said.find((one) => one.name === "voice.md").text, "the work says");
  assert.equal(said.find((one) => one.name === "voice.md").layer, "work");
  assert.equal(said.find((one) => one.name === "working.md").layer, "method");
});

test("a name the work root alone holds joins the set", () => {
  const said = layered([{ name: "voice.md", text: "a" }], [{ name: "house.md", text: "b" }]);
  assert.deepEqual(
    said.map((one) => one.name),
    ["voice.md", "house.md"],
  );
});

test("a method root standing alone hands its own down", () => {
  assert.equal(layered([{ name: "one.md", text: "a" }], []).length, 1);
  assert.equal(layered([], [{ name: "one.md", text: "a" }])[0].layer, "work");
});

test("a key the work root names wins, and the rest come down", () => {
  const said = deeply({ log: { level: "info" }, stop: { enabled: true } }, { log: { level: "warn" } });
  assert.deepEqual(said, { log: { level: "warn" }, stop: { enabled: true } });
});

const SCHEMA = JSON.stringify({
  properties: {
    log: { type: "object", properties: { level: { type: "string" } } },
    stop: { type: "object", properties: { enabled: { type: "boolean" } } },
  },
});

function configFor(files) {
  return configOf({
    tracked: ["/tools/spec/config/level0.json", "spec/config/level0.json"],
    schema: "/tools/spec/config/level0.schema.json",
    read: async (path) => {
      if (files[path] === undefined) throw new Error(`no such file: ${path}`);
      return files[path];
    },
    write: async () => {},
  });
}

test("the work root's config inherits the method's, key by key", async () => {
  const said = configFor({
    "/tools/spec/config/level0.schema.json": SCHEMA,
    "/tools/spec/config/level0.json": '{"log":{"level":"info"},"stop":{"enabled":true}}',
    "spec/config/level0.json": '{"log":{"level":"warn"}}',
  });

  assert.equal(await said.ask("log.level"), "warn");
  assert.equal(await said.layerOf("log.level"), "spec/config/level0.json");
  assert.equal(await said.ask("stop.enabled"), true);
  assert.equal(await said.layerOf("stop.enabled"), "/tools/spec/config/level0.json");
});

test("a project naming nothing takes the method's whole config", async () => {
  const said = configFor({
    "/tools/spec/config/level0.schema.json": SCHEMA,
    "/tools/spec/config/level0.json": '{"log":{"level":"info"}}',
  });
  assert.equal(await said.ask("log.level"), "info");
  assert.match(await said.text(), /"level": "info"/);
});

test("the assembled config names the styles beside it", () => {
  const said = stylesIn("# a note\nStylesPath = spec/config/styles\nMinAlertLevel = suggestion\n", "styles");
  assert.match(said, /^StylesPath = styles$/m);
  assert.equal(said.includes("spec/config/styles"), false);
  assert.match(said, /MinAlertLevel/);

  const bare = stylesIn("MinAlertLevel = suggestion\n", "styles");
  assert.match(bare, /^StylesPath = styles$/m);
});
