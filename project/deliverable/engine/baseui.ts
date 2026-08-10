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
import { baseSource, LAYOUTS } from "./bases.ts";
import { GLOBALS, METHODS, type TypeName, typeOf } from "./expr.ts";
import { type BaseSpec, type BaseView, listBases, loadBase, type Row, renderView, selectRows, unreadableRows, vaultDir } from "./tables.ts";
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
 */
function codePanel(root: string, rel: string): string {
  return `<div class="bs-pane bs-pane-code" hidden>
    <div class="bs-code-head">
      <span class="bs-code-path bs-helpable" data-help="expression">${esc(rel)}</span>
      <button type="button" class="bs-add bs-code-save">Save the query</button>
    </div>
    <textarea class="bs-code-text" spellcheck="false">${esc(baseSource(root, rel))}</textarea>
  </div>`;
}

export function basesCard(root: string, head: string, selected?: string, rowsIn?: Row[]): string {
  // THE WARM MODEL, not a fresh read. Re-reading the vault on every render is
  // the thing this replaced: the index is built once, kept current by the
  // watcher, and every view reads the same rows the filters do.
  //
  // THE WATCHER IS STARTED BY vaultFor, and until 2026-08-09 it was not — this
  // comment described a mechanism with no callers, and the rows here were a
  // snapshot from the first render.
  //
  // STILL BLOCKING. vaultFor runs the SYNCHRONOUS build, and vault.ts says in
  // as many words that anything with an interface behind it must use
  // warmVault() instead. That needs this call chain to be async and is not
  // done; see the note filed 2026-08-09.
  const rows = rowsIn ?? vaultFor(root).all();
  const damaged = unreadableRows(rows);
  const props = propertyInventory(rows);
  const declared: Declared[] = [];
  for (const rel of listBases(root)) {
    const spec = loadBase(join(vaultDir(root), rel));
    for (const view of spec.views) declared.push({ id: `${rel}#${view.name}`, file: rel, spec, view });
  }
  if (declared.length === 0) {
    return `<div class="widget" id="w-table"><div class="widget-head"><span>database</span>${head}</div>
      <div class="widget-body bs-body"><div class="bs-empty">No <code>.base</code> file in the vault yet.
      <button type="button" class="bs-add bs-create">Create one</button></div></div></div>`;
  }
  const want = declared.find((x) => x.id === selected)?.id ?? declared[0].id;

  const blocks = declared
    .map((d) => {
      const shown = d.id === want;
      if (!shown) return "";
      let body: string;
      let count = 0;
      try {
        count = selectRows(d.spec, d.view, rows).length;
        body = renderView(d.spec, d.view, rows).html;
      } catch (err) {
        body = `<div class="tbl-refused">this view cannot be drawn — ${esc(String((err as Error).message).split("\n")[0])}</div>`;
      }
      return `<div class="bs-block" data-view="${esc(d.id)}">
        <div class="bs-chrome">${toolbar(d, count)}${sortPop(d, props)}${propsPop(d, props)}</div>
        <div class="bs-pane bs-pane-table"><div class="bs-data">${body}</div></div>
        ${codePanel(root, d.file)}
      </div>`;
    })
    .join("");

  const damage =
    damaged.length === 0
      ? ""
      : `<div class="tbl-damage">${damaged.length} note${damaged.length === 1 ? "" : "s"} in the vault do not parse — ${esc(damaged[0])}</div>`;
  return `<div class="widget" id="w-table"><div class="widget-head"><span>database</span>${head}</div>
    <div class="widget-body bs-body">${damage}${blocks}</div></div>`;
}

export { LAYOUTS };
