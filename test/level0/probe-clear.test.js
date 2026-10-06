// The dry probe's clear check: the conversation clears, the resume prompt opens
// the next one, and the read past it hands the leaf with no second clear.
// [[spec/tickets/the-clear-continues-the-session]] [[spec/tickets/the-clear-hands-back-the-leaf]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { RESUME } from "../../src/bridge/handover.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeProc } from "../../src/doors/fake/proc.js";
import { clearHeld, ENDS, grouped } from "../../src/scripts/probe-clear.js";

const FELL = { kind: "hook", said: "the clear the handover asks for fails", detail: "refused" };
// What the cycle past the clear leaves: the read in hand, the leaf in the read's answer, the commit, and the one clear. [[spec/tickets/the-clear-hands-back-the-leaf]]
const AFTER = {
  pulled: "work\n  read-handover stands in your hand.",
  read: "work\n  read-handover closes.\nwork  dry-probe-leaf at do, leaf 1 of 1",
  committed: { exit: 0, said: "" },
  clears: 1,
};

function run(over = {}) {
  return {
    cleared: {
      runs: [{ words: "handover --pass", exit: 0, said: "Level zero clears the conversation." }],
      commands: ["clear"],
      prompts: [RESUME],
      after: AFTER,
      ...over,
    },
  };
}

// [[spec/tickets/the-clear-runs-live-remote]]
test("the probe raises the Stop before the turn's completion, the order the live host names", () => {
  assert.deepEqual(ENDS, ["classic.Stop", "turn.complete"]);
});

test("a /clear followed by the resume prompt passes the clear", () => {
  assert.equal(clearHeld([], run()).pass, true);
});

test("no /clear, no resume prompt, a pull that falls, or no clear reached fails the clear", () => {
  assert.equal(clearHeld([], run({ commands: [] })).pass, false);
  assert.equal(clearHeld([], run({ prompts: ["carry on"] })).pass, false);
  assert.equal(clearHeld([], run({ runs: [{ words: "", exit: 1, said: "no ticket" }] })).pass, false);
  assert.equal(clearHeld([], {}).pass, false);
});

test("a pull that falls shows its last line, cut short", () => {
  const said = clearHeld([], run({ runs: [{ words: "", exit: 1, said: `first\n${"x".repeat(400)}` }] }));
  assert.match(said.evidence, /answers 1: x+$/);
  assert.ok(said.evidence.length < 400, "the evidence stays one short line");
});

// [[spec/tickets/the-clear-runs-live-remote]]
test("a pull that falls names what each pull before it answers", () => {
  const runs = [
    { words: "", exit: 0, said: "Call branch done." },
    { words: "handover --pass", exit: 1, said: "nothing stands in your hand." },
  ];
  const said = clearHeld([], run({ runs }));
  assert.equal(said.pass, false);
  assert.match(said.evidence, /^the pull alone answers Call branch done\.; the pull handover --pass answers 1: nothing stands/);
});

// Past the clear, each way the cycle loops fails the clear. [[spec/tickets/the-clear-hands-back-the-leaf]]
for (const [name, broken] of [
  ["the pull after the clear handing the clear again", { pulled: "work\n  clear stands in your hand." }],
  ["the read's pass handing the handover again", { read: "work\n  handover stands in your hand." }],
  ["the leaf's commit failing", { committed: { exit: 1, said: "nothing" } }],
  ["a second clear at the next turn's end", { clears: 2 }],
]) {
  test(`${name} fails the clear`, () => {
    assert.equal(clearHeld([], run({ after: { ...AFTER, ...broken } })).pass, false);
  });
}

test("a clear the plugin meets refused names the refusal", () => {
  const said = clearHeld([FELL], run({ commands: [] }));
  assert.equal(said.pass, false);
  assert.match(said.evidence, /the clear fails: refused/);
});

// A box's work branch stands on origin, so the probe's handover meets no work the box alone holds. [[spec/tickets/the-clear-carries-no-local-work]]
test("the probe mints its group, stands on its work branch, and points origin's branch at its tip", () => {
  const proc = fakeProc({ "/t/RUNME.sh": { exitCode: 0 }, git: { exitCode: 0 } });
  const disk = fakeDisk();
  const it = { proc, disk, join: (...parts) => parts.join("/") };

  assert.equal(grouped(it, "/t", {}), null);
  assert.match(String(disk.read("/t/spec/tickets/dry-probe-leaf.md")), /state: open[\s\S]*group: dry-probe-clears/);
  const lines = proc.ran.map((one) => one.argv.join(" "));
  assert.ok(lines.some((one) => /^git checkout -q -B work\//.test(one)), lines.join("\n"));
  assert.ok(lines.some((one) => /^git update-ref refs\/remotes\/origin\/work\/\S+ HEAD$/.test(one)), lines.join("\n"));
});

// A clone of a box's branch carries the tickets that box parks, and a parked ticket goes out ahead of the probe's leaf. [[spec/tickets/prompt-flags-follow-prompt-verb]]
test("the probe drops every park in its clone, and commits that before origin's branch points at its tip", () => {
  const git = (argv) => (argv[1] === "grep" ? { exitCode: 0, stdout: "spec/tickets/parked.md\n" } : { exitCode: 0 });
  const proc = fakeProc({ "/t/RUNME.sh": { exitCode: 0 }, git });
  const disk = fakeDisk();
  disk.write("/t/spec/tickets/parked.md", "---\nkind: [[ticket]]\nstate: open\ntodo: true\nstep: do\n---\n");
  const it = { proc, disk, join: (...parts) => parts.join("/") };

  assert.equal(grouped(it, "/t", {}), null);
  assert.equal(disk.read("/t/spec/tickets/parked.md"), "---\nkind: [[ticket]]\nstate: open\nstep: do\n---\n");
  const lines = proc.ran.map((one) => one.argv.join(" "));
  const committed = lines.findIndex((one) => /commit -q -m .* -- spec\/tickets\/parked\.md$/.test(one));
  const pointed = lines.findIndex((one) => /^git update-ref /.test(one));
  assert.ok(committed >= 0 && committed < pointed, lines.join("\n"));
});

// A verb reads QUACKITECT_ROOT before its folder, so a probe under the index still writes in its clone. [[spec/tickets/the-clear-carries-no-local-work]]
test("the probe's mint names the clone as its root, whatever root the parent carries", () => {
  const proc = fakeProc({ "/t/RUNME.sh": { exitCode: 0 }, git: { exitCode: 0 } });
  const it = { proc, disk: fakeDisk(), join: (...parts) => parts.join("/") };

  grouped(it, "/t", { QUACKITECT_ROOT: "/srv/tree" });
  const minted = proc.ran.find((one) => one.argv.includes("mint"));
  assert.equal(minted.init.env.QUACKITECT_ROOT, "/t");
});
