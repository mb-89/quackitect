// The one reading of git. One function reads it, and a flag adds the order.
// [[spec/design_output/work#one-reading-answers-git]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { fakeClock } from "../../src/doors/fake/clock.js";
import { COL, work } from "../../src/scripts/work.js";
import { compareOutline } from "../../src/scripts/pull-outline.js";
import { answerOf } from "../../src/scripts/work-answer.js";
import {
  CHILD,
  doorsSaying,
  GROUP_AT,
  GROUP_NOTE,
  heard,
  ROOT,
  remoteSaying,
} from "./work-doors.js";

const LOOSE = CHILD("one-group", "open").replace("group: one-group\n", "");

const doors = (files = {}) => {
  const said = doorsSaying(
    remoteSaying([{ branch: "work/one-group", tip: "aaa", when: 1767225600 }], {
      [`work/one-group:${GROUP_AT}`]: GROUP_NOTE,
      "work/one-group:spec/tickets/a-child.md": CHILD("one-group", "open"),
      "origin/main:spec/tickets/a-loose-one.md": LOOSE,
    }),
    files,
  );
  said.it.root = ROOT;
  return said;
};

// [[spec/design_output/work#one-reading-answers-git]]
test("the answer names every branch, the tickets on it and the loose ones", () => {
  const { it } = doors();
  it.clock = fakeClock("2026-01-01T03:00:00.000Z");
  const said = answerOf(it);

  assert.equal(said.branches.length, 1);
  const one = said.branches[0];
  assert.equal(one.branch, "work/one-group");
  assert.equal(one.kind, "group");
  assert.equal(one.status, "todo");
  assert.equal(one.age, "3h");
  assert.deepEqual(
    one.tickets.map((held) => held.name),
    ["a-child"],
  );
  assert.equal(one.tickets[0].state, "open");
  assert.equal(one.tickets[0].step, "do");
  assert.deepEqual(
    said.loose.map((held) => held.name),
    ["a-loose-one"],
  );
});

// The queue rides every answer, so the tab draws each row's place. [[spec/design_output/pull#the-queue-is-a-score]]
test("the answer carries the queue place by default, and a caller turns it off", () => {
  const { it } = doors();
  it.clock = fakeClock("2026-01-01T03:00:00.000Z");

  const bare = answerOf(it, false);
  assert.equal("queue" in bare.loose[0], false, "a caller asking for none gets none");
  assert.equal("queue" in bare.branches[0].tickets[0], false);

  const said = answerOf(it);
  const places = [
    ...said.branches.map((one) => one.queue),
    ...said.branches.flatMap((one) => one.tickets).map((one) => one.queue),
    ...said.loose.map((one) => one.queue),
  ].sort();
  // The group stands on a cloud branch, so it and its ticket stand at infinity, and the loose one takes the first place. [[spec/design_output/pull#the-queue-is-an-outline]]
  assert.deepEqual(places, ["1", "∞", "∞"], "the cloud's rows stand past every number");
});

const PERSON = `---
kind: [[ticket]]
state: open
step: answer
steps:
  - name: answer
    does: answers the question the ask carries
    by: person
---

# Ask

A question for a person.

# answer

# Discussion
`;

// A person's step takes a negative place and stands first, and the most pressing counts furthest down. [[spec/design_output/pull#the-queue-is-an-outline]]
test("a person's step takes a negative place ahead of the agent's rows", () => {
  const { it } = doorsSaying(
    remoteSaying([{ branch: "work/one-group", tip: "aaa", when: 1767225600 }], {
      [`work/one-group:${GROUP_AT}`]: GROUP_NOTE,
      "work/one-group:spec/tickets/a-child.md": CHILD("one-group", "open"),
      "origin/main:spec/tickets/a-loose-one.md": LOOSE,
      "origin/main:spec/tickets/ask-me.md": PERSON,
      "origin/main:spec/tickets/ask-me-first.md": PERSON.replace(
        "state: open\n",
        "state: open\nurgent: true\n",
      ),
    }),
  );
  it.root = ROOT;
  it.clock = fakeClock("2026-01-01T03:00:00.000Z");
  const said = answerOf(it);
  const place = (name) => said.loose.find((one) => one.name === name).queue;
  assert.equal(place("ask-me-first"), "-2", "the marked question stands first");
  assert.equal(place("ask-me"), "-1");
  assert.equal(
    said.branches[0].queue,
    "∞",
    "the cloud's group stands past every number",
  );
  assert.equal(place("a-loose-one"), "1", "the agent's rows count up from one");
});

