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
import { BASES_SCRIPT, BASES_STYLE, BASES_TABLE_STYLE } from "./basesclient.ts";
import { basesCard } from "./baseui.ts";
import { LOOK_FILES, lookPath, palettePath } from "./brand.ts";
import type { CallLog, CallRecord } from "./calllog.ts";
import { type CanvasData, type CanvasElement, loadCanvas, subLabel } from "./canvas.ts";
import { bindings, loadCards } from "./cards.ts";
import type { StrayNote } from "./inbox.ts";
import type { MachineDecl } from "./machine.ts";
import { compileMachineCached, resolveRef } from "./machines/compile.ts";
import { loadPanel, renderPanel } from "./params.ts";
import { SCRIPT } from "./renderclient.ts";
import { STYLE } from "./renderstyle.ts";
import { loadLevels } from "./scale.ts";
import { mainMachinePath, type Session } from "./session.ts";
import { TABLE_SCRIPT, TABLE_STYLE } from "./tables.ts";
import { TRACE_SCRIPT, TRACE_STYLE, traceCard } from "./traceui.ts";

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

/** THE AUTHORED LAW: an edge anchors at the side midpoints the drawing
 *  declares — the owner drew those sides, and the drawing wins. Only
 *  canvases that OPT IN (routed: true) take the centre-line law below. */
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

/** THE ROUTED LAW (owner ruling 2026-08-04, opt-in): arrows run centre
 *  to centre and clip at the borders — the tip always lands ON the
 *  target's edge, pointing at its heart. */
function borderPoint(el: CanvasElement, toward: [number, number]): [number, number] {
  const cx = el.x + el.width / 2;
  const cy = el.y + el.height / 2;
  const dx = toward[0] - cx;
  const dy = toward[1] - cy;
  if (dx === 0 && dy === 0) return [cx, cy];
  const sx = dx === 0 ? Number.POSITIVE_INFINITY : el.width / 2 / Math.abs(dx);
  const sy = dy === 0 ? Number.POSITIVE_INFINITY : el.height / 2 / Math.abs(dy);
  const s = Math.min(sx, sy);
  return [cx + dx * s, cy + dy * s];
}

const centerOf = (el: CanvasElement): [number, number] => [el.x + el.width / 2, el.y + el.height / 2];

/** see dsp-mirror-render.md#a-long-edge-routes-around-the-band */
function edgeWaypoints(a: CanvasElement, b: CanvasElement, nodes: CanvasElement[]): [number, number][] {
  const [acx, acy] = centerOf(a);
  const [bcx, bcy] = centerOf(b);
  const lo = Math.min(acy, bcy);
  const hi = Math.max(acy, bcy);
  const between = nodes.filter((n) => {
    if (n === a || n === b || n.type === "group") return false;
    const cy = n.y + n.height / 2;
    return cy > lo && cy < hi;
  });
  if (between.length === 0) return [];
  const right = acx >= bcx;
  const x = right ? Math.max(...between.map((n) => n.x + n.width)) + 100 : Math.min(...between.map((n) => n.x)) - 100;
  const pts: [number, number][] = [];
  if (x < a.x || x > a.x + a.width) pts.push([x, acy]);
  if (x < b.x || x > b.x + b.width) pts.push([x, bcy]);
  return pts;
}

/** THE FEED ROLES — one colour per role, none shared. The aq kind wore the
 *  agent's blue and the update kind wore the human's amber, so two of the
 *  three columns said the same thing twice.
 *
 *  The NAMES live here because the code asks for them. The VALUES live in
 *  deliverable/brand/palette.css, because a colour is configuration. */
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
  /** Passed against a demand that has since moved — no longer green. */
  suspect?: boolean;
  /** A blessed gate — the thumbs-up rides the green (owner ruling
   *  2026-08-11: green means submitted; green plus thumb means blessed). */
  blessed?: boolean;
  /** Green because a LAW passed, with no form signed. The third kind, and the
   *  one that used to look exactly like the first — see
   *  dsp-mirror-render.md#one-decider-says-which-kind-of-green-it-is. */
  law_proven?: boolean;
  has_exit: boolean;
  exit_met: boolean;
  has_entry: boolean;
  entry_met: boolean;
  /** The state's authored second line — drawn small under the name. */
  subtitle?: string;
}

