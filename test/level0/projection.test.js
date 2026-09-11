// The projector, over texts alone. It reads no disk and writes none, so every
// case here hands it a source and reads the map it answers.
// [[spec/guidance/code/testing]]

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  COMMANDS,
  configPath,
  entriesIn,
  nameOf,
  optionsFor,
  ownerOf,
  readAll,
  readsOf,
  refusedWrite,
  saysGenerated,
  staleIn,
  widgetsIn,
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
      ".claude/commands/se-config-judge-model.md",
      ".claude/commands/se-config-log-level-error.md",
      ".claude/commands/se-config-log-level-info.md",
      ".claude/commands/se-config-log-level-warn.md",
      ".claude/commands/se-config-stop-enabled-false.md",
      ".claude/commands/se-config-stop-enabled-true.md",
      ".claude/commands/se-config-stop-mostInARow.md",
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
  assert.match(files.get(".claude/commands/se-config-log-level-warn.md"), /config log.level warn/);
  assert.match(files.get(".claude/commands/se-config-judge-model.md"), /config judge.model \$ARGUMENTS/);
});

// [[spec/design_output/projection#a-name-carries-the-key]]
test("a name carries the path it sits on, and the leaf keeps its case", () => {
  assert.equal(nameOf(configPath("judge.model").stem), "se-config-judge-model.md");
  assert.equal(nameOf(configPath("log.level").stem, "info"), "se-config-log-level-info.md");
  assert.equal(nameOf(configPath("stop.mostInARow").stem), "se-config-stop-mostInARow.md");
});

// [[spec/design_output/projection#a-widget-takes-its-path]]
test("a toggle in a group takes a second command down the group's path", () => {
  const schema = {
    properties: {
      stop: {
        type: "object",
        properties: {
          hold: { enum: ["running", "stopped"], widget: "toggle", group: "agent control", help: "The hold." },
        },
      },
      log: {
        type: "object",
        properties: { open: { widget: "action", group: "agent control", runs: "./RUNME.sh log" } },
      },
    },
  };
  const files = writesOf(
    ENTRY,
    new Map([
      [SOURCE, JSON.stringify({ stop: { hold: "running" } })],
      [SCHEMA, JSON.stringify(schema)],
    ]),
  );
  assert.deepEqual([...files.keys()].sort(), [
    ".claude/commands/se-agent-control-hold-running.md",
    ".claude/commands/se-agent-control-hold-stopped.md",
    ".claude/commands/se-config-stop-hold-running.md",
    ".claude/commands/se-config-stop-hold-stopped.md",
  ]);
  const widget = files.get(".claude/commands/se-agent-control-hold-stopped.md");
  const config = files.get(".claude/commands/se-config-stop-hold-stopped.md");
  assert.equal(widget.split("---\n")[2], config.split("---\n")[2], "both paths run the same verb");
  assert.match(widget, /^description: "agent control \/ hold: sets stop\.hold to stopped\. The hold\."$/m);
  assert.match(config, /^description: "config \/ stop \/ hold: sets stop\.hold to stopped\. The hold\."$/m);
});

test("two toggles sharing a leaf in one group each keep their section", () => {
  const toggle = { enum: ["a", "b"], widget: "toggle", group: "agent control" };
  const said = widgetsIn({
    properties: {
      stop: { properties: { hold: toggle } },
      ask: { properties: { hold: toggle } },
    },
  });
  assert.deepEqual(
    said.map((one) => one.path.stem.join("-")),
    ["agent-control-stop-hold", "agent-control-ask-hold"],
  );
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
  const body = drawn().get(".claude/commands/se-config-log-level-info.md").split("---\n")[2];
  assert.match(body.trim(), /^!`\.\/RUNME\.sh config log\.level info`/);
});

test("wrap none writes the body alone", () => {
  const files = writesOf({ ...ENTRY, wrap: "none" }, texts());
  assert.match(files.get(".claude/commands/se-config-log-level-info.md"), /^!`/);
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
  found.set(".claude/commands/se-config-log-level-info.md", "somebody edits this by hand\n");
  found.delete(".claude/commands/se-config-judge-model.md");
  found.set(".claude/commands/se-config-judge-hold-warm.md", "a value nobody declares\n");

  assert.deepEqual(staleIn(wanted, found), [
    { path: ".claude/commands/se-config-judge-hold-warm.md", how: "extra" },
    { path: ".claude/commands/se-config-judge-model.md", how: "missing" },
    { path: ".claude/commands/se-config-log-level-info.md", how: "differs" },
  ]);
});

test("check answers nothing where every target reads as projected", () => {
  const wanted = drawn();
  assert.deepEqual(staleIn(wanted, new Map(wanted)), []);
});

// [[spec/design_output/projection#the-write-door-refuses-one]]
test("the owner of a path is the projection whose target holds it", () => {
  const entries = [ENTRY];
  assert.equal(ownerOf(entries, ".claude/commands/se-config-log-level-info.md"), ENTRY);
  assert.equal(ownerOf(entries, "./.claude/commands/se-config-log-level-info.md"), ENTRY);
  assert.equal(ownerOf(entries, "/home/one/tree/.claude/commands/se-config-judge-model.md"), ENTRY);
  assert.equal(ownerOf(entries, ".claude\\commands\\se-judge-model.md"), ENTRY);
  assert.equal(ownerOf(entries, "spec/config/level0.json"), undefined);
  assert.equal(ownerOf(entries, ".claude/settings.json"), undefined);
  assert.equal(ownerOf([], ".claude/commands/se-config-judge-model.md"), undefined);
});

test("the refusal names the projection, the source, and the verb that mends it", () => {
  const said = refusedWrite(ENTRY, ".claude/commands/se-config-log-level-info.md");
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
  assert.deepEqual([...files.keys()], [".claude/commands/level1/se-config-judge-model.md"]);
  assert.match(files.get(".claude/commands/level1/se-config-judge-model.md"), /Source: spec\/config\/level1\.json/);
  assert.equal(
    ownerOf(entries, ".claude/commands/level1/se-config-judge-model.md"),
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

  disk.write(".claude/commands/se-config-log-level-info.md", "somebody edits this by hand\n");
  const said = readAll(entries, disk);
  assert.deepEqual(staleIn(said.wanted, said.standing), [
    { path: ".claude/commands/se-config-log-level-info.md", how: "differs" },
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
      ".claude/commands/se-config-judge-model.md",
      ".claude/commands/se-config-stop-enabled-false.md",
      ".claude/commands/se-config-stop-enabled-true.md",
      ".claude/commands/se-config-stop-mostInARow.md",
    ],
  );
});

test("a folder nobody made yet reads as empty, and the source may be missing", () => {
  const disk = fakeDisk({ [SOURCE]: CONFIG, [SCHEMA]: SAID });
  assert.equal(readAll([ENTRY], disk).standing.size, 0);
  assert.equal(readAll([ENTRY], fakeDisk({})).wanted.size, 0);
});