// A closed ticket leaves the queue, and trunk's copy outranks a merged branch's, because trunk holds what landed. [[spec/design_output/pull#the-queue-is-an-outline]]
test("a closed ticket on trunk stands off the queue, whatever a merged branch says", () => {
  const { it } = doorsSaying(
    remoteSaying(
      [
        { branch: "work/one-group", tip: "aaa", when: 1767225600 },
        { branch: "work/gone-group", tip: "bbb", when: 1767225600, merged: true },
      ],
      {
        [`work/one-group:${GROUP_AT}`]: GROUP_NOTE,
        "work/one-group:spec/tickets/a-child.md": CHILD("one-group", "open"),
        // The standing branch carries a stale open copy of a ticket trunk holds closed, which speaks for nothing. [[spec/design_output/pull#the-queue-is-an-outline]]
        "work/one-group:spec/tickets/its-child.md": CHILD("gone-group", "open"),
        "work/gone-group:spec/tickets/gone-group.md": GROUP_NOTE,
        "work/gone-group:spec/tickets/its-child.md": CHILD("gone-group", "open"),
        "origin/main:spec/tickets/gone-group.md": GROUP_NOTE.replace(
          "state: open",
          "state: closed",
        ),
        "origin/main:spec/tickets/its-child.md": CHILD("gone-group", "closed"),
        "origin/main:spec/tickets/a-loose-one.md": LOOSE,
      },
    ),
  );
  it.root = ROOT;
  it.clock = fakeClock("2026-01-01T03:00:00.000Z");
  const said = answerOf(it);
  const gone = said.branches.find((one) => one.name === "gone-group");
  // A closed ticket takes no place at all, so the tab sorts it after the unplaced. [[spec/design_output/pull#the-queue-is-an-outline]]
  assert.equal("queue" in gone, false, "a closed group takes no place");
  assert.equal("queue" in gone.tickets[0], false, "and neither does its closed ticket");
  assert.equal(said.branches.find((one) => one.name === "one-group").queue, "∞");
  assert.equal(
    said.loose.some((one) => one.name === "its-child" && "queue" in one),
    false,
    "the stale copy places nothing",
  );
  const draft = answerOf({
    ...doorsSaying(
      remoteSaying([], {
        "origin/main:spec/tickets/a-draft.md": LOOSE.replace(
          "state: open",
          "state: draft",
        ),
        "origin/main:spec/tickets/a-loose-one.md": LOOSE,
      }),
    ).it,
    root: ROOT,
    clock: fakeClock("2026-01-01T03:00:00.000Z"),
  });
  assert.equal(
    draft.loose.find((one) => one.name === "a-draft").queue,
    "-1",
    "a draft waits on a person, so it takes a negative place",
  );
  assert.equal(draft.loose.find((one) => one.name === "a-loose-one").queue, "1");
  // A merged branch speaks for no ticket, so one trunk holds nowhere takes no place at all. [[spec/design_output/pull#the-queue-is-an-outline]]
  const orphan = answerOf({
    ...doorsSaying(
      remoteSaying(
        [{ branch: "work/gone-group", tip: "bbb", when: 1767225600, merged: true }],
        {
          "work/gone-group:spec/tickets/gone-group.md": GROUP_NOTE,
          "work/gone-group:spec/tickets/its-child.md": CHILD("gone-group", "open"),
        },
      ),
    ).it,
    root: ROOT,
    clock: fakeClock("2026-01-01T03:00:00.000Z"),
  });
  assert.equal("queue" in orphan.branches[0], false, "the merged group takes no place");
  assert.equal(
    "queue" in orphan.branches[0].tickets[0],
    false,
    "and its open copy of a ticket takes none",
  );
  const { said: listed } = heard(() => work(ROOT, ["list", "", "--queue"], it));
  assert.equal(
    listed.includes("gone-group"),
    false,
    "the listing leaves the unplaced out",
  );
});

