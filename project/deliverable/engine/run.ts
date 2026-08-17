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
// KILL THE WHOLE TREE, never just the child (found 2026-07-30: a run the
// client gave up on kept a test runner and four descendants alive for
// minutes, competing with everything measured after it). The shell we spawn
// is a parent; killing it leaves its children parented to init and running.
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
export interface JobView {
  job: string;
  command: string;
  running: boolean;
  exit: number | null;
  duration_ms: number;
  stdout: string;
  stderr: string;
  truncated: boolean;
}
interface Job {
  id: string;
  command: string;
  started: number;
  ended?: number;
  exit: number | null;
  running: boolean;
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
  command: string;
  started: number;
  ended?: number;
  exit: number | null;
  running: boolean;
  pid?: number;
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
    command: j.command,
    started: j.started,
    ...(j.ended === undefined ? {} : { ended: j.ended }),
    exit: j.exit,
    running: j.running,
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
    command: j.command,
    running: j.running,
    exit: j.exit,
    duration_ms: (j.ended ?? Date.now()) - j.started,
    stdout: cap(j.out),
    stderr: cap(j.err),
    truncated: j.out.length > OUT_CAP || j.err.length > OUT_CAP,
  };
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
export function startJob(command: string, spawnFn: () => ChildProcess, root?: string): JobView {
  const id = `job-${Date.now().toString(36)}-${++jobSeq}`;
  let settle = (): void => {};
  const done = new Promise<void>((res) => {
    settle = res;
  });
  const j: Job = { id, command, started: Date.now(), exit: null, running: true, out: "", err: "", root, done, settle };
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
  return [...found.values()].sort((a, b) => b.started - a.started).map(view);
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
