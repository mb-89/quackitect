// The unblock verb, driven through fake doors. A ticket stands in a map, git
// answers from a table, and every answer runs in memory.
// [[spec/design_output/work#a-person-step-leaves]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { fakeClock } from "../../src/doors/fake/clock.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeGit } from "../../src/doors/fake/git.js";
import { fieldOf } from "../../src/scripts/group.js";
import { takeable } from "../../src/scripts/pull.js";
import { work } from "../../src/scripts/work.js";

const ROOT = "/tree",
  SHA = "b818c390c02737351bf1b73aba36a573d34d2ecc";
const BRANCH = "work/one-group";
const at = (path) => join(ROOT, ...path.split("/"));

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

const CHILD = (step = "implement/person-1", more = "") => `---
kind: [[ticket]]
state: open
urgency: soon
step: ${step}
steps:
  - name: design
    evidence:
      - name: approach
        form: text
        says: the approach
  - name: implement
    steps:
      - name: person-1
        does: answers the question the engine asks
        by: person
        to: engine
        asks: "the verdict failed back 2 times: no test drives the hook"
        evidence:
          - name: answer
            form: text
            says: the answer
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

## approach

<!-- the approach -->

# implement

## person-1

### answer

<!-- the answer -->

## change

### lint
`;

const SUCCESSOR = `---
kind: [[ticket]]
state: open
urgency: soon
steps:
  - name: do
    does: answers the question the person step asks
    by: person
    evidence:
      - name: lint
        form: command
        expects: 0
        says: the tree lints
---

# Ask

What the person decides, and what rides on it.

# do

## lint

# Discussion

Nothing stands here yet.
`;

const GROUP_NOTE = `---
kind: [[ticket]]
state: open
urgency: soon
step: children
steps:
  - name: children
    by: children
---

# Ask

The group itself.

# children
`;

const onBranch = (extra = {}) => ({
  "git rev-parse --abbrev-ref HEAD": { stdout: `${BRANCH}\n` },
  "git rev-parse HEAD": { stdout: `${SHA}\n` },
  "git status --porcelain": { stdout: "" },
  sh: { exitCode: 0, stdout: "" },
  ...extra,
});

function doors(files, answers = {}, more = {}) {
  const said = fakeGit(onBranch(answers), ROOT);
  const disk = fakeDisk({
    [at(".se/.runtime/box.json")]: JSON.stringify({ id: "d462e994b4cef" }),
    ...files,
  });
  return {
    it: {
      proc: said.proc,
      disk,
      git: said,
      join,
      clock: fakeClock(),
      agent: true,
      // This verb is a desk's, and a case driving the cloud road says so. [[spec/guidance/cloud]]
      cloud: false,
      env: {},
      ...more,
    },
    disk,
  };
}

const standing = (child = CHILD(), extra = {}) => ({
  [at("spec/tickets/one-group.md")]: GROUP_NOTE,
  [at("spec/tickets/a-child.md")]: child,
  [at("spec/tickets/a-successor.md")]: SUCCESSOR,
  ...extra,
});

// A cloud box answers the step itself, so it hands nothing out. [[spec/guidance/cloud]]
test("unblock refuses a cloud box, and names the pull instead", () => {
  const { it, disk } = doors(standing(), {}, { cloud: true });

  const { code, said } = heard(() =>
    work(ROOT, ["unblock", "a-child", "a-successor"], it),
  );

  assert.equal(code, 2);
  assert.match(said, /hands no question out/);
  assert.match(said, /ticket pull a-child/);
  assert.equal(fieldOf(disk.read(at("spec/tickets/a-child.md")), "state"), "open");
});

// [[spec/design_output/work#a-person-step-leaves]]
test("unblock closes a child waiting on a person, and names its successor", () => {
  const { it, disk } = doors(standing());

  const { code, said } = heard(() =>
    work(ROOT, ["unblock", "a-child", "a-successor"], it),
  );

  assert.equal(code, 0);
  const now = disk.read(at("spec/tickets/a-child.md"));
  assert.equal(fieldOf(now, "state"), "closed", "the child closes");
  assert.equal(fieldOf(now, "reason"), "became", "it closes as became");
  assert.match(now, /successors: \[a-successor\]/, "it names its successor");
  assert.match(said, /a-child closes became a-successor/);
});

