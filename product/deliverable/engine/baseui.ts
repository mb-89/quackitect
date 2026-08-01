// THE VIEW AS THE INSTRUMENT.
//
// tables.ts draws the DATA. This draws the thing you operate it with: the view
// switcher, the results count, and the Sort, Filter, Properties and Search
// controls. Every one of them writes the .base file and the file is what
// re-renders, so nothing here holds state that the disk does not.
//
// THE LAYOUT FOLLOWS THE OWNER'S SCREENSHOTS of Obsidian, because that is the
// contract we were given. Where a control is not drawn there, it is not here.
//
// HELP IS A DETAIL, NEVER A BUTTON. There is no question mark anywhere on this
// card. Clicking a control's LABEL puts its help in the details pane, which is
// the one place the reader already looks for meaning.
//
// THE FUNCTION HELP IS GENERATED FROM THE LIVE REGISTRY. A hand-written list
// would drift from what the evaluator actually accepts within a week, and the
// reader would be told about a function that refuses.
import { basename, dirname, join } from "node:path";
import { GLOBALS, METHODS, typeOf, type TypeName } from "./expr.ts";
import { fromExpression, LAYOUTS, OPERATORS, type FilterRow, type FilterTree } from "./bases.ts";
import { listBases, loadBase, renderView, selectRows, unreadableRows, vaultDir, type BaseSpec, type BaseView, type Row } from "./tables.ts";
import { vaultFor } from "./vault.ts";

const esc = (s: string): string => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const attr = (o: unknown): string => esc(JSON.stringify(o));

// ---------------------------------------------------------------------------
// WHAT COLUMNS EXIST, AND WHAT TYPE EACH ONE IS
// ---------------------------------------------------------------------------

export interface PropertyInfo {
  name: string;
  type: TypeName;
  /** A synthesised file.* field rather than something in frontmatter. */
  synthetic: boolean;
}

const FILE_FIELDS = ["name", "basename", "path", "folder", "ext", "size", "mtime", "ctime", "tags", "links"];

const ICON: Record<string, string> = {
  file: "ⓘ",
  date: "◷",
  list: "≣",
  string: "≡",
  number: "#",
  boolean: "☑",
  link: "↗",
  object: "{}",
  duration: "◷",
  regexp: "⁓",
  null: "·",
};

/**
 * Every column the vault could show, with the type its values actually carry.
 *
 * The type is READ FROM THE DATA rather than declared anywhere, because
 * nothing in this repo declares it. The first value that is not empty decides,
 * which is wrong only for a property that holds two different types — and that
 * is a defect in the notes worth seeing rather than smoothing over.
 */
export function propertyInventory(rows: Row[]): PropertyInfo[] {
  const seen = new Map<string, TypeName>();
  for (const row of rows) {
    for (const [key, value] of Object.entries(row)) {
      if (key === "file" || key === "unreadable") continue;
      if (value === null || value === undefined) continue;
      if (!seen.has(key)) seen.set(key, typeOf(value));
    }
  }
  const out: PropertyInfo[] = FILE_FIELDS.map((f) => ({ name: `file.${f}`, type: "file" as TypeName, synthetic: true }));
  for (const name of [...seen.keys()].sort((a, b) => a.localeCompare(b))) {
    out.push({ name, type: seen.get(name)!, synthetic: false });
  }
  return out;
}

// ---------------------------------------------------------------------------
// HELP
// ---------------------------------------------------------------------------

const kv = (rows: [string, string][]): string =>
  `<table class="kv">${rows.map(([k, v]) => `<tr><td class="k">${esc(k)}</td><td class="v">${v}</td></tr>`).join("")}</table>`;

/** The whole function surface, taken from the registry so it cannot go stale. */
function functionHelp(): string {
  const globals = [...GLOBALS.keys()].sort();
  const byType = [...METHODS.entries()]
    .map(([type, table]) => [type, [...table.keys()].sort()] as [string, string[]])
    .filter(([, names]) => names.length > 0)
    .sort((a, b) => a[0].localeCompare(b[0]));
  const rows: [string, string][] = [["global", globals.map((g) => `<code>${esc(g)}()</code>`).join(" ")]];
  for (const [type, names] of byType) {
    rows.push([type, names.map((n) => `<code>.${esc(n)}()</code>`).join(" ")]);
  }
  return kv(rows);
}

