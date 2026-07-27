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
import { loadCanvas, type CanvasData, type CanvasElement } from "./canvas.ts";
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

export interface StateMeta {
  has_exit: boolean;
  exit_met: boolean;
  has_entry: boolean;
  entry_met: boolean;
}

function machineSvg(canvas: CanvasData, activeIds: Set<string>, doneIds: Set<string>, subIds: Set<string>, meta: Record<string, StateMeta>): string {
  const nodes = canvas.nodes ?? [];
  const pad = 60;
  const minX = Math.min(...nodes.map((n) => n.x)) - pad;
  const minY = Math.min(...nodes.map((n) => n.y)) - pad;
  const maxX = Math.max(...nodes.map((n) => n.x + n.width)) + pad;
  const maxY = Math.max(...nodes.map((n) => n.y + n.height)) + pad;
  const byId = new Map(nodes.map((n) => [n.id, n]));
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
    parts.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="edge" marker-end="url(#arrow)"/>`);
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
    parts.push(`<text x="${n.x + n.width / 2}" y="${n.y + n.height / 2 + 6}" class="label">${esc(sid)}</text></g>`);
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
    // An op-note update IS a note to the reader — italic, opens its text.
    type: rec.tool === "se_update" ? ((rec.args as { op?: string }).op === "note" ? "note" : "update") : rec.tool === "se_note" || rec.tool === "mirror_note" ? "note" : "call",
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
  if (subState === undefined) return { decl: m.session.machine, canvas: loadCanvas(mainPath) };
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
  #divider { width: 6px; cursor: col-resize; background: #2a2f34; }
  aside { width: 620px; min-width: 320px; max-width: 80vw; display: flex; flex-direction: column; background: #191d21; }
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
  .edge { stroke: #5b6772; stroke-width: 2.5; }
  .arrowhead { fill: #5b6772; }
  .guard { fill: #e8b339; font-size: 20px; text-anchor: middle; }
  .comment { fill: #1c2025; stroke: #2a2f34; }
  .group { fill: #1a1e22; stroke: #333a41; stroke-dasharray: 10 6; stroke-width: 2; }
  .group-label { fill: #5b6772; font-size: 24px; font-family: inherit; letter-spacing: .06em; }
  .comment-text { color: #7f8b96; font-size: 13px; line-height: 1.35; }
  .comment-detail { font-size: 15px; line-height: 1.55; color: #d8dde2; padding: 2px 0 10px; }
  .bar { display: flex; gap: 10px; padding: 12px; }
  button.primary { background: #e8b339; color: #14171a; border: 0; border-radius: 8px; padding: 8px 14px; font: inherit; font-weight: 700; cursor: pointer; margin: 2px 4px 2px 0; }
  .panel { padding: 0 12px 12px; overflow: auto; }
  .meta { color: #7f8b96; font-size: 12px; padding: 8px 12px; }
  table.kv { border-collapse: collapse; width: 100%; font-size: 12.5px; }
  table.kv td { border: 1px solid #2a2f34; padding: 4px 8px; vertical-align: top; }
  table.kv td.k { color: #e8b339; white-space: nowrap; width: 1%; }
  table.kv td.v { color: #d8dde2; word-break: break-word; }
  table.kv table.kv { margin: 2px 0; }
  .vnull { color: #7f8b96; } .vnum { color: #7cc4e8; } .vbool { color: #c58fe8; } .vstr { color: #a8c88f; }
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
  #w-log { flex: 0 0 42%; border-radius: 0; border: 0; border-bottom: 1px solid #2a2f34; }
  .log-filter-row { padding: 6px 12px 0; display: flex; gap: 6px; }
  .log-filter-row input { flex: 1 1 50%; min-width: 0; box-sizing: border-box; background: #14171a; border: 1px solid #2a2f34; border-radius: 6px; color: #d8dde2; font: inherit; font-size: 12px; padding: 4px 8px; }
  .log-panel { font-size: 12px; margin-top: 6px; }
  .logrow { display: flex; gap: 8px; padding: 2px 0; cursor: pointer; border-bottom: 1px dotted #22272c; align-items: baseline; }
  .logrow:hover { background: #22272c; }
  .logrow .lt { color: #7f8b96; flex: 0 0 auto; }
  .logrow .lsrc { flex: 0 0 5.5ch; color: #7cc4e8; }
  .logrow .lsrc.human { color: #e8b339; }
  .logrow .lbrief { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .logrow.update .lbrief { font-weight: 700; }
  .logrow.note .lbrief { font-style: italic; }
  .logrow .lok { flex: 0 0 auto; color: #4a7a55; }
  .logrow.failed .lok { color: #e86a5f; }
  .dnode { cursor: pointer; padding: 2px 0; font-size: 13px; }
  .dnode:hover { background: #22272c; }
  .dnode.s-done { color: #4a7a55; }
  .dnode.s-open { color: #e8b339; }
  .dnode.s-obsolete { color: #5b6772; text-decoration: line-through; }
  .dnode.s-reverted { color: #e86a5f; text-decoration: line-through; }
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
  #over { position: fixed; inset: 0; background: rgba(20,23,26,.94); z-index: 100; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; }
  #over .over-box { color: #e8332a; font-size: 62px; font-weight: 800; letter-spacing: .12em; border: 6px solid #e8332a; border-radius: 18px; padding: 26px 52px; }
  #over .over-sub { color: #e86a5f; font-size: 15px; }
`;

const SCRIPT = `
const D = window.SE_DATA;

function jsonTable(v) {
  if (v === null || v === undefined) return '<span class="vnull">null</span>';
  if (typeof v === "number") return '<span class="vnum">' + v + "</span>";
  if (typeof v === "boolean") return '<span class="vbool">' + v + "</span>";
  if (typeof v === "string") {
    const looksLikePath = (v.startsWith("workspace/") || v.startsWith("product/")) && !v.includes(" ") && v.lastIndexOf(".") > v.lastIndexOf("/");
    if (looksLikePath) {
      return '<a class="doclink" data-path="' + v + '">' + v + "</a>";
    }
    return '<span class="vstr">' + v.replace(/&/g,"&amp;").replace(/</g,"&lt;") + "</span>";
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

function showDetails(title, html) {
  const el = document.getElementById("details");
  if (el) { document.getElementById("details-title").textContent = title; el.innerHTML = html; }
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
  se_exp_new: [{ name: "kind", hint: "spike | fix | explore" }, { name: "goal", hint: "what this expedition is after", long: true }],
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
const CURRENT = (D.describe.active && D.describe.active[0]) ? D.describe.active[0].split("/").pop() : null;
const WALK_HERE = D.viewingWalk;
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
    html += '<div class="meta" style="padding:8px 0 4px">the record</div>';
    if (!e) html += '<div class="vnull">no record found</div>';
    else {
      html += '<div style="padding:2px 0"><b>' + escText(e.id) + "</b></div>";
      if (e.goal) html += '<div class="comment-text">' + escText(e.goal) + "</div>";
      html += '<div class="meta">' + (e.status ? "status: " + escText(e.status) : "pre-record") + (e.report ? " · report: " + escText(e.report) : "") + "</div>";
      html += '<div><a class="doclink" data-path="product/spec/expeditions/' + escText(e.id) + '/record.md">record</a> · <a class="doclink" data-path="product/spec/expeditions/' + escText(e.id) + '/report.md">report</a></div>';
    }
  }
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
// Reload WITHOUT losing the view or the open details pane — a checkbox
// click must not cost the user their place (found: four re-opens to set
// four checks).
function reloadKeep(detail) {
  const q = new URLSearchParams(location.search);
  if (detail) q.set("detail", detail); else q.delete("detail");
  const qs = q.toString();
  location.href = location.pathname + (qs ? "?" + qs : "");
}
document.addEventListener("click", async (ev) => {
  const c = ev.target.closest ? ev.target.closest(".docheck") : null;
  if (c) { if (c.disabled) return; ev.preventDefault(); c.disabled = true; await fetch("/check", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ path: c.dataset.path }) }); reloadKeep(CURRENT_DETAIL); return; }
  const j = ev.target.closest ? ev.target.closest(".jump") : null;
  if (j) { await fetch("/tick", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ back: j.dataset.state }) }); location.href = "/"; return; }
  const rp = ev.target.closest ? ev.target.closest(".runpre") : null;
  if (rp) {
    // Grey IMMEDIATELY — no second run behind an unresponsive button; the
    // server coalesces stray extra clicks into the one run anyway.
    rp.disabled = true; rp.classList.add("locked"); rp.textContent = "running…";
    await fetch("/script", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ state: rp.dataset.state || CURRENT }) });
    reloadKeep(CURRENT_DETAIL);
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
  const go = ev.target.closest ? ev.target.closest(".go") : null;
  if (go) {
    const body = go.dataset.to ? { to: go.dataset.to } : { advance: true };
    await fetch("/tick", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    location.href = "/";
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
  if (g && g.dataset.sub) location.href = "/?view=" + encodeURIComponent(g.dataset.sub);
});

// Only real widget expanders — the modal's ✕ shares the style, not the job.
document.querySelectorAll(".expand[data-widget]").forEach((btn) => {
  btn.addEventListener("click", (ev) => {
    ev.stopPropagation();
    const url = btn.dataset.url;
    if (ev.ctrlKey || ev.metaKey) { window.open(url, "_blank"); return; }
    if (ev.shiftKey) { window.open(url, "se-widget", "width=1100,height=800"); return; }
    const w = document.getElementById(btn.dataset.widget);
    if (w) { if (document.fullscreenElement === w) document.exitFullscreen(); else w.requestFullscreen(); }
  });
});

const svg = document.getElementById("machine-svg");
if (svg) {
  let vb = svg.viewBox.baseVal;
  svg.addEventListener("wheel", (ev) => {
    ev.preventDefault();
    const scale = ev.deltaY > 0 ? 1.12 : 1 / 1.12;
    const pt = svg.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM().inverse());
    vb.x = p.x - (p.x - vb.x) * scale;
    vb.y = p.y - (p.y - vb.y) * scale;
    vb.width *= scale; vb.height *= scale;
  }, { passive: false });
  let panning = null;
  svg.addEventListener("mousedown", (ev) => { panning = { x: ev.clientX, y: ev.clientY, vx: vb.x, vy: vb.y }; svg.classList.add("panning"); });
  window.addEventListener("mousemove", (ev) => {
    if (!panning) return;
    const r = svg.getBoundingClientRect();
    vb.x = panning.vx - (ev.clientX - panning.x) * (vb.width / r.width);
    vb.y = panning.vy - (ev.clientY - panning.y) * (vb.height / r.height);
  });
  window.addEventListener("mouseup", () => { panning = null; svg.classList.remove("panning"); });
}

const divider = document.getElementById("divider");
const aside = document.getElementById("sidebar");
if (divider && aside) {
  let drag = null;
  divider.addEventListener("mousedown", (ev) => { drag = { x: ev.clientX, w: aside.offsetWidth }; ev.preventDefault(); });
  window.addEventListener("mousemove", (ev) => { if (drag) aside.style.width = (drag.w - (ev.clientX - drag.x)) + "px"; });
  window.addEventListener("mouseup", () => { drag = null; });
}

if (CURRENT && D.states[CURRENT] && WALK_HERE) { CURRENT_DETAIL = "state:" + CURRENT; showDetails("state: " + CURRENT, stateDetail(CURRENT)); }
// A reload that carried its detail along (reloadKeep) restores the pane.
const DETAIL_PARAM = new URLSearchParams(location.search).get("detail");
if (DETAIL_PARAM) { CURRENT_DETAIL = DETAIL_PARAM; const dp = detailFor(DETAIL_PARAM); showDetails(dp[0], dp[1]); }

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
function renderLog() {
  if (!logPanel) return;
  const fEl = document.getElementById("log-filter");
  const f = fEl ? fEl.value.toLowerCase() : "";
  const rows = LOG_ROWS.filter((r) => !f || (r.ts + " " + r.src + " " + r.type + " " + r.brief + " " + (r.clause || "")).toLowerCase().includes(f));
  // NEWEST ON TOP (owner ruling): the feed reads downward into the past;
  // the scroll pins to the top while the reader is there.
  const stick = logPanel.scrollTop < 40;
  logPanel.innerHTML = rows.slice().reverse().map((r) =>
    '<div class="logrow ' + r.type + (r.ok ? "" : " failed") + '" data-ref="' + r.ref + '">' +
      '<span class="lt">' + (r.pending ? r.ts.slice(5, 10) : r.ts.slice(11, 19)) + "</span>" +
      '<span class="lsrc ' + r.src + '">' + r.src + "</span>" +
      '<span class="lbrief">' + escText(r.brief) + "</span>" +
      '<span class="lok">' + (r.ok ? "✓" : "✗ " + (r.clause || "")) + "</span>" +
    "</div>").join("") || '<div class="meta">no acts' + (f ? " match the filter" : " this session yet") + "</div>";
  if (stick) logPanel.scrollTop = 0;
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
  if (rec.tool === "se_update" && rec.args && rec.args.op === "note") { showDetails("note · " + (rec.args.visit || rec.ref), jsonTable({ at: rec.ts, text: rec.args.brief, visit: rec.args.visit })); return; }
  if (rec.tool === "se_update" && rec.args && rec.args.visit) { await showDecisions(rec.args.visit, null); return; }
  if ((rec.tool === "se_note" || rec.tool === "mirror_note") && rec.args) { showDetails("note · " + ((rec.response && rec.response.captured) || rec.ref), jsonTable({ at: rec.ts, text: rec.args.text, pending: "until a retro drains it" })); return; }
  if (rec.text !== undefined && rec.tool === undefined) { showDetails("note · " + rec.ref, jsonTable({ at: rec.at, text: rec.text, pending: "until a retro drains it" })); return; }
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
  const badge = { open: "●", done: "✓", obsolete: "⊘", reverted: "↩" };
  function tree(pid, depth) {
    return (kids[pid] || []).map((n) =>
      '<div class="dnode s-' + n.status + (n.id === g.active ? " dactive" : "") + (n.id === sel ? " dsel" : "") + '" data-node="' + n.id + '" style="margin-left:' + depth * 14 + 'px" title="' + n.id + " · " + n.status + '">' + badge[n.status] + " " + escText(n.brief) + "</div>" + tree(n.id, depth + 1)
    ).join("");
  }
  let html = tree("", 0) || '<div class="vnull">no decisions recorded for ' + escText(g.visit) + "</div>";
  if (sel) {
    const n = g.nodes.find((x) => x.id === sel);
    if (n) html += '<div class="dinfo">' + jsonTable(Object.assign({ id: n.id, brief: n.brief, status: n.status }, n.resolution ? { resolution: n.resolution } : {}, { opened: n.at }, n.closed_at ? { closed: n.closed_at } : {})) + "</div>";
  }
  showDetails("decisions · " + g.visit, html);
}
document.addEventListener("click", (ev) => {
  const lr = ev.target.closest ? ev.target.closest(".logrow") : null;
  if (lr) { void openLogDetail(lr.dataset.ref); return; }
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

// SESSION OVER — anybody reaching end stops the whole session. The mirror
// tries to close its window; where that is not allowed, the big red
// message stands (owner ruling 2026-07-26).
function sessionOver() {
  if (document.getElementById("over")) return;
  const d = document.createElement("div");
  d.id = "over";
  d.innerHTML = '<div class="over-box">SESSION OVER</div><div class="over-sub">the machine reached end — the server has shut down</div>';
  document.body.appendChild(d);
  try { window.close(); } catch (e) { /* user-opened windows refuse */ }
}
if (D.describe.status === "closed") sessionOver();

// The mirror FOLLOWS the walk: poll the position — the agent's hand (or
// another window) moves the machine under this page. A dead server reads
// as session over.
let aliveMisses = 0;
let pollBusy = null;
let pollInFlight = false;
const ACTIVE_AT_RENDER = JSON.stringify(D.describe.active || []);
setInterval(async () => {
  if (pollInFlight) return; // never stack polls behind a slow server
  pollInFlight = true;
  try {
    const r = await fetch("/api/alive");
    const a = await r.json();
    aliveMisses = 0;
    if (a.status === "closed") { sessionOver(); return; }
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
    if (JSON.stringify(a.active || []) !== ACTIVE_AT_RENDER) { location.reload(); return; }
    // A script run finishing elsewhere (agent tick, other window) lands
    // its result — refresh, keeping the open pane.
    if (pollBusy === true && a.busy === false) { reloadKeep(CURRENT_DETAIL); return; }
    pollBusy = a.busy;
  } catch (e) {
    aliveMisses++;
    if (aliveMisses >= 2) sessionOver();
  } finally {
    pollInFlight = false;
  }
}, 2000);
`;

const MODAL = '<div id="modal"><div class="modal-box"><div class="widget-head"><span id="modal-title"></span><button class="expand" id="modal-close">✕</button></div><div class="modal-body" id="modal-body"></div></div></div><div id="toast"></div>';

function widgetHead(title: string, widgetId: string, url: string): string {
  return `<div class="widget-head"><span>${esc(title)}</span><button class="expand" data-widget="${widgetId}" data-url="${esc(url)}" title="expand · ctrl-click: new tab · shift-click: new window">⛶</button></div>`;
}

export function renderMirror(m: MirrorState, widget?: "machine" | "details" | "log", view?: string): string {
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
    };
  }
  const svg = machineSvg(canvas, leafActive, done, subIds, meta);

  // Breadcrumbs describe the VIEW: main [›subs] [ › sub [›its subs] ].
  const mainSubs = m.session.machine.states.filter((s) => s.submachine !== undefined).map((s) => s.id);
  const crumbArrow = (subs: string[]): string =>
    subs.length === 0
      ? ""
      : `<span class="crumb-arrow">›<span class="crumb-menu">${subs.map((s) => `<a href="/?view=${encodeURIComponent(s)}">${esc(s)}</a>`).join("")}</span></span>`;
  let crumbs =
    decl.id === m.session.machine.id
      ? `<b class="here">${esc(m.session.machine.id)}</b>${crumbArrow(mainSubs)}`
      : `<a href="/?view=${encodeURIComponent(m.session.machine.id)}">${esc(m.session.machine.id)}</a>${crumbArrow(mainSubs)}<b class="here">${esc(decl.id)}</b>${crumbArrow(decl.states.filter((s) => s.submachine !== undefined).map((s) => s.id))}`;

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
        ? { archive_record: (m.session.expeditionList() as { archive: { id: string }[] }).archive.find((e) => e.id === s.id || e.id.startsWith(`${s.id}-`)) ?? null }
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
  const data = `<script>window.SE_DATA = ${JSON.stringify({
    describe: m.session.describe(),
    packet: m.session.tickInfo(),
    lastPacket: m.lastPacket ?? null,
    states,
    comment,
    viewingWalk,
    viewed: { id: decl.id, reentry: decl.reentry, initial: decl.initial, states: decl.states.map((s) => s.id) },
    history: history.slice(-20),
    levels,
  }).replace(/</g, "\\u003c")};</script>`;

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
  const machineWidget = `<div class="widget" id="w-machine"><div class="widget-head"><span class="crumbs">${crumbs}</span><span style="display:flex;align-items:center;gap:10px">${slider}${sdBar}${escapeBtn}<button class="expand" data-widget="w-machine" data-url="/widget/machine?view=${encodeURIComponent(decl.id)}" title="expand · ctrl-click: new tab · shift-click: new window">⛶</button></span></div><div class="widget-body">${svg}</div></div>`;
  const detailsWidget = `<div class="widget" id="w-details">${widgetHead("details", "w-details", "/widget/details")}
    ${info.status === "closed" ? '<div class="meta" style="color:#e86a5f">machine closed</div>' : ""}
    <div class="meta" id="details-title">—</div>
    <div class="panel" id="details"></div>
  </div>`;
  // The unified feed sits ABOVE details (owner ruling 2026-07-26) — rows
  // load and refresh client-side off /api/log; only present with a log.
  const logWidget = m.log === undefined ? "" : `<div class="widget" id="w-log">${widgetHead("log", "w-log", "/widget/log")}
    <div class="log-filter-row"><input id="log-filter" placeholder="filter the feed"><input id="log-note" placeholder="drop a note — Enter captures it"></div>
    <div class="panel log-panel" id="log-rows"><div class="meta">loading…</div></div>
  </div>`;

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
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>se mirror</title><style>${STYLE}</style></head>
<body>
<div class="cols">
  <main>
    ${machineWidget}
  </main>
  <div id="divider"></div>
  <aside id="sidebar">
    ${logWidget}
    ${detailsWidget}
  </aside>
</div>
${MODAL}${data}<script>${SCRIPT}</script>
</body></html>`;
}
