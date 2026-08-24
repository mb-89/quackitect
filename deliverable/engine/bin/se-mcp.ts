// se-mcp — the v3 server entry: a stable stdio SHIM plus the engine CHILD.
// Node ≥22 runs this directly (native type stripping); no build step. The
// workspace's .mcp.json points here.
//
//   node engine/bin/se-mcp.ts --root <project root> [--autonomy tactical] [--mirror-port 7333]
//
// --root is the PROJECT root (the folder holding deliverable/ and
// workspace/) — the file lane serves that whole tree, the call log lives in
// <root>/.se/calls.jsonl.
//
// ONE FLAG REGISTRY: this file. The RUNME declares no flags of its own — it
// forwards its whole command line through SE_ARGS (newline-separated),
// because the cage's .mcp.json is fixed template text and cannot carry
// per-launch arguments.
//
// ORDERED RELOADS ONLY (after automatic swaps
// churned the walk): the shim holds the harness connection and forwards
// JSON-RPC lines; the CHILD runs the engine, the session, and the mirror.
// The shim NEVER watches sources and never swaps on its own. se_reload —
// canary-guarded, legal wherever the walk stands, either hand — makes the child exit with code
// 42; the shim reads that as "respawn me on the new sources". The walk
// reboots; boot re-proves the new engine green. SE_HOT_DISABLE=1 runs the
// engine in-process instead (tests, debugging) — then a reload needs a
// harness reconnect.
//
// TWO HANDS, ONE SESSION: the MCP lane (stdio) is the agent's hand, the
// embedded mirror (HTTP) is the human's — the same Session, the same walk.
// The autonomy gates only the agent; the DIAL in the mirror moves it live.
//
// SESSION OVER: anybody reaching end shuts the whole session down — the
// child exits deliberately (code 0) and the shim follows it down.
import { type ChildProcess, spawn, spawnSync } from "node:child_process";
import { appendFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { createInterface } from "node:readline";
import { fileURLToPath } from "node:url";
import { takeWorkspace } from "../run.ts";
import { SE_VERSION } from "../version.ts";

const argv = [
  ...process.argv.slice(2),
  ...(process.env.SE_ARGS ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter((s) => s !== ""),
];
function argValue(flag: string): string | undefined {
  const i = argv.indexOf(flag);
  return i >= 0 ? argv[i + 1] : undefined;
}

function listeningPids(port: number): number[] {
  if (!Number.isFinite(port) || port <= 0) return [];
  if (process.platform === "win32") {
    const script = `$p=${port}; Get-NetTCPConnection -State Listen -LocalPort $p -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique`;
    const r = spawnSync("powershell", ["-NoProfile", "-Command", script], { encoding: "utf8", windowsHide: true });
    if (r.status !== 0) return [];
    return String(r.stdout ?? "")
      .split(/\r?\n/)
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isInteger(n) && n > 0);
  }
  const lsof = spawnSync("lsof", ["-nP", `-iTCP:${port}`, "-sTCP:LISTEN", "-t"], { encoding: "utf8" });
  if (lsof.status !== 0) return [];
  return String(lsof.stdout ?? "")
    .split(/\r?\n/)
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isInteger(n) && n > 0);
}

function killPidTree(pid: number): boolean {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  if (pid === process.pid || pid === process.ppid) return false;
  if (process.platform === "win32") {
    const r = spawnSync("taskkill", ["/PID", String(pid), "/T", "/F"], { encoding: "utf8", windowsHide: true });
    return r.status === 0;
  }
  try {
    process.kill(pid, "SIGTERM");
    return true;
  } catch {
    return false;
  }
}

function evictMirrorPort(port: number): number[] {
  const killed: number[] = [];
  for (const pid of listeningPids(port)) {
    if (killPidTree(pid)) killed.push(pid);
  }
  return [...new Set(killed)].sort((a, b) => a - b);
}

// see dsp-lane-door.md#the-entrypoint-answers-what-it-is-before-it-answers-anything-else
if (argv.some((a) => a === "--version" || a === "-v" || a === "-V")) {
  process.stdout.write(`${SE_VERSION}\n`);
  process.exit(0);
}

