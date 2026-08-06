// THE TRACE GRAPH, drawn radially. The vision sits at the centre; every
// selected value prop takes an equal wedge of the 360 degrees, and the trace
// levels are concentric rings outward from it (owner design, 2026-08-05).
//
// NO LAYOUT LIBRARY. The arrangement is deterministic geometry — an angle per
// wedge and a radius per ring — so there is nothing to solve at run time and
// nothing to load. What a library WOULD have given us is crossing
// minimisation, and that is one named rule — a child sits on its parent's own
// angle and moves only to clear a neighbour — rather than a dependency the
// always-on mirror would carry forever.
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
  /** UNIQUE PER PLACEMENT, not per node. A node under two value props is
   *  drawn twice, so `id` no longer identifies a card on the canvas. */
  key: string;
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
  /** Field -> the value the mint writes for it. A TODO is not a default: it
   *  is the mint asking, and no template may answer on the author's behalf. */
  defaults: Record<string, string>;
  sections: string[];
  /** Where nodes of this type live, root-relative. Empty if unstated. */
  folder: string;
  /** MECHANICAL CHECKS THE TEMPLATE DECLARES (owner order 2026-08-06): the
   *  rules ride the template's own frontmatter, generic engine code applies
   *  them, and they fire for EVERY hand — the agent's submit and a person's
   *  panel edit run the same conformance. */
  checks: TemplateCheck[];
}

/** One declared check. Exactly one of its rule keys is set.
 *  - ears: the five EARS shapes with shall; `ears: exempt — <reason>` on the
 *    node waives the shape, and a reasonless exemption is itself a finding.
 *  - ban_words: single weasel words, matched on word boundaries, lowercased.
 *  - ban_phrases: escape and open-ended clauses, substring, lowercased.
 *  - one_of: a closed vocabulary for the field's value.
 *  - ban_markers: literal placeholder markers over the WHOLE file.
 *  - equals + require_section: when the field holds this value, the body
 *    must carry the named `## <section>`. */
export interface TemplateCheck {
  field: string;
  ears?: boolean;
  ban_words?: string[];
  ban_phrases?: string[];
  one_of?: string[];
  ban_markers?: string[];
  equals?: string;
  require_section?: string;
  hint?: string;
}

const EARS_PREFIXES = ["the ", "when ", "while ", "if ", "where "];

/** v1's earsShapeOK, ported from engine-go/trust.go at ref main: lowercase,
 *  ' shall ' present, one of the five openers, and the if-shape carries
 *  ' then '. Syntactic — necessary, never sufficient. */
export function earsShapeOK(stmt: string): boolean {
  const s = stmt.trim().toLowerCase();
  if (!s.includes(" shall ")) return false;
  const p = EARS_PREFIXES.find((x) => s.startsWith(x));
  if (p === undefined) return false;
  if (p === "if " && !s.includes(" then ")) return false;
  return true;
}

function checkList(v: unknown): TemplateCheck[] {
  if (!Array.isArray(v)) return [];
  const out: TemplateCheck[] = [];
  for (const c of v) {
    if (typeof c !== "object" || c === null) continue;
    const r = c as Record<string, unknown>;
    out.push({
      field: typeof r.field === "string" ? r.field : "",
      ...(r.ears === true ? { ears: true } : {}),
      ...(Array.isArray(r.ban_words) ? { ban_words: r.ban_words.map(String) } : {}),
      ...(Array.isArray(r.ban_phrases) ? { ban_phrases: r.ban_phrases.map(String) } : {}),
      ...(Array.isArray(r.one_of) ? { one_of: r.one_of.map(String) } : {}),
      ...(Array.isArray(r.ban_markers) ? { ban_markers: r.ban_markers.map(String) } : {}),
      ...(typeof r.equals === "string" ? { equals: r.equals } : {}),
      ...(typeof r.require_section === "string" ? { require_section: r.require_section } : {}),
      ...(typeof r.hint === "string" ? { hint: r.hint } : {}),
    });
  }
  return out;
}

