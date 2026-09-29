// The hand's reading of the tickets on disk: trunk's under the tickets
// folder, the box's own under the private folder, and the todo each carries.
// [[spec/design_output/pull#the-queue-is-an-outline]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { todoOf } from "../../src/engine/group.js";
import {
  emptyGroup,
  handOut,
  holdsHere,
  takeable,
  ticketsHere,
} from "../../src/scripts/pull-hand.js";
import {
  at as PULL_AT,
  doors,
  HOLD,
  heard,
  CHILD as PULL_CHILD,
  ROOT as PULL_ROOT,
  standing,
} from "./pull-doors.js";
import { pulling } from "../../src/scripts/work.js";
import { PLANS } from "../../.claude/skills/level0/lib/runs.js";
import { CHILD, ROOT } from "./work-doors.js";

const at = (rel) => join(ROOT, ...rel.split("/"));

// A private note reads as private, and a todo naming a row reads off its front the way a bare tag does. [[spec/design_output/pull#a-todo-forces-a-place]]
test("the hand reads trunk's tickets and the box's private notes, each with its todo", () => {
  const disk = fakeDisk({
    [at("spec/tickets/a-loose-one.md")]: CHILD("", "open").replace("group: \n", ""),
    [at(".se/tickets/parked.md")]: CHILD("", "open").replace(
      "group: \n",
      "todo: a-loose-one\n",
    ),
  });
  const all = ticketsHere({ root: ROOT, disk, join });
  const names = all.map((one) => `${one.name}:${one.private}`).sort();
  assert.deepEqual(names, ["a-loose-one:false", "parked:true"]);
  assert.equal(todoOf(all.find((one) => one.name === "parked").front), "a-loose-one");
  assert.equal(todoOf(all.find((one) => one.name === "a-loose-one").front), "");
});

// The children stand before their group. [[spec/design_output/work#a-group-is-a-ticket]]
test("a group no ticket names reads empty, one with a child reads full, and a plain ticket reads neither", () => {
  const group =
    "---\nkind: [[ticket]]\nstate: draft\nprocess: [[spec/processes/group]]\n---\n";
  const disk = fakeDisk({
    [at("spec/tickets/a-part.md")]: CHILD("the-whole", "draft"),
  });
  const it = { root: ROOT, disk, join };
  assert.match(emptyGroup(it, group, "a-lonely-one"), /no ticket names it under group/);
  assert.equal(emptyGroup(it, group, "the-whole"), "");
  assert.equal(emptyGroup(it, CHILD("", "draft"), "a-part"), "");
});

// [[spec/design_output/pull#an-empty-queue-hands-cleanup]]
test("a desk pull meeting no ticket answers cleanup, and a named pull meeting none still waits", () => {
  const desk = () => doors({}, {}, { cloud: false, root: ROOT }).it;
  const plain = heard(() => handOut(desk(), {}));
  assert.match(plain.said, /^cleanup\n\s*The check stamp names no check at HEAD/);
  const named = heard(() => handOut(desk(), { wanted: "nobody" }));
  assert.match(named.said, /^wait\n\s*nobody stands nowhere here/);
});

// A trivial draft opens at the pull, so takeable reads it as open, and any other draft waits on a person. [[spec/design_output/pull#a-draft-opens]]
test("takeable answers a trivial draft's first leaf, and nothing for any other draft", () => {
  const open = CHILD("", "open").replace("group: \n", "");
  const it = { root: ROOT, disk: fakeDisk({}), join };
  const leaf = takeable(it, { name: "a", text: open });
  const trivial = open.replace(
    "state: open",
    "state: draft\nprocess: [[spec/processes/trivial]]",
  );
  assert.equal(takeable(it, { name: "a", text: trivial }), leaf);
  assert.equal(
    takeable(it, { name: "a", text: open.replace("state: open", "state: draft") }),
    "",
  );
});

// A ticket in no group holds no branch up, so a hand-out frees nothing, and a question ticket handed on hands on again. [[spec/tickets/the-desk-findings-wait]]
test("a desk on main hands no person's step out of a ticket standing in no group", () => {
  const loose = `---
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
---

# Ask

One piece of it.

# design

## person-1

### answer

# Discussion
`;
  const { it } = doors(
    { [at("spec/tickets/a-loose-question.md")]: loose },
    {
      "git rev-parse --abbrev-ref HEAD": { stdout: "main\n" },
      "git rev-list --count HEAD..origin/main": { stdout: "0\n" },
    },
    { cloud: false, root: ROOT },
  );
  const { said } = heard(() => handOut(it, {}));
  assert.match(said, /a-loose-question waits for a person at design\/person-1/);
  assert.ok(!said.includes("branch unblock"), said);
});

