// THE EDITOR IS GENERIC, AND THE WORK EDITOR IS ONE VIEW FILE IN IT.
//
// It draws whatever `se query` answers. It knows about columns, groups and
// pinned groups, and it knows nothing about work: the view file decides what is
// selected and what it is grouped by, and the engine decides what a row is. A
// second source drawn here later is a second view name, not a change to this.
//
// TWO PANES, ONE HEADER. The view file declares two views and both are drawn
// side by side. Two cards would each bring a header, and the reader would be
// looking at three bars stacked over one list.
//
// THE PAGE IS BUILT ONCE AND THE DATA CHANGES INSIDE IT. Replacing the page
// throws away what the reader was doing: which groups they folded and where
// they had scrolled to. The data changed. What they were looking at did not.
//
// IT READS FILES AND RUNS THE ENGINE. There is no server and no port. The
// engine is the only writer, so the editor asks it rather than touching a note.
//
// THE HOST OWNS THE LOOK. Fonts and colours are the editor's own, so the page
// carries no palette of its own and adds no frame around a window VS Code has
// already framed.

export type Cell = { value: string; list?: boolean };
export type Line = { id: string; cells: Record<string, Cell> };
export type Group = {
  name: string;
  by?: string;
  sets?: string;
  pinned?: boolean;
  pins?: string;
  declared?: boolean;
  shut?: boolean;
  depth: number;
  count: number;
  lines?: Line[];
  groups?: Group[];
};
export type Tally = { name: string; n: number };
export type Table = {
  view: string;
  columns: string[];
  heads: Record<string, string>;
  widths?: Record<string, number>;
  opens?: Record<string, boolean>;
  icons?: Record<string, { glyph: string }>;
  pinned?: Group[];
  groups?: Group[];
  counts?: Tally[];
  total: number;
  props?: PropertyInfo[];
  group?: LevelSaid[];
  sorted?: LevelSaid[];
  file?: string;
  source?: string;
  filters?: FilterGroup[];
  operators?: Operator[];
  error?: string;
};

// EVERY MARK THIS DRAWS COMES FROM THE ENGINE'S TABLE. Nothing here carries a
// glyph, so the same mark is the same mark in the sidebar and here, and one
// edit to util/icons.json changes both.
//
// A NAME THE TABLE DOES NOT HOLD DRAWS ITSELF. A blank leaves a button nobody
// can see, and the name on the face says which entry is missing.
let ICONS: Record<string, { glyph: string }> = {};
const icon = (name: string) => ICONS[name]?.glyph ?? name;

export type PropertyInfo = { name: string; type: string; on: boolean };
export type Operator = { id: string; label: string; types?: string[]; takes: boolean };
export type FilterRow = { property: string; operator: string; value?: string };
export type FilterGroup = { rows: FilterRow[] | null; raw?: string };
export type LevelSaid = { property: string; direction: string; sets?: string };
export type Pane = { side: string; table: Table };
export type Body = { heads: string; pinned: string; scrolling: string; total: number; counts: Tally[] };

