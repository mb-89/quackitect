// The verbs over two roots. A stub keeps its tickets, its notes and its holds
// under the work root, and reads the schema, the route and the guidance off
// the method root, the work root's note winning where it names one again.
// [[spec/design_output/vehicle#the-work-root-inherits]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { processHash } from "../../.claude/skills/level0/lib/schema.js";
import { fakeClock } from "../../src/doors/fake/clock.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeGit } from "../../src/doors/fake/git.js";
import { retro } from "../../src/scripts/retro.js";
import { probeOf } from "../../src/scripts/serve.js";
import { NOTES, ticket } from "../../src/scripts/ticket.js";
import { work } from "../../src/scripts/work.js";
import { NOTE_PROCESS, TICKET_SCHEMA as SCHEMA, TRIVIAL_PROCESS } from "./fixtures.js";

const METHOD = "/tools";
const WORK = "/stub";
const SHA = "b818c390c02737351bf1b73aba36a573d34d2ecc";
const BRANCH = "work/one-group";
const m = (path) => join(METHOD, ...path.split("/"));
const w = (path) => join(WORK, ...path.split("/"));

const note = (rule) => `---
kind: [[guidance]]
scope: ["everybody"]
---

# Actionables

1. ${rule}
`;

const GROUP = `---
kind: [[ticket]]
state: open
urgency: soon
process: [[group]]
step: children
steps:
  - name: children
    by: children
  - name: retro
    does: writes the retro
    to: owner
    evidence:
      - name: done
        form: list
        says: what was done
---

# Ask

Two tickets that land as one.

# children

# retro

## done

# Discussion
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
        does: names the note the approach stands in
        reads: [[spec/guidance/working]]
        evidence:
          - name: approach
            form: link
            says: the note the approach stands in
      - name: review
        does: reads the approach against the ask
        not: draft
        on_fail: draft
        input: draft
        to: retro
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

<!-- the note -->

## review

### verdict

<!-- pass or fail -->

# Discussion
`;

const STALE = `---
kind: [[ticket]]
state: open
urgency: soon
step: do
steps:
  - name: do
    does: makes the change the ask names
    to: retro
    evidence:
      - name: change
        form: text
        says: what you change
process: [[spec/processes/trivial]]
process_hash: 0000000000000000
---

# Ask

A small thing.

# do

## change

# Discussion
`;

function heard(what) {
  const lines = [];
  const wasLog = console.log;
  const wasError = console.error;
  console.log = (...said) => lines.push(said.join(" "));
  console.error = (...said) => lines.push(said.join(" "));
  try {
    return { code: what(), said: lines.join("\n") };
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
  // Nothing answers the port, so a cloud take starts the server detached. [[spec/design_output/level0#the-cloud-starts-the-server]]
  [probeOf("node", 6510).join(" ")]: { exitCode: 1 },
  node: { exitCode: 0, stdout: "" },
  sh: { exitCode: 0, stdout: "" },
  ...extra,
});

// The method root holds the rules, and the work root holds the files. [[spec/design_output/vehicle#one-tree-drives-itself]]
function roots(files = {}, answers = {}, more = {}) {
  const git = fakeGit(onBranch(answers), WORK);
  const files_ = fakeDisk({
    [m("spec/schemas/ticket.schema.yaml")]: SCHEMA,
    [m("spec/processes/note.yaml")]: NOTE_PROCESS,
    [m("spec/processes/trivial.yaml")]: TRIVIAL_PROCESS,
    [m("spec/guidance/voice.md")]: note("The vehicle's voice rule."),
    [m("spec/guidance/working.md")]: note("The vehicle's working rule."),
    [w("spec/guidance/voice.md")]: note("The stub's voice rule."),
    [w(".se/box.json")]: JSON.stringify({ id: "d462e994b4cef" }),
    ...files,
  });
  const it = {
    proc: git.proc,
    disk: files_,
    git,
    join,
    clock: fakeClock(),
    agent: true,
    cloud: true,
    node: "node",
    words: 5,
    method: METHOD,
    work: WORK,
    ...more,
  };
  return { it, disk: files_, git };
}

