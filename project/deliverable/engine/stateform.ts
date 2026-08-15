// THE STATE FORM (owner rulings 2026-08-04): every state derives its
// evidence form from markdown — the A3 shape (machines/forms/a3.md), the
// state's own note or matrix row, and the generated reading list. The
// engine DERIVES; the markdown DECIDES. Instances are multi-pass and
// stored; every form is a CLAIM until its gate passes it. The portable
// copy is one HTML with ONE JSON island — the island is the only thing
// the save rewrites and the only thing the ingest reads (the v1 book's
// comment law, reapplied).
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { type ExposureView, exposureView, type MetricRow, type ScenarioDeckView, scenarioDeckView, structureMetrics } from "./atamwalk.ts";
import { catalogItems, trizParameterItems } from "./catalogs.ts";
import { type Judgment, type RelationKind, type WalkResult, walk } from "./compare.ts";
import { clusterDsm, type Dsm, flowMatrix } from "./dsm.ts";
import { type ElementMatrixView, elementMatrixView } from "./elematrix.ts";
import type { FormTemplate } from "./forms.ts";
import { pendingNotes } from "./inbox.ts";
import { blockingRules, lintProse } from "./lint.ts";
import type { EvidenceField, MachineDecl, StateDecl } from "./machine.ts";
import { bare, type MorphBox, type MorphCell, type MorphLine, type MorphRow, orderLines, storedOrder } from "./morphbox.ts";
import { noteOf, parseStateNote, readNode, section } from "./notes.ts";
import { type ParetoView, pareto, readScores } from "./pareto.ts";
import { seDir } from "./paths.ts";
import { type PughView, pughView, type SensitivityView, sensitivityView } from "./pugh.ts";
import { type GuidanceDoc, pulledFor } from "./pull.ts";
import {
  conformance,
  duplicateIds,
  itemTemplate,
  itemTemplateRel,
  loadTrace,
  nodeLines,
  refsIn,
  refsInRows,
  type TraceNode,
  traceDir,
} from "./trace.ts";
import { edgeProblems, traceSchema } from "./traceschema.ts";

export interface A3Box {
  heading: string;
  source: string;
  fill: boolean;
  help: string;
}

/** The sheet shape, read live from its markdown. */
export function readA3(root: string): A3Box[] {
  const raw = readFileSync(join(root, "project", "deliverable", "machines", "forms", "a3.md"), "utf8");
  const text = section(parseStateNote(raw).body, "Boxes");
  const boxes: A3Box[] = [];
  for (const line of text.split("\n")) {
    const m = line.trim().match(/^- (.+?) \| (.+?) \| (.*?) \| (.+)$/);
    if (m !== null) boxes.push({ heading: m[1], source: m[2], fill: m[3].trim() === "fill", help: m[4] });
  }
  return boxes;
}

export interface FormInput {
  label: string;
  description: string;
  /** A read input names its document; a do input names none. */
  path?: string;
  /** Owed BEFORE the state is entered (the method read). */
  entry: boolean;
}

export interface StateFormModel {
  form: string;
  title: string;
  header: Record<string, string>;
  description: string;
  motivation: string;
  follow_up_label: string;
  inputs: FormInput[];
  boxes: A3Box[];
  /** Per template name: its editor and its mechanical checks. */
  template_meta: Record<string, TemplateMeta>;
  /** Per field name: the arguments the form hands its template. */
  field_args: Record<string, FieldArgs>;
  /** Field name -> the resolved placeholder, mechanics line and item-template
   *  link. Derived, never authored. */
  field_hints: Record<string, FieldHint>;
  /** The lint template over the fill sections, in sheet order. */
  template: FormTemplate;
  /** Field name -> its template name (free-form unless declared). */
  field_templates: Record<string, string>;
}

export function fieldTemplateRel(name: string): string {
  return `project/deliverable/machines/forms/templates/${name}.md`;
}

/** A template's MECHANICS, from its frontmatter. Templates stay GENERIC
 *  (owner ruling 2026-08-04): the editor shape and the line grammar live
 *  here; the concrete options and items are the FIELD's arguments. */
export interface TemplateMeta {
  editor: string;
  line_pattern: string;
  line_help: string;
  /** What the editor's empty box says — the hint AT the point of typing.
   *  May carry {type} and {prefix}; see expandHint. */
  placeholder: string;
  /** The template's OWN description of the mechanics, written once here so
   *  no field repeats it. May carry {type} and {prefix} too. */
  description: string;
  /** Set where the lines are REFERENCES to standing artifacts rather than
   *  free text. The editor shape is shared with an ordinary list, so the
   *  template declares the meaning and the check reads the declaration. */
  resolves?: string;
}

/** The field's arguments to its template — declared in the form's own
 *  markdown, resolved live where a source is named ($inbox). */
export interface FieldArgs {
  options: string[];
  /** Which item type a reference field accepts. Empty means any typed node. */
  of: string;
  /** Which item type this field must COVER: every reference refines one, and
   *  every standing one is refined by a reference. Empty means no such duty. */
  covers: string;
  items: string[];
  passing: string[];
  /** For `node-table`, the FRONTMATTER KEYS that become the editable columns.
   *  For `table`, the plain column headings. */
  columns: string[];
  /** Which choices owe a reason. Empty means all of them. */
  rationale_for: string[];
  /** What to type in each column, in the column order. Empty means the
   *  column names have to carry it alone, which they rarely can. */
  column_help: string[];
  /** Column name to the RESOLVED options its cells are constrained to. A
   *  named column offers a list rather than a text box, because a judgment
   *  naming something outside the source is arithmetic over a typo.
   *
   *  THE PICK SOURCE IS NOT THE ROW SOURCE, and that is the whole reason this
   *  resolves separately. A compounding table lists the flagged SUSPECTS and
   *  lets each of them merge with any pool member. */
  picks: Record<string, string[]>;
  /** WHICH PICKED COLUMNS ARE STILL OPEN. Everything else is a CLOSED
   *  chooser, because that is what a known set means. */
  pick_free: string[];
  /** WHAT EACH PICKED COLUMN'S OFFER IS CALLED, unresolved.
   *
   *  AN EMPTY OFFER MUST SAY SO. `$clusters` before partition-functions has
   *  run resolves to nothing, and a chooser with nothing in it looks exactly
   *  like a text box — which is how a wired-up column got reported as free
   *  text (owner, 2026-08-08). The editor names the source in that case. */
  pick_sources: Record<string, string[]>;
  /** Rows per page. 0 means all of them, which is right for a short field
   *  and wrong for one over a live register. */
  page_size: number;
  /** WHERE A LIST CELL'S FILE HALF LIVES. An entry in the address grammar
   *  (`file :: case`) links its file, joined to this base. Empty means no
   *  link. */
  link_base: string;
  /** A comparison card's relation — `order` or `equivalence`. Empty for
   *  every other field. */
  relation: string;
  /** The frontmatter key a card's answers land in. */
  writes: string;
  /** The optional second key, where the card also wants a sentence. */
  reason: string;
  /** A comparison card's NEXT QUESTION, computed from the nodes on every
   *  look. Null for every other field.
   *
   *  THE CARD STORES NO POSITION. Every answer is already in frontmatter, so
   *  the walk is rebuilt from the register each time, and a person who stops
   *  at pair nine of sixty resumes exactly there. */
  walk: WalkResult | null;
  /** A matrix field's DSM, computed from the nodes on every look. Null for
   *  every other field.
   *
   *  THE PICTURE IS DERIVED, NEVER STORED. Edges come from the flows and
   *  placements from the function notes, so there is no second copy of the
   *  structure to drift from the one people edit. */
  dsm: Dsm | null;
  /** A morphological chart's rows, cells and lines, computed from the nodes
   *  on every look. Null for every other field.
   *
   *  SAME LAW AS THE DSM, and for the same reason. The clusters are the rows,
   *  the options are the cells, the candidates are the lines. A stored grid
   *  would be a second copy of all three. */
  box: MorphBox | null;
  /** The Pareto front, its eliminations and its two corners, computed from
   *  the field this one `reads`. Null for every other field.
   *
   *  SAME LAW AGAIN. Domination is arithmetic over the scores, so a typed
   *  front is a second copy that can disagree with the table above it. */
  pareto: ParetoView | null;
  /** The Pugh convergence runs, computed from the sibling evaluate-set
   *  scores and cut-criteria's signed order. Null for every other field. */
  matrix: PughView | null;
  /** The winner's fragile cells, computed the same way. The rulings on them
   *  are the state's judgment and live in its own fields. */
  sensitivity: SensitivityView | null;
  /** The element matrix — owed cells from flow crossings, declared
   *  interfaces beside them. Computed from the trace nodes on every look. */
  ematrix: ElementMatrixView | null;
  /** The scenario deck — ATAM's judged half: one card per quality
   *  requirement, worst grade first, with its computed path. */
  scenario: ScenarioDeckView | null;
  /** The structure numbers — the evaluation's computed half. */
  smetrics: MetricRow[] | null;
  /** The register's exposure chart — damage against likelihood, every
   *  standing entry a dot. The spike pick is made looking at it. */
  exposure: ExposureView | null;
}

export function templateMeta(root: string, name: string): TemplateMeta {
  try {
    // THROUGH THE DOOR: read once, parsed once, shared with every other reader
    // of the same template. This was 125 reads and 58 ms to enter one record.
    const fm = (noteOf(join(root, fieldTemplateRel(name))) ?? parseStateNote("")).frontmatter;
    return {
      editor: typeof fm.editor === "string" ? fm.editor : "text",
      line_pattern: typeof fm.line_pattern === "string" ? fm.line_pattern : "",
      line_help: typeof fm.line_help === "string" ? fm.line_help : "",
      placeholder: typeof fm.placeholder === "string" ? fm.placeholder : "",
      description: typeof fm.description === "string" ? fm.description : "",
      ...(typeof fm.resolves === "string" ? { resolves: fm.resolves } : {}),
    };
  } catch {
    return { editor: "text", line_pattern: "", line_help: "", placeholder: "", description: "" };
  }
}

/** WHAT THE EDITOR DRAWS FOR ONE FIELD, resolved once and server-side.
 *
 *  A template is generic by law, so it cannot name the type its fields will
 *  accept. It writes {type} and {prefix} instead, and this expands them from
 *  the FIELD's own `of:`. The alternative was every field copying the text,
 *  which is exactly how a neighbours field came to prompt for a value prop.
 *
 *  Both renders read the resolved strings, so the mirror and the portable
 *  copy cannot drift apart. */
export interface FieldHint {
  /** The empty row's hint, with the type's real id prefix in it. */
  placeholder: string;
  /** The template's mechanics line, resolved. The field's own description
   *  sits ABOVE this one; it never replaces it. */
  description: string;
  /** Root-relative path to the item template `of:` names, so the reader is
   *  one click from the rules for what they must type. Empty without `of:`. */
  of_template: string;
  /** The type itself, for the link's label. */
  of: string;
}

/** {type}, {prefix} and {folder} filled from the field's declared type.
 *
 *  {folder} is what makes the placeholder TEACH. Showing
 *  `project/spec/trace/neighbour/nbr-something.md` says root-relative path
 *  without a sentence about it — and the id inside it says an id is fine too.
 *
 *  IT ALWAYS STARTS `project/` (owner, 2026-08-06). That first segment is the
 *  whole reason the placeholder works: it tells the reader where the path is
 *  measured from. A folder is root-relative already, so it carries it; the
 *  fallback for a type with no folder declared carries it too. */
export function expandHint(root: string, text: string, of: string): string {
  if (text === "") return "";
  const tpl = of === "" ? undefined : itemTemplate(root, of);
  return text
    .replace(/\{type\}/g, of === "" ? "artifact" : of)
    .replace(/\{prefix\}/g, tpl?.id_prefix ?? "")
    .replace(/\{folder\}/g, tpl?.folder === undefined || tpl.folder === "" ? "project/spec/trace" : tpl.folder);
}

export function fieldHint(root: string, meta: TemplateMeta | undefined, of: string): FieldHint {
  return {
    placeholder: expandHint(root, meta?.placeholder ?? "", of),
    description: expandHint(root, meta?.description ?? "", of),
    of_template: of === "" || itemTemplate(root, of) === undefined ? "" : itemTemplateRel(of),
    of,
  };
}

const escapeRe = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, (c) => `\\${c}`);

/** A field with nothing declared. Exported so a test can spread it rather
 *  than restate fifteen keys it does not care about. */
export const NO_ARGS: FieldArgs = {
  of: "",
  covers: "",
  options: [],
  items: [],
  passing: [],
  columns: [],
  picks: {},
  pick_free: [],
  pick_sources: {},
  page_size: 0,
  link_base: "",
  relation: "",
  writes: "",
  reason: "",
  rationale_for: [],
  column_help: [],
  walk: null,
  dsm: null,
  box: null,
  pareto: null,
  matrix: null,
  sensitivity: null,
  ematrix: null,
  scenario: null,
  smetrics: null,
  exposure: null,
};

/** THE CHART, computed from the nodes. Rows are the clusters, cells are the
 *  options serving them, lines are the candidates.
 *
 *  IT IS DERIVED, so there is no table to fill and no second copy to drift.
 *  Every option already carries the cluster it serves; before 2026-08-08 the
 *  state kept a flat table repeating that, and the owner asked why the chart
 *  was not simply built.
 *
 *  THE READING LIVES HERE AND THE SHAPE LIVES IN morphbox.ts, which knows
 *  nothing about this repository — that split is what keeps the editor
 *  liftable into another product later. */
export function fieldBox(f: EvidenceField, traceRoot: string, stored: string): MorphBox | null {
  if (f.template !== "morph-box") return null;
  try {
    const nodes = loadTrace(traceRoot).filter((n) => n.file !== undefined);
    const at = (n: (typeof nodes)[number], key: string): string => nodeField(n.file as string, key);
    const rows: MorphRow[] = nodes
      .filter((n) => n.type === "cluster")
      .map((n) => ({ id: n.id, name: at(n, "name") === "" ? n.id : at(n, "name"), cells: [] as MorphCell[] }))
      .sort((a, b) => a.id.localeCompare(b.id));
    const byCluster = new Map(rows.map((r) => [r.id, r]));
    // AN OPTION NAMING NO CLUSTER IS NOT DROPPED. It lands in an unplaced row
    // so the chart shows it — a search whose result vanishes is worse than an
    // untidy chart.
    const unplaced: MorphRow = { id: "", name: "unplaced", cells: [] };
    // A DECISION ROW BEATS A CLUSTER ROW (owner ruling 2026-08-11): an option
    // naming its design question lands in that question's row, so a scoped
    // iteration's choices stand apart instead of lumping into one cluster.
    const byQuestion = new Map<string, MorphRow>();
    for (const n of nodes.filter((x) => x.type === "option").sort((a, b) => a.id.localeCompare(b.id))) {
      const cell: MorphCell = {
        id: n.id,
        label: n.statement === "" ? n.id : n.statement,
        found_by: at(n, "found_by"),
        pruned: at(n, "pruned_because"),
      };
      const q = at(n, "question").trim();
      if (q !== "") {
        const r = byQuestion.get(q) ?? { id: q, name: q, cells: [] as MorphCell[] };
        r.cells.push(cell);
        byQuestion.set(q, r);
        continue;
      }
      (byCluster.get(bare(at(n, "cluster"))) ?? unplaced).cells.push(cell);
    }
    // THE BOX IS THE CURRENT SOLUTION'S, never the whole product's (owner
    // ruling 2026-08-11): once any question row exists, the cluster rows -
    // the resident corpus - leave the chart entirely.
    const questionRows = [...byQuestion.values()].sort((a, b) => a.id.localeCompare(b.id));
    if (questionRows.length > 0) rows.length = 0;
    rows.push(...questionRows);
    if (unplaced.cells.length > 0) rows.push(unplaced);
    const cands: MorphLine[] = nodes
      .filter((n) => n.type === "candidate")
      .map((n) => ({
        id: n.id,
        name: at(n, "name") === "" ? n.id : at(n, "name"),
        statement: n.statement,
        picks: nodeList(n.file as string, "picks").map(bare),
      }));
    return { rows, lines: orderLines(cands, storedOrder(stored)) };
  } catch {
    return null;
  }
}

