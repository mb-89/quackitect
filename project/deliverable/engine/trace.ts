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
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { contentHash } from "./hash.ts";
import { nodeLines, noteOf, parseStateNote, passEpoch, readNode } from "./notes.ts";

/** THE SHARED SPINE, in ring order from the centre outward. Every wedge holds
 *  these whole, and nothing branches until the last of them.
 *
 *  Adding a level is ONE entry here and one more ring. Nothing else in this
 *  file knows how many there are, or what they are called. */
const TRACE_SPINE = ["value-prop", "story", "use-case", "requirement"];

/** ONE SUBSEGMENT — a slice of every wedge, past the point where the spine
 *  ends. It carries its own ordered levels outward from there. */
export interface Subsegment {
  /** Stable name, used as a css class and in the schema. */
  id: string;
  /** What a reader sees on the arc when zoomed out. */
  label: string;
  /** Its own levels, in ring order. Ring 0 here is the first ring past the
   *  spine, so two subsegments' first levels share a circle. */
  levels: string[];
}

/** THE SUBSEGMENTS (owner design 2026-08-07).
 *
 *  A wedge runs whole while the spine lasts. At the spine's END it divides
 *  into two, three or four slices, and each goes its own way outward.
 *
 *  THE DIVISION HAPPENS ONCE. A node on the LAST spine level may point into
 *  several slices — that is the one place an item belongs to more than one.
 *  Past it there is no cross-coupling: a node in one slice never points at a
 *  node in another, and no edge is drawn between them.
 *
 *  WHY IT EXISTS: design and testing answer the same requirement and answer
 *  it differently. Design goes one way, testing the other, and a reader can
 *  tell which is which by where it sits rather than by reading it.
 *
 *  AN EMPTY SLICE STILL HOLDS ITS ARC. The test levels do not exist yet; the
 *  space is reserved so they land without moving anything. */
export interface Subsegments {
  of: Subsegment[];
}

export const TRACE_SUBSEGMENTS: Subsegments = {
  of: [
    { id: "design", label: "design", levels: ["function"] },
    { id: "test", label: "tests", levels: ["test-spec"] },
  ],
};

/** THE RINGS, each one the types that share it. The spine gives one type per
 *  ring; past it a ring holds one type per subsegment that reaches that far. */
export function traceRings(sub: Subsegments = TRACE_SUBSEGMENTS): string[][] {
  const depth = Math.max(0, ...sub.of.map((s) => s.levels.length));
  const past = Array.from({ length: depth }, (_, i) => sub.of.map((s) => s.levels[i]).filter((t): t is string => typeof t === "string"));
  return [...TRACE_SPINE.map((t) => [t]), ...past];
}

/** Which subsegment a type belongs to. A spine type belongs to none, and that
 *  is what "it owns the whole wedge" means. */
export function subsegmentOf(type: string, sub: Subsegments = TRACE_SUBSEGMENTS): string | undefined {
  return sub.of.find((s) => s.levels.includes(type))?.id;
}

/** Every level in ring order, flattened. The type filter and the pills read
 *  this; the layout works from the rings. */
export const TRACE_LEVELS = traceRings().flat();

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

/** ONE LABELLED ARC — a whole section, or one slice of one (owner design
 *  2026-08-07). What a reader sees when the drawing is too small for cards.
 *
 *  IT IS THE MAP AT ALTITUDE. Zoomed out, the cards are specks and the arcs
 *  carry the meaning: this wedge is that value proposition, and past the
 *  requirements it divides into design and tests. Zoomed in, the arcs fade
 *  and the cards take over. */
export interface TraceBand {
  label: string;
  /** The value prop this arc belongs to — a click target for a zoom-to. */
  root: string;
  kind: "segment" | "slice";
  r: number;
  from: number;
  to: number;
}

/** ONE CLICKABLE PIECE OF THE PIE — a section at one ring, or one slice of
 *  that (owner ruling 2026-08-07).
 *
 *  "THE LEDGER'S REQUIREMENTS" IS A PLACE. Naming a section was not enough:
 *  a reader who wants one ring of one section needs somewhere to aim, and the
 *  label arc was the only target there was. */
export interface TraceSector {
  /** The types on this ring — what the piece holds. */
  label: string;
  root: string;
  ring: number;
  /** Which slice, or empty on an undivided ring. */
  slice: string;
  r0: number;
  r1: number;
  from: number;
  to: number;
}

/** ONE SEPARATOR — the cut between two pieces. A `section` spoke runs the
 *  whole way out; a `slice` cut starts where the division opens. */
export interface TraceSpoke {
  kind: "section" | "slice";
  at: number;
  r0: number;
  r1: number;
}

export interface TraceLayout {
  nodes: Placed[];
  edges: { from: string; to: string }[];
  /** Ring radii, innermost first — the level separators are drawn at these. */
  rings: number[];
  /** The labelled arcs, outside the outermost ring. */
  bands: TraceBand[];
  /** The clickable pieces, tiling the circle. */
  sectors: TraceSector[];
  /** The cuts between them. */
  spokes: TraceSpoke[];
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
 *    must carry the named `## <section>`.
 *  - equals + require_ref_in: when the field holds this value, the NAMED
 *    OTHER field must carry at least one traceable reference — a bare node
 *    id or a wiki link. Prose alone names nothing a reviewer can follow. */
export interface TemplateCheck {
  field: string;
  ears?: boolean;
  ban_words?: string[];
  ban_phrases?: string[];
  one_of?: string[];
  ban_markers?: string[];
  equals?: string;
  require_section?: string;
  require_ref_in?: string;
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
      ...(typeof r.require_ref_in === "string" ? { require_ref_in: r.require_ref_in } : {}),
      ...(typeof r.hint === "string" ? { hint: r.hint } : {}),
    });
  }
  return out;
}

/** STAMPED, like the corpus. conformance() asks for the template of EVERY
 *  node, so a 328-node pass read, parsed and regexed one of a dozen template
 *  files 328 times. There are only twelve of them and they change when
 *  somebody edits a template, which the stamp sees.
 *
 *  THE OBJECT IS SHARED. Callers read its fields and never write them; one
 *  that starts writing owes a copy at the call site. */
const ITEM_TEMPLATES = new Map<string, { stamp: string; tpl: ItemTemplate | undefined }>();

export function itemTemplate(root: string, type: string): ItemTemplate | undefined {
  const path = join(root, itemTemplateRel(type));
  let stamp: string;
  try {
    const s = statSync(path);
    stamp = `${s.size}:${s.mtimeMs}`;
  } catch {
    return undefined; // no template is not an error; the type simply declares none
  }
  const hit = ITEM_TEMPLATES.get(path);
  if (hit !== undefined && hit.stamp === stamp) return hit.tpl;
  const built = buildItemTemplate(path, type);
  ITEM_TEMPLATES.set(path, { stamp, tpl: built });
  return built;
}

