// A desk takes a cloud branch into trunk by a merge and nothing else: branch
// take refuses on a desk, and branch merge takes a done cloud branch in.
// [[spec/design_output/work#a-desk-works-on-trunk]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { work } from "../../src/scripts/work.js";
import {
  doorsSaying,
  GROUP_NOTE,
  groupRemote,
  HAND,
  heard,
  merging,
  on,
  ROOT,
  ranGit,
} from "./work-doors.js";

// [[spec/design_output/work#a-desk-works-on-trunk]]
test("branch take on a desk refuses, names main, and asks git nothing", () => {
  const { it, outside } = doorsSaying(
    { ...groupRemote(), "git rev-parse --abbrev-ref HEAD": { stdout: "main\n" } },
    { [on("one-group")]: GROUP_NOTE, ...HAND },
  );

  const { code, said } = heard(() => work(ROOT, ["take", "one-group"], it));

  assert.equal(code, 2, said);
  assert.match(said, /A desk works on main alone/);
  assert.match(said, /git switch main/);
  assert.deepEqual(ranGit(outside), []);
});

// [[spec/design_output/work#a-desk-works-on-trunk]]
test("a desk's branch merge takes a done cloud branch into main, and the check passes on it", () => {
  const { it, outside } = doorsSaying(merging());
  it.node = "node";

  const { code, said } = heard(() =>
    work(ROOT, ["merge", "one-group"], { ...it, cloud: false }),
  );

  assert.equal(code, 0, said);
  assert.ok(
    ranGit(outside).includes("git merge --no-ff --no-edit origin/work/one-group"),
  );
  assert.match(
    said,
    /work\/one-group is merged, and the check passes on the merge commit/,
  );
});
