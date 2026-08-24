// see dsp-boot-and-power.md — the durable lifecycle log.
//
// WHY A FILE AND NOT THE CALL LOG. A call log records calls. What this exists
// to answer is what happened when there was no call to record: the server
// starting, exiting, or a client's socket being reset mid-flight.
//
// THE SPIKE THAT ASKED FOR IT. exp-copilot-connection-reset-keeps-server-alive
// saw VS Code report ECONNRESET, and had to check a PID and a port listener by
// hand to find out the server was still alive. Absence of a record was the
// only evidence, and absence is not evidence a person can act on.
import { appendFileSync, mkdirSync } from "node:fs";
import type { Server } from "node:http";
import { join } from "node:path";

/** One line in the lifecycle log. The layer word is what a later reader
 *  matches on, so it is a closed set rather than free prose. */
export type LifecycleEvent =
  | "start"
  | "exit"
  | "client-reset"
  | "client-error"
  | "listening"
  // THE STOP HOOK'S THREE OUTCOMES, and it needs all three. `stop-block` alone
  // meant a permitted stop and a hook that broke on the way to deciding looked
  // identical from outside — both simply left no line.
  | "stop-block"
  | "stop-pass"
  | "stop-error"
  | "reaped";

/** Append one lifecycle line. Never throws: a postmortem that cannot be
 *  written must not become the cause of death. */
export function recordLifecycle(root: string, event: LifecycleEvent, detail = ""): void {
  try {
    const dir = join(root, ".se");
    mkdirSync(dir, { recursive: true });
    const line = `${new Date().toISOString()} pid=${String(process.pid)} ${event}${detail === "" ? "" : ` ${detail}`}\n`;
    appendFileSync(join(dir, "engine.log"), line, "utf8");
  } catch {
    // best effort, always
  }
}

/** Wire a listening HTTP server so a client's socket failure is RECORDED
 *  rather than inferred from silence.
 *
 *  ECONNRESET IS THE CLIENT, NOT THE SERVER, and telling those apart is the
 *  whole point. A reset logged here beside a `start` that did not repeat is
 *  positive evidence the process survived. */
export function recordClientFailures(root: string, server: Server): void {
  server.on("clientError", (err: NodeJS.ErrnoException, socket) => {
    const code = err.code ?? "";
    recordLifecycle(root, code === "ECONNRESET" ? "client-reset" : "client-error", `${code} ${err.message}`.trim());
    socket.destroy();
  });
}
