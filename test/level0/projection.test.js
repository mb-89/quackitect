// The projector, over texts alone. It reads no disk and writes none, so every
// case here hands it a source and reads the map it answers.
// [[spec/guidance/testing]]

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  COMMANDS,
  entriesIn,
  nameOf,
  optionsFor,
  ownerOf,
  readAll,
  readsOf,
  refusedWrite,
  saysGenerated,
  staleIn,
  writesOf,
} from "../../.claude/skills/level0/lib/projection.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";

const SOURCE = "spec/config/level0.json";
const SCHEMA = "spec/config/level0.schema.json";

const CONFIG = JSON.stringify({
  comment: "The controls.",
  stop: { comment: "The tooth.", enabled: true, mostInARow: 3 },
  log: { level: "info" },
  judge: { model: "haiku" },
});

const SAID = JSON.stringify({
  type: "object",
  required: ["stop", "log"],
  properties: {
    stop: {
      type: "object",
      required: ["enabled", "mostInARow"],
      properties: { enabled: { type: "boolean" }, mostInARow: { type: "number" } },
    },
    log: {
      type: "object",
      required: ["level"],
      properties: { level: { type: "string", enum: ["info", "warn", "error"] } },
    },
    judge: {
      type: "object",
      properties: { model: { type: "string" } },
    },
  },
});

const ENTRY = {
  name: "the config commands",
  shape: COMMANDS,
  target: ".claude/commands",
  from: SOURCE,
  schema: SCHEMA,
  wrap: "frontmatter",
};

const texts = () =>
  new Map([
    [SOURCE, CONFIG],
    [SCHEMA, SAID],
  ]);

const drawn = (entry = ENTRY) => writesOf(entry, texts());

// [[spec/design_output/projection#the-first-target]]
test("every settable value takes a command, and a comment takes none", () => {
  assert.deepEqual(
    [...drawn().keys()].sort(),
    [
      ".claude/commands/se-judge-model.md",
      ".claude/commands/se-log-level-error.md",
      ".claude/commands/se-log-level-info.md",
      ".claude/commands/se-log-level-warn.md",
      ".claude/commands/se-stop-enabled-false.md",
      ".claude/commands/se-stop-enabled-true.md",
      ".claude/commands/se-stop-mostInARow.md",
    ],
    "a comment names no value, so it takes no file",
  );
});

// [[spec/design_output/projection#the-first-target]]
test("a small set of options takes one file each, and a number takes an argument", () => {
  assert.deepEqual(optionsFor("info", { type: "string", options: ["info", "warn"] }), [
    "info",
    "warn",
  ]);
  assert.deepEqual(optionsFor(true, { type: "boolean" }), ["true", "false"]);
  assert.deepEqual(optionsFor(true, undefined), ["true", "false"], "the value says");
  assert.deepEqual(optionsFor(3, { type: "number" }), []);
  assert.deepEqual(optionsFor("haiku", { type: "string" }), []);

  const files = drawn();
  assert.match(files.get(".claude/commands/se-log-level-warn.md"), /config log.level warn/);
  assert.match(files.get(".claude/commands/se-judge-model.md"), /config judge.model \$ARGUMENTS/);
});

// [[spec/design_output/projection#a-name-carries-the-key]]
test("a name carries the key it sets, and the leaf keeps its case", () => {
  assert.equal(nameOf("judge.model"), "se-judge-model.md");
  assert.equal(nameOf("log.level", "info"), "se-log-level-info.md");
  assert.equal(nameOf("stop.mostInARow"), "se-stop-mostInARow.md");
});

// [[spec/design_output/projection#each-file-says-so]]
test("every file says it is generated, and names the source to edit", () => {
  const mark = saysGenerated(SOURCE);
  assert.match(mark, /^GENERATED\./);
  assert.match(mark, /Source: spec\/config\/level0\.json$/);

  for (const [path, text] of drawn()) {
    assert.ok(text.includes(mark), `${path} carries the mark`);
    assert.match(text, /^---\n/, `${path} opens frontmatter`);
    assert.match(text, /allowed-tools: Bash\(\.\/RUNME\.sh config:\*\)/, path);
    for (const row of text.split("\n")) {
      assert.ok(row.length <= 200, `${path} holds no runaway line`);
    }
  }
});

// [[spec/design_output/projection#how-a-command-sets-it]]
test("a body carries the run alone, so nothing but the verb sets the value", () => {
  const body = drawn().get(".claude/commands/se-log-level-info.md").split("---\n")[2];
  assert.match(body.trim(), /^!`\.\/RUNME\.sh config log\.level info`/);
});