/** THE MATRIX, computed from the nodes. Edges come from the flows: one
 *  function's output is another's input.
 *
 *  PLACEMENTS ALREADY MADE BY HAND GO IN AS FIXED, so the search groups
 *  around them rather than overruling them. */
function fieldDsm(f: EvidenceField, traceRoot: string, items: string[]): Dsm | null {
  if (f.template !== "dsm") return null;
  try {
    const byId = new Map<string, string>();
    for (const n of loadTrace(traceRoot)) if (n.file !== undefined) byId.set(n.id, n.file);
    const nodes = items
      .filter((id) => byId.has(id))
      .map((id) => ({
        id,
        inputs: nodeList(byId.get(id) as string, "inputs"),
        outputs: nodeList(byId.get(id) as string, "outputs"),
      }));
    const fixed: Record<string, string> = {};
    for (const n of nodes) {
      const c = nodeField(byId.get(n.id) as string, f.writes ?? "cluster");
      if (c !== "" && !c.startsWith("<!--")) fixed[n.id] = c;
    }
    const m = flowMatrix(nodes);
    const d = clusterDsm(
      nodes.map((n) => n.id),
      m.edges,
      fixed,
    );
    // THE CELL IS A SET, so the flows behind each mark ride along. Clicking a
    // cell should show what the mark is made of, not just that it exists.
    return { ...d, via: m.via };
  } catch {
    return null;
  }
}

/** THE ANSWERS ARE ON THE NODES, so a card's next question is derived and
 *  never stored. One frontmatter line per answered pair, shaped `<id>
 *  <verdict>`, with anything after it a reason for a reader.
 *
 *  A VERDICT OUTSIDE THE FOUR IS SKIPPED rather than guessed at. A cell still
 *  holding its minted comment is not an answer, and reading it as one is how
 *  a field silently fills. */
function cardWalk(f: EvidenceField, traceRoot: string, items: string[]): WalkResult | null {
  if (f.template !== "compare-card" || f.writes === undefined) return null;
  const kind: RelationKind = f.relation === "equivalence" ? "equivalence" : "order";
  const files = new Map<string, string>();
  try {
    for (const n of loadTrace(traceRoot)) if (n.file !== undefined) files.set(n.id, n.file);
  } catch {
    return null;
  }
  const known = new Set(items);
  const js: Judgment[] = [];
  for (const id of items) {
    const file = files.get(id);
    if (file === undefined) continue;
    for (const raw of nodeList(file, f.writes)) {
      const parts = raw.split(/\s+/);
      const other = parts[0];
      const verdict = parts[1];
      if (!known.has(other)) continue;
      if (verdict === ">" || verdict === "<" || verdict === "=") js.push({ a: id, b: other, verdict });
      // `!` says NOT THE SAME on an equivalence card. It settles the pair
      // without joining the two, which is exactly what the order relation
      // does with a strict verdict, so it rides in as one.
      else if (verdict === "!") js.push({ a: id, b: other, verdict: ">" });
    }
  }
  const pairs = kind === "equivalence" ? compoundingSuspectPairs(traceRoot).filter(([a, b]) => known.has(a) && known.has(b)) : undefined;
  return walk(items, js, kind, pairs);
}

/** ONE SOURCE RESOLVER, so a `$name` means the same thing wherever it is
 *  written. Items and picks both come through here; a literal passes
 *  straight out, which is what makes a fixed list legal beside a live one. */
function resolveSource(i: string, root: string, traceRoot: string, instanceRaw?: string): string[] {
  if (i === "$inbox") return inboxItems(root, instanceRaw);
  if (i === "$assumptions") return assumptionItems(traceRoot);
  if (i === "$criterion_pool") return criterionPoolItems(traceRoot);
  if (i === "$compounding_suspects") return compoundingSuspectItems(traceRoot);
  if (i === "$criterion_axes") return criterionAxisItems(traceRoot);
  if (i === "$functions") return functionItems(traceRoot);
  if (i === "$clusters") return clusterItems(traceRoot);
  if (i === "$flows") return flowItems(traceRoot);
  if (i === "$options") return optionItems(traceRoot);
  if (i === "$experiments") return typedItems(traceRoot, "experiment");
  if (i === "$requirements") return typedItems(traceRoot, "requirement");
  if (i === "$test-specs") return typedItems(traceRoot, "test-spec");
  if (i === "$design-specs") return typedItems(traceRoot, "design-spec");
  if (i === "$promotions") return promotionItems(traceRoot);
  if (i === "$claim-specs") return claimSpecItems(traceRoot);
  if (i === "$iq_checklist") return catalogItems(root, "iq_checklist");
  if (i === "$sweep_surfaces") return catalogItems(root, "sweep_surfaces");
  if (i === "$value-props") return typedItems(traceRoot, "value-prop");
  if (i === "$must-stories") return mustStoryItems(traceRoot);
  if (i === "$candidates") return candidateItems(traceRoot);
  // THE CATALOGUES. A known set is never typed from memory and never hard
  // coded — it is read from the method card that holds it, so editing the card
  // edits the offer (owner ruling 2026-08-08). catalogs.ts says how.
  if (i === "$heuristics") return catalogItems(root, "heuristics");
  if (i === "$transform_operators") return catalogItems(root, "transform_operators");
  if (i === "$triz_separations") return catalogItems(root, "triz_separations");
  if (i === "$triz_parameters") return trizParameterItems(root);
  // A `$name` NOBODY RESOLVES IS A TYPO, and the silent version of this bug is
  // the worst kind: the field renders, the datalist is empty, and the form
  // looks like it simply has no offer. `$` is reserved for live sources, so a
  // literal can never legitimately start with one.
  if (i.startsWith("$")) throw new Error(`no item source named ${i} — see resolveSource in stateform.ts for the ones there are`);
  return [i];
}

/** The cells of one markdown table row, outer pipes dropped. A line that is
 *  not a row — the header rule, a blank, prose — yields nothing, so callers
 *  filter by whether the first cell names anything rather than by position. */
export function tableRow(line: string): string[] {
  const t = line.trim();
  if (!t.startsWith("|")) return [];
  const cells = t
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split(/(?<!\\)\|/)
    .map((c) => c.trim());
  return cells.every((c) => /^-{3,}$/.test(c)) ? [] : cells;
}

/** The choice half of a `<option> — <rationale>` line. */
export function choiceOf(content: string): string {
  const first = (content.split("\n")[0] ?? "").trim();
  const i = first.indexOf(" — ");
  return i < 0 ? first : first.slice(0, i).trim();
}

/** THE CHOSEN OPTION, read by the same extractor that validated the pick.
 *
 *  The field is `<choice> — <why>`, and the why is prose which may perfectly
 *  reasonably name another option. So the answer comes from the CHOICE half,
 *  and nothing is inferred from the sentence beside it.
 *
 *  TWO PARSERS FOR ONE FACT, AND THEY DISAGREED. The kickoff's pin used to
 *  scan the whole field for any column name in declaration order. `patch`
 *  came first, so a rationale ending "a new line is not a patch" pinned an
 *  iteration blessed as MINOR to the patch column — eleven approved states
 *  struck, and a build skipped, because a patch seeds no chunks.
 *
 *  Pinned by tests/change-size.test.ts, including that exact sentence. */
export function chosenOption(content: string, options: readonly string[]): string | undefined {
  const choice = choiceOf(content).toLowerCase();
  return options.find((o) => o === choice);
}

/** The rationale half, or "" where the line carries none. */
export function rationaleOf(content: string): string {
  const first = (content.split("\n")[0] ?? "").trim();
  const i = first.indexOf(" — ");
  return i < 0 ? "" : first.slice(i + 3).trim();
}

/** The template checks over the fills — same verdicts for both hands and
 *  both renders. Emptiness stays the required-check's job. */
export function templateProblems(model: StateFormModel, fills: Record<string, string>, root?: string): string[] {
  const out: string[] = [];
  // The corpus is read ONCE per check, not once per field.
  const corpus = root === undefined ? undefined : loadTrace(root);
  // AN ID THAT RESOLVES TWO WAYS RESOLVES NEITHER. This fires wherever a form
  // is checked, which is where an imported fill lands — the collision an
  // author cannot see coming, because the file it collides with is not open.
  for (const d of corpus === undefined ? [] : duplicateIds(corpus)) {
    out.push(`the trace corpus declares ${d.id} ${d.count} times — an id is an address, and two files cannot share one`);
  }
  for (const f of model.template.fields) {
    const meta = model.template_meta[model.field_templates[f.name] ?? "free-form"];
    if (meta === undefined) continue;
    const content = (fills[f.name] ?? "").trim();
    if (content === "") continue;
    out.push(...fieldProblems(f.name, meta, model.field_args[f.name] ?? NO_ARGS, content, corpus, root));
  }
  return out;
}

/** The owed claims a checklist field is carrying — item plus the register
 *  ref it is addressed to. Only VALID owed lines are reported: an
 *  unresolved ref already surfaces as a problem, so it is never silently
 *  folded into the same count as a genuine debt. */
export function checklistOwed(items: string[], content: string, corpus?: TraceNode[]): { item: string; ref: string }[] {
  const lines = new Set(content.split("\n").map((l) => l.trim()));
  const out: { item: string; ref: string }[] = [];
  for (const i of items) {
    const st = checklistItemStatus(i, lines, corpus);
    if (st.kind === "owed") out.push({ item: i, ref: st.ref });
  }
  return out;
}

/** Every checklist field's owed claims across a whole form — what a state's
 *  verdict and a gate's record both carry, so a debt behind a `submit:
 *  true` stays visible to whoever reads the result. */
export function templateOwed(
  model: StateFormModel,
  fills: Record<string, string>,
  root?: string,
): { field: string; item: string; ref: string }[] {
  const corpus = root === undefined ? undefined : loadTrace(root);
  const out: { field: string; item: string; ref: string }[] = [];
  for (const f of model.template.fields) {
    const meta = model.template_meta[model.field_templates[f.name] ?? "free-form"];
    if (meta === undefined || meta.editor !== "checklist") continue;
    const content = (fills[f.name] ?? "").trim();
    if (content === "") continue;
    const args = model.field_args[f.name] ?? NO_ARGS;
    out.push(...checklistOwed(args.items, content, corpus).map((o) => ({ field: f.name, ...o })));
  }
  return out;
}

/** THE REFERENCES MUST BE OF THE TYPE THE FIELD ASKED FOR. `of: value-prop`
 *  names an item template, and every referenced node must declare that same
 *  type. Without it a field asking for value props accepts a stakeholder, and
 *  the gate that follows the reference reviews the wrong kind of thing.
 *
 *  A type naming no item template is the ROW author's mistake, and it is
 *  reported here because here is where it first becomes visible. */
function typeProblems(name: string, of: string, refs: string[], byId: Map<string, TraceNode>, root?: string): string[] {
  const out: string[] = [];
  if (of !== "" && root !== undefined && !existsSync(join(root, itemTemplateRel(of)))) {
    out.push(`${name}: asks for ${of}, and no item template exists at ${itemTemplateRel(of)}`);
  }
  const wrong = of === "" ? [] : refs.filter((r) => byId.has(r) && byId.get(r)?.type !== of);
  if (wrong.length > 0) {
    out.push(`${name}: every reference is a ${of} — ${wrong.map((r) => `${r} is ${byId.get(r)?.type ?? "untyped"}`).join(" · ")}`);
  }
  // AND THE ARTIFACT MUST ANSWER ITS OWN TEMPLATE. Resolving and being the
  // right type still leaves the third way a reference lies: the file exists,
  // carries the right type, and is a skeleton. The gate would follow it and
  // review a hole.
  if (root !== undefined) {
    for (const r of refs) {
      const n = byId.get(r);
      if (n !== undefined) out.push(...conformance(root, n).map((p) => `${name}: ${p}`));
    }
  }
  return out;
}

/** DOES A STANDING CLAIM STILL PASS ITS OWN FORM?
 *
 *  The checks run when a form is saved and when it is submitted. Nothing ever
 *  re-ran them over evidence already on disk. So a claim signed under an older
 *  form kept its stamp and its green while answering a question the form had
 *  since stopped asking — and because it looked green, nobody was asked to
 *  answer the new one.
 *
 *  Same checks, run against what is stored. Empty fields stay the
 *  required-check's business, here as everywhere. */
/** THE CORPUS IS THE CALLER'S TO LOAD, and it is not optional (owner ruling
 *  2026-08-07). It used to default to `corpus ?? loadTrace(root)`, which made
 *  an expensive call look free at the call site — and recordDone duly called
 *  it once per state, reloading roughly 250 files about fifteen times per
 *  paint. That was enough to hang the engine once the route started calling
 *  recordDone on every packet.
 *
 *  THE DEEPER REASON IS CONSISTENCY, not speed. Read the input, process it,
 *  produce the output. A corpus re-read between two states means those two
 *  states were judged against different worlds, and nothing would report the
 *  difference. One load per call is the only way the answer is coherent.
 *
 *  Required, so the cost is always visible where it is paid. */
export function claimProblems(root: string, s: StateDecl, body: string, corpus: TraceNode[]): string[] {
  const nodes = corpus;
  const metas = new Map<string, TemplateMeta>();
  const out: string[] = [];
  for (const f of s.evidence_form) {
    const content = section(body, f.name).trim();
    if (content === "") continue;
    const name = f.template ?? "free-form";
    if (!metas.has(name)) metas.set(name, templateMeta(root, name));
    const args: FieldArgs = {
      of: f.of ?? "",
      covers: f.covers ?? "",
      options: f.options ?? [],
      rationale_for: f.rationale_for ?? [],
      column_help: f.column_help ?? [],
      // A LIVE-RESOLVING ARGUMENT CANNOT BE RE-CHECKED. `$inbox` expands to the
      // notes pending RIGHT NOW; a retro answered the notes pending when it was
      // walked, and that list is gone. Re-checking against today's inbox marks
      // every retro suspect the moment any note arrives, forever.
      items: (f.items ?? []).filter((i) => !i.startsWith("$")),
      passing: f.passing ?? [],
      columns: f.columns ?? [],
      // A LIVE SOURCE CANNOT BE RE-CHECKED, for the same reason the items
      // above drop theirs: the offer today is not the offer that was signed.
      picks: {},
      pick_free: f.pick_free ?? [],
      pick_sources: {},
      page_size: f.page_size ?? 0,
      link_base: f.link_base ?? "",
      relation: f.relation ?? "",
      writes: f.writes ?? "",
      reason: f.reason ?? "",
      // THE CHECK NEVER RE-WALKS, RE-CLUSTERS OR REBUILDS THE CHART. All
      // three are live, and deriving them here would mark a signed form the
      // moment somebody adds an item.
      walk: null,
      dsm: null,
      scenario: null,
      smetrics: null,
      exposure: null,
      box: null,
      pareto: null,
      matrix: null,
      sensitivity: null,
      ematrix: null,
    };
    out.push(...fieldProblems(f.name, metas.get(name) as TemplateMeta, args, content, nodes, root));
  }
  // THE STRUCTURAL LAWS run whether or not the field carries text — a
  // computed field's section can be empty while the law is broken.
  for (const f of s.evidence_form) {
    if (f.template === "element-matrix") out.push(...structureLawProblems(f.name, nodes));
    if (f.template === "scenario-deck") out.push(...deckLawProblems(f.name, section(body, f.name), nodes));
  }
  out.push(...stateLawProblems(root, s, nodes));
  return out;
}

