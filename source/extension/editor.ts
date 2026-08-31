// THE EDITOR IS GENERIC, AND THE WORK EDITOR IS ONE VIEW IN IT.
//
// It draws whatever `se query` answers. It knows about columns, groups and
// pinned groups, and it knows nothing about work: the view file decides what
// is selected and what it is grouped by, and the engine decides what a row is.
// A second source drawn here later is a second view name, not a change to this.
//
// IT READS FILES AND RUNS THE ENGINE. There is no server and no port. The
// engine is the only writer, so the editor asks it rather than touching a note.
//
// PINNED GROUPS DO NOT SCROLL. They sit above the pane that does, which is
// what pinning means. The header row is sticky inside that pane for the same
// reason: it stays put while rows go past.
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
  error?: string;
};

export function editorHtml(t: Table, views: string[], view: string): string {
  if (t.error) return page(views, view, `<p class="bad">${esc(t.error)}</p>`, "");
  const cols = t.columns ?? [];
  return page(
    views,
    view,
    (t.pinned ?? []).map((g) => groupHtml(g, cols, t)).join(""),
    `<table>
  <thead><tr>${cols.map((c) => head(c, t)).join("")}</tr></thead>
</table>
${(t.groups ?? []).map((g) => groupHtml(g, cols, t)).join("")}`,
    t.total,
    t.counts ?? [],
  );
}

function head(c: string, t: Table): string {
  const w = t.widths?.[c];
  return `<th${w ? ` style="width:${w}px"` : ""}>${esc(t.heads?.[c] ?? c)}</th>`;
}

// A group is a heading and its rows. It carries what a drop into it would
// write, so a renderer can offer the target without knowing what the level
// was computed from.
function groupHtml(g: Group, cols: string[], t: Table): string {
  const kids = (g.groups ?? []).map((k) => groupHtml(k, cols, t)).join("");
  const rows = (g.lines ?? []).map((l) => rowHtml(l, cols, t)).join("");
  const drop = g.sets ? ` data-sets="${esc(g.sets)}" data-into="${esc(g.name)}"` : "";
  return `<section class="group${g.pinned ? " pinned" : ""}${g.shut ? " shut" : ""}"
    style="--depth:${g.depth}"${drop}>
  <h2><span class="fold">${g.shut ? "▸" : "▾"}</span>
    <span class="name">${esc(g.name || "no group")}</span>
    <span class="count">${g.count}</span></h2>
  <div class="rows">
    <table>${rows}</table>
    ${kids}
  </div>
</section>`;
}

function rowHtml(l: Line, cols: string[], t: Table): string {
  const cells = cols
    .map((c) => {
      const v = l.cells?.[c]?.value ?? "";
      const opens = t.opens?.[c] ? " class=\"opens\"" : "";
      const w = t.widths?.[c];
      return `<td${opens}${w ? ` style="width:${w}px"` : ""}>${esc(v)}</td>`;
    })
    .join("");
  return `<tr draggable="true" data-id="${esc(l.id)}">${cells}</tr>`;
}

function page(
  views: string[],
  view: string,
  pinned: string,
  scrolling: string,
  total = 0,
  counts: Tally[] = [],
): string {
  const tabs = views
    .map((v) => `<button class="tab${v === view ? " on" : ""}" data-view="${esc(v)}">${esc(v)}</button>`)
    .join("");
  // WHAT IS WORTH COUNTING IS THE VIEW'S TO SAY. This draws whatever came
  // back, so counting something else is a line in the view file.
  const tally = counts
    .map((c) => `<span class="tally"><b>${c.n}</b>${esc(c.name)}</span>`)
    .join("");
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
<style>${css()}</style>
</head>
<body>
<div class="bar">${tabs}<span class="counts">${tally}</span><span class="total">${total}</span></div>
<div class="top">${pinned}</div>
<div class="pane">${scrolling}</div>
<script>${script()}</script>
</body>
</html>`;
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
  .bar .counts { margin-left: auto; display: flex; gap: 12px; }
  .bar .tally { color: var(--vscode-descriptionForeground); font-size: .9em; }
  .bar .tally b { color: var(--vscode-foreground); font-weight: 600; margin-right: 4px; }
  .bar .total { margin-left: 14px; padding-left: 14px; font-size: .9em;
                color: var(--vscode-descriptionForeground);
                border-left: 1px solid var(--vscode-panel-border); }
  .tab { font: inherit; padding: 2px 8px; border: 0; border-radius: 2px; cursor: pointer;
         color: var(--vscode-foreground); background: transparent; }
  .tab.on { background: var(--vscode-list-activeSelectionBackground);
            color: var(--vscode-list-activeSelectionForeground); }
  .tab:hover { background: var(--vscode-list-hoverBackground); }
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
  h2 { font-size: .85em; text-transform: uppercase; letter-spacing: .06em; font-weight: 600;
       color: var(--vscode-descriptionForeground); margin: 0; padding: 4px 8px;
       padding-left: calc(8px + var(--depth) * 14px);
       display: flex; align-items: center; gap: 6px; cursor: pointer; }
  h2 .count { color: var(--vscode-descriptionForeground); font-weight: 400; }
  .group.shut .rows { display: none; }
  .group.pinned h2 .name { color: var(--vscode-foreground); }
  .group.over { outline: 1px solid var(--vscode-focusBorder); outline-offset: -1px; }
  .bad { padding: 12px; color: var(--vscode-errorForeground); white-space: pre-wrap; }
  `;
}

function script(): string {
  return `
  const vscode = acquireVsCodeApi();
  const send = (m) => vscode.postMessage(m);

  for (const tab of document.querySelectorAll('.tab')) {
    tab.onclick = () => send({ type: 'view', view: tab.dataset.view });
  }
  for (const h of document.querySelectorAll('.group h2')) {
    h.onclick = () => {
      const g = h.parentElement;
      g.classList.toggle('shut');
      h.querySelector('.fold').textContent = g.classList.contains('shut') ? '\\u25B8' : '\\u25BE';
    };
  }
  for (const cell of document.querySelectorAll('td.opens')) {
    cell.onclick = () => send({ type: 'open', id: cell.parentElement.dataset.id });
  }

  // DRAGGING A ROW ONTO A GROUP FILES IT THERE. The group says which property
  // the drop writes, so nothing here has to know what the grouping was
  // computed from. A group that says nothing takes no drop.
  let dragging = null;
  for (const row of document.querySelectorAll('tr[data-id]')) {
    row.ondragstart = () => { dragging = row.dataset.id; };
    row.ondragend = () => { dragging = null; };
  }
  for (const g of document.querySelectorAll('.group[data-sets]')) {
    g.ondragover = (ev) => { ev.preventDefault(); g.classList.add('over'); };
    g.ondragleave = () => g.classList.remove('over');
    g.ondrop = (ev) => {
      ev.preventDefault();
      g.classList.remove('over');
      if (dragging) send({ type: 'file', id: dragging, sets: g.dataset.sets, into: g.dataset.into });
    };
  }
  `;
}
