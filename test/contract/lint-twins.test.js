// The lint verb runs in Go, and the check still runs the lint of cli-read.js
// until its own port lands. The case drives both over the real tree, so
// both answer one list of finding lines.
// [[spec/tickets/read-verbs-lint-drift]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { line as asLine } from "../../.claude/skills/level0/lib/refuse.js";
import { proc } from "../../src/doors/proc.js";
import * as reading from "../../src/scripts/cli-read.js";

const ROOT = join(import.meta.dirname, "..", "..");
// How long one run of the entry waits, the install and the tools' start among it, in milliseconds. [[spec/tickets/read-verbs-lint-drift]]
const RUN_TIMEOUT_MS = 300000;
// The file both read: a design note keeping a finding at warning, so the case compares findings when a ticket closes, and one file costs the battery seconds where a folder costs a minute. [[spec/tickets/one-reading-proves-one-file]] [[spec/tickets/lint-twins-reads-a-standing-finding]]
const WHERE = "spec/design_output/tui.md";
const FINDING = /^\S+:\d+:\d+: /;

test("the Go lint and the check's lint name the same finding lines", async () => {
  const said = proc().run(["sh", join(ROOT, "RUNME.sh"), "lint", WHERE], {
    cwd: ROOT,
    timeoutMs: RUN_TIMEOUT_MS,
  });
  assert.ok(said.exitCode === 0 || said.exitCode === 1, said.stderr);
  const inGo = said.stdout
    .split("\n")
    .filter((one) => FINDING.test(one))
    .sort();

  const got = await reading.readingFor([WHERE]);
  assert.equal(got.fault, "");
  const inNode = got.found
    .map((one) => asLine(one, reading.show(one.file ?? WHERE)))
    .sort();

  assert.ok(inNode.length > 0, "the file carries a finding, so the case compares findings; point WHERE at one that does");
  assert.deepEqual(inGo, inNode, said.stderr);
});