/** see dsp-mirror-render.md#the-drawing-is-the-truth */
export function routeOverlay(
  steps: { from: string; to: string }[],
  /** The view's QUALIFIED chain below main ("" is main). A nested machine
   *  is "iterations/i1", never its bare leaf id — hops speak full chains. */
  prefix: string,
): { waypoints: Set<string>; path: string[] } {
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
  /** A bar's owed legs the path does not run through — each drawn as its
   *  own line into the bar, so the fan shows whole. */
  fan?: { from: string; to: string }[];
  /** The destination, if it is in this drawing. */
  target?: string;
  /** The walk STANDS in this drawing — the one view that draws the here-arrow. */
  here?: boolean;
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

function svgEdges(canvas: CanvasData, byId: Map<string, CNode>, skip: Set<string>): string[] {
  const parts: string[] = [];
  const nodes = canvas.nodes ?? [];
  const routed = canvas.routed === true;
  for (const edge of canvas.edges ?? []) {
    const a = byId.get(edge.fromNode);
    const b = byId.get(edge.toNode);
    if (a === undefined || b === undefined) continue;
    if (skip.has(`${stateIdOf(a)}->${stateIdOf(b)}`)) continue;
    // A double-headed arrow is one edge meaning both ways, so it draws that
    // way too — the marker already orients itself at a start.
    const bothWays = (edge as { fromEnd?: string }).fromEnd === "arrow";
    const ends = `class="edge"${bothWays ? ' marker-start="url(#arrow)"' : ""} marker-end="url(#arrow)"`;
    const pts = routed ? edgeWaypoints(a, b, nodes) : [];
    const [x1, y1] = routed ? borderPoint(a, pts[0] ?? centerOf(b)) : sidePoint(a, (edge as { fromSide?: string }).fromSide, b);
    const [x2, y2] = routed ? borderPoint(b, pts[pts.length - 1] ?? centerOf(a)) : sidePoint(b, (edge as { toSide?: string }).toSide, a);
    if (pts.length === 0) {
      parts.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" ${ends}/>`);
    } else {
      const mid = pts.map((p) => `L ${p[0]} ${p[1]}`).join(" ");
      parts.push(`<path d="M ${x1} ${y1} ${mid} L ${x2} ${y2}" fill="none" ${ends}/>`);
    }
    if (edge.label !== undefined && edge.label !== "") {
      const [lx, ly] = pts[0] ?? [(x1 + x2) / 2, (y1 + y2) / 2];
      parts.push(`<text x="${lx}" y="${ly - 8}" class="guard">${esc(edge.label)}</text>`);
    }
  }
  return parts;
}

/** SUSPECT BEATS DONE. The claim was filed and it still stands on disk. What
 *  it answered has moved, so the state is not green — it is a lapsed pass,
 *  and the drawing has to say so before anybody trusts the colour.
 *
 *  ONE WORD FOR ONE IDEA. The trace graph marks a node standing on moved
 *  ground with the same word and the same style. A reader who learns the mark
 *  once reads it everywhere. */
/** ONE PLACE DECIDES WHAT A GREEN MEANS. Three rules said it and three test
 *  files enforced parts of them, so nobody could say which parts were covered.
 *  see dsp-mirror-render.md#one-decider-says-which-kind-of-green-it-is */
export function statePaint(
  sid: string,
  activeIds: Set<string>,
  doneIds: Set<string>,
  meta: Record<string, StateMeta>,
): { cls: string; marks: string[] } {
  const m = meta[sid];
  // SUSPECT BEATS EVERY GREEN. A colour standing on moved ground is no longer
  // earned, and the drawing says so before anybody trusts it.
  if (activeIds.has(sid)) return { cls: "state active", marks: [] };
  if (m?.suspect === true) return { cls: "state suspect", marks: [] };
  if (!doneIds.has(sid)) return { cls: "state", marks: [] };
  // A LAW-PROVEN GREEN SIGNED NOTHING. It rides the same green — a pass is a
  // pass — and carries its own word, so the two are told apart at a glance.
  const cls = m?.law_proven === true ? "state done proven" : "state done";
  return { cls, marks: m?.blessed === true ? ["bless"] : [] };
}

function stateClass(sid: string, activeIds: Set<string>, doneIds: Set<string>, meta: Record<string, StateMeta>): string {
  return statePaint(sid, activeIds, doneIds, meta).cls;
}

function svgStateNode(
  n: CNode,
  activeIds: Set<string>,
  doneIds: Set<string>,
  subIds: Set<string>,
  openIds: Set<string>,
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
  // see dsp-mirror-render.md#two-different-facts
  const canEnter = openIds.has(sid);
  const pill = (n as { styleAttributes?: { shape?: string } }).styleAttributes?.shape === "pill";
  const cls = stateClass(sid, activeIds, doneIds, meta);
  const rx = pill ? Math.min(n.width, n.height) / 2 : 14;
  const why = isSub && !canEnter ? ' data-nosub="1"' : "";
  parts.push(`<g class="clickable" data-detail="state:${esc(sid)}"${canEnter ? ` data-sub="${esc(sid)}"` : why}>`);
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
  if (statePaint(sid, activeIds, doneIds, meta).marks.includes("bless")) {
    parts.push(`<text x="${n.x + n.width - 14}" y="${n.y + 26}" class="bless-mark">👍</text>`);
  }
  parts.push("</g>");
  return parts;
}

/** ONE ENGINE LIFE, ONE PAGE SCRIPT. Hosts keep webviews alive across
 *  engine reloads, so a shell can outlive the script it was served — and
 *  keep clicking with dead code. The stamp travels in the island and in
 *  every alive answer; a mismatch reloads the page. */
export const ENGINE_LIFE = Date.now().toString(36);

// THE FAN IS DRAWN WHOLE (owner, 2026-08-09): every leg a bar still owes
// gets its own dashed line into it and its own dot, so the one drawn path
// cannot hide the others.
function svgFanLegs(route: RouteMarks | undefined, nodeOfState: Map<string, CNode>): string[] {
  const parts: string[] = [];
  for (const leg of route?.fan ?? []) {
    const a = nodeOfState.get(leg.from);
    const b = nodeOfState.get(leg.to);
    if (a === undefined || b === undefined) continue;
    const ax = a.x + a.width / 2;
    const ay = a.y + a.height / 4;
    parts.push(`<path d="M ${ax} ${ay} L ${b.x + b.width / 2} ${b.y + b.height / 4}" fill="none" class="route-line fan"/>`);
    parts.push(`<circle cx="${ax}" cy="${ay}" r="8" class="route-stop"/>`);
  }
  return parts;
}

// see dsp-mirror-render.md#the-route-is-drawn-over-the-nodes
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
  // see dsp-mirror-render.md#a-road-closure
  parts.push(...svgFanLegs(route, nodeOfState));
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
      // A pass-through waypoint is an in-and-out: the down and up arrows.
      if (route?.waypoints.has(s.id) === true) parts.push(`<text x="${s.cx}" y="${s.cy + 3.5}" class="route-wp-io">↓↑</text>`);
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
  // way the line is going. There is only ever ONE — the view the walk
  // stands in draws it; every other drawing shows the line alone.
  if (route?.here === true) {
    const heading = (Math.atan2(stops[1].cy - stops[0].cy, stops[1].cx - stops[0].cx) * 180) / Math.PI + 90;
    parts.push(
      `<path d="M 0 -12 L 10 9 L 0 4 L -10 9 Z" class="route-here" transform="translate(${stops[0].cx} ${stops[0].cy}) rotate(${heading.toFixed(1)})"/>`,
    );
  }
  return parts;
}