const OPERATOR_HELP = kv([
  ["arithmetic", "<code>+</code> <code>-</code> <code>*</code> <code>/</code> <code>%</code> <code>( )</code>"],
  ["comparison", "<code>==</code> <code>!=</code> <code>&gt;</code> <code>&lt;</code> <code>&gt;=</code> <code>&lt;=</code>"],
  ["boolean", "<code>!</code> <code>&amp;&amp;</code> <code>||</code>"],
  ["dates", "<code>date + &quot;1d&quot;</code> shifts it. One date minus another gives milliseconds."],
  ["durations", "<code>y M w d h m s</code>. The duration goes on the left: <code>duration('5h') * 2</code>."],
]);

const NAMESPACE_HELP = kv([
  ["<code>note.</code>", "a key in the note's own frontmatter"],
  ["<code>file.</code>", "name, path, folder, ext, size, tags, links, and the timestamps"],
  ["<code>formula.</code>", "a computed column this base declares"],
  ["<code>this.</code>", "the note the view is embedded in"],
  ["a bare name", "means <code>note.</code>, which is why <code>status</code> works on its own"],
]);

const P = (s: string): string => `<p style="margin:0 0 8px">${s}</p>`;

export interface Help {
  title: string;
  html: string;
}

const TOPICS: Record<string, () => Help> = {
  views: () => ({
    title: "views",
    html: P("One <code>.base</code> file holds many views. A view has a name and a layout, and the switcher at the top left moves between them.")
      + P("Adding a view writes it into the file. So does renaming one, or changing its layout.")
      + P("The layouts that exist:")
      + kv(LAYOUTS.map((l) => [l, l === "table" ? "rows and columns" : l === "pivot" ? "ours, not Obsidian's — one property crossed with another" : "declared by the format, not drawn yet"] as [string, string])),
  }),
  properties: () => ({
    title: "properties — the columns",
    html: P("Ticking a property adds it as a column, and the tick is a WRITE: it lands in this view's <code>order</code> in the <code>.base</code> file.")
      + P("The list is every key any note in the vault carries, with the type its values actually hold. The <code>file.</code> entries at the top are synthesised rather than written in frontmatter.")
      + P("Editing a cell writes the note the row came from. The view stores nothing."),
  }),
  sort: () => ({
    title: "sort and group by",
    html: P("Sort clauses apply in order: the first one decides, and later ones settle ties.")
      + P("A column sorts by its own type. Numbers and dates order properly rather than as text, and empty cells go last.")
      + P("Group by takes ONE property. Obsidian supports one, so a second is refused rather than quietly ignored."),
  }),
  filter: () => ({
    title: "filter",
    html: P("Filters narrow the whole vault down. There is no <code>from</code> clause anywhere in this format — a base starts with every note and the filters cut it back.")
      + P("<b>All views</b> applies to every view in the file. <b>This view</b> applies to this one. The two are combined with AND.")
      + P("Each row is a builder over the expression language. The <code>&lt;/&gt;</code> button shows the expression the row compiles to, and lets you write one the builder has no form for.")
      + P("A filter the builder cannot read back shows as raw. That is honest rather than a form that would misrepresent it.")
      + P("The operators the builder offers:")
      + kv(OPERATORS.map((o) => [o.label, `<code>${esc(o.build("property", "value"))}</code>`] as [string, string])),
  }),
  search: () => ({
    title: "search",
    html: P("Search hides rows that do not contain the text, in the table as drawn. It does not touch the file.")
      + P("To narrow the view permanently, use a filter instead. That is a write and it persists."),
  }),
  expression: () => ({
    title: "the expression language",
    html: P("Filters and formulas are the SAME language. A filter is an expression that has to come out true; a formula is an expression whose value becomes a column.")
      + P("<b>Where a value comes from</b>")
      + NAMESPACE_HELP
      + P("<b>Operators</b>")
      + OPERATOR_HELP
      + P("<b>Functions</b>, every one the evaluator accepts:")
      + functionHelp()
      + P("Three functions take an expression rather than a value, and bind <code>value</code> per element: <code>filter</code>, <code>map</code> and <code>reduce</code>. So <code>[1,2,3,4].filter(value &gt; 2)</code> gives <code>[3, 4]</code>.")
      + P("Anything the language does not know is REFUSED by name. A query that ignored a clause would return a table that looks complete and is wrong."),
  }),
  formulas: () => ({
    title: "formulas",
    html: P("A formula is a named expression that becomes a column. It is declared once for the file and used as <code>formula.<i>name</i></code>.")
      + P("The reference's own example is <code>ppu: (price / age).toFixed(2)</code>.")
      + P("A formula may use another formula. One that refers to itself is refused rather than hanging.")
      + P("The language is the same one the filters use — see the expression language."),
  }),
  cell: () => ({
    title: "editing a cell",
    html: P("Double-click or press Enter to edit. Enter commits, Escape discards. Nothing is written while you type.")
      + P("The value that was there decides the type. A key that held a list reads your text as a list; a key that held a number refuses prose rather than turning into one.")
      + P("The write goes to the note the row came from, never to the view."),
  }),
};