/** The per-state laws, dispatched off the state id — kept out of
 *  claimProblems so the field loop stays readable. */
function stateLawProblems(root: string, s: StateDecl, nodes: TraceNode[]): string[] {
  const out: string[] = [];
  if (s.id.endsWith("gate-prototype")) out.push(...assumptionLawProblems(nodes, catalogItems(root, "damage_levels")));
  if (s.id.endsWith("author-tests")) out.push(...authorTestsLawProblems(nodes));
  // THE RECORD IS THE SEGMENT BEFORE THE STATE. The id arrives as
  // `i12/specify-build` here and `iterations/i12/specify-build` elsewhere, so
  // counting from the end is the reading that holds for both.
  if (s.id.endsWith("specify-build")) out.push(...specifyBuildLawProblems(nodes, root, s.id.split("/").at(-2)));
  if (s.id.endsWith("trace-design")) out.push(...traceDesignLawProblems(nodes, root));
  if (s.id.endsWith("fill-story-evidence")) out.push(...fillStoryLawProblems(nodes, false));
  if (s.id.endsWith("gate-validation")) out.push(...fillStoryLawProblems(nodes, true));
  return out;
}

/** THE SPECIFY-BUILD LAW (owner ruling 2026-08-11): the design below the
 *  line is defined spec-first as design-spec nodes, the same shape as
 *  author-tests — and every promoted spike is assigned to a step.
 *
 *  Files are NAMED, not existing: a spec is written before its code
 *  lands. Existence and the dead-code sweep get teeth at trace-design. */
export function specifyBuildLawProblems(
  corpus: { id: string; type: string; file?: string }[],
  recordRoot: string,
  record?: string,
): string[] {
  return [...designCoverageProblems(corpus), ...promotionAssignmentProblems(corpus, recordRoot, record)];
}

/** The coverage half, shared with trace-design: edges resolve, every
 *  element and interface realized, every spec names files. */
function designCoverageProblems(corpus: { id: string; type: string; file?: string }[]): string[] {
  const out: string[] = [];
  const targets = new Set<string>();
  for (const n of corpus) if (n.type === "element" || n.type === "interface") targets.add(n.id);
  const covered = new Set<string>();
  for (const n of corpus) {
    if (n.type !== "design-spec" || n.file === undefined) continue;
    const fm = noteOf(n.file)?.frontmatter ?? {};
    const realizes = fmList(fm.realizes).filter((l) => !l.trim().startsWith("<!--"));
    if (realizes.length === 0) out.push(`${n.id}: a design-spec realizing nothing — realizes names at least one element or interface id`);
    for (const raw of realizes) {
      const id = raw.replace(/^\[\[/, "").replace(/\]\]$/, "").trim();
      if (!targets.has(id)) {
        out.push(`${n.id}: realizes ${id}, and no element or interface carries that id`);
        continue;
      }
      covered.add(id);
    }
    const files = fmList(fm.files).filter((l) => !l.trim().startsWith("<!--") && !/^none\b/i.test(l.trim()));
    if (files.length === 0) out.push(`${n.id}: a design-spec naming no files — name the code it lands in, planned names included`);
  }
  for (const t of targets) {
    if (!covered.has(t)) out.push(`${t}: no design-spec realizes it — the design below the line is specified before the build`);
  }
  return out;
}

/** THE FILL-STORY LAW (owner ruling 2026-08-11): validation is computed,
 *  never claimed. A story is FILLED when every slide's evidence half
 *  carries something, so the unfilled list IS the finding and the state
 *  carries no form. The must stories fill from their demonstration
 *  reports, which run-demos mints AFTER the fill state — so the musts,
 *  and their demonstration coverage, get their teeth at the gate. */
export function fillStoryLawProblems(corpus: { id: string; type: string; file?: string }[], includeMusts: boolean): string[] {
  const out: string[] = [];
  const demonstrated = new Set<string>();
  for (const n of corpus) {
    if (n.type !== "test-spec" || n.file === undefined) continue;
    const fm = noteOf(n.file)?.frontmatter ?? {};
    if (String(fm.method ?? "") !== "demonstration") continue;
    for (const d of fmList(fm.demonstrates)) demonstrated.add(d.trim());
  }
  for (const n of corpus) {
    if (n.type !== "story" || n.file === undefined) continue;
    const note = noteOf(n.file);
    if (note === undefined) continue;
    const must = String(note.frontmatter.priority ?? "") === "must";
    if (must && !includeMusts) continue;
    if (must && !demonstrated.has(n.id)) {
      out.push(`${n.id}: a must story no demonstration names — a demonstration-method spec carries it under demonstrates:`);
    }
    // A TEMPLATE PLACEHOLDER IS NOT EVIDENCE: comments are stripped before
    // the emptiness check, so "<!-- Empty until M8. -->" counts as empty.
    const unfilled = section(note.body, "Deck")
      .split(/\n---\n/)
      .map((s, i) => ({ i: i + 1, right: (s.split("|||")[1] ?? "").replace(/<!--[\s\S]*?-->/g, "").trim() }))
      .filter((s) => s.right === "")
      .map((s) => String(s.i));
    if (unfilled.length > 0) out.push(`${n.id}: evidence half empty on slide ${unfilled.join(", ")}`);
  }
  return out;
}

/** The step ids of the record's seeded chunk drawing, or undefined when
 *  none is seeded yet — assignment against no drawing checks names only. */
function seededStepIds(recordRoot: string, only: string | undefined): Set<string> | undefined {
  const dir = join(recordRoot, "project", "spec", "iterations");
  try {
    for (const e of readdirSync(dir)) {
      if (only !== undefined && e !== only) continue;
      const abs = join(dir, e, "machines", "build-chunks.md");
      if (!existsSync(abs)) continue;
      const fm = noteOf(abs)?.frontmatter ?? {};
      const raw = Array.isArray(fm.steps) ? fm.steps : Array.isArray(fm.chunks) ? fm.chunks : [];
      return new Set(raw.map((c) => String((c as Record<string, unknown>)?.id ?? "")).filter((x) => x !== ""));
    }
  } catch {
    return undefined;
  }
  return undefined;
}

/** The record's OWN experiments, where its fold-back says so. An experiment
 *  from an earlier record keeps its assignment to THAT record's drawing, which
 *  this tree does not carry — sweeping it against the current drawing failed i2
 *  on i1's promotion (2026-08-12).
 *
 *  UNDEFINED MEANS THE RECORD HAS NO FOLD-BACK, which is not the same as
 *  "folded nothing back". A minor strikes M6 whole, so it never has one. The
 *  caller falls back to the experiment's own owner there. */
function foldBackExperiments(recordRoot: string, only: string | undefined): Set<string> | undefined {
  const dir = join(recordRoot, "project", "spec", "iterations");
  try {
    for (const e of readdirSync(dir)) {
      if (only !== undefined && e !== only) continue;
      const abs = join(dir, e, "evidence", "fold-back.md");
      if (!existsSync(abs)) continue;
      const body = noteOf(abs)?.body ?? "";
      return new Set([...body.matchAll(/\[\[(exp-[^\]]+)\]\]/g)].map((m) => m[1]));
    }
  } catch {
    return undefined;
  }
  return undefined;
}

/** THE RECORD THE WALK IS IN, as its directory name. The state id carries the
 *  short id — `iterations/i12/specify-build` — and the directory is the one it
 *  prefixes.
 *
 *  WHY IT IS NOT A SCAN. Both lookups above used to read whichever record
 *  readdir handed back first, which is right only while one record's files sit
 *  on disk. Landing i27's spec into i12's tree put two drawings and one
 *  fold-back side by side, so i12 read its OWN drawing (i12- sorts first)
 *  against i27's fold-back, and i27's promotions were swept against i12's
 *  steps (2026-08-15). Both functions' doc comments already said "the
 *  record's"; neither had a way to know which record that was.
 *
 *  UNDEFINED FALLS BACK TO THE SCAN. The unit fixtures call the laws directly
 *  with no state, naming their record `itx` inside a temp root, so there is no
 *  short id to resolve and the lone record on disk is the right answer. */
function recordDirFor(recordRoot: string, record: string | undefined): string | undefined {
  let names: string[];
  try {
    names = readdirSync(join(recordRoot, "project", "spec", "iterations"));
  } catch {
    return undefined;
  }
  // TWO WAYS TO NAME THE RECORD, tried in order, because neither answers
  // everywhere. The state id carries the short id where the walk knows it, and
  // its shape differs between callers. A BOUND TREE IS NAMED FOR ITS RECORD,
  // so its own basename answers whenever work is bound — which is exactly when
  // a second record's files can be sitting in the same tree.
  for (const cand of [record, basename(recordRoot)]) {
    if (cand === undefined || cand === "") continue;
    for (const e of names) if (e === cand || e.startsWith(`${cand}-`)) return e;
  }
  return undefined;
}

/** Promotions are a filter, never a list — and none may be lost: every
 *  promoted experiment carries `chunk:` naming its step in the drawing. */
function promotionAssignmentProblems(corpus: { id: string; type: string; file?: string }[], recordRoot: string, record?: string): string[] {
  const out: string[] = [];
  const only = recordDirFor(recordRoot, record);
  const steps = seededStepIds(recordRoot, only);
  // A PROMOTION BELONGS TO THE ITERATION THAT RAN THE SPIKE (owner ruling
  // 2026-08-13). It is a spike aimed at a later step of the SAME record and it
  // does not outlive it — exactly like the spike, which never travelled.
  //
  // THE OWNER IS ON THE EXPERIMENT, not inferred from a sibling artifact. This
  // used to scope by looking for the record's fold-back evidence, which broke
  // twice: absent evidence meant "do not scope", so striking M6 at minor turned
  // the scoping off silently, and my first repair of that skipped every
  // experiment in any root that merely had an iterations directory — which is
  // every unit fixture. The tester caught the second one.
  //
  // AN EXPERIMENT WITH NO OWNER IS IN SCOPE. Absence cannot prove it belongs to
  // somebody else, and the safe direction is to ask rather than to skip.
  //
  // TWO WAYS TO KNOW THE OWNER, and they answer in different situations.
  //
  // The record's FOLD-BACK names the experiments it promoted, and where that
  // evidence exists it is the direct answer. A minor strikes M6 whole, so it
  // never has one — and reading absence as "folded nothing back" is what broke
  // the sweep's own test, because every unit fixture is also absent.
  //
  // So absence falls through to the experiment's OWN `minted_in`. An experiment
  // with no owner at all stays in scope: absence cannot prove it belongs to
  // somebody else, and the safe direction is to ask rather than to skip.
  const own = foldBackExperiments(recordRoot, only);
  const owner = only ?? basename(recordRoot);
  for (const n of corpus) {
    if (n.type !== "experiment" || n.file === undefined) continue;
    if (own !== undefined && !own.has(n.id)) continue;
    const fm = noteOf(n.file)?.frontmatter ?? {};
    const mintedIn = String(fm.minted_in ?? "").trim();
    if (own === undefined && mintedIn !== "" && mintedIn !== owner) continue;
    const p = String(fm.promote ?? "").trim();
    if (p === "" || /^none\b/i.test(p)) continue;
    const chunk = String(fm.chunk ?? "").trim();
    if (chunk === "") {
      out.push(`${n.id}: promoted and unassigned — chunk names the step of the seeded drawing it enters as`);
      continue;
    }
    if (steps !== undefined && !steps.has(chunk)) out.push(`${n.id}: chunk ${chunk} is not a step of the seeded drawing`);
  }
  return out;
}

/** THE TRACE-DESIGN LAW (owner ruling 2026-08-11): the mechanical half
 *  of the design trace, after the build. Coverage again, existence now,
 *  and the dead-code sweep — file grain: every engine file claimed by a
 *  spec, and the unclaimed list is the finding. */
export function traceDesignLawProblems(corpus: { id: string; type: string; file?: string }[], recordRoot: string): string[] {
  const out = designCoverageProblems(corpus);
  const claimed = new Set<string>();
  for (const n of corpus) {
    if (n.type !== "design-spec" || n.file === undefined) continue;
    const fm = noteOf(n.file)?.frontmatter ?? {};
    for (const raw of fmList(fm.files)) {
      const f = raw.trim();
      if (f.startsWith("<!--") || /^none\b/i.test(f)) continue;
      claimed.add(f.replace(/\\/g, "/"));
      if (!existsSync(join(recordRoot, f))) out.push(`${n.id}: names ${f}, which does not exist`);
    }
  }
  const unclaimed = unclaimedEngineFiles(recordRoot, claimed);
  if (unclaimed.length > 0) {
    const shown = unclaimed.slice(0, 12).join(" · ");
    out.push(`${unclaimed.length} engine files no design-spec claims — the dead-code view: ${shown}${unclaimed.length > 12 ? " · …" : ""}`);
  }
  return out;
}

/** The reverse sweep's subject: every .ts under the engine, as
 *  root-relative forward-slash paths. Tests live outside — the test-spec
 *  sweep claims those. */