test("wrap none writes the body alone", () => {
  const files = writesOf({ ...ENTRY, wrap: "none" }, texts());
  assert.match(files.get(".claude/commands/se-log-level-info.md"), /^!`/);
});

// [[spec/design_output/projection#projecting-in-memory]]
test("a projection names what it reads before it writes anything", () => {
  assert.deepEqual(readsOf(ENTRY), [SOURCE, SCHEMA]);
  assert.deepEqual(readsOf({ target: ".claude/commands" }), []);
});

// [[spec/design_output/projection#check-refuses-a-stale-one]]
test("check names a target somebody edits, one missing and one standing over", () => {
  const wanted = drawn();
  const found = new Map(wanted);
  found.set(".claude/commands/se-log-level-info.md", "somebody edits this by hand\n");
  found.delete(".claude/commands/se-judge-model.md");
  found.set(".claude/commands/se-judge-hold-warm.md", "a value nobody declares\n");

  assert.deepEqual(staleIn(wanted, found), [
    { path: ".claude/commands/se-judge-hold-warm.md", how: "extra" },
    { path: ".claude/commands/se-judge-model.md", how: "missing" },
    { path: ".claude/commands/se-log-level-info.md", how: "differs" },
  ]);
});

test("check answers nothing where every target reads as projected", () => {
  const wanted = drawn();
  assert.deepEqual(staleIn(wanted, new Map(wanted)), []);
});

// [[spec/design_output/projection#the-write-door-refuses-one]]
test("the owner of a path is the projection whose target holds it", () => {
  const entries = [ENTRY];
  assert.equal(ownerOf(entries, ".claude/commands/se-log-level-info.md"), ENTRY);
  assert.equal(ownerOf(entries, "./.claude/commands/se-log-level-info.md"), ENTRY);
  assert.equal(ownerOf(entries, "/home/one/tree/.claude/commands/se-judge-model.md"), ENTRY);
  assert.equal(ownerOf(entries, ".claude\\commands\\se-judge-model.md"), ENTRY);
  assert.equal(ownerOf(entries, "spec/config/level0.json"), undefined);
  assert.equal(ownerOf(entries, ".claude/settings.json"), undefined);
  assert.equal(ownerOf([], ".claude/commands/se-judge-model.md"), undefined);
});

test("the refusal names the projection, the source, and the verb that mends it", () => {
  const said = refusedWrite(ENTRY, ".claude/commands/se-log-level-info.md");
  assert.match(said, /is projected, so nothing may write it by hand/);
  assert.match(said, /the config commands/);
  assert.match(said, /Edit spec\/config\/level0\.json instead/);
  assert.match(said, /RUNME\.sh check/);
});

// [[spec/design_output/projection#what-goes-where-is-data]]
test("a second entry projects with no code change", () => {
  const OTHER = "spec/config/level1.json";
  const file = JSON.stringify({
    projections: [
      ENTRY,
      {
        name: "the level one commands",
        shape: COMMANDS,
        target: ".claude/commands/level1",
        from: OTHER,
        schema: SCHEMA,
        wrap: "frontmatter",
      },
    ],
  });

  const entries = entriesIn(file);
  assert.equal(entries.length, 2);

  const said = new Map([
    [OTHER, JSON.stringify({ judge: { model: "sonnet" } })],
    [SCHEMA, SAID],
  ]);
  const files = writesOf(entries[1], said);
  assert.deepEqual([...files.keys()], [".claude/commands/level1/se-judge-model.md"]);
  assert.match(files.get(".claude/commands/level1/se-judge-model.md"), /Source: spec\/config\/level1\.json/);
  assert.equal(
    ownerOf(entries, ".claude/commands/level1/se-judge-model.md"),
    entries[1],
    "the nearer target owns the path, so the refusal names the right source",
  );
});

test("a file nobody can read names no projection, and the tree carries on", () => {
  assert.deepEqual(entriesIn(""), []);
  assert.deepEqual(entriesIn("{ this is not json"), []);
  assert.deepEqual(entriesIn(JSON.stringify({ projections: {} })), []);
  assert.deepEqual(entriesIn(JSON.stringify({ projections: [{ name: "no target" }] })), []);
  assert.deepEqual([...writesOf({ ...ENTRY, shape: "nobody knows" }, texts())], []);
  assert.deepEqual([...writesOf(ENTRY, new Map())], []);
});

// [[spec/design_output/projection#check-refuses-a-stale-one]]
test("a fake disk drives the whole compare, and check refuses a hand edit", () => {
  const entries = [ENTRY];
  const disk = fakeDisk({ [SOURCE]: CONFIG, [SCHEMA]: SAID });
  disk.makeDir(".claude/commands");

  const first = readAll(entries, disk);
  assert.equal(first.wanted.size, 7);
  assert.deepEqual(
    staleIn(first.wanted, first.standing).map((one) => one.how),
    new Array(7).fill("missing"),
    "an empty folder reads as every file missing",
  );

  for (const [path, text] of first.wanted) disk.write(path, text);
  assert.deepEqual(staleIn(...Object.values(readAll(entries, disk))), []);

  disk.write(".claude/commands/se-log-level-info.md", "somebody edits this by hand\n");
  const said = readAll(entries, disk);
  assert.deepEqual(staleIn(said.wanted, said.standing), [
    { path: ".claude/commands/se-log-level-info.md", how: "differs" },
  ]);
});

test("a value the declaration drops leaves a file standing over", () => {
  const entries = [ENTRY];
  const disk = fakeDisk({ [SOURCE]: CONFIG, [SCHEMA]: SAID });
  disk.makeDir(".claude/commands");
  for (const [path, text] of readAll(entries, disk).wanted) disk.write(path, text);

  disk.write(SOURCE, JSON.stringify({ log: { level: "info" } }));
  const said = readAll(entries, disk);
  assert.deepEqual(
    staleIn(said.wanted, said.standing)
      .filter((one) => one.how === "extra")
      .map((one) => one.path),
    [
      ".claude/commands/se-judge-model.md",
      ".claude/commands/se-stop-enabled-false.md",
      ".claude/commands/se-stop-enabled-true.md",
      ".claude/commands/se-stop-mostInARow.md",
    ],
  );
});

test("a folder nobody made yet reads as empty, and the source may be missing", () => {
  const disk = fakeDisk({ [SOURCE]: CONFIG, [SCHEMA]: SAID });
  assert.equal(readAll([ENTRY], disk).standing.size, 0);
  assert.equal(readAll([ENTRY], fakeDisk({})).wanted.size, 0);
});
