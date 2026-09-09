// The guard that keeps a cloud box off trunk. It decides from a command and a
// branch name, so it is testable without a box.

import assert from "node:assert/strict";
import { test } from "node:test";
import { landsOnTrunk, touchesGit } from "../../.claude/skills/level0/lib/trunk.js";

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
    "./RUNME.sh work take",
    "./RUNME.sh work done",
    "RUNME.ps1 work new x",
  ]) {
    assert.equal(landsOnTrunk(said, "main"), "", said);
  }
});
