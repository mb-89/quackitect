// ./RUNME.sh hands a verb quack knows to it, and every other verb to its program,
// as the verbs slice's mode reads, built in at new since the switch-over.
// [[spec/tickets/runme-hands-verbs-to-quack]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { before, test } from "node:test";
import { fileURLToPath } from "node:url";
import { clock } from "../../src/doors/clock.js";
import { disk } from "../../src/doors/disk.js";
import { index } from "../../src/doors/index.js";
import { proc } from "../../src/doors/proc.js";

const ROOT = join(import.meta.dirname, "..", "..");

// The road meets a door that stands, so a slow box waits and a broken road alone fails. [[spec/tickets/runme-road-waits-on-ready]]
before(() => {
  index(disk(), proc(), clock(), ROOT).ready();
});

const runs = (...argv) => proc().run(["sh", join(ROOT, "RUNME.sh"), ...argv], { cwd: ROOT });

// The road waits on the index's ready event, and a timer guesses at nothing. [[spec/tickets/runme-road-waits-on-ready]]
test("the road waits on the index's ready event, and names no timer", () => {
  const text = String(disk().read(fileURLToPath(import.meta.url)));
  assert.match(text, /\.ready\(\)/, "the file waits on the ready event");
  assert.doesNotMatch(text, new RegExp(["time", "outMs|set", "Timeout|_", "MS\\b"].join("")), "the file names no timer");
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
