// The renderer. One model in, one string of HTML out, and every colour a
// variable the editor sets. It answers a whole document, because a redraw
// hands the webview its HTML again.
// [[spec/design_output/extension#declaration-to-html]]

const { WIDE } = require("./widgets.js");

const CONFIG = "config";

function panelHtml(model) {
  const nonce = String(model?.nonce ?? "");
  const groups = model?.groups ?? [];
  return [
    "<!DOCTYPE html>",
    '<html lang="en">',
    "<head>",
    '<meta charset="utf-8">',
    `<meta http-equiv="Content-Security-Policy" content="${policy(nonce, model)}">`,
    `<style nonce="${nonce}">${style(groups)}</style>`,
    "</head>",
    "<body>",
    chooser(groups),
    ...groups.map((one) => section(one)),
    tree(model),
    `<script type="module" nonce="${nonce}" src="${escaped(model?.script ?? "")}"></script>`,
    "</body>",
    "</html>",
  ].join("\n");
}

// [[spec/design_output/extension#the-gear-picks-the-sections]]
function chooser(groups) {
  const names = [...groups.map((one) => one.name), CONFIG];
  return [
    '<div class="bar">',
    `<button class="gear" title="the sections this panel draws">${markOf("U+2699")}</button>`,
    '<div class="chooser" hidden>',
    ...names.map(
      (name) =>
        `<label><input type="checkbox" class="pick" data-pick="${escaped(name)}"${
          name === CONFIG ? "" : " checked"
        }>${escaped(name)}</label>`,
    ),
    "</div>",
    "</div>",
  ].join("\n");
}

function section(group) {
  return [
    `<details class="section" data-section="${escaped(group.name)}" open>`,
    `<summary>${escaped(group.name)}</summary>`,
    '<div class="grid">',
    ...(group.rows ?? []).flatMap((row) => row.cells.map((cell) => widget(cell))),
    "</div>",
    "</details>",
  ].join("\n");
}

// [[spec/design_output/extension#a-mark-alone-says-it]]
function widget(cell) {
  const away = cell.value !== undefined && cell.value !== cell.rest;
  const far = (cell.options ?? [])[2];
  const held = far !== undefined && cell.value === far;
  return [
    `<button class="widget ${placeOf(cell)}${away ? " away" : ""}${held ? " held" : ""}"`,
    ` data-key="${escaped(cell.key)}" data-widget="${escaped(cell.widget)}"`,
    ` data-runs="${escaped(cell.runs ?? "")}" data-reads="${escaped(cell.reads ?? "")}"`,
    ` data-value="${escaped(cell.value ?? "")}"`,
    ` data-options="${escaped((cell.options ?? []).join(" "))}"`,
    ` data-gesture="${escaped(cell.gesture ?? "")}"`,
    ` title="${escaped(hover(cell))}">`,
    `<span class="mark">${escaped(markFor(cell))}</span>`,
    cell.widget === "status" ? `<span class="light ${escaped(cell.lit)}"></span>` : "",
    "</button>",
  ].join("");
}

