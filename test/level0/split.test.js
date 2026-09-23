// The split verb's ranges and its cut, over text in memory.
// [[spec/design_output/level0#the-size-ceiling]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { FOLDER as UNDONE } from "../../.claude/skills/level0/lib/undo.js";
import { fakeClock } from "../../src/doors/fake/clock.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { cutsIn, splitText } from "../../src/scripts/split-cut.js";
import { sourceOf, splitVerb } from "../../src/scripts/split-verb.js";

const TEXT = ["one", "two", "three", "four", "five"].join("\n");

// [[spec/design_output/level0#the-size-ceiling]]
test("the flags read one target and its range, and again for each target", () => {
  const said = cutsIn([
    "--to",
    "src/a.js",
    "--lines",
    "1-2",
    "--to",
    "src/b.js",
    "--lines",
    "4-5",
  ]);

  assert.equal(said.why, "");
  assert.deepEqual(said.cuts, [
    { path: "src/a.js", from: 1, to: 2 },
    { path: "src/b.js", from: 4, to: 5 },
  ]);
});

// [[spec/design_output/level0#the-size-ceiling]]
test("a target with no range comes back refused, and a range with no target too", () => {
  assert.match(cutsIn(["--to", "src/a.js"]).why, /range/);
  assert.match(cutsIn(["--lines", "1-2"]).why, /target/);
  assert.match(cutsIn([]).why, /target/);
});

// [[spec/design_output/level0#the-size-ceiling]]
test("a range reading backwards, or past the file, comes back refused", () => {
  assert.match(cutsIn(["--to", "src/a.js", "--lines", "4-2"]).why, /reads backwards/);
  assert.match(cutsIn(["--to", "src/a.js", "--lines", "0-2"]).why, /first line is 1/);
  assert.match(cutsIn(["--to", "src/a.js", "--lines", "two"]).why, /from-to/);
});

// [[spec/design_output/level0#the-size-ceiling]]
test("the cut takes the named lines into each target, and the rest keeps the others", () => {
  const said = splitText(TEXT, [
    { path: "src/a.js", from: 1, to: 2 },
    { path: "src/b.js", from: 4, to: 5 },
  ]);

  assert.equal(said.why, "");
  assert.deepEqual(said.targets, [
    { path: "src/a.js", text: "one\ntwo\n" },
    { path: "src/b.js", text: "four\nfive\n" },
  ]);
  assert.equal(said.rest, "three\n");
});

// [[spec/design_output/level0#the-size-ceiling]]
test("two ranges reaching the same line come back refused", () => {
  const said = splitText(TEXT, [
    { path: "src/a.js", from: 1, to: 3 },
    { path: "src/b.js", from: 3, to: 5 },
  ]);

  assert.match(said.why, /line 3/);
  assert.deepEqual(said.targets, []);
});

// [[spec/design_output/level0#the-size-ceiling]]
test("a range past the last line comes back refused, and the text stands", () => {
  const said = splitText(TEXT, [{ path: "src/a.js", from: 4, to: 9 }]);

  assert.match(said.why, /holds 5 line/);
  assert.equal(said.rest, TEXT);
});

const ROOT = "/tree";
const SOURCE = "src/long.js";

const doors = (files = {}) => ({
  root: ROOT,
  join,
  clock: fakeClock(),
  disk: fakeDisk({ [join(ROOT, SOURCE)]: `${TEXT}\n`, ...files }),
});

const heard = (what) => {
  const lines = [];
  const was = [console.log, console.error];
  console.log = (...said) => lines.push(said.join(" "));
  console.error = console.log;
  try {
    return { code: what(), said: lines.join("\n") };
  } finally {
    [console.log, console.error] = was;
  }
};

// [[spec/design_output/apply#the-journal-holds-both-halves]]
test("the verb writes every target, the rest and one journal entry", () => {
  const it = doors();

  const { code } = heard(() =>
    splitVerb(it, [SOURCE, "--to", "src/a.js", "--lines", "1-2"]),
  );

  assert.equal(code, 0);
  assert.equal(it.disk.read(join(ROOT, "src/a.js")), "one\ntwo\n");
  assert.equal(it.disk.read(join(ROOT, SOURCE)), "three\nfour\nfive\n");

  const wrote = it.disk
    .list(join(ROOT, UNDONE))
    .filter((one) => one.name.endsWith(".json"));
  assert.equal(wrote.length, 1, "one entry holds the whole cut");
  const entry = JSON.parse(it.disk.read(join(ROOT, UNDONE, wrote[0].name)));
  assert.equal(entry.by, "split");
  assert.deepEqual(
    entry.files.map((one) => one.file),
    ["src/a.js", SOURCE],
  );
  assert.equal(entry.files[0].did_not_exist, true);
});

