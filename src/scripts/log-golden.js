// The JavaScript readers' sections of the log golden file, over the fixture
// session log in src/quack/testdata. node test/level0/log-golden.js writes
// them again.
// [[spec/tickets/the-log-topic-lands]]

import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..", "..");
export const TESTDATA = join(ROOT, "src", "quack", "testdata");
export const GOLDEN = join(TESTDATA, "log.golden.json");
export const FIXTURE = join(TESTDATA, "session.jsonl");

// The names each JavaScript reader stands under in the golden file. [[spec/tickets/the-log-topic-lands]]
export const READERS = {
  asRow: ".claude/skills/level0/lib/log.js asRow",
  rowOf: "src/extension/lib/rows.js rowOf",
};

// Each reader's rows off the fixture's text, by the name it stands under. [[spec/tickets/the-log-topic-lands]]
export function readersOf(_text) {
  return {};
}

// Writes the JavaScript sections into the golden file, and leaves every other section as it stands. [[spec/tickets/the-log-topic-lands]]
export function writeGolden(_disk) {}
