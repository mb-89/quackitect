// The Mirror — v2's web-interface conventions, rebuilt for v3:
//   - ONE machine on screen; the VIEW is independent of the walk position:
//     double-click a sub-machine state to enter it as a viewer, use the
//     breadcrumbs to leave; the small › arrows list the sub-machines
//     selectable at that level (v2 style)
//   - sub-machine states are drawn with a DOUBLE border
//   - click a state → its details in the details pane (never advances);
//     click the machine's comment → the comment, readable, plus the
//     machine's details
//   - every widget has an expand button: click = fullscreen,
//     ctrl-click = new tab, shift-click = new window
//   - the details pane is fixed at half the sidebar; the sidebar resizes
//   - geometry-true SVG, wheel-zoom, drag-pan; JSON as key/value tables
// One source, two projections: the packet JSON shown here IS what the
// agent receives.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { BASES_SCRIPT, BASES_STYLE, BASES_TABLE_STYLE } from "./basesclient.ts";
import { basesCard } from "./baseui.ts";
import type { CallLog, CallRecord } from "./calllog.ts";
import { type CanvasData, type CanvasElement, loadCanvas, subLabel } from "./canvas.ts";
import { bindings, loadCards } from "./cards.ts";
import type { StrayNote } from "./inbox.ts";
import type { MachineDecl } from "./machine.ts";
import { compileMachineCached, resolveRef } from "./machines/compile.ts";
import { loadPanel, renderPanel } from "./params.ts";
import { loadLevels } from "./scale.ts";
import { mainMachinePath, type Session } from "./session.ts";
import { TABLE_SCRIPT, TABLE_STYLE } from "./tables.ts";

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function stateIdOf(el: CanvasElement): string | undefined {
  if (el.type !== "file" || el.file === undefined) return undefined;
  const base = el.file.replace(/\\/g, "/").split("/").pop()!;
  if (base.endsWith(".md")) return base.replace(/\.md$/, "");
  if (base.endsWith(".canvas")) return base.replace(/\.canvas$/, "");
  return undefined;
}

function sidePoint(el: CanvasElement, side: string | undefined, other: CanvasElement): [number, number] {
  const cx = el.x + el.width / 2;
  const cy = el.y + el.height / 2;
  switch (side) {
    case "left":
      return [el.x, cy];
    case "right":
      return [el.x + el.width, cy];
    case "top":
      return [cx, el.y];
    case "bottom":
      return [cx, el.y + el.height];
    default: {
      const ox = other.x + other.width / 2;
      return [ox < cx ? el.x : el.x + el.width, cy];
    }
  }
}

/** THE FEED ROLES — one colour per role, none shared. The aq kind wore the
 *  agent's blue and the update kind wore the human's amber, so two of the
 *  three columns said the same thing twice.
 *
 *  The NAMES live here because the code asks for them. The VALUES live in
 *  project/brand/palette.css, because a colour is configuration. */
export const FEED_ROLES = ["time", "src-agent", "src-human", "kind-call", "kind-update", "kind-note", "kind-aq"] as const;

/** What the voice already spent: pass, failure, attention. */
export const RESERVED_ROLES = ["ok", "fail", "warn"] as const;

/** Every `--name: value` pair declared in the palette, read live. */
export function paletteVars(root: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const m of palette(root).matchAll(/(--[a-z0-9-]+)\s*:\s*([^;}]+)/gi)) out[m[1].trim()] = m[2].trim();
  return out;
}

export function feedColours(root: string): Record<string, string> {
  const vars = paletteVars(root);
  return Object.fromEntries(FEED_ROLES.map((r) => [r, vars[`--se-feed-${r}`] ?? ""]));
}

export function reservedColours(root: string): string[] {
  const vars = paletteVars(root);
  return RESERVED_ROLES.map((r) => vars[`--se-${r}`] ?? "");
}

export interface StateMeta {
  has_exit: boolean;
  exit_met: boolean;
  has_entry: boolean;
  entry_met: boolean;
  /** The state's authored second line — drawn small under the name. */
  subtitle?: string;
}

/** THE DRAWING IS THE TRUTH, SIZE INCLUDED (owner ruling 2026-07-28).
 *
 *  The render used to compute its own box sizes, because a label needs less
 *  room than a note and the drawing scales to fit its pane. That made the
 *  render and Obsidian look nothing alike, and it meant a size the owner
 *  fixed in Obsidian was overruled on the way to the screen.
 *
 *  So the render now takes the geometry VERBATIM — position and size both.
 *  Fix it in Obsidian and it is fixed here. A node is instead born at the
 *  size of its label (canvas.nodeSize), which is a starting point a person
 *  adjusts, not a size anything re-imposes later.
 */
/** THE ROUTE, REDUCED TO ONE DRAWING (owner design 2026-07-29). The walk's
 *  route is a list of qualified hops; a canvas shows one machine. So each
 *  hop is projected onto the machine being VIEWED, giving the ORDERED stops
 *  the line runs through:
 *
 *  - both ends land on different states here — both are stops on the way;
 *  - both ends land on the SAME state here — the route is running around
 *    INSIDE it, so that state is a WAYPOINT. Navigation systems put a point
 *    on the line for somewhere you pass through, and a submachine entered
 *    and left again is exactly that. Click it to zoom in.
 *  - neither end is here — the hop belongs to another drawing.
 *
 *  A stop that is not a waypoint carries NO mark. The line runs through its
 *  anchor all the same, which is what the owner called an invisible waypoint. */
export function routeOverlay(
  steps: { from: string; to: string }[],
  viewId: string,
  mainId: string,
): { waypoints: Set<string>; path: string[] } {
  const prefix = viewId === mainId ? "" : viewId;
  const local = (q: string): string | undefined => {
    if (prefix === "") return q.split("/")[0];
    if (!q.startsWith(`${prefix}/`)) return undefined;
    return q.slice(prefix.length + 1).split("/")[0];
  };
  const waypoints = new Set<string>();
  const path: string[] = [];
  const visit = (id: string): void => {
    if (path[path.length - 1] !== id) path.push(id);
  };
  for (const s of steps) {
    const a = local(s.from);
    const b = local(s.to);
    if (a === undefined || b === undefined) continue;
    visit(a);
    if (a === b) waypoints.add(a);
    else visit(b);
  }
  return { waypoints, path };
}

interface RouteMarks {
  waypoints: Set<string>;
  /** The stops in order. The spline runs through their anchors. */
  path: string[];
  /** The destination, if it is in this drawing. */
  target?: string;
  /** The hop the walk cannot pass, and why. Drawn as a road closure. */
  blocked?: { at: string; why: string };
}

/** A Catmull-Rom spline through every stop, emitted as cubic Beziers — the
 *  line BENDS through the stops instead of hinging at them. */
function splinePath(p: [number, number][]): string {
  if (p.length < 2) return "";
  const f = (v: number): string => v.toFixed(1);
  let d = `M ${f(p[0][0])} ${f(p[0][1])}`;
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] ?? p[i];
    const p1 = p[i];
    const p2 = p[i + 1];
    const p3 = p[i + 2] ?? p2;
    d += ` C ${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)}`;
    d += ` ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)}`;
    d += ` ${f(p2[0])} ${f(p2[1])}`;
  }
  return d;
}

type CNode = NonNullable<CanvasData["nodes"]>[number];

// Groups first — presentation only, drawn behind everything.
function svgGroups(nodes: CNode[]): string[] {
  const parts: string[] = [];
  for (const n of nodes) {
    if (n.type !== "group") continue;
    parts.push(`<rect x="${n.x}" y="${n.y}" width="${n.width}" height="${n.height}" rx="18" class="group"/>`);
    if (n.label !== undefined && n.label !== "") {
      parts.push(`<text x="${n.x + 20}" y="${n.y + 38}" class="group-label">${esc(n.label)}</text>`);
    }
  }
  return parts;
}

function svgEdges(canvas: CanvasData, byId: Map<string, CNode>): string[] {
  const parts: string[] = [];
  for (const edge of canvas.edges ?? []) {
    const a = byId.get(edge.fromNode);
    const b = byId.get(edge.toNode);
    if (a === undefined || b === undefined) continue;
    const [x1, y1] = sidePoint(a, (edge as { fromSide?: string }).fromSide, b);
    const [x2, y2] = sidePoint(b, (edge as { toSide?: string }).toSide, a);
    // A double-headed arrow is one edge meaning both ways, so it draws that
    // way too — the marker already orients itself at a start.
    const bothWays = (edge as { fromEnd?: string }).fromEnd === "arrow";
    parts.push(
      `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="edge"${bothWays ? ' marker-start="url(#arrow)"' : ""} marker-end="url(#arrow)"/>`,
    );
    if (edge.label !== undefined && edge.label !== "") {
      parts.push(`<text x="${(x1 + x2) / 2}" y="${(y1 + y2) / 2 - 8}" class="guard">${esc(edge.label)}</text>`);
    }
  }
  return parts;
}

function svgStateNode(
  n: CNode,
  activeIds: Set<string>,
  doneIds: Set<string>,
  subIds: Set<string>,
  meta: Record<string, StateMeta>,
): string[] {
  const parts: string[] = [];
  if (n.type === "text") {
    parts.push(
      `<g class="clickable" data-detail="comment"><rect x="${n.x}" y="${n.y}" width="${n.width}" height="${n.height}" class="comment"/>`,
    );
    parts.push(
      `<foreignObject x="${n.x + 10}" y="${n.y + 6}" width="${n.width - 20}" height="${n.height - 12}"><div xmlns="http://www.w3.org/1999/xhtml" class="comment-text">${esc(n.text ?? "")}</div></foreignObject></g>`,
    );
    return parts;
  }
  const sid = stateIdOf(n);
  if (sid === undefined) return parts;
  const isSub = subIds.has(sid);
  const pill = (n as { styleAttributes?: { shape?: string } }).styleAttributes?.shape === "pill";
  const cls = activeIds.has(sid) ? "state active" : doneIds.has(sid) ? "state done" : "state";
  const rx = pill ? Math.min(n.width, n.height) / 2 : 14;
  parts.push(`<g class="clickable" data-detail="state:${esc(sid)}"${isSub ? ` data-sub="${esc(sid)}"` : ""}>`);
  parts.push(`<rect x="${n.x}" y="${n.y}" width="${n.width}" height="${n.height}" rx="${rx}" class="${cls}"/>`);
  if (isSub) {
    // Sub-machine states carry a DOUBLE border.
    parts.push(
      `<rect x="${n.x + 8}" y="${n.y + 8}" width="${n.width - 16}" height="${n.height - 16}" rx="${Math.max(4, rx - 8)}" class="${cls} inner"/>`,
    );
  }
  const sub = subLabel(meta[sid]?.subtitle);
  parts.push(`<text x="${n.x + n.width / 2}" y="${n.y + n.height / 2 + (sub !== undefined ? -6 : 6)}" class="label">${esc(sid)}</text>`);
  if (sub !== undefined) parts.push(`<text x="${n.x + n.width / 2}" y="${n.y + n.height / 2 + 24}" class="sublabel">${esc(sub)}</text>`);
  parts.push("</g>");
  return parts;
}

// THE ROUTE IS DRAWN OVER THE NODES (owner ruling 2026-07-29), reversing
// the along-the-edges ruling of the same day. Riding the edges read as the
// graph highlighting itself; a navigation system lays its line ON the map.
// It is pushed LAST so it covers the boxes, exactly as a route does.
//
// ARRIVED MEANS CLEAR: with fewer than two stops there is no way left to
// show, so neither line nor arrow is drawn.
function svgRoute(route: RouteMarks | undefined, nodeOfState: Map<string, CNode>): string[] {
  const parts: string[] = [];
  const stops: { id: string; cx: number; cy: number }[] = [];
  for (const id of route?.path ?? []) {
    const n = nodeOfState.get(id);
    // The anchor: centred across the node and a quarter down — the band
    // between its top edge and its title, so the line never crosses the words.
    if (n !== undefined) stops.push({ id, cx: n.x + n.width / 2, cy: n.y + n.height / 4 });
  }
  if (stops.length < 2) return parts;
  // A ROAD CLOSURE (owner ruling 2026-07-29). The route already knows the hop
  // the walk cannot pass — usually a state sitting above the autonomy slider.
  // Drawn as one unbroken line the map says the whole way is open, which is
  // the one moment it lies. So the line runs normally up to the closure and
  // FADES past it: the way exists, it is shut.
  const xy = (s: { cx: number; cy: number }): [number, number] => [s.cx, s.cy];
  const shut = route?.blocked === undefined ? -1 : stops.findIndex((s) => s.id === route.blocked?.at);
  const open = shut > 0 ? stops.slice(0, shut) : stops;
  const past = shut > 0 ? stops.slice(shut - 1) : [];
  // fill="none" is an ATTRIBUTE, not just a class rule. An SVG path with no
  // fill declared paints SOLID BLACK, so the one time the stylesheet is not
  // there the route becomes a black blob swallowing the drawing. That is not
  // hypothetical: it is exactly what a reader saw, because the mirror morphs
  // the body and never re-sent the <style>. The attribute survives that.
  if (open.length >= 2) parts.push(`<path d="${splinePath(open.map(xy))}" fill="none" class="route-line"/>`);
  if (past.length >= 2) parts.push(`<path d="${splinePath(past.map(xy))}" fill="none" class="route-line shut"/>`);
  // A waypoint and the destination are the SAME filled dot. The owner's
  // sketch drew the destination as a ring; that was the pen, not the intent.
  for (const [i, s] of stops.entries()) {
    if (route?.target === s.id || route?.waypoints.has(s.id) === true) {
      parts.push(`<circle cx="${s.cx}" cy="${s.cy}" r="8" class="route-stop${shut > 0 && i >= shut ? " shut" : ""}"/>`);
    }
  }
  // THE CLOSURE MARK, on the hop that shuts, carrying the reason. An
  // exclamation in a ring rather than a bar across the line: a bar reads as
  // part of the road, and it stays upright whichever way the road runs.
  if (shut > 0) {
    const b = stops[shut];
    parts.push(
      `<g class="clickable" data-detail="state:${esc(b.id)}"><title>${esc(route?.blocked?.why ?? "")}</title>` +
        `<g class="route-shut" transform="translate(${b.cx} ${b.cy})">` +
        `<circle r="12" class="shut-ring"/><path d="M 0 -6.5 L 0 2.5" class="shut-bang"/><circle cy="7" r="1.7" class="shut-dot"/>` +
        `</g></g>`,
    );
  }
  // YOU ARE HERE: the arrow a map puts under your car, turned to face the
  // way the line is going.
  const heading = (Math.atan2(stops[1].cy - stops[0].cy, stops[1].cx - stops[0].cx) * 180) / Math.PI + 90;
  parts.push(
    `<path d="M 0 -12 L 10 9 L 0 4 L -10 9 Z" class="route-here" transform="translate(${stops[0].cx} ${stops[0].cy}) rotate(${heading.toFixed(1)})"/>`,
  );
  return parts;
}

function machineSvg(
  source: CanvasData,
  activeIds: Set<string>,
  doneIds: Set<string>,
  subIds: Set<string>,
  meta: Record<string, StateMeta>,
  route?: RouteMarks,
): string {
  const canvas = source;
  const nodes = canvas.nodes ?? [];
  const pad = 60;
  const minX = Math.min(...nodes.map((n) => n.x)) - pad;
  const minY = Math.min(...nodes.map((n) => n.y)) - pad;
  const maxX = Math.max(...nodes.map((n) => n.x + n.width)) + pad;
  const maxY = Math.max(...nodes.map((n) => n.y + n.height)) + pad;
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const nodeOfState = new Map<string, CNode>();
  for (const n of nodes) {
    const s = stateIdOf(n);
    if (s !== undefined) nodeOfState.set(s, n);
  }
  const parts: string[] = [
    ...svgGroups(nodes),
    ...svgEdges(canvas, byId),
    ...nodes.flatMap((n) => svgStateNode(n, activeIds, doneIds, subIds, meta)),
    ...svgRoute(route, nodeOfState),
  ];
  return `<svg id="machine-svg" viewBox="${minX} ${minY} ${maxX - minX} ${maxY - minY}">
  <defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" class="arrowhead"/></marker></defs>
  ${parts.join("\n  ")}</svg>`;
}

export interface MirrorState {
  session: Session;
  root: string;
  lastPacket: unknown;
  mode: "manual" | "agent";
  /** The call log — present, the sidebar carries the unified feed. */
  log?: CallLog;
}

function briefTick(a: Record<string, unknown>): string {
  if (a.back !== undefined) return `back → ${a.back}`;
  if (a.state !== undefined) return `peek ${a.state}`;
  if (a.wait === true) return "hold (wait)";
  if (a.to !== undefined) return `tick → ${a.to}`;
  return a.advance === true ? "tick advance" : "tick (look)";
}

function briefPull(a: Record<string, unknown>): string {
  const f = a.form as { choice?: unknown } | undefined;
  if (a.escape !== undefined) return "pull · escape";
  if (f?.choice !== undefined) return `pull · choice ${Array.isArray(f.choice) ? (f.choice as unknown[]).join(", ") : String(f.choice)}`;
  return f !== undefined ? "pull · form" : "pull";
}

function briefRead(a: Record<string, unknown>): string {
  // A multi-read has no `path`, so naming only that one printed "read
  // undefined" and the reader could not tell one read from another.
  if (Array.isArray(a.paths)) {
    const names = a.paths.map((p) => (typeof p === "string" ? p : String((p as { path?: unknown }).path ?? "?")));
    const head = names.slice(0, 3).join(", ");
    return `read ${names.length} · ${head}${names.length > 3 ? `, +${names.length - 3} more` : ""}`;
  }
  return `read ${a.path}${a.offset !== undefined ? ` @${a.offset}` : ""}`;
}

/** One formatter per tool — a new tool is a table entry, never a branch. */
const BRIEFS: Record<string, (a: Record<string, unknown>) => string> = {
  se_tick: briefTick, // old logs only
  se_pull: briefPull,
  mirror_tick: (a) => (a.back !== undefined ? `back → ${a.back}` : a.to !== undefined ? `tick → ${a.to}` : "tick advance"),
  mirror_check: (a) => `check ${a.path}`,
  mirror_autonomy: (a) => `autonomy → ${a.value}`,
  mirror_narration: (a) => `updates → ${a.value}`,
  mirror_script: (a) => `run scripts · ${a.state}`,
  se_update: (a) => {
    const items = Array.isArray(a.items) ? ` (+${a.items.length})` : "";
    return `${a.op}${a.node !== undefined ? ` ${a.node}` : ""}${a.brief !== undefined ? `: ${a.brief}` : ""}${items}`;
  },
  se_note: (a) => String(a.text ?? ""),
  mirror_note: (a) => String(a.text ?? ""),
  se_answer: (a) => String(a.question ?? ""),
  mirror_tool: (a) => `tool ${a.name}`,
  mirror_escape: (a) => `escape: ${a.reason}`,
  mirror_form_save: (a) => `form save ${a.name}`,
  mirror_form_confirm: (a) => `form confirm ${a.name} · ${a.field}`,
  mirror_form_done: (a) => `form done ${a.name}`,
  mirror_form_folder: () => "open evidence folder",
  se_file_read: briefRead,
  se_file_write: (a) => `write ${a.path}`,
  se_file_patch: (a) => `patch ${Array.isArray(a.ops) ? a.ops.length : 0} op(s)`,
  se_file_move: (a) => `move ${a.from} → ${a.to}`,
  se_file_delete: (a) => `delete ${a.path}`,
  se_file_list: (a) => `list ${a.dir ?? "."}`,
  se_file_glob: (a) => `glob ${a.glob}`,
  se_file_search: (a) => `search /${a.query}/`,
  se_run: (a) => `run: ${String(a.command ?? "")}`,
  se_web_fetch: (a) => `fetch ${a.url}`,
  se_web_search: (a) => `web: ${a.query}`,
  se_log_query: (a) => (a.ref !== undefined ? `log ref ${a.ref}` : "log query"),
  se_exp_new: (a) => `new expedition (${a.kind})`,
  se_exp_open: (a) => `bind ${a.id}`,
  se_exp_close: () => "close expedition",
  se_exp_list: () => "expeditions",
};

/** One feed line's brief — the unified feed's middle column (owner ruling,
 *  v2 i9 notes: time | src | brief | result; the full record is one click
 *  away, so the brief only has to say WHAT, never everything). */
function briefFor(rec: CallRecord): string {
  const f = BRIEFS[rec.tool];
  return f !== undefined ? f(rec.args as Record<string, unknown>) : rec.tool;
}

/** The unified feed: this session's acts, capped at the newest 500 rows —
 *  the cap is declared in the result, never silent. Pending strays from
 *  EARLIER sessions ride on top (type "note"), so the inbox never falls
 *  out of sight; this session's notes already ride as se_note calls. */
/** A FEED ROW IS ONE LINE, ALWAYS (owner ruling 2026-07-31). Note text is
 *  free prose with paragraphs and list items, and slicing it without
 *  flattening let every newline through - one note could stand a dozen rows
 *  tall and push the rest of the feed off the screen.
 *
 *  ONE RULE, NOT ONE PER KIND. briefFor returns whatever each tool's line
 *  should say and NOTHING else: no flattening, no truncating, no per-case
 *  cleverness. Every row leaves through here, so a new tool cannot forget
 *  the rule and se_run no longer carries its own private version of it.
 *  Change FEED_BRIEF_CHARS to change the width; it is the only place the
 *  number lives. */
const FEED_BRIEF_CHARS = 90;

function oneLine(s: string): string {
  const flat = String(s).replace(/\s+/g, " ").trim();
  return flat.length > FEED_BRIEF_CHARS ? `${flat.slice(0, FEED_BRIEF_CHARS - 1)}…` : flat;
}

