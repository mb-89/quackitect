// Vale's rows through the lint's cache, and the tense reader over many files in
// one call, driven through fake doors. The real Vale and quack stand in
// test/contract, and these cases hold what the cache adds.
// [[spec/tickets/the-check-runs-fast-again]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { BIN } from "../../.claude/skills/level0/lib/index.js";
import { readsText, readsTexts } from "../../src/bridge/findings.js";
import {
  CACHE,
  filesUnder,
  NAMED_MOST,
  namesFit,
  parked,
  valeRowsOver,
} from "../../src/bridge/vale-rows.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeProc } from "../../src/doors/fake/proc.js";

const ROOT = "/tree";
const ARGV = ["vale", "--config=.vale.ini", "--output=JSON", "--no-exit", "--glob=!x"];
const CONFIG = "StylesPath = styles\n";

// A Vale that answers one row a file it reads, and keeps the paths each run names. [[spec/tickets/the-check-runs-fast-again]]
function tree(seed = {}) {
  const disk = fakeDisk({
    [join(ROOT, ".vale.ini")]: CONFIG,
    [join(ROOT, "styles", "Ours", "One.yml")]: "level: error\n",
    [join(ROOT, "notes.md")]: "# One\n",
    [join(ROOT, "spec", "two.md")]: "# Two\n",
    ...seed,
  });
  const runs = [];
  const proc = fakeProc({
    vale: (argv) => {
      const named = argv.slice(ARGV.length);
      runs.push(named);
      const read = named.includes(".") ? filesUnder(it, ["."]) : named;
      return {
        stdout: JSON.stringify(
          Object.fromEntries(
            read.map((one) => [one, [{ Check: "Ours.One", Line: 1, Match: one }]]),
          ),
        ),
      };
    },
  });
  const it = { disk, proc, join, root: ROOT };
  return { it, runs };
}

test("a lint with nothing kept hands Vale every file by name, and keeps what it answers", async () => {
  const { it, runs } = tree();
  const said = await valeRowsOver(it, ARGV, ["."]);

  assert.deepEqual(runs, [
    [".vale.ini", "notes.md", "spec/two.md", "styles/Ours/One.yml"],
  ]);
  assert.deepEqual(Object.keys(JSON.parse(said.stdout)).sort(), runs[0]);
  assert.ok(it.disk.exists(join(ROOT, CACHE)), "the rows stand kept");
});

test("a second lint over an unchanged tree runs no Vale, and answers the same", async () => {
  const { it, runs } = tree();
  const first = await valeRowsOver(it, ARGV, ["."]);
  const second = await valeRowsOver(it, ARGV, ["."]);

  assert.equal(runs.length, 1, "Vale ran once");
  assert.deepEqual(JSON.parse(second.stdout), JSON.parse(first.stdout));
});

test("a changed file goes to Vale alone, and the others' rows come from the cache", async () => {
  const { it, runs } = tree();
  await valeRowsOver(it, ARGV, ["."]);
  it.disk.write(join(ROOT, "notes.md"), "# One, changed\n");
  const said = JSON.parse((await valeRowsOver(it, ARGV, ["."])).stdout);

  assert.deepEqual(runs[1], ["notes.md"]);
  assert.equal(said["spec/two.md"][0].Match, "spec/two.md", "the kept rows stand");
  assert.equal(said["notes.md"][0].Match, "notes.md");
});

test("a changed rule reads every file again", async () => {
  const { it, runs } = tree();
  await valeRowsOver(it, ARGV, ["."]);
  it.disk.write(join(ROOT, "styles", "Ours", "One.yml"), "level: warning\n");
  await valeRowsOver(it, ARGV, ["."]);

  assert.equal(runs[1].length, 4, "every file goes to Vale again");
});

