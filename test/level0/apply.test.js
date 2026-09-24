// The manifest and the journal, driven with no disk.
// [[spec/guidance/code/testing]]

import assert from "node:assert/strict";
import { join } from "node:path";
import test from "node:test";
import { applied, filesIn, PATCH } from "../../.claude/skills/level0/lib/apply.js";
import { agrees, marked, staleFault } from "../../.claude/skills/level0/lib/marks.js";
import {
  journalOf,
  nameOf,
  newestOn,
  restores,
  UNDO,
} from "../../.claude/skills/level0/lib/undo.js";
import { called, edits, reads, realDisk, refused, served, TREE } from "./mark-doors.js";

const held = (text) => ({ "one.md": { exists: true, text } });

test("an exact edit lands where the text stands once", () => {
  const took = applied(held("alpha beta gamma\n"), [
    { file: "one.md", old: "beta", new: "delta" },
  ]);
  assert.equal(took.ok, true);
  assert.equal(took.files[0].made, "alpha delta gamma\n");
  assert.equal(took.files[0].was, "alpha beta gamma\n");
});

test("text standing twice refuses the whole manifest", () => {
  const took = applied(held("beta and beta\n"), [
    { file: "one.md", old: "beta", new: "x" },
  ]);
  assert.equal(took.ok, false);
  assert.match(took.why, /stands 2 times/);

  const all = applied(held("beta and beta\n"), [
    { file: "one.md", old: "beta", new: "x", replace_all: true },
  ]);
  assert.equal(all.files[0].made, "x and x\n");
  assert.equal(all.counts["one.md"], 2);
});

test("one failure leaves the whole batch unwritten", () => {
  const took = applied(held("alpha\n"), [
    { file: "one.md", old: "alpha", new: "beta" },
    { file: "one.md", old: "nothing here", new: "x" },
  ]);
  assert.equal(took.ok, false);
  assert.match(took.why, /edit 2/);
});

test("ops compose in the order they arrive", () => {
  const took = applied(held("one\n"), [
    { file: "one.md", old: "one", new: "two" },
    { file: "one.md", old: "two", new: "three" },
  ]);
  assert.equal(took.files[0].made, "three\n");
});

test("bytes stand as they arrive", () => {
  const took = applied(held("alpha\r\nbeta\r\n"), [
    { file: "one.md", old: "alpha\r\n", new: "gamma\r\n" },
  ]);
  assert.equal(took.files[0].made, "gamma\r\nbeta\r\n");

  const other = applied(held("alpha\r\nbeta\r\n"), [
    { file: "one.md", old: "alpha\n", new: "gamma\n" },
  ]);
  assert.equal(other.ok, false);
});

test("create refuses a file that stands, and write takes it", () => {
  assert.equal(
    applied(held("alpha\n"), [{ file: "one.md", op: "create", new: "x" }]).ok,
    false,
  );
  const wrote = applied(held("alpha\n"), [{ file: "one.md", op: "write", new: "x" }]);
  assert.equal(wrote.files[0].made, "x");
});

test("a file nobody holds is born by create", () => {
  const took = applied({}, [{ file: "new.md", op: "create", new: "hello\n" }]);
  assert.equal(took.files[0].born, true);
  assert.equal(took.files[0].was, "");
});

test("a pattern matching nothing refuses, and expect_count holds", () => {
  const none = applied(held("alpha\n"), [
    { file: "one.md", op: "regex", pattern: "zeta", replacement: "x" },
  ]);
  assert.equal(none.ok, false);

  const took = applied(held("a1 a2 a3\n"), [
    { file: "one.md", op: "regex", pattern: "a(\\d)", replacement: "b$1" },
  ]);
  assert.equal(took.files[0].made, "b1 b2 b3\n");
  assert.equal(took.counts["one.md"], 3);
});

test("append and prepend leave the rest alone", () => {
  assert.equal(
    applied(held("body\n"), [{ file: "one.md", op: "append", new: "end\n" }]).files[0]
      .made,
    "body\nend\n",
  );
  assert.equal(
    applied(held("body\n"), [{ file: "one.md", op: "prepend", new: "top\n" }]).files[0]
      .made,
    "top\nbody\n",
  );
});

test("the files a manifest names come back once each", () => {
  assert.deepEqual(filesIn([{ file: "a" }, { file: "b" }, { file: "a" }]), ["a", "b"]);
});

const LANDED = applied(held("alpha\n"), [
  { file: "one.md", old: "alpha", new: "beta" },
]);

test("the journal holds both halves", () => {
  const entry = journalOf(
    "2026-09-11T10:00:00.000Z",
    "a rename",
    "level0",
    LANDED.files,
  );
  assert.equal(entry.files[0].was, "alpha\n");
  assert.equal(entry.files[0].made, "beta\n");
  assert.equal(entry.on, "a rename");
});

