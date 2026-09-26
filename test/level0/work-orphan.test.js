// A branch sharing no ancestor with trunk, driven through the fake doors beside
// this file. No sync reaches such a branch, so the take passes it over and the
// listing says why.
// [[spec/design_output/work#the-listing-reads-git-once]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { work } from "../../src/scripts/work.js";
import { baseOnTrunk } from "../../src/scripts/work-stands.js";
import {
  doorsSaying,
  GROUP_NOTE,
  HAND,
  heard,
  on,
  ROOT,
  ranGit,
  remoteSaying,
} from "./work-doors.js";

// [[spec/design_output/work#the-listing-reads-git-once]]
const ORPHANED = () => ({
  ...remoteSaying(
    [
      { branch: "work/orphan", tip: "aaa" },
      { branch: "work/fine", tip: "bbb" },
    ],
    {
      // The orphan stands urgent, so the take reaches for it first and the skip shows. [[spec/design_output/work#the-listing-reads-git-once]]
      "work/orphan:spec/tickets/orphan.md": GROUP_NOTE,
      "work/fine:spec/tickets/fine.md": GROUP_NOTE.replace("urgent: true\n", ""),
    },
  ),
  "git merge-base origin/main origin/work/orphan": { exitCode: 1, stdout: "" },
  "git merge-base origin/main origin/work/fine": { stdout: "ccc\n" },
});

// [[spec/design_output/work#the-listing-reads-git-once]]
test("take passes over a branch sharing no ancestor with trunk, and names it", () => {
  const { it, outside } = doorsSaying(
    {
      ...ORPHANED(),
      "git rev-parse --abbrev-ref HEAD": { stdout: "work/fine\n" },
      "git rev-list --count HEAD..origin/main": { stdout: "0\n" },
    },
    { [on("fine")]: GROUP_NOTE.replace("urgent: true\n", ""), ...HAND },
  );

  // A take runs on a cloud box alone. [[spec/design_output/work#a-desk-works-on-trunk]]
  const { code, said } = heard(() => work(ROOT, ["take"], { ...it, cloud: true }));

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
  const { it } = doorsSaying(ORPHANED());

  const { said } = heard(() => work(ROOT, ["list"], it));

  assert.match(said, /work\/orphan\s+orphan/, "the row says why no box takes it");
  assert.match(said, /work\/fine\s+todo/, "and the other reads as it stood");
});

// A shallow clone holds no base older than its depth, so the listing fetches the rest before it calls a branch an orphan. [[spec/design_output/work#the-listing-reads-git-once]]
test("list fetches a shallow clone whole before it marks a branch an orphan", () => {
  let whole = false;
  const { it, outside } = doorsSaying({
    ...ORPHANED(),
    "git rev-parse --is-shallow-repository": () => ({
      stdout: whole ? "false\n" : "true\n",
    }),
    "git fetch --unshallow origin": () => {
      whole = true;
      return {};
    },
    "git merge-base origin/main origin/work/orphan": () =>
      whole ? { stdout: "ddd\n" } : { exitCode: 1, stdout: "" },
  });

  const { said } = heard(() => work(ROOT, ["list"], it));

  assert.ok(
    ranGit(outside).includes("git fetch --unshallow origin"),
    "the listing fetches the history the clone lacks",
  );
  assert.doesNotMatch(
    said,
    /work\/orphan\s+orphan/,
    "and the branch reads as it stands",
  );
});

// The base itself: red on a shallow clone, then the commit once the history stands whole. [[spec/design_output/work#the-listing-reads-git-once]]
test("the base fetches a shallow clone whole and asks again", () => {
  let whole = false;
  const { it } = doorsSaying({
    "git rev-parse --is-shallow-repository": () => ({
      stdout: whole ? "false\n" : "true\n",
    }),
    "git fetch --unshallow origin": () => {
      whole = true;
      return {};
    },
    "git merge-base origin/main origin/work/old": () =>
      whole ? { stdout: "eee\n" } : { exitCode: 1, stdout: "" },
  });

  assert.deepEqual(baseOnTrunk(it, "work/old"), { shares: true, base: "eee" });
});
