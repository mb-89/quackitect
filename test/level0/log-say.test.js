// The log verb's say: one row appended to the session log, where a row
// another writer lands in the meantime stays.
// [[spec/tickets/the-sidebar-writes-through-actions]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { SESSION } from "../../.claude/skills/level0/lib/log.js";
import { fakeClock } from "../../src/doors/fake/clock.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { logVerb } from "../../src/scripts/log-verb.js";

const ROOT = "/tree";
const HERE = join(ROOT, SESSION);
const HELD = `${JSON.stringify({ at: "x", level: "info", kind: "level0", said: "session start" })}\n`;
const OTHER = `${JSON.stringify({ at: "x", level: "info", kind: "cli", said: "the other writer" })}\n`;

// Another writer lands a row the moment the verb first touches the session log. [[spec/design_output/log#every-writer-appends]]
function itOf() {
  const files = fakeDisk({ [HERE]: HELD });
  let landed = false;
  const lands = (path) => {
    if (landed || path !== HERE) return;
    landed = true;
    files.append(HERE, OTHER);
  };
  const disk = {
    ...files,
    read: (path) => {
      const said = files.read(path);
      lands(path);
      return said;
    },
    append: (path, text) => {
      lands(path);
      files.append(path, text);
    },
  };
  return {
    files,
    it: {
      disk,
      join,
      root: ROOT,
      method: ROOT,
      work: ROOT,
      env: {},
      clock: fakeClock(),
      names: () => [],
      slices: { log: "old" },
    },
  };
}

async function quiet(run) {
  const was = console.log;
  console.log = () => {};
  try {
    return await run();
  } finally {
    console.log = was;
  }
}

test("log --say appends one row and keeps a row another writer lands", async () => {
  const { files, it } = itOf();
  const row = {
    level: "warn",
    kind: "sidebar",
    said: "one press",
    extra: { detail: "a click" },
  };
  const code = await quiet(() => logVerb(it, ["--say", JSON.stringify(row)]));
  assert.equal(code, 0);
  const rows = files
    .read(HERE)
    .trim()
    .split("\n")
    .map((one) => JSON.parse(one));
  assert.deepEqual(
    rows.map((one) => one.said),
    ["session start", "the other writer", "one press"],
    "the row lands after every row the log holds, and the other writer's row stays",
  );
  const { at, ...said } = rows.at(-1);
  assert.equal(typeof at, "string", "the row carries its stamp");
  assert.deepEqual(
    said,
    { level: "warn", kind: "sidebar", said: "one press", detail: "a click" },
    "the row carries its level, kind, words and extra fields",
  );
});
