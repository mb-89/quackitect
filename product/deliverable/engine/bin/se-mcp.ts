// se-mcp — the v3 server entry: a stable stdio SHIM plus the engine CHILD.
// Node ≥22 runs this directly (native type stripping); no build step. The
// workspace's .mcp.json points here.
//
//   node engine/bin/se-mcp.ts --root <project root> [--autonomy 0.4] [--mirror-port 7333]
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
// ORDERED RELOADS ONLY (owner ruling 2026-07-27, after automatic swaps
// churned the walk): the shim holds the harness connection and forwards
// JSON-RPC lines; the CHILD runs the engine, the session, and the mirror.
// The shim NEVER watches sources and never swaps on its own. se_reload —
// canary-guarded, idle-only, either hand — makes the child exit with code
// 42; the shim reads that as "respawn me on the new sources". The walk
// reboots; boot re-proves the new engine green. SE_HOT_DISABLE=1 runs the
// engine in-process instead (tests, debugging) — then a reload needs a
// harness reconnect.
//
// TWO HANDS, ONE SESSION: the MCP lane (stdio) is the agent's hand, the
// embedded mirror (HTTP) is the human's — the same Session, the same walk.
// The autonomy gates only the agent; the slider in the mirror moves it live.
//
// SESSION OVER: anybody reaching end shuts the whole session down — the
// child exits deliberately (code 0) and the shim follows it down.
import { spawn, type ChildProcess } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { createInterface } from "node:readline";
import { fileURLToPath } from "node:url";

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

  node engine/bin/se-mcp.ts --root <project root> [--autonomy 0.4] [--mirror-port 7333]

  --root         the quackitect project root (holds product/ and workspace/);
                 file lane serves that tree, call log lands in <root>/.se/
  --autonomy     0..1 — which states the AGENT enters by itself (priority <=
                 autonomy). 0: every step is the human's (manual mode);
                 1: fully autonomous. Default 0.4. Env: SE_AUTONOMY.
                 Live-adjustable in the mirror. (--threshold and
                 SE_THRESHOLD are accepted as the old spelling.)
                 RUNME's --manual is a DIFFERENT thing: no agent at all.
  --mirror-port  the embedded mirror's HTTP port (the human's hand on the
                 same walk). Default 7333. 0 disables. Env: SE_MIRROR_PORT.
  --child        INTERNAL, never typed by hand. The shim spawns itself with
                 it to run the engine proper. SE_HOT_DISABLE=1 does the same
                 in one process.
  --help         this text (-h, -?)

  RELOAD: se_reload (agent or mirror hand, at idle only) restarts the
  engine onto the current sources without a reconnect — the walk reboots.
  Nothing ever swaps on its own. SE_HOT_DISABLE=1 runs in-process instead.

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

const mirrorPort = Number(argValue("--mirror-port") ?? process.env.SE_MIRROR_PORT ?? 7333);

if (argv.includes("--child") || process.env.SE_HOT_DISABLE === "1") {
  // ── THE CHILD — the engine proper. Dynamic imports keep the shim free
  //    of the engine's module graph: a broken engine breaks the child (the
  //    reload canary catches it first), never the standing connection. ────
  const { CallLog } = await import("../calllog.ts");
  const { runStdio } = await import("../mcp.ts");
  const { startMirror } = await import("../mirror.ts");
  const { openPanel } = await import("../panel.ts");
  const { seDir } = await import("../paths.ts");
  const { Session } = await import("../session.ts");
  const { buildServer } = await import("../tools.ts");

  const autonomyRaw =
    argValue("--autonomy") ?? argValue("--threshold") ?? process.env.SE_AUTONOMY ?? process.env.SE_THRESHOLD;

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
      // The server's first act once the panel exists: put it in front of
      // the user — but only once per session, not on every reload (the
      // open page reloads itself). se_panel reopens it any time.
      if (process.env.SE_PANEL_SUPPRESS !== "1") openPanel(url);
    });
  }

  process.stderr.write(`se-mcp 3.0.0-bootstrap root=${root} autonomy=${session.autonomy}\n`);
  runStdio(buildServer(root, session));
} else {
  // ── THE SHIM — dumb on purpose: it never imports the engine and never
  //    watches sources. It spawns the child, forwards lines, and respawns
  //    ONLY when the child asks (exit 42 = se_reload) or crashed. ─────────
  const binDir = dirname(fileURLToPath(import.meta.url));
  let child: ChildProcess | null = null;
  let spawnedOnce = false;
  // THE SESSION'S NAME. The shim's life IS the session: it survives every
  // reload (exit 42) and dies with a deliberate end (exit 0). Stamping the
  // settings store with this makes a reload keep the sliders while a fresh
  // start falls back to the defaults — with no cleanup step to forget.
  const sessionToken = `${process.pid}-${Date.now().toString(36)}`;
  const pending = new Set<number | string>();

  const ensureChild = (): ChildProcess => {
    if (child === null) {
      const c = spawn(process.execPath, [join(binDir, "se-mcp.ts"), ...process.argv.slice(2), "--child"], {
        stdio: ["pipe", "pipe", "inherit"],
        env: { ...process.env, SE_SESSION: sessionToken, ...(spawnedOnce ? { SE_PANEL_SUPPRESS: "1" } : {}) },
        windowsHide: true,
      });
      spawnedOnce = true;
      c.on("exit", (code) => {
        if (child === c) child = null;
        if (code === 42) {
          // se_reload: respawn EAGERLY so the mirror is back before the
          // next request or F5.
          process.stderr.write("se-mcp: reload ordered — respawning the engine on the current sources\n");
          setTimeout(() => void ensureChild(), 100);
        } else if (code === 0) {
          // Deliberate exit = SESSION OVER (the machine reached end).
          setTimeout(() => process.exit(0), 200);
        } else {
          process.stderr.write(`se-mcp: engine child exited (${code ?? "signal"}) — respawning on the next request\n`);
        }
      });
      createInterface({ input: c.stdout!, terminal: false }).on("line", (line) => {
        try {
          const id = (JSON.parse(line) as { id?: number | string | null }).id;
          if (id !== undefined && id !== null) pending.delete(id);
        } catch {
          return; // non-JSON child noise never reaches the harness
        }
        process.stdout.write(line + "\n");
      });
      child = c;
    }
    return child;
  };

  const rl = createInterface({ input: process.stdin, terminal: false });
  rl.on("line", (line) => {
    if (line.trim() === "") return;
    const c = ensureChild();
    try {
      const id = (JSON.parse(line) as { id?: number | string | null }).id;
      if (id !== undefined && id !== null) pending.add(id);
    } catch {
      // the child answers parse errors itself
    }
    c.stdin!.write(line + "\n");
  });
  rl.on("close", () => {
    // Drain: answers already owed still flow home before the lights go out.
    const started = Date.now();
    const drain = setInterval(() => {
      if (pending.size === 0 || Date.now() - started > 3000) {
        clearInterval(drain);
        child?.kill();
        process.exit(0);
      }
    }, 50);
  });

  process.stderr.write(`se-mcp shim: ordered reloads only (se_reload at idle) root=${root}\n`);
  ensureChild(); // eager: the mirror and the panel come up before the first request
}
