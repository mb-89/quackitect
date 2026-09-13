// The bridgehead forwards. It imports the module vehicle.json names at session
// start, hands every event to the vehicle's hooks in the order they registered,
// and gives the vehicle a hand that reaches the harness noun by noun.
// [[spec/design_output/level0#the-bridgehead-imports-inside-its-folder]]

import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { register } from "../fixtures/bridgehead/hooks/bridgehead.js";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const VEHICLE = join(root, "test", "fixtures", "vehicle", "hooks", "vehicle.js");

function harness() {
  const hooks = new Map();
  const wrote = [];
  const on = (event, filter, handler) => {
    const [when, run] =
      typeof filter === "function" ? [null, filter] : [filter, handler];
    if (!hooks.has(event)) hooks.set(event, []);
    hooks.get(event).push({ when, run });
  };
  const $ = {
    fs: {
      read: async (path) => {
        if (path !== "vehicle.json") throw new Error(`no ${path}`);
        return JSON.stringify({ brand: "probe", hooks: VEHICLE });
      },
      write: async (path, text) => {
        wrote.push(`${path}: ${text}`);
      },
      list: async () => [],
      exists: async () => false,
    },
    process: { run: async () => ({ exitCode: 0, stdout: "", stderr: "" }) },
    command: { run: async () => {} },
    tool: { register: async () => {} },
    model: { classify: async () => "" },
    prompt: { submit: async () => {} },
    session: { messages: async () => [] },
    agent: { spawn: async () => ({}) },
  };
  const fire = (event, e, next = async (later) => ({ passed: later })) => {
    const rows = hooks.get(event) ?? [];
    return rows[0].run($, e, next);
  };
  return { on, $, wrote, fire, hooks };
}

// [[spec/design_output/level0#the-bridgehead-imports-inside-its-folder]]
test("session.start imports the module vehicle.json names, and the vehicle's hook runs on it", async () => {
  const it = harness();
  register(it.on, { brand: "probe" });

  const said = await it.fire("session.start", { reason: "startup" });

  assert.deepEqual(said, { passed: { reason: "startup" } });
  assert.deepEqual(it.wrote, ["seen: start probe"]);
});

test("a filtered hook takes the tool it names, and the plain one takes the rest", async () => {
  const it = harness();
  register(it.on, {});
  await it.fire("session.start", {});

  const denied = await it.fire("tool.call", { tool: "Bash", command: "rm -rf" });
  const passed = await it.fire("tool.call", { tool: "Read", file_path: "a.md" });

  assert.deepEqual(denied, { deny: "no rm -rf" });
  assert.deepEqual(passed, { passed: { tool: "Read", file_path: "a.md", seen: true } });
  assert.deepEqual(it.wrote.slice(1), ["seen: call Read"]);
});

test("turn.complete reaches the vehicle after the harness answers, and a step streams through", async () => {
  const it = harness();
  register(it.on, {});
  await it.fire("session.start", {});

  const ended = await it.fire("turn.complete", { reason: "answer" });
  assert.deepEqual(ended, { passed: { reason: "answer" } });

  const steps = [];
  const stream = it.fire("turn.step", { index: 2 }, async function* (e) {
    yield "a";
    yield "b";
    return { done: e.index };
  });
  for await (const one of stream) steps.push(one);

  assert.deepEqual(steps, ["a", "b"]);
  assert.deepEqual(it.wrote.slice(1), ["seen: end answer", "seen: step 2"]);
});

test("every door the vehicle names stands on the bridgehead with a literal name", () => {
  const it = harness();
  register(it.on, {});

  for (const door of [
    "session.start",
    "tool.call",
    "turn.complete",
    "turn.step",
    "prompt.context",
  ]) {
    assert.ok(it.hooks.has(door), `${door} reaches no hook`);
  }
});

// [[spec/design_output/level0#the-bridgehead-imports-inside-its-folder]]
test("a module the client cannot load leaves a fault on disk, and the session goes on", async () => {
  const it = harness();
  it.$.fs.read = async () =>
    JSON.stringify({ hooks: join(root, "nowhere", "hooks.js") });
  register(it.on, {});

  const said = await it.fire("session.start", { reason: "startup" });

  assert.deepEqual(said, { passed: { reason: "startup" } });
  assert.equal(it.wrote.length, 1);
  assert.match(it.wrote[0], /^\.se\/bridgehead\.fault: /);
});
