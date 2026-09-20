// The pull tool's pure half. The argv it hands the shell and the question it
// puts to the judge, read with no harness standing.
// [[spec/design_output/pull#the-checks]]

import assert from "node:assert/strict";
import { test } from "node:test";
import * as lib from "../../.claude/skills/level1/lib/pull.js";
import {
  judgeAsk,
  judgeRefusal,
  PULL_CALL,
  pullSpec,
  sessionOf,
  spawnPromptIn,
} from "../../.claude/skills/level1/lib/pull.js";
import { pullArgvOf } from "../../src/scripts/pull-tool.js";

// The hooks level one registers, keyed by their event. A registration carries a filter between the event and the handler, so the last argument is the handler. [[spec/design_output/pull#the-checks]]
async function hooksHere() {
  const { register } = await import("../../.claude/skills/level1/hooks/level1.js");
  const held = {};
  register((event, ...rest) => {
    held[event] = rest.at(-1);
  }, {});
  return held;
}

// The harness the hook reaches: the files it writes, the tool it registers first, and the lines it says. [[spec/design_output/pull#the-hand-and-the-hold]]
function harness() {
  const wrote = new Map();
  const lines = [];
  return {
    wrote,
    lines,
    $: {
      fs: { write: async (path, text) => void wrote.set(path, text) },
      tool: { register: async () => {} },
      ui: { log: (line) => lines.push(line) },
    },
  };
}

// [[spec/design_output/pull#a-hand-of-its-own]]
test("the wrapper reads the prompt out of a spawn answer, and nothing out of any other", () => {
  const said =
    "spawn\n  a-child at design/review waits for a hand other than box 1.\n  Spawn a hand.\n\nYou are a hand of your own, named helper-2.\n1. Run it.";
  assert.equal(
    spawnPromptIn(said),
    "You are a hand of your own, named helper-2.\n1. Run it.",
  );
  assert.equal(spawnPromptIn("work  a-child at design/draft\n\nprose"), "");
  assert.equal(spawnPromptIn(""), "");
});

// [[spec/design_output/pull#the-hand-out]]
test("the tool's input reads into the same words a person types", () => {
  const tool = (said, ...more) =>
    pullArgvOf(["pull", "--tool", JSON.stringify(said), ...more]);
  assert.deepEqual(tool({}), ["pull"]);
  assert.deepEqual(tool({ ticket: "a-child", verdict: "pass" }), [
    "pull",
    "a-child",
    "--pass",
  ]);
  assert.deepEqual(tool({ ticket: "a-child", verdict: "fail", reason: "thin" }), [
    "pull",
    "a-child",
    "--fail",
    "thin",
  ]);
  assert.deepEqual(tool({ ticket: "a-child", verdict: "became", reason: "a-group" }), [
    "pull",
    "a-child",
    "--became",
    "a-group",
  ]);
  assert.deepEqual(
    tool({ ticket: "a-child", verdict: "pass", fields: { approach: "x" } }),
    ["pull", "a-child", "--pass", "--fields", '{"approach":"x"}'],
  );
  assert.deepEqual(tool({ ticket: "a-child", verdict: "pass" }, "--judge"), [
    "pull",
    "a-child",
    "--judge",
  ]);
  assert.deepEqual(pullArgvOf(["pull", "a-child", "--pass"]), [
    "pull",
    "a-child",
    "--pass",
  ]);
  assert.deepEqual(pullArgvOf(["pull", "--tool", "not json"]), ["pull"]);
  assert.equal(PULL_CALL, "mcp__level1__pull");
  assert.equal(pullSpec().name, "pull");
  assert.deepEqual(pullSpec().inputSchema.properties.verdict.enum, [
    "pass",
    "fail",
    "became",
  ]);
});

// [[spec/design_output/pull#the-checks]]
test("the judge's question carries every rule numbered and the evidence whole", () => {
  const ask = judgeAsk("The approach.\nchecked:\n- one", [
    "Say what is.",
    "Put the bottom line first.",
  ]);
  assert.match(ask, /1\. Say what is\.\n2\. Put the bottom line first\./);
  assert.match(ask, /Evidence:\nThe approach\.\nchecked:\n- one$/);
  assert.match(
    judgeRefusal("the judge answers breaks over design/draft"),
    /^refused\n/,
  );
});

// [[spec/design_output/pull#the-hand-and-the-hold]]
test("the library beside the hook owns the one spelling of the session file", () => {
  assert.equal(
    lib.SESSION,
    ".se/.runtime/session.json",
    "the hook imports the path, so one copy stands",
  );
});

// [[spec/design_output/pull#the-hand-and-the-hold]]
test("the session file takes the id every harness this tree meets spells", () => {
  assert.equal(sessionOf({ session: { id: "s7" } }).id, "s7");
  assert.equal(sessionOf({ sessionId: "s8" }).id, "s8");
  assert.equal(sessionOf({ session_id: "s9" }).id, "s9");
});

// [[spec/design_output/pull#the-hand-and-the-hold]]
test("the registered session start writes the file the library names", async () => {
  const held = await hooksHere();
  const box = harness();
  const e = { session_id: "s9", client: "claude-code" };
  await held["session.start"](box.$, e, async (said) => said);
  assert.deepEqual(JSON.parse(box.wrote.get(lib.SESSION) ?? "null"), {
    id: "s9",
    harness: "claude-code",
  });
});

// [[spec/design_output/pull#the-hand-and-the-hold]]
test("an event naming no session writes nothing, and says the hand stands at the box", async () => {
  const held = await hooksHere();
  const box = harness();
  await held["session.start"](box.$, {}, async (said) => said);
  assert.equal(box.wrote.size, 0, "the fake holds no write");
  assert.match(box.lines.join("\n"), /the hand stands at the box/);
});