export function feedRows(
  log: CallLog,
  since: string,
  pending: StrayNote[] = [],
): { capped: boolean; rows: Array<Record<string, unknown>> } {
  const q = log.query({ filter: { since }, limit: 501 });
  // The reader's selection is view state — logged, never shown as a feed row.
  const records = (q.records ?? []).filter((r) => r.tool !== "mirror_select");
  const capped = records.length > 500;
  const rows = records.slice(-500).map((rec) => ({
    ref: rec.ref,
    ts: rec.ts,
    src: rec.tool.startsWith("mirror_") ? "human" : "agent",
    // Updates are NARRATION (bold), whatever their op — only se_note
    // strays are retro notes (italic). Two kinds, never conflated.
    type:
      rec.tool === "se_update"
        ? "update"
        : rec.tool === "se_note" || rec.tool === "mirror_note"
          ? "note"
          : rec.tool === "se_answer"
            ? "aq"
            : "call",
    brief: oneLine(briefFor(rec)),
    ok: rec.ok,
    ...(rec.ok ? {} : { clause: (rec.response as { clause?: string } | undefined)?.clause }),
    ...(rec.tool === "se_update" ? { visit: (rec.args as { visit?: string }).visit } : {}),
  }));
  const noteRows = pending
    .filter((n) => n.at < since)
    .map((n) => ({
      ref: n.ref,
      ts: n.at,
      src: n.by === "human" ? "human" : "agent",
      type: "note",
      brief: oneLine(n.text),
      ok: true,
      pending: true,
    }));
  return { capped, rows: [...noteRows, ...rows] };
}

/** Resolve a viewable machine by id: main itself, or one of its subs. */
function viewedMachine(m: MirrorState, view: string | undefined): { decl: MachineDecl; canvas: CanvasData } {
  const mainPath = mainMachinePath(m.root);
  if (view === undefined || view === m.session.machine.id) {
    return { decl: m.session.machine, canvas: loadCanvas(mainPath) };
  }
  const subState = m.session.machine.states.find((s) => s.submachine !== undefined && s.id === view);
  if (subState === undefined) {
    // Nested generated machines (archive decades) are viewable too.
    const nested = m.session.viewFor(view);
    return nested ?? { decl: m.session.machine, canvas: loadCanvas(mainPath) };
  }
  // Generated machines serve their own drawing (continue_expedition).
  const generated = m.session.generatedView(subState.id);
  if (generated !== undefined) return generated;
  const path = resolveRef(m.root, mainPath, subState.submachine!);
  // CACHED, and live all the same. compileMachineCached memoises against the
  // CONTENT of every file the compile read, so an edited canvas or state note
  // recompiles on the next render and an untouched one does not. The mirror
  // re-renders on every poll, and recompiling the machine each time cost a
  // full second per render — paid by the VS Code panel, not just the tests.
  return { decl: compileMachineCached(m.root, path), canvas: loadCanvas(path) };
}

// THE COMPONENT LIBRARY, on every page the mirror serves. The engine serves
// the bundle itself (mirror.ts, /vendor), so this is an ordinary script tag
// rather than a webview asset URI — no bundler and no build step.
const ELEMENTS = '<script type="module" src="/vendor/vscode-elements.js"></script>';

// THE PALETTE IS CONFIGURATION, NEVER CODE (owner ruling 2026-07-30). Every
// colour the product chooses lives in project/brand/palette.css, beside the other
// product configuration, where a person edits it without touching code. It is
// read on EVERY render, so an edit shows on the next page load and the engine
// never restarts for a colour.
//
// THE FALLBACK IS A LEGIBILITY FLOOR, NOT A SECOND PALETTE. It carries only
// what keeps a page readable when the file is gone — something to draw on,
// something to draw with. Copying all fifteen values here would put every
// colour in two places, and the copy would go stale the first time somebody
// edited the real one.
//
// Nothing renders from this in a working install: preflight refuses to go
// green without project/brand/palette.css, so a tree reaching here is already
// known-broken and only has to stay readable enough to say so.
const PALETTE_FALLBACK = ":root{--se-bg:#14171a;--se-fg:#d8dde2}";

export function palette(root: string): string {
  try {
    return readFileSync(join(root, "project", "brand", "palette.css"), "utf8");
  } catch {
    return PALETTE_FALLBACK;
  }
}

const STYLE = `
  * { scrollbar-color: var(--se-border-strong) var(--se-bg); }
  ::-webkit-scrollbar { width: 10px; height: 10px; background: var(--se-bg); }
  ::-webkit-scrollbar-thumb { background: var(--se-border-strong); border-radius: 5px; }
  body { font-family: ui-monospace, Consolas, monospace; background: var(--se-bg); color: var(--se-fg); margin: 0; height: 100vh; overflow: hidden; }
  .cols { display: flex; height: 100vh; }
  main { flex: 1; min-width: 0; display: flex; flex-direction: column; padding: 14px 18px; }
  .divider { width: 6px; cursor: col-resize; background: var(--se-border); flex: none; }
  .divider.horiz { width: auto; height: 6px; cursor: row-resize; }
  /* 465px is the width the owner settled the sidebar at by dragging it, and
     a default nobody re-drags is the only evidence a default is right. */
  aside { width: 465px; min-width: 320px; max-width: 80vw; display: flex; flex-direction: column; background: var(--se-bg-side); }
  /* THE LEFT COLUMN: the feed on top, the agent's terminal beneath it.
     SIZED FOR AN 80-COLUMN TERMINAL (owner ruling 2026-07-28). 820px was
     too wide; narrowing it without sizing the terminal would just have made
     the agent wrap early. 80 columns x 8px + 10px for the scrollbar = 650.
     8px is the UPPER bound for a 13px monospace cell, so 80 is a floor here,
     never a target. The divider moves it, and the size the reader lands on
     is stored and reused from then on. */
  #left { width: 650px; min-width: 360px; }

  /* THE TERMINAL FILLS ITS CARD (owner 2026-07-29), superseding the half-a-
     column rule the old left column needed. It once sat tiny because flex:none
     with no height sizes to CONTENT; in the grid the card decides the box and
     the terminal takes all of it. Still no max — promoted, it gets the big
     slot, which is far more room than the splitter ever gave it. */
  #w-terminal { min-height: 140px; }
  /* NEVER SCROLLS. xterm scrolls itself; a scrollbar here would steal from
     clientWidth mid-measure and start the flicker over. */
  .term-panel { flex: 1; min-height: 0; overflow: hidden; padding: 8px 10px; }
  /* Beats .widget's own display, whatever order the sheet ends up in. */
  .no-host { display: none !important; }
  .crumbs { font-size: 13px; color: var(--se-muted); display: flex; align-items: center; gap: 4px; text-transform: none; letter-spacing: 0; }
  .crumbs a { color: var(--se-fg); text-decoration: none; }
  .crumbs a:hover { color: var(--se-accent); }
  .crumbs .here { color: var(--se-accent); }
  .crumb-arrow { position: relative; cursor: pointer; color: var(--se-muted); padding: 0 3px; }
  .crumb-arrow:hover { color: var(--se-accent); }
  .crumb-menu { display: none; position: absolute; top: 18px; left: 0; z-index: 10; background: var(--se-raised); border: 1px solid var(--se-border-strong); border-radius: 8px; min-width: 160px; padding: 4px; }
  .crumb-arrow.open .crumb-menu { display: block; }
  .crumb-menu a { display: block; padding: 6px 10px; border-radius: 6px; }
  .crumb-menu a:hover { background: var(--se-hover); }
  /* THE RUNGS. Dense on purpose (owner sketch): the row reads as one control,
     so the buttons touch and only the lit ones carry weight. */
  .rungbar .rungs { display: inline-flex; gap: 1px; margin: 0 6px; }
  .rung { font: inherit; font-size: 11px; line-height: 1; padding: 3px 7px; border: 1px solid var(--se-border); background: var(--se-bg); color: var(--se-dim); cursor: pointer; }
  .rung:first-child { border-radius: 4px 0 0 4px; }
  .rung:last-child { border-radius: 0 4px 4px 0; }
  .rung.on { background: var(--se-accent-bg); color: var(--se-accent); border-color: var(--se-accent); font-weight: 700; }
  .rung.locked { color: var(--se-border-strong); cursor: default; }
  /* Ideation is the one rung that delegates the CREATION of work, so it is
     the one rung drawn as a hazard rather than as a setting. */
  .rung.danger.on { background: var(--se-fail); border-color: var(--se-fail); color: var(--se-bg); }
  .rung.danger:not(.locked):not(.on) { color: var(--se-fail); border-color: var(--se-fail); }
.rung.emergency, .rung.danger.on.emergency { background: var(--se-fail); border-color: var(--se-fail); color: var(--se-bg); animation: se-emergency 1.1s ease-in-out infinite; }
@keyframes se-emergency { 0%, 100% { opacity: 1; } 50% { opacity: 0.45; } }
@media (prefers-reduced-motion: reduce) { .rung.emergency { animation: none; outline: 2px solid var(--se-fail); outline-offset: 1px; } }
  /* Line edits, integers only. Narrow on purpose — the row is dense and a
     cadence is never more than a few digits. */
  .cadence { width: 3.2em; flex: 0 0 auto; box-sizing: content-box; font: inherit; font-size: 11px; padding: 2px 4px; margin-left: 6px; background: var(--se-bg); border: 1px solid var(--se-border); border-radius: 4px; color: var(--se-fg); text-align: right; }
  /* ONE ROW PER CONTROL, LABEL FIRST. params.ts groups the rows from the
     panel spec; this only sizes them. */
  .rungbar { display: inline-flex; flex-direction: column; align-items: stretch; flex: 0 0 auto; gap: 4px; }
  .param-row { display: flex; align-items: center; gap: 0; }
  .param-label { flex: 0 0 5.4em; color: var(--se-muted); font-size: 12px; margin-right: 6px; cursor: pointer; }
  .param-choice { font: inherit; font-size: 11px; margin-left: 6px; padding: 2px 4px; background: var(--se-bg); border: 1px solid var(--se-border); border-radius: 4px; color: var(--se-fg); }
  .param-text { flex: 1 1 auto; min-width: 0; box-sizing: border-box; background: var(--se-bg); border: 1px solid var(--se-border); border-radius: 6px; color: var(--se-fg); font: inherit; font-size: 12px; padding: 4px 8px; }
  .param-action { margin-left: 10px; border-radius: 4px; }
  .cadence-unit { font-size: 10px; color: var(--se-dim); margin-left: 3px; }
  .nr-now { margin-left: 8px; border-radius: 4px; }
  .widget { display: flex; flex-direction: column; border: 1px solid var(--se-border); border-radius: 10px; background: var(--se-bg-side); min-height: 0; }
  .widget-head { display: flex; align-items: center; justify-content: space-between; padding: 6px 12px; border-bottom: 1px solid var(--se-border); color: var(--se-muted); font-size: 12px; text-transform: uppercase; letter-spacing: .08em; }
  .widget-body { flex: 1; min-height: 0; overflow: auto; }
  .expand { background: none; border: 1px solid var(--se-border-strong); color: var(--se-muted); border-radius: 6px; cursor: pointer; font: inherit; padding: 2px 8px; }
  .expand:hover { color: var(--se-accent); border-color: var(--se-accent); }
  /* THE CARD MATRIX (owner design 2026-07-29). One BIG card beside a two-wide
     grid of the rest. It is ONE grid across the whole viewport, so promoting a
     card is a class change and nothing ever moves in the DOM — a moved widget
     is a recreated widget, and a recreated terminal loses its scrollback. */
  .cards { display: grid; height: 100vh; box-sizing: border-box; gap: 8px; padding: 8px; grid-template-columns: var(--main-w, 58%) 6px 1fr 1fr; }
  .card { position: relative; display: flex; min-width: 0; min-height: 0; grid-column: var(--col); grid-row: var(--row); }
  .card > .widget { flex: 1; min-width: 0; }
  .card.main { grid-column: 1; grid-row: 1 / -1; }
  #div-cards { grid-column: 2; grid-row: 1 / -1; width: 6px; cursor: col-resize; background: var(--se-border); border-radius: 3px; }
  /* The head reserves room so the number never lands on the title. */
  .card > .widget > .widget-head { padding-left: 34px; }
  .cardnum { position: absolute; top: 7px; left: 10px; z-index: 2; display: inline-flex; align-items: center; justify-content: center; width: 17px; height: 17px; border: 1px solid var(--se-border-strong); border-radius: 4px; font-size: 11px; color: var(--se-muted); cursor: pointer; }
  .cardnum:hover { color: var(--se-accent); border-color: var(--se-accent); }
  .card.main .cardnum { color: var(--se-accent); border-color: var(--se-accent); }
  .legend-row { display: flex; gap: 10px; padding: 3px 12px; font-size: 12px; }
  .legend-key { color: var(--se-accent); min-width: 92px; flex: none; }
  .legend-what { color: var(--se-fg); }
  #w-machine { flex: 1; }
  #w-machine .widget-body { display: flex; }
  svg { width: 100%; height: 100%; cursor: grab; }
  svg.panning { cursor: grabbing; }
  .state { fill: var(--se-raised); stroke: var(--se-border-strong); stroke-width: 2; }
  /* ONLY WHERE THE WALK STANDS IS COLOURED (owner ruling 2026-07-31). Where
     it has BEEN keeps the ordinary state colour: two shades of one blue asked
     the reader to compare hues, and the eye does not read that difference
     reliably. There is no .state.done rule, on purpose. */
  .state.active { fill: var(--se-walk-bg); stroke: var(--se-walk); stroke-width: 3.5; }
  .state.inner { fill: none; }
  .clickable { cursor: pointer; }
  .clickable:hover .state, .clickable:hover .comment { stroke: var(--se-fg); }
  .label { fill: var(--se-fg); font-size: 26px; text-anchor: middle; font-family: inherit; pointer-events: none; }
  .sublabel { fill: var(--se-muted); font-size: 17px; text-anchor: middle; font-family: inherit; pointer-events: none; }
  .edge { stroke: var(--se-dim); stroke-width: 2.5; }
  .arrowhead { fill: var(--se-dim); }
  button.ghost:disabled { opacity: .45; cursor: default; }
  /* THE BLUE LINE. Blue on purpose: the voice reserves green, red and
     yellow for verdicts, and a route is not a verdict. It is a way. */
  .route-line { fill: none; stroke: var(--se-walk); stroke-width: 6; stroke-linecap: round; stroke-linejoin: round; }
  /* Past a closure the way is FADED, never hidden: it exists, it is shut.
     The barrier itself is yellow, because yellow is attention and a shut
     road wants the reader's hand on the slider. */
  .route-line.shut { opacity: .28; }
  .route-shut { stroke: var(--se-warn); fill: none; stroke-width: 2.4; }
  .route-shut .shut-ring { fill: var(--se-bg); }
  .route-shut .shut-bang { stroke-width: 3; stroke-linecap: round; }
  .route-shut .shut-dot { fill: var(--se-warn); stroke: none; }
  .route-stop { fill: var(--se-walk); stroke: var(--se-walk-ring); stroke-width: 2; }
  .route-stop.shut { opacity: .28; }
  .route-here { fill: var(--se-walk); stroke: var(--se-walk-ring); stroke-width: 2; }
  .guard { fill: var(--se-accent); font-size: 20px; text-anchor: middle; }
  .comment { fill: var(--se-bg-side); stroke: var(--se-border); }
  .group { fill: var(--se-bg-side); stroke: var(--se-border); stroke-dasharray: 10 6; stroke-width: 2; }
  .group-label { fill: var(--se-dim); font-size: 24px; font-family: inherit; letter-spacing: .06em; }
  .comment-text { color: var(--se-muted); font-size: 13px; line-height: 1.35; }
  .comment-detail { font-size: 15px; line-height: 1.55; color: var(--se-fg); padding: 2px 0 10px; }
  .replink { color: var(--se-accent); cursor: pointer; text-decoration: underline dotted; }
  .bar { display: flex; gap: 10px; padding: 12px; }
  button.primary { background: var(--se-accent); color: var(--se-bg); border: 0; border-radius: 8px; padding: 8px 14px; font: inherit; font-weight: 700; cursor: pointer; margin: 2px 4px 2px 0; }
  .panel { padding: 0 12px 12px; overflow: auto; }
  .meta { color: var(--se-muted); font-size: 12px; padding: 8px 12px; }
  .todo-origin { color: var(--se-muted); font-size: 11px; }
  table.kv { border-collapse: collapse; width: 100%; font-size: 12.5px; }
  table.kv td { border: 1px solid var(--se-border); padding: 2px 6px; line-height: 1.35; vertical-align: top; }
  table.kv td.k { color: var(--se-accent); white-space: nowrap; width: 1%; }
  table.kv td.v { color: var(--se-fg); word-break: break-word; }
  table.kv table.kv { margin: 2px 0; }
  .vnull { color: var(--se-muted); } .vnum { color: var(--se-val-num); } .vbool { color: var(--se-val-bool); } .vstr { color: var(--se-val-str); }
  .prewrap { white-space: pre-wrap; }
  td.btncell { text-align: center; vertical-align: middle !important; width: 1%; }
  .cond circle { stroke-width: 2.5; }
  .cond.unmet circle { fill: var(--se-accent-bg); stroke: var(--se-accent); }
  .cond.met circle { fill: var(--se-ok-bg); stroke: var(--se-ok); }
  .cond-label { font-size: 20px; text-anchor: middle; fill: var(--se-fg); pointer-events: none; }
  .doclist a { display: block; padding: 4px 0; }
  a.doclink { color: var(--se-link); cursor: pointer; text-decoration: underline; }
  .docview { font-size: 13.5px; line-height: 1.55; }
  .docview h1, .docview h2, .docview h3 { color: var(--se-accent); }
  .docview code { background: var(--se-raised); padding: 1px 5px; border-radius: 4px; }
  .docview pre { background: var(--se-bg); border: 1px solid var(--se-border); border-radius: 8px; padding: 10px; overflow: auto; }
  .docview a { color: var(--se-link); }
  button.ghost { background: var(--se-raised); color: var(--se-fg); border: 1px solid var(--se-border-strong); border-radius: 8px; padding: 6px 12px; font: inherit; cursor: pointer; }
  #w-details { flex: 1; border-radius: 0; border: 0; }
  .docheck { accent-color: var(--se-accent); cursor: pointer; }
  .docline { display: flex; align-items: center; gap: 6px; padding: 3px 0; }
  .collbody { padding: 4px 10px 8px; }
  .fval { min-width: 0; overflow-wrap: anywhere; line-height: 1.35; }
  /* THE FRONT MATTER SITS TIGHT (owner ruling 2026-07-30). The element
     library spaces a form group for a settings page. A receipt is a dense
     record, and the reader wants more of it on screen at once. */
  vscode-form-group { margin: 0 !important; padding: 0 !important; }
  vscode-form-group vscode-label { line-height: 1.35; }
  /* THE NEXT STATES, one block each. */
  .nextitem { border: 1px solid var(--se-border); margin: 4px 0; }
  .nextitem.open { border-color: var(--se-walk); }
  .nexthead { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 3px 8px; background: var(--se-raised); }
  .nextto { color: var(--se-accent); overflow-wrap: anywhere; }
  vscode-icon.ok { color: var(--vscode-testing-iconPassed, #4a7a55); }
  vscode-icon.no { color: var(--se-muted); }
  .threshold { display: flex; align-items: center; gap: 8px; color: var(--se-muted); font-size: 12px; text-transform: none; letter-spacing: 0; }

  #thr-val { color: var(--se-accent); min-width: 4ch; }
  .thr-help { cursor: pointer; }
  .thr-help:hover { color: var(--se-accent); }
  .thr-track { display: inline-flex; flex-direction: column; align-items: stretch; }
  .thr-notches { position: relative; height: 11px; margin-top: -3px; }
  .thr-notch { position: absolute; transform: translateX(-50%); font-size: 9px; line-height: 1; color: var(--se-muted); cursor: pointer; padding: 1px 3px; }
  .thr-notch:hover { color: var(--se-accent); }
  /* The log used to be the top 42% of a shared column, borderless so it read
     as one surface with the terminal below it. As a card of its own it takes
     the whole card and wears the normal widget border. */
  .log-filter-row { padding: 6px 12px 0; display: flex; gap: 6px; }
  .log-filter-row input { flex: 1 1 50%; min-width: 0; box-sizing: border-box; background: var(--se-bg); border: 1px solid var(--se-border); border-radius: 6px; color: var(--se-fg); font: inherit; font-size: 12px; padding: 4px 8px; }
  .log-panel { font-size: 12px; margin-top: 6px; }
  .logrow { display: flex; gap: 8px; padding: 2px 0; cursor: pointer; border-bottom: 1px dotted var(--se-raised); align-items: baseline; }
  .logrow:hover { background: var(--se-raised); }
  .logrow .lt { color: var(--se-feed-time); flex: 0 0 auto; }
  .logrow .lsrc { flex: 0 0 5.5ch; color: var(--se-feed-src-agent); }
  .logrow .lsrc.human { color: var(--se-feed-src-human); }
  .logrow .lkind { flex: 0 0 6.5ch; }
  .logrow .lkind.k-call { color: var(--se-feed-kind-call); }
  .logrow .lkind.k-update { font-weight: 700; color: var(--se-feed-kind-update); }
  .logrow .lkind.k-note { font-style: italic; color: var(--se-feed-kind-note); }
  .logrow .lkind.k-aq { font-weight: 700; color: var(--se-feed-kind-aq); }
  .aq-q { font-weight: 700; color: var(--se-feed-kind-aq); padding: 6px 0; white-space: pre-wrap; }
  #loadbar { position: fixed; top: 0; left: 0; right: 0; height: 3px; background: var(--se-raised); z-index: 99; }
  #loadbar .fill { height: 100%; width: 30%; background: var(--se-accent); animation: loadslide 1s linear infinite; }
  @keyframes loadslide { 0% { margin-left: -30%; } 100% { margin-left: 100%; } }
  /* A BAR THAT MEASURES SOMETHING (owner ruling, 2026-07-30). Work that can
     count its steps says so, and the fill shows how far it has got. The
     sliding animation is the FALLBACK, for work that genuinely cannot. */
  #loadbar .fill.determinate { animation: none; margin-left: 0; transition: width .18s linear; }
  /* THE PING — the agent's pointing finger (owner, 2026-07-30): v2's pulse,
     made yellow. A card blinks its outline; an SVG node blinks its opacity.
     It PULSES ON, and stays lit while the guide talks about it. */
  .se-ping { outline: 3px solid var(--se-accent); outline-offset: 2px; animation: se-ping-blink 1.6s ease-in-out infinite; }
  .se-ping-svg { animation: se-ping-fade 1.6s ease-in-out infinite; }
  @keyframes se-ping-blink { 50% { outline-color: transparent; } }
  @keyframes se-ping-fade { 50% { opacity: .25; } }
  #loadbar .lmsg { position: fixed; top: 8px; right: 12px; color: var(--se-accent); font-size: 12px; }
  /* A load that never answered is a FAILURE, and the voice paints those red. */
  #loadbar.stalled { cursor: pointer; }
  #loadbar.stalled .fill { background: var(--se-fail); animation: none; width: 100%; }
  #loadbar.stalled .lmsg { color: var(--se-fail); }
  .aq-a { color: var(--se-aq-answer); line-height: 1.5; padding: 4px 0; }
  .logrow .lbrief { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .logrow .lok { flex: 0 0 auto; color: var(--se-ok); }
  .logrow.failed .lok { color: var(--se-fail); }
  .dnode { cursor: pointer; padding: 2px 0; font-size: 13px; }
  .dnode:hover { background: var(--se-raised); }
  .dnode.s-done { color: var(--se-ok); }
  .dnode.s-open { color: var(--se-accent); }
  .dnode.s-obsolete { color: var(--se-dim); text-decoration: line-through; }
  .dnode.s-reverted { color: var(--se-fail); text-decoration: line-through; }
  /* DEFERRED IS NOT KILLED. It is still owed, so it keeps the open colour;
     it is owed SOMEWHERE ELSE, so it leans. Never struck through - the
     strike is what says a point died, and this one did not. */
  .dnode.s-deferred { color: var(--se-accent); font-style: italic; text-decoration: none; }
  .dnode.dactive { font-weight: 700; }
  .dnode.dsel { background: var(--se-raised); }
  .dinfo { margin-top: 10px; border-top: 1px solid var(--se-border); padding-top: 8px; }
  .formfield { width: 100%; min-height: 70px; background: var(--se-bg); border: 1px solid var(--se-border); border-radius: 6px; color: var(--se-fg); font: inherit; font-size: 12.5px; padding: 6px; box-sizing: border-box; margin-top: 4px; }
  .prefill { border: 1px dashed var(--se-accent); border-radius: 6px; padding: 6px 8px; margin: 4px 0; }
  .prefill button { margin-top: 4px; }
  #modal { display: none; position: fixed; inset: 0; background: rgba(20,23,26,.8); z-index: 50; align-items: center; justify-content: center; }
  .modal-box { width: min(760px, 92vw); max-height: 86vh; display: flex; flex-direction: column; background: var(--se-bg-side); border: 1px solid var(--se-border-strong); border-radius: 12px; }
  .modal-body { padding: 12px 16px; overflow: auto; font-size: 13px; }
  a.toollink { color: var(--se-link); text-decoration: underline; cursor: pointer; margin-right: 10px; }
  #toast { position: fixed; left: 14px; bottom: 14px; background: var(--se-raised); border: 1px solid var(--se-border-strong); border-radius: 8px; padding: 8px 14px; color: var(--se-fg); font-size: 12.5px; z-index: 90; display: none; }
  #link-lost { position: fixed; left: 0; right: 0; top: 0; z-index: 99; background: var(--se-lost-bg); color: var(--se-accent); text-align: center; padding: 7px; font-size: 13px; letter-spacing: .04em; }
  #over { position: fixed; inset: 0; background: rgba(20,23,26,.94); z-index: 100; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; }
  #over .over-box { color: var(--se-over); font-size: 62px; font-weight: 800; letter-spacing: .12em; border: 6px solid var(--se-over); border-radius: 18px; padding: 26px 52px; }
  #over .over-sub { color: var(--se-fail); font-size: 15px; }
`;

