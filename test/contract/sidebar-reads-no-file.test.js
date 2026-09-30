// The sidebar's source names no door read, list, import or file watch, so
// every value it draws comes off the index.
// [[spec/tickets/the-sidebar-reads-v1]]

import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { disk } from "../../src/doors/disk.js";

const ROOT = dirname(dirname(dirname(fileURLToPath(import.meta.url))));

test("sidebar.js names no door.read, door.list, door.imports or door.watch", () => {
  const text = disk().read(join(ROOT, "src/extension/sidebar.js"));
  assert.deepEqual(text.match(/door\.(read|list|imports|watch)\b/g) ?? [], []);
});
