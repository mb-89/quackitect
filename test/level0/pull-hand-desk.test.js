// A desk's pull works trunk alone: on a work branch it refuses before it reads
// a ticket, and a group it names refuses and names the merge.
// [[spec/design_output/work#a-desk-works-on-trunk]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { pulling } from "../../src/scripts/work.js";
import {
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

// [[spec/design_output/work#a-desk-works-on-trunk]]
test("a desk's pull on a work branch refuses, names main, and asks git nothing past the branch", () => {
  const { it, outside } = doorsSaying(onBranch("work/one-group"), {
    [on("one-group")]: GROUP_NOTE,
    ...HAND,
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
    { [on("one-group")]: GROUP_NOTE, ...HAND },
  );

  const { code, said } = heard(() =>
    pulling(ROOT, ["pull", "one-group"], { ...it, cloud: false }),
  );

  assert.equal(code, 2, said);
  assert.match(said, /\.\/RUNME\.sh branch merge one-group/);
  assert.match(said, /git switch main/);
  assert.ok(!ranGit(outside).some((one) => one.startsWith("git switch")));
});
