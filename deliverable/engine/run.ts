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
  /** THE CALL THAT SERVES THE OUTPUT, and how much there is WHEN THERE IS ANY.
   *  The three counts are optional because a job that said nothing has nothing
   *  to count, and three zeroes on every row of every lane result is pure
   *  weight. */
  output: { stdout_bytes?: number; stderr_bytes?: number; truncated?: boolean; read: string };
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

/** HOW MUCH OF A COMMAND THE ACCOUNT CARRIES. Enough to recognise the job,
 *  never the whole thing — the ref serves that. */
const COMMAND_HANDLE = 72;

function asAccount(entry: JobView, standing: Standing): AccountEntry {
  const { stdout, stderr, truncated, ...rest } = entry;
  const failed = !entry.running && entry.exit !== null && entry.exit !== 0;
  const said = stderr.trim() === "" ? stdout : stderr;
  // THE ACCOUNT IS A LITTLE TEXT AND SOME REFERENCES (owner ruling 2026-08-23).
  // It rides EVERY lane result, so anything carried here is paid for on every
  // call of the session rather than once.
  //
  // THE COMMAND IS CUT TO A HANDLE. A shell job's command is the whole script,
  // several hundred characters of it, repeated on every call until the job
  // settles. The ref below serves the whole thing to whoever wants it.
  //
  // THE COUNTS RIDE ONLY WHEN THERE IS OUTPUT. Three zeroes and a false say
  // nothing and cost the same as something.
  const quiet = stdout.length === 0 && stderr.length === 0 && !truncated;
  // WHERE THE WHOLE THING IS. A battery keeps its verdict, failure names and
  // all, in its own record under .se/test-jobs.
  const read = entry.kind === "test" ? `se_file_read {path: ".se/test-last.json"}` : `se_run {job: "${entry.job}"}`;
  return {
    ...rest,
    command: entry.command.length > COMMAND_HANDLE ? `${entry.command.slice(0, COMMAND_HANDLE - 1)}…` : entry.command,
    standing,
    output: quiet ? { read } : { stdout_bytes: stdout.length, stderr_bytes: stderr.length, truncated, read },
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
  /** Which milestone group (M0..M9) the state belongs to, from the rigor
   *  matrix. Absent where the state carries no matching row. */
  milestone?: string;
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
  /** WHICH HAND THIS IS — walker, reviewer, researcher (owner ruling
   *  2026-08-23). ONLY WALKERS COUNT AGAINST THE RECORD'S CEILING. A reviewer
   *  and a researcher are a different purchase: one buys separation, the other
   *  buys reading nobody has done, and neither competes for the walking slot. */
  role?: string;
  /** THE LAST THING THIS HAND SAID IT WAS DOING. Its narration's newest brief,
   *  shown on the row's tooltip so a person hovering learns the current step
   *  rather than the spawn line. */
  last_brief?: string;
  /** WHAT THE ENGINE PREDICTED, AND WHEN IT SAID SO. Kept so the guess can be
   *  GRADED when the job ends, which is the only way an estimate ever improves.
   *  Set once, on the first prediction — a prediction made seconds before the
   *  end is trivially right and would flatter the record. */
  predicted_ms?: number;
  predicted_at?: number;
  /** WHICH SESSION REGISTERED THIS JOB. `hands-spawned.ts` reads it back (via
   *  `.se/settings.json`) to tell a hand spawned THIS session from one left
   *  over from an earlier session that a reload cannot erase. A boot record
   *  gets a fresh id on every reload, which is what made the old check trap
   *  the walk; the session id does not. */
  session?: string;
  id: string;
  kind: OperationKind;
  command: string;
  started: number;
  ended?: number;
  exit: number | null;
  running: boolean;
  state?: string;
  /** WHICH MILESTONE GROUP THE STATE BELONGS TO (M0..M9), read from the rigor
   *  matrix at registration. Absent where the state carries no matching row. */
  milestone?: string;
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
  /** WHICH HAND ANSWERED. A spawned agent names its model; a shell run and a
   *  battery record `script`, because neither is an agent at all. The retro
   *  cannot weigh whether spawning paid for itself without this. */
  model?: string;
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
  session?: string;
  /** THE STASHED GUESS, CARRIED TO DISK. An agent entry is rebuilt from this
   *  record on every read (see `persisted()` below), so a prediction kept
   *  only in the in-memory `Job` is discarded before `settleOperation` can
   *  ever grade it. Writing it here is what lets the guess survive a reload
   *  and reach the grader at all. */
  predicted_ms?: number;
  predicted_at?: number;
  role?: string;
  last_brief?: string;
  id: string;
  kind?: OperationKind;
  command: string;
  started: number;
  ended?: number;
  exit: number | null;
  running: boolean;
  state?: string;
  milestone?: string;
  progress?: string;
  total?: number;
  steps_done?: number;
  steps_total?: number;
  last_report?: number;
  model?: string;
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
    ...(j.session === undefined ? {} : { session: j.session }),
    ...(j.role === undefined ? {} : { role: j.role }),
    ...(j.last_brief === undefined ? {} : { last_brief: j.last_brief }),
    ...(j.predicted_ms === undefined ? {} : { predicted_ms: j.predicted_ms }),
    ...(j.predicted_at === undefined ? {} : { predicted_at: j.predicted_at }),
    ...(j.ended === undefined ? {} : { ended: j.ended }),
    exit: j.exit,
    running: j.running,
    ...(j.state === undefined ? {} : { state: j.state }),
    ...(j.milestone === undefined ? {} : { milestone: j.milestone }),
    ...(j.progress === undefined ? {} : { progress: j.progress }),
    ...(j.total === undefined ? {} : { total: j.total }),
    ...(j.steps_done === undefined ? {} : { steps_done: j.steps_done }),
    ...(j.steps_total === undefined ? {} : { steps_total: j.steps_total }),
    ...(j.model === undefined ? {} : { model: j.model }),
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
    ...(j.milestone === undefined ? {} : { milestone: j.milestone }),
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
  // A COUNTED HAND IS ESTIMATED FROM ITS OWN CHECKLIST. A spawned agent writes
  // no progress file, so the file-reading path below can never speak for one.
  // Its narration is the only signal it sends, and `noteAlive` turns that into
  // these two counters.
  //
  // THE TWO PAIRS WERE NEVER JOINED UNTIL 2026-08-23. `progress`/`total` are a
  // FILE and a file count; `steps_done`/`steps_total` are a checklist. An agent
  // filled the second pair and was measured against the first, so every hand
  // reported "no comparable work" for its whole life.
  if (j.progress === undefined && j.steps_total !== undefined && j.steps_total > 0 && (j.steps_done ?? 0) > 0) {
    const done = j.steps_done ?? 0;
    const per = (Date.now() - j.started) / done;
    const left = Math.max(0, j.steps_total - done);
    const model = modelOf(j);
    const cal = calibrationFor(model, j.root);
    const remaining = per * left * cal.factor;
    // REMEMBER THE FIRST GUESS SO IT CAN BE GRADED. Only the first: a guess
    // made just before the end is right by construction and teaches nothing.
    if (j.predicted_ms === undefined) {
      j.predicted_ms = remaining;
      j.predicted_at = Date.now();
      // WRITE IT THROUGH NOW. The guard above means this runs once per job,
      // so the estimate stays a cheap read on every later call while the
      // guess still reaches disk, and from there the grader.
      persist(j);
    }
    return {
      remaining_ms: Math.round(remaining),
      basis:
        cal.n >= CALIBRATION_MIN
          ? `${String(done)} of ${String(j.steps_total)} steps reported, corrected by ${cal.factor.toFixed(2)}x from ${String(cal.n)} graded runs of ${model}`
          : `${String(done)} of ${String(j.steps_total)} steps reported, at the pace so far and UNCORRECTED — ${String(cal.n)} of ${String(CALIBRATION_MIN)} graded runs of ${model} needed before the engine trusts a correction`,
    };
  }
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
  const projected = Math.round(now.elapsed / (now.files / j.total));
  const stalled = silentFor >= STALL_AFTER_MS;
  const model = modelOf(j);
  const cal = calibrationFor(model, j.root);
  const remaining = Math.max(0, projected - now.elapsed) * cal.factor;
  // A STALLED FIGURE IS NOT A PREDICTION, so it is not graded. The engine has
  // already said the number is not advancing; scoring it would teach the
  // calibration that this model is slow when what happened was a stall.
  if (j.predicted_ms === undefined && !stalled) {
    j.predicted_ms = remaining;
    j.predicted_at = Date.now();
    persist(j);
  }
  return {
    remaining_ms: Math.round(remaining),
    basis: stalled
      ? `${String(now.files)} of ${String(j.total)} finished, and nothing has finished for ${String(Math.round(silentFor / 1000))}s, so this figure is not advancing`
      : cal.n >= CALIBRATION_MIN
        ? `a projection over ${String(now.files)} of ${String(j.total)} finished, corrected by ${cal.factor.toFixed(2)}x from ${String(cal.n)} graded runs of ${model}`
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
export function anyJobRunning(maxAgeMs?: number): boolean {
  const now = Date.now();
  for (const j of jobs.values()) {
    if (!j.running) continue;
    // A JOB OLDER THAN THE BOUND IS A LEAK, NOT WORK (2026-08-23).
    //
    // WHY THE BOUND EXISTS. A background job that never exits stays `running`
    // for ever, and one of those vetoed the idle shutdown indefinitely. A
    // profiling script that kept a watcher alive held the machine awake for
    // twenty-four minutes and counting, with the walk resting and the log
    // silent, which is exactly the case the shutdown was built for.
    //
    // THE CALLER CHOOSES WHETHER TO APPLY IT. Without a bound this answers the
    // old question unchanged, so a caller that genuinely wants "is anything
    // running at all" still gets it.
    if (maxAgeMs !== undefined && now - j.started > maxAgeMs) continue;
    return true;
  }
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
  /** The model that answered, or `script` where the work was never an agent.
   *  Optional like `status`, so a caller building a row by hand need not know
   *  about it; runningWork always fills it. */
  model?: string;
  /** THE LAST THING THIS HAND SAID IT WAS DOING, for the row's tooltip. */
  last_brief?: string;
  /** Which milestone (M0..M9) the work was registered under, from the rigor
   *  matrix row matching the state at the time it started. Absent for work
   *  outside the milestone spine, or started before a position was known. */
  milestone?: string;
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

/** WHAT ANSWERED FOR THIS JOB.
 *
 *  A SHELL RUN IS NOT AN AGENT and says so. Writing `script` in the same
 *  column keeps the distinction visible rather than leaving a reader to infer
 *  it from a blank.
 *
 *  AN AGENT WITHOUT ONE IS `unreported`, which is a declared absence rather
 *  than a missing field. It only happens for a job registered before the model
 *  was asked for. */
function modelOf(j: Job): string {
  if (j.kind !== "agent") return "script";
  return j.model ?? "unreported";
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
      model: modelOf(j),
      ...(j.last_brief === undefined ? {} : { last_brief: j.last_brief }),
      ...(j.milestone === undefined ? {} : { milestone: j.milestone }),
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

/** NAME WHAT ANSWERS FOR A HAND. Set once, when the hand is registered.
 *
 *  IT RIDES BESIDE openOperation RATHER THAN INSIDE IT, so nothing about the
 *  registry's own shape has to know that agents are special. */
export function noteModel(id: string, model: string, root?: string): boolean {
  const j = jobs.get(id) ?? (root === undefined ? undefined : persisted(root, id));
  if (j === undefined) return false;
  jobs.set(id, j);
  j.model = model;
  persist(j);
  return true;
}

/** NAME WHICH HAND THIS IS. It rides beside noteModel for the same reason:
 *  nothing about the registry's own shape has to know that agents are special.
 *
 *  THE RECORD'S CEILING COUNTS WALKERS AND NOTHING ELSE (owner ruling
 *  2026-08-23). Before this, a reviewer spawned at a gate filled the walking
 *  slot, and the next phase could not start a walker at all — measured the
 *  same day, on the state that stranded the walk. */
export function noteRole(id: string, role: string, root?: string): boolean {
  const j = jobs.get(id) ?? (root === undefined ? undefined : persisted(root, id));
  if (j === undefined) return false;
  jobs.set(id, j);
  j.role = role;
  persist(j);
  return true;
}

/** A DELEGATED HAND'S OWN NARRATION IS ITS PROGRESS REPORT. `statusOf` reads
 *  silence as idle, and nothing else ever touches a spawned agent's
 *  `last_report` — an `update` riding a lane call is the only signal that
 *  hand ever sends, so it stands in for a beat file.
 *
 *  THE NEWEST RUNNING AGENT, because the caller has no job id in hand —
 *  only the fact that some delegated hand just spoke. */
export function noteAlive(op?: string, planned?: number, role?: string, brief?: string): boolean {
  // THE NARRATION BELONGS TO THE HAND THAT SENT IT, and the role is what tells
  // them apart. Matching only "the newest running agent" was right while one
  // hand ran at a time and wrong the moment two did: a working researcher was
  // marked idle because a walker's update refreshed the walker instead.
  //
  // AN UNMATCHED ROLE FALLS BACK TO THE NEWEST, which is the old behaviour and
  // is right for a hand registered before roles existed.
  const agents = [...jobs.values()].filter((j) => j.kind === "agent" && j.running);
  const byRole = role === undefined ? [] : agents.filter((j) => j.role === role);
  const running = byRole.length > 0 ? byRole : agents;
  if (running.length === 0) return false;
  const newest = running.reduce((a, b) => (b.started > a.started ? b : a));
  newest.last_report = Date.now();
  // WHAT IT IS DOING RIGHT NOW, for the row's tooltip. A person hovering wants
  // the LATEST thing the hand said, not the sentence it was spawned with — the
  // spawn line never changes and answers nothing after the first minute.
  if (brief !== undefined && brief.trim() !== "") newest.last_brief = brief.trim();
  // THE CHECKLIST IS THE PROGRESS BAR. A plan says how many steps there are; a
  // resolution says one of them landed. Nothing else a hand does is countable,
  // and asking a hand to report a percentage would be asking it to guess.
  if (op === "plan" && planned !== undefined && planned > 0) {
    // A SECOND PLAN EXTENDS THE WORK, IT DOES NOT RESTART IT. Resetting here
    // made a hand that re-planned mid-flight read as though it had just begun:
    // the total jumped to the new plan's size and the count fell to zero, so
    // the work already finished vanished and the estimate trebled.
    //
    // MEASURED THE DAY IT WAS WRITTEN. A hand given four briefs re-planned
    // three times and reported "1 of 13 steps" after twelve minutes of real
    // work, projecting two hours. The owner did not believe the number, and
    // the number was wrong.
    newest.steps_total = (newest.steps_total ?? 0) + planned;
    newest.steps_done = newest.steps_done ?? 0;
  } else if (op === "done" || op === "obsolete" || op === "revert") {
    newest.steps_done = (newest.steps_done ?? 0) + 1;
    // WORK FOUND WHILE WORKING IS REAL. A total the hand has already passed is
    // the lie, so the total rises to meet the count rather than capping it.
    if (newest.steps_total !== undefined && newest.steps_done > newest.steps_total) {
      newest.steps_total = newest.steps_done;
    }
  }
  persist(newest);
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
  milestone?: string;
  root?: string;
  steps?: number;
  model?: string;
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
    ...(o.milestone === undefined ? {} : { milestone: o.milestone }),
    // STAMPED FROM THE ENVIRONMENT AT REGISTRATION, not read back later — a
    // session that ends leaves no process behind to ask.
    ...(process.env.SE_SESSION === undefined ? {} : { session: process.env.SE_SESSION }),
    out: "",
    err: "",
    ...(o.root === undefined ? {} : { root: o.root }),
    done: Promise.resolve(),
    settle: () => {},
  };
  jobs.set(o.id, j);
  persist(j);
}

/** WHERE PREDICTIONS ARE GRADED. One line per finished job: what the engine
 *  said, what actually happened, and which model was answering.
 *
 *  AN ESTIMATE NOBODY GRADES NEVER GETS BETTER. The first version of this
 *  estimator extrapolated from the pace so far and stopped there, so a hand
 *  that spent its first minutes reading projected hours of work that never
 *  came. Nothing in the system could notice, because nothing compared the
 *  guess to the outcome. */
function estimateLog(root: string): string {
  return join(seDir(root), "estimates.jsonl");
}

/** HOW MANY GRADED RUNS BEFORE THE CORRECTION IS TRUSTED. Below this the
 *  estimate is reported raw and says so, because two samples of a model is
 *  superstition rather than calibration. */
const CALIBRATION_MIN = 3;

/** The parsed grades, per root. Re-read only when a grade is appended — the
 *  estimate is computed on EVERY lane call, and reading the file each time
 *  would put a disk read on the hot path for a number that barely moves. */
let grades: { root: string; rows: { model: string; ratio: number }[] } | null = null;

function gradesFor(root: string): { model: string; ratio: number }[] {
  if (grades !== null && grades.root === root) return grades.rows;
  const rows: { model: string; ratio: number }[] = [];
  let text = "";
  try {
    text = readFileSync(estimateLog(root), "utf8");
  } catch {
    text = "";
  }
  for (const line of text.split("\n")) {
    if (line.trim() === "") continue;
    try {
      const r = JSON.parse(line) as { model?: unknown; ratio?: unknown };
      // A TORN LINE IS SKIPPED, NEVER FATAL. This log is appended to from a
      // process that can be killed mid-write, and a broken estimate must never
      // take a walk down with it.
      if (typeof r.model === "string" && typeof r.ratio === "number" && r.ratio > 0) {
        rows.push({ model: r.model, ratio: r.ratio });
      }
    } catch {}
  }
  grades = { root, rows };
  return rows;
}

/** HOW WRONG THIS MODEL'S ESTIMATES HAVE BEEN, as a multiplier to apply to the
 *  next one. The MEDIAN rather than the mean: one job that hung for an hour
 *  would otherwise set the correction for every job after it. */
function calibrationFor(model: string, root?: string): { factor: number; n: number } {
  if (root === undefined) return { factor: 1, n: 0 };
  const ratios = gradesFor(root)
    .filter((r) => r.model === model)
    .map((r) => r.ratio)
    .sort((a, b) => a - b);
  if (ratios.length < CALIBRATION_MIN) return { factor: 1, n: ratios.length };
  const mid = Math.floor(ratios.length / 2);
  const median = ratios.length % 2 === 1 ? (ratios[mid] ?? 1) : ((ratios[mid - 1] ?? 1) + (ratios[mid] ?? 1)) / 2;
  return { factor: median, n: ratios.length };
}

/** GRADE THE PREDICTION AGAINST WHAT HAPPENED, on the way out.
 *
 *  THE RATIO IS MEASURED FROM WHEN THE PREDICTION WAS MADE, not from when the
 *  job started. The engine said "this much longer" at a moment, and what it
 *  should be graded against is how much longer it actually took FROM THAT
 *  MOMENT. Comparing against the whole duration would grade a different
 *  sentence than the one it said. */
function gradePrediction(j: Job): void {
  if (j.root === undefined || j.predicted_ms === undefined || j.predicted_at === undefined) return;
  const ended = j.ended ?? Date.now();
  const actual = ended - j.predicted_at;
  if (actual <= 0 || j.predicted_ms <= 0) return;
  const record = {
    id: j.id,
    kind: j.kind,
    model: modelOf(j),
    at: new Date(ended).toISOString(),
    predicted_ms: Math.round(j.predicted_ms),
    actual_ms: Math.round(actual),
    ratio: Number((actual / j.predicted_ms).toFixed(4)),
    ...(j.steps_total === undefined ? {} : { steps_total: j.steps_total }),
    ...(j.steps_done === undefined ? {} : { steps_done: j.steps_done }),
  };
  try {
    mkdirSync(seDir(j.root), { recursive: true });
    appendFileSync(estimateLog(j.root), `${JSON.stringify(record)}\n`);
    grades = null;
  } catch {
    // THE GRADE IS A NICETY AND THE SETTLE IS NOT. A job must close even where
    // the record of how well it was predicted cannot be written.
  }
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
  gradePrediction(j);
  persist(j);
}

/** RETIRE THE HANDS OF EVERY OTHER MILESTONE, and say which went.
 *
 *  ONE WALKER PER MILESTONE IS THE ARRANGEMENT (owner ruling 2026-08-23), and
 *  the handover should be visible: the M1 walker goes as the M2 walker
 *  arrives, rather than both standing for ever.
 *
 *  THE ENGINE CANNOT SEE A SPAWNED HAND DIE. The harness owns that process, so
 *  nothing tells the registry it ended and a row can read `running` long after
 *  the agent is gone — measured at 29 minutes on 2026-08-23. Retiring on the
 *  NEXT registration is the one moment the engine reliably learns that the
 *  previous milestone is over.
 *
 *  A HAND WITH NO MILESTONE IS LEFT ALONE. It was registered before the engine
 *  knew its own position, and guessing which phase it belonged to would close
 *  work that may still be running. */
export function retireOtherMilestones(milestone: string): string[] {
  const gone: string[] = [];
  for (const j of jobs.values()) {
    if (j.kind !== "agent" || !j.running) continue;
    if (j.milestone === undefined || j.milestone === milestone) continue;
    j.running = false;
    j.ended = Date.now();
    j.exit = 0;
    j.outcome = "passed";
    gradePrediction(j);
    persist(j);
    gone.push(j.id);
  }
  return gone;
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
