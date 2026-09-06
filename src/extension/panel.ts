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

import { controlCss, filterSyntax } from "./controls";

export type Node = {
  name: string;
  title?: string;
  type: "group" | "bool" | "int" | "float" | "str" | "list" | "strlist" | "action" | "status" | "gap" | "text" | "toggle" | "table" | "count";
  help?: string;
  default?: unknown;
  min?: number;
  max?: number;
  step?: number;
  options?: Array<string | { value: string; says: string }>;
  placeholder?: string;
  // WHAT THE NUMBER IS COUNTED IN, beside the box. "a claim lasts: 3" says
  // nothing on its own, and the unit is the one word that makes it a fact.
  unit?: string;
  // THE MESSAGES THAT REACH THIS CONTROL FROM A CHAT, filled by the engine and
  // declared nowhere. The tooltip draws them verbatim, so what a person reads is
  // the exact string the matcher takes.
  keywords?: string[];
  // A TEXT BOX THAT KEEPS WHAT IS TYPED, rather than handing it to a command
  // and forgetting it. The mint box forgets; the queue filter is a setting and
  // has to still be there when the panel is drawn again.
  stored?: boolean;
  // WHICH LANGUAGE THIS BOX TAKES. The tooltip appends the one description
  // that language has, so no box carries its own copy.
  syntax?: string;
  span?: number;
  narrow?: string;
  shown?: boolean;
  children?: Node[];
  label?: string;
  command?: string;
  stopCommand?: string;
  labels?: Record<string, string>;
  titles?: Record<string, string>;
  // A GESTURE IS A PRESS COUNT THAT MEANS SOMETHING ELSE.
  //
  // v3's ruling, and the reason this is not a second button: climbing goes one
  // rung at a time, because handing over a whole ladder in one click is a move
  // a person should have to mean. Releasing goes any distance at once, so a
  // stray press always falls DOWN and never up, and that asymmetry is the
  // safety rather than a confirmation dialog.
  gesture?: number;
  gestureCommand?: string;
  // A TABLE NAMES A LIST THE ENGINE ANSWERS AND THE COLUMNS TO DRAW OF IT.
  // The widget knows how to draw a list of rows; which list, and which of
  // each row's fields are worth a column, is the declaration's to say.
  source?: string;
  // A column shows a field. With link it is a link that opens the token the
  // row's link field names, and with empty it shows that field instead when
  // its own is blank, so a row holding nothing still says so.
  // With width it is as wide as the declaration says, in the units it says,
  // and the last column takes what is left. A width is the declaration's to
  // decide, the way the columns are, so none is written into this file.
  columns?: Array<{ field: string; title: string; link?: string; empty?: string; width?: string }>;
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
  // HOW MUCH THE QUEUE WOULD HAND OUT, under the filter in force. It rides on
  // this answer because the panel already reads it on the beat, so the number
  // needs no door of its own.
  queue?: number;
  // WHO IS HERE, AND WHAT EACH ONE HOLDS. The table draws this and it is the
  // only place an actor is drawn. The header drew them too, so every agent
  // appeared twice and the first one spilled into the view's title.
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
  // A row is drawn one control per column. text joins the row because it acts
  // rather than holds a stored value: what it carries is spent on the command
  // it runs, and nothing here keeps it afterwards.
  const inRow = (k: Node) =>
    k.type === "action" || k.type === "status" || k.type === "gap" ||
    k.type === "text" || k.type === "toggle" || k.type === "count";
  const drawn = kids.filter(inRow);
  const held = kids.filter((k) => !inRow(k) && k.type !== "group" && k.type !== "strlist" && k.type !== "table");
  // A ROW IS FIVE COLUMNS, AND A GROUP MAY WANT TWO OF THEM. buttonRow pads to
  // five and wraps past it, so a second row of drawn controls falls out of the
  // same call rather than needing a rule of its own.
  const rows: string[] = [];
  if (drawn.length) rows.push(buttonRow(drawn, path, doing));
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
function buttonRow(items: Node[], path: string, doing: Happening): string {
  // Columns do not collapse: a control keeps its place as the panel grows,
  // because a control that moves has to be found again. The empty ones are
  // EMPTY, not disabled buttons. A box that cannot be pressed still asks to
  // be read, every time.
  const drawn = items.map((k) => button(k, key(path, k), doing));
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

function button(n: Node, stored: string, doing: Happening): string {
  if (n.type === "gap") {
    return `<span></span>`;
  }
  const wide = n.span && n.span > 1 ? ` style="grid-column: span ${n.span}"` : "";
  // A COUNT IS A NUMBER THE ENGINE ANSWERS, and nothing a person may type.
  // It is drawn beside the box that changes it, so a filter and what it leaves
  // are read together.
  if (n.type === "count") {
    // THE NUMBER IS REPLACED ON THE BEAT AND NEVER REDRAWN WITH THE PAGE.
    //
    // It was written into the html once, from whatever answer the panel held
    // when it was built, which on a fresh panel is nothing. So it read zero
    // with two hundred and fourteen tokens open, and stayed there.
    //
    // data-count is what the live message fills, the way data-table is for a
    // table. See livePieces.
    return `<span class="count"${wide} data-count="${esc(n.source ?? n.name)}"
      title="${esc(tipFor(n))}">${esc(theCount(n, doing))}</span>`;
  }
  if (n.type === "text") {
    const says = withKeywords(n.title ?? n.name, n);
    // A STORED BOX KEEPS WHAT IS TYPED, and goes through the same door every
    // other setting does. An unstored one hands the text to a command and
    // forgets it, which is what the mint box wants.
    if (n.stored) {
      return `<input class="line" type="text"${wide} data-key="${esc(stored)}" data-type="text"
      placeholder="${esc(n.placeholder ?? "")}" title="${esc(says)}">`;
    }
    // Enter is what a person presses, so Enter is what mints. The value goes
    // to the command and is not stored: nothing here holds a draft.
    return `<input class="line" type="text"${wide} data-run="${esc(n.command ?? "")}"
      placeholder="${esc(n.placeholder ?? "")}" title="${esc(says)}">`;
  }
  if (n.type === "toggle") {
    // A TOGGLE IS DOWN OR IT IS UP. There is nothing to report about it, so
    // there is no light: a light says a thing is happening on its own, and
    // this only ever says what the person last pressed.
    const labels = n.labels ?? {};
    const titles = tipsFor(n);
    // THE RESTING POSITION IS THE FIRST ONE IT DECLARES. A toggle with two
    // positions calls it off; the binding has three and calls it bound, and a
    // widget that assumed off would draw a state that control does not have.
    const rest = labels.off !== undefined ? "off" : Object.keys(labels)[0] ?? "off";
    const ges = n.gesture && n.gestureCommand
      ? ` data-gesture="${n.gesture}" data-gesture-command="${esc(n.gestureCommand)}"`
      : "";
    return `<button class="toggle" id="${esc(n.name)}"${wide} data-state="${esc(rest)}"
      data-command="${esc(n.command ?? "")}"${ges}
      data-labels='${json(labels)}' data-titles='${json(titles)}'
      title="${esc(titles[rest] ?? n.name)}">${esc(labels[rest] ?? n.name)}</button>`;
  }
  if (n.type === "action") {
    const says = withKeywords(n.title ?? n.label ?? n.name, n);
    return `<button data-command="${esc(n.command ?? "")}" title="${esc(says)}">${esc(
      n.label ?? n.name,
    )}</button>`;
  }
  const labels = n.labels ?? {};
  const titles = tipsFor(n);
  return `<button class="status" id="${esc(n.name)}" data-state="idle"
    data-command="${esc(n.command ?? "")}" data-stop="${esc(n.stopCommand ?? "")}"
    data-labels='${json(labels)}' data-titles='${json(titles)}'
    title="${esc(titles.idle ?? "")}">
    <span class="label">${esc(labels.idle ?? n.name)}</span><span class="led"></span>
  </button>`;
}

// A CONTROL A CHAT CAN REACH SAYS SO IN ITS TOOLTIP. The cloud has no panel,
// so these lines are the only place a person learns what to type. They are
// copied from the engine rather than composed, so they cannot drift from what
// works.
//
// EVERY STATE DRAWS THEM, AND NOT ONLY THE RESTING ONE. The webview swaps the
// title as a toggle moves, so lines put on the resting state alone vanish the
// moment somebody presses it, which is exactly when a person is looking.
function withKeywords(says: string, n: Node): string {
  // A BOX THAT TAKES A LANGUAGE SAYS WHICH, from the one place that describes
  // it. The work editor's filter reads the same sentence.
  if (n.syntax === "filter") {
    says += "\n\n" + filterSyntax;
  }
  if (!n.keywords?.length) {
    return says;
  }
  return says + "\n\nFrom a chat, send one of these on its own:\n" + n.keywords.join("\n")
    + (n.keywords.some((l) => l.includes("<")) ? "\n\nWhat is in angle brackets is yours to fill in." : "");
}

function tipFor(n: Node): string {
  return withKeywords(n.help ?? n.title ?? n.name, n);
}

// tipsFor is the same for a control whose tooltip changes with its state.
function tipsFor(n: Node): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [state, says] of Object.entries(n.titles ?? {})) {
    out[state] = withKeywords(says, n);
  }
  return out;
}

