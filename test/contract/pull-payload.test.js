// The payload on a refused hand-back: it leaves the ticket as it stood, rides
// the hold, and reaches no person step. The schema is the tree's own, read
// once, and every other fixture stands in memory.
// [[spec/design_output/pull#the-fields-ride-the-payload]]

import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { disk as realDisk } from "../../src/doors/disk.js";
import { fakeClock } from "../../src/doors/fake/clock.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeGit } from "../../src/doors/fake/git.js";
import { work } from "../../src/scripts/work.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const SCHEMA = realDisk().read(join(HERE, "..", "..", "spec", "schemas", "ticket.schema.yaml"));
const ROOT = "/tree";
const SHA = "b818c390c02737351bf1b73aba36a573d34d2ecc";
const BRANCH = "work/one-group";
const at = (path) => join(ROOT, ...path.split("/"));
const HOLD = at(".se/run/hold/box-d462e994b4cef.json");
const TICKET = at("spec/tickets/a-child.md");

const GROUP = `---
kind: [[ticket]]
state: closed
urgency: soon
process: [[group]]
steps:
  - name: split
    does: mints the children
    evidence:
      - name: children
        form: list
        says: every child
---

# Ask

Two tickets that land as one.

# split

## children

# Discussion
`;

const CHILD = `---
kind: [[ticket]]
state: open
urgency: now
step: implement/tests-red
steps:
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
group: one-group
---

# Ask

One piece of it.

# implement

## tests-red

### tests

# Discussion
`;

function heard(what) {
  const lines = [];
  const was = [console.log, console.error];
  console.log = (...said) => lines.push(said.join(" "));
  console.error = console.log;
  try {
    return { code: what(), said: lines.join("\n") };
  } finally {
    [console.log, console.error] = was;
  }
}

function doors(more = {}) {
  const said = fakeGit(
    {
      "git rev-parse --abbrev-ref HEAD": { stdout: `${BRANCH}\n` },
      "git rev-parse HEAD": { stdout: `${SHA}\n` },
      [`git rev-list --count HEAD..origin/${BRANCH}`]: { stdout: "0\n" },
      "git status --porcelain": { stdout: "" },
      sh: { exitCode: 1, stdout: "" },
    },
    ROOT,
  );
  const disk = fakeDisk({
    [at("spec/schemas/ticket.schema.yaml")]: SCHEMA,
    [at(".se/run/box.json")]: JSON.stringify({ id: "d462e994b4cef" }),
    [at("spec/tickets/one-group.md")]: GROUP,
    [TICKET]: CHILD,
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
    ...more,
  };
  heard(() => work(ROOT, ["pull"], it));
  return { it, disk };
}

const SHORT = '{"tests": "node --test", "checked": "- one"}';

test("a refused payload leaves the ticket as it stood, and rides the hold to the next hand-back", () => {
  const { it, disk } = doors();
  const stood = disk.read(TICKET);

  const refused = heard(() =>
    work(ROOT, ["pull", "a-child", "--pass", "--fields", SHORT], it),
  );
  assert.equal(refused.code, 1);
  assert.match(refused.said, /checked under implement\/tests-red holds 1 line/);
  assert.equal(disk.read(TICKET), stood, "the ticket stands as it stood");
  assert.equal(
    JSON.parse(disk.read(HOLD)).payload,
    SHORT,
    "the payload rides the hold",
  );

  const again = heard(() => work(ROOT, ["pull", "a-child", "--pass"], it));
  assert.equal(again.code, 1, "the hold's payload meets the same checks");
  assert.match(again.said, /checked under implement\/tests-red holds 1 line/);
  assert.equal(disk.read(TICKET), stood);
});

test("a ticket with no step field hands back at its first leaf, so the hold reads as fresh", () => {
  const { it, disk } = doors();
  disk.write(TICKET, CHILD.replace("step: implement/tests-red\n", ""));
  const said = heard(() => work(ROOT, ["pull", "a-child", "--pass", "--fields", SHORT], it));
  assert.ok(!said.said.includes("stands at no step now"), "a missing step is the first leaf");
  assert.match(said.said, /checked under implement\/tests-red holds 1 line/, "the checks read the payload");
});

test("a refusal at the cap inserts the person step on the ticket as it stood, and the refused payload reaches no disk", () => {
  const { it, disk } = doors({ refusals: 1 });
  const person = heard(() =>
    work(ROOT, ["pull", "a-child", "--pass", "--fields", SHORT], it),
  );
  assert.equal(person.code, 1);
  assert.match(person.said, /waits for a person/);
  const landed = disk.read(TICKET);
  assert.ok(!/^- one$/m.test(landed), "the refused payload reaches no disk");
  assert.ok(!landed.includes("node --test"));
  assert.match(landed, /person-1/, "and the person step stands");
});
