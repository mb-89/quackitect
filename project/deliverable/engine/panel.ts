// The panel — the mirror page, put in front of the user. Fire and forget:
// a window is a convenience, the lane never dies over it.
import { spawn } from "node:child_process";

export function openPanel(url: string): void {
  if (process.env.SE_PANEL_DISABLE === "1") return;
  try {
    // A FAILED SPAWN ARRIVES AS AN EVENT, NOT AS A THROW. The try/catch
    // below it only ever caught synchronous failures, and ENOENT is not
    // one: node reports a missing binary by emitting "error" on the child
    // on a later tick, so with no listener it surfaced as an UNCAUGHT
    // exception and took the engine down with it.
    //
    // That is what a headless Linux box does every time — it has no
    // xdg-open — so the server died on startup, respawned on the next
    // request, and died again (first run on a second machine,
    // 2026-08-12). The file's own promise is that the lane never dies over
    // a window; this is that promise actually kept.
    const fire = (cmd: string, args: string[], extra: object = {}) =>
      spawn(cmd, args, { stdio: "ignore", detached: true, ...extra }).on("error", () => {}).unref();
    if (process.platform === "win32") fire("cmd", ["/c", "start", "", url], { windowsHide: true });
    else if (process.platform === "darwin") fire("open", [url]);
    else fire("xdg-open", [url]);
  } catch {
    // the URL prints on the server's stderr either way
  }
}
