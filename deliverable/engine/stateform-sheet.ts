// THE PORTABLE COPY: one state form rendered as a single self-contained HTML
// sheet, and the island read back out of the returned file.
//
// Split out of stateform.ts. Nothing above it reaches down here — the sheet is
// a leaf, and the only things it borrows are the model shapes it renders.
//
// see dsp-evidence-forms.md#the-portable-copy
import type { FormTemplate } from "./forms.ts";
import { type FieldArgs, type FieldHint, type FormInput, NO_ARGS, type StateFormModel, type TemplateMeta } from "./stateform.ts";

const esc = (s: string): string => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export interface IslandData {
  form: string;
  author: string;
  fields: Record<string, string>;
  /** Input labels ticked on the sheet — they travel with the fills. */
  checked: string[];
}

/** The returned file's island — the ONLY thing the ingest reads. */
export function parseIsland(html: string): IslandData | undefined {
  const m = html.match(/<script type="application\/json" id="se-form">([\s\S]*?)<\/script>/);
  if (m === null) return undefined;
  try {
    const d = JSON.parse(m[1]) as Partial<IslandData>;
    if (typeof d.form !== "string" || d.fields === null || typeof d.fields !== "object") return undefined;
    const fields = Object.fromEntries(Object.entries(d.fields ?? {}).map(([k, v]) => [k, String(v)]));
    const checked = Array.isArray(d.checked) ? d.checked.map(String) : [];
    return { form: d.form, author: typeof d.author === "string" ? d.author : "", fields, checked };
  } catch {
    return undefined;
  }
}

export interface EmbeddedDoc {
  path: string;
  content: string;
}

const SHEET_CSS = `
  * { box-sizing: border-box; margin: 0; }
  body { font: 14px/1.5 system-ui, sans-serif; color: #111; background: #e8e8e8; padding: 24px; }
  .sheet { max-width: 1240px; margin: 0 auto; background: #fff; border: 2px solid #111; }
  header { display: flex; justify-content: space-between; align-items: baseline; gap: 2em; border-bottom: 2px solid #111; padding: 10px 16px; flex-wrap: wrap; }
  h1 { font-size: 19px; } h1 .slash { color: #888; font-weight: normal; }
  .dates { font-size: 12.5px; color: #333; display: flex; gap: 1.6em; flex-wrap: wrap; }
  .dates b { color: #111; }
  .grid { display: grid; grid-template-columns: 1fr 1.25fr; }
  .col-l { border-right: 2px solid #111; }
  .box { border-bottom: 1.5px solid #111; padding: 10px 14px 12px; }
  .col-l .box:last-child, .col-r .box:last-child { border-bottom: none; }
  h2 { font-size: 12px; text-transform: uppercase; letter-spacing: .07em; color: #111; margin-bottom: 6px; }
  h2 .concrete { color: #888; text-transform: none; letter-spacing: 0; }
  h2 .tpl { float: right; font-size: 11.5px; color: #35507a; font-weight: normal; letter-spacing: 0; text-transform: none; }
  p, li { font-size: 13.5px; }
  .inputs { list-style: none; padding-left: 0; }
  .inputs li { margin: 6px 0; }
  .inputs .t { font-weight: 600; } .inputs a.t { color: #35507a; }
  .inputs .entry { font-size: 11px; color: #b3261e; border: 1px solid #b3261e; border-radius: 3px; padding: 0 4px; margin-left: .4em; }
  .inputs .d { color: #555; font-size: 12.5px; display: block; margin-left: 1.5em; }
  .field { border: 1px solid #999; border-radius: 4px; padding: 7px 10px; margin: 7px 0; }
  .field .name { font-weight: 600; font-size: 13.5px; }
  .field .req { color: #b3261e; font-size: 11.5px; margin-left: .5em; }
  .field .opt { color: #888; font-size: 11.5px; margin-left: .5em; }
  .field .tpl { float: right; font-size: 11.5px; color: #35507a; }
  .field .desc { color: #555; font-size: 12.5px; margin: 2px 0 6px; }
  .field .guide { color: #555; font-size: 12.5px; font-style: italic; margin: 2px 0 6px; }
  textarea[data-field] { width: 100%; min-height: 64px; border: 1px dashed #bbb; border-radius: 3px; background: #fcfcfc; padding: 6px 8px; font: 12.5px/1.5 system-ui, sans-serif; }
  .docs { max-width: 1240px; margin: 14px auto; }
  .docs details { background: #fff; border: 1px solid #c9c9c9; margin: 6px 0; padding: 6px 10px; }
  .docs pre { white-space: pre-wrap; font-size: 12px; padding: 8px 4px; }
  .bar { max-width: 1240px; margin: 12px auto; display: flex; gap: 1em; align-items: center; }
  .bar button { padding: .5em 1.4em; border: 1px solid #111; background: #fff; cursor: pointer; font-weight: 600; }
  .bar input { padding: .4em .6em; border: 1px solid #999; }
  .rows .row { display: flex; gap: 6px; margin: 4px 0; align-items: center; }
  .rows input { flex: 1; padding: .35em .5em; border: 1px dashed #bbb; border-radius: 3px; background: #fcfcfc; font: 12.5px system-ui, sans-serif; }
  .rows .pi { font-size: 12.5px; color: #333; flex: 0 0 42%; }
  .rows select { padding: .3em .4em; font: 12.5px system-ui, sans-serif; }
  .rows .sep { color: #888; font-size: 12px; }
  .rows .rowadd, .rows .rowdel { flex: 0 0 auto; background: #fff; border: 1px solid #999; border-radius: 3px; cursor: pointer; font-size: 11px; line-height: 16px; padding: 0 5px; color: #555; }
`;