export function itemTemplate(root: string, type: string): ItemTemplate | undefined {
  let note: { frontmatter: Record<string, unknown>; body: string };
  try {
    note = parseStateNote(readFileSync(join(root, itemTemplateRel(type)), "utf8"));
  } catch {
    return undefined;
  }
  const fence = /```skeleton\r?\n([\s\S]*?)```/.exec(note.body);
  const pairs = fence === null ? [] : [...(fence[1] ?? "").matchAll(/^([a-z_]+):[ \t]*(.*)$/gm)];
  return {
    type,
    id_prefix: typeof note.frontmatter.id_prefix === "string" ? note.frontmatter.id_prefix : "",
    fields: pairs.map((m) => m[1] ?? ""),
    defaults: Object.fromEntries(pairs.filter((m) => !(m[2] ?? "").includes("TODO")).map((m) => [m[1] ?? "", (m[2] ?? "").trim()])),
    sections: Array.isArray(note.frontmatter.sections) ? note.frontmatter.sections.map(String) : [],
    folder: typeof note.frontmatter.folder === "string" ? note.frontmatter.folder : "",
    checks: checkList(note.frontmatter.checks),
  };
}

/** The EARS rule with its exemption door: `ears: exempt — <reason>` waives
 *  the shape, and a reasonless exemption is itself the finding. */
function checkEars(id: string, c: TemplateCheck, value: string, fm: Record<string, unknown>, suffix: string): string[] {
  const ex = String(fm.ears ?? "").trim();
  if (ex.startsWith("exempt")) {
    const reason = ex.replace(/^exempt[\s\-–—:]*/, "").trim();
    return reason === "" ? [`${id}: ears exemption without a reason — cite the decision that grants it`] : [];
  }
  return earsShapeOK(value) ? [] : [`${id}: ${c.field} is not in an EARS shape${suffix}`];
}

/** The two ban lists over the field's own value: words on boundaries,
 *  phrases as substrings, both lowercased. */
function checkBans(id: string, c: TemplateCheck, value: string, suffix: string): string[] {
  const out: string[] = [];
  if (c.ban_words !== undefined) {
    const words = new Set(value.toLowerCase().split(/[^a-z-]+/));
    const hits = c.ban_words.filter((w) => words.has(w.toLowerCase()));
    if (hits.length > 0) out.push(`${id}: ${c.field} carries ${hits.join(" · ")}${suffix}`);
  }
  if (c.ban_phrases !== undefined) {
    const s = value.toLowerCase();
    const hits = c.ban_phrases.filter((p) => s.includes(p.toLowerCase()));
    if (hits.length > 0) out.push(`${id}: ${c.field} carries "${hits.join('" · "')}"${suffix}`);
  }
  return out;
}

/** Apply one declared check to a node. The value arrives resolved (own or
 *  default); an empty or TODO value is the unanswered check's finding, not
 *  this one's, so those pass through silently here. */
function applyCheck(id: string, c: TemplateCheck, value: string, fm: Record<string, unknown>, body: string, whole: string): string[] {
  const out: string[] = [];
  const suffix = c.hint === undefined ? "" : ` — ${c.hint}`;
  const answered = value.trim() !== "" && !value.includes("TODO");
  if (c.ears === true && answered) out.push(...checkEars(id, c, value, fm, suffix));
  if (answered) out.push(...checkBans(id, c, value, suffix));
  if (c.one_of !== undefined && answered && !c.one_of.includes(value.trim())) {
    out.push(`${id}: ${c.field} is "${value.trim()}" — one of ${c.one_of.join(" | ")}`);
  }
  if (c.ban_markers !== undefined) {
    const hits = c.ban_markers.filter((m) => (/^[A-Z]+$/.test(m) ? new RegExp(`\\b${m}\\b`).test(whole) : whole.includes(m)));
    if (hits.length > 0) out.push(`${id}: carries ${hits.join(" · ")}${suffix}`);
  }
  if (c.equals !== undefined && c.require_section !== undefined && value.trim() === c.equals) {
    const headings = new Set(body.split("\n").map((l) => l.trim()));
    if (!headings.has(`## ${c.require_section}`)) {
      out.push(`${id}: ${c.field} ${c.equals} demands — ## ${c.require_section}${suffix}`);
    }
  }
  return out;
}

