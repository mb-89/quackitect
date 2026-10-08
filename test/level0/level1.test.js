// The pull hook over a fake harness: what it registers, the argv it hands the
// binary, and what it answers. src/pull owns the pull itself.
// [[spec/design_output/pull#the-hand-out]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { fakeDisk } from "../../src/doors/fake/disk.js";

// The tool the pull registers and the spec the verb prints, as PullSpec in src/pull/pull.go names them. [[spec/design_output/pull#the-checks]]
const PULL_CALL = "mcp__level0__pull";
const PULL_SPEC = { name: "pull" };

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
test("the module registers one session start, and it registers the pull the verb prints", async () => {
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
  box.$.process = {
    run: async (argv) =>
      argv.includes("--spec")
        ? { exitCode: 0, stdout: JSON.stringify(PULL_SPEC) }
        : { exitCode: 1, stdout: "" },
  };
  await starts[0](
    box.$,
    { session_id: "s1", client: "claude-code" },
    async (said) => said,
  );
  assert.deepEqual(registered, ["pull"], "the pull tool registers off the verb");
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

// The hook matches the name the plugin registers, and runs the verb through the binary under the method root. [[spec/design_output/pull#the-checks]]
test("the pull hook matches the level zero call, and runs the verb through the binary the method root holds", async () => {
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
  assert.deepEqual(ran[0].slice(0, 6), [
    "/vehicle/.se/.runtime/bin/se-index",
    "verb",
    "/vehicle/src/scripts",
    "ticket",
    "pull",
    "--tool",
  ]);
});

// The tool's pull reads the hand the shell verb reads, so the verb runs under the harness keys the session carries. [[spec/tickets/doors-read-what-commands-do]]
test("the pull tool runs the verb under the harness env the shell verb reads", async () => {
  const { register } = await import("../../.claude/skills/level0/hooks/pull-tool.js");
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
  // TestEveryKeyThePullToolForwardsNamesAHarness in src/quack holds the keys to the hand rule. [[spec/tickets/pull-scripts-leave]]
  assert.equal(opts[0]?.env?.CLAUDE_CODE_REMOTE, "true", "the harness key rides the verb's env");
});