function unclaimedEngineFiles(recordRoot: string, claimed: Set<string>): string[] {
  const base = join(recordRoot, "project", "deliverable", "engine");
  const out: string[] = [];
  const walk = (d: string, rel: string): void => {
    let entries: import("node:fs").Dirent[];
    try {
      entries = readdirSync(d, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      const r = rel === "" ? e.name : `${rel}/${e.name}`;
      if (e.isDirectory()) {
        walk(join(d, e.name), r);
        continue;
      }
      if (!e.name.endsWith(".ts")) continue;
      const full = `project/deliverable/engine/${r}`;
      if (!claimed.has(full)) out.push(full);
    }
  };
  walk(base, "");
  return out.sort();
}

/** THE AUTHOR-TESTS LAW (owner ruling 2026-08-11): verification is defined
 *  test-first as test-spec nodes, and the seams are mechanical.
 *
 *  - every requirement is verified by at least one test-spec
 *  - a spec's method equals the verify_method of every requirement it names
 *  - a spec's verifies entries resolve to requirements
 *  - a test-method spec NAMES its files — planned names count, because the
 *    spec is written test-first; existence gets teeth at verification
 *
 *  The reverse sweep — a test FILE no spec references — ships warn-first
 *  later (owner: "we'll come to that"), so it is not a refusal here. */
export function authorTestsLawProblems(corpus: { id: string; type: string; file?: string }[]): string[] {
  const out: string[] = [];
  const reqMethod = new Map<string, string>();
  for (const n of corpus) {
    if (n.type !== "requirement" || n.file === undefined) continue;
    reqMethod.set(n.id, String(noteOf(n.file)?.frontmatter.verify_method ?? ""));
  }
  const covered = new Set<string>();
  for (const n of corpus) {
    if (n.type !== "test-spec" || n.file === undefined) continue;
    const fm = noteOf(n.file)?.frontmatter ?? {};
    out.push(...specEdgeProblems(n.id, fm, reqMethod, covered));
    out.push(...specFileProblems(n.id, fm));
  }
  for (const [id, m] of reqMethod) {
    if (!covered.has(id)) out.push(`${id}: no test-spec verifies it — every requirement gets its ${m} spec, defined before the build`);
  }
  return out;
}

/** One spec's trace half: the verifies entries resolve, and the methods match. */
function specEdgeProblems(spec: string, fm: Record<string, unknown>, reqMethod: Map<string, string>, covered: Set<string>): string[] {
  const out: string[] = [];
  const method = String(fm.method ?? "");
  // A DEMONSTRATION SPEC MAY VERIFY NOTHING (owner ruling 2026-08-11):
  // its upward edge is `demonstrates:` naming the must story it shows end
  // to end, and the mechanics stay with the sibling test-method specs. A
  // none-convention line under verifies is honesty, not an id.
  const verifies = fmList(fm.verifies).filter((l) => !l.trim().startsWith("<!--") && !/^none\b/i.test(l.trim()));
  const demonstrates = fmList(fm.demonstrates).filter((l) => !l.trim().startsWith("<!--"));
  if (verifies.length === 0 && demonstrates.length === 0)
    out.push(`${spec}: a test-spec verifying nothing — verifies names at least one req- id, or demonstrates names the story it shows`);
  for (const raw of verifies) {
    const id = raw.replace(/^\[\[/, "").replace(/\]\]$/, "").trim();
    const m = reqMethod.get(id);
    if (m === undefined) {
      out.push(`${spec}: verifies ${id}, and no requirement carries that id`);
      continue;
    }
    covered.add(id);
    if (m !== method) out.push(`${spec}: a ${method} spec verifies ${id}, whose verify_method is ${m} — the methods must match`);
  }
  return out;
}

/** One spec's realization half: a test spec names its files. NAMED, not
 *  existing — a test-first spec is written before its file lands, so
 *  existence gets its teeth at verification, never here. */
function specFileProblems(spec: string, fm: Record<string, unknown>): string[] {
  if (String(fm.method ?? "") !== "test") return [];
  const files = fmList(fm.files).filter((l) => !l.trim().startsWith("<!--") && !l.trim().toLowerCase().startsWith("none"));
  if (files.length === 0) return [`${spec}: a test spec references no files — name the files that realize it, planned names included`];
  return [];
}

/** The riskiest assumptions are validated — gate-prototype's law (owner
 *  ruling 2026-08-10). An assumption in the worst two damage grades must
 *  carry a probe result, a conscious acceptance, or a deferral WITH its
 *  until — a deferral without one is a silent pass wearing a status. */
export function assumptionLawProblems(corpus: { id: string; type: string; file?: string }[], damageOrder: string[]): string[] {
  const out: string[] = [];
  for (const n of corpus) {
    if (n.type !== "raid" || n.file === undefined) continue;
    const fm = noteOf(n.file)?.frontmatter ?? {};
    if (String(fm.kind ?? "") !== "assumption") continue;
    const status = String(fm.status ?? "");
    if (status === "closed" || status === "superseded" || status === "accepted") continue;
    if (status === "deferred") {
      if (String(fm.defer_until ?? "").trim() === "") out.push(`${n.id}: deferred without its until — say what brings it back`);
      continue;
    }
    // Index 0 and 1 are the two worst grades of the catalogue's worst-first
    // order; the words themselves stay on the card.
    const dmg = damageOrder.indexOf(String(fm.breaks_how_badly ?? ""));
    const probe = String(fm.probe ?? "").trim();
    const answered = probe !== "" && !probe.startsWith("<!--") && !/^unprobed/i.test(probe);
    if (dmg >= 0 && dmg <= 1 && !answered)
      out.push(`${n.id}: a ${damageOrder[dmg]} assumption stands unprobed — probe it, accept it, or defer it with an until`);
  }
  return out;
}

/** THE STRUCTURAL LAWS, computed at every submit (owner ruling 2026-08-10:
 *  what the engine can check, the engine checks). They read the corpus, so a
 *  node landing later greys the signed claim through the stamp, and the
 *  re-submit refuses until the law holds again. */
export function structureLawProblems(fieldName: string, corpus: { id: string; type: string; file?: string }[]): string[] {
  const out: string[] = [];
  const fmOf = (n: { file?: string }): Record<string, unknown> => (n.file === undefined ? {} : (noteOf(n.file)?.frontmatter ?? {}));
  const typed = (t: string) => corpus.filter((n) => n.type === t && n.file !== undefined);
  const implementers = [...typed("element"), ...typed("interface")].map((n) => ({
    id: n.id,
    implements: fmList(fmOf(n).implements),
    satisfies: fmList(fmOf(n).satisfies),
  }));
  const v = elementMatrixView(
    typed("element").map((n) => ({ id: n.id, group: "", implements: fmList(fmOf(n).implements) })),
    typed("function").map((n) => ({ id: n.id, inputs: fmList(fmOf(n).inputs), outputs: fmList(fmOf(n).outputs) })),
    typed("interface").map((n) => ({
      id: n.id,
      source: String(fmOf(n).source ?? ""),
      destination: String(fmOf(n).destination ?? ""),
      carries: fmList(fmOf(n).carries),
    })),
  );
  if (v.unimplemented.length > 0)
    out.push(`${fieldName}: ${v.unimplemented.length} function(s) unimplemented — ${v.unimplemented.join(" · ")}`);
  const owing = v.cells.filter((c) => c.missing.length > 0);
  if (owing.length > 0)
    out.push(`${fieldName}: owed crossings without an interface — ${owing.map((c) => `${c.source} → ${c.destination}`).join(" · ")}`);
  out.push(...v.problems.map((p) => `${fieldName}: ${p}`));
  // THE TRACE IS COMPLETE, ON TWO PATHS (machines/trace-schema.md): every
  // requirement is reached through an implemented function that satisfies
  // it, or by a direct satisfier. Zero unreached, or no signature.
  const implementedFns = new Set(implementers.flatMap((i) => i.implements));
  const directSat = new Set(implementers.flatMap((i) => i.satisfies));
  const fnSat = typed("function").map((n) => ({ id: n.id, satisfies: fmList(fmOf(n).satisfies) }));
  const unreached = typed("requirement")
    .map((n) => n.id)
    .filter((r) => !directSat.has(r) && !fnSat.some((f) => implementedFns.has(f.id) && f.satisfies.includes(r)));
  if (unreached.length > 0)
    out.push(`${fieldName}: ${unreached.length} requirement(s) unreached by the structure — ${unreached.join(" · ")}`);
  return out;
}

/** Every quality scenario ruled — the deck's completeness law. */
export function deckLawProblems(fieldName: string, walkContent: string, corpus: { id: string; type: string; file?: string }[]): string[] {
  const quality = corpus
    .filter(
      (n) => n.type === "requirement" && n.file !== undefined && String(noteOf(n.file as string)?.frontmatter.kind ?? "") === "quality",
    )
    .map((n) => n.id);
  const unruled = quality.filter((id) => !walkContent.includes(`[[${id}]]`));
  return unruled.length > 0 ? [`${fieldName}: ${unruled.length} scenario(s) unruled — ${unruled.join(" · ")}`] : [];
}

/** A FILE REFERENCE RESOLVES ON DISK, not in the trace (owner ruling
 *  2026-08-11, cutting the package field over from free-form). Some
 *  artifacts are files and not nodes — a built package, an exported
 *  archive — and the only honest resolver for those is the filesystem. */
function fileRefProblems(name: string, content: string, root?: string): string[] {
  if (root === undefined) return [];
  const lines = content
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l !== "");
  if (lines.some((l) => /^-?\s*none\b/i.test(l))) return [];
  const paths = lines.map((l) => l.replace(/^-\s*/, "").replace(/\\/g, "/"));
  if (paths.length === 0) return [`${name}: no file named — one root-relative path per line, or one line saying none`];
  const missing = paths.filter((p) => !existsSync(join(root, p)));
  return missing.length > 0 ? [`${name}: no file on disk at — ${missing.join(" · ")}`] : [];
}

/** A REFERENCE THAT RESOLVES TO NOTHING IS A DEFECT, not a warning. The form
 *  points at standing artifacts, so an id naming no file means the reviewing
 *  gate would follow it and find nothing there. The corpus is absent where it
 *  is not loaded, and then the check stays quiet rather than guessing. */
function refProblems(name: string, meta: TemplateMeta, args: FieldArgs, content: string, corpus?: TraceNode[], root?: string): string[] {
  if (meta.resolves === "file") return fileRefProblems(name, content, root);
  if (meta.resolves !== "artifact" || corpus === undefined) return [];
  // A CARD ANSWERS IN ROWS, NOT IN A LIST. Reading it with the list rule
  // found nothing, so the field refused as empty while its own line check
  // passed — no content could satisfy both (owner report 2026-08-08).
  //
  // NOW FIXED BY SHAPE RATHER THAN BY NAME (2026-08-09). Naming compare-card
  // fixed the one card somebody had walked. `dsm` has the identical shape and
  // was missed, so partition-functions could not be satisfied by ANY content:
  // bullets passed the reference check and failed the row check, rows did the
  // reverse. A template whose line grammar anchors on a leading pipe stores a
  // TABLE, and every one of them reads rows.
  const answersInRows = meta.editor === "compare-card" || /^\^\\\|/.test(meta.line_pattern);
  // A FIELD THAT WRITES A KEY PUTS THAT KEY'S VALUE IN THE LATER CELLS. So a
  // dsm row is one element and its cluster, where a card's row is two items
  // and a verdict. `writes` is the tell, and a written value is not an
  // artifact to resolve.
  const refs = answersInRows ? refsInRows(content, args.writes === "" ? 2 : 1) : refsIn(content);
  if (refs.length === 0) {
    return /^\s*-\s*none\b/im.test(content) ? [] : [`${name}: no references — one artifact id per line, or one line saying none`];
  }
  const byId = new Map(corpus.map((n) => [n.id, n]));
  const dangling = refs.filter((r) => !byId.has(r));
  const out = dangling.length > 0 ? [`${name}: no artifact for — ${dangling.join(" · ")}`] : [];
  out.push(...typeProblems(name, args.of, refs, byId, root));
  out.push(...coverProblems(name, args.covers, refs, byId, corpus));
  // AND EVERY REFERENCED NODE'S OWN EDGES ARE LEGAL. Checking them here is
  // what makes the schema bind: a field listing functions checks those
  // functions, so an illegal edge cannot reach a submit unnoticed.
  if (root !== undefined) {
    const schema = traceSchema(root);
    for (const r of refs) {
      const n = byId.get(r);
      if (n !== undefined) out.push(...edgeProblems(n, byId, root, schema).map((p) => `${name}: ${p}`));
    }
  }
  return out;
}

/** COVERAGE IS MUTUAL (owner ruling 2026-08-06). `covers: value-prop` on a
 *  reference field means two things at once, and both are mechanical.
 *
 *  Every referenced node must refine one of the covered type. A story serving
 *  no proposition is work nobody asked for.
 *
 *  And every standing node of that type must be refined by one of them. A
 *  proposition no story serves is a promise nothing shows.
 *
 *  Neither is a judgment call, so neither waits for a reviewer to notice it. */
function coverProblems(name: string, covers: string, refs: string[], byId: Map<string, TraceNode>, corpus: TraceNode[]): string[] {
  if (covers === "" || covers === undefined) return [];
  const out: string[] = [];
  const orphan = refs.filter((r) => {
    const n = byId.get(r);
    return n !== undefined && !n.refines.some((p) => byId.get(p)?.type === covers);
  });
  if (orphan.length > 0) out.push(`${name}: each one refines a ${covers} — ${orphan.join(" · ")} refines none`);
  const served = new Set<string>();
  for (const r of refs) for (const p of byId.get(r)?.refines ?? []) served.add(p);
  const bare = corpus.filter((n) => n.type === covers && !served.has(n.id)).map((n) => n.id);
  if (bare.length > 0) out.push(`${name}: each ${covers} is covered — nothing here refines ${bare.join(" · ")}`);
  return out;
}

/** The first cell of a row, as a bare id — wiki brackets are how a reader
 *  writes a node and how the view renders one, so both read the same. */
const rowId = (cells: string[]): string => (cells[0] ?? "").replace(/^\[\[|\]\]$/g, "").trim();

/** A CELL STILL CARRYING ITS COMMENT IS UNANSWERED (owner ruling 2026-08-07).
 *
 *  A node is minted with `probe: <!-- what the check found ... -->`. The
 *  comment says what belongs there, sitting exactly where the answer will
 *  sit, so nothing has to invent a placeholder elsewhere to explain the
 *  field. Replacing it is what answers it.
 *
 *  Blank and still-commented are the same verdict on purpose. Both mean
 *  nobody has said anything, and a check that told them apart would let a
 *  minted prompt pass as a claim. */
const unanswered = (v: string): boolean => v.trim() === "" || /^<!--[\s\S]*-->$/.test(v.trim());

/** A CELL THAT LOST ITS TAIL, recognised by the mark a cut leaves.
 *
 *  A node-table cell lands verbatim on the node's frontmatter. On 2026-08-14
 *  four of this record's experiments reached their nodes ENDING IN AN ELLIPSIS
 *  with the clause that carried the meaning gone, and all four were rewritten
 *  by hand (note-324983b06229).
 *
 *  NOTHING IN THIS ENGINE WRITES AN ELLIPSIS. A search of the whole deliverable
 *  for the character as a string literal, and for any maxlength, returns
 *  nothing, and neither the read half nor the write half of the node-table
 *  shortens a cell. So the cut came from somewhere this code cannot see — a
 *  host, or the author's own abbreviation.
 *
 *  THE GUARD DOES NOT NEED THE CULPRIT. Whatever cut it, a frontmatter value
 *  that trails off is not an answer, and the one outcome that must not stand
 *  is the SILENT one: the form shows the whole text, the node carries a
 *  fragment, and the ellipsis reads as style rather than as loss. */
const LOST_ITS_TAIL = /(?:…|\.\.\.)\s*$/;

/** THE VOICE LINT AT SUBMIT, and the card decides which of its rules BITE.
 *
 *  `blocking:` in machines/lint/voice-lint.md names the rules that refuse.
 *  Everything else the lint finds is a report and lets the submit through, so
 *  a comma never stands in the way of a form.
 *
 *  WHY HERE RATHER THAN AT A LATER SWEEP. Prose written into a form is prose
 *  the author is looking at right now. An overhaul that finds it weeks later
 *  is finding it after the reader already read it.
 *
 *  ONLY PROSE. A table, a checklist and a reference list are STRUCTURE, and
 *  running sentence rules over them would flag the shape of a form rather
 *  than anything anybody wrote. */
function voiceProblems(name: string, meta: TemplateMeta, content: string, root?: string): string[] {
  if (root === undefined || meta.editor !== "text" || content.trim() === "") return [];
  const bite = new Set(blockingRules(root));
  if (bite.size === 0) return [];
  return lintProse(root, content)
    .filter((f) => bite.has(f.rule))
    .map((f) => `${name}: ${f.rule} — ${f.hint} ("${f.excerpt}")`);
}

function nodeTableProblems(name: string, args: FieldArgs, content: string): string[] {
  const rows = content.split("\n").map(tableRow);
  const missing: string[] = [];
  const cut: string[] = [];
  for (const id of args.items) {
    const row = rows.find((c) => rowId(c) === id);
    if (row === undefined) {
      missing.push(`${id} (no row)`);
      continue;
    }
    for (const [i, c] of args.columns.entries()) {
      const cell = row[i + 1] ?? "";
      if (unanswered(cell)) missing.push(`${id}.${c}`);
      else if (LOST_ITS_TAIL.test(cell)) cut.push(`${id}.${c}`);
    }
  }
  const out: string[] = [];
  if (missing.length > 0) out.push(`${name}: unanswered — ${missing.join(" · ")}`);
  if (cut.length > 0) {
    out.push(
      `${name}: ends in an ellipsis, so it lost its tail — ${cut.join(" · ")}. This cell lands verbatim on the node, and a value that trails off reads as a whole sentence to whoever opens it. Type the rest, or say the whole thing shorter.`,
    );
  }
  return out;
}

