// THE TABLE — a view over notes, declared rather than drawn.
//
// This reads the Obsidian Bases file format, because the owner already writes
// it: machines/rigor_matrix/matrix.base declares five table views over the
// fifty rigor rows, and until now Obsidian was the only thing that could
// render them. The format is the owner's, not ours; we render it.
//
// THE SUBSET IS DELIBERATE. Only what the real file uses is implemented, and
// anything else REFUSES by name. A query language that silently ignores a
// clause it does not understand returns a table that looks complete and is
// wrong, which is worse than no table.
//
// THE PIVOT IS OURS, and it is the one place we go past Obsidian (owner ask
// ). `type: pivot` crosses a row property with a column property
// and puts an aggregate in the cell. A LIST-VALUED property spreads across
// its elements, which is the whole point: pivoting the notes by name against
// their own depends_on IS the dependency matrix, with no second data model
// and no export. Obsidian cannot open a pivot view, which is fine — dropping
// Obsidian is why this file exists.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, join, relative, resolve, sep } from "node:path";
import { parse } from "yaml";
import { CLAUSES, Rejection } from "./errors.ts";
import { compare, evalExpr, passes } from "./expr.ts";
import { coerce, kindOf, readKeys, setKeys } from "./frontmatter.ts";
import { parseStateNote } from "./notes.ts";
import { isInside } from "./paths.ts";

const SRC = "engine/tables.ts";

export interface BaseView {
  type: string;
  name: string;
  /** Column order. Each entry is a property name. */
  order: string[];
  sort: { property: string; direction: string }[];
  /**
   * Obsidian groups by ONE property and says so. Ours takes a LIST, and each
   * level subdivides the one above it, so grouping by extension and then by
   * folder gives every extension its own set of folders. A single object
   * still parses, because that is what Obsidian writes.
   */
  groupBy: { property: string; direction: string }[];
  /** Column widths in pixels, by property. A dragged edge lands here. */
  columnSize: Record<string, number>;
  /** WHICH GROUPS SHIP FOLDED. Names, matched against the group heading.
   *
   *  IT IS A DECLARATION RATHER THAN A NAME IN CODE (owner). The card used to
   *  hardcode the backlog, so every further group somebody wanted folded meant
   *  another line in a renderer — and the person who wanted it could not write
   *  it themselves.
   *
   *  A GROUP THAT BURIES THE PAGE IS NOT A GROUP. The backlog holds 154 pool
   *  tokens and the retro holds every pending note; a reader who came for the
   *  four rows at their own state finds neither.
   *
   *  ABSENT MEANS NONE, which is why it is optional: a view that says nothing
   *  about folding ships every group open, as it always did. */
  collapsed?: string[];
  filters?: unknown;
  /** pivot only: the property whose values become rows. */
  rows?: string;
  /** pivot only: the property whose values become columns. */
  columns?: string;
  /** pivot only: what fills a cell — count or list. */
  aggregate?: string;
  /** pivot only: the property `list` lists. */
  value?: string;
}

export interface BaseSpec {
  /** property name -> display settings. Only displayName is honoured. */
  properties: Record<string, { displayName?: string }>;
  views: BaseView[];
}

export type Row = Record<string, unknown>;

/** One object, a bare name, or a list of either. All three appear in the wild. */
function groupLevels(v: unknown): { property: string; direction: string }[] {
  const one = (x: unknown): { property: string; direction: string } | null => {
    if (typeof x === "string") return x.trim() === "" ? null : { property: x, direction: "ASC" };
    if (x !== null && typeof x === "object") {
      const o = x as { property?: unknown; direction?: unknown };
      const p = String(o.property ?? "").trim();
      return p === "" ? null : { property: p, direction: String(o.direction ?? "ASC") };
    }
    return null;
  };
  if (v === undefined || v === null) return [];
  return (Array.isArray(v) ? v : [v]).map(one).filter((x): x is { property: string; direction: string } => x !== null);
}

export function parseBase(text: string): BaseSpec {
  const doc = parse(text) as {
    properties?: Record<string, { displayName?: string }>;
    views?: BaseView[];
    filters?: unknown;
  };
  // A .base file's `filters:` is written ONCE, ABOVE `views:`, and shared by
  // every view below it — that is the documented shape (adr-query-in-engine,
  // record.md's own harvest note: "filters with an and-list of expressions,
  // THEN views") and it is what all 26 harvested files under
  // spec/queries/ actually write. A view MAY carry its own `filters:`
  // instead (only the fixtures in tests/query.test.ts do this today, pinning
  // the OTHER legal shape) and that always wins when present — a view
  // narrowing its own rows is a deliberate override, not a mistake. Before
  // this fix neither doc.filters nor any fallback was read at all, so a
  // harvested file's top-level filters were silently dropped and every view
  // matched the WHOLE VAULT — exactly the "looks complete and is wrong"
  // failure this file's own header says a query language must never produce.
  return {
    properties: doc.properties ?? {},
    views: (doc.views ?? []).map((v) => ({
      type: String(v.type ?? "table"),
      name: String(v.name ?? "untitled"),
      order: Array.isArray(v.order) ? v.order.map(String) : [],
      sort: Array.isArray(v.sort) ? v.sort.filter((s) => String(s?.property ?? "") !== "") : [],
      groupBy: groupLevels((v as { groupBy?: unknown }).groupBy),
      columnSize: ((v as { columnSize?: Record<string, number> }).columnSize ?? {}) as Record<string, number>,
      collapsed: (Array.isArray((v as { collapsed?: unknown }).collapsed) ? ((v as { collapsed: unknown[] }).collapsed as unknown[]) : [])
        .map((s) => String(s).trim())
        .filter((s) => s !== ""),
      ...(v.filters !== undefined ? { filters: v.filters } : doc.filters !== undefined ? { filters: doc.filters } : {}),
      ...(v.rows !== undefined ? { rows: String(v.rows) } : {}),
      ...(v.columns !== undefined ? { columns: String(v.columns) } : {}),
      ...(v.aggregate !== undefined ? { aggregate: String(v.aggregate) } : {}),
      ...(v.value !== undefined ? { value: String(v.value) } : {}),
    })),
  };
}

