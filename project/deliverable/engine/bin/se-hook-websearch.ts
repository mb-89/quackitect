// se-hook-websearch — THE WEB SEARCH REACHES THE FEED MECHANICALLY.
//
// AGENTS.md used to carry a "logging duty": after every native search, the
// agent was to record the query itself. That is discipline, and discipline
// is exactly what the owner did not want to depend on (ruling 2026-07-28).
// Claude Code runs this after every WebSearch instead, so the query lands in
// the same log the lane writes and the mirror tells the whole story — no
// matter who did the searching or whether they remembered.
//
// It NEVER calls the mirror over HTTP. That deadlocks the session's own
// server, which is a standing caution here. A file append has no such path.
//
// A hook must never break the turn, so every failure is swallowed and the
// exit is always clean.
import { appendFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { randomBytes } from "node:crypto";

// bin -> engine -> deliverable -> product -> the project root.
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "..");

let raw = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (c: string) => { raw += c; });
process.stdin.on("end", () => {
  try {
    const payload = JSON.parse(raw || "{}") as { tool_name?: string; tool_input?: { query?: unknown } };
    const query = payload.tool_input?.query;
    if (payload.tool_name === "WebSearch" && typeof query === "string" && query !== "") {
      const dir = join(root, ".se");
      mkdirSync(dir, { recursive: true });
      appendFileSync(
        join(dir, "calls.jsonl"),
        JSON.stringify({
          ref: `call-${randomBytes(6).toString("hex")}`,
          ts: new Date().toISOString(),
          tool: "WebSearch",
          args: { query },
          ok: true,
          outcome: "result",
          duration_ms: 0,
          se_version: "3.0.0-bootstrap",
        }) + "\n",
        "utf8",
      );
    }
  } catch { /* a hook must never break the turn */ }
  process.exit(0);
});
