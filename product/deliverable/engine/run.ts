// se.run — the Bash replacement. Engine-captured: full stdout/stderr/exit
// recorded raw in the call log under the returned ref, so a run is citable
// evidence, never a claim. This lane is the future breakout seam: when the
// state machine lands, run legality becomes a per-state decision.
import { spawn } from "node:child_process";
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
const DEFAULT_TIMEOUT_MS = 120_000;

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
  const timeout = Math.min(opts.timeout_ms ?? DEFAULT_TIMEOUT_MS, 600_000);
  const started = Date.now();
  const shell = process.platform === "win32" ? { file: "powershell.exe", args: ["-NoProfile", "-NonInteractive", "-Command", command] } : { file: "/bin/bash", args: ["-c", command] };
  // cwd is root-relative — resolved against the ROOT, never the server's
  // own working directory (a relative cwd once made spawn fail silently).
  const r = await new Promise<{ status: number | null; stdout: string; stderr: string; error?: Error }>((resolve) => {
    let child;
    try {
      child = spawn(shell.file, shell.args, {
        cwd: opts.cwd === undefined ? root : resolveInRoot(root, opts.cwd, "engine/run.ts"),
        env: process.env,
        windowsHide: true,
      });
    } catch (e) {
      resolve({ status: null, stdout: "", stderr: "", error: e as Error });
      return;
    }
    let out = "";
    let err = "";
    let timedOut = false;
    const timer = setTimeout(() => { timedOut = true; child.kill(); }, timeout);
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
      remedy: { tool: "se_run", args: { command, timeout_ms: timeout * 2 }, note: "raise the budget or split the command" },
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
