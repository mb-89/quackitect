#!/usr/bin/env node
// se-mcp — the stable stdio shim. It spawns the engine (itself, --child)
// and forwards JSON-RPC lines; when engine sources change on disk it
// restarts the child between requests, so engine edits go live without a
// harness reconnect. The shim itself stays dumb and never reloads.
// Admission survives restarts: the child persists its session to
// SE_SESSION_FILE, whose lifetime the shim owns.
//
// Usage: node bin/se-mcp.ts [--root <repo root>] [--child]
import { spawn, type ChildProcess } from "node:child_process";
import { randomBytes } from "node:crypto";
import { existsSync, readdirSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createInterface } from "node:readline";

const args = process.argv.slice(2);
const flagIdx = args.indexOf("--root");
const root = resolve(flagIdx === -1 ? "." : args[flagIdx + 1]);

if (args.includes("--child")) {
  const { runStdio } = await import("../engine/mcp.ts");
  const { buildServer } = await import("../engine/tools.ts");
  runStdio(buildServer(root));
} else {
  const binDir = dirname(fileURLToPath(import.meta.url));
  const sessionFile = join(tmpdir(), `se-session-${randomBytes(6).toString("hex")}.json`);

  const fingerprint = (): string => {
    const parts: string[] = [];
    const walk = (dir: string): void => {
      if (!existsSync(dir)) return;
      for (const e of readdirSync(dir, { withFileTypes: true })) {
        if (e.name.startsWith(".") || e.name === "node_modules") continue;
        const p = join(dir, e.name);
        if (e.isDirectory()) walk(p);
        else if (e.name.endsWith(".ts")) {
          const st = statSync(p);
          parts.push(`${p}:${st.mtimeMs}:${st.size}`);
        }
      }
    };
    walk(join(binDir, "..", "engine"));
    walk(binDir);
    return parts.sort().join("|");
  };

  let child: ChildProcess | null = null;
  let childPrint = "";
  // Requests in flight: a restart only happens at a quiet moment, so no
  // response is ever lost to a mid-call engine swap.
  const pending = new Set<number | string>();

  const ensureChild = (): ChildProcess => {
    const print = fingerprint();
    if (child !== null && childPrint !== print && pending.size === 0) {
      child.kill();
      child = null;
    }
    if (child === null) {
      childPrint = print;
      const c = spawn(process.execPath, [join(binDir, "se-mcp.ts"), "--root", root, "--child"], {
        stdio: ["pipe", "pipe", "inherit"],
        env: { ...process.env, SE_SESSION_FILE: sessionFile },
      });
      c.on("exit", () => {
        if (child === c) child = null;
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
    try {
      const id = (JSON.parse(line) as { id?: number | string | null }).id;
      if (id !== undefined && id !== null) pending.add(id);
    } catch {
      // the child answers parse errors itself
    }
    ensureChild().stdin!.write(line + "\n");
  });
  rl.on("close", () => {
    child?.kill();
    rmSync(sessionFile, { force: true });
    process.exit(0);
  });
}
