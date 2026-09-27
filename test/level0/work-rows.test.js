// The listing's rows under a group: each child, what it waits on, and a group
// row naming a branch behind main. The doors stand in work-doors.js.
// [[spec/design_output/work#a-ticket-under-its-group]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { whyOf, work } from "../../src/scripts/work.js";
import {
  CHILD,
  doorsSaying,
  GROUP_NOTE,
  groupRemote,
  heard,
  ROOT,
  remoteSaying,
} from "./work-doors.js";

// [[spec/design_output/work#a-ticket-under-its-group]]
test("a group row carries a row per ticket naming it, off the branch tip", () => {
  const { it } = doorsSaying(
    groupRemote(GROUP_NOTE, {
      objects: {
        "work/one-group:spec/tickets/a-child.md": CHILD("one-group", "open").replace(
          "group: one-group",
          "group: one-group\nstep: do",
        ),
        "work/one-group:spec/tickets/other-work.md": CHILD("another-group", "open"),
      },
    }),
  );

  const { code, said } = heard(() => work(ROOT, ["list"], it));

  assert.equal(code, 0);
  assert.match(said, /work\/one-group\s+todo/);
  assert.match(said, /^ {2}a-child\s+ticket\s+open\s+do$/m);
  assert.doesNotMatch(
    said,
    /other-work/,
    "a ticket naming another group stays off this row",
  );
  assert.doesNotMatch(
    said,
    /^ {2}one-group\s+ticket/m,
    "the group itself is no child of itself",
  );
});

// [[spec/design_output/work#a-ticket-under-its-group]]
test("a branch carrying no group names no ticket, and a child with no step says its mark", () => {
  const { it } = doorsSaying(
    remoteSaying([{ branch: "work/no-group", tip: "aaa" }], {
      "work/no-group:spec/tickets/a-child.md": CHILD("no-group", "open"),
    }),
  );

  const { said } = heard(() => work(ROOT, ["list"], it));

  assert.match(said, /work\/no-group\s+no status/);
  assert.doesNotMatch(said, /a-child/, "a branch carrying no group names no tickets");
  assert.equal(
    whyOf(CHILD("one-group", "open")),
    "do",
    "a ticket says the step it stands at",
  );
  assert.equal(
    whyOf(CHILD("one-group", "open").replace(/steps:[\s\S]*?\n---/, "---")),
    "",
    "a ticket naming no step and carrying no mark says nothing",
  );
});

// [[spec/tickets/the-queue-views-agree]]
test("a child row names the tickets it waits on", () => {
  const waiting = CHILD("one-group", "open").replace(
    "group: one-group",
    "group: one-group\ndepends_on: b-child, c-shut, d-nowhere\nstep: do",
  );
  const { it } = doorsSaying(
    groupRemote(GROUP_NOTE, {
      objects: {
        "work/one-group:spec/tickets/a-child.md": waiting,
        "work/one-group:spec/tickets/b-child.md": CHILD("one-group", "open"),
        "work/one-group:spec/tickets/c-shut.md": CHILD("one-group", "closed"),
        "work/one-group:spec/tickets/e-free.md": CHILD("one-group", "open").replace(
          "group: one-group",
          "group: one-group\nstep: do",
        ),
      },
    }),
  );

  const { code, said } = heard(() => work(ROOT, ["list"], it));

  assert.equal(code, 0);
  assert.match(said, /^ {2}a-child\s+ticket\s+open\s+waits for b-child$/m);
  assert.match(
    said,
    /^ {2}e-free\s+ticket\s+open\s+do$/m,
    "a child waiting on nothing names its step",
  );
});

// [[spec/tickets/the-queue-views-agree]]
test("a group row names a branch behind main", () => {
  const listed = (base) => {
    const { it } = doorsSaying({
      ...groupRemote(GROUP_NOTE),
      "git merge-base origin/main origin/work/one-group": { stdout: `${base}\n` },
      "git rev-parse origin/main": { stdout: "tip\n" },
    });
    return heard(() => work(ROOT, ["list"], it)).said;
  };

  assert.match(listed("older"), /work\/one-group\s+todo\s+behind main/);
  assert.doesNotMatch(
    listed("tip"),
    /behind main/,
    "a branch on the trunk tip stands level",
  );
});