// EXPORTED so a test can RUN it. This is the mirror's whole client-side
// behaviour and until now nothing executed a line of it: the battery imports
// modules and asserts on strings, so anything that only happens in a browser
// shipped unverified. The reader was the test suite, twice over.
export const SCRIPT = `
// Re-read after every morph — a morph never re-runs a script tag.
let D = JSON.parse(document.getElementById("se-data").textContent);

function jsonTable(v) {
  if (v === null || v === undefined) return '<span class="vnull">null</span>';
  if (typeof v === "number") return '<span class="vnum">' + v + "</span>";
  if (typeof v === "boolean") return '<span class="vbool">' + v + "</span>";
  if (typeof v === "string") {
    const looksLikePath = v.startsWith("project/") && !v.includes(" ") && v.lastIndexOf(".") > v.lastIndexOf("/");
    if (looksLikePath) {
      return '<a class="doclink" data-path="' + v + '">' + v + "</a>";
    }
    const escaped = v.replace(/&/g,"&amp;").replace(/</g,"&lt;");
    // Paragraphs survive the pane: a multi-line string keeps its breaks
    // (HTML collapses raw newlines - the wall-of-text bug, owner 2026-07-28).
    if (v.includes("\\n")) return '<div class="vstr prewrap">' + escaped + "</div>";
    return '<span class="vstr">' + escaped + "</span>";
  }
  if (Array.isArray(v)) {
    if (v.length === 0) return '<span class="vnull">[]</span>';
    const table = '<table class="kv">' + v.map((x, i) => '<tr><td class="k">' + i + '</td><td class="v">' + jsonTable(x) + "</td></tr>").join("") + "</table>";
    if (v.length > 3) return '<details><summary style="cursor:pointer;color:var(--se-muted)">' + v.length + " items</summary>" + table + "</details>";
    return table;
  }
  const keys = Object.keys(v);
  if (keys.length === 0) return '<span class="vnull">{}</span>';
  return '<table class="kv">' + keys.map((k) => '<tr><td class="k">' + k + '</td><td class="v">' + jsonTable(v[k]) + "</td></tr>").join("") + "</table>";
}

const REC_DECS = {};
async function loadRecDecisions() {
  for (const el of document.querySelectorAll(".recdecisions[data-exp]:not([data-loaded])")) {
    el.dataset.loaded = "1";
    try {
      const r = await fetch("/api/recdecisions?exp=" + encodeURIComponent(el.dataset.exp));
      const d = await r.json();
      REC_DECS[el.dataset.exp] = d.visits || [];
      const badge = { open: "●", done: "✓", obsolete: "⊘", reverted: "↩", deferred: "→" };
      el.innerHTML = (d.visits || []).map((v) => {
        const kids = {};
        v.nodes.forEach((n) => { (kids[n.parent || ""] = kids[n.parent || ""] || []).push(n); });
        const tree = (pid, depth) => (kids[pid] || []).map((n) =>
          '<div class="dnode recnode s-' + n.status + '" data-exp="' + escText(el.dataset.exp) + '" data-visit="' + escText(v.visit) + '" data-node="' + n.id + '" style="margin-left:' + depth * 14 + 'px" title="' + n.id + " · " + n.status + '">' + (badge[n.status] || "·") + " " + escText(n.brief) + "</div>" + tree(n.id, depth + 1)
        ).join("");
        return '<details class="visitdec"><summary class="meta" style="cursor:pointer;padding:8px 0 4px">' + escText(v.visit) + "</summary>" + (tree("", 0) || '<div class="meta">no decisions</div>') + '<div class="recinfo"></div></details>';
      }).join("") || '<div class="meta">no decisions recorded</div>';
    } catch (e) {
      el.innerHTML = '<div class="meta">decisions unavailable</div>';
    }
  }
}
// THE VISIT TO-DOS (owner design 2026-07-27): clicking a state shows,
// below its details, one collapsed fold per visit; every item names its
// ORIGIN (planned here | deferred from X | fork). Parked points that have
// not arrived yet get their own fold.
async function loadStateTodos() {
  for (const el of document.querySelectorAll(".statetodos[data-state]:not([data-loaded])")) {
    el.dataset.loaded = "1";
    try {
      const r = await fetch("/api/statetodos?state=" + encodeURIComponent(el.dataset.state));
      const d = await r.json();
      const badge = { open: "●", done: "✓", obsolete: "⊘", reverted: "↩", deferred: "→" };
      const origin = (n) => n.origin === "deferred" && n.trail && n.trail.length > 1 ? "deferred from " + n.trail[n.trail.length - 2] : n.origin === "fork" ? "fork" : "planned here";
      let html = (d.visits || []).map((v) => {
        const items = v.nodes.map((n) =>
          '<div class="dnode s-' + n.status + '" title="' + n.id + " · " + n.status + '">' + (badge[n.status] || "·") + " " + escText(n.brief) + ' <span class="todo-origin">' + escText(origin(n)) + "</span></div>"
        ).join("");
        return '<details class="visitdec"><summary class="meta" style="cursor:pointer;padding:8px 0 4px">to-dos · entry ' + (v.visit.split("@")[1] || "0") + "</summary>" + items + "</details>";
      }).join("");
      if ((d.parked || []).length) {
        html += '<details class="visitdec"><summary class="meta" style="cursor:pointer;padding:8px 0 4px">parked — arrives on entry</summary>' +
          d.parked.map((p) => '<div class="dnode s-deferred">→ ' + escText(p.brief) + ' <span class="todo-origin">' + escText(p.trail && p.trail.length > 1 ? "deferred from " + p.trail[p.trail.length - 2] : "deferred here") + "</span></div>").join("") + "</details>";
      }
      el.innerHTML = html;
    } catch (e) {
      el.innerHTML = "";
    }
  }
}
let DETAIL_TITLE = null;
let DETAIL_HTML = null;
function showDetails(title, html) {
  const el = document.getElementById("details");
  if (!el) {
    // A SOLO CARD HAS NO DETAILS PANE OF ITS OWN. Embedded, details are a
    // surface the HOST owns, so the subject travels out to it. Dropping it
    // here is what made clicking a state do nothing at all.
    // Being IN A FRAME is the test, not the embed flag: this runs before the
    // flag is initialised, and a frame is exactly when a host is listening.
    if (window.parent !== window) window.parent.postMessage({ se: "details", title: title, html: html }, "*");
    return;
  }
  // NOTHING CHANGED, NOTHING MOVES. rebind() re-derives this pane after every
  // morph. Rewriting identical markup flickered it and threw the reader's
  // scroll position away while they were reading. The pane carries
  // data-morph-ignore for exactly this reason; this is the same guard on the
  // path the morph does not own.
  if (DETAIL_TITLE === title && DETAIL_HTML === html) return;
  const sameSubject = DETAIL_TITLE === title;
  DETAIL_TITLE = title;
  DETAIL_HTML = html;
  // Same subject with new content keeps the reader's place. A DIFFERENT
  // subject starts at the top, because a position in the old one means
  // nothing here.
  const top = sameSubject ? el.scrollTop : 0;
  document.getElementById("details-title").textContent = title;
  el.innerHTML = html;
  el.scrollTop = top;
  queueMicrotask(() => { void loadRecDecisions(); void loadStateTodos(); });
}
// THE MODAL — one surface over the grayed page (forms, tool calls,
// escape). Click outside or ✕ returns to the layout untouched.
function openModal(title, html) {
  const m = document.getElementById("modal");
  if (!m) return;
  document.getElementById("modal-title").textContent = title;
  document.getElementById("modal-body").innerHTML = html;
  m.style.display = "flex";
}
function closeModal() { const m = document.getElementById("modal"); if (m) m.style.display = "none"; }
let TOAST_TIMER = null;
function toast(msg) {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.style.display = "block";
  clearTimeout(TOAST_TIMER);
  TOAST_TIMER = setTimeout(() => { t.style.display = "none"; }, 1800);
}
document.addEventListener("click", (ev) => {
  if (ev.target && ev.target.id === "modal") { closeModal(); return; }
  const mc = ev.target.closest ? ev.target.closest("#modal-close") : null;
  if (mc) closeModal();
});
// THE PARITY LAW — a state's human-callable tools as links; the modal
// takes the arguments and shows the result in place.
const HUMAN_TOOLS = {
  se_seed_expedition: [{ name: "kind", hint: "spike | fix | explore" }, { name: "goal", hint: "what this expedition is after", long: true }],
  se_seed_iteration: [{ name: "goal", hint: "what this iteration is after", long: true }, { name: "vision", hint: "roughly how — what done looks like", long: true }, { name: "inputs", hint: "context refs, comma-separated: an expedition id, note refs" }],
  se_reload: [],
  // No arguments — it just answers. It lives HERE and nowhere else (owner
  // ruling 2026-07-28): human-runnable lane tools are offered through the
  // legal-tools links, per state. None of them earns bespoke chrome. It had
  // its own header button, which the owner never found among the crumbs, the
  // slider and the escape control sharing that row.
  se_survey: [],
  se_exp_close: [{ name: "merge", hint: "true = apply: merge to trunk (default); false = dismiss: archive unmerged" }],
  se_note_drain: [{ name: "ref", hint: "the note's ref (note-…) — the feed shows it" }, { name: "disposition", hint: "done | obsolete | carried | backlog" }, { name: "where", hint: "where it landed or lives on — backlog REQUIRES it: ready when …" }],
};
function toolModal(name) {
  const fields = HUMAN_TOOLS[name] || [];
  let html = fields.map((f) =>
    '<div style="padding:6px 0 2px"><b>' + f.name + '</b></div><div class="comment-text">' + escText(f.hint) + "</div>" +
    (f.long ? '<textarea class="formfield toolarg" data-arg="' + f.name + '"></textarea>' : '<input class="formfield toolarg" style="min-height:0" data-arg="' + f.name + '">')
  ).join("");
  html += '<div style="padding:10px 0"><button class="primary runtool" data-tool="' + name + '">run</button></div><div id="tool-result"></div>';
  openModal("tool · " + name, html);
}
document.addEventListener("click", async (ev) => {
  const tl = ev.target.closest ? ev.target.closest(".toollink") : null;
  if (tl) {
    // A tool link exists everywhere the tool is listed; it WORKS only
    // where the state gate allows — elsewhere, a short toast.
    const legal = D.packet.legal_tools;
    const enabled = legal === "all" || (Array.isArray(legal) && legal.includes(tl.dataset.tool));
    if (enabled) toolModal(tl.dataset.tool); else toast("tool disabled");
    return;
  }
  const rt = ev.target.closest ? ev.target.closest(".runtool") : null;
  if (rt) {
    const args = {};
    document.querySelectorAll(".toolarg").forEach((i) => { if (i.value !== "") args[i.dataset.arg] = i.value; });
    const r = await fetch("/tool", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: rt.dataset.tool, args }) });
    const data = await r.json();
    const out = document.getElementById("tool-result");
    if (out) out.innerHTML = jsonTable(data);
    refreshLog();
    return;
  }
  const eb = ev.target.closest ? ev.target.closest("#escape-btn") : null;
  if (eb) {
    openModal("escape — to idle", '<div class="comment-text">The machine is left standing; a later continue re-enters it. The reason is recorded as a failure.</div><textarea class="formfield" id="escape-reason" placeholder="why the walk cannot continue"></textarea><div style="padding:10px 0"><button class="primary" id="escape-go">escape</button></div>');
    return;
  }
  const eg = ev.target.closest ? ev.target.closest("#escape-go") : null;
  if (eg) {
    const reason = (document.getElementById("escape-reason") || {}).value || "";
    await fetch("/escape", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ reason }) });
    location.href = "/";
    return;
  }
});
let CURRENT = (D.describe.active && D.describe.active[0]) ? D.describe.active[0].split("/").pop() : null;
let WALK_HERE = D.viewingWalk;
function nextTable(id, s) {
  const here = WALK_HERE && id === CURRENT;
  // THE NEW WAY (owner ruling 2026-07-30): the host's own elements, the same
  // ones the facts and the pull already use. A bordered table nested inside
  // another bordered table was the last of the old rendering left in here.
  const field = (k, v) => (v === undefined || v === null || v === "") ? ""
    : '<vscode-form-group variant="horizontal"><vscode-label>' + k + "</vscode-label>"
      + '<div class="fval">' + escText(String(v)) + "</div></vscode-form-group>";
  return s.next.map((n) => {
    const unlocked = here && s.exit_met && n.enter_met;
    // The locked tooltip NAMES what is missing — never a bare "not met".
    const exitMiss = s.exit ? Object.entries(s.exit).filter(([, c]) => !c.met).map(([k]) => "condition " + k) : [];
    const title = unlocked
      ? "tick: leave " + id + ", enter " + n.to
      : !s.exit_met
        ? "leaving " + id + " waits on:\\n" + (exitMiss.join("\\n") || "its exit conditions")
        : "entering " + n.to + " waits on:\\n" + ((n.missing || []).join("\\n") || "its entry conditions");
    // The walk moves on the agent's pull. Nothing here drives it.
    const btn = here ? '<span class="meta" title="' + escText(title) + '">' + (unlocked ? "open" : "waiting") + "</span>" : "";
    return '<div class="nextitem' + (unlocked ? " open" : "") + '">'
      + '<div class="nexthead"><span class="nextto">' + escText(n.to) + "</span>" + btn + "</div>"
      + field("role", n.role) + field("guard", n.guard) + field("statement", n.statement)
      + "</div>";
  }).join("");
}
// THE CHECK IS THE READER'S PROOF, AND IT IS PER VERSION — an edited doc
// unchecks itself. A doc named by a CONDITION is not always in that state's
// own pulled list, and looking it up only there left the box permanently
// unchecked however often it was clicked (found live 2026-07-30). The
// session's checked list is the truth, and it is already version-scoped.
function docChecked(p) {
  return p.checked === true || (D.checkedDocs || []).indexOf(p.path) >= 0;
}
function docRow(p) {
  // The link sits BESIDE the box, never inside its label: a label swallows
  // the click, and the reader would open nothing while checking by accident.
  const on = docChecked(p);
  return '<div class="docline">'
    + '<vscode-checkbox class="docheck" data-path="' + p.path + '"' + (on ? " checked disabled" : "")
    + ' title="' + (on ? "read (this version)" : "check = I read this version") + '"></vscode-checkbox>'
    + '<a class="doclink" data-path="' + p.path + '">' + p.path + "</a></div>";
}
function pulledView(pulled) {
  const bySource = {};
  for (const p of pulled) for (const src of p.sources) (bySource[src] ??= []).push(p);
  // The engine calls the always-on set "root". The reader sees a PULL, and
  // that is the word the fold wears (owner ruling 2026-07-30).
  const SRC_LABEL = { root: "pull" };
  return Object.entries(bySource).map(([srcName, docs]) => {
    const done = docs.filter(docChecked).length;
    // Open while there is still something to read; folded once it is done.
    return '<vscode-collapsible title="' + escText(SRC_LABEL[srcName] || srcName) + '" description="' + done + "/" + docs.length + ' read"' + (done < docs.length ? " open" : "") + ">"
      + '<div class="collbody">' + docs.map(docRow).join("") + "</div></vscode-collapsible>";
  }).join("");
}
// The state's own fields. A scalar is one labelled row; prose folds into its
// own section, because guidance is paragraphs and does not belong in a cell.
function factsView(o) {
  const PROSE = { statement: 1, guidance: 1 };
  let rows = "";
  let prose = "";
  for (const k in o) {
    const v = o[k];
    if (v === undefined || v === null || v === "") continue;
    if (PROSE[k]) {
      prose += '<vscode-collapsible title="' + escText(k) + '" open><div class="collbody comment-detail">' + escText(String(v)) + "</div></vscode-collapsible>";
      continue;
    }
    // A boolean is a state, not a word. The host's own pass icon carries it,
    // so the colour follows the reader's theme rather than our palette.
    let cell;
    if (typeof v === "boolean") cell = '<vscode-icon name="' + (v ? "pass" : "circle-slash") + '" class="' + (v ? "ok" : "no") + '" label="' + (v ? "yes" : "no") + '"></vscode-icon>';
    else if (typeof v === "object") cell = escText(JSON.stringify(v));
    else cell = escText(String(v));
    rows += '<vscode-form-group variant="horizontal"><vscode-label>' + escText(k) + "</vscode-label>"
      + '<div class="fval">' + cell + "</div></vscode-form-group>";
  }
  return rows + prose;
}
function stateDetail(id) {
  const s = D.states[id] ?? {};
  const bare = Object.assign({}, s); delete bare.next; delete bare.pulled; delete bare.script; delete bare.was_filled; delete bare.legal_tools;
  let html = factsView(bare);
  // Legal tools — human-callable ones are LINKS everywhere they appear
  // (parity law); a link outside its state just toasts "tool disabled".
  const tools = [...new Set(s.legal_tools || [])];
  if (tools.length > 0) {
    const link = (t) => '<a class="toollink" data-tool="' + t + '">' + t + "</a>";
    const line = (t) => '<div class="docline">' + (HUMAN_TOOLS[t] !== undefined ? link(t) : escText(t)) + "</div>";
    // "all" stays written as all — and EXPANDS into the human-callable
    // links (parity law), the same fold the pull uses.
    const all = tools.includes("all");
    const inner = all ? Object.keys(HUMAN_TOOLS).map(line).join("") : tools.map(line).join("");
    html += '<vscode-collapsible title="legal tools" description="' + (all ? "all — the human-callable set" : tools.length + " listed") + '">'
      + '<div class="collbody">' + inner + "</div></vscode-collapsible>";
  }
  if (s.pulled && s.pulled.length > 0) {
    // One fold per source rather than a fold inside a fold — the reader is
    // after the documents, not the nesting.
    html += '<div class="meta" style="padding:8px 0 4px" title="derived by the machine, not authored">pulled</div>' + pulledView(s.pulled);
  }
  if (s.archive_record !== undefined) {
    const e = s.archive_record;
    // ONE rendering, in the table (owner ruling 2026-07-27): the ruling is
    // its own key; report is a LINK opening the big modal (ctrl: tab,
    // shift: window). No duplicate prose below.
    if (!e) html += '<div class="vnull">no record found</div>';
    else {
      html += '<table class="kv">'
        + '<tr><td class="k">expedition</td><td class="v">' + escText(e.id) + "</td></tr>"
        + (e.status ? '<tr><td class="k">status</td><td class="v">' + escText(e.status) + "</td></tr>" : "")
        + ((e.ruling || e.report) ? '<tr><td class="k">ruling</td><td class="v">' + escText(e.ruling || e.report) + "</td></tr>" : "")
        + '<tr><td class="k">report</td><td class="v"><a class="replink" data-exp="' + escText(e.id) + '" data-path="project/spec/expeditions/' + escText(e.id) + '/report.md" data-title="report · ' + escText(e.id) + '" title="click: modal · ctrl-click: new tab · shift-click: new window">report.md</a></td></tr>'
        + "</table>";
      // The decision history, one expandable section per visit — the same
      // tree the log click renders, collapsed by default (owner ruling).
      html += '<div class="recdecisions" data-exp="' + escText(e.id) + '"><div class="meta">loading decisions…</div></div>';
    }
  }
  html += '<div class="statetodos" data-state="' + id + '"></div>';
  if (s.next && s.next.length > 0) {
    html += '<div class="meta" style="padding:8px 0 4px">next</div>' + nextTable(id, s);
  }
  if (WALK_HERE && id === CURRENT && s.kind === "end" && (!s.next || s.next.length === 0) && D.describe.breadcrumb.length > 1) {
    const parent = D.describe.breadcrumb[0];
    html += '<div class="meta" style="padding:8px 0 4px">next</div>' +
      '<div class="nextitem open"><div class="nexthead"><span class="nextto">return to ' + escText(parent) + "</span></div></div>";
  }
  return html;
}
// THE PAGE UPDATES IN PLACE (owner ruling 2026-07-28). A full reload cost
// the reader their scroll, their selection and whatever they were typing.
// The old workaround carried the view, the open pane and the open folds
// through the URL and still lost the rest. Now an unchanged node is never
// replaced, so there is nothing left to restore.
//
// Subtrees the CLIENT fills carry data-morph-ignore. The server sends them
// empty, so morphing into them would wipe what the client just rendered.
function sameNode(a, b) {
  if (a.nodeType !== b.nodeType) return false;
  if (a.nodeType !== 1) return true;
  return a.tagName === b.tagName && (a.id || "") === (b.id || "");
}
function morph(from, to) {
  if (from.nodeType !== 1) { if (from.nodeValue !== to.nodeValue) from.nodeValue = to.nodeValue; return; }
  if (from.hasAttribute("data-morph-ignore")) return;
  // A pane the reader has dragged owns its own width — the server never
  // sent that style, so morphing would silently snap it back.
  const keepsStyle = from.hasAttribute("data-keep-style");
  for (const a of to.attributes) if (!(keepsStyle && a.name === "style") && from.getAttribute(a.name) !== a.value) from.setAttribute(a.name, a.value);
  for (const a of [...from.attributes]) if (!to.hasAttribute(a.name) && !(keepsStyle && a.name === "style")) from.removeAttribute(a.name);
  // A control under the reader's hand stays theirs until they leave it.
  if (from.tagName === "INPUT" && from !== document.activeElement && to.hasAttribute("value")) from.value = to.getAttribute("value");
  const byId = new Map();
  for (const c of from.children) if (c.id !== "") byId.set(c.id, c);
  let cur = from.firstChild;
  for (const t of [...to.childNodes]) {
    let match = t.nodeType === 1 && t.id !== "" ? byId.get(t.id) : undefined;
    if (match === undefined && cur !== null && sameNode(cur, t)) match = cur;
    if (match === undefined) { from.insertBefore(document.importNode(t, true), cur); continue; }
    if (match !== cur) from.insertBefore(match, cur);
    morph(match, t);
    cur = match.nextSibling;
  }
  while (cur !== null) { const next = cur.nextSibling; from.removeChild(cur); cur = next; }
}
// Everything derived FROM a render has to be derived again after one.
function rebind() {
  const blob = document.getElementById("se-data");
  if (blob) D = JSON.parse(blob.textContent);
  CURRENT = (D.describe.active && D.describe.active[0]) ? D.describe.active[0].split("/").pop() : null;
  WALK_HERE = D.viewingWalk;
  // Without this the next poll compares against the OLD position forever.
  ACTIVE_AT_RENDER = JSON.stringify(D.describe.active || []);
  restoreViewBox();
  if (CURRENT_DETAIL) { const dp = detailFor(CURRENT_DETAIL); showDetails(dp[0], dp[1]); }
}
let refreshInFlight = false;
// ONE ACTION, ONE LOAD (owner 2026-07-28). A tick both navigates this page
// and wakes /events, so the outgoing page used to fetch itself again on its
// way out — the archive visibly loaded twice. Once we are leaving, we leave.
let navigatingAway = false;
// THE READER KEEPS THEIR PLACE (owner ruling 2026-07-28, extended 2026-07-29).
// Changing WHICH MACHINE is on screen says nothing about what they had open
// beside it, nor about which card they had promoted. A view URL carrying only
// the view throws both away.
//
// The card half was missed because the card matrix landed after this rule did: the
// detail param was carried, the card param did not exist yet, and nobody came
// back. Entering a sub-state demoted the machine out of the main slot under
// the reader's hand.
//
// EVERY pinned place goes through here, so the next one added is carried by
// construction rather than by somebody remembering.
// THE READER'S PLACE, DECLARED ONCE. Every surface the reader can put
// somewhere gets ONE entry here. The card bug happened because this list
// lived in people's heads and in three separate hand-written copies: detail
// was carried, card arrived a month later, and the two never met.
//
// Add a param here and every navigation carries it by construction. A test
// refuses any param the client pins that is not registered.
// Embedded in a host (the VS Code webview): the flag arrives on the iframe
// URL and rides every navigation, so the server keeps serving the embedded
// card set instead of resetting to the standalone one.
const EMBED_Q = new URLSearchParams(location.search).has("embed");
const PLACE = [
  ["detail", () => CURRENT_DETAIL],
  ["card", () => CARD_NOW],
  // Frozen is a place too: a snapshot window that follows a link inside
  // itself stays a snapshot. A live window reports null and never picks it
  // up, so the flag spreads nowhere it does not belong.
  ["frozen", () => (FROZEN ? "1" : null)],
  ["embed", () => (EMBED_Q ? "1" : null)],
];
/** Carry the place onto a URL the reader is NAVIGATING to. */
function withPlace(url) {
  const u = new URL(url, location.href);
  for (const p of PLACE) {
    const v = p[1]();
    if (v && !u.searchParams.has(p[0])) u.searchParams.set(p[0], v);
  }
  return u.pathname + u.search;
}
/** Pin the place onto the URL of the page the reader is ALREADY on. */
function pinPlace(q) {
  for (const p of PLACE) {
    const v = p[1]();
    if (v) q.set(p[0], v); else q.delete(p[0]);
  }
}
// A POPPED-OUT CARD IS A SNAPSHOT (owner ruling 2026-07-29). Two things
// were wrong with the pop-out, and they are separate.
//
// It carried NOTHING. The button holds a URL baked in when the page was
// drawn, so the new tab asked for "the details card" with no subject named
// and the server answered with its own default. Meanwhile the live card was
// showing whatever the reader last clicked, which lives only in this
// browser. A reader looking at an answered question got a state.
//
// And it must not follow the walk. The reader pops several out to compare
// them side by side, so each one holds what it was opened on. Frozen means
// no event stream and no refresh, ever.
const FROZEN = new URLSearchParams(location.search).has("frozen");
function frozenUrl(url) {
  const u = new URL(withPlace(url), location.href);
  u.searchParams.set("frozen", "1");
  return u.pathname + u.search;
}
// A SOLO CARD STAYS A CARD. Going to "/" replaced one card with the WHOLE
// mirror inside it — which is what broke double-clicking into a sub-machine,
// and what left the bar waiting on a page that was never the right one.
// Only the mirror's own root is rewritten; a document link still goes where
// it says.
function keepCard(url) {
  const here = location.pathname;
  if (!here.startsWith("/widget/")) return url;
  if (url !== "/" && url.slice(0, 2) !== "/?") return url;
  const q = url.indexOf("?");
  return here + (q < 0 ? "" : url.slice(q));
}
function navigateTo(url, label) {
  navigatingAway = true;
  showLoading(label);
  url = withPlace(keepCard(url));
  hostTrace("navigateTo " + url);
  // This document is about to be replaced, so the host must stop posting
  // into it. A post that lands in a dying document is swallowed whole.
  if (window.parent !== window) window.parent.postMessage({ se: "nav" }, "*");
  location.href = url;
}
// The crumbs are plain anchors, so a solo card would follow one straight out
// to the whole mirror. Capture them and route them through the same rule.
document.addEventListener("click", (ev) => {
  if (!location.pathname.startsWith("/widget/")) return;
  const a = ev.target.closest ? ev.target.closest("a[href^='/?']") : null;
  hostTrace("anchor hit=" + (a === null ? "none" : String(a.getAttribute("href"))));
  if (a === null) return;
  ev.preventDefault();
  navigateTo(a.getAttribute("href"), "loading " + (a.textContent || "view"));
}, true);
async function refresh(detail) {
  if (FROZEN) return;
  if (navigatingAway) return;
  if (detail !== undefined) CURRENT_DETAIL = detail;
  const q = new URLSearchParams(location.search);
  // THE VIEW HOLDS STILL (owner ruling 2026-07-28): finishing a state is
  // data change, and data change never jumps the reader — every refresh
  // pins the machine being looked at explicitly.
  q.set("view", D.viewed.id);
  pinPlace(q);
  const qs = q.toString();
  const url = location.pathname + (qs ? "?" + qs : "");
  history.replaceState(null, "", url);
  if (refreshInFlight) return;
  refreshInFlight = true;
  try {
    const r = await fetch(url);
    const doc = new DOMParser().parseFromString(await r.text(), "text/html");
    // THE STYLESHEET MORPHS TOO (found live 2026-07-29). It lives in <head>,
    // which the morph never touched, so a tab open since before a CSS change
    // kept the OLD sheet for as long as it stayed open. Anything shipped after
    // that matched no rule at all — and an unstyled SVG path fills black.
    // The reader saw it; the agent, on a fresh tab, could not reproduce it.
    const freshCss = doc.querySelector("head style");
    const liveCss = document.querySelector("head style");
    if (freshCss && liveCss && liveCss.textContent !== freshCss.textContent) liveCss.textContent = freshCss.textContent;
    morph(document.body, doc.body);
    rebind();
  } catch (e) {
    location.href = url; // a failed morph must never strand the reader
  } finally {
    refreshInFlight = false;
    hideLoading(); // THE LOAD SETTLED — win or lose, the bar goes
  }
}
// VS CODE EMBED. The hosting webview says hello with a theme message: the
// palette follows the editor from then on, and record links open as real
// files THERE. Help stays a detail HERE — the ux rule. The flag survives
// in-page navigation; the host re-sends the theme on every iframe load.
let EMBED = false;
try { EMBED = sessionStorage.getItem("se-embed") === "1"; } catch { EMBED = false; }
window.addEventListener("message", (ev) => {
  const d = ev.data;
  if (!d) return;
  // HELP IS A DETAIL, NEVER A BUTTON (ux rule). A host with an icon strip
  // has no room to explain itself, so what an icon means arrives HERE, in
  // the details pane, the one place the reader already looks for meaning.
  // The host saw the walk move. Embedded, this replaces the event stream.
  if (d.se === "wake") {
    // No event stream in a frame — the wake stands in for it, so the same
    // alive-driven work (the pull landing above all) runs here too.
    void fetch("/api/alive").then((r) => r.json()).then((a) => applyAlive(a)).catch(() => {});
    refresh();
    return;
  }
  if (d.se === "help") { hostTrace("page got help"); showDetails(d.title, d.html); hostAck(); return; }
  // A LOG LINE CLICKED IN THE HOST'S TERMINAL. The record is rendered HERE,
  // by the same code the mirror uses, so a host never grows a second
  // renderer for what this page already knows how to draw.
  if (d.se === "logref") {
    hostTrace("page got logref " + d.ref + " on " + location.pathname);
    void openLogDetail(d.ref).then(() => { hostTrace("logref rendered " + d.ref); hostAck(); }, (e) => hostTrace("logref FAILED " + String((e && e.message) || e)));
    return;
  }
  if (d.se !== "theme") return;
  EMBED = true;
  try { sessionStorage.setItem("se-embed", "1"); } catch { /* storage denied — the flag just will not survive navigation */ }
  const vars = d.vars || {};
  for (const k in vars) if (vars[k]) document.documentElement.style.setProperty(k, vars[k]);
});
function cssPalette(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}
function embedOpen(path) {
  if (!EMBED || !path) return false;
  window.parent.postMessage({ se: "open", path: path }, "*");
  return true;
}
// THE HOST HOLDS THE SUBJECT UNTIL THIS ARRIVES. Without it the relay had to
// infer from a load event whether this page was still there to receive.
function hostAck() {
  if (window.parent !== window) window.parent.postMessage({ se: "ack" }, "*");
}
document.addEventListener("click", async (ev) => {
  const c = ev.target.closest ? ev.target.closest(".docheck") : null;
  if (c) {
    // FEEDBACK FIRST. The old handler cancelled the click and waited on a
    // round trip, so the box sat unchecked for a second and then a full
    // refresh rebuilt the pane under the reader, who lost what they had open.
    if (c.hasAttribute("disabled")) return;
    const path = c.dataset.path;
    c.setAttribute("checked", "");
    c.setAttribute("disabled", "");
    if (!D.checkedDocs) D.checkedDocs = [];
    if (D.checkedDocs.indexOf(path) < 0) D.checkedDocs.push(path);
    // No refresh here. The poll sees the log grow and redraws in its own
    // time; forcing it now is what threw the reader out of the details pane.
    await fetch("/check", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ path: path }) });
    return;
  }
  const rp = ev.target.closest ? ev.target.closest(".runpre") : null;
  if (rp) {
    // Grey IMMEDIATELY — no second run behind an unresponsive button; the
    // server coalesces stray extra clicks into the one run anyway.
    rp.disabled = true; rp.classList.add("locked"); rp.textContent = "running…";
    await fetch("/script", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ state: rp.dataset.state || CURRENT }) });
    refresh();
    return;
  }
  const rpl = ev.target.closest ? ev.target.closest(".replink") : null;
  if (rpl) {
    if (embedOpen(rpl.dataset.path)) return;
    const expQ = rpl.dataset.exp ? "&exp=" + encodeURIComponent(rpl.dataset.exp) : "";
    const pageUrl = "/doc?path=" + encodeURIComponent(rpl.dataset.path) + expQ + "&page=1";
    if (ev.ctrlKey || ev.metaKey) { window.open(pageUrl, "_blank"); return; }
    if (ev.shiftKey) { window.open(pageUrl, "_blank", "popup,width=900,height=700"); return; }
    const r = await fetch("/doc?path=" + encodeURIComponent(rpl.dataset.path) + expQ);
    const d = await r.json();
    openModal(rpl.dataset.title || rpl.dataset.path, '<div class="docview">' + d.html + "</div>");
    return;
  }
  const dl = ev.target.closest ? ev.target.closest(".doclink") : null;
  if (dl) { openDoc(dl.dataset.path, dl.dataset.return || CURRENT_DETAIL || (CURRENT ? "state:" + CURRENT : "comment")); return; }
  const back = ev.target.closest ? ev.target.closest(".back") : null;
  if (back) { const [t, h] = detailFor(back.dataset.return); showDetails(t, h); return; }
});
function condRows(id, dict, standing) {
  return Object.entries(dict).map(([key, c]) => {
    let row = '<div style="padding:6px 0 2px"><a class="doclink" data-path="' + c.note + '">' + key + "</a> ";
    row += c.met ? '<span style="color:var(--se-ok)">✓ met</span>' : '<span style="color:var(--se-accent)">! unmet</span>';
    row += "</div>";
    if (key === "script") {
      if (c.args.length > 0) row += jsonTable(c.args);
      const s = D.states[id] ?? {};
      const sc = s.script || { ran: false, ok: false, output: "", running: false };
      // The button greys IMMEDIATELY on click and stays grey while running
      // and after success — it re-enables only on a FAILED run.
      let btn;
      if (sc.running) btn = '<button class="primary go locked" disabled>running…</button>';
      else if (!standing) btn = '<button class="primary go locked" disabled title="enter the state to run the script">run</button>';
      else if (sc.ran && sc.ok) btn = '<button class="primary go locked" disabled title="exit 0 — the condition is met">✓ ran</button>';
      else btn = '<button class="primary runpre" data-state="' + id + '">' + (sc.ran ? "re-run" : "run") + "</button>";
      row += '<div style="padding:6px 0">' + btn + "</div>";
      if (sc.running) row += '<div style="color:var(--se-accent)">running — the page follows; the result lands here</div>';
      else if (sc.ran) row += '<div style="color:' + (sc.ok ? "var(--se-ok)" : "var(--se-fail)") + ';white-space:pre-wrap;font-size:12px">' + sc.output.replace(/&/g,"&amp;").replace(/</g,"&lt;") + "</div>";
      else row += '<div style="color:var(--se-muted)">not run yet</div>';
    } else if (key === "evidence_form") {
      // The A3 page: open it in the details pane — fill, confirm prefills,
      // manage files, set done. One button per named template.
      row += c.args.map((n) => '<div style="padding:4px 0"><button class="ghost openform" data-form="' + n + '">open form: ' + n + "</button></div>").join("");
    } else if (key === "read") {
      // One checkbox per doc — the human's proof, once per version. (The
      // agent proves the same docs by sending hashes on its tick.)
      const s = D.states[id] ?? {};
      const pulled = s.pulled || [];
      row += c.args.map((p) => docRow(pulled.find((d) => d.path === p) || { path: p, checked: false })).join("");
    } else if (c.args.length > 0) {
      row += jsonTable(c.args);
    }
    return row;
  }).join("");
}
function condDetail(id) {
  const s = D.states[id] ?? {};
  const standing = WALK_HERE && id === CURRENT;
  let html = "";
  if (s.exit) html += '<div class="meta" style="padding:4px 0">exit</div>' + condRows(id, s.exit, standing);
  if (s.entry) html += '<div class="meta" style="padding:4px 0">entry</div>' + condRows(id, s.entry, standing);
  // A form-bearing state's prose lives in its form — repeating the guidance
  // here would fork the one truth the details already render.
  if (!s.has_form) html += '<div class="comment-detail">' + (s.guidance || "").replace(/&/g,"&amp;").replace(/</g,"&lt;") + "</div>";
  return ["conditions · " + id, html];
}
// THE FORM SURFACE — an evidence form rendered to fill: required fields
// as textareas, each unconfirmed prefill with its OWN confirm button (the
// prefill law: one confirmation per prefill, never in bulk), the evidence
// folder one click away, done runs the same lint the agent's tick runs.
// A form renders into the MODAL by default; "details" pins it to the
// details surface instead — which is what a detached form window is.
function presentForm(name, into, title, html, machine) {
  // The machine rides INSIDE the detail key, so a popped-out window
  // re-resolves the same form wherever its own view happens to stand.
  // The pane title stays EMPTY — the sheet body carries the one heading.
  if (into === "details") { CURRENT_DETAIL = "form:" + name + (machine ? "@" + machine : ""); showDetails("", html); return; }
  openModal(title, html);
}
// THE STATE FORM'S SHEET (owner rulings 2026-08-04): boxes from the A3
// shape, fields with their template chips, the existing save/confirm/done
// buttons, plus the portable copy's export and ingest.
function sfOne(f, fl) {
  const name = f.form;
  const tpl = (f.field_templates || {})[fl.name] || "free-form";
  const tm = (f.template_meta || {})[tpl] || {};
  let s = '<div style="border:1px solid var(--se-line,#888);border-radius:4px;padding:7px 10px;margin:7px 0">';
  s += '<span style="float:right;font-size:11.5px;color:var(--se-accent)">template: ' + escText(tpl) + "</span>";
  s += "<b>" + escText(fl.name) + "</b>" + (fl.required ? ' <span style="color:var(--se-fail);font-size:11px">required</span>' : ' <span class="meta">optional</span>');
  s += '<div class="meta">' + escText(fl.description || "") + "</div>";
  (fl.prefills || []).forEach(function (p, i) {
    s += '<div class="prefill"><div class="comment-text">prefill — unconfirmed:</div><div>' + escText(p) + '</div><button class="primary confirmpre" data-form="' + name + '" data-machine="' + escText(f.machine || "") + '" data-field="' + escText(fl.name) + '" data-index="' + i + '">confirm</button></div>';
  });
  // A choice template edits as its dropdown plus the reasoning — stored
  // as one section: the option on the first line, the prose below.
  if (tm.editor === "choice") {
    const lines = (fl.content || "").split("\\n");
    const first = (lines[0] || "").trim();
    s += '<div><select class="formchoice" data-field="' + escText(fl.name) + '"><option value=""></option>' + (tm.options || []).map(function (o) { return "<option" + (o === first ? " selected" : "") + ">" + escText(o) + "</option>"; }).join("") + "</select></div>";
    s += '<textarea class="formfield" data-field="' + escText(fl.name) + '">' + escText(lines.slice(1).join("\\n")) + "</textarea></div>";
    return s;
  }
  s += '<textarea class="formfield" data-field="' + escText(fl.name) + '">' + escText(fl.content || "") + "</textarea></div>";
  return s;
}
// A collapsible box — the same truth, folded for a narrow pane.
function sfBox(title, inner, open) {
  return '<details' + (open ? " open" : "") + ' style="margin:6px 0"><summary style="cursor:pointer;font-weight:600">' + title + "</summary>" + inner + "</details>";
}
function renderStateForm(f) {
  const name = f.form;
  const mach = f.machine || viewedMachine();
  const fld = function (n) {
    const hit = (f.fields || []).filter(function (q) { return q.name === n; })[0];
    return hit || { name: n, description: "", required: false, content: "", prefills: [] };
  };
  // A real heading; every header item its own line, at the body text size.
  let h = '<div style="font-size:17px;font-weight:700;padding:2px 0 6px">Evidence form <span style="font-weight:400;color:var(--se-muted)">/ ' + escText(name) + "</span></div>";
  h += '<table class="kv" style="font-size:12.5px">' + Object.keys(f.header || {}).map(function (k) { return "<tr><td>" + escText(k) + "</td><td>" + escText(String(f.header[k] || "____")) + "</td></tr>"; }).join("") + "</table>";
  h += sfBox("Description", '<div class="comment-text">' + escText(f.description || "") + "</div>", false);
  if (f.motivation) h += sfBox("Motivation", '<div class="comment-text">' + escText(f.motivation) + "</div>", false);
  h += sfBox("Current situation", sfOne(f, fld("current_situation")), false);
  h += sfBox("Inputs", (f.inputs || []).map(function (i) {
    const on = (f.checked || []).indexOf(i.label) >= 0;
    const label = i.path ? '<a class="doclink" data-path="' + escText(i.path) + '">' + escText(i.label) + "</a>" : "<b>" + escText(i.label) + "</b>";
    return '<div style="font-size:12.5px"><input type="checkbox" class="sfcheck" data-form="' + name + '" data-machine="' + escText(mach) + '" data-label="' + escText(i.label) + '"' + (on ? " checked" : "") + "> " + label + (i.entry ? ' <span style="color:var(--se-fail);font-size:11px">before entry</span>' : "") + ' <span class="meta">' + escText(i.description || "") + "</span></div>";
  }).join(""), false);
  h += sfBox("Evidence", (f.fields || []).filter(function (x) { return x.name !== "current_situation" && x.name !== "follow_up"; }).map(function (x) { return sfOne(f, x); }).join(""), false);
  h += sfBox("Follow-up" + (f.follow_up_label ? " / " + escText(f.follow_up_label) : ""), sfOne(f, fld("follow_up")), false);
  if (f.problems && f.problems.length) h += '<div style="color:var(--se-accent);padding:6px 0">' + f.problems.map(escText).join("<br>") + "</div>";
  if (f.met) h += '<div style="color:var(--se-ok);padding:6px 0">✓ complete — the claim stands; the gate judges it</div>';
  h += '<div style="padding:10px 0"><button class="primary sfexport" data-form="' + name + '" data-machine="' + escText(mach) + '">export</button> ';
  h += '<button class="primary sfimport" data-form="' + name + '">import</button><input type="file" accept=".html,text/html" style="display:none" class="ingestform" data-form="' + name + '" data-machine="' + escText(mach) + '"> ';
  h += '<button class="primary saveform" data-form="' + name + '" data-machine="' + escText(mach) + '">save</button> ';
  h += '<button class="primary doneform" data-form="' + name + '" data-machine="' + escText(mach) + '" title="marks the claim complete — the gate judges it">submit</button></div>';
  return h;
}
async function seIngest(inp, name) {
  const file = inp.files && inp.files[0];
  if (!file) return;
  const html = await file.text();
  await formPost("/form/ingest", { name: name, html: html, machine: inp.dataset.machine || viewedMachine() });
  showFormAgain(name, inp.dataset.machine);
}
// Delegated, like every other control — an inline handler needs quote
// nesting the fixer is free to normalise, and one stripped escape killed
// the whole page script at parse.
document.addEventListener("change", function (ev) {
  const inp = ev.target.closest ? ev.target.closest(".ingestform") : null;
  if (inp) { void seIngest(inp, inp.getAttribute("data-form")); return; }
  // A checked input saves QUIETLY — no re-render, so the reader's folds
  // and scroll hold still and the box already shows its new state.
  const cb = ev.target.closest ? ev.target.closest(".sfcheck") : null;
  if (cb) {
    const labels = [];
    document.querySelectorAll('.sfcheck[data-form="' + cb.dataset.form + '"]').forEach(function (x) { if (x.checked) labels.push(x.dataset.label); });
    void formPost("/form/save", { name: cb.dataset.form, fields: { inputs_checked: labels.join("\\n") }, machine: cb.dataset.machine || viewedMachine() });
  }
});
// The machine on display resolves a form name — without it, two records'
// same-named states would collide and the walk's machine would shadow the view.
function viewedMachine() { return (D.viewed && D.viewed.id) || ""; }
async function showForm(name, into, machine) {
  machine = machine || viewedMachine();
  const r = await fetch("/api/form?name=" + encodeURIComponent(name) + "&machine=" + encodeURIComponent(machine));
  const f = await r.json();
  // The body carries the one "Evidence form" heading — the pane title
  // stays the bare state name so nothing repeats.
  if (f.state_form) { presentForm(name, into, name, renderStateForm(f), machine); return; }
  if (f.kind === "rejected" || f.error) {
    // Plain words at the human — never raw rejection JSON.
    presentForm(name, into, "form · " + name,
      '<div class="comment-detail">' + escText(f.expected || f.error || "") + "</div>" +
      '<div class="meta">' + escText(f.got || "") + "</div>" +
      (f.remedy && f.remedy.note ? '<div class="comment-text">' + escText(f.remedy.note) + "</div>" : ""), machine);
    return;
  }
  const ro = f.preview === true;
  let html = '<div class="comment-text">' + escText(f.statement || "") + "</div>";
  // The GRAPH-IS-EVIDENCE gate, visible to the human: the page cannot
  // pass over open decision points — they surface under problems below.
  html += '<div class="meta">gate: every open decision point of this record must be resolved (done · obsolete · revert · defer) before this page passes</div>';
  html += '<div class="meta">' + escText(f.instance) + (ro ? " · template preview — filling happens inside an expedition" : " · status: " + escText(f.status) + (f.met ? ' · <span style="color:var(--se-ok)">✓ passes</span>' : "")) + "</div>";
  (f.fields || []).forEach((fl) => {
    html += '<div style="padding:8px 0 2px"><b>' + escText(fl.name) + "</b>" + (fl.required ? ' <span style="color:var(--se-accent)">required</span>' : "") + "</div>";
    html += '<div class="comment-text">' + escText(fl.description) + "</div>";
    if (ro) return;
    (fl.prefills || []).forEach((p, i) => {
      html += '<div class="prefill"><div class="comment-text">prefill — unconfirmed:</div><div>' + escText(p) + '</div><button class="primary confirmpre" data-form="' + name + '" data-field="' + escText(fl.name) + '" data-index="' + i + '">confirm</button></div>';
    });
    html += '<textarea class="formfield" data-field="' + escText(fl.name) + '">' + escText(fl.content) + "</textarea>";
  });
  if (!ro) {
    html += '<div class="meta" style="padding:6px 0 2px">files — <a class="doclink openfolder" data-form="' + name + '">open ' + escText(f.evidence_dir) + "</a></div>";
    (f.files || []).forEach((fi) => { html += "<div>" + (fi.present ? "✓ " : '<span style="color:var(--se-fail)">✗ </span>') + escText(fi.name) + "</div>"; });
    if (f.problems && f.problems.length) html += '<div style="color:var(--se-accent);padding:6px 0">' + f.problems.map(escText).join("<br>") + "</div>";
    html += '<div style="padding:10px 0"><button class="primary saveform" data-form="' + name + '">save</button> <button class="primary doneform" data-form="' + name + '" title="sets status done and runs the lint">done</button></div>';
  }
  presentForm(name, into, "form · " + name, html, machine);
}
// A save or confirm re-renders the form WHERE IT STANDS — the modal, or
// the details surface a detached window is pinned to.
function showFormAgain(name, machine) {
  void showForm(name, CURRENT_DETAIL && CURRENT_DETAIL.indexOf("form:" + name) === 0 ? "details" : undefined, machine);
}
async function formPost(path, body) {
  await fetch(path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
}
// One collector for save and submit: the textareas, then every choice
// select folded onto its field — the option first, the reasoning below.
function sfCollect() {
  const fields = {};
  document.querySelectorAll(".formfield").forEach(function (t) { fields[t.dataset.field] = t.value; });
  document.querySelectorAll(".formchoice").forEach(function (s) { fields[s.dataset.field] = (s.value + "\\n" + (fields[s.dataset.field] || "")).trim(); });
  return fields;
}
document.addEventListener("click", async (ev) => {
  const of = ev.target.closest ? ev.target.closest(".openform") : null;
  if (of) { void showForm(of.dataset.form); return; }
  const cp = ev.target.closest ? ev.target.closest(".confirmpre") : null;
  if (cp) { await formPost("/form/confirm", { name: cp.dataset.form, field: cp.dataset.field, index: Number(cp.dataset.index), machine: cp.dataset.machine || viewedMachine() }); showFormAgain(cp.dataset.form, cp.dataset.machine); return; }
  const ex = ev.target.closest ? ev.target.closest(".sfexport") : null;
  if (ex) {
    // A download navigation — the browser's own save dialog names the place.
    const a = document.createElement("a");
    a.href = "/form/export?name=" + encodeURIComponent(ex.dataset.form) + "&machine=" + encodeURIComponent(ex.dataset.machine || viewedMachine());
    a.download = "";
    a.click();
    return;
  }
  const im = ev.target.closest ? ev.target.closest(".sfimport") : null;
  if (im) {
    const inp = document.querySelector('.ingestform[data-form="' + im.dataset.form + '"]');
    if (inp) inp.click();
    return;
  }
  const sv = ev.target.closest ? ev.target.closest(".saveform") : null;
  if (sv) {
    await formPost("/form/save", { name: sv.dataset.form, fields: sfCollect(), machine: sv.dataset.machine || viewedMachine() });
    showFormAgain(sv.dataset.form, sv.dataset.machine);
    return;
  }
  const dn2 = ev.target.closest ? ev.target.closest(".doneform") : null;
  if (dn2) {
    await formPost("/form/save", { name: dn2.dataset.form, fields: sfCollect(), machine: dn2.dataset.machine || viewedMachine() });
    await formPost("/form/done", { name: dn2.dataset.form, machine: dn2.dataset.machine || viewedMachine() });
    showFormAgain(dn2.dataset.form, dn2.dataset.machine);
    return;
  }
  const ofo = ev.target.closest ? ev.target.closest(".openfolder") : null;
  if (ofo) { await formPost("/form/folder", { name: ofo.dataset.form }); return; }
});

async function openDoc(path, returnKey) {
  const r = await fetch("/doc?path=" + encodeURIComponent(path));
  const d = await r.json();
  // The subject is recorded, so a detached details window shows THIS
  // document rather than whatever was clicked before it.
  CURRENT_DETAIL = "doc:" + path;
  showDetails(path, '<div style="padding:2px 0 10px"><button class="ghost back" data-return="' + (returnKey || "comment") + '">‹ back</button></div><div class="docview">' + d.html + "</div>");
}
function detailFor(key) {
  if (key.startsWith("log:")) { void openLogDetail(key.slice(4)); return ["log entry", '<div class="meta">loading…</div>']; }
  if (key.startsWith("doc:")) { void openDoc(key.slice(4), "comment"); return [key.slice(4), '<div class="meta">loading…</div>']; }
  if (key.startsWith("form:")) { const fm = key.slice(5).split("@"); void showForm(fm[0], "details", fm[1]); return ["", '<div class="meta">loading…</div>']; }
  if (key.startsWith("cond:")) return condDetail(key.slice(5));
  if (key === "comment") {
    const txt = (D.comment || "").replace(/&/g,"&amp;").replace(/</g,"&lt;");
    return ["machine: " + D.viewed.id, '<div class="comment-detail">' + txt + "</div>" + jsonTable(D.viewed)];
  }
  if (key.startsWith("state:")) {
    const id = key.slice(6);
    // ONE TRUTH, TWO RENDERS (owner ruling 2026-08-04): a state with an
    // evidence form shows THE FORM as its details — the old detail view
    // stays only for form-less states.
    if ((D.states[id] || {}).has_form) { void showForm(id, "details"); return ["", '<div class="meta">loading…</div>']; }
    return ["state: " + id, stateDetail(id)];
  }
  return [key, jsonTable({})];
}
document.addEventListener("click", async (ev) => {
  const cs = ev.target.closest ? ev.target.closest("#cur-state") : null;
  if (cs) {
    // The quick way home: jump the view to the walk's machine, whole
    // drawing visible (the saved pan is dropped so the state shows).
    sessionStorage.removeItem("se-vb-" + cs.dataset.machine);
    navigateTo("/?view=" + encodeURIComponent(cs.dataset.machine), "loading " + cs.dataset.machine);
    return;
  }
});
let CURRENT_DETAIL = null;
document.addEventListener("click", (ev) => {
  const arrow = ev.target.closest ? ev.target.closest(".crumb-arrow") : null;
  document.querySelectorAll(".crumb-arrow.open").forEach((a) => { if (a !== arrow) a.classList.remove("open"); });
  if (arrow) { arrow.classList.toggle("open"); return; }
  const g = ev.target.closest ? ev.target.closest(".clickable") : null;
  if (g && g.dataset.detail) {
    CURRENT_DETAIL = g.dataset.detail;
    // The engine mirrors the selection, so a control in ANOTHER surface
    // (the sidebar's SET TARGET) can act on the state whose details show.
    if (g.dataset.detail.startsWith("state:")) void fetch("/selected", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ state: g.dataset.detail.slice(6), machine: viewedMachine() }) });
    const [t, h] = detailFor(g.dataset.detail); showDetails(t, h);
  }
});
// Double-click a sub-machine state: enter it as a VIEWER (walk unmoved).
document.addEventListener("dblclick", (ev) => {
  const g = ev.target.closest ? ev.target.closest(".clickable") : null;
  hostTrace("dblclick hit=" + (g === null ? "none" : "clickable") + " sub=" + (g === null ? "-" : String(g.dataset.sub)));
  if (g && g.dataset.sub) navigateTo("/?view=" + encodeURIComponent(g.dataset.sub), "loading " + g.dataset.sub);
});

// Only real widget expanders — the modal's ✕ shares the style, not the job.
// Delegated, so a morph may replace a widget head without losing the button.
document.addEventListener("click", (ev) => {
  const btn = ev.target.closest ? ev.target.closest(".expand[data-widget]") : null;
  if (!btn) return;
  ev.stopPropagation();
  const url = btn.dataset.url;
  // A NEW window every time, never a named one. The whole point is several
  // standing side by side, and a shared name reuses the first one forever.
  //
  // NOT INSIDE THE EDITOR. VS Code sandboxes its webview without allow-popups,
  // and a nested frame can only NARROW a sandbox, never widen one — so
  // window.open there does nothing at all. Branching on the modifier anyway
  // made ctrl-click and shift-click dead keys on this button. Falling through
  // to fullscreen is the in-place equivalent, and it already works.
  if (!EMBED && (ev.ctrlKey || ev.metaKey)) { window.open(frozenUrl(url), "_blank"); return; }
  if (!EMBED && ev.shiftKey) { window.open(frozenUrl(url), "_blank", "popup,width=1100,height=800"); return; }
  const w = document.getElementById(btn.dataset.widget);
  if (w) { if (document.fullscreenElement === w) document.exitFullscreen(); else w.requestFullscreen(); }
});

// Pan/zoom survives every refresh, per machine — a walk-driven update must
// not snap the reader's viewport back to the whole drawing. A morph rewrites
// the viewBox attribute, so the saved view is re-applied after every one.
function restoreViewBox() {
  const s = document.getElementById("machine-svg");
  if (!s) return;
  try {
    const saved = JSON.parse(sessionStorage.getItem("se-vb-" + D.viewed.id) || "null");
    if (saved && saved.w > 0) { const v = s.viewBox.baseVal; v.x = saved.x; v.y = saved.y; v.width = saved.w; v.height = saved.h; }
  } catch (e) { /* a broken save never blocks the drawing */ }
}
const svg = document.getElementById("machine-svg");
if (svg) {
  let vb = svg.viewBox.baseVal;
  const VB_KEY = "se-vb-" + D.viewed.id;
  restoreViewBox();
  const saveVb = () => { try { sessionStorage.setItem(VB_KEY, JSON.stringify({ x: vb.x, y: vb.y, w: vb.width, h: vb.height })); } catch (e) { /* storage full — the view just re-fits */ } };
  svg.addEventListener("wheel", (ev) => {
    ev.preventDefault();
    const scale = ev.deltaY > 0 ? 1.12 : 1 / 1.12;
    const pt = svg.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM().inverse());
    vb.x = p.x - (p.x - vb.x) * scale;
    vb.y = p.y - (p.y - vb.y) * scale;
    vb.width *= scale; vb.height *= scale;
    saveVb();
  }, { passive: false });
  let panning = null;
  svg.addEventListener("mousedown", (ev) => { panning = { x: ev.clientX, y: ev.clientY, vx: vb.x, vy: vb.y }; svg.classList.add("panning"); });
  window.addEventListener("mousemove", (ev) => {
    if (!panning) return;
    const r = svg.getBoundingClientRect();
    vb.x = panning.vx - (ev.clientX - panning.x) * (vb.width / r.width);
    vb.y = panning.vy - (ev.clientY - panning.y) * (vb.height / r.height);
  });
  window.addEventListener("mouseup", () => { if (panning) saveVb(); panning = null; svg.classList.remove("panning"); });
}

// A PANE THE READER SIZED KEEPS THAT SIZE (owner ruling 2026-07-28).
//
// Walking into a sub-state is a full page load, and a width set by dragging
// is an inline style, which no page load survives. So every entry into a
// sub-machine snapped the whole layout back to its defaults — the machine
// drawing included, because it takes whatever the two columns leave it.
//
// A pane size is a PREFERENCE, not a view of something: it is about how the
// reader likes to work, not about which machine is on screen. So it outlives
// the tab in localStorage, while the per-machine viewBox stays in
// sessionStorage, where a view of one drawing belongs.
const PANE_KEY = "se-pane-";
function savePaneSize(pane, axis, px) {
  try { localStorage.setItem(PANE_KEY + pane.id + "-" + axis, String(Math.round(px))); } catch (e) { /* storage full — the pane just re-defaults */ }
}
function restorePaneSizes() {
  document.querySelectorAll(".divider").forEach((dv) => {
    const pane = document.getElementById(dv.dataset.pane);
    if (pane === null) return;
    const axis = dv.dataset.axis === "y" ? "height" : "width";
    let px = 0;
    try { px = Number(localStorage.getItem(PANE_KEY + pane.id + "-" + axis) || "0"); } catch (e) { /* no storage — the defaults stand */ }
    if (!(px > 0)) return;
    // A size saved on a wider screen must not push the rest of the layout
    // off a narrower one, so the stored value is a wish, not a command.
    const room = axis === "width" ? window.innerWidth : (pane.parentElement === null ? px : pane.parentElement.clientHeight);
    pane.style[axis] = Math.max(140, Math.min(px, room - 120)) + "px";
  });
}
restorePaneSizes();

// Each divider names the pane it moves and which side that pane sits on:
// a divider on the pane's far side grows it as you drag TOWARDS the pane.
// data-axis y makes it a horizontal splitter moving height instead of width.
document.querySelectorAll(".divider").forEach((dv) => {
  const pane = document.getElementById(dv.dataset.pane);
  if (pane === null) return;
  const vert = dv.dataset.axis === "y";
  const away = dv.dataset.grow === "right" || dv.dataset.grow === "bottom";
  let drag = null;
  dv.addEventListener("mousedown", (ev) => {
    drag = { at: vert ? ev.clientY : ev.clientX, size: vert ? pane.offsetHeight : pane.offsetWidth };
    ev.preventDefault();
  });
  window.addEventListener("mousemove", (ev) => {
    if (drag === null) return;
    const moved = (vert ? ev.clientY : ev.clientX) - drag.at;
    const want = drag.size + (away ? -moved : moved);
    if (!vert) { pane.style.width = Math.max(160, want) + "px"; return; }
    // The pane above must survive. Nothing caps this at half — dragging past
    // half is exactly what the owner asked for.
    const room = pane.parentElement === null ? want : pane.parentElement.clientHeight - 120;
    pane.style.height = Math.max(140, Math.min(want, room)) + "px";
  });
  window.addEventListener("mouseup", () => {
    if (drag === null) return;
    drag = null;
    savePaneSize(pane, vert ? "height" : "width", vert ? pane.offsetHeight : pane.offsetWidth);
  });
});

// THE CARDS. Promotion swaps a class and two CSS variables. Nothing moves, so
// every widget stays live — which is the whole reason the layout is one grid.
const CARDBLOB = document.getElementById("se-cards");
const CARDS = CARDBLOB === null ? { list: [], now: "" } : JSON.parse(CARDBLOB.textContent);
let CARD_NOW = new URLSearchParams(location.search).get("card") || CARDS.now;
let CARD_PREV = null;
// Chat is promoted once, the first time a host answers. Not on every poll.
let CHAT_LED = false;
function cardCell(id) {
  const i = CARDS.list.findIndex((c) => c.id === id);
  const at = i < 0 ? 0 : i;
  return { col: 3 + (at % 2), row: 1 + Math.floor(at / 2) };
}
function applyCards() {
  for (const c of CARDS.list) {
    const el = document.getElementById("card-" + c.id);
    if (el === null) continue;
    const cell = cardCell(c.id);
    el.style.setProperty("--col", String(cell.col));
    el.style.setProperty("--row", String(cell.row));
    el.classList.toggle("main", c.id === CARD_NOW);
  }
  // The legend takes the vacated slot, so where it sits IS the answer to
  // "which card is up front". The jump is the indicator, not a cost.
  const leg = document.getElementById("card-legend");
  if (leg !== null) {
    const cell = cardCell(CARD_NOW);
    leg.style.setProperty("--col", String(cell.col));
    leg.style.setProperty("--row", String(cell.row));
  }
}
function promoteCard(id) {
  if (!CARDS.list.some((c) => c.id === id)) return;
  // The same key again is the way back — the loop is chat, look, chat.
  if (id === CARD_NOW) { if (CARD_PREV !== null) promoteCard(CARD_PREV); return; }
  CARD_PREV = CARD_NOW;
  CARD_NOW = id;
  applyCards();
  // Pinned in the URL like view and detail, so the next morph agrees with
  // what the reader just did, and an F5 lands on the same card.
  const q = new URLSearchParams(location.search);
  q.set("card", id);
  history.replaceState(null, "", location.pathname + "?" + q.toString());
}
// NUMBER KEYS, NOT FUNCTION KEYS (owner 2026-07-29). F1, F5, F6, F11 and F12
// belong to the browser, and a laptop needs an Fn chord for them. A key never
// fires while the reader is typing — chat is a card you type in.
addEventListener("keydown", (ev) => {
  if (ev.ctrlKey || ev.metaKey || ev.altKey) return;
  const t = ev.target;
  if (t !== null && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
  // T AIMS THE BLUE LINE at whatever state the reader has open. It only sets
  // the destination; the walk still waits to be told to go, which is the
  // whole point of a target being separate from a tick.
  if (ev.key === "t" || ev.key === "T") {
    if (typeof CURRENT_DETAIL !== "string" || !CURRENT_DETAIL.startsWith("state:")) return;
    const to = CURRENT_DETAIL.slice(6);
    ev.preventDefault();
    void fetch("/target", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ to }) });
    return;
  }
  if (!/^[0-9]$/.test(ev.key)) return;
  const card = CARDS.list[Number(ev.key) - 1];
  if (card === undefined) return;
  ev.preventDefault();
  promoteCard(card.id);
});
// THE NUMBER IS A CONTROL, NOT A LABEL (owner 2026-07-29). Whatever the key
// does, clicking the badge does — including the press-again toggle back.
addEventListener("click", (ev) => {
  const badge = ev.target !== null && ev.target.closest !== undefined ? ev.target.closest(".cardnum") : null;
  if (badge === null) return;
  const card = badge.closest(".card");
  if (card === null) return;
  ev.preventDefault();
  ev.stopPropagation();
  promoteCard(card.id.replace(/^card-/, ""));
});
// 58/42 to start (owner 2026-07-29), then wherever the reader drags it,
// remembered exactly the way every other pane already is.
const CARDS_KEY = PANE_KEY + "cards-main";
const cardsEl = document.querySelector(".cards");
if (cardsEl !== null) {
  let saved = 0;
  try { saved = Number(localStorage.getItem(CARDS_KEY) || "0"); } catch (e) { /* no storage — the default stands */ }
  if (saved > 0) cardsEl.style.setProperty("--main-w", Math.max(240, Math.min(saved, window.innerWidth - 260)) + "px");
  const cdv = document.getElementById("div-cards");
  let cdrag = false;
  if (cdv !== null) {
    cdv.addEventListener("mousedown", (ev) => { cdrag = true; ev.preventDefault(); });
    window.addEventListener("mousemove", (ev) => {
      if (!cdrag) return;
      cardsEl.style.setProperty("--main-w", Math.max(240, Math.min(ev.clientX, window.innerWidth - 260)) + "px");
    });
    window.addEventListener("mouseup", () => {
      if (!cdrag) return;
      cdrag = false;
      const px = parseInt(cardsEl.style.getPropertyValue("--main-w"), 10);
      if (px > 0) { try { localStorage.setItem(CARDS_KEY, String(px)); } catch (e) { /* storage full */ } }
    });
  }
}
// A deep link names the subject — a popped-out or bookmarked pane must
// show what it was opened on, so the walk's default never runs over it.
const DETAIL_PARAM = new URLSearchParams(location.search).get("detail");
if (DETAIL_PARAM) { CURRENT_DETAIL = DETAIL_PARAM; const dp = detailFor(DETAIL_PARAM); showDetails(dp[0], dp[1]); }
else if (CURRENT && D.states[CURRENT] && WALK_HERE) { CURRENT_DETAIL = "state:" + CURRENT; const wdp = detailFor("state:" + CURRENT); showDetails(wdp[0], wdp[1]); }
// A frozen window says so. Not a warning — a quiet line, so a reader with
// one live pane and four snapshots can tell which is which at a glance.
if (FROZEN) {
  const fbar = document.createElement("div");
  fbar.id = "frozen-bar";
  fbar.textContent = "frozen — this window keeps what it was opened on and does not follow the walk";
  fbar.style.cssText = "padding:6px 10px;font-size:12px;opacity:0.7;border-bottom:1px solid rgba(128,128,128,0.3)";
  document.body.insertBefore(fbar, document.body.firstChild);
}
// Open folds need no carrying now: the morph never replaces them.

// THE UNIFIED FEED (owner ruling, v2 i9 notes; built in v3): every hand's
// act, one line each — time | src | brief | result. Updates bold, notes
// italic, refusals red. Click a line: the full record (request first, then
// response, one combined object) in details; an update line: the decision
// graph of its state visit.
function escText(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }
const logPanel = document.getElementById("log-rows");
let LOG_ROWS = [];
let lastActs = null;
let DECISION_GRAPH = null;
let LOG_HTML = null;
function renderLog() {
  if (!logPanel) return;
  const fEl = document.getElementById("log-filter");
  const f = fEl ? fEl.value.toLowerCase() : "";
  const rows = LOG_ROWS.filter((r) => !f || (r.ts + " " + r.src + " " + r.type + " " + r.brief + " " + (r.clause || "")).toLowerCase().includes(f));
  // NEWEST ON TOP (owner ruling): the feed reads downward into the past;
  // the scroll pins to the top while the reader is there.
  const stick = logPanel.scrollTop < 40;
  const html = rows.slice().reverse().map((r) =>
    '<div class="logrow ' + r.type + (r.ok ? "" : " failed") + '" data-ref="' + r.ref + '">' +
      '<span class="lt">' + (r.pending ? r.ts.slice(5, 10) : r.ts.slice(11, 19)) + "</span>" +
      '<span class="lsrc ' + r.src + '">' + r.src + "</span>" +
      '<span class="lkind k-' + r.type + '">' + r.type + "</span>" +
      '<span class="lbrief">' + escText(r.brief) + "</span>" +
      '<span class="lok">' + (r.ok ? "✓" : "✗ " + (r.clause || "")) + "</span>" +
    "</div>").join("") || '<div class="meta">no acts' + (f ? " match the filter" : " this session yet") + "</div>";
  // NOTHING CHANGED, NOTHING MOVES. The feed polls constantly, and it used to
  // rewrite itself whole every time. A reader scrolled down into the past was
  // snapped back to the top by a poll that found nothing new — the same defect
  // as the details pane, on a surface that repaints far more often.
  if (html === LOG_HTML) return;
  LOG_HTML = html;
  const top = logPanel.scrollTop;
  logPanel.innerHTML = html;
  // Sticking to the top is the reader's place TOO, when that is where they are.
  logPanel.scrollTop = stick ? 0 : top;
}
async function refreshLog() {
  if (!logPanel) return;
  try {
    const r = await fetch("/api/log");
    const d = await r.json();
    LOG_ROWS = d.rows || [];
    renderLog();
  } catch (e) { /* the alive poll owns liveness verdicts */ }
}
if (logPanel) {
  refreshLog();
  const fEl = document.getElementById("log-filter");
  if (fEl) fEl.addEventListener("input", renderLog);
  // Help is a detail: touching a control explains it in the details pane.
  if (fEl) fEl.addEventListener("focus", () => showDetails("the feed filter", '<div class="comment-detail">Substring match over time, source, type, brief and clause. One example per filter kind:</div>' +
    '<div style="padding:2px 0 2px 14px"><code>note</code> — pending notes only</div>' +
    '<div style="padding:2px 0 2px 14px"><code>call</code> — tool calls</div>' +
    '<div style="padding:2px 0 2px 14px"><code>update</code> — decision-graph updates</div>' +
    '<div style="padding:2px 0 2px 14px"><code>human</code> — the human hand</div>' +
    '<div style="padding:2px 0 2px 14px"><code>agent</code> — the agent hand</div>' +
    '<div style="padding:2px 0 2px 14px"><code>SE-C-113</code> — refusals by clause</div>' +
    '<div style="padding:2px 0 2px 14px"><code>15:2</code> — a time window (hh:mm prefix)</div>' +
    '<div style="padding:2px 0 2px 14px"><code>tick</code> — any word in the brief</div>'));
  // THE TWO LINE EDITS ARE PANEL PARAMETERS NOW, so they arrive with the bar
  // and the log widget no longer writes a second pair of its own.
  const nEl = document.getElementById("note-body");
  if (nEl) {
    nEl.addEventListener("focus", () => showDetails("drop a note", '<div class="comment-detail">A stray — an idea, a bug, a better way. Enter captures it to the inbox with your hand stamped; a retro drains it later.</div>'));
    nEl.addEventListener("keydown", async (ev2) => {
      if (ev2.key !== "Enter" || nEl.value.trim() === "") return;
      const pri = document.querySelector('.param-choice[data-key="note_priority"]');
      await fetch("/note", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text: nEl.value, priority: pri === null ? "could" : pri.value }) });
      nEl.value = "";
      refreshLog();
    });
  }
}
async function openLogDetail(ref) {
  CURRENT_DETAIL = "log:" + ref;
  hostTrace("openLogDetail asking for " + ref);
  const r = await fetch("/api/log?ref=" + encodeURIComponent(ref));
  hostTrace("openLogDetail status " + r.status + " for " + ref);
  const rec = await r.json();
  hostTrace("openLogDetail parsed " + ref + " tool=" + String(rec.tool) + " err=" + String(rec.error));
  if (rec.tool === "se_update" && rec.args) { await showUpdateDetail(rec); return; }
  if ((rec.tool === "se_note" || rec.tool === "mirror_note") && rec.args) { showDetails("note · " + ((rec.response && rec.response.captured) || rec.ref), jsonTable({ at: rec.ts, text: rec.args.text, pending: "until a retro drains it" })); return; }
  if (rec.text !== undefined && rec.tool === undefined) { showDetails("note · " + rec.ref, jsonTable({ at: rec.at, text: rec.text, pending: "until a retro drains it" })); return; }
  if (rec.tool === "se_answer" && rec.args) {
    // The aq click shows BOTH, as prose — never the raw call record.
    showDetails("aq · answered question",
      '<div class="aq-q">' + escText(String(rec.args.question || "")) + "</div>" +
      '<div class="aq-a prewrap">' + escText(String(rec.args.answer || "")) + "</div>");
    return;
  }
  showDetails("log · " + (rec.tool || ref), jsonTable({ at: rec.ts, request: { tool: rec.tool, args: rec.args }, response: rec.response === undefined ? null : rec.response, duration_ms: rec.duration_ms }));
}
async function showDecisions(visit, sel) {
  const r = await fetch("/api/decisions?visit=" + encodeURIComponent(visit));
  DECISION_GRAPH = await r.json();
  renderDecisions(sel);
}
function decisionsHtml(sel) {
  const g = DECISION_GRAPH;
  if (!g) return "";
  const kids = {};
  g.nodes.forEach((n) => { (kids[n.parent || ""] = kids[n.parent || ""] || []).push(n); });
  const badge = { open: "●", done: "✓", obsolete: "⊘", reverted: "↩", deferred: "→" };
  function tree(pid, depth) {
    return (kids[pid] || []).map((n) =>
      '<div class="dnode s-' + n.status + (n.id === g.active ? " dactive" : "") + (n.id === sel ? " dsel" : "") + '" data-node="' + n.id + '" style="margin-left:' + depth * 14 + 'px" title="' + n.id + " · " + n.status + '">' + badge[n.status] + " " + escText(n.brief) + "</div>" + tree(n.id, depth + 1)
    ).join("");
  }
  let html = tree("", 0) || '<div class="meta">no checklist stands at ' + escText(g.visit) + "</div>";
  if (sel) {
    const n = g.nodes.find((x) => x.id === sel);
    if (n) html += '<div class="dinfo">' + jsonTable(Object.assign({ id: n.id, brief: n.brief, status: n.status }, n.resolution ? { resolution: n.resolution } : {}, { opened: n.at }, n.closed_at ? { closed: n.closed_at } : {})) + "</div>";
  }
  return html;
}
function renderDecisions(sel) {
  if (!DECISION_GRAPH) return;
  showDetails("decisions · " + DECISION_GRAPH.visit, decisionsHtml(sel));
}
// A CLICKED UPDATE SHOWS WHAT IT CHANGED, always.
//
// It used to jump straight to the visit's tree and show nothing else. So an
// update recorded where no checklist stands — a bare update, a refused one,
// a plan on a state nobody had planned — opened on "no decisions recorded"
// and read as broken. Which kind of update you clicked decided whether the
// pane said anything, which is exactly backwards.
//
// The op itself comes first now, from the log record, so a line always
// explains itself. The tree follows underneath when there is one, with the
// point this update touched selected.
async function showUpdateDetail(rec) {
  const a = rec.args || {};
  const res = rec.response || {};
  const refused = a.refused === true || rec.ok === false;
  const rows = {};
  rows.op = refused ? "refused" : (a.op || "update");
  rows.rode_on = a.via;
  if (a.visit) rows.at = a.visit;
  if (a.node) rows.node = a.node;
  if (a.brief) rows.brief = a.brief;
  if (a.to) rows.deferred_to = a.to;
  if (Array.isArray(a.items)) rows.items = a.items;
  if (res.active) rows.now_active = res.active;
  if (res.open !== undefined) rows.still_open = res.open;
  if (res.nudge) rows.nudge = res.nudge;
  if (refused) rows.why = (res.expected ? String(res.expected) : "") + (res.got ? " — got " + String(res.got) : "") || "the narration was refused; the call it rode on still landed";
  rows.at_time = rec.ts;
  let html = '<div class="dinfo">' + jsonTable(rows) + "</div>";
  if (a.visit) {
    try {
      const r = await fetch("/api/decisions?visit=" + encodeURIComponent(a.visit));
      DECISION_GRAPH = await r.json();
      html += decisionsHtml(a.node || res.active || null);
    } catch (e) { html += '<div class="meta">the checklist could not be read: ' + escText(String((e && e.message) || e)) + "</div>"; }
  }
  showDetails("update · " + rows.op + (a.node ? " " + a.node : ""), html);
}
// FEEDBACK WITHIN A SECOND (owner law 2026-07-28): anything that can take
// longer shows loading feedback at once.
//
// THE BAR OWNS ITS LIFETIME (owner ruling 2026-07-28). It used to rely on
// the navigation that followed to replace the whole page. Morphing then
// replaced navigation, and a bar nobody hid simply stayed up. A bar that
// outlives its load is worse than none: the reader learns to ignore it, and
// it can no longer warn them when something really is slow. So every load
// carries a token, settles exactly once, and cannot outlive its deadline.
let loadToken = 0;
let loadTimer = null;
// A HOST DRAWS ITS OWN PROGRESS. Framed inside an editor, the host already
// has a progress affordance of its own, and two bars for one wait is one too
// many. The page REPORTS that it is busy; the host decides how to show it.
// The page's half of the trace. Nobody can watch a webview run, so it says
// what it just did and the host writes it down.
function hostTrace(what) {
  if (window.parent !== window) window.parent.postMessage({ se: "trace", text: what }, "*");
}
// A THROW IN HERE IS INVISIBLE otherwise. There is no console anybody can
// read from outside, so a failure would look exactly like a control that
// simply does nothing — which is the hardest fault to chase.
window.addEventListener("error", (e) => hostTrace("ERROR " + (e.message || "?") + " @" + (e.lineno || 0)));
window.addEventListener("unhandledrejection", (e) => hostTrace("REJECTED " + String((e.reason && e.reason.message) || e.reason || "?")));
// WHICH PAGE THIS ACTUALLY IS. A navigation that fires and then lands on the
// wrong thing looks identical, from outside, to one that never fired.
hostTrace("loaded " + location.pathname + location.search);
function hostBusy(on, label) {
  if (window.parent !== window) window.parent.postMessage({ se: "busy", on: on, label: label || "" }, "*");
}
function hideLoading() {
  loadToken++; // any timer still holding the old token is now a no-op
  if (loadTimer !== null) { clearTimeout(loadTimer); loadTimer = null; }
  const el = document.getElementById("loadbar");
  if (el !== null) el.remove();
  hostBusy(false);
}
function showLoading(label) {
  hideLoading(); // one load at a time; a second start supersedes the first
  hostBusy(true, label);
  if (window.parent !== window) return;
  const mine = loadToken;
  const el = document.createElement("div");
  el.id = "loadbar";
  el.innerHTML = '<div class="fill"></div><div class="lmsg"></div>';
  el.querySelector(".lmsg").textContent = label || "loading";
  document.body.appendChild(el);
  // NOTHING SPINS FOREVER. If nobody settles this load, say so — an honest
  // failure beats a confident bar in front of a page that finished long ago.
  loadTimer = setTimeout(() => {
    if (loadToken !== mine) return;
    const cur = document.getElementById("loadbar");
    if (cur === null) return;
    cur.classList.add("stalled");
    cur.querySelector(".lmsg").textContent = (label || "loading") + " — no answer; click to retry";
  }, 8000);
}
// THE ENGINE'S OWN WORK drives the same bar: a running script reports
// "##progress done total label" and the fill follows it. Boot's checks are
// the first customer — nobody should watch a still page and guess.
function showProgress(label, done, total) {
  if (window.parent !== window) { hostBusy(true, label + " — " + done + "/" + total); return; }
  let el = document.getElementById("loadbar");
  if (el === null) { showLoading(label); el = document.getElementById("loadbar"); }
  if (el === null) return;
  // Progress ARRIVING cancels the stall timer: something is plainly alive.
  if (loadTimer !== null) { clearTimeout(loadTimer); loadTimer = null; }
  el.classList.remove("stalled");
  const fill = el.querySelector(".fill");
  fill.classList.add("determinate");
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  fill.style.width = pct + "%";
  el.querySelector(".lmsg").textContent = label + " — " + done + "/" + total + " (" + pct + "%)";
}
// A page that was restored, or navigated back to, has no load in flight —
// whatever it was showing when the reader left it.
addEventListener("pageshow", hideLoading);
addEventListener("popstate", hideLoading);
document.addEventListener("click", (ev) => {
  const stalled = ev.target.closest ? ev.target.closest("#loadbar.stalled") : null;
  if (stalled !== null) { hideLoading(); location.reload(); return; }
  const a = ev.target.closest ? ev.target.closest('a[href*="?view="]') : null;
  if (a === null) return;
  // SERVER-RENDERED LINKS NEVER PASS THROUGH navigateTo. The crumb chain and
  // its menu are plain anchors, and the server cannot know which card the
  // reader promoted or what they have open. So the place is stitched on here,
  // at the click, before the browser follows the href. A new tab gets it too,
  // which is why this runs BEFORE the modifier-key returns below.
  a.setAttribute("href", withPlace(a.getAttribute("href")));
  // A click that opens SOMEWHERE ELSE leaves this page untouched, so it
  // starts no load here. Showing a bar for it is exactly the strand the
  // owner hit: the expand controls advertise ctrl-click and shift-click.
  if (ev.defaultPrevented || ev.button !== 0) return;
  if (ev.ctrlKey || ev.metaKey || ev.shiftKey || ev.altKey) return;
  if (a.target !== "" && a.target !== "_self") return;
  showLoading("loading " + (a.textContent || "view"));
}, true);
document.addEventListener("click", (ev) => {
  const lr = ev.target.closest ? ev.target.closest(".logrow") : null;
  if (lr) { void openLogDetail(lr.dataset.ref); return; }
  const rn = ev.target.closest ? ev.target.closest(".recnode") : null;
  if (rn) {
    const v = (REC_DECS[rn.dataset.exp] || []).find((x) => x.visit === rn.dataset.visit);
    const n = v && v.nodes.find((x) => x.id === rn.dataset.node);
    const sec = rn.closest("details");
    const box = sec && sec.querySelector(".recinfo");
    if (n && box) {
      sec.querySelectorAll(".recnode.dsel").forEach((x) => x.classList.remove("dsel"));
      rn.classList.add("dsel");
      box.innerHTML = '<div class="dinfo">' + jsonTable(Object.assign({ id: n.id, brief: n.brief, status: n.status }, n.resolution ? { resolution: n.resolution } : {}, n.at ? { opened: n.at } : {}, n.closed_at ? { closed: n.closed_at } : {})) + "</div>";
    }
    return;
  }
  const dn = ev.target.closest ? ev.target.closest(".dnode") : null;
  if (dn) { renderDecisions(dn.dataset.node); return; }
});

// THE AUTONOMY SLIDER — the human's live grip on how much of the walk is
// the agent's. Takes effect on the agent's NEXT tick; logged server-side.
const thr = document.getElementById("thr");
if (thr) {
  const lbl = document.getElementById("thr-val");
  thr.addEventListener("input", () => { if (lbl) lbl.textContent = Number(thr.value).toFixed(2); });
  thr.addEventListener("change", async () => {
    await fetch("/autonomy", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ value: Number(thr.value) }) });
  });
}

// THE NOTCHES — the authored involvement levels as shortcuts on the
// slider: a click jumps the threshold there and surfaces the level's help
// in the details pane (help is a detail, never a button).
const THR_LEVELS = D.levels;
function levelHelp(sel) {
  const rows = THR_LEVELS.map((l) =>
    '<tr' + (sel === l.value ? ' style="background:var(--se-raised)"' : "") + '><td class="k">' + l.abbr + " · " + l.value + '</td><td class="v">' + l.name + "</td></tr>").join("");
  showDetails("the autonomy scale", '<table class="kv">' + rows + '</table><div style="padding:8px 0 0"><a class="doclink" data-path="project/guidance/authoring/machines.md">the full scale — machines.md · Priority</a></div>');
}
// THE UPDATE CADENCE — two numbers the reader types. Both clocks run;
// whichever falls due first is owed. Zero stops that clock.
const nrMinEl = document.getElementById("narration-minutes");
const nrCallsEl = document.getElementById("narration-calls");
function nrHelp() {
  showDetails("how often updates are owed", '<div class="meta">An update every n MINUTES at least, or every n CALLS at least — whichever falls due first since the last one.<br><br>Zero stops that clock. Both zero owes nothing.<br><br>A volunteered update always pays, and always resets both.<br><br>NOW makes an update due immediately, so the next call has to carry one.</div>');
}
function sendCadence() {
  if (!nrMinEl || !nrCallsEl) return;
  void fetch("/narration", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ minutes: Number(nrMinEl.value), calls: Number(nrCallsEl.value) }) });
}
if (nrMinEl) nrMinEl.addEventListener("change", sendCadence);
if (nrCallsEl) nrCallsEl.addEventListener("change", sendCadence);
// THE POWER TOGGLES — independent buttons, either or both. A toggle carries
// its own key, so this handler never learns which toggles exist.
document.addEventListener("click", async (ev) => {
  const t = ev.target && ev.target.closest ? ev.target.closest(".param-toggle") : null;
  if (!t) return;
  const on = t.getAttribute("aria-pressed") !== "true";
  t.classList.toggle("on", on);
  t.setAttribute("aria-pressed", on ? "true" : "false");
  await fetch("/power", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ key: t.getAttribute("data-toggle"), on: on }) });
});
document.addEventListener("click", (ev) => {
  // An action parameter carries its endpoint, so the panel decides what the
  // button does and this handler never learns a second one.
  const act = ev.target.closest ? ev.target.closest(".param-action") : null;
  if (act) {
    // THE NOTE'S BUTTON CARRIES THE LINE BESIDE IT. Every other action posts
    // an empty body; this one would drop a blank note without the field.
    if (act.dataset.post === "/note") {
      const f = document.getElementById("note-body");
      if (f && f.value.trim() !== "") {
        const pr = document.querySelector('.param-choice[data-key="note_priority"]');
        void fetch("/note", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text: f.value, priority: pr === null ? "could" : pr.value }) }).then(() => { f.value = ""; refreshLog(); });
      }
      return;
    }
    void fetch(act.dataset.post, { method: "POST", headers: { "content-type": "application/json" }, body: "{}" });
    return;
  }

  const nh = ev.target.closest ? ev.target.closest(".nr-help") : null;
  if (nh) { nrHelp(); return; }
  const th = ev.target.closest ? ev.target.closest(".thr-help") : null;
  if (th) { levelHelp(Number((document.getElementById("thr") || {}).value)); return; }
  // The drumroll's memory lives on window, because the bar it is counting
  // clicks on is replaced by every poll.
  const n = ev.target.closest ? ev.target.closest(".rung[data-level]") : null;
  if (n) {
    // THE HELP FOLLOWS THE RUNG PRESSED. data-level is only where the click
    // LANDS, and on a release the two differ — explaining "blocked" to
    // someone who clicked the mechanical rung is the wrong mapping.
    const rung = Number(n.dataset.rung);
    // THE HIDDEN RUNG, COUNTED BEFORE EVERYTHING ELSE. The contract, in the
    // owner's words: five clicks on the top rung in a row go to emergency,
    // and it does not matter which rung the autonomy sits at, nor whether the
    // button is lit, dark or locked.
    //
    // Two earlier versions failed it by placing the counter behind a guard.
    // Behind the LIT check, press one released the rung and every later press
    // landed on a dark button, because data-level is baked into the markup and
    // stays stale until a poll redraws it. Behind the LOCKED check, no click
    // from a low rung ever reached the counter at all, since the top rung is
    // locked from down there. Both read as a dead button, and both were
    // reported as one. Nothing may stand in front of this.
    if (rung >= 1) {
      const now = Date.now();
      if (now - (window.__seTopPressAt || 0) > 5000) window.__seTopPresses = 0;
      window.__seTopPressAt = now;
      window.__seTopPresses = (window.__seTopPresses || 0) + 1;
      if (window.__seTopPresses >= 5) {
        window.__seTopPresses = 0;
        // The autonomy may be anywhere — the owner may have started at
        // mechanical. Emergency is refused below the top rung, so CLIMB first
        // and arm second. A refused arm looks exactly like a dead button.
        n.classList.remove("locked");
        n.classList.add("on");
        n.classList.add("emergency");
        n.textContent = "E";
        for (const b of document.querySelectorAll("button.rung[data-rung]")) b.classList.add("on");
        const bar = document.getElementById("thr");
        if (bar) bar.value = 1;
        void fetch("/autonomy", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ value: 1 }) })
          .then(function () { return fetch("/emergency", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ on: true }) }); });
        return;
      }
    }
    // A locked rung still ANSWERS — it explains itself in details rather
    // than doing nothing, because a dead click reads as a broken button.
    if (n.classList.contains("locked")) { levelHelp(rung); return; }
    const v = Number(n.dataset.level);
    // PAINT FIRST, THEN TELL THE ENGINE. The bar redraws on the next poll,
    // and waiting for that is seconds of a button that looks dead.
    for (const b of document.querySelectorAll("button.rung[data-rung]")) {
      b.classList.toggle("on", Number(b.dataset.rung) <= v);
    }
    const live = document.getElementById("thr");
    if (live) live.value = v;
    void fetch("/autonomy", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ value: v }) });
    levelHelp(rung);
    return;
  }
  const h = ev.target.closest ? ev.target.closest(".thr-help") : null;
  if (h) levelHelp(null);
});

// WHAT STANDS OPEN, for the person's own hand, now rides the LEGAL TOOLS
// links like every other human-runnable tool (owner ruling 2026-07-28). It
// had a button of its own in the machine header; the owner never found it
// there, sharing a row with the crumbs, the slider and the escape control.
// /api/survey stays — the mirror's own surfaces still ask it directly.

// SESSION OVER — anybody reaching end stops the whole session. The mirror
// tries to close its window; where that is not allowed, the big red
// message stands (owner ruling 2026-07-26).
// THE WINDOW STAYS OPEN, AND IT SAYS SO (owner ruling 2026-07-28). This used
// to try to close its own tab, which is exactly why the end was never seen:
// quitting at the console left a page that either vanished or sat there
// looking perfectly alive. Nothing closes itself now. The page reports.
//
// Losing the link is not the same as reaching end, and the two no longer
// share one sentence. A dropped connection says so AT ONCE, because silence
// reads as breakage; only a silence that outlasts an engine reload is death.
function linkLost(on) {
  const had = document.getElementById("link-lost");
  if (!on) { if (had) had.remove(); return; }
  if (had || document.getElementById("over")) return;
  const d = document.createElement("div");
  d.id = "link-lost";
  d.textContent = "the link to the server is down — reconnecting";
  document.body.appendChild(d);
}
function sessionOver(why) {
  linkLost(false);
  const had = document.getElementById("over");
  if (had) return;
  const d = document.createElement("div");
  d.id = "over";
  d.innerHTML = '<div class="over-box">SESSION OVER</div><div class="over-sub"></div>';
  d.querySelector(".over-sub").textContent = why;
  document.body.appendChild(d);
}
if (D.describe.status === "closed") sessionOver("the machine reached end — the walk is complete");

// THE MIRROR IS PUSHED, NOT POLLED (owner ruling 2026-07-28). The walk
// wakes every held hand, and /events forwards that wake here — so a change
// lands at once instead of up to a poll late. EventSource reconnects by
// itself; a reconnect after silence is how an engine swap arrives without
// an F5, and a silence that never ends is death.
// THE PING (owner, 2026-07-30): the agent points, the surface lights yellow
// and STAYS lit while the guide talks about it. Pointing somewhere else puts
// the old one out, so exactly ONE surface is lit at a time.
// Lookup order: a card id, the widget a card shows, a raw element id, a
// drawn state node. The widget name is accepted because a card's id is its
// slugged TITLE, and the two rarely match.
let lastPingSeq = 0;
let litTarget = null;
function findPingEl(target) {
  const escaped = window.CSS && CSS.escape ? CSS.escape(target) : target;
  return document.getElementById("card-" + target)
    || document.querySelector('[data-widget="' + escaped + '"]')
    || document.getElementById(target)
    || document.querySelector('[data-detail="state:' + escaped + '"]');
}
function applyPing() {
  for (const n of document.querySelectorAll(".se-ping, .se-ping-svg")) n.classList.remove("se-ping", "se-ping-svg");
  if (litTarget === null) return;
  const el = findPingEl(litTarget);
  if (!el) return; // pointing is advisory — an unknown target fails nothing
  el.classList.add(el.ownerSVGElement ? "se-ping-svg" : "se-ping");
  return el;
}
function pingSurface(target) {
  litTarget = target;
  const el = applyPing();
  if (el && el.scrollIntoView) el.scrollIntoView({ block: "nearest", behavior: "smooth" });
}
let pollBusy = null;
let ACTIVE_AT_RENDER = JSON.stringify(D.describe.active || []);
let sawError = false;
let deathTimer = null;
// The newest person-pull already landed; null until the first alive adopts
// the standing value, so a page load never replays an old pull.
let lastPullSeq = null;
// ONE alive-driven pass, shared by the event stream and the host's wake —
// an embedded page has no stream, and this is everything it would miss.
function applyAlive(a) {
  if (a.status === "closed") { sessionOver("the machine reached end — the walk is complete"); return; }
  if (a.gone) { sessionOver("the console quit — the server has stopped, the walk was left standing"); return; }
  // Emergency is drawn from the engine, so a second surface cannot disagree
  // with it about whether the gate is lifted.
  for (const b of document.querySelectorAll("button.rung[data-rung]")) {
    if (Number(b.dataset.rung) < 1) continue;
    const armed = a.emergency === true;
    b.classList.toggle("emergency", armed);
    if (armed) b.textContent = "E";
    else if (b.textContent === "E") b.textContent = "I";
  }
  if (thr && document.activeElement !== thr && Number(thr.value) !== a.autonomy) {
    thr.value = a.autonomy;
    const lbl = document.getElementById("thr-val");
    if (lbl) lbl.textContent = Number(a.autonomy).toFixed(2);
  }
  if (a.power) {
    for (const b of document.querySelectorAll(".param-toggle")) {
      const on = a.power[b.getAttribute("data-toggle").replace(/-/g, "_")] === true;
      b.classList.toggle("on", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    }
  }
  if (a.ping && a.ping.seq !== lastPingSeq) { lastPingSeq = a.ping.seq; pingSurface(a.ping.target); }
  // A re-render drops the class. Put the light back rather than losing it
  // mid-sentence — the ping outlives the DOM that carried it.
  else if (litTarget !== null && !document.querySelector(".se-ping, .se-ping-svg")) applyPing();
  if (logPanel && a.acts !== lastActs) { lastActs = a.acts; refreshLog(); }
  // THE PERSON PULLED (owner design 2026-08-04): the answer lands in the
  // details, and a form the walk owes gets a panel of its own — the inline
  // details pane is ephemeral on purpose.
  if (lastPullSeq === null) lastPullSeq = a.last_pull ? a.last_pull.seq : 0;
  else if (a.last_pull && a.last_pull.seq !== lastPullSeq) {
    lastPullSeq = a.last_pull.seq;
    CURRENT_DETAIL = "log:" + a.last_pull.ref;
    void openLogDetail(a.last_pull.ref);
    void fetch("/api/log?ref=" + encodeURIComponent(a.last_pull.ref)).then((r) => r.json()).then((rec) => {
      const resp = rec && rec.response;
      const first = resp && resp.pull === "fill" && resp.forms && resp.forms[0];
      if (!first || !first.form) return;
      if (window.parent !== window) window.parent.postMessage({ se: "open-form", name: first.form }, "*");
      else if (!EMBED) window.open("/widget/details?detail=" + encodeURIComponent("form:" + first.form), "_blank", "popup,width=760,height=900");
    }).catch(() => {});
  }
  if (JSON.stringify(a.active || []) !== ACTIVE_AT_RENDER) { refresh(); return; }
  // A script run finishing elsewhere (agent tick, other window) lands its
  // result — refresh, keeping the open pane.
  // THE BAR FOLLOWS THE ENGINE, not just this page's clicks. A script the
  // AGENT started (boot's checks, most of all) shows here too, with real
  // progress when it reports any and a moving bar when it does not.
  if (a.progress) showProgress(a.progress.label || "working", a.progress.done, a.progress.total);
  else if (a.busy === true && pollBusy !== true) showLoading("running checks");
  else if (a.busy === false && pollBusy === true) hideLoading();
  if (pollBusy === true && a.busy === false) { refresh(); return; }
  pollBusy = a.busy;
}
// A frozen window never opens the stream — that is the whole of freezing.
//
// AND NEITHER DOES AN EMBEDDED CARD. A browser allows only a handful of
// connections to one host, and a permanent event stream per card ate one
// each. Past that limit EVERY other request to the engine queues instead of
// going out — so a click did nothing at all, and then four minutes later the
// whole backlog arrived at once. The host polls the engine over its own
// runtime, where no such limit applies, and wakes the cards through the
// channel they already have.
if (!FROZEN && window.parent === window) {
const es = new EventSource("/events");
es.addEventListener("open", () => {
  if (deathTimer !== null) { clearTimeout(deathTimer); deathTimer = null; }
  linkLost(false);
  if (sawError) { sawError = false; refresh(); }
});
es.addEventListener("error", () => {
  sawError = true;
  linkLost(true);
  // Long enough that an ordered reload reconnects inside it, short enough
  // that a reader who quit is not left guessing.
  if (deathTimer === null) deathTimer = setTimeout(() => sessionOver("the server stopped answering — the session it served is gone"), 10000);
});
es.addEventListener("message", (ev) => {
  let a;
  try { a = JSON.parse(ev.data); } catch (e) { return; }
  applyAlive(a);
});
}

// THE AGENT'S TERMINAL. The pty host is a SIBLING process on its own port,
// because this page's process is the agent's grandchild and a grandchild
// cannot own its grandparent's terminal. The host holds the pseudo-terminal
// and the scrollback, so attaching after a refresh replays what was already
// there instead of losing the session. No host running: the placeholder
// stands and nothing else happens.
const TERM_PORT = 7334;
function loadAsset(href, kind) {
  return new Promise((resolve) => {
    const el = kind === "css" ? document.createElement("link") : document.createElement("script");
    if (kind === "css") { el.rel = "stylesheet"; el.href = href; } else { el.src = href; }
    el.onload = resolve;
    el.onerror = resolve;
    document.head.appendChild(el);
  });
}
async function bootTerminal() {
  const pane = document.getElementById("term-body");
  if (!pane || pane.dataset.booted) return;
  const base = "http://" + (location.hostname || "localhost") + ":" + TERM_PORT;
  try {
    const ping = await fetch(base + "/pty/alive");
    if (!ping.ok) return;
  } catch (e) { return; }
  // A HOST ANSWERED, so the pane earns its place. Until then it is not
  // there at all: manual mode and --own-terminal both leave it hidden.
  document.querySelectorAll(".no-host").forEach((el) => el.classList.remove("no-host"));
  // AN AGENT ANSWERED, so chat becomes the main card — but only if the reader
  // has not already chosen one. Their choice outranks ours, always.
  if (!new URLSearchParams(location.search).has("card") && !CHAT_LED) {
    CHAT_LED = true;
    const chat = CARDS.list.find((c) => c.id === "chat");
    if (chat !== undefined) promoteCard(chat.id);
  }
  pane.dataset.booted = "1";
  await loadAsset(base + "/xterm.css", "css");
  await loadAsset(base + "/xterm.js", "js");
  if (!window.Terminal) { pane.dataset.booted = ""; return; }
  pane.innerHTML = "";
  const term = new window.Terminal({
    fontFamily: "ui-monospace, Consolas, monospace",
    fontSize: 13,
    scrollback: 5000,
    theme: { background: cssPalette("--se-bg"), foreground: cssPalette("--se-fg") },
  });
  term.open(pane);
  term.onData((d) => { void fetch(base + "/pty/input", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ d }) }); });
  const stream = new EventSource(base + "/pty/stream");
  stream.addEventListener("message", (ev) => {
    const bin = atob(ev.data);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    term.write(arr);
  });
  // The host must be told the real size, or the agent wraps at the wrong
  // column. Measured from a real glyph rather than xterm's internals.
  const cell = () => {
    const m = document.createElement("span");
    m.style.cssText = "position:absolute;visibility:hidden;white-space:pre;font-family:ui-monospace,Consolas,monospace;font-size:13px";
    m.textContent = "0".repeat(100);
    document.body.appendChild(m);
    const r = m.getBoundingClientRect();
    m.remove();
    return { w: r.width / 100, h: r.height };
  };
  // THE FLICKER IS A 2-CYCLE (owner report 2026-07-28, second round). The
  // first fix refused a resize that changed NOTHING, which only ever catches
  // a fixed point. The real loop alternated between two sizes, so every step
  // differed from the one before it and the guard never fired.
  //
  // What drove it: clientWidth INCLUDES the pane's padding, so the grid was
  // computed about three columns too wide. xterm laid out wider than its
  // content box, the pane grew a scrollbar, clientWidth shrank, the grid
  // narrowed, the scrollbar went away, and it started again.
  //
  // Three guards, each killing one link. The pane no longer scrolls (CSS),
  // so a child can no longer change the parent's client box. The grid is
  // measured against the CONTENT box, so xterm fits what it was given. And
  // after our own resize the observer is ignored until the relayout has
  // landed, with one trailing look so a drag that ends inside that window
  // is not lost.
  //
  // Subtracting the padding is also what restores the 80 columns the left
  // column is sized for — 650px minus 20px still measures 80 cells at 13px.
  const inner = () => {
    const s = getComputedStyle(pane);
    return {
      w: pane.clientWidth - parseFloat(s.paddingLeft) - parseFloat(s.paddingRight),
      h: pane.clientHeight - parseFloat(s.paddingTop) - parseFloat(s.paddingBottom),
    };
  };
  let lastCols = 0;
  let lastRows = 0;
  let queued = false;
  let settleUntil = 0;
  let trailing = 0;
  const apply = () => {
    const c = cell();
    const box = inner();
    if (!(c.w > 0) || !(c.h > 0) || !(box.w > 0) || !(box.h > 0)) return;
    const cols = Math.max(20, Math.floor(box.w / c.w));
    const rows = Math.max(6, Math.floor(box.h / c.h));
    if (cols === lastCols && rows === lastRows) return;
    lastCols = cols;
    lastRows = rows;
    settleUntil = Date.now() + 250;
    term.resize(cols, rows);
    void fetch(base + "/pty/resize", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ cols, rows }) });
  };
  const sync = () => {
    const now = Date.now();
    if (now < settleUntil) {
      clearTimeout(trailing);
      trailing = setTimeout(sync, settleUntil - now + 20);
      return;
    }
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; apply(); });
  };
  new ResizeObserver(sync).observe(pane);
  sync();
}
// The host may come up after the page — RUNME detaches it, and it can be
// restarted under a standing mirror. So the ping keeps asking until one
// answers; bootTerminal returns at once once a terminal is attached.
void bootTerminal();
setInterval(() => { void bootTerminal(); }, 2000);
`;