test("an entry names its time, and the newest sorts last", () => {
  assert.equal(nameOf("2026-09-11T10:00:00.000Z"), "20260911100000000000.json");
  const names = ["20260911100000000000.json", "20260911100500000000.json"];
  const entries = {
    [names[0]]: { on: "old", files: [{ file: "one.md" }] },
    [names[1]]: { on: "new", files: [{ file: "one.md" }] },
  };
  assert.equal(newestOn(names, entries, "").entry.on, "new");
  assert.equal(newestOn(names, entries, "old").entry.on, "old");
  assert.equal(newestOn(names, entries, "nobody"), null);
});

test("drift refuses the whole restore", () => {
  const entry = journalOf(
    "2026-09-11T10:00:00.000Z",
    "a rename",
    "level0",
    LANDED.files,
  );
  const moved = restores(entry, {
    "one.md": { exists: true, text: "somebody else\n" },
  });
  assert.equal(moved.ok, false);
  assert.match(moved.why, /moves since the apply/);

  const clean = restores(entry, { "one.md": { exists: true, text: "beta\n" } });
  assert.equal(clean.ok, true);
  assert.equal(clean.writes[0].text, "alpha\n");
});

test("a file the apply made comes out rather than back", () => {
  const born = applied({}, [{ file: "new.md", op: "create", new: "hello\n" }]);
  const entry = journalOf(
    "2026-09-11T10:00:00.000Z",
    "a new note",
    "level0",
    born.files,
  );
  const said = restores(entry, { "new.md": { exists: true, text: "hello\n" } });
  assert.deepEqual(said.removes, ["new.md"]);
  assert.equal(said.writes.length, 0);
});

// [[spec/design_output/level0#a-write-meets-its-mark]]
test("a path the disk holds nowhere writes with no mark", () => {
  assert.equal(staleFault(new Map(), "one.md", null), "");
});

test("a write over a file this hand has read none of comes back refused", () => {
  const said = staleFault(new Map(), "one.md", "alpha\n");
  assert.match(said, /has read none of it/);
});

test("a write over the text the mark carries lands", () => {
  const held = marked(new Map(), "one.md", "alpha\n");
  assert.equal(staleFault(held, "one.md", "alpha\n"), "");
});

test("a write over a file moving after the read comes back refused", () => {
  const held = marked(new Map(), "one.md", "alpha\n");
  const said = staleFault(held, "one.md", "beta\n");
  assert.match(said, /moved on the disk after you read it/);
});

test("a mark reaches the path it names alone", () => {
  const held = marked(new Map(), "one.md", "alpha\n");
  assert.equal(agrees(held, "one.md", "alpha\n"), true);
  assert.equal(agrees(held, "two.md", "alpha\n"), false);
});

const patch = (ops, on = "") => ({ tool: `mcp__level0__${PATCH}`, ops, on });
const told = (said) => String(said?.result?.result ?? "");

// [[spec/design_output/apply#the-journal-holds-both-halves]]
test("a create into a new folder lands, and a failed first write answers nothing written", async () => {
  const disk = realDisk({ [join(TREE, "held", "inner.md")]: "inner\n" });
  const it = served(disk);
  const born = await called(it, patch([{ file: "deep/new/one.md", op: "create", new: "one\n" }]));
  assert.match(told(born), /^1 file\(s\) written/);
  assert.equal(disk.read(join(TREE, "deep", "new", "one.md")), "one\n");

  const at = join(TREE, "one.md");
  disk.write(at, "alpha\n");
  await called(it, reads(at));
  const failed = await called(
    it,
    patch([
      { file: "held", op: "create", new: "x\n" },
      { file: "one.md", old: "alpha", new: "beta" },
    ]),
  );
  assert.match(told(failed), /^nothing written/);
  assert.equal(disk.read(at), "alpha\n", "the second file stands as it stood");
  const next = await called(it, edits(at, "alpha", "gamma"));
  assert.equal(refused(next), "", "the held marks come back, so the next Edit lands");
});

// [[spec/design_output/apply#drift-refuses-the-restore]]
test("an undo after a failed first write answers nothing waits to undo, and an earlier apply stands", async () => {
  const at = join(TREE, "one.md");
  const disk = realDisk({ [at]: "alpha\n", [join(TREE, "held", "inner.md")]: "inner\n" });
  const it = served(disk);
  const first = await called(it, patch([{ file: "one.md", old: "alpha", new: "beta" }], "x"));
  assert.match(told(first), /^1 file\(s\) written/);
  it.clock.tick();
  const failed = await called(it, patch([{ file: "held", op: "create", new: "x\n" }], "x"));
  assert.match(told(failed), /^nothing written/);

  const undone = await called(it, { tool: `mcp__level0__${UNDO}`, on: "x" });
  assert.match(told(undone), /nothing waits to undo/);
  assert.equal(disk.read(at), "beta\n", "the earlier apply stands");
});
