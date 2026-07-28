// se-pty — THE PTY HOST, so the agent and the machine share one screen.
//
// The mirror is embedded in the engine child, which is the AGENT'S
// GRANDCHILD, and a grandchild cannot own the terminal its grandparent runs
// in. So this process is a SIBLING: RUNME starts it, it starts the agent
// inside a pseudo-terminal, and the mirror only renders a client for it.
//
//   node engine/bin/se-pty.ts [--pty-port 7334] [--detach] -- <command> [args...]
//
// --detach re-execs this file as a BACKGROUND process, so the window that
// launched the session can be closed without taking the session down.
//
// The pseudo-terminal and its scrollback live HERE, in a process that never
// reloads, so a browser refresh reattaches and replays instead of losing the
// session.
//
// Output streams as server-sent events — the same shape the mirror already
// speaks. Keystrokes come back over POST: this is localhost, so the round
// trip is not worth a second protocol and a second dependency.
//
// FAIL SAFE: if the pseudo-terminal binding will not load, the command is
// run normally on the inherited terminal. A missing dependency must never
// cost the owner their agent.
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const argv = process.argv.slice(2);
const dashdash = argv.indexOf("--");
const flags = dashdash === -1 ? argv : argv.slice(0, dashdash);
// An empty argument survives some shells' quoting and reaches the spawn as a
// nameless file, so it is dropped here rather than blamed on the caller.
const command = (dashdash === -1 ? [] : argv.slice(dashdash + 1)).filter((a) => a !== "");
const flagValue = (name: string): string | undefined => {
  const i = flags.indexOf(name);
  return i >= 0 ? flags[i + 1] : undefined;
};

if (flags.some((a) => a === "--help" || a === "-h" || a === "-?")) {
  process.stdout.write(`se-pty — the terminal host, so the agent and the machine share one screen

  node engine/bin/se-pty.ts [--pty-port 7334] [--detach] -- <command> [args...]

  --pty-port     the port the terminal is served on. Default 7334.
                 Env: SE_PTY_PORT.
  --detach       run the terminal host in the BACKGROUND and return at once,
                 so the window that launched the session can be closed
                 without taking the session down. Ignored when no terminal
                 binding is installed: the command then runs on the inherited
                 terminal, and a background process has none.
  --help         this text (-h, -?)
  --             everything after it is the command to run in the terminal

  The mirror only renders a client for this host. The scrollback lives here,
  in a process that never reloads, so a browser refresh reattaches and
  replays instead of losing the session.
`);
  process.exit(0);
}

const port = Number(flagValue("--pty-port") ?? process.env.SE_PTY_PORT ?? 7334);
const detach = flags.includes("--detach");

if (command.length === 0) {
  process.stderr.write("se-pty: nothing to run — pass the command after --\n");
  process.exit(2);
}

/** The scrollback the browser replays on every attach. Capped, because a
 *  long session must not make reattaching slow. */
const CAP = 256 * 1024;
let buffer = "";
const listeners = new Set<ServerResponse>();

function broadcast(chunk: Buffer): void {
  const b64 = chunk.toString("base64");
  buffer += chunk.toString("binary");
  if (buffer.length > CAP) buffer = buffer.slice(buffer.length - CAP);
  for (const res of listeners) res.write(`data: ${b64}\n\n`);
}

let write: (d: string) => void = () => {};
let resize: (cols: number, rows: number) => void = () => {};
let alive = true;

const require = createRequire(import.meta.url);

function serveAsset(res: ServerResponse, spec: string, type: string): void {
  try {
    res.writeHead(200, { "content-type": type, "access-control-allow-origin": "*", "cache-control": "no-cache" });
    res.end(readFileSync(require.resolve(spec)));
  } catch {
    res.writeHead(404, { "content-type": "text/plain", "access-control-allow-origin": "*" });
    res.end("not installed");
  }
}

function body(req: IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve) => {
    const chunks: Buffer[] = [];
    req.on("data", (c: Buffer) => chunks.push(c));
    req.on("end", () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}") as Record<string, unknown>);
      } catch {
        resolve({});
      }
    });
  });
}

