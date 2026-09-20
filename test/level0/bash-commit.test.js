// The commit half of the bash door: a change lands with its test, and a
// merge passes whole because its code met the door with tests already.
// [[spec/design_output/tree#the-rules-over-two-files]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { onBash } from "../../src/bridge/bash.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeProc } from "../../src/doors/fake/proc.js";

const ROOT = "/tree";
const COMMIT = 'git commit -m "the door reads the delta"';
const CODE = [
  "diff --git a/src/bridge/one.js b/src/bridge/one.js",
  "+++ b/src/bridge/one.js",
  "@@ -0,0 +1 @@",
  "+export const one = 1;",
  "",
].join("\n");

// The box carries the environment, so a case sets one on it and touches nothing outside. [[spec/design_output/doors#a-door-reads-the-outside]]
function box(merging) {
  return {
    env: {},
    disk: fakeDisk({}),
    proc: fakeProc({
      "git rev-parse --abbrev-ref HEAD": { stdout: "claude/a-thing\n" },
      "git diff --cached --unified=0": { stdout: CODE },
      "git rev-parse -q --verify MERGE_HEAD": merging
        ? { stdout: "abc123\n" }
        : { stdout: "", exitCode: 1 },
    }),
    work: ROOT,
    method: ROOT,
    log: { say: () => {} },
    vale: { stands: () => false },
  };
}

const denied = (said) => String(said?.result?.deny ?? "");

test("a commit carrying code and no test is refused at the door", async () => {
  assert.match(
    denied(await onBash({ command: COMMIT }, box(false))),
    /no test beside it/,
  );
});

test("a merge commit passes the door whole", async () => {
  assert.equal(denied(await onBash({ command: COMMIT }, box(true))), "");
});
