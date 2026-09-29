// The JavaScript readers' sections of the log golden file, over the fixture
// session log in src/quack/testdata. node test/level0/log-golden.js writes
// them again.
// [[spec/tickets/the-log-topic-lands]]

import { join } from "node:path";
import { asRow, rowsIn } from "../../.claude/skills/level0/lib/log.js";
import { rowsIn as extensionRowsIn } from "../extension/lib/rows.js";

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
export function readersOf(text) {
  return {
    [READERS.asRow]: rowsIn(text).map(asRow),
    [READERS.rowOf]: extensionRowsIn(text),
  };
}

// Writes the JavaScript sections into the golden file, and leaves every other section as it stands. [[spec/tickets/the-log-topic-lands]]
export function writeGolden(disk) {
  let golden = {};
  try {
    golden = JSON.parse(String(disk.read(GOLDEN)));
  } catch {}
  const said = { ...golden, ...readersOf(String(disk.read(FIXTURE))) };
  // The sections stand in key order, the order the Go tests write them in. [[spec/tickets/the-log-topic-lands]]
  const sorted = Object.fromEntries(
    Object.keys(said)
      .sort()
      .map((key) => [key, said[key]]),
  );
  disk.write(GOLDEN, `${JSON.stringify(sorted, null, 2)}\n`);
}
