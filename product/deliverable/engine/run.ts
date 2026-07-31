// se.run — the Bash replacement. Engine-captured: full stdout/stderr/exit
// recorded raw in the call log under the returned ref, so a run is citable
// evidence, never a claim. This lane is the future breakout seam: when the
// state machine lands, run legality becomes a per-state decision.
import { spawn, type ChildProcess } from "node:child_process";
import { CLAUSES, Rejection } from "./errors.ts";
import { resolveInRoot } from "./paths.ts";

export interface RunResult {
  command: string;
  exit: number | null;
  stdout: string;
  stderr: string;
  duration_ms: number;
  truncated: boolean;
}

const OUT_CAP = 30_000;
// CONFIGURABLE, because a fixed budget is somebody's guess about somebody
// else's machine. SE_RUN_TIMEOUT_MS moves the default; SE_RUN_HANDOFF_MS
// moves how long a caller is made to wait before the work goes background.
const DEFAULT_TIMEOUT_MS = Number(process.env.SE_RUN_TIMEOUT_MS ?? 120_000);
const MAX_TIMEOUT_MS = Number(process.env.SE_RUN_TIMEOUT_MAX_MS ?? 600_000);
// NOBODY WAITS LONG (owner ruling, 2026-07-30). A command that outlives this
// is not killed and not waited on — it is HANDED OFF to the background and
// the caller gets a handle immediately.
const DEFAULT_HANDOFF_MS = Number(process.env.SE_RUN_HANDOFF_MS ?? 20_000);

// KILL THE WHOLE TREE, never just the child (found 2026-07-30: a run the
// client gave up on kept a test runner and four descendants alive for
// minutes, competing with everything measured after it). The shell we spawn
// is a parent; killing it leaves its children parented to init and running.
function killTree(pid: number | undefined): void {
  if (pid === undefined) return;
  if (process.platform === "win32") {
    try { spawn("taskkill", ["/PID", String(pid), "/T", "/F"], { windowsHide: true, stdio: "ignore" }); } catch { /* already gone */ }
    return;
  }
  // POSIX: the shell is spawned detached, so it leads its own process group
  // and the negative pid reaches every descendant.
  try { process.kill(-pid, "SIGKILL"); } catch { try { process.kill(pid, "SIGKILL"); } catch { /* already gone */ } }
}

function spawnShell(root: string, command: string, cwd?: string): ChildProcess {
  const shell = process.platform === "win32"
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
  done: Promise<void>;
  settle: () => void;
}
const jobs = new Map<string, Job>();
let jobSeq = 0;

