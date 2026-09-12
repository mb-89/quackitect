// The compaction probe, against the real client. One headless run, two turns,
// and the word the verb reads out of the log it leaves.
// [[spec/design_output/level0#the-layer-after-a-compaction]]

import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { skip, test } from "node:test";
import { fileURLToPath } from "node:url";
import { SESSION } from "../../.claude/skills/level0/lib/log.js";
import { disk } from "../../src/doors/disk.js";
import { proc } from "../../src/doors/proc.js";
import { DROPS, readsCompaction, SURVIVES } from "../../src/scripts/probe.js";
import { readTools, whereIs } from "../../src/scripts/tools.js";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const files = disk();
const outside = proc();
const client = whereIs(files, root, "claude", readTools(files, root));
const ifClient = files.exists(client) ? test : skip;
const WAIT = 900000;

ifClient(
  "the verb answers one word, and the log carries the two lines it reads",
  { timeout: WAIT },
  () => {
    const ran = outside.run(
      [process.execPath, join(root, "src", "scripts", "cli.js"), "probe", "compact"],
      { cwd: root, timeoutMs: WAIT },
    );

    assert.match(ran.stdout, /survives|drops/, ran.stderr);
    const read = readsCompaction(rowsHere());
    assert.ok([SURVIVES, DROPS].includes(read.answer), `the verb answers ${read.answer}`);
    assert.ok(read.reads >= 2, `the layer reaches the session ${read.reads} time(s)`);
    assert.equal(ran.exitCode, read.answer === SURVIVES ? 0 : 1);
  },
);

function rowsHere() {
  return files
    .read(join(root, SESSION))
    .split("\n")
    .filter((one) => one.trim())
    .map((one) => JSON.parse(one));
}
