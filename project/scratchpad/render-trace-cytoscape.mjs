import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { layoutTrace, loadTrace } from '../deliverable/engine/trace.ts';

function shortTitle(id) {
  const noPrefix = String(id).replace(/^(vp|sty|uc|req|fn|el|dsp|tsp)-/, '');
  const tail = noPrefix.includes('.') ? noPrefix.split('.').slice(-1)[0] : noPrefix;
  const words = tail.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
  if (words.length <= 28) return words;
  return `${words.slice(0, 25)}...`;
}

const root = process.cwd();
const trace = loadTrace(root);
const laid = layoutTrace(trace);

const NODE_W = 126;
const NODE_H = 24;
const NODE_R = Math.hypot(NODE_W * 0.5, NODE_H * 0.5);

function overlaps(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy) < NODE_W * 0.52;
}

function normalizeNear(angle, center) {
  let a = angle;
  while (a - center > Math.PI) a -= Math.PI * 2;
  while (a - center < -Math.PI) a += Math.PI * 2;
  return a;
}

function deconflict(nodes) {
  for (let pass = 0; pass < 36; pass += 1) {
    let moved = false;
    for (let i = 0; i < nodes.length; i += 1) {
      for (let j = i + 1; j < nodes.length; j += 1) {
        if (!overlaps(nodes[i], nodes[j])) continue;
        const ai = Math.atan2(nodes[i].y, nodes[i].x);
        const aj = Math.atan2(nodes[j].y, nodes[j].x);
        const ri = Math.hypot(nodes[i].x, nodes[i].y);
        const rj = Math.hypot(nodes[j].x, nodes[j].y);
        const delta = 0.0045;
        nodes[i].x = Math.cos(ai - delta) * Math.max(20, ri + 0.6);
        nodes[i].y = Math.sin(ai - delta) * Math.max(20, ri + 0.6);
        nodes[j].x = Math.cos(aj + delta) * Math.max(20, rj + 0.6);
        nodes[j].y = Math.sin(aj + delta) * Math.max(20, rj + 0.6);
        moved = true;
      }
    }
    if (!moved) break;
  }
}

function solveUniformScale(nodes) {
  let need = 1;
  let impossible = 0;
  const threshold = NODE_W * 0.52;
  for (let i = 0; i < nodes.length; i += 1) {
    for (let j = i + 1; j < nodes.length; j += 1) {
      const dx = nodes[i].x - nodes[j].x;
      const dy = nodes[i].y - nodes[j].y;
      const d = Math.hypot(dx, dy);
      if (d >= threshold) continue;

      if (d <= 1e-6) {
        impossible += 1;
      } else {
        need = Math.max(need, threshold / d);
      }
    }
  }
  return { need, impossible };
}

const placed = laid.nodes.map((n) => ({ ...n }));

const wedgeByRoot = new Map(
  (laid.bands ?? [])
    .filter((b) => b.kind === 'segment')
    .map((b) => [b.root, { from: b.from, to: b.to, center: (b.from + b.to) / 2 }]),
);

const levelStats = new Map();
for (const n of placed) {
  const r = Math.hypot(n.x, n.y);
  const hit = levelStats.get(n.level) ?? { sum: 0, count: 0 };
  hit.sum += r;
  hit.count += 1;
  levelStats.set(n.level, hit);
}
const levelMeanRadius = new Map();
for (const [level, st] of levelStats.entries()) {
  levelMeanRadius.set(level, st.sum / Math.max(1, st.count));
}


for (let idx = 0; idx < placed.length; idx += 1) {
  const n = placed[idx];
  let theta = Math.atan2(n.y, n.x);
  const r = Math.hypot(n.x, n.y);

  const wedge = wedgeByRoot.get(n.root);
  if (wedge && n.level >= 0 && n.level <= 3) {
    const center = wedge.center;
    const from = normalizeNear(wedge.from, center);
    const to = normalizeNear(wedge.to, center);
    theta = normalizeNear(theta, center);

    const spread = 1.1;
    const widened = center + (theta - center) * spread;
    const margin = 0.012;
    theta = Math.max(from + margin, Math.min(to - margin, widened));
  }

  n.x = Math.cos(theta) * r;
  n.y = Math.sin(theta) * r;
}

