// The layer a session opens with, driven over a fake disk. A held step's notes
// ride the step, so the layer hands them no second time.
// [[spec/design_output/level0#the-standing-layer]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { guidanceHere, layerHere, onAgentSpawn } from "../../src/bridge/guidance.js";
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
// A note whose scope names the hand it binds. [[spec/tickets/the-spawn-reaches-its-guidance]]
const REFACTORING =
  '---\nkind: [[guidance]]\nscope: ["refactor: the hand a session starts"]\n---\n\n# Actionables\n\n1. Take the one file your prompt names.\n';
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
  disk.write(join(WORK, ".se/.runtime/box.json"), JSON.stringify({ id: BOX }));
  return disk;
};

const holding = (disk, reads) => {
  disk.write(
    join(WORK, `.se/.runtime/hold/${HAND.replace(/[^A-Za-z0-9]+/g, "-")}.json`),
    `${JSON.stringify(hold(reads), null, 2)}\n`,
  );
  return disk;
};

// [[spec/design_output/level0#the-standing-layer]]
test("a hold standing drops the note its step reads from the layer a session opens with", () => {
  const disk = holding(boxed(disks()), [{ name: "spec/guidance/voice", hash: "aa" }]);

  const said = guidanceHere(disk, METHOD, WORK, ENV, true);

  assert.ok(
    !/Say what is\./.test(said.standing),
    "the held step's note leaves the layer",
  );
  assert.match(said.standing, /Answer the owner first\./);
});

// [[spec/design_output/level0#the-standing-layer]]
test("no hold standing leaves the layer whole", () => {
  const disk = boxed(disks());

  const said = guidanceHere(disk, METHOD, WORK, ENV, true);

  assert.match(said.standing, /Say what is\./);
  assert.match(said.standing, /Answer the owner first\./);
});

// [[spec/design_output/level0#the-standing-layer]]
test("no box file leaves the layer whole, and the reader mints none", () => {
  const disk = disks();

  const said = guidanceHere(disk, METHOD, WORK, ENV, true);

  assert.match(said.standing, /Say what is\./);
  assert.ok(
    !disk.exists(join(WORK, ".se/.runtime/box.json")),
    "the reader mints no box",
  );
});

// [[spec/design_output/level0#the-standing-layer]]
test("the counts read the notes the layer carries, so the sentence reads true", () => {
  const disk = holding(boxed(disks()), [{ name: "spec/guidance/voice", hash: "aa" }]);

  const said = guidanceHere(disk, METHOD, WORK, ENV, true);

  assert.equal(said.notes, 1);
  assert.equal(said.rules, 1);
});

// [[spec/design_output/level0#the-standing-layer]]
test("a spawned helper carries the layer whole, because its own hold stands elsewhere", () => {
  const disk = holding(boxed(disks()), [{ name: "spec/guidance/voice", hash: "aa" }]);

  const said = guidanceHere(disk, METHOD, WORK, ENV, true);

  assert.match(said.helper, /Say what is\./);
  assert.match(said.helper, /Answer the owner first\./);
});

// [[spec/tickets/the-spawn-reaches-its-guidance]]
test("a note binding a kind stands off the session and the helper, and its own layer holds it", () => {
  const disk = boxed(
    disks({ [join(METHOD, "spec/guidance/code/refactoring.md")]: REFACTORING }),
  );

  const said = guidanceHere(disk, METHOD, WORK, ENV, true);

  assert.ok(
    !/Take the one file/.test(said.standing),
    "the working hand reads it nowhere",
  );
  assert.ok(!/Take the one file/.test(said.helper), "a helper reads it nowhere");
  assert.match(said.layers.refactor, /Take the one file/);
  assert.match(said.layers.refactor, /Say what is\./);
  assert.equal(said.notes, 2, "the canary counts what the session holds");
});

// [[spec/tickets/the-spawn-reaches-its-guidance]]
test("a spawn names its kind, and the layer of that kind reaches that hand alone", () => {
  const guidance = {
    standing: "the session",
    helper: "a helper",
    layers: { refactor: "the hand" },
  };

  assert.equal(layerHere(guidance, "refactor"), "the hand");
  assert.equal(layerHere(guidance, ""), "a helper");
  assert.equal(layerHere(guidance, "nobody"), "a helper");
  assert.equal(layerHere({ standing: "the session" }, "refactor"), "the session");
});

// A restart hands the box over bare, and the spawn still hands the layer. [[spec/design_output/level0#a-restart-fills-the-box]]
test("a spawn on a box a restart hands over bare reads the guidance, and hands the layer", () => {
  const box = {
    disk: boxed(disks()),
    method: METHOD,
    work: WORK,
    env: ENV,
    log: { say() {} },
  };
  const said = onAgentSpawn({ prompt: "Work.", subagentType: "general-purpose" }, box);
  assert.match(String(said?.event?.prompt ?? ""), /Say what is\./);
  assert.ok(box.guidance, "the accessor fills the box");
});

// [[spec/design_output/pull#the-hand-and-the-hold]]
test("the reader answers the held step's notes off the worked tree, and mints nothing", () => {
  const disk = holding(boxed(disks()), [{ name: "spec/guidance/voice", hash: "aa" }]);

  assert.deepEqual(heldReadsIn(disk, join, WORK, ENV), ["spec/guidance/voice"]);
  assert.deepEqual(heldReadsIn(disks(), join, WORK, ENV), []);
});
