// The trunk door on a cloud box: a work branch in hand hands it back, and a
// session outside that flow lands its own work over a green battery.
// [[spec/design_output/work#a-box-writes-its-branch]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { STAMP } from "../../.claude/skills/level0/lib/runs.js";
import { onBash } from "../../src/bridge/bash.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeProc } from "../../src/doors/fake/proc.js";

const ROOT = "/tree";
const SHA = "abc123";
const HEAD = "git rev-parse --abbrev-ref HEAD";
const PUSH = "git push origin main";

function box(branch, green = true) {
  return {
    disk: fakeDisk({
      [`${ROOT}/${STAMP}`]: JSON.stringify({
        sha: green ? SHA : "0000",
        ok: true,
        clean: true,
        at: "now",
      }),
    }),
    proc: fakeProc({
      [HEAD]: { stdout: `${branch}\n` },
      "git rev-parse HEAD": { stdout: `${SHA}\n` },
    }),
    work: ROOT,
    method: ROOT,
    log: { say: () => {} },
  };
}

// The door reads the variable past an await, so the case holds it until the answer stands.
async function onACloud(what) {
  const was = process.env.CLAUDE_CODE_REMOTE;
  process.env.CLAUDE_CODE_REMOTE = "true";
  try {
    return await what();
  } finally {
    if (was === undefined) delete process.env.CLAUDE_CODE_REMOTE;
    else process.env.CLAUDE_CODE_REMOTE = was;
  }
}

const denied = (said) => String(said?.result?.deny ?? "");

test("a work branch in hand hands the work back, and trunk stays shut", async () => {
  const said = await onACloud(() => onBash({ command: PUSH }, box("work/a-thing")));
  assert.match(denied(said), /hands it back/);
});

test("a session outside the queue lands its own work on trunk", async () => {
  const said = await onACloud(() => onBash({ command: PUSH }, box("claude/a-thing")));
  assert.equal(denied(said), "", "the door says nothing");
});

test("a red battery refuses the push on any branch", async () => {
  const said = await onACloud(() =>
    onBash({ command: PUSH }, box("claude/a-thing", false)),
  );
  assert.match(denied(said), /green battery/);
});