const SHEET_JS = `
  function seCollect() {
    var fields = {};
    document.querySelectorAll("textarea[data-field]").forEach(function (t) { fields[t.getAttribute("data-field")] = t.value; });
    var acc = {};
    function push(n, line) { (acc[n] = acc[n] || []).push(line); }
    document.querySelectorAll("input[data-list]").forEach(function (t) {
      if (t.value.trim() !== "") push(t.getAttribute("data-list"), "- " + t.value.trim());
      t.setAttribute("value", t.value);
    });
    document.querySelectorAll("input[data-peritem]").forEach(function (t) {
      if (t.value.trim() !== "") push(t.getAttribute("data-peritem"), "- " + t.getAttribute("data-item") + ": " + t.value.trim());
      t.setAttribute("value", t.value);
    });
    document.querySelectorAll("input[data-findf]").forEach(function (t) {
      var row = t.parentElement;
      var a = row ? row.querySelector("input[data-finda]") : null;
      var av = a ? a.value.trim() : "";
      if (t.value.trim() !== "" || av !== "") push(t.getAttribute("data-findf"), "- " + t.value.trim() + " => " + av);
      t.setAttribute("value", t.value);
      if (a) a.setAttribute("value", a.value);
    });
    Object.keys(acc).forEach(function (n) { fields[n] = acc[n].join("\\n"); });
    document.querySelectorAll("select[data-choicesel]").forEach(function (s) {
      var n = s.getAttribute("data-choicesel");
      var r = document.querySelector('input[data-rationale="' + n + '"]');
      var rv = r ? r.value.trim() : "";
      if (r) r.setAttribute("value", r.value);
      fields[n] = (s.value + (rv !== "" ? " — " + rv : "")).trim();
      for (var i = 0; i < s.options.length; i++) {
        if (s.options[i].selected) s.options[i].setAttribute("selected", "");
        else s.options[i].removeAttribute("selected");
      }
    });
    var checked = [];
    document.querySelectorAll("input[data-input]").forEach(function (c) {
      if (c.checked) { checked.push(c.getAttribute("data-input")); c.setAttribute("checked", ""); }
      else { c.removeAttribute("checked"); }
    });
    var island = document.getElementById("se-form");
    var d = JSON.parse(island.textContent);
    d.fields = fields;
    d.checked = checked;
    d.author = (document.getElementById("se-author") || { value: "" }).value;
    island.textContent = JSON.stringify(d, null, 1);
    document.querySelectorAll("textarea[data-field]").forEach(function (t) { t.textContent = t.value; });
    return "<!doctype html>\\n" + document.documentElement.outerHTML;
  }
  function seSave() {
    var name = "form-" + JSON.parse(document.getElementById("se-form").textContent).form + ".html";
    var blob = new Blob([seCollect()], { type: "text/html" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
  }
  document.addEventListener("click", function (ev) {
    var a = ev.target.closest ? ev.target.closest("a[data-doc]") : null;
    if (!a) return;
    var d = document.getElementById(a.getAttribute("data-doc"));
    if (d) { d.open = true; d.scrollIntoView({ behavior: "smooth" }); }
  });
  // Plus adds a row below; minus removes — the last row stays.
  document.addEventListener("click", function (ev) {
    var b = ev.target.closest ? ev.target.closest(".rowadd, .rowdel") : null;
    if (!b) return;
    var row = b.parentElement;
    if (!row) return;
    if (b.className.indexOf("rowadd") >= 0) {
      var clone = row.cloneNode(true);
      clone.querySelectorAll("input").forEach(function (i) { i.value = ""; i.removeAttribute("value"); });
      row.after(clone);
      var first = clone.querySelector("input");
      if (first) first.focus();
      return;
    }
    if (row.parentElement.querySelectorAll(".row").length > 1) row.remove();
  });
  // Enter adds the next row right below the one being edited.
  document.addEventListener("keydown", function (ev) {
    if (ev.key !== "Enter") return;
    var t = ev.target;
    if (!t.matches || !t.matches("input[data-list], input[data-findf], input[data-finda]")) return;
    ev.preventDefault();
    var row = t.parentElement;
    if (!row) return;
    var clone = row.cloneNode(true);
    clone.querySelectorAll("input").forEach(function (i) { i.value = ""; i.removeAttribute("value"); });
    row.after(clone);
    var first = clone.querySelector("input");
    if (first) first.focus();
  });
`;

