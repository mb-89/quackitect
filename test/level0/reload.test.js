// The server's own code, read once and compared after a tool run. Every case
// stands on a fake disk, and the restart itself belongs to the wire door.
// [[spec/design_output/level0#a-fix-reaches-the-session]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { codeOf, movedCode, movedIn } from "../../src/bridge/reload.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";

const ROOT = "/tree";
const at = (path) => join(ROOT, ...path.split("/"));

function tree() {
  return fakeDisk({
    [at("src/bridge/stop.js")]: "export const a = 1;\n",
    [at("src/bridge/notes.md")]: "# not code\n",
    [at(".claude/skills/level0/lib/ticket.js")]: "export const b = 2;\n",
  });
}

test("the code of the server is every script under its roots, and a note is none", () => {
  const code = codeOf(tree(), ROOT);
  assert.deepEqual([...code.keys()].sort(), [
    ".claude/skills/level0/lib/ticket.js",
    "src/bridge/stop.js",
  ]);
  assert.equal(code.get("src/bridge/stop.js"), "export const a = 1;\n");
});

test("a changed, an added and a removed file each read as moved, and the same code as none", () => {
  const was = codeOf(tree(), ROOT);
  assert.equal(movedIn(was, codeOf(tree(), ROOT)), "");
  const changed = new Map(was);
  changed.set("src/bridge/stop.js", "export const a = 2;\n");
  assert.equal(movedIn(was, changed), "src/bridge/stop.js");
  const added = new Map(was);
  added.set("src/bridge/new.js", "");
  assert.equal(movedIn(was, added), "src/bridge/new.js");
  const removed = new Map(was);
  removed.delete(".claude/skills/level0/lib/ticket.js");
  assert.equal(movedIn(was, removed), ".claude/skills/level0/lib/ticket.js");
});

test("the box reads its code once, and a change shows after a tool run alone", () => {
  const disk = tree();
  const box = { disk, method: ROOT };
  assert.equal(movedCode(box, "session.start"), "", "the first read holds the code");
  disk.write(at("src/bridge/stop.js"), "export const a = 3;\n");
  assert.equal(movedCode(box, "tool.call"), "", "a call before the run moves nothing");
  assert.equal(movedCode(box, "classic.PostToolUse"), "src/bridge/stop.js");
});
