// The listing's rows: a child names what it waits on, and a group row names a
// branch behind main. The doors stand in work-doors.js beside this file.
// [[spec/design_output/work#a-ticket-under-its-group]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { work } from "../../src/scripts/work.js";
import {
  CHILD,
  doorsSaying,
  GROUP_NOTE,
  groupRemote,
  heard,
  ROOT,
} from "./work-doors.js";

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
