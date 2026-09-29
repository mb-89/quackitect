// Each caller of the guidance shadow writes its row off the fake log where the
// slice reads shadow, and none where it reads old: the guidance verb's
// stepNotes and the pull's hand-out.
// [[spec/tickets/guidance-shadow-wiring-tested]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { BIN } from "../../.claude/skills/level0/lib/index.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeLog } from "../../src/doors/fake/log.js";
import { fakeProc } from "../../src/doors/fake/proc.js";
import { KEY, SHADOW } from "../../src/scripts/guidance-shadow.js";
import { guidance } from "../../src/scripts/guidance-verb.js";
import { handed } from "../../src/scripts/pull-hand.js";
import { leafOf } from "../../src/scripts/pull-route.js";

const ROOT = "/tree";
const QUACK = join(ROOT, BIN);
const LEAF = "standard:draft";
const OLD = "old";
const PROCESS = 'steps:\n  - name: draft\n    tags: ["code"]\n';
const STYLE = "spec/guidance/code/style";
const TICKET = `---\nkind: [[ticket]]\nprocess: [[spec/processes/standard]]\n${PROCESS}---\n\n# Ask\n\nthe ask\n`;

// The tree a caller reads, with the slice at the mode named, and a quack answering no note for the leaf. [[spec/tickets/guidance-shadow-wiring-tested]]
function itOf(mode) {
  return {
    disk: fakeDisk({
      [join(ROOT, "spec/processes/standard.yaml")]: PROCESS,
      [join(ROOT, `${STYLE}.md`)]: "# Style\n",
      [join(ROOT, ".se/tickets/one.md")]: TICKET,
      [QUACK]: "",
    }),
    proc: fakeProc({
      [`${QUACK} guidance`]: { stdout: JSON.stringify({ [LEAF]: [] }) },
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
  test(`stepNotes writes ${rows} shadow row(s) where the slice reads ${mode}`, async () => {
    const it = itOf(mode);
    guidance(it, ["--step", LEAF], {});
    await settled();
    const said = shadowRows(it.log);
    assert.equal(said.length, rows);
    if (rows) assert.equal(said[0].leaf, LEAF);
  });

  test(`the pull hand-out writes ${rows} shadow row(s) where the slice reads ${mode}`, async () => {
    const it = itOf(mode);
    const one = {
      name: "one",
      path: ".se/tickets/one.md",
      text: TICKET,
      private: true,
    };
    const leaf = leafOf({ steps: [{ name: "draft", tags: ["code"] }] }, "draft");
    handed(it, { group: "", hand: "box" }, one, leaf);
    await settled();
    const said = shadowRows(it.log);
    assert.equal(said.length, rows);
    if (rows) assert.deepEqual(said[0].old, [STYLE]);
  });
}
