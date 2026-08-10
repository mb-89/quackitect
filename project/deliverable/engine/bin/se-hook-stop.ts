// se-hook-stop — THE UNSANCTIONED STOP IS REFUSED MECHANICALLY.
//
// The contract has said it in prose since 2026-08-07: a turn ends when the
// work does, a report is not a checkpoint, size is not a reason. Prose
// failed four recorded times in two days. This hook is the tooth.
//
// BOTH HOSTS RUN IT. Claude Code fires it as a Stop hook from
// .claude/settings.json. Copilot CLI fires the same script twice over:
// it reads the repository's .claude/settings.json cross-tool, and the
// repo root carries .github/hooks/se-stop.json naming the PascalCase
// "Stop" event — which selects the VS-Code-compatible payload, the same
// snake_case shape Claude sends. One script, one parser, one output:
// {"decision": "block", "reason": ...} on stdout, exit 0. Copilot ignores
// non-zero exits on agentStop, so the block MUST ride stdout JSON.
//
// WHEN A STOP IS SANCTIONED, from the engine's own ground truth (the call
// log — the hook never calls the mirror over HTTP, which would deadlock
// the session's own server):
//
// - the last pull answered "wait" — the machine's own stop: idle, the
//   desk with no goal, or a step above the slider;
// - no pull is on record — the engine never ran here;
// - stop_hook_active is set — this stop was already blocked once. The
//   valve for a question that genuinely BLOCKS: ask it in one line, stop
//   again, and the tooth lets it through. It bites once per stop.
//
// Everything else — do, read, fill, choose — is a walk standing mid-work,
// and the stop is refused with the reason on it.
//
// A hook must never break the turn, so every failure is swallowed and the
// exit is always clean.

import { closeSync, fstatSync, openSync, readSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// bin -> engine -> deliverable -> product -> the project root. The env
// override is the test seam — the suite points the hook at a crafted log.
const root = process.env.SE_HOOK_ROOT ?? resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "..");

// The newest pull can carry a whole document, so the tail window is wide.
const TAIL_BYTES = 4 * 1024 * 1024;

function tailOf(path: string): string {
  const fd = openSync(path, "r");
  try {
    const size = fstatSync(fd).size;
    const start = Math.max(0, size - TAIL_BYTES);
    const buf = Buffer.alloc(size - start);
    readSync(fd, buf, 0, buf.length, start);
    return buf.toString("utf8");
  } finally {
    closeSync(fd);
  }
}

/** The newest se_pull's answer, read from the log tail. */
function lastPull(): { pull?: string; where?: unknown } | undefined {
  const lines = tailOf(join(root, ".se", "calls.jsonl")).split("\n");
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i].trim();
    if (line === "") continue;
    try {
      const rec = JSON.parse(line) as { tool?: string; ok?: boolean; response?: unknown };
      if (rec.tool !== "se_pull" || rec.ok !== true) continue;
      const r = typeof rec.response === "string" ? (JSON.parse(rec.response) as unknown) : rec.response;
      return (r ?? {}) as { pull?: string; where?: unknown };
    } catch {
      // the first line of the tail may be a torn record; a broken line is skipped
    }
  }
  return undefined;
}

let raw = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (c: string) => {
  raw += c;
});
process.stdin.on("end", () => {
  try {
    const p = JSON.parse(raw || "{}") as { stop_hook_active?: boolean; stopHookActive?: boolean };
    // The bites-once valve: a stop already blocked once passes, so a
    // genuinely blocking question can be asked and the turn ended.
    if (p.stop_hook_active === true || p.stopHookActive === true) {
      process.exit(0);
    }
    const last = lastPull() ?? {};
    const pull = last.pull;
    if (pull === undefined || pull === "wait") process.exit(0);
    const where = Array.isArray(last.where) ? (last.where as unknown[]).join(", ") : String(last.where ?? "");
    process.stdout.write(
      JSON.stringify({
        decision: "block",
        reason:
          `[se] The walk stands mid-work: the last pull answered "${pull}"` +
          (where !== "" ? ` at ${where}` : "") +
          ". A report is not a checkpoint and size is not a reason — call se_pull and keep walking. " +
          "If you are stopped on a question that BLOCKS (no answer could let the walk continue from here), " +
          "ask it in one line and stop again; this tooth bites once per stop.",
      }),
    );
  } catch {
    /* a hook must never break the turn */
  }
  process.exit(0);
});