function buildItemTemplate(path: string, type: string): ItemTemplate | undefined {
  let note: { frontmatter: Record<string, unknown>; body: string };
  try {
    note = parseStateNote(readFileSync(path, "utf8"));
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
  // A STILL-COMMENTED VALUE IS UNANSWERED, the same convention the form
  // checker has always used. A minted field carries its prompt as a markdown
  // comment, and reading that prompt as an ANSWER means every declared check
  // fires against the instructions for filling it in.
  //
  // It surfaced the day a field was minted with a comment listing its own
  // vocabulary: the one_of check duly refused the list of legal values for not
  // being one of the legal values.
  const t = value.trim();
  const answered = t !== "" && !t.includes("TODO") && !(t.startsWith("<!--") && t.endsWith("-->"));
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
  if (c.equals !== undefined && c.require_ref_in !== undefined && value.trim() === c.equals) {
    const v = fm[c.require_ref_in];
    const entries = Array.isArray(v) ? v.map(String) : [String(v ?? "")];
    // A traceable entry IS an id or carries a link. Prose beside them is
    // welcome; prose alone is the finding.
    const traceable = entries.some((e) => /\[\[[^\]]+\]\]/.test(e) || /^[a-z][a-z0-9]*-[\w.-]+$/i.test(e.trim()));
    if (!traceable) out.push(`${id}: ${c.field} ${c.equals} demands a traceable ref in ${c.require_ref_in}${suffix}`);
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
  const note = noteOf(node.file);
  if (note === undefined) return [`${node.id}: unreadable`];
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
  // THE SAME FILE, NOT A SECOND READ. This used to call readFileSync again on
  // the node it had just parsed, so every conformance check cost two reads.
  const whole = readNode(node.file);
  for (const c of tpl.checks) {
    out.push(...applyCheck(node.id, c, fieldValue(tpl, note.frontmatter, c.field), note.frontmatter, note.body, whole));
  }
  return out;
}

/** Every trace node the product declares. */
/** THE CORPUS IS RE-READ ONLY WHEN IT CHANGED (owner ruling 2026-08-09).
 *
 *  This is v1's adr-verdict-cache reapplied, and its two rules are the whole
 *  design: key a computed answer to a HASH OF ITS INPUT plus the build
 *  identity, and keep the cache OUT OF THE REPO, because "a cache is never
 *  truth and the repo must stay cache-free".
 *
 *  WHY IT IS NOT A SECOND SOURCE OF TRUTH, which is the rule this must not
 *  break. Nothing is stored that cannot be recomputed. Nothing is written
 *  anywhere. A stale entry cannot survive an edit, because the edit moves the
 *  mtime and the stamp stops matching. The files remain the only truth; this
 *  only remembers that it already read them.
 *
 *  THE STAMP IS STAT, NEVER CONTENT. Hashing 328 files means READING 328
 *  files, which is exactly the cost being avoided. Size and mtime answer the
 *  same question for one syscall each, and the directory walk that lists them
 *  is paid either way.
 *
 *  BUILD IDENTITY COMES FREE HERE. v1 needed it because its cache lived on
 *  disk and outlived the engine. This one is in memory, so a reload cannot
 *  reach a cache built by the code it replaced.
 *
 *  WHAT IT COST TO NOT HAVE IT: one se_pull took 274,270 ms entering an
 *  iteration, because every hop of the walk reloaded the whole corpus for
 *  every machine. The server answers nothing while that runs — the MCP
 *  endpoint shares the event loop — so the transport gave up and the
 *  extension had to be restarted. */
const CORPUS = new Map<string, { stamp: string; nodes: TraceNode[]; epoch: number }>();

/** ONE FILE, READ ONCE UNTIL IT MOVES — the same rule as the corpus, one
 *  level down.
 *
 *  nodeField and nodeList each read a whole node off disk and split it, and
 *  they are called PER NODE PER FIELD. criterionAxisItems alone asks for the
 *  damage grade, the priority and the compounding partner of every row in a
 *  150-row pool: 450 reads of 150 files, every time the criteria list is
 *  resolved. The corpus stamp does not help them, because they take a path
 *  rather than a node.
 *
 *  THE ARRAY IS SHARED, not copied. Every caller only reads it — find, slice,
 *  findIndex — and a copy per call would give back the cost this removes. A
 *  caller that starts mutating it owes a copy at the call site. */
/** THE DOOR LIVES IN notes.ts, the file-and-parse layer. Re-exported here so
 *  the readers that already import from trace keep one import. */
export { nodeLines, noteOf, readNode };

/** THE CORPUS'S VERSION, from the files themselves.
 *
 *  IT IS EXPENSIVE AND IT IS CORRECT, in that order of importance. Keying it on
 *  the model's watcher generation was tried on 2026-08-09 and the suite refused
 *  it: a corpus that misses an external edit reports a fallen claim as green,
 *  and that is the one thing this must never do.
 *
 *  SO THE COST IS NOT FIXED HERE. It is 328 stats per call and it was called
 *  sixty-six times to enter one record. The sixty-six is the defect; the 328 is
 *  the price of an honest answer. Collect it ONCE per operation and pass it
 *  down (software.md, input-process-output). */
function corpusStamp(files: string[]): string {
  const parts: string[] = [];
  for (const f of files) {
    try {
      const s = statSync(f);
      parts.push(`${f}:${s.size}:${s.mtimeMs}`);
    } catch {
      parts.push(`${f}:gone`);
    }
  }
  return contentHash(parts.join("\n"));
}

/** THE CORPUS'S CURRENT STAMP, for keying anything computed FROM the corpus.
 *
 *  The same walk loadTrace does, and the reason a VERDICT can be reused: a
 *  check whose inputs have not moved has not changed its mind. Ask for it once
 *  per pass and key every verdict in that pass on it — asking per item would
 *  pay the walk per item. */
export function corpusVersion(root: string): string {
  // THE CORPUS THIS PASS ALREADY BUILT carries the stamp with it. Asking again
  // would re-sweep 328 files to recompute a string that is sitting in the map.
  const era = passEpoch();
  const hit = CORPUS.get(root);
  if (hit !== undefined && era !== 0 && hit.epoch === era) return hit.stamp;
  return corpusStamp(traceFiles(traceDir(root)));
}

export function loadTrace(root: string): TraceNode[] {
  const hit = CORPUS.get(root);
  // A COPY, NEVER THE STORED ARRAY. A caller that sorts what it was handed
  // would otherwise reorder every later caller's corpus, and the bug would
  // look like the sort rather than the sharing.
  //
  // BUILT IN THIS PASS ALREADY. The sweep below is what the pass exists to
  // remove: 328 stats to decide whether to rebuild, paid 58 times to enter one
  // record, on a corpus whose every file the pass had already verified. A
  // lane write bumps the epoch, so a corpus built before it is never reused.
  const era = passEpoch();
  if (hit !== undefined && era !== 0 && hit.epoch === era) return hit.nodes.slice();
  const files = traceFiles(traceDir(root));
  const stamp = corpusStamp(files);
  if (hit !== undefined && hit.stamp === stamp) {
    hit.epoch = era;
    return hit.nodes.slice();
  }
  const out: TraceNode[] = [];
  for (const file of files) {
    // THROUGH THE ONE DOOR, so the corpus and every later reader of the same
    // node share one read and one parse. This used to read all 328 files for
    // itself, and conformance then read every one of them again.
    const note = noteOf(file);
    if (note === undefined) continue; // a node that will not parse is the lint's problem
    const fm = note.frontmatter;
    // THE CORPUS IS EVERY TYPED NODE, not only the ones that earn a ring. A
    // stakeholder draws nothing and is still an address a value prop points
    // at, so the layout — not the loader — decides what is drawn.
    const type = typeName(fm.type);
    if (type === "") continue;
    const id = typeof fm.id === "string" ? fm.id : (file.split(/[\\/]/).pop() ?? "").replace(/\.md$/, "");
    const pairs = Object.entries(fm)
      .map(([k, v]) => `${k}:${Array.isArray(v) ? v.join(" ") : String(v)}`)
      .join(" ");
    out.push({
      id,
      type,
      statement: typeof fm.statement === "string" ? fm.statement : "",
      // THE UPWARD EDGE HAS ONE SLOT AND SEVERAL NAMES (owner ruling
      // 2026-08-07, machines/trace-schema.md): refines, satisfies,
      // implements, verifies — the relation differs, so the word does.
      //
      // The MODEL keeps one slot on purpose. Everything downstream — the
      // wedge walk, the coverage checks, the drawing — asks the same
      // question of every node: what does this serve? Splitting the slot
      // would fork that question per type for no gain.
      //
      // EVERY SCHEMA KEY FOLDS, or its whole level goes invisible: the
      // elements, the interfaces and the test-specs each shipped with their
      // key missing here, and none of them drew until somebody looked.
      refines: [...asList(fm.refines), ...asList(fm.satisfies), ...asList(fm.implements), ...asList(fm.verifies)],
      hay: pairs,
      file,
    });
  }
  CORPUS.set(root, { stamp, nodes: out, epoch: era });
  return out.slice();
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

/** RE-ORIGIN (owner design 2026-08-07). Any node can be made the centre. Its
 *  own descendants become the drawing, and everything else falls away.
 *
 *  A LEVEL IS A DISTANCE, NOT A TYPE. From the vision the first ring is the
 *  value props, because that is what the vision's children are. From a use
 *  case the first ring is its requirements. The rings, the wedges, the bands,
 *  the slices — all of it takes the level as given, so all of it survives
 *  unchanged.
 *
 *  WHAT SURVIVES A RE-ORIGIN is the type order. A requirement still sits
 *  inside a function, because that order is what the trace MEANS. What moves
 *  is where the counting starts. */
export function descendantsOf(nodes: TraceNode[], origin: string): TraceNode[] {
  const kids = new Map<string, TraceNode[]>();
  for (const n of nodes) for (const p of n.refines) kids.set(p, [...(kids.get(p) ?? []), n]);
  const out = new Map<string, TraceNode>();
  const walk = (id: string): void => {
    for (const k of kids.get(id) ?? []) {
      if (out.has(k.id)) continue;
      out.set(k.id, k);
      walk(k.id);
    }
  };
  walk(origin);
  return [...out.values()];
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

/** EVERY wedge a node belongs to. A node whose ancestry reaches two value
 *  props is DRAWN IN BOTH (owner, 2026-08-06) — one node in the data, two
 *  places in the picture.
 *
 *  The alternative was one placement plus an edge crossing the whole circle to
 *  reach its other parent, and those lines are what made the drawing
 *  unreadable. Sharing WITHIN one prop is fine and stays: those lines are
 *  short and local.
 */
export function rootsAllOf(
  nodes: TraceNode[],
  isRoot: (n: TraceNode) => boolean = (n) => n.type === TRACE_LEVELS[0],
): Map<string, string[]> {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const cache = new Map<string, string[]>();
  const walk = (id: string, seen: Set<string>): string[] => {
    const got = cache.get(id);
    if (got !== undefined) return got;
    if (seen.has(id)) return [];
    seen.add(id);
    const n = byId.get(id);
    if (n === undefined) return [];
    if (isRoot(n)) return [id];
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
 *  the block is re-centred on where the items wanted to be.
 *
 *  THE BAND IS A WALL (owner ruling 2026-08-07). Nothing may leave it, ever.
 *
 *  IT USED TO LEAK, and this is how: the sweep only ever pushes items APART,
 *  never together. A function WANTS its requirement's angle, and requirements
 *  own the whole section while functions own half of it. So a function under a
 *  requirement on the far side of the section started outside the design slice
 *  and nothing brought it back — it was drawn in the neighbouring section,
 *  belonging visibly to nothing.
 *
 *  So the wants are clamped BEFORE the sweep, and the result is clamped after.
 *  A card that cannot have its parent's exact angle gets the nearest angle it
 *  is allowed, which is what "outward means outward" degrades to once a band
 *  narrower than its parent's exists at all. */
function spread(targets: number[], want: number, centre: number, half: number): number[] {
  const n = targets.length;
  if (n === 0) return [];
  const lo = centre - half;
  const hi = centre + half;
  const pin = (a: number): number => Math.min(hi, Math.max(lo, a));
  const wanted = targets.map(pin);
  if (n === 1) return [pin(targets[0] ?? centre)];
  // A wedge too narrow for the wanted separation gets an even one instead.
  const gap = Math.min(want, (half * 2) / (n - 1));
  const out = wanted.slice();
  for (let i = 1; i < n; i++) out[i] = Math.max(out[i] ?? 0, (out[i - 1] ?? 0) + gap);
  const mean = (xs: number[]): number => xs.reduce((a, b) => a + b, 0) / xs.length;
  const drift = mean(out) - mean(wanted);
  for (let i = 0; i < n; i++) out[i] = (out[i] ?? 0) - drift;
  const over = Math.max(0, (out[n - 1] ?? 0) - hi);
  const under = Math.max(0, lo - (out[0] ?? 0));
  for (let i = 0; i < n; i++) out[i] = pin((out[i] ?? 0) + under - over);
  return out;
}

/** LABELS NEVER ROTATE (owner, 2026-08-05). A radial arrangement tempts you
 *  to turn the text with the angle, and then half of it reads upside down.
 *  So a label keeps its own width, and that width is what the ring spacing
 *  has to clear. */
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

/** How much of a section's angle its cards may use. The rest is left EMPTY,
 *  so two sections read apart without a line drawn between them. Half of the
 *  slack falls on each side. */
const SECTION_SLACK = 0.86;

/** The hidden separator between one slice and the next. It is the
 *  SAME width as the gap between two sections, because a reader who has
 *  learnt that gap should not have to learn a second one. Like the section
 *  boundaries, it is deliberately not drawn. */
const SPLIT_GAP = 0.14;

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

/** THE RING GAP IS THE VISION'S OWN GAP (owner ruling 2026-08-07).
 *
 *  The distance from the vision to the value props is FIRST_RING, and that is
 *  the drawing's unit of separation. Every later ring gets at least the same,
 *  measured EDGE TO EDGE: the outermost card of one ring to the innermost
 *  card of the next.
 *
 *  IT USED TO BE MIN_DIST, which is two thirds of that. Enough while the
 *  rings were sparse. Once the crowded ones started staggering, their bands
 *  ate most of the gap and consecutive rings read as one smear. Adding the
 *  functions made it plain: requirements and functions ran together with
 *  nothing between them.
 *
 *  EDGE TO EDGE IS THE WHOLE POINT. A gap between ring CENTRES says nothing
 *  once a band straddles the ring, which is exactly the case where the
 *  drawing gets tight. The floor below already adds the band's outer half,
 *  so this constant is the clear air between cards. */
const RING_GAP = FIRST_RING;

/** How many sub-orbits a lane needs for the arc it has. A sparse lane stays
 *  on one orbit — staggering it would be noise and a thicker band.
 *
 *  AND A STAGGER MUST PAY FOR ITSELF (owner, 2026-08-06). The test is NOT
 *  the absolute radius — that only counts the rings nested inside, and says
 *  nothing about this ring's own room. It is whether the BAND the stagger
 *  adds costs less than the ARC it saves, on this ring alone. On a sparse
 *  inner ring the arc is already ample, so a band buys nothing and the ring
 *  stays a single circle; on a crowded outer one the band is small beside
 *  what it saves. Nothing is thresholded; the cheaper answer wins.
 *
 *  THE RADIUS AND THE STAGGER ARE ONE DECISION, taken for the whole ring
 *  (owner ruling 2026-08-07). Every section shares a ring, so both numbers
 *  must suit the HUNGRIEST of them.
 *
 *  IT USED TO PICK THEM APART: each section proposed a pair, and the ring took
 *  the largest RADIUS with whatever stagger came attached. A section that
 *  needed three orbits to fit could be handed a bigger radius and one orbit,
 *  which is a third of the room it asked for. Its cards then spread past their
 *  own arc into the next section. */
function bestOrbits(lanes: { gaps: number; arc: number }[], floor: number): { r: number; orbits: number } {
  let best = { r: floor, orbits: 1 };
  let cost = Number.POSITIVE_INFINITY;
  for (let o = 1; o <= STAGGER; o++) {
    const half = bandHalf(o);
    let r = floor + half;
    for (const l of lanes) if (l.arc > 0) r = Math.max(r, (l.gaps * MIN_DIST) / (o * l.arc));
    // What this ring actually costs the drawing is its OUTER edge.
    if (r + half < cost) {
      cost = r + half;
      best = { r, orbits: o };
    }
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
/** DOTS ARE LEGAL INSIDE AN ID, and that is how the function tree carries its
 *  shape (owner ruling 2026-08-07). `fn-a.b` sits under `fn-a`; a node's
 *  parent is its id with the last segment removed.
 *
 *  WHAT IT COST TO MISS. The character class had no dot, so every dotted id
 *  failed this test and was DROPPED by refsIn before anything looked at it.
 *  Not refused, not reported — dropped. The coverage check then said no
 *  function covered any requirement, which pointed at the tree rather than at
 *  the extractor, and the tree was correct.
 *
 *  A FILTER THAT DISCARDS SILENTLY IS THE WORST SHAPE for this. It cannot be
 *  distinguished from an author who wrote nothing. */
export function looksLikeId(id: string): boolean {
  return /^[a-z][a-z0-9]*-[a-z0-9.-]+$/i.test(id);
}

/** THE REFERENCES A FIELD CARRIES. frame-delta's evidence is a list of value
 *  props BY ID, never their prose — the artifact is the truth and the form
 *  points at it. Every shape refId accepts resolves; see it for the list. */
export function refsIn(text: string): string[] {
  const out: string[] = [];
  for (const line of text.split(/\r?\n/)) {
    // A LIST LINE IS DASH-LED OR NUMBERED (2026-08-09). The rank-cut template
    // numbers its rows, because the numbers ARE the order, and reading only
    // dash-led lines found nothing in one — so cut-criteria refused as empty
    // while its own line check passed. Fifth time that pair has disagreed.
    const m = line.match(/^\s*(?:[-*]|\d+[.)])\s*(.+?)\s*$/);
    if (m === null) continue;
    // A ROW MAY CARRY A MARK AFTER ITS ID — [cutoff], [cut: why], [moved: why].
    // The id is the first wiki link where there is one, so the mark travels
    // beside the reference instead of destroying it.
    const rest = m[1] ?? "";
    const linked = /\[\[([^\]]+)\]\]/.exec(rest);
    const id = refId(linked === null ? rest : (linked[1] ?? ""));
    if (looksLikeId(id)) out.push(id);
  }
  return out;
}

/** THE REFERENCES A TABLE ROW CARRIES — the compare-card's answer shape.
 *
 *  A card records one answered pair per row: the two items and the verdict.
 *  refsIn above reads a LIST, one dash-led id per line, so it found nothing in
 *  a row and the field refused as empty while its own line check passed. No
 *  content could satisfy both, which is a field nobody can ever fill.
 *
 *  Only the first two cells are items. The third is the verdict, and a
 *  verdict is not an artifact.
 *
 *  HOW MANY CELLS ARE ITEMS DEPENDS ON THE ROW (2026-08-09). A card answers
 *  with two items and a verdict. A dsm answers with ONE element and the value
 *  written onto it, so reading two cells there offered the cluster name as an
 *  artifact and the type check refused it. The caller knows which shape it
 *  has; it says so. */
export function refsInRows(text: string, columns = 2): string[] {
  const out: string[] = [];
  for (const line of text.split(/\r?\n/)) {
    if (!/^\s*\|/.test(line)) continue;
    const cells = line.split("|").slice(1, -1);
    for (const cell of cells.slice(0, columns)) {
      const id = refId(cell.trim());
      if (looksLikeId(id)) out.push(id);
    }
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
function ringRadii(wedges: { lanes: string[][]; arcs: number[] }[], count: number): { r: number; orbits: number }[] {
  const rings: { r: number; orbits: number }[] = [];
  let floor = FIRST_RING;
  for (let k = 0; k < count; k++) {
    // The ring answers to its HUNGRIEST section, and n items need n-1 gaps.
    //
    // THE ARC IS THE ONE THIS LEVEL MAY ACTUALLY USE (owner ruling
    // 2026-08-07). Below the split that is half a section, so the ring has to
    // grow to hold the same rows in half the angle. Sizing against the whole
    // section instead left the cards overlapping, and the pass that prises
    // them apart smeared the requirements over five layers.
    const lanes = wedges.map((w) => ({ gaps: Math.max(0, (w.lanes[k]?.length ?? 0) - 1), arc: w.arcs[k] ?? 0 })).filter((l) => l.gaps > 0);
    const pick = bestOrbits(lanes, floor);
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
 *  clearance holds by check rather than by formula.
 *
 *  THE BAND IS A HARD CEILING (owner ruling 2026-08-07). A card sits on its
 *  ring, one step out or one step in. Never further. The push stops at the
 *  band's outer edge and the card stays where the stagger put it.
 *
 *  IT USED TO BE UNBOUNDED, and that is what the owner saw: the requirements
 *  climbing five steps out of their ring, until the ring was no longer a ring
 *  and the drawing read as one smear. The push is a last resort for a clash
 *  the arc could not foresee. Where a whole lane does not fit, the answer is
 *  a BIGGER RADIUS, chosen once in ringRadii, not sixty passes of shoving. */
function pushApart(a: Placed | undefined, b: Placed | undefined, ceiling: number[]): boolean {
  if (a === undefined || b === undefined) return false;
  const d = Math.hypot(a.x - b.x, a.y - b.y);
  if (d >= MIN_DIST) return false;
  const out = Math.hypot(a.x, a.y) >= Math.hypot(b.x, b.y) ? a : b;
  const was = Math.hypot(out.x, out.y);
  const r = Math.min(ceiling[out.level] ?? Number.POSITIVE_INFINITY, was + (MIN_DIST - d));
  if (r <= was) return false;
  const ang = Math.atan2(out.y, out.x);
  out.x = Math.cos(ang) * r;
  out.y = Math.sin(ang) * r;
  return true;
}

function relax(placed: Placed[], ceiling: number[]): void {
  for (let pass = 0; pass < 60; pass++) {
    let moved = false;
    for (let i = 0; i < placed.length; i++)
      for (let j = i + 1; j < placed.length; j++) if (pushApart(placed[i], placed[j], ceiling)) moved = true;
    if (!moved) break;
  }
}

/** Where each item in a lane WANTS to sit: the mean angle of its placed
 *  parents, or the wedge's centre when none of them is placed. */
function wants(
  lane: string[],
  parents: Map<string, string[]>,
  placedAt: (id: string) => number | undefined,
  fallback: number,
): Map<string, number> {
  const out = new Map<string, number>();
  for (const id of lane) {
    const ps = (parents.get(id) ?? []).map(placedAt).filter((a): a is number => a !== undefined);
    out.set(id, ps.length === 0 ? fallback : ps.reduce((a, b) => a + b, 0) / ps.length);
  }
  return out;
}

/** A ring's lane, split into its slices and keeping the incoming order. A
 *  spine ring has no slices and yields one group, keyed -1. */
function bySlice(ordered: string[], sliceOf: (id: string) => number): Map<number, string[]> {
  const out = new Map<number, string[]>();
  for (const id of ordered) {
    const s = sliceOf(id);
    out.set(s, [...(out.get(s) ?? []), id]);
  }
  return out;
}

/** WHERE THE DRAWING STARTS: the node set, the wedges and the ring order,
 *  taken from the origin. No origin means the vision, which is not a node —
 *  so the wedges are the value props and the rings are the whole type order.
 *
 *  AN UNKNOWN ORIGIN FALLS BACK TO THE VISION rather than drawing nothing. A
 *  typed name that does not exist should show the whole picture, not a blank. */
function originAt(
  all: TraceNode[],
  origin: string | undefined,
  sub: Subsegments,
): { nodes: TraceNode[]; props: string[]; rings: string[][] } {
  const rings = traceRings(sub);
  const seed = origin === undefined || origin === "" ? undefined : all.find((n) => n.id === origin);
  if (seed === undefined) {
    return { nodes: all, props: all.filter((n) => n.type === TRACE_LEVELS[0]).map((n) => n.id), rings };
  }
  const nodes = descendantsOf(all, seed.id);
  const at = rings.findIndex((r) => r.includes(seed.type));
  const past = at < 0 ? rings : rings.slice(at + 1);
  // The wedges are the origin's OWN children — whatever type they turn out to
  // be. A use case as origin gives one wedge per requirement.
  const props = nodes.filter((n) => n.refines.includes(seed.id)).map((n) => n.id);
  return { nodes, props, rings: past };
}

/** The radial arrangement. The ring radius is GLOBAL across every wedge, so
 *  the level separators stay true circles — which means the WORST wedge sets
 *  the ring for everyone. A narrower wedge pushes its ring outward, because
 *  the arc a wedge offers is its radius times its angle. */
export function layoutTrace(
  all: TraceNode[],
  selected?: string[],
  filter?: { types?: string[]; find?: string; origin?: string },
  subs?: Subsegments,
): TraceLayout {
  // A TYPE FILTER REMOVES RINGS, it does not grey them out. The wedges still
  // come from the value props, so hiding a middle level closes the gap rather
  // than leaving a hole where it stood.
  const wanted = filter?.types ?? [];
  const sub = subs ?? TRACE_SUBSEGMENTS;
  // THE ORIGIN DECIDES WHERE THE COUNTING STARTS. With none, the centre is
  // the vision and the first ring is the value props. With one, the centre is
  // that node and the first ring is its own children — the type order past it
  // is unchanged, because that order is what the trace MEANS.
  const from = originAt(all, filter?.origin, sub);
  const rung = wanted.length > 0 ? from.rings.map((r) => r.filter((t) => wanted.includes(t))) : from.rings;
  const asked = rung;
  const shown = selected === undefined || selected.length === 0 ? from.props : selected;
  const roots = rootsAllOf(from.nodes, (n) => from.props.includes(n.id));
  const all2 = from.nodes;
  const kept = keepFor(all2, filter?.find ?? "");
  const rootsShown = (id: string): string[] => (roots.get(id) ?? []).filter((r) => shown.includes(r));
  const onSome = (t: string): boolean => asked.some((r) => r.includes(t));
  const inScope = all2.filter((n) => rootsShown(n.id).length > 0 && kept.has(n.id) && onSome(n.type));
  // AN EMPTY RING IS NOISE (owner, 2026-08-06). A level nothing has reached
  // yet draws a circle around nothing and pushes everything else inward. It
  // comes back by itself the moment the level has a node.
  const levels = asked.filter((r) => r.some((t) => inScope.some((n) => n.type === t)));

  const parentsOf = new Map(inScope.map((n) => [n.id, n.refines]));
  const perWedge = new Map<string, string[][]>();
  for (const p of shown)
    perWedge.set(
      p,
      levels.map(() => []),
    );
  const ringOf = (t: string): number => levels.findIndex((r) => r.includes(t));
  for (const n of inScope) {
    const lv = ringOf(n.type);
    if (lv < 0) continue;
    for (const r of rootsShown(n.id)) perWedge.get(r)?.[lv].push(n.id);
  }

  // The sections are cut AFTER the lanes are known, because each one's share
  // of the turn is its own load.
  const cut = sections(shown, perWedge);
  // HOW MUCH ANGLE A RING MAY USE, and where its middle sits.
  //
  // A SPINE RING OWNS THE WHOLE SECTION. Past the spine the section divides
  // into one slice per subsegment, parted by a hidden separator the width of
  // the gap between two sections — a reader who has learnt that gap should not
  // have to learn a second one.
  //
  // THE SLICES ARE EQUAL, whatever they hold. An empty one keeps its arc, so
  // the test levels land later without moving anything already drawn.
  const slices = Math.max(1, sub.of.length);
  const wedgeArc = (prop: string): number => (cut.get(prop)?.span ?? 0) * SECTION_SLACK;
  const gaps = (prop: string): number => (cut.get(prop)?.span ?? 0) * SPLIT_GAP * (slices - 1);
  const sliceArc = (prop: string): number => Math.max(0, (wedgeArc(prop) - gaps(prop)) / slices);
  /** Which slice a type sits in, counted from the section's left edge. */
  const sliceOf = (t: string): number => sub.of.findIndex((s: Subsegment) => s.levels.includes(t));
  /** The middle of a slice, in absolute angle. */
  const sliceAt = (prop: string, i: number): number => {
    const centre = cut.get(prop)?.centre ?? Math.PI / 2;
    const step = sliceArc(prop) + (cut.get(prop)?.span ?? 0) * SPLIT_GAP;
    return centre - wedgeArc(prop) / 2 + sliceArc(prop) / 2 + i * step;
  };
  const arcAt = (prop: string, k: number): number => ((levels[k] ?? []).some((t) => sliceOf(t) >= 0) ? sliceArc(prop) : wedgeArc(prop));
  const ringPlan = ringRadii(
    shown.map((p) => ({ lanes: perWedge.get(p) ?? [], arcs: levels.map((_, k) => arcAt(p, k)) })),
    levels.length,
  );
  const rings = ringPlan.map((x) => x.r);

  const placed: Placed[] = [];
  const place = new Map<string, number>();
  const byId = new Map(inScope.map((n) => [n.id, n]));
  const at = (prop: string, id: string): string => `${prop}\0${id}`;
  shown.forEach((prop) => {
    const lanes = perWedge.get(prop) ?? [];
    // The first section starts pointing straight DOWN, so a single prop hangs
    // below the vision rather than sitting at an arbitrary angle.
    const centre = cut.get(prop)?.centre ?? Math.PI / 2;
    const half = wedgeArc(prop) / 2;
    // THE SECTION DIVIDES PAST THE SPINE (owner design 2026-08-07).
    //
    // Everything derived FROM the requirements — the functions, and later the
    // architecture and the design elements — takes one slice. What verifies
    // them takes another: test definitions and test results. Two answers to
    // one requirement, going two ways.
    //
    // A SLICE IS HELD, not merely marked. A thin separator was the first
    // attempt and it was worth nothing: at 7% of a wedge nobody could see it,
    // so it signalled nothing to a reader and reserved nothing for the tests.
    // A reservation that cannot be seen is not a reservation.
    //
    // WHAT IT COSTS is paid in RADIUS, not in crowding. A divided ring is
    // sized against the slice it may use, so it simply sits further out — and
    // arc is radius times angle, so the push pays for part of itself.
    const sliceHalf = sliceArc(prop) / 2;
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
      const target = wants(lane, parentsOf, (id) => place.get(at(prop, id)), centre);
      const ordered = [...lane].sort((a, b) => (target.get(a) ?? 0) - (target.get(b) ?? 0));
      // HOW MANY SUB-ORBITS THIS LANE NEEDS. A sparse lane stays on one
      // orbit — staggering it would be noise. A dense one splits across up
      // to three, and neighbours IN ANGLE alternate outward, so same-orbit
      // neighbours always sit the full LABEL_W apart.
      // The orbit count is the ring's own, chosen where the radius was.
      const orbits = ringPlan[k]?.orbits ?? 1;
      // EACH SLICE IS SPREAD ON ITS OWN, inside its own arc. A ring past the
      // spine holds design on one side and tests on the other, and neither
      // may drift into the other's angle.
      //
      // THE BAND CLAMPS, IT DOES NOT RE-CENTRE. A node still WANTS its
      // parent's own angle, and a lone value prop still wants to hang
      // straight down from the vision. What the band changes is where a
      // crowded lane may spill to: within its own slice, never past it.
      //
      // Re-centring instead moved a lone prop 88 units sideways and broke the
      // straight-down rule, which is a promise about the FIRST thing a reader
      // sees.
      //
      // A SPINE RING HAS ONE GROUP, keyed -1, and it takes the whole section.
      const groups = bySlice(ordered, (id) => sliceOf(byId.get(id)?.type ?? ""));
      for (const [s, group] of groups) {
        const [bandAt, bandHalfArc] = s < 0 ? [centre, half] : [sliceAt(prop, s), sliceHalf];
        const angles = spread(
          group.map((id) => target.get(id) ?? bandAt),
          MIN_DIST / orbits / (rings[k] ?? 1),
          bandAt,
          bandHalfArc,
        );
        group.forEach((id, i) => {
          const a = angles[i] ?? centre;
          place.set(at(prop, id), a);
          const n = byId.get(id);
          if (n === undefined) return;
          const r = (rings[k] ?? 0) + orbitOffset(i, orbits);
          placed.push({ ...n, key: at(prop, id), level: k, root: prop, x: Math.cos(a) * r, y: Math.sin(a) * r });
        });
      }
    }
  });

  // A card may leave its ring by one stagger step and no more — the band's
  // outer edge is the ceiling, computed where the ring was.
  relax(
    placed,
    ringPlan.map((p) => p.r + bandHalf(p.orbits)),
  );

  const keys = new Set(placed.map((p) => p.key));
  const edges: { from: string; to: string }[] = [];
  for (const n of placed) {
    // WITHIN THE WEDGE ONLY. A parent under a different value prop is not
    // linked from here: this node is drawn under that prop as well, and the
    // link is drawn there, short and local. That is what removes the lines
    // that used to cross the whole circle.
    for (const p of n.refines) if (keys.has(at(n.root, p))) edges.push({ from: at(n.root, p), to: n.key });
    if ((levels[0] ?? []).includes(n.type)) edges.push({ from: "vision", to: n.key });
  }
  // The relax pass may push past the outermost ring, so the size follows the
  // cards rather than the circles.
  const reach = placed.reduce((m, p) => Math.max(m, Math.hypot(p.x, p.y)), rings[rings.length - 1] ?? RING_GAP);
  // THE BANDS — what a reader sees when the cards are too small to read
  // (owner design 2026-08-07). One arc per section, and one per slice inside
  // it. They ride OUTSIDE the outermost ring so they never collide with a
  // card, and the client fades them against the cards as the zoom changes.
  const divided = levels.some((r) => r.some((t) => sliceOf(t) >= 0));
  const segR = reach + RING_GAP * 0.85;
  const bands = shown.flatMap((prop): TraceBand[] => {
    const c = cut.get(prop)?.centre ?? Math.PI / 2;
    const half = wedgeArc(prop) / 2;
    const w = sliceArc(prop) / 2;
    const seg: TraceBand = { label: propLabel(prop), root: prop, kind: "segment", r: segR, from: c - half, to: c + half };
    if (!divided) return [seg];
    const cuts = sub.of.map(
      (s, i): TraceBand => ({
        label: s.label,
        root: prop,
        kind: "slice",
        r: reach + RING_GAP * 0.35,
        from: sliceAt(prop, i) - w,
        to: sliceAt(prop, i) + w,
      }),
    );
    return [seg, ...cuts];
  });
  // THE SECTORS — the clickable pie of the drawing (owner ruling 2026-08-07).
  //
  // ONE PER SECTION PER RING, so "the ledger's requirements" is a thing a
  // pointer can hit. The label arcs alone were not enough: they named the
  // whole section, and a reader who wants one ring of it had nowhere to aim.
  //
  // A SECTOR SPANS ITS RING'S BAND, from halfway in to the previous ring to
  // halfway out to the next — so the sectors tile the circle with no gaps and
  // no overlaps, and every point belongs to exactly one.
  const edgesOf = (k: number): [number, number] => {
    const r = rings[k] ?? 0;
    const inner = k === 0 ? 0 : ((rings[k - 1] ?? 0) + r) / 2;
    const outer = k === rings.length - 1 ? reach + RING_GAP * 0.15 : (r + (rings[k + 1] ?? r)) / 2;
    return [inner, outer];
  };
  // THE SECTOR RUNS SEPARATOR TO SEPARATOR (owner ruling 2026-08-07). It takes
  // the section's WHOLE angle, not the 86% the cards are allowed.
  //
  // THE 14% IS A MARGIN, NOT A GAP. Cards keep off it so a section does not
  // read as crowded against its neighbour. The sector still owns it, because
  // a reader aiming near a section's edge is aiming at THAT section, and
  // nothing else is there to claim the click.
  //
  // IT ALSO FIXES CARDS LANDING OUTSIDE. A card is 260 wide, so one near the
  // edge overhung a sector that stopped at 86% — and read as a node belonging
  // to nothing. Sector edges and separator lines are now the SAME angles, so
  // what a reader sees is what a click hits.
  const edgeAt = (prop: string, i: number, n: number): number => {
    const c = cut.get(prop)?.centre ?? Math.PI / 2;
    const span = cut.get(prop)?.span ?? 0;
    return c - span / 2 + (span * i) / n;
  };
  const sectors = shown.flatMap((prop): TraceSector[] =>
    levels.flatMap((types, k): TraceSector[] => {
      const [r0, r1] = edgesOf(k);
      // A DIVIDED RING GETS ONE SECTOR PER SLICE, an undivided one a single
      // sector across the whole section.
      const parts = types.some((t) => sliceOf(t) >= 0) ? sub.of.length : 1;
      return Array.from({ length: parts }, (_, i): TraceSector => {
        const mine = parts === 1 ? types : types.filter((t) => sliceOf(t) === i);
        return {
          label: mine.length > 0 ? mine.join(" ") : (sub.of[i]?.label ?? ""),
          root: prop,
          ring: k,
          slice: parts === 1 ? "" : (sub.of[i]?.id ?? ""),
          r0,
          r1,
          from: edgeAt(prop, i, parts),
          to: edgeAt(prop, i + 1, parts),
        };
      });
    }),
  );
  // THE SEPARATORS ARE THE SECTOR EDGES, exactly. One spoke between two
  // sections, running the whole way out. Inside a section, one cut per slice
  // boundary, starting where the division opens.
  const opensAt = levels.findIndex((types) => types.some((t) => sliceOf(t) >= 0));
  const cutFrom = opensAt <= 0 ? 0 : edgesOf(opensAt)[0];
  const spokes = shown.flatMap((prop): TraceSpoke[] => {
    const out = segR + RING_GAP * 0.25;
    const n = sub.of.length;
    const line: TraceSpoke[] = [{ kind: "section", at: edgeAt(prop, n, n), r0: 0, r1: out }];
    if (!divided || n < 2) return line;
    const between = Array.from(
      { length: n - 1 },
      (_, i): TraceSpoke => ({ kind: "slice", at: edgeAt(prop, i + 1, n), r0: cutFrom, r1: out }),
    );
    return [...line, ...between];
  });
  // THE LABELS MUST FIT. A section band's text is the outermost thing drawn,
  // and its glyphs rise off the arc by roughly the font size.
  return { nodes: placed, edges, rings, bands, sectors, spokes, size: segR + FIRST_RING * 0.34 * 1.6 };
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** A SECTION'S NAME, WRITTEN OUT (owner ruling 2026-08-07). The short label
 *  truncates, and truncation is what turned "vendoring" into "ndorin" on the
 *  arc. There is room for the whole thing, so the whole thing is drawn.
 *
 *  The type prefix goes and the dashes become spaces, because the arc is read
 *  by a person rather than matched by a machine. */
function propLabel(id: string): string {
  return id.replace(/^[a-z]+-/, "").replace(/-/g, " ");
}

/** ONE PIECE OF THE PIE, as a closed path: out along one edge, round the
 *  outer arc, back down the other edge, round the inner arc. */
function sectorPath(r0: number, r1: number, from: number, to: number): string {
  const sweep = Math.min(to - from, Math.PI * 2 - 0.02);
  const big = sweep > Math.PI ? 1 : 0;
  const p = (r: number, t: number): string => `${(Math.cos(t) * r).toFixed(1)} ${(Math.sin(t) * r).toFixed(1)}`;
  const a = from;
  const b = from + sweep;
  if (r0 <= 0) return `M 0 0 L ${p(r1, a)} A ${r1.toFixed(1)} ${r1.toFixed(1)} 0 ${big} 1 ${p(r1, b)} Z`;
  return (
    `M ${p(r0, a)} L ${p(r1, a)} A ${r1.toFixed(1)} ${r1.toFixed(1)} 0 ${big} 1 ${p(r1, b)}` +
    ` L ${p(r0, b)} A ${r0.toFixed(1)} ${r0.toFixed(1)} 0 ${big} 0 ${p(r0, a)} Z`
  );
}

/** THE TEXT MUST FIT THE ARC IT RIDES (owner ruling 2026-08-07). A textPath
 *  draws only what fits and silently drops the rest, which is how "vendoring"
 *  arrived on screen as "ndorin".
 *
 *  So the size comes DOWN until the whole word fits. A glyph is about 0.58 of
 *  its font size wide in this face, which is close enough — the answer only
 *  has to be small enough, not exact. */
function fitted(label: string, r: number, sweep: number, want: number): number {
  const arc = Math.abs(r * sweep);
  const need = Math.max(1, label.length) * 0.58;
  return Math.min(want, arc / need);
}

/** ONE ARC, as a path. Drawn BACKWARDS when its middle falls in the lower
 *  half, because text on a path follows the path's direction and would
 *  otherwise hang upside down along the bottom of the circle.
 *
 *  A full turn cannot be one arc command — its start and end are the same
 *  point and nothing is drawn — so a lone section stops a hair short. */
function arcPath(r: number, from: number, to: number): string {
  const sweep = Math.min(to - from, Math.PI * 2 - 0.02);
  const mid = from + sweep / 2;
  const flip = Math.sin(mid) > 0;
  const [a, b, dir] = flip ? [from + sweep, from, 0] : [from, from + sweep, 1];
  const p = (t: number): string => `${(Math.cos(t) * r).toFixed(1)} ${(Math.sin(t) * r).toFixed(1)}`;
  return `M ${p(a)} A ${r.toFixed(1)} ${r.toFixed(1)} 0 ${sweep > Math.PI ? 1 : 0} ${dir} ${p(b)}`;
}

/** THE PIE — one clickable piece per section per ring, each carrying the name
 *  of what it holds. The ground the drawing sits on: a click that misses every
 *  card still lands on one of these. */
function svgSectors(sectors: TraceSector[]): string {
  if (sectors.length === 0) return "";
  const out = ['<g class="trace-sectors">'];
  for (const [i, s] of sectors.entries()) {
    out.push(
      `<path class="trace-sector" d="${sectorPath(s.r0, s.r1, s.from, s.to)}"` +
        ` data-band="${esc(s.root)}" data-ring="${s.ring}" data-slice="${esc(s.slice)}"><title>${esc(`${propLabel(s.root)} · ${s.label}`)}</title></path>`,
    );
    const mid = (s.r0 + s.r1) / 2;
    const size = fitted(s.label, mid, s.to - s.from, FIRST_RING * 0.16);
    // Below this nobody could read it, and an unreadable label is noise on a
    // drawing whose whole point at that zoom is the shape.
    if (size < FIRST_RING * 0.05) continue;
    out.push(
      `<path id="ts-${i}" d="${arcPath(mid, s.from, s.to)}" fill="none"/>`,
      `<text class="trace-ringlabel" font-size="${size.toFixed(0)}"><textPath href="#ts-${i}" startOffset="50%" text-anchor="middle">${esc(s.label)}</textPath></text>`,
    );
  }
  out.push("</g>");
  return out.join("");
}

/** THE CUTS IN THE CAKE, so a reader far out can see where one section ends
 *  even when no label is legible. */
function svgSpokes(spokes: TraceSpoke[]): string {
  if (spokes.length === 0) return "";
  const line = (s: TraceSpoke): string => {
    const x1 = (Math.cos(s.at) * s.r0).toFixed(1);
    const y1 = (Math.sin(s.at) * s.r0).toFixed(1);
    const x2 = (Math.cos(s.at) * s.r1).toFixed(1);
    const y2 = (Math.sin(s.at) * s.r1).toFixed(1);
    return `<line class="trace-spoke ${s.kind}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
  };
  return `<g class="trace-spokes">${spokes.map(line).join("")}</g>`;
}

/** THE NAMES ON THEIR ARCS — the section, and each slice inside it. */
function svgBands(bands: TraceBand[]): string {
  if (bands.length === 0) return "";
  const defs = bands.map((b, i) => `<path id="tb-${i}" d="${arcPath(b.r, b.from, b.to)}" fill="none"/>`).join("");
  const text = bands
    .map((b, i) => {
      const want = FIRST_RING * (b.kind === "segment" ? 0.34 : 0.2);
      return (
        `<text class="trace-band ${b.kind} clickable" data-band="${esc(b.root)}" font-size="${fitted(b.label, b.r, b.to - b.from, want).toFixed(0)}">` +
        `<textPath href="#tb-${i}" startOffset="50%" text-anchor="middle">${esc(b.label)}</textPath></text>`
      );
    })
    .join("");
  return `<defs>${defs}</defs><g class="trace-bands">${text}</g>`;
}

/** The SVG. The centre is (0,0) in a viewBox that grows with the outermost
 *  ring, so the drawing scales instead of clipping. */
export function traceSvg(l: TraceLayout): string {
  const s = l.size;
  const parts = [`<svg class="trace" viewBox="${-s} ${-s} ${s * 2} ${s * 2}" role="img" aria-label="trace graph">`];
  // THE BANDS GO FIRST, so a card always draws over a label rather than under
  // it. At the zoom where the labels matter there are no legible cards, and
  // at the zoom where the cards matter the labels have faded out.
  parts.push(svgSectors(l.sectors), svgSpokes(l.spokes), svgBands(l.bands));
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
