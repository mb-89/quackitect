// The retro's collect, driven through fake doors. It moves the private folder
// past its dot folders into the retro's input folder, copies the transcripts,
// the memory and the scratchpads beside it, and leaves the folders behind.
// [[spec/guidance/retro/collect]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { fakeClock } from "../../src/doors/fake/clock.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { retro } from "../../src/scripts/retro.js";
import { belongs, slugOf } from "../../src/scripts/retro-outside.js";

const ROOT = "/tree";
const HOME = "/home";
const TEMP = "/temp";
const RETRO = "retro-a1b2c3";
const SLUG = slugOf(ROOT);
const at = (path) => join(ROOT, ...path.split("/"));
const input = (path) => at(`.se/.retro/${RETRO}/input/${path}`);
const home = (path) => join(HOME, ...path.split("/"));
const temp = (path) => join(TEMP, ...path.split("/"));

const FILES = {
  [at(".se/.log/one.jsonl")]: '{"said":"a line"}\n',
  [at(".se/tickets/a-note.md")]: "---\nkind: [[ticket]]\nstate: open\n---\n",
  [at(".se/scripts/one.mjs")]: "// a script a hand writes\n",
  [at(".se/check.out")]: "an old output\n",
  [at(".se/.runtime/index.db")]: "rows",
  [at(".se/.runtime/check.json")]: JSON.stringify({
    sha: "abc123",
    ok: true,
    clean: true,
    warnings: 0,
  }),
  [at(".se/.doc/standard.pdf")]: "a document the owner keeps",
  [home(`.claude/projects/${SLUG}/session.jsonl`)]: '{"type":"user"}\n',
  [home(`.claude/projects/${SLUG}/session/subagents/one.jsonl`)]:
    '{"type":"assistant"}\n',
  [home(`.claude/projects/${SLUG}/memory/MEMORY.md`)]: "- one entry\n",
  [home(`.claude/projects/${SLUG}-scratchpad-stub/stub.jsonl`)]: '{"type":"user"}\n',
  [at("scratchpad/stub/.keep")]: "",
  // A sibling tree, as tree-old beside tree, names a folder this tree holds nowhere. [[spec/guidance/retro/collect]]
  [home(`.claude/projects/${SLUG}-old/theirs.jsonl`)]: '{"type":"user"}\n',
  [home(`.claude/projects/${SLUG}--claude-worktrees-one/work.jsonl`)]:
    '{"type":"user"}\n',
  [home(".claude/projects/another-tree/theirs.jsonl")]: '{"type":"user"}\n',
  [temp(`claude/${SLUG}/session/scratchpad/probe.mjs`)]: "// a probe\n",
  [temp(`claude/${SLUG}/session/scratchpad/stub/.git/objects/ab/cd`)]: "an object",
};

function doors(files = FILES, more = {}) {
  return {
    disk: fakeDisk(files),
    join,
    clock: fakeClock("2026-09-19T12:00:00.000Z"),
    home: HOME,
    temp: TEMP,
    git: { run: () => ({ ok: true, out: "abc123" }) },
    ...more,
  };
}

// A retro opens on a battery green at this commit, with no warning standing. [[spec/guidance/retro/collect]]
test("collect refuses a battery holding a warning, and one that ran against another commit", () => {
  for (const stamp of [
    { sha: "abc123", ok: true, clean: true, warnings: 3 },
    { sha: "old999", ok: true, clean: true, warnings: 0 },
    { sha: "abc123", ok: true, clean: true },
  ]) {
    const it = doors({
      ...FILES,
      [at(".se/.runtime/check.json")]: JSON.stringify(stamp),
    });

    const { code, said } = heard(() => retro(ROOT, ["collect", RETRO], it));

    assert.equal(code, 1);
    assert.match(said, /A retro opens on a green battery with no warning/);
    assert.equal(it.disk.exists(at(".se/.log/one.jsonl")), true, "nothing moves");
  }
});

function heard(run) {
  const rows = [];
  const wasLog = console.log;
  const wasError = console.error;
  console.log = (...said) => rows.push(said.join(" "));
  console.error = (...said) => rows.push(said.join(" "));
  try {
    return { code: run(), said: rows.join("\n") };
  } finally {
    console.log = wasLog;
    console.error = wasError;
  }
}

const standing = (it) =>
  it.disk
    .list(at(".se"))
    .map((one) => one.name)
    .sort();

