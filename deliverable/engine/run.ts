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
// A SUBAGENT IS A BACKGROUND TASK TOO (owner ruling). The harness spawns it,
// not the lane, so the engine cannot see it for itself — the driving agent says
// it started one and says when it ends. Registered, it rides the account and
// the panel beside every other piece of work out of sight.
export type OperationKind = "shell" | "test" | "judgment" | "agent";

/** THE THREE STANDINGS OF AN ENTRY: running, then finished, then read. `read`
 *  is a MARK on the entry and never a reason to drop it.
 *
 *  ACKNOWLEDGING IS WHAT DROPS IT. A settled entry
 *  rides every answer until the caller says it has seen it, and then it is
 *  gone. Nothing is lost: the outcome stays reachable through se_run {job} and
 *  the call log.
 *  see dsp-the-work-account.md#behavior-and-constraints */
export type Standing = "running" | "finished" | "read";

/** How much of a FAILING job's last words ride the account. */
const TAIL_CHARS = 400;

/** Room between a job's own start and its reporter's first beat, before the
 *  beat file is judged to belong to an earlier run. */
const STALE_SLACK_MS = 2_000;

/** WHAT RIDES A LANE ANSWER, and it is a REFERENCE rather than a transcript.
 *
 *  THE STREAMS DO NOT TRAVEL. A job's output can be tens of kilobytes and the
 *  whole answer bound is a few thousand, so carrying the text meant one noisy
 *  job taxed every later call in the session. MEASURED: a read of
 *  200 characters came back as a 20,451-byte answer, and all but 200 of it was
 *  an unrelated job's stdout.
 *
 *  WHAT A READER NEEDS RIGHT AWAY STILL TRAVELS. A job that ended non-zero
 *  carries a tail, because a reader who cannot see the failure guesses at it —
 *  which is the blanket-message rule in guidance/refusals.md.
 *  see dsp-the-work-account.md#behavior-and-constraints */
export interface AccountEntry {
  job: string;
  kind: OperationKind;
  command: string;
  running: boolean;
  exit: number | null;
  duration_ms: number;
  state?: string;
  progress?: string;
  total?: number;
  outcome?: string;
  remaining_ms?: number;
  basis: string;
  standing: Standing;
  /** How much output there is, and the exact call that serves it. */
  output: { stdout_bytes: number; stderr_bytes: number; truncated: boolean; read: string };
  /** The last of what a FAILING job said. Absent where the job succeeded. */
  tail?: string;
  /** WHAT A RUNNING BATTERY HAS FOUND, so nobody polls a verb for it. How far
   *  along it is, how many have failed, and the first of them by name.
   *
   *  THE JOB MAKES THE ESTIMATE, NEVER THE READER. `percent` comes from the
   *  reporter's own beat file, and `remaining_ms` beside it comes from the
   *  engine's measurement of this run — with `basis` saying what that figure
   *  rests on. An agent guessing how long something has left is the thing
   *  these fields exist to stop. */
  cases_done?: number;
  files_touched?: number;
  percent?: number;
  errors?: number;
}

/** WHAT A RUNNING BATTERY HAS FOUND SO FAR, read from the reporter's beat
 *  file. It rides the account so nobody has to poll a verb for it: the count,
 *  the files, and the failures as they land.
 *
 *  IT USED TO LIVE ONLY ON se_test {job}, which meant a walker who wanted to
 *  see failures arriving had to call that verb over and over. The account
 *  already rode every answer; only this was missing from it. */
