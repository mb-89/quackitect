// The read the window takes off the session log: the files a span opens, and
// the rows they hold. The log verb runs in Go, and src/quack/verb_log_test.go
// drives its filters.
// [[spec/design_output/log#one-verb-reads-the-log]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { OLD, SESSION } from "../../.claude/skills/level0/lib/log.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { filesFor, rowsIn } from "../../src/scripts/log-read.js";

const ROOT = "/tree";
const NOW = Date.parse("2026-01-01T12:00:00.000Z");

const row = (at, said) => ({ at, level: "info", kind: "hook", said });
const rows = [
  row("2026-01-01T09:00:00.000Z", "the door reads a write"),
  row("2026-01-01T11:30:00.000Z", "take answered 0"),
];

const said = (held) => held.map((one) => one.said);

// [[spec/design_output/log#a-session-rotates-its-file]]
test("a span opens the session file and every rotated file it reaches", () => {
  const old = join(ROOT, OLD);
  const it = {
    root: ROOT,
    join,
    disk: fakeDisk({
      [join(ROOT, SESSION)]: "",
      [join(old, "2026-01-01T11-00-00-aaa.jsonl")]: "",
      [join(old, "2025-12-30T08-00-00-bbb.jsonl")]: "",
      [join(old, "2025-12-20T08-00-00-ccc.jsonl")]: "",
    }),
    names: (at, end) =>
      it.disk
        .list(at)
        .filter((one) => one.name.endsWith(end))
        .map((one) => one.name),
  };

  assert.deepEqual(
    filesFor(it, "2h", NOW),
    [
      join(old, "2025-12-30T08-00-00-bbb.jsonl"),
      join(old, "2026-01-01T11-00-00-aaa.jsonl"),
      join(ROOT, SESSION),
    ],
    "the newest file opening before the span runs on into it, and an older one stays shut",
  );
  const far = filesFor(it, "20d", NOW);
  assert.equal(far.length, 4, "a wider span reaches the older files too");
  assert.equal(far.at(-1), join(ROOT, SESSION), "the session file reads last");
});

// Two writers appending at once tear one line. [[spec/design_output/log#every-writer-appends]]
test("a torn line drops alone, and the rows around it read in the order they stand", () => {
  const at = join(ROOT, SESSION);
  const it = {
    disk: fakeDisk({
      [at]: `${JSON.stringify(rows[0])}\n{"at":"2026-01\n${JSON.stringify(rows[1])}\n`,
    }),
  };
  assert.deepEqual(said(rowsIn(it, [at])), ["the door reads a write", "take answered 0"]);
});
