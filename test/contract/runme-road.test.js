// ./RUNME.sh hands a verb quack knows to it, and every other verb to its program,
// as the verbs slice's mode reads, built in at new since the switch-over.
// [[spec/tickets/runme-hands-verbs-to-quack]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { proc } from "../../src/doors/proc.js";

const ROOT = join(import.meta.dirname, "..", "..");
// How long one run of the entry waits, the install and a door start among it, in milliseconds. [[spec/tickets/runme-hands-verbs-to-quack]]
const RUN_TIMEOUT_MS = 300000;

const runs = (...argv) =>
  proc().run(["sh", join(ROOT, "RUNME.sh"), ...argv], {
    cwd: ROOT,
    timeoutMs: RUN_TIMEOUT_MS,
  });

test("./RUNME.sh hands get to quack, which reads the verbs slice off the index", () => {
  const said = runs("get", "migration/config/verbs");
  assert.equal(said.exitCode, 0, said.stderr);
  assert.match(said.stdout.trim().split("\n").at(-1), /^"(old|shadow|new)"$/);
});

test("./RUNME.sh hands config to its program, which names the verbs slice at its built-in new", () => {
  const said = runs("config", "migration.verbs");
  assert.equal(said.exitCode, 0, said.stderr);
  assert.match(said.stdout, /migration\.verbs\s+new\s+built-in/);
});
