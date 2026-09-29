// Each caller of the prose shadow writes its row off the fake log where the
// slice reads shadow, and none where it reads old: the draft read, the lint's
// walk and the voice over a ticket.
// [[spec/tickets/prose-shadow-wiring-gets-tests]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { TRACKED } from "../../.claude/skills/level0/lib/config.js";
import { BIN } from "../../.claude/skills/level0/lib/index.js";
import { findingsOver, voiceOver } from "../../src/bridge/findings.js";
import { readsProse } from "../../src/bridge/prose.js";
import { KEY, SHADOW } from "../../src/bridge/prose-shadow.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeLog } from "../../src/doors/fake/log.js";
import { fakeProc } from "../../src/doors/fake/proc.js";

const ROOT = "/tree";
const QUACK = join(ROOT, BIN);
const FILE = "notes.md";
const TEXT = "the door set the write\n";
const SET = { rule: "VoiceParagraph.PastTense", line: 1, column: 10, said: "set" };
const OLD = "old";

// Vale names set as past, which wink drops and the fake quack keeps, as it keeps every finding it is handed. [[spec/tickets/prose-shadow-wiring-gets-tests]]
function procOf() {
  const vale = JSON.stringify({
    [FILE]: [
      {
        Check: SET.rule,
        Line: SET.line,
        Span: [SET.column, SET.column + 2],
        Match: SET.said,
        Message: "past",
        Severity: "error",
      },
    ],
  });
  return fakeProc({
    vale: { stdout: vale },
    biome: { stdout: "{}" },
    [`${QUACK} prose`]: (_argv, init) => {
      const docs = JSON.parse(init.stdin).docs.map((one) => ({ kept: one.found }));
      return { stdout: JSON.stringify({ docs }) };
    },
  });
}

// The lint's doors and the pull's, with the slice at the mode named. [[spec/tickets/prose-shadow-wiring-gets-tests]]
function itOf(mode) {
  return {
    disk: fakeDisk({ [join(ROOT, FILE)]: TEXT, [QUACK]: "" }),
    proc: procOf(),
    join,
    root: ROOT,
    method: ROOT,
    work: ROOT,
    vale: "vale",
    biome: "biome",
    ceilings: { function: 150, file: 600 },
    config: { ask: async (key) => (key === KEY ? mode : "") },
    log: fakeLog(),
  };
}

// The bridge's box, which reads the slice off the tracked config. [[spec/tickets/prose-shadow-wiring-gets-tests]]
function boxOf(mode) {
  const config = JSON.stringify({ migration: { prose: mode } });
  return {
    disk: fakeDisk({ [join(ROOT, TRACKED)]: config, [QUACK]: "" }),
    proc: procOf(),
    root: ROOT,
    method: ROOT,
    work: ROOT,
    env: {},
    log: fakeLog(),
  };
}

const shadowRows = (log) => log.lines().filter((one) => one.kind === SHADOW);
const settled = () => new Promise((done) => setImmediate(done));

for (const [mode, rows] of [
  [SHADOW, 1],
  [OLD, 0],
]) {
  test(`readsProse writes ${rows} shadow row(s) where the slice reads ${mode}`, async () => {
    const box = boxOf(mode);
    readsProse(box, TEXT, [{ ...SET, file: FILE }]);
    await settled();
    assert.equal(shadowRows(box.log).length, rows);
  });

  test(`findingsOver writes ${rows} shadow row(s) where the slice reads ${mode}`, async () => {
    const it = itOf(mode);
    await findingsOver(it, [FILE]);
    const said = shadowRows(it.log);
    assert.equal(said.length, rows);
    if (rows) assert.equal(said[0].file, FILE);
  });

  test(`voiceOver writes ${rows} shadow row(s) where the slice reads ${mode}`, async () => {
    const it = itOf(mode);
    voiceOver(it, FILE, TEXT);
    await settled();
    assert.equal(shadowRows(it.log).length, rows);
  });
}

test("readsProse starts quack with the event loop free, and runs it on no sync spawn", async () => {
  const box = boxOf(SHADOW);
  const started = [];
  const start = box.proc.start.bind(box.proc);
  box.proc.start = (argv, init) => {
    started.push(argv[1]);
    return start(argv, init);
  };
  readsProse(box, TEXT, [{ ...SET, file: FILE }]);
  await settled();
  assert.deepEqual(started, ["prose"]);
  assert.equal(shadowRows(box.log).length, 1);
});

test("readsProse on a box naming no method writes no row, and rejects nothing", async () => {
  const box = boxOf(SHADOW);
  box.method = undefined;
  readsProse(box, TEXT, [{ ...SET, file: FILE }]);
  await settled();
  assert.equal(shadowRows(box.log).length, 0);
});
