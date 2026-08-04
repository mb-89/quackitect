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
import { pendingNotes } from "./inbox.ts";
import type { MachineDecl, StateDecl } from "./machine.ts";
import { parseStateNote, section } from "./notes.ts";
import { seDir } from "./paths.ts";
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
  /** Per template name: its editor and its mechanical checks. */
  template_meta: Record<string, TemplateMeta>;
  /** Per field name: the arguments the form hands its template. */
  field_args: Record<string, FieldArgs>;
  /** The lint template over the fill sections, in sheet order. */
  template: FormTemplate;
  /** Field name -> its template name (free-form unless declared). */
  field_templates: Record<string, string>;
}

export function fieldTemplateRel(name: string): string {
  return `project/deliverable/machines/forms/templates/${name}.md`;
}

/** A template's MECHANICS, from its frontmatter. Templates stay GENERIC
 *  (owner ruling 2026-08-04): the editor shape and the line grammar live
 *  here; the concrete options and items are the FIELD's arguments. */
export interface TemplateMeta {
  editor: string;
  line_pattern: string;
  line_help: string;
  /** What the editor's empty box says — the hint AT the point of typing. */
  placeholder: string;
}

/** The field's arguments to its template — declared in the form's own
 *  markdown, resolved live where a source is named ($inbox). */
export interface FieldArgs {
  options: string[];
  items: string[];
  passing: string[];
}

export function templateMeta(root: string, name: string): TemplateMeta {
  try {
    const fm = parseStateNote(readFileSync(join(root, fieldTemplateRel(name)), "utf8")).frontmatter;
    return {
      editor: typeof fm.editor === "string" ? fm.editor : "text",
      line_pattern: typeof fm.line_pattern === "string" ? fm.line_pattern : "",
      line_help: typeof fm.line_help === "string" ? fm.line_help : "",
      placeholder: typeof fm.placeholder === "string" ? fm.placeholder : "",
    };
  } catch {
    return { editor: "text", line_pattern: "", line_help: "", placeholder: "" };
  }
}

const escapeRe = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, (c) => `\\${c}`);

const NO_ARGS: FieldArgs = { options: [], items: [], passing: [] };

/** The choice half of a `<option> — <rationale>` line. */
export function choiceOf(content: string): string {
  const first = (content.split("\n")[0] ?? "").trim();
  const i = first.indexOf(" — ");
  return i < 0 ? first : first.slice(0, i).trim();
}

/** The template checks over the fills — same verdicts for both hands and
 *  both renders. Emptiness stays the required-check's job. */
export function templateProblems(model: StateFormModel, fills: Record<string, string>): string[] {
  const out: string[] = [];
  for (const f of model.template.fields) {
    const meta = model.template_meta[model.field_templates[f.name] ?? "free-form"];
    if (meta === undefined) continue;
    const content = (fills[f.name] ?? "").trim();
    if (content === "") continue;
    out.push(...fieldProblems(f.name, meta, model.field_args[f.name] ?? NO_ARGS, content));
  }
  return out;
}

function fieldProblems(name: string, meta: TemplateMeta, args: FieldArgs, content: string): string[] {
  if (meta.editor === "choice-rationale") {
    const choice = choiceOf(content);
    if (args.options.length > 0 && !args.options.includes(choice))
      return [`${name}: the choice must be one of — ${args.options.join(" | ")}`];
    if (args.passing.length > 0 && !args.passing.includes(choice))
      return [`${name}: ${choice} — the claim does not stand, and the gate stays shut while it does`];
    return [];
  }
  const out: string[] = [];
  if (meta.editor === "per-item" && args.items.length > 0) {
    const missing = args.items.filter((i) => !new RegExp(`^- ${escapeRe(i)}: .+`, "m").test(content));
    if (missing.length > 0) out.push(`${name}: unanswered — ${missing.join(" · ")}`);
  }
  if (meta.line_pattern !== "") {
    const re = new RegExp(meta.line_pattern);
    const bad = content.split("\n").find((l) => l.trim() !== "" && !re.test(l.trim()));
    if (bad !== undefined) out.push(`${name}: ${meta.line_help !== "" ? meta.line_help : `every line matches ${meta.line_pattern}`}`);
  }
  return out;
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
  description: "What stands right now, in a few lines.",
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
    ...s.evidence_form.map((f) => ({
      name: f.name,
      description: f.description,
      required: f.required,
      ...(f.guidance !== undefined ? { guidance: f.guidance } : {}),
    })),
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
  const templateMetas: Record<string, TemplateMeta> = {};
  for (const t of [...new Set(Object.values(fieldTemplates))]) {
    inputs.push({ label: `Read template-${t}`, description: templateStatement(root, t), path: fieldTemplateRel(t), entry: false });
    templateMetas[t] = templateMeta(root, t);
  }
  const fieldArgs: Record<string, FieldArgs> = {};
  for (const f of s.evidence_form) {
    fieldArgs[f.name] = {
      options: f.options ?? [],
      items: (f.items ?? []).flatMap((i) => (i === "$inbox" ? inboxItems(root) : [i])),
      passing: f.passing ?? [],
    };
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
    template_meta: templateMetas,
    field_args: fieldArgs,
    template: stateFormFields(s),
    field_templates: fieldTemplates,
  };
}

/** $inbox, resolved live: one item per pending note — the ref, then the
 *  note's own title so the filler knows what they are answering. */
function inboxItems(root: string): string[] {
  try {
    return pendingNotes(seDir(root)).map((n) => `${n.ref} — ${(n.title ?? n.text.split("\n")[0]).slice(0, 48)}`);
  } catch {
    return [];
  }
}

// ── The portable copy ──────────────────────────────────────────────────

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
): string {
  const flag = required ? '<span class="req">required</span>' : '<span class="opt">optional</span>';
  const guide = guidance === "" ? "" : `<div class="guide">${esc(guidance)}</div>`;
  const head = `<div class="field"><span class="tpl">template: ${esc(template)}</span><span class="name">${esc(name)}</span>${flag}<div class="desc">${esc(description)}</div>${guide}`;
  return `${head}${fieldEditor(name, content, meta, args)}</div>`;
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
function fieldEditor(name: string, content: string, meta: TemplateMeta | undefined, args: FieldArgs): string {
  const editor = meta?.editor ?? "text";
  const ph = esc(meta?.placeholder ?? "");
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
  const evid = model.template.fields
    .filter((f) => f.name !== "current_situation" && f.name !== "follow_up")
    .map((f) => {
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
      );
    })
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