// [[spec/design_output/work#a-person-step-leaves]]
test("the successor carries the question the person step asks, and the ticket it comes from", () => {
  const { it, disk } = doors(standing());

  heard(() => work(ROOT, ["unblock", "a-child", "a-successor"], it));

  const successor = disk.read(at("spec/tickets/a-successor.md"));
  assert.match(successor, /no test drives the hook/, "the question rides along");
  assert.match(
    successor,
    /\[\[spec\/tickets\/a-child\]\]/,
    "the successor names where it comes from",
  );
  assert.match(successor, /# Discussion/, "it lands under Discussion");
  assert.doesNotMatch(successor, /Nothing stands here yet/, "the empty line goes");
});

// A successor minted off trivial opens under by: anyone, so the pull hands a person's question to an agent. [[spec/design_output/work#a-person-step-leaves]]
test("unblock refuses a successor whose first step admits an agent", () => {
  for (const [by, shown] of [
    ["", "anyone"],
    ["anyone", "anyone"],
    ["agent", "agent"],
  ]) {
    const open = SUCCESSOR.replace("    by: person\n", by ? `    by: ${by}\n` : "");
    const { it, disk } = doors(
      standing(CHILD(), { [at("spec/tickets/a-successor.md")]: open }),
    );

    const { code, said } = heard(() =>
      work(ROOT, ["unblock", "a-child", "a-successor"], it),
    );

    assert.equal(code, 2, `by: ${shown} refuses`);
    assert.match(said, /waits for a person/, `by: ${shown} says why`);
    assert.match(said, new RegExp(shown), `by: ${shown} names what it read`);
    assert.equal(fieldOf(disk.read(at("spec/tickets/a-child.md")), "state"), "open");
  }
});

// The mint writes the chapter's description as a comment, and a hand writing there drops it. [[spec/design_output/work#a-person-step-leaves]]
test("the placeholder mint writes goes, so the chapter reads as what a hand wrote", () => {
  const minted = SUCCESSOR.replace(
    "Nothing stands here yet.",
    "<!-- what anybody adds, at any time, on this ticket -->",
  );
  const { it, disk } = doors(
    standing(CHILD(), { [at("spec/tickets/a-successor.md")]: minted }),
  );

  heard(() => work(ROOT, ["unblock", "a-child", "a-successor"], it));

  const successor = disk.read(at("spec/tickets/a-successor.md"));
  assert.doesNotMatch(successor, /<!--/, "the comment goes");
  assert.match(successor, /no test drives the hook/, "the question still rides along");
});

// [[spec/design_output/work#a-person-step-leaves]]
test("unblock refuses a child standing at a step an agent can take", () => {
  const { it, disk } = doors(standing(CHILD("implement/change")));

  const { code, said } = heard(() =>
    work(ROOT, ["unblock", "a-child", "a-successor"], it),
  );

  assert.equal(code, 2);
  assert.match(said, /implement\/change/);
  assert.match(said, /a hand can take/);
  assert.equal(fieldOf(disk.read(at("spec/tickets/a-child.md")), "state"), "open");
});

// [[spec/design_output/work#a-person-step-leaves]]
test("unblock refuses a successor standing inside the group it leaves", () => {
  const successor = SUCCESSOR.replace(
    "urgency: soon\n",
    "urgency: soon\ngroup: one-group\n",
  );
  const { it } = doors(
    standing(CHILD(), { [at("spec/tickets/a-successor.md")]: successor }),
  );

  const { code, said } = heard(() =>
    work(ROOT, ["unblock", "a-child", "a-successor"], it),
  );

  assert.equal(code, 2);
  assert.match(said, /a-successor stands in one-group/);
});

// [[spec/design_output/work#a-person-step-leaves]]
test("unblock names the successor it needs, and mints none of its own", () => {
  const { it } = doors(standing());

  const { code, said } = heard(() =>
    work(ROOT, ["unblock", "a-child", "no-such-next"], it),
  );

  assert.equal(code, 2);
  assert.match(said, /no-such-next stands nowhere yet/);
  assert.match(said, /mint ticket/);
});

// [[spec/design_output/work#a-person-step-leaves]]
test("a sibling waiting on the child it unblocks becomes takeable, so the chain runs on", () => {
  const waits = CHILD("design", "depends_on: [a-child]\n");
  const { it, disk } = doors(
    standing(CHILD(), { [at("spec/tickets/a-next.md")]: waits }),
  );
  const siblings = () => [
    { name: "a-child", text: disk.read(at("spec/tickets/a-child.md")) },
    { name: "a-next", text: disk.read(at("spec/tickets/a-next.md")) },
  ];

  assert.equal(takeable(it, siblings()[1], siblings()), "", "the open child holds it");

  const { code } = heard(() => work(ROOT, ["unblock", "a-child", "a-successor"], it));

  assert.equal(code, 0);
  assert.equal(
    takeable(it, siblings()[1], siblings()),
    "design",
    "the closed child frees it",
  );
});