const MODAL =
  '<div id="modal"><div class="modal-box"><div class="widget-head"><span id="modal-title"></span><button class="expand" id="modal-close">✕</button></div><div class="modal-body" id="modal-body"></div></div></div><div id="toast"></div>';

function widgetHead(title: string, widgetId: string, url: string): string {
  return `<div class="widget-head"><span>${esc(title)}</span><button class="expand" data-widget="${widgetId}" data-url="${esc(url)}" title="expand · ctrl-click: new tab · shift-click: new window — both open frozen on what this card is showing">⛶</button></div>`;
}

/** THE NATIVE SKIN (owner ruling 2026-07-30). Docked inside a host, this is
 *  not our own window any more, so it stops looking like one: square
 *  corners, the host's fonts, the host's palette. Our own look belongs to
 *  the standalone mirror. Semantic colours stay ours everywhere.
 *
 *  A SOLO card drops its head and its frame — the host already draws a
 *  titled, bordered pane around it, and two frames read as a bug.
 *
 *  THE HOST OWNS THE WALK'S CONTROLS when embedded (owner ruling 2026-07-30).
 *  The sliders and escape steer the whole walk and a card may be closed, so
 *  they belong to the host's sidebar rather than to any one card.
 *
 *  THE CRUMBS ARE NOT CONTROLS. They navigate the DRAWING — which machine is
 *  on screen — so they stay with the drawing.
 *
 *  ESCAPE STAYS TOO (owner ruling 2026-07-30), and lives ONLY here: it acts
 *  on the walk the drawing shows, and repeating it in the host's sidebar
 *  would be the same control in two places. */
