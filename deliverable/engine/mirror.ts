// The mirror's HTTP server — ONE module, two mounts: se-manual runs it
// alone, se-mcp embeds it beside the MCP lane on the SAME Session.
// HTTP is the person, MCP is the agent, and the threshold gates only the
// agent — so every route here moves the walk by the person's hand.

import { existsSync, readFileSync, statSync } from "node:fs";
import { createServer, type Server } from "node:http";
import { createRequire } from "node:module";
import { join } from "node:path";
import { marked } from "marked";
import { applyBaseOp, type BaseOp } from "./bases.ts";
import { helpFor } from "./baseui.ts";
import { type CallLog, slowMs, UNREPORTED } from "./calllog.ts";
import { loadCards } from "./cards.ts";
import { CLAUSES, Rejection } from "./errors.ts";
import { appendNote, pendingNotes, readNotes } from "./inbox.ts";
import { recordClientFailures, recordLifecycle } from "./lifecycle.ts";
import { bumpDrawingEpoch } from "./machines/compile.ts";
import { handleHttp, type McpServer } from "./mcp.ts";
import { subscribeModelMutations } from "./model-fs.ts";
import { beginPass, endPass } from "./notes.ts";
import { renderSidebar, tasksTable } from "./params.ts";
import { resolveInRoot, seDir } from "./paths.ts";
import { produce } from "./produce.ts";
import { ENGINE_LIFE, feedRows, linkDocRefs, type MirrorState, renderMirror } from "./render.ts";
import { reapAbandonedJobs, reapAbandonedTestJobs, runningWork } from "./run.ts";
import { loadLevels, loadStopAt } from "./scale.ts";
import type { Session } from "./session.ts";
import { survey } from "./survey.ts";
import { editCell } from "./tables.ts";
import { recordTraceWrites, traceWriteTrail } from "./trace.ts";
import { warmVault } from "./vault.ts";
import { WIDGET_KINDS, type WidgetKind } from "./widget-kinds.ts";
import {
  allWorkSignal,
  BACKLOG,
  boundToItsState,
  freshBucket,
  groupIsPlace,
  homeForPlace,
  homeOf,
  type MintDemand,
  mint,
  place,
  readAllWork,
  readOne,
  rebucket,
  refuseLongTitle,
  renameBucket,
  restate,
  settle,
  splitWorkLine,
  take,
  type WorkStatus,
  workHomes,
} from "./workstore.ts";

export interface MirrorOptions {
  session: Session;
  root: string;
  port: number;
  log: CallLog;
  mode: "manual" | "agent";
  /** When given, /mcp serves the agent lane over HTTP — same dispatch as stdio. */
  mcp?: McpServer;
}

/** ONE PIECE OF WORK, EDITED FROM THE SURFACE.
 *
 *  THREE ACTS AND NO MORE. Rename what it says, take it, or close it. Anything
 *  else about a work item belongs to the machine rather than to a hand.
 *
 *  THE STORE HOLDS EVERY RULE. This function routes and nothing else — the
 *  empty-comment refusal, the already-taken refusal and the person-only
 *  refusal all live in the one writer, so the surface cannot get a different
 *  answer from the lane.
 *  see dsp-the-work-store.md#a-token-opens-an-editor */
function workAct(
  state: MirrorState,
  said: { id: string; act: string; comment: string; statement: string; status: string },
): { log: Record<string, unknown>; answer: Record<string, unknown> } {
  if (said.id === "") throw new Error("the edit named no work");
  // THE ID IS THE WHOLE ADDRESS. The editor lists work from every record at
  // once, so the reader pressing a row never knew which one it came from.
  const home = homeOf(state.root, said.id);
  if (home === undefined) throw new Error(`no piece of work has the id ${said.id}`);
  if (said.act === "restate") {
    const item = restate(home, said.id, said.statement);
    return { log: { restated: item.id }, answer: { ok: true, statement: item.statement } };
  }
  // THE PERSON IS THE HAND HERE. A press on the surface is theirs, and
  // recording it as the walker's would erase who actually did it.
  if (said.act === "take") {
    const item = take(home, said.id, "the person", said.comment);
    // THE STATEMENT RIDES THE ANSWER, because the feed reads the record and the
    // press only ever sent an id.
    return { log: { took: item.id }, answer: { ok: true, took: item.id, statement: item.statement } };
  }
  if (said.act === "settle") {
    const now = new Date().toISOString();
    const item = settle(home, said.id, said.status as WorkStatus, { reason: said.comment, by: "person", now });
    return {
      log: { settled: item.id, status: item.status },
      answer: { ok: true, settled: item.id, statement: item.statement, status: item.status },
    };
  }
  throw new Error(`no such act: ${said.act} — it is restate, take or settle`);
}

/** THE LAST SEGMENT OF A POSITION, which is what the drawing calls a state. */
function tailOf(position: string): string {
  return position.slice(position.lastIndexOf("/") + 1);
}

/** EVERY POSITION THIS SURFACE CAN NAME — the walk's own, and every place work
 *  already stands at. */
function knownPositions(state: MirrorState): string[] {
  return [...state.session.active(), ...readAllWork(state.root).items.map((i) => i.place)];
}

/** THE POSITION A NAME MEANS, or nothing where no position answers to it.
 *
 *  THE DRAWING NAMES A STATE BY ITS LAST SEGMENT AND THE STORE RECORDS THE
 *  WHOLE POSITION. A drop carrying `fix-findings` therefore matched no place,
 *  and the name became a BUCKET called `fix-findings` sitting beside the state's
 *  own heading — the same state drawn twice, which reads as the drop landing
 *  somewhere else entirely.
 *
 *  IT NEVER INVENTS ONE. A name nothing answers to is a bucket, and that is the
 *  whole difference this decides. */
