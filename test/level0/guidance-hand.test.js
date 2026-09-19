// The guidance a hand holds with its step, driven through fake doors. The pull
// logs what it hands over, the verb answers it again, and the standing layer
// drops what a step already reads.
// [[spec/design_output/pull#the-work-answer]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { standingLayer } from "../../.claude/skills/level0/lib/guidance.js";
import { fakeClock } from "../../src/doors/fake/clock.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeGit } from "../../src/doors/fake/git.js";
import { fakeLog } from "../../src/doors/fake/log.js";
import { heldReads } from "../../src/scripts/guidance-hand.js";
import { pulling, work } from "../../src/scripts/work.js";
import { SCHEMA } from "./pull-schema.js";

const ROOT = "/tree",
  SHA = "b818c390c02737351bf1b73aba36a573d34d2ecc";
const BRANCH = "work/one-group";
const HOLD = join(ROOT, ".se/.runtime/hold/box-d462e994b4cef.json");
const at = (path) => join(ROOT, ...path.split("/"));
const VOICE =
  "---\nkind: [[guidance]]\n---\n\n# Actionables\n\n1. Say what is. *\n2. Put the bottom line first.\n";
const WORKING =
  '---\nkind: [[guidance]]\nscope: ["every session"]\n---\n\n# Actionables\n\n1. Answer the owner first. *\n';

async function heard(what) {
  const lines = [];
  const wasLog = console.log;
  const wasError = console.error;
  console.log = (...said) => lines.push(said.join(" "));
  console.error = (...said) => lines.push(said.join(" "));
  try {
    return { code: await what(), said: lines.join("\n") };
  } finally {
    console.log = wasLog;
    console.error = wasError;
  }
}

const onBranch = (extra = {}) => ({
  "git rev-parse --abbrev-ref HEAD": { stdout: `${BRANCH}\n` },
  "git rev-parse HEAD": { stdout: `${SHA}\n` },
  [`git rev-list --count HEAD..origin/${BRANCH}`]: { stdout: "0\n" },
  "git status --porcelain": { stdout: "" },
  sh: { exitCode: 0, stdout: "" },
  ...extra,
});

function doors(files, answers = {}, more = {}) {
  const said = fakeGit(onBranch(answers), ROOT);
  const disk = fakeDisk({
    [at("spec/schemas/ticket.schema.yaml")]: SCHEMA,
    [at(".se/.runtime/box.json")]: JSON.stringify({ id: "d462e994b4cef" }),
    [at("spec/guidance/voice.md")]: VOICE,
    [at("spec/guidance/working.md")]: WORKING,
    ...files,
  });
  const it = {
    proc: said.proc,
    disk,
    git: said,
    join,
    clock: fakeClock(),
    agent: true,
    cloud: true,
    node: "node",
    log: fakeLog(fakeClock(), { folder: "/log", id: "a6f8c43b" }),
    ...more,
  };
  return { it, outside: said, disk };
}

const GROUP_NOTE = `---
kind: [[ticket]]
state: open
urgency: soon
process: [[group]]
steps:
  - name: children
    by: children
    on_fail: split
---

# Ask

One group.
`;

const CHILD = `---
kind: [[ticket]]
state: open
urgency: now
step: design/draft
steps:
  - name: design
    reads: [[spec/guidance/voice]]
    steps:
      - name: draft
        does: writes the approach the ask calls for
        evidence:
          - name: approach
            form: text
            says: the approach
      - name: review
        does: reads the approach against the ask
        not: draft
        on_fail: draft
        input: draft
        evidence:
          - name: verdict
            form: verdict
            says: pass or fail
group: one-group
---

# Ask

One piece of it.

# design

## draft

### approach

<!-- the approach -->

## review

### verdict

<!-- pass or fail -->

# Discussion
`;

const standing = (extra = {}) => ({
  [at("spec/tickets/one-group.md")]: GROUP_NOTE,
  [at("spec/tickets/a-child.md")]: CHILD,
  ...extra,
});

const holdIn = (disk) => JSON.parse(disk.read(HOLD));
const putHold = (disk, hold) => disk.write(HOLD, `${JSON.stringify(hold, null, 2)}\n`);

// [[spec/design_output/pull#the-work-answer]]
test("the hand-out writes one log row per note it hands over, naming the note and its hash", async () => {
  const { it, disk } = doors(standing());

  const { code } = await heard(() => pulling(ROOT, ["pull"], it));

  assert.equal(code, 0);
  const rows = it.log.lines().filter((one) => one.note);
  assert.equal(rows.length, 1, "one row lands per note the pull hands over");
  assert.equal(rows[0].note, "spec/guidance/voice");
  assert.equal(rows[0].hash, holdIn(disk).reads[0].hash);
  assert.equal(rows[0].step, "design/draft");
});

