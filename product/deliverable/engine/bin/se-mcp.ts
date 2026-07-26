// se-mcp — the v3 server entry. Node ≥22 runs this directly (native type
// stripping); no build step. The workspace's .mcp.json points here.
//
//   node engine/bin/se-mcp.ts --root <project root> [--threshold 0.5] [--mirror-port 7333]
//
// --root is the QUACKITECT PROJECT root (the folder holding product/ and
// workspace/) — the file lane serves that whole tree, the call log lives in
// <root>/.se/calls.jsonl.
//
// TWO HANDS, ONE SESSION: the MCP lane (stdio) is the agent's hand, the
// embedded mirror (HTTP) is the human's — the same Session, the same walk.
// The threshold gates only the agent: it enters a state by itself only when
// the state's priority <= threshold. The slider in the mirror moves it live.
//
// SESSION OVER: anybody reaching end shuts the whole session down — the
// process exits after the closing call is answered.
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { CallLog } from "../calllog.ts";
import { runStdio } from "../mcp.ts";
import { startMirror } from "../mirror.ts";
import { seDir } from "../paths.ts";
import { Session } from "../session.ts";
import { buildServer } from "../tools.ts";

function argValue(flag: string): string | undefined {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

if (process.argv.some((a) => a === "--help" || a === "-h" || a === "-?")) {
  process.stdout.write(`se-mcp — the quackitect v3 MCP server (stdio JSON-RPC + embedded mirror)

  node engine/bin/se-mcp.ts --root <project root> [--threshold 0.5] [--mirror-port 7333]

  --root         the quackitect project root (holds product/ and workspace/);
                 file lane serves that tree, call log lands in <root>/.se/
  --threshold    0..1 — which states the AGENT enters by itself (priority <=
                 threshold). 0: every step is the human's (manual mode);
                 1: fully autonomous. Default 0.5. Env: SE_THRESHOLD.
                 Live-adjustable in the mirror.
  --mirror-port  the embedded mirror's HTTP port (the human's hand on the
                 same walk). Default 7333. 0 disables. Env: SE_MIRROR_PORT.
  --help         this text (-h, -?)
`);
  process.exit(0);
}

const root = resolve(argValue("--root") ?? process.cwd());
if (!existsSync(root)) {
  process.stderr.write(`se-mcp: root does not exist: ${root}\n`);
  process.exit(1);
}

const thresholdRaw = argValue("--threshold") ?? process.env.SE_THRESHOLD;
const mirrorPort = Number(argValue("--mirror-port") ?? process.env.SE_MIRROR_PORT ?? 7333);

const session = new Session(root); // fails fast on a misdrawn machine
if (thresholdRaw !== undefined) session.setThreshold(Number(thresholdRaw)); // refuses out-of-range
// SESSION OVER — reaching end stops everything. The grace period lets the
// closing tool response flush to stdout and the mirror serve its red page.
session.onClosed = () => {
  process.stderr.write("se-mcp: the machine reached end — session over, shutting down\n");
  setTimeout(() => process.exit(0), 1500);
};

if (mirrorPort > 0) {
  const log = new CallLog(seDir(root));
  const mirror = startMirror({ session, root, port: mirrorPort, log, mode: "agent" });
  // A second agent on the same machine (worktree concurrency) must not die
  // over the mirror port — the MCP lane matters more than the window.
  mirror.on("error", (e) => {
    process.stderr.write(`se-mcp: mirror not started (${(e as NodeJS.ErrnoException).code ?? e.message}) — pass --mirror-port to pick another port\n`);
  });
  mirror.on("listening", () => {
    process.stderr.write(`se-mcp: mirror (the human's hand) at http://localhost:${mirrorPort}\n`);
  });
}

process.stderr.write(`se-mcp 3.0.0-bootstrap root=${root} threshold=${session.threshold}\n`);
runStdio(buildServer(root, session));