function batteryFound(progress: string, ranForMs: number): Record<string, unknown> {
  try {
    const lines = readFileSync(progress, "utf8")
      .split("\n")
      .filter((l) => l.trim() !== "");
    const head = JSON.parse(lines[0]) as { files_total?: number; start?: string };
    // A BEAT FILE FROM AN EARLIER RUN IS NOT THIS RUN'S NEWS. One file holds
    // the latest run, so a job that started after the file was stamped is
    // reading somebody else's progress. Showing it would report a finished
    // run's 100 percent against a battery that began a second ago.
    const began = Date.now() - ranForMs;
    if (typeof head.start !== "string" || Date.parse(head.start) < began - STALE_SLACK_MS) return {};
    let cases = 0;
    const files = new Set<string>();
    const failures: string[] = [];
    for (const line of lines.slice(1)) {
      let rec: { file?: string; fail?: string; msg?: string };
      try {
        rec = JSON.parse(line) as typeof rec;
      } catch {
        continue;
      }
      if (typeof rec.file !== "string") continue;
      cases += 1;
      files.add(rec.file);
      if (typeof rec.fail === "string") {
        failures.push(`${rec.fail}${typeof rec.msg === "string" && rec.msg !== "" ? `: ${rec.msg}` : ""}`);
      }
    }
    const total = head.files_total;
    return {
      cases_done: cases,
      files_touched: files.size,
      ...(typeof total === "number" && total > 0 ? { percent: Math.min(100, Math.round((files.size / total) * 100)) } : {}),
      // A NUMBER, NEVER A LIST. The account rides EVERY answer and the answer
      // has a byte bound, so failure text here pushes an unrelated read over
      // that bound and makes it spill — the recursion the cursor exists to
      // avoid. A list of twelve did exactly that.
      //
      // THE NAMES ARE ON THE VERDICT, which is where somebody acting on them
      // looks anyway.
      errors: failures.length,
    };
  } catch {
    return {};
  }
}

function asAccount(entry: JobView, standing: Standing): AccountEntry {
  const { stdout, stderr, truncated, ...rest } = entry;
  const failed = !entry.running && entry.exit !== null && entry.exit !== 0;
  const said = stderr.trim() === "" ? stdout : stderr;
  return {
    ...rest,
    standing,
    output: {
      stdout_bytes: stdout.length,
      stderr_bytes: stderr.length,
      truncated,
      // WHERE THE WHOLE THING IS. The account carries counts; this is the call
      // that serves the text behind them. A battery keeps its verdict, failure
      // names and all, in its own record under .se/test-jobs.
      read: entry.kind === "test" ? `se_file_read {path: ".se/test-last.json"}` : `se_run {job: "${entry.job}"}`,
    },
    ...(entry.kind === "test" && entry.progress !== undefined ? batteryFound(entry.progress, entry.duration_ms) : {}),
    ...(failed && said.trim() !== "" ? { tail: said.slice(-TAIL_CHARS) } : {}),
  };
}

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
  /** WHICH OF THE THREE STANDINGS this entry is in. The account always sets it.
   *  se_run {jobs: true} is the history door and sets none.
   *  see dsp-the-work-account.md#behavior-and-constraints */
  standing?: Standing;
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
  /** THE DECLARED STEP COUNT AND WHAT IS BEHIND IT. Every background job says
   *  how many steps it expects when it starts, and reports as it goes. */
  steps_done?: number;
  steps_total?: number;
  /** WHEN THIS JOB LAST SAID ANYTHING. A spawned agent leaves no exit code —
   *  it runs inside the harness, not as a child of this process — so the only
   *  evidence it is still working is that it keeps reporting. */
  last_report?: number;
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
  steps_done?: number;
  steps_total?: number;
  last_report?: number;
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
    ...(j.steps_done === undefined ? {} : { steps_done: j.steps_done }),
    ...(j.steps_total === undefined ? {} : { steps_total: j.steps_total }),
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

/** WHAT THE PROGRESS FILE SAYS ABOUT THIS RUN, and nothing about an earlier
 *  one. Every test operation writes to the SAME path, and the file is rewritten
 *  per run behind a `start` header — see bin/selftest.ts. Without that check a
 *  figure is projected from the previous run's lines while the basis claims it
 *  was measured on this one. */