// [[spec/design_output/level0#a-verb-cuts-the-file]]
test("a call naming no source comes back refused, and a target's path reads as no source", () => {
  const it = doors();
  assert.equal(sourceOf(["--to", "src/a.js", "--lines", "1-2", "--dry"]), "");
  assert.equal(sourceOf(["--dry", SOURCE, "--to", "src/a.js"]), SOURCE);

  const { code, said } = heard(() =>
    splitVerb(it, ["--to", "src/a.js", "--lines", "1-2"]),
  );
  assert.equal(code, 2);
  assert.match(said, /names the file it cuts first, and this call names none/);
  assert.equal(it.disk.exists(join(ROOT, "src/a.js")), false);
  assert.equal(it.disk.read(join(ROOT, SOURCE)), `${TEXT}\n`);
});

// [[spec/design_output/level0#a-verb-cuts-the-file]]
test("a source naming itself as a target comes back refused, and nothing writes", () => {
  const it = doors();

  const { code, said } = heard(() =>
    splitVerb(it, [
      SOURCE,
      "--to",
      "src/a.js",
      "--lines",
      "1-2",
      "--to",
      SOURCE,
      "--lines",
      "4-5",
    ]),
  );
  assert.equal(code, 2);
  assert.match(said, /is the source and a target/);
  assert.equal(it.disk.exists(join(ROOT, "src/a.js")), false);
  assert.equal(it.disk.read(join(ROOT, SOURCE)), `${TEXT}\n`);
});

// [[spec/design_output/level0#a-verb-cuts-the-file]]
test("two cuts into one target come back refused, and nothing writes", () => {
  const it = doors();

  const { code, said } = heard(() =>
    splitVerb(it, [
      SOURCE,
      "--to",
      "src/a.js",
      "--lines",
      "1-2",
      "--to",
      "./src/a.js",
      "--lines",
      "4-5",
    ]),
  );
  assert.equal(code, 2);
  assert.match(said, /takes two cuts/);
  assert.equal(it.disk.exists(join(ROOT, "src/a.js")), false);
  assert.equal(it.disk.read(join(ROOT, SOURCE)), `${TEXT}\n`);
});

// A target names a folder nothing holds yet, and a throw there answers a stack. [[spec/design_output/apply#the-journal-holds-both-halves]]
test("a target under a folder nothing holds makes that folder, and writes", () => {
  const it = doors();

  const { code } = heard(() =>
    splitVerb(it, [SOURCE, "--to", "src/fresh/a.js", "--lines", "1-2"]),
  );

  assert.equal(code, 0);
  assert.equal(it.disk.read(join(ROOT, "src/fresh/a.js")), "one\ntwo\n");
});

// [[spec/design_output/apply#the-journal-holds-both-halves]]
test("a write the disk refuses answers a line, and names the way back", () => {
  const it = doors();
  it.disk.write = () => {
    throw new Error("the disk stands full");
  };

  const { code, said } = heard(() =>
    splitVerb(it, [SOURCE, "--to", "src/a.js", "--lines", "1-2"]),
  );

  assert.equal(code, 1);
  assert.match(said, /would not write/);
  assert.match(said, /the disk stands full/);
  assert.doesNotMatch(said, /at Object|at Module/, "no stack reaches the reader");
  assert.equal(it.disk.exists(join(ROOT, "src/a.js")), false, "no target lands");
});

// [[spec/design_output/level0#the-size-ceiling]]
test("the dry flag names the cuts and writes nothing", () => {
  const it = doors();

  const { code, said } = heard(() =>
    splitVerb(it, [SOURCE, "--to", "src/a.js", "--lines", "1-2", "--dry"]),
  );

  assert.equal(code, 0);
  assert.match(said, /src\/a\.js takes 2 line\(s\)/);
  assert.equal(it.disk.exists(join(ROOT, "src/a.js")), false);
  assert.equal(it.disk.read(join(ROOT, SOURCE)), `${TEXT}\n`);
});
