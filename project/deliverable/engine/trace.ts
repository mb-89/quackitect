// THE TRACE GRAPH, drawn radially. The vision sits at the centre; every
// selected value prop takes an equal wedge of the 360 degrees, and the trace
// levels are concentric rings outward from it (owner design, 2026-08-05).
//
// NO LAYOUT LIBRARY. The arrangement is deterministic geometry — an angle per
// wedge and a radius per ring — so there is nothing to solve at run time and
// nothing to load. What a library WOULD have given us is crossing
// minimisation, and that is one named heuristic (orderByBarycentre) rather
// than a dependency the always-on mirror would carry forever.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parseStateNote } from "./notes.ts";

/** THE LEVELS, in ring order from the centre outward.
 *
 *  Adding a level is ONE entry here and one more ring. Nothing else in this
 *  file knows how many there are, or what they are called. */
export const TRACE_LEVELS = ["value-prop", "story", "use-case", "requirement"];

export interface TraceNode {
  id: string;
  type: string;
  statement: string;
  /** The nodes one level in. A child names its parents, as v1's `refines` did. */
  refines: string[];
  /** EVERY FRONTMATTER KEY AND VALUE, flattened for the text filter — so
   *  typing `must` finds what a priority field says, not only what a
   *  statement says. Absent falls back to the id and the statement. */
  hay?: string;
  /** Absolute path, so a checker can read what the loader did not keep. */
  file?: string;
}

export interface Placed extends TraceNode {
  level: number;
  /** The wedge this node belongs to — the value prop at its root. */
  root: string;
  x: number;
  y: number;
}

export interface TraceLayout {
  nodes: Placed[];
  edges: { from: string; to: string }[];
  /** Ring radii, innermost first — the level separators are drawn at these. */
  rings: number[];
  size: number;
}

function asList(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(String).filter((s) => s !== "");
  if (typeof v === "string" && v.trim() !== "") return [v.trim()];
  return [];
}

/** Every markdown file under the trace corpus, at any depth. ONE SUBFOLDER
 *  PER TYPE is the shape a person reads (owner, 2026-08-05); the loader does
 *  not depend on it, so a flat file still loads and a new type needs no code. */
function traceFiles(dir: string, depth = 0): string[] {
  if (depth > 4) return [];
  let entries: import("node:fs").Dirent[];
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  const out: string[] = [];
  for (const e of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    if (e.isDirectory()) out.push(...traceFiles(join(dir, e.name), depth + 1));
    else if (e.name.endsWith(".md")) out.push(join(dir, e.name));
  }
  return out;
}

export function traceDir(root: string): string {
  return join(root, "project", "spec", "trace");
}

/** A TYPED NODE NAMES ITS OWN TEMPLATE (owner, 2026-08-05). `type:
 *  "[[value-prop]]"` points at the item template that says what a value prop
 *  must carry, so a reader is one hop from the rules and Obsidian draws the
 *  edge. A bare `value-prop` means exactly the same thing — the link is the
 *  readable form, never a second syntax to support. */
export function typeName(v: unknown): string {
  return typeof v === "string" ? v.replace(/^\[\[/, "").replace(/\]\]$/, "").trim() : "";
}

/** Where the rules for one item type live. */
export function itemTemplateRel(type: string): string {
  return `project/deliverable/machines/items/${type}.md`;
}

/** WHAT A NODE OF ONE TYPE MUST CARRY, read from the type's own template.
 *
 *  Nothing here is a second declaration. The required frontmatter keys ARE the
 *  MINT SKELETON's keys — the template already had to say what a new node
 *  starts with, and that is the same list. Only the body headings are stated
 *  separately, because prose cannot be derived from prose. */
export interface ItemTemplate {
  type: string;
  id_prefix: string;
  fields: string[];
  sections: string[];
}

export function itemTemplate(root: string, type: string): ItemTemplate | undefined {
  let note: { frontmatter: Record<string, unknown>; body: string };
  try {
    note = parseStateNote(readFileSync(join(root, itemTemplateRel(type)), "utf8"));
  } catch {
    return undefined;
  }
  const fence = /```skeleton\r?\n([\s\S]*?)```/.exec(note.body);
  return {
    type,
    id_prefix: typeof note.frontmatter.id_prefix === "string" ? note.frontmatter.id_prefix : "",
    fields: fence === null ? [] : [...(fence[1] ?? "").matchAll(/^([a-z_]+):/gm)].map((m) => m[1] ?? ""),
    sections: Array.isArray(note.frontmatter.sections) ? note.frontmatter.sections.map(String) : [],
  };
}