/** Which ROW each option belongs to: its design question where it names one,
 *  its cluster otherwise (owner ruling 2026-08-11 - a row is a DECISION, and
 *  a scoped iteration's decisions are finer than the product's clusters). */
function optionClusters(corpus: TraceNode[]): Map<string, string> {
  const out = new Map<string, string>();
  for (const n of corpus) {
    if (n.type !== "option" || n.file === undefined) continue;
    const q = nodeField(n.file, "question").trim();
    out.set(n.id, q !== "" ? q : bare(nodeField(n.file, "cluster")));
  }
  return out;
}

/** A CHART NEEDS CANDIDATES DRAWN ACROSS IT, and two is the floor.
 *
 *  AND EVERY LINE VISITS EVERY CLUSTER (owner, 2026-08-09). A cluster is a
 *  job the system has to do, so a line that skips one has not said how that
 *  job gets done — the item card calls that not-yet-a-candidate, and the
 *  editor already draws it dashed.
 *
 *  THE CHECK USED TO COUNT ROWS AND STOP. Five unfinished lines counted as
 *  five candidates, the state went green, and the walk carried on past a
 *  chart with no waypoints on it at all. */
function chartProblems(name: string, content: string, corpus?: TraceNode[]): string[] {
  const rows = content.split("\n").filter((l) => /^\s*\|/.test(l) && l.includes("[["));
  if (rows.length < 2) {
    return [
      `${name}: ${rows.length} candidate${rows.length === 1 ? "" : "s"} drawn — a chart needs at least two, because one combination is not a choice`,
    ];
  }
  if (corpus === undefined) return [];
  const serves = optionClusters(corpus);
  // A ROW IS A DECISION (owner ruling 2026-08-11): demanded rows are those
  // where the LINES' OWN picks offer at least two live alternatives. A
  // one-cell row is a settled ruling, and inherited clusters never re-demand.
  const lines: { id: string; byKey: Map<string, number> }[] = [];
  const used = new Map<string, Set<string>>();
  for (const line of rows) {
    const cells = line
      .trim()
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map((c) => c.trim());
    const id = bare(cells[0] ?? "");
    if (!id.startsWith("cand-")) continue;
    const byKey = new Map<string, number>();
    for (const p of (cells[3] ?? "")
      .split(/[·,]/)
      .map((x) => bare(x))
      .filter((x) => x !== "")) {
      const k = serves.get(p);
      if (k === undefined || k === "") continue;
      byKey.set(k, (byKey.get(k) ?? 0) + 1);
      const seen = used.get(k) ?? new Set<string>();
      seen.add(p);
      used.set(k, seen);
    }
    lines.push({ id, byKey });
  }
  const demanded = [...used.entries()].filter(([, opts]) => opts.size >= 2).map(([k]) => k);
  const problems: string[] = [];
  for (const l of lines) {
    const misses = demanded.filter((k) => (l.byKey.get(k) ?? 0) === 0);
    if (misses.length > 0) problems.push(`${l.id} misses ${misses.join(", ")}`);
    const doubles = [...l.byKey.entries()].filter(([, count]) => count > 1).map(([k]) => k);
    if (doubles.length > 0) problems.push(`${l.id} picks twice in ${doubles.join(", ")}`);
  }
  if (problems.length === 0) return [];
  return [`${name}: one option per row, and every decided row on every line — ${problems.join(" · ")}`];
}

/** THE TABLE'S OWN SHAPE — a header, a rule, and rows of the right width.
 *
 *  Lifted out of fieldProblems so that function stays under the complexity
 *  bar; the logic is unchanged from where it stood. */
function tableProblems(name: string, args: FieldArgs, content: string): string[] {
  const rows = content
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("|") && l.endsWith("|"));
  const isRule = (l: string): boolean => /^\|(\s*:?-+:?\s*\|)+$/.test(l);
  const data = rows.slice(1).filter((l) => !isRule(l));
  const want = args.columns.length;
  // THE COLUMN HELP RIDES THE REFUSAL. A header of single words leaves the
  // filler guessing, and the cell count cannot catch a guess — so the message
  // says what each column wants rather than only naming it.
  const spec = args.columns.map((c, i) => (args.column_help[i] ? `${c} (${args.column_help[i]})` : c)).join(" | ");
  if (rows.length === 0 || data.length === 0) {
    return [`${name}: a markdown table with columns — ${spec} — and at least one data row, or one line saying none`];
  }
  if (data.some((l) => l.split("|").length - 2 !== want)) return [`${name}: every row carries ${want} cells — ${spec}`];
  return [];
}

/** ONE ITEM'S STANDING against a checklist field's raw content — checked,
 *  owed to a live register entry, owed to something that will not resolve,
 *  or simply unchecked. Shared by the check (fieldProblems) and the report
 *  (checklistOwed), so the two can never disagree about what counts. */
type ChecklistStatus =
  | { kind: "checked" }
  | { kind: "owed"; ref: string }
  | { kind: "owed_unresolved"; ref: string }
  | { kind: "unchecked" };

function checklistItemStatus(item: string, lines: Set<string>, corpus?: TraceNode[]): ChecklistStatus {
  if (lines.has(`- [x] ${item}`)) return { kind: "checked" };
  const prefix = `- [owed] ${item} — `;
  const owedLine = [...lines].find((l) => l.startsWith(prefix));
  if (owedLine === undefined) return { kind: "unchecked" };
  const ref = owedLine.slice(prefix.length).trim();
  return openRaidRef(ref, corpus) ? { kind: "owed", ref } : { kind: "owed_unresolved", ref };
}

/** Does `ref` name an OPEN entry in the raid register? An owed box points at
 *  a register entry rather than a tick, so the ref has to resolve to a
 *  standing debt — closed, decided or missing entries refuse exactly like an
 *  unchecked box, because there is nobody left holding the claim. */
function openRaidRef(ref: string, corpus?: TraceNode[]): boolean {
  const n = (corpus ?? []).find((n) => n.type === "raid" && n.id === ref);
  return n !== undefined && n.file !== undefined && nodeField(n.file, "status") === "open";
}

export function fieldProblems(
  name: string,
  meta: TemplateMeta,
  args: FieldArgs,
  content: string,
  corpus?: TraceNode[],
  root?: string,
): string[] {
  if (meta.editor === "choice-rationale") return choiceProblems(name, args, content);
  const out: string[] = [...refProblems(name, meta, args, content, corpus, root), ...voiceProblems(name, meta, content, root)];
  // EVERY CELL IS REQUIRED. The rows are the register itself, so an empty
  // cell is a standing node nobody answered for — which is exactly the state
  // this field exists to refuse. "No check exists yet" is a legal answer and
  // has to be typed; blank is not an answer.
  if (meta.editor === "node-table") return nodeTableProblems(name, args, content);
  // A MOVE OWES A RATIONALE (owner ruling 2026-08-08). The order was settled
  // BLIND, before any candidate existed, and that is what keeps it honest.
  // Moving a row past another jumps that ordering, so it is the one edit that
  // can be aimed at a favourite — and the one that has to say why.
  //
  // The editor writes a bare `[moved]` when the box is empty, so an unreasoned
  // move reaches the file rather than disappearing when nobody types.
  if (meta.editor === "rank-cut") {
    const unreasoned = content
      .split("\n")
      .map((l) => /^\d+\.\s+\[\[([^\]]+)\]\](.*)$/.exec(l.trim()))
      .filter((m): m is RegExpExecArray => m !== null && /\[moved\]/.test(m[2]))
      .map((m) => m[1].trim());
    if (unreasoned.length > 0) out.push(`${name}: moved with no reason — ${unreasoned.join(" · ")}`);
    // THE CUTOFF IS THE STATE'S ONE DECISION, so a ranking without it has not
    // been cut at all. Cutting NOTHING is legal and common, and it is said by
    // putting the cutoff on the last row — not by leaving it unset.
    if (!/\[cutoff\]/.test(content)) out.push(`${name}: no cutoff — mark the last row that is still a criterion`);
    return out;
  }
  if (meta.editor === "per-item" && args.items.length > 0) {
    const missing = args.items.filter((i) => !new RegExp(`^- ${escapeRe(i)}: .+`, "m").test(content));
    if (missing.length > 0) out.push(`${name}: unanswered — ${missing.join(" · ")}`);
  }
  // CHECKING IS THE CLAIM (owner ruling 2026-08-11): a checklist refuses
  // while any named item stands unchecked. There is no text to write — the
  // deliberate click is the record, and an unchecked box is work still owed.
  //
  // A THIRD STATE, FOR WHAT CANNOT BE HONESTLY OBSERVED (owner ruling
  // 2026-08-13). The `none` door below solves the same shape of problem for
  // an empty set: rather than fabricate a row, write an honest claim of a
  // different shape. `- [owed] <item> — <ref>` does the same for one claim
  // an unattended agent cannot check — <ref> MUST resolve to an OPEN entry
  // in the raid register, so the debt is addressed to someone with a
  // trigger, not merely declared. It never counts as checked; a missing or
  // unresolved ref refuses exactly like an unchecked box, because today the
  // only honest alternative to an owed box is a stall — and this is
  // strictly more information than a tick.
  if (meta.editor === "checklist" && args.items.length > 0) {
    const lines = new Set(content.split("\n").map((l) => l.trim()));
    const unmet = args.items.flatMap((i) => {
      const st = checklistItemStatus(i, lines, corpus);
      if (st.kind === "unchecked") return [i];
      if (st.kind === "owed_unresolved") return [`${i} (owed ref "${st.ref}" is not an open raid entry)`];
      return [];
    });
    if (unmet.length > 0) out.push(`${name}: unchecked — ${unmet.join(" · ")}`);
  }
  // AN EMPTY SET IS A CLAIM, AND IT IS WRITTEN (2026-08-09). The refs template
  // already rules this — "one line saying none" is a legal answer — because a
  // blank field and a field that honestly found nothing look identical
  // afterwards. A shaped field had no such door, so a state with nothing to
  // tabulate could only be passed by inventing a row.
  //
  // FOUND AT evaluate-set. i1 composes no candidates by construction — its
  // candidates drawing says `none` — so the score table has no rows, and the
  // only way past the check was a fabricated score. The whole method exists to
  // stop exactly that.
  //
  // IT MUST OPEN THE SHAPE CHECK TOO. A `none` that satisfies the table and
  // then fails the line grammar is the same unsatisfiable pair by another
  // route, which this file has now hit five times.
  // A CHART WITH NOTHING DRAWN ACROSS IT IS NOT A CHART (owner ruling
  // 2026-08-09). The state's own guidance already says two is the floor,
  // because one combination is not a choice — and this runs BEFORE the `none`
  // door on purpose. An enumerated space nobody has combined is unfinished,
  // never empty, so `none` may not buy its way past it.
  //
  // It reached gate-candidates with zero candidates drawn and the only
  // complaint was "no references", which reads like a formatting slip rather
  // than the missing work it was.
  if (meta.editor === "morph-box") return chartProblems(name, content, corpus);
  const saysNone = /^-?\s*none\b/i.test(content.trim());
  if (saysNone) return out;
  if (meta.editor === "table" && args.columns.length > 0) out.push(...tableProblems(name, args, content));
  if (meta.line_pattern !== "") {
    const re = new RegExp(meta.line_pattern);
    const bad = content.split("\n").find((l) => l.trim() !== "" && !re.test(l.trim()));
    if (bad !== undefined) out.push(`${name}: ${meta.line_help !== "" ? meta.line_help : `every line matches ${meta.line_pattern}`}`);
  }
  return out;
}

/** A CHOICE, ITS REASON, AND WHETHER IT BLOCKS — three separate questions.
 *
 *  `rationale_for` names which options owe an explanation; absent means all
 *  of them, which is what a gate verdict wants. `passing` names which ones
 *  let the form stand.
 *
 *  THEY ARE NOT THE SAME QUESTION (owner ruling 2026-08-08). A finder that
 *  cannot apply to a physical build PASSES and still owes its reason, so a
 *  legitimate skip and an unexplained one are told apart. */
function choiceProblems(name: string, args: FieldArgs, content: string): string[] {
  const choice = choiceOf(content);
  if (args.options.length > 0 && !args.options.includes(choice)) {
    return [`${name}: the choice must be one of — ${args.options.join(" | ")}`];
  }
  const owes = args.rationale_for.length === 0 || args.rationale_for.includes(choice);
  if (owes && rationaleOf(content) === "") {
    return [`${name}: "${choice}" needs its reason on the same line — write it as \`${choice} — <why>\``];
  }
  if (args.passing.length > 0 && !args.passing.includes(choice)) {
    return [`${name}: ${choice} — the claim does not stand, and the gate stays shut while it does`];
  }
  return [];
}

function templateStatement(root: string, name: string): string {
  try {
    return parseStateNote(readFileSync(join(root, fieldTemplateRel(name)), "utf8")).statement;
  } catch {
    return "";
  }
}

/** "Read <name>" from a document path — the input list's verb-object label. */
function readLabel(path: string): string {
  const base = path.split("/").pop() ?? path;
  return `Read ${base.replace(/\.md$/, "")}`;
}

const SITUATION = {
  name: "current_situation",
  description: "What stands right now, in a few lines.",
  required: true,
};
const FOLLOW_UP = {
  name: "follow_up",
  description: "What this work produces as next steps — work, or notes parked with their ready-when.",
  required: true,
};
// THE LAST BOX IS ALWAYS OPEN (owner ruling 2026-08-04): whoever fills a
// form is asked whether anything is left unsaid. A form must never be the
// reason something went unrecorded.
const ANYTHING_ELSE = {
  name: "anything_else",
  description: "Anything else? Free text, optional. Say what the boxes above had no room for.",
  required: false,
};

/** The lint template a state's form derives: situation, the evidence
 *  fields, follow-up — the fill sections in sheet order. */
export function stateFormFields(s: StateDecl): FormTemplate {
  const fields = [
    SITUATION,
    ...s.evidence_form.map((f) => ({
      name: f.name,
      description: f.description,
      // A DERIVED FIELD IS A READING, NOT A CLAIM (owner ruling 2026-08-08:
      // "if it's derived, then it doesn't need to be in the notes"). It reads
      // another field, computes, and shows the answer — so there is nothing
      // for anybody to fill and nothing to demand.
      //
      // IT STORES NOTHING EITHER. Writing the answer down would be the second
      // copy this whole design exists to avoid, and the stored one would drift
      // from the scores the moment a single number changed.
      required: f.reads === undefined && f.required,
      ...(f.guidance !== undefined ? { guidance: f.guidance } : {}),
    })),
    FOLLOW_UP,
    ANYTHING_ELSE,
  ];
  return { form: s.id, instance: `${s.id}.md`, statement: s.statement, fields };
}

/** ONE FIELD'S ARGUMENTS, every live source resolved against the record's own
 *  trace. Extracted from stateFormModel because it grew past what one function
 *  should hold, and because the pick resolution below is worth reading alone. */
