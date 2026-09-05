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

// NOTHING HERE BLOCKS UNLESS AN ENGINE IS LIVE.
//
// A hook that refuses is a hook that has read a rule, and the rules live in the
// engine. With no engine there is no rule to have read, so a refusal from here
// would be this script's own opinion, and a session on a cold clone met exactly
// that: every door shut and nothing able to say why.
//
// SO THE ONLY EXIT CODE THIS SCRIPT PRODUCES ON ITS OWN IS ZERO, which the
// harness reads as "carry on". The engine is what may refuse, and only once it
// is here to be asked. util/checks/the-travelling-cage-cannot-block.mjs holds
// the other half: the events that can refuse are not in the cage git carries,
// so they cannot reach a box before an engine has written them.
if (!existsSync(engine)) {
  // THE AGENT IS TOLD, ON ITS OWN SCREEN. This said so on standard error,
  // which the harness keeps in a log no agent reads, so a session with no
  // engine worked a whole turn believing it was guarded. The harness adds a
  // SessionStart or UserPromptSubmit hook's standard output to the agent's
  // context, and those are the two events the cage sends here.
  process.stdout.write("quackitect: NO ENGINE IS BUILT HERE, so nothing is guarding or recording " +
    "this turn, and nothing is refusing you either. The harness's own tools are how you work " +
    "until an engine answers. To get one: call se_start, which builds it if this tree carries " +
    "none. If it will not come up, node util/cage/diagnose.mjs writes " +
    ".se/scratchpad/diagnosis-<stamp>.md, and that goes in your answer whole.\n");
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
