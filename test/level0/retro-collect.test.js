// The retro's collect, driven through fake doors. It moves the private folder
// past its dot folders into the retro's input folder, copies the transcripts,
// the memory and the scratchpads beside it, and leaves the folders behind.
// [[spec/guidance/retro/collect]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { fakeClock } from "../../src/doors/fake/clock.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeTrunk } from "../../src/doors/fake/git.js";
import { retro } from "../../src/scripts/retro.js";
import { slugOf } from "../../src/scripts/retro-outside.js";

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
    git: fakeTrunk(),
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
  assert.deepEqual(standing(it), [".doc", ".retro", ".runtime", "scripts"]);
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

const stamped = (when, more = "") => `{"timestamp":"${when}"${more}}`;

// [[spec/tickets/the-retro-finishes-its-asks]]
test("a transcript line stamped before the last collect stays out of the input", () => {
  const session = home(`.claude/projects/${SLUG}/session.jsonl`);
  const it = doors({
    ...FILES,
    [at(".se/.retro/retro-older/collected.json")]: '{"at":"2026-09-12T00:00:00.000Z"}\n',
    [session]: [
      stamped("2026-09-11T08:00:00.000Z", ',"said":"old"'),
      '{"said":"old, no stamp"}',
      stamped("2026-09-13T08:00:00.000Z", ',"said":"new"'),
      '{"said":"new, no stamp"}',
    ].join("\n"),
  });
  it.disk.times.set(session.split("\\").join("/"), Date.parse("2026-09-13T08:00:00.000Z"));

  heard(() => retro(ROOT, ["collect", RETRO], it));

  const copied = it.disk.read(input(`transcripts/${SLUG}/session.jsonl`));
  assert.doesNotMatch(copied, /"old/);
  assert.match(copied, /"said":"new"/);
  assert.match(copied, /new, no stamp/);
});

// [[spec/tickets/the-second-collect-keeps-lines]]
test("a second pass keeps the lines the first pass takes, and adds the lines past it", () => {
  const session = home(`.claude/projects/${SLUG}/session.jsonl`);
  const first = stamped("2026-09-19T11:00:00.000Z", ',"said":"first"');
  const it = doors({ ...FILES, [session]: first });
  heard(() => retro(ROOT, ["collect", RETRO], it));

  it.disk.write(session, [first, stamped("2026-09-19T13:00:00.000Z", ',"said":"later"')].join("\n"));
  it.disk.times.set(session.split("\\").join("/"), Date.parse("2026-09-19T13:00:00.000Z"));
  heard(() => retro(ROOT, ["collect", RETRO, "--again"], it));

  const copied = it.disk.read(input(`transcripts/${SLUG}/session.jsonl`));
  assert.match(copied, /"said":"first"/);
  assert.match(copied, /"said":"later"/);
});

// [[spec/tickets/the-retro-finishes-its-asks]]
test("a collect copies .se/scripts and leaves it in place, and a second pass copies what changes", () => {
  const it = doors();
  const first = heard(() => retro(ROOT, ["collect", RETRO], it));
  assert.equal(first.code, 0, first.said);
  assert.equal(it.disk.exists(at(".se/scripts/one.mjs")), true, "the scripts stay in place");
  assert.equal(it.disk.exists(input("scripts/one.mjs")), true);

  it.disk.write(at(".se/scripts/two.mjs"), "// a later script\n");
  it.disk.times.set(at(".se/scripts/two.mjs").split("\\").join("/"), Date.parse("2026-09-19T13:00:00.000Z"));
  const again = heard(() => retro(ROOT, ["collect", RETRO, "--again"], it));

  assert.equal(again.code, 0, again.said);
  assert.equal(it.disk.exists(at(".se/scripts/one.mjs")), true);
  assert.equal(it.disk.exists(at(".se/scripts/two.mjs")), true);
  assert.equal(it.disk.read(input("scripts/two.mjs")), "// a later script\n");
  assert.equal(it.disk.exists(input("scripts/one.2.mjs")), false, "an unchanged script copies once");
});

const LAST = ".se/.retro/retro-older/collected.json";
const ticketText = (name, state, process, retroChapter = "") =>
  [
    "---",
    "kind: [[ticket]]",
    `state: ${state}`,
    `process: [[spec/processes/${process}]]`,
    "---",
    "",
    "# Ask",
    "",
    `The ask of ${name}.`,
    "",
    retroChapter,
    "# Discussion",
    "",
    "<!-- what anybody adds, at any time, on this ticket -->",
    "",
    "a line past the retro",
    "",
  ].join("\n");
const RETRO_CHAPTER = [
  "# retro",
  "",
  "## write",
  "",
  "### badly",
  "",
  "<!-- the form is list -->",
  "",
  "- the sync meets a conflict, at 10:04, and the owner prompt turns it",
  "",
  "### thoughts",
  "",
  "The box reads the trunk guard late.",
  "",
].join("\n");
const groupAt = (name, state = "closed", chapter = RETRO_CHAPTER) =>
  ticketText(name, state, "group", chapter);
const ticketPath = (name) => `spec/tickets/${name}.md`;

// [[spec/tickets/the-retro-reads-cloud-retros]]
test("collect gathers the retro chapter of every group closing in the window, with the close of the trunk commit landing it, once the branch leaves", () => {
  const closed = groupAt("cloud-one");
  const it = doors(
    { ...FILES, [at(LAST)]: '{"at":"2026-09-12T00:00:00.000Z"}\n' },
    {
      git: fakeTrunk([
        { sha: "open1", at: "2026-09-08T09:00:00+00:00", trunk: true, changes: { [ticketPath("cloud-one")]: groupAt("cloud-one", "open", "") } },
        { sha: "box1", at: "2026-09-11T09:00:00+00:00", trunk: false, changes: { [ticketPath("cloud-one")]: closed } },
        { sha: "merge1", at: "2026-09-15T10:00:00+00:00", trunk: true, changes: { [ticketPath("cloud-one")]: closed } },
      ]),
    },
  );

  const { code, said } = heard(() => retro(ROOT, ["collect", RETRO], it));

  assert.equal(code, 0, said);
  assert.equal(it.disk.exists(input("groups/cloud-one.md")), true, "the chapter lands in the input");
  const chapter = it.disk.read(input("groups/cloud-one.md"));
  assert.match(chapter, /^# retro$/m);
  assert.match(chapter, /^### badly$/m);
  assert.match(chapter, /the sync meets a conflict, at 10:04/);
  assert.match(chapter, /The box reads the trunk guard late\./);
  assert.doesNotMatch(chapter, /The ask of cloud-one/, "the ask stays out");
  assert.doesNotMatch(chapter, /a line past the retro/, "the chapter after stays out");
  assert.deepEqual(
    JSON.parse(it.disk.read(input("groups/closed.json"))),
    { "cloud-one": "2026-09-15T10:00:00.000Z" },
    "the close is the trunk commit landing the group, past the box's own close",
  );
  assert.equal(
    manifestOf(it).find((one) => one.path === "groups/cloud-one.md")?.from,
    "groups",
  );
  assert.equal(
    it.git.ran.some((one) => one.argv.join(" ").includes("work/")),
    false,
    "collect reads trunk alone, so a branch that leaves takes nothing with it",
  );
});

// [[spec/tickets/the-retro-reads-cloud-retros]]
test("a group closing before the window stays out, and a ticket closing that is no group stays out", () => {
  const it = doors(
    { ...FILES, [at(LAST)]: '{"at":"2026-09-12T00:00:00.000Z"}\n' },
    {
      git: fakeTrunk([
        { sha: "merge0", at: "2026-09-10T10:00:00+00:00", trunk: true, changes: { [ticketPath("cloud-old")]: groupAt("cloud-old") } },
        { sha: "fix1", at: "2026-09-14T10:00:00+00:00", trunk: true, changes: { [ticketPath("a-fix")]: ticketText("a-fix", "closed", "standard", RETRO_CHAPTER) } },
      ]),
    },
  );

  const { code, said } = heard(() => retro(ROOT, ["collect", RETRO], it));

  assert.equal(code, 0, said);
  assert.equal(it.disk.exists(input("groups/cloud-old.md")), false, "a close before the window stays out");
  assert.equal(it.disk.exists(input("groups/a-fix.md")), false, "a ticket that is no group stays out");
  assert.equal(it.disk.exists(input("groups/closed.json")), false);
});

// [[spec/tickets/the-retro-reads-cloud-retros]]
test("a group closing with no retro text writes nothing, and the print names it", () => {
  const bare = "# retro\n\n## write\n\n### badly\n\n<!-- the form is list -->\n\n";
  const it = doors(FILES, {
    git: fakeTrunk([
      { sha: "merge2", at: "2026-09-15T10:00:00+00:00", trunk: true, changes: { [ticketPath("cloud-bare")]: groupAt("cloud-bare", "closed", bare) } },
    ]),
  });

  const { code, said } = heard(() => retro(ROOT, ["collect", RETRO], it));

  assert.equal(code, 0, said);
  assert.equal(it.disk.exists(input("groups/cloud-bare.md")), false);
  assert.match(said, /cloud-bare closes with no retro text/);
});

// [[spec/tickets/the-retro-reads-cloud-retros]]
test("a second pass takes each group once, and the count prints the groups", () => {
  const commits = [
    { sha: "merge3", at: "2026-09-19T12:00:00+00:00", trunk: true, changes: { [ticketPath("cloud-a")]: groupAt("cloud-a") } },
  ];
  const it = doors(FILES, { git: fakeTrunk(commits) });
  const first = heard(() => retro(ROOT, ["collect", RETRO], it));
  assert.equal(first.code, 0, first.said);
  assert.match(first.said, /groups\s+2 file\(s\)/, "the chapter and the closes");
  const was = it.disk.modified(input("groups/cloud-a.md"));

  commits.push({ sha: "merge4", at: "2026-09-19T13:00:00+00:00", trunk: true, changes: { [ticketPath("cloud-b")]: groupAt("cloud-b") } });
  const again = heard(() => retro(ROOT, ["collect", RETRO, "--again"], it));

  assert.equal(again.code, 0, again.said);
  assert.equal(it.disk.modified(input("groups/cloud-a.md")), was, "a group the first pass takes stays as it is");
  assert.equal(it.disk.exists(input("groups/cloud-a.2.md")), false);
  assert.equal(it.disk.exists(input("groups/cloud-b.md")), true);
  assert.deepEqual(JSON.parse(it.disk.read(input("groups/closed.json"))), {
    "cloud-a": "2026-09-19T12:00:00.000Z",
    "cloud-b": "2026-09-19T13:00:00.000Z",
  });
  assert.match(again.said, /groups\s+3 file\(s\)/);
});
