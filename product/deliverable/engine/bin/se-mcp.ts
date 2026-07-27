// se-mcp — the v3 server entry. Node ≥22 runs this directly (native type
// stripping); no build step. The workspace's .mcp.json points here.
//
//   node engine/bin/se-mcp.ts --root <project root> [--autonomy 0.4] [--manual] [--mirror-port 7333]
//
// --root is the QUACKITECT PROJECT root (the folder holding product/ and
// workspace/) — the file lane serves that whole tree, the call log lives in
// <root>/.se/calls.jsonl.
//
// ONE FLAG REGISTRY: this file. The RUNME declares no flags of its own — it
// forwards its whole command line through SE_ARGS (newline-separated),
// because the cage's .mcp.json is fixed template text and cannot carry
// per-launch arguments.
//
// TWO HANDS, ONE SESSION: the MCP lane (stdio) is the agent's hand, the
// embedded mirror (HTTP) is the human's — the same Session, the same walk.
// The autonomy gates only the agent: it enters a state by itself only when
// the state's priority <= autonomy. The slider in the mirror moves it live.
//
// SESSION OVER: anybody reaching end shuts the whole session down — the
// process exits after the closing call is answered.
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { CallLog } from "../calllog.ts";
import { runStdio } from "../mcp.ts";
import { startMirror } from "../mirror.ts";
import { openPanel } from "../panel.ts";
import { seDir } from "../paths.ts";
import { Session } from "../session.ts";
import { buildServer } from "../tools.ts";

const argv = [
  ...process.argv.slice(2),
  ...(process.env.SE_ARGS ?? "").split("\n").map((s) => s.trim()).filter((s) => s !== ""),
];
function argValue(flag: string): string | undefined {
  const i = argv.indexOf(flag);
  return i >= 0 ? argv[i + 1] : undefined;
}

if (argv.some((a) => a === "--help" || a === "-h" || a === "-?")) {
  process.stdout.write(`se-mcp — the quackitect v3 MCP server (stdio JSON-RPC + embedded mirror)

  node engine/bin/se-mcp.ts --root <project root> [--autonomy 0.4] [--manual] [--mirror-port 7333]

  --root         the quackitect project root (holds product/ and workspace/);
                 file lane serves that tree, call log lands in <root>/.se/
  --autonomy     0..1 — which states the AGENT enters by itself (priority <=
                 autonomy). 0: every step is the human's (manual mode);
                 1: fully autonomous. Default 0.4. Env: SE_AUTONOMY.
                 Live-adjustable in the mirror. (--threshold and
                 SE_THRESHOLD are accepted as the old spelling.)
  --manual       alias for --autonomy 0 — you drive every step from the mirror
  --mirror-port  the embedded mirror's HTTP port (the human's hand on the
                 same walk). Default 7333. 0 disables. Env: SE_MIRROR_PORT.
  --help         this text (-h, -?)

  The RUNME forwards its whole command line here (env SE_ARGS) — flags are
  defined once, in this file.
`);
  process.exit(0);
}

const root = resolve(argValue("--root") ?? process.cwd());
if (!existsSync(root)) {
  process.stderr.write(`se-mcp: root does not exist: ${root}\n`);
  process.exit(1);
}

const autonomyRaw =
  argValue("--autonomy") ?? argValue("--threshold") ?? (argv.includes("--manual") ? "0" : undefined) ?? process.env.SE_AUTONOMY ?? process.env.SE_THRESHOLD;
const mirrorPort = Number(argValue("--mirror-port") ?? process.env.SE_MIRROR_PORT ?? 7333);

const session = new Session(root); // fails fast on a misdrawn machine
if (autonomyRaw !== undefined) session.setAutonomy(Number(autonomyRaw)); // refuses out-of-range
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
    const url = `http://localhost:${mirrorPort}/`;
    session.mirrorUrl = url;
    process.stderr.write(`se-mcp: mirror (the human's hand) at ${url}\n`);
    // The server's first act once the panel exists: put it in front of the
    // user (owner ruling 2026-07-27). se_panel reopens it any time.
    openPanel(url);
  });
}

process.stderr.write(`se-mcp 3.0.0-bootstrap root=${root} autonomy=${session.autonomy}\n`);
runStdio(buildServer(root, session));
