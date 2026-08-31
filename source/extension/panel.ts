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

export type Node = {
  name: string;
  title?: string;
  type: "group" | "bool" | "int" | "float" | "str" | "list" | "strlist" | "action" | "status" | "gap";
  help?: string;
  default?: unknown;
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
  narrow?: string;
  shown?: boolean;
  children?: Node[];
  label?: string;
  command?: string;
  stopCommand?: string;
  labels?: Record<string, string>;
  titles?: Record<string, string>;
};

const COLUMNS = 5;

export function panelHtml(root: Node, shown: string[]): string {
  const groups = groupsNamed(root, "", shown);
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
<style>${css()}</style>
</head>
<body>
<div class="head">
  <button class="gear" id="gear" title="choose which groups are shown">&#9881;</button>
</div>
${groups.map(([path, n]) => section(path, n)).join("\n")}
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

function section(path: string, g: Node): string {
  const kids = g.children ?? [];
  const drawn = kids.filter((k) => k.type === "action" || k.type === "status" || k.type === "gap");
  const held = kids.filter(
    (k) =>
      k.type !== "action" && k.type !== "status" && k.type !== "gap" &&
      k.type !== "group" && k.type !== "strlist",
  );
  const rows: string[] = [];
  if (drawn.length) rows.push(buttonRow(drawn));
  for (const k of held) rows.push(field(key(path, k), k));
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
  const rest = Array.from({ length: Math.max(0, COLUMNS - drawn.length) }).map(() => `<span></span>`);
  return [...drawn, ...rest].join("\n");
}

function button(n: Node): string {
  if (n.type === "gap") {
    return `<span></span>`;
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
    const opts = (n.options ?? []).map((v) => `<option value="${esc(v)}">${esc(v)}</option>`).join("");
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
  body { font-family: var(--vscode-font-family); font-size: var(--vscode-font-size);
         color: var(--vscode-foreground); background: transparent; padding: 8px 6px; margin: 0; }
  .grid { display: grid; grid-template-columns: repeat(${COLUMNS}, 1fr); gap: 6px; align-items: center; }
  .head { display: flex; justify-content: flex-end; margin: -2px 0 4px 0; }
  .gear { width: 22px; height: 22px; padding: 0; background: transparent; border: none;
          color: var(--vscode-descriptionForeground); font-size: 14px; line-height: 1; cursor: pointer; }
  .gear:hover { color: var(--vscode-foreground); background: transparent; }
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
  button { height: 28px; width: 100%; padding: 0 8px; border: 1px solid var(--vscode-button-border, transparent);
           border-radius: 2px; background: var(--vscode-button-background); color: var(--vscode-button-foreground);
           font: inherit; cursor: pointer; overflow: hidden; white-space: nowrap; }
  button:hover:not(:disabled) { background: var(--vscode-button-hoverBackground); }
  button:disabled { background: transparent; color: var(--vscode-disabledForeground);
                    border: 1px dashed var(--vscode-panel-border); cursor: default; }
  button.status { display: flex; align-items: center; justify-content: space-between; gap: 6px; }
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
  .control input[type=number], .control input[type=text], .control select {
    width: 100%; height: 24px; box-sizing: border-box; padding: 0 6px; font: inherit;
    color: var(--vscode-input-foreground); background: var(--vscode-input-background);
    border: 1px solid var(--vscode-input-border, var(--vscode-panel-border)); border-radius: 2px; }
  .control input[type=checkbox] { width: 16px; height: 16px; accent-color: var(--vscode-button-background); }
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
    if (b.classList.contains('status')) continue;
    b.onclick = () => send({ type: 'command', command: b.dataset.command });
  }

  for (const b of document.querySelectorAll('button.status')) {
    b.onclick = () => {
      const stop = b.dataset.stop;
      send({ type: 'command', command: b.dataset.state === 'good' && stop ? stop : b.dataset.command });
    };
  }

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
