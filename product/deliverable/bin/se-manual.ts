// se-manual — walk the machines yourself. A tiny local server: the Mirror
// as the view, the tick as the only control. The same Session the agent
// would drive; manual ticks land in the call log like any other call.
//
//   node bin/se-manual.ts --root <project root> [--port 7333]
//
// tick · info     GET /        (tick without arguments: look, don't move)
// tick · advance  POST /tick   (tick with arguments: complete and move on)
// JSON            GET /api/tick
import { createServer } from "node:http";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { marked } from "marked";
import { CallLog } from "../engine/calllog.ts";
import { Rejection } from "../engine/errors.ts";
import { renderMirror, type MirrorState } from "../engine/render.ts";
import { resolveInRoot, seDir } from "../engine/paths.ts";
import { Session } from "../engine/session.ts";

function argValue(flag: string): string | undefined {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

if (process.argv.some((a) => a === "--help" || a === "-h" || a === "-?")) {
  process.stdout.write(`se-manual — walk the machines yourself (the Mirror, manual mode)

  node bin/se-manual.ts --root <project root> [--port 7333]

  GET  /            the mirror (tick · info implied: looking never moves)
  POST /tick        tick with arguments: complete the current state, move on
  GET  /api/tick    the tick info packet as JSON
  GET  /widget/machine | /widget/details    single widgets (tab/window)
  --help            this text (-h, -?)
`);
  process.exit(0);
}

const root = resolve(argValue("--root") ?? process.cwd());
if (!existsSync(root)) {
  process.stderr.write(`se-manual: root does not exist: ${root}\n`);
  process.exit(1);
}
const port = Number(argValue("--port") ?? 7333);

const log = new CallLog(seDir(root));
const state: MirrorState = { session: new Session(root), root, lastPacket: undefined, mode: "manual" };

const server = createServer((req, res) => {
  const url = new URL(req.url ?? "/", `http://localhost:${port}`);
  try {
    if (req.method === "POST" && url.pathname === "/tick") {
      const chunks: Buffer[] = [];
      req.on("data", (c) => chunks.push(c));
      req.on("end", () => {
        const started = Date.now();
        let to: string | undefined;
        try {
          const body = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}") as { to?: string };
          to = body.to;
        } catch {
          to = undefined;
        }
        try {
          state.lastPacket = state.session.tickAdvance(to);
          log.append({ tool: "manual_tick", args: { advance: true, ...(to !== undefined ? { to } : {}) }, ok: true, outcome: "result", duration_ms: Date.now() - started, response: state.lastPacket });
        } catch (e) {
          if (!(e instanceof Rejection)) throw e;
          state.lastPacket = e.toJSON();
          log.append({ tool: "manual_tick", args: { advance: true, ...(to !== undefined ? { to } : {}) }, ok: false, outcome: "rejected", duration_ms: Date.now() - started, response: state.lastPacket });
        }
        res.writeHead(303, { location: "/" });
        res.end();
      });
      return;
    }
    if (req.method === "POST" && url.pathname === "/evidence") {
      const chunks: Buffer[] = [];
      req.on("data", (c) => chunks.push(c));
      req.on("end", () => {
        const started = Date.now();
        try {
          const body = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}") as { state?: string };
          const result = state.session.submitEvidence(String(body.state ?? ""), { read_confirmed: true, by: "human" });
          state.lastPacket = result;
          log.append({ tool: "manual_evidence", args: { state: body.state ?? "" }, ok: true, outcome: "result", duration_ms: Date.now() - started, response: result });
        } catch (e) {
          if (!(e instanceof Rejection)) throw e;
          state.lastPacket = e.toJSON();
          log.append({ tool: "manual_evidence", args: {}, ok: false, outcome: "rejected", duration_ms: Date.now() - started, response: state.lastPacket });
        }
        res.writeHead(303, { location: "/" });
        res.end();
      });
      return;
    }
    if (url.pathname === "/doc") {
      // Serve a guidance document, rendered — links in the details pane.
      const p = url.searchParams.get("path") ?? "";
      const abs = resolveInRoot(root, p, "se-manual /doc");
      let raw = readFileSync(abs, "utf8");
      raw = raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, ""); // frontmatter is machine-facing
      const html = p.endsWith(".md") ? (marked.parse(raw) as string) : `<pre>${raw.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</pre>`;
      res.writeHead(200, { "content-type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ path: p, html }));
      return;
    }
    if (url.pathname === "/api/tick") {
      res.writeHead(200, { "content-type": "application/json; charset=utf-8" });
      res.end(JSON.stringify(state.session.tickInfo(), null, 2));
      return;
    }
    if (url.pathname === "/widget/machine" || url.pathname === "/widget/details") {
      res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      res.end(renderMirror(state, url.pathname === "/widget/machine" ? "machine" : "details", url.searchParams.get("view") ?? undefined));
      return;
    }
    // GET / — tick without arguments: information about where we are.
    // ?view=<machine> browses a machine without moving the walk.
    state.lastPacket = state.session.tickInfo();
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    res.end(renderMirror(state, undefined, url.searchParams.get("view") ?? undefined));
  } catch (e) {
    res.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
    res.end(String((e as Error).stack ?? e));
  }
});

server.listen(port, () => {
  process.stderr.write(`se-manual: walking ${root}\nse-manual: open http://localhost:${port}\n`);
});