export function fieldArgsFor(f: EvidenceField, root: string, traceRoot: string, instanceRaw?: string, evidenceDir?: string): FieldArgs {
  const resolved = (f.items ?? []).flatMap((i) => resolveSource(i, root, traceRoot, instanceRaw));
  return {
    of: f.of ?? "",
    covers: f.covers ?? "",
    options: f.options ?? [],
    rationale_for: f.rationale_for ?? [],
    column_help: f.column_help ?? [],
    items: resolved,
    passing: f.passing ?? [],
    columns: f.columns ?? [],
    // SEVERAL SOURCES CONCATENATE, in the order declared, without repeats. A
    // live source beside a literal is the point: every cluster, then `nobody`.
    picks: Object.fromEntries(
      Object.entries(f.picks ?? {}).map(([col, srcs]) => [
        col,
        [...new Set(srcs.flatMap((src) => resolveSource(src, root, traceRoot, instanceRaw)))],
      ]),
    ),
    pick_free: f.pick_free ?? [],
    pick_sources: f.picks ?? {},
    page_size: f.page_size ?? 0,
    link_base: f.link_base ?? "",
    relation: f.relation ?? "",
    writes: f.writes ?? "",
    reason: f.reason ?? "",
    walk: cardWalk(f, traceRoot, resolved),
    dsm: fieldDsm(f, traceRoot, resolved),
    // THE STORED TABLE SUPPLIES THE LINE ORDER AND NOTHING ELSE. Everything
    // drawn comes from the nodes, so an edit made in a candidate's own note
    // wins over whatever the field happens to hold.
    box: fieldBox(f, traceRoot, section(instanceRaw ?? "", f.name)),
    // A DERIVED FIELD READS ANOTHER ONE. The scores are the input; the front,
    // the eliminations and both corners all fall out of them, so nothing here
    // is typed and nothing can disagree with the table it came from.
    pareto: f.template !== "pareto-plot" || f.reads === undefined ? null : viewOfScores(section(instanceRaw ?? "", f.reads)),
    ...derivedViews(f, traceRoot, evidenceDir),
  };
}

/** THE M5 READINGS REACH ACROSS THE RECORD: the scores stand at
 *  evaluate-set and the signed order at cut-criteria, so the convergence is
 *  computed from the sibling forms rather than typed. The structure views
 *  read the trace nodes directly. */
function derivedViews(
  f: EvidenceField,
  traceRoot: string,
  evidenceDir?: string,
): Pick<FieldArgs, "matrix" | "sensitivity" | "ematrix" | "scenario" | "smetrics" | "exposure"> {
  return {
    matrix: f.template !== "decision-matrix" || evidenceDir === undefined ? null : pughView(...m5Inputs(evidenceDir, traceRoot)),
    sensitivity: f.template !== "sensitivity" || evidenceDir === undefined ? null : sensitivityView(...m5Inputs(evidenceDir, traceRoot)),
    ematrix: f.template !== "element-matrix" ? null : elementMatrixArgs(traceRoot),
    scenario: f.template !== "scenario-deck" ? null : scenarioDeckArgs(traceRoot),
    // INFORMATION ONLY, riding the deck's field (owner ruling 2026-08-10):
    // the numbers render beneath the deck and nothing about them is typed.
    smetrics: f.template !== "scenario-deck" ? null : structureMetricsArgs(traceRoot),
    exposure: f.template !== "exposure-pick" ? null : exposureArgs(traceRoot),
  };
}

/** YAML array or comma-joined string — the house rule for every list. */
function fmList(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(String);
  if (typeof v === "string" && v.trim() !== "")
    return v
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s !== "");
  return [];
}

/** One trace folder's nodes, read through the door. The path takes the
 *  RECORD ROOT — traceDir owns the append, like every trace read. */
function traceFolder(traceRoot: string, folder: string): { id: string; fm: Record<string, unknown>; body: string }[] {
  const dir = traceDir(traceRoot);
  try {
    return readdirSync(join(dir, folder))
      .filter((n) => n.endsWith(".md"))
      .map((n) => {
        const note = noteOf(join(dir, folder, n));
        return { id: String(note?.frontmatter.id ?? n.replace(/\.md$/, "")), fm: note?.frontmatter ?? {}, body: note?.body ?? "" };
      });
  } catch {
    return [];
  }
}

/** The three node sets the element matrix computes from. */
export function elementMatrixArgs(traceRoot: string): ElementMatrixView {
  return elementMatrixView(
    traceFolder(traceRoot, "element").map((n) => ({ id: n.id, group: String(n.fm.group ?? ""), implements: fmList(n.fm.implements) })),
    traceFolder(traceRoot, "function").map((n) => ({ id: n.id, inputs: fmList(n.fm.inputs), outputs: fmList(n.fm.outputs) })),
    traceFolder(traceRoot, "interface").map((n) => ({
      id: n.id,
      source: String(n.fm.source ?? ""),
      destination: String(n.fm.destination ?? ""),
      carries: fmList(n.fm.carries),
    })),
  );
}

/** The scenario deck's inputs: quality requirements with their Scenario
 *  sections, the satisfies edges, the implementers and the register's
 *  decisions. All read from the record's trace on every look. */
export function scenarioDeckArgs(traceRoot: string): ScenarioDeckView {
  const reqs = traceFolder(traceRoot, "requirement")
    .filter((n) => String(n.fm.kind ?? "") === "quality")
    .map((n) => ({
      id: n.id,
      grade: String(n.fm.breaks_how_badly ?? ""),
      characteristic: String(n.fm.characteristic ?? ""),
      scenario: section(n.body, "Scenario"),
      fitness: n.fm.fitness_candidate === true || n.fm.fitness_candidate === "true",
    }));
  const fns = traceFolder(traceRoot, "function").map((n) => ({ id: n.id, satisfies: fmList(n.fm.satisfies) }));
  const impl = [...traceFolder(traceRoot, "element"), ...traceFolder(traceRoot, "interface")].map((n) => ({
    id: n.id,
    implements: fmList(n.fm.implements),
    satisfies: fmList(n.fm.satisfies),
  }));
  const decisions = traceFolder(traceRoot, "raid")
    .filter((n) => String(n.fm.kind ?? "") === "decision")
    .map((n) => n.id);
  return scenarioDeckView(
    reqs,
    fns,
    impl,
    decisions,
    traceFolder(traceRoot, "element").map((n) => n.id),
    catalogItems(traceRoot, "damage_levels"),
  );
}

/** The exposure chart's entries — the whole standing register with its two
 *  grades, and the axis orders off the two catalogue cards. */
export function exposureArgs(traceRoot: string): ExposureView {
  const entries = traceFolder(traceRoot, "raid").map((n) => ({
    id: n.id,
    statement: String(n.fm.statement ?? ""),
    kind: String(n.fm.kind ?? ""),
    status: String(n.fm.status ?? ""),
    damage: String(n.fm.breaks_how_badly ?? ""),
    likelihood: String(n.fm.how_likely ?? ""),
  }));
  return exposureView(entries, catalogItems(traceRoot, "damage_levels"), catalogItems(traceRoot, "likelihood_levels"));
}

/** The structure numbers, computed off the same nodes as the matrix. */
export function structureMetricsArgs(traceRoot: string): MetricRow[] {
  return structureMetrics(
    elementMatrixArgs(traceRoot),
    traceFolder(traceRoot, "element").map((n) => ({ id: n.id, implements: fmList(n.fm.implements) })),
  );
}

/** The convergence's three inputs: the sibling score table, the sibling cut
 *  order, and the damage grade off each requirement node. */
function m5Inputs(evidenceDir: string, traceRoot: string): [string, string, (id: string) => string] {
  const sectionOf = (state: string, name: string): string => {
    const raw = readNode(join(evidenceDir, `${state}.md`));
    return raw === "" ? "" : section(parseStateNote(raw).body, name);
  };
  const gradeOf = (id: string): string => {
    const fm = noteOf(join(traceDir(traceRoot), "requirement", `${id}.md`))?.frontmatter;
    return typeof fm?.breaks_how_badly === "string" ? fm.breaks_how_badly : "";
  };
  return [sectionOf("evaluate-set", "scores"), sectionOf("cut-criteria", "cuts"), gradeOf];
}

/** The whole drawing's input, from the score table alone. */
function viewOfScores(scores: string): ParetoView {
  const { candidates, axes } = readScores(scores);
  return { axes, candidates, result: pareto(candidates, axes) };
}

/** form = f(state): the A3 model, every part from markdown or derived. */
export function stateFormModel(
  root: string,
  docs: GuidanceDoc[],
  m: MachineDecl,
  s: StateDecl,
  header: Record<string, string>,
  instanceRaw?: string,
  /** Where the RECORD's trace lives — a record owns its nodes in its own
   *  worktree, so a live item list has to be told, never guessed.
   *
   *  IT DEFAULTS TO `root`, NEVER TO "". An empty root sends every live
   *  source at the process's working directory, which is a guess about who
   *  launched the engine. The card that started this rendered "every pair
   *  settled" over an empty list, which is the worst way to be wrong:
   *  confident, and shaped exactly like success. */
  traceRoot = root,
  /** The record's evidence folder — the instance file's home. The M5
   *  readings reach across sibling forms, so the folder is told, never
   *  guessed. Absent, the cross-form views render their empty state. */
  instanceAbs?: string,
): StateFormModel {
  const entryReads = new Set(s.entry?.read ?? []);
  const inputs: FormInput[] = pulledFor(root, docs, m, s).map((d) => ({
    label: readLabel(d.path),
    description: d.path,
    path: d.path,
    entry: entryReads.has(d.path),
  }));
  const fieldTemplates: Record<string, string> = { current_situation: "free-form", follow_up: "free-form" };
  for (const f of s.evidence_form) fieldTemplates[f.name] = f.template ?? "free-form";
  const templateMetas: Record<string, TemplateMeta> = {};
  for (const t of [...new Set(Object.values(fieldTemplates))]) {
    inputs.push({ label: `Read template-${t}`, description: templateStatement(root, t), path: fieldTemplateRel(t), entry: false });
    templateMetas[t] = templateMeta(root, t);
  }
  const fieldArgs: Record<string, FieldArgs> = {};
  for (const f of s.evidence_form)
    fieldArgs[f.name] = fieldArgsFor(f, root, traceRoot, instanceRaw, instanceAbs === undefined ? undefined : dirname(instanceAbs));
  const fieldHints: Record<string, FieldHint> = {};
  for (const f of s.evidence_form) {
    fieldHints[f.name] = fieldHint(root, templateMetas[f.template ?? "free-form"], f.of ?? "");
  }
  for (const d of s.inputs ?? []) inputs.push({ label: d.label, description: d.description, entry: false });
  return {
    form: s.id,
    title: `Evidence form / ${s.id}`,
    header,
    description: s.statement,
    motivation: s.motivation ?? "",
    follow_up_label: s.follow_up_label ?? "",
    inputs,
    boxes: readA3(root),
    template_meta: templateMetas,
    field_args: fieldArgs,
    field_hints: fieldHints,
    template: stateFormFields(s),
    field_templates: fieldTemplates,
  };
}

/** $inbox, resolved live: one item per pending note — the ref, then the
 *  note's own title so the filler knows what they are answering.
 *
 *  A SIGNED FORM FREEZES ITS LIST (owner ruling 2026-08-04). The inbox
 *  grows all day, and every new note re-opened a stamped form — which
 *  stripped the bless on the way back through the save. So a signed
 *  instance keeps only the notes it ALREADY names: its own answers are
 *  the snapshot, and nothing new has to be stored to hold one. Editing
 *  the form strips the stamp, and the live list returns with it. */
/** $assumptions, resolved live: one item per STANDING assumption in the
 *  register, whichever iteration wrote it.
 *
 *  IT DOES NOT FREEZE, and that is the difference from $inbox. A retro
 *  answered the notes pending when it walked, and re-checking against
 *  today's inbox would mark every retro suspect forever. This field is a
 *  STANDING ARTIFACT instead: at rest, every assumption carries a probe or
 *  a reason it has none. A new unprobed assumption SHOULD turn the state
 *  grey, because the claim "they are all probed" stopped being true.
 *
 *  Closed entries drop out. There is nothing to probe about an assumption
 *  nobody is relying on any more. */
export function assumptionItems(traceRoot: string): string[] {
  try {
    return loadTrace(traceRoot)
      .filter(
        (n) =>
          n.type === "raid" &&
          n.file !== undefined &&
          nodeField(n.file, "kind") === "assumption" &&
          nodeField(n.file, "status") !== "closed",
      )
      .map((n) => n.id)
      .sort();
  } catch {
    return [];
  }
}

/** THE CRITERION POOL IS REQUIREMENTS, AND ONLY REQUIREMENTS.
 *
 *  A REGISTER ENTRY IS NOT A CRITERION (owner ruling 2026-08-08, and the
 *  method card said so first). It POINTS at requirements through source_refs,
 *  and a requirement several entries lean on is one that matters — that is a
 *  hint for the ordering, never a row to weigh against a requirement.
 *
 *  WHAT IT LOOKED LIKE WHEN IT WAS WRONG. The card put up "no vendor ships
 *  adjudication provenance" against "the record arrives prefilled" and asked
 *  which mattered more. Those are not comparable quantities. One is a claim
 *  about the market, the other a demand on the system, and no honest answer
 *  exists. The entry was also CLOSED, which nothing checked. */
function poolNodes(traceRoot: string) {
  try {
    return loadTrace(traceRoot).filter((n) => n.type === "requirement" && n.file !== undefined);
  } catch {
    return [];
  }
}

/** HOW MANY OPEN REGISTER ENTRIES LEAN ON EACH REQUIREMENT. This is the
 *  register's real contribution to the criteria: a requirement several risks
 *  and assumptions point at is rarely unimportant, so it seeds the ordering.
 *
 *  CLOSED ENTRIES DO NOT COUNT. A concern somebody ruled away cannot make a
 *  requirement matter more. */
export function registerPull(traceRoot: string): Record<string, number> {
  const out: Record<string, number> = {};
  try {
    for (const n of loadTrace(traceRoot)) {
      if (n.type !== "raid" || n.file === undefined) continue;
      if (nodeField(n.file, "status") === "closed") continue;
      for (const ref of nodeList(n.file, "source_refs")) {
        const id = ref.split(/\s+/)[0].replace(/^\[\[/, "").replace(/\]\]$/, "").trim();
        if (id.startsWith("req-")) out[id] = (out[id] ?? 0) + 1;
      }
    }
  } catch {
    // no register, no pull — the ordering falls back to priority alone
  }
  return out;
}

/** $functions, resolved live: every function the structure declares.
 *
 *  IT DOES NOT FREEZE. The function DSM is a projection over these nodes, so
 *  a function written after the partitioning was signed SHOULD turn that
 *  state grey — the claim "every function has a quality class" stopped being
 *  true the moment somebody added one. */
export function functionItems(traceRoot: string): string[] {
  return typedItems(traceRoot, "function");
}

/** $clusters: every function group the partitioning declared. It is the OFFER
 *  a placement picks from — a function cannot belong to a cluster nobody has
 *  named. */
export function clusterItems(traceRoot: string): string[] {
  return typedItems(traceRoot, "cluster");
}

/** $flows: every thing that moves between functions. An input and an output
 *  are the same kind, because the input of one function is the output of
 *  another. */
export function flowItems(traceRoot: string): string[] {
  return typedItems(traceRoot, "flow");
}

/** $options: every candidate any finder has minted so far. The chart is built
 *  over these, and a row naming an option that no finder produced is a row
 *  about something nobody searched for. */
export function optionItems(traceRoot: string): string[] {
  return typedItems(traceRoot, "option");
}

/** $candidates: every line drawn across the morphological chart. They are what
 *  run-candidates composes and evaluate-set scores, so a score naming anything
 *  else is a score against something nobody proposed. */
export function candidateItems(traceRoot: string): string[] {
  return typedItems(traceRoot, "candidate");
}

/** $claim-specs, resolved live: the specs no run can prove — every
 *  method but test. Verification observes these green by fresh eyes. */
