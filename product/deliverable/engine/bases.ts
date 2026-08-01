// THE CONTROLS WRITE THE FILE.
//
// Properties, Sort, Filter, group-by and Add view are an EDITOR over the .base
// file, exactly as the cell editor is an editor over a note's frontmatter. One
// law, two surfaces: the file is the content, the view is the instrument.
// Ticking a property is not a display state that happens to persist — it is a
// write, and what re-renders afterwards is what is on disk.
//
// EVERY EDIT ROUND-TRIPS THE WHOLE DOCUMENT. The parsed BaseSpec models the
// subset we render, which is NOT the subset Obsidian writes: it has no
// formulas, no summaries, no limit. Serialising from the spec would delete the
// owner's own keys the first time a column was ticked, so a mutation is
// applied to the FULL parsed YAML and everything unmodelled travels through
// untouched.
//
// THE WRITE FORMATS, IT DOES NOT SPLICE. Same contract as the frontmatter
// writer and as pressing save in an editor: parse what is there, print a
// properly formatted result. Idiosyncratic spacing does not survive, and that
// is the accepted cost of never producing a file that does not parse.
import { readFileSync, writeFileSync } from "node:fs";
import { isAbsolute, join, resolve } from "node:path";
import { parse, stringify } from "yaml";
import { CLAUSES, Rejection } from "./errors.ts";
import { parseExpr, type Node } from "./expr.ts";
import { vaultDir } from "./tables.ts";

const SRC = "engine/bases.ts";

type Doc = Record<string, unknown>;
type ViewDoc = Record<string, unknown>;

export const LAYOUTS = ["table", "cards", "list", "pivot"] as const;
export type Layout = (typeof LAYOUTS)[number];

function baseFile(root: string, rel: string): string {
  const dir = vaultDir(root);
  const abs = isAbsolute(rel) ? rel : resolve(dir, rel);
  if (!abs.startsWith(resolve(dir))) {
    throw new Rejection({
      clause: CLAUSES.PATH_ESCAPE,
      expected: "a .base file inside the vault",
      got: rel,
      remedy: { tool: "se_file_list", args: { dir: "product" }, note: "a control may only write a base the vault owns" },
      source: SRC,
    });
  }
  if (!abs.endsWith(".base")) {
    throw new Rejection({
      clause: CLAUSES.REQUIRED_ARGS,
      expected: "a .base file",
      got: rel,
      remedy: { tool: "se_file_list", args: { dir: "product" }, note: "the controls edit a base, never a note" },
      source: SRC,
    });
  }
  return abs;
}

/** Read, hand the whole document to the caller, write what comes back. */
export function editBase(root: string, rel: string, fn: (doc: Doc) => void): string {
  const abs = baseFile(root, rel);
  let raw: string;
  try {
    raw = readFileSync(abs, "utf8");
  } catch {
    raw = "";
  }
  const doc = (raw.trim() === "" ? {} : parse(raw)) as Doc;
  if (doc === null || typeof doc !== "object" || Array.isArray(doc)) {
    throw new Rejection({
      clause: CLAUSES.REQUIRED_ARGS,
      expected: "a base whose top level is a mapping",
      got: rel,
      remedy: { tool: "se_file_read", args: { path: rel }, note: "section 1 of product/spec/bases-syntax.md gives the five top-level keys" },
      source: SRC,
    });
  }
  fn(doc);
  const text = stringify(doc, { indent: 2, lineWidth: 0 });
  writeFileSync(abs, text);
  return text;
}

function views(doc: Doc): ViewDoc[] {
  if (!Array.isArray(doc.views)) doc.views = [];
  return doc.views as ViewDoc[];
}

function findView(doc: Doc, name: string): ViewDoc {
  const list = views(doc);
  const hit = list.find((v) => String(v.name ?? "") === name);
  if (hit === undefined) {
    throw new Rejection({
      clause: CLAUSES.REQUIRED_ARGS,
      expected: list.length > 0 ? `a view in this base: ${list.map((v) => String(v.name)).join(", ")}` : "a view — this base declares none",
      got: name,
      remedy: { tool: "se_file_read", args: { path: "product/spec/bases-syntax.md" }, note: "section 6 covers views" },
      source: SRC,
    });
  }
  return hit;
}

/** Drop a key rather than writing an empty one: an empty clause is noise. */
function set(target: Record<string, unknown>, key: string, value: unknown): void {
  const empty = value === undefined || value === null || (Array.isArray(value) && value.length === 0);
  if (empty) delete target[key];
  else target[key] = value;
}