// [[spec/design_output/extension#the-log-opens-a-terminal]]
function hover(cell) {
  return [
    cell.help ?? "",
    ...(cell.keys ?? []),
    cell.layer ? `${cell.key} answers out of ${cell.layer}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

// [[spec/design_output/extension#a-mark-for-every-state]]
function markFor(cell) {
  const marks = String(cell.at ?? "").split(",");
  if (marks.length < 2) return markOf(cell.at);
  const at = (cell.options ?? []).indexOf(cell.value);
  return markOf(marks[at < 0 ? 0 : at]);
}

// [[spec/design_output/extension#a-mark-and-its-codepoints]]
function markOf(at) {
  return String(at ?? "")
    .split(/\s+/)
    .filter((one) => /^U\+[0-9A-Fa-f]+$/.test(one))
    .map((one) => String.fromCodePoint(Number.parseInt(one.slice(2), 16)))
    .join("");
}

// [[spec/design_output/extension#the-bottom-section]]
function tree(model) {
  return [
    `<details class="section gone" data-section="${CONFIG}">`,
    `<summary>${CONFIG}</summary>`,
    '<input class="filter" type="text" placeholder="a regular expression over the keys">',
    '<div class="tree">',
    ...(model?.tree ?? []).map((file) => fileNode(file)),
    "</div>",
    "</details>",
  ].join("\n");
}

function fileNode(file) {
  return [
    `<details class="file" data-file="${escaped(file.file)}" open>`,
    `<summary>${escaped(file.file)}</summary>`,
    ...(file.sections ?? []).map((one) => sectionNode(one, file)),
    "</details>",
  ].join("\n");
}

function sectionNode(one, file) {
  return [
    `<details class="keys" data-node="${escaped(one.name)}" open>`,
    `<summary>${escaped(one.name)}</summary>`,
    ...(one.rows ?? []).map((row) => keyRow(row, file)),
    "</details>",
  ].join("\n");
}

function keyRow(row, file) {
  const said = [row.key, String(row.value ?? ""), row.help ?? ""].join(" ");
  return [
    `<div class="row" data-said="${escaped(said)}" title="${escaped(row.help ?? "")}">`,
    `<label for="${escaped(`${file.file}:${row.key}`)}">${escaped(row.leaf)}</label>`,
    `<span class="editor">${editor(row, file)}`,
    row.unit ? `<span class="unit">${escaped(row.unit)}</span>` : "",
    "</span>",
    "</div>",
  ].join("");
}

function editor(row, file) {
  const id = escaped(`${file.file}:${row.key}`);
  const key = escaped(row.key);
  if (row.options?.length || row.type === "boolean") {
    const options = row.options?.length ? row.options : [true, false];
    return [
      `<select id="${id}" data-key="${key}">`,
      ...options.map(
        (one) =>
          `<option value="${escaped(one)}"${
            String(one) === String(row.value) ? " selected" : ""
          }>${escaped(one)}</option>`,
      ),
      "</select>",
    ].join("");
  }
  const kind = row.type === "number" ? "number" : "text";
  return `<input id="${id}" data-key="${key}" type="${kind}" value="${escaped(row.value ?? "")}">`;
}

// [[spec/design_output/extension#the-page-carries-a-nonce]]
function policy(nonce, model) {
  const source = escaped(model?.source ?? "");
  return [
    "default-src 'none';",
    `style-src 'nonce-${nonce}';`,
    `script-src 'nonce-${nonce}' ${source};`,
  ].join(" ");
}

function placeOf(cell) {
  return `at-${cell.row}-${cell.column}-${cell.rowSpan}-${cell.colSpan}`;
}

function placements(groups) {
  const out = new Map();
  for (const group of groups) {
    for (const row of group.rows ?? []) {
      for (const cell of row.cells) {
        out.set(
          placeOf(cell),
          [
            `.${placeOf(cell)} {`,
            `grid-row: ${cell.row + 1} / span ${cell.rowSpan};`,
            `grid-column: ${cell.column + 1} / span ${cell.colSpan}; }`,
          ].join(" "),
        );
      }
    }
  }
  return [...out.values()];
}

// [[spec/design_output/extension#the-editor-picks-the-colours]]
function style(groups) {
  return [
    "body { font-family: var(--vscode-font-family); font-size: var(--vscode-font-size);",
    "  color: var(--vscode-foreground); padding: 0 4px; }",
    "summary { cursor: pointer; text-transform: lowercase;",
    "  color: var(--vscode-sideBarSectionHeader-foreground); padding: 4px 0; }",
    `.grid { display: grid; gap: 4px; padding: 4px 0;`,
    `  grid-template-columns: repeat(${WIDE}, 1fr); }`,
    ".widget { display: flex; flex-direction: column; align-items: center; gap: 2px;",
    "  border: 1px solid var(--vscode-contrastBorder, transparent); border-radius: 4px;",
    "  padding: 6px 2px; cursor: pointer; color: var(--vscode-button-secondaryForeground);",
    "  background: var(--vscode-button-secondaryBackground); }",
    ".widget:hover { background: var(--vscode-button-secondaryHoverBackground); }",
    ".widget.away { color: var(--vscode-button-foreground);",
    "  background: var(--vscode-button-background); }",
    ".mark { font-size: 1.2em; }",
    ".widget.held { background: var(--vscode-inputValidation-errorBackground,",
    "  var(--vscode-errorForeground)); color: var(--vscode-errorForeground);",
    "  border-color: var(--vscode-errorForeground); animation: pulse 1.2s infinite; }",
    "@keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.45; } 100% { opacity: 1; } }",
    ".bar { display: flex; justify-content: flex-end; position: relative; }",
    ".gear { background: var(--vscode-sideBar-background, transparent);",
    "  border: 1px solid var(--vscode-contrastBorder, transparent); cursor: pointer;",
    "  font-size: 1.1em; color: var(--vscode-foreground); padding: 2px 4px; }",
    ".chooser { position: absolute; right: 0; top: 100%; z-index: 1; padding: 4px 6px;",
    "  display: flex; flex-direction: column; gap: 2px;",
    "  background: var(--vscode-editorWidget-background, var(--vscode-editor-background));",
    "  border: 1px solid var(--vscode-editorWidget-border, var(--vscode-panel-border)); }",
    ".chooser label { display: flex; align-items: center; gap: 4px; font-size: 0.9em; }",
    ".light { width: 6px; height: 6px; border-radius: 50%;",
    "  background: var(--vscode-charts-green); }",
    ".light.dark { background: var(--vscode-disabledForeground); }",
    ".filter { width: 100%; box-sizing: border-box; margin: 2px 0 6px 0;",
    "  color: var(--vscode-input-foreground); background: var(--vscode-input-background);",
    "  border: 1px solid var(--vscode-input-border, transparent); padding: 2px 4px; }",
    ".row { display: flex; align-items: center; gap: 6px; padding: 1px 0 1px 12px; }",
    ".row label { flex: 1; overflow: hidden; text-overflow: ellipsis; }",
    ".row .editor { display: flex; align-items: center; gap: 4px; }",
    ".row input, .row select { width: 8em; color: var(--vscode-input-foreground);",
    "  background: var(--vscode-input-background);",
    "  border: 1px solid var(--vscode-input-border, transparent); }",
    ".unit { opacity: 0.7; font-size: 0.85em; }",
    ".gone { display: none; }",
    "details.file > summary { opacity: 0.8; font-size: 0.9em; }",
    ...placements(groups),
  ].join("\n");
}

function escaped(said) {
  return String(said ?? "")
    .split("&")
    .join("&amp;")
    .split("<")
    .join("&lt;")
    .split(">")
    .join("&gt;")
    .split('"')
    .join("&quot;");
}

module.exports = { CONFIG, escaped, markOf, panelHtml };