/** DOES THIS NODE KEEP ITS TYPE'S PROMISES.
 *
 *  A reference resolving to a file that does not answer its own template is
 *  worse than a dangling one: the gate follows it, finds something, and
 *  reviews a hole.
 *
 *  A TODO LEFT IN PLACE COUNTS AS UNANSWERED. The mint writes TODOs on
 *  purpose, so treating them as filled would let a skeleton pass as work. */
export function conformance(root: string, node: TraceNode): string[] {
  const tpl = itemTemplate(root, node.type);
  if (tpl === undefined || node.file === undefined) return [];
  let note: { frontmatter: Record<string, unknown>; body: string };
  try {
    note = parseStateNote(readFileSync(node.file, "utf8"));
  } catch {
    return [`${node.id}: unreadable`];
  }
  const out: string[] = [];
  if (tpl.id_prefix !== "" && !node.id.startsWith(tpl.id_prefix)) out.push(`${node.id}: a ${tpl.type} id starts with ${tpl.id_prefix}`);
  const missing = tpl.fields.filter((k) => {
    const v = note.frontmatter[k];
    const s = Array.isArray(v) ? v.join(" ") : v === undefined ? "" : String(v);
    return s.trim() === "" || s.includes("TODO");
  });
  if (missing.length > 0) out.push(`${node.id}: unanswered — ${missing.join(" · ")}`);
  const headings = new Set(note.body.split("\n").map((l) => l.trim()));
  const absent = tpl.sections.filter((h) => !headings.has(`## ${h}`));
  if (absent.length > 0) out.push(`${node.id}: missing section — ${absent.map((h) => `## ${h}`).join(" · ")}`);
  return out;
}

/** Every trace node the product declares. */
export function loadTrace(root: string): TraceNode[] {
  const out: TraceNode[] = [];
  for (const file of traceFiles(traceDir(root))) {
    let fm: Record<string, unknown>;
    try {
      fm = parseStateNote(readFileSync(file, "utf8")).frontmatter;
    } catch {
      continue; // a node that will not parse is the lint's problem, not the render's
    }
    // THE CORPUS IS EVERY TYPED NODE, not only the ones that earn a ring. A
    // stakeholder draws nothing and is still an address a value prop points
    // at, so the layout — not the loader — decides what is drawn.
    const type = typeName(fm.type);
    if (type === "") continue;
    const pairs = Object.entries(fm)
      .map(([k, v]) => `${k}:${Array.isArray(v) ? v.join(" ") : String(v)}`)
      .join(" ");
    out.push({
      id: typeof fm.id === "string" ? fm.id : (file.split(/[\\/]/).pop() ?? "").replace(/\.md$/, ""),
      type,
      statement: typeof fm.statement === "string" ? fm.statement : "",
      refines: asList(fm.refines),
      hay: pairs,
      file,
    });
  }
  return out;
}

/** THE VISION HAS NO NODE OF ITS OWN YET (owner, 2026-08-05). Until the spec
 *  and the book exist, the motivation gate's report IS the vision, so the
 *  centre falls back to it rather than opening empty. An iteration keeps its
 *  evidence inside its bound worktree, which is why this looks there. */
export function visionText(root: string): string {
  const roots = [join(root, "project", "spec", "iterations"), join(root, ".worktrees")];
  const found: string[] = [];
  const hunt = (dir: string, depth: number): void => {
    if (depth > 6 || found.length > 0) return;
    let entries: import("node:fs").Dirent[];
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      if (found.length > 0) return;
      if (e.isDirectory()) hunt(join(dir, e.name), depth + 1);
      else if (e.name === "gate-motivation.md") found.push(join(dir, e.name));
    }
  };
  for (const r of roots) hunt(r, 0);
  if (found.length === 0) return "No vision is written down yet.";
  try {
    return parseStateNote(readFileSync(found[0], "utf8")).body.trim();
  } catch {
    return "No vision is written down yet.";
  }
}

