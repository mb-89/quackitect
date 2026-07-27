// se-mcp — the v3 server entry: a stable stdio SHIM plus the engine CHILD
// (v2's hot reload, ported). Node ≥22 runs this directly (native type
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
// THE SHIM (owner ruling 2026-07-27): the parent holds the harness
// connection and forwards JSON-RPC lines; the CHILD runs the engine, the
// session, and the mirror. When engine or machine sources change on disk,
// the shim restarts the child — only at a quiet moment, only with the walk
// at idle, and only onto sources whose module graph links (the canary). A
// swap REBOOTS the walk; boot re-proves the new engine green. The panel
// page reloads itself when the new child answers. SE_HOT_DISABLE=1 runs
// the engine in-process instead (tests, debugging).
//
// TWO HANDS, ONE SESSION: the MCP lane (stdio) is the agent's hand, the
// embedded mirror (HTTP) is the human's — the same Session, the same walk.
// The autonomy gates only the agent; the slider in the mirror moves it live.
//
// SESSION OVER: anybody reaching end shuts the whole session down — the
// child exits deliberately (code 0) and the shim follows it down.
import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import { existsSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { createInterface } from "node:readline";
import { fileURLToPath, pathToFileURL } from "node:url";

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

  HOT RELOAD: engine and machine edits go live without a reconnect — the
  shim swaps the engine child when the walk stands at idle (the swap
  reboots the walk). SE_HOT_DISABLE=1 turns the shim off.

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
  //    canary catches it), never the standing connection. ─────────────────
  const { CallLog } = await import("../calllog.ts");
  const { runStdio } = await import("../mcp.ts");
  const { startMirror } = await import("../mirror.ts");
  const { openPanel } = await import("../panel.ts");
  const { seDir } = await import("../paths.ts");
  const { Session } = await import("../session.ts");
  const { buildServer } = await import("../tools.ts");

  const autonomyRaw =
    argValue("--autonomy") ?? argValue("--threshold") ?? (argv.includes("--manual") ? "0" : undefined) ?? process.env.SE_AUTONOMY ?? process.env.SE_THRESHOLD;

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
      // the user — but only once per session, not on every engine swap
      // (the open page reloads itself). se_panel reopens it any time.
      if (process.env.SE_PANEL_SUPPRESS !== "1") openPanel(url);
    });
  }

  process.stderr.write(`se-mcp 3.0.0-bootstrap root=${root} autonomy=${session.autonomy}\n`);
  runStdio(buildServer(root, session));
} else {
  // ── THE SHIM — dumb on purpose: it never imports the engine, so it
  //    survives every engine state. Ported from v2 (req-hot-reload,
  //    req-shim-canary); v3 drops session persistence — a swap reboots
  //    the walk, and swaps wait for idle so nothing mid-flight is lost. ───
  const binDir = dirname(fileURLToPath(import.meta.url));
  const engineDir = join(binDir, "..");
  const machinesDir = join(binDir, "..", "..", "machines");

  // Machines are part of the fingerprint: canvases and state docs compile
  // into the Session at child start, so their edits need a swap too.
  const fingerprint = (): string => {
    const parts: string[] = [];
    const walk = (dir: string): void => {
      if (!existsSync(dir)) return;
      for (const e of readdirSync(dir, { withFileTypes: true })) {
        if (e.name.startsWith(".") || e.name === "node_modules") continue;
        const p = join(dir, e.name);
        if (e.isDirectory()) walk(p);
        else if (e.name.endsWith(".ts") || e.name.endsWith(".canvas") || e.name.endsWith(".md")) {
          const st = statSync(p);
          parts.push(`${p}:${st.mtimeMs}:${st.size}`);
        }
      }
    };
    walk(engineDir);
    walk(machinesDir);
    return parts.sort().join("|");
  };

  // The canary (v2's req-shim-canary): swap only onto sources whose module
  // graph actually LINKS — a half-edited engine keeps the running child.
  const canaryOk = (): boolean => {
    const entry = pathToFileURL(join(engineDir, "tools.ts")).href;
    const probe = `import(${JSON.stringify(entry)}).then(()=>process.exit(0),(e)=>{console.error("se canary: "+(e&&e.message||e));process.exit(1)})`;
    const r = spawnSync(process.execPath, ["-e", probe], { encoding: "utf8", timeout: 30_000, windowsHide: true });
    return r.status === 0;
  };

  // Swaps wait for IDLE (owner ruling 2026-07-27): the shim watches the
  // walk through the child's own mirror. No mirror, no window — then only
  // quiet moments gate the swap, and the walk reboot is accepted.
  let walkAtIdle = mirrorPort <= 0;
  if (mirrorPort > 0) {
    setInterval(() => {
      void fetch(`http://localhost:${mirrorPort}/api/alive`, { signal: AbortSignal.timeout(1500) })
        .then((r) => r.json())
        .then((a: { active?: string[] }) => {
          walkAtIdle = Array.isArray(a.active) && a.active.length === 1 && a.active[0] === "idle";
        })
        .catch(() => {
          walkAtIdle = false;
        });
    }, 2000).unref();
  }

  let child: ChildProcess | null = null;
  let childPrint = "";
  let badPrint = "";
  let spawnedOnce = false;
  let swapKilled: ChildProcess | null = null;
  // Requests in flight: a restart only happens at a quiet moment, so no
  // response is ever lost to a mid-call engine swap.
  const pending = new Set<number | string>();

  const ensureChild = (): ChildProcess => {
    const print = fingerprint();
    if (child !== null && childPrint !== print && pending.size === 0 && walkAtIdle && print !== badPrint) {
      if (canaryOk()) {
        process.stderr.write("se-mcp: sources changed — swapping the engine (the walk reboots at start)\n");
        swapKilled = child;
        child.kill();
        child = null;
      } else {
        badPrint = print;
        process.stderr.write("se-mcp: new engine sources fail to load — keeping the running engine\n");
      }
    }
    if (child === null) {
      childPrint = print;
      const c = spawn(process.execPath, [join(binDir, "se-mcp.ts"), ...process.argv.slice(2), "--child"], {
        stdio: ["pipe", "pipe", "inherit"],
        env: { ...process.env, ...(spawnedOnce ? { SE_PANEL_SUPPRESS: "1" } : {}) },
        windowsHide: true,
      });
      spawnedOnce = true;
      c.on("exit", (code) => {
        if (child === c) child = null;
        // A deliberate exit is SESSION OVER (the machine reached end) —
        // the shim follows. A swap kill or a crash respawns on demand.
        if (swapKilled !== c && code === 0) setTimeout(() => process.exit(0), 200);
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
    // The restart check runs BEFORE this request joins the pending set —
    // otherwise no moment is ever quiet and the child never restarts.
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

  process.stderr.write(`se-mcp shim: hot reload armed (idle-only swaps) root=${root}\n`);
  ensureChild(); // eager: the mirror and the panel come up before the first request
}