export function loadBase(path: string): BaseSpec {
  return parseBase(readFileSync(path, "utf8"));
}

// ---------------------------------------------------------------------------
// THE VAULT — where the rows come from.
//
// A .base file does not name its rows. In Obsidian the candidate set is the
// WHOLE VAULT and the filter picks from it, which is why every shipped view
// opens with `kind == "matrix-row"`. So we hand the renderer the same thing:
// every note, as a row of its own frontmatter.
//
// 169 notes and 442 KB, measured. Reading all of them costs less
// than one render, so nothing is cached — an edit shows on the next load,
// the same rule the palette follows.
// ---------------------------------------------------------------------------

// `tests` holds fixture bases and fixture notes. They are inputs to the suite,
// not vault content, and a fixture showing up as a view somebody can open is
// the surface lying about what the vault contains.
// `dist` holds extracted release trees. It sat beside the vault until the
// folder levels collapsed; inside it, its 479 notes are counted as vault
// content and every table reports three times the rows it has.
// `scratchpad` is the workbench and is never committed. THE SAME FAULT AS
// `dist`, found again: a full copy of the project sat under it, so every rigor
// row was counted twice and the matrix reported 126 rows where 63 stand. The
// suite's own file walker already skipped it and this one did not, so two
// walkers disagreed about what the repository contains.
const SKIP_DIRS = new Set(["node_modules", ".git", ".obsidian", ".se", ".worktrees", "dist", "scratchpad", "tests"]);

export function vaultDir(root: string): string {
  return root;
}

function walkFiles(dir: string, ext: string, out: string[]): void {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name)) continue;
      walkFiles(join(dir, e.name), ext, out);
    } else if (e.isFile() && e.name.endsWith(ext)) {
      out.push(join(dir, e.name));
    }
  }
}

/** Every `.base` file in the vault, as vault-relative paths. */
export function listBases(root: string): string[] {
  const dir = vaultDir(root);
  const abs: string[] = [];
  walkFiles(dir, ".base", abs);
  return abs.map((p) => relative(dir, p).split(sep).join("/")).sort();
}

/**
 * Every note as a row: its frontmatter, plus the `file.*` fields Bases
 * synthesises, plus the `# ` heading as `statement` when the frontmatter
 * does not carry one.
 *
 * A note whose YAML does not parse comes back MARKED rather than dropped —
 * the same rule records.ts follows for a broken record. It will fail every
 * filter, so it shows nowhere by accident, and `unreadableRows` counts it so
 * a surface can say the vault has damage in it.
 */
export function readVault(root: string): Row[] {
  const dir = vaultDir(root);
  const files: string[] = [];
  walkFiles(dir, ".md", files);
  files.sort();
  return files.map((abs) => {
    const rel = relative(dir, abs).split(sep).join("/");
    const file = {
      name: basename(rel, ".md"),
      path: rel,
      folder: dirname(rel) === "." ? "" : dirname(rel),
      ext: "md",
    };
    let raw: string;
    try {
      raw = readFileSync(abs, "utf8");
    } catch (err) {
      return { file, unreadable: `${rel} cannot be read — ${String((err as Error).message).split("\n")[0]}` };
    }
    try {
      const note = parseStateNote(raw);
      // file.hasTag reads r.tags off the FILE object a method receives (see
      // expr.ts). Obsidian synthesises file.tags from the note's own tags;
      // this is that synthesis for a real vault row.
      const fileWithTags = { ...file, tags: note.frontmatter.tags ?? [] };
      return { statement: note.statement, ...note.frontmatter, file: fileWithTags };
    } catch (err) {
      return { file, unreadable: `${rel} does not parse — ${String((err as Error).message).split("\n")[0]}` };
    }
  });
}

/** How many notes in this row set failed to parse. A surface should say so. */
export function unreadableRows(rows: Row[]): string[] {
  return rows.filter((r) => typeof r.unreadable === "string").map((r) => String(r.unreadable));
}

// ---------------------------------------------------------------------------
// SELECTION
// ---------------------------------------------------------------------------

