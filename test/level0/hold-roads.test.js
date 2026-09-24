// The roads to the write door past Write and Edit, over a server box: the patch
// and the mint carry the call's hand, and a session start drops the hold.
// [[spec/design_output/stop#the-hand-holds-its-file]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { PATCH } from "../../.claude/skills/level0/lib/apply.js";
import { MINT_TOOL } from "../../.claude/skills/level0/lib/schema.js";
import { boxOf, decide } from "../../src/bridge/server.js";
import { fakeClock } from "../../src/doors/fake/clock.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeLog } from "../../src/doors/fake/log.js";
import { fakeProc } from "../../src/doors/fake/proc.js";
import { SCHEMA } from "./pull-schema.js";

const ROOT = "/tree";
const at = (path) => join(ROOT, ...path.split("/"));
const HOLD = at(".se/.runtime/refactor-hold.json");
const SINCE = Date.parse("2026-01-01T00:00:00.000Z") / 1000;
const NOTE = "spec/tickets/a-name.md";

// A server box whose hold names one file, owned by the hand a1. [[spec/design_output/stop#the-hand-holds-its-file]]
function heldOn(file) {
  const disk = fakeDisk({
    [at("spec/config/level0.json")]: JSON.stringify({ refactor: { holdFor: "30m" } }),
    [at("spec/schemas/ticket.schema.yaml")]: SCHEMA,
    [at("one.md")]: "alpha beta\n",
    [HOLD]: JSON.stringify({ file, hand: "a1", since: SINCE }),
  });
  return boxOf(ROOT, ROOT, {
    disk,
    clock: fakeClock(),
    log: fakeLog(),
    proc: fakeProc({}),
    index: { dead: () => "", fault: () => "", warm: () => ({ warmed: false }) },
    vale: { stands: () => false },
    biome: { stands: () => false },
  });
}

const patch = (agentId) => ({
  event: "tool.call",
  e: { tool: `mcp__level0__${PATCH}`, agentId, ops: [{ file: "one.md", old: "beta", new: "delta" }] },
});
const mint = (agentId) => ({
  event: "tool.call",
  e: { tool: `mcp__level0__${MINT_TOOL}`, agentId, kind: "ticket", path: NOTE },
});

test("another hand's patch on the held file refuses, and the owning hand's lands", async () => {
  const box = heldOn("one.md");
  const other = await decide(patch("a2"), box);
  assert.match(String(other.result?.result), /one\.md stands held/);
  assert.equal(box.disk.read(at("one.md")), "alpha beta\n", "nothing lands");

  await decide(patch("a1"), box);
  assert.equal(box.disk.read(at("one.md")), "alpha delta\n", "the owning hand's patch lands");
});

test("another hand's mint on the held path refuses", async () => {
  const said = await decide(mint("a2"), heldOn(NOTE));
  assert.match(String(said.result?.result), /a-name\.md stands held/);
});

test("a session start drops the hold the last session left", async () => {
  const box = heldOn("one.md");
  await decide({ event: "session.start", e: {} }, box);
  assert.equal(box.disk.exists(HOLD), false, "no hand of the last session answers here");
});