/** CROSSING MINIMISATION, the barycentre sweep from the Sugiyama framework —
 *  the piece a layout library would have supplied. Each level is ordered by
 *  the mean position of a node's parents in the level inside it, so an edge
 *  travels as straight outward as it can. A node with no parent keeps its
 *  place, which is what stops the sweep shuffling roots around. */
function orderByBarycentre(level: string[], place: Map<string, number>, parentsOf: Map<string, string[]>): string[] {
  const key = new Map<string, number>();
  level.forEach((id, i) => {
    const ps = (parentsOf.get(id) ?? []).map((p) => place.get(p)).filter((n): n is number => n !== undefined);
    key.set(id, ps.length === 0 ? i : ps.reduce((a, b) => a + b, 0) / ps.length);
  });
  return [...level].sort((a, b) => (key.get(a) ?? 0) - (key.get(b) ?? 0));
}

/** Which wedge a node belongs to: the value prop it ultimately refines. */
export function rootsOf(nodes: TraceNode[]): Map<string, string> {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const root = new Map<string, string>();
  const walk = (id: string, seen: Set<string>): string => {
    const cached = root.get(id);
    if (cached !== undefined) return cached;
    const n = byId.get(id);
    if (n === undefined || seen.has(id)) return "";
    if (n.type === TRACE_LEVELS[0]) return n.id;
    seen.add(id);
    for (const p of n.refines) {
      const r = walk(p, seen);
      if (r !== "") return r;
    }
    return "";
  };
  for (const n of nodes) root.set(n.id, walk(n.id, new Set()));
  return root;
}

/** LABELS NEVER ROTATE (owner, 2026-08-05). A radial arrangement tempts you
 *  to turn the text with the angle, and then half of it reads upside down.
 *  So a label keeps its own width, and that width is what the ring spacing
 *  has to clear. */
/** The arc one item claims on its ring — the card plus breathing room, so two
 *  neighbours on the same ring never touch. */
const LABEL_W = 310;
const RING_GAP = 190;

/** EVERY NODE IS A CARD, uniformly sized (owner, 2026-08-05). A dot with a
 *  label beside it is a pixel-wide click target; the card is the whole thing,
 *  and it is the same size for every node so the rings read as rings. The
 *  width fits the longest label the owner named; anything longer ellipses.
 *  Neither the card nor its text ever rotates. */
/** The label is the machine view's, at 26px monospace — so a character costs
 *  about 15.6 units and fourteen of them plus padding need 250. The card is
 *  260, and the cap is what that width can actually hold. `autonomy-range` is
 *  the yardstick the owner set: exactly fourteen, and it fits whole. */
const CARD_W = 260;
const CARD_H = 60;
const MAX_CHARS = 14;

/** THE INNERMOST RING CLEARS THE VISION, derived rather than eyeballed. Two
 *  equal cards whose centres are r apart overlap unless |dx| >= CARD_W or
 *  |dy| >= CARD_H, and the worst angle is the diagonal, where both shrink by
 *  root two. So r must beat CARD_W times root two; the rest is margin. */
const FIRST_RING = CARD_W * 1.55;

export function shortLabel(id: string): string {
  const label = id.replace(/^vp-/, "");
  return label.length <= MAX_CHARS ? label : `${label.slice(0, MAX_CHARS - 1)}…`;
}

/** DUPLICATE IDS ARE A REFUSAL, NOT A WARNING. An id is the address every
 *  reference resolves through, so two files claiming one id means a reference
 *  silently points at whichever loaded last. v1's rule was that a reuse can
 *  never shadow, and this is that rule.
 *
 *  It runs where ids ENTER: authoring a node, and importing a filled form
 *  from HTML — the import is the one an author cannot see coming, because
 *  the file it collides with may not be open. */
export function duplicateIds(nodes: TraceNode[]): { id: string; count: number }[] {
  const seen = new Map<string, number>();
  for (const n of nodes) seen.set(n.id, (seen.get(n.id) ?? 0) + 1);
  return [...seen.entries()]
    .filter(([, count]) => count > 1)
    .map(([id, count]) => ({ id, count }))
    .sort((a, b) => a.id.localeCompare(b.id));
}

