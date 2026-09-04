// A WINDOW SAYS IT IS HERE, THE WAY THE ENGINE DOES.
//
// The engine writes its pid to .se/engine.json, and whatIsRunning proves that
// process is alive with signal 0. A window needs the same thing about other
// windows. Closing one has to leave the engine alone while another is still
// watching it, and nothing in the editor is shared between windows.
//
// NO HEARTBEAT. The engine beats because it can be there and not answering.
// An extension host cannot be: it is a process, and signal 0 says whether it
// is one. So a window writes a file when it opens and deletes it when it
// closes, and a file whose pid does not answer is a window that crashed.
//
// THE PID IS THE NAME OF THE FILE. Two files for one window would read as two
// windows, so the name is the thing there is exactly one of.
//
// A PID CAN BE REUSED, and then a crashed window reads as a live one. The
// engine's own whatIsRunning has carried that same exposure since it was
// written, and the sweep below keeps the window from outlasting a reboot.
import * as fs from "node:fs";
import * as path from "node:path";

export type Window = { pid: number };

const SUFFIX = ".json";

function dir(work: string): string {
  return path.join(work, ".se", "windows");
}

// NOTHING HERE THROWS. A window that cannot say it is here still works, and
// what it costs is an engine that outlives it. That is what happened before
// any of this existed, so it is the floor rather than a new failure.
export function sayWindowIsHere(work: string, pid: number): void {
  try {
    fs.mkdirSync(dir(work), { recursive: true });
    fs.writeFileSync(path.join(dir(work), pid + SUFFIX), JSON.stringify({ pid }), "utf8");
  } catch {
    /* the last window out ends the engine, and this one will not be counted */
  }
}

export function forgetWindow(work: string, pid: number): void {
  try {
    fs.rmSync(path.join(dir(work), pid + SUFFIX));
  } catch {
    /* it was never written, or a sweep took it first */
  }
}

// EVERY WINDOW BUT THIS ONE. The name is read rather than what is inside the
// file, because the name is the one thing a half-finished write cannot spoil.
// A name that is not a pid is not a window.
export function windowsThere(work: string, self: number): Window[] {
  let names: string[] = [];
  try {
    names = fs.readdirSync(dir(work));
  } catch {
    return [];
  }
  const out: Window[] = [];
  for (const name of names) {
    if (!name.endsWith(SUFFIX)) continue;
    const pid = Number(name.slice(0, name.length - SUFFIX.length));
    if (!Number.isInteger(pid) || pid <= 0 || pid === self) continue;
    out.push({ pid });
  }
  return out;
}

// A PROCESS EITHER ANSWERS OR IT DOES NOT. Signal 0 sends nothing and asks.
export function windowAnswers(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

// AND WHAT A WINDOW THAT CRASHED LEFT BEHIND. A file nobody deletes is a
// window for ever, and then no window is ever the last one out.
export function sweepWindowsGone(work: string, self: number): number {
  let swept = 0;
  for (const w of windowsThere(work, self)) {
    if (windowAnswers(w.pid)) continue;
    forgetWindow(work, w.pid);
    swept++;
  }
  return swept;
}