export function helpFor(topic: string): Help {
  const make = TOPICS[topic];
  if (make === undefined) return { title: topic, html: P("No help is written for this control yet.") };
  return make();
}

export const HELP_TOPICS = Object.keys(TOPICS);

// ---------------------------------------------------------------------------
// THE CHROME
// ---------------------------------------------------------------------------

interface Declared {
  id: string;
  file: string;
  label: string;
  owner: string;
  spec: BaseSpec;
  view: BaseView;
}

function propOptions(props: PropertyInfo[], selected: string, placeholder: string): string {
  const opts = props.map((p) => `<option value="${esc(p.name)}"${p.name === selected ? " selected" : ""}>${esc(p.name)}</option>`).join("");
  return `<option value=""${selected === "" ? " selected" : ""}>${esc(placeholder)}</option>${opts}`;
}

function dirOptions(selected: string): string {
  return ["ASC", "DESC"]
    .map((d) => `<option value="${d}"${d === selected ? " selected" : ""}>${d === "ASC" ? "A → Z" : "Z → A"}</option>`)
    .join("");
}

/** The Sort popover, which carries group-by because the screenshot does. */
function sortPop(d: Declared, props: PropertyInfo[]): string {
  const group = (d.view as unknown as { groupBy?: { property?: string; direction?: string } }).groupBy ?? {};
  const groupRow = `<div class="bs-row" data-kind="group">
    <select class="bs-prop">${propOptions(props, String(group.property ?? ""), "Property")}</select>
    <select class="bs-dir">${dirOptions(String(group.direction ?? "ASC"))}</select>
    <button type="button" class="bs-icon bs-clear-group" title="clear the grouping">\u{1F5D1}</button>
  </div>`;
  const sorts = (d.view.sort ?? [])
    .map((s) => `<div class="bs-row bs-sort" data-kind="sort">
      <span class="bs-grip" title="drag to reorder">∷</span>
      <select class="bs-prop">${propOptions(props, String(s.property ?? ""), "Property")}</select>
      <select class="bs-dir">${dirOptions(String(s.direction ?? "ASC"))}</select>
      <button type="button" class="bs-icon bs-drop" title="remove this sort">\u{1F5D1}</button>
    </div>`)
    .join("");
  return `<div class="bs-pop" data-pop="sort" hidden>
    <div class="bs-pop-title bs-helpable" data-help="sort">Group by</div>
    ${groupRow}
    <div class="bs-pop-title bs-helpable" data-help="sort">Sort by</div>
    <div class="bs-sorts">${sorts}</div>
    <button type="button" class="bs-add bs-add-sort">+ Add sort</button>
  </div>`;
}

function filterRowHtml(expr: string, props: PropertyInfo[]): string {
  const row: FilterRow | null = fromExpression(expr);
  const raw = row === null;
  const opts = OPERATORS.map((o) => `<option value="${esc(o.id)}"${row !== null && row.operator === o.id ? " selected" : ""}>${esc(o.label)}</option>`).join("");
  const builder = `<span class="bs-built"${raw ? " hidden" : ""}>
      <span class="bs-where">where</span>
      <select class="bs-prop">${propOptions(props, row?.property ?? "", "Property")}</select>
      <select class="bs-op">${opts}</select>
      <input class="bs-val" type="text" placeholder="Empty" value="${esc(row?.value ?? "")}">
    </span>`;
  const rawBox = `<input class="bs-raw" type="text" spellcheck="false" value="${esc(expr)}"${raw ? "" : " hidden"}>`;
  return `<div class="bs-row bs-filter" data-raw="${raw ? "1" : "0"}">
    ${builder}${rawBox}
    <button type="button" class="bs-icon bs-toggle-raw bs-helpable" data-help="expression" title="the expression this row writes">&lt;/&gt;</button>
    <button type="button" class="bs-icon bs-drop" title="remove this filter">\u{1F5D1}</button>
  </div>`;
}