// A todo names the row the ticket stands before, and a bare tag puts it first, whatever the score says. [[spec/design_output/pull#the-queue-is-an-outline]]
test("a todo moves a ticket before the row it names, and a private note takes a place too", () => {
  const { it } = doorsSaying(
    remoteSaying([], {
      "origin/main:spec/tickets/a-loose-one.md": LOOSE,
      "origin/main:spec/tickets/b-loose-one.md": LOOSE,
      "origin/main:spec/tickets/c-loose-one.md": LOOSE.replace(
        "state: open\n",
        "state: open\ntodo: a-loose-one\n",
      ),
      "origin/main:spec/tickets/d-loose-one.md": LOOSE.replace(
        "state: open\n",
        "state: open\ntodo: true\n",
      ),
    }),
    { [join(ROOT, ".se/tickets/parked.md")]: LOOSE },
  );
  it.root = ROOT;
  it.clock = fakeClock("2026-01-01T03:00:00.000Z");
  const said = answerOf(it);
  const place = (name) => said.loose.find((one) => one.name === name).queue;
  assert.equal(place("d-loose-one"), "1", "a bare tag stands first");
  assert.equal(place("c-loose-one"), "2", "a todo naming a row stands right before it");
  assert.equal(place("a-loose-one"), "3");
  const last = answerOf({
    ...doorsSaying(
      remoteSaying([], {
        "origin/main:spec/tickets/a-loose-one.md": LOOSE.replace(
          "state: open\n",
          "state: open\ntodo: last\n",
        ),
        "origin/main:spec/tickets/b-loose-one.md": LOOSE,
      }),
    ).it,
    root: ROOT,
    clock: fakeClock("2026-01-01T03:00:00.000Z"),
  });
  assert.equal(
    last.loose.find((one) => one.name === "a-loose-one").queue,
    "1",
    "a todo reading last stands after the todos and before every untagged row",
  );
  assert.ok(
    said.loose.find((one) => one.name === "c-loose-one").todo,
    "the todo flag lights on a placed ticket",
  );
  assert.match(
    place("parked"),
    /^\d+$/,
    "a private note on this box takes a place of its own",
  );
});

// A ticket a hand holds, or the one the plan names, stands at zero, ahead of the agent's rows. [[spec/design_output/pull#the-queue-is-an-outline]]
test("a ticket in hand stands at place zero", () => {
  const held = CHILD("", "open").replace(
    "group: \n",
    "record:\n  - step: do\n    hash_before: aaa\n",
  );
  const { it } = doorsSaying(
    remoteSaying([], {
      "origin/main:spec/tickets/a-loose-one.md": LOOSE,
      "origin/main:spec/tickets/in-hand.md": held,
      "origin/main:spec/tickets/named.md": LOOSE,
    }),
    {
      [join(ROOT, ".se/.runtime/plan.json")]: JSON.stringify({
        working: "named",
        todos: [],
      }),
    },
  );
  it.root = ROOT;
  it.clock = fakeClock("2026-01-01T03:00:00.000Z");
  const said = answerOf(it);
  const place = (name) => said.loose.find((one) => one.name === name).queue;
  assert.equal(place("in-hand"), "0", "a take puts the ticket at zero");
  assert.equal(place("named"), "0", "the plan's working ticket stands at zero");
  assert.equal(place("a-loose-one"), "1");
  // A row at zero reads held, whatever its front says. [[spec/design_output/pull#the-queue-is-an-outline]]
  assert.equal(said.loose.find((one) => one.name === "in-hand").state, "held");
  assert.equal(said.loose.find((one) => one.name === "a-loose-one").state, "open");
  // The work the plan names stands at zero as a row of its own where nothing carries its name. [[spec/design_output/stop#the-plan]]
  const bare = answerOf({
    ...doorsSaying(
      remoteSaying([], { "origin/main:spec/tickets/a-loose-one.md": LOOSE }),
      {
        [join(ROOT, ".se/.runtime/plan.json")]: JSON.stringify({
          working: "the report",
          todos: [],
        }),
      },
    ).it,
    root: ROOT,
    clock: fakeClock("2026-01-01T03:00:00.000Z"),
  });
  const row = bare.loose.find((one) => one.name === "the report");
  assert.equal(row.queue, "0");
  assert.equal(row.state, "held");
  assert.equal(row.kind, "todo");
});

// [[spec/design_output/pull#the-queue-is-an-outline]]
test("an outline place compares segment by segment, and the unplaced stands last", () => {
  const sorted = ["2", "1.10", "1", "-1", "1.2", "-2", "10"].sort(compareOutline);
  assert.deepEqual(sorted, ["-2", "-1", "1", "1.2", "1.10", "2", "10"]);
});

// A sentence todo stands in the queue as a row of its own, placed by its anchor, with no link. [[spec/design_output/stop#the-plan]]
test("the plan's todos stand in the answer as rows with a place", () => {
  const { it } = doors({
    [join(ROOT, ".se/.runtime/plan.json")]: JSON.stringify({
      working: "",
      todos: [
        { title: "read the note", details: "the one on the grace", todo: "true" },
      ],
    }),
  });
  it.clock = fakeClock("2026-01-01T03:00:00.000Z");
  const said = answerOf(it);
  const row = said.loose.find((one) => one.name === "read the note");
  assert.equal(row.kind, "todo");
  assert.equal(row.todo, true);
  assert.equal(row.says, "the one on the grace");
  assert.equal(row.queue, "1", "a bare anchor puts the todo first");
  assert.equal(said.branches[0].queue, "∞");
});

