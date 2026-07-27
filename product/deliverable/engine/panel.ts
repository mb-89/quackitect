// The panel — the mirror page, put in front of the user. Fire and forget:
// a window is a convenience, the lane never dies over it.
import { spawn } from "node:child_process";

export function openPanel(url: string): void {
  if (process.env.SE_PANEL_DISABLE === "1") return;
  try {
    if (process.platform === "win32") spawn("cmd", ["/c", "start", "", url], { stdio: "ignore", windowsHide: true, detached: true }).unref();
    else if (process.platform === "darwin") spawn("open", [url], { stdio: "ignore", detached: true }).unref();
    else spawn("xdg-open", [url], { stdio: "ignore", detached: true }).unref();
  } catch {
    // the URL prints on the server's stderr either way
  }
}