// ---------------------------------------------------------------------------
// PROPERTIES — the column picker
// ---------------------------------------------------------------------------

/** Tick or untick a column. A tick appends, so the order is the order ticked. */
export function toggleProperty(root: string, rel: string, view: string, property: string, on: boolean): string {
  return editBase(root, rel, (doc) => {
    const v = findView(doc, view);
    const order = Array.isArray(v.order) ? (v.order as string[]).map(String) : [];
    const at = order.indexOf(property);
    if (on && at === -1) order.push(property);
    if (!on && at !== -1) order.splice(at, 1);
    set(v, "order", order);
  });
}

/** The whole column list at once, which is what a drag-reorder sends. */
export function setOrder(root: string, rel: string, view: string, order: string[]): string {
  return editBase(root, rel, (doc) => {
    set(findView(doc, view), "order", [...order]);
  });
}

/** Hide every column. The popover's own bulk action. */
export function hideAll(root: string, rel: string, view: string): string {
  return setOrder(root, rel, view, []);
}

/** A column's heading. Clearing it falls back to the property's own name. */
export function setDisplayName(root: string, rel: string, property: string, name: string | null): string {
  return editBase(root, rel, (doc) => {
    if (doc.properties === undefined || doc.properties === null) doc.properties = {};
    const props = doc.properties as Record<string, Record<string, unknown>>;
    if (name === null || name.trim() === "") {
      if (props[property] !== undefined) {
        delete props[property].displayName;
        if (Object.keys(props[property]).length === 0) delete props[property];
      }
      if (Object.keys(props).length === 0) delete doc.properties;
      return;
    }
    props[property] = { ...(props[property] ?? {}), displayName: name };
  });
}

// ---------------------------------------------------------------------------
// SORT — which carries group-by, because the popover does
// ---------------------------------------------------------------------------

export interface SortClause {
  property: string;
  direction: "ASC" | "DESC";
}

export function setSort(root: string, rel: string, view: string, sort: SortClause[]): string {
  return editBase(root, rel, (doc) => {
    set(findView(doc, view), "sort", sort.map((s) => ({ property: s.property, direction: s.direction })));
  });
}

/**
 * Group by one property. Obsidian supports exactly one, and says so, so a
 * second is refused rather than quietly dropped.
 */
export function setGroupBy(root: string, rel: string, view: string, property: string | null, direction: "ASC" | "DESC" = "ASC"): string {
  return editBase(root, rel, (doc) => {
    const v = findView(doc, view);
    if (property === null || property.trim() === "") {
      delete v.groupBy;
      return;
    }
    v.groupBy = { property, direction };
  });
}

// ---------------------------------------------------------------------------
// FILTER — a builder over the expression language, with the raw escape
//
// The popover shows rows, and the `</>` button shows the expression the row
// compiles to. Both write the SAME thing, because a filter in the file is
// always an expression string. A row that cannot be read back as one of the
// shapes below simply shows raw, which is the honest answer rather than a
// mangled approximation.
// ---------------------------------------------------------------------------

export interface FilterRow {
  property: string;
  operator: string;
  value?: string;
}

export type FilterTree = string | { and: FilterTree[] } | { or: FilterTree[] } | { not: FilterTree };

export interface Operator {
  id: string;
  label: string;
  /** Which value types the operator is offered for. Empty means any. */
  types: string[];
  /** Whether the row takes a value box. */
  takesValue: boolean;
  build(property: string, value: string): string;
}

const quote = (v: string): string => JSON.stringify(v);