// see dsp-mirror-render.md#the-busbar-is-structure
function svgBusbars(busbars: { into: string; feeders: string[] }[], nodeOfState: Map<string, CNode>): string[] {
  const parts: string[] = [];
  for (const b of busbars) {
    const g = nodeOfState.get(b.into);
    if (g === undefined) continue;
    const taps = b.feeders.map((f) => nodeOfState.get(f)).filter((n): n is CNode => n !== undefined);
    if (taps.length === 0) continue;
    const barY = g.y - 40;
    const xs = [g.x + g.width / 2, ...taps.map((n) => n.x + n.width / 2)];
    const x1 = Math.min(...xs) - 24;
    const x2 = Math.max(...xs) + 24;
    parts.push(`<line x1="${x1}" y1="${barY}" x2="${x2}" y2="${barY}" class="edge busbar"/>`);
    for (const n of taps) {
      const cx = n.x + n.width / 2;
      const fromY = n.y + n.height / 2 < barY ? n.y + n.height : n.y;
      parts.push(`<line x1="${cx}" y1="${fromY}" x2="${cx}" y2="${barY}" class="edge busbar tap"/>`);
    }
    parts.push(
      `<line x1="${g.x + g.width / 2}" y1="${barY}" x2="${g.x + g.width / 2}" y2="${g.y}" class="edge busbar" marker-end="url(#arrow)"/>`,
    );
    parts.push(`<text x="${x1 + 8}" y="${barY - 8}" class="busbar-icon">&amp;</text>`);
  }
  return parts;
}

