// The process lane: list, stop and cycle the processes SE owns — today the
// board. Foreign processes are refused; the ad-hoc netstat/taskkill era ends.
import { spawnSync } from "node:child_process";
import { Rejection } from "./errors.ts";
import { BOARD_PORT, spawnBoard } from "./board.ts";

const OWNED = new Set(["board"]);

export function assertOwned(target: string): void {
  if (OWNED.has(target)) return;
  throw new Rejection({
    clause: "SE-C-048",
    expected: `an SE-owned process (${[...OWNED].join(", ")})`,
    got: target,
    remedy: { tool: "se_ps", args: { action: "list", target: "board" }, note: "the lane manages only what SE spawned" },
    source: "engine/ps.ts assertOwned",
  });
}

/** The PID listening on the board port, or null. Windows and POSIX netstat shapes. */
export function boardPid(): number | null {
  const r = spawnSync("netstat", ["-ano", "-p", "tcp"], { encoding: "utf8" });
  if (r.status !== 0) return null;
  for (const line of (r.stdout ?? "").split("\n")) {
    const cols = line.trim().split(/\s+/);
    if (cols.length < 2 || !cols[1]?.endsWith(`:${BOARD_PORT}`)) continue;
    const pid = Number(cols[cols.length - 1]);
    if (Number.isFinite(pid) && pid > 0) return pid;
  }
  return null;
}

export function psAction(
  root: string,
  action: "list" | "stop" | "cycle",
  target: string,
): { board: { running: boolean; pid?: number; action?: string } } {
  assertOwned(target);
  const pid = boardPid();
  if (action === "list") return { board: { running: pid !== null, ...(pid !== null ? { pid } : {}) } };
  if (pid !== null) {
    if (process.platform === "win32") spawnSync("taskkill", ["/PID", String(pid), "/F"]);
    else process.kill(pid);
  }
  if (action === "cycle") spawnBoard(root);
  return { board: { running: action === "cycle", action, ...(pid !== null ? { pid } : {}) } };
}