function progressOfRun(path: string, since: number): { files: number; elapsed: number } | "unreadable" | "stale" {
  let text: string;
  try {
    text = readFileSync(path, "utf8");
  } catch {
    return "unreadable";
  }
  const seen = new Set<string>();
  let elapsed = 0;
  let start: number | undefined;
  for (const line of text.trimEnd().split("\n")) {
    try {
      const row = JSON.parse(line) as { file?: string; t?: number; start?: string };
      if (typeof row.start === "string") start = Date.parse(row.start);
      if (typeof row.file === "string") seen.add(row.file);
      if (typeof row.t === "number") elapsed = row.t;
    } catch {
      // A half-written line says nothing about the ones before it.
    }
  }
  // A SECOND OF SLACK. The header and the job record are stamped by two
  // processes moments apart, so exact ordering between them is not available.
  if (start === undefined || start < since - 1_000) return "stale";
  return { files: seen.size, elapsed };
}

/** HOW LONG NOTHING MAY FINISH before the figure says it is not advancing.
 *  Below this a slow test file is ordinary work rather than a stall. */
const STALL_AFTER_MS = 30_000;

/** HOW MUCH LONGER, AND WHAT THAT RESTS ON, as ONE value rather than two
 *  fields a build could drift apart.
 *  see dsp-the-work-account.md#behavior-and-constraints */
