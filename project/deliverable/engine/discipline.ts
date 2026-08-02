// THE DISCIPLINE LANE — rule-based, no second model (owner ruling 2026-08-02).
//
// Harvested from 2,589 logged se_run calls: 46% were improvised text tools —
// Select-String standing in for the searcher, Get-Content for the reader,
// Set-/Add-Content for the writer — every one uninstrumented, un-CAS'd, and
// invisible to the guards the lane exists to provide. The lane now covers
// those jobs, so doing them through the shell stops being a gap and starts
// being a choice.
//
// The ladder: first classified run GOES THROUGH, carrying a named warning —
// that warning is the feed-forward for the second attempt. From then on the
// category refuses (SE-C-129), remedy naming the lane tool. The valve:
// no_tool_reason runs it once and LOGS THE REASON — when the classifier is
// wrong or a verb is truly missing, the agent documents the gap at the moment
// it hits it, and the reasons pile up where the retro reads. A frequent
// reason IS the next verb.
//
// ONE TABLE, THREE OUTPUTS. The rules below drive (a) the classifier, (b)
// the warning/refusal text, and (c) the se_run description (laneSummary) —
// feed-forward and feedback generated from the same source, so they cannot
// drift apart.
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
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
    hint: "se_run {job, wait_ms: N} BLOCKS on the job's own completion and returns the moment it exits — a sleeping shell holds the lane for the full N seconds and learns nothing",
    threshold: 1,
    rx: /\bstart-sleep\b|(^|[;|&(\s])sleep\s+\d/i,
  },
  {
    id: "run-git",
    category: "git",
    tool: "se_git",
    hint: "se_git runs the allowlisted set in the right tree (the bound worktree when one is open) — shell git silently works on whatever the cwd happens to be",
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
    state.reasons.push({ ts: new Date().toISOString(), category: rule.category, reason: noToolReason.trim(), command: command.slice(0, 200) });
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
    // gate never fires. Same for .worktrees: a sibling expedition's motion
    // is not a change to THIS tree.
    const rel = line.slice(3).replace(/^"|"$/g, "");
    if (rel.startsWith(".se") || rel.startsWith(".worktrees")) continue;
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

interface ScopeVerdict {
  fingerprint: string;
  ok: boolean;
  ts: string;
  /** Consecutive green runs of this scope, this one included. The nudge
   *  rides the result: a long streak means the caller keeps re-proving the
   *  proven — test on change, not on anxiety (owner ruling 2026-08-02). */
  streak?: number;
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

/** One scope, one memory. The battery and every scoped set each remember the
 *  tree they judged; an identical tree refuses (SE-C-130) — force is the
 *  flake door. */
export function testGate(seDir: string, root: string, force: boolean, scope = "battery"): void {
  if (force) return;
  const fp = testFingerprint(root);
  if (fp === "") return;
  const state = loadTestState(seDir);
  const last = scope === "battery" ? state.battery : state.scoped?.[scope];
  if (last === undefined || last.fingerprint !== fp) return;
  throw new Rejection({
    clause: CLAUSES.TEST_UNCHANGED,
    expected: "a tracked change since the last run of this scope — nothing moved, so its verdict still stands",
    got: `an identical tree (${scope === "battery" ? "battery" : scope} was ${last.ok ? "GREEN" : "RED"} at ${last.ts})`,
    remedy: {
      tool: "se_test",
      args: { force: true },
      note: last.ok ? "that green still stands — force repeats it anyway (flake hunt is the one honest reason)" : "that red still stands: the same tree fails the same way — change something, then run",
    },
    source: SRC,
  });
}

export function testRecord(seDir: string, root: string, ok: boolean, scope = "battery", files: string[] = []): number {
  const fp = testFingerprint(root);
  if (fp === "") return 0;
  const state = loadTestState(seDir);
  const prior = scope === "battery" ? state.battery : state.scoped?.[scope];
  const streak = ok ? (prior?.ok === true ? (prior.streak ?? 1) + 1 : 1) : 0;
  const verdict: ScopeVerdict = { fingerprint: fp, ok, ts: new Date().toISOString(), ...(streak > 0 ? { streak } : {}) };
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

// ── the scope economy ──────────────────────────────────────────────────────
// THE BATTERY IS THE EXCEPTION, NOT THE HABIT (owner ruling 2026-08-02).
// Measured live: one session ran the full battery ~60 times in two hours,
// mostly to answer single-test questions — then grepped a temp file for the
// one failure it cared about. The rules below make the scoped run the cheap
// default and the battery the call you EARN — and they make gaming the rule
// unprofitable, because piecemeal coverage past a threshold GRANTS the
// battery instead of policing it.

/** Every test file the suite holds, root-relative. */
export function suiteFiles(root: string): string[] {
  const dir = join(root, "project", "deliverable", "tests");
  try {
    return readdirSync(dir)
      .filter((f) => f.endsWith(".test.ts"))
      .map((f) => `project/deliverable/tests/${f}`)
      .sort();
  } catch {
    return [];
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
    if (rel !== "" && !rel.startsWith(".se") && !rel.startsWith(".worktrees")) out.add(rel);
  }
  for (const line of status.stdout.split("\n")) {
    if (line.trim() === "") continue;
    const rel = line.slice(3).replace(/^"|"$/g, "");
    if (!rel.startsWith(".se") && !rel.startsWith(".worktrees")) out.add(rel);
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

/** THE BATTERY GATE. Refuses (SE-C-131) when every change since the last
 *  green battery maps to a scoped run — and the refusal HANDS OVER that
 *  scoped call, computed from the diff. The battery is granted when: force,
 *  no battery memory yet, an unmapped change exists, the last battery was
 *  red, or the piecemeal odometer crossed the flip. */
export function batteryGate(seDir: string, root: string, force: boolean): void {
  if (force) return;
  const state = loadTestState(seDir);
  if (state.battery === undefined || state.battery.ok === false) return;
  if ((state.scoped_since_battery ?? []).length >= flipThreshold(root)) return; // the flip GRANTS it
  const changed = changedSinceBattery(root, seDir);
  if (changed === undefined || changed.length === 0) return; // no git / nothing changed: SE-C-130's business
  const { mapped, unmapped } = mapChangedToTests(root, changed);
  if (unmapped.length > 0 || mapped.length === 0) return;
  throw new Rejection({
    clause: CLAUSES.TEST_SCOPE,
    expected: "a scoped run — every change since the last green battery has a named test file",
    got: `a full battery over changes covered by: ${mapped.join(", ")}`,
    remedy: {
      tool: "se_test",
      args: { files: mapped },
      note: "the scoped run answers this diff in seconds; the battery re-earns its place when a change has no mapped test, or piecemeal coverage crosses the flip",
    },
    source: SRC,
  });
}

/** THE FLIP. Once distinct scoped files since the last battery cross the
 *  threshold, further piecemeal runs refuse TOWARD the battery — running the
 *  suite one file at a time is never cheaper than running the suite. */
export function scopedGate(seDir: string, root: string, files: string[], force: boolean): void {
  if (force) return;
  const seen = new Set(loadTestState(seDir).scoped_since_battery ?? []);
  for (const f of files) seen.add(f);
  const threshold = flipThreshold(root);
  if (seen.size < threshold) return;
  throw new Rejection({
    clause: CLAUSES.TEST_SCOPE,
    expected: `scoped runs below the flip (${threshold} distinct files since the last battery)`,
    got: `${seen.size} distinct files piecemeal — the battery is now the cheaper call`,
    remedy: { tool: "se_test", args: {}, note: "run the battery; it resets the odometer and covers everything at once" },
    source: SRC,
  });
}

// ── TAP, structured ────────────────────────────────────────────────────────
// The temp-file workflow existed because a battery's output overflows the
// run cap and a failure's stack lives somewhere in the flood. A structured
// verdict carries the counts and ONLY the failures' detail — the slice the
// greps were always after.
export interface TapResult {
  total: number;
  pass: number;
  fail: number;
  failures: { name: string; detail: string }[];
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
    // TOP-LEVEL failures only — a failing subtest reports through its parent,
    // and counting both would double every incident.
    const notOk = line.match(/^not ok \d+ - (.*)$/);
    if (notOk === null) continue;
    if (res.failures.length >= 10) continue;
    const detail: string[] = [];
    for (let j = i + 1; j < lines.length && detail.length < 30; j++) {
      const l = lines[j];
      if (/^(not )?ok \d+ - /.test(l) || /^# /.test(l)) break;
      detail.push(l);
    }
    res.failures.push({ name: notOk[1], detail: capMiddle(detail.join("\n"), 2000) });
  }
  return res;
}
