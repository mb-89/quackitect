// The log verb writes its shadow row off the fake log where the slice reads
// shadow, none where it reads old, and none for a row its flags drop.
// [[spec/tickets/log-shadow-wiring-gets-tests]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { BIN } from "../../.claude/skills/level0/lib/index.js";
import { SESSION } from "../../.claude/skills/level0/lib/log.js";
import { fakeClock } from "../../src/doors/fake/clock.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeLog } from "../../src/doors/fake/log.js";
import { fakeProc } from "../../src/doors/fake/proc.js";
import { KEY, SHADOW } from "../../src/scripts/log-shadow.js";
import { logVerb } from "../../src/scripts/log-verb.js";

const ROOT = "/tree";
const QUACK = join(ROOT, BIN);
const OLD = "old";
const AT = "2026-01-02T03:04:05.000Z";
const LATER = "2026-01-02T03:04:06.000Z";

const row = (at, level, kind, said) => ({ at, level, kind, said });

// The tree the verb reads, with the slice at the mode named, the session log holding the rows, and a quack answering its own. [[spec/tickets/log-shadow-wiring-gets-tests]]
function itOf(mode, held, answered) {
  return {
    disk: fakeDisk({
      [join(ROOT, SESSION)]: `${held.map((one) => JSON.stringify(one)).join("\n")}\n`,
      [QUACK]: "",
    }),
    proc: fakeProc({ [`${QUACK} log`]: { stdout: JSON.stringify(answered) } }),
    join,
    root: ROOT,
    method: ROOT,
    clock: fakeClock(),
    names: () => [],
    config: { ask: async (key) => (key === KEY ? mode : "") },
    log: fakeLog(),
  };
}

const shadowRows = (log) => log.lines().filter((one) => one.kind === SHADOW);

// The verb prints its rows, and a case reads the log alone. [[spec/tickets/log-shadow-wiring-gets-tests]]
async function quietly(run) {
  const was = console.log;
  console.log = () => {};
  try {
    return await run();
  } finally {
    console.log = was;
  }
}

for (const [mode, rows] of [
  [SHADOW, 1],
  [OLD, 0],
]) {
  test(`the log verb writes ${rows} shadow row(s) where the slice reads ${mode}`, async () => {
    const it = itOf(
      mode,
      [row(AT, "info", "tool", "reads"), row(LATER, "warn", "vale", "flags")],
      [row(AT, "info", "tool", "reads"), row(LATER, "info", "vale", "flags")],
    );
    assert.equal(await quietly(() => logVerb(it, [])), 0);
    const said = shadowRows(it.log);
    assert.equal(said.length, rows);
    if (rows) {
      assert.equal(said[0].stamp, LATER, "the door stamps its own at");
      assert.equal(said[0].old.level, "warn");
      assert.equal(said[0].new.level, "info");
    }
  });
}

// quack log answers every row, so a row a flag drops still meets its match. [[spec/tickets/log-shadow-reads-unfiltered-rows]]
for (const flags of [
  ["--kind", "vale"],
  ["--level", "warn"],
  ["--last", "1"],
  ["--since", "1m"],
]) {
  test(`a verb run under ${flags.join(" ")} writes no shadow row where every row agrees`, async () => {
    const both = [
      row(AT, "info", "tool", "reads"),
      row(LATER, "warn", "vale", "flags"),
    ];
    const it = itOf(SHADOW, both, both);
    assert.equal(await quietly(() => logVerb(it, flags)), 0);
    assert.deepEqual(shadowRows(it.log), []);
    assert.equal(it.proc.ran.length, 1, "the verb ran quack log once");
  });
}
