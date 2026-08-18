// see dsp-lane-door.md#the-discipline-lane
import { spawnSync } from "node:child_process";
import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { CLAUSES, Rejection } from "./errors.ts";
import { contentHash } from "./hash.ts";
import { capMiddle } from "./jsonio.ts";

const SRC = "engine/discipline.ts";

export interface LaneRule {
  id: string;
  category: string;
  /** The lane tool that does this job. */
  tool: string;
  /** One line: how the lane covers it. Rides warnings, refusals, and the se_run description. */
  hint: string;
  /** Warned runs allowed before the category refuses. */
  threshold: number;
  rx: RegExp;
}

// Order is precedence: first match names the category. Tests before search,
// because a test invocation often greps its own output; edit before write,
// because -replace next to Set-Content is an EDIT that deserves the sharper
// hint. Patterns cover both shells se_run spawns (PowerShell and bash).
export const LANE_RULES: LaneRule[] = [
  {
    id: "run-tests",
    category: "tests",
    tool: "se_test",
    hint: "se_test runs SCOPED ({files: ['pull'], name_pattern?}) with structured counts and only the failures' detail — no temp file, no grep; no arguments is the battery, which must be earned",
    threshold: 1,
    rx: /\b(npm|npx)\s+(run\s+)?test\b|\bnode\s+(-[^\s]+\s+)*--test\b|selftest\.ts|preflight\.ts|smoketest\.ts/i,
  },
  {
    id: "run-edit",
    category: "file edits",
    tool: "se_file_patch",
    hint: "se_file_patch does regex substitution now: {pattern, replacement, flags?, expect_count?} — atomic, CAS-guarded, and it reports the replacement count",
    threshold: 1,
    rx: /\s-replace\s|\bsed\s+(-\S+\s+)*-i\b|\bperl\s+(-\S+\s+)*-[a-z]*i[a-z]*\b/i,
  },
  {
    id: "run-write",
    category: "file writes",
    tool: "se_file_patch",
    hint: "appends and prepends are se_file_patch ops now ({append: true, new_string}); whole files are se_file_write — both CAS-guarded, both logged as WHAT changed, not just what ran",
    threshold: 1,
    rx: /\bset-content\b|\badd-content\b|\bout-file\b|\[io\.file\]::write\w*|\btee\s|>{1,2}\s*["']?[\w.$@{}~-]*[\w-]\.(md|ts|tsx|js|mjs|cjs|json|jsonl|canvas|css|html|ps1|txt|ya?ml)\b/i,
  },
  {
    id: "run-search",
    category: "text searches",
    tool: "se_file_search",
    hint: "se_file_search takes context: N (lines around each hit), include: '**/*.ts' (the Get-ChildItem pipe, in one call) and count_only: true",
    threshold: 1,
    rx: /\bselect-string\b|(^|[;|&(\s])rg(\.exe)?\s|(^|[;|&(\s])e?grep\s/i,
  },
  {
    id: "run-read",
    category: "file reads",
    tool: "se_file_read",
    hint: "se_file_read pages any file with offset/limit and returns the CAS hash later writes will demand — a shell read proves nothing to the walk",
    threshold: 1,
    rx: /\bget-content\b|(^|[;|&(\s])cat\s|(^|[;|&(\s])head\s|(^|[;|&(\s])tail\s|\bsed\s+-n\b/i,
  },
  {
    id: "run-list",
    category: "listing and stat",
    tool: "se_file_list",
    hint: "se_file_list lists a directory; se_file_glob finds files by pattern (se_file_read {optional: true} answers does-it-exist)",
    threshold: 1,
    rx: /\bget-childitem\b|\btest-path\b|(^|[;|&(\s])ls\s|(^|[;|&(\s])find\s+\S+\s+-(name|type)\b/i,
  },
  {
    id: "run-wait",
    category: "waiting",
    tool: "se_run",
    hint: "se_run {job} reads current status immediately. Poll that state when needed. A sleeping shell blocks the lane and learns nothing",
    threshold: 1,
    rx: /\bstart-sleep\b|(^|[;|&(\s])sleep\s+\d/i,
  },
  {
    id: "run-git",
    category: "git",
    tool: "se_git",
    hint: "se_git runs the allowlisted set in the right tree (the one tree) — shell git silently works on whatever the cwd happens to be",
    threshold: 1,
    rx: /(^|[;|&(\s])git(\.exe)?\s/i,
  },
];

/** The generated feed-forward line for se_run's description — same table, so
 *  the description can never promise something the classifier won't enforce. */
export function laneSummary(): string {
  return LANE_RULES.map((r) => `${r.category} → ${r.tool}`).join("; ");
}

export function classifyCommand(command: string): LaneRule | undefined {
  return LANE_RULES.find((r) => r.rx.test(command));
}

// ── ladder state ───────────────────────────────────────────────────────────
// Counts persist in .se — the machine gets stricter ACROSS sessions, never
// amnesiac per session. Reasons pile up next to them for the retro.
interface DisciplineState {
  counts: Record<string, number>;
  reasons: { ts: string; category: string; reason: string; command: string }[];
}

function statePath(seDir: string): string {
  return join(seDir, "discipline.json");
}

function loadState(seDir: string): DisciplineState {
  try {
    const raw = JSON.parse(readFileSync(statePath(seDir), "utf8")) as Partial<DisciplineState>;
    return { counts: raw.counts ?? {}, reasons: raw.reasons ?? [] };
  } catch {
    return { counts: {}, reasons: [] };
  }
}

function saveState(seDir: string, s: DisciplineState): void {
  mkdirSync(seDir, { recursive: true });
  writeFileSync(statePath(seDir), JSON.stringify(s, null, 1), "utf8");
}

export interface LaneWarning {
  rule: string;
  category: string;
  lane_tool: string;
  note: string;
}

/** The verdict for one command. Returns undefined (clean) or a warning to
 *  ride the result; THROWS the refusal once the category's grace is spent.
 *  Entirely mechanical — a rule fired or it did not, a counter stands where
 *  it stands. */
export function laneVerdict(seDir: string, command: string, noToolReason?: string): LaneWarning | undefined {
  const rule = classifyCommand(command);
  if (rule === undefined) return undefined;
  const state = loadState(seDir);
  if (noToolReason !== undefined && noToolReason.trim() !== "") {
    // The valve. The run happens, the reason is EVIDENCE — filed for the
    // retro, not counted against the grace. Abuse is visible in the same file.
    state.reasons.push({
      ts: new Date().toISOString(),
      category: rule.category,
      reason: noToolReason.trim(),
      command: command.slice(0, 200),
    });
    saveState(seDir, state);
    return {
      rule: rule.id,
      category: rule.category,
      lane_tool: rule.tool,
      note: `ran under no_tool_reason — the reason is logged for the retro. The lane's answer to this category: ${rule.hint}`,
    };
  }
  const used = state.counts[rule.category] ?? 0;
  if (used >= rule.threshold) {
    throw new Rejection({
      clause: CLAUSES.RUN_LANE_JOB,
      expected: `${rule.tool} for ${rule.category} — the lane covers this`,
      got: `a shell command doing a lane tool's job (rule ${rule.id}; this category's ${rule.threshold} warned run${rule.threshold === 1 ? "" : "s"} spent)`,
      remedy: {
        tool: rule.tool,
        args: {},
        note: `${rule.hint}. If the lane truly cannot do this one, resend with no_tool_reason: "<why>" — it runs once and the reason is logged.`,
      },
      source: SRC,
    });
  }
  state.counts[rule.category] = used + 1;
  saveState(seDir, state);
  return {
    rule: rule.id,
    category: rule.category,
    lane_tool: rule.tool,
    note: `RAN, this time. This is a lane job: ${rule.hint}. The next ${rule.category} command through se_run refuses (${CLAUSES.RUN_LANE_JOB}).`,
  };
}

// ── the test gate ──────────────────────────────────────────────────────────
// A RE-RUN OVER AN UNCHANGED TREE PROVES NOTHING NEW. Measured: se_test held
// 5,706 seconds of one build's wall clock, and a share of those runs asked a
// question the previous run had already answered. The fingerprint is HEAD
// plus the dirty list plus each dirty file's size and mtime — cheap, and it
// moves the moment any tracked thing does.
export function testFingerprint(root: string): string {
  const head = spawnSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" });
  const status = spawnSync("git", ["status", "--porcelain"], { cwd: root, encoding: "utf8" });
  if (head.status !== 0 || status.status !== 0) return ""; // no repo — the gate stands aside
  const parts = [head.stdout.trim()];
  for (const line of status.stdout.split("\n")) {
    if (line.trim() === "") continue;
    // SESSION STATE IS NOT THE TREE UNDER TEST. .se moves on every call —
    // the call log grows with the very se_test invocation being judged — so
    // counting it would mean no two moments ever fingerprint alike and the
    // gate never fires.
    const rel = line.slice(3).replace(/^"|"$/g, "");
    if (rel.startsWith(".se")) continue;
    parts.push(line);
    try {
      const s = statSync(join(root, rel));
      parts.push(`${s.size}:${s.mtimeMs}`);
    } catch {
      parts.push("gone");
    }
  }
  // THE SEPARATOR STAYS AN ESCAPE. Written raw it costs this whole file its
  // searchability, and the re-cut patch carried the raw byte back in.
  return contentHash(parts.join("\0"));
}

/** The battery's question is FIXED, and that is why the no-argument call
 *  needs no argument. It asks one thing and always the same thing. A scoped
 *  run is the opposite: only the caller knows what it wanted to learn, so
 *  the lane makes them say it. */
export const BATTERY_QUESTION = "does the whole tree still stand?";

interface ScopeVerdict {
  fingerprint: string;
  ok: boolean;
  ts: string;
  /** Consecutive green runs of this scope, this one included. The nudge
   *  rides the result: a long streak means the caller keeps re-proving the
   *  proven — test on change, not on anxiety (owner ruling 2026-08-02). */
  streak?: number;
  /** WHAT THIS RUN WAS ASKED (req-test-run-carries-its-question). The scope
   *  says which tests ran; only the question says why. Without it a later
   *  reader cannot tell a real question from a reassurance run, and those
   *  are exactly what the discipline exists to separate. */
  question?: string;
}

interface TestState {
  /** The full battery's last verdict, with the HEAD it judged. */
  battery?: ScopeVerdict & { head?: string };
  /** Scoped runs, keyed by their scope (sorted files + name pattern). */
  scoped?: Record<string, ScopeVerdict>;
  /** DISTINCT test files run scoped since the last battery — the piecemeal
   *  odometer. When it crosses the flip threshold, the battery becomes the
   *  sanctioned, cheaper call and scoped runs refuse toward it. */
  scoped_since_battery?: string[];
}

function testStatePath(seDir: string): string {
  return join(seDir, "test-state.json");
}

function loadTestState(seDir: string): TestState {
  try {
    const raw = JSON.parse(readFileSync(testStatePath(seDir), "utf8")) as TestState & ScopeVerdict;
    // The first cut stored a bare {fingerprint, ok, ts} — that was the battery.
    if (raw.battery === undefined && raw.scoped === undefined && typeof raw.fingerprint === "string") {
      return { battery: { fingerprint: raw.fingerprint, ok: raw.ok, ts: raw.ts } };
    }
    return raw;
  } catch {
    return {};
  }
}

function saveTestState(seDir: string, s: TestState): void {
  mkdirSync(seDir, { recursive: true });
  writeFileSync(testStatePath(seDir), JSON.stringify(s, null, 1), "utf8");
}

// see dsp-lane-door.md#testgate-is-deleted

export function testRecord(
  seDir: string,
  root: string,
  ok: boolean,
  scope = "battery",
  files: string[] = [],
  question = BATTERY_QUESTION,
): number {
  const fp = testFingerprint(root);
  if (fp === "") return 0;
  const state = loadTestState(seDir);
  const prior = scope === "battery" ? state.battery : state.scoped?.[scope];
  const streak = ok ? (prior?.ok === true ? (prior.streak ?? 1) + 1 : 1) : 0;
  const verdict: ScopeVerdict = {
    fingerprint: fp,
    ok,
    ts: new Date().toISOString(),
    ...(streak > 0 ? { streak } : {}),
    question,
  };
  if (scope === "battery") {
    const head = spawnSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" });
    state.battery = { ...verdict, ...(head.status === 0 ? { head: head.stdout.trim() } : {}) };
    // A battery covers everything — the piecemeal odometer resets.
    state.scoped_since_battery = [];
  } else {
    state.scoped = { ...(state.scoped ?? {}), [scope]: verdict };
    const seen = new Set(state.scoped_since_battery ?? []);
    for (const f of files) seen.add(f);
    state.scoped_since_battery = [...seen].sort();
  }
  saveTestState(seDir, state);
  return streak;
}

/** The nudge line a long streak earns, or undefined below the bar. */
export function streakNudge(streak: number): string | undefined {
  if (streak < 3) return undefined;
  return `${streak} green runs of this scope in a row. In ~95% of cases the change you just made broke nothing — run a test to answer a QUESTION (did THIS change break THAT), not to reassure. The unchanged-tree gate would have refused the truly redundant ones; the rest is judgment.`;
}

// see dsp-lane-door.md#the-scope-economy

/** Every test file the suite holds, root-relative. */
export function suiteFiles(root: string): string[] {
  const dir = join(root, "project", "deliverable", "tests");
  try {
    return readdirSync(dir)
      .filter((f) => f.endsWith(".test.ts"))
      .map((f) => `project/deliverable/tests/${f}`)
      .sort();
  } catch (e) {
    // ONLY a missing directory is an empty suite. This catch once swallowed
    // a ReferenceError and answered [], and an empty collection is the most
    // convincing lie a program can tell.
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw e;
  }
}

/** Piecemeal flip threshold: a third of the suite, floor 6. */
export function flipThreshold(root: string): number {
  return Math.max(6, Math.ceil(suiteFiles(root).length / 3));
}

/** What changed since the last green battery: committed since its HEAD plus
 *  everything dirty now. undefined when there is no battery memory or no git
 *  — in both cases the gates stand aside. */
export function changedSinceBattery(root: string, seDir: string): string[] | undefined {
  const state = loadTestState(seDir);
  const head = state.battery?.head;
  if (head === undefined) return undefined;
  const committed = spawnSync("git", ["diff", "--name-only", `${head}..HEAD`], { cwd: root, encoding: "utf8" });
  const status = spawnSync("git", ["status", "--porcelain"], { cwd: root, encoding: "utf8" });
  if (committed.status !== 0 || status.status !== 0) return undefined;
  const out = new Set<string>();
  for (const line of committed.stdout.split("\n")) {
    const rel = line.trim();
    if (rel !== "" && !rel.startsWith(".se")) out.add(rel);
  }
  for (const line of status.stdout.split("\n")) {
    if (line.trim() === "") continue;
    const rel = line.slice(3).replace(/^"|"$/g, "");
    if (!rel.startsWith(".se")) out.add(rel);
  }
  return [...out].sort();
}

/** The change-to-test map, by NAME — tests here are per-module (files.test.ts
 *  answers for files.ts). A test file maps to itself; an engine module maps
 *  to its test when one exists; anything else is UNMAPPED and buys the
 *  battery, because no scoped run answers for it. */
export function mapChangedToTests(root: string, changed: string[]): { mapped: string[]; unmapped: string[] } {
  const suite = new Set(suiteFiles(root));
  const mapped = new Set<string>();
  const unmapped: string[] = [];
  for (const rel of changed) {
    const p = rel.replace(/\\/g, "/");
    if (suite.has(p)) {
      mapped.add(p);
      continue;
    }
    const m = p.match(/^project\/deliverable\/engine\/([\w-]+)\.ts$/);
    const candidate = m !== null ? `project/deliverable/tests/${m[1]}.test.ts` : undefined;
    if (candidate !== undefined && suite.has(candidate)) mapped.add(candidate);
    else unmapped.push(p);
  }
  return { mapped: [...mapped].sort(), unmapped };
}

/** WHAT THE ENGINE DECIDED TO RUN, and why. */
export interface ScopeDecision {
  /** battery, a named set of test files, or nothing at all. */
  scope: "battery" | "scoped" | "nothing";
  /** The files a scoped run covers. Empty for battery and for nothing. */
  files: string[];
  /** One line the agent shows the reader. The engine's reasoning, not a hint. */
  why: string;
  /** see dsp-lane-door.md#whether-this-diff-wants-the-conformance-sweep-too */
  sweep: boolean;
}

/** A CORPUS DOCUMENT: markdown under the spec or the method. Code has tests
 *  that answer for it; these have the sweep and nothing else. */
function isDocument(rel: string): boolean {
  const p = rel.replace(/\\/g, "/");
  if (!p.endsWith(".md")) return false;
  return p.includes("project/spec/") || p.includes("/machines/") || p.includes("project/guidance/");
}

/** HALF THE DIFF OR MORE, and at least three of them. One document beside a
 *  code change is ordinary; a diff that is mostly prose is a different kind of
 *  change, and the battery is the wrong question to ask about it. */
function mostlyDocuments(changed: string[]): boolean {
  const docs = changed.filter(isDocument).length;
  return docs >= 3 && docs * 2 >= changed.length;
}

/** see dsp-lane-door.md#the-engine-decides-what-gets-tested */
export function decideScope(seDir: string, root: string, force: boolean): ScopeDecision {
  const state = loadTestState(seDir);
  const seen = state.scoped_since_battery ?? [];
  const threshold = flipThreshold(root);

  // A FLAKE HUNT IS THE ONE THING THE PERSON ASKS FOR DIRECTLY, and it is the
  // whole battery by definition — a flake is not known to live in one file.
  if (force) return { scope: "battery", files: [], why: "force: a flake hunt runs everything", sweep: true };

  // NO MEMORY, OR A STANDING RED. Neither leaves anything to be scoped against.
  if (state.battery === undefined) {
    return { scope: "battery", files: [], why: "no battery has run here yet, so there is no baseline to scope against", sweep: true };
  }
  if (state.battery.ok === false) {
    return {
      scope: "battery",
      files: [],
      why: "the last battery was RED — a standing failure is re-run whole until it is understood",
      sweep: true,
    };
  }

  const changed = changedSinceBattery(root, seDir);
  if (changed === undefined) {
    return { scope: "battery", files: [], why: "git cannot say what changed, so the safe answer is everything", sweep: true };
  }
  // THE DIFF ANSWERS ONE MORE QUESTION while it is open. Documents get the
  // sweep whatever the test scope turns out to be.
  const sweep = mostlyDocuments(changed);
  // NOTHING MOVED. The last verdict still stands, and re-running proves
  // nothing. This used to be SE-C-130's refusal; it is now an ANSWER.
  if (changed.length === 0) {
    return {
      scope: "nothing",
      files: [],
      why: `nothing has changed since the last battery, which was ${state.battery.ok ? "GREEN" : "RED"} at ${state.battery.ts} — that verdict still stands`,
      sweep: false,
    };
  }

  const { mapped, unmapped } = mapChangedToTests(root, changed);
  if (unmapped.length > 0) {
    return {
      scope: "battery",
      files: [],
      why: `${String(unmapped.length)} changed file(s) have no test that answers for them (${unmapped.slice(0, 3).join(", ")}${unmapped.length > 3 ? ", …" : ""}), so no scoped run covers this diff`,
      sweep,
    };
  }
  if (mapped.length === 0) {
    // A DIFF OF PURE DOCUMENTS LANDS HERE, and the battery is the wrong answer
    // to it. The sweep is the check that reads documents, so it rides along
    // and the `why` says which question was actually asked.
    return {
      scope: "battery",
      files: [],
      why: sweep
        ? "the diff is mostly DOCUMENTS and maps to no test file, so the sweep is the check that answers it — the battery runs behind it"
        : "the diff maps to no test file at all, so nothing narrower is possible",
      sweep,
    };
  }

  // THE FLIP. Running the suite one file at a time is never cheaper than
  // running the suite. This used to REFUSE toward the battery; it now simply
  // IS the battery, which is what it always meant.
  const wouldSee = new Set([...seen, ...mapped]);
  if (wouldSee.size >= threshold) {
    return {
      scope: "battery",
      files: [],
      why: `${String(wouldSee.size)} distinct files would have run piecemeal since the last battery (flip ${String(threshold)}) — the whole suite is now the cheaper call`,
      sweep,
    };
  }

  return {
    scope: "scoped",
    files: mapped,
    why: `${String(changed.length)} changed file(s) map to ${String(mapped.length)} test file(s), and every change is covered`,
    sweep,
  };
}

// ── TAP, structured ────────────────────────────────────────────────────────
// The temp-file workflow existed because a battery's output overflows the
// run cap and a failure's stack lives somewhere in the flood. A structured
// verdict carries the counts and ONLY the failures' detail — the slice the
// greps were always after.
/** TWO REDS LOOK IDENTICAL IN THE COUNTS, and only one of them is news (i6).
 *
 *  - `assertion` — the check ran, reached its expectation, and the expectation
 *    was unmet. That is the design not yet realized.
 *  - `crash` — the check threw before reaching any expectation. A missing
 *    import, a typo in a helper, a file that does not parse.
 *
 *  `# fail 4` is the same four either way, which is why observe-red used to
 *  pass on an instrument failure. The distinction was already on the wire and
 *  was being thrown away.
 *
 *  req-a-red-is-an-assertion-not-a-crash */
export type FailureKind = "assertion" | "crash";

export interface TapFailure {
  name: string;
  detail: string;
  kind: FailureKind;
}

export interface TapResult {
  total: number;
  pass: number;
  fail: number;
  failures: TapFailure[];
}

/** Node's TAP reporter writes a diagnostic block under each `not ok`, and an
 *  assertion failure carries `code: 'ERR_ASSERTION'` in it. Nothing new has to
 *  be measured. Quotes are optional here because reporters differ on them and
 *  the code itself is the signal. */
function failureKind(detail: string): FailureKind {
  return /^\s*code:\s*["']?ERR_ASSERTION["']?\s*$/m.test(detail) ? "assertion" : "crash";
}

export function parseTap(out: string): TapResult {
  const res: TapResult = { total: 0, pass: 0, fail: 0, failures: [] };
  const lines = out.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const counts = line.match(/^# (tests|pass|fail) (\d+)$/);
    if (counts !== null) {
      if (counts[1] === "tests") res.total = Number(counts[2]);
      if (counts[1] === "pass") res.pass = Number(counts[2]);
      if (counts[1] === "fail") res.fail = Number(counts[2]);
      continue;
    }
    // see dsp-lane-door.md#a-failure-inside-a-describe-block-is-still-a-failure
    const notOk = line.match(/^(\s*)not ok \d+ - (.*)$/);
    if (notOk === null) continue;
    if (res.failures.length >= 10) continue;
    const detail: string[] = [];
    for (let j = i + 1; j < lines.length && detail.length < 30; j++) {
      const l = lines[j];
      if (/^\s*(not )?ok \d+ - /.test(l) || /^\s*# /.test(l)) break;
      detail.push(l);
    }
    const body = detail.join("\n");
    // THE KIND IS READ BEFORE THE CAP. capMiddle drops the middle of a long
    // block, and the diagnostic keys sit exactly there.
    res.failures.push({ name: notOk[2], detail: capMiddle(body, 2000), kind: failureKind(body) });
  }
  // THE ROLL-UP IS DROPPED WHERE A LEAF SURVIVED IT. A parent saying "1 subtest
  // failed" is the shape of a report with the report removed, and it is only
  // worth printing when nothing more specific was captured.
  const leaves = res.failures.filter((f) => !/subtestsFailed|\d+ subtests? failed/.test(f.detail));
  if (leaves.length > 0) res.failures = leaves;
  return res;
}
