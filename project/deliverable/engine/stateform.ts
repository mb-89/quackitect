// THE STATE FORM (owner rulings 2026-08-04): every state derives its
// evidence form from markdown — the A3 shape (machines/forms/a3.md), the
// state's own note or matrix row, and the generated reading list. The
// engine DERIVES; the markdown DECIDES. Instances are multi-pass and
// stored; every form is a CLAIM until its gate passes it. The portable
// copy is one HTML with ONE JSON island — the island is the only thing
// the save rewrites and the only thing the ingest reads (the v1 book's
// comment law, reapplied).
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { FormTemplate } from "./forms.ts";
import type { MachineDecl, StateDecl } from "./machine.ts";
import { parseStateNote, section } from "./notes.ts";
import { type GuidanceDoc, pulledFor } from "./pull.ts";

export interface A3Box {
  heading: string;
  source: string;
  fill: boolean;
  help: string;
}

/** The sheet shape, read live from its markdown. */
export function readA3(root: string): A3Box[] {
  const raw = readFileSync(join(root, "project", "deliverable", "machines", "forms", "a3.md"), "utf8");
  const text = section(parseStateNote(raw).body, "Boxes");
  const boxes: A3Box[] = [];
  for (const line of text.split("\n")) {
    const m = line.trim().match(/^- (.+?) \| (.+?) \| (.*?) \| (.+)$/);
    if (m !== null) boxes.push({ heading: m[1], source: m[2], fill: m[3].trim() === "fill", help: m[4] });
  }
  return boxes;
}

export interface FormInput {
  label: string;
  description: string;
  /** A read input names its document; a do input names none. */
  path?: string;
  /** Owed BEFORE the state is entered (the method read). */
  entry: boolean;
}

export interface StateFormModel {
  form: string;
  title: string;
  header: Record<string, string>;
  description: string;
  motivation: string;
  follow_up_label: string;
  inputs: FormInput[];
  boxes: A3Box[];
  /** The lint template over the fill sections, in sheet order. */
  template: FormTemplate;
  /** Field name -> its template name (free-form unless declared). */
  field_templates: Record<string, string>;
}

export function fieldTemplateRel(name: string): string {
  return `project/deliverable/machines/forms/templates/${name}.md`;
}

function templateStatement(root: string, name: string): string {
  try {
    return parseStateNote(readFileSync(join(root, fieldTemplateRel(name)), "utf8")).statement;
  } catch {
    return "";
  }
}

/** "Read <name>" from a document path — the input list's verb-object label. */
function readLabel(path: string): string {
  const base = path.split("/").pop() ?? path;
  return `Read ${base.replace(/\.md$/, "")}`;
}

const SITUATION = {
  name: "current_situation",
  description: "What stands right now, in a few lines — opened from the survey.",
  required: true,
};
const FOLLOW_UP = {
  name: "follow_up",
  description: "What this work produces as next steps — work, or notes parked with their ready-when.",
  required: true,
};

/** The lint template a state's form derives: situation, the evidence
 *  fields, follow-up — the fill sections in sheet order. */
export function stateFormFields(s: StateDecl): FormTemplate {
  const fields = [
    SITUATION,
    ...s.evidence_form.map((f) => ({ name: f.name, description: f.description, required: f.required })),
    FOLLOW_UP,
  ];
  return { form: s.id, instance: `${s.id}.md`, statement: s.statement, fields };
}

/** form = f(state): the A3 model, every part from markdown or derived. */
export function stateFormModel(
  root: string,
  docs: GuidanceDoc[],
  m: MachineDecl,
  s: StateDecl,
  header: Record<string, string>,
): StateFormModel {
  const entryReads = new Set(s.entry?.read ?? []);
  const inputs: FormInput[] = pulledFor(root, docs, m, s).map((d) => ({
    label: readLabel(d.path),
    description: d.path,
    path: d.path,
    entry: entryReads.has(d.path),
  }));
  const fieldTemplates: Record<string, string> = { current_situation: "free-form", follow_up: "free-form" };
  for (const f of s.evidence_form) fieldTemplates[f.name] = f.template ?? "free-form";
  for (const t of [...new Set(Object.values(fieldTemplates))]) {
    inputs.push({ label: `Read template-${t}`, description: templateStatement(root, t), path: fieldTemplateRel(t), entry: false });
  }
  for (const d of s.inputs ?? []) inputs.push({ label: d.label, description: d.description, entry: false });
  return {
    form: s.id,
    title: `Evidence form / ${s.id}`,
    header,
    description: s.statement,
    motivation: s.motivation ?? "",
    follow_up_label: s.follow_up_label ?? "",
    inputs,
    boxes: readA3(root),
    template: stateFormFields(s),
    field_templates: fieldTemplates,
  };
}

// ── The portable copy ──────────────────────────────────────────────────

const esc = (s: string): string => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export interface IslandData {
  form: string;
  author: string;
  fields: Record<string, string>;
}