export const OPERATORS: Operator[] = [
  { id: "is", label: "is", types: [], takesValue: true, build: (p, v) => `${p} == ${quote(v)}` },
  { id: "isNot", label: "is not", types: [], takesValue: true, build: (p, v) => `${p} != ${quote(v)}` },
  { id: "contains", label: "contains", types: ["string", "list"], takesValue: true, build: (p, v) => `${p}.contains(${quote(v)})` },
  { id: "notContains", label: "does not contain", types: ["string", "list"], takesValue: true, build: (p, v) => `!${p}.contains(${quote(v)})` },
  { id: "startsWith", label: "starts with", types: ["string"], takesValue: true, build: (p, v) => `${p}.startsWith(${quote(v)})` },
  { id: "endsWith", label: "ends with", types: ["string"], takesValue: true, build: (p, v) => `${p}.endsWith(${quote(v)})` },
  { id: "isEmpty", label: "is empty", types: [], takesValue: false, build: (p) => `${p}.isEmpty()` },
  { id: "isNotEmpty", label: "is not empty", types: [], takesValue: false, build: (p) => `!${p}.isEmpty()` },
  { id: "gt", label: "is greater than", types: ["number"], takesValue: true, build: (p, v) => `${p} > ${v}` },
  { id: "lt", label: "is less than", types: ["number"], takesValue: true, build: (p, v) => `${p} < ${v}` },
  { id: "gte", label: "is at least", types: ["number"], takesValue: true, build: (p, v) => `${p} >= ${v}` },
  { id: "lte", label: "is at most", types: ["number"], takesValue: true, build: (p, v) => `${p} <= ${v}` },
  { id: "after", label: "is after", types: ["date"], takesValue: true, build: (p, v) => `${p} > date(${quote(v)})` },
  { id: "before", label: "is before", types: ["date"], takesValue: true, build: (p, v) => `${p} < date(${quote(v)})` },
  { id: "hasTag", label: "has tag", types: ["file"], takesValue: true, build: (_p, v) => `file.hasTag(${quote(v)})` },
  { id: "linksTo", label: "links to", types: ["file"], takesValue: true, build: (_p, v) => `file.hasLink(${quote(v)})` },
];

const BY_ID = new Map(OPERATORS.map((o) => [o.id, o]));

/** What a builder row compiles to. The only thing ever written to the file. */
export function toExpression(row: FilterRow): string {
  const op = BY_ID.get(row.operator);
  if (op === undefined) {
    throw new Rejection({
      clause: CLAUSES.REQUIRED_ARGS,
      expected: `a filter operator: ${OPERATORS.map((o) => o.id).join(", ")}`,
      got: row.operator,
      remedy: { tool: "se_file_read", args: { path: "product/deliverable/engine/bases.ts" }, note: "OPERATORS is the whole vocabulary the builder offers" },
      source: SRC,
    });
  }
  return op.build(row.property, row.value ?? "");
}

/** A dotted reference chain, as written. */
function refText(n: Node): string | null {
  if (n.k === "id") return n.name;
  if (n.k === "prop") {
    const base = refText(n.x);
    return base === null ? null : `${base}.${n.name}`;
  }
  return null;
}

const literal = (n: Node): string | null => (n.k === "lit" && (typeof n.v === "string" || typeof n.v === "number") ? String(n.v) : null);

/**
 * Read an expression back into a builder row, or answer null.
 *
 * Null is not a failure. It is the surface being told to show the raw
 * expression instead of a form that would misrepresent it, which is what the
 * `</>` toggle exists for.
 */
export function fromExpression(src: string): FilterRow | null {
  let node: Node;
  try {
    node = parseExpr(src);
  } catch {
    return null;
  }
  return matchRow(node);
}

function matchRow(node: Node): FilterRow | null {
  if (node.k === "unary" && node.op === "!") {
    const inner = node.x;
    if (inner.k === "call" && inner.recv !== null) {
      const p = refText(inner.recv);
      if (p !== null && inner.name === "isEmpty" && inner.args.length === 0) return { property: p, operator: "isNotEmpty" };
      if (p !== null && inner.name === "contains" && inner.args.length === 1) {
        const v = literal(inner.args[0]);
        if (v !== null) return { property: p, operator: "notContains", value: v };
      }
    }
    return null;
  }

  if (node.k === "call" && node.recv !== null) {
    const p = refText(node.recv);
    if (p === null) return null;
    if (p === "file" && node.name === "hasTag" && node.args.length === 1) {
      const v = literal(node.args[0]);
      if (v !== null) return { property: "file", operator: "hasTag", value: v };
    }
    if (p === "file" && node.name === "hasLink" && node.args.length === 1) {
      const v = literal(node.args[0]);
      if (v !== null) return { property: "file", operator: "linksTo", value: v };
    }
    if (node.name === "isEmpty" && node.args.length === 0) return { property: p, operator: "isEmpty" };
    const named: Record<string, string> = { contains: "contains", startsWith: "startsWith", endsWith: "endsWith" };
    const id = named[node.name];
    if (id !== undefined && node.args.length === 1) {
      const v = literal(node.args[0]);
      if (v !== null) return { property: p, operator: id, value: v };
    }
    return null;
  }

  if (node.k === "binary") {
    const p = refText(node.a);
    if (p === null) return null;
    const ops: Record<string, string> = { "==": "is", "!=": "isNot", ">": "gt", "<": "lt", ">=": "gte", "<=": "lte" };
    const id = ops[node.op];
    if (id === undefined) return null;
    // `x > date("...")` is the date form of the same comparison.
    if (node.b.k === "call" && node.b.recv === null && node.b.name === "date" && node.b.args.length === 1) {
      const v = literal(node.b.args[0]);
      if (v === null) return null;
      if (node.op === ">") return { property: p, operator: "after", value: v };
      if (node.op === "<") return { property: p, operator: "before", value: v };
      return null;
    }
    const v = literal(node.b);
    return v === null ? null : { property: p, operator: id, value: v };
  }

  return null;
}