const NATIVE = `
  body { font-family: var(--vscode-font-family, ui-monospace, Consolas, monospace); }
  /* THE HOST ALREADY NAMES THESE MEANINGS, so they are taken from its theme
     instead of our palette. The ROUTE stays ours: a blue line for the way
     ahead is a map convention no editor theme outweighs. */
  /* MIX INTO THE SURFACE, NEVER INTO TRANSPARENT. Inside the iframe no
     --vscode-* variable exists; --se-bg carries the forwarded editor
     background, so it is what a translucent fill has to blend with. */
  body.embed { --se-accent: var(--vscode-button-background); --se-accent-bg: color-mix(in srgb, var(--vscode-button-background) 22%, var(--se-bg)); --se-ok: var(--vscode-testing-iconPassed); --se-ok-bg: color-mix(in srgb, var(--vscode-testing-iconPassed) 20%, var(--se-bg)); --se-warn: var(--vscode-editorWarning-foreground); }
  body.embed { --se-walk: var(--vscode-charts-blue, #4a90d9); --se-walk-bg: color-mix(in srgb, var(--se-walk) 30%, var(--se-bg)); }
  * { border-radius: 0 !important; }
  .label, .sublabel, .group-label, .cond-label, pre, code, table.kv, .logrow, .legend-key { font-family: var(--vscode-editor-font-family, ui-monospace, Consolas, monospace); }
  body.solo .widget { border: 0; }
  body.solo .widget-head { display: none; }
  body.solo #w-machine .widget-head { display: flex; }
  body.solo #w-machine .head-sliders { display: none !important; }
  body.solo #w-machine .expand { display: none; }
  body.solo aside, body.solo main { background: transparent; }
`;

