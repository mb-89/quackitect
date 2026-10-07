// The copilot road assembles no Vale styles, since the Go rules read their own.
// [[spec/tickets/vale-leaves-the-tree]]

import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { disk } from "../../src/doors/disk.js";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));

test("the copilot road assembles no styles", () => {
  const source = disk().read(join(root, "src", "scripts", "copilot.js"));
  assert.doesNotMatch(source, /styles\.js|styles:/);
});
