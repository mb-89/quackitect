// THE TRACE-GRAPH CARD — the filters as a header bar, then the Cytoscape drawing.
//
// IT INVENTS NO SURFACE. The cards are the machine view's state nodes, class
// for class. A click reaches the details panel through `clickable` and
// `data-detail`, the same path every other element takes.
//
// THE GRAPH IS CYTOSCAPE-BASED (replacing the old SVG renderer). Filters,
// find and centre all now work client-side — no server round-trip except
// when the corpus changes, because that changes the data set itself.
import { relative, sep } from "node:path";
import { layoutTrace, loadTrace, rootsOf, TRACE_LEVELS, visionText } from "./trace.ts";
import { traceSubsegments } from "./traceschema.ts";

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function pillColumn(title: string, dim: string, values: { id: string; label: string; n: number }[], on: string[]): string {
  const chips = values
    .map((v) => {
      const sel = on.includes(v.id) ? " on" : "";
      return `<button type="button" class="pill${sel}" data-dim="${dim}" data-value="${esc(v.id)}">${esc(v.label)}<span class="pill-n">${v.n}</span></button>`;
    })
    .join("");
  return `<div class="pill-col"><div class="pill-head">${esc(title)}</div><div class="pill-chips">${chips}</div></div>`;
}

const FILTER_HELP = [
  "Three filters — all applied live inside the graph with no page reload.",
  "",
  "VALUE PROP — which props get a wedge of the circle. Nothing selected means all are shown.",
  "",
  "TYPE — which trace levels are visible. A type left out is hidden.",
  "",
  "FIND — free text over every node's id, its statement, and every frontmatter field. Matching is case-insensitive substring.",
  "",
  "CORPUS — which tree the nodes are read from. Trunk is what has landed; an open record carries trunk plus its own work.",
].join("\n");

function shortTitle(id: string): string {
  const noPrefix = id.replace(/^(vp|sty|uc|req|fn|el|dsp|tsp)-/, "");
  const tail = noPrefix.includes(".") ? noPrefix.split(".").slice(-1)[0] : noPrefix;
  const words = tail.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
  if (words.length <= 28) return words;
  return `${words.slice(0, 25)}...`;
}

function normalizeNearLocal(angle: number, center: number): number {
  let a = angle;
  while (a - center > Math.PI) a -= Math.PI * 2;
  while (a - center < -Math.PI) a += Math.PI * 2;
  return a;
}

function normalizePositiveSpan(from: number, to: number): { from: number; to: number } {
  let end = to;
  while (end <= from) end += Math.PI * 2;
  return { from, to: end };
}

/** Mean distance from centre per level — the radius book both remap ends read. */
function levelMeans(nodes: { x: number; y: number; level: number }[]): Map<number, number> {
  const stats = new Map<number, { sum: number; count: number }>();
  for (const n of nodes) {
    const r = Math.hypot(n.x, n.y);
    const hit = stats.get(n.level) ?? { sum: 0, count: 0 };
    hit.sum += r;
    hit.count += 1;
    stats.set(n.level, hit);
  }
  const means = new Map<number, number>();
  for (const [level, st] of stats.entries()) means.set(level, st.sum / Math.max(1, st.count));
  return means;
}

function clampToWedges(
  placed: { x: number; y: number; level: number; root: string }[],
  bands: { kind: string; root: string; from: number; to: number }[],
): void {
  const wedgeByRoot = new Map(
    bands.filter((b) => b.kind === "segment").map((b) => [b.root, { from: b.from, to: b.to, center: (b.from + b.to) / 2 }]),
  );
  for (const n of placed) {
    let theta = Math.atan2(n.y, n.x);
    const r = Math.hypot(n.x, n.y);
    const wedge = wedgeByRoot.get(n.root);
    if (wedge && n.level >= 0 && n.level <= 3) {
      const { center } = wedge;
      const from = normalizeNearLocal(wedge.from, center);
      const to = normalizeNearLocal(wedge.to, center);
      theta = normalizeNearLocal(theta, center);
      const widened = center + (theta - center) * 1.1;
      const margin = 0.012;
      theta = Math.max(from + margin, Math.min(to - margin, widened));
    }
    n.x = Math.cos(theta) * r;
    n.y = Math.sin(theta) * r;
  }
}

function retargetLevelRadii(placed: { x: number; y: number; level: number }[], nodeH: number): void {
  const levels = [...new Set(placed.map((n) => n.level).filter((x) => x >= 0))].sort((a, b) => a - b);
  if (levels.length <= 1) return;
  const byLevel = new Map<number, { x: number; y: number; level: number }[]>();
  for (const lv of levels) byLevel.set(lv, []);
  for (const n of placed) if (n.level >= 0) byLevel.get(n.level)?.push(n);
  const meanNow = new Map<number, number>();
  for (const lv of levels) {
    const lane = byLevel.get(lv) ?? [];
    meanNow.set(lv, lane.reduce((s, n) => s + Math.hypot(n.x, n.y), 0) / Math.max(1, lane.length));
  }
  const rMin = meanNow.get(levels[0]) ?? 0;
  const rMax = meanNow.get(levels[levels.length - 1]) ?? rMin;
  const minGap = nodeH * 1.45;
  const target = new Map<number, number>();
  for (let i = 0; i < levels.length; i++) {
    const t = i / Math.max(1, levels.length - 1);
    target.set(levels[i], rMin + (rMax - rMin) * t ** 0.78);
  }
  for (let i = 1; i < levels.length; i++) {
    const floor = (target.get(levels[i - 1]) ?? 0) + minGap;
    if ((target.get(levels[i]) ?? 0) < floor) target.set(levels[i], floor);
  }
  for (const n of placed) {
    if (n.level < 0) continue;
    const oldMean = meanNow.get(n.level) ?? Math.hypot(n.x, n.y);
    const newMean = target.get(n.level) ?? oldMean;
    const rr = Math.hypot(n.x, n.y);
    const theta = Math.atan2(n.y, n.x);
    const boost = n.level === 3 ? nodeH * 2.2 : 0;
    const shifted = newMean + (rr - oldMean) * 0.62 + boost;
    n.x = Math.cos(theta) * shifted;
    n.y = Math.sin(theta) * shifted;
  }
}

