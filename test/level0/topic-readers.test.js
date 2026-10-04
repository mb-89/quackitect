// Each reader takes the Go topic where its slice reads new: the config verb,
// the guidance verb and the prose reader. The log verb runs in Go. A topic answering
// nothing leaves the reader on its old path.
// [[spec/tickets/readers-take-the-go-topics]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { BIN } from "../../.claude/skills/level0/lib/index.js";
import { SESSION } from "../../.claude/skills/level0/lib/log.js";
import { readsText, readThrough } from "../../src/bridge/findings.js";
import { readsProse } from "../../src/bridge/prose.js";
import { fakeClock } from "../../src/doors/fake/clock.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeLog } from "../../src/doors/fake/log.js";
import { fakeProc } from "../../src/doors/fake/proc.js";
import { guidance } from "../../src/scripts/guidance-verb.js";
import { handed } from "../../src/scripts/pull-hand.js";
import { leafOf } from "../../src/scripts/pull-route.js";
import {
  configRowsOf,
  keptOf,
  keptOver,
  notesOf,
  readsNew,
  topicOf,
} from "../../src/scripts/quack-topic.js";

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

test("configRowsOf reads the module's map as rows in key order, values as quack config prints them", () => {
  const rows = configRowsOf({
    "b.two": { value: "x", layer: "local" },
    "a.one": { value: 3, layer: "tracked" },
  });
  assert.deepEqual(rows, [
    { key: "a.one", value: 3, layer: "tracked" },
    { key: "b.two", value: "x", layer: "local" },
  ]);
});

// A topic answering nothing is a fault on a new slice, and no reader falls back to its old path. [[spec/tickets/topic-fallback-leaves-the-readers]]
test("every reader on a new slice faults where its topic answers nothing, naming the topic", async () => {
  const held = `${JSON.stringify({ at: AT, level: "info", kind: "tool", said: "the old file says" })}\n`;
  const it = itOf("new", { [join(ROOT, SESSION)]: held }, {});
  const set = { rule: "Voice.Other", line: 1, column: 10, said: "set", file: "n.md" };
  assert.throws(
    () => readsProse(it, "the door set the write\n", [set]),
    /quack prose answers nothing/,
  );
  assert.throws(
    () => readsText(it, "n.md", "the door set the write\n", [set]),
    /quack prose answers nothing/,
  );
  assert.throws(
    () => notesOf(it, "standard:draft", () => ["old"]),
    /quack guidance answers nothing/,
  );
});

// The comparison twins leave, so a reader runs its topic once, whatever mode a config still names. [[spec/tickets/twins-leave-misses-some-callers]]
test("each reader runs quack once, and no shadow runs beside it", async () => {
  const set = { rule: "Voice.Other", line: 1, column: 10, said: "set", file: "n.md" };
  const held = `${JSON.stringify({ at: AT, level: "info", kind: "tool", said: "a row" })}\n`;
  const it = {
    ...itOf(
      "new",
      { [join(ROOT, SESSION)]: held },
      {
        [`${QUACK} prose`]: { stdout: JSON.stringify({ docs: [{ kept: [] }] }) },
      },
    ),
    config: { ask: async () => "shadow" },
  };
  readsProse(it, "the door set the write\n", [set]);
  readsText(it, "n.md", "the door set the write\n", [set]);
  await new Promise((done) => setImmediate(done));
  assert.deepEqual(
    it.proc.ran.map((one) => one.argv.slice(1).join(" ")),
    ["prose", "prose"],
  );
});

test("a leaf the guidance topic names no notes for reads no notes", () => {
  const it = itOf("new", {}, { [`${QUACK} guidance`]: { stdout: "{}" } });
  assert.deepEqual(
    notesOf(it, "standard:draft", () => ["old"]),
    [],
  );
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
    {},
    {
      [`${QUACK} prose`]: { stdout: JSON.stringify({ docs: [{ kept: [] }] }) },
    },
  );
  const kept = readsProse(box, "the door set the write\n", [set]);
  assert.deepEqual(kept, [], "Go drops the finding the old vetoes keep");
});

// The write door's box carries no join, and the reader still finds quack. [[spec/tickets/check-twins-leave-phase-seven]]
test("readsProse finds quack over a box carrying no join, as the write door's box stands", () => {
  const set = { rule: "Voice.Other", line: 1, column: 10, said: "set", file: "n.md" };
  const { join: _, ...box } = itOf(
    "new",
    {},
    {
      [`${QUACK} prose`]: { stdout: JSON.stringify({ docs: [{ kept: [] }] }) },
    },
  );
  assert.deepEqual(readsProse(box, "the door set the write\n", [set]), []);
});

