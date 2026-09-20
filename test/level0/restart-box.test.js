// The box a restart hands over: it carries no session start, and the server
// fills what it lacks before the door runs. So the tools register whole and the
// mint names the kinds the schemas hold.
// [[spec/tickets/the-tools-answer-after-restart]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { MINT_TOOL } from "../../.claude/skills/level0/lib/schema.js";
import { TOOLS } from "../../.claude/skills/level0/lib/tools.js";
import { TOOLS_BLOCK } from "../../src/bridge/guidance.js";
import { boxOf, decide } from "../../src/bridge/server.js";
import { fakeClock } from "../../src/doors/fake/clock.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeLog } from "../../src/doors/fake/log.js";
import { fakeProc } from "../../src/doors/fake/proc.js";
import { SCHEMA } from "./pull-schema.js";

const ROOT = "/tree";
const at = (path) => join(ROOT, ...path.split("/"));
const SURVEY = JSON.stringify({ node: { path: "/usr/bin/node", version: "22.0.0" } });
const PATCH = "patch";
const CHECK = "check_answer";

// The index, faked, because a cold index answers and warms itself. [[spec/design_output/doors#a-fake-behaves]]
const coldIndex = () => ({ warm: () => ({ warmed: false }), dead: () => "" });

// A box the way a restart hands one over: every door stands, and no session start runs. [[spec/tickets/the-tools-answer-after-restart]]
function restarted(files = {}) {
  const disk = fakeDisk({
    [at("spec/schemas/ticket.schema.yaml")]: SCHEMA,
    [at(TOOLS)]: SURVEY,
    ...files,
  });
  return boxOf(ROOT, ROOT, {
    disk,
    clock: fakeClock(),
    proc: fakeProc({}),
    log: fakeLog(),
    index: coldIndex(),
  });
}

const reads = (box) => decide({ event: "tool.call", e: { tool: "Read" } }, box);
const specNamed = (register, name) => (register ?? []).find((one) => one.name === name);

test("a tool call on a fresh box registers the patch tool and the check tool", async () => {
  const said = await reads(restarted());

  assert.ok(specNamed(said.register, PATCH), "the patch tool");
  assert.ok(specNamed(said.register, CHECK), "the check tool");
});

test("the mint spec names every kind the schemas hold", async () => {
  const said = await reads(restarted());

  const mint = specNamed(said.register, MINT_TOOL);
  assert.ok(mint, "the mint stands in the registration");
  assert.deepEqual(mint.inputSchema.properties.kind.enum, ["ticket"]);
  assert.match(mint.description, /ticket/, "and the description names them too");
});

test("the mint tool answers a refusal on a fresh box, in place of throwing", async () => {
  const said = await decide(
    {
      event: "tool.call",
      e: {
        tool: `mcp__level0__${MINT_TOOL}`,
        kind: "nothing",
        path: "spec/tickets/a-name.md",
      },
    },
    restarted(),
  );

  assert.match(JSON.stringify(said), /holds no nothing/, "the refusal names the kind");
});

test("a second event registers nothing, because the first one registers", async () => {
  const box = restarted();
  const first = await reads(box);
  const second = await reads(box);

  assert.ok(first.register?.length, "the first event carries the list");
  assert.equal(second.register, undefined, "and the second carries none");
});

test("the registration carries the list the box holds, built once", async () => {
  const box = restarted();
  const said = await reads(box);

  assert.equal(said.register, box.specs, "the answer hands back the box's own list");
});

test("the block naming what this box has reaches a session off a fresh box", async () => {
  const box = restarted();
  await reads(box);
  const said = await decide({ event: "prompt.context", e: {} }, box);

  const block = (said.after?.blocks ?? []).find((one) => one.name === TOOLS_BLOCK);
  assert.ok(block, "the tools block stands");
  assert.match(block.text, /`node` 22\.0\.0/, "it names the survey");
  assert.match(block.text, new RegExp(MINT_TOOL), "and the mint beside it");
});
