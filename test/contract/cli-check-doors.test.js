// The doors the commit verb runs over carry the environment, so the verb reads
// the box it runs on and a desk pushes nothing.
// [[spec/guidance/working]]

import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { disk } from "../../src/doors/disk.js";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const source = disk().read(join(root, "src", "scripts", "cli-check.js"));

// [[spec/guidance/working]]
test("the commit verb's doors carry the environment", () => {
  const doors = /export function commitDoors\(\)[\s\S]*?\n}\n/.exec(source)?.[0] ?? "";
  assert.match(doors, /env: process\.env/, "the verb reads the box it runs on");
});
