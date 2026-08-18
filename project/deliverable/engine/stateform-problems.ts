// WHAT A FORM STILL OWES: every check a state form is measured against, from
// the template's own fields to the laws a record's corpus must satisfy.
//
// Split out of stateform.ts. It reads the model and the corpus and returns
// lines of prose; it renders nothing and writes nothing.
//
import { existsSync, readdirSync } from "node:fs";
import { basename, join } from "node:path";
import { catalogItems } from "./catalogs.ts";
import { elementMatrixView } from "./elematrix.ts";
import { blockingRules, lintProse } from "./lint.ts";
import type { StateDecl } from "./machine.ts";
import { bare } from "./morphbox.ts";
import { noteOf, section } from "./notes.ts";
import {
  choiceOf,
  type FieldArgs,
  fmList,
  NO_ARGS,
  nodeField,
  rationaleOf,
  type StateFormModel,
  type TemplateMeta,
  tableRow,
  templateMeta,
  unanswered,
} from "./stateform.ts";
import { conformance, duplicateIds, itemTemplateRel, loadTrace, refsIn, refsInRows, type TraceNode } from "./trace.ts";
import { edgeProblems, traceSchema } from "./traceschema.ts";

// see dsp-evidence-forms.md#what-a-form-still-owes

const escapeRe = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, (c) => `\\${c}`);

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

/** see dsp-evidence-forms.md#does-a-standing-claim-still-pass-its-own-form */
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

/** see dsp-the-goal-binds-the-walk.md#the-specify-build-law */
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

/** see dsp-evidence-forms.md#the-fill-story-law */
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

/** see dsp-evidence-forms.md#the-records-own-experiments-where-its-fold-back-says-so */
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

/** see dsp-evidence-forms.md#the-record-the-walk-is-in */
function shortRecordId(s: string): string {
  return /^([a-z]+\d+)/.exec(s)?.[1] ?? s;
}

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
    for (const e of names) {
      if (e === cand || e.startsWith(`${cand}-`) || shortRecordId(e) === shortRecordId(cand)) return e;
    }
  }
  return undefined;
}

/** Promotions are a filter, never a list — and none may be lost: every
 *  promoted experiment carries `chunk:` naming its step in the drawing. */