test("a file Vale reads no row in keeps no row, and a file gone leaves the cache", async () => {
  const { it } = tree();
  it.proc.teach(["vale"], { stdout: "{}" });
  await valeRowsOver(it, ARGV, ["."]);
  it.disk.remove(join(ROOT, "notes.md"));
  const said = await valeRowsOver(it, ARGV, ["."]);
  const kept = JSON.parse(it.disk.read(join(ROOT, CACHE))).files;

  assert.deepEqual(JSON.parse(said.stdout), {});
  assert.equal(kept["notes.md"], undefined);
  assert.deepEqual(kept["spec/two.md"].rows, []);
});

test("past the names a command line holds, Vale walks the paths asked itself", async () => {
  const many = {};
  for (let at = 0; at <= NAMED_MOST; at++)
    many[join(ROOT, "many", `n${at}.md`)] = "x\n";
  const { it, runs } = tree(many);
  await valeRowsOver(it, ARGV, ["."]);

  assert.deepEqual(runs, [["."]]);
  assert.equal(namesFit(["a.md"]), true);
});

test("a fault Vale answers comes back as Vale said it, and keeps nothing", async () => {
  const { it } = tree();
  const fault = JSON.stringify({ Code: "E100", Text: "broken config" });
  it.proc.teach(["vale"], { exitCode: 2, stdout: fault });
  const said = await valeRowsOver(it, ARGV, ["."]);

  assert.equal(said.stdout, fault);
  assert.equal(it.disk.exists(join(ROOT, CACHE)), false);
});

test("the walk parks what Vale's glob parks, at any depth", () => {
  assert.equal(parked("src/extension/node_modules/x/README.md"), true);
  assert.equal(parked(".se/tickets/one.md"), true);
  assert.equal(parked("spec/_draft.md"), true);
  assert.equal(parked(".claude/types/api.d.ts"), true);
  assert.equal(parked(".claude/skills/level0/hooks/cage.js"), false);
  assert.equal(parked("spec/tickets/one.md"), false);
});

test("a lint over a path asked reads the files under it alone, and keeps the rest", async () => {
  const { it, runs } = tree();
  await valeRowsOver(it, ARGV, ["."]);
  it.disk.write(join(ROOT, "notes.md"), "# One, changed\n");
  it.disk.write(join(ROOT, "spec", "two.md"), "# Two, changed\n");
  const said = JSON.parse((await valeRowsOver(it, ARGV, [`${ROOT}/spec`])).stdout);
  const kept = JSON.parse(it.disk.read(join(ROOT, CACHE))).files;

  assert.deepEqual(runs[1], ["spec/two.md"]);
  assert.deepEqual(Object.keys(said), ["spec/two.md"]);
  assert.ok(kept["notes.md"], "a file outside the path stays kept");
});

// The tense reader over many files answers each file as a call of its own answers it, in one quack run. [[spec/tickets/the-check-runs-fast-again]]
test("the tense reader reads many files in one quack call, and keeps what one call a file keeps", () => {
  const quack = join(ROOT, BIN);
  const calls = [];
  const proc = fakeProc({
    [quack]: (_argv, init) => {
      const asked = JSON.parse(init.stdin);
      calls.push(asked.docs.length);
      // This quack keeps every row but the first of a doc.
      return {
        stdout: JSON.stringify({
          docs: asked.docs.map((one) => ({ kept: one.found.slice(1) })),
        }),
      };
    },
  });
  const it = {
    disk: fakeDisk({ [quack]: "" }),
    proc,
    join,
    root: ROOT,
    slices: { prose: "new" },
  };
  const row = (rule, line) => ({ rule, line, column: 1, said: rule, file: "x" });
  const texts = [
    { file: "a.md", text: "a\n", rows: [row("One", 1), row("Two", 2)] },
    { file: "b.md", text: "b\n", rows: [] },
    { file: "c.md", text: "c\n", rows: [row("Three", 1), row("Four", 3)] },
  ];
  const each = texts.flatMap((one) => readsText(it, one.file, one.text, one.rows, []));
  calls.length = 0;
  const all = readsTexts(it, texts, []);

  assert.deepEqual(calls, [2], "one call, carrying the files with rows");
  assert.deepEqual(all, each);
  assert.deepEqual(
    all.map((one) => one.rule),
    ["Two", "Four"],
  );
});
