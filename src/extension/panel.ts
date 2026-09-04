// THE PANEL IS A SUBTREE OF THE PARAMETER TREE.
//
// util/parameters.json declares everything that changes how the system runs.
// A group marked shown becomes a section here. This file turns that subtree
// into the view, the same way every time. Nobody has to be told how to build
// a panel: they mark a group.
//
// The idea is pyqtgraph's parameter tree, which keeps the data apart from the
// view so one declaration can be shown, stored and read back. The type words
// are pyqtgraph's and JSON Schema's: group, bool, int, float, str, list, and
// the two that draw rather than hold a value, action and status.
//
// The view keeps no value of its own. Every change goes to the engine, which
// validates it, and comes back. What is on screen is what is stored.

import { controlCss } from "./controls";

export type Node = {
  name: string;
  title?: string;
  type: "group" | "bool" | "int" | "float" | "str" | "list" | "strlist" | "action" | "status" | "gap" | "text" | "pick" | "toggle" | "table";
  help?: string;
  default?: unknown;
  min?: number;
  max?: number;
  step?: number;
  options?: Array<string | { value: string; says: string }>;
  placeholder?: string;
  span?: number;
  narrow?: string;
  shown?: boolean;
  children?: Node[];
  label?: string;
  command?: string;
  stopCommand?: string;
  labels?: Record<string, string>;
  titles?: Record<string, string>;
  // A TABLE NAMES A LIST THE ENGINE ANSWERS AND THE COLUMNS TO DRAW OF IT.
  // The widget knows how to draw a list of rows; which list, and which of
  // each row's fields are worth a column, is the declaration's to say.
  source?: string;
  // A column shows a field. With link it is a link that opens the token the
  // row's link field names, and with empty it shows that field instead when
  // its own is blank, so a row holding nothing still says so.
  columns?: Array<{ field: string; title: string; link?: string; empty?: string }>;
};

const COLUMNS = 5;

// THE ICONS ARE PASSED IN, LIKE EVERY OTHER MARK ON THIS PAGE.
//
// The gear was written into this file as &#9881;, which is a second copy of a
// decision util/icons.json owns, and invisible twice over: not in the table, so
// no check that read the table could see it, and written as a reference rather
// than as the character.
// WHAT EACH ACTOR IS DOING, AS THE ENGINE ANSWERED IT.
//
// The panel DRAWS this and derives none of it. Every field is read off the
// record by the engine, so a header that worked out a state for itself would be
// a second opinion about a fact that already has an owner.
export interface Doing {
  actor: string;
  state: string;
  why?: string;
  id?: string;
  title?: string;
  holding: string;
  // WHAT KIND OF AGENT IT IS AND WHEN IT ARRIVED, from the register. A row
  // built for an actor that pulled without being registered carries neither.
  kind?: string;
  since?: string;
}

export interface Happening {
  actors: Doing[];
  hold: { on: boolean; by?: string; says?: string };
  // WHO IS HERE, which is not who has worked. The header draws actors,
  // because that is what a person acts on; a table draws this.
  present?: Doing[];
}

