// The board's engine-side half: spawn it, poke it awake. Pokes are
// fire-and-forget — visibility must never block or fail the work lane.
// SE_STATE_DIR set = test or headless state override: no UI side-effects.
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { request } from "node:http";
import { join, resolve } from "node:path";
import { layout } from "./layout.ts";

export const BOARD_PORT = 7346;

export const boardUrl = (): string => `http://localhost:${BOARD_PORT}/`;

/** The board self-guards against double-starts (port in use = already up). */
export function spawnBoard(root: string): void {
  if (process.env.SE_STATE_DIR !== undefined) return;
  const bin = join(layout.deliverable(root), "bin", "se-board.ts");
  if (!existsSync(bin)) return;
  const child = spawn(process.execPath, [bin, "--root", resolve(root)], { detached: true, stdio: "ignore", windowsHide: true });
  child.unref();
}

/** Ask a running board to surface itself; it opens a tab only when no live viewer exists. */
export function pokeBoard(): void {
  if (process.env.SE_STATE_DIR !== undefined) return;
  const req = request({ host: "127.0.0.1", port: BOARD_PORT, path: "/open", method: "POST", timeout: 1500 });
  req.on("error", () => {});
  req.on("timeout", () => req.destroy());
  req.end();
}
