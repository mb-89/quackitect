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
  process.stdout.write(`se — quackitect v3. ONE help for the whole system.

  .\\RUNME.ps1 [launch flags] [engine flags...]      — the normal way in
  node engine/bin/se-mcp.ts --root <root> [--autonomy 0.4]   — the server alone

LAUNCH — read by RUNME.ps1 before the server starts.

  These are listed HERE, with everything else, because two half-lists are
  worse than one whole one. RUNME consumes them and the server never sees
  them; every other argument is forwarded on to the engine flags below.

  --own-terminal run the agent in THIS window instead, on its own terminal.
                 The Mirror's terminal pane stays empty.
  --manual       no LLM: open the Mirror alone and walk every step yourself.
                 This also happens by itself when no claude CLI is found.
                 The engine's --autonomy 0 is a DIFFERENT thing: an agent
                 is running, it just may not step by itself.
  --one-screen   the old spelling of today's default. Accepted, does nothing.
  --kill         stop every leftover quackitect process and exit, launching
                 nothing (-Kill). Finds the server, the terminal host and the
                 manual mirror by command line AND by listening port (7333,
                 7334), kills each with its children, then checks the ports
                 really came free. Finding nothing running is a success.
  --vscode       VS Code as the host: install VS Code if missing, place the
                 extension (a folder copy — no marketplace), and open VS
                 Code on workspace\\. The extension owns the server from
                 there: engine npm install, attach configs, headless lane.
  --export <dir> copy the WORKING TREE into <dir> as a fresh single-commit
                 repository and exit, launching nothing. History stays home:
                 .git, .worktrees, .se, node_modules and the generated cage
                 files are left behind; the target must be empty. The new
                 repo carries a local commit identity, so it runs anywhere:
                 cd <dir>; .\\RUNME.ps1

ENGINE — read by the server (this file is where they are defined).

  --root         the quackitect project root (holds product/ and workspace/);
                 file lane serves that tree, call log lands in <root>/.se/
  --autonomy     0..1 — which states the AGENT enters by itself (priority <=
                 autonomy). 0: every step is the human's; 1: fully autonomous.
                 Default 0.4. Env: SE_AUTONOMY. Live-adjustable in the mirror.
                 (--threshold and SE_THRESHOLD are the old spelling.)
  --mirror-port  the embedded mirror's HTTP port (the human's hand on the
                 same walk). Default 7333. 0 disables. Env: SE_MIRROR_PORT.
  --headless     no stdio lane — agents attach over HTTP instead, at /mcp
                 on the mirror port. For a host that OWNS the process and
                 lets harnesses attach (the VS Code extension spawns the
                 server this way). The mirror stays enabled.
  --child        INTERNAL, never typed by hand. The shim spawns itself with
                 it to run the engine proper. SE_HOT_DISABLE=1 does the same
                 in one process.
  --help         this text (-h, -?, -Help)

  RELOAD: se_reload (agent or mirror hand, at idle only) restarts the
  engine onto the current sources without a reconnect — the walk reboots.
  Nothing ever swaps on its own. SE_HOT_DISABLE=1 runs in-process instead.
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
    // THE SESSION CLEANS UP AFTER ITSELF (owner, 2026-07-30): tell the
    // terminal host to end the agent — politely, then by force — so end
    // leaves no strays holding the ports. No host answering is fine:
    // own-terminal and manual runs have nothing to clean.
    const ptyPort = Number(process.env.SE_PTY_PORT ?? 7334);
    void fetch(`http://localhost:${ptyPort}/pty/end`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ reason: "the machine reached end" }),
    }).catch(() => {});
    setTimeout(() => process.exit(0), 1500);
  };

  const headless = argv.includes("--headless");
  if (headless && mirrorPort <= 0) {
    process.stderr.write("se-mcp: --headless serves the lane at /mcp on the mirror port — it cannot run with the mirror disabled\n");
    process.exit(1);
  }
  const mcpServer = buildServer(root, session);
  if (mirrorPort > 0) {
    const log = new CallLog(seDir(root));
    const mirror = startMirror({ session, root, port: mirrorPort, log, mode: "agent", mcp: mcpServer });
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

  process.stderr.write(`se-mcp 3.0.0-bootstrap root=${root} autonomy=${session.autonomy}${headless ? " headless" : ""}\n`);
  if (!headless) {
    runStdio(mcpServer, () => {
      process.stderr.write("se-mcp: the console quit — telling the mirror, then shutting down\n");
      session.markServerGone();
      setTimeout(() => process.exit(0), 700);
    });
  }
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

  // A SERVER ALREADY WALKS THIS ROOT (another window, the VS Code
  // extension): raising a second engine beside it would split the walk's
  // brain — two sessions writing one .se. The shim degrades into a PROXY:
  // every stdio line is POSTed to the live server's /mcp and the answer
  // flows home. One engine, many hands; the machine arbitrates the hands
  // (SE-C-114). An engine too old to report its root gets the old
  // behaviour: an own engine, the mirror port yielded.
  const target = `http://localhost:${mirrorPort}`;
  const liveServerForThisRoot = async (): Promise<boolean> => {
    if (mirrorPort <= 0) return false;
    try {
      const r = await fetch(`${target}/api/alive`, { signal: AbortSignal.timeout(800) });
      if (!r.ok) return false;
      const body = (await r.json()) as { root?: string };
      return typeof body.root === "string" && resolve(body.root) === root;
    } catch {
      return false;
    }
  };

  if (!argv.includes("--headless") && (await liveServerForThisRoot())) {
    process.stderr.write(`se-mcp shim: a server already walks this root — attaching to ${target}/mcp as a proxy, not raising a second engine\n`);
    const rl = createInterface({ input: process.stdin, terminal: false });
    rl.on("line", (line) => {
      if (line.trim() === "") return;
      void (async () => {
        try {
          const r = await fetch(`${target}/mcp`, { method: "POST", headers: { "content-type": "application/json" }, body: line });
          if (r.status === 200) process.stdout.write(`${await r.text()}\n`);
        } catch (e) {
          let id: number | string | null = null;
          try {
            id = (JSON.parse(line) as { id?: number | string | null }).id ?? null;
          } catch {
            // unparseable — the server would have answered the parse error; gone, nobody can
          }
          if (id !== null) process.stdout.write(`${JSON.stringify({ jsonrpc: "2.0", id, error: { code: -32000, message: `the attached se server went away: ${String(e)}` } })}\n`);
        }
      })();
    });
    rl.on("close", () => process.exit(0));
  } else {
    // HEADLESS: no harness on stdio — the child serves /mcp and the shim only
    // keeps the reload (exit 42) and session-over (exit 0) contract alive.
    if (!argv.includes("--headless")) {
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
            // CLOSE THE LANE, DO NOT SHOOT THE ENGINE. Ending stdin is what
            // tells the child the console quit, and it needs a breath to push
            // that to every open mirror. The kill is only the backstop.
            child?.stdin?.end();
            setTimeout(() => {
              child?.kill();
              process.exit(0);
            }, 1200);
          }
        }, 50);
      });
    }

    process.stderr.write(`se-mcp shim: ordered reloads only (se_reload at idle) root=${root}\n`);
    ensureChild(); // eager: the mirror and the panel come up before the first request
  }
}
