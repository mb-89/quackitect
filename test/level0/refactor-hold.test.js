// The refactoring hand's hold over a fake box: the spawn writes it, the answer
// takes it off, a hold past its span reads as none, and the write door lets the
// owning hand alone through.
// [[spec/design_output/stop#the-hand-holds-its-file]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { holdHere, holdsFile } from "../../src/bridge/refactor-hold.js";
import { onRefactorAnswered, onStop, walks } from "../../src/bridge/stop.js";
import { onWrite } from "../../src/bridge/write.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeLog } from "../../src/doors/fake/log.js";
import { fakeProc } from "../../src/doors/fake/proc.js";

const ROOT = "/tree";
const at = (path) => join(ROOT, ...path.split("/"));
const HOLD = at(".se/.runtime/refactor-hold.json");
const NOW = 1_800_000_000;
const WEEK = 604_800;
const HOUR = 3600;

const RULES = `
- id: the-last-line-names-no-stop
  side: continue
  priority: 50
  decides: mechanical
  runs: no-stop-line
  says: The last line names no stop reason, so this turn holds open.

- id: the-tooth-is-out
  side: continue
  priority: 0
  decides: mechanical
  runs: stop-hook-off
  says: The stop hook stands off.
`;

const REFACTOR = {
  parallel: true,
  mostWarnings: 2,
  mostAtOnce: 1,
  untouchedFor: "7d",
  grace: 1,
  holdFor: "30m",
};

// The stamp and the list the refactoring rule reads, over one file at rest. [[spec/design_output/stop#the-grace]]
function stamped(warnings, names = ["old.md"]) {
  const list = Array.from({ length: warnings }, (_, line) => ({
    file: names[line % names.length],
    rule: "VoiceParagraph.Sentence",
    line: line + 1,
  }));
  return {
    [at(".se/.runtime/check.json")]: JSON.stringify({
      sha: "a1",
      ok: true,
      clean: true,
      at: "2026-01-01T00:00:00Z",
      warnings,
      files: names,
    }),
    [at(".se/.runtime/refactor.json")]: JSON.stringify(list),
  };
}

function box(files = {}, wrote = `${NOW - WEEK * 2}\n\nold.md\n`) {
  return {
    disk: fakeDisk({
      [at("spec/config/level0.json")]: JSON.stringify({
        stop: { enabled: true, mostInARow: 3, hold: "off" },
        engine: { binding: "queue" },
        refactor: REFACTOR,
      }),
      [at("spec/config/stop/level0.yml")]: RULES,
      ...files,
    }),
    work: ROOT,
    root: ROOT,
    method: ROOT,
    env: {},
    clock: { now: () => new Date(NOW * 1000) },
    proc: fakeProc({
      "git rev-parse --abbrev-ref HEAD": { stdout: "work/a-thing\n" },
      git: () => ({ stdout: wrote }),
    }),
    log: fakeLog(),
    vale: { stands: () => false },
    projections: [],
  };
}

const held = (hand, since = NOW) => ({
  [HOLD]: JSON.stringify({ file: "old.md", hand, since }),
});
const write = (agentId) => ({
  tool: "Write",
  file_path: at("old.md"),
  content: "Two lines.\n",
  ...(agentId ? { agentId } : {}),
});
const denied = (said) => String(said?.result?.deny ?? "");

test("the spawn writes the hold on its file, and the hand's answer takes it off", () => {
  const it = box(stamped(9));
  const said = onStop({ last_assistant_message: "Some text and no stop." }, it);
  assert.equal(said.spawn.file, "old.md");
  assert.ok(it.disk.exists(HOLD), "the spawn writes the hold");
  assert.deepEqual(JSON.parse(it.disk.read(HOLD)), { file: "old.md", hand: "", since: NOW });

  onRefactorAnswered({ file: "old.md" }, it);
  assert.equal(it.disk.exists(HOLD), false, "the answer takes the hold off");
});

test("the session's write to a held file refuses, and the first helper to write takes it", async () => {
  const it = box(held(""));
  assert.match(denied(await onWrite(write(""), it)), /old\.md stands held/);

  assert.equal(denied(await onWrite(write("a1"), it)), "", "the first helper lands");
  assert.equal(JSON.parse(it.disk.read(HOLD)).hand, "a1", "and owns the file");
});

