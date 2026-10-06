// The desk half of the bash door: a desk standing on a work branch lands
// nothing there, and a cloud box works its branch past this guard.
// [[spec/design_output/work#a-desk-works-on-trunk]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { onBash } from "../../src/bridge/bash.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeProc } from "../../src/doors/fake/proc.js";
import { NAMED, named, VERB_ALONE } from "./fixtures.js";

const ROOT = "/tree";

// The node the desk refusal raises, seeded so the door reads its remedy off the fake disk. [[spec/design_output/failures#the-refusals-move-onto-nodes]]
const DESK_NODE = {
  [`${ROOT}/spec/failures/desk-works-on-trunk.md`]:
    '---\nkind: [[failure]]\nlevel: warn\nremedies: ["Run git switch main, and take a finished cloud branch in."]\n---\n\n# When\n\nA desk lands work on a work branch.\n',
};

// A call names its ticket at the head of its description, so a case wraps its command with the shared open one. [[spec/design_output/level0#a-shell-names-its-ticket]]
const call = (command) => ({ command, description: `${NAMED}: drives the door` });

// The box carries the environment, so a case sets one on it and touches nothing outside. [[spec/design_output/doors#a-door-reads-the-outside]]
function box(branch, env = {}) {
  return {
    env,
    disk: fakeDisk({ ...named(ROOT), ...DESK_NODE }),
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
test("a desk's raw commit on a work branch refuses through the failure door, and names main", async () => {
  const said = denied(await onBash(call("git commit -m x"), box("work/a-thing")));
  assert.match(said, /A desk works on main alone/);
  assert.match(said, /^failure desk-works-on-trunk at warn$/m);
  assert.match(said, /^remedy: Run git switch main/m);
});

// [[spec/design_output/work#a-desk-works-on-trunk]]
test("a desk's raw push on a work branch refuses, and names main", async () => {
  const said = denied(
    await onBash(call("git push origin work/a-thing"), box("work/a-thing")),
  );
  assert.match(said, /git switch main/);
});

// [[spec/design_output/work#a-desk-works-on-trunk]]
test("a cloud box's commit and push pass the desk guard, and meet the verb rule alone", async () => {
  const cloud = { CLAUDE_CODE_REMOTE: "true" };
  assert.match(
    denied(await onBash(call("git commit -m x"), box("work/a-thing", cloud))),
    VERB_ALONE,
  );
  assert.match(
    denied(
      await onBash(call("git push origin work/a-thing"), box("work/a-thing", cloud)),
    ),
    VERB_ALONE,
  );
});
