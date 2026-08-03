// THE SERVER DIES WITH THE WINDOW THAT STARTED IT.
//
// The symptom this pins is a quiet one: a new morning opened with yesterday's
// autonomy still set and yesterday's documents still checked. Neither survives
// a restart — the checks are an in-memory map, written to no file — so the
// only explanation was that nothing had restarted. An old server was still
// running and the new session attached to it (found live 2026-07-30).
//
// A host's goodbye is not enough by itself. VS Code calls deactivate only on
// an orderly close, so a killed or crashed window never says anything. So the
// server watches its parent rather than waiting to be told, and the shell
// kills the process TREE rather than the handle it happens to hold.
//
// WHAT IS CHECKED HERE, AND WHAT IS NOT. This is the wiring: that both ends of
// the contract exist and agree. It is fast and it catches the regression that
// really happens — somebody edits one side and not the other.
//
// It does NOT watch a real server exit. That test was written and withdrawn:
// driving it needs a stand-in parent whose handle nobody holds, because a
// parent still held open by its spawner stays signalable and the watchdog is
// right not to fire. The probe the watchdog rests on was verified directly on
// Windows instead — process.kill(pid, 0) answered ALIVE before a taskkill and
// threw ESRCH after it. A full end-to-end test wants a spawned harness of its
// own, and is worth writing when this mechanism next changes.
import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const deliverable = join(fileURLToPath(new URL(".", import.meta.url)), "..");

test("the VS Code shell tells the server which window owns it", () => {
  const ext = readFileSync(join(deliverable, "vscode", "extension.js"), "utf8");
  assert.match(ext, /SE_PARENT_PID:\s*String\(process\.pid\)/, "the shell must pass its own pid to the server");
});

test("deactivate kills the process tree, not just the handle it holds", () => {
  const ext = readFileSync(join(deliverable, "vscode", "extension.js"), "utf8");
  // On Windows the handle is the shell we spawned through. Killing it leaves
  // the node process — and everything that process started — holding the port.
  assert.match(ext, /taskkill/, "deactivate must take the whole tree down");
  assert.match(ext, /"\/T"/, "the tree flag is what reaches the grandchildren");
});

test("the server watches the window that owns it", () => {
  const mcp = readFileSync(join(deliverable, "engine", "bin", "se-mcp.ts"), "utf8");
  assert.match(mcp, /SE_PARENT_PID/, "the server must read the pid of the window that owns it");
  assert.match(mcp, /process\.kill\(parentPid, 0\)/, "liveness is asked with signal 0, which delivers nothing");
});

test("a server with no declared parent keeps running", () => {
  // The classic launcher detaches its terminal host on purpose, so that it
  // survives the window that started it. The watchdog must not break that.
  const mcp = readFileSync(join(deliverable, "engine", "bin", "se-mcp.ts"), "utf8");
  assert.match(mcp, /parentPid > 0/, "the watch is armed only when a parent was actually declared");
});
