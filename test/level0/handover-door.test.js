// The handover over a fake box: the context door hands .se/HANDOVER.md to the
// session as a block after the rules, and deletes it as it reads it.
// [[spec/design_output/work#one-handover-stands]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { HANDOVER } from "../../.claude/skills/level0/lib/folders.js";
import { PLANS } from "../../.claude/skills/level0/lib/runs.js";
import { TOOLS } from "../../.claude/skills/level0/lib/tools.js";
import {
  HANDOVER_BLOCK,
  onPromptContext,
  onSessionStart,
} from "../../src/bridge/guidance.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeProc } from "../../src/doors/fake/proc.js";

const ROOT = "/tree";
const at = (path) => join(ROOT, ...path.split("/"));
const RULES = "---\nkind: [[guidance]]\n---\n\n# Actionables\n\n1. Say what is.\n";

function box(files = {}) {
  const said = [];
  return {
    disk: fakeDisk({
      [at(TOOLS)]: "{}",
      [at("spec/guidance/rules.md")]: RULES,
      ...files,
    }),
    proc: fakeProc({}),
    work: ROOT,
    method: ROOT,
    env: {},
    specs: [],
    index: { dead: () => "" },
    log: { say: (level, kind, line) => said.push({ level, kind, line }) },
    said,
  };
}

function names(blocks) {
  return blocks.map((one) => one.name);
}

test("a handover on the box reaches the session after the rules, and the read deletes it", () => {
  const it = box({ [at(HANDOVER)]: "# Where it stands\n\nThe probe runs next.\n" });
  onSessionStart({}, it);

  const blocks = onPromptContext({}, it).after.blocks;
  const handover = blocks.find((one) => one.name === HANDOVER_BLOCK);

  assert.equal(names(blocks).at(-1), HANDOVER_BLOCK, "the handover comes last");
  assert.ok(names(blocks).includes("level0-rules"), "the rules come before it");
  assert.match(handover.text, /The probe runs next\./);
  assert.match(handover.text, /Write a new one before you finish\./);
  assert.equal(it.disk.exists(at(HANDOVER)), false, "the read deletes the file");
  assert.ok(it.said.some((one) => one.kind === "handover"));
});

test("a re-read after a clear hands over the handover written before it", () => {
  const it = box({ [at(HANDOVER)]: "the first" });
  onSessionStart({}, it);
  onPromptContext({}, it);
  it.disk.write(at(HANDOVER), "the second");

  const blocks = onPromptContext({}, it).after.blocks;

  assert.match(blocks.find((one) => one.name === HANDOVER_BLOCK).text, /the second/);
});

test("no handover, or an empty one, adds no block", () => {
  for (const files of [{}, { [at(HANDOVER)]: "  \n" }]) {
    const it = box(files);
    onSessionStart({}, it);

    const blocks = onPromptContext({}, it).after.blocks;

    assert.equal(names(blocks).includes(HANDOVER_BLOCK), false);
    assert.equal(it.disk.exists(at(HANDOVER)), false);
  }
});

test("a second read with no new handover hands none again", () => {
  const it = box({ [at(HANDOVER)]: "once" });
  onSessionStart({}, it);
  onPromptContext({}, it);

  const blocks = onPromptContext({}, it).after.blocks;

  assert.equal(names(blocks).includes(HANDOVER_BLOCK), false);
});

test("the read drops the handover's own work from the plan, and keeps the rest", () => {
  const plan = {
    working: "the handover",
    todos: [
      { title: "write the new handover", details: "", todo: "end" },
      { title: "the probe runs", details: "", todo: "end" },
    ],
    places: {},
  };
  const it = box({
    [at(HANDOVER)]: "once",
    [at(PLANS)]: JSON.stringify(plan),
  });
  onSessionStart({}, it);

  onPromptContext({}, it);

  const left = JSON.parse(String(it.disk.read(at(PLANS))));
  assert.equal(left.working, "");
  assert.deepEqual(
    left.todos.map((one) => one.title),
    ["the probe runs"],
  );
});

test("with no handover to read, the plan stands as it is", () => {
  const plan = JSON.stringify({ working: "the handover", todos: [], places: {} });
  const it = box({ [at(PLANS)]: plan });
  onSessionStart({}, it);

  onPromptContext({}, it);

  assert.equal(String(it.disk.read(at(PLANS))), plan);
});