// A condition reads the box, and the record names none. [[spec/tickets/every-road-has-a-caller]]
test("the pull reads cloud and desk, and returned names no condition it reads", () => {
  assert.deepEqual(holdsHere({ cloud: true }, "cloud"), {
    holds: true,
    why: "the box runs off the cloud",
  });
  assert.equal(holdsHere({ cloud: true }, "desk").holds, false);
  assert.deepEqual(holdsHere({ cloud: true }, "returned"), {
    holds: false,
    why: "returned names no condition the pull reads",
  });
});

// A box naming no cap splits nothing, so the hand-out prints whole and the hold carries no rest. [[spec/design_input/level-two#the-size-cap]]
test("handed prints the whole hand-out and writes a hold with no rest where no cap stands", () => {
  const { it, disk } = doors(standing());
  const { code, said } = heard(() => pulling(PULL_ROOT, ["pull"], it));
  assert.equal(code, 0);
  assert.match(said, /index_ticket_pull with args \["a-child","--pass"/);
  assert.doesNotMatch(said, /for the rest/);
  // The verbs slice stands at new, so the hand-out reads no registry beside the table. [[spec/tickets/agents-call-quack-directly]]
  const ran = (it.proc?.ran ?? []).map((one) => one.argv.join(" "));
  assert.ok(!ran.some((one) => one.includes("index/actions")), ran.join("\n"));
  const hold = JSON.parse(disk.read(HOLD));
  assert.equal(hold.step, "design/draft");
  assert.equal(hold.rest, undefined);
});

// The hold records the notes a leaf's tags resolve, so the guidance verb reads them back. [[spec/design_input/level-two#guidance]]
test("handed records in the hold the notes a tagged leaf resolves", () => {
  const tagged = PULL_CHILD().replace(
    "    reads: [[spec/guidance/voice]]\n",
    "    tags: [code]\n",
  );
  const code =
    "---\nkind: [[guidance]]\n---\n\n# Actionables\n\n1. Reach the outside through a door.\n";
  const { it, disk } = doors({
    ...standing(tagged),
    [PULL_AT("spec/guidance/code/code.md")]: code,
  });
  const { code: exit } = heard(() => pulling(PULL_ROOT, ["pull"], it));
  assert.equal(exit, 0);
  const hold = JSON.parse(disk.read(HOLD));
  assert.deepEqual(
    hold.reads.map((one) => one.name),
    ["spec/guidance/code/code"],
  );
});

// The review waits on a hand other than the drafter's, so a helper takes it while the plan works the ticket. [[spec/tickets/helpers-pull-past-plans]]
const REVIEWING = PULL_CHILD(
  "open",
  "design/review",
  "record:\n  - step: design/draft\n    hand: box d462e994b4cef\n",
);
const planWorks = (working) => ({
  [PULL_AT(PLANS)]: JSON.stringify({ working }),
});

// [[spec/tickets/helpers-pull-past-plans]]
test("a helper's pull takes the step of the ticket the plan works, plain or named, under the queue", () => {
  const plain = doors(
    standing(REVIEWING, undefined, planWorks("a-child")),
    {},
    { binding: "queue" },
  );
  const took = heard(() => pulling(PULL_ROOT, ["pull", "--as", "helper-1"], plain.it));
  assert.match(
    took.said,
    /a-child at design\/review/,
    "the plain helper pull hands the review",
  );

  const named = doors(
    standing(REVIEWING, undefined, planWorks("a-child")),
    {},
    { binding: "queue" },
  );
  const asked = heard(() =>
    pulling(PULL_ROOT, ["pull", "a-child", "--as", "helper-1"], named.it),
  );
  assert.notEqual(asked.code, 2, asked.said);
  assert.match(
    asked.said,
    /a-child at design\/review/,
    "the named helper pull hands the review",
  );
});

// [[spec/tickets/helpers-pull-past-plans]]
test("a helper's named pull of a ticket outside the plan stays behind the queue", () => {
  const bound = doors(
    standing(REVIEWING, undefined, planWorks("another-one")),
    {},
    { binding: "queue" },
  );
  const shut = heard(() =>
    pulling(PULL_ROOT, ["pull", "a-child", "--as", "helper-1"], bound.it),
  );
  assert.equal(shut.code, 2);
  assert.match(shut.said, /a-child stands behind the queue/);
});
