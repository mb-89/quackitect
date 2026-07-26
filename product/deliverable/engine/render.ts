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
}

/** Resolve a viewable machine by id: main itself, or one of its subs. */
function viewedMachine(m: MirrorState, view: string | undefined): { decl: MachineDecl; canvas: CanvasData } {
  const mainPath = mainMachinePath(m.root);
  if (view === undefined || view === m.session.machine.id) {
    return { decl: m.session.machine, canvas: loadCanvas(mainPath) };
  }
  const subState = m.session.machine.states.find((s) => s.submachine !== undefined && s.id === view);
  if (subState === undefined) return { decl: m.session.machine, canvas: loadCanvas(mainPath) };
  const path = resolveRef(m.root, mainPath, subState.submachine!);
  return { decl: compileMachine(m.root, path), canvas: loadCanvas(path) };
}

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
  .threshold { display: flex; align-items: center; gap: 8px; color: #7f8b96; font-size: 12px; text-transform: none; letter-spacing: 0; }
  .threshold input { accent-color: #e8b339; width: 140px; }
  #thr-val { color: #e8b339; min-width: 4ch; }
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
const CURRENT = (D.describe.active && D.describe.active[0]) ? D.describe.active[0].split("/").pop() : null;
const WALK_HERE = D.viewingWalk;
function nextTable(id, s) {
  const here = WALK_HERE && id === CURRENT;
  return '<table class="kv">' + s.next.map((n, i) => {
    const inner = jsonTable({ to: n.to, ...(n.statement ? { statement: n.statement } : {}), role: n.role, ...(n.guard ? { guard: n.guard } : {}) });
    const unlocked = here && s.exit_met && n.enter_met;
    const btn = here
      ? '<button class="primary go' + (unlocked ? "" : " locked") + '" data-to="' + n.to + '"' + (unlocked ? "" : " disabled") +
        ' title="' + (unlocked ? "tick: leave " + id + ", enter " + n.to : s.exit_met ? "entry condition of " + n.to + " not met" : "exit condition of " + id + " not met") + '">▶</button>'
      : "";
    return '<tr><td class="k">' + i + '</td><td class="v">' + inner + '</td>' + (here ? '<td class="btncell">' + btn + "</td>" : "") + "</tr>";
  }).join("") + "</table>";
}
function pulledView(pulled) {
  const bySource = {};
  for (const p of pulled) for (const src of p.sources) (bySource[src] ??= []).push(p.path);
  return Object.entries(bySource).map(([srcName, paths]) =>
    '<details><summary style="cursor:pointer;color:#7f8b96">' + srcName + " (" + paths.length + ")</summary>" +
    paths.map((p) => '<div style="padding:2px 0 2px 14px"><a class="doclink" data-path="' + p + '">' + p + "</a></div>").join("") +
    "</details>"
  ).join("");
}
function stateDetail(id) {
  const s = D.states[id] ?? {};
  const bare = Object.assign({}, s); delete bare.next; delete bare.pulled; delete bare.script; delete bare.was_filled;
  let html = jsonTable(bare);
  if (s.pulled && s.pulled.length > 0) {
    const row = '<tr><td class="k" title="derived by the machine, not authored">pulled</td><td class="v">' + pulledView(s.pulled) + "</td></tr></table>";
    html = html.endsWith("</table>") ? html.slice(0, -8) + row : html + '<table class="kv">' + row;
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
document.addEventListener("click", async (ev) => {
  const c = ev.target.closest ? ev.target.closest(".confirm") : null;
  if (c) { await fetch("/evidence", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ state: c.dataset.state || CURRENT }) }); location.href = "/"; return; }
  const j = ev.target.closest ? ev.target.closest(".jump") : null;
  if (j) { await fetch("/tick", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ back: j.dataset.state }) }); location.href = "/"; return; }
  const rp = ev.target.closest ? ev.target.closest(".runpre") : null;
  if (rp) { await fetch("/script", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ state: rp.dataset.state || CURRENT }) }); location.href = "/"; return; }
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
    if (c.args.length > 0) row += jsonTable(c.args);
    if (key === "script") {
      const s = D.states[id] ?? {};
      const sc = s.script || { ran: false, ok: false, output: "" };
      row += '<div style="padding:6px 0"><button ' + (standing ? 'class="primary runpre" data-state="' + id + '"' : 'class="primary go locked" disabled title="enter the state to run the script"') + ">" + (sc.ran ? "re-run" : "run") + "</button></div>";
      if (sc.ran) row += '<div style="color:' + (sc.ok ? "#4a7a55" : "#e86a5f") + ';white-space:pre-wrap;font-size:12px">' + sc.output.replace(/&/g,"&amp;").replace(/</g,"&lt;") + "</div>";
      else row += '<div style="color:#7f8b96">not run yet</div>';
    }
    if (key === "read" && !c.met) {
      row += '<div style="padding:6px 0"><button ' + (standing ? 'class="primary confirm" data-state="' + id + '" title="the confirmation is logged as evidence"' : 'class="primary go locked" disabled title="enter the state to confirm"') + ">confirm</button></div>";
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
async function openDoc(path, returnKey) {
  const r = await fetch("/doc?path=" + encodeURIComponent(path));
  const d = await r.json();
  showDetails(path, '<div style="padding:2px 0 10px"><button class="ghost back" data-return="' + returnKey + '">‹ back</button></div><div class="docview">' + d.html + "</div>");
}
function detailFor(key) {
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

document.querySelectorAll(".expand").forEach((btn) => {
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

// THE THRESHOLD SLIDER — the human's live grip on how much of the walk is
// the agent's. Takes effect on the agent's NEXT tick; logged server-side.
const thr = document.getElementById("thr");
if (thr) {
  const lbl = document.getElementById("thr-val");
  thr.addEventListener("input", () => { if (lbl) lbl.textContent = Number(thr.value).toFixed(2); });
  thr.addEventListener("change", async () => {
    await fetch("/threshold", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ value: Number(thr.value) }) });
  });
}

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
const ACTIVE_AT_RENDER = JSON.stringify(D.describe.active || []);
setInterval(async () => {
  try {
    const r = await fetch("/api/alive");
    const a = await r.json();
    aliveMisses = 0;
    if (a.status === "closed") { sessionOver(); return; }
    if (thr && document.activeElement !== thr && Number(thr.value) !== a.threshold) {
      thr.value = a.threshold;
      const lbl = document.getElementById("thr-val");
      if (lbl) lbl.textContent = Number(a.threshold).toFixed(2);
    }
    if (JSON.stringify(a.active || []) !== ACTIVE_AT_RENDER) location.reload();
  } catch (e) {
    aliveMisses++;
    if (aliveMisses >= 2) sessionOver();
  }
}, 2000);
`;

function widgetHead(title: string, widgetId: string, url: string): string {
  return `<div class="widget-head"><span>${esc(title)}</span><button class="expand" data-widget="${widgetId}" data-url="${esc(url)}" title="expand · ctrl-click: new tab · shift-click: new window">⛶</button></div>`;
}

export function renderMirror(m: MirrorState, widget?: "machine" | "details", view?: string): string {
  const info = m.session.describe() as { active: string[]; status: string };
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
  const done = new Set(
    history
      .filter((h) => h.outcome === "filled")
      .map((h) => h.state)
      .filter((s) => (decl.id === m.session.machine.id ? !s.includes("/") : s.startsWith(`${decl.id}/`)))
      .map((s) => s.split("/").pop()!),
  );
  // An end state is never "filled" — it turns green when its machine completed.
  const machineCompleted =
    decl.id === m.session.machine.id
      ? m.session.instance.status === "closed"
      : history.some((h) => h.outcome === "filled" && h.state === decl.id);
  if (machineCompleted) for (const s of decl.states) if (s.kind === "end") done.add(s.id);
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
          enter_met: t === undefined ? true : m.session.conditionMet(decl, t, "enter"),
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
  }).replace(/</g, "\\u003c")};</script>`;

  // The slider — THE THRESHOLD: which states the agent enters by itself
  // (priority <= threshold). 0 = the human clicks through everything
  // (manual mode is just this); 1 = fully autonomous. Live: changes take
  // effect on the agent's next tick.
  const thr = m.session.threshold;
  const slider = `<span class="threshold" title="the agent enters only states with priority ≤ threshold — 0: every step is yours, 1: fully autonomous"><span>agent ≤</span><input id="thr" type="range" min="0" max="1" step="0.01" value="${thr}"><span id="thr-val">${thr.toFixed(2)}</span></span>`;
  const machineWidget = `<div class="widget" id="w-machine"><div class="widget-head"><span class="crumbs">${crumbs}</span>${slider}<button class="expand" data-widget="w-machine" data-url="/widget/machine?view=${encodeURIComponent(decl.id)}" title="expand · ctrl-click: new tab · shift-click: new window">⛶</button></div><div class="widget-body">${svg}</div></div>`;
  const detailsWidget = `<div class="widget" id="w-details">${widgetHead("details", "w-details", "/widget/details")}
    ${info.status === "closed" ? '<div class="meta" style="color:#e86a5f">machine closed</div>' : ""}
    <div class="meta" id="details-title">—</div>
    <div class="panel" id="details"></div>
  </div>`;

  if (widget === "machine") {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>se · machine</title><style>${STYLE} main{padding:10px}</style></head>
<body><div class="cols"><main>${machineWidget}</main></div>${data}<script>${SCRIPT}</script></body></html>`;
  }
  if (widget === "details") {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>se · details</title><style>${STYLE}</style></head>
<body><div class="cols"><aside id="sidebar" style="width:100vw;max-width:100vw">${detailsWidget}</aside></div>${data}<script>${SCRIPT}</script></body></html>`;
  }
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>se mirror</title><style>${STYLE}</style></head>
<body>
<div class="cols">
  <main>
    ${machineWidget}
  </main>
  <div id="divider"></div>
  <aside id="sidebar">
    ${detailsWidget}
  </aside>
</div>
${data}<script>${SCRIPT}</script>
</body></html>`;
}