/** The per-state detail objects the page's data island carries. */
function stateDetails(m: MirrorState, decl: MachineDecl, done: Set<string>, archived: { id: string }[]): Record<string, unknown> {
  const states: Record<string, unknown> = {};
  for (const s of decl.states) {
    states[s.id] = {
      id: s.id,
      kind: s.kind,
      statement: s.statement,
      guidance: s.guidance,
      priority: s.priority,
      // A state with evidence fields IS its form — the details render it.
      has_form: s.evidence_form.length > 0,
      legal_tools: s.legal_tools ?? [],
      ...(s.submachine !== undefined ? { submachine: s.submachine } : {}),
      ...(s.entry !== undefined ? { entry: m.session.conditionStatus(decl, s, "enter") } : {}),
      ...(s.exit !== undefined ? { exit: m.session.conditionStatus(decl, s, "leave") } : {}),
      exit_met: m.session.conditionMet(decl, s, "leave"),
      was_filled: done.has(s.id),
      // An archive-record state carries ITS closed record for the detail.
      ...(s.tags?.includes("archive-record")
        ? { archive_record: archived.find((e) => e.id === s.id || e.id.startsWith(`${s.id}-`)) ?? null }
        : {}),
      ...(s.exit?.script !== undefined || s.entry?.script !== undefined ? { script: m.session.scriptStatus(decl, s) } : {}),
      pulled: m.session.pulled(decl, s),
      next: s.edges.map((e) => stateEdgeDetail(m, decl, e)),
    };
  }
  return states;
}