function conjOptions(selected: string): string {
  return [["and", "All the following are true"], ["or", "Any of the following are true"], ["not", "None of the following are true"]]
    .map(([v, l]) => `<option value="${v}"${v === selected ? " selected" : ""}>${esc(l)}</option>`)
    .join("");
}

/** A filter tree renders as nested groups, which is what "Add filter group" makes. */
function groupHtml(tree: FilterTree | undefined, props: PropertyInfo[], depth: number): string {
  let conj = "and";
  let kids: FilterTree[] = [];
  if (tree !== undefined && tree !== null && typeof tree === "object") {
    if ("and" in tree) { conj = "and"; kids = tree.and; }
    else if ("or" in tree) { conj = "or"; kids = tree.or; }
    else if ("not" in tree) { conj = "not"; kids = [tree.not]; }
  } else if (typeof tree === "string") {
    kids = [tree];
  }
  const body = kids
    .map((k) => (typeof k === "string" ? filterRowHtml(k, props) : groupHtml(k, props, depth + 1)))
    .join("");
  return `<div class="bs-group" data-depth="${depth}">
    <select class="bs-conj">${conjOptions(conj)}</select>
    <div class="bs-kids">${body}</div>
    <div class="bs-adds">
      <button type="button" class="bs-add bs-add-filter">+ Add filter</button>
      <button type="button" class="bs-add bs-add-group">+ Add filter group</button>
    </div>
  </div>`;
}

function filterPop(d: Declared, props: PropertyInfo[]): string {
  const global = (d.spec as unknown as { filters?: FilterTree }).filters;
  return `<div class="bs-pop bs-pop-wide" data-pop="filter" hidden>
    <details class="bs-fold"><summary class="bs-helpable" data-help="filter">All views</summary>
      <div class="bs-scope" data-scope="global">${groupHtml(global, props, 0)}</div>
    </details>
    <details class="bs-fold" open><summary class="bs-helpable" data-help="filter">This view</summary>
      <div class="bs-scope" data-scope="view">${groupHtml(d.view.filters as FilterTree | undefined, props, 0)}</div>
    </details>
  </div>`;
}

function propsPop(d: Declared, props: PropertyInfo[]): string {
  const order = d.view.order ?? [];
  const items = props
    .map((p) => {
      const on = order.includes(p.name);
      const display = d.spec.properties[p.name]?.displayName ?? "";
      return `<label class="bs-prop-item${on ? " on" : ""}">
        <input type="checkbox" class="bs-tick" data-property="${esc(p.name)}"${on ? " checked" : ""}>
        <span class="bs-type" title="${esc(p.type)}">${ICON[p.type] ?? "·"}</span>
        <span class="bs-prop-name">${esc(p.name)}</span>
        <input class="bs-rename" type="text" placeholder="${esc(p.name)}" value="${esc(display)}" data-property="${esc(p.name)}" title="the heading this column shows">
      </label>`;
    })
    .join("");
  return `<div class="bs-pop bs-pop-tall" data-pop="props" hidden>
    <input class="bs-find" type="text" placeholder="Find a property…">
    <div class="bs-prop-list">${items}</div>
    <div class="bs-pop-foot">
      <button type="button" class="bs-add bs-helpable" data-help="formulas">ƒ Formulas</button>
      <button type="button" class="bs-add bs-hide-all">\u{1F441} Hide all</button>
    </div>
  </div>`;
}

function viewsPop(d: Declared, all: Declared[]): string {
  const mine = all.filter((x) => x.file === d.file);
  const items = mine
    .map((x) => `<button type="button" class="bs-view-item${x.id === d.id ? " on" : ""}" data-goto="${esc(x.id)}">
      <span class="bs-type">▦</span><span class="bs-prop-name">${esc(x.view.name)}</span>
      <span class="bs-chev" data-configure="${esc(x.id)}" title="configure this view">›</span>
    </button>`)
    .join("");
  const layouts = LAYOUTS.map((l) => `<option value="${l}"${l === d.view.type ? " selected" : ""}>${esc(l)}</option>`).join("");
  return `<div class="bs-pop" data-pop="views" hidden>
    <div class="bs-view-list">${items}</div>
    <button type="button" class="bs-add bs-add-view">+ Add view</button>
    <div class="bs-configure" hidden>
      <div class="bs-pop-title"><button type="button" class="bs-back">‹</button> Configure view</div>
      <input class="bs-view-name" type="text" value="${esc(d.view.name)}">
      <div class="bs-pop-title bs-helpable" data-help="views">Layout</div>
      <select class="bs-layout">${layouts}</select>
      <button type="button" class="bs-add bs-drop-view">Delete this view</button>
    </div>
  </div>`;
}

