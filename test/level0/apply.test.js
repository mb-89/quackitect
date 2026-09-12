// The manifest and the journal, driven with no disk.
// [[spec/guidance/code/testing]]

import assert from "node:assert/strict";
import test from "node:test";
import { applied, filesIn } from "../../.claude/skills/level0/lib/apply.js";
import {
  journalOf,
  nameOf,
  newestOn,
  restores,
} from "../../.claude/skills/level0/lib/undo.js";

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
  const took = applied(held("beta and beta\n"), [{ file: "one.md", old: "beta", new: "x" }]);
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
  assert.equal(applied(held("alpha\n"), [{ file: "one.md", op: "create", new: "x" }]).ok, false);
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
    applied(held("body\n"), [{ file: "one.md", op: "append", new: "end\n" }]).files[0].made,
    "body\nend\n",
  );
  assert.equal(
    applied(held("body\n"), [{ file: "one.md", op: "prepend", new: "top\n" }]).files[0].made,
    "top\nbody\n",
  );
});

test("the files a manifest names come back once each", () => {
  assert.deepEqual(filesIn([{ file: "a" }, { file: "b" }, { file: "a" }]), ["a", "b"]);
});

const LANDED = applied(held("alpha\n"), [{ file: "one.md", old: "alpha", new: "beta" }]);

test("the journal holds both halves", () => {
  const entry = journalOf("2026-09-11T10:00:00.000Z", "a rename", "level0", LANDED.files);
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
  const entry = journalOf("2026-09-11T10:00:00.000Z", "a rename", "level0", LANDED.files);
  const moved = restores(entry, { "one.md": { exists: true, text: "somebody else\n" } });
  assert.equal(moved.ok, false);
  assert.match(moved.why, /moves since the apply/);

  const clean = restores(entry, { "one.md": { exists: true, text: "beta\n" } });
  assert.equal(clean.ok, true);
  assert.equal(clean.writes[0].text, "alpha\n");
});

test("a file the apply made comes out rather than back", () => {
  const born = applied({}, [{ file: "new.md", op: "create", new: "hello\n" }]);
  const entry = journalOf("2026-09-11T10:00:00.000Z", "a new note", "level0", born.files);
  const said = restores(entry, { "new.md": { exists: true, text: "hello\n" } });
  assert.deepEqual(said.removes, ["new.md"]);
  assert.equal(said.writes.length, 0);
});
