// The stop door over a fake box: a standing stop ends the turn with nothing
// after it, a helper's turn end passes untouched, and a turn with no stop
// line holds with the ask.
// [[spec/design_output/stop#a-standing-stop-ends-it]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { onStop } from "../../src/bridge/stop.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeProc } from "../../src/doors/fake/proc.js";

const ROOT = "/tree";
const at = (path) => join(ROOT, ...path.split("/"));

const RULES = `
- id: the-queue-holds-work
  side: continue
  priority: 80
  decides: mechanical
  runs: queue-waits
  firm: true
  says: The queue holds work for this box, so run ./RUNME.sh branch pull and carry on.

- id: the-last-line-names-no-stop
  side: continue
  priority: 50
  decides: mechanical
  runs: no-stop-line
  says: The last line names no stop reason, so this turn holds open.

- id: the-work-stands-complete
  side: stop
  priority: 45
  decides: claimed
  yields: true
  asks: Does the work stand complete?
  says: The work stands complete, so this turn ends.

- id: warnings-stand-past-the-number
  side: continue
  priority: 10
  decides: mechanical
  runs: warnings-standing
  says: The warnings stand past the number, and a hand drains them beside you.

- id: the-tooth-is-out
  side: continue
  priority: 0
  decides: mechanical
  runs: stop-hook-off
  says: The stop hook stands off.
`;

// [[spec/tickets/the-spawn-reaches-its-guidance]]
const REFACTOR = { parallel: true, mostWarnings: 2, mostAtOnce: 1, untouchedFor: "7d" };

const NOW = 1_800_000_000;
const WEEK = 604_800;

function box(files = {}, refactor = REFACTOR) {
  const disk = fakeDisk({
    [at("spec/config/level0.json")]: JSON.stringify({
      stop: { enabled: true, mostInARow: 3, hold: "off" },
      engine: { binding: "queue" },
      refactor,
    }),
    [at("spec/config/stop/level0.yml")]: RULES,
    ...files,
  });
  const said = [];
  return {
    said,
    box: {
      disk,
      work: ROOT,
      method: ROOT,
      env: {},
      clock: { now: () => new Date(NOW * 1000) },
      proc: fakeProc({
        "git rev-parse --abbrev-ref HEAD": { stdout: "main\n" },
        "git log -1 --format=%ct -- old.md": { stdout: `${NOW - WEEK * 2}\n` },
        "git log -1 --format=%ct -- new.md": { stdout: `${NOW - 60}\n` },
      }),
      log: { say: (...row) => said.push(row) },
    },
  };
}

// The stamp the check leaves, which the refactoring rule reads. [[spec/tickets/the-spawn-reaches-its-guidance]]
function stamped(warnings, names) {
  return {
    [at(".se/run/check.json")]: JSON.stringify({
      sha: "a1",
      ok: true,
      clean: true,
      at: "2026-01-01T00:00:00Z",
      warnings,
      files: names,
    }),
  };
}

test("a standing stop line ends the turn, and nothing prompts after it", () => {
  const it = box();
  const said = onStop(
    { last_assistant_message: "The work stands.\n\nstop: the-work-stands-complete" },
    it.box,
  );
  assert.deepEqual(said, { pass: true });
  assert.equal(
    it.said.filter((row) => row[1] === "stop").length,
    1,
    "one stop line in the log",
  );
  assert.match(it.said[0][2], /the turn ends/);
});

test("a helper's turn end passes untouched, so a refused helper answer reaches no owner turn", () => {
  const it = box();
  const said = onStop(
    { agentId: "a1", last_assistant_message: "No stop line here." },
    it.box,
  );
  assert.deepEqual(said, { pass: true });
  assert.equal(it.said.length, 0, "the door writes nothing for a helper");
});

test("a turn with no stop line holds, and the block names the reasons", () => {
  const it = box();
  const said = onStop({ last_assistant_message: "Some text and no stop." }, it.box);
  assert.match(said.result.block, /names no stop reason/);
  assert.match(
    said.result.block,
    /the-work-stands-complete: Does the work stand complete\?/,
  );
  assert.match(it.said[0][2], /the turn holds/);
  assert.match(
    it.said[0][3].prompts,
    /names no stop reason/,
    "the log carries what prompts after",
  );
});

// [[spec/tickets/the-spawn-reaches-its-guidance]]
test("the door answers the vote and the hand together, and the hand takes the file outside the window", () => {
  const it = box(stamped(9, ["old.md", "new.md"]));
  const said = onStop({ last_assistant_message: "Some text and no stop." }, it.box);

  assert.match(said.result.block, /names no stop reason/);
  assert.equal(said.spawn.kind, "refactor");
  assert.equal(said.spawn.file, "old.md");
  assert.match(said.spawn.prompt, /old\.md/);
  assert.equal(said.back.event, "refactor.answered");
});

// [[spec/tickets/the-spawn-reaches-its-guidance]]
test("the hand goes once a session, and the flag off starts none", () => {
  const it = box(stamped(9, ["old.md"]));
  const turn = { last_assistant_message: "Some text and no stop." };

  assert.equal(onStop(turn, it.box).spawn.file, "old.md");
  assert.equal(onStop(turn, it.box).spawn, undefined, "the count bounds the session");

  const off = box(stamped(9, ["old.md"]), { ...REFACTOR, parallel: false });
  assert.equal(onStop(turn, off.box).spawn, undefined);
});

// A rule reading the list alone holds every turn open on a tree carrying warnings. [[spec/tickets/the-spawn-reaches-its-guidance]]
test("the vote holds the turn open while a hand wants to go, and lets it end after", () => {
  const it = box(stamped(9, ["old.md"]));
  const done = { last_assistant_message: "Done.\n\nstop: the-work-stands-complete" };

  assert.match(onStop(done, it.box).result.block, /warnings stand past the number/);
  assert.deepEqual(onStop(done, it.box), { pass: true }, "the count spends, and the turn ends");

  const off = box(stamped(9, ["old.md"]), { ...REFACTOR, parallel: false });
  assert.deepEqual(onStop(done, off.box), { pass: true }, "the flag off holds no turn");
});

// [[spec/tickets/the-spawn-reaches-its-guidance]]
test("a list under the number starts no hand, and the vote reads the stamp", () => {
  const it = box(stamped(1, ["old.md"]));
  const said = onStop({ last_assistant_message: "Done.\n\nstop: the-work-stands-complete" }, it.box);

  assert.deepEqual(said, { pass: true });
});

test("the queue holds a stop on completion while a free ticket stands", () => {
  const free =
    "---\nkind: [[ticket]]\nstate: open\nurgency: soon\nsteps:\n  - name: do\n---\n\n# Ask\n\nA thing.\n";
  const it = box({ [at("spec/tickets/a-free.md")]: free });
  const said = onStop(
    { last_assistant_message: "Done.\n\nstop: the-work-stands-complete" },
    it.box,
  );
  assert.match(said.result.block, /The queue holds work for this box/);
});