function view(j: Job): JobView {
  const cap = (s: string): string => (s.length > OUT_CAP ? `${s.slice(0, OUT_CAP)}…[+${s.length - OUT_CAP} chars]` : s);
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

function knownJob(id: string): Job {
  const j = jobs.get(id);
  if (j !== undefined) return j;
  throw new Rejection({
    clause: CLAUSES.JOB_UNKNOWN,
    expected: "a job started in this session",
    got: `${id} (unknown)`,
    remedy: { tool: "se_run", args: { jobs: true }, note: "list the jobs this session started" },
    source: "engine/run.ts jobs",
  });
}

/** START a command in the background. Returns at once with a handle. */
export function runBackground(root: string, command: string, opts: { cwd?: string } = {}): JobView {
  const id = `job-${Date.now().toString(36)}-${++jobSeq}`;
  let settle = (): void => {};
  const done = new Promise<void>((res) => { settle = res; });
  const j: Job = { id, command, started: Date.now(), exit: null, running: true, out: "", err: "", done, settle };
  jobs.set(id, j);
  let child: ChildProcess;
  try {
    child = spawnShell(root, command, opts.cwd);
  } catch (e) {
    j.running = false;
    j.ended = Date.now();
    j.err = String((e as Error).message);
    j.settle();
    return view(j);
  }
  j.child = child;
  child.stdout?.setEncoding("utf8");
  child.stderr?.setEncoding("utf8");
  child.stdout?.on("data", (c) => { j.out += c; });
  child.stderr?.on("data", (c) => { j.err += c; });
  child.on("error", (e) => { j.err += String(e); j.running = false; j.ended = Date.now(); j.settle(); });
  child.on("close", (code) => { j.exit = code; j.running = false; j.ended = Date.now(); j.settle(); });
  return view(j);
}

/** ASK a job how it is doing — output so far, whether it still runs. */
export function jobStatus(id: string): JobView {
  return view(knownJob(id));
}

/** STOP a job, and everything it spawned. */
export function jobStop(id: string): JobView {
  const j = knownJob(id);
  if (j.running) {
    killTree(j.child?.pid);
    j.running = false;
    j.ended = Date.now();
  }
  return view(j);
}

/** EVERY job this session started, newest first. */
export function jobList(): JobView[] {
  return [...jobs.values()].sort((a, b) => b.started - a.started).map(view);
}

/** Stop everything still running — the server is going down. */
export function jobStopAll(): void {
  for (const j of jobs.values()) if (j.running) killTree(j.child?.pid);
}

export interface HandedOff extends JobView {
  handed_off: true;
  note: string;
}

/** RUN, and hand off rather than make anyone wait.
 *
 *  A short command answers inline, exactly as before. A long one is not
 *  killed at some arbitrary budget and not waited out either: it keeps
 *  running in the background and the caller gets its handle at once.
 *
 *  This is what a client timeout used to do badly. The client would give up
 *  on the CALL while the command carried on unwatched, so the work was lost
 *  to the caller but still burning the machine. */
export async function runOrHandoff(root: string, command: string, opts: { cwd?: string; handoff_ms?: number } = {}): Promise<RunResult | HandedOff> {
  const handoff = Math.max(1_000, opts.handoff_ms ?? DEFAULT_HANDOFF_MS);
  const start = runBackground(root, command, { cwd: opts.cwd });
  const j = jobs.get(start.job)!;
  let timer: NodeJS.Timeout | undefined;
  await Promise.race([j.done, new Promise<void>((res) => { timer = setTimeout(res, handoff); })]);
  if (timer !== undefined) clearTimeout(timer);
  const v = view(j);
  if (!v.running) {
    return { command, exit: v.exit, stdout: v.stdout, stderr: v.stderr, duration_ms: v.duration_ms, truncated: v.truncated };
  }
  return {
    ...v,
    handed_off: true,
    note: `still running after ${Math.round(handoff / 1000)}s — it moved to the background rather than hold you. Ask again with {job: "${v.job}"}; stop it with {job: "${v.job}", stop: true}.`,
  };
}

// ASYNC, NEVER spawnSync (owner, 2026-07-29: the mirror froze for seconds at
// a time while the agent ran the test suite). spawnSync holds Node's event
// loop for the WHOLE command, and this server IS the mirror — so every long
// run served nothing: no page, no feed, no click.
//
// It is the same defect the expedition archive had, where 380 blocking git
// spawns hung the server rather than just the archive. The script runner was
// converted for exactly this reason; se_run was left behind.
//
// The blocking version also made the freeze look like a rendering bug, since
// the symptom lands wherever the reader happens to click.
export async function run(root: string, command: string, opts: { timeout_ms?: number; cwd?: string } = {}): Promise<RunResult> {
  const timeout = Math.min(opts.timeout_ms ?? DEFAULT_TIMEOUT_MS, MAX_TIMEOUT_MS);
  const started = Date.now();
  // cwd is root-relative; spawnShell resolves it against the ROOT.
  const r = await new Promise<{ status: number | null; stdout: string; stderr: string; error?: Error }>((resolve) => {
    let child;
    try {
      child = spawnShell(root, command, opts.cwd);
    } catch (e) {
      resolve({ status: null, stdout: "", stderr: "", error: e as Error });
      return;
    }
    let out = "";
    let err = "";
    let timedOut = false;
    const timer = setTimeout(() => { timedOut = true; killTree(child.pid); }, timeout);
    child.stdout?.setEncoding("utf8");
    child.stderr?.setEncoding("utf8");
    child.stdout?.on("data", (c) => { out += c; });
    child.stderr?.on("data", (c) => { err += c; });
    child.on("error", (e) => { clearTimeout(timer); resolve({ status: null, stdout: out, stderr: err, error: e }); });
    child.on("close", (code) => {
      clearTimeout(timer);
      const e = timedOut ? Object.assign(new Error("timed out"), { code: "ETIMEDOUT" }) : undefined;
      resolve({ status: code, stdout: out, stderr: err, error: e as Error | undefined });
    });
  });
  const duration = Date.now() - started;
  if (r.error !== undefined && (r.error as NodeJS.ErrnoException).code === "ETIMEDOUT") {
    throw new Rejection({
      clause: CLAUSES.RUN_TIMEOUT,
      expected: `completion within ${timeout}ms`,
      got: `still running (killed)`,
      remedy: { tool: "se_run", args: { command, background: true }, note: "a long command belongs in the background — start it, then ask the job how it is doing" },
      source: "engine/run.ts",
    });
  }
  if (r.error !== undefined) {
    // A spawn failure is a refusal, never a silent exit-null result.
    throw new Rejection({
      clause: CLAUSES.NOT_CONFIGURED,
      expected: "the shell to spawn",
      got: String((r.error as Error).message),
      remedy: { tool: "se_run", args: { command }, note: "check the cwd exists (root-relative) and the shell is available" },
      source: "engine/run.ts",
    });
  }
  const cap = (s: string): string => (s.length > OUT_CAP ? `${s.slice(0, OUT_CAP)}…[+${s.length - OUT_CAP} chars — full output in the call log]` : s);
  return {
    command,
    exit: r.status,
    stdout: cap(r.stdout ?? ""),
    stderr: cap(r.stderr ?? ""),
    duration_ms: duration,
    truncated: (r.stdout ?? "").length > OUT_CAP || (r.stderr ?? "").length > OUT_CAP,
  };
}