const levels = [...new Set(placed.map((n) => n.level).filter((x) => x >= 0))].sort((a, b) => a - b);
if (levels.length > 1) {
  const byLevel = new Map();
  for (const lv of levels) byLevel.set(lv, []);
  for (const n of placed) if (n.level >= 0) byLevel.get(n.level)?.push(n);

  const meanNow = new Map();
  for (const lv of levels) {
    const lane = byLevel.get(lv) ?? [];
    const m = lane.reduce((sum, n) => sum + Math.hypot(n.x, n.y), 0) / Math.max(1, lane.length);
    meanNow.set(lv, m);
  }

  const first = levels[0];
  const last = levels[levels.length - 1];
  const rMin = meanNow.get(first) ?? 0;
  const rMax = meanNow.get(last) ?? rMin;
  const minGap = NODE_H * 1.45;

  const target = new Map();
  for (let i = 0; i < levels.length; i += 1) {
    const lv = levels[i];
    const t = i / Math.max(1, levels.length - 1);
    const curved = Math.pow(t, 0.78);
    target.set(lv, rMin + (rMax - rMin) * curved);
  }
  for (let i = 1; i < levels.length; i += 1) {
    const prev = levels[i - 1];
    const cur = levels[i];
    const floor = (target.get(prev) ?? 0) + minGap;
    if ((target.get(cur) ?? 0) < floor) target.set(cur, floor);
  }

  for (const n of placed) {
    if (n.level < 0) continue;
    const oldMean = meanNow.get(n.level) ?? Math.hypot(n.x, n.y);
    const newMean = target.get(n.level) ?? oldMean;
    const rr = Math.hypot(n.x, n.y);
    const theta = Math.atan2(n.y, n.x);

    // Requested adjustment: let requirements sit further outward.
    const requirementBoost = n.level === 3 ? NODE_H * 2.2 : 0;
    const shifted = newMean + (rr - oldMean) * 0.62 + requirementBoost;

    n.x = Math.cos(theta) * shifted;
    n.y = Math.sin(theta) * shifted;
  }
}

let scaleFactor = 1;
let growPasses = 0;
deconflict(placed);

const probe = solveUniformScale(placed);
if (probe.impossible > 0) {
  for (let i = 0; i < placed.length; i += 1) {
    const n = placed[i];
    const a = Math.atan2(n.y, n.x) + ((i % 7) - 3) * 0.0008;
    const r = Math.hypot(n.x, n.y) + (i % 3) * 0.25;
    n.x = Math.cos(a) * r;
    n.y = Math.sin(a) * r;
  }
}
const solved = solveUniformScale(placed);
if (solved.need > 1) {
  scaleFactor = solved.need * 1.02;
  for (const n of placed) {
    n.x *= scaleFactor;
    n.y *= scaleFactor;
  }
  growPasses = 1;
}

const finalLevelStats = new Map();
for (const n of placed) {
  if (n.level < 0) continue;
  const r = Math.hypot(n.x, n.y);
  const hit = finalLevelStats.get(n.level) ?? { sum: 0, count: 0 };
  hit.sum += r;
  hit.count += 1;
  finalLevelStats.set(n.level, hit);
}
const finalLevelMeanRadius = new Map();
for (const [level, st] of finalLevelStats.entries()) {
  finalLevelMeanRadius.set(level, st.sum / Math.max(1, st.count));
}

const remapAnchors = [{ orig: 0, final: 0 }];
for (const [level, origMean] of levelMeanRadius.entries()) {
  const finalMean = finalLevelMeanRadius.get(level);
  if (!Number.isFinite(origMean) || !Number.isFinite(finalMean)) continue;
  remapAnchors.push({ orig: origMean, final: finalMean });
}
remapAnchors.sort((a, b) => a.orig - b.orig);

function remapRadius(r) {
  if (!Number.isFinite(r)) return r;
  if (remapAnchors.length < 2) return r * scaleFactor;
  if (r <= remapAnchors[0].orig) return remapAnchors[0].final;
  for (let i = 1; i < remapAnchors.length; i += 1) {
    const a = remapAnchors[i - 1];
    const b = remapAnchors[i];
    if (r > b.orig) continue;
    const span = Math.max(1e-6, b.orig - a.orig);
    const t = (r - a.orig) / span;
    return a.final + (b.final - a.final) * t;
  }
  const a = remapAnchors[remapAnchors.length - 2];
  const b = remapAnchors[remapAnchors.length - 1];
  const span = Math.max(1e-6, b.orig - a.orig);
  const slope = (b.final - a.final) / span;
  return b.final + (r - b.orig) * slope;
}

const valuePropRoots = [...new Set(placed.filter((n) => n.level === 0).map((n) => n.root))].sort();

