// The panel — the mirror page, put in front of the user. Fire and forget:
// a window is a convenience, the lane never dies over it.
import { spawn } from "node:child_process";

/** Hand a URL or a folder to the host's own opener, and survive its absence.
 *
 *  see dsp-mirror-render.md#a-failed-spawn-arrives-as-an-event
 *
 *  THE ERROR LISTENER IS THE WHOLE POINT. A spawn of a missing binary emits
 *  `error` on a later tick. With no listener node re-throws it as an uncaught
 *  exception, and the engine's own handler turns that into an exit — so one
 *  click takes the lane and its in-memory session down. A headless box has no
 *  `xdg-open`, which makes that the ordinary case rather than the rare one. */
export function openInHost(target: string): void {
  try {
    const fire = (cmd: string, args: string[], extra: object = {}) =>
      spawn(cmd, args, { stdio: "ignore", detached: true, ...extra })
        .on("error", () => {})
        .unref();
    if (process.platform === "win32") fire("cmd", ["/c", "start", "", target], { windowsHide: true });
    else if (process.platform === "darwin") fire("open", [target]);
    else fire("xdg-open", [target]);
  } catch {
    // the target prints on the server's stderr either way
  }
}

export function openPanel(url: string): void {
  if (process.env.SE_PANEL_DISABLE === "1") return;
  openInHost(url);
}
