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

const CLOUD = { CLAUDE_CODE_REMOTE: "true" };

// The box carries the environment, so a case sets one on it and touches nothing outside. [[spec/design_output/doors#a-door-reads-the-outside]]
function box(branch, green = true, env = CLOUD) {
  return {
    env,
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

const denied = (said) => String(said?.result?.deny ?? "");

test("a work branch in hand hands the work back, and trunk stays shut", async () => {
  const said = await onBash({ command: PUSH }, box("work/a-thing"));
  assert.match(denied(said), /hands it back/);
});

test("a session outside the queue lands its own work on trunk", async () => {
  const said = await onBash({ command: PUSH }, box("claude/a-thing"));
  assert.equal(denied(said), "", "the door says nothing");
});

test("a red battery refuses the push on any branch", async () => {
  const said = await onBash({ command: PUSH }, box("claude/a-thing", false));
  assert.match(denied(said), /green battery/);
});

// The door reads the script a command runs, off the disk it holds. [[spec/design_output/bash#a-shell-writes-nothing]]
test("the door reads a script off the disk, and refuses the write inside it", async () => {
  const it = box("claude/a-thing");
  it.disk.write(`${ROOT}/.se/scripts/edit.mjs`, 'writeFileSync("README.md", "one");\n');

  const said = await onBash({ command: "node .se/scripts/edit.mjs" }, it);

  assert.match(denied(said), /README\.md/);
  assert.match(denied(said), /\.se\/scripts\/edit\.mjs/);
});

test("a script standing nowhere leaves the command alone", async () => {
  const said = await onBash({ command: "node .se/scripts/gone.mjs" }, box("claude/a-thing"));

  assert.equal(denied(said), "", "the door says nothing");
});