/** Which trace ids exist, so a reference can be checked before it is stored. */
export function traceIds(root: string): Set<string> {
  return new Set(loadTrace(root).map((n) => n.id));
}

/** THE REFERENCES A FIELD CARRIES. frame-delta's evidence is a list of value
 *  props BY ID, never their prose — the artifact is the truth and the form
 *  points at it. A line may be a bare id or a wiki link; both resolve. */
export function refsIn(text: string): string[] {
  const out: string[] = [];
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*-\s*\[?\[?([a-z][a-z0-9]*-[a-z0-9-]+)\]?\]?\s*$/i);
    if (m !== null) out.push(m[1]);
  }
  return out;
}

/** THE TEXT FILTER KEEPS A LINE OF DESCENT, never a bare match. A node stays
 *  when it matches, and so does every ancestor above it — otherwise a matching
 *  requirement would float with nothing joining it to the vision. A node whose
 *  CHILD matches is therefore kept too, by being that child's ancestor. */
function keepFor(all: TraceNode[], q: string): Set<string> {
  if (q.trim() === "") return new Set(all.map((n) => n.id));
  const needle = q.trim().toLowerCase();
  const byId = new Map(all.map((n) => [n.id, n]));
  const keep = new Set<string>();
  for (const n of all) {
    if (!`${n.id} ${n.statement} ${n.hay ?? ""}`.toLowerCase().includes(needle)) continue;
    let cur: TraceNode | undefined = n;
    while (cur !== undefined && !keep.has(cur.id)) {
      keep.add(cur.id);
      cur = byId.get(cur.refines[0] ?? "");
    }
  }
  return keep;
}

/** Ring k must hold the WORST wedge's count at that level, because the radius
 *  is GLOBAL and a ring is one circle for everybody. */
function ringRadii(perWedge: Map<string, string[][]>, count: number, wedge: number): number[] {
  const rings: number[] = [];
  for (let k = 0; k < count; k++) {
    let worst = 0;
    for (const lanes of perWedge.values()) worst = Math.max(worst, lanes[k].length);
    const byArc = wedge === 0 ? 0 : (worst * LABEL_W) / wedge;
    rings.push(Math.max((rings[k - 1] ?? 0) + RING_GAP, byArc, FIRST_RING + k * RING_GAP));
  }
  return rings;
}

/** The radial arrangement. The ring radius is GLOBAL across every wedge, so
 *  the level separators stay true circles — which means the WORST wedge sets
 *  the ring for everyone. A narrower wedge pushes its ring outward, because
 *  the arc a wedge offers is its radius times its angle. */