const nodes = [
  {
    data: {
      id: 'vision',
      title: 'vision',
      type: 'vision',
      full: 'vision',
      root: 'vision',
      level: -1,
    },
    position: { x: 0, y: 0 },
  },
  ...placed.map((n) => ({
    data: {
      id: n.key,
      title: shortTitle(n.id),
      type: n.type,
      full: n.id,
      root: n.root,
      level: n.level,
    },
    position: {
      x: n.x,
      y: n.y,
    },
  })),
];

const edges = laid.edges.map((e, i) => ({
  data: {
    id: `e-${i + 1}`,
    source: e.from,
    target: e.to,
    kind: 'link',
  },
}));

const segmentBands = (laid.bands ?? []).filter((b) => b.kind === 'segment');
const outerGuideFromBand = remapRadius(Math.max(1, ...segmentBands.map((b) => b.r)));
const outerNodeR = Math.max(1, ...placed.map((n) => Math.hypot(n.x, n.y)));
const outerGuideR = Math.max(outerGuideFromBand, outerNodeR + NODE_R * 0.95);

const levelOrder = [...new Set(placed.map((n) => n.level).filter((lv) => lv >= 0))].sort((a, b) => a - b);
const levelRanges = levelOrder.map((lv) => {
  const lane = placed.filter((n) => n.level === lv);
  const radii = lane.map((n) => Math.hypot(n.x, n.y));
  const minCenter = Math.min(...radii);
  const maxCenter = Math.max(...radii);
  return {
    level: lv,
    min: minCenter,
    max: maxCenter,
    inner: minCenter - NODE_R,
    outer: maxCenter + NODE_R,
  };
});

const boundaryRadii = levelRanges.map((r, idx) => {
  if (idx < levelRanges.length - 1) {
    return (r.outer + levelRanges[idx + 1].inner) / 2;
  }
  return Math.max(outerGuideR, r.outer + NODE_H * 0.6);
});
const displayOuterR = outerGuideR;

function nearestBoundaryRadius(r) {
  if (boundaryRadii.length === 0) return r;
  let best = boundaryRadii[0];
  let bestDist = Math.abs(r - best);
  for (let i = 1; i < boundaryRadii.length; i += 1) {
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
  const r0 = s.kind === 'slice' ? nearestBoundaryRadius(baseR0) : baseR0;
  const r1 = displayOuterR;
  return {
    id: `sp-${i}`,
    kind: s.kind,
    at: s.at,
    x0: Math.cos(s.at) * r0,
    y0: Math.sin(s.at) * r0,
    x1: Math.cos(s.at) * r1,
    y1: Math.sin(s.at) * r1,
  };
});

function normalizePositiveSpan(from, to) {
  let end = to;
  while (end <= from) end += Math.PI * 2;
  return { from, to: end };
}

const sectionAngles = guideSpokes
  .filter((s) => s.kind === 'section')
  .map((s) => s.at);

function nearestSectionAngle(a) {
  if (sectionAngles.length === 0) return a;
  let best = sectionAngles[0];
  let bestDist = Infinity;
  for (const x of sectionAngles) {
    const d = Math.abs(normalizeNear(a, x) - x);
    if (d < bestDist) {
      bestDist = d;
      best = x;
    }
  }
  return best;
}

const sectorLabels = [];
const typeLabels = [];
const sectorArcs = [];

const sectorRegions = (() => {
  const sectors = laid.sectors ?? [];
  return sectors.map((s, i) => {
    const span = normalizePositiveSpan(s.from, s.to);
    const ringIdx = Math.max(0, Math.min(boundaryRadii.length - 1, s.ring));
    const inner = ringIdx === 0 ? 0 : (boundaryRadii[ringIdx - 1] ?? remapRadius(s.r0));
    const outer = Math.min(boundaryRadii[ringIdx] ?? remapRadius(s.r1), displayOuterR);
    const mid = span.from + (span.to - span.from) / 2;
    if (String(s.label || '').trim()) {
      const labelR = inner + (outer - inner) * 0.5;
      typeLabels.push({
        id: `tl-${typeLabels.length}`,
        label: String(s.label),
        x: Math.cos(mid) * labelR,
        y: Math.sin(mid) * labelR,
        angle: mid,
      });
    }
    return {
      id: `sr-${i}`,
      root: s.root,
      from: span.from,
      to: span.to,
      r0: inner,
      r1: outer,
      mid,
    };
  });
})();

