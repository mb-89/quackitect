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
// 2026-08-01). `type: pivot` crosses a row property with a column property
// and puts an aggregate in the cell. A LIST-VALUED property spreads across
// its elements, which is the whole point: pivoting the notes by name against
// their own depends_on IS the dependency matrix, with no second data model
// and no export. Obsidian cannot open a pivot view, which is fine — dropping
// Obsidian is why this file exists.
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { parse } from "yaml";
import { CLAUSES, Rejection } from "./errors.ts";
import { compare, evalExpr, passes } from "./expr.ts";
import { coerce, kindOf, readKeys, setKeys } from "./frontmatter.ts";
import { parseStateNote } from "./notes.ts";

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
  const doc = parse(text) as { properties?: Record<string, { displayName?: string }>; views?: BaseView[] };
  return {
    properties: doc.properties ?? {},
    views: (doc.views ?? []).map((v) => ({
      type: String(v.type ?? "table"),
      name: String(v.name ?? "untitled"),
      order: Array.isArray(v.order) ? v.order.map(String) : [],
      sort: Array.isArray(v.sort) ? v.sort.filter((s) => String(s?.property ?? "") !== "") : [],
      groupBy: groupLevels((v as { groupBy?: unknown }).groupBy),
      columnSize: ((v as { columnSize?: Record<string, number> }).columnSize ?? {}) as Record<string, number>,
      ...(v.filters !== undefined ? { filters: v.filters } : {}),
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
// 169 notes and 442 KB, measured 2026-08-01. Reading all of them costs less
// than one render, so nothing is cached — an edit shows on the next load,
// the same rule the palette follows.
// ---------------------------------------------------------------------------

// `tests` holds fixture bases and fixture notes. They are inputs to the suite,
// not vault content, and a fixture showing up as a view somebody can open is
// the surface lying about what the vault contains.
const SKIP_DIRS = new Set(["node_modules", ".git", ".obsidian", ".se", ".worktrees", "tests"]);

export function vaultDir(root: string): string {
  return join(root, "product");
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
 * the same rule worktree.ts follows for a broken record. It will fail every
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
      return { statement: note.statement, ...note.frontmatter, file };
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
      remedy: { tool: "se_file_read", args: { path: "product/deliverable/tests/fixtures/rigor-matrix.base" }, note: "the implemented subset is documented at the head of engine/tables.ts" },
      source: SRC,
    });
  }
  return passes(String(filter).trim(), { row });
}

export function selectRows(spec: BaseSpec, view: BaseView, rows: Row[]): Row[] {
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
function cellAttrs(r: Row, col: string): string {
  const path = (r.file as { path?: string } | undefined)?.path;
  if (typeof path !== "string") return "";
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

export function renderView(spec: BaseSpec, view: BaseView, rows: Row[]): TableResult {
  if (view.type === "pivot") return renderPivot(spec, view, rows);
  if (view.type !== "table") {
    throw new Rejection({
      clause: CLAUSES.REQUIRED_ARGS,
      expected: "a view type the renderer knows: table or pivot",
      got: `${view.type} (view "${view.name}")`,
      remedy: { tool: "se_file_read", args: { path: "product/deliverable/engine/tables.ts" }, note: "cards are not built yet; a declared view we cannot draw refuses rather than drawing something else" },
      source: SRC,
    });
  }
  const kept = selectRows(spec, view, rows);
  const cols = view.order.length > 0 ? view.order : [...new Set(kept.flatMap((r) => Object.keys(r)))];
  const head = cols
    .map((c, i) => {
      // The LAST column takes whatever is left, so the table always fills its
      // pane. Giving it a width too would leave a dead strip on the right.
      const w = i === cols.length - 1 ? "" : ` style="width:${Math.max(40, Math.round((view.columnSize ?? {})[c] ?? 160))}px"`;
      return `<th data-col="${esc(c)}" draggable="true"${w}><span class="th-label">${esc(heading(spec, c))}</span><span class="th-grip" title="drag to resize"></span></th>`;
    })
    .join("");
  const cell = (r: Row, c: string): string => `<td${cellAttrs(r, c)}>${cellHtml(r, c)}</td>`;
  const line = (r: Row): string => `<tr>${cols.map((c) => cell(r, c)).join("")}</tr>`;

  // AN EMPTY TABLE SAYS SO. A heading row over nothing reads as a rendering
  // fault; naming the filter that emptied it reads as an answer.
  let body: string;
  if (kept.length === 0) {
    body = `<tr><td class="tbl-empty" colspan="${cols.length}">no rows match this view's filter</td></tr>`;
  } else if ((view.groupBy ?? []).length === 0) {
    body = kept.map(line).join("");
  } else {
    body = groupRows(spec, view, kept, cols, line, 0);
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
function cellHtml(r: Row, c: string): string {
  const text = cellText(field(r, c));
  if (c !== "file.path" && c !== "file.name") return esc(text);
  const path = String((r.file as Row | undefined)?.path ?? "");
  if (path === "") return esc(text);
  return `<a class="doclink tbl-link" data-path="product/${esc(path)}">${esc(text)}</a>`;
}

/**
 * Grouping, one level per `groupBy` entry.
 *
 * Each level subdivides the level above it rather than replacing it, so three
 * levels give three nested headers over one set of rows. That is the whole
 * difference from Obsidian, which groups by one property only.
 */
function groupRows(spec: BaseSpec, view: BaseView, rows: Row[], cols: string[], line: (r: Row) => string, depth: number): string {
  const level = (view.groupBy ?? [])[depth];
  if (level === undefined) return rows.map(line).join("");
  const buckets = new Map<string, Row[]>();
  for (const r of rows) {
    const key = cellText(field(r, level.property)).trim() || EMPTY_KEY;
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
      const header = `<tr class="tbl-group" data-depth="${depth}"><td colspan="${cols.length}"><span class="grp-pad" style="width:${depth * 14}px"></span><span class="grp-prop">${esc(heading(spec, level.property))}</span> <span class="grp-val">${esc(k)}</span> <span class="grp-count">${kids.length}</span></td></tr>`;
      return header + groupRows(spec, view, kids, cols, line, depth + 1);
    })
    .join("");
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

export function renderPivot(spec: BaseSpec, view: BaseView, rows: Row[]): TableResult {
  const rowProp = view.rows;
  const colProp = view.columns;
  if (rowProp === undefined || colProp === undefined) {
    throw new Rejection({
      clause: CLAUSES.REQUIRED_ARGS,
      expected: "a pivot view names both `rows` and `columns`",
      got: `rows: ${rowProp ?? "(absent)"}, columns: ${colProp ?? "(absent)"} (view "${view.name}")`,
      remedy: { tool: "se_file_read", args: { path: "product/deliverable/engine/tables.ts" }, note: "a pivot with one dimension is a table; declare it as `type: table`" },
      source: SRC,
    });
  }
  const agg = view.aggregate ?? "count";
  if (!AGGREGATES.includes(agg)) {
    throw new Rejection({
      clause: CLAUSES.REQUIRED_ARGS,
      expected: `an aggregate this renderer knows: ${AGGREGATES.join(", ")}`,
      got: `${agg} (view "${view.name}")`,
      remedy: { tool: "se_file_read", args: { path: "product/deliverable/engine/tables.ts" }, note: "widen the set deliberately rather than letting a cell fill with something nobody asked for" },
      source: SRC,
    });
  }
  if (agg === "list" && view.value === undefined) {
    throw new Rejection({
      clause: CLAUSES.REQUIRED_ARGS,
      expected: "`aggregate: list` names the property it lists, in `value`",
      got: `no value (view "${view.name}")`,
      remedy: { tool: "se_file_read", args: { path: "product/deliverable/engine/tables.ts" }, note: "use `aggregate: count` when the cell only needs how many" },
      source: SRC,
    });
  }

  const kept = selectRows(spec, view, rows);
  const colKeys = new Set<string>();
  // NESTED MAPS, NOT A JOINED KEY. The first draft of this joined the two
  // dimensions with a separator byte, which is how a raw NUL got written into
  // this file — the exact fault worktree.ts carries a warning about, where
  // ripgrep calls the whole source binary and every search over it comes back
  // confidently empty. A nested map needs no separator, so it cannot happen.
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
          .map((r) => `<tr><th class="pv-row">${esc(r)}</th>${ck.map((c) => cell(r, c)).join("")}<td class="pv-tot pv-num">${rowTotal(r)}</td></tr>`)
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

// WRITING BACK — one cell, one key, one note.
//
// COMMIT ON ENTER, DISCARD ON ESCAPE (owner ruling 2026-08-01). Nothing is
// written while somebody is typing, which is the Qt delegate contract and the
// reason this needs no debouncing, no dirty tracking and no conflict window.

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
  const back = relative(dir, abs);
  if (!rel.endsWith(".md") || back.startsWith("..") || isAbsolute(back)) {
    throw new Rejection({
      clause: CLAUSES.REQUIRED_ARGS,
      expected: "a markdown note inside the vault",
      got: rel,
      remedy: { tool: "se_file_read", args: { path: "product/deliverable/engine/tables.ts" }, note: "a cell may only write the note its own row came from" },
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
