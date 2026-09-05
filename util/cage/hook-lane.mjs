// THE GUARD'S COMMAND HOOKS, STARTED FROM A FRESH CLONE.
//
// THE SAME DEFECT THE TOOL LANE HAD, in the other file the harness reads before
// anything here is built. The cage named .bin/se for its SessionStart hook and
// for the wake on every prompt, and .bin is not in version control. So on a
// clone both were a path to nothing: the harness reported a hook that would not
// start, once at the beginning of the session and once for every prompt after,
// and no hook can repair this because the harness spawns the tool lane before
// SessionStart runs at all.
//
// SO THE CAGE NAMES THIS, WHICH GIT CARRIES, and this names the engine.
//
// A GUARD THAT IS NOT BUILT YET ALLOWS. It is the rule the engine already holds
// for a guard that cannot reach a record: a broken guard must not stop a person
// from working, and it says so where the record can carry it. The tool lane is
// building the engine while this runs, so the answer is right for a minute and
// then stops being needed.
//
// WHY node AND NOT sh, and why this is a second file rather than a flag on the
// tool lane: see util/cage/mcp-lane.mjs. One speaks JSON-RPC on a pipe that
// stays open, and this answers one event and exits.
//
//   node util/cage/hook-lane.mjs hook --method .
import { existsSync } from "node:fs";
import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const engine = join(root, ".bin", process.platform === "win32" ? "se.exe" : "se");

if (!existsSync(engine)) {
  // THE AGENT IS TOLD, ON ITS OWN SCREEN. This said so on standard error,
  // which the harness keeps in a log no agent reads, so a session with no
  // engine worked a whole turn believing it was guarded. The harness adds a
  // SessionStart or UserPromptSubmit hook's standard output to the agent's
  // context, and those are the two events the cage sends here.
  process.stdout.write("quackitect: NO ENGINE IS BUILT HERE, so this turn is neither guarded nor " +
    "recorded. On a cold clone the tool lane is building it: wait a minute, then call se_status. " +
    "If it stays down, get a diagnosis out: node util/cage/diagnose.mjs writes " +
    ".se/scratchpad/diagnosis-<stamp>.md, and it goes in your answer whole.\n");
  process.exit(0);
}

// THE EVENT COMES IN ON STANDARD INPUT AND THE DECISION GOES OUT ON STANDARD
// OUTPUT, so stdio is inherited and nothing here sits between the harness and
// the guard.
const guard = spawn(engine, process.argv.slice(2), { stdio: "inherit" });
guard.on("error", (err) => {
  process.stderr.write("quackitect: the guard would not start: " + err.message + "\n");
  process.exit(0); // a guard that will not start must not stop the call
});
guard.on("exit", (code, signal) => process.exit(signal ? 0 : code ?? 0));
