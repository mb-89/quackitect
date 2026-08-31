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
  pinned?: Group[];
  groups?: Group[];
  counts?: Tally[];
  total: number;
  props?: PropertyInfo[];
  group?: LevelSaid[];
  sorted?: LevelSaid[];
  file?: string;
  source?: string;
  error?: string;
};

// The type a column holds, said in one character. Ported from baseui.ts:53-65.
const ICON: Record<string, string> = {
  file: "ⓘ", date: "◷", list: "≡", string: "≡",
  number: "#", boolean: "☑", link: "↗", object: "{}", null: "·",
};

export type PropertyInfo = { name: string; type: string; on: boolean };
export type LevelSaid = { property: string; direction: string; sets?: string };
export type Pane = { side: string; table: Table };
export type Body = { pinned: string; scrolling: string; total: number; counts: Tally[] };

export function editorHtml(panes: Pane[], views: string[], view: string): string {
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
  <button class="second" id="second" title="show a second column">&#9707;</button>
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
  <div class="chrome">${toolbar(t)}${sortPop(t)}${propsPop(t)}</div>
  <div class="top">${b.pinned}</div>
  <div class="pane">${b.scrolling}</div>
  ${codePanel(t)}
</div>`;
}

// THE TOOLBAR IS NOT IN THE SCROLLING AREA. It sits above a pane that scrolls
// on its own, so it stays put while rows go past.
//
// HELP IS A DETAIL, NEVER A BUTTON. There is no question mark anywhere here.
// Clicking a control's label puts its help where a person is already looking.
//
// Ported from baseui.ts:383-395.
function toolbar(t: Table): string {
  const n = t.total ?? 0;
  return `<div class="bs-bar">
    <span class="bs-view-name">${esc(t.view)}</span>
    <span class="bs-count">${n} result${n === 1 ? "" : "s"}</span>
    <span class="bs-gap"></span>
    <button type="button" class="bs-tool" data-pop="sort" data-help="sort">&#8645; Sort</button>
    <button type="button" class="bs-tool" data-pop="props" data-help="properties">&#8801; Properties</button>
    <button type="button" class="bs-tool bs-code-toggle" title="show the query">&#9781;</button>
  </div>`;
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
      title="${asc ? "smallest first" : "largest first"}">${asc ? "&#9650;" : "&#9660;"}</button>
  </div>`;
}

// The column list, with a find box. Ported from baseui.ts:260-276.
function propsPop(t: Table): string {
  const items = (t.props ?? [])
    .map(
      (p) => `<label class="bs-prop-item${p.on ? " on" : ""}">
      <input type="checkbox" class="bs-tick" data-property="${esc(p.name)}"${p.on ? " checked" : ""}>
      <span class="bs-type" title="${esc(p.type)}">${ICON[p.type] ?? "·"}</span>
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
    return { pinned: `<p class="bad">${esc(t.error)}</p>`, scrolling: "", total: 0, counts: [] };
  }
  const cols = t.columns ?? [];
  return {
    pinned: (t.pinned ?? []).map((g) => groupHtml(g, cols, t)).join(""),
    scrolling: `<table>
  <thead><tr>${cols.map((c, i) => head(c, t, i === cols.length - 1)).join("")}</tr></thead>
</table>
${(t.groups ?? []).map((g) => groupHtml(g, cols, t)).join("")}`,
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
  return `<section class="group${g.pinned ? " pinned" : ""}${g.shut ? " shut" : ""}"
    data-key="${esc(key)}" style="--depth:${g.depth}"${drop}>
  <h2><span class="fold">${g.shut ? "▸" : "▾"}</span>
    <span class="name">${esc(g.name || "no group")}</span>
    <span class="count">${g.count}</span></h2>
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
        return `<td class="opens" data-col="${esc(c)}"${width} title="click to open the note">${esc(v)}</td>`;
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
  td.opens { cursor: pointer; }
  td.opens:hover { text-decoration: underline; }
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
  .group.pinned h2 .name { color: var(--vscode-foreground); }
  .group.over { outline: 1px solid var(--vscode-focusBorder); outline-offset: -1px; }
  .bad { padding: 12px; color: var(--vscode-errorForeground); white-space: pre-wrap; }

  /* The toolbar, ported from basesclient.ts:16-60. A control redraws the data
     and not the card, so a popover the reader opened stays open. */
  .chrome { position: relative; flex: 0 0 auto; }
  .bs-bar { display: flex; align-items: center; gap: 6px; padding: 3px 8px;
            border-bottom: 1px solid var(--vscode-panel-border); }
  .bs-view-name { font-weight: 600; }
  .bs-count, .bs-code-path { color: var(--vscode-descriptionForeground); font-size: .9em; }
  .bs-gap { flex: 1 1 auto; }
  .bs-pop { position: absolute; right: 8px; top: 26px; z-index: 30; padding: 8px;
            min-width: 240px; border-radius: 3px;
            background: var(--vscode-dropdown-background, var(--vscode-editor-background));
            border: 1px solid var(--vscode-dropdown-border, var(--vscode-focusBorder));
            box-shadow: 0 2px 10px rgba(0,0,0,.4); }
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
  .bs-pane-code { flex: 1 1 auto; overflow: auto; }
  .bs-code-head { padding: 4px 8px; border-bottom: 1px solid var(--vscode-panel-border); }
  .bs-code-text { margin: 0; padding: 8px; font-family: var(--vscode-editor-font-family);
                  white-space: pre; }
  .pane-wrap.showing-code .pane, .pane-wrap.showing-code .top { display: none; }
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

  function wire(where) {
    for (const h of where.querySelectorAll('.group h2')) {
      h.onclick = () => {
        const g = h.parentElement;
        g.classList.toggle('shut');
        h.querySelector('.fold').textContent = g.classList.contains('shut') ? '\\u25B8' : '\\u25BE';
        remember();
      };
    }
    for (const cell of where.querySelectorAll('td.opens')) {
      cell.onclick = () => send({ type: 'open', id: cell.parentElement.dataset.id });
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
    wrap.querySelector('.top').innerHTML = m.pinned;
    pane.innerHTML = m.scrolling;
    wrap.querySelector('.bs-count').textContent = m.total + ' result' + (m.total === 1 ? '' : 's');
    restore(wrap);
    wire(wrap);
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
        dir.textContent = asc ? '▲' : '▼';
        say();
      };
    }
  }

  document.addEventListener('click', () => {
    for (const p of document.querySelectorAll('.bs-pop')) p.hidden = true;
    for (const t of document.querySelectorAll('.bs-tool[data-pop]')) t.classList.remove('on');
  });

  for (const wrap of document.querySelectorAll('.pane-wrap')) { wire(wrap); wireChrome(wrap); }
  `;
}
