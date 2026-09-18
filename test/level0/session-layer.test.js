// The layer a session opens with, driven over a fake disk. A held step's notes
// ride the step, so the layer hands them no second time.
// [[spec/design_output/level0#the-standing-layer]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { guidanceHere } from "../../src/bridge/guidance.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { heldReadsIn } from "../../src/scripts/guidance-hand.js";

const METHOD = "/vehicle";
const WORK = "/tree";
const BOX = "d462e994b4cef";
const HAND = `box ${BOX} · claude-code`;
const VOICE =
  "---\nkind: [[guidance]]\n---\n\n# Actionables\n\n1. Say what is. *\n2. Put the bottom line first.\n";
const WORKING =
  "---\nkind: [[guidance]]\n---\n\n# Actionables\n\n1. Answer the owner first. *\n";
const ENV = { CLAUDECODE: "1" };

const hold = (reads) => ({
  ticket: "a-child",
  path: "spec/tickets/a-child.md",
  step: "design/draft",
  hand: HAND,
  refused: 0,
  reads,
});

function disks(more = {}) {
  return fakeDisk({
    [join(METHOD, "spec/guidance/voice.md")]: VOICE,
    [join(METHOD, "spec/guidance/working.md")]: WORKING,
    ...more,
  });
}

const boxed = (disk) => {
  disk.write(join(WORK, ".se/box.json"), JSON.stringify({ id: BOX }));
  return disk;
};

const holding = (disk, reads) => {
  disk.write(
    join(WORK, `.se/hold/${HAND.replace(/[^A-Za-z0-9]+/g, "-")}.json`),
    `${JSON.stringify(hold(reads), null, 2)}\n`,
  );
  return disk;
};

// [[spec/design_output/level0#the-standing-layer]]
test("a hold standing drops the note its step reads from the layer a session opens with", () => {
  const disk = holding(boxed(disks()), [{ name: "spec/guidance/voice", hash: "aa" }]);

  const said = guidanceHere(disk, METHOD, ENV, true, WORK);

  assert.ok(
    !/Say what is\./.test(said.standing),
    "the held step's note leaves the layer",
  );
  assert.match(said.standing, /Answer the owner first\./);
});

// [[spec/design_output/level0#the-standing-layer]]
test("no hold standing leaves the layer whole", () => {
  const disk = boxed(disks());

  const said = guidanceHere(disk, METHOD, ENV, true, WORK);

  assert.match(said.standing, /Say what is\./);
  assert.match(said.standing, /Answer the owner first\./);
});

// [[spec/design_output/level0#the-standing-layer]]
test("no box file leaves the layer whole, and the reader mints none", () => {
  const disk = disks();

  const said = guidanceHere(disk, METHOD, ENV, true, WORK);

  assert.match(said.standing, /Say what is\./);
  assert.ok(!disk.exists(join(WORK, ".se/box.json")), "the reader mints no box");
});

// [[spec/design_output/level0#the-standing-layer]]
test("the counts read the notes the layer carries, so the sentence reads true", () => {
  const disk = holding(boxed(disks()), [{ name: "spec/guidance/voice", hash: "aa" }]);

  const said = guidanceHere(disk, METHOD, ENV, true, WORK);

  assert.equal(said.notes, 1);
  assert.equal(said.rules, 1);
});

// [[spec/design_output/level0#the-standing-layer]]
test("a spawned helper carries the layer whole, because its own hold stands elsewhere", () => {
  const disk = holding(boxed(disks()), [{ name: "spec/guidance/voice", hash: "aa" }]);

  const said = guidanceHere(disk, METHOD, ENV, true, WORK);

  assert.match(said.helper, /Say what is\./);
  assert.match(said.helper, /Answer the owner first\./);
});

// [[spec/design_output/pull#the-hand-and-the-hold]]
test("the reader answers the held step's notes off the worked tree, and mints nothing", () => {
  const disk = holding(boxed(disks()), [{ name: "spec/guidance/voice", hash: "aa" }]);

  assert.deepEqual(heldReadsIn(disk, join, WORK, ENV), ["spec/guidance/voice"]);
  assert.deepEqual(heldReadsIn(disks(), join, WORK, ENV), []);
});
