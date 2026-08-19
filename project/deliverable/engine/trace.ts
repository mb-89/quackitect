// The trace graph, drawn radially. see dsp-radial-layout.md#no-layout-library
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
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

/** see dsp-radial-layout.md#the-subsegments */
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
  /** raid-debt-delta-default-views: which record minted this node, so a
   *  $-item resolver can default to it instead of the whole corpus. */
  minted_in?: string;
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

/** One labelled arc per section or slice. see dsp-radial-layout.md#arcs-and-sectors */
export interface TraceBand {
  label: string;
  /** The value prop this arc belongs to — a click target for a zoom-to. */
  root: string;
  kind: "segment" | "slice";
  r: number;
  from: number;
  to: number;
}

/** see dsp-radial-layout.md#one-clickable-piece-of-the-pie */
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

// THE WRITE TRAIL — which trace nodes were touched, and when. A slot on the
// model's mutation signal fills it; the graph blinks a fresh one, then fades
// it. Keyed by node id, which for a trace node is its filename.
const TRAIL = new Map<string, number>();
const TRAIL_MS = 90_000;

/** A slot for the model's mutation signal. Paths outside the trace are ignored. */
export function recordTraceWrites(root: string, paths: string[]): void {
  const at = Date.now();
  const rootAbs = resolve(root);
  for (const p of paths) {
    const eventAbs = resolve(p);
    const rel = relative(rootAbs, eventAbs).replace(/\\/g, "/");
    if (!rel.startsWith("project/spec/trace/") || !rel.endsWith(".md")) continue;
    const id = (rel.split("/").pop() ?? "").replace(/\.md$/, "");
    if (id !== "") TRAIL.set(id, at);
  }
}

/** The still-visible tail of the trail, oldest first. */
export function traceWriteTrail(): { id: string; at: number }[] {
  const now = Date.now();
  const out: { id: string; at: number }[] = [];
  for (const [id, at] of TRAIL) {
    if (now - at > TRAIL_MS) TRAIL.delete(id);
    else out.push({ id, at });
  }
  return out.sort((a, b) => a.at - b.at);
}

/** see dsp-radial-layout.md#a-typed-node-names-its-own-template */
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
  /** see dsp-radial-layout.md#mechanical-checks-the-template-declares */
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

/** see dsp-the-outside-boundaries-and-their-bounds.md#does-this-node-keep-its-types-promises */
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
  out.push(...outsideBoundaryProblems(tpl, node, note.frontmatter));
  return out;
}

/** see dsp-the-outside-boundaries-and-their-bounds.md#an-outside-boundary-states-its-own-bound */
function outsideBoundaryProblems(tpl: ItemTemplate, node: TraceNode, fm: Record<string, unknown>): string[] {
  if (tpl.id_prefix !== "if-") return [];
  const ends = [String(fm.source ?? ""), String(fm.destination ?? "")];
  if (!ends.some((e) => e.startsWith("nbr-"))) return [];
  if (String(fm.bound ?? "").trim() !== "") return [];
  return [
    `${node.id}: an outside boundary states its OWN bound — one second, an argued reason it cannot be, or none where nothing is served across it. It may not inherit.`,
  ];
}

/** see dsp-trace-corpus.md#every-trace-node-the-product-declares */
const CORPUS = new Map<string, { stamp: string; nodes: TraceNode[]; epoch: number }>();

/** see dsp-the-outside-boundaries-and-their-bounds.md#how-many-times-the-corpus-was-asked-for */
let CORPUS_ASKS = 0;

/** The corpus's own meter: how many times it has been asked for. */
export function corpusAsks(): number {
  return CORPUS_ASKS;
}

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

/** see dsp-trace-corpus.md#the-corpuss-version */
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
  CORPUS_ASKS += 1;
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
      // see dsp-radial-layout.md#the-upward-edge-has-one-slot-and-several-names
      refines: [...asList(fm.refines), ...asList(fm.satisfies), ...asList(fm.implements), ...asList(fm.verifies), ...asList(fm.realizes)],
      hay: pairs,
      file,
      ...(typeof fm.minted_in === "string" && fm.minted_in.trim() !== "" ? { minted_in: fm.minted_in.trim() } : {}),
    });
  }
  CORPUS.set(root, { stamp, nodes: out, epoch: era });
  return out.slice();
}

/** see dsp-the-outside-boundaries-and-their-bounds.md#the-vision-has-no-node-of-its-own-yet */
export function visionText(root: string): string {
  const roots = [join(root, "project", "spec", "iterations")];
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

/** see dsp-radial-layout.md#no-layout-library */

/** see dsp-radial-layout.md#re-origin */
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

/** see dsp-radial-layout.md#every-wedge-a-node-belongs-to */
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

/** Push apart only as much as needed, and clamp twice. see dsp-radial-layout.md#outward-means-outward */
export function spread(targets: number[], want: number, centre: number, half: number): number[] {
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

/** see dsp-radial-layout.md#one-written-reference */
export function refId(written: string): string {
  const bare = written.trim().replace(/^\[\[/, "").replace(/\]\]$/, "").trim();
  // A wiki link may carry a display half: [[id|what it says]].
  const target = (bare.split("|")[0] ?? "").trim();
  const last = target.replace(/\\/g, "/").split("/").filter(Boolean).pop() ?? "";
  return last.replace(/\.md$/i, "").trim();
}

/** see dsp-the-outside-boundaries-and-their-bounds.md#does-this-reduce-to-something-shaped-like-a-trace */
export function looksLikeId(id: string): boolean {
  return /^[a-z][a-z0-9]*-[a-z0-9.-]+$/i.test(id);
}

/** THE REFERENCES A FIELD CARRIES. frame-delta's evidence is a list of value
 *  props BY ID, never their prose — the artifact is the truth and the form
 *  points at it. Every shape refId accepts resolves; see it for the list. */
export function refsIn(text: string): string[] {
  const out: string[] = [];
  for (const line of text.split(/\r?\n/)) {
    // see dsp-radial-layout.md#a-list-line-is-dash-led-or-numbered
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

/** see dsp-radial-layout.md#the-references-a-table-row-carries */
export function refsInRows(text: string, columns = 2): string[] {
  const out: string[] = [];
  const lines = text.split(/\r?\n/);
  // A HEADER ROW NAMES COLUMNS, NEVER NODES. Its first cell is the row's TYPE,
  // and a type name carrying a dash is shaped exactly like an id — so a bound
  // table over `test-spec` reported its own header as a reference resolving to
  // nothing. The rule row underneath is what tells a header from a data row.
  const isRule = (l: string | undefined): boolean => l !== undefined && /^\s*\|(?:\s*:?-{3,}:?\s*\|)+\s*$/.test(l);
  for (const [i, line] of lines.entries()) {
    if (!/^\s*\|/.test(line)) continue;
    if (isRule(lines[i + 1])) continue;
    const cells = line.split("|").slice(1, -1);
    for (const cell of cells.slice(0, columns)) {
      const id = refId(cell.trim());
      if (looksLikeId(id)) out.push(id);
    }
  }
  return out;
}