/** The returned file's island — the ONLY thing the ingest reads. */
export function parseIsland(html: string): IslandData | undefined {
  const m = html.match(/<script type="application\/json" id="se-form">([\s\S]*?)<\/script>/);
  if (m === null) return undefined;
  try {
    const d = JSON.parse(m[1]) as Partial<IslandData>;
    if (typeof d.form !== "string" || d.fields === null || typeof d.fields !== "object") return undefined;
    const fields = Object.fromEntries(Object.entries(d.fields ?? {}).map(([k, v]) => [k, String(v)]));
    return { form: d.form, author: typeof d.author === "string" ? d.author : "", fields };
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
  .inputs li::before { content: "☐ "; }
  .inputs .t { font-weight: 600; } .inputs a.t { color: #35507a; }
  .inputs .entry { font-size: 11px; color: #b3261e; border: 1px solid #b3261e; border-radius: 3px; padding: 0 4px; margin-left: .4em; }
  .inputs .d { color: #555; font-size: 12.5px; display: block; margin-left: 1.5em; }
  .field { border: 1px solid #999; border-radius: 4px; padding: 7px 10px; margin: 7px 0; }
  .field .name { font-weight: 600; font-size: 13.5px; }
  .field .req { color: #b3261e; font-size: 11.5px; margin-left: .5em; }
  .field .opt { color: #888; font-size: 11.5px; margin-left: .5em; }
  .field .tpl { float: right; font-size: 11.5px; color: #35507a; }
  .field .desc { color: #555; font-size: 12.5px; margin: 2px 0 6px; }
  textarea[data-field] { width: 100%; min-height: 64px; border: 1px dashed #bbb; border-radius: 3px; background: #fcfcfc; padding: 6px 8px; font: 12.5px/1.5 system-ui, sans-serif; }
  .docs { max-width: 1240px; margin: 14px auto; }
  .docs details { background: #fff; border: 1px solid #c9c9c9; margin: 6px 0; padding: 6px 10px; }
  .docs pre { white-space: pre-wrap; font-size: 12px; padding: 8px 4px; }
  .bar { max-width: 1240px; margin: 12px auto; display: flex; gap: 1em; align-items: center; }
  .bar button { padding: .5em 1.4em; border: 1px solid #111; background: #fff; cursor: pointer; font-weight: 600; }
  .bar input { padding: .4em .6em; border: 1px solid #999; }
`;

const SHEET_JS = `
  function seCollect() {
    var fields = {};
    document.querySelectorAll("textarea[data-field]").forEach(function (t) { fields[t.getAttribute("data-field")] = t.value; });
    var island = document.getElementById("se-form");
    var d = JSON.parse(island.textContent);
    d.fields = fields;
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
`;

function renderInput(i: FormInput, docIndex: Map<string, number>): string {
  const entry = i.entry ? '<span class="entry">before entry</span>' : "";
  const idx = i.path !== undefined ? docIndex.get(i.path) : undefined;
  const label =
    idx !== undefined
      ? `<a class="t" data-doc="doc-${idx}" href="#doc-${idx}">${esc(i.label)}</a>`
      : `<span class="t">${esc(i.label)}</span>`;
  return `<li>${label}${entry}<span class="d">${esc(i.description)}</span></li>`;
}

function renderField(name: string, description: string, required: boolean, template: string, content: string): string {
  const flag = required ? '<span class="req">required</span>' : '<span class="opt">optional</span>';
  return (
    `<div class="field"><span class="tpl">template: ${esc(template)}</span><span class="name">${esc(name)}</span>${flag}` +
    `<div class="desc">${esc(description)}</div>` +
    `<textarea data-field="${esc(name)}">${esc(content)}</textarea></div>`
  );
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
export function buildPortableForm(model: StateFormModel, fills: Record<string, string>, docs: EmbeddedDoc[]): string {
  const docIndex = new Map(docs.map((d, i) => [d.path, i]));
  const follow = model.follow_up_label === "" ? "" : `<span class="concrete">/ ${esc(model.follow_up_label)}</span> `;
  const evid = model.template.fields
    .filter((f) => f.name !== "current_situation" && f.name !== "follow_up")
    .map((f) => renderField(f.name, f.description, f.required, model.field_templates[f.name] ?? "free-form", fills[f.name] ?? ""))
    .join("");
  const island: IslandData = { form: model.form, author: "", fields: fills };
  const left =
    `<div class="box"><h2>1&nbsp;&nbsp;Description</h2><p>${esc(model.description)}</p></div>` +
    `<div class="box"><h2>2&nbsp;&nbsp;Motivation</h2><p>${esc(model.motivation)}</p></div>` +
    `<div class="box"><h2>3&nbsp;&nbsp;Current situation <span class="tpl">template: ${esc(model.field_templates.current_situation ?? "free-form")}</span></h2>` +
    `<textarea data-field="current_situation">${esc(fills.current_situation ?? "")}</textarea></div>` +
    `<div class="box"><h2>4&nbsp;&nbsp;Inputs</h2><ul class="inputs">${model.inputs.map((i) => renderInput(i, docIndex)).join("")}</ul></div>`;
  const right =
    `<div class="box"><h2>5&nbsp;&nbsp;Evidence</h2>${evid}</div>` +
    `<div class="box"><h2>6&nbsp;&nbsp;Follow-up ${follow}<span class="tpl">template: ${esc(model.field_templates.follow_up ?? "free-form")}</span></h2>` +
    `<textarea data-field="follow_up">${esc(fills.follow_up ?? "")}</textarea></div>`;
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
