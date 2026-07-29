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
import { bindings, loadCards } from "./cards.ts";
import { loadCanvas, subLabel, type CanvasData, type CanvasElement } from "./canvas.ts";
import { CallLog, type CallRecord } from "./calllog.ts";
import { type StrayNote } from "./inbox.ts";
import { loadLevels } from "./scale.ts";
import { mainMachinePath, Session } from "./session.ts";
import { compileMachine, resolveRef } from "./machines/compile.ts";
import { type MachineDecl } from "./machine.ts";

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
    case "left": return [el.x, cy];
    case "right": return [el.x + el.width, cy];
    case "top": return [cx, el.y];
    case "bottom": return [cx, el.y + el.height];
    default: {
      const ox = other.x + other.width / 2;
      return [ox < cx ? el.x : el.x + el.width, cy];
    }
  }
}

/** THE FEED PALETTE — one colour per role, none shared (owner ruling
 *  2026-07-28). The aq kind wore the agent's blue and the update kind wore
 *  the human's amber, so two of the three columns said the same thing twice.
 *
 *  Green, red and amber are RESERVED by the voice for pass, failure and
 *  attention, so no role may take them — a kind painted amber reads as a
 *  verdict. Data, not scattered literals, and a test holds it true. */
export const FEED_COLOURS: Record<string, string> = {
  time: "#566068",
  "src-agent": "#6fb3a8",
  "src-human": "#e0834a",
  "kind-call": "#8a97a3",
  "kind-update": "#7cc4e8",
  "kind-note": "#c58fe8",
  "kind-aq": "#f0879a",
};

/** What the voice already spent: pass, failure, attention. */
export const RESERVED_COLOURS: string[] = ["#4a7a55", "#e86a5f", "#e8b339"];

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

