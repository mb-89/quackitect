// The compaction probe, against the real client. One headless run over a few turns,
// and the word the verb reads out of the log it leaves. It costs ninety
// seconds and a pair of model calls, so SE_SLOW switches it on.
// [[spec/design_output/level0#the-layer-after-a-compaction]]

import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { skip, test } from "node:test";
import { fileURLToPath } from "node:url";
import { disk } from "../../src/doors/disk.js";
import { proc } from "../../src/doors/proc.js";
import { readTools, whereIs } from "../../src/engine/tools.js";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const files = disk();
const outside = proc();
const client = whereIs(files, root, "claude", readTools(files, root));
const asked = String(process.env.SE_SLOW ?? "").trim();
const ifAsked = asked && files.exists(client) ? test : skip;
const WAIT = 900000;

// The verb runs in Go, so the case starts it the way the owner does. [[spec/tickets/box-verbs-port-to-go]]
ifAsked(
  "the verb answers one word, and the log carries the two lines it reads",
  { timeout: WAIT },
  () => {
    const ran = outside.run(["sh", join(root, "RUNME.sh"), "probe", "compact"], {
      cwd: root,
      timeoutMs: WAIT,
    });

    const answer = /^(survives|drops): /m.exec(ran.stdout)?.[1];
    assert.ok(answer, `the verb answers no word: ${ran.stdout}${ran.stderr}`);
    const reads = Number(/reaches the session (\d+) time/.exec(ran.stdout)?.[1] ?? 0);
    assert.ok(reads >= 2, `the layer reaches the session ${reads} time(s)`);
    assert.equal(ran.exitCode, answer === "survives" ? 0 : 1);
  },
);