test("another hand's write to a held file refuses, and the owning hand's lands", async () => {
  const it = box(held("a1"));
  assert.match(denied(await onWrite(write("a2"), it)), /old\.md stands held/);
  assert.equal(denied(await onWrite(write("a1"), it)), "", "the owning hand lands");
});

test("a hold past its span reads as none, and the session's write lands", async () => {
  const it = box(held("a1", NOW - HOUR));
  assert.equal(denied(await onWrite(write(""), it)), "", "the aged hold stands for nothing");
});

// A span of 0 switches the hold off, so the spawn writes none and a standing one reads as none. [[spec/design_output/stop#the-hand-holds-its-file]]
test("a hold span of 0 switches the hold off", () => {
  const it = box(held("a1"));
  it.disk.write(
    at("spec/config/level0.json"),
    JSON.stringify({ refactor: { ...REFACTOR, holdFor: "0" } }),
  );
  assert.equal(holdHere(it), null, "a standing hold reads as none");
  it.disk.remove(HOLD);
  holdsFile(it, "old.md");
  assert.equal(it.disk.exists(HOLD), false, "the spawn writes none");
});

// The files at rest, the oldest last, as one git log answers them. [[spec/design_output/stop#the-hand-walks-the-list]]
const RESTING = `${NOW - WEEK * 2}\n\nb.md\n${NOW - WEEK * 3}\n\na.md\n`;

function walking(refactor = REFACTOR) {
  const it = box(stamped(9, ["a.md", "b.md"]), RESTING);
  it.disk.write(at("spec/config/level0.json"), JSON.stringify({ refactor }));
  const rows = [];
  it.log = { say: (...row) => rows.push(row) };
  const lines = () => rows.filter((row) => row[1] === "refactor").map((row) => row[2]);
  return { it, rows, lines };
}

const helper = (agentId) => ({ tool: "mcp__level0__refactor_next", agentId });
const answered = (said) => String(said?.result?.result ?? "");
const turn = { last_assistant_message: "Some text and no stop." };

test("one hand walks the list, the hold moves with it, and the log says the spawn and each file", () => {
  const { it, lines } = walking();
  const said = onStop(turn, it);
  assert.equal(said.spawn.file, "a.md", "the oldest file at rest goes first");
  assert.match(said.spawn.prompt, /mcp__level0__refactor_next/);
  assert.deepEqual(JSON.parse(it.disk.read(HOLD)), { file: "a.md", hand: "", since: NOW });

  assert.match(answered(walks(helper("h1"), it)), /Take b\.md/);
  assert.deepEqual(JSON.parse(it.disk.read(HOLD)), { file: "b.md", hand: "h1", since: NOW });

  assert.match(answered(walks(helper("h1"), it)), /No file waits/, "a file the hand took stays out");
  assert.equal(it.disk.exists(HOLD), false, "the walk's end takes the hold off");

  onRefactorAnswered({ file: "a.md", text: "Drained two files." }, it);
  assert.deepEqual(lines(), [
    "the refactoring hand spawns, 9 warnings standing",
    "the hand takes a.md, of 9 standing",
    "the hand takes b.md, of 9 standing",
  ]);
});

test("the walk refuses a call from outside its hand, and a hand that falls says why at warn", () => {
  const { it, rows } = walking();
  assert.match(denied(walks(helper("h1"), it)), /No refactoring walk stands/, "no walk yet");
  onStop(turn, it);
  assert.match(answered(walks(helper("h1"), it)), /Take b\.md/);
  assert.match(denied(walks(helper("h2"), it)), /No refactoring walk stands/, "another hand");
  assert.match(denied(walks({ tool: "mcp__level0__refactor_next" }, it)), /No refactoring walk/);
  assert.equal(JSON.parse(it.disk.read(HOLD)).file, "b.md", "a refusal leaves the hold");

  onRefactorAnswered({ file: "a.md", deny: "the spawn falls" }, it);
  assert.equal(it.disk.exists(HOLD), false);
  assert.ok(rows.some((row) => row[0] === "warn" && row[2] === "the refactoring hand falls"));
  assert.match(denied(walks(helper("h1"), it)), /No refactoring walk stands/, "the answer ends it");
});

test("the walk ends where the hand spends refactor.mostFiles", () => {
  const { it } = walking({ ...REFACTOR, mostFiles: 1 });
  onStop(turn, it);
  assert.match(answered(walks(helper("h1"), it)), /No file waits/);
});