function timeRemaining(j: Job): { remaining_ms?: number; basis: string } {
  if (!j.running) return { basis: "finished" };
  if (j.progress === undefined || j.total === undefined || j.total <= 0) {
    return { basis: "no measurement of comparable work exists, so no time remaining is given" };
  }
  const now = progressOfRun(j.progress, j.started);
  if (now === "unreadable") {
    return { basis: "this work writes no progress that can be read, so no time remaining is given" };
  }
  if (now === "stale") {
    return { basis: "the progress on disk belongs to an earlier run, so no time remaining is given" };
  }
  if (now.files === 0 || now.elapsed === 0) {
    return { basis: `nothing has finished yet of ${String(j.total)}, so no time remaining is given` };
  }
  // THE STALL IS MEASURED AGAINST THE RUN'S OWN CLOCK, never against the
  // previous READ of this table.
  //
  // `elapsed` is how far into the run the last file finished. Subtract it from
  // how long the run has actually been going and what is left is how long
  // nothing has finished for. No memory of earlier reads is needed, so two
  // looks a millisecond apart cannot disagree with each other — which is what a
  // read-counting version did, inside a single answer that reads the table
  // twice.
  const silentFor = Date.now() - j.started - now.elapsed;
  const predicted = Math.round(now.elapsed / (now.files / j.total));
  return {
    remaining_ms: Math.max(0, predicted - now.elapsed),
    basis:
      silentFor >= STALL_AFTER_MS
        ? `${String(now.files)} of ${String(j.total)} finished, and nothing has finished for ${String(Math.round(silentFor / 1000))}s, so this figure is not advancing`
        : `a linear projection over ${String(now.files)} of ${String(j.total)} finished on this run, dependable in neither direction`,
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
export interface RunningRow {
  /** A SHORT HANDLE, one or two words. The table's first column, and the only
   *  part a person scans. Never the whole command. */
  name: string;
  /** One line saying what it is. It rides the NAME's tooltip and has no column
   *  of its own — a person scanning wants how far along and when, not what. */
  what: string;
  /** HOW MANY STEPS ARE DONE AND HOW MANY THERE ARE. Every background job
   *  declares its total when it starts and reports as it goes. The total may
   *  RISE mid-flight, which is honest: work is found while working. */
  steps_done?: number;
  steps_total?: number;
  /** WORKING OR IDLE. Only a spawned agent is ever idle, and an idle one is
   *  not a finished one — it is a helper free to be given the next piece of
   *  work. The row stays so a person can see it standing there. */
  status?: string;
  since_ms: number;
  percent?: number;
  remaining_ms?: number;
  basis?: string;
}

/** EVERY piece of background work still going, for a surface to LIST.
 *
 *  IT USED TO ANSWER ONE JOB and the panel drew one row, so a person watching
 *  could not see how many things were going or which one they were waiting on.
 *
 *  A TEST RUN AND THE SHELL IT SPAWNED ARE ONE PIECE OF WORK. The battery
 *  registers itself AND the `node --test` child it starts, and drawing both
 *  showed the same work twice. The battery is the one with the progress. */
/** A NAME AND A DESCRIPTION, SPLIT OUT OF ONE COMMAND STRING.
 *
 *  WHY IT IS NEEDED. The panel showed the raw command, and two shell jobs with
 *  long pipelines ran together into one unreadable paragraph. A name that fits
 *  a narrow column is what makes a list scannable.
 *
 *  AN AGENT NAMES ITSELF before a colon: "sonnet: fix the walk-position tests".
 *  A shell job is named by the program it runs, with any `cd` prefix dropped. */
function nameOf(j: { kind: OperationKind; command: string }): { name: string; what: string } {
  if (j.kind === "agent") {
    const cut = j.command.indexOf(":");
    if (cut > 0 && cut <= 24) return { name: j.command.slice(0, cut).trim(), what: j.command.slice(cut + 1).trim() };
    return { name: "agent", what: j.command };
  }
  if (j.kind === "test") return { name: "battery", what: j.command };
  if (j.kind === "judgment") return { name: "judgment", what: j.command };
  const bare = j.command.replace(/^(?:cd [^;]+;\s*)+/, "");
  return { name: bare.split(/\s+/).slice(0, 2).join(" ").slice(0, 20), what: bare };
}

/** HOW LONG SOMETHING MUST RUN BEFORE A PERSON IS TOLD ABOUT IT.
 *
 *  WORK THAT FINISHES QUICKLY IS NOISE. A row that appears and vanishes inside
 *  a second cannot be read, and it makes the list jump under the reader's eye.
 *  Below this the surface simply stays still.
 *
 *  IT IS A DISPLAY RULE ONLY. anyJobRunning still counts every job, so nothing
 *  here changes when the machine may sleep or when the turn may end. */
const PANEL_MIN_MS = 3_000;

/** HOW LONG A HELPER MAY SAY NOTHING BEFORE THE PANEL CALLS IT IDLE.
 *
 *  A SPAWNED AGENT CANNOT BE WATCHED. It runs inside the harness, so there is
 *  no exit code and no pipe. The only evidence it is alive is that it keeps
 *  reporting, and two minutes of silence means it has almost certainly
 *  returned.
 *
 *  IDLE IS NOT FINISHED, and the row does not vanish. A helper standing free
 *  is a helper that can take the next piece of work. */
const IDLE_AFTER_MS = 120_000;

/** WORKING OR IDLE, for one job.
 *
 *  ONLY AN AGENT CAN BE IDLE. A shell run and a battery are children of this
 *  process, so their silence says nothing at all about whether they are
 *  working. */
function statusOf(j: Job, now: number): string {
  if (j.kind !== "agent") return "working";
  return now - (j.last_report ?? j.started) >= IDLE_AFTER_MS ? "idle" : "working";
}

/** HOW LONG THE REST WILL TAKE, from what this job has already done.
 *
 *  THE ENGINE COMPUTES IT, never the agent. A job says how many steps it has
 *  and how many are behind it; the elapsed time divided by the steps behind it
 *  is what one step costs, and the steps ahead are what remain.
 *
 *  A DASH INVITES LAZINESS. Refusing to estimate until a job volunteers one
 *  means most rows say nothing, and a person waiting learns nothing. Two steps
 *  into a run of twenty is a real basis for a figure. */
function etaFrom(done: number, total: number, ranForMs: number): { remaining_ms: number; basis: string } | undefined {
  if (done <= 0 || total <= done) return undefined;
  const perStep = ranForMs / done;
  return {
    remaining_ms: Math.round(perStep * (total - done)),
    basis: `${done} of ${total} done in ${Math.round(ranForMs / 1000)}s`,
  };
}

export function runningWork(): RunningRow[] {
  const now = Date.now();
  const live = [...jobs.values()].filter((j) => j.running && now - j.started >= PANEL_MIN_MS);
  const battery = live.some((j) => j.kind === "test");
  const rows: RunningRow[] = [];
  for (const j of live) {
    if (battery && j.kind === "shell" && j.command.startsWith("node --test")) continue;
    const ran = now - j.started;
    const steps = stepsOf(j, ran);
    const own = view(j);
    // THE JOB'S OWN PROJECTION WINS where it has one; a battery measures its
    // pace against its own cases and knows better than arithmetic on steps.
    const eta =
      own.remaining_ms === undefined
        ? etaFrom(steps.steps_done ?? 0, steps.steps_total ?? 0, ran)
        : { remaining_ms: own.remaining_ms, basis: String(own.basis ?? "") };
    rows.push({
      ...nameOf(j),
      ...steps,
      status: statusOf(j, now),
      since_ms: ran,
      ...(eta === undefined ? {} : { remaining_ms: eta.remaining_ms, basis: eta.basis }),
    });
  }
  return rows;
}

/** WHAT A JOB HAS BEHIND IT AND WHAT IT HAS IN TOTAL.
 *
 *  A BATTERY COUNTS ITS OWN CASES and needs no help: its reporter writes how
 *  many are done and how many there are. Everything else declared its total
 *  when it started and reports as it goes. */
function stepsOf(j: Job, ranForMs: number): { steps_done?: number; steps_total?: number } {
  if (j.kind === "test" && j.progress !== undefined) {
    const found = batteryFound(j.progress, ranForMs) as { cases_done?: number };
    const done = found.cases_done;
    if (done !== undefined && j.total !== undefined) return { steps_done: done, steps_total: j.total };
  }
  if (j.steps_total === undefined) return {};
  return { steps_done: j.steps_done ?? 0, steps_total: j.steps_total };
}

/** SAY HOW FAR A BACKGROUND JOB HAS GOT. The total may rise: work found while
 *  working is real, and a total that never moves is the lie. */
export function noteProgress(id: string, done: number, total?: number, root?: string): boolean {
  const j = jobs.get(id) ?? (root === undefined ? undefined : persisted(root, id));
  if (j === undefined) return false;
  jobs.set(id, j);
  j.steps_done = done;
  if (total !== undefined) j.steps_total = total;
  j.last_report = Date.now();
  persist(j);
  return true;
}

export function runBackground(root: string, command: string, opts: { cwd?: string; steps?: number } = {}): JobView {
  return startJob(command, () => spawnShell(root, command, opts.cwd), root, {
    ...(opts.steps === undefined ? {} : { steps: opts.steps }),
  });
}

/** REGISTER any child in the one job registry — se_test's runs live here
 *  too, so the shutdown reap and {jobs: true} see every spawned process. */
export function startJob(
  command: string,
  spawnFn: () => ChildProcess,
  root?: string,
  opts: { kind?: OperationKind; state?: string; progress?: string; total?: number; steps?: number } = {},
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
    ...(opts.steps === undefined ? {} : { steps_total: opts.steps, steps_done: 0 }),
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
export function openOperation(o: {
  id: string;
  kind: OperationKind;
  command: string;
  state?: string;
  root?: string;
  steps?: number;
}): void {
  // A LIVE ENTRY IS LEFT ALONE; A SETTLED ONE IS REPLACED. A judgment's id is
  // derived from its step, so every re-run of one step reuses it. Returning
  // early on ANY existing id meant the second run never entered the table, and
  // the account went on showing the first run's settled record as though it
  // were current — measured on i51's own verification, 98 seconds stale.
  const standing = jobs.get(o.id);
  if (standing?.running === true) return;
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
export function settleOperation(id: string, ok: boolean, root?: string): void {
  // AN ENGINE RELOAD EMPTIES THE IN-MEMORY TABLE while the account goes on
  // rebuilding entries from disk. Without this recovery a long-lived operation
  // could never be closed after a restart: the settle found nothing, returned
  // quietly, and the panel went on showing the work as running for ever.
  // Measured on an agent row that survived a reload.
  const j = jobs.get(id) ?? (root === undefined ? undefined : persisted(root, id));
  if (j === undefined || !j.running) return;
  jobs.set(id, j);
  j.running = false;
  j.ended = Date.now();
  j.exit = ok ? 0 : 1;
  j.outcome = ok ? "passed" : "not passed";
  persist(j);
}

/** WORK THIS SESSION STARTED that the in-memory table cannot see for itself. A
 *  test operation is rebuilt from its record on every read and never enters
 *  `jobs`, so without this set a run that started AND settled between two lane
 *  calls was dropped before any caller ever saw it
 *  (req-one-call-reports-every-piece-of-work-out-of-sight). */
const startedHere = new Map<string, Set<string>>();

/** SAY THAT THIS SESSION STARTED A PIECE OF WORK the table cannot see.
 *  KEYED BY ROOT for the same reason the read marks are: two trees can hold
 *  the same job id, and one set shared between them lets one tree's work
 *  answer for the other's. */
export function noteStarted(id: string, root?: string): void {
  marksFor(startedHere, root).add(id);
}

/** THE TWO MARKS THE ACCOUNT KEEPS, both PER ROOT. Two trees can hold the same
 *  job id, and one set shared between them makes one tree's read hide the other
 *  tree's outcome. */
const handedOut = new Map<string, Set<string>>();
const runningSeen = new Map<string, Set<string>>();

function marksFor(store: Map<string, Set<string>>, root?: string): Set<string> {
  const key = root ?? "";
  const found = store.get(key);
  if (found !== undefined) return found;
  const fresh = new Set<string>();
  store.set(key, fresh);
  return fresh;
}

/** THE ACCOUNT THAT RIDES A LANE ANSWER: every operation THIS SESSION started,
 *  running and finished alike, each saying which of the three standings it is
 *  in. AN ENTRY NEVER LEAVES THE TABLE INSIDE ONE SESSION — a second look marks
 *  it `read` rather than dropping it, so a caller that missed the moment can
 *  still find the outcome. Work that ended BEFORE this session looked is
 *  history rather than news, and answers to se_run {jobs: true} instead.
 *  see dsp-the-work-account.md#behavior-and-constraints */
export function workAccount(root?: string): AccountEntry[] {
  const read = marksFor(handedOut, root);
  const running = marksFor(runningSeen, root);
  const mine = marksFor(startedHere, root);
  const gone = marksFor(settled, root);
  const out: AccountEntry[] = [];
  for (const entry of jobList(root)) {
    if (gone.has(entry.job)) continue;
    if (entry.running) {
      running.add(entry.job);
      out.push(asAccount(entry, "running"));
      continue;
    }
    if (!jobs.has(entry.job) && !mine.has(entry.job) && !running.has(entry.job)) continue;
    const already = read.has(entry.job);
    read.add(entry.job);
    out.push(asAccount(entry, already ? "read" : "finished"));
  }
  return out;
}

/** What a caller has said it has seen, and will not be shown again. */
const settled = new Map<string, Set<string>>();

/** DROP SETTLED WORK FROM THE ACCOUNT.
 *
 *  AN ENTRY RIDES EVERY ANSWER UNTIL IT IS ACKNOWLEDGED. That is what makes it
 *  news the caller cannot miss. Acknowledging says the news landed, and the
 *  entry stops riding.
 *
 *  NOTHING IS LOST BY DROPPING IT. se_run {job} still serves the whole record,
 *  and the call log keeps the output under its ref for good.
 *
 *  A RUNNING JOB IS REFUSED. Its outcome is not in yet, so acknowledging it
 *  would hide the only news the account exists to carry. */
export function jobAcknowledge(ids: string[], root?: string): { acknowledged: string[]; still_running: string[] } {
  const gone = marksFor(settled, root);
  const live = new Set(
    jobList(root)
      .filter((e) => e.running)
      .map((e) => e.job),
  );
  const done: string[] = [];
  const busy: string[] = [];
  for (const id of ids) {
    if (live.has(id)) busy.push(id);
    else {
      gone.add(id);
      done.push(id);
    }
  }
  return { acknowledged: done, still_running: busy };
}

/** Acknowledge everything settled in one act, for a caller that has read the
 *  account and wants a clean ride from here. */
export function jobAcknowledgeSettled(root?: string): string[] {
  const ids = jobList(root)
    .filter((e) => !e.running)
    .map((e) => e.job);
  return jobAcknowledge(ids, root).acknowledged;
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