const manifestOf = (it) =>
  it.disk
    .read(input("manifest.jsonl"))
    .split("\n")
    .filter(Boolean)
    .map((row) => JSON.parse(row));

// A move while a hand works takes the file it reads. [[spec/guidance/retro/collect]]
test("collect refuses while another hand holds a ticket, and moves nothing", () => {
  const it = doors({
    ...FILES,
    [at(".se/.runtime/hold/box-one.json")]: '{"ticket":"a-child"}\n',
  });

  const { code, said } = heard(() => retro(ROOT, ["collect", RETRO], it));

  assert.equal(code, 1);
  assert.match(said, /a hand holds a ticket/);
  assert.equal(
    it.disk.exists(at(".se/.log/one.jsonl")),
    true,
    "the log stays where it stands",
  );
});

// [[spec/guidance/retro/collect]]
test("collect passes the hold of the retro it collects for", () => {
  const it = doors({
    ...FILES,
    [at(".se/.runtime/hold/box-one.json")]: `{"ticket":"${RETRO}"}\n`,
  });

  const { code } = heard(() => retro(ROOT, ["collect", RETRO], it));

  assert.equal(code, 0);
});

// The owner rules two folders left behind, and everything else in one place. [[spec/guidance/retro/collect]]
test("collect moves everything past the dot folders, and leaves the runtime folder and the retro folder", () => {
  const it = doors();

  const { code } = heard(() => retro(ROOT, ["collect", RETRO], it));

  assert.equal(code, 0);
  assert.deepEqual(standing(it), [".doc", ".retro", ".runtime"]);
  assert.equal(it.disk.read(input("log/one.jsonl")), '{"said":"a line"}\n');
  assert.equal(it.disk.exists(input("tickets/a-note.md")), true);
  assert.equal(it.disk.exists(input("scripts/one.mjs")), true);
  assert.equal(it.disk.exists(input("check.out")), true, "a loose file moves too");
  assert.equal(
    it.disk.exists(at(".se/.log")),
    false,
    "a move leaves nothing where it stood",
  );
  assert.equal(
    it.disk.exists(at(".se/.runtime/index.db")),
    true,
    "the runtime folder stays whole",
  );
  assert.equal(
    it.disk.exists(at(".se/.doc/standard.pdf")),
    true,
    "a dot folder stays whole",
  );
});

// A session run from a folder inside the tree names a folder of its own. [[spec/guidance/retro/collect]]
test("collect copies the transcripts, the memory and the scratchpads of this tree, and no other tree's", () => {
  const it = doors();

  heard(() => retro(ROOT, ["collect", RETRO], it));

  assert.equal(it.disk.exists(input(`transcripts/${SLUG}/session.jsonl`)), true);
  assert.equal(
    it.disk.exists(input(`transcripts/${SLUG}/session/subagents/one.jsonl`)),
    true,
  );
  assert.equal(
    it.disk.exists(input(`transcripts/${SLUG}-scratchpad-stub/stub.jsonl`)),
    true,
  );
  assert.equal(it.disk.exists(input(`memory/${SLUG}/MEMORY.md`)), true);
  assert.equal(
    it.disk.exists(input(`transcripts/${SLUG}/memory/MEMORY.md`)),
    false,
    "the memory lands once",
  );
  assert.equal(
    it.disk.exists(input(`scratch/${SLUG}/session/scratchpad/probe.mjs`)),
    true,
  );
  assert.equal(it.disk.exists(input("transcripts/another-tree/theirs.jsonl")), false);
  assert.equal(it.disk.exists(input(`transcripts/${SLUG}-old/theirs.jsonl`)), false);
  assert.equal(
    it.disk.exists(input(`transcripts/${SLUG}--claude-worktrees-one/work.jsonl`)),
    true,
    "a worktree under the tree's dot folder belongs",
  );
  assert.equal(
    it.disk.exists(input(`scratch/${SLUG}/session/scratchpad/stub/.git`)),
    false,
    "a repository's own store stays out",
  );
  assert.equal(
    it.disk.exists(home(`.claude/projects/${SLUG}/session.jsonl`)),
    true,
    "an outside source stays",
  );
});