// [[spec/design_output/pull#the-work-answer]]
test("branch guidance answers the held step's notes and the always-on ones", async () => {
  const { it } = doors(standing());
  await heard(() => pulling(ROOT, ["pull"], it));

  const { code, said } = await heard(() => work(ROOT, ["guidance"], it));

  assert.equal(code, 0);
  assert.match(said, /spec\/guidance\/voice/);
  assert.match(said, /Say what is\./);
  assert.match(said, /spec\/guidance\/working/);
  assert.match(said, /Answer the owner first\./);
});

// [[spec/design_output/pull#the-work-answer]]
test("branch guidance names one note and answers that note alone", async () => {
  const { it } = doors(standing());
  await heard(() => pulling(ROOT, ["pull"], it));

  const { code, said } = await heard(() =>
    work(ROOT, ["guidance", "spec/guidance/voice"], it),
  );

  assert.equal(code, 0);
  assert.match(said, /Say what is\./);
  assert.ok(!/Answer the owner first\./.test(said), "a named note answers alone");
});

// [[spec/design_output/pull#the-work-answer]]
test("branch guidance with no hold standing says so, and names the pull", async () => {
  const { it } = doors(standing());

  const { code, said } = await heard(() => work(ROOT, ["guidance"], it));

  assert.equal(code, 1);
  assert.match(said, /ticket pull/);
});

// [[spec/design_output/pull#the-hand-and-the-hold]]
test("a second hand-out at one step says the short line, and hands no note again", async () => {
  const { it } = doors(standing());
  await heard(() => pulling(ROOT, ["pull"], it));

  const { code, said } = await heard(() => pulling(ROOT, ["pull"], it));

  assert.equal(code, 1);
  assert.match(said, /branch guidance/);
  assert.ok(!/Say what is\./.test(said), "an unmoved hash hands no note again");
});

// [[spec/design_output/pull#the-hand-and-the-hold]]
test("a refusal standing on the hold hands the notes again", async () => {
  const { it, disk } = doors(standing());
  await heard(() => pulling(ROOT, ["pull"], it));
  putHold(disk, { ...holdIn(disk), refused: 1 });

  const { said } = await heard(() => pulling(ROOT, ["pull"], it));

  assert.match(said, /Say what is\./);
});

// [[spec/design_output/pull#the-hand-and-the-hold]]
test("a compaction, which empties the hold's reads, hands the notes again", async () => {
  const { it, disk } = doors(standing());
  await heard(() => pulling(ROOT, ["pull"], it));
  putHold(disk, { ...holdIn(disk), reads: [] });

  const { said } = await heard(() => pulling(ROOT, ["pull"], it));

  assert.match(said, /Say what is\./);
});

// [[spec/design_output/pull#the-hand-and-the-hold]]
test("a note whose hash moved hands again, and the row says the hash moved", async () => {
  const { it, disk } = doors(standing());
  await heard(() => pulling(ROOT, ["pull"], it));
  const hold = holdIn(disk);
  putHold(disk, { ...hold, reads: [{ ...hold.reads[0], hash: "0000000000000000" }] });

  const { said } = await heard(() => pulling(ROOT, ["pull"], it));

  assert.match(said, /Say what is\./);
});

// [[spec/design_output/level0#the-standing-layer]]
test("a note a step reads leaves the standing layer, and the rest of the layer stands", async () => {
  const notes = [
    { name: "voice.md", text: VOICE },
    { name: "working.md", text: WORKING },
  ];

  const said = standingLayer(notes, ["spec/guidance/voice"]);

  assert.ok(!/Say what is\./.test(said), "the note the step reads leaves the layer");
  assert.match(said, /Answer the owner first\./);
});

// [[spec/design_output/pull#the-hand-and-the-hold]]
test("the verb reads the hand --as names, and answers that hand's notes", async () => {
  const { it } = doors(standing());
  await heard(() => pulling(ROOT, ["pull", "--as", "helper-2"], it));

  const { code, said } = await heard(() =>
    work(ROOT, ["guidance", "--as", "helper-2"], it),
  );

  assert.equal(code, 0);
  assert.match(said, /Say what is\./);
});

// [[spec/design_output/pull#the-work-answer]]
test("a name reaching no note refuses, and says what it looked for", async () => {
  const { it } = doors(standing());
  await heard(() => pulling(ROOT, ["pull"], it));

  const { code, said } = await heard(() =>
    work(ROOT, ["guidance", "spec/guidance/nowhere"], it),
  );

  assert.equal(code, 1);
  assert.match(said, /spec\/guidance\/nowhere names no note/);
});

// [[spec/design_output/level0#the-standing-layer]]
test("the standing verb drops the note the hand --as names already reads", async () => {
  const { it } = doors(standing());
  await heard(() => pulling(ROOT, ["pull", "--as", "helper-2"], it));
  const notes = [
    { name: "voice.md", text: VOICE },
    { name: "working.md", text: WORKING },
  ];

  const said = standingLayer(
    notes,
    heldReads({ ...it, root: ROOT }, ["--as", "helper-2"]),
  );

  assert.ok(!/Say what is\./.test(said), "the held step's note leaves the layer");
  assert.match(said, /Answer the owner first\./);
});
