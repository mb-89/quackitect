// The marks a conflicted merge leaves, read off a file, a staged delta and the
// unmerged listing, and the refusal every commit road answers with.
// [[spec/design_output/work#no-commit-carries-a-marker]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { fakeGit } from "../../src/doors/fake/git.js";
import {
  markedIn,
  markersIn,
  mergeRefusal,
  stagesIn,
  unmergedFault,
} from "../../.claude/skills/level0/lib/markers.js";
import { conflicted, OPENS, PARTS, SHUTS } from "./fixtures.js";

test("a conflicted text marks the opener, the split and the closer", () => {
  const text = ["---", ...conflicted(["a: 1"], ["b: 2"]), "---", ""].join("\n");
  assert.deepEqual(markersIn(text), [2, 4, 6]);
});

test("a setext underline and a lone closer mark nothing", () => {
  assert.deepEqual(markersIn(`A heading\n${PARTS}\n\n${SHUTS}\n`), []);
});

test("a staged delta adding an opener names its file and line", () => {
  const delta = [
    "diff --git a/spec/tickets/a.md b/spec/tickets/a.md",
    "--- a/spec/tickets/a.md",
    "+++ b/spec/tickets/a.md",
    "@@ -3,0 +4,3 @@ kind",
    `+${OPENS}`,
    `+${PARTS}`,
    `+${SHUTS}`,
  ].join("\n");
  assert.deepEqual(markedIn(delta), [{ file: "spec/tickets/a.md", line: 4 }]);
});

test("the unmerged listing reads each path with its stages", () => {
  const said = [
    "100644 aaa111 1\tspec/tickets/a.md",
    "100644 bbb222 2\tspec/tickets/a.md",
    "100644 ccc333 3\tspec/tickets/a.md",
    "100644 ddd444 1\tspec/tickets/gone.md",
    "100644 eee555 2\tspec/tickets/gone.md",
  ].join("\n");
  const stages = stagesIn(said);
  assert.deepEqual([...stages.get("spec/tickets/a.md")], [1, 2, 3]);
  assert.deepEqual([...stages.get("spec/tickets/gone.md")], [1, 2]);
});

test("the refusal names each file and says to resolve the merge first", () => {
  const said = mergeRefusal(["src/a.go"], [{ file: "spec/tickets/a.md", line: 4 }]);
  assert.match(said, /src\/a\.go {2}git lists it unmerged/);
  assert.match(said, /spec\/tickets\/a\.md:4 {2}a conflict marker/);
  assert.match(said, /Resolve the merge first/);
  assert.equal(mergeRefusal(), "");
});

test("a step verb meets a refusal while git lists an unmerged path, and none past it", () => {
  const listed = fakeGit({
    "git ls-files -u": { stdout: "100644 aaa111 2\tsrc/a.go\n" },
  });
  assert.match(unmergedFault(listed), /src\/a\.go/);
  assert.equal(unmergedFault(fakeGit()), "");
});
