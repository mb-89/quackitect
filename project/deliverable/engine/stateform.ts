// see dsp-evidence-forms.md#the-state-form
import { readdirSync, readFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { type ExposureView, exposureView, type MetricRow, type ScenarioDeckView, scenarioDeckView, structureMetrics } from "./atamwalk.ts";
import { catalogItems, trizParameterItems } from "./catalogs.ts";
import { type Judgment, type RelationKind, type WalkResult, walk } from "./compare.ts";
import { clusterDsm, type Dsm, flowMatrix } from "./dsm.ts";
import { type ElementMatrixView, elementMatrixView } from "./elematrix.ts";
import type { FormTemplate } from "./forms.ts";
import { pendingNotes } from "./inbox.ts";
import type { EvidenceField, MachineDecl, StateDecl } from "./machine.ts";
import { bare, type MorphBox, type MorphCell, type MorphLine, type MorphRow, orderLines, storedOrder } from "./morphbox.ts";
import { noteOf, parseStateNote, readNode, section } from "./notes.ts";
import { type ParetoView, pareto, readScores } from "./pareto.ts";
import { seDir } from "./paths.ts";
import { type PughView, pughView, type SensitivityView, sensitivityView } from "./pugh.ts";
import { type GuidanceDoc, pulledFor } from "./pull.ts";
import { itemTemplate, itemTemplateRel, loadTrace, nodeLines, traceDir } from "./trace.ts";

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
  /** see dsp-evidence-forms.md#a-live-source-that-resolves-to-nothing-says-so */
  empty_sources: string[];
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
  /** see dsp-evidence-forms.md#what-each-picked-columns-offer-is-called */
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

/** see dsp-evidence-forms.md#type-prefix-and-folder-filled-from-the-fields-declared */
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

/** A field with nothing declared. Exported so a test can spread it rather
 *  than restate fifteen keys it does not care about. */
export const NO_ARGS: FieldArgs = {
  of: "",
  covers: "",
  options: [],
  items: [],
  empty_sources: [],
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

/** THE MODELLED BOUNDARIES A GATE MUST READ THE INSTRUMENT FOR, one row each.
 *
 *  THE INSTRUMENT IS NOT THE DELIVERABLE. A READER WHO OWES AN ANSWER IS.
 *  i12 shipped the one-second rule, the timings were recorded, and two days
 *  later 1834 of 8424 calls were over it because nothing in the machine ever
 *  put the number in front of anybody. This is the field that does.
 *
 *  ONE BOUNDARY IS COMPUTABLE TODAY, and that is stated rather than hidden.
 *  Every lane call crosses if-agent-harness-to-entrypoint, so the log answers
 *  for it directly. The other twelve need their crossings attributed in the
 *  log before they can be counted, and until then a silent zero on them would
 *  be a measured zero dressed as a clean bill. */
export function breachItems(): string[] {
  // see dsp-evidence-forms.md#the-label-is-stable-and-the-count-is-the
  return ["if-agent-harness-to-entrypoint"];
}

/** THE PLAIN TRACE TYPES, as a table rather than a branch each. They differ
 *  only in the type name, so a chain of them is sixteen decisions where there
 *  is really one lookup. */
const TYPED_SOURCES: Record<string, string> = {
  $experiments: "experiment",
  $requirements: "requirement",
  "$test-specs": "test-spec",
  "$design-specs": "design-spec",
  "$value-props": "value-prop",
};

/** THE CATALOGUES. A known set is never typed from memory and never hard
 *  coded — it is read from the method card that holds it, so editing the card
 *  edits the offer (owner ruling 2026-08-08). catalogs.ts says how. */
const CATALOG_SOURCES: Record<string, string> = {
  $iq_checklist: "iq_checklist",
  $sweep_surfaces: "sweep_surfaces",
  $heuristics: "heuristics",
  $transform_operators: "transform_operators",
  $triz_separations: "triz_separations",
};

/** see dsp-the-goal-binds-the-walk.md#the-iterations-own-goals */
export function goalItems(evidenceDir?: string): string[] {
  if (evidenceDir === undefined) return [];
  const note = noteOf(join(evidenceDir, "gate-kickoff.md"));
  if (note === undefined) return [];
  return section(note.body, "goals")
    .replace(/<!--[\s\S]*?-->/g, "")
    .split("\n")
    .filter((l) => /^\s*[-*]\s+/.test(l))
    .map((l) => l.replace(/^\s*[-*]\s+/, "").trim())
    .filter((l) => l !== "");
}

/** ONE SOURCE RESOLVER, so a `$name` means the same thing wherever it is
 *  written. Items and picks both come through here; a literal passes
 *  straight out, which is what makes a fixed list legal beside a live one. */
function resolveSource(i: string, root: string, traceRoot: string, instanceRaw?: string, evidenceDir?: string): string[] {
  if (i === "$inbox") return inboxItems(root, instanceRaw);
  if (i === "$goals") return goalItems(evidenceDir);
  if (i === "$breaches") return breachItems();
  if (i === "$assumptions") return assumptionItems(traceRoot);
  if (i === "$criterion_pool") return criterionPoolItems(traceRoot);
  if (i === "$compounding_suspects") return compoundingSuspectItems(traceRoot);
  if (i === "$criterion_axes") return criterionAxisItems(traceRoot);
  if (i === "$functions") return functionItems(traceRoot);
  if (i === "$clusters") return clusterItems(traceRoot);
  if (i === "$flows") return flowItems(traceRoot);
  if (i === "$options") return optionItems(traceRoot);
  const typed = TYPED_SOURCES[i];
  if (typed !== undefined) return typedItems(traceRoot, typed);
  const catalog = CATALOG_SOURCES[i];
  if (catalog !== undefined) return catalogItems(root, catalog);
  if (i === "$promotions") return promotionItems(traceRoot);
  if (i === "$claim-specs") return claimSpecItems(traceRoot);
  if (i === "$must-stories") return mustStoryItems(traceRoot);
  if (i === "$candidates") return candidateItems(traceRoot);
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

/** A field nobody answered: blank, or nothing but the template's comment. */
export const unanswered = (v: string): boolean => v.trim() === "" || /^<!--[\s\S]*-->$/.test(v.trim());

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
      // see dsp-evidence-forms.md#a-derived-field-is-a-reading
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
  // EACH SOURCE IS RESOLVED ON ITS OWN, so a source that came back with nothing
  // can be named. Flattening first loses which of several was the empty one.
  const perSource = (f.items ?? []).map((i) => [i, resolveSource(i, root, traceRoot, instanceRaw, evidenceDir)] as const);
  const resolved = perSource.flatMap(([, got]) => got);
  return {
    // A LITERAL IS NOT A LIVE SOURCE. `$` is reserved for the ones the corpus
    // answers, so only those can be empty in the sense this field means.
    empty_sources: perSource.filter(([i, got]) => i.startsWith("$") && got.length === 0).map(([i]) => i),
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
        [...new Set(srcs.flatMap((src) => resolveSource(src, root, traceRoot, instanceRaw, evidenceDir)))],
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
export function fmList(v: unknown): string[] {
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
  /** Where the RECORD's trace lives — a record owns its own nodes, so a live
   *  item list has to be told, never guessed.
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

/** see dsp-evidence-forms.md#inbox-resolved-live */
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

/** see dsp-evidence-forms.md#the-criterion-pool-is-requirements */
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

/** see dsp-evidence-forms.md#promotions-resolved-live */
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
  // see dsp-evidence-forms.md#the-hint-order
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
