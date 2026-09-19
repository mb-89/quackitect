// A branch sharing no ancestor with trunk, driven through the fake doors beside
// this file. No sync reaches such a branch, so the take passes it over and the
// listing says why.
// [[spec/design_output/work#the-listing-reads-git-once]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { work } from "../../src/scripts/work.js";
import { doorsSaying, HERE, heard, ranGit, remoteSaying, ROOT } from "./work-doors.js";

// [[spec/design_output/work#the-listing-reads-git-once]]
const ORPHANED = (brief) => ({
  ...remoteSaying(
    [
      { branch: "work/orphan", tip: "aaa" },
      { branch: "work/fine", tip: "bbb" },
    ],
    {
      // The orphan stands urgent, so the take reaches for it first and the skip shows. [[spec/design_output/work#the-listing-reads-git-once]]
      "work/orphan:HANDOVER.md": brief.replace("status: todo", "status: todo\nurgent: true"),
      "work/fine:HANDOVER.md": brief,
    },
  ),
  "git merge-base origin/main origin/work/orphan": { exitCode: 1, stdout: "" },
  "git merge-base origin/main origin/work/fine": { stdout: "ccc\n" },
});

// [[spec/design_output/work#the-listing-reads-git-once]]
test("take passes over a branch sharing no ancestor with trunk, and names it", () => {
  const brief = "---\nstatus: todo\n---\n\n# Do the thing\n";
  const { it, outside } = doorsSaying(
    {
      ...ORPHANED(brief),
      "git rev-parse --abbrev-ref HEAD": { stdout: "work/fine\n" },
      "git rev-list --count HEAD..origin/main": { stdout: "0\n" },
    },
    { [HERE]: brief },
  );

  const { code, said } = heard(() => work(ROOT, ["take"], it));

  assert.equal(code, 0);
  assert.ok(
    ranGit(outside).includes("git switch work/fine"),
    "the take answers the other",
  );
  assert.ok(
    !ranGit(outside).includes("git switch work/orphan"),
    "and the orphan stands untouched",
  );
  assert.match(said, /work\/orphan/, "the answer names what it skips");
});

// [[spec/design_output/work#the-listing-reads-git-once]]
test("list marks a branch sharing no ancestor with trunk", () => {
  const { it } = doorsSaying(ORPHANED("---\nstatus: todo\n---\n"));

  const { said } = heard(() => work(ROOT, ["list"], it));

  assert.match(
    said,
    /work\/orphan\s+brief\s+orphan/,
    "the row says why no box takes it",
  );
  assert.match(said, /work\/fine\s+brief\s+todo/, "and the other reads as it stood");
});