// The override lives in the plan file on this box, over the front, and lights the todo letter. [[spec/design_output/pull#a-todo-forces-a-place]]
test("an override in the plan file moves the row and lights its todo, and travels into no ticket", () => {
  const { it } = doors({
    [join(ROOT, ".se/.runtime/plan.json")]: JSON.stringify({
      places: { "a-loose-one": "true" },
    }),
  });
  it.clock = fakeClock("2026-01-01T03:00:00.000Z");
  const said = answerOf(it);
  const row = said.loose.find((one) => one.name === "a-loose-one");
  assert.equal(row.queue, "1", "the override puts the row first");
  assert.equal(row.todo, true, "the override lights the todo");
  assert.equal(said.branches[0].queue, "∞");
});

// A place a person writes stands on the disk before any commit, and the verb reads it there. [[spec/design_output/pull#a-todo-forces-a-place]]
test("the desk's own copy of a trunk ticket outranks git's, so a todo moves the row at once", () => {
  const { it } = doors({
    [join(ROOT, "spec/tickets/a-loose-one.md")]: LOOSE.replace(
      "state: open\n",
      "state: open\ntodo: true\n",
    ),
  });
  it.clock = fakeClock("2026-01-01T03:00:00.000Z");
  const said = answerOf(it);
  assert.equal(
    said.loose.find((one) => one.name === "a-loose-one").queue,
    "1",
    "the todo on the disk puts the row first",
  );
  assert.equal(said.branches[0].queue, "∞");
});

// A group on trunk with no branch stands in the answer with its kind, and its children beside it, so the tab nests them. [[spec/design_output/tree-view#the-name-column-nests]]
test("the answer carries a group with no branch, its children, and the whole ask", () => {
  const { it } = doorsSaying(
    remoteSaying([{ branch: "work/one-group", tip: "aaa", when: 1767225600 }], {
      [`work/one-group:${GROUP_AT}`]: GROUP_NOTE,
      "work/one-group:spec/tickets/a-child.md": CHILD("one-group", "open"),
      "origin/main:spec/tickets/a-loose-one.md": LOOSE,
      "origin/main:spec/tickets/a-loose-group.md": GROUP_NOTE,
      "origin/main:spec/tickets/its-child.md": CHILD("a-loose-group", "open"),
    }),
  );
  it.root = ROOT;
  it.clock = fakeClock("2026-01-01T03:00:00.000Z");
  const said = answerOf(it);

  const names = said.loose.map((one) => `${one.name}:${one.kind}:${one.group}`).sort();
  assert.deepEqual(names, [
    "a-loose-group:group:",
    "a-loose-one:ticket:",
    "its-child:ticket:a-loose-group",
  ]);
  assert.equal(
    said.loose.find((one) => one.name === "a-loose-group").says,
    "Two tickets that land as one.",
  );
  assert.equal(
    said.branches[0].says,
    "Two tickets that land as one.",
    "a branch row carries the whole ask too",
  );
});

// [[spec/design_output/pull#the-queue-is-a-score]]
test("the queue listing pads every place to one width, so the names line up", () => {
  const { it } = doors();
  it.clock = fakeClock("2026-01-01T03:00:00.000Z");

  const { code, said } = heard(() => work(ROOT, ["list", "", "--queue"], it));

  assert.equal(code, 0);
  const rows = said.split("\n").filter(Boolean);
  // The group and its ticket stand on the cloud, so this box's listing holds the loose one alone. [[spec/design_output/pull#the-queue-is-an-outline]]
  assert.equal(rows.length, 1, "one row a thing this box takes");
  for (const row of rows) {
    assert.match(row, /^\s*[-\d.]+ {2}\S/, "the place stands padded, then two spaces");
    assert.equal(row.indexOf("  ", COL.place - 1), COL.place, "one width for all");
  }
});

// Todos of the plan anchored on one row keep the plan's order, so the place each takes reads the order the plan writes. [[spec/design_output/pull#a-todo-forces-a-place]]
test("two todos anchored on one row stand in the order the plan writes them", () => {
  const { it } = doors({
    [join(ROOT, ".se", ".runtime", "plan.json")]: JSON.stringify({
      todos: [
        { title: "zeta todo", todo: "a-loose-one" },
        { title: "alpha todo", todo: "a-loose-one" },
      ],
    }),
  });
  it.clock = fakeClock("2026-01-01T03:00:00.000Z");

  const said = answerOf(it);
  const place = Object.fromEntries(said.loose.map((one) => [one.name, one.queue]));

  assert.deepEqual(
    [place["zeta todo"], place["alpha todo"], place["a-loose-one"]],
    ["1", "2", "3"],
  );
});