test("the pull hand-out takes the notes quack guidance answers for its leaf where the slice reads new", async () => {
  const ticket = `---\nkind: [[ticket]]\nprocess: [[spec/processes/standard]]\nsteps:\n  - name: draft\n    tags: ["code"]\n---\n\n# Ask\n\nthe ask\n`;
  const note = (word) =>
    `---\nkind: [[guidance]]\n---\n\n# Actionables\n\n1. Read ${word}.\n`;
  const it = itOf(
    "new",
    {
      [join(ROOT, "spec/guidance/code/style.md")]: note("style"),
      [join(ROOT, "spec/guidance/other.md")]: note("other"),
    },
    {
      [`${QUACK} guidance`]: {
        stdout: JSON.stringify({ "standard:draft": ["spec/guidance/other"] }),
      },
    },
  );
  const one = { name: "one", path: ".se/tickets/one.md", text: ticket, private: true };
  const leaf = leafOf({ steps: [{ name: "draft", tags: ["code"] }] }, "draft");
  const hold = await printed(() => handed(it, { group: "", hand: "box" }, one, leaf));
  assert.match(hold, /spec\/guidance\/other/);
  assert.doesNotMatch(hold, /spec\/guidance\/code\/style/);
});

test("readsText keeps the findings quack prose keeps where the prose slice reads new", () => {
  const set = { rule: "Voice.Other", line: 1, column: 10, said: "set", file: "n.md" };
  const it = itOf(
    "new",
    {},
    {
      [`${QUACK} prose`]: { stdout: JSON.stringify({ docs: [{ kept: [] }] }) },
    },
  );
  const found = readsText(it, "n.md", "the door set the write\n", [set]);
  assert.equal(found.filter((one) => one.rule === "Voice.Other").length, 0);
});

// The check reads every file in one request, so it pays one process. [[spec/tickets/go-prose-checks-stand-alone]]
test("readThrough runs quack prose once over every file it reads, and keeps what each document keeps", () => {
  const one = { rule: "Voice.PastTense", line: 1, column: 10, said: "set", file: "a.md" };
  const two = { ...one, file: "b.md" };
  const { file: _, ...bare } = two;
  const it = itOf(
    "new",
    {
      [join(ROOT, "a.md")]: "the door set the write\n",
      [join(ROOT, "b.md")]: "the door set the write\n",
    },
    {
      [`${QUACK} prose`]: {
        stdout: JSON.stringify({ docs: [{ kept: [] }, { kept: [bare] }] }),
      },
    },
  );
  const kept = readThrough(it, [one, two]);
  assert.deepEqual(
    kept.map((found) => found.file),
    ["b.md"],
  );
  assert.deepEqual(
    it.proc.ran.map((ran) => ran.argv.slice(1).join(" ")),
    ["prose"],
  );
});

// A list holding no finding answers itself, so a clean file costs no process. [[spec/tickets/go-prose-checks-stand-alone]]
test("keptOf answers a list holding no finding with no process", () => {
  const it = itOf("new", {}, {});
  assert.deepEqual(keptOf(it, "the door reads the write\n", [], "all"), []);
  assert.deepEqual(it.proc.ran, []);
});

// One text's reading is a reading of many with one text in it, and a short answer reads as none. [[spec/tickets/the-check-runs-fast-again]]
test("keptOf answers what keptOver answers for its one text, and a short answer reads as nothing", () => {
  const one = { rule: "Voice.One", line: 1, column: 1, said: "one", file: "n.md" };
  const two = { rule: "Voice.Two", line: 2, column: 1, said: "two", file: "n.md" };
  const kept = { stdout: JSON.stringify({ docs: [{ kept: [two] }] }) };
  const it = itOf("new", {}, { [`${QUACK} prose`]: kept });

  assert.deepEqual(keptOf(it, "one\ntwo\n", [one, two], "past"), [two]);
  assert.deepEqual(keptOver(it, [{ text: "one\ntwo\n", found: [one, two] }], "past"), [
    [two],
  ]);
  assert.equal(
    keptOver(
      it,
      [
        { text: "a\n", found: [one] },
        { text: "b\n", found: [two] },
      ],
      "past",
    ),
    null,
    "one doc answered for two reads as nothing",
  );
  assert.deepEqual(keptOver(it, [], "past"), [], "no text asks no quack");
});