/** `file.name` reaches a nested field; everything else is a plain key. */
function field(row: Row, name: string): unknown {
  if (!name.includes(".")) return row[name];
  let cur: unknown = row;
  for (const part of name.split(".")) {
    if (cur === null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[part];
  }
  return cur;
}

/**
 * `and`, `or` and `not` are FILE STRUCTURE — a nested tree in the YAML. A leaf
 * is an EXPRESSION, and the expression language owns it, so a filter here can
 * say anything a formula can.
 *
 * An expression the language cannot read is a REFUSAL rather than a false. A
 * filter silently treated as unsatisfied hides rows, and a table missing rows
 * for a reason nobody can see is the worst failure this can have.
 */
export function matches(filter: unknown, row: Row): boolean {
  if (filter === undefined || filter === null) return true;
  if (Array.isArray(filter)) return filter.every((f) => matches(f, row));
  if (typeof filter === "object") {
    const o = filter as Record<string, unknown>;
    if ("and" in o) return (o.and as unknown[]).every((f) => matches(f, row));
    if ("or" in o) return (o.or as unknown[]).some((f) => matches(f, row));
    if ("not" in o) return !matches(o.not, row);
    throw new Rejection({
      clause: CLAUSES.REQUIRED_ARGS,
      expected: "a filter node the renderer knows: and, or, not, or an expression string",
      got: `keys ${Object.keys(o).join(", ")}`,
      remedy: {
        tool: "se_file_read",
        args: { path: "deliverable/tests/fixtures/rigor-matrix.base" },
        note: "the implemented subset is documented at the head of engine/tables.ts",
      },
      source: SRC,
    });
  }
  return passes(String(filter).trim(), { row });
}

export function selectRows(_spec: BaseSpec, view: BaseView, rows: Row[]): Row[] {
  const kept = rows.filter((r) => matches(view.filters, r));
  // Applied back to front, so the first clause is the one that decides ties.
  for (const s of [...view.sort].reverse()) {
    const dir = String(s.direction ?? "ASC").toUpperCase() === "DESC" ? -1 : 1;
    kept.sort((a, b) => compare(evalExpr(s.property, { row: a }), evalExpr(s.property, { row: b })) * dir);
  }
  return kept;
}

// ---------------------------------------------------------------------------
// RENDERING
// ---------------------------------------------------------------------------

const esc = (s: string): string => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** A column's heading: the owner's displayName when they gave one. */
export function heading(spec: BaseSpec, name: string): string {
  return spec.properties[name]?.displayName ?? name;
}

const EDIT_HINT = "double-click, or Enter — Enter commits, Escape discards";

/**
 * What makes ONE CELL editable, or says plainly why it is not.
 *
 * Three things have to be true: the row came from a note we can write back to,
 * the column is a real frontmatter key rather than a derived `file.*` field,
 * and the value is something a line editor can express. Anything else is drawn
 * LOCKED with the reason in its tooltip — a cell that silently ignores a
 * double-click reads as a broken table.
 */
function cellAttrs(spec: BaseSpec, r: Row, col: string): string {
  const path = (r.file as { path?: string } | undefined)?.path;
  if (typeof path !== "string") return "";
  // A PROPERTY MAY DECLARE ITSELF A DOOR RATHER THAN A FIELD. `opensNote` says
  // the cell opens the note it came from, and a door is not an edit box.
  // THE BASE DECIDES, NOT THIS FILE. Hard-coding one field name here would make
  // the rule invisible to whoever writes the view.
  if (opensNote(spec, col)) return ` class="tbl-locked tbl-opens" title="opens this note"`;
  // `file.name` is the FILENAME. Editing it is a rename, which moves a file and
  // rewrites every reference to it — se_file_move's job, never a cell's.
  if (col.startsWith("file.")) return ` class="tbl-locked" title="this comes from the filename — renaming is a move, not an edit"`;
  const kind = kindOf(field(r, col));
  if (kind === "nested") return ` class="tbl-locked" title="a nested value needs its own editor; refusing beats flattening it"`;
  return ` class="tbl-cell" tabindex="0" data-path="${esc(path)}" data-key="${esc(col)}" data-kind="${kind}" data-raw="${esc(cellText(field(r, col)))}" title="${EDIT_HINT}"`;
}

/** A cell's text. A list joins; an object would otherwise print [object Object]. */
function cellText(v: unknown): string {
  if (v === undefined || v === null) return "";
  if (Array.isArray(v)) return v.map(cellText).join(", ");
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

export interface TableResult {
  name: string;
  columns: string[];
  rows: number;
  html: string;
}

/** WHERE A GROUP HEADING GOES, when the caller can say.
 *
 *  A HEADING IS A BARE STRING TO THIS FILE. Only the caller knows whether the
 *  name is somewhere the reader can go: the work editor's headings are places
 *  and buckets mixed together, and the text alone does not say which.
 *
 *  THE ANCESTORS RIDE ALONG. A nested heading may name something only its
 *  PARENT can resolve — the work editor's second level is `in`, `pending` or
 *  `out`, which is a bucket of the place named one level up. Without the trail
 *  those headings were plain text while their parents were doors.
 *
 *  ANSWERING `null` LEAVES THE HEADING AS PLAIN TEXT, which is the default and
 *  what every other card gets. */
export type GroupLink = (name: string, trail: string[]) => { state: string; machine: string } | null;

/** WHICH GROUPS SHIP CLOSED, when the caller can say.
 *
 *  A GROUP THAT HOLDS HUNDREDS OF ROWS IS NOT A GROUP, IT IS THE PAGE. The
 *  backlog draws every standing pool token — 154 of them measured — and it would
 *  bury the four rows a reader actually came for.
 *
 *  THE SERVER DECIDES, NOT THE CLIENT. Drawing them and hiding them afterwards
 *  flashes the whole list on every repaint, which is the reader's place being
 *  reset in front of them. */
export type GroupShut = (name: string, trail: string[]) => boolean;

export function renderView(spec: BaseSpec, view: BaseView, rows: Row[], groupLink?: GroupLink, groupShut?: GroupShut): TableResult {
  if (view.type === "pivot") return renderPivot(spec, view, rows);
  if (view.type !== "table") {
    throw new Rejection({
      clause: CLAUSES.REQUIRED_ARGS,
      expected: "a view type the renderer knows: table or pivot",
      got: `${view.type} (view "${view.name}")`,
      remedy: {
        tool: "se_file_read",
        args: { path: "deliverable/engine/tables.ts" },
        note: "cards are not built yet; a declared view we cannot draw refuses rather than drawing something else",
      },
      source: SRC,
    });
  }
  const kept = selectRows(spec, view, rows);
  const cols = view.order.length > 0 ? view.order : [...new Set(kept.flatMap((r) => Object.keys(r)))];
  // WHICH WAY THIS COLUMN IS SORTED, or nothing where it is not the sort key.
  //
  // ONE KEY AT A TIME, because a header click REPLACES the sort rather than
  // adding to it (owner). A column carrying the second of three levels would
  // draw an arrow that does not describe what the reader is looking at.
  //
  // GROUPING IS UNTOUCHED and always comes first. This orders rows INSIDE each
  // group, which is what a table header has always meant.
  const sorted = (view.sort ?? []).length === 1 ? view.sort[0] : undefined;
  const head = cols
    .map((c, i) => {
      // The LAST column takes whatever is left, so the table always fills its
      // pane. Giving it a width too would leave a dead strip on the right.
      const w = i === cols.length - 1 ? "" : ` style="width:${Math.max(40, Math.round(view.columnSize?.[c] ?? 160))}px"`;
      const way = sorted?.property === c ? (sorted.direction.toUpperCase() === "DESC" ? "desc" : "asc") : "";
      const mark = way === "" ? "" : `<span class="th-sort">${way === "desc" ? "▾" : "▴"}</span>`;
      const say = way === "" ? "click to sort by this column" : `sorted ${way === "desc" ? "descending" : "ascending"} — click to reverse`;
      return `<th data-col="${esc(c)}"${way === "" ? "" : ` data-sort="${way}"`} draggable="true" title="${esc(say)}"${w}><span class="th-label">${esc(heading(spec, c))}</span>${mark}<span class="th-grip" title="drag to resize"></span></th>`;
    })
    .join("");
  const cell = (r: Row, c: string): string => `<td${cellAttrs(spec, r, c)}>${cellHtml(spec, r, c)}</td>`;
  // A ROW CARRIES ITS OWN NOTE. The cells already did, for the cell editor; the
  // row needs it too, because what a reader drags is the ROW.
  // see dsp-the-bucket-editor.md#a-pill-opens-the-editor
  const rowPath = (r: Row): string => {
    const p = (r.file as { path?: string } | undefined)?.path;
    return typeof p === "string" ? ` data-path="${esc(p)}" draggable="true"` : "";
  };
  // A ROW UNDER A CLOSED GROUP IS DRAWN AND HIDDEN. It stays in the markup so
  // opening the group costs nothing and needs no second fetch.
  const line = (r: Row, shut = false): string => `<tr${shut ? " hidden" : ""}${rowPath(r)}>${cols.map((c) => cell(r, c)).join("")}</tr>`;

  // AN EMPTY TABLE SAYS SO. A heading row over nothing reads as a rendering
  // fault; naming the filter that emptied it reads as an answer.
  let body: string;
  if (kept.length === 0) {
    body = `<tr><td class="tbl-empty" colspan="${cols.length}">no rows match this view's filter</td></tr>`;
  } else if ((view.groupBy ?? []).length === 0) {
    body = kept.map((r) => line(r)).join("");
  } else {
    body = groupRows(spec, view, kept, cols, line, 0, groupLink, [], groupShut, false);
  }
  return {
    name: view.name,
    columns: cols,
    rows: kept.length,
    html: `<table class="tbl"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`,
  };
}

/**
 * A cell's HTML. Everything is plain text except the two file references,
 * which are the way to open the note a row stands for.
 */
function cellHtml(spec: BaseSpec, r: Row, c: string): string {
  const text = cellText(field(r, c));
  if (c !== "file.path" && c !== "file.name" && !opensNote(spec, c)) return esc(text);
  const path = String((r.file as Row | undefined)?.path ?? "");
  if (path === "") return esc(text);
  return `<a class="doclink tbl-link" data-path="${esc(path)}">${esc(text)}</a>`;
}

/** Whether this column is a door to its note rather than a field to edit.
 *
 *  DECLARED IN THE BASE as `opensNote: true` under `properties`. The work
 *  editor's statement is one: it names the piece of work, and pressing it opens
 *  the markdown behind it. Renaming work is its own act with its own route, so
 *  a cell editor there would be a second way to do it that nothing else knows
 *  about. */
function opensNote(spec: BaseSpec, col: string): boolean {
  return (spec.properties[col] as { opensNote?: unknown } | undefined)?.opensNote === true;
}

/**
 * Grouping, one level per `groupBy` entry.
 *
 * Each level subdivides the level above it rather than replacing it, so three
 * levels give three nested headers over one set of rows. That is the whole
 * difference from Obsidian, which groups by one property only.
 */
function groupRows(
  spec: BaseSpec,
  view: BaseView,
  rows: Row[],
  cols: string[],
  line: (r: Row, shut?: boolean) => string,
  depth: number,
  groupLink: GroupLink | undefined,
  trail: string[],
  groupShut: GroupShut | undefined,
  shut: boolean,
): string {
  const level = (view.groupBy ?? [])[depth];
  if (level === undefined) return rows.map((r) => line(r, shut)).join("");
  const buckets = new Map<string, Row[]>();
  for (const r of rows) {
    const key = cellText(groupValue(r, level.property)).trim() || EMPTY_KEY;
    const at = buckets.get(key);
    if (at === undefined) buckets.set(key, [r]);
    else at.push(r);
  }
  // The empty group goes LAST whichever way the level is sorted, the same way
  // an empty cell sorts last. A leading group of blanks is nobody's answer.
  const dir = level.direction.toUpperCase() === "DESC" ? -1 : 1;
  const keys = [...buckets.keys()].sort((a, b) => {
    if (a === EMPTY_KEY) return 1;
    if (b === EMPTY_KEY) return -1;
    return a.localeCompare(b, undefined, { numeric: true }) * dir;
  });
  return keys
    .map((k) => {
      const kids = buckets.get(k)!;
      // A CLOSED PARENT CLOSES EVERYTHING UNDER IT, however deep.
      const closed = shut || groupShut?.(k, trail) === true;
      const header = `<tr class="tbl-group${closed ? " shut" : ""}"${shut ? " hidden" : ""} data-depth="${depth}" data-group="${esc(k)}"><td colspan="${cols.length}"><span class="grp-pad" style="width:${depth * 14}px"></span><span class="grp-fold">${closed ? "▸" : "▾"}</span><span class="grp-prop">${esc(heading(spec, level.property))}</span> <span class="grp-val">${groupName(k, trail, groupLink)}</span> <span class="grp-count">${kids.length}</span></td></tr>`;
      return header + groupRows(spec, view, kids, cols, line, depth + 1, groupLink, [...trail, k], groupShut, closed);
    })
    .join("");
}

/** A GROUP'S NAME, as text or as a door.
 *
 *  IT IS NOT A DOCLINK, and that is deliberate. A doclink carries a PATH and
 *  opens a document; this carries a STATE and moves the drawing, so it takes
 *  its own attributes and its own handler rather than borrowing a name that
 *  already means something else.
 *
 *  IT STAYS INSIDE `.grp-val`. A drop onto the heading, the rename control and
 *  the pill's own highlight all read that span's text, and every one of them
 *  keeps reading it because an anchor contributes its text like anything else. */
function groupName(name: string, trail: string[], groupLink?: GroupLink): string {
  const to = groupLink === undefined ? null : groupLink(name, trail);
  if (to === null) return esc(name);
  return `<a class="state-link" data-state="${esc(to.state)}" data-machine="${esc(to.machine)}" title="go to this state on the drawing">${esc(name)}</a>`;
}

/** WHAT A ROW GROUPS UNDER. A property name, or an EXPRESSION.
 *
 *  A GROUP LEVEL MAY BE COMPUTED, and that is what lets one field fall back to
 *  another. The work editor groups by `if(bucket, bucket, place)`: a token
 *  carrying a bucket groups under it, and one without groups under its place.
 *
 *  THE PLAIN LOOKUP IS THE FALLBACK, not the other way round. A property whose
 *  name is not a legal expression — anything with a space or a dash in it —
 *  would otherwise stop grouping the day this changed. Filters and formulas use
 *  the same evaluator, so nothing new is being invented here.
 *
 *  A BARE NAME GOES THROUGH BOTH PATHS AND AGREES. `place` evaluates to the
 *  row's place, which is exactly what the lookup returned. */
function groupValue(r: Row, property: string): unknown {
  try {
    return evalExpr(property, { row: r });
  } catch {
    return field(r, property);
  }
}

// A dimension value that is absent gets its own bucket rather than dropping
// the row. Losing rows to a blank field is the same silent-wrong-answer this
// file refuses everywhere else.
export const EMPTY_KEY = "—";

/** The keys one row contributes along a dimension. A list contributes ALL of them. */
function keysOf(v: unknown): string[] {
  if (v === undefined || v === null) return [EMPTY_KEY];
  if (Array.isArray(v)) {
    const ks = v.map((x) => String(x).trim()).filter((s) => s !== "");
    return ks.length === 0 ? [EMPTY_KEY] : ks;
  }
  const s = String(v).trim();
  return s === "" ? [EMPTY_KEY] : [s];
}

/** The empty bucket goes last, wherever it would otherwise have sorted. */
function emptyLast(keys: string[]): string[] {
  const i = keys.indexOf(EMPTY_KEY);
  if (i === -1) return keys;
  const out = keys.slice();
  out.splice(i, 1);
  out.push(EMPTY_KEY);
  return out;
}

const AGGREGATES = ["count", "list"];

/** A pivot view must name both dimensions, a known aggregate, and — for
 *  `list` — the property it lists. Refuses typed, never renders a guess. */
function guardPivotView(view: BaseView): { rowProp: string; colProp: string; agg: string } {
  const rowProp = view.rows;
  const colProp = view.columns;
  if (rowProp === undefined || colProp === undefined) {
    throw new Rejection({
      clause: CLAUSES.REQUIRED_ARGS,
      expected: "a pivot view names both `rows` and `columns`",
      got: `rows: ${rowProp ?? "(absent)"}, columns: ${colProp ?? "(absent)"} (view "${view.name}")`,
      remedy: {
        tool: "se_file_read",
        args: { path: "deliverable/engine/tables.ts" },
        note: "a pivot with one dimension is a table; declare it as `type: table`",
      },
      source: SRC,
    });
  }
  const agg = view.aggregate ?? "count";
  if (!AGGREGATES.includes(agg)) {
    throw new Rejection({
      clause: CLAUSES.REQUIRED_ARGS,
      expected: `an aggregate this renderer knows: ${AGGREGATES.join(", ")}`,
      got: `${agg} (view "${view.name}")`,
      remedy: {
        tool: "se_file_read",
        args: { path: "deliverable/engine/tables.ts" },
        note: "widen the set deliberately rather than letting a cell fill with something nobody asked for",
      },
      source: SRC,
    });
  }
  if (agg === "list" && view.value === undefined) {
    throw new Rejection({
      clause: CLAUSES.REQUIRED_ARGS,
      expected: "`aggregate: list` names the property it lists, in `value`",
      got: `no value (view "${view.name}")`,
      remedy: {
        tool: "se_file_read",
        args: { path: "deliverable/engine/tables.ts" },
        note: "use `aggregate: count` when the cell only needs how many",
      },
      source: SRC,
    });
  }
  return { rowProp, colProp, agg };
}

/** NESTED MAPS, NOT A JOINED KEY. The first draft of this joined the two
 *  dimensions with a separator byte, which is how a raw NUL got written into
 *  this file — the exact fault records.ts carries a warning about, where
 *  ripgrep calls the whole source binary and every search over it comes back
 *  confidently empty. A nested map needs no separator, so it cannot happen. */
function fillPivotCells(
  kept: Row[],
  rowProp: string,
  colProp: string,
): { cells: Map<string, Map<string, Row[]>>; colKeys: Set<string>; filled: number } {
  const colKeys = new Set<string>();
  const cells = new Map<string, Map<string, Row[]>>();
  let filled = 0;
  for (const r of kept) {
    for (const rowKey of keysOf(field(r, rowProp))) {
      let line = cells.get(rowKey);
      if (line === undefined) {
        line = new Map<string, Row[]>();
        cells.set(rowKey, line);
      }
      for (const colKey of keysOf(field(r, colProp))) {
        colKeys.add(colKey);
        const bucket = line.get(colKey);
        if (bucket === undefined) {
          line.set(colKey, [r]);
          filled++;
        } else {
          bucket.push(r);
        }
      }
    }
  }
  return { cells, colKeys, filled };
}

export function renderPivot(spec: BaseSpec, view: BaseView, rows: Row[]): TableResult {
  const { rowProp, colProp, agg } = guardPivotView(view);
  const kept = selectRows(spec, view, rows);
  const { cells, colKeys, filled } = fillPivotCells(kept, rowProp, colProp);
  // THE VIEW DECLARES THE ROW ORDER, NOT THE RENDERER. `cells` is filled in
  // the order selectRows handed the rows over, so its key order already IS the
  // view's `sort` (and, with none declared, the vault's own path order).
  //
  // Sorting the axis alphabetically instead was a real defect, not a taste:
  // the rigor rows are authored in dependency order, and re-sorting them put
  // 31 of 58 marks above the diagonal in a graph that has no cycles at all.
  // An acyclic matrix in its authored order is triangular, and that shape is
  // the entire reason to draw one.
  const rk = emptyLast([...cells.keys()]);
  // A SQUARE MATRIX SHARES ONE ORDER. When every column is also a row, the two
  // axes name the same things, and giving them the same order is what puts the
  // diagonal on the diagonal. Otherwise the columns are a different vocabulary
  // — kinds, sizes, states — and alphabetical is the predictable choice.
  const square = [...colKeys].every((c) => c === EMPTY_KEY || cells.has(c));
  const inRowOrder = rk.filter((k) => colKeys.has(k));
  const spare = [...colKeys].filter((k) => !inRowOrder.includes(k)).sort((a, b) => a.localeCompare(b));
  const ck = emptyLast(square ? [...inRowOrder, ...spare] : [...colKeys].sort((a, b) => a.localeCompare(b)));
  const at = (r: string, c: string): Row[] | undefined => cells.get(r)?.get(c);

  const corner = `<th class="pv-corner">${esc(heading(spec, rowProp))} ╱ ${esc(heading(spec, colProp))}</th>`;
  const head = `${corner}${ck.map((c) => `<th class="pv-col">${esc(c)}</th>`).join("")}<th class="pv-tot">Σ</th>`;

  const cell = (r: string, c: string): string => {
    const bucket = at(r, c);
    if (bucket === undefined) return `<td class="pv-off"></td>`;
    if (agg === "count") return `<td class="pv-on pv-num">${bucket.length}</td>`;
    return `<td class="pv-on">${esc(bucket.map((b) => cellText(field(b, view.value as string))).join(", "))}</td>`;
  };
  const rowTotal = (r: string): number => ck.reduce((n, c) => n + (at(r, c)?.length ?? 0), 0);
  const colTotal = (c: string): number => rk.reduce((n, r) => n + (at(r, c)?.length ?? 0), 0);

  // THE TOTALS ARE ALWAYS COUNTS, whatever the aggregate. On a dependency
  // pivot they read as fan-out down the side and fan-in along the bottom,
  // which is the number anyone actually wants off a matrix like this.
  const body =
    kept.length === 0
      ? `<tr><td class="tbl-empty" colspan="${ck.length + 2}">no rows match this view's filter</td></tr>`
      : rk
          .map(
            (r) =>
              `<tr><th class="pv-row">${esc(r)}</th>${ck.map((c) => cell(r, c)).join("")}<td class="pv-tot pv-num">${rowTotal(r)}</td></tr>`,
          )
          .join("") +
        `<tr class="pv-totals"><th class="pv-tot">Σ</th>${ck.map((c) => `<td class="pv-tot pv-num">${colTotal(c)}</td>`).join("")}<td class="pv-tot pv-num">${rk.reduce((n, r) => n + rowTotal(r), 0)}</td></tr>`;

  const dense = rk.length * ck.length === 0 ? 0 : (filled / (rk.length * ck.length)) * 100;
  const caption = `${view.name} — ${rk.length}×${ck.length}, ${filled} filled (${dense.toFixed(1)}%)`;
  // PAST A DOZEN COLUMNS THE HEADINGS TURN, which is how every design
  // structure matrix has been drawn since Steward. Below that they read
  // straight, because a turned heading over three columns is a puzzle.
  const wide = ck.length > 12 ? " wide" : "";
  return {
    name: view.name,
    columns: ck,
    rows: rk.length,
    html: `<table class="tbl pivot${wide}"><caption>${esc(caption)}</caption><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`,
  };
}

// ---------------------------------------------------------------------------
// THE WIDGET — every declared view, one on screen at a time.
//
// The picker is an inline handler on purpose. The mirror MORPHS its cards in
// place, and a listener attached by the page script does not survive that;
// an attribute is part of the element, so it does.
// ---------------------------------------------------------------------------

export const TABLE_STYLE = `
.tbl-body{overflow:auto;padding:0 10px 10px}
.tbl{border-collapse:collapse;font-size:12px}
.tbl:not(.pivot){width:100%}
.tbl caption{text-align:left;padding:8px 2px;color:var(--se-muted);white-space:nowrap}
.tbl th,.tbl td{border:1px solid var(--se-border);padding:3px 7px;text-align:left;vertical-align:top}
.tbl thead th{position:sticky;top:0;z-index:2;background:var(--se-raised);color:var(--se-fg);font-weight:600}
.tbl tbody tr:hover td{background:var(--se-hover)}
.tbl-empty{color:var(--se-muted);font-style:italic}
.tbl-cell{cursor:text}
.tbl-cell:focus{outline:2px solid var(--se-walk);outline-offset:-2px}
.tbl-locked{color:var(--se-dim)}
.tbl-bad{outline:2px solid var(--se-fail);outline-offset:-2px}
.tbl-edit{width:100%;box-sizing:border-box;background:var(--se-bg);color:var(--se-fg);border:1px solid var(--se-walk);border-radius:2px;font:inherit;padding:1px 4px}
.tbl-pick{background:var(--se-raised);color:var(--se-fg);border:1px solid var(--se-border-strong);border-radius:3px;font:inherit;font-size:11px;padding:2px 4px;max-width:60%}
.tbl-damage{color:var(--se-fail);padding:6px 2px;font-size:12px}
.tbl-refused{color:var(--se-fail);padding:10px 2px;font-size:12px;white-space:pre-wrap}
.pivot td,.pivot th{text-align:center}
.pivot .pv-row{position:sticky;left:0;z-index:1;background:var(--se-raised);text-align:left;white-space:nowrap}
.pivot .pv-corner{position:sticky;left:0;z-index:3;text-align:left;white-space:nowrap}
.pivot .pv-off{background:var(--se-bg)}
.pivot .pv-on{background:var(--se-walk-bg);color:var(--se-walk-ring)}
.pivot .pv-num{font-variant-numeric:tabular-nums}
.pivot .pv-tot{background:var(--se-raised);color:var(--se-muted)}
.pivot.wide .pv-col{writing-mode:vertical-rl;transform:rotate(180deg);white-space:nowrap;padding:7px 3px;font-weight:400}
.pivot.wide td{padding:3px 2px;min-width:18px}
`;

// see dsp-live-register.md#commit-on-enter-discard-on-escape

export interface CellEdit {
  /** Vault-relative path of the note, as the row's own file.path gave it. */
  path: string;
  key: string;
  /** What the person typed. What it MEANS is decided by the value it replaces. */
  text: string;
}

export interface CellWritten {
  path: string;
  key: string;
  /** The cell's new text, so the surface can draw it without re-reading. */
  display: string;
  removed: boolean;
}

/** The note a cell names, refusing anything that reaches outside the vault. */
function notePath(root: string, rel: string): string {
  const dir = vaultDir(root);
  const abs = resolve(dir, rel);
  // INSIDE THE VAULT, the vault itself included, which is where this differs
  // from the bench guard. Both ask the path jail's own predicate now.
  if (!rel.endsWith(".md") || !isInside(dir, abs)) {
    throw new Rejection({
      clause: CLAUSES.REQUIRED_ARGS,
      expected: "a markdown note inside the vault",
      got: rel,
      remedy: {
        tool: "se_file_read",
        args: { path: "deliverable/engine/tables.ts" },
        note: "a cell may only write the note its own row came from",
      },
      source: SRC,
    });
  }
  return abs;
}

/**
 * Write one cell back into its note.
 *
 * THE PREVIOUS VALUE IS THE TYPE. That is what makes this a delegate and not a
 * text box: the note says the key held a list, so the text is read as a list,
 * and a key that held a number refuses prose rather than turning into it.
 */
export function editCell(root: string, edit: CellEdit): CellWritten {
  const abs = notePath(root, edit.path);
  const raw = readFileSync(abs, "utf8");
  const value = coerce(readKeys(raw, edit.path)[edit.key], edit.text);
  writeFileSync(abs, setKeys(raw, { [edit.key]: value }, edit.path), "utf8");
  return { path: edit.path, key: edit.key, display: cellText(value), removed: value === undefined };
}

/**
 * The delegate, client side.
 *
 * It listens on the DOCUMENT rather than on the cells. The mirror morphs its
 * cards in place, so anything bound to an element that a morph replaces stops
 * working the moment the table redraws; the document survives every morph.
 *
 * A failed write RESTORES what was there and puts the refusal in the cell's
 * tooltip. Leaving the typed text sitting in a cell that was never written is
 * the one behaviour that would make somebody trust a lost edit.
 */
export const TABLE_SCRIPT = `
(function () {
  if (window.__seTableEdit === true) return;
  window.__seTableEdit = true;
  var HINT = ${JSON.stringify(EDIT_HINT)};
  var open = null;

  function cellOf(node) {
    return node !== null && node !== undefined && node.closest ? node.closest("td.tbl-cell") : null;
  }

  function begin(td) {
    if (open !== null) return;
    var input = document.createElement("input");
    input.className = "tbl-edit";
    input.value = td.getAttribute("data-raw") || "";
    open = { td: td, html: td.innerHTML };
    td.textContent = "";
    td.appendChild(input);
    input.focus();
    input.select();
  }

  function discard() {
    if (open === null) return;
    var td = open.td;
    td.innerHTML = open.html;
    open = null;
    td.focus();
  }

  function failed(td, was, why) {
    td.innerHTML = was;
    td.classList.add("tbl-bad");
    td.title = why;
  }

  function commit() {
    if (open === null) return;
    var td = open.td;
    var was = open.html;
    var typed = td.firstChild === null ? "" : td.firstChild.value;
    open = null;
    if (typed === td.getAttribute("data-raw")) { td.innerHTML = was; td.focus(); return; }
    td.textContent = "saving";
    fetch("/table/edit", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ path: td.getAttribute("data-path"), key: td.getAttribute("data-key"), text: typed })
    }).then(function (r) { return r.json(); }).then(function (answer) {
      if (answer === null || answer.ok !== true) {
        failed(td, was, (answer && answer.error) || "the write was refused");
        return;
      }
      td.textContent = answer.display;
      td.setAttribute("data-raw", answer.display);
      td.classList.remove("tbl-bad");
      td.title = HINT;
    }).catch(function (e) { failed(td, was, String(e)); });
    td.focus();
  }

  document.addEventListener("dblclick", function (ev) {
    var td = cellOf(ev.target);
    if (td !== null) begin(td);
  });

  document.addEventListener("keydown", function (ev) {
    if (open !== null) {
      if (ev.key === "Enter") { ev.preventDefault(); commit(); }
      else if (ev.key === "Escape") { ev.preventDefault(); discard(); }
      return;
    }
    if (ev.key !== "Enter") return;
    var td = cellOf(ev.target);
    if (td !== null) { ev.preventDefault(); begin(td); }
  });
}());
`;