function deconflict(placed: { x: number; y: number }[], threshold: number): void {
  const overlaps = (a: { x: number; y: number }, b: { x: number; y: number }): boolean => Math.hypot(a.x - b.x, a.y - b.y) < threshold;
  for (let pass = 0; pass < 36; pass++) {
    let moved = false;
    for (let i = 0; i < placed.length; i++) {
      for (let j = i + 1; j < placed.length; j++) {
        if (!overlaps(placed[i], placed[j])) continue;
        const ai = Math.atan2(placed[i].y, placed[i].x);
        const aj = Math.atan2(placed[j].y, placed[j].x);
        const ri = Math.hypot(placed[i].x, placed[i].y);
        const rj = Math.hypot(placed[j].x, placed[j].y);
        const d = 0.0045;
        placed[i].x = Math.cos(ai - d) * Math.max(20, ri + 0.6);
        placed[i].y = Math.sin(ai - d) * Math.max(20, ri + 0.6);
        placed[j].x = Math.cos(aj + d) * Math.max(20, rj + 0.6);
        placed[j].y = Math.sin(aj + d) * Math.max(20, rj + 0.6);
        moved = true;
      }
    }
    if (!moved) break;
  }
}

function uniformScale(placed: { x: number; y: number }[], threshold: number): number {
  let need = 1;
  for (let i = 0; i < placed.length; i++) {
    for (let j = i + 1; j < placed.length; j++) {
      const dist = Math.hypot(placed[i].x - placed[j].x, placed[i].y - placed[j].y);
      if (dist >= threshold || dist <= 1e-6) continue;
      need = Math.max(need, threshold / dist);
    }
  }
  if (need <= 1) return 1;
  const scaleFactor = need * 1.02;
  for (const n of placed) {
    n.x *= scaleFactor;
    n.y *= scaleFactor;
  }
  return scaleFactor;
}

function radiusRemapper(origMeans: Map<number, number>, finalMeans: Map<number, number>, scaleFactor: number): (r: number) => number {
  const remapAnchors: { orig: number; final: number }[] = [{ orig: 0, final: 0 }];
  for (const [level, origMean] of origMeans.entries()) {
    const finalMean = finalMeans.get(level);
    if (!Number.isFinite(origMean) || !Number.isFinite(finalMean)) continue;
    remapAnchors.push({ orig: origMean, final: finalMean as number });
  }
  remapAnchors.sort((a, b) => a.orig - b.orig);
  return (r: number): number => {
    if (!Number.isFinite(r)) return r;
    if (remapAnchors.length < 2) return r * scaleFactor;
    if (r <= remapAnchors[0].orig) return remapAnchors[0].final;
    for (let i = 1; i < remapAnchors.length; i++) {
      const a = remapAnchors[i - 1];
      const b = remapAnchors[i];
      if (r > b.orig) continue;
      const span = Math.max(1e-6, b.orig - a.orig);
      return a.final + (b.final - a.final) * ((r - a.orig) / span);
    }
    const a = remapAnchors[remapAnchors.length - 2];
    const b = remapAnchors[remapAnchors.length - 1];
    return b.final + (r - b.orig) * ((b.final - a.final) / Math.max(1e-6, b.orig - a.orig));
  };
}

