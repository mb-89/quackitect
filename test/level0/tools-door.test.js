// The tools block over a fake box: the guidance door reads the survey at
// session start, runs it first on a fresh box, and hands the session one line
// per tool beside the rules.
// [[spec/design_output/tools#the-session-reads-the-survey]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { TOOLS } from "../../.claude/skills/level0/lib/tools.js";
import {
  onAgentSpawn,
  onPromptContext,
  onSessionStart,
  TOOLS_BLOCK,
} from "../../src/bridge/guidance.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeProc } from "../../src/doors/fake/proc.js";

const ROOT = "/tree";
const at = (path) => join(ROOT, ...path.split("/"));
const FIND = {
  name: "mcp__level0__find",
  description:
    "Finds the lines in this tree carrying the words, ranked by the index. Ask it first.",
};

function box(files = {}, answers = {}) {
  const disk = fakeDisk(files);
  const proc = fakeProc(answers);
  return {
    disk,
    proc,
    work: ROOT,
    method: ROOT,
    env: { PATH: "/usr/bin" },
    specs: [FIND],
    index: { dead: () => "" },
    log: { say: () => {} },
  };
}

function blocksOf(it) {
  onSessionStart({}, it);
  return onPromptContext({}, it).after.blocks;
}

test("a fresh box runs the survey at session start, and the block names what it found", () => {
  const it = box(
    { "/usr/bin/node": "" },
    { "/usr/bin/node --version": { stdout: "v22.0.0" } },
  );

  const blocks = blocksOf(it);
  const tools = blocks.find((one) => one.name === TOOLS_BLOCK);

  assert.ok(it.disk.exists(at(TOOLS)), "the survey file stands after the start");
  assert.match(tools.text, /- `node` 22\.0\.0, for a helper script/);
  assert.match(
    tools.text,
    /- `mcp__level0__find`: Finds the lines in this tree carrying the words, ranked by the index\./,
  );
});

test("a surveyed box reads the file and runs nothing", () => {
  const survey = JSON.stringify({
    vale: { path: "/usr/bin/vale", version: "3.20.0" },
    node: null,
  });
  const it = box({ [at(TOOLS)]: survey });

  const tools = blocksOf(it).find((one) => one.name === TOOLS_BLOCK);

  const surveyed = it.proc.ran.filter((one) => !one.argv.includes("help"));
  assert.equal(surveyed.length, 0, "the survey stays as it stands");
  assert.match(tools.text, /- `vale` 3\.20\.0, for the prose rules/);
  assert.doesNotMatch(tools.text, /`node`/);
});

// The index's tool list stands as the one source of the verbs, so a fresh session reads each verb as the tool it calls. [[spec/tickets/agents-call-quack-directly]]
test("the tools block names each verb as the index tool standing for it", () => {
  const survey = JSON.stringify({ vale: { path: "/usr/bin/vale", version: "3.20.0" } });
  const listed = JSON.stringify([
    {
      name: "index_verb_check",
      description: "the tests, the doors, the server, then the rules over the tree",
    },
    { name: "index_ticket_pull", description: "take the next leaf of this group" },
  ]);
  const it = box(
    { [at(TOOLS)]: survey },
    { [`${ROOT}/.se/.runtime/bin/se-index tools`]: { stdout: listed } },
  );

  const tools = blocksOf(it).find((one) => one.name === TOOLS_BLOCK);

  assert.match(tools.text, /# The verbs/);
  assert.match(
    tools.text,
    /- `mcp__level0__index_verb_check`: the tests, the doors, the server, then the rules over the tree/,
  );
  assert.match(
    tools.text,
    /- `mcp__level0__index_ticket_pull`: take the next leaf of this group/,
  );
  assert.doesNotMatch(tools.text, /\.\/RUNME\.sh/, "the block names no shell verb");
});

// A binary answering no list leaves the part out, since the hook registers no tool there. [[spec/tickets/agents-call-quack-directly]]
test("the tools block leaves the verbs out where the index lists no tool", () => {
  const survey = JSON.stringify({ vale: { path: "/usr/bin/vale", version: "3.20.0" } });
  const it = box(
    { [at(TOOLS)]: survey },
    { [`${ROOT}/.se/.runtime/bin/se-index tools`]: { exitCode: 1 } },
  );

  const tools = blocksOf(it).find((one) => one.name === TOOLS_BLOCK);

  assert.doesNotMatch(tools.text, /# The verbs/);
});

// [[spec/design_output/level0#a-spawn-names-its-tier]]
test("the tools block names each tier and its model where the config names them", () => {
  const config = { helper: { find: "haiku", change: "sonnet", decide: "opus" } };
  const survey = JSON.stringify({ vale: { path: "/usr/bin/vale", version: "3.20.0" } });
  const it = box({
    [at(TOOLS)]: survey,
    [at("spec/config/level0.json")]: JSON.stringify(config),
  });

  const tools = blocksOf(it).find((one) => one.name === TOOLS_BLOCK);

  assert.match(tools.text, /Every `Agent` call names `model`/);
  assert.match(tools.text, /find takes `haiku`/);
  assert.match(tools.text, /decide takes `opus`/);

  const bare = box({ [at(TOOLS)]: survey });
  const plain = blocksOf(bare).find((one) => one.name === TOOLS_BLOCK);
  assert.doesNotMatch(plain.text, /takes `/, "a config naming no tier adds no line");
});

// [[spec/design_output/level0#a-spawn-names-its-tier]]
test("a helper's spawn writes the model it runs on to the log", () => {
  const said = [];
  const it = { ...box(), log: { say: (...row) => said.push(row) } };
  onAgentSpawn(
    { prompt: "Work.", model: "haiku", description: "find the callers" },
    it,
  );
  const row = said.find((one) => one[1] === "agent");
  assert.equal(row?.[0], "info");
  assert.match(row?.[2] ?? "", /spawns on haiku/);
  assert.equal(row?.[3]?.detail, "find the callers");
});