function stateEdgeDetail(m: MirrorState, decl: MachineDecl, e: MachineDecl["states"][number]["edges"][number]): Record<string, unknown> {
  const t = decl.states.find((st) => st.id === e.to);
  const ready = t === undefined ? true : m.session.entryReadyHuman(decl, t);
  return {
    to: e.to,
    role: e.role,
    ...(e.guard !== undefined ? { guard: e.guard } : {}),
    ...(t !== undefined ? { kind: t.kind, statement: t.statement, priority: t.priority } : {}),
    // The human's ▶ lock: explicit entry conditions AND the pull —
    // every doc entering demands, checked at its current version. A
    // locked edge carries WHAT is missing (the tooltip names it).
    // ASKED ONCE. This ran entryReadyHuman twice per edge, and each
    // call walks the target's whole reading list.
    enter_met: ready,
    ...(t !== undefined && !ready ? { missing: m.session.entryMissingHuman(decl, t) } : {}),
  };
}

/** Highlights follow the WALK; the view may be elsewhere. */
function drawingSets(
  m: MirrorState,
  decl: MachineDecl,
  info: { active: string[] },
  viewingWalk: boolean,
): { leafActive: Set<string>; done: Set<string>; subIds: Set<string>; meta: Record<string, StateMeta> } {
  const leafActive = viewingWalk ? new Set(info.active.map((a) => a.split("/").pop()!)) : new Set<string>();
  if (!viewingWalk && decl.id === m.session.machine.id) {
    // Viewing main while the walk is inside a sub: the sub state is the live one.
    leafActive.add(m.session.breadcrumb()[1]);
  }
  // RE-ENTRY RESETS (owner ruling 2026-07-27): the drawing shows the LIVE
  // run only — a machine entered again starts gray; past passes live in
  // the record, not on the drawing.
  const run = m.session.viewRun(decl.id);
  const done = new Set(run.done.map((s) => s.split("/").pop()!));
  // An end state is never "filled" — it turns green when its machine completed.
  if (run.completed) for (const s of decl.states) if (s.kind === "end") done.add(s.id);
  const subIds = new Set(decl.states.filter((s) => s.submachine !== undefined).map((s) => s.id));
  const meta: Record<string, StateMeta> = {};
  for (const s of decl.states) {
    meta[s.id] = {
      has_exit: s.exit !== undefined,
      exit_met: m.session.conditionMet(decl, s, "leave"),
      has_entry: s.entry !== undefined,
      entry_met: m.session.conditionMet(decl, s, "enter"),
      // The STATEMENT is the subtitle (owner ruling 2026-07-28): authored
      // meaning renders small under the name; empty renders nothing.
      ...(s.statement !== "" && s.statement !== s.id ? { subtitle: s.statement } : {}),
    };
  }
  return { leafActive, done, subIds, meta };
}