const levelRingArcs = (() => {
  const sectors = laid.sectors ?? [];
  const out = [];
  const seen = new Set();
  for (let i = 0; i < sectors.length; i += 1) {
    const s = sectors[i];
    const span = normalizePositiveSpan(s.from, s.to);
    const ringIdx = Math.max(0, Math.min(boundaryRadii.length - 1, s.ring));
    const r = Math.min(boundaryRadii[ringIdx] ?? remapRadius(s.r1), displayOuterR);
    if (r <= 1) continue;
    const key = `${s.root}|${s.slice}|${ringIdx}|${span.from.toFixed(6)}|${span.to.toFixed(6)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ id: `lr-${out.length}`, from: span.from, to: span.to, r });
  }
  return out;
})();

for (let i = 0; i < segmentBands.length; i += 1) {
  const b = segmentBands[i];
  const fromSnap = nearestSectionAngle(b.from);
  const toSnap = nearestSectionAngle(b.to);
  const spanNorm = normalizePositiveSpan(fromSnap, toSnap);
  const from = spanNorm.from;
  const to = spanNorm.to;
  const mid = from + (to - from) / 2;
  const r = Math.min(remapRadius(b.r), displayOuterR);
  const labelR = r + NODE_H * 1.7;

  sectorArcs.push({
    id: `arc-${i}`,
    from,
    to,
    r,
  });

  sectorLabels.push({
    id: `sl-${i}`,
    label: String(b.label),
    x: Math.cos(mid) * labelR,
    y: Math.sin(mid) * labelR,
    radiusOffset: 20,
  });
}

const elements = {
  nodes,
  edges,
};

const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Trace Mindmap - Cytoscape</title>
  <style>
    html, body { margin: 0; padding: 0; height: 100%; overflow: hidden; background: #0f1115; color: #e6e6e6; font-family: "IBM Plex Sans", "Segoe UI", sans-serif; }
    #bar { height: 44px; display: flex; align-items: center; gap: 10px; padding: 0 12px; border-bottom: 1px solid #242833; background: #151822; }
    #bar .meta { font-size: 12px; color: #aab2c7; }
    #warn { display: none; padding: 8px 12px; border-bottom: 1px solid #5b3f0f; background: #2a1f0c; color: #f0d9a6; font-size: 12px; }
    body { position: relative; }
    #cy { width: 100%; height: calc(100% - 45px); }
    #overlay {
      position: absolute;
      left: 0;
      top: 45px;
      width: 100%;
      height: calc(100% - 45px);
      pointer-events: none;
      overflow: hidden;
    }
    #sectorSvg,
    #guideSvg,
    #labelSvg {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      display: block;
      overflow: visible;
      transform-origin: 0 0;
      pointer-events: none;
    }
    #labelSvg {
      z-index: 2;
    }
    .sector-name {
      position: absolute;
      transform: translate(-50%, -50%);
      color: #ffffff;
      font: 700 14px/1.05 "IBM Plex Sans", "Segoe UI", sans-serif;
      text-shadow: 0 0 6px #0f1115, 0 0 14px #0f1115;
      letter-spacing: 0.03em;
      text-transform: lowercase;
      white-space: nowrap;
      opacity: 0;
    }
    .center-node {
      position: absolute;
      transform: translate(-50%, -50%);
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: #2a5f9c;
      border: 1px solid #9fc0ff;
      color: #edf0f4;
      display: flex;
      align-items: center;
      justify-content: center;
      font: 700 8px/1 "IBM Plex Sans", "Segoe UI", sans-serif;
      letter-spacing: -0.02em;
      pointer-events: none;
      z-index: 3;
      box-sizing: border-box;
      text-transform: lowercase;
      text-shadow: 0 0 4px #0f1115;
    }
    .label-text {
      fill: #ffffff;
      font: 700 18px/1.05 "IBM Plex Sans", "Segoe UI", sans-serif;
      letter-spacing: 0.03em;
      text-transform: lowercase;
      text-anchor: middle;
    }
  </style>
  <script src="https://unpkg.com/cytoscape/dist/cytoscape.min.js"></script>
</head>
<body>
  <div id="bar">
    <strong>Trace mindmap (svg-layout parity, title-only)</strong>
    <span class="meta">value-prop wedges: ${valuePropRoots.length} · full depth: on · nodes: ${nodes.length} · edges: ${edges.length} · separators: ${(laid.spokes?.length ?? 0)} · sector arcs: ${segmentBands.length} · overlap grow: ${scaleFactor.toFixed(2)}x (${growPasses} passes)</span>
  </div>
  <div id="warn"></div>
  <div id="cy"></div>
  <div id="overlay">
    <svg id="sectorSvg"></svg>
    <svg id="guideSvg"></svg>
    <svg id="labelSvg"></svg>
    <div id="centerNode" class="center-node">vision</div>
  </div>
  <script>
    const elements = ${JSON.stringify(elements)};
    const guideSpokes = ${JSON.stringify(guideSpokes)};
    const sectorArcs = ${JSON.stringify(sectorArcs)};
    const levelRingArcs = ${JSON.stringify(levelRingArcs)};
    const sectorRegions = ${JSON.stringify(sectorRegions)};
    const sectorLabels = ${JSON.stringify(sectorLabels)};
    const typeLabels = ${JSON.stringify(typeLabels)};

    function setWarning(text) {
      const warn = document.getElementById('warn');
      warn.textContent = text;
      warn.style.display = 'block';
    }

    function renderCytoscape() {
      const cy = cytoscape({
        container: document.getElementById('cy'),
        elements,
        style: [
          { selector: 'node[title]', style: {
            'shape': 'round-rectangle',
            'background-color': '#202733',
            'border-width': 1,
            'border-color': '#515b6f',
            'label': 'data(title)',
            'font-size': 10,
            'text-wrap': 'none',
            'text-valign': 'center',
            'text-halign': 'center',
            'color': '#edf0f4',
            'width': ${NODE_W},
            'height': ${NODE_H},
            'padding-left': 12,
            'padding-right': 12
          }},
          { selector: 'edge[kind = "link"]', style: {
            'width': 1.2,
            'line-color': '#cfd6e2',
            'curve-style': 'bezier',
            'target-arrow-shape': 'none',
            'opacity': 0.52
          }},
          { selector: 'node[type = "vision"]', style: {
            'background-color': '#2a5f9c',
            'border-color': '#9fc0ff',
            'font-size': 12,
            'width': 30,
            'height': 30,
            'font-weight': 'bold',
            'z-index': 20
          }},
          { selector: 'node[type = "value-prop"]', style: { 'background-color': '#363058', 'border-color': '#a39cff' }},
          { selector: 'node[type = "story"]', style: { 'background-color': '#1f464f', 'border-color': '#78c7d6' }},
          { selector: 'node[type = "use-case"]', style: { 'background-color': '#4b3c18', 'border-color': '#e0b264' }},
          { selector: 'node[type = "requirement"]', style: { 'background-color': '#4a3235', 'border-color': '#e39aa1' }},
          { selector: 'node[type = "function"]', style: { 'background-color': '#263c58', 'border-color': '#90b4e8' }},
          { selector: 'node[type = "test-spec"]', style: { 'background-color': '#404018', 'border-color': '#d7d774' }},
          { selector: 'node[type = "test-result"]', style: { 'background-color': '#28402b', 'border-color': '#95d095' }},
          { selector: '.dim', style: { 'opacity': 0.14 }}
        ],
        layout: {
          name: 'preset',
          fit: true,
          padding: 120,
          animate: false,
        },
        wheelSensitivity: 6,
      });

      cy.minZoom(0.02);
      cy.maxZoom(2.6);
      const realNodes = cy.nodes('[!guide]');
      cy.fit(realNodes, 90);
      cy.zoom(Math.min(cy.maxZoom(), cy.zoom() * 2.6));
      cy.center(realNodes);

      const baseNodes = cy.nodes();
      const baseEdges = cy.edges();
      const overlay = document.getElementById('overlay');
      const sectorSvg = document.getElementById('sectorSvg');
      const guideSvg = document.getElementById('guideSvg');
      const labelSvg = document.getElementById('labelSvg');
      const NS = 'http://www.w3.org/2000/svg';
      const labelItems = [...sectorLabels, ...typeLabels].map((s, index) => {
        const group = document.createElementNS(NS, 'g');
        const path = document.createElementNS(NS, 'path');
        const text = document.createElementNS(NS, 'text');
        const textPath = document.createElementNS(NS, 'textPath');
        const id = 'label-path-' + index;
        path.setAttribute('id', id);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', 'none');
        text.setAttribute('class', 'label-text');
        textPath.setAttribute('href', '#' + id);
        textPath.setAttribute('startOffset', '50%');
        textPath.textContent = s.label;
        text.appendChild(textPath);
        group.appendChild(path);
        group.appendChild(text);
        labelSvg.appendChild(group);
        return { data: s, path, text, textPath };
      });
      const centerNode = document.getElementById('centerNode');
      const visionNode = cy.nodes('node[type = "vision"]').first();

      function labelRotation(angle) {
        let deg = angle * 180 / Math.PI;
        if (deg > 90) deg -= 180;
        if (deg < -90) deg += 180;
        return deg;
      }

      function normalizeNear(angle, center) {
        let value = angle;
        while (value - center > Math.PI) value -= Math.PI * 2;
        while (center - value > Math.PI) value += Math.PI * 2;
        return value;
      }

      function sectorPathD(region) {
        const from = region.from;
        const to = region.to;
        const r0 = Math.max(0, region.r0);
        const r1 = Math.max(r0 + 1, region.r1);
        const x0o = Math.cos(from) * r1;
        const y0o = Math.sin(from) * r1;
        const x1o = Math.cos(to) * r1;
        const y1o = Math.sin(to) * r1;
        const x1i = Math.cos(to) * r0;
        const y1i = Math.sin(to) * r0;
        const x0i = Math.cos(from) * r0;
        const y0i = Math.sin(from) * r0;
        const largeArc = (to - from) > Math.PI ? 1 : 0;
        return 'M ' + x0o + ' ' + y0o + ' A ' + r1 + ' ' + r1 + ' 0 ' + largeArc + ' 1 ' + x1o + ' ' + y1o + ' L ' + x1i + ' ' + y1i + ' A ' + r0 + ' ' + r0 + ' 0 ' + largeArc + ' 0 ' + x0i + ' ' + y0i + ' Z';
      }

      function screenSectorPathD(region, z, pan) {
        const from = region.from;
        const to = region.to;
        const r0 = Math.max(0, region.r0) * z;
        const r1 = Math.max(r0 + z, region.r1 * z);
        const x0o = Math.cos(from) * r1 + pan.x;
        const y0o = Math.sin(from) * r1 + pan.y;
        const x1o = Math.cos(to) * r1 + pan.x;
        const y1o = Math.sin(to) * r1 + pan.y;
        const x1i = Math.cos(to) * r0 + pan.x;
        const y1i = Math.sin(to) * r0 + pan.y;
        const x0i = Math.cos(from) * r0 + pan.x;
        const y0i = Math.sin(from) * r0 + pan.y;
        const largeArc = (to - from) > Math.PI ? 1 : 0;
        return 'M ' + x0o + ' ' + y0o + ' A ' + r1 + ' ' + r1 + ' 0 ' + largeArc + ' 1 ' + x1o + ' ' + y1o + ' L ' + x1i + ' ' + y1i + ' A ' + r0 + ' ' + r0 + ' 0 ' + largeArc + ' 0 ' + x0i + ' ' + y0i + ' Z';
      }

      function screenSpokePathD(spoke, z, pan) {
        const from = toScreen(spoke.x0, spoke.y0, z, pan);
        const to = toScreen(spoke.x1, spoke.y1, z, pan);
        return 'M ' + from.x + ' ' + from.y + ' L ' + to.x + ' ' + to.y;
      }

      function screenRingPathD(ring, z, pan) {
        const r = Math.max(1, ring.r * z);
        const start = toScreen(Math.cos(ring.from) * ring.r, Math.sin(ring.from) * ring.r, z, pan);
        const end = toScreen(Math.cos(ring.to) * ring.r, Math.sin(ring.to) * ring.r, z, pan);
        const largeArc = (ring.to - ring.from) > Math.PI ? 1 : 0;
        return 'M ' + start.x + ' ' + start.y + ' A ' + r + ' ' + r + ' 0 ' + largeArc + ' 1 ' + end.x + ' ' + end.y;
      }

      function screenLabelPathD(label, z, pan) {
        const angle = label.angle ?? Math.atan2(label.y, label.x);
        const radius = Math.max(1, Math.hypot(label.x, label.y) * z + (label.radiusOffset ?? 0));
        const textWidth = Math.max(72, (String(label.label).length * 8.5) + 24);
        const span = clamp(textWidth / radius, 0.32, 1.15);
        const flip = Math.sin(angle) > 0;
        const from = flip ? angle + span / 2 : angle - span / 2;
        const to = flip ? angle - span / 2 : angle + span / 2;
        const start = { x: Math.cos(from) * radius + pan.x, y: Math.sin(from) * radius + pan.y };
        const end = { x: Math.cos(to) * radius + pan.x, y: Math.sin(to) * radius + pan.y };
        const largeArc = Math.abs(to - from) > Math.PI ? 1 : 0;
        const sweep = flip ? 0 : 1;
        return 'M ' + start.x + ' ' + start.y + ' A ' + radius + ' ' + radius + ' 0 ' + largeArc + ' ' + sweep + ' ' + end.x + ' ' + end.y;
      }

      function screenSectorPathD(region, z, pan) {
        const from = region.from;
        const to = region.to;
        const r0 = Math.max(0, region.r0) * z;
        const r1 = Math.max(r0 + z, region.r1 * z);
        const x0o = Math.cos(from) * r1 + pan.x;
        const y0o = Math.sin(from) * r1 + pan.y;
        const x1o = Math.cos(to) * r1 + pan.x;
        const y1o = Math.sin(to) * r1 + pan.y;
        const x1i = Math.cos(to) * r0 + pan.x;
        const y1i = Math.sin(to) * r0 + pan.y;
        const x0i = Math.cos(from) * r0 + pan.x;
        const y0i = Math.sin(from) * r0 + pan.y;
        const largeArc = (to - from) > Math.PI ? 1 : 0;
        return 'M ' + x0o + ' ' + y0o + ' A ' + r1 + ' ' + r1 + ' 0 ' + largeArc + ' 1 ' + x1o + ' ' + y1o + ' L ' + x1i + ' ' + y1i + ' A ' + r0 + ' ' + r0 + ' 0 ' + largeArc + ' 0 ' + x0i + ' ' + y0i + ' Z';
      }

      function sectorContains(region, node) {
        const x = node.position('x');
        const y = node.position('y');
        const r = Math.hypot(x, y);
        if (r < region.r0 || r > region.r1) return false;
        const angle = normalizeNear(Math.atan2(y, x), region.mid);
        const from = normalizeNear(region.from, region.mid);
        const to = normalizeNear(region.to, region.mid);
        return angle >= from && angle <= to;
      }

      const sectorPaths = sectorRegions.map((region) => {
        const p = document.createElementNS(NS, 'path');
        p.setAttribute('d', sectorPathD(region));
        p.setAttribute('fill', 'rgba(212, 212, 212, 0.0)');
        p.setAttribute('stroke', 'rgba(209, 214, 223, 0.82)');
        p.setAttribute('stroke-width', '2');
        p.setAttribute('vector-effect', 'non-scaling-stroke');
        p.dataset.root = region.root;
        p.dataset.from = String(region.from);
        p.dataset.to = String(region.to);
        p.dataset.r0 = String(region.r0);
        p.dataset.r1 = String(region.r1);
        sectorSvg.appendChild(p);
        return { data: region, el: p };
      });

      const spokePaths = guideSpokes.map((s) => {
        const p = document.createElementNS(NS, 'path');
        p.setAttribute('fill', 'none');
        p.setAttribute('stroke', '#d1d6df');
        p.setAttribute('stroke-opacity', s.kind === 'slice' ? '0.75' : '0.62');
        p.setAttribute('stroke-width', s.kind === 'slice' ? '3.0' : '2.2');
        p.setAttribute('stroke-linecap', 'round');
        p.setAttribute('vector-effect', 'non-scaling-stroke');
        guideSvg.appendChild(p);
        return { data: s, el: p };
      });

      const ringPaths = levelRingArcs.map((a) => {
        const p = document.createElementNS(NS, 'path');
        p.setAttribute('fill', 'none');
        p.setAttribute('stroke', '#d1d6df');
        p.setAttribute('stroke-opacity', '0.52');
        p.setAttribute('stroke-width', '2.2');
        p.setAttribute('stroke-linecap', 'round');
        p.setAttribute('vector-effect', 'non-scaling-stroke');
        guideSvg.appendChild(p);
        return { data: a, el: p };
      });

      function toScreen(x, y, z, pan) {
        return { x: x * z + pan.x, y: y * z + pan.y };
      }

      function placeOverlay(sectorOpacity) {
        const z = cy.zoom();
        const pan = cy.pan();
        overlay.style.transform = 'none';
        overlay.style.left = '0';
        overlay.style.top = '45px';
        sectorSvg.style.transform = 'none';
        guideSvg.style.transform = 'none';

        for (const it of labelItems) {
          it.path.setAttribute('d', screenLabelPathD(it.data, z, pan));
          it.text.setAttribute('opacity', String(Math.max(0.65, sectorOpacity)));
        }

        for (const it of sectorPaths) {
          const active = hoveredSectorId === it.data.id;
          it.el.setAttribute('d', screenSectorPathD(it.data, z, pan));
          it.el.setAttribute('fill', active ? 'rgba(212, 212, 212, 0.08)' : 'rgba(212, 212, 212, 0.0)');
          it.el.setAttribute('stroke', active ? 'rgba(209, 214, 223, 0.95)' : 'rgba(209, 214, 223, 0.82)');
        }

        for (const it of spokePaths) {
          it.el.setAttribute('d', screenSpokePathD(it.data, z, pan));
        }

        for (const it of ringPaths) {
          it.el.setAttribute('d', screenRingPathD(it.data, z, pan));
        }

        if (visionNode && visionNode.nonempty()) {
          const pos = visionNode.position();
          const screen = toScreen(pos.x, pos.y, z, pan);
          centerNode.style.left = String(screen.x) + 'px';
          centerNode.style.top = String(screen.y) + 'px';
        }
      }

      function clamp(x, lo, hi) {
        return Math.max(lo, Math.min(hi, x));
      }
      function mix(a, b, t) {
        return a + (b - a) * t;
      }
      function mixColor(hexA, hexB, t) {
        const pa = parseInt(hexA.slice(1), 16);
        const pb = parseInt(hexB.slice(1), 16);
        const ar = (pa >> 16) & 255;
        const ag = (pa >> 8) & 255;
        const ab = pa & 255;
        const br = (pb >> 16) & 255;
        const bg = (pb >> 8) & 255;
        const bb = pb & 255;
        const rr = Math.round(mix(ar, br, t));
        const rg = Math.round(mix(ag, bg, t));
        const rb = Math.round(mix(ab, bb, t));
        return 'rgb(' + rr + ',' + rg + ',' + rb + ')';
      }

      let hoveredSectorId = null;

      function applyZoomMode() {
        const z = cy.zoom();
        const t = clamp((z - 0.28) / (1.05 - 0.28), 0, 1);

        const nodeOpacity = 1;
        const edgeOpacity = mix(0.52, 0.92, t);
        const textOpacity = 1;
        const sectorOpacity = clamp((0.92 - t) / 0.92, 0, 1);

        const edgeColor = mixColor('#d1d6df', '#d1d6df', t);

        baseNodes.style('opacity', nodeOpacity);
        baseNodes.style('text-opacity', textOpacity);

        baseEdges.style('opacity', edgeOpacity);
        baseEdges.style('line-color', edgeColor);

        placeOverlay(sectorOpacity);
      }

      applyZoomMode();
      cy.on('zoom', applyZoomMode);
      cy.on('pan', applyZoomMode);

      function pointForEvent(ev) {
        const rect = cy.container().getBoundingClientRect();
        const z = cy.zoom();
        const pan = cy.pan();
        return {
          x: (ev.clientX - rect.left - pan.x) / z,
          y: (ev.clientY - rect.top - pan.y) / z,
        };
      }

      function pickSectorAt(x, y) {
        for (let i = 0; i < sectorRegions.length; i += 1) {
          const region = sectorRegions[i];
          const r = Math.hypot(x, y);
          if (r < region.r0 || r > region.r1) continue;
          const angle = normalizeNear(Math.atan2(y, x), region.mid);
          const from = normalizeNear(region.from, region.mid);
          const to = normalizeNear(region.to, region.mid);
          if (angle >= from && angle <= to) return region;
        }
        return null;
      }

      const container = cy.container();
      container.addEventListener('mousemove', (ev) => {
        const hit = pickSectorAt(pointForEvent(ev).x, pointForEvent(ev).y);
        const nextId = hit ? hit.id : null;
        if (nextId !== hoveredSectorId) {
          hoveredSectorId = nextId;
          applyZoomMode();
        }
      });
      container.addEventListener('mouseleave', () => {
        if (hoveredSectorId !== null) {
          hoveredSectorId = null;
          applyZoomMode();
        }
      });
      container.addEventListener('dblclick', (ev) => {
        const hit = pickSectorAt(pointForEvent(ev).x, pointForEvent(ev).y);
        if (!hit) return;
        const matched = cy.nodes('[!guide]').filter((n) => sectorContains(hit, n));
        if (matched.length > 0) {
          cy.fit(matched, 80);
        }
      });

      cy.on('tap', 'node[!guide]', (ev) => {
        const node = ev.target;
        const hood = node.closedNeighborhood();
        baseNodes.removeClass('dim');
        baseEdges.removeClass('dim');
        baseNodes.addClass('dim');
        baseEdges.addClass('dim');
        hood.removeClass('dim');
      });

      cy.on('tap', (ev) => {
        if (ev.target === cy) {
          baseNodes.removeClass('dim');
          baseEdges.removeClass('dim');
        }
      });
    }

    try {
      if (typeof cytoscape !== 'function') {
        setWarning('Cytoscape did not load.');
      } else {
        renderCytoscape();
      }
    } catch (err) {
      setWarning('Mindmap render failed: ' + (err?.message || String(err)));
    }
  </script>
</body>
</html>`;

mkdirSync(join(root, 'project', 'scratchpad'), { recursive: true });
const out = join(root, 'project', 'scratchpad', 'trace-mindmap-cytoscape.html');
writeFileSync(out, html, 'utf8');
console.log(out);