/**
 * What the surface posts: the same tree shape, but a leaf may still be a
 * BUILDER ROW rather than an expression.
 *
 * The templates that turn a row into an expression live in OPERATORS and stay
 * there. A client that built its own expressions would be a second copy of
 * that vocabulary, drifting the first time an operator is added.
 */
export type PostedTree = string | { r: FilterRow } | { and: PostedTree[] } | { or: PostedTree[] } | { not: PostedTree };

/** Compile a posted tree to expressions. An empty group answers null. */
export function compileTree(t: PostedTree | null | undefined): FilterTree | null {
  if (t === null || t === undefined) return null;
  if (typeof t === "string") return t.trim() === "" ? null : t;
  if ("r" in t) {
    const expr = toExpression(t.r);
    return expr.trim() === "" ? null : expr;
  }
  if ("not" in t) {
    const inner = compileTree(t.not);
    return inner === null ? null : { not: inner };
  }
  const key = "and" in t ? "and" : "or";
  const kids = ((key === "and" ? t.and : (t as { or: PostedTree[] }).or) ?? []).map(compileTree).filter((k): k is FilterTree => k !== null);
  if (kids.length === 0) return null;
  return key === "and" ? { and: kids } : { or: kids };
}

/** The whole tree for one view, as the popover's "This view" half writes it. */
export function setViewFilters(root: string, rel: string, view: string, tree: FilterTree | null): string {
  return editBase(root, rel, (doc) => {
    const v = findView(doc, view);
    if (tree === null) delete v.filters;
    else v.filters = tree;
  });
}

/** The "All views" half: one tree at the top of the file, ANDed with each view's. */
export function setGlobalFilters(root: string, rel: string, tree: FilterTree | null): string {
  return editBase(root, rel, (doc) => {
    if (tree === null) delete doc.filters;
    else doc.filters = tree;
  });
}

// ---------------------------------------------------------------------------
// VIEWS — the switcher, and Configure view
// ---------------------------------------------------------------------------

function assertLayout(type: string): void {
  if ((LAYOUTS as readonly string[]).includes(type)) return;
  throw new Rejection({
    clause: CLAUSES.REQUIRED_ARGS,
    expected: `a layout: ${LAYOUTS.join(", ")}`,
    got: type,
    remedy: { tool: "se_file_read", args: { path: "product/deliverable/engine/bases.ts" }, note: "LAYOUTS is the registry a new renderer joins" },
    source: SRC,
  });
}

function assertFreeName(doc: Doc, name: string): void {
  if (name.trim() === "") {
    throw new Rejection({
      clause: CLAUSES.REQUIRED_ARGS,
      expected: "a view name",
      got: "an empty name",
      remedy: { tool: "se_file_read", args: { path: "product/spec/bases-syntax.md" }, note: "a view is addressed by name, so it needs one" },
      source: SRC,
    });
  }
  if (views(doc).some((v) => String(v.name ?? "") === name)) {
    throw new Rejection({
      clause: CLAUSES.REQUIRED_ARGS,
      expected: "a view name this base does not already use",
      got: name,
      remedy: { tool: "se_file_read", args: { path: "product/spec/bases-syntax.md" }, note: "an embed addresses a view by name, so two of a name is ambiguous" },
      source: SRC,
    });
  }
}

export function addView(root: string, rel: string, name: string, type: Layout = "table"): string {
  assertLayout(type);
  return editBase(root, rel, (doc) => {
    assertFreeName(doc, name);
    views(doc).push({ type, name, order: [] });
  });
}

export function renameView(root: string, rel: string, from: string, to: string): string {
  return editBase(root, rel, (doc) => {
    const v = findView(doc, from);
    if (from !== to) assertFreeName(doc, to);
    v.name = to;
  });
}

export function setLayout(root: string, rel: string, view: string, type: Layout): string {
  assertLayout(type);
  return editBase(root, rel, (doc) => {
    findView(doc, view).type = type;
  });
}

export function removeView(root: string, rel: string, view: string): string {
  return editBase(root, rel, (doc) => {
    const list = views(doc);
    const at = list.findIndex((v) => String(v.name ?? "") === view);
    if (at === -1) findView(doc, view);
    list.splice(at, 1);
  });
}

