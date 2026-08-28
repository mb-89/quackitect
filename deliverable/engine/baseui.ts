// THE VIEW AS THE INSTRUMENT.
//
// tables.ts draws the DATA. This draws the thing you operate it with.
//
// ONLY WHAT WORKS IS ON THE CARD. A control that looks like it does something
// and does not is worse than a missing one: the reader trusts it, acts on it,
// and learns later that nothing happened. Filter, Search and the view switcher
// were all in that state and are gone until they are built.
//
// THE TOOLBAR IS NOT IN THE SCROLLING AREA. It sits above a pane that scrolls
// on its own, so it stays put while rows go past. The header row is sticky
// inside that pane for the same reason.
//
// HELP IS A DETAIL, NEVER A BUTTON. There is no question mark anywhere here.
// Clicking a control's LABEL puts its help in the details pane.
//
// THE FUNCTION HELP IS GENERATED FROM THE LIVE REGISTRY, so it can never
// describe a function the evaluator would refuse.
import { join } from "node:path";
import { baseSource, type FilterGroup, type FilterRow, filterGroups, LAYOUTS, OPERATORS } from "./bases.ts";
import { GLOBALS, METHODS } from "./expr.ts";
import { type TypeName, typeOf } from "./expr-value.ts";
import {
  type BaseSpec,
  type BaseView,
  type GroupLink,
  type GroupShut,
  listBases,
  loadBase,
  type Row,
  renderView,
  selectRows,
  unreadableRows,
  vaultDir,
} from "./tables.ts";
import { warmRows, warmVault } from "./vault.ts";

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

const FILE_FIELDS = ["path", "name", "basename", "folder", "ext", "size", "mtime", "ctime", "tags", "links"];

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
 * which is wrong only for a property holding two different types — and that is
 * a defect in the notes worth seeing rather than smoothing over.
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
  for (const [type, names] of byType) rows.push([type, names.map((n) => `<code>.${esc(n)}()</code>`).join(" ")]);
  return kv(rows);
}

const NAMESPACE_HELP = kv([
  ["<code>note.</code>", "a key in the note's own frontmatter"],
  ["<code>file.</code>", "path, name, folder, ext, size, tags, links, and the timestamps"],
  ["<code>formula.</code>", "a computed column this base declares"],
  ["<code>this.</code>", "the note the view is embedded in"],
  ["a bare name", "means <code>note.</code>, which is why <code>status</code> works on its own"],
]);

const OPERATOR_HELP = kv([
  ["arithmetic", "<code>+</code> <code>-</code> <code>*</code> <code>/</code> <code>%</code> <code>( )</code>"],
  ["comparison", "<code>==</code> <code>!=</code> <code>&gt;</code> <code>&lt;</code> <code>&gt;=</code> <code>&lt;=</code>"],
  ["boolean", "<code>!</code> <code>&amp;&amp;</code> <code>||</code>"],
  ["dates", "<code>date + &quot;1d&quot;</code> shifts it. One date minus another gives milliseconds."],
  ["durations", "<code>y M w d h m s</code>. The duration goes on the left: <code>duration('5h') * 2</code>."],
]);

const P = (s: string): string => `<p style="margin:0 0 8px">${s}</p>`;

export interface Help {
  title: string;
  html: string;
}

