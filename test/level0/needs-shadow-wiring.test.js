// The pull's hand-out writes a needs shadow row off the fake log where the
// verbs slice reads shadow, and none where it reads old.
// [[spec/tickets/pull-verbs-become-actions]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { BIN } from "../../.claude/skills/level0/lib/index.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeLog } from "../../src/doors/fake/log.js";
import { fakeProc } from "../../src/doors/fake/proc.js";
import { KEY, SHADOW } from "../../src/scripts/needs-shadow.js";
import { handed } from "../../src/scripts/pull-hand.js";
import { leafOf } from "../../src/scripts/pull-route.js";

const ROOT = "/tree";
const QUACK = join(ROOT, BIN);
const OLD = "old";
const NEED = "branch open";
const PROCESS = 'steps:\n  - name: draft\n    needs: ["branch open"]\n';
const TICKET = `---\nkind: [[ticket]]\nprocess: [[spec/processes/standard]]\n${PROCESS}---\n\n# Ask\n\nthe ask\n`;

// The tree the hand-out reads, with the verbs slice at the mode named, and a registry holding no branch action. [[spec/tickets/pull-verbs-become-actions]]
function itOf(mode) {
  return {
    disk: fakeDisk({
      [join(ROOT, "spec/processes/standard.yaml")]: PROCESS,
      [join(ROOT, ".se/tickets/one.md")]: TICKET,
      [QUACK]: "",
    }),
    proc: fakeProc({
      [`${QUACK} get index/actions`]: {
        stdout: JSON.stringify([{ name: "ticket/pull" }]),
      },
    }),
    join,
    root: ROOT,
    method: ROOT,
    work: ROOT,
    env: {},
    config: { ask: async (key) => (key === KEY ? mode : "") },
    log: fakeLog(),
  };
}

const shadowRows = (log) => log.lines().filter((one) => one.kind === SHADOW);
const settled = () => new Promise((done) => setImmediate(done));

for (const [mode, rows] of [
  [SHADOW, 1],
  [OLD, 0],
]) {
  test(`the pull hand-out writes ${rows} needs row(s) where the slice reads ${mode}`, async () => {
    const it = itOf(mode);
    const one = {
      name: "one",
      path: ".se/tickets/one.md",
      text: TICKET,
      private: true,
    };
    const leaf = leafOf({ steps: [{ name: "draft", needs: [NEED] }] }, "draft");
    handed(it, { group: "", hand: "box" }, one, leaf);
    await settled();
    const said = shadowRows(it.log);
    assert.equal(said.length, rows);
    if (rows) assert.equal(said[0].need, NEED);
  });
}