export function duplicateView(root: string, rel: string, view: string, as: string): string {
  return editBase(root, rel, (doc) => {
    const v = findView(doc, view);
    assertFreeName(doc, as);
    views(doc).push({ ...structuredClone(v), name: as });
  });
}

/** Create a base that does not exist yet, with one empty table in it. */
export function createBase(root: string, rel: string, view = "Table"): string {
  const abs = baseFile(root, rel);
  try {
    readFileSync(abs, "utf8");
    throw new Rejection({
      clause: CLAUSES.REQUIRED_ARGS,
      expected: "a base that does not exist yet",
      got: rel,
      remedy: { tool: "se_file_read", args: { path: rel }, note: "edit the base that is there rather than overwriting it" },
      source: SRC,
    });
  } catch (e) {
    if (e instanceof Rejection) throw e;
  }
  writeFileSync(abs, stringify({ views: [{ type: "table", name: view, order: ["file.name"] }] }, { indent: 2, lineWidth: 0 }));
  return readFileSync(abs, "utf8");
}

export function basePath(root: string, rel: string): string {
  return join(vaultDir(root), rel);
}

// ---------------------------------------------------------------------------
// ONE DOOR FOR EVERY CONTROL
//
// The surface posts {op, ...} and this decides what it meant. Keeping the
// dispatch here rather than in the HTTP layer means the route stays four lines
// and an unknown op is refused by the module that owns the vocabulary.
// ---------------------------------------------------------------------------

export interface BaseOp {
  op: string;
  file: string;
  view?: string;
  property?: string;
  on?: boolean;
  order?: string[];
  name?: string | null;
  sort?: SortClause[];
  direction?: "ASC" | "DESC";
  filters?: FilterTree | null;
  /** A tree whose leaves may still be builder rows. Compiled here, not there. */
  posted?: PostedTree | null;
  type?: Layout;
  to?: string;
}

const NEEDS_VIEW = new Set(["toggleProperty", "setOrder", "hideAll", "setSort", "setGroupBy", "setViewFilters", "renameView", "setLayout", "removeView", "duplicateView"]);

export function applyBaseOp(root: string, o: BaseOp): string {
  if (NEEDS_VIEW.has(o.op) && (o.view === undefined || o.view === "")) {
    throw new Rejection({
      clause: CLAUSES.REQUIRED_ARGS,
      expected: `a view name, which ${o.op} acts on`,
      got: "no view",
      remedy: { tool: "se_file_read", args: { path: "product/deliverable/engine/bases.ts" }, note: "the surface sends the view it is showing" },
      source: SRC,
    });
  }
  const v = String(o.view ?? "");
  switch (o.op) {
    case "toggleProperty": return toggleProperty(root, o.file, v, String(o.property), o.on === true);
    case "setOrder": return setOrder(root, o.file, v, o.order ?? []);
    case "hideAll": return hideAll(root, o.file, v);
    case "setDisplayName": return setDisplayName(root, o.file, String(o.property), o.name ?? null);
    case "setSort": return setSort(root, o.file, v, o.sort ?? []);
    case "setGroupBy": return setGroupBy(root, o.file, v, o.property ?? null, o.direction ?? "ASC");
    case "setViewFilters": return setViewFilters(root, o.file, v, o.posted !== undefined ? compileTree(o.posted) : (o.filters ?? null));
    case "setGlobalFilters": return setGlobalFilters(root, o.file, o.posted !== undefined ? compileTree(o.posted) : (o.filters ?? null));
    case "addView": return addView(root, o.file, String(o.name ?? ""), o.type ?? "table");
    case "renameView": return renameView(root, o.file, v, String(o.to ?? ""));
    case "setLayout": return setLayout(root, o.file, v, o.type ?? "table");
    case "removeView": return removeView(root, o.file, v);
    case "duplicateView": return duplicateView(root, o.file, v, String(o.to ?? ""));
    case "createBase": return createBase(root, o.file, String(o.name ?? "Table"));
    default:
      throw new Rejection({
        clause: CLAUSES.REQUIRED_ARGS,
        expected: `a control operation: ${[...NEEDS_VIEW, "setDisplayName", "setGlobalFilters", "addView", "createBase"].sort().join(", ")}`,
        got: o.op,
        remedy: { tool: "se_file_read", args: { path: "product/deliverable/engine/bases.ts" }, note: "applyBaseOp is the whole vocabulary the surface may post" },
        source: SRC,
      });
  }
}
