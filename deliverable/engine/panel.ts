// The panel — the mirror page, put in front of the user. Fire and forget:
// a window is a convenience, the lane never dies over it.
import { spawn } from "node:child_process";

export function openPanel(url: string): void {
  if (process.env.SE_PANEL_DISABLE === "1") return;
  try {
    // see dsp-mirror-render.md#a-failed-spawn-arrives-as-an-event
    const fire = (cmd: string, args: string[], extra: object = {}) =>
      spawn(cmd, args, { stdio: "ignore", detached: true, ...extra })
        .on("error", () => {})
        .unref();
    if (process.platform === "win32") fire("cmd", ["/c", "start", "", url], { windowsHide: true });
    else if (process.platform === "darwin") fire("open", [url]);
    else fire("xdg-open", [url]);
  } catch {
    // the URL prints on the server's stderr either way
  }
}
