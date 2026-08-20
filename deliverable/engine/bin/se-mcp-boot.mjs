// se-mcp-boot — THE ONLY THING .mcp.json IS ALLOWED TO POINT AT.
//
// WHAT IT SOLVES. The editor client spawns the stdio server when the session
// starts. The SessionStart hook installs dependencies when the session starts.
// Neither waits for the other. On a fresh clone the spawn wins the race, the
// server dies on its first bare import, and the client never retries — so the
// agent gets no se_ tools at all and cannot make its first pull.
//
// THE RULE THIS FILE EXISTS TO KEEP: a stdio server may take as long as it
// likes to answer initialize. It may NOT crash. That is the whole difference,
// and it is why the wait happens here rather than in a hook.
//
// SO THIS FILE IMPORTS NOTHING BUT node: BUILT-INS AT LOAD TIME. Every bare
// import in the engine is reached through the dynamic import at the bottom,
// which does not run until the dependencies are on disk. Adding a bare import
// to the top of this file reintroduces the bug it exists to prevent.
//
// IT IS .mjs ON PURPOSE. No type stripping, no build step, no package "type"
// field to depend on. It runs on any node that can run the engine at all.

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const DELIVERABLE = resolve(join(HERE, "..", ".."));

/** Say it on stderr. STDOUT IS THE PROTOCOL and anything written there that is
 *  not JSON-RPC corrupts the stream the client is parsing. */
function say(line) {
  process.stderr.write(`[se-mcp-boot] ${line}\n`);
}

function ensureDependencies() {
  if (existsSync(join(DELIVERABLE, "node_modules"))) return true;
  // A LOCKFILE MEANS ci, WHICH IS REPRODUCIBLE. Without one, ci refuses, so
  // install is the only thing left that can work.
  const lockfile = existsSync(join(DELIVERABLE, "package-lock.json"));
  const args = lockfile ? ["ci", "--no-audit", "--no-fund"] : ["install", "--no-audit", "--no-fund"];
  say(`no node_modules — running npm ${args[0]} in ${DELIVERABLE}. The client is waiting, which is allowed.`);
  const r = spawnSync("npm", args, { cwd: DELIVERABLE, stdio: ["ignore", "pipe", "pipe"], shell: true });
  if (r.status === 0) {
    say("dependencies installed");
    return true;
  }
  say(`npm ${args[0]} failed with status ${String(r.status)}`);
  const out = `${r.stdout ?? ""}${r.stderr ?? ""}`.trim();
  if (out !== "") say(out.slice(0, 2000));
  return false;
}

const ready = ensureDependencies();
if (!ready) {
  // NOTHING CAN BE SERVED WITHOUT THEM, and pretending otherwise would hand
  // the client a server that dies mid-handshake. Say why on stderr, where the
  // host's own log will keep it, and stop.
  say("the lane cannot start. Every se_ tool will be missing. Fix the install and start a new session.");
  process.exit(1);
}

// FROM HERE ON BARE IMPORTS ARE SAFE. se-mcp.ts reads process.argv itself, so
// the --root and every other flag reach it untouched by this wrapper.
await import("./se-mcp.ts");
