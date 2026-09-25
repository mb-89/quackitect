// The unblock verb, driven through fake doors. A ticket stands in a map, git
// answers from a table, and every answer runs in memory.
// [[spec/design_output/work#a-person-step-leaves]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { schemasFrom } from "../../.claude/skills/level0/lib/schema.js";
import { mintedNote } from "../../.claude/skills/level0/lib/schema-mint.js";
import { fakeClock } from "../../src/doors/fake/clock.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeGit } from "../../src/doors/fake/git.js";
import { fieldOf } from "../../src/engine/group.js";
import { withRoute } from "../../src/scripts/process.js";
import { takeable } from "../../src/scripts/pull.js";
import { work } from "../../src/scripts/work.js";
import { unblock } from "../../src/scripts/work-unblock.js";
import { TICKET_SCHEMA } from "./fixtures.js";

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

// A tree carrying other work lands the two tickets alone, so the commit sweeps nothing else in. [[spec/design_output/work#a-person-step-leaves]]
test("unblock stages the child and its successor by path, and stages nothing else", () => {
  const { it } = doors(standing());

  const { code, said } = heard(() =>
    unblock({ ...it, root: ROOT }, "a-child", ["unblock", "a-child", "a-successor"]),
  );

  assert.equal(code, 0, said);
  const ran = it.git.ran.map((one) => one.argv.join(" "));
  const both = `-- ${at("spec/tickets/a-child.md")} ${at("spec/tickets/a-successor.md")}`;
  assert.ok(ran.includes(`git add ${both}`), ran.join("\n"));
  assert.ok(
    ran.some((one) => one.startsWith("git commit") && one.endsWith(both)),
    "the commit names the same two paths",
  );
  assert.equal(ran.includes("git add -A"), false);
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

// A person reads the question in the shape its author gives it. [[spec/tickets/the-unblock-keeps-its-shape]]
const ASKING = (asks) =>
  CHILD().replace(
    '        asks: "the verdict failed back 2 times: no test drives the hook"\n',
    asks,
  );

// [[spec/tickets/the-unblock-keeps-its-shape]]
test("a question carrying a table lands as that table, and TL;DR stays whole", () => {
  const { it, disk } = doors(
    standing(
      ASKING(
        "        asks: TL;DR pick a road\\n\\n| road | cost |\\n| --- | --- |\\n| one | two |\n",
      ),
    ),
  );

  heard(() => work(ROOT, ["unblock", "a-child", "a-successor"], it));

  const successor = disk.read(at("spec/tickets/a-successor.md"));
  assert.match(successor, /^\| road \| cost \|$/m, "the table keeps its own line");
  assert.match(successor, /^\| one \| two \|$/m, "every row keeps its own line");
  assert.match(
    successor,
    /TL;DR pick a road/,
    "the word carrying a semicolon stays whole",
  );
  assert.doesNotMatch(successor, /^\s+- DR/m, "no cut falls inside that word");
});

// [[spec/tickets/the-unblock-keeps-its-shape]]
test("two questions land one list item each", () => {
  const { it, disk } = doors(
    standing(ASKING('        asks: "the first road; the second road"\n')),
  );

  heard(() => work(ROOT, ["unblock", "a-child", "a-successor"], it));

  const successor = disk.read(at("spec/tickets/a-successor.md"));
  assert.match(successor, /^ {2}- the first road$/m);
  assert.match(successor, /^ {2}- the second road$/m);
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

// A desk works on main, so the verb reads the group off the child's own field. [[spec/tickets/a-cloud-group-asks-nobody]]
test("unblock on main frees a child by its own group field", () => {
  const { it, disk } = doors(standing(), {
    "git rev-parse --abbrev-ref HEAD": { stdout: "main\n" },
  });

  const { code, said } = heard(() =>
    work(ROOT, ["unblock", "a-child", "a-successor"], it),
  );

  assert.equal(code, 0, said);
  const now = disk.read(at("spec/tickets/a-child.md"));
  assert.equal(fieldOf(now, "state"), "closed", "the child closes");
  assert.equal(fieldOf(now, "reason"), "became", "it closes as became");
  assert.match(said, /stands outside one-group/, "the verb names the child's group");
});

// A ticket on main standing in no group hands its person step out too, and the successor stands in no group alike. [[spec/tickets/the-desk-findings-wait]]
test("unblock on main frees a child standing in no group", () => {
  const { it, disk } = doors(standing(CHILD().replace("group: one-group\n", "")), {
    "git rev-parse --abbrev-ref HEAD": { stdout: "main\n" },
  });

  const { code, said } = heard(() =>
    work(ROOT, ["unblock", "a-child", "a-successor"], it),
  );

  assert.equal(code, 0, said);
  const now = disk.read(at("spec/tickets/a-child.md"));
  assert.equal(fieldOf(now, "state"), "closed", "the child closes");
  assert.equal(fieldOf(now, "reason"), "became", "it closes as became");
  assert.doesNotMatch(
    said,
    /stands (in|outside) [,.]/,
    "the verb names no empty group",
  );
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

// The route a successor stands on, which test/contract/process.test.js holds to the shipped file. [[spec/design_output/work#a-successor-stands-on-question]]
const QUESTION_ROUTE = `for: a question only a person answers
ask:
  - name: question
    form: text
    says: what a person decides
steps:
  - name: answer
    does: answers the question the ask carries
    by: person
    to: engine
    input: ask
    evidence:
      - name: answer
        form: text
        says: the answer
  - name: do
    does: carries the answer out
    from: anyone
    by: anyone
    to: retro
    input: answer
    evidence:
      - name: says
        form: text
        says: what changes and why
`;

// The mint copies the route onto the ticket, the way the verb tells a desk to write one. [[spec/design_output/work#a-successor-stands-on-question]]
function mintedOffQuestion() {
  const held = fakeDisk({ [at("spec/processes/question.yaml")]: QUESTION_ROUTE });
  const schemas = schemasFrom([{ text: TICKET_SCHEMA }]);
  const copied = withRoute(held, ROOT, join, schemas.get("ticket"), {
    state: "open",
    process: "question",
  });
  assert.equal(copied.why, undefined, "the route copies onto the ticket");

  const made = mintedNote(schemas, {
    kind: "ticket",
    path: "spec/tickets/a-successor.md",
    fields: copied.fields,
  });
  assert.equal(made.why, undefined, "the mint answers a note");
  return made.text;
}

// A successor off this route opens at a person step, so the verb takes it. A route opening where an agent works closes the road again, and this case reads it. [[spec/design_output/work#a-successor-stands-on-question]]
test("the verb takes a successor the mint writes off the question route", () => {
  const { it, disk } = doors(
    standing(CHILD(), { [at("spec/tickets/a-successor.md")]: mintedOffQuestion() }),
  );

  const { code, said } = heard(() =>
    work(ROOT, ["unblock", "a-child", "a-successor"], it),
  );

  assert.equal(code, 0, said);
  const now = disk.read(at("spec/tickets/a-child.md"));
  assert.equal(fieldOf(now, "state"), "closed", "the child closes");
  assert.equal(fieldOf(now, "reason"), "became", "it closes as became");

  const successor = disk.read(at("spec/tickets/a-successor.md"));
  assert.match(successor, /no test drives the hook/, "the question rides along");
  assert.match(successor, /# Discussion/, "the chapter stands where it lands");
});
