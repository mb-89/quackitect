// The index door, against the real binary. It stands where the tree is built,
// answers a glob out of the rows, and reads as absent where it is not.
// [[spec/design_output/index#the-door-answers-the-tools]]

import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { skip, test } from "node:test";
import { fileURLToPath } from "node:url";
import { BIN } from "../../.claude/skills/level0/lib/index.js";
import { clock } from "../../src/doors/clock.js";
import { disk } from "../../src/doors/disk.js";
import { index } from "../../src/doors/index.js";
import { proc } from "../../src/doors/proc.js";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const files = disk();
const built = files.exists(join(root, BIN)) || files.exists(join(root, `${BIN}.exe`));
const ifBuilt = built ? test : skip;

ifBuilt(
  "the door stands where the binary is built, and a glob comes out of the rows",
  () => {
    const it = index(files, proc(), clock(), root, root);
    assert.equal(it.stands(), true);
    assert.deepEqual(it.warm(), { warmed: true, dead: "" });
    const answer = it.ask("glob", { pattern: "src/doors/*.js", path: "" });
    assert.ok(Array.isArray(answer?.paths), "a glob answers paths");
    assert.ok(answer.paths.includes("src/doors/index.js"), "the door finds itself");
  },
);

test("a box with no binary answers nothing, and says so", () => {
  const it = index(
    files,
    proc(),
    clock(),
    files.tempDir("no-index-"),
    files.tempDir("no-work-"),
  );
  assert.equal(it.stands(), false);
  assert.equal(it.ask("glob", { pattern: "*" }), null);
  assert.equal(it.find("anything"), null);
  assert.match(it.warm().dead, /^no .*se-index stands on this box$/);
  assert.match(it.dead(), /stands on this box$/);
});

// [[spec/design_output/index#the-index-answers-the-tickets]]
const HELD_GROUP = `---
kind: [[ticket]]
state: open
process: [[group]]
step: children
steps:
  - name: children
    by: children
record:
  - step: children
    hand: box one
    hash_before: aaa
---

# Ask

Two tickets that land as one.

# children

# Discussion
`;

const child = (group) => `---
kind: [[ticket]]
state: open
group: ${group}
process: [[trivial]]
step: do
steps:
  - name: do
---

# Ask

One piece of it.

# do

# Discussion
`;

// The tickets, asked of the built binary over a tree the case writes, so the standing a branch gives a ticket reads off the group's record and no git. [[spec/design_output/index#the-index-answers-the-tickets]]
ifBuilt("a ticket's standing reads off its group's branch through the ticket", () => {
  const work = files.tempDir("tickets-");
  files.makeDir(join(work, "spec", "tickets"));
  for (const [at, text] of [
    ["one-group.md", HELD_GROUP],
    ["a-child.md", child("one-group")],
    ["a-loose-one.md", child("").replace("group: \n", "")],
  ]) {
    files.write(join(work, "spec", "tickets", at), text);
  }
  const it = index(files, proc(), clock(), root, work);
  try {
    const rows = new Map(it.ask("tickets", {}).map((one) => [one.name, one]));
    assert.equal(rows.get("one-group").standing, "held", "an open record entry holds the group");
    assert.equal(rows.get("a-child").standing, "held", "a child stands where its group's branch stands");
    assert.equal(rows.get("a-loose-one").standing, "", "a ticket in no group carries no standing");
    assert.equal(rows.get("a-child").group, "one-group");
    assert.equal(rows.get("a-child").state, "open");
    assert.equal(rows.get("a-child").step, "do");
  } finally {
    it.ask("stop", {});
  }
});

// The change reaches a caller within a second of the write, so a reader redraws and polls nothing. [[spec/design_output/index#the-index-fires-on-change]]
ifBuilt("a changes call fires within a second of a ticket write", () => {
  const work = files.tempDir("changes-");
  files.makeDir(join(work, "spec", "tickets"));
  files.write(join(work, "spec", "tickets", "a-child.md"), child(""));
  const time = clock();
  const it = index(files, proc(), time, root, work);
  try {
    const first = it.ask("changes", { since: 0 });
    assert.ok(first?.tick >= 1, `the walk on the way up counts one, and the tick reads ${first?.tick}`);
    files.write(join(work, "spec", "tickets", "late.md"), child(""));
    const started = time.now().getTime();
    const next = it.ask("changes", { since: first.tick });
    const took = time.now().getTime() - started;
    assert.ok(next?.tick > first.tick, "a sweep past the write counts one more");
    assert.ok(took < 1000, `the call fires within a second, and took ${took}ms`);
  } finally {
    it.ask("stop", {});
  }
});