export function editorHtml(panes: Pane[], views: string[], view: string): string {
  // THE TABLE ARRIVES WITH THE DATA, and it is taken before a mark is drawn.
  // Every pane carries the same one, so the first that has it decides.
  for (const p of panes) {
    if (p.table?.icons) {
      ICONS = p.table.icons;
      break;
    }
  }
  const tabs = views
    .map((v) => `<button class="tab${v === view ? " on" : ""}" data-view="${esc(v)}">${esc(v)}</button>`)
    .join("");
  const seam = `<div class="seam" hidden></div>`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
<style>${css()}</style>
</head>
<body>
<div class="bar">${tabs}
  <button class="second" id="second" title="show a second column">${icon("split")}</button>
</div>
<div class="panes">
${panes.map((p, i) => paneHtml(p, i > 0)).join(seam)}
</div>
<script>${script()}</script>
</body>
</html>`;
}

// A pane is the pinned groups that do not scroll, and the part that does.
function paneHtml(p: Pane, hidden: boolean): string {
  const b = paneBody(p.table);
  const t = p.table;
  return `<div class="pane-wrap" data-side="${esc(p.side)}"${hidden ? " hidden" : ""}>
  <div class="chrome">${toolbar(t)}${filterPop(t)}${sortPop(t)}${propsPop(t)}</div>
  <div class="heads">${b.heads}</div>
  <div class="top">${b.pinned}</div>
  <div class="pane">${b.scrolling}</div>
  ${pager()}
  ${codePanel(t)}
</div>`;
}

// THE TOOLBAR IS NOT IN THE SCROLLING AREA. It sits above a pane that scrolls
// on its own, so it stays put while rows go past.
//
// HELP IS A DETAIL, NEVER A BUTTON. There is no question mark anywhere here.
// Clicking a control's label puts its help where a person is already looking.
//
// THE TOTAL IS NOT UP HERE. Every group heading carries its own count, so a
// number on the bar is the same fact in a second place, and the two disagree
// the moment a filter moves. baseui.ts:390 had one. It is left out.
//
// Ported from baseui.ts:383-395.
function toolbar(t: Table): string {
  // THE BUTTONS SAY WHAT THEY CAN DO. A count nobody can see turns a dead
  // button into a mystery, so the bar carries the number as well as the state.
  //
  // THE NAME IS TYPED ON THE BAR. No dialog, because a webview refuses a
  // browser prompt: v3's control that asked for a name did nothing at all when
  // pressed. So the bucket is made first and named afterwards.
  return `<div class="bs-bar">
    <button type="button" class="bs-tool bs-group" hidden
      title="make a group of the ticked rows">${icon("plus")} Group</button>
    <button type="button" class="bs-tool bs-rename" hidden
      title="rename the group these rows are in">Rename</button>
    <input class="bs-rename-field" type="text" hidden placeholder="a name for it">
    <span class="bs-gap"></span>
    <button type="button" class="bs-tool" data-pop="filter" data-help="filter">${icon("filter")} Filter</button>
    <button type="button" class="bs-tool" data-pop="sort" data-help="sort">${icon("sort")} Sort</button>
    <button type="button" class="bs-tool" data-pop="props" data-help="properties">${icon("columns")} Properties</button>
    <button type="button" class="bs-tool bs-code-toggle" title="show the query">${icon("query")}</button>
  </div>`;
}

// THE FUNNEL'S POPOVER.
//
// GROUPS ARE ANDED, ROWS INSIDE A GROUP ARE ORED. The join word is drawn on
// every group and every row, and the first one of each is hidden by CSS. A join
// written per row cannot drift out of step with the rows.
//
// The two templates at the end are what Add condition and Add group clone. A
// template's content is not in the document tree, so it is never collected as a
// real row, and it is always there, which a control that cloned a drawn row
// would not be when every stored group is raw.
//
// Ported from baseui.ts:314-375.
function filterPop(t: Table): string {
  const groups = (t.filters ?? []).length ? t.filters! : [{ rows: [] }];
  const ops = JSON.stringify(t.operators ?? []);
  const types: Record<string, string> = {};
  for (const p of t.props ?? []) types[p.name] = p.type;
  return `<div class="bs-pop" data-pop="filter" data-ops='${esc(ops)}'
    data-types='${esc(JSON.stringify(types))}' hidden>
    <div class="bs-pop-title" data-help="filter">Filter by</div>
    <div class="bs-groups">${groups.map((g) => groupRow(g, t)).join("")}</div>
    <button type="button" class="bs-add bs-add-group">+ Add group</button>
    <template class="bs-cond-tpl">${condRow({ property: "", operator: "" }, t)}</template>
    <template class="bs-group-tpl">${groupRow({ rows: [] }, t)}</template>
  </div>`;
}

function groupRow(g: FilterGroup, t: Table): string {
  if (g.raw) {
    return `<div class="bs-group bs-group-raw">
      <span class="bs-join">and</span>
      <div class="bs-group-body">
        <div class="bs-raw"><code>${esc(g.raw)}</code></div>
        <div class="bs-raw-note">Not a condition this builder can draw, so it is left exactly as
        written. The query is where it is edited.</div>
      </div>
    </div>`;
  }
  const rows = (g.rows ?? []).length ? g.rows! : [{ property: "", operator: "" }];
  return `<div class="bs-group">
    <span class="bs-join">and</span>
    <div class="bs-group-body">
      <div class="bs-conds">${rows.map((r) => condRow(r, t)).join("")}</div>
      <button type="button" class="bs-add bs-add-cond">+ Add condition</button>
    </div>
  </div>`;
}

function condRow(row: FilterRow, t: Table): string {
  const kind = (t.props ?? []).find((p) => p.name === row.property)?.type ?? "";
  const op = (t.operators ?? []).find((o) => o.id === row.operator);
  const takes = op === undefined || op.takes;
  const props = (t.props ?? [])
    .map((p) => `<option value="${esc(p.name)}"${p.name === row.property ? " selected" : ""}>${esc(p.name)}</option>`)
    .join("");
  return `<div class="bs-row bs-cond">
    <span class="bs-join">or</span>
    <select class="bs-prop"><option value=""></option>${props}</select>
    <select class="bs-op">${opOptions(t, kind, row.operator)}</select>
    <input class="bs-val" type="text" placeholder="value" value="${esc(row.value ?? "")}"${takes ? "" : " hidden"}>
    <button type="button" class="bs-icon bs-drop-cond" title="remove this condition">${icon("remove")}</button>
  </div>`;
}

// AN OPERATOR ALREADY IN THE FILE IS SHOWN even where the type does not offer
// it. The type is inferred from the data, so it can be wrong, and dropping the
// stored operator would rewrite the filter the next time an unrelated row moved.
function opOptions(t: Table, kind: string, selected: string): string {
  const all = t.operators ?? [];
  const offered = all.filter((o) => !o.types?.length || (kind !== "" && o.types.includes(kind)));
  const shown = offered.some((o) => o.id === selected) || selected === ""
    ? offered
    : [...offered, ...all.filter((o) => o.id === selected)];
  return shown
    .map((o) => `<option value="${esc(o.id)}"${o.id === selected ? " selected" : ""}>${esc(o.label)}</option>`)
    .join("");
}

// Sort and group by, both as LISTS.
//
// An empty list still draws one blank row. Without it there is nothing to clone
// and Add does nothing at all, which is exactly what a control that lies looks
// like. Ported from baseui.ts:240-258.
function sortPop(t: Table): string {
  const groups = (t.group ?? []).length ? t.group! : [{ property: "", direction: "ASC" }];
  const sorts = (t.sorted ?? []).length ? t.sorted! : [{ property: "", direction: "ASC" }];
  return `<div class="bs-pop" data-pop="sort" hidden>
    <div class="bs-pop-title" data-help="sort">Group by</div>
    <div class="bs-levels" data-kind="group">${groups.map((g) => level("group", g, t)).join("")}</div>
    <div class="bs-pop-title" data-help="sort">Sort by</div>
    <div class="bs-levels" data-kind="sort">${sorts.map((sr) => level("sort", sr, t)).join("")}</div>
  </div>`;
}

function level(kind: string, l: LevelSaid, t: Table): string {
  const opts = (t.props ?? [])
    .map((p) => `<option value="${esc(p.name)}"${p.name === l.property ? " selected" : ""}>${esc(p.name)}</option>`)
    .join("");
  const asc = l.direction !== "DESC";
  return `<div class="bs-level" data-kind="${esc(kind)}">
    <select class="bs-level-prop"><option value=""></option>${opts}</select>
    <button type="button" class="bs-dir" data-direction="${asc ? "ASC" : "DESC"}"
      data-up="${icon("up")}" data-down="${icon("down")}"
      title="${asc ? "smallest first" : "largest first"}">${asc ? icon("up") : icon("down")}</button>
  </div>`;
}

// The column list, with a find box. Ported from baseui.ts:260-276.
function propsPop(t: Table): string {
  const items = (t.props ?? [])
    .map(
      (p) => `<label class="bs-prop-item${p.on ? " on" : ""}">
      <input type="checkbox" class="bs-tick" data-property="${esc(p.name)}"${p.on ? " checked" : ""}>
      <span class="bs-type" title="${esc(p.type)}">${icon("type." + p.type)}</span>
      <span class="bs-prop-name">${esc(p.name)}</span>
    </label>`,
    )
    .join("");
  return `<div class="bs-pop bs-pop-tall" data-pop="props" hidden>
    <input class="bs-find" type="text" placeholder="Find a property...">
    <div class="bs-prop-list">${items}</div>
    <div class="bs-pop-foot"><button type="button" class="bs-add bs-hide-all">Hide all</button></div>
  </div>`;
}

// THE PAGER: previous, where you are, next, and how big a page is.
//
// THE SIZE IS TYPED RATHER THAN PICKED. The right page for a table of 249 is
// not on anybody's list of four.
//
// IT SHIPS HIDDEN AND THE PAGE DECIDES. Whether a pager is worth drawing
// depends on how many rows a closed group is swallowing, and only the page
// knows that. A pager over one page says nothing the count does not.
//
// EVERY ROW STAYS IN THE MARKUP. Paging hides, it never prunes. A page change
// costs no fetch and the reader's place survives it.
//
// Ported from baseui.ts:466-474.
function pager(): string {
  return `<div class="bs-pager" hidden>
    <button type="button" class="bs-prev" title="previous page">${icon("previous")}</button>
    <span class="bs-where"></span>
    <button type="button" class="bs-next" title="next page">${icon("next")}</button>
    <input type="number" class="bs-per" min="0" step="1" value="50"
      title="rows a page. Type any number, or 0 for all">
    <span class="bs-per-label">a page</span>
  </div>`;
}

// THE QUERY, SHOWN. It replaces the table rather than sitting beside it,
// because the two are the same thing rendered twice and nobody needs both at
// once. Ported from baseui.ts:398-416.
function codePanel(t: Table): string {
  return `<div class="bs-pane-code" hidden>
    <div class="bs-code-head"><span class="bs-code-path">${esc(t.file ?? "")}</span></div>
    <pre class="bs-code-text">${esc(t.source ?? "")}</pre>
  </div>`;
}

export function paneBody(t: Table): Body {
  if (t.error) {
    return { heads: "", pinned: `<p class="bad">${esc(t.error)}</p>`, scrolling: "", total: 0, counts: [] };
  }
  const cols = t.columns ?? [];
  // THE COLUMN HEADER SITS ABOVE EVERYTHING, pinned groups included. It was
  // below them, so a pinned group had no columns over it and read as a
  // different kind of thing. A pinned group is a group.
  return {
    heads: `<table>
  <thead><tr>${cols.map((c, i) => head(c, t, i === cols.length - 1)).join("")}</tr></thead>
</table>`,
    pinned: (t.pinned ?? []).map((g) => groupHtml(g, cols, t)).join(""),
    scrolling: (t.groups ?? []).map((g) => groupHtml(g, cols, t)).join(""),
    total: t.total,
    counts: t.counts ?? [],
  };
}

// THE LAST COLUMN TAKES WHATEVER IS LEFT, so the table always fills its pane.
// Giving it a width too leaves a dead strip down the right.
function head(c: string, t: Table, last: boolean): string {
  const w = last ? 0 : t.widths?.[c];
  return `<th data-col="${esc(c)}"${w ? ` style="width:${w}px"` : ""}>${esc(t.heads?.[c] ?? c)}</th>`;
}

// A group is a heading and its rows. It carries what a drop into it would
// write, so a renderer can offer the target without knowing what the level was
// computed from.
function groupHtml(g: Group, cols: string[], t: Table): string {
  const kids = (g.groups ?? []).map((k) => groupHtml(k, cols, t)).join("");
  const rows = (g.lines ?? []).map((l) => rowHtml(l, cols, t)).join("");
  const drop = g.sets ? ` data-sets="${esc(g.sets)}" data-into="${esc(g.name)}"` : "";
  // The key a fold is remembered by. Its name and its depth, because two groups
  // with the same name at different depths are two groups.
  const key = `${g.pinned ? "pin" : "g"}:${g.depth}:${g.name}`;
  // EVERY GROUP CARRIES A PIN. It is a span of its own, so clicking it pins
  // rather than folding, the same way the column grip is its own span.
  //
  // A pinned group unpins by its name. Any other pins on the filter the engine
  // says would keep it, because the engine owns the expression language.
  const pin = g.pinned
    ? `<span class="pin on" data-unpin="${esc(g.name)}" title="unpin">${icon("pin")}</span>`
    : g.declared
      ? `<span class="pin" data-pin="${esc(g.name)}" title="pin">${icon("pin")}</span>`
      : g.pins
        ? `<span class="pin" data-pin="${esc(g.name)}" data-matching="${esc(g.pins)}" title="pin">${icon("pin")}</span>`
        : "";
  return `<section class="group${g.pinned ? " pinned" : ""}${g.shut ? " shut" : ""}"
    data-key="${esc(key)}" style="--depth:${g.depth}"${drop}>
  <h2><span class="fold">${g.shut ? icon("shut") : icon("open")}</span>
    <span class="name">${esc(g.name || "no group")}</span>
    <span class="count">${g.count}</span>${pin}</h2>
  <div class="rows">
    <table>${rows}</table>
    ${kids}
  </div>
</section>`;
}

// A CELL SAYS WHETHER IT CAN BE EDITED, and why not when it cannot. A cell that
// silently ignores a double-click reads as a broken table.
function rowHtml(l: Line, cols: string[], t: Table): string {
  const last = cols[cols.length - 1];
  const cells = cols
    .map((c) => {
      const v = l.cells?.[c]?.value ?? "";
      const w = c === last ? 0 : t.widths?.[c];
      const width = w ? ` style="width:${w}px"` : "";
      if (t.opens?.[c]) {
        // THE TEXT IS THE DOOR, AND ONLY THE TEXT. It underlines under the
        // pointer, and that underline is the promise: press the underlined
        // words and the note opens, press anywhere else on the row and the row
        // ticks. A cell that was a door edge to edge left no way to tick a row.
        return `<td class="opens" data-col="${esc(c)}"${width}><span class="door" ` +
          `title="open the note">${esc(v)}</span></td>`;
      }
      const why = locked(c);
      if (why) {
        return `<td class="locked" data-col="${esc(c)}"${width} title="${esc(why)}">${esc(v)}</td>`;
      }
      return `<td class="edits" data-col="${esc(c)}" data-was="${esc(v)}"${width} title="double-click to edit">${esc(v)}</td>`;
    })
    .join("");
  return `<tr draggable="true" data-id="${esc(l.id)}">${cells}</tr>`;
}

// What the engine decides and a person may not type over. Editing one of these
// would put the note and the engine's reading of it out of step.
function locked(col: string): string {
  if (col.startsWith("file.")) return "renaming is a move, not an edit";
  switch (col) {
    case "id":
    case "seq":
    case "type":
      return "the engine decides this";
    case "status":
    case "holder":
      return "a pull moves this, not a keystroke";
    case "subs":
    case "depends_on":
    case "successors":
      return "a list is edited in the note";
  }
  return "";
}

export function tallyHtml(counts: Tally[]): string {
  return counts.map((c) => `<span class="tally"><b>${c.n}</b>${esc(c.name)}</span>`).join("");
}

function esc(s: string): string {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function css(): string {
  return `
  body { font-family: var(--vscode-font-family); font-size: var(--vscode-font-size);
         color: var(--vscode-foreground); background: var(--vscode-editor-background);
         margin: 0; padding: 0; display: flex; flex-direction: column; height: 100vh; }
  .bar { display: flex; align-items: center; gap: 4px; padding: 4px 8px; flex: 0 0 auto;
         border-bottom: 1px solid var(--vscode-panel-border); }
  /* ONE LOOK FOR EVERY BUTTON. v3 drew its table's buttons differently from
     every other button in the product, and the reader had to learn two. */
  button { font: inherit; padding: 2px 8px; border: 0; border-radius: 2px; cursor: pointer;
           color: var(--vscode-foreground); background: transparent; }
  button:hover { background: var(--vscode-list-hoverBackground); }
  button.on { background: var(--vscode-list-activeSelectionBackground);
              color: var(--vscode-list-activeSelectionForeground); }
  /* Two panes, and the seam between them. The second ships hidden. */
  .panes { flex: 1 1 auto; display: flex; min-height: 0; }
  .pane-wrap { flex: 1 1 0; display: flex; flex-direction: column; min-width: 0; min-height: 0; }
  .seam { flex: 0 0 1px; background: var(--vscode-panel-border); }
  /* THE COLUMN HEADER IS ABOVE EVERYTHING, so a pinned group has columns over
     it exactly like every other group. */
  .heads { flex: 0 0 auto; }
  /* The pinned groups do not scroll. That is the whole of what pinning is. */
  .top { flex: 0 0 auto; border-bottom: 1px solid var(--vscode-panel-border); }
  .pane { flex: 1 1 auto; overflow: auto; }
  thead th { position: sticky; top: 0; z-index: 2; text-align: left; font-weight: 600;
             padding: 4px 8px; background: var(--vscode-editor-background);
             color: var(--vscode-descriptionForeground);
             border-bottom: 1px solid var(--vscode-panel-border); }
  table { width: 100%; border-collapse: collapse; table-layout: fixed; }
  td { padding: 2px 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  tr:hover { background: var(--vscode-list-hoverBackground); }
  td.opens .door { cursor: pointer; }
  td.opens .door:hover { text-decoration: underline; }
  tr.ticked td { background: var(--vscode-list-activeSelectionBackground);
                 color: var(--vscode-list-activeSelectionForeground); }
  td.edits { cursor: text; }
  td.editing { padding: 0; }
  td.editing input { width: 100%; box-sizing: border-box; font: inherit; padding: 2px 6px;
                     color: var(--vscode-input-foreground); background: var(--vscode-input-background);
                     border: 1px solid var(--vscode-focusBorder); }
  td.bad { outline: 1px solid var(--vscode-errorForeground); outline-offset: -1px; }
  h2 { font-size: .85em; text-transform: uppercase; letter-spacing: .06em; font-weight: 600;
       color: var(--vscode-descriptionForeground); margin: 0; padding: 4px 8px;
       padding-left: calc(8px + var(--depth) * 14px);
       display: flex; align-items: center; gap: 6px; cursor: pointer; }
  h2 .count { color: var(--vscode-descriptionForeground); font-weight: 400; }
  .group.shut .rows { display: none; }
  /* A PINNED GROUP LOOKS LIKE EVERY OTHER GROUP. What says it is pinned is the
     pin, which is lit rather than faint. */
  .pin { margin-left: 6px; opacity: 0; cursor: pointer; font-size: .9em; }
  h2:hover .pin, .pin.on { opacity: 1; }
  .pin:not(.on) { filter: grayscale(1); }
  .group.over { outline: 1px solid var(--vscode-focusBorder); outline-offset: -1px; }
  .bad { padding: 12px; color: var(--vscode-errorForeground); white-space: pre-wrap; }

  /* The toolbar, ported from basesclient.ts:16-60. A control redraws the data
     and not the card, so a popover the reader opened stays open. */
  .chrome { position: relative; flex: 0 0 auto; }
  .bs-bar { display: flex; align-items: center; gap: 6px; padding: 3px 8px;
            border-bottom: 1px solid var(--vscode-panel-border); }
  .bs-code-path { color: var(--vscode-descriptionForeground); font-size: .9em; }
  .bs-rename-field { font: inherit; padding: 1px 4px; min-width: 140px;
                     color: var(--vscode-input-foreground);
                     background: var(--vscode-input-background);
                     border: 1px solid var(--vscode-input-border, transparent); }
  .bs-gap { flex: 1 1 auto; }
  .bs-pop { position: absolute; right: 8px; top: 26px; z-index: 30; padding: 8px;
            min-width: 240px; border-radius: 3px;
            background: var(--vscode-dropdown-background, var(--vscode-editor-background));
            border: 1px solid var(--vscode-dropdown-border, var(--vscode-focusBorder));
            box-shadow: 0 2px 10px rgba(0,0,0,.4); }
  /* A CLASS BEATS THE BROWSER'S OWN [hidden] RULE, so a popover given a
     display by one of these stayed on screen with hidden set on it. The
     properties popover is the tall one, which is why that was the one always
     open. This says it once, for every popover. */
  .bs-pop[hidden] { display: none; }
  .bs-pop-tall { max-height: 60vh; display: flex; flex-direction: column; }
  .bs-pop-title { font-size: .85em; text-transform: uppercase; letter-spacing: .06em;
                  color: var(--vscode-descriptionForeground); margin: 4px 0; cursor: pointer; }
  .bs-level { display: flex; gap: 6px; align-items: center; margin-bottom: 4px; }
  .bs-level-prop { flex: 1 1 auto; font: inherit; }
  .bs-find { width: 100%; box-sizing: border-box; font: inherit; padding: 2px 6px; margin-bottom: 6px; }
  .bs-prop-list { overflow: auto; flex: 1 1 auto; }
  .bs-prop-item { display: flex; gap: 6px; align-items: center; padding: 2px 0; cursor: pointer; }
  .bs-prop-item .bs-type { color: var(--vscode-descriptionForeground); width: 14px; }
  .bs-pop-foot { margin-top: 6px; }
  /* The query replaces the table rather than sitting beside it. */
  /* The join word is drawn on every row and the first of each is hidden, so it
     cannot drift out of step with the rows. */
  .bs-group { display: flex; gap: 6px; margin-bottom: 6px; }
  .bs-group:first-child > .bs-join, .bs-cond:first-child > .bs-join { visibility: hidden; }
  .bs-join { color: var(--vscode-descriptionForeground); font-size: .85em; width: 26px; }
  .bs-group-body { flex: 1 1 auto; }
  .bs-cond { display: flex; gap: 4px; align-items: center; margin-bottom: 4px; }
  .bs-cond select, .bs-cond input { font: inherit; min-width: 0; }
  .bs-prop, .bs-op { flex: 1 1 0; }
  .bs-val { flex: 1 1 0; padding: 1px 4px; }
  .bs-icon { padding: 0 5px; color: var(--vscode-descriptionForeground); }
  .bs-raw code { font-family: var(--vscode-editor-font-family); }
  .bs-raw-note { color: var(--vscode-descriptionForeground); font-size: .85em; margin-top: 2px; }
  th { position: relative; }
  .th-grip { position: absolute; right: 0; top: 0; width: 6px; height: 100%;
             cursor: col-resize; }
  .bs-pager { display: flex; align-items: center; gap: 6px; padding: 3px 8px; flex: 0 0 auto;
              border-top: 1px solid var(--vscode-panel-border); }
  .bs-where, .bs-per-label { color: var(--vscode-descriptionForeground); font-size: .9em; }
  .bs-per { width: 60px; font: inherit; }
  .bs-pane-code { flex: 1 1 auto; overflow: auto; }
  .bs-code-head { padding: 4px 8px; border-bottom: 1px solid var(--vscode-panel-border); }
  .bs-code-text { margin: 0; padding: 8px; font-family: var(--vscode-editor-font-family);
                  white-space: pre; }
  /* THE TABLE IS THREE PARTS AND THEY HIDE TOGETHER. The header moved out of
     the scroller and this rule was not extended to it, so the raw query showed
     with a stranded header row over it. */
  .pane-wrap.showing-code .pane,
  .pane-wrap.showing-code .top,
  .pane-wrap.showing-code .heads { display: none; }
  `;
}

function script(): string {
  return `
  const vscode = acquireVsCodeApi();
  const send = (m) => vscode.postMessage(m);

  // WHAT THE READER WAS DOING, KEPT ACROSS A CHANGE IN THE DATA. Folding a
  // group and scrolling to a place are things a person did, and throwing them
  // away because a file was written is the editor answering a question nobody
  // asked.
  const folded = new Set();

  function remember() {
    for (const g of document.querySelectorAll('.group[data-key]')) {
      const key = g.closest('.pane-wrap').dataset.side + '/' + g.dataset.key;
      if (g.classList.contains('shut')) folded.add(key); else folded.delete(key);
    }
  }

  function restore(where) {
    for (const g of where.querySelectorAll('.group[data-key]')) {
      const shut = folded.has(where.dataset.side + '/' + g.dataset.key);
      g.classList.toggle('shut', shut);
      const f = g.querySelector('.fold');
      if (f) f.textContent = shut ? '\\u25B8' : '\\u25BE';
    }
  }

  // TICKED ROWS MAKE A GROUP, and a group is a bucket: the person's own name
  // for one. It does not move the work. The status stays exactly as it was and
  // only the grouping changes.
  function ticked() {
    return [...document.querySelectorAll('.pane tr.ticked')];
  }

  // THE HEADING A ROW STANDS UNDER names the group it is in, which is the
  // bucket where it has one and the status where it has none. The column is not
  // always shown, so the heading answers instead.
  function groupOf(row) {
    const section = row.closest('section.group');
    if (!section) return { name: '', declared: true };
    return {
      name: (section.querySelector('h2 .name')?.textContent ?? '').trim(),
      declared: section.querySelector('h2 .pin')?.hasAttribute('data-matching') === false,
    };
  }

  // THE BUTTONS SAY WHAT THEY CAN DO. A count nobody can see turns a dead
  // button into a mystery.
  //
  // RENAMING NEEDS A BUCKET, not merely a selection. A row grouped by its
  // status has no bucket to rename, and a status is the system's word.
  function countTicked() {
    const rows = ticked();
    const first = rows[0] ? groupOf(rows[0]) : { name: '', declared: true };
    for (const bar of document.querySelectorAll('.bs-bar')) {
      const group = bar.querySelector('.bs-group');
      const rename = bar.querySelector('.bs-rename');
      group.hidden = rename.hidden = rows.length === 0;
      rename.disabled = first.declared || first.name === '';
      rename.title = rename.disabled
        ? 'these rows are grouped by their status, and a status is not yours to rename'
        : 'rename ' + first.name;
    }
    if (rows.length === 0) {
      for (const box of document.querySelectorAll('.bs-rename-field')) box.hidden = true;
    }
  }

  document.addEventListener('click', (ev) => {
    const make = ev.target.closest?.('.bs-group');
    if (!make) return;
    const rows = ticked();
    if (rows.length === 0) return;
    // AN EMPTY NAME ASKS THE ENGINE FOR A FRESH ONE. It knows what is taken and
    // the client would have to guess. The bucket is made first and named after.
    send({ type: 'group', ids: rows.map((r) => r.dataset.id) });
  });

  document.addEventListener('click', (ev) => {
    const press = ev.target.closest?.('.bs-rename');
    if (!press || press.disabled) return;
    const rows = ticked();
    if (rows.length === 0) return;
    const box = press.parentElement.querySelector('.bs-rename-field');
    box.hidden = false;
    box.value = groupOf(rows[0]).name;
    box.dataset.from = box.value;
    box.focus();
    box.select();
  });

  document.addEventListener('keydown', (ev) => {
    const box = ev.target.closest?.('.bs-rename-field');
    if (!box) return;
    if (ev.key === 'Escape') { box.hidden = true; return; }
    if (ev.key !== 'Enter') return;
    const from = box.dataset.from ?? '';
    const to = box.value.trim();
    box.hidden = true;
    if (to === '' || to === from) return;
    send({ type: 'rename', from, to });
  });

  function wire(where) {
    for (const h of where.querySelectorAll('.group h2')) {
      h.onclick = (e) => {
        // THE PIN IS INSIDE THE HEADING, so a click on it must not also fold.
        if (e.target.closest('.pin')) return;
        const g = h.parentElement;
        g.classList.toggle('shut');
        h.querySelector('.fold').textContent = g.classList.contains('shut') ? '\\u25B8' : '\\u25BE';
        remember();
      };
    }
    for (const p of where.querySelectorAll('.pin')) {
      p.onclick = () => {
        const side = where.dataset.side;
        if (p.dataset.unpin) send({ type: 'unpin', side, name: p.dataset.unpin });
        else send({ type: 'pin', side, name: p.dataset.pin, matching: p.dataset.matching });
      };
    }
    for (const door of where.querySelectorAll('td.opens .door')) {
      door.onclick = (ev) => {
        // The door swallows the press, so ticking never happens behind it.
        ev.stopPropagation();
        send({ type: 'open', id: door.closest('tr').dataset.id });
      };
    }
    // A PRESS ON A ROW TICKS IT. Every column ticks, the first one included:
    // not being editable is not a reason not to be selectable, and somebody
    // ticking four rows should not have to aim at the second column.
    for (const row of where.querySelectorAll('tr[data-id]')) {
      row.onclick = () => {
        row.classList.toggle('ticked');
        countTicked();
      };
    }
    for (const cell of where.querySelectorAll('td.edits')) {
      cell.ondblclick = () => begin(cell);
    }
    wireDragging(where);
  }

  // NEW DATA LANDS INSIDE THE PAGE, one pane at a time.
  window.addEventListener('message', (ev) => {
    const m = ev.data;
    if (m.type !== 'body') return;
    const wrap = document.querySelector('.pane-wrap[data-side="' + m.side + '"]');
    if (!wrap) return;
    remember();
    const pane = wrap.querySelector('.pane');
    const at = pane.scrollTop;
    // THE HEADINGS GO WITH THE ROWS, and this line wrote the word undefined
    // over them for months: the extension never sent m.heads, so every data
    // change replaced the column names with that string. It sends them now,
    // and this refuses to write nothing over something that is already right.
    if (m.heads) wrap.querySelector('.heads').innerHTML = m.heads;
    wrap.querySelector('.top').innerHTML = m.pinned;
    pane.innerHTML = m.scrolling;
    restore(wrap);
    wire(wrap);
    wireColumns(wrap);
    showPage(wrap);
    pane.scrollTop = at;
  });

  for (const tab of document.querySelectorAll('.tab')) {
    tab.onclick = () => send({ type: 'view', view: tab.dataset.view });
  }

  // THE SECOND COLUMN SHIPS HIDDEN. Most looking is done in one, and two
  // half-width lists are worse than one full-width one until somebody wants
  // the second.
  const second = document.getElementById('second');
  second.onclick = () => {
    const wrap = document.querySelectorAll('.pane-wrap')[1];
    const seam = document.querySelector('.seam');
    if (!wrap) return;
    const show = wrap.hidden;
    wrap.hidden = !show;
    if (seam) seam.hidden = !show;
    second.classList.toggle('on', show);
  };

  // EDITING A CELL. Double-click begins, Enter commits, Escape discards.
  //
  // A REFUSAL LEAVES THE TYPED TEXT WHERE THE READER CAN SEE IT. Putting the
  // old value back on a write that never happened is the one behaviour that
  // would make somebody trust a lost edit.
  let editing = null;

  function begin(cell) {
    if (editing) return;
    editing = { cell, was: cell.innerHTML };
    const input = document.createElement('input');
    input.type = 'text';
    input.value = cell.dataset.was || '';
    cell.classList.add('editing');
    cell.classList.remove('bad');
    cell.innerHTML = '';
    cell.appendChild(input);
    input.focus();
    input.select();
    input.onkeydown = (ev) => {
      if (ev.key === 'Enter') { ev.preventDefault(); commit(input.value); }
      if (ev.key === 'Escape') { ev.preventDefault(); discard(); }
    };
    input.onblur = () => discard();
  }

  function discard() {
    if (!editing) return;
    const e = editing;
    editing = null;
    e.cell.classList.remove('editing');
    e.cell.innerHTML = e.was;
  }

  function commit(text) {
    if (!editing) return;
    const cell = editing.cell;
    const row = cell.parentElement;
    editing = null;
    cell.classList.remove('editing');
    cell.textContent = text;
    cell.dataset.was = text;
    send({ type: 'edit', id: row.dataset.id, col: cell.dataset.col, text });
  }

  // DRAGGING A ROW ONTO A GROUP FILES IT THERE. The group says which property
  // the drop writes, so nothing here has to know what the grouping was computed
  // from. A group that says nothing takes no drop.
  let dragging = null;
  function wireDragging(where) {
    for (const row of where.querySelectorAll('tr[data-id]')) {
      row.ondragstart = () => { dragging = row.dataset.id; };
      row.ondragend = () => { dragging = null; };
    }
    for (const g of where.querySelectorAll('.group[data-sets]')) {
      g.ondragover = (ev) => { ev.preventDefault(); g.classList.add('over'); };
      g.ondragleave = () => g.classList.remove('over');
      g.ondrop = (ev) => {
        ev.preventDefault();
        g.classList.remove('over');
        if (dragging) send({ type: 'file', id: dragging, sets: g.dataset.sets, into: g.dataset.into });
      };
    }
  }

  // A CONTROL REDRAWS THE DATA, NOT THE CARD. Replacing the whole pane closed
  // whatever popover was open, so ticking three columns meant opening the same
  // list three times. Ported from basesclient.ts:7-10.
  function wireChrome(wrap) {
    const pops = wrap.querySelectorAll('.bs-pop');
    for (const tool of wrap.querySelectorAll('.bs-tool[data-pop]')) {
      tool.onclick = (ev) => {
        ev.stopPropagation();
        const want = tool.dataset.pop;
        for (const p of pops) {
          const show = p.dataset.pop === want && p.hidden;
          p.hidden = !show;
        }
        for (const t2 of wrap.querySelectorAll('.bs-tool[data-pop]')) {
          const p = wrap.querySelector('.bs-pop[data-pop="' + t2.dataset.pop + '"]');
          t2.classList.toggle('on', p && !p.hidden);
        }
      };
    }
    const code = wrap.querySelector('.bs-code-toggle');
    if (code) {
      code.onclick = () => {
        const on = wrap.classList.toggle('showing-code');
        wrap.querySelector('.bs-pane-code').hidden = !on;
        code.classList.toggle('on', on);
      };
    }
    // THE FIND BOX IS THIS BLOCK'S OWN. The editor draws two of these side by
    // side, and filtering the wrong pane's list would be worse than no box.
    const find = wrap.querySelector('.bs-find');
    if (find) {
      find.oninput = () => {
        const want = find.value.toLowerCase();
        for (const item of wrap.querySelectorAll('.bs-prop-item')) {
          item.hidden = want !== '' && !item.textContent.toLowerCase().includes(want);
        }
      };
    }
    for (const tick of wrap.querySelectorAll('.bs-tick')) {
      tick.onchange = () => send({ type: 'column', side: wrap.dataset.side,
        property: tick.dataset.property, show: tick.checked });
    }
    const hideAll = wrap.querySelector('.bs-hide-all');
    if (hideAll) {
      hideAll.onclick = () => send({ type: 'columns', side: wrap.dataset.side, only: [] });
    }
    for (const lv of wrap.querySelectorAll('.bs-level')) {
      const prop = lv.querySelector('.bs-level-prop');
      const dir = lv.querySelector('.bs-dir');
      const say = () => send({ type: 'level', side: wrap.dataset.side, kind: lv.dataset.kind,
        property: prop.value, direction: dir.dataset.direction });
      prop.onchange = say;
      dir.onclick = () => {
        const asc = dir.dataset.direction !== 'ASC';
        dir.dataset.direction = asc ? 'ASC' : 'DESC';
        // THE MARK COMES FROM THE TABLE HERE TOO. It was a literal, so the
        // table decided the arrow until a person clicked, and after one click
        // the source decided it. The button carries both marks, put there at
        // render time by the same icon() call that drew the first one.
        dir.textContent = asc ? dir.dataset.up : dir.dataset.down;
        say();
      };
    }
  }

  // THE FILTER, COLLECTED FROM WHAT IS DRAWN. Nothing here decides what a
  // condition means: the rows go to the engine, which owns the vocabulary.
  //
  // AN EMPTY VALUE BOX IS AN UNFINISHED ROW, never a test for the empty string.
  // Writing it would empty the table, so the engine refuses it and the row
  // stays where the reader can finish it.
  function wireFilter(wrap) {
    const pop = wrap.querySelector('.bs-pop[data-pop="filter"]');
    if (!pop) return;
    const ops = JSON.parse(pop.dataset.ops || '[]');
    const types = JSON.parse(pop.dataset.types || '{}');

    const collect = () => {
      const groups = [];
      for (const g of pop.querySelectorAll('.bs-group')) {
        if (g.classList.contains('bs-group-raw')) {
          groups.push({ raw: g.querySelector('code').textContent });
          continue;
        }
        const rows = [];
        for (const c of g.querySelectorAll('.bs-cond')) {
          rows.push({ property: c.querySelector('.bs-prop').value,
            operator: c.querySelector('.bs-op').value,
            value: c.querySelector('.bs-val').value });
        }
        groups.push({ rows });
      }
      send({ type: 'filter', side: wrap.dataset.side, groups });
    };

    const wireCond = (c) => {
      const prop = c.querySelector('.bs-prop');
      const op = c.querySelector('.bs-op');
      const val = c.querySelector('.bs-val');
      const offer = () => {
        const kind = types[prop.value] || '';
        const keep = op.value;
        const shown = ops.filter((o) => !o.types || !o.types.length || (kind && o.types.includes(kind)));
        if (keep && !shown.some((o) => o.id === keep)) {
          for (const o of ops) if (o.id === keep) shown.push(o);
        }
        op.innerHTML = shown.map((o) =>
          '<option value="' + o.id + '"' + (o.id === keep ? ' selected' : '') + '>' + o.label + '</option>').join('');
        const chosen = ops.find((o) => o.id === op.value);
        val.hidden = chosen !== undefined && !chosen.takes;
      };
      prop.onchange = () => { offer(); collect(); };
      op.onchange = () => { offer(); collect(); };
      val.onchange = collect;
      c.querySelector('.bs-drop-cond').onclick = () => { c.remove(); collect(); };
    };

    for (const c of pop.querySelectorAll('.bs-cond')) wireCond(c);
    for (const add of pop.querySelectorAll('.bs-add-cond')) {
      add.onclick = () => {
        const tpl = pop.querySelector('.bs-cond-tpl');
        const row = tpl.content.firstElementChild.cloneNode(true);
        add.parentElement.querySelector('.bs-conds').appendChild(row);
        wireCond(row);
      };
    }
    const addGroup = pop.querySelector('.bs-add-group');
    if (addGroup) {
      addGroup.onclick = () => {
        const tpl = pop.querySelector('.bs-group-tpl');
        const g = tpl.content.firstElementChild.cloneNode(true);
        pop.querySelector('.bs-groups').appendChild(g);
        for (const c of g.querySelectorAll('.bs-cond')) wireCond(c);
        g.querySelector('.bs-add-cond').onclick = () => {
          const row = pop.querySelector('.bs-cond-tpl').content.firstElementChild.cloneNode(true);
          g.querySelector('.bs-conds').appendChild(row);
          wireCond(row);
        };
      };
    }
  }

  // DRAGGING A COLUMN EDGE SETS ITS WIDTH, and the grip is not the header: a
  // click on it must not sort.
  function wireColumns(wrap) {
    for (const th of wrap.querySelectorAll('th[data-col]')) {
      const grip = document.createElement('span');
      grip.className = 'th-grip';
      th.appendChild(grip);
      let from = null;
      grip.onmousedown = (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        from = { x: ev.clientX, w: th.offsetWidth };
      };
      const move = (ev) => {
        if (!from) return;
        th.style.width = Math.max(40, from.w + ev.clientX - from.x) + 'px';
      };
      const up = () => {
        if (!from) return;
        from = null;
        send({ type: 'width', side: wrap.dataset.side, property: th.dataset.col, px: th.offsetWidth });
      };
      document.addEventListener('mousemove', move);
      document.addEventListener('mouseup', up);
      // CLICKING A HEADING SORTS BY IT, and it replaces every level rather than
      // adding one: a header that added a level would make the two controls
      // disagree about what is in force.
      th.onclick = (ev) => {
        if (ev.target.classList.contains('th-grip')) return;
        send({ type: 'level', side: wrap.dataset.side, kind: 'sort',
          property: th.dataset.col, direction: th.dataset.dir === 'ASC' ? 'DESC' : 'ASC' });
      };
    }
  }

  // A PRESS OUTSIDE CLOSES A POPOVER, AND A PRESS INSIDE DOES NOT.
  //
  // This did not know inside from outside, so reaching for the first select in
  // a popover closed it. That is what a person sees as a control that vanishes
  // the moment it opens: the thing they reach for is the thing that shuts it.
  document.addEventListener('click', (ev) => {
    if (ev.target.closest?.('.bs-pop')) return;
    for (const p of document.querySelectorAll('.bs-pop')) p.hidden = true;
    for (const t of document.querySelectorAll('.bs-tool[data-pop]')) t.classList.remove('on');
  });

  // TWO THINGS HIDE A ROW and they share one attribute: a closed group, and a
  // page it is not on. Two handlers writing the hidden flag would fight, and
  // the loser would be whichever ran second. SO BOTH ARE COMPUTED IN ONE PASS.
  //
  // Ported from basesclient.ts:479-520.
  const page = new Map();

  function candidates(wrap) {
    // Every row a closed group is not swallowing, in the order they are drawn.
    const out = [];
    for (const g of wrap.querySelectorAll('.group')) {
      if (g.classList.contains('shut')) continue;
      if (g.closest('.group.shut') !== null) continue;
      for (const row of g.querySelectorAll('tr[data-id]')) out.push(row);
    }
    return out;
  }

  function showPage(wrap) {
    const bar = wrap.querySelector('.bs-pager');
    if (!bar) return;
    const per = Math.max(0, Number(bar.querySelector('.bs-per').value) || 0);
    const rows = candidates(wrap);
    const at = page.get(wrap.dataset.side) || 0;
    const from = per === 0 ? 0 : at * per;
    const to = per === 0 ? rows.length : from + per;
    rows.forEach((row, i) => { row.hidden = i < from || i >= to; });
    // A PAGER OVER ONE PAGE SAYS NOTHING THE COUNT DOES NOT.
    bar.hidden = per === 0 || rows.length <= per;
    bar.querySelector('.bs-where').textContent =
      rows.length === 0 ? '' : (from + 1) + '-' + Math.min(to, rows.length) + ' of ' + rows.length;
  }

  function wirePager(wrap) {
    const bar = wrap.querySelector('.bs-pager');
    if (!bar) return;
    const side = wrap.dataset.side;
    bar.querySelector('.bs-prev').onclick = () => {
      page.set(side, Math.max(0, (page.get(side) || 0) - 1));
      showPage(wrap);
    };
    bar.querySelector('.bs-next').onclick = () => {
      page.set(side, (page.get(side) || 0) + 1);
      showPage(wrap);
    };
    bar.querySelector('.bs-per').onchange = () => { page.set(side, 0); showPage(wrap); };
    showPage(wrap);
  }

  for (const wrap of document.querySelectorAll('.pane-wrap')) {
    wire(wrap); wireChrome(wrap); wireFilter(wrap); wireColumns(wrap); wirePager(wrap);
  }
  `;
}
