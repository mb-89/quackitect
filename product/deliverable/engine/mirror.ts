// The mirror's HTTP server — ONE module, two mounts: se-manual runs it
// alone (walk the machines with no agent attached), se-mcp embeds it next
// to the MCP lane (the SAME Session — the human's hand on the agent's
// walk). THE CHANNEL RULE (owner ruling 2026-07-26): HTTP is the human,
// MCP is the agent. The threshold gates only the agent; every route here
// ticks with the human's hand, and POST /threshold moves the gate live.
import { createServer, type Server } from "node:http";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import { marked } from "marked";
import { CallLog } from "./calllog.ts";
import { replayVisitsText } from "./decisions.ts";
import { Rejection } from "./errors.ts";
import { appendNote, pendingNotes, readNotes } from "./inbox.ts";
import { feedRows, renderMirror, type MirrorState } from "./render.ts";
import { resolveInRoot, seDir } from "./paths.ts";
import { Session } from "./session.ts";
import { survey } from "./survey.ts";

export interface MirrorOptions {
  session: Session;
  root: string;
  port: number;
  log: CallLog;
  mode: "manual" | "agent";
}

export function startMirror(o: MirrorOptions): Server {
  const state: MirrorState = { session: o.session, root: o.root, lastPacket: undefined, mode: o.mode, log: o.log };

  /** What the page watches: position, the two sliders, and a growth signal
   *  for the feed. One shape, served both as a poll and as a pushed event. */
  const aliveState = (): Record<string, unknown> => ({
    status: state.session.instance.status,
    // The server is going away with the walk unfinished — a quit, not an end.
    gone: state.session.serverGone,
    autonomy: state.session.autonomy,
    shutdown: state.session.shutdown,
    active: state.session.active(),
    busy: state.session.busy(),
    // A monotone change signal for the feed — the log file only grows.
    acts: existsSync(o.log.path) ? statSync(o.log.path).size : 0,
    // The agent's pointing finger — the page pulses the target on a new seq.
    ...(state.session.ping === undefined ? {} : { ping: state.session.ping }),
  });

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
      if (req.method === "POST" && url.pathname === "/shutdown") {
        post(req, res, "mirror_shutdown", (body) => ({
          args: { value: body.value },
          result: state.session.setShutdown(Number(body.value)),
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
        res.end(JSON.stringify(feedRows(o.log, state.session.startedTs, pendingNotes(seDir(o.root)))));
        return;
      }
      if (url.pathname === "/api/decisions") {
        // One state visit's decision tree — the details pane renders it.
        const visit = url.searchParams.get("visit") ?? state.session.currentVisit();
        res.writeHead(200, { "content-type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ ...state.session.decisions.graph(visit), visits: state.session.decisions.visits() }));
        return;
      }
      if (url.pathname === "/api/statetodos") {
        // A state's per-visit to-do lists plus points parked for it —
        // rendered below the state's details, one fold per visit.
        const id = url.searchParams.get("state") ?? "";
        res.writeHead(200, { "content-type": "application/json; charset=utf-8" });
        res.end(JSON.stringify(state.session.decisions.stateTodos(id)));
        return;
      }
      if (url.pathname === "/api/recdecisions") {
        // A record's decision history, per visit — tree copy first, the
        // branch when only it holds the file (dismissed expeditions).
        const expId = url.searchParams.get("exp") ?? "";
        const rel = `product/spec/expeditions/${expId}/decisions.jsonl`;
        const abs = resolveInRoot(o.root, rel, "mirror /api/recdecisions");
        let raw = "";
        if (existsSync(abs)) raw = readFileSync(abs, "utf8");
        else {
          const r = spawnSync("git", ["show", `exp/${expId}:${rel}`], { cwd: o.root, encoding: "utf8", maxBuffer: 8 * 1024 * 1024 });
          raw = r.status === 0 ? r.stdout : "";
        }
        res.writeHead(200, { "content-type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ exp: expId, visits: replayVisitsText(raw) }));
        return;
      }
      if (url.pathname === "/doc") {
        // Serve a guidance document, rendered — links in the details pane.
        const p = url.searchParams.get("path") ?? "";
        const abs = resolveInRoot(o.root, p, "mirror /doc");
        // A dismissed expedition's report lives only on its branch — read
        // it there when the tree copy is absent.
        const exp = url.searchParams.get("exp");
        let raw: string;
        if (!existsSync(abs) && exp !== null) {
          const r = spawnSync("git", ["show", `exp/${exp}:${p}`], { cwd: o.root, encoding: "utf8", maxBuffer: 8 * 1024 * 1024 });
          raw = r.status === 0 ? r.stdout : `report not found on branch exp/${exp}`;
        } else {
          raw = readFileSync(abs, "utf8");
        }
        raw = raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, ""); // frontmatter is machine-facing
        const html = p.endsWith(".md") ? (marked.parse(raw) as string) : `<pre>${raw.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</pre>`;
        if (url.searchParams.get("page") === "1") {
          // A standalone page — ctrl/shift-click targets (new tab, new window).
          res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
          res.end(`<!doctype html><html><head><meta charset="utf-8"><title>${p}</title><style>body{font-family:ui-monospace,Consolas,monospace;background:#14171a;color:#d8dde2;padding:24px;max-width:900px;margin:0 auto}a{color:#e8b339}</style></head><body>${html}</body></html>`);
          return;
        }
        res.writeHead(200, { "content-type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ path: p, html }));
        return;
      }
      if (url.pathname === "/api/form") {
        // One evidence form, lint state included — the details pane's fill
        // surface. Errors (unbound, missing template) render as data.
        const name = url.searchParams.get("name") ?? "";
        res.writeHead(200, { "content-type": "application/json; charset=utf-8" });
        try {
          res.end(JSON.stringify(state.session.formGet(name)));
        } catch (e) {
          res.end(JSON.stringify(e instanceof Rejection ? e.toJSON() : { error: String(e) }));
        }
        return;
      }
      if (req.method === "POST" && url.pathname === "/form/save") {
        post(req, res, "mirror_form_save", (body) => ({
          args: { name: body.name, fields: Object.keys((body.fields as object | undefined) ?? {}) },
          result: state.session.formSave(String(body.name ?? ""), (body.fields ?? {}) as Record<string, string>),
        }));
        return;
      }
      if (req.method === "POST" && url.pathname === "/form/confirm") {
        // THE PREFILL LAW: one confirmation per prefill — this is that click.
        post(req, res, "mirror_form_confirm", (body) => ({
          args: { name: body.name, field: body.field, index: body.index },
          result: state.session.formConfirm(String(body.name ?? ""), String(body.field ?? ""), Number(body.index ?? 0)),
        }));
        return;
      }
      if (req.method === "POST" && url.pathname === "/form/done") {
        post(req, res, "mirror_form_done", (body) => ({
          args: { name: body.name },
          result: state.session.formDone(String(body.name ?? ""), "human"),
        }));
        return;
      }
      if (req.method === "POST" && url.pathname === "/tool") {
        // THE PARITY LAW: a state's tools, the human's hand — same gate.
        // Answers JSON (no redirect): the modal shows the result in place.
        const chunks: Buffer[] = [];
        req.on("data", (c) => chunks.push(c));
        req.on("end", () => {
          const started = Date.now();
          let body: Record<string, unknown> = {};
          try {
            body = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}") as Record<string, unknown>;
          } catch {
            body = {};
          }
          const name = String(body.name ?? "");
          const toolArgs = (body.args ?? {}) as Record<string, unknown>;
          res.writeHead(200, { "content-type": "application/json; charset=utf-8" });
          try {
            const result = state.session.humanTool(name, toolArgs);
            o.log.append({ tool: "mirror_tool", args: { name, tool_args: toolArgs }, ok: true, outcome: "result", duration_ms: Date.now() - started, response: result });
            res.end(JSON.stringify(result));
          } catch (e) {
            const payload = e instanceof Rejection ? e.toJSON() : { error: String(e) };
            o.log.append({ tool: "mirror_tool", args: { name, tool_args: toolArgs }, ok: false, outcome: "rejected", duration_ms: Date.now() - started, response: payload });
            res.end(JSON.stringify(payload));
          }
        });
        return;
      }
      if (req.method === "POST" && url.pathname === "/note") {
        post(req, res, "mirror_note", (body) => ({
          args: { text: body.text },
          result: appendNote(seDir(o.root), String(body.text ?? ""), "human"),
        }));
        return;
      }
      if (req.method === "POST" && url.pathname === "/target") {
        post(req, res, "mirror_target", (body) => ({
          args: { to: body.to },
          result: state.session.setTarget(String(body.to ?? "")),
        }));
        return;
      }
      if (req.method === "POST" && url.pathname === "/escape") {
        post(req, res, "mirror_escape", (body) => ({
          args: { reason: body.reason },
          result: state.session.escape(String(body.reason ?? ""), "human"),
        }));
        return;
      }
      if (req.method === "POST" && url.pathname === "/form/folder") {
        post(req, res, "mirror_form_folder", (body) => ({
          args: { name: body.name },
          result: state.session.formFolder(String(body.name ?? "")),
        }));
        return;
      }
      if (url.pathname === "/api/tick") {
        res.writeHead(200, { "content-type": "application/json; charset=utf-8" });
        res.end(JSON.stringify(state.session.tickInfo(), null, 2));
        return;
      }
      if (url.pathname === "/api/survey") {
        // BOTH HANDS ASK IT (owner ruling 2026-07-28): the agent through
        // se_survey, the person through the machine header's button.
        res.writeHead(200, { "content-type": "application/json; charset=utf-8" });
        res.end(JSON.stringify(survey(o.root)));
        return;
      }
      if (url.pathname === "/events") {
        // THE MIRROR IS PUSHED, NOT POLLED (owner ruling 2026-07-28). The
        // walk already wakes every held hand; this forwards that wake to
        // the page. The wait's timeout doubles as the re-check for things
        // that grow without moving the walk, like the log.
        res.writeHead(200, {
          "content-type": "text/event-stream; charset=utf-8",
          "cache-control": "no-cache",
          connection: "keep-alive",
        });
        let open = true;
        req.on("close", () => { open = false; });
        void (async () => {
          let last = "";
          while (open) {
            const now = JSON.stringify(aliveState());
            if (now !== last) { last = now; res.write(`data: ${now}\n\n`); }
            await state.session.waitForChange(2000);
          }
          res.end();
        })();
        return;
      }
      if (url.pathname === "/api/alive") {
        // The mirror polls this: position + threshold move under the page
        // (the agent's hand, or another window). Failing to answer at all
        // reads as "session over" client-side.
        res.writeHead(200, { "content-type": "application/json; charset=utf-8" });
        res.end(JSON.stringify(aliveState()));
        return;
      }
      if (url.pathname === "/widget/machine" || url.pathname === "/widget/details" || url.pathname === "/widget/log" || url.pathname === "/widget/terminal") {
        res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
        res.end(renderMirror(state, url.pathname.slice("/widget/".length) as "machine" | "details" | "log" | "terminal", url.searchParams.get("view") ?? undefined));
        return;
      }
      // GET / — tick without arguments: information about where we are.
      // ?view=<machine> browses a machine without moving the walk.
      state.lastPacket = state.session.tickInfo();
      res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      res.end(renderMirror(state, undefined, url.searchParams.get("view") ?? undefined, url.searchParams.get("card") ?? undefined));
    } catch (e) {
      res.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
      res.end(String((e as Error).stack ?? e));
    }
  });

  server.listen(o.port);
  return server;
}