// [[spec/guidance/retro/collect]]
test("a folder belongs to the tree by its name, whatever the case of the drive letter", () => {
  assert.equal(slugOf("c:\\work\\tree\\quackitect-v5"), "c--work-tree-quackitect-v5");
  assert.equal(
    belongs("C--work-tree-quackitect-v5", "c--work-tree-quackitect-v5"),
    true,
  );
  assert.equal(
    belongs("C--Temp-c--work-tree-quackitect-v5-stub", "c--work-tree-quackitect-v5"),
    true,
  );
  assert.equal(
    belongs("c--work-tree-quackitect-v50", "c--work-tree-quackitect-v5"),
    false,
  );
  assert.equal(
    belongs("c--work-tree-quackitect-v4", "c--work-tree-quackitect-v5"),
    false,
  );
  assert.equal(
    belongs("c--work-tree-quackitect-v5-old", "c--work-tree-quackitect-v5", ["src"]),
    false,
    "a sibling tree names a folder the tree holds nowhere",
  );
  assert.equal(
    belongs("c--work-tree-quackitect-v5-src-bridge", "c--work-tree-quackitect-v5", [
      "src",
    ]),
    true,
    "a session run from a folder inside the tree belongs",
  );
  assert.equal(
    belongs(
      "c--work-tree-quackitect-v5--claude-worktrees-a",
      "c--work-tree-quackitect-v5",
    ),
    true,
    "a worktree under a dot folder belongs",
  );
  assert.equal(
    belongs("c--other-c--work-tree-quackitect-v5x", "c--work-tree-quackitect-v5"),
    false,
  );
});

// The count by source, because a short answer reads like a whole one. [[spec/guidance/retro/collect]]
test("the manifest names every file with its size and source, and the verb prints the count", () => {
  const it = doors();

  const { said } = heard(() => retro(ROOT, ["collect", RETRO], it));
  const rows = manifestOf(it);
  const log = rows.find((one) => one.path === "log/one.jsonl");

  assert.equal(log.from, ".se");
  assert.equal(typeof log.size, "number");
  assert.equal(
    rows.find((one) => one.path === `memory/${SLUG}/MEMORY.md`).from,
    "memory",
  );
  assert.match(said, /with no retro before it, so everything/);
  assert.match(said, /transcripts\s+4 file\(s\)/);
  const record = JSON.parse(it.disk.read(at(`.se/.retro/${RETRO}/collected.json`)));
  assert.equal(record.at, "2026-09-19T12:00:00.000Z");
  assert.equal(record.counts, undefined, "a count derives off the manifest");
});

// [[spec/guidance/retro/effect]]
test("collect keeps the battery's report beside the record, one a retro", () => {
  const battery = {
    parts: { tests: 12 },
    total: 12,
    slowest: [{ name: "a case", ms: 9 }],
  };
  const stamp = { sha: "abc123", ok: true, clean: true, warnings: 0, battery };
  const it = doors({
    ...FILES,
    [at(".se/.runtime/check.json")]: JSON.stringify(stamp),
  });

  heard(() => retro(ROOT, ["collect", RETRO], it));

  assert.deepEqual(
    JSON.parse(it.disk.read(at(`.se/.retro/${RETRO}/battery.json`))),
    { ...battery, runs: 1 },
    "a stamp from before the runs reads as one run",
  );

  const bare = doors();
  heard(() => retro(ROOT, ["collect", RETRO], bare));
  assert.equal(
    bare.disk.exists(at(`.se/.retro/${RETRO}/battery.json`)),
    false,
    "a stamp carrying no report leaves none behind",
  );
});

// The last retro's collect opens the window, and the memory is standing state. [[spec/guidance/retro/collect]]
test("a transcript older than the last collect stays out, and the memory comes whole", () => {
  const before = Date.parse("2026-09-10T00:00:00.000Z");
  const after = Date.parse("2026-09-15T00:00:00.000Z");
  const files = {
    ...FILES,
    [at(".se/.retro/retro-older/collected.json")]:
      '{"at":"2026-09-12T00:00:00.000Z"}\n',
    [home(`.claude/projects/${SLUG}/old.jsonl`)]: '{"type":"user"}\n',
  };
  const it = doors(files);
  for (const [path, when] of [
    [home(`.claude/projects/${SLUG}/old.jsonl`), before],
    [home(`.claude/projects/${SLUG}/session.jsonl`), after],
    [home(`.claude/projects/${SLUG}/memory/MEMORY.md`), before],
  ]) {
    it.disk.times.set(path.split("\\").join("/"), when);
  }

  const { said } = heard(() => retro(ROOT, ["collect", RETRO], it));

  assert.match(said, /since 2026-09-12T00:00:00.000Z/);
  assert.equal(it.disk.exists(input(`transcripts/${SLUG}/old.jsonl`)), false);
  assert.equal(it.disk.exists(input(`transcripts/${SLUG}/session.jsonl`)), true);
  assert.equal(it.disk.exists(input(`memory/${SLUG}/MEMORY.md`)), true);
  assert.equal(
    it.disk.exists(at(".se/.retro/retro-older/collected.json")),
    true,
    "an earlier retro stays",
  );
});

