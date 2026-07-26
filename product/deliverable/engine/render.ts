// The Mirror's first cut: render a machine canvas as HTML/SVG, true to the
// drawn geometry, with the live position highlighted and the SAME packet
// JSON the agent would receive shown verbatim — one source, two
// projections: what the owner reads here IS what the agent gets.
import { loadCanvas, type CanvasData, type CanvasElement } from "./canvas.ts";
import { mainMachinePath, Session } from "./session.ts";
import { resolveRef } from "./machines/compile.ts";

interface Box {
  el: CanvasElement;
  stateId?: string;
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** State id a file node maps to: note filename minus .md, canvas minus .canvas. */
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

function renderCanvasSvg(canvas: CanvasData, title: string, activeIds: Set<string>, doneIds: Set<string>): string {
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
      parts.push(`<rect x="${n.x}" y="${n.y}" width="${n.width}" height="${n.height}" class="comment"/>`);
      parts.push(`<foreignObject x="${n.x + 10}" y="${n.y + 6}" width="${n.width - 20}" height="${n.height - 12}"><div xmlns="http://www.w3.org/1999/xhtml" class="comment-text">${esc(n.text ?? "")}</div></foreignObject>`);
      continue;
    }
    const sid = stateIdOf(n);
    if (sid === undefined) continue;
    const pill = (n as { styleAttributes?: { shape?: string } }).styleAttributes?.shape === "pill";
    const cls = activeIds.has(sid) ? "state active" : doneIds.has(sid) ? "state done" : "state";
    const rx = pill ? Math.min(n.width, n.height) / 2 : 14;
    parts.push(`<rect x="${n.x}" y="${n.y}" width="${n.width}" height="${n.height}" rx="${rx}" class="${cls}"/>`);
    parts.push(`<text x="${n.x + n.width / 2}" y="${n.y + n.height / 2 + 6}" class="label">${esc(sid)}</text>`);
  }

  return `<h2>${esc(title)}</h2><svg viewBox="${minX} ${minY} ${maxX - minX} ${maxY - minY}">
  <defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" class="arrowhead"/></marker></defs>
  ${parts.join("\n  ")}</svg>`;
}

export interface MirrorState {
  session: Session;
  root: string;
  /** The last tick's packet — rendered verbatim in the panel. */
  lastPacket: unknown;
  mode: "manual" | "agent";
}

export function renderMirror(m: MirrorState): string {
  const mainCanvas = loadCanvas(mainMachinePath(m.root));
  const info = m.session.describe() as { active: string[]; status: string; history?: { state: string }[] };
  const leafActive = new Set(info.active.map((a) => a.split("/").pop()!));
  const mainActive = new Set(info.active.map((a) => a.split("/")[0]));
  const done = new Set((m.session.instance.history ?? []).map((h) => h.state.split("/").pop()!));

  const sections: string[] = [renderCanvasSvg(mainCanvas, "main", mainActive.size > 0 ? new Set([...mainActive, ...leafActive]) : leafActive, done)];
  // Render every nested machine referenced by the main canvas, so the whole
  // drawing is visible before the walk reaches it.
  for (const el of mainCanvas.nodes ?? []) {
    if (el.type === "file" && el.file?.endsWith(".canvas")) {
      const sub = loadCanvas(resolveRef(m.root, mainMachinePath(m.root), el.file));
      sections.push(renderCanvasSvg(sub, stateIdOf(el) ?? el.file, leafActive, done));
    }
  }

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>se mirror</title><style>
  body { font-family: ui-monospace, Consolas, monospace; background: #14171a; color: #d8dde2; margin: 0; display: grid; grid-template-columns: 1fr 480px; height: 100vh; }
  main { overflow: auto; padding: 16px 24px; }
  aside { border-left: 1px solid #2a2f34; padding: 16px 20px; overflow: auto; background: #191d21; }
  h1 { font-size: 15px; margin: 0 0 12px; color: #e8b339; }
  h2 { font-size: 13px; margin: 18px 0 6px; color: #7f8b96; text-transform: uppercase; letter-spacing: .08em; }
  svg { width: 100%; max-height: 46vh; background: #191d21; border: 1px solid #2a2f34; border-radius: 10px; }
  .state { fill: #22272c; stroke: #4a545e; stroke-width: 2; }
  .state.active { fill: #3a2f14; stroke: #e8b339; stroke-width: 3.5; }
  .state.done { fill: #1d2b20; stroke: #4a7a55; }
  .label { fill: #d8dde2; font-size: 26px; text-anchor: middle; font-family: inherit; }
  .edge { stroke: #5b6772; stroke-width: 2.5; }
  .arrowhead { fill: #5b6772; }
  .guard { fill: #e8b339; font-size: 20px; text-anchor: middle; }
  .comment { fill: #1c2025; stroke: #2a2f34; }
  .comment-text { color: #7f8b96; font-size: 13px; line-height: 1.35; }
  pre { background: #14171a; border: 1px solid #2a2f34; border-radius: 8px; padding: 12px; font-size: 12px; white-space: pre-wrap; word-break: break-word; }
  .bar { display: flex; gap: 10px; margin-bottom: 14px; }
  button { background: #e8b339; color: #14171a; border: 0; border-radius: 8px; padding: 10px 18px; font: inherit; font-weight: 700; cursor: pointer; }
  button.ghost { background: #22272c; color: #d8dde2; border: 1px solid #4a545e; }
  .meta { color: #7f8b96; font-size: 12px; margin-bottom: 10px; }
</style></head><body>
<main>
  <h1>se mirror — ${m.mode} mode</h1>
  <div class="meta">machine: main · active: ${esc(info.active.join(", ") || "—")} · status: ${esc(info.status)}</div>
  ${sections.join("\n")}
</main>
<aside>
  <div class="bar">
    <form method="GET" action="/"><button class="ghost" title="tick without arguments: information only">tick · info</button></form>
    <form method="POST" action="/tick"><button title="tick with arguments: complete the current state and move on">tick · advance</button></form>
  </div>
  <h2>the packet (verbatim — what the agent gets)</h2>
  <pre>${esc(JSON.stringify(m.lastPacket ?? m.session.tickInfo(), null, 2))}</pre>
  <h2>history</h2>
  <pre>${esc(JSON.stringify((m.session.instance.history ?? []).slice(-15), null, 2))}</pre>
</aside>
</body></html>`;
}
