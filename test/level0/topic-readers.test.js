// Each reader takes the Go topic where its slice reads new: the config verb,
// the log verb, the guidance verb and the prose reader. A topic answering
// nothing leaves the reader on its old path, and the tracked config reads new
// for the five keys.
// [[spec/tickets/readers-take-the-go-topics]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { BIN } from "../../.claude/skills/level0/lib/index.js";
import { SESSION } from "../../.claude/skills/level0/lib/log.js";
import { TRACKED } from "../../.claude/skills/level0/lib/config.js";
import { readsProse } from "../../src/bridge/prose.js";
import { fakeClock } from "../../src/doors/fake/clock.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeLog } from "../../src/doors/fake/log.js";
import { fakeProc } from "../../src/doors/fake/proc.js";
import { guidance } from "../../src/scripts/guidance-verb.js";
import { logVerb } from "../../src/scripts/log-verb.js";
import { configRowsOf, readsNew, topicOf } from "../../src/scripts/quack-topic.js";
import { readFileSync } from "node:fs";

const ROOT = "/tree";
const QUACK = join(ROOT, BIN);
const AT = "2026-01-02T03:04:05.000Z";
const FIVE = ["config", "log", "guidance", "check", "prose"];

// The doors a reader runs over: a tree with quack standing, and the slices at the mode named. [[spec/tickets/readers-take-the-go-topics]]
function itOf(mode, files, answers) {
  return {
    disk: fakeDisk({ [QUACK]: "", ...files }),
    proc: fakeProc(answers),
    join,
    root: ROOT,
    method: ROOT,
    work: ROOT,
    env: {},
    clock: fakeClock(),
    names: () => [],
    slices: Object.fromEntries(FIVE.map((one) => [one, mode])),
    config: { ask: async () => mode },
    log: fakeLog(),
  };
}

// The verb prints its answer, and a case reads it. [[spec/tickets/readers-take-the-go-topics]]
async function printed(run) {
  const lines = [];
  const was = console.log;
  console.log = (...said) => lines.push(said.join(" "));
  try {
    await run();
  } finally {
    console.log = was;
  }
  return lines.join("\n");
}

test("topicOf answers the JSON a run prints, and null on a missing binary, a failed run and broken JSON", () => {
  const ok = itOf("new", {}, { [`${QUACK} config`]: { stdout: '{"a": 1}' } });
  assert.deepEqual(topicOf(ok, ["config"]), { a: 1 });
  const missing = { ...ok, disk: fakeDisk({}) };
  assert.equal(topicOf(missing, ["config"]), null);
  const failed = itOf(
    "new",
    {},
    { [`${QUACK} config`]: { exitCode: 1, stdout: "{}" } },
  );
  assert.equal(topicOf(failed, ["config"]), null);
  const broken = itOf("new", {}, { [`${QUACK} config`]: { stdout: "not json" } });
  assert.equal(topicOf(broken, ["config"]), null);
});

test("readsNew holds where the slice reads new, and nowhere else", () => {
  assert.equal(readsNew(itOf("new", {}, {}), "log"), true);
  assert.equal(readsNew(itOf("shadow", {}, {}), "log"), false);
  assert.equal(readsNew(itOf("old", {}, {}), "log"), false);
});

test("configRowsOf reads the module's map as rows in key order, values as their literals stand", () => {
  const rows = configRowsOf({
    "b.two": { value: '"x"', layer: "local" },
    "a.one": { value: "3", layer: "tracked" },
  });
  assert.deepEqual(rows, [
    { key: "a.one", value: 3, layer: "tracked" },
    { key: "b.two", value: "x", layer: "local" },
  ]);
});

test("the log verb prints the rows quack log answers where the log slice reads new", async () => {
  const held = `${JSON.stringify({ at: AT, level: "info", kind: "tool", said: "the old file says" })}\n`;
  const answered = [{ at: AT, level: "info", kind: "tool", said: "the module says" }];
  const it = itOf(
    "new",
    { [join(ROOT, SESSION)]: held },
    {
      [`${QUACK} log`]: { stdout: JSON.stringify(answered) },
    },
  );
  const out = await printed(() => logVerb(it, []));
  assert.match(out, /the module says/);
  assert.doesNotMatch(out, /the old file says/);
});

test("the log verb keeps the old rows where quack log answers nothing", async () => {
  const held = `${JSON.stringify({ at: AT, level: "info", kind: "tool", said: "the old file says" })}\n`;
  const it = itOf(
    "new",
    { [join(ROOT, SESSION)]: held },
    {
      [`${QUACK} log`]: { exitCode: 1 },
    },
  );
  assert.match(await printed(() => logVerb(it, [])), /the old file says/);
});

test("the guidance verb prints the notes quack guidance answers for a step where the slice reads new", async () => {
  const process = 'steps:\n  - name: draft\n    tags: ["code"]\n';
  const note = (word) =>
    `---\nkind: [[guidance]]\n---\n\n# Actionables\n\n1. Read ${word}.\n`;
  const it = itOf(
    "new",
    {
      [join(ROOT, "spec/processes/standard.yaml")]: process,
      [join(ROOT, "spec/guidance/code/style.md")]: note("style"),
      [join(ROOT, "spec/guidance/other.md")]: note("other"),
    },
    {
      [`${QUACK} guidance`]: {
        stdout: JSON.stringify({ "standard:draft": ["spec/guidance/other"] }),
      },
    },
  );
  const out = await printed(() => guidance(it, ["--step", "standard:draft"], {}));
  assert.match(out, /Read other/);
  assert.doesNotMatch(out, /Read style/);
});

test("readsProse keeps the findings quack prose keeps where the prose slice reads new", () => {
  const set = {
    rule: "Voice.Other",
    line: 1,
    column: 10,
    said: "set",
    file: "n.md",
  };
  const box = itOf(
    "new",
    { [join(ROOT, TRACKED)]: JSON.stringify({ migration: { prose: "new" } }) },
    {
      [`${QUACK} prose`]: { stdout: JSON.stringify({ docs: [{ kept: [] }] }) },
    },
  );
  const kept = readsProse(box, "the door set the write\n", [set]);
  assert.deepEqual(kept, [], "Go drops the finding the old vetoes keep");
});

test("the tracked config reads new for the five keys", () => {
  const tracked = JSON.parse(
    readFileSync(new URL("../../spec/config/level0.json", import.meta.url), "utf8"),
  );
  for (const key of FIVE)
    assert.equal(tracked.migration[key], "new", `migration.${key}`);
});