export function knownPosition(state: MirrorState, name: string): string | undefined {
  const want = name.trim();
  if (want === "" || want === BACKLOG) return undefined;
  const known = knownPositions(state);
  return known.find((p) => p === want) ?? known.find((p) => tailOf(p) === want);
}

/** WHERE A DROP ONTO THE DRAWING LANDED.
 *
 *  A STATE ON THE DRAWING IS ALWAYS A POSITION, so this one DOES supply the
 *  prefix a bare name is missing. A state nobody has worked yet answers to no
 *  known position, and it is still a state.
 *
 *  THE PREFIX COMES FROM THE WALK — the container of wherever it stands, which
 *  is the machine being drawn. */
export function landingPlace(state: MirrorState, name: string): string {
  const want = name.trim();
  const found = knownPosition(state, want);
  if (found !== undefined) return found;
  if (want === "" || want.includes("/")) return want;
  const at = state.session.active()[0] ?? "";
  const cut = at.lastIndexOf("/");
  return cut <= 0 ? want : `${at.slice(0, cut)}/${want}`;
}

/** A DROP INSIDE THE EDITOR, applied to every row it named.
 *
 *  A PLACE IS WHERE THE WORK IS DONE, so landing on one MOVES it and clears any
 *  bucket. A bucket is only a grouping, so landing on one FILES it and leaves
 *  the place exactly as it was.
 *
 *  IT LIVES OUTSIDE THE ROUTE so the route stays one thought. Returns whether
 *  the group turned out to be a place, which is what the log records. */
function regroup(state: MirrorState, ids: string[], group: string, slot: string): boolean {
  const at = knownPosition(state, group) ?? (groupIsPlace(state.root, group) ? group : undefined);
  for (const id of ids) {
    const home = homeOf(state.root, id);
    if (home === undefined) throw new Error(`no piece of work has the id ${id}`);
    if (at !== undefined) byHand(home, id, at, slot);
    else rebucket(home, id, group);
  }
  return at !== undefined;
}

/** A MOVE THE PERSON MADE, which is not the same as one the engine makes.
 *
 *  WORK A STATE MINTED STAYS AT THAT STATE (owner). Its card demands it, and
 *  re-entering the state mints it again — so dragging it away duplicates it
 *  rather than moving it.
 *
 *  THE ENGINE'S OWN PLACEMENT IS UNTOUCHED. It genuinely moves work between
 *  positions, which is req-moving-work-releases-the-state-it-left, so the rule
 *  binds this door rather than the mover.
 *
 *  DROPPING IT BACK ON ITS OWN STATE IS ALWAYS ALLOWED, and it is how a filed
 *  piece comes out of its bucket. */
function byHand(home: string, id: string, to: string, slot = ""): void {
  const item = readOne(home, id);
  if (item !== null && item !== undefined && item.place !== to && boundToItsState(item)) {
    throw new Error(
      `"${item.statement}" belongs to ${item.origin} — its card demands it, so it cannot be dragged out. File it under a bucket instead, or finish it where it stands.`,
    );
  }
  place(home, id, to, slot);
}

