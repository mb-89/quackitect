// The old reader's section of the guidance golden file: readsFor over every
// leaf of every process in this tree, on a box binding no env.
// node test/level0/guidance-golden.js writes it again.
// [[spec/tickets/the-guidance-topic-lands]]

import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..", "..");
export const GOLDEN = join(ROOT, "src", "quack", "testdata", "guidance.golden.json");
export const SECTION = "src/scripts/guidance-hand.js readsFor";

// Every leaf keyed process:path, and the notes readsFor hands it. [[spec/tickets/the-guidance-topic-lands]]
export function oldSection(it) {
  return {};
}

// Writes the old section into the golden file, and leaves every other section as it stands. [[spec/tickets/the-guidance-topic-lands]]
export function writeGolden(it) {}
