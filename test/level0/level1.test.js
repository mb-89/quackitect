// The pull tool's pure half. The argv it hands the shell, the spawn and the
// session, read with no harness standing.
// [[spec/design_output/pull#the-hand-out]]

import assert from "node:assert/strict";
import { test } from "node:test";
import * as lib from "../../.claude/skills/level0/lib/pull.js";
import {
  PULL_CALL,
  pullSpec,
  sessionOf,
  spawnPromptIn,
} from "../../.claude/skills/level0/lib/pull.js";
import { pullArgvOf } from "../../src/scripts/pull-tool.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";

// The hooks level one registers, keyed by their event. A registration carries a filter between the event and the handler, so the last argument is the handler. [[spec/design_output/pull#the-checks]]
async function hooksHere() {
  const { register } = await import("../../.claude/skills/level0/hooks/pull-tool.js");
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

// The engine takes one session start a module and counts them in the source. [[spec/design_output/level0#the-bridgehead-starts-it-too]]
test("the module registers one session start, and it registers the pull tool first", async () => {
  const { register } = await import("../../.claude/skills/level0/hooks/pull-tool.js");
  const counts = {};
  const starts = [];
  register((event, ...rest) => {
    counts[event] = (counts[event] ?? 0) + 1;
    if (event === "session.start") starts.push(rest.at(-1));
  }, {});
  assert.equal(counts["session.start"], 1, "one start a module");

  const registered = [];
  const box = harness();
  box.$.tool.register = async (spec) => void registered.push(spec.name);
  await starts[0](
    box.$,
    { session_id: "s1", client: "claude-code" },
    async (said) => said,
  );
  assert.equal(registered[0], "pull", "the pull tool registers first");
});

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
    tool({ ticket: "a-child", verdict: "answered", reason: "a-group" }),
    ["pull", "a-child", "--answered", "a-group"],
  );
  assert.deepEqual(
    tool({ ticket: "a-child", verdict: "pass", fields: { approach: "x" } }),
    ["pull", "a-child", "--pass", "--fields", '{"approach":"x"}'],
  );
  assert.deepEqual(pullArgvOf(["pull", "a-child", "--pass"]), [
    "pull",
    "a-child",
    "--pass",
  ]);
  assert.deepEqual(pullArgvOf(["pull", "--tool", "not json"]), ["pull"]);
  assert.equal(PULL_CALL, "mcp__level0__pull");
  assert.equal(pullSpec().name, "pull");
  assert.deepEqual(pullSpec().inputSchema.properties.verdict.enum, [
    "pass",
    "fail",
    "became",
    "answered",
  ]);
});

// A hand-back through the tool, over a box whose files a fake disk holds. It answers what the shell ran, what the model was asked, and what the tool answered. [[spec/tickets/the-judge-leaves-the-code]]
async function handedBack(seed, method = "") {
  const { register } = await import("../../.claude/skills/level0/hooks/pull-tool.js");
  const calls = [];
  register(
    (event, ...rest) => {
      if (event === "tool.call" && rest.length > 1) calls.push(rest);
    },
    { method },
  );
  const [, handler] = calls.find(([one]) => one?.tool === PULL_CALL) ?? [];
  const files = fakeDisk(seed);
  const ran = [];
  const asked = [];
  const $ = {
    fs: { read: async (path) => files.read(path) },
    process: {
      run: async (argv) => {
        ran.push(argv);
        return { stdout: "work", exitCode: 0 };
      },
    },
    model: {
      classify: async (_ask, _labels, options) => {
        asked.push(options);
        return "voice-3";
      },
    },
  };
  const said = await handler(
    $,
    { ticket: "a-child", verdict: "pass" },
    async () => null,
  );
  return {
    said: said.result,
    judged: ran.some((argv) => argv.at(-1) === "--judge"),
    asked,
  };
}

const judging = (enabled, model) => JSON.stringify({ judge: { enabled, model } });

// The engine holds no model call, so a config naming the old switch still runs the pull alone. [[spec/tickets/the-judge-leaves-the-code]]
test("the pull tool answers what the pull prints, and asks no model", async () => {
  const ran = await handedBack({ "spec/config/level0.json": judging(true, "haiku") });
  assert.equal(ran.judged, false, "the tool runs no --judge road");
  assert.deepEqual(ran.asked, [], "the tool asks no model");
  assert.equal(ran.said, "work");
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

// The hook matches the name the plugin registers, and runs the script under the method root. [[spec/design_output/pull#the-checks]]
test("the pull hook matches the level zero call, and runs the script the method root holds", async () => {
  const { register } = await import("../../.claude/skills/level0/hooks/pull-tool.js");
  const calls = [];
  register(
    (event, ...rest) => {
      if (event === "tool.call" && rest.length > 1) calls.push(rest);
    },
    { method: "/vehicle/" },
  );
  const [filter, handler] = calls.find(([one]) => one?.tool === PULL_CALL) ?? [];
  assert.equal(filter?.tool, "mcp__level0__pull");

  const ran = [];
  const $ = {
    process: {
      run: async (argv) => {
        ran.push(argv);
        return { stdout: "wait", stderr: "", exitCode: 0 };
      },
    },
  };
  assert.deepEqual(await handler($, {}, async () => null), { result: "wait" });
  assert.deepEqual(ran[0].slice(0, 3), [
    "node",
    "/vehicle/src/scripts/verbs/ticket.js",
    "pull",
  ]);
});

// The tool's pull reads the hand the shell verb reads, so the verb runs under the harness keys the session carries. [[spec/tickets/doors-read-what-commands-do]]
test("the pull tool runs the verb under the harness env the shell verb reads", async () => {
  const { register } = await import("../../.claude/skills/level0/hooks/pull-tool.js");
  const { agentOf } = await import("../../src/scripts/pull-hand-of.js");
  const calls = [];
  register((event, ...rest) => {
    if (event === "tool.call" && rest.length > 1) calls.push(rest);
  }, {});
  const [, handler] = calls.find(([one]) => one?.tool === PULL_CALL) ?? [];
  const before = process.env.CLAUDE_CODE_REMOTE;
  process.env.CLAUDE_CODE_REMOTE = "true";
  const opts = [];
  const $ = {
    process: {
      run: async (_argv, said) => {
        opts.push(said);
        return { stdout: "wait", stderr: "", exitCode: 0 };
      },
    },
  };
  const read = [];
  const engine = {
    ...$,
    env: {
      get: async (key) => {
        read.push(key);
        return key === "SE_CLOUD" ? "1" : undefined;
      },
    },
  };
  await handler(engine, {}, async () => null);
  assert.ok(read.includes("CLAUDE_CODE_REMOTE"), "the key reads through the engine");
  assert.equal(opts[0]?.env?.SE_CLOUD, "1");
  opts.length = 0;
  try {
    await handler($, {}, async () => null);
  } finally {
    if (before === undefined) delete process.env.CLAUDE_CODE_REMOTE;
    else process.env.CLAUDE_CODE_REMOTE = before;
  }
  assert.equal(agentOf(opts[0]?.env), "claude-code-remote");
  const { HARNESS } = await import("../../src/scripts/pull-hand-of.js");
  const { HARNESS_KEYS } = await import(
    "../../.claude/skills/level0/hooks/pull-tool.js"
  );
  assert.deepEqual(
    HARNESS_KEYS,
    HARNESS.map(([key]) => key),
    "the copy stands equal",
  );
});
