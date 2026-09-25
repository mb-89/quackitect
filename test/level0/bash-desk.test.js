// The desk half of the bash door: a desk standing on a work branch lands
// nothing there, and a cloud box works its branch past this guard.
// [[spec/design_output/work#a-desk-works-on-trunk]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { onBash } from "../../src/bridge/bash.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeProc } from "../../src/doors/fake/proc.js";

const ROOT = "/tree";

// The box carries the environment, so a case sets one on it and touches nothing outside. [[spec/design_output/doors#a-door-reads-the-outside]]
function box(branch, env = {}) {
  return {
    env,
    disk: fakeDisk({}),
    proc: fakeProc({
      "git rev-parse --abbrev-ref HEAD": { stdout: `${branch}\n` },
      "git rev-parse -q --verify MERGE_HEAD": { stdout: "", exitCode: 1 },
    }),
    work: ROOT,
    method: ROOT,
    log: { say: () => {} },
    vale: { stands: () => false },
  };
}

const denied = (said) => String(said?.result?.deny ?? "");

// [[spec/design_output/work#a-desk-works-on-trunk]]
test("a desk's raw commit on a work branch refuses, and names main", async () => {
  const said = denied(
    await onBash({ command: "git commit -m x" }, box("work/a-thing")),
  );
  assert.match(said, /A desk works on main alone/);
  assert.match(said, /git switch main/);
});

// [[spec/design_output/work#a-desk-works-on-trunk]]
test("a desk's raw push on a work branch refuses, and names main", async () => {
  const said = denied(
    await onBash({ command: "git push origin work/a-thing" }, box("work/a-thing")),
  );
  assert.match(said, /git switch main/);
});

// [[spec/design_output/work#a-desk-works-on-trunk]]
test("a cloud box commits and pushes its work branch past the desk guard", async () => {
  const cloud = { CLAUDE_CODE_REMOTE: "true" };
  assert.equal(
    denied(await onBash({ command: "git commit -m x" }, box("work/a-thing", cloud))),
    "",
  );
  assert.equal(
    denied(
      await onBash(
        { command: "git push origin work/a-thing" },
        box("work/a-thing", cloud),
      ),
    ),
    "",
  );
});
