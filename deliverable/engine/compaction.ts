// THE COMPACTION MARKER — how a compacted or cleared context reaches the engine.
//
// A COMPACTION HAPPENS INSIDE THE AGENT'S HEAD. The engine is not restarted,
// its session token does not change, and nothing it can observe has moved. So
// the read gate still holds credit saying every document was read, the next
// pull serves none of them, and the reader holding that credit has lost the
// documents.
//
// THAT IS req-compaction-reowes-the-reading BREAKING, and it breaks silently:
// "A compacted agent walks on with the method gone from its head, and nothing
// notices."
//
// THE HOOK IS THE ONLY PARTY PRESENT when it happens, and a hook cannot call
// the lane. The stdio server belongs to the client, and the hook is a separate
// process with no connection to it.
//
// SO THE HOOK LEAVES A MARKER AND THE NEXT PULL CONSUMES IT. One file, written
// once, read and deleted once. Surviving the gap between two processes is the
// whole job, and a file is the cheapest thing that does it.
//
// WHY NOT REUSE THE SESSION TOKEN. A fresh shim already re-owes the whole
// reading — se-mcp.ts mints the token per shim, and session.ts restores the
// stored credit only when the token matches. That path is proven and it cannot
// be reused here, because the shim is still alive across a compaction and
// nothing may change a running process's environment.
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { seDir } from "./paths.ts";

/** Where the marker lives: beside the settings store, so it shares the
 *  machine-local, never-committed lifetime of everything else in `.se/`. */
export function compactionMarker(root: string): string {
  return join(seDir(root), "compacted");
}

/** THE HOOK'S HALF, called from a process that holds no session. */
export function markCompacted(root: string): void {
  mkdirSync(seDir(root), { recursive: true });
  writeFileSync(compactionMarker(root), `${new Date().toISOString()}\n`, "utf8");
}

/** THE ENGINE'S HALF. True once per marker, and the marker is gone after.
 *
 *  IT DELETES BEFORE IT REPORTS. A marker that outlived its own consume would
 *  re-owe the reading on every pull from then on, which is a walk that cannot
 *  move rather than a walk that reads. */
export function takeCompacted(root: string): boolean {
  const path = compactionMarker(root);
  if (!existsSync(path)) return false;
  rmSync(path, { force: true });
  return true;
}
