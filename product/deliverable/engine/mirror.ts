// The mirror's HTTP server — ONE module, two mounts: se-manual runs it
// alone (walk the machines with no agent attached), se-mcp embeds it next
// to the MCP lane (the SAME Session — the human's hand on the agent's
// walk). THE CHANNEL RULE (owner ruling 2026-07-26): HTTP is the human,
// MCP is the agent. The threshold gates only the agent; every route here
// ticks with the human's hand, and POST /threshold moves the gate live.
import { createServer, type Server } from "node:http";
import { existsSync, readFileSync, statSync } from "node:fs";
import { marked } from "marked";
import { CallLog } from "./calllog.ts";
import { Rejection } from "./errors.ts";
import { readNotes } from "./inbox.ts";
import { feedRows, renderMirror, type MirrorState } from "./render.ts";
import { resolveInRoot, seDir } from "./paths.ts";
import { Session } from "./session.ts";

export interface MirrorOptions {
  session: Session;
  root: string;
  port: number;
  log: CallLog;
  mode: "manual" | "agent";
}

export function startMirror(o: MirrorOptions): Server {
  const state: MirrorState = { session: o.session, root: o.root, lastPacket: undefined, mode: o.mode, log: o.log };

  /** Collect a JSON body, run the handler (results may be async — script
   *  runs take seconds and must not block the server), log it, redirect. */
  const post = (req: import("node:http").IncomingMessage, res: import("node:http").ServerResponse, tool: string, handle: (body: Record<string, unknown>) => { args: Record<string, unknown>; result: unknown }): void => {
    const chunks: Buffer[] = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      void (async () => {
        const started = Date.now();
        let args: Record<string, unknown> = {};
        try {
          let body: Record<string, unknown> = {};
          try {
            body = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}") as Record<string, unknown>;
          } catch {
            body = {};
          }
          const r = handle(body);
          args = r.args;
          state.lastPacket = await r.result;
          o.log.append({ tool, args, ok: true, outcome: "result", duration_ms: Date.now() - started, response: state.lastPacket });
        } catch (e) {
          if (!(e instanceof Rejection)) {
            res.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
            res.end(String((e as Error).stack ?? e));
            return;
          }
          state.lastPacket = e.toJSON();
          o.log.append({ tool, args, ok: false, outcome: "rejected", duration_ms: Date.now() - started, response: state.lastPacket });
        }
        res.writeHead(303, { location: "/" });
        res.end();
      })();
    });
  };

  const server = createServer((req, res) => {
    const url = new URL(req.url ?? "/", `http://localhost:${o.port}`);
    try {
      if (req.method === "POST" && url.pathname === "/tick") {
        post(req, res, "mirror_tick", (body) => {
          if (body.back !== undefined) {
            return { args: { back: body.back }, result: state.session.jumpBack(String(body.back), "human") };
          }
          const to = typeof body.to === "string" ? body.to : undefined;
          return {
            args: { advance: true, ...(to !== undefined ? { to } : {}) },
            result: state.session.tickAdvance(to, "human"),
          };
        });
        return;
      }
      if (req.method === "POST" && url.pathname === "/check") {
        // The human's proof-of-read: one checkbox per doc VERSION. The
        // check pins the doc's current hash; an edited doc asks again.
        post(req, res, "mirror_check", (body) => ({
          args: { path: body.path ?? "" },
          result: state.session.humanCheck(String(body.path ?? "")),
        }));
        return;
      }
      if (req.method === "POST" && url.pathname === "/script") {
        post(req, res, "mirror_script", (body) => ({
          args: { state: body.state ?? "" },
          result: state.session.scriptRun(String(body.state ?? "")),
        }));
        return;
      }
      if (req.method === "POST" && url.pathname === "/autonomy") {
        // The slider — how much of the walk is the agent's. Logged like
        // every other hand on the machinery.
        post(req, res, "mirror_autonomy", (body) => ({
          args: { value: body.value },
          result: state.session.setAutonomy(Number(body.value)),
        }));
        return;
      }
      if (url.pathname === "/api/log") {
        // The unified feed — session-scoped; ?ref= fetches one record in
        // full (request AND response — the details pane's combined object).
        const ref = url.searchParams.get("ref");
        res.writeHead(200, { "content-type": "application/json; charset=utf-8" });
        if (ref !== null) {
          // note- refs live in the inbox, not the call log — a pending
          // stray's details come from its own record.
          const rec = ref.startsWith("note-") ? readNotes(seDir(o.root)).find((n) => n.ref === ref) : o.log.find(ref);
          res.end(JSON.stringify(rec ?? { missing: ref }));
          return;
        }
        res.end(JSON.stringify(feedRows(o.log, state.session.startedTs, readNotes(seDir(o.root)))));
        return;
      }
      if (url.pathname === "/api/decisions") {
        // One state visit's decision tree — the details pane renders it.
        const visit = url.searchParams.get("visit") ?? state.session.currentVisit();
        res.writeHead(200, { "content-type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ ...state.session.decisions.graph(visit), visits: state.session.decisions.visits() }));
        return;
      }
      if (url.pathname === "/doc") {
        // Serve a guidance document, rendered — links in the details pane.
        const p = url.searchParams.get("path") ?? "";
        const abs = resolveInRoot(o.root, p, "mirror /doc");
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
      if (url.pathname === "/api/alive") {
        // The mirror polls this: position + threshold move under the page
        // (the agent's hand, or another window). Failing to answer at all
        // reads as "session over" client-side.
        res.writeHead(200, { "content-type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({
          status: state.session.instance.status,
          autonomy: state.session.autonomy,
          active: state.session.active(),
          busy: state.session.busy(),
          // A monotone change signal for the feed — the log file only grows.
          acts: existsSync(o.log.path) ? statSync(o.log.path).size : 0,
        }));
        return;
      }
      if (url.pathname === "/widget/machine" || url.pathname === "/widget/details" || url.pathname === "/widget/log") {
        res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
        res.end(renderMirror(state, url.pathname.slice("/widget/".length) as "machine" | "details" | "log", url.searchParams.get("view") ?? undefined));
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

  server.listen(o.port);
  return server;
}
