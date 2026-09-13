// THE SERVER behind the bridgehead. Plain node on this box: it takes every
// event the bridgehead posts, decides it, and answers what the bridgehead does
// with it. The doors, the log and the state live here, so the debugger
// attaches here, and a restart loses the session nothing.
// [[spec/design_output/level0#the-bridgehead-and-the-server]]

import { createServer } from "node:http";
import { appendFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { rowOf, SESSION } from "../../.claude/skills/level0/lib/log.js";

export const PORT = 6510;

// The fields of an event worth a glance on the row, beside the whole event in the text.
const GLANCE = [
  "tool",
  "agentId",
  "tool_use_id",
  "file_path",
  "command",
  "reason",
  "turnId",
  "index",
  "model",
  "name",
  "trigger",
];

// The one place an event is decided. Every event goes through here, and the
// line it writes carries the event, its origin and what the answer is.
export function decide(said, log) {
  const event = String(said?.event ?? "event");
  const e = said?.e;
  const origin = said?.origin ?? null;
  const answer = { pass: true };
  const glance = {};
  for (const key of GLANCE) {
    if (e && e[key] !== undefined && e[key] !== null && typeof e[key] !== "object") {
      glance[key] = String(e[key]);
    }
  }
  const text =
    typeof e?.text === "string"
      ? e.text
      : typeof e?.answer === "string"
        ? e.answer
        : "";
  log(
    rowOf(new Date().toISOString(), "debug", "hook", saidOf(event, glance), {
      event,
      ...glance,
      ...(origin?.kind ? { origin: String(origin.kind) } : {}),
      ...(text ? { chars: String(text.length) } : {}),
      answer: JSON.stringify(answer),
      text: JSON.stringify({ e: e ?? null, origin }, null, 1),
    }),
  );
  return answer;
}

function saidOf(event, glance) {
  const tool = glance.tool ? ` ${glance.tool}` : "";
  const agent = glance.agentId ? ` agent=${glance.agentId}` : "";
  const aim = glance.file_path ?? glance.command ?? glance.reason ?? "";
  return `${event}${tool}${agent}${aim ? ` ${aim}` : ""}`;
}

export function serve(root, port = PORT, say = console.log) {
  const path = join(root, SESSION);
  mkdirSync(dirname(path), { recursive: true });
  const log = (row) => appendFileSync(path, `${JSON.stringify(row)}\n`);

  const server = createServer((request, response) => {
    // A stop over the wire runs the stop line, where a kill on Windows runs no handler.
    if (request.method === "POST" && request.url === "/stop") {
      response.writeHead(200, { "content-type": "application/json" });
      response.end(JSON.stringify({ ok: true }));
      setTimeout(stop, 20);
      return;
    }
    if (request.method !== "POST" || request.url !== "/event") {
      const ok = request.url === "/health";
      response.writeHead(ok ? 200 : 404, { "content-type": "application/json" });
      response.end(JSON.stringify({ ok, port }));
      return;
    }
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
    });
    request.on("end", () => {
      let said = { event: "event", e: null };
      try {
        said = JSON.parse(body || "{}");
      } catch {}
      const answer = decide(said, log);
      response.writeHead(200, { "content-type": "application/json" });
      response.end(JSON.stringify(answer));
    });
  });

  server.listen(port, "127.0.0.1", () => {
    const where = `http://127.0.0.1:${port}`;
    log(
      rowOf(
        new Date().toISOString(),
        "info",
        "bridge",
        `the server stands at ${where}`,
        { root },
      ),
    );
    say(`the server stands at ${where}, and writes ${SESSION} under ${root}`);
  });
  const stop = () => {
    log(
      rowOf(
        new Date().toISOString(),
        "info",
        "bridge",
        `the server stops at http://127.0.0.1:${port}`,
      ),
    );
    server.close();
    process.exit(0);
  };
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
  return server;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const root = process.argv[2] ?? process.cwd();
  serve(root, Number(process.env.SE_BRIDGE_PORT ?? PORT));
}