function machineSvg(
  source: CanvasData,
  activeIds: Set<string>,
  doneIds: Set<string>,
  subIds: Set<string>,
  openIds: Set<string>,
  meta: Record<string, StateMeta>,
  busbars: { into: string; feeders: string[] }[],
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
  const skip = new Set(busbars.flatMap((b) => b.feeders.map((f) => `${f}->${b.into}`)));
  const parts: string[] = [
    ...svgGroups(nodes),
    ...svgEdges(canvas, byId, skip),
    ...svgBusbars(busbars, nodeOfState),
    ...nodes.flatMap((n) => svgStateNode(n, activeIds, doneIds, subIds, openIds, meta)),
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
  // see dsp-mirror-render.md#the-word-is-the-whole-truth
  mirror_autonomy: (a) => (typeof a.tier === "string" ? `autonomy → ${a.tier}` : "autonomy → (tier not recorded)"),
  // The boundary is chosen at launch, so the feed says WHEN it takes effect
  // rather than implying the walk just changed transport underfoot.
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

/** see dsp-mirror-render.md#the-unified-feed */
const FEED_BRIEF_CHARS = 90;

function oneLine(s: string): string {
  const flat = String(s).replace(/\s+/g, " ").trim();
  return flat.length > FEED_BRIEF_CHARS ? `${flat.slice(0, FEED_BRIEF_CHARS - 1)}…` : flat;
}

/** see dsp-mirror-render.md#the-server-acting-on-its-own-behalf */
const SELF_SERVED = new Set(["mirror_slow", "mirror_narration_now", "mirror_profile"]);

function srcOf(tool: string, actor?: string): string {
  // THE RECORD WINS. A stamp is what the handler that served the call KNEW;
  // the rule below is a guess from a string, kept only for records written
  // before the stamp existed, because history cannot be restamped.
  if (actor === "human" || actor === "agent" || actor === "ui") return actor;
  if (SELF_SERVED.has(tool)) return "ui";
  return tool.startsWith("mirror_") ? "human" : "agent";
}

export function feedRows(
  log: CallLog,
  since: string,
  pending: StrayNote[] = [],
): { capped: boolean; rows: Array<Record<string, unknown>> } {
  const q = log.query({ filter: { since }, limit: 501 });
  // The reader's selection is view state — logged, never shown as a feed row.
  // Self-served polls and timings never show either (owner ruling 2026-08-12:
  // a poll is not an act) — the log keeps them for the slowness mine.
  const records = (q.records ?? []).filter((r) => r.tool !== "mirror_select" && !SELF_SERVED.has(r.tool));
  const capped = records.length > 500;
  const rows = records.slice(-500).map((rec) => ({
    ref: rec.ref,
    ts: rec.ts,
    src: srcOf(rec.tool, rec.actor),
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

// see dsp-mirror-render.md#the-palette-is-configuration
const PALETTE_FALLBACK = ":root{--se-bg:#14171a;--se-fg:#d8dde2}";

export function palette(root: string): string {
  try {
    return readFileSync(palettePath(root), "utf8");
  } catch {
    return PALETTE_FALLBACK;
  }
}

export function look(root: string): string {
  return LOOK_FILES.map((f) => {
    try {
      return readFileSync(lookPath(root, f), "utf8");
    } catch {
      return f === LOOK_FILES[0] ? PALETTE_FALLBACK : "";
    }
  }).join("\n");
}

// EXPORTED so a test can RUN it. This is the mirror's whole client-side
// behaviour and until now nothing executed a line of it: the battery imports
// modules and asserts on strings, so anything that only happens in a browser
// shipped unverified. The reader was the test suite, twice over.

const MODAL =
  '<div id="modal"><div class="modal-box"><div class="widget-head"><span id="modal-title"></span><button class="expand" id="modal-close">✕</button></div><div class="modal-body" id="modal-body"></div></div></div><div id="toast"></div>';

function widgetHead(title: string, widgetId: string, url: string): string {
  return `<div class="widget-head"><span>${esc(title)}</span><button class="expand" data-widget="${widgetId}" data-url="${esc(url)}" title="expand · ctrl-click: new tab · shift-click: new window — both open frozen on what this card is showing">⛶</button></div>`;
}

/** see dsp-mirror-render.md#the-native-skin */
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

/** RECORD-COMPLETE, derived: every claimful state stands green, and every
 *  drawn sub-machine is record-complete in turn. A machine with nothing
 *  claimful anywhere proves nothing and stays incomplete, as does an
 *  unwalked branch's machine — a false grey, never a false green. Memoised
 *  per drawing; the memo doubles as the cycle guard. */
function recordComplete(m: MirrorState, d: MachineDecl, rc: Map<string, boolean>, green?: Set<string>): boolean {
  const known = rc.get(d.id);
  if (known !== undefined) return known;
  rc.set(d.id, false); // a cycle proves nothing
  const g = green ?? new Set(m.session.recordPaint(d));
  let provable = false;
  for (const s of d.states) {
    const claimful = s.evidence_form.length > 0;
    if (claimful || s.submachine !== undefined) provable = true;
    if (claimful && !g.has(s.id)) return false;
    if (s.submachine !== undefined && !subComplete(m, s.id, rc)) return false;
  }
  rc.set(d.id, provable);
  return provable;
}

/** A container's derived green: its drawing resolves AND that machine is
 *  record-complete. A seeded sub-machine with no drawing yet proves nothing. */
function subComplete(m: MirrorState, id: string, rc: Map<string, boolean>): boolean {
  const sub = m.session.viewFor(id);
  return sub !== undefined && recordComplete(m, sub.decl, rc);
}

/** Highlights follow the WALK; the view may be elsewhere. */
function drawingSets(
  m: MirrorState,
  decl: MachineDecl,
  info: { active: string[] },
  viewingWalk: boolean,
): {
  leafActive: Set<string>;
  done: Set<string>;
  paint: Set<string>;
  subIds: Set<string>;
  openIds: Set<string>;
  meta: Record<string, StateMeta>;
} {
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
  // see dsp-mirror-render.md#only-record-backed-states-paint
  const paint = new Set(m.session.recordPaint(decl));
  const blessed = new Set(m.session.blessedGates(decl, paint));
  const proven = new Set(m.session.lawProvenStates(decl));
  // see dsp-mirror-render.md#drift-is-computed-on-the-way-to-the-screen
  const suspect = new Set(m.session.suspectStates(decl));
  const subIds = new Set(decl.states.filter((s) => s.submachine !== undefined).map((s) => s.id));
  // WHICH OF THEM CAN ACTUALLY BE OPENED. A seeded sub-machine has no drawing
  // until its authoring state has run, and asking the resolver is the only way
  // to know — the declaration alone says nothing about whether it exists.
  const openIds = new Set([...subIds].filter((id) => m.session.viewFor(id) !== undefined));
  // see dsp-mirror-render.md#a-walked-sub-machine-must-not-look-unstarted
  const rc = new Map<string, boolean>();
  if (decl.states.some((s) => s.kind === "end") && recordComplete(m, decl, rc, paint)) {
    for (const s of decl.states) if (s.kind === "end") paint.add(s.id);
  }
  const meta: Record<string, StateMeta> = {};
  for (const s of decl.states) {
    meta[s.id] = {
      suspect: suspect.has(s.id),
      ...(blessed.has(s.id) ? { blessed: true } : {}),
      ...(proven.has(s.id) ? { law_proven: true } : {}),
      has_exit: s.exit !== undefined,
      exit_met: m.session.conditionMet(decl, s, "leave"),
      has_entry: s.entry !== undefined,
      entry_met: m.session.conditionMet(decl, s, "enter"),
      // The STATEMENT is the subtitle (owner ruling 2026-07-28): authored
      // meaning renders small under the name; empty renders nothing.
      ...(s.statement !== "" && s.statement !== s.id ? { subtitle: s.statement } : {}),
    };
  }
  return { leafActive, done, paint, subIds, openIds, meta };
}

// THE ROUTE, PROJECTED ONTO THIS DRAWING. A broken or unreachable target
// must never take the picture down with it, so the marks simply go
// missing and the machine still renders.
function routeMarksFor(m: MirrorState, decl: MachineDecl): RouteMarks | undefined {
  try {
    const r = m.session.route(m.session.target);
    const prefix = decl.id === m.session.machine.id ? "" : m.session.viewChain(decl.id).slice(1).join("/");
    const { waypoints, path: hops } = routeOverlay(r.steps, prefix);
    const localOf = (q: string): string | undefined => {
      if (prefix === "") return q.split("/")[0];
      return q.startsWith(`${prefix}/`) ? q.slice(prefix.length + 1).split("/")[0] : undefined;
    };
    // The fan's legs, projected onto this drawing like every other mark.
    const fan: { from: string; to: string }[] = [];
    for (const f of r.fan ?? []) {
      const to = localOf(f.at);
      if (to === undefined) continue;
      for (const l of f.legs) {
        const from = localOf(l);
        if (from !== undefined && from !== to) fan.push({ from, to });
      }
    }
    const shutAt = r.stops_at === undefined ? undefined : localOf(r.stops_at.at);
    const rest = prefix === "" ? r.from : r.from.startsWith(`${prefix}/`) ? r.from.slice(prefix.length + 1) : undefined;
    return {
      waypoints,
      path: hops,
      ...(fan.length > 0 ? { fan } : {}),
      here: rest !== undefined && !rest.includes("/"),
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
  widget?: "machine" | "details" | "log" | "terminal" | "table" | "trace",
  view?: string,
  card?: string,
  embed?: boolean,
  tableView?: string,
  traceProps?: string,
  traceTypes?: string,
  traceFind?: string,
  traceCorpus?: string,
  /** WHICH NODE IS THE CENTRE. Empty means the vision. */
  traceOrigin?: string,
  onPhase?: (phase: string, durationMs: number) => void,
): string {
  let phaseStarted = performance.now();
  const phase = (name: string): void => {
    const now = performance.now();
    onPhase?.(name, now - phaseStarted);
    phaseStarted = now;
  };
  const skin = embed === true ? NATIVE : "";
  const bodyClass = embed === true ? ` class="embed${widget === undefined ? "" : " solo"}"` : "";
  const info = m.session.describe() as { active: string[]; status: string };
  // The scale is READ from machines/scale.md — the Obsidian-editable
  // truth; an owner edit shows on the next reload.
  const levels = loadLevels(m.root);
  const walkMachine = m.session.currentMachine();
  const { decl, canvas } = viewedMachine(m, view ?? walkMachine.id);
  const viewingWalk = decl.id === walkMachine.id;
  phase("session");
  const history = m.session.instance.history ?? [];
  let svg = "";
  let crumbs = "";
  let states: ReturnType<typeof stateDetails> = {};
  let comment = "";
  // THE MACHINE PHASE IS REPORTED WHOLE AND IN PARTS. The parts are new; the
  // total keeps its old name and its old span, so a reader comparing across
  // runs is not silently handed a different measurement.
  const machineStarted = performance.now();
  if (widget !== "trace") {
    const { leafActive, done, paint, subIds, openIds, meta } = drawingSets(m, decl, info, viewingWalk);
    const marks = routeMarksFor(m, decl);
    phase("machine.sets");
    const INPUT_ROLES = new Set(["normal", "approval"]);
    const busbars = decl.states
      .filter((gate) => gate.busbar === true)
      .map((gate) => ({
        into: gate.id,
        feeders: decl.states
          .filter((parent) => parent.edges.some((edge) => edge.to === gate.id && INPUT_ROLES.has(edge.role ?? "normal")))
          .map((parent) => parent.id),
      }))
      .filter((bar) => bar.feeders.length >= 2);
    svg = machineSvg(canvas, leafActive, paint, subIds, openIds, meta, busbars, marks);
    phase("machine.svg");
    crumbs = crumbsFor(m, decl);
    const archived = decl.states.some((state) => state.tags?.includes("archive-record"))
      ? (m.session.expeditionList() as { archive: { id: string }[] }).archive
      : [];
    states = stateDetails(m, decl, done, archived);
    phase("machine.states");
    comment = (canvas.nodes ?? []).find((node) => node.type === "text")?.text ?? "";
  }
  phase("machine.rest");
  onPhase?.("machine", performance.now() - machineStarted);
  const packet = widget === "trace" ? { legal_tools: [] } : m.session.packet();
  phase("packet");
  const checkedDocs = m.session.humanCheckedPaths();
  phase("checked_docs");
  const data = `<script type="application/json" id="se-data">${JSON.stringify({
    build: ENGINE_LIFE,
    target: m.session.target,
    describe: info,
    packet,
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
    checkedDocs,
  }).replace(/</g, "\\u003c")}</script>`;
  phase("data");

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
  // see dsp-mirror-render.md#the-shutdown-control-is-gone

  const nrBar = "";
  // Escape has a hand-side affordance too (parity law): only while a
  // sub-machine other than boot is being walked.
  const crumbTrail = m.session.breadcrumb();
  // ESCAPE STANDS BESIDE THE POSITION, ALWAYS (owner ruling 2026-07-30). It
  // used to appear and vanish with the walk, which moved everything else in
  // the row under the reader's hand. Not applicable is DISABLED, not absent.
  const canEscape = crumbTrail.length > 1 && crumbTrail[1] !== "boot";
  const escapeBtn = `<button class="ghost" id="escape-btn"${canEscape ? "" : " disabled"} title="${canEscape ? "escape to idle — the machine is left standing, the reason is recorded" : "nothing to escape — the walk is not inside a sub-machine"}">⤴ escape</button>`;
  // see dsp-mirror-render.md#the-way-home-when-the-view-holds-still-elsewhere
  const curBtn = info.active
    .map((qualified) => qualified.split("/").pop() ?? "")
    .filter((leaf) => leaf !== "")
    .map(
      (leaf) =>
        `<button class="ghost cur-state" data-machine="${esc(walkMachine.id)}" data-state="${esc(leaf)}" title="the walk stands here — click: jump the view to it">☉ ${esc(leaf)}</button>`,
    )
    .join("");
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
  // see dsp-mirror-render.md#the-agents-terminal
  const termWidget = (
    standalone: boolean,
  ) => `<div class="widget${standalone ? "" : " no-host"}" id="w-terminal" data-morph-ignore>${widgetHead("terminal", "w-terminal", "/widget/terminal")}
    <div class="panel term-panel" id="term-body"><div class="meta" style="padding:10px 12px">no agent connected — the card keeps its slot, so no number ever shifts</div></div>
  </div>`;
  // see dsp-mirror-render.md#the-chat-card-keeps-its-slot
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
  // THE TRACE GRAPH — a function for the same reason the table is: it reads
  // every trace node off disk, and no other card wants them. Its three
  // filters arrive as query values, because each one REDRAWS the layout.
  const csv = (s: string | undefined): string[] => (s ?? "").split(",").filter((x) => x !== "");
  // ONE CORPUS, SO THERE IS NOTHING TO PICK. `corpora()` returns a single
  // trunk entry since i34, and traceCard hides the selector below two.
  //
  // THE LOOKUP AND THE FALLBACK STAY. Both are cheap, both are correct at one
  // entry, and the shape is what a second corpus would need again. The old
  // comment claimed the LAST open record was the default because it showed the
  // work in flight — with one entry that default is trunk, which is the only
  // thing there is.
  const corpora = m.session.corpora();
  const pick = corpora.find((c) => c.id === traceCorpus) ?? corpora[corpora.length - 1] ?? corpora[0];
  const traceWidget = (): string => {
    const started = performance.now();
    const html = traceCard(
      pick?.path ?? m.root,
      csv(traceProps),
      csv(traceTypes),
      traceFind ?? "",
      `<button class="expand" data-widget="w-trace" data-url="/widget/trace" title="expand · ctrl-click: new tab · shift-click: new window">⌘</button>`,
      m.root,
      corpora.map((c) => ({ id: c.id, label: c.label })),
      pick?.id ?? "trunk",
      traceOrigin ?? "",
    );
    onPhase?.("trace", performance.now() - started);
    return html;
  };
  // Read per render, so editing the look files needs no restart.
  const pal = look(m.root);
  phase("shared");

  if (widget === "trace") {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>se · trace</title><style>${pal}${STYLE}${TRACE_STYLE} #w-trace{flex:1;border-bottom:0;min-height:0} body.solo #sidebar{display:flex;flex-direction:column;height:100vh}${skin}</style>${ELEMENTS}</head>
<body${bodyClass}><div class="cols"><aside id="sidebar" style="width:100vw;max-width:100vw">${traceWidget()}</aside></div>${MODAL}${data}<script>${SCRIPT}</script><script>${TRACE_SCRIPT}</script></body></html>`;
  }

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
    { terminal: terminalWidget, machine: machineWidget, log: logWidget, details: detailsWidget, table: tblWidget, trace: traceWidget },
  );
}

// see dsp-mirror-render.md#the-card-matrix
function cardMatrixPage(
  m: MirrorState,
  card: string | undefined,
  embed: boolean | undefined,
  frame: { bodyClass: string; skin: string; pal: string; data: string },
  widgets: { terminal: string; machine: string; log: string; details: string; table: () => string; trace: () => string },
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
    ...(cardList.some((c) => c.widget === "trace") ? { trace: widgets.trace() } : {}),
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
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>se mirror</title><style>${frame.pal}${STYLE}${TABLE_STYLE}${BASES_STYLE}${BASES_TABLE_STYLE}${TRACE_STYLE}${frame.skin}</style>${ELEMENTS}</head>
<body${frame.bodyClass}>
<div class="cards" data-keep-style style="grid-template-rows:repeat(${rows},1fr)">
  ${cardsHtml}
  ${legendHtml}
  <div class="divider" id="div-cards"></div>
</div>
${MODAL}${frame.data}${cardData}<script>${SCRIPT}</script><script>${TABLE_SCRIPT}</script><script>${BASES_SCRIPT}</script><script>${TRACE_SCRIPT}</script>
</body></html>`;
}

export { SCRIPT };
