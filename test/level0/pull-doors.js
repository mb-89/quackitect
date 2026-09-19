// The doors every pull case drives: a ticket in a map, git answering from a
// table, and a group with one child. The cases themselves stand in the files
// beside this one, one file a topic.
// [[spec/design_output/pull#the-answers]]
import { join } from "node:path";
import { fakeClock } from "../../src/doors/fake/clock.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeGit } from "../../src/doors/fake/git.js";
import { SCHEMA } from "./pull-schema.js";
export const ROOT = "/tree",
  SHA = "b818c390c02737351bf1b73aba36a573d34d2ecc";
export const BRANCH = "work/one-group";
export const HAND = "box d462e994b4cef";
export const HOLD = join(ROOT, ".se/.runtime/hold/box-d462e994b4cef.json");
export const at = (path) => join(ROOT, ...path.split("/"));

export function heard(what) {
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

export const onBranch = (extra = {}) => ({
  "git rev-parse --abbrev-ref HEAD": { stdout: `${BRANCH}\n` },
  "git rev-parse HEAD": { stdout: `${SHA}\n` },
  [`git rev-list --count HEAD..origin/${BRANCH}`]: { stdout: "0\n" },
  "git status --porcelain": { stdout: "" },
  sh: { exitCode: 0, stdout: "" },
  ...extra,
});

export function doors(files, answers = {}, more = {}) {
  const said = fakeGit(onBranch(answers), ROOT);
  const disk = fakeDisk({
    [at("spec/schemas/ticket.schema.yaml")]: SCHEMA,
    [at(".se/.runtime/box.json")]: JSON.stringify({ id: "d462e994b4cef" }),
    [at("spec/guidance/voice.md")]:
      "---\nkind: [[guidance]]\n---\n\n# Actionables\n\n1. Say what is. *\n2. Put the bottom line first.\n",
    ...files,
  });
  const it = {
    proc: said.proc,
    disk,
    git: said,
    join,
    method: ROOT,
    work: ROOT,
    clock: fakeClock(),
    agent: true,
    cloud: true,
    // A case names its own environment, so the box running it changes no answer. [[spec/guidance/code/testing]]
    env: {},
    node: "node",
    ...more,
  };
  return { it, outside: said, disk };
}

export const ranGit = (said) => said.ran.map((one) => one.argv.join(" "));

export const GROUP_NOTE = `---
kind: [[ticket]]
state: open
urgency: soon
process: [[group]]
steps:
  - name: sync
    does: takes trunk in
    when: cloud
    evidence:
      - name: sync
        form: command
        expects: 0
        says: the sync
  - name: split
    does: mints the children
    to: retro
    evidence:
      - name: children
        form: list
        says: every child
  - name: children
    by: children
    on_fail: split
  - name: retro
    steps:
      - name: notes
        does: drains the notes
        needs: ["retro notes"]
        evidence:
          - name: drained
            form: command
            expects: 0
            says: retro notes
      - name: cloud
        does: names what the box lacked
        when: cloud
        to: owner
        evidence:
          - name: lacked
            form: list
            says: what the box lacked
---

# Ask

Two tickets that land as one.

# sync

## sync

# split

## children

# children

# retro

## notes

### drained

## cloud

### lacked

# Discussion
`;

export const CHILD = (state = "open", step = "design/draft", more = "") => `---
kind: [[ticket]]
state: ${state}
urgency: now
${step ? `step: ${step}\n` : ""}steps:
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
  - name: implement
    checklist: ["touches no file the ask leaves out", "every door has a fake"]
    steps:
      - name: tests-red
        does: writes the tests
        evidence:
          - name: tests
            form: command
            expects: assertion
            says: the tests fail on their own assertion
      - name: reflect
        does: names the class of error
        when: returned
        to: retro
        evidence:
          - name: class
            form: text
            says: the class
      - name: change
        does: makes the change
        evidence:
          - name: lint
            form: command
            expects: 0
            says: the tree lints
group: one-group
${more}---

# Ask

One piece of it.

# design

## draft

### approach

<!-- the approach -->

## review

### verdict

<!-- pass or fail -->

# implement

## tests-red

### tests

## reflect

### class

## change

### lint

# Discussion
`;

export const filled = (text, heading, rows) =>
  text.replace(`${heading}\n`, `${heading}\n\n${rows}\n`);

export const standing = (child = CHILD(), group = GROUP_NOTE, extra = {}) => ({
  [at("spec/tickets/one-group.md")]: group,
  [at("spec/tickets/a-child.md")]: child,
  ...extra,
});
