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
  leave_when: string;
  leave_met: boolean;
  enter_when: string;
  enter_met: boolean;
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
      if (mt.enter_when !== "always") {
        parts.push(`<g class="clickable cond ${mt.enter_met ? "met" : "unmet"}" data-detail="cond:${esc(sid)}"><circle cx="${n.x}" cy="${cy}" r="18"/><text x="${n.x}" y="${cy + 7}" class="cond-label">${mt.enter_met ? "✓" : "!"}</text></g>`);
      }
      if (mt.leave_when !== "always") {
        parts.push(`<g class="clickable cond ${mt.leave_met ? "met" : "unmet"}" data-detail="cond:${esc(sid)}"><circle cx="${n.x + n.width}" cy="${cy}" r="18"/><text x="${n.x + n.width}" y="${cy + 7}" class="cond-label">${mt.leave_met ? "✓" : "!"}</text></g>`);
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
  .doclist a { display: block; color: #7cc4e8; padding: 4px 0; cursor: pointer; text-decoration: underline; }
  .docview { font-size: 13.5px; line-height: 1.55; }
  .docview h1, .docview h2, .docview h3 { color: #e8b339; }
  .docview code { background: #22272c; padding: 1px 5px; border-radius: 4px; }
  .docview pre { background: #14171a; border: 1px solid #2a2f34; border-radius: 8px; padding: 10px; overflow: auto; }
  .docview a { color: #7cc4e8; }
  button.ghost { background: #22272c; color: #d8dde2; border: 1px solid #4a545e; border-radius: 8px; padding: 6px 12px; font: inherit; cursor: pointer; }
  #w-details { flex: 1; border-radius: 0; border: 0; }
`;

const SCRIPT = `
const D = window.SE_DATA;

function jsonTable(v) {
  if (v === null || v === undefined) return '<span class="vnull">null</span>';
  if (typeof v === "number") return '<span class="vnum">' + v + "</span>";
  if (typeof v === "boolean") return '<span class="vbool">' + v + "</span>";
  if (typeof v === "string") return '<span class="vstr">' + v.replace(/&/g,"&amp;").replace(/</g,"&lt;") + "</span>";
  if (Array.isArray(v)) {
    if (v.length === 0) return '<span class="vnull">[]</span>';
    return '<table class="kv">' + v.map((x, i) => '<tr><td class="k">' + i + '</td><td class="v">' + jsonTable(x) + "</td></tr>").join("") + "</table>";
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
    const inner = jsonTable({ to: n.to, role: n.role, ...(n.guard ? { guard: n.guard } : {}), ...(n.enter_when !== "always" ? { enter_when: n.enter_when } : {}) });
    const unlocked = here && s.leave_met && n.enter_met;
    const btn = here
      ? '<button class="primary go' + (unlocked ? "" : " locked") + '" data-to="' + n.to + '"' + (unlocked ? "" : " disabled") +
        ' title="' + (unlocked ? "tick: leave " + id + ", enter " + n.to : s.leave_met ? "enter condition of " + n.to + " not met" : "leave condition of " + id + " not met: " + s.leave_when) + '">▶</button>'
      : "";
    return '<tr><td class="k">' + i + '</td><td class="v">' + inner + '</td>' + (here ? '<td class="btncell">' + btn + "</td>" : "") + "</tr>";
  }).join("") + "</table>";
}
function stateDetail(id) {
  const s = D.states[id] ?? {};
  const bare = Object.assign({}, s); delete bare.next;
  let html = jsonTable(bare);
  if (s.next && s.next.length > 0) {
    html += '<div class="meta" style="padding:8px 0 4px">next</div>' + nextTable(id, s);
  }
  return html;
}
document.addEventListener("click", async (ev) => {
  const c = ev.target.closest ? ev.target.closest(".confirm") : null;
  if (c) { await fetch("/evidence", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ state: c.dataset.state || CURRENT }) }); location.href = "/"; return; }
  const dl = ev.target.closest ? ev.target.closest(".doclink") : null;
  if (dl) { openDoc(dl.dataset.path, dl.dataset.return); return; }
  const back = ev.target.closest ? ev.target.closest(".back") : null;
  if (back) { const [t, h] = detailFor(back.dataset.return); showDetails(t, h); return; }
});
function condDetail(id) {
  const s = D.states[id] ?? {};
  const met = s.leave_met;
  let html = "";
  if (WALK_HERE && !met) html += '<div style="padding:2px 0 10px"><button class="primary confirm" data-state="' + id + '" title="the confirmation is logged as evidence">confirm</button></div>';
  if (met) html += '<div style="padding:2px 0 10px;color:#4a7a55">confirmed ✓</div>';
  html += '<div class="comment-detail">' + (s.guidance || "").replace(/&/g,"&amp;").replace(/</g,"&lt;") + "</div>";
  if (s.read && s.read.length > 0) {
    html += '<div class="doclist">' + s.read.map((p) =>
      '<a class="doclink" data-path="' + p + '" data-return="cond:' + id + '">' + p + "</a>"
    ).join("") + "</div>";
  }
  return ["confirm · " + id, html];
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
  if (go) { await fetch("/tick", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ to: go.dataset.to }) }); location.href = "/"; }
});
document.addEventListener("click", (ev) => {
  const arrow = ev.target.closest ? ev.target.closest(".crumb-arrow") : null;
  document.querySelectorAll(".crumb-arrow.open").forEach((a) => { if (a !== arrow) a.classList.remove("open"); });
  if (arrow) { arrow.classList.toggle("open"); return; }
  const g = ev.target.closest ? ev.target.closest(".clickable") : null;
  if (g && g.dataset.detail) { const [t, h] = detailFor(g.dataset.detail); showDetails(t, h); }
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

if (CURRENT && D.states[CURRENT] && WALK_HERE) showDetails("state: " + CURRENT, stateDetail(CURRENT));
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
      .map((h) => h.state)
      .filter((s) => (decl.id === m.session.machine.id ? !s.includes("/") : s.startsWith(`${decl.id}/`)))
      .map((s) => s.split("/").pop()!),
  );
  const subIds = new Set(decl.states.filter((s) => s.submachine !== undefined).map((s) => s.id));
  const meta: Record<string, StateMeta> = {};
  for (const s of decl.states) {
    meta[s.id] = {
      leave_when: s.leave_when ?? "always",
      leave_met: m.session.conditionMet(decl, s, "leave"),
      enter_when: s.enter_when ?? "always",
      enter_met: m.session.conditionMet(decl, s, "enter"),
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
      legal_tools: s.legal_tools ?? [],
      ...(s.submachine !== undefined ? { submachine: s.submachine } : {}),
      leave_when: s.leave_when ?? "always",
      leave_met: m.session.conditionMet(decl, s, "leave"),
      ...(s.read !== undefined ? { read: s.read } : {}),
      next: s.edges.map((e) => {
        const t = decl.states.find((st) => st.id === e.to);
        return {
          to: e.to,
          role: e.role,
          ...(e.guard !== undefined ? { guard: e.guard } : {}),
          enter_when: t?.enter_when ?? "always",
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

  const machineWidget = `<div class="widget" id="w-machine"><div class="widget-head"><span class="crumbs">${crumbs}</span><button class="expand" data-widget="w-machine" data-url="/widget/machine?view=${encodeURIComponent(decl.id)}" title="expand · ctrl-click: new tab · shift-click: new window">⛶</button></div><div class="widget-body">${svg}</div></div>`;
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
