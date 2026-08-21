// se.run — the Bash replacement. Engine-captured: full stdout/stderr/exit
// recorded raw in the call log under the returned ref, so a run is citable
// evidence, never a claim. This lane is the future breakout seam: when the
// state machine lands, run legality becomes a per-state decision.
import { type ChildProcess, spawn } from "node:child_process";
import { appendFileSync, existsSync, mkdirSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { CLAUSES, Rejection } from "./errors.ts";
import { capMiddle } from "./jsonio.ts";
import { resolveInRoot, seDir } from "./paths.ts";

export interface RunResult {
  command: string;
  exit: number | null;
  stdout: string;
  stderr: string;
  duration_ms: number;
  truncated: boolean;
}

const OUT_CAP = 30_000;
// see dsp-legible-controls.md#kill-the-whole-tree
export function killTree(pid: number | undefined): void {
  if (pid === undefined) return;
  if (process.platform === "win32") {
    // Detached and unref'd, so a reap fired on the way OUT of the process
    // still completes after we are gone.
    try {
      spawn("taskkill", ["/PID", String(pid), "/T", "/F"], { windowsHide: true, stdio: "ignore", detached: true }).unref();
    } catch {
      /* already gone */
    }
    return;
  }
  // POSIX: the shell is spawned detached, so it leads its own process group
  // and the negative pid reaches every descendant.
  try {
    process.kill(-pid, "SIGKILL");
  } catch {
    try {
      process.kill(pid, "SIGKILL");
    } catch {
      /* already gone */
    }
  }
}

function spawnShell(root: string, command: string, cwd?: string): ChildProcess {
  const shell =
    process.platform === "win32"
      ? { file: "powershell.exe", args: ["-NoProfile", "-NonInteractive", "-Command", command] }
      : { file: "/bin/bash", args: ["-c", command] };
  return spawn(shell.file, shell.args, {
    // cwd is root-relative — resolved against the ROOT, never the server's
    // own working directory (a relative cwd once made spawn fail silently).
    cwd: cwd === undefined ? root : resolveInRoot(root, cwd, "engine/run.ts"),
    env: process.env,
    windowsHide: true,
    detached: process.platform !== "win32",
  });
}

// BACKGROUND RUNS. A long command must not hold the caller, and it must not
// hold the MCP client either: a client that gives up on a slow call kills
// the CALL, not the command, so the work carries on unwatched. A background
// job is the honest shape — start it, get a handle, ask it how it is doing.
// ONE TABLE, EVERY KIND. see dsp-the-work-account.md#responsibility, a shell
// job, a test run and a step's leaving judgment are three kinds of the same
// thing, and a caller asking what is running is told about all of them.
export type OperationKind = "shell" | "test" | "judgment";

export interface JobView {
  job: string;
  kind: OperationKind;
  command: string;
  running: boolean;
  exit: number | null;
  duration_ms: number;
  /** The step this work belongs to, where it belongs to one. Without it a
   *  settled verdict has nowhere to land. */
  state?: string;
  /** Where this kind of work writes its own progress, where it writes any. */
  progress?: string;
  /** The count that progress divides into. */
  total?: number;
  /** What happened, for an operation whose outcome is not its streams. A
   *  caller that missed the moment learns it here. */
  outcome?: string;
  /** How much longer this piece of work needs. Absent where nothing can be
   *  computed — and `basis` then says why. */
  remaining_ms?: number;
  /** What the figure rests on, or why there is no figure. It is never absent:
   *  a duration a reader cannot discount is believed more than it deserves. */
  basis: string;
  stdout: string;
  stderr: string;
  truncated: boolean;
}
interface Job {
  id: string;
  kind: OperationKind;
  command: string;
  started: number;
  ended?: number;
  exit: number | null;
  running: boolean;
  state?: string;
  progress?: string;
  total?: number;
  outcome?: string;
  out: string;
  err: string;
  child?: ChildProcess;
  pid?: number;
  root?: string;
  done: Promise<void>;
  settle: () => void;
}
interface PersistedJob {
  id: string;
  kind?: OperationKind;
  command: string;
  started: number;
  ended?: number;
  exit: number | null;
  running: boolean;
  state?: string;
  progress?: string;
  total?: number;
  pid?: number;
}
/** A test run's own record, kept beside the shell jobs since before this table
 *  existed. It is read back as an operation rather than rewritten. */
interface PersistedTestOperation {
  id: string;
  started: number;
  ended?: number;
  pace?: string;
  total?: number;
  verdict?: { ok?: boolean; question?: string; tests?: { total?: number; pass?: number; fail?: number } };
}
const jobs = new Map<string, Job>();
let jobSeq = 0;

function jobDir(root: string): string {
  return join(seDir(root), "jobs");
}

function jobPath(root: string, id: string, suffix: string): string {
  return join(jobDir(root), `${id}.${suffix}`);
}

function persist(j: Job): void {
  if (j.root === undefined) return;
  mkdirSync(jobDir(j.root), { recursive: true });
  const record: PersistedJob = {
    id: j.id,
    kind: j.kind,
    command: j.command,
    started: j.started,
    ...(j.ended === undefined ? {} : { ended: j.ended }),
    exit: j.exit,
    running: j.running,
    ...(j.state === undefined ? {} : { state: j.state }),
    ...(j.progress === undefined ? {} : { progress: j.progress }),
    ...(j.total === undefined ? {} : { total: j.total }),
    ...(j.pid === undefined ? {} : { pid: j.pid }),
  };
  appendFileSync(jobPath(j.root, j.id, "jsonl"), `${JSON.stringify(record)}\n`, "utf8");
}

function persisted(root: string, id: string): Job | undefined {
  const metadata = jobPath(root, id, "jsonl");
  if (!existsSync(metadata)) return undefined;
  const lines = readFileSync(metadata, "utf8").trimEnd().split("\n");
  let record: PersistedJob | undefined;
  for (let index = lines.length - 1; index >= 0; index--) {
    try {
      record = JSON.parse(lines[index]) as PersistedJob;
      break;
    } catch {
      // An incomplete final append never hides the preceding valid state.
    }
  }
  if (record === undefined) return undefined;
  const output = (suffix: string): string => {
    const path = jobPath(root, id, suffix);
    return existsSync(path) ? readFileSync(path, "utf8") : "";
  };
  return {
    ...record,
    // A record written before this table existed carries no kind, and a shell
    // job is what it was.
    kind: record.kind ?? "shell",
    root,
    out: output("stdout"),
    err: output("stderr"),
    done: Promise.resolve(),
    settle: () => {},
  };
}

function view(j: Job): JobView {
  const cap = (s: string): string => capMiddle(s, OUT_CAP);
  return {
    job: j.id,
    kind: j.kind,
    command: j.command,
    running: j.running,
    exit: j.exit,
    duration_ms: (j.ended ?? Date.now()) - j.started,
    ...(j.state === undefined ? {} : { state: j.state }),
    ...(j.progress === undefined ? {} : { progress: j.progress }),
    ...(j.total === undefined ? {} : { total: j.total }),
    ...(j.outcome === undefined ? {} : { outcome: j.outcome }),
    ...timeRemaining(j),
    stdout: cap(j.out),
    stderr: cap(j.err),
    truncated: j.out.length > OUT_CAP || j.err.length > OUT_CAP,
  };
}

/** HOW MUCH LONGER, AND WHAT THAT RESTS ON, as ONE value rather than two
 *  fields a build could drift apart.
 *  see dsp-the-work-account.md#behavior-and-constraints */
function timeRemaining(j: Job): { remaining_ms?: number; basis: string } {
  if (!j.running) return { basis: "finished" };
  if (j.progress === undefined || j.total === undefined || j.total <= 0) {
    return { basis: "no measurement of comparable work exists, so no time remaining is given" };
  }
  const seen = new Set<string>();
  let elapsed = 0;
  try {
    for (const line of readFileSync(j.progress, "utf8").trimEnd().split("\n")) {
      try {
        const row = JSON.parse(line) as { file?: string; t?: number };
        if (typeof row.file === "string") seen.add(row.file);
        if (typeof row.t === "number") elapsed = row.t;
      } catch {
        // A half-written line says nothing about the ones before it.
      }
    }
  } catch {
    return { basis: "this work writes no progress that can be read, so no time remaining is given" };
  }
  if (seen.size === 0 || elapsed === 0) {
    return { basis: `nothing has finished yet of ${String(j.total)}, so no time remaining is given` };
  }
  const predicted = Math.round(elapsed / (seen.size / j.total));
  return {
    remaining_ms: Math.max(0, predicted - elapsed),
    basis: `a linear projection over ${String(seen.size)} of ${String(j.total)} finished, measured on this run and dependable in neither direction`,
  };
}

/** The last line that parses. An incomplete final append never hides the
 *  preceding valid state. */
function lastRecord(path: string): PersistedTestOperation | undefined {
  const lines = readFileSync(path, "utf8").trimEnd().split("\n");
  for (let index = lines.length - 1; index >= 0; index--) {
    try {
      return JSON.parse(lines[index]) as PersistedTestOperation;
    } catch {
      // keep walking backwards
    }
  }
  return undefined;
}

/** WHAT HAPPENED, FOR SOMEBODY WHO MISSED THE MOMENT. A test run's outcome is
 *  a verdict rather than a stream, so it says so in one line — otherwise the
 *  caller is told a run finished and never told how. */
function testOutcome(record: PersistedTestOperation): string | undefined {
  const verdict = record.verdict;
  if (verdict === undefined) return undefined;
  const colour = verdict.ok === true ? "green" : "red";
  const counted = verdict.tests;
  if (counted === undefined) return colour;
  return `${colour} — ${String(counted.pass ?? 0)} of ${String(counted.total ?? 0)} passed, ${String(counted.fail ?? 0)} failed`;
}

/** One test run, read back as an operation in the one table. */
function testOperation(root: string, record: PersistedTestOperation): Job {
  const settled = record.verdict !== undefined;
  const outcome = testOutcome(record);
  return {
    id: record.id,
    kind: "test",
    command: record.verdict?.question ?? "a test run",
    started: record.started,
    ...(record.ended === undefined ? {} : { ended: record.ended }),
    exit: settled ? (record.verdict?.ok === true ? 0 : 1) : null,
    running: !settled,
    progress: join(seDir(root), "test-progress.jsonl"),
    ...(record.total === undefined ? {} : { total: record.total }),
    ...(outcome === undefined ? {} : { outcome }),
    out: "",
    err: "",
    root,
    done: Promise.resolve(),
    settle: () => {},
  };
}

/** EVERY TEST RUN THIS ROOT REMEMBERS, read back as an operation. Its record
 *  predates the one table and is left in its own folder rather than migrated:
 *  a rewrite would lose the runs already on disk. */
function testOperations(root: string): Job[] {
  const dir = join(seDir(root), "test-jobs");
  if (!existsSync(dir)) return [];
  const found: Job[] = [];
  for (const name of readdirSync(dir)) {
    if (!name.endsWith(".jsonl")) continue;
    const record = lastRecord(join(dir, name));
    if (record === undefined) continue;
    found.push(testOperation(root, record));
  }
  return found;
}

function knownJob(id: string, root?: string): Job {
  const j = jobs.get(id);
  if (j !== undefined) return j;
  if (root !== undefined) {
    const recovered = persisted(root, id);
    if (recovered !== undefined) return recovered;
  }
  throw new Rejection({
    clause: CLAUSES.JOB_UNKNOWN,
    expected: "a job started in this session",
    got: `${id} (unknown)`,
    remedy: { tool: "se_run", args: { jobs: true }, note: "list the jobs this session started" },
    source: "engine/run.ts jobs",
  });
}

export async function jobDone(id: string): Promise<JobView> {
  const job = knownJob(id);
  await job.done;
  return view(job);
}

/** START a command in the background. Returns at once with a handle. */
/**
 * Is anything still running that this session started?
 *
 * The idle shutdown asks this, and it is the question that keeps it honest: a
 * long build with nobody watching is not idle, and shutting the computer down
 * under it would throw the work away.
 */
export function anyJobRunning(): boolean {
  for (const j of jobs.values()) if (j.running) return true;
  return false;
}

/**
 * The job somebody is WAITING ON, named rather than counted.
 *
 * anyJobRunning answers whether the machine may sleep. This answers what to
 * tell a person looking at a still surface, which is a different question and
 * needs a different shape: a boolean cannot be shown.
 */
export function runningJob(): { what: string; since_ms: number } | undefined {
  for (const j of jobs.values()) {
    if (j.running) return { what: j.command, since_ms: Date.now() - j.started };
  }
  return undefined;
}

export function runBackground(root: string, command: string, opts: { cwd?: string } = {}): JobView {
  return startJob(command, () => spawnShell(root, command, opts.cwd), root);
}

/** REGISTER any child in the one job registry — se_test's runs live here
 *  too, so the shutdown reap and {jobs: true} see every spawned process. */
export function startJob(
  command: string,
  spawnFn: () => ChildProcess,
  root?: string,
  opts: { kind?: OperationKind; state?: string; progress?: string; total?: number } = {},
): JobView {
  const id = `job-${Date.now().toString(36)}-${++jobSeq}`;
  let settle = (): void => {};
  const done = new Promise<void>((res) => {
    settle = res;
  });
  const j: Job = {
    id,
    kind: opts.kind ?? "shell",
    command,
    started: Date.now(),
    exit: null,
    running: true,
    ...(opts.state === undefined ? {} : { state: opts.state }),
    ...(opts.progress === undefined ? {} : { progress: opts.progress }),
    ...(opts.total === undefined ? {} : { total: opts.total }),
    out: "",
    err: "",
    root,
    done,
    settle,
  };
  jobs.set(id, j);
  let child: ChildProcess;
  try {
    child = spawnFn();
  } catch (e) {
    j.running = false;
    j.ended = Date.now();
    j.err = String((e as Error).message);
    if (j.root !== undefined) {
      mkdirSync(jobDir(j.root), { recursive: true });
      appendFileSync(jobPath(j.root, j.id, "stderr"), j.err, "utf8");
    }
    persist(j);
    j.settle();
    return view(j);
  }
  j.child = child;
  j.pid = child.pid;
  persist(j);
  child.stdout?.setEncoding("utf8");
  child.stderr?.setEncoding("utf8");
  child.stdout?.on("data", (chunk) => {
    const text = String(chunk);
    j.out += text;
    if (j.root !== undefined) appendFileSync(jobPath(j.root, j.id, "stdout"), text, "utf8");
  });
  child.stderr?.on("data", (chunk) => {
    const text = String(chunk);
    j.err += text;
    if (j.root !== undefined) appendFileSync(jobPath(j.root, j.id, "stderr"), text, "utf8");
  });
  child.on("error", (e) => {
    j.err += String(e);
    j.running = false;
    j.ended = Date.now();
    persist(j);
    j.settle();
  });
  child.on("close", (code) => {
    j.exit = code;
    j.running = false;
    j.ended = Date.now();
    persist(j);
    j.settle();
  });
  return view(j);
}

/** ASK a job how it is doing — output so far, whether it still runs. */
export function jobStatus(id: string, root?: string): JobView {
  return view(knownJob(id, root));
}

/** STOP a job, and everything it spawned. */
export function jobStop(id: string, root?: string): JobView {
  const j = knownJob(id, root);
  if (j.running) {
    killTree(j.child?.pid ?? j.pid);
    j.running = false;
    j.ended = Date.now();
    persist(j);
  }
  return view(j);
}

/** EVERY job this session started, newest first. */
export function jobList(root?: string): JobView[] {
  const found = new Map(jobs);
  if (root !== undefined && existsSync(jobDir(root))) {
    for (const name of readdirSync(jobDir(root))) {
      if (!name.endsWith(".jsonl")) continue;
      const id = name.slice(0, -".jsonl".length);
      if (!found.has(id)) {
        const recovered = persisted(root, id);
        if (recovered !== undefined) found.set(id, recovered);
      }
    }
  }
  // THE OTHER KIND. A test run keeps its own record, and a caller asking what
  // is running was told about one table and never learned the other existed.
  if (root !== undefined) {
    for (const op of testOperations(root)) if (!found.has(op.id)) found.set(op.id, op);
  }
  return [...found.values()].sort((a, b) => b.started - a.started).map(view);
}

/** REGISTER a piece of work the table cannot spawn for itself. A step's
 *  leaving judgment is started by the walk and runs as its own children, so it
 *  enters the table by name rather than by spawn.
 *  see dsp-the-work-account.md#interface */
export function openOperation(o: { id: string; kind: OperationKind; command: string; state?: string; root?: string }): void {
  if (jobs.has(o.id)) return;
  const j: Job = {
    id: o.id,
    kind: o.kind,
    command: o.command,
    started: Date.now(),
    exit: null,
    running: true,
    ...(o.state === undefined ? {} : { state: o.state }),
    out: "",
    err: "",
    ...(o.root === undefined ? {} : { root: o.root }),
    done: Promise.resolve(),
    settle: () => {},
  };
  jobs.set(o.id, j);
  persist(j);
}

/** SETTLE a registered operation. A judgment whose process is gone settles as
 *  failed rather than deciding for ever — absence is unambiguous, measured in
 *  exp-does-a-left-check-survive-its-call. */
export function settleOperation(id: string, ok: boolean): void {
  const j = jobs.get(id);
  if (j === undefined || !j.running) return;
  j.running = false;
  j.ended = Date.now();
  j.exit = ok ? 0 : 1;
  j.outcome = ok ? "passed" : "not passed";
  persist(j);
}

/** Ids whose outcome has already been handed to a caller — the third standing.
 *  An operation is running, then finished, then read.
 *  see dsp-the-work-account.md#behavior-and-constraints */
const reported = new Set<string>();
const seenRunning = new Set<string>();

/** THE ACCOUNT THAT RIDES A LANE ANSWER: everything still running, plus
 *  anything that finished since the last look. Never the whole history — a
 *  caller learns each outcome ONCE and is not told it again, and work that
 *  ended before this session looked answers to se_run {jobs: true} instead. */
export function workAccount(root?: string): JobView[] {
  const out: JobView[] = [];
  for (const entry of jobList(root)) {
    if (entry.running) {
      seenRunning.add(entry.job);
      out.push(entry);
      continue;
    }
    if (!jobs.has(entry.job) && !seenRunning.has(entry.job)) continue;
    if (reported.has(entry.job)) continue;
    reported.add(entry.job);
    out.push(entry);
  }
  return out;
}

/** Stop everything still running — the server is going down. */
export function jobStopAll(): void {
  for (const j of jobs.values()) if (j.running) killTree(j.child?.pid);
}

export async function runToCompletion(root: string, command: string, opts: { cwd?: string } = {}): Promise<RunResult> {
  const started = runBackground(root, command, opts);
  const result = await jobDone(started.job);
  return {
    command,
    exit: result.exit,
    stdout: result.stdout,
    stderr: result.stderr,
    duration_ms: result.duration_ms,
    truncated: result.truncated,
  };
}
