// The road to node stands nowhere: quack's verb road names no program, and
// neither the verb programs nor their runner stands in the tree.
// [[spec/tickets/program-of-drops-node]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { disk } from "../../src/doors/disk.js";

const ROOT = join(import.meta.dirname, "..", "..");
const ROAD = join(ROOT, "src", "quack", "verbs.go");
const GONE = ["src/scripts/verbs", "src/scripts/verb-run.js"];

test("quack's verb road starts no node program", () => {
  const text = String(disk().read(ROAD));
  assert.doesNotMatch(text, /"node"/, "verbs.go still names node as a program");
});

test("neither the verb programs nor their runner stands", () => {
  const files = disk();
  for (const one of GONE) assert.ok(!files.exists(join(ROOT, one)), `${one} still stands`);
});