function renderInput(i: FormInput, docIndex: Map<string, number>, checked: Set<string>): string {
  const entry = i.entry ? '<span class="entry">before entry</span>' : "";
  const idx = i.path !== undefined ? docIndex.get(i.path) : undefined;
  const label =
    idx !== undefined
      ? `<a class="t" data-doc="doc-${idx}" href="#doc-${idx}">${esc(i.label)}</a>`
      : `<span class="t">${esc(i.label)}</span>`;
  const box = `<input type="checkbox" data-input="${esc(i.label)}"${checked.has(i.label) ? " checked" : ""}> `;
  return `<li>${box}${label}${entry}<span class="d">${esc(i.description)}</span></li>`;
}

function renderField(
  name: string,
  description: string,
  required: boolean,
  template: string,
  content: string,
  meta?: TemplateMeta,
  args: FieldArgs = NO_ARGS,
  guidance = "",
  hint?: FieldHint,
): string {
  const flag = required ? '<span class="req">required</span>' : '<span class="opt">optional</span>';
  const guide = guidance === "" ? "" : `<div class="guide">${guideHtml(guidance)}</div>`;
  // The portable copy travels with no editor to open, so the item template is
  // NAMED here rather than linked, and its path rides the chip's tooltip. The
  // mirror draws the same chip clickable.
  const at = hint?.of_template === undefined || hint.of_template === "" ? "" : ` title="${esc(hint.of_template)}"`;
  const of = hint?.of === undefined || hint.of === "" ? "" : ` · of: <span${at}>${esc(hint.of)}</span>`;
  const mech = hint?.description === undefined || hint.description === "" ? "" : `<div class="desc">${esc(hint.description)}</div>`;
  const head = `<div class="field"><span class="tpl">template: ${esc(template)}${of}</span><span class="name">${esc(name)}</span>${flag}<div class="desc">${esc(description)}</div>${mech}${guide}`;
  return `${head}${fieldEditor(name, content, meta, args, hint)}</div>`;
}