if (argv.some((a) => a === "--help" || a === "-h" || a === "-?")) {
  process.stdout.write(`se — ONE help for the whole system.

  .\\RUNME.ps1 [launch flags] [engine flags...]      — the normal way in
  node engine/bin/se-mcp.ts --root <root> [--autonomy <rung>]  — the server alone
                            rungs by NAME: blocked, mechanical, operational,
                            tactical (the default), strategic, ideation.

LAUNCH — read by RUNME.ps1 before the server starts.

  VS CODE IS THE DEFAULT HOST. Plain .\\RUNME.ps1 installs what it needs and
  opens VS Code; no flag asks for it.

  These are listed HERE, with everything else, because two half-lists are
  worse than one whole one. RUNME consumes them and the server never sees
  them; every other argument is forwarded on to the engine flags below.

  --own-terminal run the agent in THIS window instead, on its own terminal.
                 The Mirror's terminal pane stays empty.
  --manual       no LLM: open the Mirror alone and walk every step yourself.
                 This also happens by itself when no claude CLI is found.
                 The engine's --autonomy 0 is a DIFFERENT thing: an agent
                 is running, it just may not step by itself.
  --kill         stop every leftover engine process and exit, launching
                 nothing (-Kill). Finds the server, the terminal host and the
                 manual mirror by command line AND by listening port (7333,
                 7334), kills each with its children, then checks the ports
                 really came free. Finding nothing running is a success.
  --classic      the OLD way in: the agent on a terminal and the Mirror in
                 your browser, with no VS Code. It still works exactly as it
                 did. It is simply no longer what you get by default.
  (no --export)  making a copy is a BUTTON now. Open the command palette and
                 run "Create a Vehicle", or "Create a Project". Each asks for
                 what it needs and opens what it made in a new window.
                 THE FLAG IS GONE ON PURPOSE. A second way to do it, in the
                 document a newcomer reads first, is exactly the problem the
                 button was built to remove.

ENGINE — read by the server (this file is where they are defined).

  --root         the project root — the folder holding deliverable/;
                 file lane serves that tree, call log lands in <root>/.se/
  --mode         WHERE SATELLITES RUN: process | thread | inline.
                 process (default) a child per record — a crash stays with the
                                   record that caused it
                 thread            a worker per record — cheaper to start, and
                                   a hard crash takes everything
                 inline            no crossing at all — the BASELINE the other
                                   two are measured against
                 One architecture either way: core, satellite and channel are
                 always there, and only the boundary moves. The flag decides
                 THIS RUN and does not overwrite what the mirror last stored;
                 the stored choice lives in <root>/.se/mode.json and is what a
                 host launching from a fixed .mcp.json reads.
  --autonomy     0..1 — which states the AGENT enters by itself (priority <=
                 autonomy). 0: every step is the human's; 1: fully autonomous.
                 Defaults to the rung machines/scale.md rests on, which sits
                 above a gate so a walk can bless its own and finish. Env:
                 SE_AUTONOMY. Live-adjustable in the mirror.
                 (--threshold and SE_THRESHOLD are the old spelling.)
  --stop-at      how far the walk may GO before it hands back, BY NAME:
                 state end, agent judgement (the default), bless, blockers
                 only. The notches live in machines/stopat.md. Env:
                 SE_STOP_AT. Live-adjustable in the mirror.
                 THE DIAL IS STILL THE PERSON'S. This only lets the person
                 set it where there is no mirror to press — an unattended
                 box, whose settings store never restores a stored notch
                 because it recognises no session token.
  --mirror-port  the embedded mirror's HTTP port (the human's hand on the
                 same walk). Default 7333. 0 disables. Env: SE_MIRROR_PORT.
  --headless     no stdio lane — agents attach over HTTP instead, at /mcp
                 on the mirror port. For a host that OWNS the process and
                 lets harnesses attach (the VS Code extension spawns the
                 server this way). The mirror stays enabled.
  --child        INTERNAL, never typed by hand. The shim spawns itself with
                 it to run the engine proper. SE_HOT_DISABLE=1 does the same
                 in one process.
  --version      the version this build is, read from the manifest. One line,
                 then it exits — no root, no port, no lane (-v, -V).
  --help         this text (-h, -?, -Help)

  RELOAD: se_reload (agent or mirror hand, at idle only) restarts the
  engine onto the current sources without a reconnect — the walk reboots at
  start and returns to its aimed target.
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
  // see dsp-lane-door.md#a-call-that-never-returns-still-leaves-something-to-read
  const deathLog = join(root, ".se", "engine.log");
  const record = (what: string): void => {
    try {
      mkdirSync(join(root, ".se"), { recursive: true });
      appendFileSync(deathLog, `${new Date().toISOString()} pid=${process.pid} ${what}\n`, "utf8");
    } catch {
      // a postmortem that cannot be written must not become the cause of death
    }
  };
  const fatal = (kind: string, e: unknown): void => {
    const detail = e instanceof Error ? `${e.message}\n${e.stack ?? ""}` : String(e);
    record(`${kind} ${detail.replace(/\n/g, "\n    ")}`);
    try {
      if (!process.stderr.destroyed) process.stderr.write(`se-mcp: ${kind} — ${detail}\n`);
    } catch {
      // The durable engine log already holds the failure.
    }
    process.exit(1);
  };
  const streamError = (stream: string, e: Error): void => {
    if ((e as NodeJS.ErrnoException).code === "EPIPE") {
      record(`${stream} EPIPE ${e.message}`);
      return;
    }
    fatal(`${stream}-ERROR`, e);
  };
  process.stdout.on("error", (e) => streamError("STDOUT", e));
  process.stderr.on("error", (e) => streamError("STDERR", e));
  process.on("uncaughtException", (e) => fatal("UNCAUGHT", e));
  process.on("unhandledRejection", (e) => fatal("UNHANDLED-REJECTION", e));
  process.on("exit", (code) => record(`exit ${code}`));
  record(`start root=${root}`);

  // ── THE CHILD — the engine proper. Dynamic imports keep the shim free
  //    of the engine's module graph: a broken engine breaks the child (the
  //    reload canary catches it first), never the standing connection. ────
  // THE WINDOW THAT STARTED US OWNS US. A host's goodbye cannot be trusted:
  // VS Code only calls deactivate on an orderly close, so a killed or crashed
  // window never says anything. The survivor keeps the port AND its in-memory
  // session, so the next morning reopened yesterday's autonomy and yesterday's
  // checked documents (found live ). Watch the parent instead.
  //
  // Only a host that CLAIMS a parent gets this. The classic launcher detaches
  // its terminal host on purpose and must go on outliving its window.
  const parentPid = Number(process.env.SE_PARENT_PID ?? 0);
  // A headless lane is shared by agent sessions. Its lifetime is managed by
  // the explicit launcher, not by a transient extension-host process.
  if (!argv.includes("--headless") && Number.isInteger(parentPid) && parentPid > 0) {
    // Signal 0 delivers nothing; it only asks whether the process is there.
    const watch = setInterval(async () => {
      try {
        process.kill(parentPid, 0);
      } catch {
        process.stderr.write("se-mcp: the window that started this server is gone — exiting\n");
        try {
          (await import("../run.ts")).jobStopAll();
        } catch {
          /* the reap is best effort */
        }
        process.exit(0);
      }
    }, 5_000);
    watch.unref();
  }

  const { CallLog } = await import("../calllog.ts");
  const { runStdio } = await import("../mcp.ts");
  const { startMirror } = await import("../mirror.ts");
  const { openPanel } = await import("../panel.ts");
  const { seDir } = await import("../paths.ts");
  const { Session } = await import("../session.ts");
  const { buildServer } = await import("../tools.ts");
  const { jobStopAll } = await import("../run.ts");

  // see dsp-lane-door.md#children-never-outlive-the-engine
  for (const sig of ["SIGTERM", "SIGINT"] as const) {
    process.on(sig, () => {
      try {
        jobStopAll();
      } catch {
        /* best effort */
      }
      process.exit(0);
    });
  }

  const autonomyRaw = argValue("--autonomy") ?? argValue("--threshold") ?? process.env.SE_AUTONOMY ?? process.env.SE_THRESHOLD;
  // HOW FAR THE WALK MAY GO, beside the rung saying what it may decide.
  //
  // AUTONOMY HAD A FLAG AND AN ENVIRONMENT VARIABLE AND THIS HAD NEITHER. The
  // notch was hard-coded, and the settings store only restores a stored one for
  // a session whose token it recognises — which a fresh container never has. So
  // on a box with no mirror to press, nobody could move it: not the agent, who
  // may not, and not the person, who has no surface.
  const stopAtRaw = argValue("--stop-at") ?? process.env.SE_STOP_AT;

  // WHERE SATELLITES RUN, for THIS run only. One architecture, three
  // transports — process, thread, inline — and the argument wins over the
  // stored choice WITHOUT overwriting it, so a measurement run cannot silently
  // change what the person set from the mirror.
  //
  // A BAD VALUE STOPS THE LAUNCH, and that is deliberate: an unreadable stored
  const session = new Session(root); // fails fast on a misdrawn machine
  if (autonomyRaw !== undefined) session.setAutonomy(autonomyRaw); // a rung by name or a bare value; refuses either out of range
  if (stopAtRaw !== undefined) session.setStopAt(stopAtRaw); // a notch by name or a bare value; refuses either out of range
  // SESSION OVER — reaching end stops everything. The grace period lets the
  // closing tool response flush to stdout and the mirror serve its red page.
  session.onClosed = () => {
    process.stderr.write("se-mcp: the machine reached end — session over, shutting down\n");
    // see dsp-lane-door.md#the-session-cleans-up-after-itself
    const ptyPort = Number(process.env.SE_PTY_PORT ?? 7334);
    void fetch(`http://localhost:${ptyPort}/pty/end`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ reason: "the machine reached end" }),
    }).catch(() => {});
    setTimeout(() => {
      try {
        jobStopAll();
      } catch {
        /* best effort */
      }
      process.exit(0);
    }, 1500);
  };

  const headless = argv.includes("--headless");
  if (headless && mirrorPort <= 0) {
    process.stderr.write("se-mcp: --headless serves the lane at /mcp on the mirror port — it cannot run with the mirror disabled\n");
    process.exit(1);
  }
  // ONE INSTANCE SERVES ONE FOLDER. The workspace hold is a port derived from
  // the folder itself, and it is NOT the mirror port below: the mirror is one
  // shared window that a second agent may evict, while the workspace is this
  // folder's own and a second server on it must stop.
  //
  // TWO SERVERS ON ONE FOLDER WRITE ONE CALL LOG AND ONE STATE FOLDER, so
  // neither log is the whole trail. Settling entries a previous instance left
  // behind is also only safe because one instance serves the folder.
  //
  // NOTHING IS WRITTEN DOWN TO CARRY THE HOLD. A record of it would outlive the
  // process that made it, and a crash would leave a folder nobody can start in.
  // see dsp-one-instance-holds-the-workspace.md
  // THE HOLD IS DECIDED BEFORE ANYTHING TOUCHES THE FOLDER, and the await is
  // the whole point. Booting first and asking afterwards let a refused second
  // instance reap the FIRST instance's live jobs on its way out: the mirror's
  // start reaps abandoned work synchronously, and a take that resolves from a
  // socket callback cannot answer until a turn later.
  //
  // IT DOES NOT DEPEND ON THE MIRROR. The workspace port is derived from the
  // folder alone, so a server started with the mirror disabled shares the
  // folder just as dangerously and has to be stopped just the same.
  const hold = await takeWorkspace(root);
  if (!hold.held) {
    process.stderr.write(`se-mcp: ${hold.by} — this server is stopping rather than sharing the folder\n`);
    process.exit(1);
  }
  const mcpServer = buildServer(root, session);
  if (mirrorPort > 0) {
    const log = new CallLog(seDir(root));
    let retriedMirrorStart = false;
    const bootMirror = (): void => {
      const mirror = startMirror({ session, root, port: mirrorPort, log, mode: "agent", mcp: mcpServer });
      // A second agent on the same machine must not die
      // over the mirror port — the MCP lane matters more than the window.
      mirror.on("error", (e) => {
        const code = (e as NodeJS.ErrnoException).code ?? "";
        if (code === "EADDRINUSE" && !retriedMirrorStart) {
          retriedMirrorStart = true;
          const killed = evictMirrorPort(mirrorPort);
          if (killed.length > 0) {
            process.stderr.write(`se-mcp: mirror port ${mirrorPort} was busy — stopped pid(s) ${killed.join(", ")} and retrying\n`);
          } else {
            process.stderr.write(`se-mcp: mirror port ${mirrorPort} is busy and owner could not be stopped — retrying once\n`);
          }
          setTimeout(() => bootMirror(), 200);
          return;
        }
        process.stderr.write(`se-mcp: mirror not started (${code || e.message}) — pass --mirror-port to pick another port\n`);
      });
      mirror.on("listening", () => {
        const url = `http://localhost:${mirrorPort}/`;
        session.mirrorUrl = url;
        process.stderr.write(`se-mcp: mirror (the human's hand) at ${url}\n`);
        // A WINDOW OPENS ONLY WHEN SOMETHING ASKED FOR ONE.
        //
        // The lane is started by TOOLS far more often than by a person. The
        // arrival hook, the VS Code shell and se-start each spawn it, and each
        // already has a surface of its own. Opening by default put a browser
        // window in front of the person on every VS Code start, and two windows
        // when two starters raced — the second showing the same walk, with
        // nothing saying which one was live.
        //
        // WHO ASKS. RUNME --classic, which has no other surface. se_panel,
        // which is the person asking in as many words. Manual mode opens on its
        // own, because there the mirror IS the session.
        //
        // A RELOAD IS NOT A NEW SESSION. The shim clears this flag on every
        // respawn, so se_reload never opens a second window — the page that is
        // already open reloads itself.
        if (process.env.SE_PANEL_OPEN === "1") openPanel(url);
      });
    };
    bootMirror();
  }

  process.stderr.write(`se-mcp ${SE_VERSION} root=${root} autonomy=${session.autonomy}${headless ? " headless" : ""}\n`);
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

  /** Tell the client its tool list is stale. The shim owns the standing
   *  connection, so it is the only side that can say so — the child that
   *  knew about the change has already exited by now. */
  const notifyToolListChanged = (): void => {
    process.stdout.write(`${JSON.stringify({ jsonrpc: "2.0", method: "notifications/tools/list_changed" })}\n`);
  };

  const ensureChild = (): ChildProcess => {
    if (child === null) {
      const c = spawn(process.execPath, [join(binDir, "se-mcp.ts"), ...process.argv.slice(2), "--child"], {
        stdio: ["pipe", "pipe", "inherit"],
        // The FIRST child may open a window if something asked for one; every
        // respawn after it must not, so the flag is cleared rather than dropped
        // — the child inherits this environment, and dropping a key keeps it.
        env: { ...process.env, SE_SESSION: sessionToken, ...(spawnedOnce ? { SE_PANEL_OPEN: "0" } : {}) },
        windowsHide: true,
      });
      spawnedOnce = true;
      c.on("exit", (code) => {
        if (child === c) child = null;
        if (code === 42) {
          // se_reload: respawn EAGERLY so the mirror is back before the
          // next request or F5.
          process.stderr.write("se-mcp: reload ordered — respawning the engine on the current sources\n");
          setTimeout(() => {
            void ensureChild();
            // A reload changes BEHAVIOUR immediately, because the client
            // already holds the schema. It cannot change the SURFACE: the
            // client cached tools/list at connect time, and only this
            // notification asks it to look again. Without it a tool built
            // and landed mid-session stays invisible until a restart.
            notifyToolListChanged();
          }, 100);
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
        process.stdout.write(`${line}\n`);
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
    process.stderr.write(
      `se-mcp shim: a server already walks this root — attaching to ${target}/mcp as a proxy, not raising a second engine\n`,
    );
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
          if (id !== null)
            process.stdout.write(
              `${JSON.stringify({ jsonrpc: "2.0", id, error: { code: -32000, message: `the attached se server went away: ${String(e)}` } })}\n`,
            );
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
        c.stdin?.write(`${line}\n`);
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