export function startMirror(o: MirrorOptions): Server {
  const state: MirrorState = { session: o.session, root: o.root, lastPacket: undefined, mode: o.mode, log: o.log };

  // WARM THE VAULT OFF THE REQUEST PATH. The first table render should find
  // rows rather than pay a build; started here, the card says "warming" at
  // most once. Skipped under test, where a background build and its watcher
  // would outlive the case that started the server.
  if (process.env.NODE_TEST_CONTEXT === undefined) void warmVault(o.root);

  // A SLOT ON THE MODEL'S MUTATION SIGNAL. The model fires once per batch and
  // does not wait; this only stamps ids, and the graph animates from there.
  //
  // AND IT WAKES EVERY HELD PAGE. A write lands, the index hears it, and the
  // surfaces were left waiting for the next poll to notice — which reads as a
  // token that did not appear until the reader reloaded.
  //
  // IT IS HERE AND NOT IN EACH ROUTE, so no future writer can forget. Six work
  // routes each had to remember, and none of them did.
  // see ux.md#nothing-a-person-does-needs-a-reload
  subscribeModelMutations(o.root, (batch) => {
    recordTraceWrites(
      o.root,
      batch.changes.map((c) => (c.kind === "rename" ? c.to : c.path)),
    );
    o.session.notifyChange();
  });

  // THE READER'S SELECTION, mirrored server-side: the machine page reports
  // which state's details are open, so a control in ANOTHER surface (the
  // sidebar's SET TARGET) can act on it. View state, like a pane size.
  let selected = "";
  // The machine the selection was made IN — a bare state id resolves to
  // the wrong drawing the moment the reader browses a sub-machine.
  let selectedMachine = "";
  // The newest person-pull: the seq bumps, the ref names the log record —
  // every surface lands the answer in its details from this.
  let lastPull: { seq: number; ref: string } | undefined;

  /** What the page watches: position, the two sliders, and a growth signal
   *  for the feed. One shape, served both as a poll and as a pushed event. */
  const aliveState = (): Record<string, unknown> => ({
    // Which project this server walks — an attaching shim or host refuses
    // to join a stranger's walk on a matching port.
    root: o.root,
    // The engine life — a page holding an older stamp reloads itself.
    build: ENGINE_LIFE,
    status: state.session.instance.status,
    // The server is going away with the walk unfinished — a quit, not an end.
    gone: state.session.serverGone,
    autonomy: state.session.autonomy,
    emergency: state.session.emergency,
    power: state.session.power,
    active: state.session.active(),
    // The walk's aim — a re-aim redraws the route on every open page.
    target: state.session.target,
    busy: state.session.busy(),
    ...(state.session.progress() === undefined ? {} : { progress: state.session.progress() }),
    // A monotone change signal for the feed — the log file only grows.
    acts: existsSync(o.log.path) ? statSync(o.log.path).size : 0,
    // WHAT THE STATES OWE, as one number. A pill appears, moves or empties the
    // moment the work store does, with no navigation and no re-entry.
    // see dsp-mirror-render.md#the-pills-are-pushed
    work: allWorkSignal(state.root),
    // HOW LONG IT HAS BEEN QUIET, for a surface that wants to show it. A silent
    // wait and then a dark machine reads exactly like a toggle that never
    // worked.
    ...(state.session.inactiveMinutes === undefined ? {} : { inactive_minutes: state.session.inactiveMinutes }),
    // The agent's pointing finger — the page pulses the target on a new seq.
    ...(state.session.ping === undefined ? {} : { ping: state.session.ping }),
    // Which trace nodes the agent just wrote — the graph blinks then fades them.
    trace_trail: traceWriteTrail(),
    ...(lastPull === undefined ? {} : { last_pull: lastPull }),
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
          o.log.append({
            tool,
            args,
            actor: "human",
            part: "owner",
            state: UNREPORTED,
            answered_by: UNREPORTED,
            ok: true,
            outcome: "result",
            duration_ms: Date.now() - started,
            response: state.lastPacket,
          });
        } catch (e) {
          if (!(e instanceof Rejection)) {
            res.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
            res.end(String((e as Error).stack ?? e));
            return;
          }
          state.lastPacket = e.toJSON();
          o.log.append({
            tool,
            args,
            actor: "human",
            part: "owner",
            state: UNREPORTED,
            answered_by: UNREPORTED,
            ok: false,
            outcome: "rejected",
            duration_ms: Date.now() - started,
            response: state.lastPacket,
          });
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
    // The rungs — how much of the walk is the agent's. Logged like every
    // other hand on the machinery, and the TIER WORD rides with the number
    // so the feed never draws a bare value (req-autonomy-is-categorical).
    "/autonomy": [
      "mirror_autonomy",
      (body) => {
        const result = state.session.setAutonomy(Number(body.value));
        return { args: { value: body.value, ...(typeof result.tier === "string" ? { tier: result.tier } : {}) }, result };
      },
    ],
    // HOW FAR THE AGENT WALKS BEFORE HANDING BACK. The autonomy dial's
    // neighbour, logged the same way, and like every control it MOVES NOTHING:
    // the walk still advances on the agent's pull and nothing else.
    "/stop-at": [
      "mirror_stop_at",
      (body) => {
        const result = state.session.setStopAt(Number(body.value));
        return { args: { value: body.value, ...(typeof result.stop_at === "string" ? { stop_at: result.stop_at } : {}) }, result };
      },
    ],
    // ONE PRESS, ONE STATE. Under `stop @ state end` the engine holds every
    // transition; this spends a single release. It grants permission and never
    // walks — the agent's next pull is still what moves the machine.
    "/release": ["mirror_release", () => ({ args: {}, result: state.session.releaseOnce() })],
    // WHERE SATELLITES RUN. The launch flag decides the CURRENT run; this
    // stores the choice for the next one, and the answer says so rather than
    // pretending the boundary moved under a walk in flight.
    //
    // ONE OWED CELL PER CLICK from the element matrix — the interface
    // skeleton mints with its crossing flows before the answer returns.
    "/form/ifcell": [
      "mirror_form_ifcell",
      (body) => ({
        args: { name: body.name, source: body.source, destination: body.destination },
        result: state.session.mintInterfaceCell(
          String(body.name ?? ""),
          String(body.source ?? ""),
          String(body.destination ?? ""),
          String(body.machine ?? ""),
        ),
      }),
    ],
    // ONE RULING PER CLICK from the flip deck — the line lands and the
    // tripwire mints before the answer returns.
    "/form/flip": [
      "mirror_form_flip",
      (body) => ({
        args: { name: body.name, rival: body.rival, winner: body.winner, axis: body.axis },
        result: state.session.flipRuling(
          String(body.name ?? ""),
          String(body.rival ?? ""),
          String(body.winner ?? ""),
          String(body.axis ?? ""),
          "human",
          String(body.machine ?? ""),
        ),
      }),
    ],
    // ONE VERDICT PER CLICK from the scenario deck — the line lands and the
    // register entry mints before the answer returns.
    "/form/scenario": [
      "mirror_form_scenario",
      (body) => ({
        args: { name: body.name, kind: body.kind, requirement: body.requirement },
        result: state.session.scenarioVerdict(
          String(body.name ?? ""),
          String(body.kind ?? ""),
          String(body.requirement ?? ""),
          { decision: String(body.decision ?? ""), hinge: String(body.hinge ?? ""), note: String(body.note ?? "") },
          "human",
          String(body.machine ?? ""),
        ),
      }),
    ],
    "/form/save": [
      "mirror_form_save",
      (body) => ({
        args: { name: body.name, fields: Object.keys((body.fields as object | undefined) ?? {}) },
        result: state.session.formSave(
          String(body.name ?? ""),
          (body.fields ?? {}) as Record<string, string>,
          "human",
          String(body.machine ?? ""),
        ),
      }),
    ],
    // THE PREFILL LAW: one confirmation per prefill — this is that click.
    "/form/confirm": [
      "mirror_form_confirm",
      (body) => ({
        args: { name: body.name, field: body.field, index: body.index },
        result: state.session.formConfirm(
          String(body.name ?? ""),
          String(body.field ?? ""),
          Number(body.index ?? 0),
          String(body.machine ?? ""),
        ),
      }),
    ],
    "/form/done": [
      "mirror_form_done",
      (body) => ({
        args: { name: body.name },
        result: state.session.formDone(String(body.name ?? ""), "human", String(body.machine ?? "")),
      }),
    ],
    // THE THUMBS (v1 reborn): the human's bless or dismiss on a gate's form.
    "/form/bless": [
      "mirror_form_bless",
      (body) => ({
        args: { name: body.name, ok: body.ok },
        result: state.session.formBless(String(body.name ?? ""), body.ok === true, "human", String(body.machine ?? "")),
      }),
    ],
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
    apply: (body: Body) => { args: Body; run: () => { log: unknown; answer: unknown } | Promise<{ log: unknown; answer: unknown }> },
    onError: (e: unknown) => unknown,
    onLogged?: (rec: { ref: string }) => void,
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
      void (async () => {
        try {
          const a = apply(body);
          args = a.args;
          const r = await a.run();
          const rec = o.log.append({
            tool,
            args,
            actor: "human",
            part: "owner",
            state: UNREPORTED,
            answered_by: UNREPORTED,
            ok: true,
            outcome: "result",
            duration_ms: Date.now() - started,
            response: r.log,
          });
          if (onLogged !== undefined) onLogged(rec);
          res.end(JSON.stringify(r.answer));
        } catch (e) {
          const payload = e instanceof Rejection ? e.toJSON() : { error: whyOf(e) };
          o.log.append({
            tool,
            args,
            actor: "human",
            part: "owner",
            state: UNREPORTED,
            answered_by: UNREPORTED,
            ok: false,
            outcome: "rejected",
            duration_ms: Date.now() - started,
            response: payload,
          });
          res.end(JSON.stringify(onError(e)));
        }
      })();
    });
  };

  const jsonPosts: Record<string, (req: Req, res: Res) => void> = {
    // The two producing acts over HTTP, so the editor's buttons do not have to
    // speak the lane's protocol. A refusal comes back as its own JSON.
    "/produce": (req, res) =>
      jsonPost(
        req,
        res,
        "mirror_produce",
        (body) => ({
          args: {
            kind: String(body.kind ?? ""),
            dest: String(body.dest ?? ""),
            name: String(body.name ?? ""),
            abbr: String(body.abbr ?? ""),
          },
          run: () => {
            const r = produce(
              state.session.workRoot(),
              {
                kind: String(body.kind ?? ""),
                dest: String(body.dest ?? ""),
                name: String(body.name ?? ""),
                abbr: String(body.abbr ?? ""),
              },
              "mirror/produce",
            );
            return { log: r, answer: { ok: true, result: r } };
          },
        }),
        (e) => (e instanceof Rejection ? e.toJSON() : { error: whyOf(e) }),
      ),
    // see dsp-legible-controls.md#set-target-answers-in-place
    "/target": (req, res) =>
      jsonPost(
        req,
        res,
        "mirror_target",
        (body) => ({
          args: { to: body.to as string },
          run: () => {
            const r = state.session.setTarget(String(body.to ?? ""));
            return { log: r, answer: { ok: true, result: r } };
          },
        }),
        (e) => (e instanceof Rejection ? e.toJSON() : { error: whyOf(e) }),
      ),
    // SET TARGET, the bar's button: aims at the
    // SELECTED state — the one whose details the machine page reported.
    "/target/selected": (req, res) =>
      jsonPost(
        req,
        res,
        "mirror_target",
        () => {
          if (selected === "") {
            throw new Rejection({
              clause: CLAUSES.REQUIRED_ARGS,
              expected: "a selected state — click one in the machine view first; its details showing is what selected means",
              got: "no selection",
              remedy: { tool: "se_pull", args: {}, note: "or aim directly: POST /target {to}" },
              source: "engine/mirror.ts",
            });
          }
          // The selection is machine-scoped: a state picked inside a
          // sub-machine aims THERE — "end" in i1 is iterations/i1/end,
          // never the main machine's end. Setting over a locked target
          // simply re-aims; the route recomputes as machines regenerate.
          const chain = selectedMachine === "" ? [] : state.session.viewChain(selectedMachine).slice(1);
          const to = chain.length === 0 ? selected : `${chain.join("/")}/${selected}`;
          return { args: { to }, run: () => ({ log: state.session.setTarget(to), answer: { ok: true, to } }) };
        },
        (e) => (e instanceof Rejection ? e.toJSON() : { error: whyOf(e) }),
      ),
    // THE READER'S SELECTION — view state. Logged like every call, but the
    // feed skips it (feedRows), so reading the machine stays quiet.
    "/selected": (req, res) =>
      jsonPost(
        req,
        res,
        "mirror_select",
        (body) => {
          const s = String(body.state ?? "");
          const m = String(body.machine ?? "");
          return {
            args: { state: s, machine: m },
            run: () => {
              selected = s;
              selectedMachine = m;
              return { log: { selected: s, machine: m }, answer: { ok: true } };
            },
          };
        },
        (e) => ({ ok: false, error: whyOf(e) }),
      ),
    // THE RETURNED PORTABLE COPY lands as fills, marked imported — a
    // claim like every fill, judged at the gate.
    "/form/ingest": (req, res) =>
      jsonPost(
        req,
        res,
        "mirror_form_ingest",
        (body) => ({
          args: { name: body.name },
          run: () => {
            const r = state.session.stateFormIngest(String(body.name ?? ""), String(body.html ?? ""), String(body.machine ?? ""));
            return { log: { ingested: r.ingested, author: r.author }, answer: r };
          },
        }),
        (e) => (e instanceof Rejection ? e.toJSON() : { error: String(e) }),
      ),
    // see dsp-mirror-render.md#the-persons-pull
    "/pull": (req, res) =>
      jsonPost(
        req,
        res,
        "mirror_pull",
        (body) => ({
          args: { payload: body },
          run: async () => {
            const result = await state.session.pull(body as { form?: Record<string, unknown>; escape?: string }, "human");
            return { log: result, answer: result };
          },
        }),
        (e) => (e instanceof Rejection ? e.toJSON() : { error: String(e) }),
        (rec) => {
          lastPull = { seq: (lastPull?.seq ?? 0) + 1, ref: rec.ref };
        },
      ),
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
    // A MOVE IS A REQUEST, NEVER A WRITE BY THE SURFACE. The drop NAMES the
    // move; the work store is the only module that writes a piece of work.
    // see dsp-the-bucket-editor.md#behavior-and-constraints
    //
    // A REFUSAL RIDES BACK WITH ITS REASON, because a row snapping into place
    // with nothing said is the failure the design names.
    "/work/move": (req, res) =>
      jsonPost(
        req,
        res,
        "mirror_work_move",
        (body) => {
          // A ROW NAMES ITSELF BY ITS FILE. The editor is the database now, and
          // a database row's identity is the note it came from — so the drop
          // sends a path and the id is read off the end of it.
          //
          // A GROUP TRAVELS TOGETHER. One row and a picked set are the same act,
          // so the payload is a list and a single one is a list of one.
          const named = body.path !== undefined ? body.path : body.work;
          const ids = (Array.isArray(named) ? (named as unknown[]) : [named])
            .map((w) => String(w ?? ""))
            .map((w) => (w.endsWith(".md") ? (w.split(/[\\/]/).pop() ?? "").replace(/\.md$/, "") : w))
            .filter((w) => w !== "");
          const to = landingPlace(state, String(body.to ?? ""));
          // WHICH BUCKET, WHERE THE DROP SAID SO. A state carries three drop
          // zones; landing on one names the bucket, and landing on the state's
          // body names none and leaves it to derive.
          const slot = String(body.slot ?? "");
          return {
            args: { work: ids, to, slot },
            run: () => {
              if (ids.length === 0) throw new Error("the move named no work");
              if (slot === "done") throw new Error("work reaches done by being finished, so it cannot be dropped there");
              const moved = ids.map((id) => {
                const home = homeOf(state.root, id);
                if (home === undefined) throw new Error(`no piece of work has the id ${id}`);
                byHand(home, id, to, slot);
                return { from: to, to };
              });
              return { log: { moved: moved.length, to, slot }, answer: { ok: true, moved: moved.length, to, slot } };
            },
          };
        },
        (e) => ({ ok: false, error: whyOf(e) }),
      ),
    // FILE WORK UNDER A NAME OF THE PERSON'S OWN.
    //
    // IT MOVES NOTHING. The place stays exactly as it was and only the grouping
    // changes, which is the whole difference between a bucket and a place.
    "/work/bucket": (req, res) =>
      jsonPost(
        req,
        res,
        "mirror_work_bucket",
        (body) => {
          const named = body.paths !== undefined ? body.paths : body.path;
          const ids = (Array.isArray(named) ? (named as unknown[]) : [named])
            .map((w) => String(w ?? ""))
            .map((w) => (w.endsWith(".md") ? (w.split(/[\\/]/).pop() ?? "").replace(/\.md$/, "") : w))
            .filter((w) => w !== "");
          // AN EMPTY NAME ASKS FOR A FRESH ONE (owner). The bucket is made
          // first and named afterwards, so nothing has to be typed before the
          // reader can see what landed in it.
          const asked = String(body.bucket ?? "").trim();
          return {
            args: { work: ids, bucket: asked },
            run: () => {
              if (ids.length === 0) throw new Error("nothing was selected, so there is nothing to file");
              const bucket = asked === "" ? freshBucket(state.root) : asked;
              for (const id of ids) {
                const home = homeOf(state.root, id);
                if (home === undefined) throw new Error(`no piece of work has the id ${id}`);
                rebucket(home, id, bucket);
              }
              return { log: { filed: ids.length, bucket }, answer: { ok: true, filed: ids.length, bucket } };
            },
          };
        },
        (e) => ({ ok: false, error: whyOf(e) }),
      ),
    // A DROP INSIDE THE EDITOR, onto a group heading or onto a row in one.
    //
    // THE GROUP IS A BUCKET OR A PLACE and its name alone does not say which,
    // so the store is asked. Landing on a place MOVES the work; landing on a
    // bucket FILES it and moves nothing.
    "/work/regroup": (req, res) =>
      jsonPost(
        req,
        res,
        "mirror_work_regroup",
        (body) => {
          const named = body.paths !== undefined ? body.paths : body.path;
          const ids = (Array.isArray(named) ? (named as unknown[]) : [named])
            .map((w) => String(w ?? ""))
            .map((w) => (w.endsWith(".md") ? (w.split(/[\\/]/).pop() ?? "").replace(/\.md$/, "") : w))
            .filter((w) => w !== "");
          const group = String(body.group ?? "").trim();
          // THE SECOND LEVEL OF GROUPING IS A BUCKET, so a drop on it names the
          // place above it AND which of that place's buckets it landed in.
          const slot = String(body.slot ?? "").trim();
          return {
            args: { work: ids, group, slot },
            run: () => {
              if (ids.length === 0) throw new Error("the drop named no work");
              if (group === "") throw new Error("the drop landed on no group at all");
              const isPlace = regroup(state, ids, group, slot);
              return {
                log: { moved: ids.length, group, slot, as: isPlace ? "place" : "bucket" },
                answer: { ok: true, moved: ids.length, group },
              };
            },
          };
        },
        (e) => ({ ok: false, error: whyOf(e) }),
      ),
    // RENAME A BUCKET, everywhere it stands. A PLACE CANNOT BE RENAMED HERE:
    // a place is the drawing's name for a state, and the drawing owns it.
    "/work/bucket/rename": (req, res) =>
      jsonPost(
        req,
        res,
        "mirror_work_bucket_rename",
        (body) => {
          const from = String(body.from ?? "").trim();
          const to = String(body.to ?? "").trim();
          return {
            args: { from, to },
            run: () => {
              if (from === "") throw new Error("no bucket was named, so nothing could be renamed");
              if (to === "") throw new Error("a bucket needs a name; drop the rows onto a place to unfile them instead");
              // EVERY SOURCE IS VISITED. A bucket can hold work from the record
              // and from the private source at once, and renaming one half
              // would split the group in two.
              const moved = workHomes(state.root).flatMap((home) => renameBucket(home, from, to));
              if (moved.length === 0) throw new Error(`no work is filed under "${from}"`);
              return { log: { renamed: moved.length, from, to }, answer: { ok: true, renamed: moved.length, from, to } };
            },
          };
        },
        (e) => ({ ok: false, error: whyOf(e) }),
      ),
    // THE PRIORITY RIDES THE NOTE (owner). The note row draws a MoSCoW choice,
    // and a capture that dropped it made every stray a "could" whatever the
    // reader picked.
    //
    // IT ANSWERS JSON RATHER THAN REDIRECTING. The wall guard refuses a
    // breakless note, and a redirect leaves no refusal for any client to read —
    // so all three cleared the field and showed nothing.
    "/note": (req, res) =>
      jsonPost(
        req,
        res,
        "mirror_note",
        (body) => ({
          args: { text: body.text, priority: body.priority },
          run: () => {
            const r = appendNote(
              seDir(o.root),
              String(body.text ?? ""),
              "human",
              undefined,
              body.priority === "must" || body.priority === "should" ? (body.priority as "must" | "should") : "could",
            );
            return { log: r, answer: { ok: true, note: r } };
          },
        }),
        (e) => (e instanceof Rejection ? e.toJSON() : { error: whyOf(e) }),
      ),
    // THE PLUS. A piece of work added by a hand rather than derived from a
    // card, and it goes through the same one writer as everything else.
    "/work/mint": (req, res) =>
      jsonPost(
        req,
        res,
        "mirror_work_mint",
        (body) => {
          const at = String(body.place ?? "");
          const slot = String(body.slot ?? "out");
          const statement = String(body.statement ?? "").trim();
          return {
            args: { place: at, slot, statement },
            run: () => {
              if (statement === "") throw new Error("a piece of work says what it is; an unnamed one cannot be judged later");
              // NOTHING IS ADDED STRAIGHT INTO DONE. The done bucket is a
              // filter over status, so work can only arrive there by finishing.
              if (slot === "done") throw new Error("work reaches done by being finished, so it cannot be added there");
              // THE SLOT IS DERIVED FROM THE SOURCE, never stored beside it, so
              // the column a hand adds into decides which source it carries.
              //
              // FOUR WORDS NAME IT AND THE SLASH CARRIES THE REST, exactly as
              // the note entry beside it does and exactly as the lane verb
              // does. see dsp-the-work-store.md#the-title-is-four-words
              const said = splitWorkLine(statement);
              refuseLongTitle(said.statement, "open");
              const demand: MintDemand = {
                source: slot === "in" ? "reading" : "hand",
                source_ref: `hand/${said.statement}`,
                step: "",
                statement: said.statement,
                body: said.body,
              };
              // PENDING IS THE BACKLOG'S. Adding there places the work nowhere
              // in particular, which is exactly what pending means.
              // WHERE IT LANDS FOLLOWS FROM WHERE IT IS GOING, never from which
              // record the walk stands in.
              const to = slot === "pending" ? BACKLOG : at;
              const report = mint(homeForPlace(state.root, to), to, [demand], new Date().toISOString());
              return { log: { minted: report.minted.length }, answer: { ok: true, minted: report.minted.length } };
            },
          };
        },
        (e) => ({ ok: false, error: whyOf(e) }),
      ),
    // THE TOKEN'S OWN EDITOR. Pressing a row opens it, and these are the three
    // things a hand can do to one piece of work from the surface.
    //
    // TAKE AND SETTLE BOTH DEMAND A COMMENT, and the STORE is what refuses an
    // empty one, never this route. One rule, one place.
    // see dsp-the-work-store.md#a-token-opens-an-editor
    "/work/act": (req, res) =>
      jsonPost(
        req,
        res,
        "mirror_work_act",
        (body) => {
          const id = String(body.work ?? "");
          const act = String(body.act ?? "");
          const comment = String(body.comment ?? "").trim();
          const statement = String(body.statement ?? "").trim();
          const status = String(body.status ?? "done");
          return {
            // THE COMMENT RIDES THE RECORD. It is the sentence the hand wrote
            // about this piece of work, and the log line is where the person
            // reads it back. Logging only the id said a token moved and never
            // which one or why.
            args: { work: id, act, status, comment },
            run: () => workAct(state, { id, act, comment, statement, status }),
          };
        },
        (e) => ({ ok: false, error: whyOf(e) }),
      ),
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
    // Serve a guidance document, rendered — links in the details pane.
    "/doc": (url, _req, res) => {
      const p = url.searchParams.get("path") ?? "";
      const abs = resolveInRoot(o.root, p, "mirror /doc");
      // THE REPORT IS ON DISK OR IT IS NOWHERE (i6). This fell back to
      // `git show exp/<id>:<path>` because a dismissed expedition's report
      // lived only on its branch. i34 leaves the folder where it is through
      // the close, so a missing file is missing rather than elsewhere.
      let raw: string;
      if (existsSync(abs)) {
        raw = readFileSync(abs, "utf8");
      } else {
        raw = `not found: ${p}`;
      }
      raw = raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, ""); // frontmatter is machine-facing
      let html = p.endsWith(".md") ? (marked.parse(raw) as string) : `<pre>${raw.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</pre>`;
      // THE SURFACE MAKES THE LINK, not the server. see linkDocRefs.
      if (p.endsWith(".md")) html = linkDocRefs(html, state.session.docRefPaths(p));
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
        res.end("vscode-elements is not installed — run npm install in deliverable");
        return;
      }
      res.writeHead(200, { "content-type": "text/javascript; charset=utf-8" });
      res.end(readFileSync(bundle));
    },
    // THE GRAPH RENDERER, vendored rather than fetched. It used to arrive
    // from unpkg on every open of the trace widget, which is a run-time
    // dependency on somebody else's server and is forbidden. Offline the
    // widget drew nothing while looking like it was loading.
    "/vendor/cytoscape.min.js": (_url, _req, res) => {
      const vendored = join(o.root, "deliverable", "vendor", "cytoscape", "cytoscape.min.js");
      if (!existsSync(vendored)) {
        // Name the pull that fixes it. An online fallback is the dependency
        // wearing a disguise.
        res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
        res.end("cytoscape is not vendored — see deliverable/vendor/cytoscape/README.md");
        return;
      }
      res.writeHead(200, { "content-type": "text/javascript; charset=utf-8" });
      res.end(readFileSync(vendored));
    },
    // One evidence form, lint state included — the details pane's fill
    // surface. Errors (unbound, missing template) render as data.
    "/api/form": (url, _req, res) => {
      const name = url.searchParams.get("name") ?? "";
      res.writeHead(200, { "content-type": "application/json; charset=utf-8" });
      try {
        res.end(JSON.stringify(state.session.formGet(name, url.searchParams.get("machine") ?? "")));
      } catch (e) {
        res.end(JSON.stringify(e instanceof Rejection ? e.toJSON() : { error: String(e) }));
      }
    },
    // HELP IS A DETAIL. The card asks for a topic and puts the answer in
    // the details pane; there is no help button anywhere on it.
    "/base/help": (url, _req, res) => {
      json(res, helpFor(url.searchParams.get("topic") ?? ""));
    },
    // THE PORTABLE COPY — one self-contained HTML, downloaded to travel.
    "/form/export": (url, _req, res) => {
      const name = url.searchParams.get("name") ?? "";
      let body: string;
      try {
        body = state.session.stateFormExport(name, url.searchParams.get("machine") ?? "");
      } catch (e) {
        res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
        res.end(e instanceof Rejection ? `${e.expected} — got ${e.got}` : String(e));
        return;
      }
      res.writeHead(200, {
        "content-type": "text/html; charset=utf-8",
        "content-disposition": `attachment; filename="form-${name}.html"`,
      });
      res.end(body);
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
          // THE SECOND BANK'S SCALE, for the same reason as the first. Without
          // it a host drawing stop-at's help had an empty table to draw from.
          stopat: loadStopAt(state.root),
          power: state.session.power,
          narration: { minutes: state.session.narrationMinutes, calls: state.session.narrationCalls },
        }),
      );
    },
    // see dsp-legible-controls.md#the-host-reads-the-cards-from-here
    "/api/cards": (_url, _req, res) => {
      res.writeHead(200, { "content-type": "application/json; charset=utf-8", "access-control-allow-origin": "*" });
      res.end(JSON.stringify({ cards: loadCards(o.root) }));
    },
    // BOTH HANDS ASK IT: the agent through
    // se_survey, the person through the machine header's button.
    "/api/survey": (_url, _req, res) => {
      json(res, survey(o.root));
    },
    // see dsp-mirror-render.md#the-mirror-is-pushed
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
    // EMBEDDER's page (the VS Code webview) polls from its own origin.
    //
    // THAT IS SAFE ONLY BECAUSE THE SOCKET IS LOOPBACK-BOUND. This comment
    // used to say "the server never leaves localhost" while listen() bound
    // every interface, so the sentence was a belief rather than a fact. The
    // bind is explicit now; see the listen call at the end of this file.
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
        // THE SECOND BANK. Missing here would not fail loudly — renderPanel
        // reads an absent value as the OFF state and draws a row of dead
        // buttons, which is the hole the comment above this block records.
        stopat: loadStopAt(state.root),
        stop_at: state.session.stopAtValue,
        // EVERY PIECE OF WORK STILL RUNNING, so a person watching a still
        // surface can tell a slow operation from a hung one and can see how
        // many things are going. Empty is the ordinary case and draws nothing.
        tables: { running: tasksTable(runningWork()) },
        emergency: state.session.emergency,
        ints: { narration_minutes: state.session.narrationMinutes, narration_calls: state.session.narrationCalls },
        toggles: { "block-auto-sleep": power.block_sleep, "shutdown-at-front-desk": power.shutdown_at_front_desk },
      };
      // EVERY PANEL RIDES ALONG, in the one order there is. renderSidebar
      // decides it, so the sidebar needs one fetch and neither surface writes
      // markup or picks an order of its own.
      const bar = renderSidebar(state.root, values);
      res.writeHead(200, { "content-type": "text/html; charset=utf-8", "access-control-allow-origin": "*" });
      res.end(bar);
    },
  };

  // THE WIDGETS STAY, AND THE WHOLE PAGE DOES NOT.
  //
  // A WIDGET IS THE SIDEBAR. The editor's panes are these routes, framed. Take
  // them away and the surface people actually use goes with them.
  //
  // THE PAGE WAS A SECOND INTERFACE NOBODY USED, and its cost was never the
  // code. An agent would fix a pane, open the standalone page, see the fix, and
  // report the interface repaired — while the sidebar still showed the fault.
  // THE GATE TAKES ITS VOCABULARY FROM THE RENDERER, so it cannot admit a kind
  // the renderer has no branch for. It admitted `controls` while the cast one
  // line below had no such member, and `/widget/controls` has its own route
  // above — so the entry did nothing but keep a way through to the whole page
  // this file says is no longer served.
  const WIDGETS: ReadonlySet<string> = new Set<string>(WIDGET_KINDS);

  // RENDER FIRST, THEN WRITE THE HEAD. See the note at the dispatcher's catch.
  const serveWidget = (widget: string, url: URL, res: Res): void => {
    const profile = widget === "trace" || widget === "machine" ? ({} as Record<string, number>) : undefined;
    const started = performance.now();
    const html = renderMirror(
      state,
      widget as WidgetKind,
      url.searchParams.get("view") ?? undefined,
      undefined,
      url.searchParams.get("embed") === "1",
      url.searchParams.get("tv") ?? undefined,
      url.searchParams.get("tp") ?? undefined,
      url.searchParams.get("tt") ?? undefined,
      url.searchParams.get("tq") ?? undefined,
      url.searchParams.get("tc") ?? undefined,
      url.searchParams.get("to") ?? undefined,
      profile === undefined ? undefined : (phase, durationMs) => (profile[phase] = durationMs),
    );
    if (profile !== undefined) {
      o.log.append({
        tool: "mirror_profile",
        args: { path: url.pathname, widget, phases: profile },
        actor: "ui",
        part: "surface",
        state: UNREPORTED,
        answered_by: UNREPORTED,
        ok: true,
        outcome: "result",
        duration_ms: performance.now() - started,
      });
    }
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    res.end(html);
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

  // see dsp-legible-controls.md#the-persons-surfaces-get-the-same-clock-as-the
  const server = createServer((req, res) => {
    // Every request is a new drawing epoch — see machines/compile.ts.
    bumpDrawingEpoch();
    // AND ONE PASS OVER DISK (software.md, input-process-output). A render
    // asks the same notes over and over; inside a pass the door stats each of
    // them once. The boundary is already here — the drawing epoch draws it —
    // and a request is exactly the operation the input belongs to.
    beginPass();
    const url = new URL(req.url ?? "/", `http://localhost:${o.port}`);
    const started = Date.now();
    const finish = res.end.bind(res) as (...a: unknown[]) => Res;
    let clocked = false;
    (res as { end: unknown }).end = (...a: unknown[]): Res => {
      if (!clocked) {
        clocked = true;
        const ms = Date.now() - started;
        if (ms >= slowMs()) {
          try {
            o.log.append({
              tool: "mirror_slow",
              args: { path: url.pathname, method: req.method ?? "", ms },
              actor: "ui",
              part: "surface",
              state: UNREPORTED,
              answered_by: UNREPORTED,
              ok: true,
              outcome: "result",
              duration_ms: ms,
            });
          } catch {
            /* measuring must never break serving */
          }
        }
      }
      return finish(...a);
    };
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
      // NO WHOLE PAGE IS SERVED HERE ANY MORE. `/` used to answer with the
      // entire mirror, and every unknown GET fell through to it.
      //
      // WHAT REMAINS: `/mcp`, `/widget/*` — which IS the editor's sidebar — and
      // the API those panes read and post their controls to.
      //
      // AND `se_shoot` STILL DRAWS THE SURFACE, without HTTP in the path at
      // all, while `se_surface` prints the same facts as text.
      res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      res.end(`no such route: ${req.method ?? "GET"} ${url.pathname}`);
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
    } finally {
      // THE PASS CLOSES WITH THE SYNCHRONOUS BODY, not with the response. A
      // route that continues asynchronously does the rest of its reading
      // outside the pass, stat per access, which is the correct answer and
      // the slower one.
      endPass();
    }
  });

  // see dsp-mirror-render.md#the-mirror-binds-loopback-and-says-so
  // VS Code Copilot reuses its localhost MCP connection. Node's short default
  // keep-alive window can reset that reused socket between tool calls.
  server.keepAliveTimeout = 120_000;
  server.headersTimeout = 125_000;
  // A reset is the CLIENT's socket dying, and it now leaves a line. Before
  // this, telling it from a server exit meant checking a PID by hand.
  recordClientFailures(o.root, server);
  // THE LAST ENGINE'S GHOSTS DIE HERE, BEFORE ANYBODY CAN READ THEM.
  //
  // A job records itself as running and only the engine that owns it writes
  // the closing record. An engine that was killed never did, so without this
  // the next one inherits jobs that report progress and never finish.
  //
  // IT RUNS BEFORE listen ON PURPOSE. The first lane answer already carries
  // the work account, so a reap after the port opens is a reap the first
  // caller can race.
  const reaped = reapAbandonedJobs(o.root);
  if (reaped.length > 0) recordLifecycle(o.root, "reaped", `jobs=${String(reaped.length)} ${reaped.join(" ")}`);
  // AND THE TEST RUNS, which live in their own folder and their own shape. A
  // record left open blocks the stop hook until its window passes, so a killed
  // run reads as a running one for half an hour.
  const reapedTests = reapAbandonedTestJobs(o.root);
  if (reapedTests.length > 0) recordLifecycle(o.root, "reaped", `tests=${String(reapedTests.length)} ${reapedTests.join(" ")}`);
  server.listen(o.port, "127.0.0.1", () => recordLifecycle(o.root, "listening", `port=${String(o.port)}`));
  return server;
}