function machineSvg(source: CanvasData, activeIds: Set<string>, doneIds: Set<string>, subIds: Set<string>, meta: Record<string, StateMeta>, route?: RouteMarks): string {
  const canvas = source;
  const nodes = canvas.nodes ?? [];
  const pad = 60;
  const minX = Math.min(...nodes.map((n) => n.x)) - pad;
  const minY = Math.min(...nodes.map((n) => n.y)) - pad;
  const maxX = Math.max(...nodes.map((n) => n.x + n.width)) + pad;
  const maxY = Math.max(...nodes.map((n) => n.y + n.height)) + pad;
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const nodeOfState = new Map<string, (typeof nodes)[number]>();
  for (const n of nodes) {
    const s = stateIdOf(n);
    if (s !== undefined) nodeOfState.set(s, n);
  }
  const parts: string[] = [];

  // Groups first — presentation only, drawn behind everything.
  for (const n of nodes) {
    if (n.type !== "group") continue;
    parts.push(`<rect x="${n.x}" y="${n.y}" width="${n.width}" height="${n.height}" rx="18" class="group"/>`);
    if (n.label !== undefined && n.label !== "") {
      parts.push(`<text x="${n.x + 20}" y="${n.y + 38}" class="group-label">${esc(n.label)}</text>`);
    }
  }

  for (const edge of canvas.edges ?? []) {
    const a = byId.get(edge.fromNode);
    const b = byId.get(edge.toNode);
    if (a === undefined || b === undefined) continue;
    const [x1, y1] = sidePoint(a, (edge as { fromSide?: string }).fromSide, b);
    const [x2, y2] = sidePoint(b, (edge as { toSide?: string }).toSide, a);
    // A double-headed arrow is one edge meaning both ways, so it draws that
    // way too — the marker already orients itself at a start.
    const bothWays = (edge as { fromEnd?: string }).fromEnd === "arrow";
    parts.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="edge"${bothWays ? ' marker-start="url(#arrow)"' : ""} marker-end="url(#arrow)"/>`);
    if (edge.label !== undefined && edge.label !== "") {
      parts.push(`<text x="${(x1 + x2) / 2}" y="${(y1 + y2) / 2 - 8}" class="guard">${esc(edge.label)}</text>`);
    }
  }

  for (const n of nodes) {
    if (n.type === "text") {
      parts.push(`<g class="clickable" data-detail="comment"><rect x="${n.x}" y="${n.y}" width="${n.width}" height="${n.height}" class="comment"/>`);
      parts.push(`<foreignObject x="${n.x + 10}" y="${n.y + 6}" width="${n.width - 20}" height="${n.height - 12}"><div xmlns="http://www.w3.org/1999/xhtml" class="comment-text">${esc(n.text ?? "")}</div></foreignObject></g>`);
      continue;
    }
    const sid = stateIdOf(n);
    if (sid === undefined) continue;
    const isSub = subIds.has(sid);
    const pill = (n as { styleAttributes?: { shape?: string } }).styleAttributes?.shape === "pill";
    const cls = activeIds.has(sid) ? "state active" : doneIds.has(sid) ? "state done" : "state";
    const rx = pill ? Math.min(n.width, n.height) / 2 : 14;
    parts.push(`<g class="clickable" data-detail="state:${esc(sid)}"${isSub ? ` data-sub="${esc(sid)}"` : ""}>`);
    parts.push(`<rect x="${n.x}" y="${n.y}" width="${n.width}" height="${n.height}" rx="${rx}" class="${cls}"/>`);
    if (isSub) {
      // Sub-machine states carry a DOUBLE border.
      parts.push(`<rect x="${n.x + 8}" y="${n.y + 8}" width="${n.width - 16}" height="${n.height - 16}" rx="${Math.max(4, rx - 8)}" class="${cls} inner"/>`);
    }
    const sub = subLabel(meta[sid]?.subtitle);
    parts.push(`<text x="${n.x + n.width / 2}" y="${n.y + n.height / 2 + (sub !== undefined ? -6 : 6)}" class="label">${esc(sid)}</text>`);
    if (sub !== undefined) parts.push(`<text x="${n.x + n.width / 2}" y="${n.y + n.height / 2 + 24}" class="sublabel">${esc(sub)}</text>`);
    parts.push("</g>");
    // Condition buttons ride the node's edges: enter on the LEFT (where the
    // arrow comes in), leave on the RIGHT (in front of the arrow out).
    const mt = meta[sid];
    if (mt !== undefined) {
      const cy = n.y + n.height / 2;
      if (mt.has_entry) {
        parts.push(`<g class="clickable cond ${mt.entry_met ? "met" : "unmet"}" data-detail="cond:${esc(sid)}"><circle cx="${n.x}" cy="${cy}" r="18"/><text x="${n.x}" y="${cy + 7}" class="cond-label">${mt.entry_met ? "✓" : "!"}</text></g>`);
      }
      if (mt.has_exit) {
        parts.push(`<g class="clickable cond ${mt.exit_met ? "met" : "unmet"}" data-detail="cond:${esc(sid)}"><circle cx="${n.x + n.width}" cy="${cy}" r="18"/><text x="${n.x + n.width}" y="${cy + 7}" class="cond-label">${mt.exit_met ? "✓" : "!"}</text></g>`);
      }
    }
  }

  // THE ROUTE IS DRAWN OVER THE NODES (owner ruling 2026-07-29), reversing
  // the along-the-edges ruling of the same day. Riding the edges read as the
  // graph highlighting itself; a navigation system lays its line ON the map.
  // It is pushed LAST so it covers the boxes, exactly as a route does.
  //
  // ARRIVED MEANS CLEAR: with fewer than two stops there is no way left to
  // show, so neither line nor arrow is drawn.
  const stops: { id: string; cx: number; cy: number }[] = [];
  for (const id of route?.path ?? []) {
    const n = nodeOfState.get(id);
    // The anchor: centred across the node and a quarter down — the band
    // between its top edge and its title, so the line never crosses the words.
    if (n !== undefined) stops.push({ id, cx: n.x + n.width / 2, cy: n.y + n.height / 4 });
  }
  if (stops.length >= 2) {
    parts.push(`<path d="${splinePath(stops.map((s) => [s.cx, s.cy]))}" class="route-line"/>`);
    // A waypoint and the destination are the SAME filled dot. The owner's
    // sketch drew the destination as a ring; that was the pen, not the intent.
    for (const s of stops) {
      if (route?.target === s.id || route?.waypoints.has(s.id) === true) {
        parts.push(`<circle cx="${s.cx}" cy="${s.cy}" r="8" class="route-stop"/>`);
      }
    }
    // YOU ARE HERE: the arrow a map puts under your car, turned to face the
    // way the line is going.
    const heading = (Math.atan2(stops[1].cy - stops[0].cy, stops[1].cx - stops[0].cx) * 180) / Math.PI + 90;
    parts.push(`<path d="M 0 -12 L 10 9 L 0 4 L -10 9 Z" class="route-here" transform="translate(${stops[0].cx} ${stops[0].cy}) rotate(${heading.toFixed(1)})"/>`);
  }

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

/** One feed line's brief — the unified feed's middle column (owner ruling,
 *  v2 i9 notes: time | src | brief | result; the full record is one click
 *  away, so the brief only has to say WHAT, never everything). */
function briefFor(rec: CallRecord): string {
  const a = rec.args as Record<string, unknown>;
  switch (rec.tool) {
    case "se_tick":
      return a.back !== undefined ? `back → ${a.back}` : a.state !== undefined ? `peek ${a.state}` : a.wait === true ? "hold (wait)" : a.to !== undefined ? `tick → ${a.to}` : a.advance === true ? "tick advance" : "tick (look)";
    case "mirror_tick":
      return a.back !== undefined ? `back → ${a.back}` : a.to !== undefined ? `tick → ${a.to}` : "tick advance";
    case "mirror_check": return `check ${a.path}`;
    case "mirror_autonomy": return `autonomy → ${a.value}`;
    case "mirror_script": return `run scripts · ${a.state}`;
    case "se_update": {
      const items = Array.isArray(a.items) ? ` (+${a.items.length})` : "";
      return `${a.op}${a.node !== undefined ? ` ${a.node}` : ""}${a.brief !== undefined ? `: ${a.brief}` : ""}${items}`;
    }
    case "se_note":
    case "mirror_note": return String(a.text ?? "");
    case "se_answer": return String(a.question ?? "");
    case "mirror_tool": return `tool ${a.name}`;
    case "mirror_escape": return `escape: ${a.reason}`;
    case "mirror_form_save": return `form save ${a.name}`;
    case "mirror_form_confirm": return `form confirm ${a.name} · ${a.field}`;
    case "mirror_form_done": return `form done ${a.name}`;
    case "mirror_form_folder": return "open evidence folder";
    case "se_file_read": return `read ${a.path}${a.offset !== undefined ? ` @${a.offset}` : ""}`;
    case "se_file_write": return `write ${a.path}`;
    case "se_file_patch": return `patch ${Array.isArray(a.ops) ? a.ops.length : 0} op(s)`;
    case "se_file_move": return `move ${a.from} → ${a.to}`;
    case "se_file_delete": return `delete ${a.path}`;
    case "se_file_list": return `list ${a.dir ?? "."}`;
    case "se_file_glob": return `glob ${a.glob}`;
    case "se_file_search": return `search /${a.query}/`;
    case "se_run": return `run: ${String(a.command ?? "").replace(/\s+/g, " ").slice(0, 70)}`;
    case "se_web_fetch": return `fetch ${a.url}`;
    case "se_web_search": return `web: ${a.query}`;
    case "se_log_query": return a.ref !== undefined ? `log ref ${a.ref}` : "log query";
    case "se_exp_new": return `new expedition (${a.kind})`;
    case "se_exp_open": return `bind ${a.id}`;
    case "se_exp_close": return "close expedition";
    case "se_exp_list": return "expeditions";
    default: return rec.tool;
  }
}

/** The unified feed: this session's acts, capped at the newest 500 rows —
 *  the cap is declared in the result, never silent. Pending strays from
 *  EARLIER sessions ride on top (type "note"), so the inbox never falls
 *  out of sight; this session's notes already ride as se_note calls. */
export function feedRows(log: CallLog, since: string, pending: StrayNote[] = []): { capped: boolean; rows: Array<Record<string, unknown>> } {
  const q = log.query({ filter: { since }, limit: 501 });
  const records = q.records ?? [];
  const capped = records.length > 500;
  const rows = records.slice(-500).map((rec) => ({
    ref: rec.ref,
    ts: rec.ts,
    src: rec.tool.startsWith("mirror_") ? "human" : "agent",
    // Updates are NARRATION (bold), whatever their op — only se_note
    // strays are retro notes (italic). Two kinds, never conflated.
    type: rec.tool === "se_update" ? "update" : rec.tool === "se_note" || rec.tool === "mirror_note" ? "note" : rec.tool === "se_answer" ? "aq" : "call",
    brief: briefFor(rec).slice(0, 90),
    ok: rec.ok,
    ...(rec.ok ? {} : { clause: (rec.response as { clause?: string } | undefined)?.clause }),
    ...(rec.tool === "se_update" ? { visit: (rec.args as { visit?: string }).visit } : {}),
  }));
  const noteRows = pending
    .filter((n) => n.at < since)
    .map((n) => ({ ref: n.ref, ts: n.at, src: n.by === "human" ? "human" : "agent", type: "note", brief: n.text.slice(0, 90), ok: true, pending: true }));
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
  return { decl: compileMachine(m.root, path), canvas: loadCanvas(path) };
}

/** The SHUTDOWN CONTROL's five notches (owner design): what happens
 *  around "done". Abbreviations on the bar; click for the explanations. */
const SHUTDOWN_LEVELS = [
  { value: 1, abbr: "N", name: "no shutdown control" },
  { value: 2, abbr: "P", name: "shutdown prevention — the machine is kept awake while the walk runs" },
  { value: 3, abbr: "PI", name: "prevention + idle-on-done — done with everything, stay at idle" },
  { value: 4, abbr: "PE", name: "prevention + end-on-done — done → idle → end (session over; prevention ends with it)" },
  { value: 5, abbr: "PS", name: "prevention + power-off-on-done — done → end → the machine powers off one minute later" },
];

const STYLE = `
  * { scrollbar-color: #3a4147 #14171a; }
  ::-webkit-scrollbar { width: 10px; height: 10px; background: #14171a; }
  ::-webkit-scrollbar-thumb { background: #3a4147; border-radius: 5px; }
  body { font-family: ui-monospace, Consolas, monospace; background: #14171a; color: #d8dde2; margin: 0; height: 100vh; overflow: hidden; }
  .cols { display: flex; height: 100vh; }
  main { flex: 1; min-width: 0; display: flex; flex-direction: column; padding: 14px 18px; }
  .divider { width: 6px; cursor: col-resize; background: #2a2f34; flex: none; }
  .divider.horiz { width: auto; height: 6px; cursor: row-resize; }
  /* 465px is the width the owner settled the sidebar at by dragging it, and
     a default nobody re-drags is the only evidence a default is right. */
  aside { width: 465px; min-width: 320px; max-width: 80vw; display: flex; flex-direction: column; background: #191d21; }
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
  .crumbs { font-size: 13px; color: #7f8b96; display: flex; align-items: center; gap: 4px; text-transform: none; letter-spacing: 0; }
  .crumbs a { color: #d8dde2; text-decoration: none; }
  .crumbs a:hover { color: #e8b339; }
  .crumbs .here { color: #e8b339; }
  .crumb-arrow { position: relative; cursor: pointer; color: #7f8b96; padding: 0 3px; }
  .crumb-arrow:hover { color: #e8b339; }
  .crumb-menu { display: none; position: absolute; top: 18px; left: 0; z-index: 10; background: #22272c; border: 1px solid #3a4147; border-radius: 8px; min-width: 160px; padding: 4px; }
  .crumb-arrow.open .crumb-menu { display: block; }
  .crumb-menu a { display: block; padding: 6px 10px; border-radius: 6px; }
  .crumb-menu a:hover { background: #2a3138; }
  .widget { display: flex; flex-direction: column; border: 1px solid #2a2f34; border-radius: 10px; background: #191d21; min-height: 0; }
  .widget-head { display: flex; align-items: center; justify-content: space-between; padding: 6px 12px; border-bottom: 1px solid #2a2f34; color: #7f8b96; font-size: 12px; text-transform: uppercase; letter-spacing: .08em; }
  .widget-body { flex: 1; min-height: 0; overflow: auto; }
  .expand { background: none; border: 1px solid #3a4147; color: #7f8b96; border-radius: 6px; cursor: pointer; font: inherit; padding: 2px 8px; }
  .expand:hover { color: #e8b339; border-color: #e8b339; }
  /* THE CARD MATRIX (owner design 2026-07-29). One BIG card beside a two-wide
     grid of the rest. It is ONE grid across the whole viewport, so promoting a
     card is a class change and nothing ever moves in the DOM — a moved widget
     is a recreated widget, and a recreated terminal loses its scrollback. */
  .cards { display: grid; height: 100vh; box-sizing: border-box; gap: 8px; padding: 8px; grid-template-columns: var(--main-w, 58%) 6px 1fr 1fr; }
  .card { position: relative; display: flex; min-width: 0; min-height: 0; grid-column: var(--col); grid-row: var(--row); }
  .card > .widget { flex: 1; min-width: 0; }
  .card.main { grid-column: 1; grid-row: 1 / -1; }
  #div-cards { grid-column: 2; grid-row: 1 / -1; width: 6px; cursor: col-resize; background: #2a2f34; border-radius: 3px; }
  /* The head reserves room so the number never lands on the title. */
  .card > .widget > .widget-head { padding-left: 34px; }
  .cardnum { position: absolute; top: 7px; left: 10px; z-index: 2; display: inline-flex; align-items: center; justify-content: center; width: 17px; height: 17px; border: 1px solid #3a4147; border-radius: 4px; font-size: 11px; color: #7f8b96; cursor: pointer; }
  .cardnum:hover { color: #e8b339; border-color: #e8b339; }
  .card.main .cardnum { color: #e8b339; border-color: #e8b339; }
  .legend-row { display: flex; gap: 10px; padding: 3px 12px; font-size: 12px; }
  .legend-key { color: #e8b339; min-width: 92px; flex: none; }
  .legend-what { color: #d8dde2; }
  #w-machine { flex: 1; }
  #w-machine .widget-body { display: flex; }
  svg { width: 100%; height: 100%; cursor: grab; }
  svg.panning { cursor: grabbing; }
  .state { fill: #22272c; stroke: #4a545e; stroke-width: 2; }
  .state.active { fill: #3a2f14; stroke: #e8b339; stroke-width: 3.5; }
  .state.done { fill: #1d2b20; stroke: #4a7a55; }
  .state.inner { fill: none; }
  .clickable { cursor: pointer; }
  .clickable:hover .state, .clickable:hover .comment { stroke: #8fa0b0; }
  .label { fill: #d8dde2; font-size: 26px; text-anchor: middle; font-family: inherit; pointer-events: none; }
  .sublabel { fill: #7f8b96; font-size: 17px; text-anchor: middle; font-family: inherit; pointer-events: none; }
  .edge { stroke: #5b6772; stroke-width: 2.5; }
  .arrowhead { fill: #5b6772; }
  /* THE BLUE LINE. Blue on purpose: the voice reserves green, red and
     yellow for verdicts, and a route is not a verdict. It is a way. */
  .route-line { fill: none; stroke: #4a90d9; stroke-width: 6; stroke-linecap: round; stroke-linejoin: round; }
  .route-stop { fill: #4a90d9; stroke: #9ecbf2; stroke-width: 2; }
  .route-here { fill: #4a90d9; stroke: #9ecbf2; stroke-width: 2; }
  .guard { fill: #e8b339; font-size: 20px; text-anchor: middle; }
  .comment { fill: #1c2025; stroke: #2a2f34; }
  .group { fill: #1a1e22; stroke: #333a41; stroke-dasharray: 10 6; stroke-width: 2; }
  .group-label { fill: #5b6772; font-size: 24px; font-family: inherit; letter-spacing: .06em; }
  .comment-text { color: #7f8b96; font-size: 13px; line-height: 1.35; }
  .comment-detail { font-size: 15px; line-height: 1.55; color: #d8dde2; padding: 2px 0 10px; }
  .replink { color: #e8b339; cursor: pointer; text-decoration: underline dotted; }
  .bar { display: flex; gap: 10px; padding: 12px; }
  button.primary { background: #e8b339; color: #14171a; border: 0; border-radius: 8px; padding: 8px 14px; font: inherit; font-weight: 700; cursor: pointer; margin: 2px 4px 2px 0; }
  .panel { padding: 0 12px 12px; overflow: auto; }
  .meta { color: #7f8b96; font-size: 12px; padding: 8px 12px; }
  .todo-origin { color: #7f8b96; font-size: 11px; }
  table.kv { border-collapse: collapse; width: 100%; font-size: 12.5px; }
  table.kv td { border: 1px solid #2a2f34; padding: 4px 8px; vertical-align: top; }
  table.kv td.k { color: #e8b339; white-space: nowrap; width: 1%; }
  table.kv td.v { color: #d8dde2; word-break: break-word; }
  table.kv table.kv { margin: 2px 0; }
  .vnull { color: #7f8b96; } .vnum { color: #7cc4e8; } .vbool { color: #c58fe8; } .vstr { color: #a8c88f; }
  .prewrap { white-space: pre-wrap; }
  td.btncell { text-align: center; vertical-align: middle !important; width: 1%; }
  button.go.locked { background: #2a2f34; color: #5b6772; cursor: not-allowed; }
  .cond circle { stroke-width: 2.5; }
  .cond.unmet circle { fill: #3a2f14; stroke: #e8b339; }
  .cond.met circle { fill: #1d2b20; stroke: #4a7a55; }
  .cond-label { font-size: 20px; text-anchor: middle; fill: #d8dde2; pointer-events: none; }
  .doclist a { display: block; padding: 4px 0; }
  a.doclink { color: #7cc4e8; cursor: pointer; text-decoration: underline; }
  .docview { font-size: 13.5px; line-height: 1.55; }
  .docview h1, .docview h2, .docview h3 { color: #e8b339; }
  .docview code { background: #22272c; padding: 1px 5px; border-radius: 4px; }
  .docview pre { background: #14171a; border: 1px solid #2a2f34; border-radius: 8px; padding: 10px; overflow: auto; }
  .docview a { color: #7cc4e8; }
  button.ghost { background: #22272c; color: #d8dde2; border: 1px solid #4a545e; border-radius: 8px; padding: 6px 12px; font: inherit; cursor: pointer; }
  #w-details { flex: 1; border-radius: 0; border: 0; }
  .docheck { accent-color: #e8b339; cursor: pointer; }
  .threshold { display: flex; align-items: center; gap: 8px; color: #7f8b96; font-size: 12px; text-transform: none; letter-spacing: 0; }
  .threshold input { accent-color: #e8b339; width: 140px; }
  #thr-val { color: #e8b339; min-width: 4ch; }
  .thr-help { cursor: pointer; }
  .thr-help:hover { color: #e8b339; }
  .thr-track { display: inline-flex; flex-direction: column; align-items: stretch; }
  .thr-notches { position: relative; height: 11px; margin-top: -3px; }
  .thr-notch { position: absolute; transform: translateX(-50%); font-size: 9px; line-height: 1; color: #7f8b96; cursor: pointer; padding: 1px 3px; }
  .thr-notch:hover { color: #e8b339; }
  /* The log used to be the top 42% of a shared column, borderless so it read
     as one surface with the terminal below it. As a card of its own it takes
     the whole card and wears the normal widget border. */
  .log-filter-row { padding: 6px 12px 0; display: flex; gap: 6px; }
  .log-filter-row input { flex: 1 1 50%; min-width: 0; box-sizing: border-box; background: #14171a; border: 1px solid #2a2f34; border-radius: 6px; color: #d8dde2; font: inherit; font-size: 12px; padding: 4px 8px; }
  .log-panel { font-size: 12px; margin-top: 6px; }
  .logrow { display: flex; gap: 8px; padding: 2px 0; cursor: pointer; border-bottom: 1px dotted #22272c; align-items: baseline; }
  .logrow:hover { background: #22272c; }
  .logrow .lt { color: ${FEED_COLOURS.time}; flex: 0 0 auto; }
  .logrow .lsrc { flex: 0 0 5.5ch; color: ${FEED_COLOURS["src-agent"]}; }
  .logrow .lsrc.human { color: ${FEED_COLOURS["src-human"]}; }
  .logrow .lkind { flex: 0 0 6.5ch; }
  .logrow .lkind.k-call { color: ${FEED_COLOURS["kind-call"]}; }
  .logrow .lkind.k-update { font-weight: 700; color: ${FEED_COLOURS["kind-update"]}; }
  .logrow .lkind.k-note { font-style: italic; color: ${FEED_COLOURS["kind-note"]}; }
  .logrow .lkind.k-aq { font-weight: 700; color: ${FEED_COLOURS["kind-aq"]}; }
  .aq-q { font-weight: 700; color: ${FEED_COLOURS["kind-aq"]}; padding: 6px 0; white-space: pre-wrap; }
  #loadbar { position: fixed; top: 0; left: 0; right: 0; height: 3px; background: #22272c; z-index: 99; }
  #loadbar .fill { height: 100%; width: 30%; background: #e8b339; animation: loadslide 1s linear infinite; }
  @keyframes loadslide { 0% { margin-left: -30%; } 100% { margin-left: 100%; } }
  #loadbar .lmsg { position: fixed; top: 8px; right: 12px; color: #e8b339; font-size: 12px; }
  /* A load that never answered is a FAILURE, and the voice paints those red. */
  #loadbar.stalled { cursor: pointer; }
  #loadbar.stalled .fill { background: #e86a5f; animation: none; width: 100%; }
  #loadbar.stalled .lmsg { color: #e86a5f; }
  .aq-a { color: #cfd8dc; line-height: 1.5; padding: 4px 0; }
  .logrow .lbrief { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .logrow .lok { flex: 0 0 auto; color: #4a7a55; }
  .logrow.failed .lok { color: #e86a5f; }
  .dnode { cursor: pointer; padding: 2px 0; font-size: 13px; }
  .dnode:hover { background: #22272c; }
  .dnode.s-done { color: #4a7a55; }
  .dnode.s-open { color: #e8b339; }
  .dnode.s-obsolete { color: #5b6772; text-decoration: line-through; }
  .dnode.s-reverted { color: #e86a5f; text-decoration: line-through; }
  /* DEFERRED IS NOT KILLED. It is still owed, so it keeps the open colour;
     it is owed SOMEWHERE ELSE, so it leans. Never struck through - the
     strike is what says a point died, and this one did not. */
  .dnode.s-deferred { color: #e8b339; font-style: italic; text-decoration: none; }
  .dnode.dactive { font-weight: 700; }
  .dnode.dsel { background: #22272c; }
  .dinfo { margin-top: 10px; border-top: 1px solid #2a2f34; padding-top: 8px; }
  .formfield { width: 100%; min-height: 70px; background: #14171a; border: 1px solid #2a2f34; border-radius: 6px; color: #d8dde2; font: inherit; font-size: 12.5px; padding: 6px; box-sizing: border-box; margin-top: 4px; }
  .prefill { border: 1px dashed #e8b339; border-radius: 6px; padding: 6px 8px; margin: 4px 0; }
  .prefill button { margin-top: 4px; }
  #modal { display: none; position: fixed; inset: 0; background: rgba(20,23,26,.8); z-index: 50; align-items: center; justify-content: center; }
  .modal-box { width: min(760px, 92vw); max-height: 86vh; display: flex; flex-direction: column; background: #191d21; border: 1px solid #3a4147; border-radius: 12px; }
  .modal-body { padding: 12px 16px; overflow: auto; font-size: 13px; }
  a.toollink { color: #7cc4e8; text-decoration: underline; cursor: pointer; margin-right: 10px; }
  #toast { position: fixed; left: 14px; bottom: 14px; background: #22272c; border: 1px solid #3a4147; border-radius: 8px; padding: 8px 14px; color: #d8dde2; font-size: 12.5px; z-index: 90; display: none; }
  #link-lost { position: fixed; left: 0; right: 0; top: 0; z-index: 99; background: #4a3a14; color: #e8b339; text-align: center; padding: 7px; font-size: 13px; letter-spacing: .04em; }
  #over { position: fixed; inset: 0; background: rgba(20,23,26,.94); z-index: 100; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; }
  #over .over-box { color: #e8332a; font-size: 62px; font-weight: 800; letter-spacing: .12em; border: 6px solid #e8332a; border-radius: 18px; padding: 26px 52px; }
  #over .over-sub { color: #e86a5f; font-size: 15px; }
`;

const SCRIPT = `
// Re-read after every morph — a morph never re-runs a script tag.
let D = JSON.parse(document.getElementById("se-data").textContent);

function jsonTable(v) {
  if (v === null || v === undefined) return '<span class="vnull">null</span>';
  if (typeof v === "number") return '<span class="vnum">' + v + "</span>";
  if (typeof v === "boolean") return '<span class="vbool">' + v + "</span>";
  if (typeof v === "string") {
    const looksLikePath = (v.startsWith("workspace/") || v.startsWith("product/")) && !v.includes(" ") && v.lastIndexOf(".") > v.lastIndexOf("/");
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
    if (v.length > 3) return '<details><summary style="cursor:pointer;color:#7f8b96">' + v.length + " items</summary>" + table + "</details>";
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
  if (!el) return;
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
  return '<table class="kv">' + s.next.map((n, i) => {
    const inner = jsonTable({ to: n.to, ...(n.statement ? { statement: n.statement } : {}), role: n.role, ...(n.guard ? { guard: n.guard } : {}) });
    const unlocked = here && s.exit_met && n.enter_met;
    // The locked tooltip NAMES what is missing — never a bare "not met".
    const exitMiss = s.exit ? Object.entries(s.exit).filter(([, c]) => !c.met).map(([k]) => "condition " + k) : [];
    const title = unlocked
      ? "tick: leave " + id + ", enter " + n.to
      : !s.exit_met
        ? "leaving " + id + " waits on:\\n" + (exitMiss.join("\\n") || "its exit conditions")
        : "entering " + n.to + " waits on:\\n" + ((n.missing || []).join("\\n") || "its entry conditions");
    const btn = here
      ? '<button class="primary go' + (unlocked ? "" : " locked") + '" data-to="' + n.to + '"' + (unlocked ? "" : " disabled") +
        ' title="' + escText(title) + '">▶</button>'
      : "";
    return '<tr><td class="k">' + i + '</td><td class="v">' + inner + '</td>' + (here ? '<td class="btncell">' + btn + "</td>" : "") + "</tr>";
  }).join("") + "</table>";
}
function docRow(p) {
  // One doc, one row: the human's proof-of-read checkbox (one per VERSION
  // - an edited doc unchecks itself) plus the readable link.
  const box = '<input type="checkbox" class="docheck" data-path="' + p.path + '" title="' + (p.checked ? "read (this version)" : "check = I read this version") + '"' + (p.checked ? " checked disabled" : "") + ">";
  return '<div style="padding:2px 0 2px 14px">' + box + ' <a class="doclink" data-path="' + p.path + '">' + p.path + "</a></div>";
}
function pulledView(pulled) {
  const bySource = {};
  for (const p of pulled) for (const src of p.sources) (bySource[src] ??= []).push(p);
  return Object.entries(bySource).map(([srcName, docs]) => {
    const done = docs.filter((d) => d.checked).length;
    return '<details><summary style="cursor:pointer;color:#7f8b96">' + srcName + " (" + done + "/" + docs.length + " read)</summary>" +
      docs.map(docRow).join("") + "</details>";
  }).join("");
}
function stateDetail(id) {
  const s = D.states[id] ?? {};
  const bare = Object.assign({}, s); delete bare.next; delete bare.pulled; delete bare.script; delete bare.was_filled; delete bare.legal_tools;
  let html = jsonTable(bare);
  // Legal tools — human-callable ones are LINKS everywhere they appear
  // (parity law); a link outside its state just toasts "tool disabled".
  const tools = [...new Set(s.legal_tools || [])];
  let extra = "";
  if (tools.length > 0) {
    const link = (t) => '<a class="toollink" data-tool="' + t + '">' + t + "</a>";
    const line = (t) => '<div style="padding:2px 0 2px 14px">' + (HUMAN_TOOLS[t] !== undefined ? link(t) : escText(t)) + "</div>";
    // "all" stays written as all — and EXPANDS into the human-callable
    // links (parity law), the same collapsible pattern the pull uses.
    const inner = tools.includes("all")
      ? '<details><summary style="cursor:pointer;color:#7f8b96">all — the human-callable set</summary>' + Object.keys(HUMAN_TOOLS).map(line).join("") + "</details>"
      : tools.map(line).join("");
    extra += '<tr><td class="k">legal tools</td><td class="v">' + inner + "</td></tr>";
  }
  if (s.pulled && s.pulled.length > 0) {
    extra += '<tr><td class="k" title="derived by the machine, not authored">pulled</td><td class="v">' + pulledView(s.pulled) + "</td></tr>";
  }
  if (extra) {
    html = html.endsWith("</table>") ? html.slice(0, -8) + extra + "</table>" : html + '<table class="kv">' + extra + "</table>";
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
        + '<tr><td class="k">report</td><td class="v"><a class="replink" data-exp="' + escText(e.id) + '" data-path="product/spec/expeditions/' + escText(e.id) + '/report.md" data-title="report · ' + escText(e.id) + '" title="click: modal · ctrl-click: new tab · shift-click: new window">report.md</a></td></tr>'
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
  if (WALK_HERE && s.was_filled && id !== CURRENT && D.describe.status === "open") {
    html += '<div style="padding:8px 0"><button class="primary jump" data-state="' + id + '" title="everything downstream is superseded; its evidence and checks are invalidated">↩ return to this state</button></div>';
  }
  if (WALK_HERE && id === CURRENT && s.kind === "end" && (!s.next || s.next.length === 0) && D.describe.breadcrumb.length > 1) {
    const parent = D.describe.breadcrumb[0];
    html += '<div class="meta" style="padding:8px 0 4px">next</div>' +
      '<table class="kv"><tr><td class="v">return to ' + parent + '</td><td class="btncell"><button class="primary go" data-to="" title="tick: leave the sub-machine">▶</button></td></tr></table>';
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
// The card half was missed because the matrix landed after this rule did: the
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
const PLACE = [
  ["detail", () => CURRENT_DETAIL],
  ["card", () => CARD_NOW],
  // Frozen is a place too: a snapshot window that follows a link inside
  // itself stays a snapshot. A live window reports null and never picks it
  // up, so the flag spreads nowhere it does not belong.
  ["frozen", () => (FROZEN ? "1" : null)],
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
function navigateTo(url, label) {
  navigatingAway = true;
  showLoading(label);
  url = withPlace(url);
  location.href = url;
}
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
    morph(document.body, doc.body);
    rebind();
  } catch (e) {
    location.href = url; // a failed morph must never strand the reader
  } finally {
    refreshInFlight = false;
    hideLoading(); // THE LOAD SETTLED — win or lose, the bar goes
  }
}
document.addEventListener("click", async (ev) => {
  const c = ev.target.closest ? ev.target.closest(".docheck") : null;
  if (c) { if (c.disabled) return; ev.preventDefault(); c.disabled = true; await fetch("/check", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ path: c.dataset.path }) }); refresh(); return; }
  const j = ev.target.closest ? ev.target.closest(".jump") : null;
  if (j) { showLoading("jumping back to " + j.dataset.state); await fetch("/tick", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ back: j.dataset.state }) }); navigateTo("/", "loading the walk"); return; }
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
    row += c.met ? '<span style="color:#4a7a55">✓ met</span>' : '<span style="color:#e8b339">! unmet</span>';
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
      if (sc.running) row += '<div style="color:#e8b339">running — the page follows; the result lands here</div>';
      else if (sc.ran) row += '<div style="color:' + (sc.ok ? "#4a7a55" : "#e86a5f") + ';white-space:pre-wrap;font-size:12px">' + sc.output.replace(/&/g,"&amp;").replace(/</g,"&lt;") + "</div>";
      else row += '<div style="color:#7f8b96">not run yet</div>';
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
  html += '<div class="comment-detail">' + (s.guidance || "").replace(/&/g,"&amp;").replace(/</g,"&lt;") + "</div>";
  return ["conditions · " + id, html];
}
// THE FORM SURFACE — an evidence form rendered to fill: required fields
// as textareas, each unconfirmed prefill with its OWN confirm button (the
// prefill law: one confirmation per prefill, never in bulk), the evidence
// folder one click away, done runs the same lint the agent's tick runs.
async function showForm(name) {
  const r = await fetch("/api/form?name=" + encodeURIComponent(name));
  const f = await r.json();
  if (f.kind === "rejected" || f.error) {
    // Plain words at the human — never raw rejection JSON.
    openModal("form · " + name,
      '<div class="comment-detail">' + escText(f.expected || f.error || "") + "</div>" +
      '<div class="meta">' + escText(f.got || "") + "</div>" +
      (f.remedy && f.remedy.note ? '<div class="comment-text">' + escText(f.remedy.note) + "</div>" : ""));
    return;
  }
  const ro = f.preview === true;
  let html = '<div class="comment-text">' + escText(f.statement || "") + "</div>";
  // The GRAPH-IS-EVIDENCE gate, visible to the human: the page cannot
  // pass over open decision points — they surface under problems below.
  html += '<div class="meta">gate: every open decision point of this record must be resolved (done · obsolete · revert · defer) before this page passes</div>';
  html += '<div class="meta">' + escText(f.instance) + (ro ? " · template preview — filling happens inside an expedition" : " · status: " + escText(f.status) + (f.met ? ' · <span style="color:#4a7a55">✓ passes</span>' : "")) + "</div>";
  (f.fields || []).forEach((fl) => {
    html += '<div style="padding:8px 0 2px"><b>' + escText(fl.name) + "</b>" + (fl.required ? ' <span style="color:#e8b339">required</span>' : "") + "</div>";
    html += '<div class="comment-text">' + escText(fl.description) + "</div>";
    if (ro) return;
    (fl.prefills || []).forEach((p, i) => {
      html += '<div class="prefill"><div class="comment-text">prefill — unconfirmed:</div><div>' + escText(p) + '</div><button class="primary confirmpre" data-form="' + name + '" data-field="' + escText(fl.name) + '" data-index="' + i + '">confirm</button></div>';
    });
    html += '<textarea class="formfield" data-field="' + escText(fl.name) + '">' + escText(fl.content) + "</textarea>";
  });
  if (!ro) {
    html += '<div class="meta" style="padding:6px 0 2px">files — <a class="doclink openfolder" data-form="' + name + '">open ' + escText(f.evidence_dir) + "</a></div>";
    (f.files || []).forEach((fi) => { html += "<div>" + (fi.present ? "✓ " : '<span style="color:#e86a5f">✗ </span>') + escText(fi.name) + "</div>"; });
    if (f.problems && f.problems.length) html += '<div style="color:#e8b339;padding:6px 0">' + f.problems.map(escText).join("<br>") + "</div>";
    html += '<div style="padding:10px 0"><button class="primary saveform" data-form="' + name + '">save</button> <button class="primary doneform" data-form="' + name + '" title="sets status done and runs the lint">done</button></div>';
  }
  openModal("form · " + name, html);
}
async function formPost(path, body) {
  await fetch(path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
}
document.addEventListener("click", async (ev) => {
  const of = ev.target.closest ? ev.target.closest(".openform") : null;
  if (of) { void showForm(of.dataset.form); return; }
  const cp = ev.target.closest ? ev.target.closest(".confirmpre") : null;
  if (cp) { await formPost("/form/confirm", { name: cp.dataset.form, field: cp.dataset.field, index: Number(cp.dataset.index) }); void showForm(cp.dataset.form); return; }
  const sv = ev.target.closest ? ev.target.closest(".saveform") : null;
  if (sv) {
    const fields = {};
    document.querySelectorAll(".formfield").forEach((t) => { fields[t.dataset.field] = t.value; });
    await formPost("/form/save", { name: sv.dataset.form, fields });
    void showForm(sv.dataset.form);
    return;
  }
  const dn2 = ev.target.closest ? ev.target.closest(".doneform") : null;
  if (dn2) {
    const fields = {};
    document.querySelectorAll(".formfield").forEach((t) => { fields[t.dataset.field] = t.value; });
    await formPost("/form/save", { name: dn2.dataset.form, fields });
    await formPost("/form/done", { name: dn2.dataset.form });
    void showForm(dn2.dataset.form);
    return;
  }
  const ofo = ev.target.closest ? ev.target.closest(".openfolder") : null;
  if (ofo) { await formPost("/form/folder", { name: ofo.dataset.form }); return; }
});

async function openDoc(path, returnKey) {
  const r = await fetch("/doc?path=" + encodeURIComponent(path));
  const d = await r.json();
  showDetails(path, '<div style="padding:2px 0 10px"><button class="ghost back" data-return="' + returnKey + '">‹ back</button></div><div class="docview">' + d.html + "</div>");
}
function detailFor(key) {
  if (key.startsWith("log:")) { void openLogDetail(key.slice(4)); return ["log entry", '<div class="meta">loading…</div>']; }
  if (key.startsWith("cond:")) return condDetail(key.slice(5));
  if (key === "comment") {
    const txt = (D.comment || "").replace(/&/g,"&amp;").replace(/</g,"&lt;");
    return ["machine: " + D.viewed.id, '<div class="comment-detail">' + txt + "</div>" + jsonTable(D.viewed)];
  }
  if (key.startsWith("state:")) { const id = key.slice(6); return ["state: " + id, stateDetail(id)]; }
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
  const go = ev.target.closest ? ev.target.closest(".go") : null;
  if (go) {
    const body = go.dataset.to ? { to: go.dataset.to } : { advance: true };
    showLoading("walking to " + (go.dataset.to || "the next state"));
    await fetch("/tick", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    navigateTo("/", "loading the walk");
  }
});
let CURRENT_DETAIL = null;
document.addEventListener("click", (ev) => {
  const arrow = ev.target.closest ? ev.target.closest(".crumb-arrow") : null;
  document.querySelectorAll(".crumb-arrow.open").forEach((a) => { if (a !== arrow) a.classList.remove("open"); });
  if (arrow) { arrow.classList.toggle("open"); return; }
  const g = ev.target.closest ? ev.target.closest(".clickable") : null;
  if (g && g.dataset.detail) { CURRENT_DETAIL = g.dataset.detail; const [t, h] = detailFor(g.dataset.detail); showDetails(t, h); }
});
// Double-click a sub-machine state: enter it as a VIEWER (walk unmoved).
document.addEventListener("dblclick", (ev) => {
  const g = ev.target.closest ? ev.target.closest(".clickable") : null;
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
  if (ev.ctrlKey || ev.metaKey) { window.open(frozenUrl(url), "_blank"); return; }
  if (ev.shiftKey) { window.open(frozenUrl(url), "_blank", "popup,width=1100,height=800"); return; }
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
if (CURRENT && D.states[CURRENT] && WALK_HERE) { CURRENT_DETAIL = "state:" + CURRENT; showDetails("state: " + CURRENT, stateDetail(CURRENT)); }
// A bookmark or an F5 still deep-links to the pane that was open.
const DETAIL_PARAM = new URLSearchParams(location.search).get("detail");
if (DETAIL_PARAM) { CURRENT_DETAIL = DETAIL_PARAM; const dp = detailFor(DETAIL_PARAM); showDetails(dp[0], dp[1]); }
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
  const nEl = document.getElementById("log-note");
  if (nEl) {
    nEl.addEventListener("focus", () => showDetails("drop a note", '<div class="comment-detail">A stray — an idea, a bug, a better way. Enter captures it to the inbox with your hand stamped; a retro drains it later.</div>'));
    nEl.addEventListener("keydown", async (ev2) => {
      if (ev2.key !== "Enter" || nEl.value.trim() === "") return;
      await fetch("/note", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text: nEl.value }) });
      nEl.value = "";
      refreshLog();
    });
  }
}
async function openLogDetail(ref) {
  CURRENT_DETAIL = "log:" + ref;
  const r = await fetch("/api/log?ref=" + encodeURIComponent(ref));
  const rec = await r.json();
  if (rec.tool === "se_update" && rec.args && rec.args.visit) { await showDecisions(rec.args.visit, null); return; }
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
function renderDecisions(sel) {
  const g = DECISION_GRAPH;
  if (!g) return;
  const kids = {};
  g.nodes.forEach((n) => { (kids[n.parent || ""] = kids[n.parent || ""] || []).push(n); });
  const badge = { open: "●", done: "✓", obsolete: "⊘", reverted: "↩", deferred: "→" };
  function tree(pid, depth) {
    return (kids[pid] || []).map((n) =>
      '<div class="dnode s-' + n.status + (n.id === g.active ? " dactive" : "") + (n.id === sel ? " dsel" : "") + '" data-node="' + n.id + '" style="margin-left:' + depth * 14 + 'px" title="' + n.id + " · " + n.status + '">' + badge[n.status] + " " + escText(n.brief) + "</div>" + tree(n.id, depth + 1)
    ).join("");
  }
  let html = tree("", 0) || '<div class="meta">no decisions recorded for ' + escText(g.visit) + "</div>";
  if (sel) {
    const n = g.nodes.find((x) => x.id === sel);
    if (n) html += '<div class="dinfo">' + jsonTable(Object.assign({ id: n.id, brief: n.brief, status: n.status }, n.resolution ? { resolution: n.resolution } : {}, { opened: n.at }, n.closed_at ? { closed: n.closed_at } : {})) + "</div>";
  }
  showDetails("decisions · " + g.visit, html);
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
function hideLoading() {
  loadToken++; // any timer still holding the old token is now a no-op
  if (loadTimer !== null) { clearTimeout(loadTimer); loadTimer = null; }
  const el = document.getElementById("loadbar");
  if (el !== null) el.remove();
}
function showLoading(label) {
  hideLoading(); // one load at a time; a second start supersedes the first
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
    '<tr' + (sel === l.value ? ' style="background:#22272c"' : "") + '><td class="k">' + l.abbr + " · " + l.value + '</td><td class="v">' + l.name + "</td></tr>").join("");
  showDetails("the autonomy scale", '<table class="kv">' + rows + '</table><div style="padding:8px 0 0"><a class="doclink" data-path="product/guidance/authoring/machines.md">the full scale — machines.md · Priority</a></div>');
}
// THE SHUTDOWN CONTROL — five notches; same grammar as the autonomy bar.
const SD_LEVELS = ${JSON.stringify(SHUTDOWN_LEVELS)};
const sdEl = document.getElementById("sd");
function sdAbbr(v) { const l = SD_LEVELS.find((x) => x.value === Number(v)); return l ? l.abbr : String(v); }
function sdHelp(sel) {
  const rows = SD_LEVELS.map((l) =>
    '<tr' + (sel === l.value ? ' style="background:#22272c"' : "") + '><td class="k">' + l.abbr + " · " + l.value + '</td><td class="v">' + escText(l.name) + "</td></tr>").join("");
  showDetails("the shutdown control", '<table class="kv">' + rows + "</table>");
}
if (sdEl) {
  const lbl2 = document.getElementById("sd-val");
  sdEl.addEventListener("input", () => { if (lbl2) lbl2.textContent = sdAbbr(sdEl.value); });
  sdEl.addEventListener("change", async () => {
    await fetch("/shutdown", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ value: Number(sdEl.value) }) });
  });
}
document.addEventListener("click", (ev) => {
  const sn = ev.target.closest ? ev.target.closest(".sd-notch") : null;
  if (sn && sdEl) {
    const v = Number(sn.dataset.level);
    sdEl.value = v;
    const lbl2 = document.getElementById("sd-val");
    if (lbl2) lbl2.textContent = sdAbbr(v);
    void fetch("/shutdown", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ value: v }) });
    sdHelp(v);
    return;
  }
  const sh = ev.target.closest ? ev.target.closest(".sd-help") : null;
  if (sh) { sdHelp(null); return; }
  const n = ev.target.closest ? ev.target.closest(".thr-notch") : null;
  if (n && thr) {
    const v = Number(n.dataset.level);
    thr.value = v;
    const lbl = document.getElementById("thr-val");
    if (lbl) lbl.textContent = v.toFixed(2);
    void fetch("/autonomy", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ value: v }) });
    levelHelp(v);
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
let pollBusy = null;
let ACTIVE_AT_RENDER = JSON.stringify(D.describe.active || []);
let sawError = false;
let deathTimer = null;
// A frozen window never opens the stream — that is the whole of freezing.
if (!FROZEN) {
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
  if (a.status === "closed") { sessionOver("the machine reached end — the walk is complete"); return; }
  if (a.gone) { sessionOver("the console quit — the server has stopped, the walk was left standing"); return; }
  if (thr && document.activeElement !== thr && Number(thr.value) !== a.autonomy) {
    thr.value = a.autonomy;
    const lbl = document.getElementById("thr-val");
    if (lbl) lbl.textContent = Number(a.autonomy).toFixed(2);
  }
  if (sdEl && document.activeElement !== sdEl && Number(sdEl.value) !== a.shutdown) {
    sdEl.value = a.shutdown;
    const lbl2 = document.getElementById("sd-val");
    if (lbl2) lbl2.textContent = sdAbbr(a.shutdown);
  }
  if (logPanel && a.acts !== lastActs) { lastActs = a.acts; refreshLog(); }
  if (JSON.stringify(a.active || []) !== ACTIVE_AT_RENDER) { refresh(); return; }
  // A script run finishing elsewhere (agent tick, other window) lands its
  // result — refresh, keeping the open pane.
  if (pollBusy === true && a.busy === false) { refresh(); return; }
  pollBusy = a.busy;
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
    theme: { background: "#14171a", foreground: "#d8dde2" },
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

const MODAL = '<div id="modal"><div class="modal-box"><div class="widget-head"><span id="modal-title"></span><button class="expand" id="modal-close">✕</button></div><div class="modal-body" id="modal-body"></div></div></div><div id="toast"></div>';

function widgetHead(title: string, widgetId: string, url: string): string {
  return `<div class="widget-head"><span>${esc(title)}</span><button class="expand" data-widget="${widgetId}" data-url="${esc(url)}" title="expand · ctrl-click: new tab · shift-click: new window — both open frozen on what this card is showing">⛶</button></div>`;
}

export function renderMirror(m: MirrorState, widget?: "machine" | "details" | "log" | "terminal", view?: string, card?: string): string {
  const info = m.session.describe() as { active: string[]; status: string };
  // The scale is READ from machines/scale.md — the Obsidian-editable
  // truth; an owner edit shows on the next reload.
  const levels = loadLevels(m.root);
  const walkMachine = m.session.currentMachine();
  const { decl, canvas } = viewedMachine(m, view ?? walkMachine.id);
  const viewingWalk = decl.id === walkMachine.id;

  // Highlights follow the WALK; the view may be elsewhere.
  const leafActive = viewingWalk ? new Set(info.active.map((a) => a.split("/").pop()!)) : new Set<string>();
  if (!viewingWalk && decl.id === m.session.machine.id) {
    // Viewing main while the walk is inside a sub: the sub state is the live one.
    leafActive.add(m.session.breadcrumb()[1]);
  }
  const history = m.session.instance.history ?? [];
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
  // THE ROUTE, PROJECTED ONTO THIS DRAWING. A broken or unreachable target
  // must never take the picture down with it, so the marks simply go
  // missing and the machine still renders.
  let marks: RouteMarks | undefined;
  try {
    const r = m.session.route(m.session.target);
    const mainId = m.session.machine.id;
    const { waypoints, path: hops } = routeOverlay(r.steps, decl.id, mainId);
    const localOf = (q: string): string | undefined => {
      if (decl.id === mainId) return q.split("/")[0];
      return q.startsWith(`${decl.id}/`) ? q.slice(decl.id.length + 1).split("/")[0] : undefined;
    };
    marks = {
      waypoints,
      path: hops,
      ...(r.found && localOf(r.target) !== undefined ? { target: localOf(r.target) } : {}),
    };
  } catch { /* no route, no marks - the drawing stands either way */ }
  const svg = machineSvg(canvas, leafActive, done, subIds, meta, marks);

  // Breadcrumbs describe the VIEW: main [›subs] [ › sub [›its subs] ].
  const mainSubs = m.session.machine.states.filter((s) => s.submachine !== undefined).map((s) => s.id);
  const crumbArrow = (subs: string[]): string =>
    subs.length === 0
      ? ""
      : `<span class="crumb-arrow">›<span class="crumb-menu">${subs.map((s) => `<a href="/?view=${encodeURIComponent(s)}">${esc(s)}</a>`).join("")}</span></span>`;
  // The crumbs walk the PARENT CHAIN — a nested machine shows under its
  // real parent, never directly under main (owner ruling 2026-07-28).
  const chain = m.session.viewChain(decl.id);
  let crumbs = chain
    .map((id, i) => {
      const label = i === chain.length - 1 ? `<b class="here">${esc(id)}</b>` : `<a href="/?view=${encodeURIComponent(id)}">${esc(id)}</a>`;
      const arrow =
        i === 0
          ? crumbArrow(mainSubs)
          : i === chain.length - 1
            ? crumbArrow(decl.states.filter((s) => s.submachine !== undefined).map((s) => s.id))
            : '<span style="color:#7f8b96;padding:0 3px">›</span>';
      return label + arrow;
    })
    .join("");

  // ONE LIST FOR THE WHOLE RENDER. expeditionList() spawns git per record
  // and does not vary per state; calling it inside the loop made the archive
  // cost a spawn for every record TIMES every record, blocking the server.
  const archived = decl.states.some((s) => s.tags?.includes("archive-record"))
    ? (m.session.expeditionList() as { archive: { id: string }[] }).archive
    : [];
  const states: Record<string, unknown> = {};
  for (const s of decl.states) {
    states[s.id] = {
      id: s.id,
      kind: s.kind,
      statement: s.statement,
      guidance: s.guidance,
      priority: s.priority,
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
      ...(s.exit?.script !== undefined || s.entry?.script !== undefined
        ? { script: m.session.scriptStatus(decl, s) }
        : {}),
      pulled: m.session.pulled(decl, s),
      next: s.edges.map((e) => {
        const t = decl.states.find((st) => st.id === e.to);
        return {
          to: e.to,
          role: e.role,
          ...(e.guard !== undefined ? { guard: e.guard } : {}),
          ...(t !== undefined ? { kind: t.kind, statement: t.statement, priority: t.priority } : {}),
          // The human's ▶ lock: explicit entry conditions AND the pull —
          // every doc entering demands, checked at its current version. A
          // locked edge carries WHAT is missing (the tooltip names it).
          enter_met: t === undefined ? true : m.session.entryReadyHuman(decl, t),
          ...(t !== undefined && !m.session.entryReadyHuman(decl, t) ? { missing: m.session.entryMissingHuman(decl, t) } : {}),
        };
      }),
    };
  }
  const comment = (canvas.nodes ?? []).find((n) => n.type === "text")?.text ?? "";
  const data = `<script type="application/json" id="se-data">${JSON.stringify({
    describe: m.session.describe(),
    packet: m.session.tickInfo(),
    lastPacket: m.lastPacket ?? null,
    states,
    comment,
    viewingWalk,
    viewed: { id: decl.id, reentry: decl.reentry, initial: decl.initial, states: decl.states.map((s) => s.id) },
    history: history.slice(-20),
    levels,
  }).replace(/</g, "\\u003c")}</script>`;

  // The slider — THE AUTONOMY: which states the agent enters by itself
  // (priority <= autonomy). 0 = the human clicks through everything
  // (manual mode is just this); 1 = fully autonomous. Live: changes take
  // effect on the agent's next tick.
  const thr = m.session.autonomy;
  const notches = levels.map((l) => `<span class="thr-notch" data-level="${l.value}" style="left:${l.value * 100}%" title="${esc(l.name)} — click: autonomy ${l.value}">${l.abbr}</span>`).join("");
  const slider = `<span class="threshold" title="the agent enters only states with priority ≤ autonomy — the notches are the authored levels, click one to jump there"><span class="thr-help" title="click: the scale, explained in details">autonomy</span><span class="thr-track"><input id="thr" type="range" min="0" max="1" step="0.01" value="${thr}" list="thr-ticks"><datalist id="thr-ticks">${levels.map((l) => `<option value="${l.value}"></option>`).join("")}</datalist><span class="thr-notches">${notches}</span></span><span id="thr-val">${thr.toFixed(2)}</span></span>`;
  const sd = m.session.shutdown;
  const sdNotches = SHUTDOWN_LEVELS.map((l) => `<span class="sd-notch thr-notch" data-level="${l.value}" style="left:${((l.value - 1) / 4) * 100}%" title="${esc(l.name)}">${l.abbr}</span>`).join("");
  const sdAbbrNow = SHUTDOWN_LEVELS.find((l) => l.value === sd)?.abbr ?? String(sd);
  const sdBar = `<span class="threshold" title="shutdown control — what happens around done"><span class="sd-help thr-help" title="click: the levels, explained in details">shutdown</span><span class="thr-track"><input id="sd" type="range" min="1" max="5" step="1" value="${sd}" list="sd-ticks"><datalist id="sd-ticks">${SHUTDOWN_LEVELS.map((l) => `<option value="${l.value}"></option>`).join("")}</datalist><span class="thr-notches">${sdNotches}</span></span><span id="sd-val">${esc(sdAbbrNow)}</span></span>`;
  // Escape has a hand-side affordance too (parity law): only while a
  // sub-machine other than boot is being walked.
  const crumbTrail = m.session.breadcrumb();
  const escapeBtn = crumbTrail.length > 1 && crumbTrail[1] !== "boot" ? `<button class="ghost" id="escape-btn" title="escape to idle — the machine is left standing, the reason is recorded">⤴ escape</button>` : "";
  // The way home when the view holds still elsewhere: the header names
  // the walk's position; clicking it jumps the view there.
  const curLeaf = info.active[0] ?? "";
  const curBtn = curLeaf === "" ? "" : `<button class="ghost" id="cur-state" data-machine="${esc(walkMachine.id)}" title="the walk stands here — click: jump the view to it">☉ ${esc(curLeaf)}</button>`;
  const machineWidget = `<div class="widget" id="w-machine"><div class="widget-head"><span class="crumbs">${crumbs}</span><span style="display:flex;align-items:center;gap:10px">${curBtn}${slider}${sdBar}${escapeBtn}<button class="expand" data-widget="w-machine" data-url="/widget/machine?view=${encodeURIComponent(decl.id)}" title="expand · ctrl-click: new tab · shift-click: new window — both open frozen on what this card is showing">⛶</button></span></div><div class="widget-body">${svg}</div></div>`;
  const detailsWidget = `<div class="widget" id="w-details">${widgetHead("details", "w-details", "/widget/details")}
    ${info.status === "closed" ? '<div class="meta" style="color:#e86a5f">machine closed</div>' : ""}
    <div class="meta" id="details-title" data-morph-ignore>—</div>
    <div class="panel" id="details" data-morph-ignore></div>
  </div>`;
  // The unified feed sits ABOVE details (owner ruling 2026-07-26) — rows
  // load and refresh client-side off /api/log; only present with a log.
  const logWidget = m.log === undefined ? "" : `<div class="widget" id="w-log">${widgetHead("log", "w-log", "/widget/log")}
    <div class="log-filter-row"><input id="log-filter" placeholder="filter the feed"><input id="log-note" placeholder="drop a note — Enter captures it"></div>
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
  const termWidget = (standalone: boolean) => `<div class="widget${standalone ? "" : " no-host"}" id="w-terminal" data-morph-ignore>${widgetHead("terminal", "w-terminal", "/widget/terminal")}
    <div class="panel term-panel" id="term-body"><div class="meta" style="padding:10px 12px">no agent connected — the card keeps its slot, so no number ever shifts</div></div>
  </div>`;
  // THE CHAT CARD KEEPS ITS SLOT (owner 2026-07-29), superseding the older
  // rule that the pane ships hidden until a host answers. An agent can connect
  // or drop MID-SESSION, and a card that vanishes renumbers every card after
  // it — under the reader's hand, while they are using the numbers.
  const terminalWidget = termWidget(true);

  if (widget === "terminal") {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>se · terminal</title><style>${STYLE} #w-terminal{flex:1;height:auto;border-bottom:0}</style></head>
<body><div class="cols"><aside id="left" style="width:100vw;max-width:100vw">${termWidget(true)}</aside></div>${MODAL}${data}<script>${SCRIPT}</script></body></html>`;
  }
  if (widget === "log") {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>se · log</title><style>${STYLE} #w-log{flex:1;border-bottom:0}</style></head>
<body><div class="cols"><aside id="sidebar" style="width:100vw;max-width:100vw">${logWidget}</aside></div>${MODAL}${data}<script>${SCRIPT}</script></body></html>`;
  }

  if (widget === "machine") {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>se · machine</title><style>${STYLE} main{padding:10px}</style></head>
<body><div class="cols"><main>${machineWidget}</main></div>${MODAL}${data}<script>${SCRIPT}</script></body></html>`;
  }
  if (widget === "details") {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>se · details</title><style>${STYLE}</style></head>
<body><div class="cols"><aside id="sidebar" style="width:100vw;max-width:100vw">${detailsWidget}</aside></div>${MODAL}${data}<script>${SCRIPT}</script></body></html>`;
  }
  // THE CARD MATRIX (owner design 2026-07-29). The card list and its ORDER are
  // the product's, in product/cards.md — v3 exists to work on other products,
  // and another product wants other cards.
  const cardList = loadCards(m.root);
  const byWidget: Record<string, string> = {
    terminal: terminalWidget,
    machine: machineWidget,
    log: logWidget,
    details: detailsWidget,
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
    .map((c, i) => `<div class="card${c.id === now ? " main" : ""}" id="card-${esc(c.id)}" style="${cellAt(i)}"><span class="cardnum" title="promote this card — the same as pressing ${c.n}">${c.n}</span>${filled(c) ? byWidget[c.widget as string] : nothingYet(c.title)}</div>`)
    .join("\n  ");
  // THE LEGEND RENDERS FROM THE REGISTRY. Declare a key there and it shows up
  // here by itself; a hand-kept list drifts, and a stale legend is worse than
  // none. It sits in the promoted card's vacated slot, so its position also
  // says which card is up front.
  const legendRows = bindings(cardList)
    .map((b) => `<div class="legend-row"><span class="legend-key">${esc(b.keys)}</span><span class="legend-what">${esc(b.label)}</span></div>`)
    .join("");
  const nowAt = Math.max(0, cardList.findIndex((c) => c.id === now));
  const legendHtml = `<div class="card" id="card-legend" style="${cellAt(nowAt)}"><div class="widget" id="w-legend"><div class="widget-head"><span>keys</span></div><div class="widget-body">${legendRows}</div></div></div>`;
  const cardData = `<script type="application/json" id="se-cards">${JSON.stringify({ list: cardList.map((c) => ({ n: c.n, id: c.id, title: c.title })), now })}</script>`;
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>se mirror</title><style>${STYLE}</style></head>
<body>
<div class="cards" data-keep-style style="grid-template-rows:repeat(${rows},1fr)">
  ${cardsHtml}
  ${legendHtml}
  <div class="divider" id="div-cards"></div>
</div>
${MODAL}${data}${cardData}<script>${SCRIPT}</script>
</body></html>`;
}