export function layoutTrace(all: TraceNode[], selected?: string[], filter?: { types?: string[]; find?: string }): TraceLayout {
  // A TYPE FILTER REMOVES RINGS, it does not grey them out. The wedges still
  // come from the value props, so hiding a middle level closes the gap rather
  // than leaving a hole where it stood.
  const wanted = filter?.types ?? [];
  const levels = wanted.length > 0 ? TRACE_LEVELS.filter((t) => wanted.includes(t)) : TRACE_LEVELS;
  const props = all.filter((n) => n.type === TRACE_LEVELS[0]);
  const shown = selected === undefined || selected.length === 0 ? props.map((p) => p.id) : selected;
  const root = rootsOf(all);
  const kept = keepFor(all, filter?.find ?? "");
  const inScope = all.filter((n) => shown.includes(root.get(n.id) ?? "") && kept.has(n.id) && levels.includes(n.type));
  const wedge = shown.length === 0 ? 0 : (Math.PI * 2) / shown.length;

  const parentsOf = new Map(inScope.map((n) => [n.id, n.refines]));
  const perWedge = new Map<string, string[][]>();
  for (const p of shown)
    perWedge.set(
      p,
      levels.map(() => []),
    );
  for (const n of inScope) {
    const r = root.get(n.id) ?? "";
    const lv = levels.indexOf(n.type);
    if (lv < 0) continue;
    perWedge.get(r)?.[lv].push(n.id);
  }

  const rings = ringRadii(perWedge, levels.length, wedge);

  const placed: Placed[] = [];
  const place = new Map<string, number>();
  shown.forEach((prop, w) => {
    const lanes = perWedge.get(prop) ?? [];
    // Wedge zero points straight DOWN, so a single prop hangs below the
    // vision rather than sitting at an arbitrary angle.
    const centre = Math.PI / 2 + w * wedge;
    for (let k = 0; k < levels.length; k++) {
      const ordered = k === 0 ? lanes[k] : orderByBarycentre(lanes[k], place, parentsOf);
      ordered.forEach((id, i) => {
        const span = wedge * 0.86; // a margin, so neighbouring wedges never touch
        const a = ordered.length === 1 ? centre : centre - span / 2 + (span * i) / (ordered.length - 1);
        place.set(id, a);
        const n = inScope.find((x) => x.id === id);
        if (n === undefined) return;
        placed.push({ ...n, level: k, root: prop, x: Math.cos(a) * rings[k], y: Math.sin(a) * rings[k] });
      });
    }
  });

  const ids = new Set(placed.map((p) => p.id));
  const edges: { from: string; to: string }[] = [];
  for (const n of placed) {
    for (const p of n.refines) if (ids.has(p)) edges.push({ from: p, to: n.id });
    if (n.type === levels[0]) edges.push({ from: "vision", to: n.id });
  }
  return { nodes: placed, edges, rings, size: (rings[rings.length - 1] ?? RING_GAP) + LABEL_W };
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** The SVG. The centre is (0,0) in a viewBox that grows with the outermost
 *  ring, so the drawing scales instead of clipping. */
export function traceSvg(l: TraceLayout): string {
  const s = l.size;
  const parts = [`<svg class="trace" viewBox="${-s} ${-s} ${s * 2} ${s * 2}" role="img" aria-label="trace graph">`];
  for (const r of l.rings) parts.push(`<circle cx="0" cy="0" r="${r.toFixed(0)}" class="trace-ring"/>`);
  const at = new Map(l.nodes.map((n) => [n.id, n]));
  for (const e of l.edges) {
    const b = at.get(e.to);
    if (b === undefined) continue;
    // THE VISION'S EDGES ARE IMPLICIT. No node declares them — a value prop is
    // a child of the vision by BEING one — so they are drawn from the centre
    // and marked, rather than left out because the data does not carry them.
    const implicit = e.from === "vision";
    const a = implicit ? { x: 0, y: 0 } : at.get(e.from);
    if (a === undefined) continue;
    parts.push(
      `<line x1="${a.x.toFixed(0)}" y1="${a.y.toFixed(0)}" x2="${b.x.toFixed(0)}" y2="${b.y.toFixed(0)}" class="trace-edge${implicit ? " implicit" : ""}"/>`,
    );
  }
  // THE CARD IS THE MACHINE VIEW'S STATE NODE, class for class. Its colours
  // come from the host's palette through `state` and `label`, so this drawing
  // cannot drift from the one beside it and cannot invent a theme of its own.
  // `clickable` plus `data-detail` is how every other element on the page
  // reaches the details panel.
  const card = (x: number, y: number, label: string, id: string, rect: string, attrs: string, tip: string): string =>
    `<g class="clickable trace-node" data-detail="trace:${esc(id)}"${attrs}>` +
    `<rect x="${(x - CARD_W / 2).toFixed(0)}" y="${(y - CARD_H / 2).toFixed(0)}" width="${CARD_W}" height="${CARD_H}" rx="14" class="${rect}"/>` +
    // NEVER a rotate() on the card or its text — see CARD_W.
    `<text x="${x.toFixed(0)}" y="${(y + 6).toFixed(0)}" class="label">${esc(label)}</text>` +
    `<title>${esc(tip)}</title></g>`;
  // The vision is an ORDINARY node. `active` means the walk is standing there,
  // and nothing stands in a trace graph.
  parts.push(card(0, 0, "vision", "vision", "state", "", "the product vision"));
  for (const n of l.nodes) {
    parts.push(card(n.x, n.y, shortLabel(n.id), n.id, "state", ` data-type="${esc(n.type)}" data-root="${esc(n.root)}"`, n.statement));
  }
  parts.push("</svg>");
  return parts.join("");
}