test("ticket note writes under the work root, off the note process under the method root", () => {
  const { it, disk } = roots();
  const ran = heard(() => ticket(WORK, ["note", "slow-lint", "The", "lint", "drags."], it));

  assert.equal(ran.code, 0, ran.said);
  assert.ok(disk.exists(w(`${NOTES}/slow-lint.md`)), "the note stands under the work root");
  assert.ok(!disk.exists(m(`${NOTES}/slow-lint.md`)), "and nothing lands in the method root");
  assert.match(disk.read(w(`${NOTES}/slow-lint.md`)), /^process: \[\[spec\/processes\/note\]\]$/m);
});

test("ticket update reads the route off the method root, and writes the ticket under the work root", () => {
  const { it, disk } = roots({ [w("spec/tickets/small.md")]: STALE });
  const ran = heard(() => ticket(WORK, ["update", "small"], it));

  assert.equal(ran.code, 0, ran.said);
  const text = disk.read(w("spec/tickets/small.md"));
  assert.match(text, new RegExp(`^process_hash: ${processHash(TRIVIAL_PROCESS)}$`, "m"));
  assert.ok(!disk.exists(m("spec/tickets/small.md")), "the method root keeps no ticket of the stub's");
});

test("retro notes reads the private notes under the work root", () => {
  const { it } = roots({
    [w(`${NOTES}/a-doubt.md`)]: "---\nkind: [[ticket]]\nstate: open\n---\n\n# Ask\n\nA doubt.\n",
  });
  const ran = heard(() => retro(WORK, ["notes"], it));
  assert.equal(ran.code, 1);
  assert.match(ran.said, /1 note\(s\) stand open/);
});

// [[spec/design_output/pull#what-a-hand-out-reads]]
test("the pull hands out the work root's ticket, and the guidance reads the stub's note over the vehicle's", () => {
  const { it } = roots({
    [w("spec/tickets/one-group.md")]: GROUP,
    [w("spec/tickets/a-child.md")]: CHILD,
  });
  const { code, said } = heard(() => work(WORK, ["pull"], it));

  assert.equal(code, 0, said);
  assert.match(said, /^work {2}a-child at design\/draft/m, "the stub's child comes");
  assert.match(said, /The stub's voice rule/, "the work root's note replaces the vehicle's");
  assert.ok(!said.includes("The vehicle's voice rule"), "the replaced note stays out");
  assert.match(said, /The vehicle's working rule/, "a note the work root lacks comes down");
});

// [[spec/design_output/pull#the-fields-hold-their-forms]]
test("a link a field names resolves in the work root first, then in the method root", () => {
  const { it, disk } = roots({
    [w("spec/tickets/one-group.md")]: GROUP,
    [w("spec/tickets/a-child.md")]: CHILD,
  });
  heard(() => work(WORK, ["pull"], it));
  disk.write(
    w("spec/tickets/a-child.md"),
    disk.read(w("spec/tickets/a-child.md")).replace("<!-- the note -->", "[[spec/guidance/working]]"),
  );

  const { code, said } = heard(() => work(WORK, ["pull", "a-child", "--pass"], it));
  assert.equal(code, 0, said);
  assert.match(said, /a-child passes design\/draft/);
  assert.match(disk.read(w("spec/tickets/a-child.md")), /^step: design\/review$/m);
});

// [[spec/design_output/pull#the-engine-takes-the-branch]]
test("on trunk a cloud box takes the group, and the record lands in the ticket under the work root", () => {
  const { it, disk, git } = roots(
    { [w("spec/tickets/one-group.md")]: GROUP.replace("step: children\n", "") },
    {
      "git rev-parse --abbrev-ref HEAD": { stdout: "main\n" },
      "git rev-list --count HEAD..origin/main": { stdout: "0\n" },
      "git ls-remote --heads origin work/*": { stdout: `${SHA}\trefs/heads/${BRANCH}\n` },
      [`git show origin/${BRANCH}:spec/tickets/one-group.md`]: { stdout: GROUP.replace("step: children\n", "") },
      "git branch -r --merged origin/main": { stdout: "" },
    },
  );
  const { code, said } = heard(() => work(WORK, ["pull"], it));

  assert.equal(code, 0, said);
  assert.match(said, /holds it|took/);
  assert.match(disk.read(w("spec/tickets/one-group.md")), /hash_before:/, "the take writes the record");
  assert.ok(
    git.ran.every((one) => one.init?.cwd === WORK),
    "every git command runs at the work root, because a stub is its own repository",
  );
});
