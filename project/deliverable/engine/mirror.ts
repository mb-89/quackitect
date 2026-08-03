// The mirror's HTTP server — ONE module, two mounts: se-manual runs it
// alone, se-mcp embeds it beside the MCP lane on the SAME Session.
// HTTP is the person, MCP is the agent, and the threshold gates only the
// agent — so every route here moves the walk by the person's hand.

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import { createServer, type Server } from "node:http";
import { createRequire } from "node:module";
import { marked } from "marked";
import { applyBaseOp, type BaseOp } from "./bases.ts";
import { helpFor } from "./baseui.ts";
import type { CallLog } from "./calllog.ts";
import { loadCards } from "./cards.ts";
import { replayVisitsText } from "./decisions.ts";
import { Rejection } from "./errors.ts";
import { appendNote, pendingNotes, readNotes } from "./inbox.ts";
import { bumpDrawingEpoch } from "./machines/compile.ts";
import { handleHttp, type McpServer } from "./mcp.ts";
import { loadPanel, renderPanel } from "./params.ts";
import { resolveInRoot, seDir } from "./paths.ts";
import { feedRows, type MirrorState, renderMirror } from "./render.ts";
import { loadLevels } from "./scale.ts";
import type { Session } from "./session.ts";
import { survey } from "./survey.ts";
import { editCell } from "./tables.ts";

export interface MirrorOptions {
  session: Session;
  root: string;
  port: number;
  log: CallLog;
  mode: "manual" | "agent";
  /** When given, /mcp serves the agent lane over HTTP — same dispatch as stdio. */
  mcp?: McpServer;
}