function claimSpecItems(traceRoot: string): string[] {
  return (
    traceFolder(traceRoot, "test-spec")
      .filter((n) => String(n.fm.method ?? "") !== "test")
      // A demonstrates-only spec belongs to VALIDATION: its run is M8's demo
      // machine and the gate's musts_demonstrated. Verification's checklist
      // holds only specs that verify requirements.
      .filter((n) => fmList(n.fm.verifies).some((l) => !l.trim().startsWith("<!--") && !/^none\b/i.test(l.trim())))
      .map((n) => n.id)
      .sort()
  );
}

/** $must-stories, resolved live: the stories graded must. Each one is
 *  demonstrated end to end at M8 and answers the gate with its report. */
function mustStoryItems(traceRoot: string): string[] {
  return traceFolder(traceRoot, "story")
    .filter((n) => String(n.fm.priority ?? "") === "must")
    .map((n) => n.id)
    .sort();
}

/** $promotions, resolved live: the experiments THIS RECORD promoted, whose
 *  `promote:` names something entering the build. PROMOTIONS ARE A FILTER,
 *  NEVER A LIST (M6 fold-back): an experiment saying none is honestly absent.
 *
 *  A PROMOTION BELONGS TO THE ITERATION THAT RAN THE SPIKE (owner ruling
 *  2026-08-13). It is a spike aimed at a later step of the SAME record, and it
 *  has no business outliving it — exactly like the spike, which does not.
 *
 *  IT USED TO RETURN EVERY PROMOTED EXPERIMENT IN THE PROJECT, with no owner
 *  and no expiry. So i2's promotion turned up in i3's build form, and would
 *  have turned up in i4's and i5's, each of them asked to plan a chunk that
 *  somebody else had already built. i3 hit exactly that and could only satisfy
 *  it by copying a step it had not done.
 *
 *  THE RECORD'S ID IS THE BASENAME OF ITS TRACE ROOT, so nothing new is
 *  threaded through. At trunk nothing matches, which is right: no record is
 *  open, so no promotion is owed. */
function promotionItems(traceRoot: string): string[] {
  const owner = basename(traceRoot);
  return traceFolder(traceRoot, "experiment")
    .filter((n) => {
      const p = String(n.fm.promote ?? "").trim();
      if (p === "" || /^none\b/i.test(p)) return false;
      return String(n.fm.minted_in ?? "").trim() === owner;
    })
    .map((n) => n.id)
    .sort();
}

function typedItems(traceRoot: string, type: string): string[] {
  try {
    return loadTrace(traceRoot)
      .filter((n) => n.type === type)
      .map((n) => n.id)
      .sort();
  } catch {
    return [];
  }
}

/** $criterion_pool, resolved live. It is the OFFER a comparison picks from —
 *  a pick outside it is not an axis — and never the set that ends up scored. */
export function criterionPoolItems(traceRoot: string): string[] {
  return poolNodes(traceRoot)
    .map((n) => n.id)
    .sort();
}

/** $compounding_suspects, resolved live: pool members the engine OFFERS as a
 *  merge. Two rows sharing a characteristic, or refining one use case, are
 *  the two ways duplication actually shows up.
 *
 *  IT IS AN OFFER AND NEVER A MERGE. Only `weighs_with` compounds anything,
 *  and only an author writes that. */
export function compoundingSuspectItems(traceRoot: string): string[] {
  const flagged = new Set<string>();
  for (const [a, b] of compoundingSuspectPairs(traceRoot)) {
    flagged.add(a);
    flagged.add(b);
  }
  return [...flagged].sort();
}

/** THE SUSPECTS ARE PAIRS, AND THAT IS THE WHOLE POINT. Flagging NODES and
 *  then crossing them asks n(n-1)/2 questions — 10,440 over this register,
 *  which is not a form, it is a punishment.
 *
 *  BOTH SIGNALS MUST FIRE, not either. Almost every requirement refines one
 *  of a handful of use cases, and plenty share a quality characteristic, so
 *  either signal alone flags nearly the whole register. Two rows that share a
 *  characteristic AND derive from the same use case are a genuinely small
 *  set, and a genuinely plausible duplicate. */
export function compoundingSuspectPairs(traceRoot: string): [string, string][] {
  const nodes = poolNodes(traceRoot).map((n) => ({
    id: n.id,
    characteristic: nodeField(n.file as string, "characteristic"),
    refines: new Set(nodeList(n.file as string, "refines")),
  }));
  const out: [string, string][] = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i];
      const b = nodes[j];
      if (a.characteristic === "" || a.characteristic !== b.characteristic) continue;
      let shares = false;
      for (const uc of a.refines) if (b.refines.has(uc)) shares = true;
      if (shares) out.push([a.id, b.id]);
    }
  }
  return out;
}

/** $criterion_axes, resolved live: what survives compounding. ONE ENTRY PER
 *  AXIS, never per row — a `weighs_with` group collapses to its lowest id, so
 *  the axis carries one stable name whichever member you came in through.
 *
 *  A `must` ROW IS NOT AN AXIS. Every surviving candidate meets a demand by
 *  definition, so it separates nothing, and scoring it would let a candidate
 *  that fails the demand buy that failure back elsewhere. */
export function criterionAxisItems(traceRoot: string): string[] {
  const pool = poolNodes(traceRoot).filter((n) => nodeField(n.file as string, "priority") !== "must");
  // THE HINT ORDER, and it is the difference between 149 questions and 873.
  // Taken most-important-first, every item is PREDICTED to be the new bottom
  // of the chain, so the walk's one probe is the question most likely to be
  // confirmed. A wrong hint costs one question, never a wrong answer.
  //
  // DAMAGE LEADS IT (owner report 2026-08-08). Ordered from MoSCoW alone, a
  // response-time requirement came out above the foundations of the system —
  // and no amount of pairwise comparison discovers that, because the
  // comparison never reads what breaks. Every requirement already carries that
  // line; `breaks_how_badly` grades it, and the grade leads the sort.
  //
  // IT IS A HINT, NOT THE ANSWER. The walk still settles the order and a
  // person still overrules any pair. This only decides where it starts.
  //
  // AN UNGRADED ROW SORTS IN THE MIDDLE. Not last, or every row written before
  // the scale existed would sink beneath rows nobody has thought about; not
  // first, or leaving it blank would be the way to the top.
  //
  // THE LEVELS ARE READ FROM THE CARD, never listed here. meth-damage-scale is
  // their only home and the order in it IS the severity order — the catalogue
  // guard refuses a copy in the engine, and it caught this one.
  const damageLevels = catalogItems(traceRoot, "damage_levels");
  const middle = Math.floor(damageLevels.length / 2);
  const pull = registerPull(traceRoot);
  const rank = (n: { id: string; file?: string }): number => {
    const at = damageLevels.indexOf(nodeField(n.file as string, "breaks_how_badly"));
    const damage = at < 0 ? middle : at;
    const moscow = nodeField(n.file as string, "priority") === "should" ? 0 : 1;
    return damage * 10000 + moscow * 1000 - (pull[n.id] ?? 0);
  };
  pool.sort((a, b) => rank(a) - rank(b) || a.id.localeCompare(b.id));
  const ids = new Set(pool.map((n) => n.id));
  const parent = new Map<string, string>();
  for (const id of ids) parent.set(id, id);
  const find = (a: string): string => {
    let r = a;
    while (parent.get(r) !== r) r = parent.get(r) as string;
    return r;
  };
  for (const n of pool) {
    for (const raw of nodeList(n.file as string, "weighs_with")) {
      // THE CELL IS "<id> — why", and only the first token is structural.
      // Splitting on the dash would cut req-lane-is-the-only-door in half.
      const other = raw.split(/\s+/)[0].trim();
      if (!ids.has(other)) continue;
      const ra = find(n.id);
      const rb = find(other);
      if (ra === rb) continue;
      if (ra < rb) parent.set(rb, ra);
      else parent.set(ra, rb);
    }
  }
  // THE ORDER IS THE HINT'S, NOT THE ALPHABET'S. Sorting here would throw
  // away the very thing that makes the first pass affordable.
  const seen = new Set<string>();
  const out: string[] = [];
  for (const n of pool) {
    const r = find(n.id);
    if (seen.has(r)) continue;
    seen.add(r);
    out.push(r);
  }
  return out;
}

/** One frontmatter value off a node, read from disk. The loader keeps only
 *  what the graph needs, so anything else is fetched by whoever wants it. */
export function nodeField(file: string, key: string): string {
  try {
    const lines = nodeLines(file);
    // FRONTMATTER ONLY. Past the closing fence a line that looks like a key
    // is prose, and reading prose as a value is how a field silently fills.
    const end = lines.indexOf("---", 1);
    const hit = lines.slice(0, end < 0 ? lines.length : end).find((l) => l.startsWith(`${key}:`));
    return hit === undefined ? "" : unquote(hit.slice(key.length + 1).trim());
  } catch {
    return "";
  }
}

/** The same, for a key whose value is a LIST. `nodeField` reads one line and
 *  slices after the colon, so a list comes back as the empty string — which
 *  reads as "no value" when it means "wrong reader", and that is the worse
 *  of the two failures.
 *
 *  THREE SHAPES COUNT, because all three appear on real nodes: a block list
 *  of `  - item` lines, an inline `[a, b]`, and a bare scalar where exactly
 *  one value was written.
 *
 *  A STILL-COMMENTED KEY HOLDS NOTHING, per the comment-is-unanswered
 *  convention. Reading the prompt as a value is how a field silently fills. */
/** A QUOTED ENTRY READS UNQUOTED. The yaml writer quotes what needs quoting
 *  (a test name carries colons), so a faithful read strips the wrapper —
 *  otherwise every view shows the quotes and every write wraps them again. */
const unquote = (s: string): string =>
  s.length >= 2 && ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) ? s.slice(1, -1) : s;

export function nodeList(file: string, key: string): string[] {
  try {
    const lines = nodeLines(file);
    const end = lines.indexOf("---", 1);
    const fm = lines.slice(0, end < 0 ? lines.length : end);
    const at = fm.findIndex((l) => l.startsWith(`${key}:`));
    if (at < 0) return [];
    const inline = fm[at].slice(key.length + 1).trim();
    if (inline.startsWith("[")) {
      return inline
        .replace(/^\[|\]$/g, "")
        .split(",")
        .map((s) => unquote(s.trim()))
        .filter((s) => s !== "");
    }
    if (inline !== "" && !inline.startsWith("<!--")) return [unquote(inline)];
    const out: string[] = [];
    for (const l of fm.slice(at + 1)) {
      const m = /^\s+-\s+(.*)$/.exec(l);
      if (m === null) break;
      const v = m[1].trim();
      if (v !== "" && !v.startsWith("<!--")) out.push(unquote(v));
    }
    return out;
  } catch {
    return [];
  }
}

function inboxItems(root: string, instanceRaw?: string): string[] {
  let live: string[];
  try {
    live = pendingNotes(seDir(root)).map((n) => `${n.ref} — ${(n.title ?? n.text.split("\n")[0]).slice(0, 48)}`);
  } catch {
    return [];
  }
  // AN EMPTY KEY IS NOT A SIGN-OFF. `signed_off:` with nothing after it is an
  // unsigned form, so the test wants a VALUE rather than the key's presence.
  if (instanceRaw === undefined || !/^signed_off: *\S/m.test(instanceRaw)) return live;
  return live.filter((i) => instanceRaw.includes(i.split(" — ")[0]));
}

// ── The portable copy ──────────────────────────────────────────────────

const esc = (s: string): string => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export interface IslandData {
  form: string;
  author: string;
  fields: Record<string, string>;
  /** Input labels ticked on the sheet — they travel with the fills. */
  checked: string[];
}

/** The returned file's island — the ONLY thing the ingest reads. */
export function parseIsland(html: string): IslandData | undefined {
  const m = html.match(/<script type="application\/json" id="se-form">([\s\S]*?)<\/script>/);
  if (m === null) return undefined;
  try {
    const d = JSON.parse(m[1]) as Partial<IslandData>;
    if (typeof d.form !== "string" || d.fields === null || typeof d.fields !== "object") return undefined;
    const fields = Object.fromEntries(Object.entries(d.fields ?? {}).map(([k, v]) => [k, String(v)]));
    const checked = Array.isArray(d.checked) ? d.checked.map(String) : [];
    return { form: d.form, author: typeof d.author === "string" ? d.author : "", fields, checked };
  } catch {
    return undefined;
  }
}

export interface EmbeddedDoc {
  path: string;
  content: string;
}

const SHEET_CSS = `
  * { box-sizing: border-box; margin: 0; }
  body { font: 14px/1.5 system-ui, sans-serif; color: #111; background: #e8e8e8; padding: 24px; }
  .sheet { max-width: 1240px; margin: 0 auto; background: #fff; border: 2px solid #111; }
  header { display: flex; justify-content: space-between; align-items: baseline; gap: 2em; border-bottom: 2px solid #111; padding: 10px 16px; flex-wrap: wrap; }
  h1 { font-size: 19px; } h1 .slash { color: #888; font-weight: normal; }
  .dates { font-size: 12.5px; color: #333; display: flex; gap: 1.6em; flex-wrap: wrap; }
  .dates b { color: #111; }
  .grid { display: grid; grid-template-columns: 1fr 1.25fr; }
  .col-l { border-right: 2px solid #111; }
  .box { border-bottom: 1.5px solid #111; padding: 10px 14px 12px; }
  .col-l .box:last-child, .col-r .box:last-child { border-bottom: none; }
  h2 { font-size: 12px; text-transform: uppercase; letter-spacing: .07em; color: #111; margin-bottom: 6px; }
  h2 .concrete { color: #888; text-transform: none; letter-spacing: 0; }
  h2 .tpl { float: right; font-size: 11.5px; color: #35507a; font-weight: normal; letter-spacing: 0; text-transform: none; }
  p, li { font-size: 13.5px; }
  .inputs { list-style: none; padding-left: 0; }
  .inputs li { margin: 6px 0; }
  .inputs .t { font-weight: 600; } .inputs a.t { color: #35507a; }
  .inputs .entry { font-size: 11px; color: #b3261e; border: 1px solid #b3261e; border-radius: 3px; padding: 0 4px; margin-left: .4em; }
  .inputs .d { color: #555; font-size: 12.5px; display: block; margin-left: 1.5em; }
  .field { border: 1px solid #999; border-radius: 4px; padding: 7px 10px; margin: 7px 0; }
  .field .name { font-weight: 600; font-size: 13.5px; }
  .field .req { color: #b3261e; font-size: 11.5px; margin-left: .5em; }
  .field .opt { color: #888; font-size: 11.5px; margin-left: .5em; }
  .field .tpl { float: right; font-size: 11.5px; color: #35507a; }
  .field .desc { color: #555; font-size: 12.5px; margin: 2px 0 6px; }
  .field .guide { color: #555; font-size: 12.5px; font-style: italic; margin: 2px 0 6px; }
  textarea[data-field] { width: 100%; min-height: 64px; border: 1px dashed #bbb; border-radius: 3px; background: #fcfcfc; padding: 6px 8px; font: 12.5px/1.5 system-ui, sans-serif; }
  .docs { max-width: 1240px; margin: 14px auto; }
  .docs details { background: #fff; border: 1px solid #c9c9c9; margin: 6px 0; padding: 6px 10px; }
  .docs pre { white-space: pre-wrap; font-size: 12px; padding: 8px 4px; }
  .bar { max-width: 1240px; margin: 12px auto; display: flex; gap: 1em; align-items: center; }
  .bar button { padding: .5em 1.4em; border: 1px solid #111; background: #fff; cursor: pointer; font-weight: 600; }
  .bar input { padding: .4em .6em; border: 1px solid #999; }
  .rows .row { display: flex; gap: 6px; margin: 4px 0; align-items: center; }
  .rows input { flex: 1; padding: .35em .5em; border: 1px dashed #bbb; border-radius: 3px; background: #fcfcfc; font: 12.5px system-ui, sans-serif; }
  .rows .pi { font-size: 12.5px; color: #333; flex: 0 0 42%; }
  .rows select { padding: .3em .4em; font: 12.5px system-ui, sans-serif; }
  .rows .sep { color: #888; font-size: 12px; }
  .rows .rowadd, .rows .rowdel { flex: 0 0 auto; background: #fff; border: 1px solid #999; border-radius: 3px; cursor: pointer; font-size: 11px; line-height: 16px; padding: 0 5px; color: #555; }
`;