/** DOES THIS NODE KEEP ITS TYPE'S PROMISES.
 *
 *  A reference resolving to a file that does not answer its own template is
 *  worse than a dangling one: the gate follows it, finds something, and
 *  reviews a hole.
 *
 *  A TODO LEFT IN PLACE COUNTS AS UNANSWERED. The mint writes TODOs on
 *  purpose, so treating them as filled would let a skeleton pass as work.
 *
 *  A FIELD THE NODE OMITS TAKES THE TEMPLATE'S DEFAULT (owner ruling
 *  2026-08-06). Widening a template must not make the whole standing corpus
 *  non-conforming overnight: the default is what the template asserts is true
 *  until a node says otherwise, and migration only visits the nodes where it
 *  is wrong. A field with no honest default carries a TODO instead, and that
 *  field is introduced together with its migration. */
/** What a node ANSWERS for a field: its own value, or the template's default
 *  where it carries none. One function, so every reader resolves it alike. */
export function fieldValue(tpl: ItemTemplate, fm: Record<string, unknown>, key: string): string {
  const v = fm[key];
  if (v === undefined) return tpl.defaults[key] ?? "";
  return Array.isArray(v) ? v.join(" ") : String(v);
}

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
    const s = fieldValue(tpl, note.frontmatter, k);
    return s.trim() === "" || s.includes("TODO");
  });
  if (missing.length > 0) out.push(`${node.id}: unanswered — ${missing.join(" · ")}`);
  const headings = new Set(note.body.split("\n").map((l) => l.trim()));
  const absent = tpl.sections.filter((h) => !headings.has(`## ${h}`));
  if (absent.length > 0) out.push(`${node.id}: missing section — ${absent.map((h) => `## ${h}`).join(" · ")}`);
  // The declared checks run last, on resolved values — same rules for every
  // hand that submits, the agent's form and the person's panel edit alike.
  const whole = readFileSync(node.file, "utf8");
  for (const c of tpl.checks) {
    out.push(...applyCheck(node.id, c, fieldValue(tpl, note.frontmatter, c.field), note.frontmatter, note.body, whole));
  }
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
 *  place, which is what stops the sweep shuffling roots around.
 *
 *  SUPERSEDED 2026-08-06, and the code is gone. Ordering alone still left a
 *  child anywhere along its row. It now TAKES its parent's angle and `spread`
 *  moves it only far enough to clear a neighbour, which does everything the
 *  ordering was for and fixes what it could not. */

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

/** EVERY wedge a node belongs to. A node whose ancestry reaches two value
 *  props is DRAWN IN BOTH (owner, 2026-08-06) — one node in the data, two
 *  places in the picture.
 *
 *  The alternative was one placement plus an edge crossing the whole circle to
 *  reach its other parent, and those lines are what made the drawing
 *  unreadable. Sharing WITHIN one prop is fine and stays: those lines are
 *  short and local.
 */
export function rootsAllOf(nodes: TraceNode[]): Map<string, string[]> {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const cache = new Map<string, string[]>();
  const walk = (id: string, seen: Set<string>): string[] => {
    const got = cache.get(id);
    if (got !== undefined) return got;
    if (seen.has(id)) return [];
    seen.add(id);
    const n = byId.get(id);
    if (n === undefined) return [];
    if (n.type === TRACE_LEVELS[0]) return [id];
    const out = new Set<string>();
    for (const p of n.refines) for (const r of walk(p, seen)) out.add(r);
    const list = [...out];
    cache.set(id, list);
    return list;
  };
  for (const n of nodes) cache.set(n.id, walk(n.id, new Set()));
  return cache;
}

/** Push apart only as much as needed. Each item starts on the angle its parent
 *  already has, the sweep moves it the minimum that clears its neighbour, and
 *  the block is re-centred on where the items wanted to be. */
function spread(targets: number[], want: number, centre: number, half: number): number[] {
  const n = targets.length;
  if (n === 0) return [];
  if (n === 1) return [Math.min(centre + half, Math.max(centre - half, targets[0] ?? centre))];
  // A wedge too narrow for the wanted separation gets an even one instead.
  const gap = Math.min(want, (half * 2) / (n - 1));
  const out = targets.slice();
  for (let i = 1; i < n; i++) out[i] = Math.max(out[i] ?? 0, (out[i - 1] ?? 0) + gap);
  const mean = (xs: number[]): number => xs.reduce((a, b) => a + b, 0) / xs.length;
  const drift = mean(out) - mean(targets);
  for (let i = 0; i < n; i++) out[i] = (out[i] ?? 0) - drift;
  const over = Math.max(0, (out[n - 1] ?? 0) - (centre + half));
  const under = Math.max(0, centre - half - (out[0] ?? 0));
  for (let i = 0; i < n; i++) out[i] = (out[i] ?? 0) + under - over;
  return out;
}

/** LABELS NEVER ROTATE (owner, 2026-08-05). A radial arrangement tempts you
 *  to turn the text with the angle, and then half of it reads upside down.
 *  So a label keeps its own width, and that width is what the ring spacing
 *  has to clear. */
/** The arc one item claims on its ring — the card plus breathing room, so two
 *  neighbours on the same ring never touch. */
const LABEL_W = 310;

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

/** THE CENTER-DISTANCE FLOOR (owner, 2026-08-06): no two node centers sit
 *  closer than two thirds of the inner ring — a fixed value, and radii GROW
 *  where it would be undercut. It also subsumes the card-overlap rule: at
 *  this distance a 260×60 card clears its neighbour at every angle. */
const MIN_DIST = Math.round((FIRST_RING * 2) / 3);

/** EVERY SECTION TAKES THE ANGLE IT NEEDS (owner, 2026-08-06). Equal wedges
 *  are the circle's real waste: one value prop carrying sixty rows and
 *  another carrying thirteen each got a sixth of the turn, so the crowded
 *  one set the radius for everybody while the sparse one drew empty arc.
 *
 *  Each section's share is its own LOAD over the total — so the outer ring
 *  is sized by what the whole circle holds, not by six times its worst
 *  wedge. Closing one gap lets its neighbour round up against it, and the
 *  whole drawing collapses inward.
 *
 *  IT IS COMPUTED, NEVER STORED. The loads come from whatever is in scope at
 *  this layout, so a filter or a selection re-cuts every section. */
function sections(shown: string[], perWedge: Map<string, string[][]>): Map<string, { centre: number; span: number }> {
  // A SECTION'S LOAD IS ITS WORST RING, counted in GAPS. Counting only the
  // outer ring starved the inner ones: a section whose stories outnumbered
  // its share of the turn had nowhere to put them once the small rings
  // stopped staggering.
  const load = (p: string): number => Math.max(1, ...(perWedge.get(p) ?? []).map((l) => Math.max(0, l.length - 1)));
  const total = shown.reduce((a, p) => a + load(p), 0);
  const out = new Map<string, { centre: number; span: number }>();
  // The FIRST section is centred straight down, so a single prop still hangs
  // below the vision however wide its section turns out to be.
  const first = total === 0 ? 0 : (Math.PI * 2 * load(shown[0] ?? "")) / total;
  let at = Math.PI / 2 - first / 2;
  for (const p of shown) {
    const span = total === 0 ? 0 : (Math.PI * 2 * load(p)) / total;
    out.set(p, { centre: at + span / 2, span });
    at += span;
  }
  return out;
}

/** THE STAGGER, ported from v1's report renderer (report_assets.go: a
 *  3-level modulo offset per row). A crowded ring splits into up to three
 *  SUB-ORBITS, and neighbours in angle alternate outward.
 *
 *  THE STEP IS THE FLOOR ITSELF, and a smaller one buys nothing — the first
 *  attempt stepped one card height (76) against a 269 floor, so 258 of the
 *  269 still had to come from the ARC. That is the arc the stagger exists to
 *  save, and the rings GREW instead of collapsing. Stepping a full MIN_DIST
 *  outward makes the radial separation carry the floor by itself: neighbours
 *  in angle are clear whatever their angle, and only SAME-ORBIT neighbours —
 *  three items apart — still owe the full distance in arc. */
const STAGGER = 3;
const STAGGER_STEP = MIN_DIST;
/** THE BAND STRADDLES ITS RING (owner sketch, 2026-08-06): one card pushed
 *  OUT and one pulled IN, rather than every sub-orbit growing outward. The
 *  ring keeps its own radius as the band's middle, so the band costs half as
 *  much clearance on each side and the next ring starts nearer. */
function orbitOffset(i: number, orbits: number): number {
  return ((i % orbits) - (orbits - 1) / 2) * STAGGER_STEP;
}

/** How far a band of this many orbits reaches on EITHER side of its ring. */
function bandHalf(orbits: number): number {
  return ((orbits - 1) / 2) * STAGGER_STEP;
}

/** THE RING GAP IS THE FLOOR. A parent and its child are a pair like any
 *  other, so rings closer than MIN_DIST let the relax pass shove children
 *  off their own ring — which broke the global-radius invariant the level
 *  circles depend on. Tying the two makes the drawing self-consistent. */
const RING_GAP = MIN_DIST;

/** How many sub-orbits a lane needs for the arc it has. A sparse lane stays
 *  on one orbit — staggering it would be noise and a thicker band.
 *
 *  AND A STAGGER MUST PAY FOR ITSELF (owner, 2026-08-06). The test is NOT
 *  the absolute radius — that only counts the rings nested inside, and says
 *  nothing about this ring's own room. It is whether the BAND the stagger
 *  adds costs less than the ARC it saves, on this ring alone. On a sparse
 *  inner ring the arc is already ample, so a band buys nothing and the ring
 *  stays a single circle; on a crowded outer one the band is small beside
 *  what it saves. Nothing is thresholded; the cheaper answer wins. */
function bestOrbits(gaps: number, span: number, floor: number): { r: number; orbits: number } {
  let best = { r: Number.POSITIVE_INFINITY, orbits: 1 };
  for (let o = 1; o <= STAGGER; o++) {
    const half = bandHalf(o);
    const r = Math.max(floor + half, span <= 0 ? 0 : (gaps * MIN_DIST) / (o * span * 0.86));
    // What this ring actually costs the drawing is its OUTER edge.
    if (r + half < best.r + bandHalf(best.orbits)) best = { r, orbits: o };
  }
  return best;
}

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

/** ONE WRITTEN REFERENCE, REDUCED TO THE ID IT MEANS.
 *
 *  THE MACHINE IS GENEROUS HERE ON PURPOSE (owner, 2026-08-06). A person
 *  writing a reference has a file in front of them, and there are four honest
 *  ways to name it. Refusing three of them teaches nothing — it just makes the
 *  form feel broken.
 *
 *  All of these mean the same node:
 *
 *  - `nbr-obsidian` — the bare id
 *  - `[[nbr-obsidian]]` — a wiki link, which is what Obsidian pastes
 *  - `project/spec/trace/neighbour/nbr-obsidian.md` — the path from the root
 *  - `project\spec\trace\neighbour\nbr-obsidian.md` — the same, Windows-shaped
 *  - `nbr-obsidian.md` — just the file name
 *
 *  A path reduces to its LAST SEGMENT with `.md` dropped, because the file
 *  name IS the id everywhere in the trace. So a unique file name resolves
 *  whether or not the folders above it were typed correctly.
 *
 *  What stays strict is the ID ITSELF. It must look like an id, and it must
 *  resolve to a standing node — those checks are the point of a reference. */
export function refId(written: string): string {
  const bare = written.trim().replace(/^\[\[/, "").replace(/\]\]$/, "").trim();
  // A wiki link may carry a display half: [[id|what it says]].
  const target = (bare.split("|")[0] ?? "").trim();
  const last = target.replace(/\\/g, "/").split("/").filter(Boolean).pop() ?? "";
  return last.replace(/\.md$/i, "").trim();
}

/** Does this reduce to something SHAPED like a trace id. */
export function looksLikeId(id: string): boolean {
  return /^[a-z][a-z0-9]*-[a-z0-9-]+$/i.test(id);
}

/** THE REFERENCES A FIELD CARRIES. frame-delta's evidence is a list of value
 *  props BY ID, never their prose — the artifact is the truth and the form
 *  points at it. Every shape refId accepts resolves; see it for the list. */
export function refsIn(text: string): string[] {
  const out: string[] = [];
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*-\s*(.+?)\s*$/);
    if (m === null) continue;
    const id = refId(m[1] ?? "");
    if (looksLikeId(id)) out.push(id);
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
 *  is GLOBAL and a ring is one circle for everybody.
 *
 *  EACH RING CARRIES ITS OWN LOAD (owner, 2026-08-06). The shared gap made
 *  the crowded outer ring blow every inner ring up with it, and the drawing
 *  wasted its middle. Now a ring grows only as far as ITS worst wedge needs
 *  at full stagger, and the floor chain keeps it clear of the previous
 *  ring's outermost sub-orbit. Inner rings collapse; the spacing does not. */
function ringRadii(wedges: { lanes: string[][]; span: number }[], count: number): { r: number; orbits: number }[] {
  const rings: { r: number; orbits: number }[] = [];
  let floor = FIRST_RING;
  for (let k = 0; k < count; k++) {
    // The ring answers to its HUNGRIEST section: each is sized against its
    // own arc, and n items need n-1 gaps, never n.
    let pick = { r: floor, orbits: 1 };
    for (const w of wedges) {
      const n = w.lanes[k]?.length ?? 0;
      if (n < 2 || w.span <= 0) continue;
      const got = bestOrbits(n - 1, w.span, floor);
      if (got.r > pick.r) pick = got;
    }
    rings.push(pick);
    // The band straddles the ring, so the next floor clears its outer half.
    floor = pick.r + bandHalf(pick.orbits) + RING_GAP;
  }
  return rings;
}

/** THE RELAX PASS (owner order 2026-08-06: collapse, but never until cards
 *  touch). The stagger is angle-blind and the cards are axis-aligned, so at
 *  some angles the radial step and the arc offset cancel on one axis. Any
 *  pair still overlapping pushes its outer card further OUTWARD along its
 *  own angle — the parent line keeps its direction — until the axis-aligned
 *  clearance holds by check rather than by formula. */
function relax(placed: Placed[]): void {
  for (let pass = 0; pass < 60; pass++) {
    let moved = false;
    for (let i = 0; i < placed.length; i++) {
      for (let j = i + 1; j < placed.length; j++) {
        const a = placed[i];
        const b = placed[j];
        if (a === undefined || b === undefined) continue;
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d >= MIN_DIST) continue;
        const out = Math.hypot(a.x, a.y) >= Math.hypot(b.x, b.y) ? a : b;
        const ang = Math.atan2(out.y, out.x);
        const r = Math.hypot(out.x, out.y) + (MIN_DIST - d);
        out.x = Math.cos(ang) * r;
        out.y = Math.sin(ang) * r;
        moved = true;
      }
    }
    if (!moved) break;
  }
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
  const asked = wanted.length > 0 ? TRACE_LEVELS.filter((t) => wanted.includes(t)) : TRACE_LEVELS;
  const props = all.filter((n) => n.type === TRACE_LEVELS[0]);
  const shown = selected === undefined || selected.length === 0 ? props.map((p) => p.id) : selected;
  const roots = rootsAllOf(all);
  const kept = keepFor(all, filter?.find ?? "");
  const rootsShown = (id: string): string[] => (roots.get(id) ?? []).filter((r) => shown.includes(r));
  const inScope = all.filter((n) => rootsShown(n.id).length > 0 && kept.has(n.id) && asked.includes(n.type));
  // AN EMPTY RING IS NOISE (owner, 2026-08-06). A level nothing has reached
  // yet draws a circle around nothing and pushes everything else inward. It
  // comes back by itself the moment the level has a node.
  const levels = asked.filter((t) => inScope.some((n) => n.type === t));

  const parentsOf = new Map(inScope.map((n) => [n.id, n.refines]));
  const perWedge = new Map<string, string[][]>();
  for (const p of shown)
    perWedge.set(
      p,
      levels.map(() => []),
    );
  for (const n of inScope) {
    const lv = levels.indexOf(n.type);
    if (lv < 0) continue;
    for (const r of rootsShown(n.id)) perWedge.get(r)?.[lv].push(n.id);
  }

  // The sections are cut AFTER the lanes are known, because each one's share
  // of the turn is its own load.
  const cut = sections(shown, perWedge);
  const ringPlan = ringRadii(
    shown.map((p) => ({ lanes: perWedge.get(p) ?? [], span: cut.get(p)?.span ?? 0 })),
    levels.length,
  );
  const rings = ringPlan.map((x) => x.r);

  const placed: Placed[] = [];
  const place = new Map<string, number>();
  const at = (prop: string, id: string): string => `${prop}\0${id}`;
  shown.forEach((prop) => {
    const lanes = perWedge.get(prop) ?? [];
    // The first section starts pointing straight DOWN, so a single prop hangs
    // below the vision rather than sitting at an arbitrary angle.
    const centre = cut.get(prop)?.centre ?? Math.PI / 2;
    const half = ((cut.get(prop)?.span ?? 0) * 0.86) / 2;
    for (let k = 0; k < levels.length; k++) {
      const lane = lanes[k] ?? [];
      if (lane.length === 0) continue;
      // OUTWARD MEANS OUTWARD (owner, 2026-08-06). A child WANTS its parent's
      // own angle, so the line between them runs straight away from the
      // centre rather than sideways. Only a collision moves it, and only far
      // enough to clear its neighbour.
      //
      // It used to spread every item evenly across the row's own span, which
      // put a lone child beside its parent instead of outside it, and turned
      // a wedge of four into a fan.
      const target = new Map<string, number>();
      for (const id of lane) {
        const ps = (parentsOf.get(id) ?? []).map((p) => place.get(at(prop, p))).filter((a): a is number => a !== undefined);
        target.set(id, ps.length === 0 ? centre : ps.reduce((a, b) => a + b, 0) / ps.length);
      }
      const ordered = [...lane].sort((a, b) => (target.get(a) ?? 0) - (target.get(b) ?? 0));
      // HOW MANY SUB-ORBITS THIS LANE NEEDS. A sparse lane stays on one
      // orbit — staggering it would be noise. A dense one splits across up
      // to three, and neighbours IN ANGLE alternate outward, so same-orbit
      // neighbours always sit the full LABEL_W apart.
      // The orbit count is the ring's own, chosen where the radius was.
      const orbits = ringPlan[k]?.orbits ?? 1;
      const angles = spread(
        ordered.map((id) => target.get(id) ?? centre),
        MIN_DIST / orbits / (rings[k] ?? 1),
        centre,
        half,
      );
      ordered.forEach((id, i) => {
        const a = angles[i] ?? centre;
        place.set(at(prop, id), a);
        const n = inScope.find((x) => x.id === id);
        if (n === undefined) return;
        const r = (rings[k] ?? 0) + orbitOffset(i, orbits);
        placed.push({ ...n, key: at(prop, id), level: k, root: prop, x: Math.cos(a) * r, y: Math.sin(a) * r });
      });
    }
  });

  relax(placed);

  const keys = new Set(placed.map((p) => p.key));
  const edges: { from: string; to: string }[] = [];
  for (const n of placed) {
    // WITHIN THE WEDGE ONLY. A parent under a different value prop is not
    // linked from here: this node is drawn under that prop as well, and the
    // link is drawn there, short and local. That is what removes the lines
    // that used to cross the whole circle.
    for (const p of n.refines) if (keys.has(at(n.root, p))) edges.push({ from: at(n.root, p), to: n.key });
    if (n.type === levels[0]) edges.push({ from: "vision", to: n.key });
  }
  // The relax pass may push past the outermost ring, so the size follows the
  // cards rather than the circles.
  const reach = placed.reduce((m, p) => Math.max(m, Math.hypot(p.x, p.y)), rings[rings.length - 1] ?? RING_GAP);
  return { nodes: placed, edges, rings, size: reach + LABEL_W };
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
  // KEYED BY PLACEMENT, not by node: a node under two value props has two
  // cards, and `id` no longer picks one out.
  const at = new Map(l.nodes.map((n) => [n.key, n]));
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
      `<line x1="${a.x.toFixed(0)}" y1="${a.y.toFixed(0)}" x2="${b.x.toFixed(0)}" y2="${b.y.toFixed(0)}" class="trace-edge${implicit ? " implicit" : ""}" data-a="${esc(implicit ? "vision" : (at.get(e.from)?.id ?? ""))}" data-b="${esc(b.id)}"/>`,
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
  parts.push(card(0, 0, "vision", "vision", "state", ' data-node="vision"', "the product vision"));
  for (const n of l.nodes) {
    // data-node is the NODE, shared by both cards of a duplicated node, so a
    // click lights every place it appears rather than only the one hit.
    parts.push(
      card(
        n.x,
        n.y,
        shortLabel(n.id),
        n.id,
        "state",
        ` data-type="${esc(n.type)}" data-root="${esc(n.root)}" data-node="${esc(n.id)}"`,
        n.statement,
      ),
    );
  }
  parts.push("</svg>");
  return parts.join("");
}
