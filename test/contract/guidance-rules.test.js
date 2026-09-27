// The rules the shipped voice note hands every reader. A contract case,
// because it reads the note standing on the disk.
// [[spec/schemas]]

import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { actionables } from "../../.claude/skills/level0/lib/guidance.js";
import { disk } from "../../src/doors/disk.js";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const text = disk().read(join(root, "spec", "guidance", "voice.md"));

// [[spec/schemas]]
test("the output style reads every rule whole, and shows no mark", () => {
  for (const one of actionables(text)) {
    assert.doesNotMatch(one, /\*$/, "the chapter reader strips the star");
    assert.doesNotMatch(one, /`\*`$/, "a star in a code span strips the same way");
  }
});
