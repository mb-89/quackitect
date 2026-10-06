// A desk's pull works trunk alone: on a work branch it refuses before it reads
// a ticket, and a group it names refuses and names the merge.
// [[spec/design_output/work#a-desk-works-on-trunk]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { pulling } from "../../src/scripts/work.js";
import {
  DESK_NODE,
  doorsSaying,
  GROUP_NOTE,
  groupRemote,
  HAND,
  heard,
  on,
  onBranch,
  ROOT,
  ranGit,
} from "./work-doors.js";

// The refusal raises its node through the failure door, so its remedy prints once. [[spec/tickets/the-twins-leave-whole]]
test("a desk's pull raises desk-works-on-trunk, and prints its remedy once", () => {
  const { it } = doorsSaying(onBranch("work/one-group"), {
    [on("one-group")]: GROUP_NOTE,
    ...HAND,
    ...DESK_NODE,
  });

  const { code, said } = heard(() => pulling(ROOT, ["pull"], { ...it, cloud: false }));

  assert.equal(code, 2, said);
  assert.match(said, /failure desk-works-on-trunk at warn/);
  assert.equal(said.split("git switch main").length - 1, 1, said);
});

// [[spec/design_output/work#a-desk-works-on-trunk]]
test("a desk's pull on a work branch refuses, names main, and asks git nothing past the branch", () => {
  const { it, outside } = doorsSaying(onBranch("work/one-group"), {
    [on("one-group")]: GROUP_NOTE,
    ...HAND,
    ...DESK_NODE,
  });

  const { code, said } = heard(() => pulling(ROOT, ["pull"], { ...it, cloud: false }));

  assert.equal(code, 2, said);
  assert.match(said, /A desk works on main alone/);
  assert.match(said, /git switch main/);
  assert.deepEqual(ranGit(outside), ["git rev-parse --abbrev-ref HEAD"]);
});

// [[spec/design_output/work#a-desk-works-on-trunk]]
test("a desk's pull naming a group refuses, names its merge, and moves onto no branch", () => {
  const { it, outside } = doorsSaying(
    { ...groupRemote(), "git rev-parse --abbrev-ref HEAD": { stdout: "main\n" } },
    { [on("one-group")]: GROUP_NOTE, ...HAND, ...DESK_NODE },
  );

  const { code, said } = heard(() =>
    pulling(ROOT, ["pull", "one-group"], { ...it, cloud: false }),
  );

  assert.equal(code, 2, said);
  assert.match(said, /no branch for one-group/);
  assert.match(said, /\.\/RUNME\.sh branch merge <name>/);
  assert.ok(!ranGit(outside).some((one) => one.startsWith("git switch")));
});