function promotionAssignmentProblems(corpus: { id: string; type: string; file?: string }[], recordRoot: string, record?: string): string[] {
  const out: string[] = [];
  const only = recordDirFor(recordRoot, record);
  const steps = seededStepIds(recordRoot, only);
  // see dsp-evidence-forms.md#a-promotion-belongs-to-the-iteration-that-ran-the
  const own = foldBackExperiments(recordRoot, only);
  // see dsp-evidence-forms.md#the-owner-is-compared-as-a-short-id
  const owner = only === undefined ? undefined : shortRecordId(only);
  for (const n of corpus) {
    if (n.type !== "experiment" || n.file === undefined) continue;
    if (own !== undefined && !own.has(n.id)) continue;
    const fm = noteOf(n.file)?.frontmatter ?? {};
    const mintedIn = String(fm.minted_in ?? "").trim();
    // OURS OR NOT ASKED ABOUT. An absent stamp is not this record's either —
    // that is the half the ruling reversed, and it is what `$promotions` has
    // always done, so the two agree now instead of disagreeing about a blank.
    //
    // ONLY WHERE THE OWNER IS KNOWN. With no resolvable record there is no
    // "ours" to compare against, and skipping everything would turn the law off
    // silently — the exact failure mode the comment above records twice.
    if (own === undefined && owner !== undefined && shortRecordId(mintedIn) !== owner) continue;
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

/** see dsp-the-goal-binds-the-walk.md#the-trace-design-law */
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

/** see dsp-evidence-forms.md#the-author-tests-law */
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
  // see dsp-the-goal-binds-the-walk.md#a-demonstration-spec-may-verify-nothing
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

/** see dsp-the-goal-binds-the-walk.md#the-riskiest-assumptions-are-validated */
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

/** see dsp-evidence-forms.md#the-structural-laws */
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

/** see dsp-evidence-forms.md#a-file-reference-resolves-on-disk */
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
  // see dsp-evidence-forms.md#a-card-answers-in-rows
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

/** see dsp-evidence-forms.md#coverage-is-mutual-and-both-sides-are-computed — req-a-coverage-check-computes-both-sides */
function coverProblems(name: string, covers: string, refs: string[], byId: Map<string, TraceNode>, corpus: TraceNode[]): string[] {
  if (covers === "" || covers === undefined) return [];
  const out: string[] = [];
  // THE LISTED SIDE IS STILL CHECKED, because a node the author names that
  // serves nothing is a fact about THEIR work rather than about the corpus.
  const orphan = refs.filter((r) => {
    const n = byId.get(r);
    return n !== undefined && !n.refines.some((p) => byId.get(p)?.type === covers);
  });
  if (orphan.length > 0) out.push(`${name}: each one refines a ${covers} — ${orphan.join(" · ")} refines none`);
  // THE COVERING SIDE IS COMPUTED FROM THE WHOLE CORPUS, not from `refs`.
  // Every node that refines something of the covered type counts, whether or
  // not anybody listed it.
  const served = new Set<string>();
  for (const n of corpus) for (const p of n.refines) served.add(p);
  const bare = corpus.filter((n) => n.type === covers && !served.has(n.id)).map((n) => n.id);
  // AND THE HOLE IS STILL REFUSED. Computing both sides must not soften the
  // check into a report: a node of the covered type that NOTHING in the
  // corpus refines is a real gap, and it is still named by id.
  if (bare.length > 0) out.push(`${name}: each ${covers} is covered — nothing in the corpus refines ${bare.join(" · ")}`);
  return out;
}

/** The first cell of a row, as a bare id — wiki brackets are how a reader
 *  writes a node and how the view renders one, so both read the same. */
const rowId = (cells: string[]): string => (cells[0] ?? "").replace(/^\[\[|\]\]$/g, "").trim();

/** see dsp-evidence-forms.md#a-cell-that-lost-its-tail */
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

/** see dsp-evidence-forms.md#a-chart-needs-candidates-drawn-across-it */
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

/** THE STATUSES WITH NOBODY LEFT HOLDING THE CLAIM. A closed entry is
 *  finished, a decided one has had its answer, a superseded one was replaced.
 *  None of the three can carry an owed box. */
const SETTLED = new Set(["closed", "decided", "superseded"]);

/** Does `ref` name a LIVE entry in the raid register? An owed box points at a
 *  register entry rather than a tick, so the ref has to resolve to a standing
 *  debt — settled or missing entries refuse exactly like an unchecked box,
 *  because there is nobody left holding the claim.
 *
 *  IT TESTED `status === "open"` AND ITS OWN COMMENT SAID OTHERWISE (i6). The
 *  comment named three dead statuses; the code refused all five that are not
 *  `open`, which are `probed`, `mitigated`, `accepted` and `deferred` — every
 *  one of them a live entry with an owner and a trigger.
 *
 *  ACCEPTED IS THE ONE THAT BIT. Accepted debt is the strongest carrier there
 *  is: somebody looked at it and decided to ship anyway, on the record. Two
 *  cloud demonstrations name such an entry in their own text as the reason
 *  they cannot be observed, and the check called it unresolved.
 *
 *  THE CORPUS DISAGREED WITH ITSELF TOO, which is how the narrow rule survived.
 *  `raid-debt-human-observed-demonstrations` carries live accepted debt as
 *  `open`; `raid-debt-cloud-validation-needs-a-machine-this-one-cannot-make`
 *  carries the same shape as `accepted`. Only the first one ever worked here,
 *  so the rule looked right for as long as nobody used the other. */
function openRaidRef(ref: string, corpus?: TraceNode[]): boolean {
  const n = (corpus ?? []).find((n) => n.type === "raid" && n.id === ref);
  if (n === undefined || n.file === undefined) return false;
  const status = nodeField(n.file, "status");
  return status !== "" && !SETTLED.has(status);
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
  if (meta.editor === "node-table") return [...out, ...nodeTableProblems(name, args, content)];
  // see dsp-evidence-forms.md#a-move-owes-a-rationale
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
  // see dsp-evidence-forms.md#checking-is-the-claim-and-owed-is-the-third-state
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
  // see dsp-evidence-forms.md#an-empty-set-is-a-claim
  if (meta.editor === "morph-box") return [...out, ...chartProblems(name, content, corpus)];
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

/** see dsp-evidence-forms.md#a-choice-its-reason */
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
