// The guard that keeps a cloud box off trunk. It decides from a command and a
// branch name, so it is testable without a box.

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  landsOnTrunk,
  refusedVersion,
  touchesGit,
  versionRefs,
} from "../../.claude/skills/level0/lib/trunk.js";

test("a command touching no git passes", () => {
  for (const said of ["ls -la", "node --test", "./RUNME.sh check", "npm run digit"]) {
    assert.deepEqual(touchesGit(said), { commits: false, pushes: false }, said);
    assert.equal(landsOnTrunk(said, "main"), "");
  }
});

test("a commit made on trunk is refused, and one on a branch passes", () => {
  const said = 'git commit -m "a thing"';
  assert.equal(landsOnTrunk(said, "main"), "commit");
  assert.equal(landsOnTrunk(said, "work/fix-lsp"), "");
});

test("a push naming trunk is refused from any branch", () => {
  assert.equal(landsOnTrunk("git push origin main", "work/fix-lsp"), "push");
  assert.equal(landsOnTrunk("git push origin HEAD:main", "work/fix-lsp"), "push");
  assert.equal(landsOnTrunk("git push -u origin main", "work/fix-lsp"), "push");
});

test("a push naming the branch passes", () => {
  assert.equal(landsOnTrunk("git push origin work/fix-lsp", "work/fix-lsp"), "");
  assert.equal(landsOnTrunk("git push", "work/fix-lsp"), "");
});

test("a flag before the verb does not hide it", () => {
  assert.equal(landsOnTrunk("git -C . commit -m x", "main"), "commit");
  assert.equal(landsOnTrunk("git --no-pager commit -m x", "main"), "commit");
});

test("the verbs the command line runs reach git inside node, so they pass here", () => {
  for (const said of [
    "./RUNME.sh branch take",
    "./RUNME.sh branch done",
    "RUNME.ps1 branch new x",
  ]) {
    assert.equal(landsOnTrunk(said, "main"), "", said);
  }
});

test("a command deleting a version branch is refused, however it is written", () => {
  const said = [
    "git push origin --delete v4",
    "git push origin -d v3",
    "git push origin :v4",
    "git push origin :refs/heads/v2",
    "git branch -D v1",
    "ls && git push origin --delete v1",
  ];
  for (const one of said) {
    assert.equal(versionRefs(one).length, 1, one);
    assert.equal(versionRefs(one)[0].how, "delete", one);
  }
});

test("a command rewriting a version branch is refused", () => {
  for (const one of ["git push --force origin v4", "git push origin +v4:v4"]) {
    assert.deepEqual(versionRefs(one), [{ name: "v4", how: "force" }], one);
  }
});

test("an ordinary push passes, and a name that merely opens with v passes", () => {
  const said = [
    "git push origin v4",
    "git push origin main",
    "git push -u origin claude/magical-euler-mi808w",
    "git branch -D v4-recovered",
    "git branch -D voice-recovered",
  ];
  for (const one of said) assert.deepEqual(versionRefs(one), [], one);
});

test("the refusal names the branch and what the command would do", () => {
  const said = refusedVersion(versionRefs("git push origin --delete v4"));
  assert.match(said, /^v4 is a version branch/);
  assert.match(said, /delete it\./);
});