function startServer(): void {
  const server = createServer((req, res) => {
    const url = new URL(req.url ?? "/", `http://localhost:${port}`);
    // The mirror is served from another port, so every answer says so.
    if (req.method === "OPTIONS") {
      res.writeHead(204, {
        "access-control-allow-origin": "*",
        "access-control-allow-methods": "GET, POST, OPTIONS",
        "access-control-allow-headers": "content-type",
      });
      res.end();
      return;
    }
    if (url.pathname === "/pty/alive") {
      res.writeHead(200, { "content-type": "application/json", "access-control-allow-origin": "*" });
      res.end(JSON.stringify({ alive, port }));
      return;
    }
    if (url.pathname === "/xterm.js") return serveAsset(res, "@xterm/xterm/lib/xterm.js", "text/javascript; charset=utf-8");
    if (url.pathname === "/xterm.css") return serveAsset(res, "@xterm/xterm/css/xterm.css", "text/css; charset=utf-8");
    if (url.pathname === "/pty/stream") {
      res.writeHead(200, {
        "content-type": "text/event-stream; charset=utf-8",
        "cache-control": "no-cache",
        connection: "keep-alive",
        "access-control-allow-origin": "*",
      });
      // Replay first, so a refresh reattaches to what was already there.
      if (buffer !== "") res.write(`data: ${Buffer.from(buffer, "binary").toString("base64")}\n\n`);
      listeners.add(res);
      req.on("close", () => listeners.delete(res));
      return;
    }
    if (url.pathname === "/pty/input" && req.method === "POST") {
      void body(req).then((b) => {
        if (typeof b.d === "string") write(b.d);
        res.writeHead(204, { "access-control-allow-origin": "*" });
        res.end();
      });
      return;
    }
    if (url.pathname === "/pty/resize" && req.method === "POST") {
      void body(req).then((b) => {
        const cols = Number(b.cols);
        const rows = Number(b.rows);
        if (Number.isFinite(cols) && Number.isFinite(rows) && cols > 0 && rows > 0) resize(Math.floor(cols), Math.floor(rows));
        res.writeHead(204, { "access-control-allow-origin": "*" });
        res.end();
      });
      return;
    }
    res.writeHead(404, { "content-type": "text/plain", "access-control-allow-origin": "*" });
    res.end("no such route");
  });
  server.listen(port, () => process.stderr.write(`se-pty: the agent's terminal is served on http://localhost:${port}\n`));
}

/** Does a terminal host already answer on this port? Asked BEFORE detaching.
 *  A second host would fail to listen and die unseen, while the poll below
 *  found the OLD one and called it success. */
async function portAnswers(): Promise<boolean> {
  try {
    return (await fetch(`http://localhost:${port}/pty/alive`)).ok;
  } catch {
    return false;
  }
}

/** Wait for the background host to start listening. */
async function waitForAlive(timeoutMs: number, now: () => number): Promise<boolean> {
  const until = now() + timeoutMs;
  while (now() < until) {
    if (await portAnswers()) return true;
    await new Promise((r) => setTimeout(r, 100));
  }
  return false;
}

async function main(): Promise<void> {
  let nodePty: { spawn: (file: string, args: string[], opts: Record<string, unknown>) => { onData: (f: (d: string) => void) => void; onExit: (f: (e: { exitCode: number }) => void) => void; write: (d: string) => void; resize: (c: number, r: number) => void } };
  try {
    nodePty = (await import("@lydell/node-pty")) as never;
  } catch {
    // FAIL SAFE — the owner still gets their agent, just not in the browser.
    // DETACHING IS SKIPPED ON THIS PATH DELIBERATELY. Without a terminal
    // binding the command runs on the terminal it inherited, and a background
    // process has none — detaching would hand back a session nobody can type
    // into. Losing the browser terminal is a downgrade; losing the agent is a
    // dead session.
    process.stderr.write("se-pty: no pseudo-terminal binding installed — running on this terminal instead\n");
    const child = spawn(command[0], command.slice(1), { stdio: "inherit", shell: process.platform === "win32" });
    child.on("exit", (code) => process.exit(code ?? 0));
    return;
  }

  // THE DETACH — re-exec as a background process and hand the window back.
  // The terminal host owns the agent, so the host is what has to survive; the
  // env stamp is what stops the background copy from detaching again.
  if (detach && process.env.SE_PTY_DETACHED !== "1") {
    if (await portAnswers()) {
      process.stderr.write(`se-pty: a terminal host already answers on ${port} — stop it, or pass --pty-port to pick another\n`);
      process.exit(1);
    }
    const bg = spawn(process.execPath, [fileURLToPath(import.meta.url), ...process.argv.slice(2)], {
      detached: true,
      stdio: "ignore",
      windowsHide: true,
      env: { ...process.env, SE_PTY_DETACHED: "1" },
    });
    bg.unref();
    // PROVE IT CAME UP. A detached process writes nowhere, so silence here
    // would be indistinguishable from a crash.
    if (!(await waitForAlive(10_000, () => Date.now()))) {
      process.stderr.write(`se-pty: the background terminal host did not answer on ${port} within 10s\n`);
      process.exit(1);
    }
    process.stderr.write(`se-pty: the agent's terminal is served on http://localhost:${port} — background process, pid ${bg.pid}\n`);
    process.stderr.write("se-pty: this window is free to close; stop the session from the mirror, or kill that pid\n");
    process.exit(0);
  }
  // Windows cannot start a bare name or an npm .cmd shim through a
  // pseudo-terminal — CreateProcess wants a real file. The shell resolves
  // both, so on Windows the command goes through it.
  const isWin = process.platform === "win32";
  const file = isWin ? (process.env.COMSPEC ?? "cmd.exe") : command[0];
  const args = isWin ? ["/c", ...command] : command.slice(1);
  const term = nodePty.spawn(file, args, {
    name: "xterm-256color",
    cols: 100,
    rows: 34,
    cwd: process.cwd(),
    env: process.env,
  });
  term.onData((d) => broadcast(Buffer.from(d, "utf8")));
  term.onExit(({ exitCode }) => {
    alive = false;
    for (const res of listeners) res.end();
    // The agent is the session; when it goes, so does its terminal host.
    setTimeout(() => process.exit(exitCode), 150);
  });
  write = (d) => term.write(d);
  resize = (c, r) => term.resize(c, r);
  startServer();
}

void main();
