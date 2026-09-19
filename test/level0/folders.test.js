// The folders under the private one. One module owns the names, so every case
// here reads the constant a writer exports and holds it against that module.
// Every case runs over strings and touches nothing outside memory.
// [[spec/design_input/the-runtime-files-stand-apart]]

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  inRetro,
  inRun,
  PRIVATE,
  RETRO,
  RUN,
  runs,
} from "../../.claude/skills/level0/lib/folders.js";
import { BIN as INDEX_BIN } from "../../.claude/skills/level0/lib/index.js";
import { FOLDER as LOG } from "../../.claude/skills/level0/lib/log.js";
import { WORKTREE } from "../../.claude/skills/level0/lib/review.js";
import { BIN, TOOLS } from "../../.claude/skills/level0/lib/tools.js";
import { FOLDER as UNDO } from "../../.claude/skills/level0/lib/undo.js";
import { HOLDS as GUIDANCE_HOLDS } from "../../src/scripts/guidance-hand.js";
import { BOX, SESSION } from "../../src/scripts/pull-hand-of.js";
import { HOLDS as ROUTE_HOLDS } from "../../src/scripts/pull-route.js";
import { HOLDS, NOTES } from "../../src/scripts/ticket.js";

test("the module names the retro folder and the runtime folder, both under the private one", () => {
  assert.equal(PRIVATE, ".se");
  assert.equal(RETRO, `${PRIVATE}/.retro`);
  assert.equal(RUN, `${PRIVATE}/.runtime`);
});

test("a name joins either folder through the module, so no writer spells the folder itself", () => {
  assert.equal(inRetro("one.md"), `${RETRO}/one.md`);
  assert.equal(inRun("undo"), `${RUN}/undo`);
});

test("the runtime half answers on the path the root holds, not on a folder's base name", () => {
  assert.equal(runs(RUN), true);
  assert.equal(runs(`${RUN}/bin/vale`), true);
  assert.equal(runs("./.se/.runtime/hold/one.json"), true);
  assert.equal(runs(".se\\.runtime\\hold"), true);
  // The log is history, so it stands outside the half a session clears. [[spec/tickets/the-retro-takes-the-box]]
  assert.equal(runs(".se/.log/session.jsonl"), false);
  assert.equal(runs("src/scripts/run"), false);
  assert.equal(runs("src/run/one.js"), false);
  assert.equal(runs(PRIVATE), false);
  assert.equal(runs(`${PRIVATE}/tickets/one.md`), false);
  assert.equal(runs(""), false);
});

// [[spec/tickets/the-runtime-files-stand-apart]]
test("every runtime writer names its folder under the runtime half", () => {
  assert.deepEqual(
    {
      worktree: WORKTREE,
      undo: UNDO,
      bin: BIN,
      tools: TOOLS,
      box: BOX,
      session: SESSION,
      hold: HOLDS,
    },
    {
      worktree: inRun("review"),
      undo: inRun("undo"),
      bin: inRun("bin"),
      tools: inRun("tools.json"),
      box: inRun("box.json"),
      session: inRun("session.json"),
      hold: inRun("hold"),
    },
  );
});

test("every runtime writer stands inside the half the skip reads", () => {
  for (const one of [WORKTREE, UNDO, BIN, TOOLS, BOX, SESSION, HOLDS]) {
    assert.equal(runs(one), true, one);
  }
});

// The retro's collect skips the runtime half whole, and a retro reads the log. [[spec/tickets/the-runtime-folder-holds-state]]
test("the log stands outside the half the retro skips", () => {
  assert.equal(LOG, `${PRIVATE}/.log`);
  assert.equal(runs(LOG), false);
});

test("one hold folder stands, and the three modules naming it answer one path", () => {
  assert.equal(ROUTE_HOLDS, HOLDS);
  assert.equal(GUIDANCE_HOLDS, HOLDS);
  assert.equal(HOLDS, inRun("hold"));
});

test("the index binary stands in the bin the tools module names, so one move carries both", () => {
  assert.equal(INDEX_BIN, `${BIN}/se-index`);
});

test("the rest keeps the private tickets, which a reader asks after once the box dies", () => {
  assert.equal(NOTES, `${PRIVATE}/tickets`);
  assert.equal(runs(NOTES), false);
});
