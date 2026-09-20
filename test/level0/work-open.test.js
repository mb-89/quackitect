// A group reaching the cloud: the verb that pushes the branch, and the reading
// that tells a fresh branch from a landed one.
// [[spec/design_output/work#a-group-is-a-ticket]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { mergedHere, work } from "../../src/scripts/work.js";
import { refsIn } from "../../src/scripts/work-read.js";
import {
  doorsSaying,
  GROUP_AT,
  GROUP_NOTE,
  groupRemote,
  heard,
  ROOT,
  ranGit,
  remoteSaying,
  SHA,
} from "./work-doors.js";

// [[spec/design_output/work#the-listing-reads-git-once]]
test("a ref reads merged where the merged set names it, and open where it does not", () => {
  const rows = ["origin/work/fresh-cut aaa 0", "origin/work/landed bbb 0"].join("\n");

  assert.deepEqual(
    refsIn(rows, new Set(["work/landed"])).map((one) => [one.branch, one.merged]),
    [
      ["work/fresh-cut", false],
      ["work/landed", true],
    ],
  );
});

// A branch cut off trunk and still waiting sits at trunk's tip, and reading it as merged hides it from the cloud. [[spec/design_output/work#a-merged-branch-closes]]
test("the merged set drops a branch standing at trunk's tip", () => {
  const { it } = doorsSaying({
    "git branch -r --merged origin/main": {
      stdout: "  origin/main\n  origin/work/fresh-cut\n  origin/work/landed\n",
    },
    "git branch -r --points-at origin/main": {
      stdout: "  origin/main\n  origin/work/fresh-cut\n",
    },
  });

  assert.deepEqual([...mergedHere(it)], ["work/landed"]);
});

// [[spec/design_output/work#a-group-is-a-ticket]]
test("branch open pushes a group off trunk, and says where it stands", () => {
  const { it, outside } = doorsSaying({
    ...remoteSaying([]),
    [`git show origin/main:${GROUP_AT}`]: { stdout: GROUP_NOTE },
    "git rev-parse origin/main^{tree}": { stdout: "t0t0\n" },
    "git commit-tree t0t0 -p origin/main -m work/one-group opens": {
      stdout: `${SHA}\n`,
    },
  });

  const { code, said } = heard(() => work(ROOT, ["open", "one-group"], it));

  assert.equal(code, 0);
  assert.ok(
    ranGit(outside).includes(`git push origin ${SHA}:refs/heads/work/one-group`),
  );
  assert.match(said, /work\/one-group stands at todo/);
});

// [[spec/design_output/work#a-group-is-a-ticket]]
test("branch open refuses a name trunk carries no group for", () => {
  const { it, outside } = doorsSaying(remoteSaying([]));

  const { code, said } = heard(() => work(ROOT, ["open", "one-group"], it));

  assert.equal(code, 2);
  assert.match(said, /carries no/);
  assert.ok(!ranGit(outside).some((one) => one.startsWith("git push")));
});

// [[spec/design_output/work#a-group-is-a-ticket]]
test("branch open leaves a branch already in the cloud alone", () => {
  const { it, outside } = doorsSaying({
    ...groupRemote(),
    [`git show origin/main:${GROUP_AT}`]: { stdout: GROUP_NOTE },
  });

  const { code, said } = heard(() => work(ROOT, ["open", "one-group"], it));

  assert.equal(code, 0);
  assert.match(said, /already stands in the cloud/);
  assert.ok(!ranGit(outside).some((one) => one.startsWith("git push")));
});