function toolbar(d: Declared, all: Declared[], props: PropertyInfo[], count: number): string {
  const ctx = attr({ file: d.file, view: d.view.name, id: d.id });
  return `<div class="bs-bar" data-ctx="${ctx}">
    <button type="button" class="bs-view-btn bs-tool" data-pop="views" data-help="views"><span class="bs-type">▦</span> ${esc(d.view.name)} <span class="bs-caret">⌄</span></button>
    <span class="bs-count">${count} result${count === 1 ? "" : "s"}</span>
    <span class="bs-gap"></span>
    <button type="button" class="bs-tool" data-pop="sort" data-help="sort">⇅ Sort</button>
    <button type="button" class="bs-tool" data-pop="filter" data-help="filter">⨍ Filter</button>
    <button type="button" class="bs-tool" data-pop="props" data-help="properties">≡ Properties</button>
    <button type="button" class="bs-tool bs-search-btn" data-help="search">⌕ Search</button>
    <button type="button" class="bs-tool bs-new" data-help="views">+ New</button>
  </div>
  <div class="bs-searchbar" hidden><input class="bs-search" type="text" placeholder="Search these rows…"></div>`;
}

/**
 * The whole card: one block per declared view, only one shown.
 *
 * Each block carries its OWN toolbar and popovers, so switching view swaps the
 * instrument with the data and never leaves a control pointing at a view it is
 * not editing.
 */
export function basesCard(root: string, head: string, selected?: string, rowsIn?: Row[]): string {
  // THE WARM MODEL, not a fresh read. Re-reading the vault on every render is
  // the thing this replaced: the index is built once, kept current by the
  // watcher, and every view reads the same rows the filters do.
  const rows = rowsIn ?? vaultFor(root).all();
  const damaged = unreadableRows(rows);
  const props = propertyInventory(rows);
  const declared: Declared[] = [];
  for (const rel of listBases(root)) {
    const spec = loadBase(join(vaultDir(root), rel));
    const stem = basename(rel, ".base");
    const owner = stem === "matrix" ? basename(dirname(rel)) : stem;
    for (const view of spec.views) {
      declared.push({ id: `${rel}#${view.name}`, file: rel, label: `${owner} · ${view.name}`, owner, spec, view });
    }
  }
  if (declared.length === 0) {
    return `<div class="widget" id="w-table"><div class="widget-head"><span>table</span>${head}</div>
      <div class="widget-body tbl-body"><div class="bs-empty">No <code>.base</code> file in the vault yet.
      <button type="button" class="bs-add bs-create">Create one</button></div></div></div>`;
  }
  const want = declared.find((x) => x.id === selected)?.id ?? declared[0].id;

  const blocks = declared
    .map((d) => {
      let body: string;
      let count = 0;
      try {
        count = selectRows(d.spec, d.view, rows).length;
        body = renderView(d.spec, d.view, rows).html;
      } catch (err) {
        body = `<div class="tbl-refused">this view cannot be drawn — ${esc(String((err as Error).message).split("\n")[0])}</div>`;
      }
      // THE CHROME IS DRAWN ONLY FOR THE VIEW ON SCREEN. Every popover lists
      // every property, so drawing all of them for nine views was most of a
      // megabyte of HTML the reader could never see. Switching view reloads
      // the card, which costs one round trip and keeps the poll cheap.
      const shown = d.id === want;
      const chrome = shown
        ? `${toolbar(d, declared, props, count)}${viewsPop(d, declared)}${sortPop(d, props)}${filterPop(d, props)}${propsPop(d, props)}`
        : "";
      return `<div class="bs-block" data-view="${esc(d.id)}"${shown ? "" : " hidden"}>
        ${chrome}
        <div class="bs-data">${body}</div>
      </div>`;
    })
    .join("");

  const damage = damaged.length === 0 ? "" : `<div class="tbl-damage">${damaged.length} note${damaged.length === 1 ? "" : "s"} in the vault do not parse — ${esc(damaged[0])}</div>`;
  return `<div class="widget" id="w-table"><div class="widget-head"><span>table</span>${head}</div>
    <div class="widget-body tbl-body">${damage}${blocks}</div></div>`;
}
