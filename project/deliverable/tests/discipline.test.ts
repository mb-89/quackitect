// The discipline round (owner ruling 2026-08-02), tested against the harvest
// that ruled it: 2,589 logged se_run calls, 46% of them improvised text tools
// — Select-String for the searcher, Get-Content for the reader, Set-/Add-
// Content for the writer, every one uninstrumented. The lane grows the
// missing verbs here, and se_run learns to say no to the jobs it now covers.
import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import { appendFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { classifyCommand, laneVerdict, testFingerprint, testRecord } from "../engine/discipline.ts";
import { Rejection } from "../engine/errors.ts";
import { filePatch, fileRead } from "../engine/files.ts";
import { contentHash } from "../engine/hash.ts";
import { search } from "../engine/search.ts";
import { anyGuidanceDoc, bootedServer, call, freshRoot, laneSource } from "./helpers.ts";

function fresh(): string {
  return mkdtempSync(join(tmpdir(), "se-v3-disc-"));
}

// THE SLIDER IS THE PERSON'S ALONE (owner ruling 2026-08-10). No lane verb
// may reach the autonomy dial — it moves through the mirror's human route
// and the boot flag, nowhere else. This guard refuses the verb before it
// can exist.
test("no lane verb reaches the autonomy dial", () => {
  const tools = laneSource();
  assert.ok(!tools.includes("setAutonomy"), "a lane verb touches the dial — the slider is the person's alone (owner ruling 2026-08-10)");
});

// A FAILING LEAF KEEPS ITS MESSAGE (i11, from the 2026-08-12 seed).
//
// The parser matched `^not ok` with no leading space, so a failure inside a
// describe() block was invisible: TAP indents the child and reports the PARENT
// at the top level as "1 subtest failed" with the suite's location. The one
// line that says WHAT failed was dropped, every time.
//
// MEASURED 2026-08-16: three failures had to be re-run through the shell with
// a different reporter to be read at all — each a logged escape from the lane
// that exists to replace exactly that.
test("a failure inside a suite reports its own assertion, not the parent's roll-up", () => {
  const tap = [
    "TAP version 13",
    "    # Subtest: a promoted experiment is assigned to a step",
    "    not ok 3 - a promoted experiment is assigned to a step",
    "      ---",
    '      error: "The input did not match /exp-p: promoted and unassigned/"',
    "      code: 'ERR_ASSERTION'",
    "      ...",
    "not ok 1 - the design-spec law",
    "  ---",
    "  failureType: 'subtestsFailed'",
    "  error: '1 subtest failed'",
    "  ...",
    "# tests 2",
    "# pass 1",
    "# fail 1",
  ].join("\n");
  const r = parseTap(tap);
  assert.equal(r.fail, 1, "the counts come from the summary and are untouched");
  assert.equal(r.failures.length, 1, "the roll-up is dropped where a leaf survived it");
  assert.match(r.failures[0].name, /a promoted experiment/, "the leaf is what gets named");
  assert.match(r.failures[0].detail, /did not match/, "and its assertion rides with it");

  // A ROLL-UP ALONE IS STILL BETTER THAN SILENCE. Where no leaf was captured
  // — a crash before the subtest reported — the parent is all there is.
  const only = parseTap(["not ok 1 - the design-spec law", "  ---", "  error: '1 subtest failed'", "  ...", "# fail 1"].join("\n"));
  assert.equal(only.failures.length, 1, "nothing more specific means the parent still reports");
});

// A TRUNCATING SHAPE IS REFUSED, NOT ANNOTATED (owner ruling 2026-08-16).
//
// The lane warned about this for months and the warning did not work: an agent
// piped a test run through Select-String IN THIS ITERATION, while building the
// fix for it, and got exit 1 with empty stdout. The red had to be re-run to be
// read at all.
//
// WHAT THE PIPE DESTROYS is unrecoverable by design — it cuts between the
// command and the capture, so the dropped part is not on the result, not in
// the log and not under the ref.
test("a truncating shape refuses before the spawn, and names the verb that was wanted", async () => {
  const server = await bootedServer(freshRoot());
  const cases: [string, string][] = [
    ["node --test project/deliverable/tests/pull.test.ts | Select-String -Pattern fail", "se_test"],
    ["rg TODO project | Select-Object -First 20", "se_file_search"],
    ["Get-Content big.log | Select-Object -First 50", "se_file_read"],
    ["git log --oneline | head -5", "se_run"],
  ];
  for (const [command, wanted] of cases) {
    const r = await call(server, "se_run", { command });
    assert.equal(r.isError, true, `${command} should refuse`);
    assert.equal(r.body.clause, "SE-C-137");
    assert.equal((r.body.remedy as { tool: string }).tool, wanted, `${command} wanted ${wanted}`);
  }
  // THE ESCAPE STAYS OPEN AND LOGGED, the same door every other lane rule has.
  const forced = await call(server, "se_run", {
    command: "git log --oneline | head -2",
    no_tool_reason: "proving the escape still runs",
  });
  assert.notEqual(forced.isError, true, "no_tool_reason runs it anyway");
});

// ── the patch verbs ────────────────────────────────────────────────────────

// THE APPEND WENT THROUGH THE SHELL, 285 TIMES. The handover's addenda were
// Add-Content heredocs because the lane demanded either a full rewrite with
// hash or an exact anchor — for "add to the end", both are the wrong shape.
test("append is a patch op: no anchor, no full rewrite, seam handled and NAMED", () => {
  const root = fresh();
  writeFileSync(join(root, "h.md"), "# Handover\nbody"); // no trailing newline — the common fumble
  const r = filePatch(root, [{ path: "h.md", append: true, new_string: "## Addendum\nmore" }]);
  assert.equal(readFileSync(join(root, "h.md"), "utf8"), "# Handover\nbody\n## Addendum\nmore");
  assert.ok(
    (r.corrected ?? []).some((c) => c.includes("newline")),
    "the mechanical seam fix is announced, not silent",
  );
  rmSync(root, { recursive: true, force: true });
});

test("prepend joins at the file's start", () => {
  const root = fresh();
  writeFileSync(join(root, "h.md"), "body\n");
  filePatch(root, [{ path: "h.md", prepend: true, new_string: "# Title" }]);
  assert.equal(readFileSync(join(root, "h.md"), "utf8"), "# Title\nbody\n");
  rmSync(root, { recursive: true, force: true });
});

// SED, KEPT INSIDE THE LANE. The regex verb is what -replace was reaching
// for, minus the quoting arms race and plus the guards: always global, count
// reported, and expect_count turns "hope it hit once" into a checked claim.
test("regex substitution reports its count and honours expect_count", () => {
  const root = fresh();
  writeFileSync(join(root, "a.ts"), "const aq = 1; use(aq); log(aq);\n");
  const r = filePatch(root, [{ path: "a.ts", pattern: "\\baq\\b", replacement: "survey", expect_count: 3 }]);
  assert.equal(r.applied[0].replacements, 3);
  assert.equal(readFileSync(join(root, "a.ts"), "utf8"), "const survey = 1; use(survey); log(survey);\n");
  rmSync(root, { recursive: true, force: true });
});

test("a wrong expect_count refuses and NOTHING is written", () => {
  const root = fresh();
  const before = "x y x\n";
  writeFileSync(join(root, "a.md"), before);
  assert.throws(
    () => filePatch(root, [{ path: "a.md", pattern: "x", replacement: "z", expect_count: 3 }]),
    (e: unknown) => e instanceof Rejection && e.clause === "SE-C-105",
  );
  assert.equal(readFileSync(join(root, "a.md"), "utf8"), before, "a refused batch leaves the tree untouched");
  rmSync(root, { recursive: true, force: true });
});

test("a zero-match pattern refuses — a substitution that hit nothing is not a success", () => {
  const root = fresh();
  writeFileSync(join(root, "a.md"), "plain\n");
  assert.throws(
    () => filePatch(root, [{ path: "a.md", pattern: "absent_\\d+", replacement: "x" }]),
    (e: unknown) => e instanceof Rejection && e.clause === "SE-C-105",
  );
  rmSync(root, { recursive: true, force: true });
});

// A LINE NUMBER ONLY MEANS SOMETHING AGAINST THE VERSION YOU READ — so the
// range verb demands the hash that read handed over, mechanically.
test("line-range replace works from a read's hash and refuses without one", () => {
  const root = fresh();
  writeFileSync(join(root, "a.ts"), "one\ntwo\nthree\nfour\n");
  const hash = fileRead(root, "a.ts").hash;
  assert.throws(
    () => filePatch(root, [{ path: "a.ts", at: { from_line: 2, to_line: 3 }, new_string: "TWO" }]),
    (e: unknown) => e instanceof Rejection && e.clause === "SE-C-046",
    "a range op without base_hash refuses by name",
  );
  filePatch(root, [{ path: "a.ts", at: { from_line: 2, to_line: 3 }, new_string: "TWO\nTHREE", base_hash: hash }]);
  assert.equal(readFileSync(join(root, "a.ts"), "utf8"), "one\nTWO\nTHREE\nfour\n");
  rmSync(root, { recursive: true, force: true });
});

test("a range beyond the file refuses with the file's real extent", () => {
  const root = fresh();
  writeFileSync(join(root, "a.ts"), "one\ntwo\n");
  const hash = fileRead(root, "a.ts").hash;
  assert.throws(
    () => filePatch(root, [{ path: "a.ts", at: { from_line: 2, to_line: 99 }, new_string: "x", base_hash: hash }]),
    (e: unknown) => e instanceof Rejection && e.clause === "SE-C-105",
  );
  rmSync(root, { recursive: true, force: true });
});

// THE ENGINE CORRECTS WHAT IS MECHANICAL AND SAYS SO. The commonest patch
// refusal (12 in one period) was a CRLF file against an LF old_string — a
// difference no model can see. The old lane diagnosed it and refused anyway;
// the round-trip that followed re-copied text that differed in nothing
// visible. Now the patch lands in the file's own endings and the correction
// is named on the result.
test("a CRLF/LF mismatch is auto-corrected and ANNOUNCED, not refused", () => {
  const root = fresh();
  writeFileSync(join(root, "w.ts"), "const a = 1;\r\nconst b = 2;\r\n");
  const r = filePatch(root, [{ path: "w.ts", old_string: "const a = 1;\nconst b = 2;", new_string: "const a = 1;\nconst b = 3;" }]);
  assert.equal(
    readFileSync(join(root, "w.ts"), "utf8"),
    "const a = 1;\r\nconst b = 3;\r\n",
    "applied in the FILE's endings — CRLF stays CRLF",
  );
  assert.ok(
    (r.corrected ?? []).some((c) => c.includes("CRLF")),
    "the correction is named on the result",
  );
  rmSync(root, { recursive: true, force: true });
});

// ONE STRAY CRLF IN AN LF FILE collapsed the range verb's line count to 2,
// and the refusal described a file that does not exist. Lines are counted
// the way the reader numbers them, whatever each line's ending.
test("a mixed-endings file takes a range op at the reader's own line numbers", () => {
  const root = fresh();
  writeFileSync(join(root, "m.ts"), "one\ntwo\nthree\r\n");
  const read = fileRead(root, "m.ts");
  assert.equal(read.total_lines, 4, "the reader counts by newline alone");
  const r = filePatch(root, [{ path: "m.ts", at: { from_line: 3, to_line: 3 }, new_string: "THREE", base_hash: read.hash }]);
  assert.equal(readFileSync(join(root, "m.ts"), "utf8"), "one\ntwo\nTHREE\r\n", "the replaced line keeps its own ending");
  assert.ok(
    (r.corrected ?? []).some((c) => c.includes("mixes CRLF and LF")),
    "the mix is announced",
  );
  rmSync(root, { recursive: true, force: true });
});

// A BYTE-ORDER MARK IS AN ENCODING FACT, NOT CONTENT. It is invisible in
// every read, so a first-line old_string differs in nothing a model can see.
test("a BOM file matches BOM-free, keeps its mark, and says so", () => {
  const root = fresh();
  writeFileSync(join(root, "b.ts"), "﻿alpha\nbeta\n");
  const r = filePatch(root, [{ path: "b.ts", old_string: "alpha", new_string: "ALPHA" }]);
  assert.equal(readFileSync(join(root, "b.ts"), "utf8"), "﻿ALPHA\nbeta\n", "the mark survives at the front");
  assert.ok(
    (r.corrected ?? []).some((c) => c.includes("byte-order mark")),
    "the mark is announced",
  );
  rmSync(root, { recursive: true, force: true });
});

test("an old_string that carries the copied BOM still matches, and the mark is not doubled", () => {
  const root = fresh();
  writeFileSync(join(root, "b.ts"), "﻿alpha\nbeta\n");
  filePatch(root, [{ path: "b.ts", old_string: "﻿alpha", new_string: "ALPHA" }]);
  assert.equal(readFileSync(join(root, "b.ts"), "utf8"), "﻿ALPHA\nbeta\n");
  rmSync(root, { recursive: true, force: true });
});

test("a prepend on a BOM file lands after the mark, never mid-file", () => {
  const root = fresh();
  writeFileSync(join(root, "b.ts"), "﻿alpha\n");
  filePatch(root, [{ path: "b.ts", prepend: true, new_string: "top" }]);
  assert.equal(readFileSync(join(root, "b.ts"), "utf8"), "﻿top\nalpha\n", "the mark stays the first byte");
  rmSync(root, { recursive: true, force: true });
});

test("a real whitespace difference still refuses — indentation is a difference, not an encoding", () => {
  const root = fresh();
  writeFileSync(join(root, "w.ts"), "    indented\n");
  assert.throws(
    () => filePatch(root, [{ path: "w.ts", old_string: "\tindented", new_string: "x" }]),
    (e: unknown) => e instanceof Rejection && e.clause === "SE-C-105" && e.got.includes("collapsed"),
  );
  rmSync(root, { recursive: true, force: true });
});

test("an op that mixes verbs refuses by name — nothing guesses", () => {
  const root = fresh();
  writeFileSync(join(root, "a.md"), "x\n");
  assert.throws(
    () => filePatch(root, [{ path: "a.md", old_string: "x", new_string: "y", append: true }]),
    (e: unknown) => e instanceof Rejection && e.clause === "SE-C-046" && e.got.includes("mixes"),
  );
  rmSync(root, { recursive: true, force: true });
});

// ── the search options ─────────────────────────────────────────────────────

// EVERY HIT USED TO COST A SECOND CALL: the tool's own description said
// "read around a hit with se_file_read". 1,051 searches, and the follow-up
// read was the two-call pattern the lane itself taught.
test("context rides the hit, marked so a neighbour is never mistaken for a match", () => {
  const root = fresh();
  writeFileSync(join(root, "a.ts"), "before\nneedle here\nafter\n");
  const r = search(root, "needle", { context: 1 });
  const hit = r.matches.find((m) => m.context === undefined);
  const around = r.matches.filter((m) => m.context === true);
  assert.ok(hit !== undefined && hit.line === 2);
  assert.deepEqual(around.map((m) => m.line).sort(), [1, 3], "one line each side, both marked context");
  rmSync(root, { recursive: true, force: true });
});

// THE COMMONEST SHELL SEARCH SHAPE was Get-ChildItem -Include *.ts piped to
// Select-String — a file filter the lane simply did not have.
test("include filters by filename inside the search call", () => {
  const root = fresh();
  writeFileSync(join(root, "a.ts"), "marker\n");
  writeFileSync(join(root, "a.md"), "marker\n");
  const r = search(root, "marker", { include: "**/*.ts" });
  assert.deepEqual(
    r.matches.map((m) => m.path),
    ["a.ts"],
  );
  rmSync(root, { recursive: true, force: true });
});

test("count_only answers 'how many, where' without a single match line", () => {
  const root = fresh();
  writeFileSync(join(root, "a.ts"), "x\nx\nx\n");
  writeFileSync(join(root, "b.ts"), "x\n");
  const r = search(root, "x", { count_only: true });
  assert.equal(r.total, 4);
  assert.deepEqual(r.counts, [
    { path: "a.ts", count: 3 },
    { path: "b.ts", count: 1 },
  ]);
  assert.equal(r.matches.length, 0);
  rmSync(root, { recursive: true, force: true });
});

// ── the ladder ─────────────────────────────────────────────────────────────

// THE CLASSIFIER IS A TABLE, NOT A MODEL. A rule fired or it did not.
test("the classifier names the lane tool for each harvested shell shape", () => {
  assert.equal(classifyCommand("Select-String -Pattern 'survey' -Path a.ts")?.tool, "se_file_search");
  assert.equal(classifyCommand("Get-Content project/engine/toll.ts")?.tool, "se_file_read");
  assert.equal(classifyCommand("Add-Content -Path .se/HANDOVER.md -Value 'x'")?.tool, "se_file_patch");
  assert.equal(classifyCommand("$x -replace 'a','b' | Set-Content out.md")?.tool, "se_file_patch");
  assert.equal(classifyCommand("npm test")?.tool, "se_test");
  assert.equal(classifyCommand("git status --porcelain")?.tool, "se_git");
  assert.equal(classifyCommand("node engine/bin/render-decisions.ts"), undefined, "a plain node run is se_run's own job");
  assert.equal(classifyCommand("npm install --no-audit"), undefined);
});

test("first offence runs WITH a warning; the second refuses with the lane call as remedy", () => {
  const se = fresh();
  const cmd = "Select-String -Pattern 'x' -Path a.ts";
  const w = laneVerdict(se, cmd);
  assert.ok(w !== undefined && w.lane_tool === "se_file_search", "the first run carries the teaching");
  assert.throws(
    () => laneVerdict(se, cmd),
    (e: unknown) => e instanceof Rejection && e.clause === "SE-C-129" && e.remedy.tool === "se_file_search",
    "the grace is one run, then the category refuses",
  );
  rmSync(se, { recursive: true, force: true });
});

test("the grace is PER CATEGORY and persists on disk — no per-session amnesia", () => {
  const se = fresh();
  laneVerdict(se, "Select-String -Pattern 'x' a.ts");
  const w = laneVerdict(se, "Get-Content a.ts");
  assert.ok(w !== undefined && w.category === "file reads", "a different category still has its own grace");
  const state = JSON.parse(readFileSync(join(se, "discipline.json"), "utf8")) as { counts: Record<string, number> };
  assert.equal(state.counts["text searches"], 1);
  assert.equal(state.counts["file reads"], 1);
  rmSync(se, { recursive: true, force: true });
});

// THE VALVE. A mechanical classifier will sometimes be wrong, and a false
// positive with no exit teaches obfuscation, not discipline. no_tool_reason
// runs the command once and files the reason — the gap documents itself.
test("no_tool_reason runs a blocked category once and files the reason as evidence", () => {
  const se = fresh();
  const cmd = "Select-String -Pattern 'x' a.ts";
  laneVerdict(se, cmd); // grace spent
  const w = laneVerdict(se, cmd, "needs -Context 40, beyond the lane's cap");
  assert.ok(w?.note.includes("logged"), "the valve run still carries the lane's answer");
  const state = JSON.parse(readFileSync(join(se, "discipline.json"), "utf8")) as { reasons: { category: string; reason: string }[] };
  assert.equal(state.reasons.length, 1);
  assert.ok(state.reasons[0].reason.includes("-Context 40"));
  assert.throws(() => laneVerdict(se, cmd), "the valve is per-call, never a standing exemption");
  rmSync(se, { recursive: true, force: true });
});

test("a clean command passes without a mark", () => {
  const se = fresh();
  assert.equal(laneVerdict(se, "node engine/bin/render-decisions.ts --root ."), undefined);
  rmSync(se, { recursive: true, force: true });
});

// ── the test gate ──────────────────────────────────────────────────────────

function gitRoot(): string {
  const root = fresh();
  const g = (...a: string[]): void => {
    const r = spawnSync("git", a, { cwd: root, encoding: "utf8" });
    assert.equal(r.status, 0, `git ${a.join(" ")}: ${r.stderr}`);
  };
  g("init", "-q");
  g("config", "user.email", "t@t");
  g("config", "user.name", "t");
  writeFileSync(join(root, "a.ts"), "one\n");
  g("add", "-A");
  g("commit", "-qm", "seed");
  return root;
}

// THE UNCHANGED GATE IS DELETED, WITH SE-C-130 AND SE-C-131 (owner ruling
// 2026-08-16). `testGate` refused a re-run over an identical tree and
// `scopedGate` refused the wrong scope; the engine decides the scope now, and
// an unchanged tree is an ANSWER rather than a refusal — `decideScope` returns
// scope "nothing" and says which verdict still stands.
//
// THE CASES WENT WITH THE CODE. They were the only callers left: nothing in
// the lane reached testGate, so its refusal could never be seen by anybody, and
// a clause nobody can reach is one this iteration exists to remove.
//
// WHAT REPLACED THEM sits below, driving decideScope directly.
test("an unchanged tree is answered rather than refused", () => {
  const root = gitRoot();
  const se = join(root, ".se");
  testRecord(se, root, true);
  const d = decideScope(se, root, false);
  assert.equal(d.scope, "nothing", `nothing moved, so nothing runs: ${JSON.stringify(d)}`);
  assert.match(d.why, /still stands/, "and the standing verdict is quoted back");
  rmSync(root, { recursive: true, force: true });
});

test("outside a git repo the engine cannot scope, so it runs everything", () => {
  const root = fresh();
  const se = join(root, ".se");
  testRecord(se, root, true);
  const d = decideScope(se, root, false);
  assert.equal(d.scope, "battery", `git cannot say what changed: ${JSON.stringify(d)}`);
  assert.equal(testFingerprint(root), "");
  rmSync(root, { recursive: true, force: true });
});

// The fingerprint must move when a DIRTY file changes between runs — HEAD
// alone would call two different working trees "the same tree".
test("the fingerprint tracks dirty content, not just HEAD", () => {
  const root = gitRoot();
  writeFileSync(join(root, "a.ts"), "dirty-one\n");
  const fp1 = testFingerprint(root);
  writeFileSync(join(root, "b.ts"), "untracked\n");
  const fp2 = testFingerprint(root);
  assert.notEqual(fp1, fp2, "an appearing untracked file is a change");
  rmSync(root, { recursive: true, force: true });
});

// The corrected field must survive the whole batch path — a correction in op
// 1 is not erased by a clean op 2 (regression guard for the plumbing).
test("corrections from mixed batches all arrive on one result", () => {
  const root = fresh();
  writeFileSync(join(root, "w.md"), "alpha\r\nbeta\r\n");
  writeFileSync(join(root, "x.md"), "gamma\n");
  const r = filePatch(root, [
    { path: "w.md", old_string: "alpha\nbeta", new_string: "alpha\nBETA" },
    { path: "x.md", old_string: "gamma", new_string: "GAMMA" },
  ]);
  assert.equal(r.applied.length, 2);
  assert.equal((r.corrected ?? []).length, 1);
  assert.equal(contentHash(readFileSync(join(root, "w.md"), "utf8")), r.applied[0].hash);
  rmSync(root, { recursive: true, force: true });
});

// ── the scope decision ─────────────────────────────────────────────────────
// THE ENGINE DECIDES WHAT GETS TESTED, AND THE AGENT NEVER DOES (owner ruling
// 2026-08-16). These cases used to drive two REFUSALS — one pushing toward the
// battery, one pushing away from it — and on 2026-08-16 the two closed on each
// other and left no legal test call at all.
//
// THERE IS ONE DECIDER NOW. Every case below asks what it chose and why.
import { decideScope, flipThreshold, mapChangedToTests, parseTap, suiteFiles } from "../engine/discipline.ts";

function productRoot(): string {
  // A root that LOOKS like the product: engine modules and their tests.
  const root = gitRoot();
  mkdirSync(join(root, "project", "deliverable", "engine"), { recursive: true });
  mkdirSync(join(root, "project", "deliverable", "tests"), { recursive: true });
  for (const m of ["pull", "files", "search"]) {
    writeFileSync(join(root, "project", "deliverable", "engine", `${m}.ts`), `// ${m}\n`);
    writeFileSync(join(root, "project", "deliverable", "tests", `${m}.test.ts`), `// ${m} test\n`);
  }
  const g = (...a: string[]): void => {
    spawnSync("git", a, { cwd: root });
  };
  g("add", "-A");
  g("commit", "-qm", "project");
  return root;
}

// THE DECISION NAMES THE FILES, COMPUTED FROM THE DIFF. It does not ask the
// caller which tests answer the change — it works that out.
test("a change that maps to a test file is answered by that file, and the decision says so", () => {
  const root = productRoot();
  const se = join(root, ".se");
  testRecord(se, root, true); // a green battery stands
  writeFileSync(join(root, "project", "deliverable", "engine", "pull.ts"), "// changed\n");
  const d = decideScope(se, root, false);
  assert.equal(d.scope, "scoped");
  assert.deepEqual(d.files, ["project/deliverable/tests/pull.test.ts"], "the engine picked the file, not the caller");
  assert.match(d.why, /map/, "and it says why in one line");
  rmSync(root, { recursive: true, force: true });
});

test("an unmapped change buys the battery — no scoped run answers for it", () => {
  const root = productRoot();
  const se = join(root, ".se");
  testRecord(se, root, true);
  writeFileSync(join(root, "project", "deliverable", "engine", "render.ts"), "// no test file exists for render\n");
  const d = decideScope(se, root, false);
  assert.equal(d.scope, "battery");
  assert.match(d.why, /no test that answers/, "the reason names the gap rather than a threshold");
  rmSync(root, { recursive: true, force: true });
});

test("with no battery memory the battery runs — a first run has no baseline to scope against", () => {
  const root = productRoot();
  const d = decideScope(join(root, ".se"), root, false);
  assert.equal(d.scope, "battery");
  rmSync(root, { recursive: true, force: true });
});

test("a RED battery re-runs whole — a standing failure is never scoped around", () => {
  const root = productRoot();
  const se = join(root, ".se");
  testRecord(se, root, false);
  writeFileSync(join(root, "project", "deliverable", "engine", "pull.ts"), "// changed\n");
  const d = decideScope(se, root, false);
  assert.equal(d.scope, "battery");
  assert.match(d.why, /RED/);
  rmSync(root, { recursive: true, force: true });
});

// NOTHING IS AN ANSWER. An unchanged tree keeps its last verdict, and saying
// so beats refusing: the caller learns the same thing and the walk does not
// stop.
test("an unchanged tree answers nothing, and says the verdict still stands", () => {
  const root = productRoot();
  const se = join(root, ".se");
  testRecord(se, root, true);
  const d = decideScope(se, root, false);
  assert.equal(d.scope, "nothing");
  assert.match(d.why, /still stands/);
  rmSync(root, { recursive: true, force: true });
});

// THE FLIP IS NOW A REASON, NOT A REFUSAL. Past a third of the suite
// piecemeal, running it one file at a time stops being cheaper than running
// it — so the engine simply runs it.
test("piecemeal past the flip becomes the battery, and the reason says the count", () => {
  const root = productRoot();
  const se = join(root, ".se");
  testRecord(se, root, true);
  const threshold = flipThreshold(root);
  for (let i = 0; i < threshold; i++) {
    testRecord(se, root, true, `scope-${i}`, [`project/deliverable/tests/f${i}.test.ts`]);
  }
  writeFileSync(join(root, "project", "deliverable", "engine", "pull.ts"), "// changed\n");
  const d = decideScope(se, root, false);
  assert.equal(d.scope, "battery", "the odometer decides the battery rather than refusing the scoped run");
  assert.match(d.why, new RegExp(String(threshold)), "and the reason carries the number");
  rmSync(root, { recursive: true, force: true });
});

test("force is a flake hunt and runs everything, whatever the diff says", () => {
  const root = productRoot();
  const se = join(root, ".se");
  testRecord(se, root, true);
  writeFileSync(join(root, "project", "deliverable", "engine", "pull.ts"), "// changed\n");
  const d = decideScope(se, root, true);
  assert.equal(d.scope, "battery");
  assert.match(d.why, /flake/);
  rmSync(root, { recursive: true, force: true });
});

// The map: a test file answers for itself; an engine module for its named
// test; anything else is honest about having no scoped answer.
test("the change-to-test map is by name and refuses to guess", () => {
  const root = productRoot();
  const r = mapChangedToTests(root, ["project/deliverable/engine/pull.ts", "project/deliverable/tests/files.test.ts", anyGuidanceDoc()]);
  assert.deepEqual(r.mapped, ["project/deliverable/tests/files.test.ts", "project/deliverable/tests/pull.test.ts"]);
  assert.deepEqual(r.unmapped, [anyGuidanceDoc()]);
  assert.equal(suiteFiles(root).length, 3);
  rmSync(root, { recursive: true, force: true });
});

// TAP, structured: counts plus ONLY the failures' detail — the slice every
// temp-file grep was after. Subtests report through their parent.
test("parseTap keeps the counts and only the failures' detail", () => {
  const tap = [
    "TAP version 13",
    "ok 1 - the first law holds",
    "not ok 2 - the second law breaks",
    "  ---",
    "  duration_ms: 4.2",
    "  error: 'expected 1, got 2'",
    "  code: 'ERR_ASSERTION'",
    "  ...",
    "ok 3 - the third law holds",
    "# tests 3",
    "# pass 2",
    "# fail 1",
  ].join("\n");
  const r = parseTap(tap);
  assert.deepEqual({ total: r.total, pass: r.pass, fail: r.fail }, { total: 3, pass: 2, fail: 1 });
  assert.equal(r.failures.length, 1);
  assert.equal(r.failures[0].name, "the second law breaks");
  assert.ok(r.failures[0].detail.includes("expected 1, got 2"));
});

import { streakNudge } from "../engine/discipline.ts";
// ── waiting, and the streak ────────────────────────────────────────────────
// A sleeping shell blocks the lane without learning anything. Jobs expose
// immediate status to callers and a completion promise inside the engine.
import { jobDone, runBackground } from "../engine/run.ts";

test("the sleep classifies as a lane job pointing at status polling", () => {
  assert.equal(classifyCommand("Start-Sleep -Seconds 100; Write-Output ok")?.category, "waiting");
  assert.equal(classifyCommand("sleep 5 && echo done")?.category, "waiting");
  assert.equal(classifyCommand("node --test x.test.ts")?.category, "tests", "tests still classify first");
});

test("jobDone follows the process completion callback", async () => {
  const root = fresh();
  const command = process.platform === "win32" ? "Write-Output done" : "printf done";
  const job = runBackground(root, command, {});
  const result = await jobDone(job.job);
  assert.equal(result.running, false);
  assert.equal(result.exit, 0);
  appendFileSync(join(root, ".se", "jobs", `${job.job}.jsonl`), '{"id":', "utf8");
  const moduleUrl = new URL("../engine/run.ts", import.meta.url).href;
  const probe = spawnSync(
    process.execPath,
    [
      "--input-type=module",
      "--eval",
      `import { jobList, jobStatus } from ${JSON.stringify(moduleUrl)}; const status = jobStatus(process.argv[1], process.argv[2]); const listed = jobList(process.argv[2]).find((item) => item.job === process.argv[1]); process.stdout.write(JSON.stringify({ status, listed }));`,
      job.job,
      root,
    ],
    { encoding: "utf8" },
  );
  assert.equal(probe.status, 0, probe.stderr);
  const recovered = JSON.parse(probe.stdout) as {
    status: { running: boolean; exit: number | null; stdout: string };
    listed: { job: string; exit: number | null };
  };
  assert.equal(recovered.status.running, false);
  assert.equal(recovered.status.exit, 0);
  assert.equal(recovered.status.stdout.trim(), "done");
  assert.equal(recovered.listed.job, job.job);
  assert.equal(recovered.listed.exit, 0);
  rmSync(root, { recursive: true, force: true });
});

test("the streak counts consecutive greens per scope and a red resets it", () => {
  const root = gitRoot();
  const se = join(root, ".se");
  assert.equal(testRecord(se, root, true, "s1", ["f1"]), 1);
  writeFileSync(join(root, "a.ts"), "two\n");
  assert.equal(testRecord(se, root, true, "s1", ["f1"]), 2);
  writeFileSync(join(root, "a.ts"), "three\n");
  assert.equal(testRecord(se, root, true, "s1", ["f1"]), 3);
  assert.ok(streakNudge(3) !== undefined && (streakNudge(3) as string).includes("95%"), "the nudge carries the owner's law");
  assert.equal(streakNudge(2), undefined, "below the bar, silence");
  writeFileSync(join(root, "a.ts"), "four\n");
  assert.equal(testRecord(se, root, false, "s1", ["f1"]), 0, "a red resets");
  writeFileSync(join(root, "a.ts"), "five\n");
  assert.equal(testRecord(se, root, true, "s1", ["f1"]), 1);
  rmSync(root, { recursive: true, force: true });
});

// ── the cut law ────────────────────────────────────────────────────────────
// CUT THE MIDDLE, NEVER THE END (owner law 2026-08-02). Incident: a
// head-only cap turned "(425.501917ms)" into "(425.501", the unit died with
// the tail, and milliseconds were diagnosed as seconds — three documents
// carried the wrong number before the owner caught it. The end of an output
// is where verdicts live: exit codes, totals, closing units.
import { capMiddle } from "../engine/jsonio.ts";

test("capMiddle keeps both ends — the tail's unit survives any cap", () => {
  const out = `${"x".repeat(9000)} tests 425 pass 424 fail 1 duration (425.501917ms)`;
  const capped = capMiddle(out, 1000);
  assert.ok(capped.length < 1300, "capped near the budget");
  assert.ok(capped.includes("(425.501917ms)"), "the END survives — the unit cannot be eaten");
  assert.ok(capped.includes("chars cut"), "the cut names itself");
  assert.equal(capMiddle("short", 1000), "short", "under budget passes untouched");
});

test("capMiddle backs off to whitespace — no token is ever split", () => {
  const words = Array.from({ length: 800 }, (_, i) => `word${i}`).join(" ");
  const capped = capMiddle(words, 500);
  const head = capped.split("\n")[0];
  assert.ok(/word\d+$/.test(head.trim()), `the head ends on a whole token: …${head.slice(-20)}`);
});

test("the full battery formats before preflight and stops on format failure", () => {
  const src = laneSource();
  const battery = src.slice(src.indexOf("const runBattery"), src.indexOf("const work ="));
  const formatAt = battery.indexOf('spawnNode([BIOME_BIN, "check", "--write", "--error-on-warnings", "."]');
  const preflightAt = battery.indexOf('"project/deliverable/engine/bin/preflight.ts"');
  const failureAt = battery.indexOf("if (format.status !== 0)");
  const returnAt = battery.indexOf("return { ok: false, results }", failureAt);
  assert.ok(formatAt >= 0, "the battery runs Biome safe writes");
  assert.ok(formatAt < preflightAt, "formatting precedes preflight and selftest");
  assert.ok(failureAt > formatAt && returnAt > failureAt && returnAt < preflightAt, "a format failure stops the battery");
  assert.equal((battery.match(/BIOME_BIN/g) ?? []).length, 1, "formatting runs once per full battery");
});