// THE ROUTE, PROJECTED ONTO THIS DRAWING. A broken or unreachable target
// must never take the picture down with it, so the marks simply go
// missing and the machine still renders.
function routeMarksFor(m: MirrorState, decl: MachineDecl): RouteMarks | undefined {
  try {
    const r = m.session.route(m.session.target);
    const mainId = m.session.machine.id;
    const { waypoints, path: hops } = routeOverlay(r.steps, decl.id, mainId);
    const localOf = (q: string): string | undefined => {
      if (decl.id === mainId) return q.split("/")[0];
      return q.startsWith(`${decl.id}/`) ? q.slice(decl.id.length + 1).split("/")[0] : undefined;
    };
    const shutAt = r.stops_at === undefined ? undefined : localOf(r.stops_at.at);
    return {
      waypoints,
      path: hops,
      ...(r.found && localOf(r.target) !== undefined ? { target: localOf(r.target) } : {}),
      ...(shutAt !== undefined && r.stops_at !== undefined ? { blocked: { at: shutAt, why: r.stops_at.why } } : {}),
    };
  } catch {
    /* no route, no marks - the drawing stands either way */
    return undefined;
  }
}

// Breadcrumbs describe the VIEW: main [›subs] [ › sub [›its subs] ].
// The crumbs walk the PARENT CHAIN — a nested machine shows under its
// real parent, never directly under main (owner ruling 2026-07-28).
function crumbsFor(m: MirrorState, decl: MachineDecl): string {
  const mainSubs = m.session.machine.states.filter((s) => s.submachine !== undefined).map((s) => s.id);
  const crumbArrow = (subs: string[]): string =>
    subs.length === 0
      ? ""
      : `<span class="crumb-arrow">›<span class="crumb-menu">${subs.map((s) => `<a href="/?view=${encodeURIComponent(s)}">${esc(s)}</a>`).join("")}</span></span>`;
  const chain = m.session.viewChain(decl.id);
  return chain
    .map((id, i) => {
      const label = i === chain.length - 1 ? `<b class="here">${esc(id)}</b>` : `<a href="/?view=${encodeURIComponent(id)}">${esc(id)}</a>`;
      const arrow =
        i === 0
          ? crumbArrow(mainSubs)
          : i === chain.length - 1
            ? crumbArrow(decl.states.filter((s) => s.submachine !== undefined).map((s) => s.id))
            : '<span style="color:var(--se-muted);padding:0 3px">›</span>';
      return label + arrow;
    })
    .join("");
}

export function renderMirror(
  m: MirrorState,
  widget?: "machine" | "details" | "log" | "terminal" | "table",
  view?: string,
  card?: string,
  embed?: boolean,
  tableView?: string,
): string {
  const skin = embed === true ? NATIVE : "";
  const bodyClass = embed === true ? ` class="embed${widget === undefined ? "" : " solo"}"` : "";
  const info = m.session.describe() as { active: string[]; status: string };
  // The scale is READ from machines/scale.md — the Obsidian-editable
  // truth; an owner edit shows on the next reload.
  const levels = loadLevels(m.root);
  const walkMachine = m.session.currentMachine();
  const { decl, canvas } = viewedMachine(m, view ?? walkMachine.id);
  const viewingWalk = decl.id === walkMachine.id;
  const history = m.session.instance.history ?? [];
  const { leafActive, done, subIds, meta } = drawingSets(m, decl, info, viewingWalk);
  const marks = routeMarksFor(m, decl);
  const svg = machineSvg(canvas, leafActive, done, subIds, meta, marks);
  const crumbs = crumbsFor(m, decl);

  // ONE LIST FOR THE WHOLE RENDER. expeditionList() spawns git per record
  // and does not vary per state; calling it inside the loop made the archive
  // cost a spawn for every record TIMES every record, blocking the server.
  const archived = decl.states.some((s) => s.tags?.includes("archive-record"))
    ? (m.session.expeditionList() as { archive: { id: string }[] }).archive
    : [];
  const states = stateDetails(m, decl, done, archived);
  const comment = (canvas.nodes ?? []).find((n) => n.type === "text")?.text ?? "";
  const data = `<script type="application/json" id="se-data">${JSON.stringify({
    describe: m.session.describe(),
    packet: m.session.packet(),
    lastPacket: m.lastPacket ?? null,
    states,
    comment,
    viewingWalk,
    viewed: { id: decl.id, reentry: decl.reentry, initial: decl.initial, states: decl.states.map((s) => s.id) },
    history: history.slice(-20),
    levels,
    // Every doc the reader has checked AT ITS CURRENT VERSION. A condition
    // names docs that are not always in the state's own pulled list, so the
    // page needs the session's list rather than a per-state one.
    checkedDocs: m.session.humanCheckedPaths(),
  }).replace(/</g, "\\u003c")}</script>`;

  // The slider — THE AUTONOMY: which states the agent enters by itself
  // (priority <= autonomy). 0 = the human clicks through everything
  // (manual mode is just this); 1 = fully autonomous. Live: changes take
  // effect on the agent's next tick.
  // THE BAR IS A PANEL, and the panel is a SPEC (machines/panels/controls.md).
  // Nothing here decides how a control looks; the spec names the parameters
  // and params.ts draws the types it knows. A type it does not know refuses,
  // so a control cannot appear that the drawing never asked for.
  const thr = m.session.autonomy;
  const panelValues = {
    rungs: levels,
    autonomy: thr,
    ints: { narration_minutes: m.session.narrationMinutes, narration_calls: m.session.narrationCalls },
  };
  // THE NOTE ROW IS ITS OWN PANEL, drawn right after the controls. Both
  // surfaces read the same two specs, so neither can drift from the other.
  const slider = renderPanel(loadPanel(m.root, "controls"), panelValues) + renderPanel(loadPanel(m.root, "note-entry"), panelValues);
  // THE SHUTDOWN CONTROL IS GONE (owner sketch, 2026-08-01). It was redundant:
  // the only setting anyone wanted is "do not shut down while work is running",
  // and that is not a preference. The MACHINE decides it, from whether the walk
  // is idle at the front desk — not the agent, and not a slider.
  // THE UPDATE CADENCE — how often the agent OWES a line about what it is
  // doing. Same grammar as the other two bars; the top notch owes nothing.

  const nrBar = "";
  // Escape has a hand-side affordance too (parity law): only while a
  // sub-machine other than boot is being walked.
  const crumbTrail = m.session.breadcrumb();
  // ESCAPE STANDS BESIDE THE POSITION, ALWAYS (owner ruling 2026-07-30). It
  // used to appear and vanish with the walk, which moved everything else in
  // the row under the reader's hand. Not applicable is DISABLED, not absent.
  const canEscape = crumbTrail.length > 1 && crumbTrail[1] !== "boot";
  const escapeBtn = `<button class="ghost" id="escape-btn"${canEscape ? "" : " disabled"} title="${canEscape ? "escape to idle — the machine is left standing, the reason is recorded" : "nothing to escape — the walk is not inside a sub-machine"}">⤴ escape</button>`;
  // The way home when the view holds still elsewhere: the header names
  // the walk's position; clicking it jumps the view there.
  const curLeaf = info.active[0] ?? "";
  const curBtn =
    curLeaf === ""
      ? ""
      : `<button class="ghost" id="cur-state" data-machine="${esc(walkMachine.id)}" title="the walk stands here — click: jump the view to it">☉ ${esc(curLeaf)}</button>`;
  const machineWidget = `<div class="widget" id="w-machine"><div class="widget-head"><span class="crumbs">${crumbs}</span><span class="head-controls" style="display:flex;align-items:center;gap:10px">${curBtn}<span class="head-sliders" style="display:flex;align-items:center;gap:10px">${slider}${nrBar}</span>${escapeBtn}<button class="expand" data-widget="w-machine" data-url="/widget/machine?view=${encodeURIComponent(decl.id)}" title="expand · ctrl-click: new tab · shift-click: new window — both open frozen on what this card is showing">⛶</button></span></div><div class="widget-body">${svg}</div></div>`;
  const detailsWidget = `<div class="widget" id="w-details">${widgetHead("details", "w-details", "/widget/details")}
    ${info.status === "closed" ? '<div class="meta" style="color:var(--se-fail)">machine closed</div>' : ""}
    <div class="meta" id="details-title" data-morph-ignore>—</div>
    <div class="panel" id="details" data-morph-ignore></div>
  </div>`;
  // The unified feed sits ABOVE details (owner ruling 2026-07-26) — rows
  // load and refresh client-side off /api/log; only present with a log.
  const logWidget =
    m.log === undefined
      ? ""
      : `<div class="widget" id="w-log">${widgetHead("log", "w-log", "/widget/log")}
    <div class="panel log-panel" id="log-rows" data-morph-ignore><div class="meta">loading…</div></div>
  </div>`;
  // THE AGENT'S TERMINAL. The whole widget is morph-ignored: a morph that
  // reached into a live terminal would wipe its scrollback and its focus.
  // The pty host is a SIBLING process started by RUNME — the mirror only
  // renders a client for it, because this page's process is the agent's
  // grandchild and a grandchild cannot own its grandparent's terminal.
  //
  // THE PANE FOLLOWS THE HOST, NOT THE LAUNCH (owner ruling 2026-07-28). It
  // ships hidden and the client reveals it when the host answers. Manual mode
  // starts none, and --own-terminal leaves the agent in its own window, so
  // both simply never reveal it — one rule instead of a flag for each case.
  // On its OWN page the pane stays visible, so a direct visit can say why it
  // is empty rather than showing a blank tab.
  const termWidget = (
    standalone: boolean,
  ) => `<div class="widget${standalone ? "" : " no-host"}" id="w-terminal" data-morph-ignore>${widgetHead("terminal", "w-terminal", "/widget/terminal")}
    <div class="panel term-panel" id="term-body"><div class="meta" style="padding:10px 12px">no agent connected — the card keeps its slot, so no number ever shifts</div></div>
  </div>`;
  // THE CHAT CARD KEEPS ITS SLOT (owner 2026-07-29), superseding the older
  // rule that the pane ships hidden until a host answers. An agent can connect
  // or drop MID-SESSION, and a card that vanishes renumbers every card after
  // it — under the reader's hand, while they are using the numbers.
  const terminalWidget = termWidget(true);
  // THE TABLE (owner ask 2026-08-01) — every view every .base in the vault
  // declares, drawn here so Obsidian is not the only thing that can read
  // them. The vault is re-read per render for the same reason the palette is.
  // A FUNCTION, NOT A VALUE, and that is the whole point: building it reads
  // all 169 notes off disk. Measured at 60ms, against a 96ms render — so
  // computing it eagerly would have put a 60% tax on the machine page, the
  // log page and the details page, none of which ever show a table.
  const tblWidget = (): string =>
    basesCard(
      m.root,
      `<button class="expand" data-widget="w-table" data-url="/widget/table" title="expand · ctrl-click: new tab · shift-click: new window — both open frozen on what this card is showing">⛶</button>`,
      tableView,
    );
  // Read per render, so editing palette.css needs no restart.
  const pal = palette(m.root);

  if (widget === "table") {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>se · table</title><style>${pal}${STYLE}${TABLE_STYLE}${BASES_STYLE}${BASES_TABLE_STYLE} #w-table{flex:1;border-bottom:0;min-height:0} body.solo #sidebar{display:flex;flex-direction:column;height:100vh} .tbl-body{flex:1;min-height:0}${skin}</style>${ELEMENTS}</head>
<body${bodyClass}><div class="cols"><aside id="sidebar" style="width:100vw;max-width:100vw">${tblWidget()}</aside></div>${MODAL}${data}<script>${SCRIPT}</script><script>${TABLE_SCRIPT}</script><script>${BASES_SCRIPT}</script></body></html>`;
  }

  if (widget === "terminal") {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>se · terminal</title><style>${pal}${STYLE} #w-terminal{flex:1;height:auto;border-bottom:0}${skin}</style>${ELEMENTS}</head>
<body${bodyClass}><div class="cols"><aside id="left" style="width:100vw;max-width:100vw">${termWidget(true)}</aside></div>${MODAL}${data}<script>${SCRIPT}</script></body></html>`;
  }
  if (widget === "log") {
    // The widget asks for flex:1, so its parent has to BE a column with a
    // height — without that the panel collapses and the page reads as blank.
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>se · log</title><style>${pal}${STYLE} #w-log{flex:1;border-bottom:0;min-height:0} body.solo #sidebar{display:flex;flex-direction:column;height:100vh} #log-rows{flex:1;min-height:0}${skin}</style>${ELEMENTS}</head>
<body${bodyClass}><div class="cols"><aside id="sidebar" style="width:100vw;max-width:100vw">${logWidget}</aside></div>${MODAL}${data}<script>${SCRIPT}</script></body></html>`;
  }

  if (widget === "machine") {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>se · machine</title><style>${pal}${STYLE} main{padding:10px}${skin}</style>${ELEMENTS}</head>
<body${bodyClass}><div class="cols"><main>${machineWidget}</main></div>${MODAL}${data}<script>${SCRIPT}</script></body></html>`;
  }
  if (widget === "details") {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>se · details</title><style>${pal}${STYLE}${skin}</style>${ELEMENTS}</head>
<body${bodyClass}><div class="cols"><aside id="sidebar" style="width:100vw;max-width:100vw">${detailsWidget}</aside></div>${MODAL}${data}<script>${SCRIPT}</script></body></html>`;
  }
  return cardMatrixPage(
    m,
    card,
    embed,
    { bodyClass, skin, pal, data },
    { terminal: terminalWidget, machine: machineWidget, log: logWidget, details: detailsWidget, table: tblWidget },
  );
}

// THE CARD MATRIX (owner design 2026-07-29). The card list and its ORDER are
// the product's, in project/views/cards.md — v3 exists to work on other products,
// and another product wants other cards.
// EMBEDDED, the console card leaves (owner ruling 2026-07-30): the host's
// integrated terminal is where the agent lives, and a second picture of it
// beside the editor is an echo. The grid closes over the gap.
function cardMatrixPage(
  m: MirrorState,
  card: string | undefined,
  embed: boolean | undefined,
  frame: { bodyClass: string; skin: string; pal: string; data: string },
  widgets: { terminal: string; machine: string; log: string; details: string; table: () => string },
): string {
  const allCards = loadCards(m.root);
  const cardList = embed === true ? allCards.filter((c) => c.widget !== "terminal") : allCards;
  const byWidget: Record<string, string> = {
    terminal: widgets.terminal,
    machine: widgets.machine,
    log: widgets.log,
    details: widgets.details,
    // Only when a card actually asks for it. A product that declares no table
    // card never pays for one.
    ...(cardList.some((c) => c.widget === "table") ? { table: widgets.table() } : {}),
  };
  const filled = (c: { widget?: string }): boolean => c.widget !== undefined && (byWidget[c.widget] ?? "") !== "";
  // THE DEFAULT MAIN CARD IS THE FIRST AVAILABLE ONE — one rule instead of a
  // list of exceptions. The book is not built, so it cannot lead.
  //
  // Chat is the exception the server CANNOT judge: whether an agent answers is
  // known only to the client, which polls the pty host. So the server leads
  // with the first card it can vouch for, and the client promotes chat once a
  // host actually answers. With no agent, the state machine leads — which is
  // exactly what the owner asked for, arrived at without a special case.
  const vouched = (c: { widget?: string }): boolean => filled(c) && c.widget !== "terminal";
  const asked = card === undefined ? undefined : cardList.find((c) => c.id === card);
  const now = (asked ?? cardList.find(vouched) ?? cardList.find(filled) ?? cardList[0])?.id ?? "";
  const rows = Math.max(1, Math.ceil(cardList.length / 2));
  // Two columns, filled in the order the product declared. An EVEN number of
  // cards fills the grid exactly; an odd one leaves a single hole.
  const cellAt = (i: number): string => `--col:${3 + (i % 2)};--row:${1 + Math.floor(i / 2)}`;
  const nothingYet = (title: string): string =>
    `<div class="widget"><div class="widget-head"><span>${esc(title)}</span></div><div class="widget-body"><div class="meta" style="padding:10px 12px">not built yet — the slot is held so the numbers never shift</div></div></div>`;
  const cardsHtml = cardList
    .map(
      (c, i) =>
        `<div class="card${c.id === now ? " main" : ""}" id="card-${esc(c.id)}"${c.widget ? ` data-widget="${esc(c.widget)}"` : ""} style="${cellAt(i)}"><span class="cardnum" title="promote this card — the same as pressing ${c.n}">${c.n}</span>${filled(c) ? byWidget[c.widget as string] : nothingYet(c.title)}</div>`,
    )
    .join("\n  ");
  // THE LEGEND RENDERS FROM THE REGISTRY. Declare a key there and it shows up
  // here by itself; a hand-kept list drifts, and a stale legend is worse than
  // none. It sits in the promoted card's vacated slot, so its position also
  // says which card is up front.
  const legendRows = bindings(cardList)
    .map(
      (b) => `<div class="legend-row"><span class="legend-key">${esc(b.keys)}</span><span class="legend-what">${esc(b.label)}</span></div>`,
    )
    .join("");
  const nowAt = Math.max(
    0,
    cardList.findIndex((c) => c.id === now),
  );
  const legendHtml = `<div class="card" id="card-legend" style="${cellAt(nowAt)}"><div class="widget" id="w-legend"><div class="widget-head"><span>keys</span></div><div class="widget-body">${legendRows}</div></div></div>`;
  const cardData = `<script type="application/json" id="se-cards">${JSON.stringify({ list: cardList.map((c) => ({ n: c.n, id: c.id, title: c.title })), now })}</script>`;
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>se mirror</title><style>${frame.pal}${STYLE}${TABLE_STYLE}${BASES_STYLE}${BASES_TABLE_STYLE}${frame.skin}</style>${ELEMENTS}</head>
<body${frame.bodyClass}>
<div class="cards" data-keep-style style="grid-template-rows:repeat(${rows},1fr)">
  ${cardsHtml}
  ${legendHtml}
  <div class="divider" id="div-cards"></div>
</div>
${MODAL}${frame.data}${cardData}<script>${SCRIPT}</script><script>${TABLE_SCRIPT}</script><script>${BASES_SCRIPT}</script>
</body></html>`;
}