/** Build all Cytoscape elements and overlay geometry from a loaded + laid-out trace. */
function buildGeometry(root: string, all: ReturnType<typeof loadTrace>, selected: string[], types: string[], find: string, origin: string) {
  const subsegments = traceSubsegments(root);
  const laid = layoutTrace(all, selected, { types, find, origin }, subsegments);

  const NODE_W = 126;
  const NODE_H = 24;
  const NODE_R = Math.hypot(NODE_W * 0.5, NODE_H * 0.5);

  const placed = laid.nodes.map((n) => ({ ...n, x: n.x, y: n.y }));

  const levelMeanRadius = levelMeans(placed);
  clampToWedges(placed, laid.bands ?? []);
  retargetLevelRadii(placed, NODE_H);

  const threshold = NODE_W * 0.52;
  deconflict(placed, threshold);
  const scaleFactor = uniformScale(placed, threshold);

  const remapRadius = radiusRemapper(levelMeanRadius, levelMeans(placed.filter((n) => n.level >= 0)), scaleFactor);

  const segmentBands = (laid.bands ?? []).filter((b) => b.kind === "segment");
  const outerGuideFromBand = remapRadius(Math.max(1, ...segmentBands.map((b) => b.r)));
  const outerNodeR = placed.length ? Math.max(1, ...placed.map((n) => Math.hypot(n.x, n.y))) : 1;
  const outerGuideR = Math.max(outerGuideFromBand, outerNodeR + NODE_R * 0.95);

  const levelOrder = [...new Set(placed.map((n) => n.level).filter((lv) => lv >= 0))].sort((a, b) => a - b);
  const levelRanges = levelOrder.map((lv) => {
    const lane = placed.filter((n) => n.level === lv);
    const radii = lane.map((n) => Math.hypot(n.x, n.y));
    const minC = Math.min(...radii),
      maxC = Math.max(...radii);
    return { level: lv, inner: minC - NODE_R, outer: maxC + NODE_R };
  });
  const boundaryRadii = levelRanges.map((r, idx) =>
    idx < levelRanges.length - 1 ? (r.outer + levelRanges[idx + 1].inner) / 2 : Math.max(outerGuideR, r.outer + NODE_H * 0.6),
  );
  const displayOuterR = outerGuideR;

  function nearestBoundaryRadius(r: number): number {
    if (!boundaryRadii.length) return r;
    let best = boundaryRadii[0],
      bestDist = Math.abs(r - best);
    for (let i = 1; i < boundaryRadii.length; i++) {
      const d = Math.abs(r - boundaryRadii[i]);
      if (d < bestDist) {
        bestDist = d;
        best = boundaryRadii[i];
      }
    }
    return best;
  }

  const guideSpokes = (laid.spokes ?? []).map((s, i) => {
    const baseR0 = remapRadius(s.r0);
    const r0 = s.kind === "slice" ? nearestBoundaryRadius(baseR0) : baseR0;
    return {
      id: `sp-${i}`,
      kind: s.kind,
      at: s.at,
      x0: Math.cos(s.at) * r0,
      y0: Math.sin(s.at) * r0,
      x1: Math.cos(s.at) * displayOuterR,
      y1: Math.sin(s.at) * displayOuterR,
    };
  });

  const sectionAngles = guideSpokes.filter((s) => s.kind === "section").map((s) => s.at);
  function nearestSectionAngle(a: number): number {
    if (!sectionAngles.length) return a;
    let best = sectionAngles[0],
      bestDist = Infinity;
    for (const x of sectionAngles) {
      const d = Math.abs(normalizeNearLocal(a, x) - x);
      if (d < bestDist) {
        bestDist = d;
        best = x;
      }
    }
    return best;
  }

  const sectorLabels: { label: string; x: number; y: number; angle: number; radiusOffset: number }[] = [];
  const typeLabels: { label: string; x: number; y: number; angle: number; from: number; to: number; r: number }[] = [];

  const sectorRegions = (laid.sectors ?? []).map((s, i) => {
    const span = normalizePositiveSpan(s.from, s.to);
    const ringIdx = Math.max(0, Math.min(boundaryRadii.length - 1, s.ring));
    const inner = ringIdx === 0 ? 0 : (boundaryRadii[ringIdx - 1] ?? remapRadius(s.r0));
    const outer = Math.min(boundaryRadii[ringIdx] ?? remapRadius(s.r1), displayOuterR);
    const mid = span.from + (span.to - span.from) / 2;
    if (String(s.label || "").trim()) {
      const labelR = inner + (outer - inner) * 0.5;
      typeLabels.push({
        label: String(s.label),
        x: Math.cos(mid) * labelR,
        y: Math.sin(mid) * labelR,
        angle: mid,
        from: span.from,
        to: span.to,
        r: labelR,
      });
    }
    return { id: `sr-${i}`, root: s.root, from: span.from, to: span.to, r0: inner, r1: outer, mid };
  });

  const levelRingArcs: { id: string; from: number; to: number; r: number }[] = [];
  const seen = new Set<string>();
  for (const s of laid.sectors ?? []) {
    const span = normalizePositiveSpan(s.from, s.to);
    const ringIdx = Math.max(0, Math.min(boundaryRadii.length - 1, s.ring));
    const r = Math.min(boundaryRadii[ringIdx] ?? remapRadius(s.r1), displayOuterR);
    if (r <= 1) continue;
    const key = `${s.root}|${s.slice}|${ringIdx}|${span.from.toFixed(6)}|${span.to.toFixed(6)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    levelRingArcs.push({ id: `lr-${levelRingArcs.length}`, from: span.from, to: span.to, r });
  }

  for (const b of segmentBands) {
    const fromSnap = nearestSectionAngle(b.from);
    const toSnap = nearestSectionAngle(b.to);
    const span = normalizePositiveSpan(fromSnap, toSnap);
    const mid = span.from + (span.to - span.from) / 2;
    const r = Math.min(remapRadius(b.r), displayOuterR);
    const labelR = r + NODE_H * 1.7;
    sectorLabels.push({ label: String(b.label), x: Math.cos(mid) * labelR, y: Math.sin(mid) * labelR, angle: mid, radiusOffset: 20 });
  }

  const nodes = [
    { data: { id: "vision", title: "vision", type: "vision", full: "vision", root: "vision", level: -1 }, position: { x: 0, y: 0 } },
    ...placed.map((n) => ({
      data: { id: n.key, title: shortTitle(n.id), type: n.type, full: n.id, root: n.root, level: n.level },
      position: { x: n.x, y: n.y },
    })),
  ];
  const edges = laid.edges.map((e, i) => ({
    data: { id: `e-${i + 1}`, source: e.from, target: e.to, kind: "link" },
  }));

  return {
    nodes,
    edges,
    guideSpokes,
    sectorArcs: segmentBands.map((b, i) => ({ id: `arc-${i}`, from: b.from, to: b.to, r: remapRadius(b.r) })),
    levelRingArcs,
    sectorRegions,
    sectorLabels,
    typeLabels,
  };
}

export function traceCard(
  root: string,
  selected: string[],
  types: string[],
  find: string,
  expand: string,
  projectRoot: string = root,
  corpora: { id: string; label: string }[] = [],
  corpus = "",
  origin = "",
): string {
  const all = loadTrace(root);
  const props = all.filter((n) => n.type === TRACE_LEVELS[0]);
  const rootOf = rootsOf(all);
  const propValues = props.map((p) => ({
    id: p.id,
    label: p.id.replace(/^vp-/, ""),
    n: all.filter((n) => rootOf.get(n.id) === p.id).length,
  }));
  const typeValues = TRACE_LEVELS.map((t) => ({ id: t, label: t, n: all.filter((n) => n.type === t).length }));

  const subjects: Record<string, { statement: string; type: string; path: string }> = {
    vision: { statement: visionText(root), type: "vision", path: "the motivation gate's report" },
    filter: { statement: FILTER_HELP, type: "filter", path: "value prop · type · find · centre" },
  };
  for (const n of all) {
    const file = n.file === undefined ? "" : relative(projectRoot, n.file).split(sep).join("/");
    subjects[n.id] = { statement: n.statement, type: n.type, path: file };
  }

  const data = `<script type="application/json" id="se-trace">${JSON.stringify(subjects).replace(/</g, "\\u003c")}</script>`;

  if (props.length === 0) {
    return `<div class="widget" id="w-trace"><div class="widget-head"><span>trace graph</span>${expand}</div><div class="widget-body"><div class="meta" style="padding:10px 12px">no trace nodes yet — the graph draws as project/spec/trace/ fills</div></div></div>`;
  }

  const geo = buildGeometry(root, all, selected, types, find, origin);

  // Full node data including metadata needed for client-side filtering
  const nodeData = geo.nodes.map((n) => {
    const src = all.find((a) => a.id === n.data.full) ?? null;
    return { ...n.data, statement: src?.statement ?? "", hay: src?.hay ?? "" };
  });

  const geoIsland = `<script type="application/json" id="se-trace-geo">${JSON.stringify({ nodes: geo.nodes, nodeData, edges: geo.edges, guideSpokes: geo.guideSpokes, sectorArcs: geo.sectorArcs, levelRingArcs: geo.levelRingArcs, sectorRegions: geo.sectorRegions, sectorLabels: geo.sectorLabels, typeLabels: geo.typeLabels }).replace(/</g, "\\u003c")}</script>`;

  const body =
    '<div class="trace-filters clickable" data-detail="trace:filter">' +
    `${pillColumn("value prop", "prop", propValues, selected)}${pillColumn("type", "type", typeValues, types)}` +
    (corpora.length < 2
      ? ""
      : '<label class="trace-field"><span class="pill-head">source</span>' +
        `<select class="trace-corpus">${corpora.map((c) => `<option value="${esc(c.id)}"${c.id === corpus ? " selected" : ""}>${esc(c.label)}</option>`).join("")}</select></label>`) +
    "</div>" +
    '<div class="trace-canvas"><div id="w-trace-cy"></div></div>' +
    data +
    geoIsland;

  return `<div class="widget" id="w-trace"><div class="widget-head"><span>trace graph</span>${expand}</div><div class="widget-body">${body}</div></div>`;
}

export const TRACE_STYLE = `
/* The filters are a HEADER BAR; the graph gets the whole panel under it. */
#w-trace .widget-body { display:flex; flex-direction:column; min-height:0; }
.trace-filters { display:flex; gap:14px; padding:8px 10px; border-bottom:1px solid var(--se-line);
  flex:none; align-items:flex-start; overflow-x:auto; }
.pill-col { display:flex; flex-direction:column; gap:4px; min-width:0; }
.trace-fields { gap:5px; }
.trace-field { display:grid; grid-template-columns:48px minmax(0,1fr); align-items:center; gap:8px; }
.trace-field .pill-head { text-align:right; }
.pill-head { font-size:11px; color:var(--se-muted); }
.pill-chips { display:flex; flex-direction:column; gap:3px; max-height:150px; overflow:auto; }
.pill { display:flex; justify-content:space-between; gap:8px; padding:3px 8px; border:1px solid var(--se-border-strong);
  border-radius:9px; background:var(--se-raised); color:var(--se-fg); font:inherit; font-size:11px; cursor:pointer; text-align:left; }
.pill:hover { border-color:var(--se-accent); }
.pill.on { border-color:var(--se-accent); color:var(--se-accent); }
.pill-n { color:var(--se-muted); }
.trace-find { appearance:none; -webkit-appearance:none; padding:3px 7px; font:inherit; font-size:11px; min-width:190px;
  background:var(--se-raised); color:var(--se-fg); border:1px solid var(--se-border-strong); border-radius:3px; }
.trace-find:focus { border-color:var(--se-accent); outline:none; }
.trace-corpus { appearance:none; -webkit-appearance:none; padding:3px 22px 3px 7px; font:inherit; font-size:11px;
  min-width:190px; background:var(--se-raised); color:var(--se-fg); border:1px solid var(--se-border-strong);
  border-radius:3px; cursor:pointer;
  background-image:linear-gradient(45deg,transparent 50%,var(--se-muted) 50%),linear-gradient(135deg,var(--se-muted) 50%,transparent 50%);
  background-position:calc(100% - 13px) 50%, calc(100% - 8px) 50%; background-size:5px 5px, 5px 5px; background-repeat:no-repeat; }
.trace-corpus:hover,.trace-corpus:focus { border-color:var(--se-accent); outline:none; }
.trace-corpus option { background:var(--se-bg-side); color:var(--se-fg); }
/* THE CANVAS fills the remaining height */
.trace-canvas { flex:1; min-width:0; min-height:0; position:relative; overflow:hidden; }
#w-trace-cy { width:100%; height:100%; }
/* OVERLAY for separators, rings, and labels */
#w-trace-overlay { position:absolute; inset:0; pointer-events:none; overflow:hidden; }
#w-trace-overlay svg { position:absolute; inset:0; width:100%; height:100%; overflow:visible; pointer-events:none; }
#w-trace-labels { z-index:2; position:absolute; inset:0; width:100%; height:100%; overflow:visible; pointer-events:none; }
/* THE WRITE RING — a node the model just wrote. The blink runs once, then the
   yellow fades over a minute; both are CSS, so the browser owns the timeline. */
.trace-write-ring {
  stroke: #e8c34a; stroke-width: 2.5; vector-effect: non-scaling-stroke;
  animation: trace-ring-blink .5s ease-in-out 2, trace-ring-fade 60s linear 1s forwards;
}
@keyframes trace-ring-blink { 50% { opacity: .2; } }
@keyframes trace-ring-fade { from { opacity: 1; } to { opacity: 0; } }
.trace-center-badge {
  position:absolute; transform:translate(-50%,-50%); width:30px; height:30px; border-radius:50%;
  background:#2a5f9c; border:1px solid #9fc0ff; color:#edf0f4;
  display:flex; align-items:center; justify-content:center;
  font:700 8px/1 inherit; pointer-events:none; z-index:3; box-sizing:border-box; text-transform:lowercase;
}
`;

/** LIVE FILTERING AND INTERACTION — Cytoscape-based.
 *
 *  Pill filters, find and centre all update the graph in memory.
 *  No server round-trip is needed except for corpus change (different data).
 *
 *  NODE CLICK fires the same detail-panel event the old SVG did: a custom
 *  'se-detail' event with the node's id and subject, which the host panel
 *  listener picks up. */
export const TRACE_SCRIPT = `
(function(){
  function boot(){
    var container = document.getElementById('w-trace-cy');
    if(!container) return;
    var geoTag = document.getElementById('se-trace-geo');
    if(!geoTag) return;
    var geo = JSON.parse(geoTag.textContent);

    var nodeById = {};
    for(var i=0;i<geo.nodeData.length;i++){ var nd=geo.nodeData[i]; nodeById[nd.id]=nd; }

    var detailFor = (function(){
      var tag = document.getElementById('se-trace');
      try{ return tag ? JSON.parse(tag.textContent) : {}; }catch(e){ return {}; }
    })();

    var cy = cytoscape({
      container: container,
      elements: geo.nodes.concat(geo.edges),
      style: [
        { selector: 'node[title]', style: {
          'shape': 'round-rectangle',
          'background-color': '#202733',
          'border-width': 1, 'border-color': '#515b6f',
          'label': 'data(title)',
          'font-size': 10, 'text-wrap': 'none',
          'text-valign': 'center', 'text-halign': 'center',
          'color': '#edf0f4',
          'width': 126, 'height': 24,
          'padding-left': 12, 'padding-right': 12
        }},
        { selector: 'edge[kind = "link"]', style: {
          'width': 1.8, 'line-color': '#d8dde6',
          'curve-style': 'bezier', 'target-arrow-shape': 'none', 'opacity': 0.72
        }},
        { selector: 'node[type = "vision"]', style: {
          'shape': 'ellipse', 'background-color': '#2a5f9c', 'border-color': '#9fc0ff',
          'font-size': 12, 'width': 30, 'height': 30, 'font-weight': 'bold', 'z-index': 20, 'label': ''
        }},
        { selector: '.hidden', style: { 'display': 'none' }},
        { selector: '.dim', style: { 'opacity': 0.12 }},
      ],
      layout: { name: 'preset', fit: true, padding: 120, animate: false },
      wheelSensitivity: 6,
      autounselectify: true,
    });
    cy.minZoom(0.02); cy.maxZoom(2.6);
    var realNodes = cy.nodes().not('[?guide]');
    cy.fit(realNodes, 120);
    cy.center(realNodes);

    // ---- OVERLAY ----
    var canvas = container.parentElement;
    canvas.style.position = 'relative';
    var overlayDiv = document.createElement('div');
    overlayDiv.id = 'w-trace-overlay';
    overlayDiv.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:hidden;';
    canvas.appendChild(overlayDiv);

    var NS = 'http://www.w3.org/2000/svg';
    function makeSvg(){ var s=document.createElementNS(NS,'svg'); s.style.cssText='position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none;'; return s; }
    var sectorSvg = makeSvg(), guideSvg = makeSvg(), pingSvg = makeSvg(), labelSvg = makeSvg();
    labelSvg.style.zIndex = '2';
    overlayDiv.appendChild(sectorSvg); overlayDiv.appendChild(guideSvg); overlayDiv.appendChild(pingSvg); overlayDiv.appendChild(labelSvg);

    var sectorPaths = geo.sectorRegions.map(function(region){
      var p = document.createElementNS(NS,'path');
      p.setAttribute('fill','rgba(212,212,212,0.0)'); p.setAttribute('stroke','rgba(209,214,223,0.40)');
      p.setAttribute('stroke-width','1.2'); p.setAttribute('vector-effect','non-scaling-stroke');
      p.dataset.root = region.root; sectorSvg.appendChild(p);
      return { data: region, el: p };
    });
    var spokePaths = geo.guideSpokes.map(function(s){
      var p = document.createElementNS(NS,'path');
      p.setAttribute('fill','none'); p.setAttribute('stroke','#cfd6e1');
      p.setAttribute('stroke-opacity', s.kind==='slice' ? '0.34' : '0.24');
      p.setAttribute('stroke-width', s.kind==='slice' ? '1.5' : '1.1');
      p.setAttribute('stroke-linecap','round'); p.setAttribute('vector-effect','non-scaling-stroke');
      guideSvg.appendChild(p); return { data: s, el: p };
    });
    var ringPaths = geo.levelRingArcs.map(function(a){
      var p = document.createElementNS(NS,'path');
      p.setAttribute('fill','none'); p.setAttribute('stroke','#cfd6e1');
      p.setAttribute('stroke-opacity','0.20'); p.setAttribute('stroke-width','1.05');
      p.setAttribute('stroke-linecap','round'); p.setAttribute('vector-effect','non-scaling-stroke');
      guideSvg.appendChild(p); return { data: a, el: p };
    });
    var allLabels = geo.sectorLabels.map(function(s){ return { data:s, inner:false }; })
      .concat(geo.typeLabels.map(function(s){ return { data:s, inner:true }; }));
    var labelItems = allLabels.map(function(item, idx){
      var s=item.data, g=document.createElementNS(NS,'g'), path=document.createElementNS(NS,'path'), text=document.createElementNS(NS,'text'), tp=document.createElementNS(NS,'textPath');
      var id='tl-'+idx; path.setAttribute('id',id); path.setAttribute('fill','none'); path.setAttribute('stroke','none');
      text.setAttribute('fill',item.inner?'#aeb8c6':'#c6cfdb'); text.setAttribute('font-size',item.inner?'1':'16'); text.setAttribute('font-weight',item.inner?'400':'600');
      text.setAttribute('letter-spacing',item.inner?'0':'0.02em'); text.setAttribute('text-anchor','middle'); text.style.textTransform='lowercase';
      tp.setAttribute('href','#'+id); tp.setAttribute('startOffset','50%'); tp.textContent=s.label;
      text.appendChild(tp); g.appendChild(path); g.appendChild(text); labelSvg.appendChild(g);
      return { data:s, inner:item.inner, group:g, path:path, text:text };
    });

    function nrm(a,c){ while(a-c>Math.PI)a-=Math.PI*2; while(c-a>Math.PI)a+=Math.PI*2; return a; }
    function toS(x,y,z,p){ return {x:x*z+p.x, y:y*z+p.y}; }

    function sectorD(r,z,p){
      var r0=Math.max(0,r.r0)*z, r1=Math.max(r0+z,r.r1*z);
      var f=r.from,t=r.to;
      var lg=(t-f)>Math.PI?1:0;
      return 'M '+(Math.cos(f)*r1+p.x)+' '+(Math.sin(f)*r1+p.y)+' A '+r1+' '+r1+' 0 '+lg+' 1 '+(Math.cos(t)*r1+p.x)+' '+(Math.sin(t)*r1+p.y)+' L '+(Math.cos(t)*r0+p.x)+' '+(Math.sin(t)*r0+p.y)+' A '+r0+' '+r0+' 0 '+lg+' 0 '+(Math.cos(f)*r0+p.x)+' '+(Math.sin(f)*r0+p.y)+' Z';
    }
    function labelD(s,z,p){
      var angle=s.angle!=null?s.angle:Math.atan2(s.y,s.x);
      var radius=Math.max(1,Math.hypot(s.x,s.y)*z+(s.radiusOffset||0));
      var flip=Math.sin(angle)>0;
      var tw=Math.max(72,String(s.label).length*8.5+24);
      var span=Math.min(1.15,Math.max(0.32,tw/radius));
      var f=flip?angle+span/2:angle-span/2, t=flip?angle-span/2:angle+span/2;
      var lg=Math.abs(t-f)>Math.PI?1:0, sw=flip?0:1;
      return 'M '+(Math.cos(f)*radius+p.x)+' '+(Math.sin(f)*radius+p.y)+' A '+radius+' '+radius+' 0 '+lg+' '+sw+' '+(Math.cos(t)*radius+p.x)+' '+(Math.sin(t)*radius+p.y);
    }
    function ringLabelD(s,z,p){
      var sweep=Math.min(s.to-s.from,Math.PI*2-0.02), mid=s.from+sweep/2;
      var flip=Math.sin(mid)>0, a=flip?s.from+sweep:s.from, b=flip?s.from:s.from+sweep;
      var radius=Math.max(1,s.r*z), large=sweep>Math.PI?1:0, direction=flip?0:1;
      return 'M '+(Math.cos(a)*radius+p.x)+' '+(Math.sin(a)*radius+p.y)+' A '+radius+' '+radius+' 0 '+large+' '+direction+' '+(Math.cos(b)*radius+p.x)+' '+(Math.sin(b)*radius+p.y);
    }
    function ringLabelSize(s){
      var arc=Math.abs(s.r*(s.to-s.from)), need=Math.max(1,String(s.label).length)*0.58;
      return Math.min(30,arc/need);
    }

    var litId = null;
    var hoverSector = null;

    function placeOverlay(){
      var z=cy.zoom(), pan=cy.pan();
      for(var i=0;i<sectorPaths.length;i++){
        var sp=sectorPaths[i], active=hoverSector===sp.data.id||(litId&&sp.data.root===litId);
        sp.el.setAttribute('d', sectorD(sp.data,z,pan));
        sp.el.setAttribute('stroke', active?'rgba(209,214,223,0.72)':'rgba(209,214,223,0.40)');
        sp.el.setAttribute('fill', active?'rgba(212,212,212,0.05)':'rgba(212,212,212,0.0)');
      }
      for(var i=0;i<spokePaths.length;i++){
        var s=spokePaths[i].data, fr=toS(s.x0,s.y0,z,pan), to2=toS(s.x1,s.y1,z,pan);
        spokePaths[i].el.setAttribute('d','M '+fr.x+' '+fr.y+' L '+to2.x+' '+to2.y);
      }
      for(var i=0;i<ringPaths.length;i++){
        var a=ringPaths[i].data, r2=Math.max(1,a.r*z);
        var s1=toS(Math.cos(a.from)*a.r,Math.sin(a.from)*a.r,z,pan);
        var e1=toS(Math.cos(a.to)*a.r,  Math.sin(a.to)*a.r,  z,pan);
        var lg2=(a.to-a.from)>Math.PI?1:0;
        ringPaths[i].el.setAttribute('d','M '+s1.x+' '+s1.y+' A '+r2+' '+r2+' 0 '+lg2+' 1 '+e1.x+' '+e1.y);
      }
      for(var i=0;i<labelItems.length;i++){
        var label=labelItems[i];
        if(label.inner){
          var sourceSize=ringLabelSize(label.data);
          label.group.setAttribute('display',sourceSize<9.5?'none':'');
          label.path.setAttribute('d',ringLabelD(label.data,z,pan));
          label.text.setAttribute('font-size',String(sourceSize*z*3));
          label.text.setAttribute('opacity','0.62');
        }else{
          label.path.setAttribute('d',labelD(label.data,z,pan));
          label.text.setAttribute('opacity','0.68');
        }
      }
      placeRings(z,pan);
    }

    // ---- THE WRITE TRAIL ----
    // A ring on the overlay, not a node style: the SVG is real DOM, so the CSS
    // does the blink and the minute-long fade on its own. Placed with the same
    // transform as every other overlay shape, so it tracks pan and zoom.
    var TRAIL_MS=61000;
    var rings={};
    var byFullId={};
    cy.nodes().forEach(function(n){ var nd=nodeById[n.id()]; if(nd&&nd.full) byFullId[nd.full]=n; });
    function placeRings(z,pan){
      for(var id in rings){
        var r=rings[id], p=r.node.position();
        r.el.setAttribute('cx',p.x*z+pan.x);
        r.el.setAttribute('cy',p.y*z+pan.y);
        r.el.setAttribute('rx',71*z);
        r.el.setAttribute('ry',20*z);
      }
    }
    // A node keeps ONE ring. Writing it again restarts that ring's animation:
    // the class comes off, the reflow makes the browser notice, it goes back on.
    function renewRing(id,node){
      var r=rings[id];
      if(r===undefined){
        var el=document.createElementNS(NS,'ellipse');
        el.setAttribute('fill','none');
        pingSvg.appendChild(el);
        r=rings[id]={ el:el, node:node, timer:null, at:0 };
      }
      r.el.classList.remove('trace-write-ring');
      void r.el.getBoundingClientRect();
      r.el.classList.add('trace-write-ring');
      if(r.timer) clearTimeout(r.timer);
      r.timer=setTimeout(function(){
        if(r.el.parentNode) r.el.parentNode.removeChild(r.el);
        delete rings[id];
      },TRAIL_MS);
      return r;
    }
    window.seTraceTrail=function(list){
      if(!list) return;
      for(var i=0;i<list.length;i++){
        var e=list[i], node=byFullId[e.id];
        // The trail repeats on every poll; only a NEWER write renews the ring.
        if(!node||(rings[e.id]&&rings[e.id].at>=e.at)) continue;
        renewRing(e.id,node).at=e.at;
      }
      placeRings(cy.zoom(),cy.pan());
    };
    window.seTracePing=function(id){
      var node=byFullId[id];
      if(!node) return false;
      renewRing(id,node).at=Date.now();
      placeRings(cy.zoom(),cy.pan());
      return true;
    };

    cy.on('render', placeOverlay); placeOverlay();

    // ---- DETAIL PANEL ----
    // Fires the same event the host panel listener expects.
    // The host uses document-level 'click' delegation on .clickable[data-detail].
    // We synthesise that by calling the detail handler directly if available,
    // or dispatching a click on a temporary element.
    function showDetail(nodeFullId){
      var d = detailFor[nodeFullId];
      if(!d) return;
      // Try the host's own detail handler first
      if(typeof window.seDetail === 'function'){ window.seDetail(nodeFullId, d); return; }
      // Fallback: dispatch a click on a hidden element the host will intercept
      var tmp = document.createElement('span');
      tmp.className = 'clickable'; tmp.dataset.detail = 'trace:'+nodeFullId;
      tmp.style.cssText = 'position:fixed;top:-9999px;left:-9999px;';
      document.body.appendChild(tmp);
      tmp.click();
      document.body.removeChild(tmp);
    }

    // ---- LIGHTING ----
    function lightUp(nodeId){
      litId = nodeId;
      cy.elements().removeClass('dim');
      if(!nodeId){ placeOverlay(); return; }
      var near={};
      cy.edges().forEach(function(e){ if(e.data('source')===nodeId)near[e.data('target')]=1; if(e.data('target')===nodeId)near[e.data('source')]=1; });
      cy.nodes().forEach(function(n){ var id=n.id(); if(id!==nodeId&&!near[id])n.addClass('dim'); });
      cy.edges().forEach(function(e){ if(e.data('source')!==nodeId&&e.data('target')!==nodeId)e.addClass('dim'); });
      placeOverlay();
    }
    function clearLight(){ litId=null; cy.elements().removeClass('dim'); placeOverlay(); }

    cy.on('tap','node',function(ev){
      var node=ev.target, id=node.id();
      if(litId===id){ clearLight(); return; }
      lightUp(id);
      var nd=nodeById[id]; showDetail(nd?nd.full:id);
    });
    cy.on('tap',function(ev){ if(ev.target===cy) clearLight(); });
    cy.on('dbltap','node',function(ev){
      var node=ev.target;
      cy.animate({ center:{eles:node}, zoom:Math.min(cy.maxZoom(),cy.zoom()/0.5) },{duration:220});
    });

    // ---- CLIENT-SIDE FILTERS ----
    function on(dim){ return Array.from(document.querySelectorAll('#w-trace .pill[data-dim="'+dim+'"].on')).map(function(b){return b.dataset.value;}); }

    function applyFilters(){
      relayout();
    }

    // Sectors respond to hover and double-click only; filtering stays with the pills above.
    function sectorBBox(r){
      var n=48, minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
      var radii = r.r0>0 ? [r.r0,r.r1] : [r.r1];
      for(var ri=0; ri<radii.length; ri++){
        var rad=radii[ri];
        for(var i=0;i<=n;i++){
          var a=r.from+(r.to-r.from)*(i/n);
          var x=Math.cos(a)*rad, y=Math.sin(a)*rad;
          if(x<minX)minX=x; if(x>maxX)maxX=x; if(y<minY)minY=y; if(y>maxY)maxY=y;
        }
      }
      return {x1:minX,y1:minY,x2:maxX,y2:maxY};
    }
    function zoomToSector(region){
      var bb=sectorBBox(region);
      var w=Math.max(1,bb.x2-bb.x1), h=Math.max(1,bb.y2-bb.y1);
      var cw=container.clientWidth||1, ch=container.clientHeight||1, pad=60;
      var z=Math.max(cy.minZoom(),Math.min(cy.maxZoom(),Math.min((cw-pad*2)/w,(ch-pad*2)/h)));
      var cx=(bb.x1+bb.x2)/2, cyy=(bb.y1+bb.y2)/2;
      cy.animate({ zoom:z, pan:{ x:cw/2-cx*z, y:ch/2-cyy*z } },{ duration:260 });
    }
    // The inverse of toS, so the hit-test lands on exactly what was drawn.
    function sectorAt(clientX,clientY){
      var rect=container.getBoundingClientRect();
      var sx=(container.clientWidth||rect.width||1)/(rect.width||1);
      var sy=(container.clientHeight||rect.height||1)/(rect.height||1);
      var z=cy.zoom(), pan=cy.pan();
      var mx=((clientX-rect.left)*sx-pan.x)/z, my=((clientY-rect.top)*sy-pan.y)/z;
      var radius=Math.hypot(mx,my), base=Math.atan2(my,mx);
      for(var i=0;i<sectorPaths.length;i++){
        var region=sectorPaths[i].data;
        if(radius<region.r0||radius>region.r1) continue;
        var angle=base;
        while(angle<region.from) angle+=Math.PI*2;
        while(angle-Math.PI*2>=region.from) angle-=Math.PI*2;
        if(angle<=region.to) return region;
      }
      return null;
    }
    container.addEventListener('pointermove', function(ev){
      var hit=sectorAt(ev.clientX,ev.clientY);
      var next=hit?hit.id:null;
      if(next!==hoverSector){ hoverSector=next; placeOverlay(); }
    });
    container.addEventListener('pointerleave', function(){
      if(hoverSector!==null){ hoverSector=null; placeOverlay(); }
    });
    container.addEventListener('dblclick', function(ev){
      var hit=sectorAt(ev.clientX,ev.clientY);
      if(hit) zoomToSector(hit);
    });

    // Filter changes redraw the graph so overlay slices stay in sync.

    // Corpus change still needs a server refetch (different data set)
    function corpus(){ var c=document.querySelector('#w-trace .trace-corpus'); return c?c.value:''; }
    function relayout(){
      var w=document.getElementById('w-trace'); if(!w) return;
      var url='/widget/trace?embed=1&tp='+encodeURIComponent(on('prop').join(','))
        +'&tt='+encodeURIComponent(on('type').join(','))
        +'&tc='+encodeURIComponent(corpus());
      fetch(url).then(function(r){return r.text();}).then(function(html){
        var doc=new DOMParser().parseFromString(html,'text/html');
        var fresh=doc.getElementById('w-trace');
        if(!fresh) return;
        w.querySelector('.widget-body').innerHTML=fresh.querySelector('.widget-body').innerHTML;
        boot();
      }).catch(function(){});
    }
    var widget=document.getElementById('w-trace');
    if(widget){
      widget.onclick=function(e){
        var p=e.target&&e.target.closest?e.target.closest('.pill'):null;
        if(p){ p.classList.toggle('on'); applyFilters(); }
      };
      widget.onchange=function(e){
        if(e.target&&e.target.classList&&e.target.classList.contains('trace-corpus')) relayout();
      };
    }
  }

  if(typeof cytoscape!=='undefined'){ boot(); }
  else {
    var s=document.createElement('script'); s.src='https://unpkg.com/cytoscape/dist/cytoscape.min.js';
    s.onload=boot; document.head.appendChild(s);
  }
})();
`;