function field(k: string, n: Node): string {
  const span = COLUMNS - 1;
  const help = tipFor(n);
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
    // THE UNIT SITS BESIDE THE BOX AND NOT IN THE LABEL. A row reads
    // "a claim lasts [3] hours", which is a sentence, and the label stays
    // short enough for a narrow sidebar.
    const unit = n.unit ? `<span class="unit">${esc(n.unit)}</span>` : "";
    control = `<input type="number" ${bounds} ${common}>${unit}`;
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
  /* A CARET, so it reads as a thing that opens. Without one it is a button
     that says something odd. */
                  display: flex; align-items: center; justify-content: space-between; gap: 4px; }
                   list-style: none; min-width: 190px; border-radius: 2px;
                   background: var(--vscode-dropdown-background, var(--vscode-editor-background));
                   border: 1px solid var(--vscode-dropdown-border, var(--vscode-focusBorder));
                   box-shadow: 0 2px 8px rgba(0,0,0,.35); }
  details { margin-bottom: 10px; }
  summary { font-size: 0.85em; text-transform: uppercase; letter-spacing: 0.06em;
            color: var(--vscode-descriptionForeground); font-weight: 600; cursor: pointer;
            margin-bottom: 6px; list-style: none; display: flex; align-items: center; gap: 4px; }
  summary::-webkit-details-marker { display: none; }
  summary::before { content: "\\25be"; font-size: 10px; transition: transform .12s; }
  details:not([open]) summary::before { transform: rotate(-90deg); }
  h3 { font-size: 0.85em; text-transform: uppercase; letter-spacing: 0.06em;
       color: var(--vscode-descriptionForeground); margin: 0 0 6px 0; font-weight: 600; }
  .control .unit { margin-left: 6px; opacity: 0.7; }
  /* A COUNT IS A NUMBER AND NOTHING ELSE. No label: it sits beside the box that
     changes it, and what it counts is what that box says. It is right-aligned
     against its own column so a number that grows does not move the box. */
  /* A THREE DIGIT DISPLAY. Zero padded, so the width never changes and the box
     beside it never moves. Tabular figures keep every digit the same width. */
  .count { display: flex; align-items: center; justify-content: flex-end;
           height: var(--control-height); padding-right: 6px;
           font-family: var(--vscode-editor-font-family, monospace);
           font-variant-numeric: tabular-nums; letter-spacing: 0.08em;
           min-width: 3ch; color: var(--vscode-foreground); opacity: 0.85; }
  .control input[type="number"] { width: auto; max-width: 6em; }
  h3 + .grid { margin-bottom: 12px; }
  button { width: 100%; }
  button.status { display: flex; align-items: center; justify-content: space-between; gap: 6px; }
  /* UNBOUND IS THE SAME MARK IN A DIFFERENT LIGHT, because it is the same act.
     GOD MODE PULSES, and it is the one thing on this panel that moves: a state
     with no timer on it has to be the thing a person cannot fail to notice. */
  button.toggle[data-state="unbound"] { background: var(--vscode-inputValidation-warningBackground,
    var(--vscode-editorWarning-foreground)); }
  button.toggle[data-state="god"] { background: var(--vscode-statusBarItem-errorBackground,
    var(--vscode-inputValidation-errorBackground));
    color: var(--vscode-statusBarItem-errorForeground, var(--vscode-foreground));
    animation: godpulse 1.1s ease-in-out infinite; }
  @keyframes godpulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.45 } }
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
     in: the holding column is the long one and it is the one that ellipses.
     A column that declares a width carries it inline and wins over the sheet.
     What the two declared columns get when it does not is named below. */
  .table { grid-column: 1 / -1; overflow: hidden; }
  .table table { width: 100%; border-collapse: collapse; table-layout: fixed; }
  .table th { text-align: left; font-weight: normal; padding: 2px 4px 2px 0;
              color: var(--vscode-descriptionForeground); font-size: .9em;
              border-bottom: 1px solid var(--vscode-panel-border); }
  .table td { padding: 2px 4px 2px 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .table td.holding { color: var(--vscode-descriptionForeground); }
  /* THE COLUMNS, NAMED. A cell's class is its column's field name, so these two
     are the agent and what it is working on. The layout is fixed, so with a
     width on neither the sidebar split the row evenly and the long column
     ellipsed a title away while the short one sat half empty. The agent column
     is as wide as a worker name needs and no wider, and the rest is the
     title's, which is the column the comment above says should ellipse. */
  .table th.actor, .table td.actor { width: 8.5em; }
  .table th.title, .table td.title { width: auto; }
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

  // A TOGGLE PRESSES ONCE. A toggle that declares a gesture also counts.
  //
  // WITHIN ONE BURST ONLY THE FIRST PRESS ACTS. Presses two to four do nothing
  // at all, so a person going for the gesture does not flip the control four
  // times on the way, and the fifth sends the other command.
  //
  // AND THE BUTTON IS DEAD FOR A MOMENT AFTER IT ARMS, so the tail of a
  // fumbled six-press burst cannot undo the thing that was just meant.
  const BURST = 1000, DEADNESS = 600;
  for (const b of document.querySelectorAll('button.toggle')) {
    const want = Number(b.dataset.gesture || '0');
    let began = 0, presses = 0, deadUntil = 0;
    b.onclick = () => {
      const now = Date.now();
      if (now < deadUntil) return;
      if (want < 2) { send({ type: 'command', command: b.dataset.command }); return; }
      if (now - began > BURST) { began = now; presses = 0; }
      presses++;
      if (presses === 1) { send({ type: 'command', command: b.dataset.command }); return; }
      if (presses === want) {
        send({ type: 'command', command: b.dataset.gestureCommand });
        deadUntil = now + DEADNESS;
        presses = 0;
      }
    };
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
      send({ type: 'run', command: line.dataset.run, text });
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
    if (m.type === 'ready') { /* nothing: the extension drives this */ }
    if (m.type === 'taken') {
      for (const line of document.querySelectorAll('input.line')) {
        if (line.dataset.run === m.command) line.value = '';
      }
    }
    if (m.type === 'state' && m.id) {
      const t = document.getElementById(m.id);
      if (t && t.classList.contains('toggle')) {
        const labels = JSON.parse(t.dataset.labels || '{}');
        const titles = JSON.parse(t.dataset.titles || '{}');
        // A CONTROL WITH MORE THAN TWO POSITIONS NAMES ITS OWN. on and off
        // cannot say which of the two positions that are not bound this is.
        const named = labels[m.state] !== undefined;
        const key = named ? m.state : (m.state === 'good' ? 'on' : 'off');
        t.dataset.state = key;
        t.textContent = labels[key] || t.textContent;
        t.title = titles[key] || '';
        return;
      }
    }
    // A FRESH ANSWER, DROPPED INTO THE PAGE THAT IS ALREADY HERE.
    //
    // Not a new page. Replacing the html every second would empty the line a
    // person is typing in and fold every
    // section they opened, once a second, for ever. Only the parts that follow
    // the engine are replaced, which is how the values already arrive.
    if (m.type === 'doing') {
      const strip = document.getElementById('doings');
      if (strip) strip.innerHTML = m.head;
      for (const name of Object.keys(m.tables || {})) {
        const t = document.querySelector('[data-table="' + name + '"]');
        if (t) t.innerHTML = m.tables[name];
      }
      // A COUNT IS TEXT AND NOT MARKUP, so it is set as text. It follows the
      // engine on the same beat the tables do.
      for (const name of Object.keys(m.counts || {})) {
        for (const c of document.querySelectorAll('[data-count="' + name + '"]')) {
          c.textContent = m.counts[name];
        }
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
  const all = lists[n.source ?? ""];
  // AN EMPTY HAND DRAWS NO ROW. A row saying only that somebody once pulled is
  // a row a person cannot act on, and the header is for what they can act on.
  //
  // A STOPPED AGENT KEEPS ITS ROW, whether or not it holds anything, because a
  // stop is the thing a person most needs to see and hiding it would be the
  // opposite of the rule.
  //
  // IT IS DROPPED HERE AND NOT IN THE LIST. The staffing count reads the length
  // of that list, so an agent taken out of it is one the guard cannot count,
  // and a worker that has spawned and not pulled yet would go missing.
  const rows = all?.filter((r) => r.id || r.state !== "waiting");
  if (!rows) {
    // A SOURCE NOTHING ANSWERS IS A FAULT IN THE DECLARATION, and it says so
    // rather than drawing an empty table, which would read as nobody here.
    return `<div class="empty">no list called ${esc(n.source ?? "")}</div>`;
  }
  const cols = n.columns ?? [];
  const wide = (c: { width?: string }) => (c.width ? ` style="width:${esc(c.width)}"` : "");
  const head = cols.map((c) => `<th class="${esc(c.field)}"${wide(c)}>${esc(c.title)}</th>`).join("");
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
      return `<td class="${esc(c.field)}"${wide(c)}>${shown}</td>`;
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
    { head: string; tables: Record<string, string>; counts: Record<string, string> } {
  const tables: Record<string, string> = {};
  // A COUNT FOLLOWS THE ENGINE THE WAY A TABLE DOES, so it rides the same
  // message. Keyed by what it counts rather than where it is drawn, because
  // two counts of one thing are one number.
  const counts: Record<string, string> = {};
  for (const [path, g] of groupsNamed(root, "", shown)) {
    for (const k of (g.children ?? []).filter((c) => c.type === "table")) {
      tables[key(path, k)] = tableBody(k, doing);
    }
    for (const k of (g.children ?? []).filter((c) => c.type === "count")) {
      counts[k.source ?? k.name] = theCount(k, doing);
    }
  }
  return { head: doingRows(doing), tables, counts };
}

// theCount is the number a count draws, from the engine's own answer.
//
// A SOURCE NOBODY ANSWERS DRAWS NOTHING, not a zero. Zero is a fact about an
// empty queue and a person acts on it, so a missing answer must not look like
// one. That is the defect this had: it drew zero while the engine said two
// hundred and fourteen.
function theCount(n: Node, doing: Happening): string {
  const got = n.source === "queue" ? doing.queue : undefined;
  // THREE DIGITS, ZERO PADDED, on the owner's word. A number that keeps its
  // width does not move the box beside it, and a padded zero reads as a
  // reading rather than as a blank. Past a thousand it grows rather than lies.
  return typeof got === "number" ? String(got).padStart(3, "0") : "";
}

// THE HEAD SAYS WHAT IS TRUE OF THE WHOLE SYSTEM, AND NAMES NO ACTOR.
//
// It drew a line per working actor beside the gear. The table below already
// draws every actor and what it holds, so each one was on the panel twice, and
// the strip's first line ran into the view's own title: a person opening the
// editor read "worker-heron working wk-12c6e7ad1e Overnight report for o..."
// where the name of the view belongs.
//
// A HOLD IS NOT AN ACTOR. Everything being on hold is one fact about the whole
// panel, so it stays here, and it is the only thing that does.
function whoIsDoingWhat(doing: Happening): string {
  return `<div class="doings" id="doings">${doingRows(doing)}</div>`;
}

// THE ROWS ALONE, so a fresh answer can be dropped into the strip that is
// already on screen. The line is cut at its end now, so the whole of it goes on
// the hover: a reason an actor stopped is a paragraph, and it is the one thing
// on this panel a person most wants to read in full.
function doingRows(doing: Happening): string {
  const held = doing.hold?.on
    ? `<div class="onhold">everything is on hold${doing.hold.by ? ", by " + esc(doing.hold.by) : ""}</div>`
    : "";
  return held;
}
