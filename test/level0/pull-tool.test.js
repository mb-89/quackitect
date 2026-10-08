// The pull hook over a fake engine: the tools a start registers, the argv a
// pull call hands the binary under the method root, the env it carries, and
// the hand it spawns where the pull answers spawn. src/pull owns the pull.
// [[spec/design_output/pull#the-hand-out]] [[spec/tickets/the-hook-registers-index-tools]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { register } from "../../.claude/skills/level0/hooks/pull-tool.js";
import LIST from "../../src/index/testdata/tools.golden.json" with { type: "json" };

const BIN = "/method/.se/.runtime/bin/se-index";
// The tool the pull registers, as PullSpec in src/pull/pull.go names it. [[spec/design_output/pull#the-checks]]
const PULL_CALL = "mcp__level0__pull";
const SPAWN =
  "spawn\n  a-child at design/review waits for a hand other than box 1.\n  Spawn a hand.\n\nYou are a hand of your own, named helper-2.\n1. Run it.";

// The module's hooks, and an engine whose binary answers the tool list, the spec, and the pull as the case hands it. [[spec/tickets/the-hook-registers-index-tools]]
function engine(pulled = { stdout: "wait", stderr: "", exitCode: 0 }) {
  const held = [];
  register(
    (event, filter, made) => void held.push({ event, filter, run: made ?? filter }),
    {
      method: "/method",
    },
  );
  const said = { registered: [], ran: [], opts: [], spawned: [], read: [] };
  const $ = {
    tool: { register: async (spec) => void said.registered.push(spec) },
    process: {
      run: async (argv, opts) => {
        said.ran.push(argv);
        said.opts.push(opts);
        if (argv.includes("--spec"))
          return { stdout: '{"name":"pull"}\n', exitCode: 0 };
        return argv[1] === "tools"
          ? { stdout: JSON.stringify(LIST), exitCode: 0 }
          : pulled;
      },
    },
    agent: { spawn: async (one) => void said.spawned.push(one) || { text: "started" } },
    fs: { read: async () => "", write: async () => {} },
    env: {
      get: async (key) => {
        said.read.push(key);
        return key === "SE_CLOUD" ? "1" : undefined;
      },
    },
    ui: { log: () => {} },
  };
  const starts = held.filter((one) => one.event === "session.start");
  const call = held.find(
    (one) => one.event === "tool.call" && one.filter?.tool === PULL_CALL,
  );
  return {
    $,
    said,
    starts,
    pull: (input = {}) => call.run($, input, async () => null),
  };
}

// The engine takes one session start a module. [[spec/design_output/level0#the-bridgehead-starts-it-too]]
test("one start registers each tool the binary lists, and the pull its verb prints", async () => {
  const { $, said, starts } = engine();
  assert.equal(starts.length, 1, "one start a module");
  await starts[0].run($, { sessionId: "s" }, async (e) => e);
  const names = said.registered.map((one) => one.name);
  for (const one of ["pull", "index_t_add", "index_t_echo"])
    assert.ok(names.includes(one), names.join(", "));
  assert.deepEqual(said.ran.slice(0, 2), [
    [BIN, "tools"],
    [BIN, "verb", "/method/src/scripts", "ticket", "pull", "--spec"],
  ]);
  const add = said.registered.find((one) => one.name === "index_t_add");
  assert.deepEqual(Object.keys(add).sort(), ["description", "inputSchema", "name"]);
});

// [[spec/design_output/pull#the-checks]] [[spec/tickets/doors-read-what-commands-do]]
test("a pull call runs the verb through the binary, under the harness env the shell verb reads", async () => {
  const it = engine();
  assert.deepEqual(await it.pull(), { result: "wait" });
  assert.deepEqual(it.said.ran[0].slice(0, 6), [
    BIN,
    "verb",
    "/method/src/scripts",
    "ticket",
    "pull",
    "--tool",
  ]);
  assert.ok(
    it.said.read.includes("CLAUDE_CODE_REMOTE"),
    "the key reads through the engine",
  );
  assert.equal(it.said.opts[0]?.env?.SE_CLOUD, "1");

  const bare = engine();
  delete bare.$.env;
  const before = process.env.CLAUDE_CODE_REMOTE;
  process.env.CLAUDE_CODE_REMOTE = "true";
  try {
    await bare.pull();
  } finally {
    if (before === undefined) delete process.env.CLAUDE_CODE_REMOTE;
    else process.env.CLAUDE_CODE_REMOTE = before;
  }
  // TestEveryKeyThePullToolForwardsNamesAHarness in src/quack holds the keys to the hand rule. [[spec/tickets/pull-scripts-leave]]
  assert.equal(bare.said.opts[0]?.env?.CLAUDE_CODE_REMOTE, "true");
});

// [[spec/tickets/the-hook-awaits-the-spawn]]
test("a spawn answer spawns the hand in the background once, and pulls no second time", async () => {
  const it = engine({
    stdout: JSON.stringify({ result: SPAWN, spawn: SPAWN.split("\n\n")[1] }),
    exitCode: 0,
  });
  const said = await it.pull();
  assert.deepEqual(
    it.said.spawned.map((one) => [one.background, one.prompt]),
    [[true, "You are a hand of your own, named helper-2.\n1. Run it."]],
  );
  assert.equal(it.said.ran.length, 1, "the tool waits on no hand before it answers");
  assert.match(said.result, /in the background/);
});