/** see dsp-evidence-forms.md#guidance-is-paragraphs-and-lists */
export function guideHtml(text: string): string {
  const out: string[] = [];
  for (const block of text.split(/\n\s*\n/)) {
    let bullets: string[] = [];
    let para: string[] = [];
    const flushList = (): void => {
      if (bullets.length === 0) return;
      out.push(`<ul>${bullets.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>`);
      bullets = [];
    };
    const flushPara = (): void => {
      if (para.length === 0) return;
      out.push(`<p>${esc(para.join(" "))}</p>`);
      para = [];
    };
    for (const l of block.split("\n").map((x) => x.trim())) {
      if (l === "") continue;
      const item = /^[-*]\s+(.*)$/.exec(l);
      if (item !== null) {
        flushPara();
        bullets.push(item[1]);
        continue;
      }
      // A CONTINUATION LINE BELONGS TO ITS BULLET. An item wrapped over two
      // lines is one item, and a new paragraph mid-list would split it.
      if (bullets.length > 0) {
        bullets[bullets.length - 1] += ` ${l}`;
        continue;
      }
      // WRAPPED LINES ARE ONE PARAGRAPH. A blank line starts the next one,
      // which is the only thing that ever does.
      para.push(l);
    }
    flushPara();
    flushList();
  }
  return out.join("");
}

const ROW_BTNS =
  '<button type="button" class="rowadd" title="add a row below">+</button><button type="button" class="rowdel" title="remove this row">−</button>';

const dashLines = (content: string): string[] =>
  content
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("- "))
    .map((l) => l.slice(2));

/** The editor IS the template's shape — rows for lists, labelled rows for
 *  known items, a dropdown with its rationale, pairs for findings. */
function fieldEditor(name: string, content: string, meta: TemplateMeta | undefined, args: FieldArgs, hint?: FieldHint): string {
  const editor = meta?.editor ?? "text";
  const ph = esc(hint?.placeholder ?? "");
  if (editor === "list") {
    const rows = [...dashLines(content), ""].map(
      (v) => `<div class="row"><input data-list="${esc(name)}" placeholder="${ph}" value="${esc(v)}">${ROW_BTNS}</div>`,
    );
    return `<div class="rows">${rows.join("")}</div>`;
  }
  if (editor === "per-item" && args.items.length > 0) {
    const rows = args.items.map((it) => {
      const hit = content
        .split("\n")
        .map((l) => l.trim())
        .find((l) => l.startsWith(`- ${it}:`));
      const answer = hit === undefined ? "" : hit.slice(`- ${it}:`.length).trim();
      return `<div class="row"><span class="pi">${esc(it)}</span><input data-peritem="${esc(name)}" data-item="${esc(it)}" placeholder="${ph}" value="${esc(answer)}"></div>`;
    });
    return `<div class="rows">${rows.join("")}</div>`;
  }
  if (editor === "choice-rationale") {
    const first = (content.split("\n")[0] ?? "").trim();
    const sep = first.indexOf(" — ");
    const chosen = sep < 0 ? first : first.slice(0, sep).trim();
    const rationale = sep < 0 ? "" : first.slice(sep + 3).trim();
    const opts = [
      '<option value=""></option>',
      ...args.options.map((o) => `<option${o === chosen ? " selected" : ""}>${esc(o)}</option>`),
    ].join("");
    return `<div class="rows"><div class="row"><select data-choicesel="${esc(name)}">${opts}</select><input data-rationale="${esc(name)}" placeholder="rationale" value="${esc(rationale)}"></div></div>`;
  }
  if (editor === "findings") {
    const pairs = dashLines(content)
      .filter((l) => l.includes(" => "))
      .map((l) => {
        const i = l.indexOf(" => ");
        return { f: l.slice(0, i), a: l.slice(i + 4) };
      });
    const rows = [...pairs, { f: "", a: "" }].map(
      (p) =>
        `<div class="row"><input data-findf="${esc(name)}" placeholder="finding" value="${esc(p.f)}"><span class="sep">=&gt;</span><input data-finda="${esc(name)}" placeholder="answer" value="${esc(p.a)}">${ROW_BTNS}</div>`,
    );
    return `<div class="rows">${rows.join("")}</div>`;
  }
  return `<textarea data-field="${esc(name)}">${esc(content)}</textarea>`;
}