const TOPICS: Record<string, () => Help> = {
  properties: () => ({
    title: "properties — the columns",
    html:
      P("Ticking a property adds it as a column, and the tick is a WRITE: it lands in this view's <code>order</code> in the query.") +
      P(
        "The list is every key any note carries, with the type its values actually hold. The <code>file.</code> entries at the top are synthesised rather than written in frontmatter.",
      ) +
      P("Drag a column heading to reorder. Drag its right edge to resize. Both are writes, so they survive a reload.") +
      P("Editing a cell writes the note the row came from. The view stores nothing."),
  }),
  sort: () => ({
    title: "sort and group by",
    html:
      P("<b>Sort by</b> takes several levels. The first decides, and each later one settles the ties the ones above it left.") +
      P("A column sorts by its own type. Numbers and dates order properly rather than as text, and empty cells go last.") +
      P("<b>Group by</b> also takes several levels, and this is where we go past Obsidian, which allows one.") +
      P(
        "Each group level SUBDIVIDES the one above it. Group by extension and you get one section per extension. Add folder underneath and every extension is then split by folder.",
      ) +
      P("Sorting applies inside the groups, so the two work together rather than against each other."),
  }),
  filter: () => ({
    title: "filter by",
    html:
      P("A condition is a row: a property, an operator, and a value.") +
      P("Rows inside one GROUP are ORed. One row matching is enough for that group to pass.") +
      P("Groups are ANDed with each other. Every group has to pass before a note shows.") +
      P("So the whole control is an AND of ORs. That is the shape the query stores, and the shape it is read back from.") +
      P(
        "A row compiles to an EXPRESSION, in the same language formulas use. The query panel shows what a row wrote, and writing there is the same act.",
      ) +
      P("A row with an empty value box is unfinished. It writes nothing, so a half-typed condition never hides your rows.") +
      P(
        "A condition the builder cannot read back as a row is shown RAW and left alone. That is deliberate: an approximation would change what the query asks for. Edit that one in the query panel.",
      ),
  }),
  expression: () => ({
    title: "the expression language",
    html:
      P(
        "Filters and formulas are the SAME language. A filter is an expression that has to come out true; a formula is an expression whose value becomes a column.",
      ) +
      P("<b>Where a value comes from</b>") +
      NAMESPACE_HELP +
      P("<b>Operators</b>") +
      OPERATOR_HELP +
      P("<b>Functions</b>, every one the evaluator accepts:") +
      functionHelp() +
      P(
        "Three functions take an expression rather than a value, and bind <code>value</code> per element: <code>filter</code>, <code>map</code> and <code>reduce</code>. So <code>[1,2,3,4].filter(value &gt; 2)</code> gives <code>[3, 4]</code>.",
      ) +
      P(
        "Anything the language does not know is REFUSED by name. A query that ignored a clause would return a table that looks complete and is wrong.",
      ),
  }),
  cell: () => ({
    title: "editing a cell",
    html:
      P("Double-click or press Enter to edit. Enter commits, Escape discards. Nothing is written while you type.") +
      P(
        "The value that was there decides the type. A key that held a list reads your text as a list; a key that held a number refuses prose rather than turning into one.",
      ) +
      P("A cell that will not take an editor is a nested value, and it says so when you hover it.") +
      P("The write goes to the note the row came from, never to the view."),
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
  spec: BaseSpec;
  view: BaseView;
}

function propOptions(props: PropertyInfo[], selected: string): string {
  const opts = props.map((p) => `<option value="${esc(p.name)}"${p.name === selected ? " selected" : ""}>${esc(p.name)}</option>`).join("");
  return `<option value=""${selected === "" ? " selected" : ""}>Property</option>${opts}`;
}

function dirOptions(selected: string): string {
  return ["ASC", "DESC"]
    .map((d) => `<option value="${d}"${d === selected.toUpperCase() ? " selected" : ""}>${d === "ASC" ? "A → Z" : "Z → A"}</option>`)
    .join("");
}

function level(kind: "group" | "sort", property: string, direction: string, props: PropertyInfo[]): string {
  return `<div class="bs-row bs-level" data-kind="${kind}">
    <select class="bs-prop">${propOptions(props, property)}</select>
    <select class="bs-dir">${dirOptions(direction)}</select>
    <button type="button" class="bs-icon bs-drop" title="remove this level">✕</button>
  </div>`;
}

/**
 * Sort and group by, both as LISTS.
 *
 * An empty list still draws one blank row. Without it there was nothing to
 * clone and "Add" did nothing at all — which is exactly what a control that
 * lies looks like.
 */
function sortPop(d: Declared, props: PropertyInfo[]): string {
  const groups = d.view.groupBy.length > 0 ? d.view.groupBy : [{ property: "", direction: "ASC" }];
  const sorts = d.view.sort.length > 0 ? d.view.sort : [{ property: "", direction: "ASC" }];
  return `<div class="bs-pop" data-pop="sort" hidden>
    <div class="bs-pop-title bs-helpable" data-help="sort">Group by</div>
    <div class="bs-levels" data-kind="group">${groups.map((g) => level("group", g.property, g.direction, props)).join("")}</div>
    <button type="button" class="bs-add bs-add-level" data-kind="group">+ Add group</button>
    <div class="bs-pop-title bs-helpable" data-help="sort">Sort by</div>
    <div class="bs-levels" data-kind="sort">${sorts.map((s) => level("sort", s.property, s.direction, props)).join("")}</div>
    <button type="button" class="bs-add bs-add-level" data-kind="sort">+ Add sort</button>
  </div>`;
}

function propsPop(d: Declared, props: PropertyInfo[]): string {
  const order = d.view.order ?? [];
  const items = props
    .map((p) => {
      const on = order.includes(p.name);
      return `<label class="bs-prop-item${on ? " on" : ""}">
        <input type="checkbox" class="bs-tick" data-property="${esc(p.name)}"${on ? " checked" : ""}>
        <span class="bs-type" title="${esc(p.type)}">${ICON[p.type] ?? "·"}</span>
        <span class="bs-prop-name">${esc(p.name)}</span>
      </label>`;
    })
    .join("");
  return `<div class="bs-pop bs-pop-tall" data-pop="props" hidden>
    <input class="bs-find" type="text" placeholder="Find a property…">
    <div class="bs-prop-list">${items}</div>
    <div class="bs-pop-foot"><button type="button" class="bs-add bs-hide-all">Hide all</button></div>
  </div>`;
}

// ---------------------------------------------------------------------------
// FILTER — the funnel, and the AND of ORs behind it
//
// GROUPS ARE ANDED, ROWS INSIDE A GROUP ARE ORED. The join word is drawn on
// every group and every row, and CSS hides the first one of each. A join
// written per row cannot drift out of step with the rows the way a separately
// placed one can.
//
// THE OPERATOR VOCABULARY IS SERIALISED, NEVER REDECLARED. `data-ops` carries
// the offer per type and `data-noval` the operators that take no value, both
// built from OPERATORS. A client with its own copy would drift the first time
// an operator was added.
// ---------------------------------------------------------------------------

const BLANK_ROW: FilterRow = { property: "", operator: "", value: "" };

/** Which operators a property of this type is offered. "" means none picked yet. */
function operatorsFor(type: string) {
  return OPERATORS.filter((o) => o.types.length === 0 || (type !== "" && o.types.includes(type)));
}

/**
 * The operator list for one row.
 *
 * AN OPERATOR ALREADY IN THE FILE IS SHOWN EVEN WHERE THE TYPE DOES NOT OFFER
 * IT. The type is inferred from the data, so it can be wrong; dropping the
 * stored operator would rewrite the filter the next time an unrelated row moved.
 */
function opOptions(type: string, selected: string): string {
  const offered = operatorsFor(type);
  const known = offered.some((o) => o.id === selected) || selected === "";
  const shown = known ? offered : [...offered, ...OPERATORS.filter((o) => o.id === selected)];
  return shown.map((o) => `<option value="${esc(o.id)}"${o.id === selected ? " selected" : ""}>${esc(o.label)}</option>`).join("");
}

function condRow(row: FilterRow, props: PropertyInfo[], types: Map<string, string>): string {
  const type = types.get(row.property) ?? "";
  const op = OPERATORS.find((o) => o.id === row.operator);
  const takes = op === undefined || op.takesValue;
  return `<div class="bs-row bs-cond">
    <span class="bs-join">or</span>
    <select class="bs-prop">${propOptions(props, row.property)}</select>
    <select class="bs-op">${opOptions(type, row.operator)}</select>
    <input class="bs-val" type="text" placeholder="value" value="${esc(row.value ?? "")}"${takes ? "" : " hidden"}>
    <button type="button" class="bs-icon bs-drop-cond" title="remove this condition">✕</button>
  </div>`;
}

function filterGroupHtml(g: FilterGroup, props: PropertyInfo[], types: Map<string, string>): string {
  if (g.raw !== undefined) {
    const text = typeof g.raw === "string" ? g.raw : JSON.stringify(g.raw);
    return `<div class="bs-group bs-group-raw" data-raw="${attr(g.raw)}">
      <span class="bs-join">and</span>
      <div class="bs-group-body">
        <div class="bs-raw"><code>${esc(text)}</code></div>
        <div class="bs-raw-note">Not a condition this builder can draw, so it is left exactly as written. The query panel is where it is edited.</div>
      </div>
    </div>`;
  }
  const rows = g.rows.length > 0 ? g.rows : [BLANK_ROW];
  return `<div class="bs-group">
    <span class="bs-join">and</span>
    <div class="bs-group-body">
      <div class="bs-conds">${rows.map((r) => condRow(r, props, types)).join("")}</div>
      <button type="button" class="bs-add bs-add-cond">+ Add condition</button>
    </div>
  </div>`;
}

/**
 * THE FUNNEL'S POPOVER.
 *
 * The two templates at the end are what "+ Add condition" and "+ Add group"
 * clone. A template's content is not in the document tree, so it is never
 * collected as a real row — and it is always there, which a control that cloned
 * a drawn row would not be when every stored group is raw.
 */
function filterPop(d: Declared, props: PropertyInfo[]): string {
  const types = new Map(props.map((p) => [p.name, String(p.type)]));
  const catalog: Record<string, { id: string; label: string }[]> = {};
  for (const t of ["", ...new Set(props.map((p) => String(p.type)))]) {
    catalog[t] = operatorsFor(t).map((o) => ({ id: o.id, label: o.label }));
  }
  const typeMap: Record<string, string> = {};
  for (const p of props) typeMap[p.name] = String(p.type);
  const noValue = OPERATORS.filter((o) => !o.takesValue)
    .map((o) => o.id)
    .join(" ");
  const groups = filterGroups(d.view.filters).map((g) => filterGroupHtml(g, props, types));
  return `<div class="bs-pop" data-pop="filter" data-ops="${attr(catalog)}" data-types="${attr(typeMap)}" data-noval="${esc(noValue)}" hidden>
    <div class="bs-pop-title bs-helpable" data-help="filter">Filter by</div>
    <div class="bs-groups">${groups.join("")}</div>
    <button type="button" class="bs-add bs-add-group">+ Add group</button>
    <template class="bs-cond-tpl">${condRow(BLANK_ROW, props, types)}</template>
    <template class="bs-group-tpl">${filterGroupHtml({ rows: [] }, props, types)}</template>
  </div>`;
}

// A funnel: wide at the top, narrowing to a stem. The icon the reader already
// associates with narrowing a list.
const FUNNEL_ICON = `<svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true"><path fill="currentColor" d="M2 2h12l-4.6 5.6v5.1l-2.8 1.4V7.6L2 2Z"/></svg>`;

// The markdown-preview icon VS Code puts in an editor's title bar: a page with
// one half turned over. It means the same thing here — the other rendering of
// what is already open.
const CODE_ICON = `<svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true"><path fill="currentColor" d="M1.5 2h5.2c.5 0 .9.2 1.3.5.4-.3.8-.5 1.3-.5h5.2c.3 0 .5.2.5.5v10c0 .3-.2.5-.5.5H9.4c-.4 0-.8.2-1.1.4a.5.5 0 0 1-.6 0c-.3-.2-.7-.4-1.1-.4H1.5a.5.5 0 0 1-.5-.5v-10c0-.3.2-.5.5-.5Zm.5 1v9h4.6c.4 0 .8.1 1.1.3V3.8c-.2-.5-.6-.8-1-.8H2Zm6.7.8v8.5c.3-.2.7-.3 1.1-.3H14V3H9.7c-.4 0-.8.3-1 .8Z"/></svg>`;

function toolbar(d: Declared, count: number): string {
  const ctx = attr({ file: d.file, view: d.view.name, id: d.id });
  return `<div class="bs-bar" data-ctx="${ctx}">
    <span class="bs-view-name">${esc(d.view.name)}</span>
    <span class="bs-count">${count} result${count === 1 ? "" : "s"}</span>
    <span class="bs-gap"></span>
    <button type="button" class="bs-tool" data-pop="filter" data-help="filter">${FUNNEL_ICON} Filter</button>
    <button type="button" class="bs-tool" data-pop="sort" data-help="sort">⇅ Sort</button>
    <button type="button" class="bs-tool" data-pop="props" data-help="properties">≡ Properties</button>
    <button type="button" class="bs-tool bs-code-toggle" title="show the query">${CODE_ICON}</button>
  </div>`;
}

/**
 * THE QUERY, SHOWN AND EDITABLE.
 *
 * It replaces the table rather than sitting beside it, because the two are the
 * same thing rendered twice and nobody needs both at once.
 *
 * AN EDIT IS UNDOABLE (owner). A hand-edited query only applies on save, so
 * until then Reset puts the box back to what is saved. The served text is the
 * textarea's own default value, so nothing has to be stored twice to offer it.
 */
function codePanel(root: string, rel: string): string {
  return `<div class="bs-pane bs-pane-code" hidden>
    <div class="bs-code-head">
      <span class="bs-code-path bs-helpable" data-help="expression">${esc(rel)}</span>
      <button type="button" class="bs-tool bs-code-reset" title="put the query back the way it was saved">Reset</button>
      <button type="button" class="bs-add bs-code-save">Save the query</button>
    </div>
    <textarea class="bs-code-text" spellcheck="false">${esc(baseSource(root, rel))}</textarea>
  </div>`;
}

/** ONE DATABASE BLOCK — its chrome, its table and its code panel.
 *
 *  EXPORTED BECAUSE THE WORK EDITOR IS TWO OF THESE, side by side. Everything
 *  it needs already lives here: the count, the sort control, the properties
 *  control, grouping and filtering. A second surface would reinvent each one.
 *  see dsp-the-bucket-editor.md#the-editor-is-the-database */
export function basesBlock(
  root: string,
  d: Declared,
  props: PropertyInfo[],
  rowsIn?: Row[],
  groupLink?: GroupLink,
  groupShut?: GroupShut,
): string {
  // THE CALLER'S ROWS WIN. `basesCard` is handed a row set on some pages, and a
  // block that reached for the warm vault instead drew zero rows over rows the
  // caller was holding.
  const rows = rowsIn ?? rowsOf(root);
  let body: string;
  let count = 0;
  try {
    count = selectRows(d.spec, d.view, rows).length;
    body = renderView(d.spec, d.view, rows, groupLink, groupShut).html;
  } catch (err) {
    body = `<div class="tbl-refused">this view cannot be drawn — ${esc(String((err as Error).message).split("\n")[0])}</div>`;
  }
  return `<div class="bs-block" data-view="${esc(d.id)}">
    <div class="bs-chrome">${toolbar(d, count)}${filterPop(d, props)}${sortPop(d, props)}${propsPop(d, props)}</div>
    <div class="bs-pane bs-pane-table"><div class="bs-data">${body}</div></div>
    ${pager()}
    ${codePanel(root, d.file)}
  </div>`;
}

/** THE PAGER — previous, where you are, next, and how big a page is.
 *
 *  THE SIZE IS TYPED RATHER THAN PICKED (owner). Every other pager in this
 *  product offers a fixed set of options; the right page for a table of 249 is
 *  not on anybody's list of four.
 *
 *  IT SHIPS HIDDEN AND THE CLIENT DECIDES. Whether a pager is worth drawing
 *  depends on how many rows a CLOSED group is currently swallowing, and only
 *  the page knows that. A pager over one page says nothing the count does not.
 *
 *  EVERY ROW STAYS IN THE MARKUP. Paging hides; it never prunes. A page change
 *  costs no fetch, and the reader's place survives it. */
function pager(): string {
  return `<div class="bs-pager" hidden>
    <button type="button" class="bs-prev" title="previous page">‹</button>
    <span class="bs-where"></span>
    <button type="button" class="bs-next" title="next page">›</button>
    <input type="number" class="bs-per" min="0" step="1" value="50" title="rows a page — type any number, or 0 for all" />
    <span class="bs-per-label">a page</span>
  </div>`;
}

/** Whether the vault is warm enough to draw. A COLD VAULT IS NOT AN EMPTY ONE,
 *  and a block that drew "no rows match this view's filter" over a vault that
 *  had not been read yet would be saying something false. */
export function vaultWarm(root: string): boolean {
  if (warmRows(root) !== undefined) return true;
  void warmVault(root);
  return false;
}

/** The warm rows, or none. Callers check `vaultWarm` first. */
function rowsOf(root: string): Row[] {
  return warmRows(root) ?? [];
}

/** Every view declared in the vault, with the file and spec it came from. */
export function declaredViews(root: string): Declared[] {
  const out: Declared[] = [];
  for (const rel of listBases(root)) {
    const spec = loadBase(join(vaultDir(root), rel));
    for (const view of spec.views) out.push({ id: `${rel}#${view.name}`, file: rel, spec, view });
  }
  return out;
}

/** The property inventory the sort and properties controls draw from. */
export function viewProperties(root: string): PropertyInfo[] {
  return propertyInventory(rowsOf(root));
}

/** WHO THIS CARD IS, when it is not the database card.
 *
 *  THE WORK EDITOR IS THIS CARD, TWICE. It needs its own element id and its own
 *  title, and nothing else — the count, the sort, the properties, the grouping
 *  and the filtering are the same code serving a different `.base` file. */
export interface CardIdentity {
  id?: string;
  title?: string;
  /** Drawn folded, opened by whatever control the page gives it. */
  hidden?: boolean;
}

export function basesCard(root: string, head: string, selected?: string, rowsIn?: Row[], who: CardIdentity = {}): string {
  const id = who.id ?? "w-table";
  const title = who.title ?? "database";
  const fold = who.hidden === true ? " hidden" : "";
  // see dsp-live-register.md#the-index-is-warm-and-a-render-never-builds-it
  const rows = rowsIn ?? warmRows(root);
  if (rows === undefined) {
    void warmVault(root);
    return `<div class="widget" id="${id}"${fold}><div class="widget-head"><span>${esc(title)}</span>${head}</div>
      <div class="widget-body bs-body"><div class="bs-empty">The vault is warming. This card fills itself on the next refresh.</div></div></div>`;
  }
  const damaged = unreadableRows(rows);
  const props = propertyInventory(rows);
  const declared: Declared[] = [];
  for (const rel of listBases(root)) {
    const spec = loadBase(join(vaultDir(root), rel));
    for (const view of spec.views) declared.push({ id: `${rel}#${view.name}`, file: rel, spec, view });
  }
  if (declared.length === 0) {
    return `<div class="widget" id="${id}"${fold}><div class="widget-head"><span>${esc(title)}</span>${head}</div>
      <div class="widget-body bs-body"><div class="bs-empty">No <code>.base</code> file in the vault yet.
      <button type="button" class="bs-add bs-create">Create one</button></div></div></div>`;
  }
  // A VIEW IS NAMED BY ITS FILE AND ITS VIEW, and the file part is a PATH. A
  // caller naming `work.base#left` means the one under any folder, so the match
  // accepts a suffix.
  //
  // AND AN UNMATCHED SELECTION SAYS SO RATHER THAN DRAWING SOMETHING ELSE.
  // Falling back to the first declared view put a general note listing inside
  // the work editor, which reads as the editor showing the wrong work rather
  // than as a name nothing answers.
  const hit = selected === undefined ? undefined : declared.find((x) => x.id === selected || x.id.endsWith(`/${selected}`));
  if (selected !== undefined && hit === undefined) {
    return `<div class="widget" id="${id}"${fold}><div class="widget-head"><span>${esc(title)}</span>${head}</div>
      <div class="widget-body bs-body"><div class="bs-empty">No view named <code>${esc(selected)}</code> is declared in the vault.</div></div></div>`;
  }
  const want = hit?.id ?? declared[0].id;

  // ONE BLOCK BUILDER, TWO CALLERS. This used to hold its own copy of
  // `basesBlock`, character for character, and a fix to either one left the
  // other behind.
  const blocks = declared
    .filter((d) => d.id === want)
    .map((d) => basesBlock(root, d, props, rows))
    .join("");

  const damage =
    damaged.length === 0
      ? ""
      : `<div class="tbl-damage">${damaged.length} note${damaged.length === 1 ? "" : "s"} in the vault do not parse — ${esc(damaged[0])}</div>`;
  return `<div class="widget" id="${id}"${fold}><div class="widget-head"><span>${esc(title)}</span>${head}</div>
    <div class="widget-body bs-body">${damage}${blocks}</div></div>`;
}

export { LAYOUTS };