export function startMirror(o: MirrorOptions): Server {
  const state: MirrorState = { session: o.session, root: o.root, lastPacket: undefined, mode: o.mode, log: o.log };

  /** What the page watches: position, the two sliders, and a growth signal
   *  for the feed. One shape, served both as a poll and as a pushed event. */
  const aliveState = (): Record<string, unknown> => ({
    // Which project this server walks — an attaching shim or host refuses
    // to join a stranger's walk on a matching port.
    root: o.root,
    status: state.session.instance.status,
    // The server is going away with the walk unfinished — a quit, not an end.
    gone: state.session.serverGone,
    autonomy: state.session.autonomy,
    emergency: state.session.emergency,
    power: state.session.power,
    active: state.session.active(),
    busy: state.session.busy(),
    ...(state.session.progress() === undefined ? {} : { progress: state.session.progress() }),
    // A monotone change signal for the feed — the log file only grows.
    acts: existsSync(o.log.path) ? statSync(o.log.path).size : 0,
    // The agent's pointing finger — the page pulses the target on a new seq.
    ...(state.session.ping === undefined ? {} : { ping: state.session.ping }),
  });

  /** Collect a JSON body, run the handler (results may be async — script
   *  runs take seconds and must not block the server), log it, redirect. */
  const post = (
    req: import("node:http").IncomingMessage,
    res: import("node:http").ServerResponse,
    tool: string,
    handle: (body: Record<string, unknown>) => { args: Record<string, unknown>; result: unknown },
  ): void => {
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

  // ── THE ROUTE TABLES ──────────────────────────────────────────────────────────────
  // One dispatcher, three shapes: redirecting POSTs (the `post` helper),
  // JSON-answering POSTs (one named handler each), and GET routes. A new
  // route is a table entry; the dispatcher never grows another branch.
  type Req = import("node:http").IncomingMessage;
  type Res = import("node:http").ServerResponse;
  type Body = Record<string, unknown>;

  const redirectPosts: Record<string, [string, (body: Body) => { args: Body; result: unknown }]> = {
    // The human's proof-of-read: one checkbox per doc VERSION. The
    // check pins the doc's current hash; an edited doc asks again.
    "/check": ["mirror_check", (body) => ({ args: { path: body.path ?? "" }, result: state.session.humanCheck(String(body.path ?? "")) })],
    "/script": [
      "mirror_script",
      (body) => ({ args: { state: body.state ?? "" }, result: state.session.scriptRun(String(body.state ?? "")) }),
    ],
    "/emergency": [
      "mirror_emergency",
      (body) => ({ args: { on: body.on === true }, result: state.session.setEmergency(body.on === true) }),
    ],
    "/power": [
      "mirror_power",
      (body) => ({ args: { value: body.value }, result: state.session.setPower(String(body.key), body.on === true) }),
    ],
    // How often narration is OWED. The reader's hand, logged like the rest.
    "/narration": [
      "mirror_narration",
      (body) => ({
        args: { minutes: body.minutes, calls: body.calls },
        result: state.session.setNarration(Number(body.minutes), Number(body.calls)),
      }),
    ],
    // THE NOW BUTTON. It does not narrate for the agent — it makes an
    // update DUE, so the next call has to carry one.
    "/narration-now": ["mirror_narration_now", () => ({ args: {}, result: state.session.narrationDueNow() })],
    // The slider — how much of the walk is the agent's. Logged like
    // every other hand on the machinery.
    "/autonomy": ["mirror_autonomy", (body) => ({ args: { value: body.value }, result: state.session.setAutonomy(Number(body.value)) })],
    "/form/save": [
      "mirror_form_save",
      (body) => ({
        args: { name: body.name, fields: Object.keys((body.fields as object | undefined) ?? {}) },
        result: state.session.formSave(String(body.name ?? ""), (body.fields ?? {}) as Record<string, string>),
      }),
    ],
    // THE PREFILL LAW: one confirmation per prefill — this is that click.
    "/form/confirm": [
      "mirror_form_confirm",
      (body) => ({
        args: { name: body.name, field: body.field, index: body.index },
        result: state.session.formConfirm(String(body.name ?? ""), String(body.field ?? ""), Number(body.index ?? 0)),
      }),
    ],
    "/form/done": [
      "mirror_form_done",
      (body) => ({ args: { name: body.name }, result: state.session.formDone(String(body.name ?? ""), "human") }),
    ],
    // THE PRIORITY RIDES THE NOTE (owner, 2026-08-01). The note row draws
    // a MoSCoW choice, and a capture that dropped it made every stray a
    // "could" whatever the reader picked.
    "/note": [
      "mirror_note",
      (body) => ({
        args: { text: body.text, priority: body.priority },
        result: appendNote(
          seDir(o.root),
          String(body.text ?? ""),
          "human",
          undefined,
          body.priority === "must" || body.priority === "should" ? body.priority : "could",
        ),
      }),
    ],
    "/target": ["mirror_target", (body) => ({ args: { to: body.to }, result: state.session.setTarget(String(body.to ?? "")) })],
    "/escape": [
      "mirror_escape",
      (body) => ({ args: { reason: body.reason }, result: state.session.escape(String(body.reason ?? ""), "human") }),
    ],
    "/form/folder": [
      "mirror_form_folder",
      (body) => ({ args: { name: body.name }, result: state.session.formFolder(String(body.name ?? "")) }),
    ],
  };

  const json = (res: Res, payload: unknown): void => {
    res.writeHead(200, { "content-type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(payload));
  };
  const whyOf = (e: unknown): string => (e instanceof Rejection ? `${e.expected} — got ${e.got}` : String((e as Error).message ?? e));

  /** A JSON-answering POST: body in, apply, log, answer IN PLACE — the
   *  caller replaces one element instead of reloading the page under the
   *  reader. `apply` names the args first, so a throw still logs them. */
  const jsonPost = (
    req: Req,
    res: Res,
    tool: string,
    apply: (body: Body) => { args: Body; run: () => { log: unknown; answer: unknown } },
    onError: (e: unknown) => unknown,
  ): void => {
    const chunks: Buffer[] = [];
    req.on("data", (c: Buffer) => chunks.push(c));
    req.on("end", () => {
      const started = Date.now();
      let args: Body = {};
      let body: Body = {};
      try {
        body = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}") as Body;
      } catch {
        body = {};
      }
      res.writeHead(200, { "content-type": "application/json; charset=utf-8" });
      try {
        const a = apply(body);
        args = a.args;
        const r = a.run();
        o.log.append({ tool, args, ok: true, outcome: "result", duration_ms: Date.now() - started, response: r.log });
        res.end(JSON.stringify(r.answer));
      } catch (e) {
        const payload = e instanceof Rejection ? e.toJSON() : { error: whyOf(e) };
        o.log.append({ tool, args, ok: false, outcome: "rejected", duration_ms: Date.now() - started, response: payload });
        res.end(JSON.stringify(onError(e)));
      }
    });
  };

  const jsonPosts: Record<string, (req: Req, res: Res) => void> = {
    // THE PARITY LAW: a state's tools, the human's hand — same gate.
    // Answers JSON (no redirect): the modal shows the result in place.
    "/tool": (req, res) =>
      jsonPost(
        req,
        res,
        "mirror_tool",
        (body) => {
          const name = String(body.name ?? "");
          const toolArgs = (body.args ?? {}) as Body;
          return {
            args: { name, tool_args: toolArgs },
            run: () => {
              const result = state.session.humanTool(name, toolArgs);
              return { log: result, answer: result };
            },
          };
        },
        (e) => (e instanceof Rejection ? e.toJSON() : { error: String(e) }),
      ),
    // A CELL EDIT IS A WRITE, so it joins the feed like every other one.
    // The table replaces the one cell in place — reloading the whole page
    // under somebody who is still editing is not an answer.
    "/table/edit": (req, res) =>
      jsonPost(
        req,
        res,
        "mirror_cell_edit",
        (body) => {
          const cell = { path: String(body.path ?? ""), key: String(body.key ?? ""), text: String(body.text ?? "") };
          return {
            args: { ...cell },
            run: () => {
              const written = editCell(o.root, cell);
              return { log: written, answer: { ok: true, ...written } };
            },
          };
        },
        (e) => ({ ok: false, error: whyOf(e) }),
      ),
    // A CONTROL IS A WRITE, so it joins the feed like every other one. It
    // answers JSON and the card redraws itself from disk afterwards, which
    // is what makes the file rather than the surface the state.
    "/base/edit": (req, res) =>
      jsonPost(
        req,
        res,
        "mirror_base_edit",
        (rawBody) => {
          const body = rawBody as unknown as BaseOp;
          return {
            args: { op: body.op, file: body.file, view: body.view },
            run: () => {
              applyBaseOp(o.root, body);
              return { log: { written: body.file }, answer: { ok: true } };
            },
          };
        },
        (e) => ({ ok: false, error: whyOf(e) }),
      ),
  };

  const gets: Record<string, (url: URL, req: Req, res: Res) => void> = {
    // The unified feed — session-scoped; ?ref= fetches one record in
    // full (request AND response — the details pane's combined object).
    // BUILD THE BODY BEFORE THE HEAD. A throw after writeHead leaves the
    // response open for ever: the browser waits on it, the promise behind
    // the click never settles, and from the page that is indistinguishable
    // from a click nothing was listening for.
    "/api/log": (url, _req, res) => {
      const ref = url.searchParams.get("ref");
      let body: string;
      try {
        if (ref !== null) {
          // note- refs live in the inbox, not the call log — a pending
          // stray's details come from its own record.
          const rec = ref.startsWith("note-") ? readNotes(seDir(o.root)).find((n) => n.ref === ref) : o.log.find(ref);
          body = JSON.stringify(rec ?? { missing: ref });
        } else {
          body = JSON.stringify(feedRows(o.log, state.session.startedTs, pendingNotes(seDir(o.root))));
        }
      } catch (e) {
        body = JSON.stringify({ error: e instanceof Error ? e.message : String(e), ref });
      }
      res.writeHead(200, { "content-type": "application/json; charset=utf-8" });
      res.end(body);
    },
    // One state visit's decision tree — the details pane renders it.
    "/api/decisions": (url, _req, res) => {
      const visit = url.searchParams.get("visit") ?? state.session.currentVisit();
      json(res, { ...state.session.decisions.graph(visit), visits: state.session.decisions.visits() });
    },
    // A state's per-visit to-do lists plus points parked for it —
    // rendered below the state's details, one fold per visit.
    "/api/statetodos": (url, _req, res) => {
      json(res, state.session.decisions.stateTodos(url.searchParams.get("state") ?? ""));
    },
    // A record's decision history, per visit — tree copy first, the
    // branch when only it holds the file (dismissed expeditions).
    "/api/recdecisions": (url, _req, res) => {
      const expId = url.searchParams.get("exp") ?? "";
      const rel = `project/spec/expeditions/${expId}/decisions.jsonl`;
      const abs = resolveInRoot(o.root, rel, "mirror /api/recdecisions");
      let raw = "";
      if (existsSync(abs)) raw = readFileSync(abs, "utf8");
      else {
        const r = spawnSync("git", ["show", `exp/${expId}:${rel}`], { cwd: o.root, encoding: "utf8", maxBuffer: 8 * 1024 * 1024 });
        raw = r.status === 0 ? r.stdout : "";
      }
      json(res, { exp: expId, visits: replayVisitsText(raw) });
    },
    // Serve a guidance document, rendered — links in the details pane.
    "/doc": (url, _req, res) => {
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
        res.end(
          `<!doctype html><html><head><meta charset="utf-8"><title>${p}</title><style>body{font-family:ui-monospace,Consolas,monospace;background:#14171a;color:#d8dde2;padding:24px;max-width:900px;margin:0 auto}a{color:#e8b339}</style></head><body>${html}</body></html>`,
        );
        return;
      }
      json(res, { path: p, html });
    },
    // THE COMPONENT LIBRARY, served from the engine's own dependencies.
    // The mirror is a page we serve ourselves rather than a webview asset,
    // so this is an ordinary script tag: no nonce, no bundler, no build.
    // Resolved from the ENGINE's OWN dependencies, never from the project
    // root. The engine can serve a tree it was not installed into, and a
    // test root has no node_modules at all. This is the same idiom the
    // search lane uses to find ripgrep.
    "/vendor/vscode-elements.js": (_url, _req, res) => {
      let bundle: string | undefined;
      try {
        bundle = createRequire(import.meta.url).resolve("@vscode-elements/elements/dist/bundled.js");
      } catch {
        // Say which install is missing. A blank page teaches nothing.
        res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
        res.end("vscode-elements is not installed — run npm install in project/deliverable");
        return;
      }
      res.writeHead(200, { "content-type": "text/javascript; charset=utf-8" });
      res.end(readFileSync(bundle));
    },
    // One evidence form, lint state included — the details pane's fill
    // surface. Errors (unbound, missing template) render as data.
    "/api/form": (url, _req, res) => {
      const name = url.searchParams.get("name") ?? "";
      res.writeHead(200, { "content-type": "application/json; charset=utf-8" });
      try {
        res.end(JSON.stringify(state.session.formGet(name)));
      } catch (e) {
        res.end(JSON.stringify(e instanceof Rejection ? e.toJSON() : { error: String(e) }));
      }
    },
    // HELP IS A DETAIL. The card asks for a topic and puts the answer in
    // the details pane; there is no help button anywhere on it.
    "/base/help": (url, _req, res) => {
      json(res, helpFor(url.searchParams.get("topic") ?? ""));
    },
    "/api/packet": (_url, _req, res) => {
      res.writeHead(200, { "content-type": "application/json; charset=utf-8" });
      res.end(JSON.stringify(state.session.packet(), null, 2));
    },
    // A HOST DRAWING THE CONTROLS READS THE SAME SCALES THE MIRROR DOES.
    // The autonomy scale is authored in machines/scale.md, so a host that
    // kept its own copy of the notches would drift the moment it is edited.
    "/api/levels": (_url, _req, res) => {
      res.writeHead(200, { "content-type": "application/json; charset=utf-8", "access-control-allow-origin": "*" });
      res.end(
        JSON.stringify({
          autonomy: loadLevels(state.root),
          power: state.session.power,
          narration: { minutes: state.session.narrationMinutes, calls: state.session.narrationCalls },
        }),
      );
    },
    // THE HOST READS THE CARDS FROM HERE (owner design 2026-07-30). A host
    // that draws one button per card must not keep its own copy of the
    // list — project/views/cards.md stays the single truth, and a card added
    // there appears in VS Code without touching the extension.
    "/api/cards": (_url, _req, res) => {
      res.writeHead(200, { "content-type": "application/json; charset=utf-8", "access-control-allow-origin": "*" });
      res.end(JSON.stringify({ cards: loadCards(o.root) }));
    },
    // BOTH HANDS ASK IT (owner ruling 2026-07-28): the agent through
    // se_survey, the person through the machine header's button.
    "/api/survey": (_url, _req, res) => {
      json(res, survey(o.root));
    },
    // THE MIRROR IS PUSHED, NOT POLLED (owner ruling 2026-07-28). The
    // walk already wakes every held hand; this forwards that wake to
    // the page. The wait's timeout doubles as the re-check for things
    // that grow without moving the walk, like the log.
    "/events": (_url, req, res) => {
      res.writeHead(200, {
        "content-type": "text/event-stream; charset=utf-8",
        "cache-control": "no-cache",
        connection: "keep-alive",
      });
      let open = true;
      req.on("close", () => {
        open = false;
      });
      void (async () => {
        let last = "";
        while (open) {
          const now = JSON.stringify(aliveState());
          if (now !== last) {
            last = now;
            res.write(`data: ${now}\n\n`);
          }
          await state.session.waitForChange(2000);
        }
        res.end();
      })();
    },
    // The mirror polls this: position + threshold move under the page
    // (the agent's hand, or another window). Failing to answer at all
    // reads as "session over" client-side. CORS is open because an
    // EMBEDDER's page (the VS Code webview) polls from its own origin;
    // the server never leaves localhost.
    "/api/alive": (_url, _req, res) => {
      res.writeHead(200, { "content-type": "application/json; charset=utf-8", "access-control-allow-origin": "*" });
      res.end(JSON.stringify(aliveState()));
    },
    // THE BAR HAS EXACTLY ONE DEFINITION, and this is where every host
    // reads it. params.ts draws it from machines/panels/controls.md; a
    // host that drew its own drifted the moment the spec changed, and
    // that is precisely what happened to the VS Code bar.
    // EVERY STATE THE PANEL CAN DRAW HAS TO BE HANDED IN. What is missing
    // here does not fail loudly — renderPanel reads it as absent and draws
    // the OFF state, so the control looks like it never took the click.
    // Emergency was missing, so an armed engine kept drawing the top rung
    // as a plain ideation button; the owner clicked again to check, and
    // that click released the rung and disarmed it. The shutdown row had
    // the same hole and could never show a pressed button at all.
    "/widget/controls": (_url, _req, res) => {
      const power = state.session.power;
      const values = {
        rungs: loadLevels(state.root),
        autonomy: state.session.autonomy,
        emergency: state.session.emergency,
        ints: { narration_minutes: state.session.narrationMinutes, narration_calls: state.session.narrationCalls },
        toggles: { "block-auto-sleep": power.block_sleep, "shutdown-at-idle": power.shutdown_at_idle },
      };
      // THE NOTE ROW RIDES ALONG. It is its own panel with its own spec
      // (note-entry.md), and serving it here means the sidebar needs one
      // fetch rather than two, with neither surface writing markup.
      const bar = renderPanel(loadPanel(state.root, "controls"), values) + renderPanel(loadPanel(state.root, "note-entry"), values);
      res.writeHead(200, { "content-type": "text/html; charset=utf-8", "access-control-allow-origin": "*" });
      res.end(bar);
    },
  };

  const WIDGETS = new Set(["machine", "details", "log", "terminal", "table"]);

  // RENDER FIRST, THEN WRITE THE HEAD. See the note at the dispatcher's catch.
  const serveWidget = (widget: string, url: URL, res: Res): void => {
    const html = renderMirror(
      state,
      widget as "machine" | "details" | "log" | "terminal" | "table",
      url.searchParams.get("view") ?? undefined,
      undefined,
      url.searchParams.get("embed") === "1",
      url.searchParams.get("tv") ?? undefined,
    );
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    res.end(html);
  };

  // GET / — tick without arguments: information about where we are.
  // ?view=<machine> browses a machine without moving the walk.
  const servePage = (url: URL, res: Res): void => {
    state.lastPacket = state.session.packet();
    const page = renderMirror(
      state,
      undefined,
      url.searchParams.get("view") ?? undefined,
      url.searchParams.get("card") ?? undefined,
      url.searchParams.get("embed") === "1",
    );
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    res.end(page);
  };

  /** True when a POST table answered the request. */
  const dispatchPost = (url: URL, req: Req, res: Res): boolean => {
    const rp = redirectPosts[url.pathname];
    if (rp !== undefined) {
      post(req, res, rp[0], rp[1]);
      return true;
    }
    const jp = jsonPosts[url.pathname];
    if (jp !== undefined) {
      jp(req, res);
      return true;
    }
    return false;
  };

  const server = createServer((req, res) => {
    // Every request is a new drawing epoch — see machines/compile.ts.
    bumpDrawingEpoch();
    const url = new URL(req.url ?? "/", `http://localhost:${o.port}`);
    try {
      if (url.pathname === "/mcp" && o.mcp !== undefined) {
        // THE AGENT'S LANE ON THE SHARED PORT. Every other route here is the
        // human's hand; this one is MCP over HTTP — the same dispatch as
        // stdio, so a harness inside VS Code and a CLI in the terminal
        // attach to the ONE walk instead of spawning private engines.
        handleHttp(o.mcp, req, res);
        return;
      }
      if (req.method === "POST" && dispatchPost(url, req, res)) return;
      const get = gets[url.pathname];
      if (get !== undefined) {
        get(url, req, res);
        return;
      }
      const widget = url.pathname.startsWith("/widget/") ? url.pathname.slice("/widget/".length) : "";
      if (WIDGETS.has(widget)) {
        serveWidget(widget, url, res);
        return;
      }
      // AN UNKNOWN POST ANSWERS 404, NEVER THE PAGE. The fallthrough used to
      // serve the page to every method, so a retired route kept returning a
      // 200 full of HTML and its caller kept believing in it.
      if (req.method !== "GET" && req.method !== "HEAD") {
        res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
        res.end(`no such route: ${req.method} ${url.pathname}`);
        return;
      }
      servePage(url, res);
    } catch (e) {
      // A BLACK WINDOW IS THE WORST WAY TO REPORT A FAULT, and it is what this
      // used to do. The 200 head went out BEFORE the render ran, so a throw
      // left the headers already sent, this writeHead threw in turn, and the
      // reader got an empty 200 - which paints black. A broken canvas looked
      // exactly like a dead server.
      //
      // Every route above now renders into a variable first, so a failure is
      // still headerless when it arrives here and can be reported honestly.
      // headersSent stays checked because a future route may stream.
      const body = String((e as Error).stack ?? e);
      if (res.headersSent) {
        res.end(`\n\n<!-- render failed after headers were sent -->\n${body}`);
        return;
      }
      res.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
      res.end(body);
    }
  });

  server.listen(o.port);
  return server;
}
