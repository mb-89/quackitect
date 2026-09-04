// THE TOOL LANE, STARTED FROM A FRESH CLONE.
//
// A cloud session cloned this tree and could not make a first move. The harness
// read .mcp.json, tried to spawn the tool lane, and answered ENOENT. With no
// lane there is no se_answer, no se_stop and no se_pull, so every guard refused
// every call and named a tool that was not there. The session had no door.
//
// THE CONFIG NAMED A BUILD ARTEFACT. .bin is not in version control, and the
// harness reads the MCP config and spawns the server before SessionStart can
// run the installer. So the one file that decides whether an agent has a lane
// pointed at something a clone does not carry.
//
// SO IT NAMES THIS, WHICH GIT CARRIES. It builds what is missing and hands over.
//
// WHY node AND NOT sh. This has to start on a Linux container and on a Windows
// desktop from one committed line. A shell script needs sh on PATH, and Git for
// Windows does not put it there. node is on PATH wherever Claude Code runs,
// because Claude Code runs on it.
//
//   node util/cage/mcp-lane.mjs --method . --work .
import { existsSync } from "node:fs";
import { spawn, spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

// BOTH NAMES ARE THE SAME FILE once the installer has linked them, and before
// it has, only the platform's own name is there.
const exe = join(root, ".bin", process.platform === "win32" ? "se-mcp.exe" : "se-mcp");

// STANDARD OUTPUT IS THE PROTOCOL. Everything this script says goes to standard
// error, or the harness reads it as a message from the server.
const say = (line) => process.stderr.write("quackitect: " + line + "\n");

if (!existsSync(exe)) {
  say("nothing is built here yet, so the tool lane is being built. This takes a few minutes once.");
  // THE INSTALLER IS THE BUILD. Asking go build directly here would be a second
  // place that knows how this tree compiles, and it would miss the C compiler
  // the installer pins for the engine's SQLite.
  spawnSync("sh", [join(root, "util", "setup", "install.sh"), "--profile", "headless"],
    { stdio: ["ignore", 2, 2] });
}

if (!existsSync(exe)) {
  say("se-mcp could not be built, so this session has no tool lane. Run util/setup/install.sh and start again.");
  process.exit(1);
}

// stdio is inherited, so the server speaks to the harness directly and nothing
// here sits between them.
const lane = spawn(exe, process.argv.slice(2), { stdio: "inherit" });
lane.on("error", (err) => {
  say("the tool lane would not start: " + err.message);
  process.exit(1);
});
lane.on("exit", (code, signal) => process.exit(signal ? 1 : code ?? 0));
