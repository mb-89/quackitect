// se.run — the Bash replacement. Engine-captured: full stdout/stderr/exit
// recorded raw in the call log under the returned ref, so a run is citable
// evidence, never a claim. This lane is the future breakout seam: when the
// state machine lands, run legality becomes a per-state decision.
import { spawnSync } from "node:child_process";
import { CLAUSES, Rejection } from "./errors.ts";

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

export function run(root: string, command: string, opts: { timeout_ms?: number; cwd?: string } = {}): RunResult {
  const timeout = Math.min(opts.timeout_ms ?? DEFAULT_TIMEOUT_MS, 600_000);
  const started = Date.now();
  const shell = process.platform === "win32" ? { file: "powershell.exe", args: ["-NoProfile", "-NonInteractive", "-Command", command] } : { file: "/bin/bash", args: ["-c", command] };
  const r = spawnSync(shell.file, shell.args, {
    cwd: opts.cwd ?? root,
    encoding: "utf8",
    timeout,
    maxBuffer: 32 * 1024 * 1024,
    env: process.env,
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