function renderHeader(model: StateFormModel): string {
  const meta = Object.entries(model.header)
    .map(([k, v]) => `<span>${esc(k)} <b>${esc(v === "" ? "____" : v)}</b></span>`)
    .join("");
  const slash = `<span class="slash">/ ${esc(model.form)}</span>`;
  return `<header><h1>Evidence form ${slash}</h1><div class="dates">${meta}</div></header>`;
}

/** The whole portable sheet: fills bound to the ONE island, the reading
 *  and every template baked in behind their links, save as download. */
export function buildPortableForm(
  model: StateFormModel,
  fills: Record<string, string>,
  docs: EmbeddedDoc[],
  checked: string[] = [],
): string {
  const docIndex = new Map(docs.map((d, i) => [d.path, i]));
  const done = new Set(checked);
  const follow = model.follow_up_label === "" ? "" : `<span class="concrete">/ ${esc(model.follow_up_label)}</span> `;
  // ANYTHING ELSE IS FOLLOW-UP, NOT EVIDENCE (owner). It asks
  // what is left over, which is the same question box 6 asks.
  const TAIL = ["current_situation", "follow_up", "anything_else"];
  const one = (f: FormTemplate["fields"][number]): string => {
    const tpl = model.field_templates[f.name] ?? "free-form";
    return renderField(
      f.name,
      f.description,
      f.required,
      tpl,
      fills[f.name] ?? "",
      model.template_meta[tpl],
      model.field_args[f.name],
      f.guidance ?? "",
      model.field_hints[f.name],
    );
  };
  const evid = model.template.fields
    .filter((f) => !TAIL.includes(f.name))
    .map(one)
    .join("");
  const spill = model.template.fields
    .filter((f) => f.name === "anything_else")
    .map(one)
    .join("");
  const island: IslandData = { form: model.form, author: "", fields: fills, checked };
  const left =
    `<div class="box"><h2>1&nbsp;&nbsp;Description</h2><p>${esc(model.description)}</p></div>` +
    `<div class="box"><h2>2&nbsp;&nbsp;Motivation</h2><p>${esc(model.motivation)}</p></div>` +
    `<div class="box"><h2>3&nbsp;&nbsp;Current situation <span class="tpl">template: ${esc(model.field_templates.current_situation ?? "free-form")}</span></h2>` +
    `<textarea data-field="current_situation">${esc(fills.current_situation ?? "")}</textarea></div>` +
    `<div class="box"><h2>4&nbsp;&nbsp;Inputs</h2><ul class="inputs">${model.inputs.map((i) => renderInput(i, docIndex, done)).join("")}</ul></div>`;
  const right =
    `<div class="box"><h2>5&nbsp;&nbsp;Evidence</h2>${evid}</div>` +
    `<div class="box"><h2>6&nbsp;&nbsp;Follow-up ${follow}<span class="tpl">template: ${esc(model.field_templates.follow_up ?? "free-form")}</span></h2>` +
    `<textarea data-field="follow_up">${esc(fills.follow_up ?? "")}</textarea>${spill}</div>`;
  const embedded = docs
    .map((d, i) => `<details id="doc-${i}"><summary>${esc(d.path)}</summary><pre>${esc(d.content)}</pre></details>`)
    .join("");
  return (
    `<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><title>${esc(model.title)}</title>` +
    `<style>${SHEET_CSS}</style></head><body>` +
    `<div class="sheet">${renderHeader(model)}<div class="grid"><div class="col-l">${left}</div><div class="col-r">${right}</div></div></div>` +
    `<div class="bar"><label>author <input id="se-author" placeholder="who fills this copy"></label>` +
    `<button type="button" onclick="seSave()">save the filled copy</button>` +
    `<span style="font-size:12px;color:#555">Fill the fields, set your name, save — send the file back, and it lands as evidence.</span></div>` +
    `<div class="docs"><h2 style="max-width:1240px;margin:0 auto 4px;font:600 12px system-ui;letter-spacing:.07em;text-transform:uppercase;color:#666">The reading, baked in</h2>${embedded}</div>` +
    `<script type="application/json" id="se-form">${JSON.stringify(island, null, 1)}</script>` +
    `<script>${SHEET_JS}</script></body></html>`
  );
}
