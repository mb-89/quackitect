// AN ENGINE OVER A THROWAWAY FOLDER, FOR A CHECK THAT DRIVES VERBS.
//
// A verb typed at a prompt runs in the engine that lives over the folder,
// so a check that runs verbs against a folder of its own needs an engine
// there. This starts one the way the wake does, waits until it answers, and
// stops it when the check ends.
//
//   import { liveEngine } from "./lib/engine.mjs";
//   liveEngine(root, work);
import { spawn } from "node:child_process";
import { readFileSync, mkdirSync, openSync } from "node:fs";
import { join } from "node:path";

// THE BUDGET IS THE BATTERY'S, NOT A QUIET MACHINE'S. Alone an engine is up in
// under two seconds. Under the battery, with the suites building and three
// of these starting at once on a throttled box, it took longer than ten, and
// a check that gave up then reported an engine that was a moment away.
const upBudget = 60000;

export function liveEngine(root, work) {
  // THE ENGINE IS THE ONE HANDED IN, when one is. se test hands a check the
  // engine the Go tests get in SE_ENGINE, built fresh from the tree when the
  // one in .bin is older than its source, so a check over a folder of its own
  // drives the source it was written against and answers the same before and
  // after a swap. Run by hand, with nothing handed in, it is .bin/se as before.
  const engine = process.env.SE_ENGINE || join(root, ".bin", process.platform === "win32" ? "se.exe" : "se");
  // What the engine says goes to a file beside its record, so a start that
  // fails can be read rather than guessed at.
  mkdirSync(join(work, ".se"), { recursive: true });
  const out = openSync(join(work, ".se", "engine.out"), "a");
  const daemon = spawn(engine, ["--work", work, "--method", root], { stdio: ["ignore", out, out] });
  const until = Date.now() + upBudget;
  let up = false;
  while (Date.now() < until) {
    try {
      const v = JSON.parse(readFileSync(join(work, ".se", "engine.json"), "utf8"));
      if (v.socket) { up = true; break; }
    } catch { /* not yet */ }
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 100);
  }
  process.on("exit", () => { try { daemon.kill(); } catch { /* already gone */ } });
  if (!up) {
    let said = "";
    try { said = readFileSync(join(work, ".se", "engine.out"), "utf8").slice(-600); } catch { /* nothing said */ }
    console.log("FAIL no engine came up over " + work + " in " + upBudget / 1000 + " s, so nothing below can run a verb\n      " + said);
    process.exit(1);
  }
  return () => { try { daemon.kill(); } catch { /* already gone */ } };
}
