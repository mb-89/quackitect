// A group whose one open child waits for a person. The pull takes no step here,
// and the answer it writes is the whole point: the commands that carry the
// question out of the branch, so the rest of the group lands.
// [[spec/design_output/work#a-person-step-leaves]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { fakeClock } from "../../src/doors/fake/clock.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeGit } from "../../src/doors/fake/git.js";
import { onward } from "../../src/scripts/pull-writes.js";
import { unblockPrompt } from "../../src/scripts/pull-spawn.js";
import { pulling } from "../../src/scripts/work.js";
import { SCHEMA } from "./pull-schema.js";

const ROOT = "/tree";
const SHA = "b818c390c02737351bf1b73aba36a573d34d2ecc";
const BRANCH = "work/one-group";
const at = (path) => join(ROOT, ...path.split("/"));

const GROUP = `---
kind: [[ticket]]
state: open
urgency: soon
process: [[group]]
step: children
steps:
  - name: children
    by: children
---

# Ask

One ticket that lands as one.

# children

# Discussion
`;

const ASKS = `---
kind: [[ticket]]
state: open
urgency: now
step: design/person-1
steps:
  - name: design
    steps:
      - name: person-1
        does: answers the question the engine asks
        by: person
        to: engine
        asks: which name does the plugin take?
        evidence:
          - name: answer
            form: text
            says: the answer
      - name: draft
        does: writes the approach the ask calls for
        evidence:
          - name: approach
            form: text
            says: the approach
group: one-group
---

# Ask

One piece of it.

# design

## person-1

### answer

## draft

### approach

# Discussion
`;

function doors(more = {}) {
  const said = fakeGit(
    {
      "git rev-parse --abbrev-ref HEAD": { stdout: `${BRANCH}\n` },
      "git rev-parse HEAD": { stdout: `${SHA}\n` },
      [`git rev-list --count HEAD..origin/${BRANCH}`]: { stdout: "0\n" },
      "git status --porcelain": { stdout: "" },
      sh: { exitCode: 0, stdout: "" },
    },
    ROOT,
  );
  const disk = fakeDisk({
    [at("spec/schemas/ticket.schema.yaml")]: SCHEMA,
    [at(".se/.runtime/box.json")]: JSON.stringify({ id: "d462e994b4cef" }),
    [at("spec/tickets/one-group.md")]: GROUP,
    [at("spec/tickets/a-child.md")]: ASKS,
  });
  return {
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
}

function heard(run) {
  const rows = [];
  const wasLog = console.log;
  const wasError = console.error;
  console.log = (...said) => rows.push(said.join(" "));
  console.error = (...said) => rows.push(said.join(" "));
  try {
    const code = run();
    return { code, said: rows.join("\n") };
  } finally {
    console.log = wasLog;
    console.error = wasError;
  }
}

// The road out of the branch is a desk's, so this case sits at one. [[spec/design_output/work#a-person-step-leaves]]
test("the pull names the mint, the open and the unblock where a person's step is all that stands", () => {
  const { said } = heard(() => pulling(ROOT, ["pull"], doors({ cloud: false })));

  assert.match(said, /a-child waits for a person at design\/person-1/);
  assert.match(
    said,
    /--process=question/,
    "the answer names the route a successor takes",
  );
  assert.match(said, /ticket open <name>/, "the answer opens the successor");
  assert.match(
    said,
    /branch unblock a-child <name>/,
    "the answer hands the question out",
  );
  assert.match(said, /branch done/, "the answer lands the rest of the group");
});

// A cloud box answers every question it meets, so that step stands open to it. [[spec/guidance/cloud]]
test("a cloud box takes the person's step, and the answer names no unblock", () => {
  const { said } = heard(() =>
    pulling(
      ROOT,
      ["pull"],
      doors({ cloud: undefined, env: { CLAUDE_CODE_REMOTE: "1" } }),
    ),
  );

  assert.match(said, /a-child at design\/person-1/);
  assert.ok(!said.includes("waits for a person"));
  assert.ok(!said.includes("branch unblock"));
});

// [[spec/design_output/pull#the-hand-rule]]
test("a hand the owner sends takes a person's step, and the record names both", () => {
  const it = doors();
  const { said } = heard(() => pulling(ROOT, ["pull", "--owner-says"], it));

  assert.match(
    said,
    /a-child at design\/person-1/,
    "the hand the owner sends takes the step",
  );
  assert.doesNotMatch(said, /waits for a person/);

  const folder = join(ROOT, ".se", ".runtime", "hold");
  const held = it.disk
    .list(folder)
    .map((one) => it.disk.read(join(folder, one.name)))
    .join("\n");
  assert.match(
    held,
    /the owner says so/,
    "the record names the hand and the word behind it",
  );
});

// The hold a hand writes carries its name, so a word that outlives its step leaves an orphan. [[spec/design_output/pull#the-hand-rule]]
test("the owner's word covers one step, and the hand after it reads plain", () => {
  const it = { ...doors(), root: ROOT };
  it.ownerSays = true;
  const who = {
    hand: "box one · the owner says so",
    plainHand: "box one",
    oneStep: true,
  };

  heard(() => onward(it, who, ["a-child passes design/person-1."]));

  assert.equal(who.hand, "box one", "the hand after it reads plain");
  assert.equal(it.ownerSays, false, "the word reaches no leaf past its own");
});

// The verb refuses a successor opening under any other hand, so the route it names opens under a person. [[spec/design_output/work#a-person-step-leaves]]
test("the prompt names one route, and that route opens under a person", () => {
  const said = unblockPrompt("a-child", { path: "design/person-1" });

  assert.match(said, /a-child stands at design\/person-1/);
  assert.equal(said.includes("--process=question"), true);
  assert.match(said, /Stop for no person\./);
});