const SHEET_JS = `
  function seCollect() {
    var fields = {};
    document.querySelectorAll("textarea[data-field]").forEach(function (t) { fields[t.getAttribute("data-field")] = t.value; });
    var acc = {};
    function push(n, line) { (acc[n] = acc[n] || []).push(line); }
    document.querySelectorAll("input[data-list]").forEach(function (t) {
      if (t.value.trim() !== "") push(t.getAttribute("data-list"), "- " + t.value.trim());
      t.setAttribute("value", t.value);
    });
    document.querySelectorAll("input[data-peritem]").forEach(function (t) {
      if (t.value.trim() !== "") push(t.getAttribute("data-peritem"), "- " + t.getAttribute("data-item") + ": " + t.value.trim());
      t.setAttribute("value", t.value);
    });
    document.querySelectorAll("input[data-findf]").forEach(function (t) {
      var row = t.parentElement;
      var a = row ? row.querySelector("input[data-finda]") : null;
      var av = a ? a.value.trim() : "";
      if (t.value.trim() !== "" || av !== "") push(t.getAttribute("data-findf"), "- " + t.value.trim() + " => " + av);
      t.setAttribute("value", t.value);
      if (a) a.setAttribute("value", a.value);
    });
    Object.keys(acc).forEach(function (n) { fields[n] = acc[n].join("\\n"); });
    document.querySelectorAll("select[data-choicesel]").forEach(function (s) {
      var n = s.getAttribute("data-choicesel");
      var r = document.querySelector('input[data-rationale="' + n + '"]');
      var rv = r ? r.value.trim() : "";
      if (r) r.setAttribute("value", r.value);
      fields[n] = (s.value + (rv !== "" ? " — " + rv : "")).trim();
      for (var i = 0; i < s.options.length; i++) {
        if (s.options[i].selected) s.options[i].setAttribute("selected", "");
        else s.options[i].removeAttribute("selected");
      }
    });
    var checked = [];
    document.querySelectorAll("input[data-input]").forEach(function (c) {
      if (c.checked) { checked.push(c.getAttribute("data-input")); c.setAttribute("checked", ""); }
      else { c.removeAttribute("checked"); }
    });
    var island = document.getElementById("se-form");
    var d = JSON.parse(island.textContent);
    d.fields = fields;
    d.checked = checked;
    d.author = (document.getElementById("se-author") || { value: "" }).value;
    island.textContent = JSON.stringify(d, null, 1);
    document.querySelectorAll("textarea[data-field]").forEach(function (t) { t.textContent = t.value; });
    return "<!doctype html>\\n" + document.documentElement.outerHTML;
  }
  function seSave() {
    var name = "form-" + JSON.parse(document.getElementById("se-form").textContent).form + ".html";
    var blob = new Blob([seCollect()], { type: "text/html" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
  }
  document.addEventListener("click", function (ev) {
    var a = ev.target.closest ? ev.target.closest("a[data-doc]") : null;
    if (!a) return;
    var d = document.getElementById(a.getAttribute("data-doc"));
    if (d) { d.open = true; d.scrollIntoView({ behavior: "smooth" }); }
  });
  // Plus adds a row below; minus removes — the last row stays.
  document.addEventListener("click", function (ev) {
    var b = ev.target.closest ? ev.target.closest(".rowadd, .rowdel") : null;
    if (!b) return;
    var row = b.parentElement;
    if (!row) return;
    if (b.className.indexOf("rowadd") >= 0) {
      var clone = row.cloneNode(true);
      clone.querySelectorAll("input").forEach(function (i) { i.value = ""; i.removeAttribute("value"); });
      row.after(clone);
      var first = clone.querySelector("input");
      if (first) first.focus();
      return;
    }
    if (row.parentElement.querySelectorAll(".row").length > 1) row.remove();
  });
  // Enter adds the next row right below the one being edited.
  document.addEventListener("keydown", function (ev) {
    if (ev.key !== "Enter") return;
    var t = ev.target;
    if (!t.matches || !t.matches("input[data-list], input[data-findf], input[data-finda]")) return;
    ev.preventDefault();
    var row = t.parentElement;
    if (!row) return;
    var clone = row.cloneNode(true);
    clone.querySelectorAll("input").forEach(function (i) { i.value = ""; i.removeAttribute("value"); });
    row.after(clone);
    var first = clone.querySelector("input");
    if (first) first.focus();
  });
`;

function renderInput(i: FormInput, docIndex: Map<string, number>, checked: Set<string>): string {
  const entry = i.entry ? '<span class="entry">before entry</span>' : "";
  const idx = i.path !== undefined ? docIndex.get(i.path) : undefined;
  const label =
    idx !== undefined
      ? `<a class="t" data-doc="doc-${idx}" href="#doc-${idx}">${esc(i.label)}</a>`
      : `<span class="t">${esc(i.label)}</span>`;
  const box = `<input type="checkbox" data-input="${esc(i.label)}"${checked.has(i.label) ? " checked" : ""}> `;
  return `<li>${box}${label}${entry}<span class="d">${esc(i.description)}</span></li>`;
}

function renderField(
  name: string,
  description: string,
  required: boolean,
  template: string,
  content: string,
  meta?: TemplateMeta,
  args: FieldArgs = NO_ARGS,
  guidance = "",
  hint?: FieldHint,
): string {
  const flag = required ? '<span class="req">required</span>' : '<span class="opt">optional</span>';
  const guide = guidance === "" ? "" : `<div class="guide">${guideHtml(guidance)}</div>`;
  // The portable copy travels with no editor to open, so the item template is
  // NAMED here rather than linked, and its path rides the chip's tooltip. The
  // mirror draws the same chip clickable.
  const at = hint?.of_template === undefined || hint.of_template === "" ? "" : ` title="${esc(hint.of_template)}"`;
  const of = hint?.of === undefined || hint.of === "" ? "" : ` · of: <span${at}>${esc(hint.of)}</span>`;
  const mech = hint?.description === undefined || hint.description === "" ? "" : `<div class="desc">${esc(hint.description)}</div>`;
  const head = `<div class="field"><span class="tpl">template: ${esc(template)}${of}</span><span class="name">${esc(name)}</span>${flag}<div class="desc">${esc(description)}</div>${mech}${guide}`;
  return `${head}${fieldEditor(name, content, meta, args, hint)}</div>`;
}

/** GUIDANCE IS PARAGRAPHS AND LISTS, and it has to RENDER as them (owner
 *  report 2026-08-08: "there is a list in the scores text, so format it like a
 *  list").
 *
 *  It used to be escaped into one div. A list authored as a list — which
 *  voice.md requires — arrived as a run of text with dashes in it, so the one
 *  place the rule is most visible was the one place it did not survive.
 *
 *  TWO SHAPES ONLY, deliberately: paragraphs and bullets. This is form help,
 *  not a document, and a full markdown renderer here would invite headings and
 *  tables into a box three lines tall. */
export function guideHtml(text: string): string {
  const out: string[] = [];
  for (const block of text.split(/\n\s*\n/)) {
    let bullets: string[] = [];
    let para: string[] = [];
    const flushList = (): void => {
      if (bullets.length === 0) return;
      out.push(`<ul>${bullets.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>`);
      bullets = [];
    };
    const flushPara = (): void => {
      if (para.length === 0) return;
      out.push(`<p>${esc(para.join(" "))}</p>`);
      para = [];
    };
    for (const l of block.split("\n").map((x) => x.trim())) {
      if (l === "") continue;
      const item = /^[-*]\s+(.*)$/.exec(l);
      if (item !== null) {
        flushPara();
        bullets.push(item[1]);
        continue;
      }
      // A CONTINUATION LINE BELONGS TO ITS BULLET. An item wrapped over two
      // lines is one item, and a new paragraph mid-list would split it.
      if (bullets.length > 0) {
        bullets[bullets.length - 1] += ` ${l}`;
        continue;
      }
      // WRAPPED LINES ARE ONE PARAGRAPH. A blank line starts the next one,
      // which is the only thing that ever does.
      para.push(l);
    }
    flushPara();
    flushList();
  }
  return out.join("");
}

const ROW_BTNS =
  '<button type="button" class="rowadd" title="add a row below">+</button><button type="button" class="rowdel" title="remove this row">−</button>';

const dashLines = (content: string): string[] =>
  content
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("- "))
    .map((l) => l.slice(2));

/** The editor IS the template's shape — rows for lists, labelled rows for
 *  known items, a dropdown with its rationale, pairs for findings. */
function fieldEditor(name: string, content: string, meta: TemplateMeta | undefined, args: FieldArgs, hint?: FieldHint): string {
  const editor = meta?.editor ?? "text";
  const ph = esc(hint?.placeholder ?? "");
  if (editor === "list") {
    const rows = [...dashLines(content), ""].map(
      (v) => `<div class="row"><input data-list="${esc(name)}" placeholder="${ph}" value="${esc(v)}">${ROW_BTNS}</div>`,
    );
    return `<div class="rows">${rows.join("")}</div>`;
  }
  if (editor === "per-item" && args.items.length > 0) {
    const rows = args.items.map((it) => {
      const hit = content
        .split("\n")
        .map((l) => l.trim())
        .find((l) => l.startsWith(`- ${it}:`));
      const answer = hit === undefined ? "" : hit.slice(`- ${it}:`.length).trim();
      return `<div class="row"><span class="pi">${esc(it)}</span><input data-peritem="${esc(name)}" data-item="${esc(it)}" placeholder="${ph}" value="${esc(answer)}"></div>`;
    });
    return `<div class="rows">${rows.join("")}</div>`;
  }
  if (editor === "choice-rationale") {
    const first = (content.split("\n")[0] ?? "").trim();
    const sep = first.indexOf(" — ");
    const chosen = sep < 0 ? first : first.slice(0, sep).trim();
    const rationale = sep < 0 ? "" : first.slice(sep + 3).trim();
    const opts = [
      '<option value=""></option>',
      ...args.options.map((o) => `<option${o === chosen ? " selected" : ""}>${esc(o)}</option>`),
    ].join("");
    return `<div class="rows"><div class="row"><select data-choicesel="${esc(name)}">${opts}</select><input data-rationale="${esc(name)}" placeholder="rationale" value="${esc(rationale)}"></div></div>`;
  }
  if (editor === "findings") {
    const pairs = dashLines(content)
      .filter((l) => l.includes(" => "))
      .map((l) => {
        const i = l.indexOf(" => ");
        return { f: l.slice(0, i), a: l.slice(i + 4) };
      });
    const rows = [...pairs, { f: "", a: "" }].map(
      (p) =>
        `<div class="row"><input data-findf="${esc(name)}" placeholder="finding" value="${esc(p.f)}"><span class="sep">=&gt;</span><input data-finda="${esc(name)}" placeholder="answer" value="${esc(p.a)}">${ROW_BTNS}</div>`,
    );
    return `<div class="rows">${rows.join("")}</div>`;
  }
  return `<textarea data-field="${esc(name)}">${esc(content)}</textarea>`;
}

function renderHeader(model: StateFormModel): string {
  const meta = Object.entries(model.header)
    .map(([k, v]) => `<span>${esc(k)} <b>${esc(v === "" ? "____" : v)}</b></span>`)
    .join("");
  const slash = `<span class="slash">/ ${esc(model.form)}</span>`;
  return `<header><h1>Evidence form ${slash}</h1><div class="dates">${meta}</div></header>`;
}

/** The whole portable sheet: fills bound to the ONE island, the reading
 *  and every template baked in behind their links, save as download. */
export function buildPortableForm(
  model: StateFormModel,
  fills: Record<string, string>,
  docs: EmbeddedDoc[],
  checked: string[] = [],
): string {
  const docIndex = new Map(docs.map((d, i) => [d.path, i]));
  const done = new Set(checked);
  const follow = model.follow_up_label === "" ? "" : `<span class="concrete">/ ${esc(model.follow_up_label)}</span> `;
  // ANYTHING ELSE IS FOLLOW-UP, NOT EVIDENCE (owner, 2026-08-06). It asks
  // what is left over, which is the same question box 6 asks.
  const TAIL = ["current_situation", "follow_up", "anything_else"];
  const one = (f: FormTemplate["fields"][number]): string => {
    const tpl = model.field_templates[f.name] ?? "free-form";
    return renderField(
      f.name,
      f.description,
      f.required,
      tpl,
      fills[f.name] ?? "",
      model.template_meta[tpl],
      model.field_args[f.name],
      f.guidance ?? "",
      model.field_hints[f.name],
    );
  };
  const evid = model.template.fields
    .filter((f) => !TAIL.includes(f.name))
    .map(one)
    .join("");
  const spill = model.template.fields
    .filter((f) => f.name === "anything_else")
    .map(one)
    .join("");
  const island: IslandData = { form: model.form, author: "", fields: fills, checked };
  const left =
    `<div class="box"><h2>1&nbsp;&nbsp;Description</h2><p>${esc(model.description)}</p></div>` +
    `<div class="box"><h2>2&nbsp;&nbsp;Motivation</h2><p>${esc(model.motivation)}</p></div>` +
    `<div class="box"><h2>3&nbsp;&nbsp;Current situation <span class="tpl">template: ${esc(model.field_templates.current_situation ?? "free-form")}</span></h2>` +
    `<textarea data-field="current_situation">${esc(fills.current_situation ?? "")}</textarea></div>` +
    `<div class="box"><h2>4&nbsp;&nbsp;Inputs</h2><ul class="inputs">${model.inputs.map((i) => renderInput(i, docIndex, done)).join("")}</ul></div>`;
  const right =
    `<div class="box"><h2>5&nbsp;&nbsp;Evidence</h2>${evid}</div>` +
    `<div class="box"><h2>6&nbsp;&nbsp;Follow-up ${follow}<span class="tpl">template: ${esc(model.field_templates.follow_up ?? "free-form")}</span></h2>` +
    `<textarea data-field="follow_up">${esc(fills.follow_up ?? "")}</textarea>${spill}</div>`;
  const embedded = docs
    .map((d, i) => `<details id="doc-${i}"><summary>${esc(d.path)}</summary><pre>${esc(d.content)}</pre></details>`)
    .join("");
  return (
    `<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><title>${esc(model.title)}</title>` +
    `<style>${SHEET_CSS}</style></head><body>` +
    `<div class="sheet">${renderHeader(model)}<div class="grid"><div class="col-l">${left}</div><div class="col-r">${right}</div></div></div>` +
    `<div class="bar"><label>author <input id="se-author" placeholder="who fills this copy"></label>` +
    `<button type="button" onclick="seSave()">save the filled copy</button>` +
    `<span style="font-size:12px;color:#555">Fill the fields, set your name, save — send the file back, and it lands as evidence.</span></div>` +
    `<div class="docs"><h2 style="max-width:1240px;margin:0 auto 4px;font:600 12px system-ui;letter-spacing:.07em;text-transform:uppercase;color:#666">The reading, baked in</h2>${embedded}</div>` +
    `<script type="application/json" id="se-form">${JSON.stringify(island, null, 1)}</script>` +
    `<script>${SHEET_JS}</script></body></html>`
  );
}