// A gate runs the evidence again, and a torn run deletes nothing it moved. [[spec/guidance/retro/collect]]
test("a second run answers the first, and a torn run carries on", () => {
  const it = doors();
  heard(() => retro(ROOT, ["collect", RETRO], it));

  const again = heard(() => retro(ROOT, ["collect", RETRO], it));
  assert.equal(again.code, 0);
  assert.match(again.said, /holds a whole run already/);

  it.disk.remove(input("manifest.jsonl"));
  it.disk.write(at(".se/late.md"), "written after the first run\n");
  const torn = heard(() => retro(ROOT, ["collect", RETRO], it));
  assert.equal(torn.code, 0);
  assert.equal(
    it.disk.exists(input("log/one.jsonl")),
    true,
    "what the first run moves survives",
  );
  assert.equal(it.disk.exists(input("late.md")), true, "what stands since moves too");
});

// A second pass merges what arrives since, and overwrites nothing. [[spec/guidance/retro/collect]]
test("a second pass merges what arrives since into the same input, and keeps both logs", () => {
  const it = doors();
  heard(() => retro(ROOT, ["collect", RETRO], it));

  it.disk.write(at(".se/.log/one.jsonl"), '{"said":"a later line"}\n');
  it.disk.write(at(".se/tickets/a-later-note.md"), "---\nkind: [[ticket]]\n---\n");
  it.disk.write(at(".se/config.json"), "{}\n");
  const again = heard(() => retro(ROOT, ["collect", RETRO, "--again"], it));

  assert.equal(again.code, 0, again.said);
  assert.equal(it.disk.read(input("log/one.jsonl")), '{"said":"a line"}\n');
  assert.equal(it.disk.read(input("log/one.2.jsonl")), '{"said":"a later line"}\n');
  assert.equal(it.disk.exists(input("tickets/a-note.md")), true);
  assert.equal(it.disk.exists(input("tickets/a-later-note.md")), true);
  assert.equal(it.disk.exists(input("config.json")), true);
  assert.equal(it.disk.exists(at(".se/config.json")), false);
});

// A file the disk holds takes a line of its own, and the verb names what stays. [[spec/guidance/retro/collect]]
test("a move the disk refuses takes a manifest line, and the verb answers one naming what stays", () => {
  const plain = doors();
  const disk = {
    ...plain.disk,
    move(from, to) {
      if (String(from).includes("check.out")) {
        const err = new Error("busy");
        err.code = "EBUSY";
        throw err;
      }
      return plain.disk.move(from, to);
    },
  };
  const it = { ...plain, disk };

  const { code, said } = heard(() => retro(ROOT, ["collect", RETRO], it));

  assert.equal(code, 1);
  assert.match(said, /refused \.se\/check\.out: EBUSY/);
  assert.match(said, /\.se\/check\.out still stands beside the dot folders/);
  assert.equal(
    manifestOf(it).some((one) => one.refused === "EBUSY"),
    true,
  );
});

// An editor watching a folder refuses its rename, and its files still move. [[spec/guidance/retro/collect]]
test("a folder the disk refuses to move whole moves file by file, and leaves nothing", () => {
  const plain = doors({ ...FILES, [at(".se/tmp/ste/words.txt")]: "one\n" });
  const disk = {
    ...plain.disk,
    move(from, to) {
      if (String(from).split("\\").join("/").endsWith(".se/tmp")) {
        const err = new Error("watched");
        err.code = "EPERM";
        throw err;
      }
      return plain.disk.move(from, to);
    },
  };
  const it = { ...plain, disk };

  const { code } = heard(() => retro(ROOT, ["collect", RETRO], it));

  assert.equal(code, 0);
  assert.equal(it.disk.read(input("tmp/ste/words.txt")), "one\n");
  assert.equal(it.disk.exists(at(".se/tmp")), false);
  assert.equal(
    manifestOf(it).some((one) => one.refused),
    false,
  );
});
