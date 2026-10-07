// The hook registers the tool list the index generates beside the tools it
// registers today, and a call of one runs its action through the binary.
// [[spec/tickets/the-hook-registers-index-tools]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { register } from "../../.claude/skills/level0/hooks/pull-tool.js";
import {
  binaryOf,
  callsIndexTool,
  registersIndexTools,
} from "../../.claude/skills/level0/lib/index-tools.js";
import { PULL_CALL } from "../../.claude/skills/level0/lib/pull.js";
import LIST from "../../src/index/testdata/tools.golden.json" with { type: "json" };

const BIN = "/method/.se/.runtime/bin/se-index";

// A hook engine whose binary prints the list, or answers what the case hands it. [[spec/tickets/the-hook-registers-index-tools]]
function engine(answer = { stdout: JSON.stringify(LIST), exitCode: 0 }) {
  const registered = [];
  const ran = [];
  const $ = {
    tool: { register: async (spec) => void registered.push(spec) },
    process: {
      run: async (argv) => {
        ran.push(argv);
        if (answer instanceof Error) throw answer;
        if (argv.includes("--spec")) return { stdout: '{"name":"pull"}\n', exitCode: 0 };
        return argv[1] === "tools" ? answer : { stdout: '{"sum": 5}\n', exitCode: 0 };
      },
    },
    fs: { read: async () => "", write: async () => {} },
    env: { get: async () => undefined },
    ui: { log: () => {} },
  };
  return { $, registered, ran };
}

test("the binary stands under the method root's runtime folder", () => {
  assert.equal(binaryOf("/method", false), BIN);
  assert.equal(binaryOf("/method", true), `${BIN}.exe`);
});

test("the hook registers each tool the binary lists, and the pull its verb prints", async () => {
  const held = [];
  register(
    (event, filter, made) => void held.push({ event, filter, run: made ?? filter }),
    {
      method: "/method",
    },
  );
  const { $, registered, ran } = engine();
  const start = held.filter((one) => one.event === "session.start").at(-1);
  await start.run($, { sessionId: "s" }, async (e) => e);
  const names = registered.map((one) => one.name);
  assert.ok(names.includes(PULL_CALL.replace("mcp__level0__", "")), names.join(", "));
  assert.ok(
    names.includes("index_t_add") && names.includes("index_t_echo"),
    names.join(", "),
  );
  assert.deepEqual(ran[0], [BIN, "tools"]);
  assert.deepEqual(ran[1], [BIN, "verb", "/method/src/scripts", "ticket", "pull", "--spec"]);
  const add = registered.find((one) => one.name === "index_t_add");
  assert.deepEqual(Object.keys(add).sort(), ["description", "inputSchema", "name"]);
});

test("a call of an index tool runs act with the arguments the event spreads, and answers what it prints", async () => {
  const { $, ran } = engine();
  const tools = await registersIndexTools($, BIN);
  const said = await callsIndexTool($, BIN, tools, {
    tool: "mcp__level0__index_t_add",
    a: 2,
    b: 3,
  });
  assert.deepEqual(ran.at(-1), [BIN, "act", "t/add", '{"a":2,"b":3}']);
  assert.equal(said, '{"sum": 5}');
  await callsIndexTool($, BIN, tools, {
    tool: "mcp__level0__index_t_echo",
    input: "x",
  });
  assert.deepEqual(ran.at(-1), [BIN, "act", "t/echo", '"x"']);
});

test("a binary that answers nothing registers no tool", async () => {
  for (const answer of [new Error("no binary"), { stdout: "", exitCode: 1 }]) {
    const { $, registered } = engine(answer);
    assert.deepEqual(await registersIndexTools($, BIN), []);
    assert.deepEqual(registered, []);
  }
});
