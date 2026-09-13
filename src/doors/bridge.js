// THE SERVER behind the bridgehead. Plain node on this box: it takes every
// event the bridgehead posts, logs it at debug, whole, and answers what the
// bridgehead does with it. The doors and the state live here, so the debugger
// attaches here, and a restart loses the session nothing.
// [[spec/design_output/level0#the-bridgehead-and-the-server]]

import { createServer } from "node:http";
import { appendFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { rowOf, SESSION } from "../../.claude/skills/level0/lib/log.js";

export const PORT = 6510;

// The one place an event is decided. Put a breakpoint here.
export function decide(event, e) {
  return { pass: true };
}

export function serve(root, port = PORT, say = console.log) {
  const path = join(root, SESSION);
  mkdirSync(dirname(path), { recursive: true });

  const server = createServer((request, response) => {
    if (request.method !== "POST" || request.url !== "/event") {
      response.writeHead(request.url === "/health" ? 200 : 404, {
        "content-type": "application/json",
      });
      response.end(JSON.stringify({ ok: request.url === "/health", port }));
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
      const event = String(said.event ?? "event");
      const e = said.e;
      const tool = e?.tool ? ` ${e.tool}` : "";
      const agent = e?.agentId ? ` agent=${e.agentId}` : "";
      const row = rowOf(
        new Date().toISOString(),
        "debug",
        "hook",
        `${event}${tool}${agent}`,
        {
          event,
          ...(e?.tool ? { tool: String(e.tool) } : {}),
          ...(e?.agentId ? { agent: String(e.agentId) } : {}),
          text: JSON.stringify(e ?? null, null, 1) ?? "null",
        },
      );
      appendFileSync(path, `${JSON.stringify(row)}\n`);
      const answer = decide(event, e);
      response.writeHead(200, { "content-type": "application/json" });
      response.end(JSON.stringify(answer));
    });
  });

  server.listen(port, "127.0.0.1", () => {
    say(
      `the server stands at http://127.0.0.1:${port}, and writes ${SESSION} under ${root}`,
    );
  });
  return server;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const root = process.argv[2] ?? process.cwd();
  serve(root, Number(process.env.SE_BRIDGE_PORT ?? PORT));
}