export function panelHtml(root: Node, shown: string[],
                          icons: Record<string, { glyph?: string }> = {},
                          doing: Happening = { actors: [], hold: { on: false } }): string {
  const groups = groupsNamed(root, "", shown);
  const gear = icons.gear?.glyph ?? "gear";
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
<style>${css()}</style>
</head>
<body>
<div class="head">
  <button class="gear" id="gear" title="choose which groups are shown">${esc(gear)}</button>
  ${whoIsDoingWhat(doing)}
</div>
${groups.map(([path, n]) => section(path, n, doing)).join("\n")}
<script>${script()}</script>
</body>
</html>`;
}

// The groups the person chose, in the order they were declared. A name that
// no longer exists is skipped rather than shown as an empty section.
function groupsNamed(n: Node, path: string, shown: string[]): Array<[string, Node]> {
  const here = path ? `${path}.${n.name}` : n.name;
  const key = here.split(".").slice(1).join(".");
  const out: Array<[string, Node]> = [];
  if (n.type === "group" && key && shown.includes(key)) out.push([here, n]);
  for (const c of n.children ?? []) out.push(...groupsNamed(c, here, shown));
  return out;
}

// Every group, whether shown or not. The chooser needs the whole list.
export function everyGroup(n: Node, path = ""): Array<{ key: string; title: string }> {
  const here = path ? `${path}.${n.name}` : n.name;
  const key = here.split(".").slice(1).join(".");
  const out: Array<{ key: string; title: string }> = [];
  if (n.type === "group" && key) out.push({ key, title: n.title ?? n.name });
  for (const c of n.children ?? []) out.push(...everyGroup(c, here));
  return out;
}

function section(path: string, g: Node, doing: Happening): string {
  const kids = g.children ?? [];
  // A row is drawn one control per column. text and pick join the row because
  // they act rather than hold a stored value: what they carry is spent on the
  // command they run, and nothing here keeps it afterwards.
  const inRow = (k: Node) =>
    k.type === "action" || k.type === "status" || k.type === "gap" ||
    k.type === "text" || k.type === "pick" || k.type === "toggle";
  const drawn = kids.filter(inRow);
  const held = kids.filter((k) => !inRow(k) && k.type !== "group" && k.type !== "strlist" && k.type !== "table");
  const rows: string[] = [];
  if (drawn.length) rows.push(buttonRow(drawn));
  for (const k of held) rows.push(field(key(path, k), k));
  // A TABLE IS ITS OWN BLOCK AND TAKES THE WHOLE ROW. It holds no value, so
  // it comes after the controls that do.
  for (const k of kids.filter((k) => k.type === "table")) rows.push(liveTable(key(path, k), k, doing));
  return `<details open>
  <summary>${esc(g.title ?? g.name)}</summary>
  <div class="grid">
${rows.join("\n")}
  </div>
</details>`;
}

// The key a value is stored under. The root's own name is not part of it,
// because every key would carry it.
function key(path: string, n: Node): string {
  return `${path}.${n.name}`.split(".").slice(1).join(".");
}

// The row is five wide and a control keeps its place. Where a slot is empty
// the DECLARATION says so, with a gap. Nothing here guesses at an arrangement.
function buttonRow(items: Node[]): string {
  // Columns do not collapse: a control keeps its place as the panel grows,
  // because a control that moves has to be found again. The empty ones are
  // EMPTY, not disabled buttons. A box that cannot be pressed still asks to
  // be read, every time.
  const drawn = items.map(button);
  // Short of five, the rest of the row is empty. Past five, the grid wraps and
  // the next row starts, which is what a grid does.
  //
  // A CONTROL MAY TAKE MORE THAN ONE COLUMN, and the count is of columns
  // rather than controls. Counting controls made a row of three that spanned
  // five ask for seven, and the row wrapped.
  const used = items.reduce((n, k) => n + (k.span ?? 1), 0);
  const rest = Array.from({ length: Math.max(0, COLUMNS - used) }).map(() => `<span></span>`);
  return [...drawn, ...rest].join("\n");
}

function button(n: Node): string {
  if (n.type === "gap") {
    return `<span></span>`;
  }
  const wide = n.span && n.span > 1 ? ` style="grid-column: span ${n.span}"` : "";
  if (n.type === "text") {
    // Enter is what a person presses, so Enter is what mints. The value goes
    // to the command and is not stored: nothing here holds a draft.
    return `<input class="line" type="text"${wide} data-run="${esc(n.command ?? "")}"
      placeholder="${esc(n.placeholder ?? "")}" title="${esc(n.title ?? n.name)}">`;
  }
  if (n.type === "pick") {
    // CLOSED IT IS SHORT, OPEN IT SAYS WHAT IT MEANS. A select shows one text
    // in both places, and one column is not wide enough for the long one.
    const opts = (n.options ?? []).map((o) => {
      const v = typeof o === "string" ? o : o.value;
      const says = typeof o === "string" ? o : o.says;
      return `<li data-value="${esc(v)}"><b>${esc(v)}</b><span>${esc(says)}</span></li>`;
    });
    const first = n.default !== undefined ? String(n.default) : "";
    return `<div class="pick"${wide} data-name="${esc(n.name)}" title="${esc(n.title ?? n.name)}">
      <button class="picked" data-value="${esc(first)}">${esc(first)}</button>
      <ul class="options" hidden>${opts.join("")}</ul>
    </div>`;
  }
  if (n.type === "toggle") {
    // A TOGGLE IS DOWN OR IT IS UP. There is nothing to report about it, so
    // there is no light: a light says a thing is happening on its own, and
    // this only ever says what the person last pressed.
    const labels = n.labels ?? {};
    const titles = n.titles ?? {};
    return `<button class="toggle" id="${esc(n.name)}"${wide} data-state="off"
      data-command="${esc(n.command ?? "")}"
      data-labels='${json(labels)}' data-titles='${json(titles)}'
      title="${esc(titles.off ?? n.name)}">${esc(labels.off ?? n.name)}</button>`;
  }
  if (n.type === "action") {
    return `<button data-command="${esc(n.command ?? "")}" title="${esc(n.title ?? n.label ?? n.name)}">${esc(
      n.label ?? n.name,
    )}</button>`;
  }
  const labels = n.labels ?? {};
  const titles = n.titles ?? {};
  return `<button class="status" id="${esc(n.name)}" data-state="idle"
    data-command="${esc(n.command ?? "")}" data-stop="${esc(n.stopCommand ?? "")}"
    data-labels='${json(labels)}' data-titles='${json(titles)}'
    title="${esc(titles.idle ?? "")}">
    <span class="label">${esc(labels.idle ?? n.name)}</span><span class="led"></span>
  </button>`;
}

function field(k: string, n: Node): string {
  const span = COLUMNS - 1;
  const help = n.help ?? n.title ?? n.name;
  const common = `data-key="${esc(k)}" data-type="${n.type}" title="${esc(help)}"`;
  let control: string;
  if (n.type === "bool") {
    control = `<input type="checkbox" ${common}>`;
  } else if (n.type === "list" || n.options) {
    const opts = (n.options ?? [])
      .map((o) => (typeof o === "string" ? o : o.value))
      .map((v) => `<option value="${esc(v)}">${esc(v)}</option>`)
      .join("");
    control = `<select ${common}>${opts}</select>`;
  } else if (n.type === "int" || n.type === "float") {
    const bounds = [
      n.min !== undefined ? `min="${n.min}"` : "",
      n.max !== undefined ? `max="${n.max}"` : "",
      `step="${n.step ?? (n.type === "int" ? 1 : "any")}"`,
    ].join(" ");
    control = `<input type="number" ${bounds} ${common}>`;
  } else {
    control = `<input type="text" ${common}>`;
  }
  return `<span class="row-label" title="${esc(help)}">${esc(n.title ?? n.name)}</span>
<span class="control" style="grid-column: 2 / ${2 + span}">${control}</span>`;
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function json(v: unknown): string {
  return esc(JSON.stringify(v));
}

function css(): string {
  return `
  /* ONE HEIGHT FOR EVERY CONTROL IN A ROW. A control a few pixels taller than
     the one beside it reads as a mistake, and it is one. The number is here
     and nowhere else, so a new control cannot disagree with the old ones. */
  ${controlCss()}
  body { font-family: var(--vscode-font-family); font-size: var(--vscode-font-size);
         color: var(--vscode-foreground); background: transparent; padding: 8px 6px; margin: 0; }
  .grid { display: grid; grid-template-columns: repeat(${COLUMNS}, 1fr); gap: 6px; align-items: center; }
  /* NOTHING IN THIS PANEL MAY SPILL PAST ITS LEFT EDGE.

     THE ONE THE OWNER MET. The head is a flex row justified to its END, and the
     strip inside it was a plain block, so its width was its longest line, and a
     row can carry the whole reason an agent gave, which is a paragraph. A flex
     item wider than the row it is justified to the end of overflows past the
     START, off the left of the panel, where nothing can scroll to it and no
     scrollbar appears. The first agent's name lost its first glyph, and an m
     with its opening stem cut off reads as an h: main rendered as hain.

     NO WORD OF THE ANSWER GOES IN THIS COMMENT. A stylesheet is part of the
     page, so a state named in here is a state on every page this file draws,
     whatever the engine said, and panel-says-holding is right to call that a
     page carrying something nobody handed it. It caught this comment.

     min-width is the whole of the fix. A flex item will not shrink below its
     own longest word without it, so until it is there no ellipsis rule can ever
     come into play: the box never narrows, so the text never overflows the box,
     so there is nothing for the ellipsis to do. The row is what overflows. */
  .head { display: flex; justify-content: flex-end; align-items: flex-start; gap: 6px;
          margin: -2px 0 4px 0; min-width: 0; }
  .doings { flex: 0 1 auto; min-width: 0; overflow: hidden; }
  /* The line is cut at its END, where a reader can tell it was cut, and the
     whole of it is on the hover. */
  .doing, .onhold { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .gear { flex: 0 0 auto; width: 22px; height: 22px; padding: 0; background: transparent; border: none;
          color: var(--vscode-descriptionForeground); font-size: 14px; line-height: 1; cursor: pointer; }
  .gear:hover { color: var(--vscode-foreground); background: transparent; }
  /* A SIDEBAR CONTROL FILLS ITS ROW. That is the sidebar's own shape and the
     editor's toolbar controls hug their labels, so the width is here rather
     than in the shared block. Everything else about them is shared. */
  input.line { width: 100%; }
  .pick { position: relative; }
  /* A CARET, so it reads as a thing that opens. Without one it is a button
     that says something odd. */
  .pick .picked { width: 100%; height: var(--control-h); padding: 0 6px;
                  display: flex; align-items: center; justify-content: space-between; gap: 4px; }
  .pick .picked::after { content: "\\25BE"; font-size: .9em; opacity: .8; }
  .pick.open .picked::after { content: "\\25B4"; }
  .pick .options { position: absolute; right: 0; top: calc(var(--control-h) + 2px); z-index: 20; margin: 0; padding: 4px 0;
                   list-style: none; min-width: 190px; border-radius: 2px;
                   background: var(--vscode-dropdown-background, var(--vscode-editor-background));
                   border: 1px solid var(--vscode-dropdown-border, var(--vscode-focusBorder));
                   box-shadow: 0 2px 8px rgba(0,0,0,.35); }
  .pick .options li { display: flex; gap: 8px; align-items: baseline; padding: 3px 10px; cursor: pointer; }
  .pick .options li:hover { background: var(--vscode-list-hoverBackground); }
  .pick .options b { font-weight: 600; min-width: 36px; }
  .pick .options span { color: var(--vscode-descriptionForeground); white-space: nowrap; }
  details { margin-bottom: 10px; }
  summary { font-size: 0.85em; text-transform: uppercase; letter-spacing: 0.06em;
            color: var(--vscode-descriptionForeground); font-weight: 600; cursor: pointer;
            margin-bottom: 6px; list-style: none; display: flex; align-items: center; gap: 4px; }
  summary::-webkit-details-marker { display: none; }
  summary::before { content: "\\25be"; font-size: 10px; transition: transform .12s; }
  details:not([open]) summary::before { transform: rotate(-90deg); }
  h3 { font-size: 0.85em; text-transform: uppercase; letter-spacing: 0.06em;
       color: var(--vscode-descriptionForeground); margin: 0 0 6px 0; font-weight: 600; }
  h3 + .grid { margin-bottom: 12px; }
  button { width: 100%; }
  button.status { display: flex; align-items: center; justify-content: space-between; gap: 6px; }
  button.toggle[data-state="on"] { background: var(--vscode-inputValidation-warningBackground,
                                   var(--vscode-button-secondaryBackground));
                                   color: var(--vscode-foreground);
                                   border-color: var(--vscode-focusBorder); }
  button.status .label { overflow: hidden; text-overflow: ellipsis; }
  button.status .led { flex: 0 0 auto; width: 9px; height: 9px; border-radius: 50%;
                       background: var(--led, #8b8b8b); box-shadow: 0 0 0 1px rgba(0,0,0,0.35) inset; }
  button.status[data-state="idle"] { --led: var(--vscode-descriptionForeground, #8b8b8b); }
  button.status[data-state="busy"] { --led: var(--vscode-editorWarning-foreground, #d7a521); }
  button.status[data-state="good"] { --led: var(--vscode-testing-iconPassed, #3fb950); }
  button.status[data-state="bad"]  { --led: var(--vscode-editorError-foreground, #f14c4c); }
  button.status[data-state="busy"] .led { animation: breathe 1.1s ease-in-out infinite; }
  button.status[data-state="good"] .led.beat { animation: beat 620ms ease-out 1; }
  @keyframes breathe { 0%,100% { opacity: .35 } 50% { opacity: 1 } }
  @keyframes beat { 0% { transform: scale(1); box-shadow: 0 0 0 0 var(--led) }
                    45% { transform: scale(1.25); box-shadow: 0 0 0 3px transparent }
                    100% { transform: scale(1); box-shadow: 0 0 0 0 transparent } }
  @media (prefers-reduced-motion: reduce) { button.status .led, button.status .led.beat { animation: none !important } }
  .row-label { grid-column: 1 / 2; color: var(--vscode-descriptionForeground); font-size: .9em;
               white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .control input[type=number], .control input[type=text], .control select { width: 100%; }
  /* A TABLE TAKES THE WHOLE ROW, and a narrow sidebar is what it has to fit
     in: the holding column is the long one and it is the one that ellipses. */
  .table { grid-column: 1 / -1; overflow: hidden; }
  .table table { width: 100%; border-collapse: collapse; table-layout: fixed; }
  .table th.actor, .table td.actor { width: 34%; }
  .table th { text-align: left; font-weight: normal; padding: 2px 4px 2px 0;
              color: var(--vscode-descriptionForeground); font-size: .9em;
              border-bottom: 1px solid var(--vscode-panel-border); }
  .table td { padding: 2px 4px 2px 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .table td.holding { color: var(--vscode-descriptionForeground); }
  /* NO COLOUR PER STATE. A rule naming one would put that word on every page
     this file draws, and panel-says-holding holds the page to the answer it
     was handed: a page carrying a state nobody gave it is the defect that
     check exists to find. The word is the whole of what a state says here. */
  .table .empty { padding: 4px 0; color: var(--vscode-descriptionForeground); }
  .table a.open { color: var(--vscode-textLink-foreground, inherit); text-decoration: none; }
  .table a.open:hover { text-decoration: underline; }
  `;
}

// The view half of the parameter tree. It reports every change up and never
// keeps a value of its own, so what is on screen is what is stored.
function script(): string {
  return `
  const vscode = acquireVsCodeApi();
  const send = (m) => vscode.postMessage(m);

  // The view says when it can listen. Sending before this is how a panel
  // comes up empty: the message arrives before anything is there to take it.
  send({ type: 'ready' });

  const gear = document.getElementById('gear');
  if (gear) gear.onclick = () => send({ type: 'command', command: 'quackitect.chooseGroups' });

  for (const b of document.querySelectorAll('button[data-command]')) {
    if (b.classList.contains('status') || b.classList.contains('toggle')) continue;
    b.onclick = () => send({ type: 'command', command: b.dataset.command });
  }

  for (const b of document.querySelectorAll('button.toggle')) {
    b.onclick = () => send({ type: 'command', command: b.dataset.command });
  }

  for (const b of document.querySelectorAll('button.status')) {
    b.onclick = () => {
      const stop = b.dataset.stop;
      send({ type: 'command', command: b.dataset.state === 'good' && stop ? stop : b.dataset.command });
    };
  }

  // A LINK IN A TABLE OPENS THE TOKEN IT NAMES, in the editor, the way the
  // work editor does.
  for (const a of document.querySelectorAll('a.open')) {
    a.onclick = (ev) => { ev.preventDefault(); send({ type: 'open', id: a.dataset.id }); };
  }

  // A line edit spends what it holds on the command it runs, and keeps
  // nothing ONCE THE COMMAND HAS IT. Enter is what a person presses, so
  // Enter is what acts. The line is cleared when the extension says the
  // work was taken, and not before: clearing on Enter lost what was typed
  // every time the engine was not there to take it.
  for (const line of document.querySelectorAll('input.line')) {
    line.onkeydown = (ev) => {
      if (ev.key !== 'Enter') return;
      const text = line.value.trim();
      if (!text) return;
      const pick = document.querySelector('.pick .picked');
      send({ type: 'run', command: line.dataset.run, text, process: pick ? pick.dataset.value : '' });
    };
  }

  // CLOSED IT IS SHORT, OPEN IT SAYS WHAT IT MEANS.
  for (const pick of document.querySelectorAll('.pick')) {
    const button = pick.querySelector('.picked');
    const list = pick.querySelector('.options');
    button.onclick = (ev) => {
      ev.stopPropagation();
      list.hidden = !list.hidden;
      pick.classList.toggle('open', !list.hidden);
    };
    for (const item of list.querySelectorAll('li')) {
      item.onclick = () => {
        button.dataset.value = item.dataset.value;
        button.textContent = item.dataset.value;
        list.hidden = true;
        pick.classList.remove('open');
      };
    }
  }
  document.addEventListener('click', () => {
    for (const p of document.querySelectorAll('.pick')) {
      p.querySelector('.options').hidden = true;
      p.classList.remove('open');
    }
  });

  for (const c of document.querySelectorAll('[data-key]')) {
    c.onchange = () => {
      const v = c.type === 'checkbox' ? c.checked
              : c.dataset.type === 'int' || c.dataset.type === 'float' ? Number(c.value)
              : c.value;
      send({ type: 'set', key: c.dataset.key, value: v });
    };
  }

  window.addEventListener('message', (e) => {
    const m = e.data;
    if (m.type === 'ready') { /* nothing: the extension drives this */ }
    if (m.type === 'taken') {
      for (const line of document.querySelectorAll('input.line')) {
        if (line.dataset.run === m.command) line.value = '';
      }
    }
    if (m.type === 'state' && m.id) {
      const t = document.getElementById(m.id);
      if (t && t.classList.contains('toggle')) {
        const on = m.state === 'good';
        t.dataset.state = on ? 'on' : 'off';
        const labels = JSON.parse(t.dataset.labels || '{}');
        const titles = JSON.parse(t.dataset.titles || '{}');
        t.textContent = labels[on ? 'on' : 'off'] || t.textContent;
        t.title = titles[on ? 'on' : 'off'] || '';
        return;
      }
    }
    // A FRESH ANSWER, DROPPED INTO THE PAGE THAT IS ALREADY HERE.
    //
    // Not a new page. Replacing the html every second would empty the line a
    // person is typing in, shut the picker under their hand, and fold every
    // section they opened, once a second, for ever. Only the parts that follow
    // the engine are replaced, which is how the values already arrive.
    if (m.type === 'doing') {
      const strip = document.getElementById('doings');
      if (strip) strip.innerHTML = m.head;
      for (const name of Object.keys(m.tables || {})) {
        const t = document.querySelector('[data-table="' + name + '"]');
        if (t) t.innerHTML = m.tables[name];
      }
      // THE LINKS ARE WIRED AGAIN, because the rows that carried them are gone.
      for (const a of document.querySelectorAll('a.open')) {
        a.onclick = (ev) => { ev.preventDefault(); send({ type: 'open', id: a.dataset.id }); };
      }
      return;
    }

    if (m.type === 'beat') {
      const led = document.querySelector('button.status .led');
      if (!led) return;
      led.classList.remove('beat'); void led.offsetWidth; led.classList.add('beat');
      return;
    }
    if (m.type === 'state') {
      const b = document.getElementById(m.id || 'engine');
      if (!b) return;
      b.dataset.state = m.state;
      const labels = JSON.parse(b.dataset.labels || '{}');
      const titles = JSON.parse(b.dataset.titles || '{}');
      b.querySelector('.label').textContent = labels[m.state] ?? '';
      b.title = m.detail ? (titles[m.state] ?? '') + ' \\u2014 ' + m.detail : (titles[m.state] ?? '');
      return;
    }
    if (m.type === 'values') {
      // The whole dictionary at once, the way the tree is filled.
      for (const [k, value] of Object.entries(m.values)) {
        const c = document.querySelector('[data-key="' + k + '"]');
        if (!c) continue;
        if (c.type === 'checkbox') c.checked = Boolean(value);
        else c.value = value;
      }
    }
  });
  `;
}

// ONE ROW PER ACTOR, AND THE HOLD ONCE FOR THE TREE.
//
// The hold is one file covering everything, so a copy beside each row would say
// four agents are held when one file is. It is drawn outside the rows for that
// reason and for no other.
//
// NOTHING HERE DECIDES A STATE. The strip prints what it was handed, so a page
// rendered from two different answers says two different things, which is what
// the check holds it to.
// A LIVE TABLE DRAWS A LIST THE ENGINE ANSWERED, AND DERIVES NOTHING.
//
// The panel is rebuilt on every beat with a fresh answer, so the table is
// live without holding anything: what is on screen is what the engine last
// said. A row is a Doing, the same shape the header draws, because who is
// here and what each one is doing are one question asked of one answer.
//
// AN EMPTY LIST SAYS SO. A table drawn with no rows and no word looks like a
// panel that failed to load, and the difference matters: nobody here is a
// fact, and it is the usual one.
function liveTable(id: string, n: Node, doing: Happening): string {
  // THE WRAPPER CARRIES THE NAME SO A FRESH ANSWER CAN FIND IT. What the engine
  // said changes every few seconds; the wrapper is part of the page's shape and
  // only changes when the declaration does, so the rows are refilled inside it
  // rather than the page being built again.
  return `<div class="table" data-table="${esc(id)}">${tableBody(n, doing)}</div>`;
}

function tableBody(n: Node, doing: Happening): string {
  const lists: Record<string, Doing[] | undefined> = { present: doing.present, actors: doing.actors };
  const rows = lists[n.source ?? ""];
  if (!rows) {
    // A SOURCE NOTHING ANSWERS IS A FAULT IN THE DECLARATION, and it says so
    // rather than drawing an empty table, which would read as nobody here.
    return `<div class="empty">no list called ${esc(n.source ?? "")}</div>`;
  }
  const cols = n.columns ?? [];
  const head = cols.map((c) => `<th class="${esc(c.field)}">${esc(c.title)}</th>`).join("");
  const body = rows.map((r) => {
    const cells = cols.map((c) => {
      const row = r as unknown as Record<string, unknown>;
      const text = (v: unknown) => (v === undefined || v === null ? "" : String(v));
      let value = text(row[c.field]);
      if (!value && c.empty) value = text(row[c.empty]);
      const id = c.link ? text(row[c.link]) : "";
      const shown = id && text(row[c.field])
        ? `<a href="#" class="open" data-id="${esc(id)}" title="${esc(id)}">${esc(value)}</a>`
        : esc(value);
      return `<td class="${esc(c.field)}">${shown}</td>`;
    }).join("");
    return `<tr data-state="${esc(r.state ?? "")}" data-actor="${esc(r.actor ?? "")}">${cells}</tr>`;
  }).join("");
  const empty = rows.length ? "" : `<div class="empty">nobody is here</div>`;
  return `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>${empty}`;
}

// WHAT CHANGES WITHOUT THE PAGE CHANGING.
//
// The strip and the live tables are the only parts of this panel that follow the
// engine rather than the declaration, so they are the only parts that travel on
// the beat. Everything else is the SHAPE of the page, and the shape changes only
// when util/parameters.json does.
export function livePieces(root: Node, shown: string[], doing: Happening):
    { head: string; tables: Record<string, string> } {
  const tables: Record<string, string> = {};
  for (const [path, g] of groupsNamed(root, "", shown)) {
    for (const k of (g.children ?? []).filter((c) => c.type === "table")) {
      tables[key(path, k)] = tableBody(k, doing);
    }
  }
  return { head: doingRows(doing), tables };
}

function whoIsDoingWhat(doing: Happening): string {
  return `<div class="doings" id="doings">${doingRows(doing)}</div>`;
}

// THE ROWS ALONE, so a fresh answer can be dropped into the strip that is
// already on screen. The line is cut at its end now, so the whole of it goes on
// the hover: a reason an actor stopped is a paragraph, and it is the one thing
// on this panel a person most wants to read in full.
function doingRows(doing: Happening): string {
  const rows = (doing.actors ?? []).map((d) =>
    `<div class="doing ${esc(d.state)}" data-actor="${esc(d.actor)}"` +
    ` title="${esc(d.why ? d.why : d.holding)}">` +
    `<span class="who">${esc(d.actor)}</span> ` +
    `<span class="state">${esc(d.state)}</span> ` +
    `<span class="holds">${esc(d.holding)}</span>` +
    (d.why ? ` <span class="why">${esc(d.why)}</span>` : "") +
    `</div>`).join("");
  const held = doing.hold?.on
    ? `<div class="onhold">everything is on hold${doing.hold.by ? ", by " + esc(doing.hold.by) : ""}</div>`
    : "";
  return `${rows}${held}`;
}
