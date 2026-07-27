// Evidence forms — A3-shaped one-pagers (owner design 2026-07-27): a
// TEMPLATE (machines/forms/<name>.md) declares the fields; an INSTANCE in
// the expedition's record is the filled page. The check is a MECHANICAL
// LINT — required sections carry visible content, listed files exist,
// status is done. Quality is reviewed where the walk reviews, never here.
//
// THE PREFILL LAW: an HTML comment is INVISIBLE content. Agent prefills
// are written commented out and count as EMPTY until a human confirms
// each one (uncomment, or the mirror's confirm) — a form can never pass
// on unconfirmed prefills.
import { existsSync } from "node:fs";
import { join } from "node:path";
import { parseStateNote, section } from "./notes.ts";

export interface FormField {
  name: string;
  description: string;
  required: boolean;
}

export interface FormTemplate {
  form: string;
  /** The instance's filename inside the record (e.g. report.md). */
  instance: string;
  statement: string;
  fields: FormField[];
}

export function formTemplatePath(name: string): string {
  return `product/deliverable/machines/forms/${name}.md`;
}

/** Same line grammar as a state note's evidence form:
 *  "- name | description | required|optional" under "## Fields". */
export function parseFormTemplate(name: string, raw: string): FormTemplate {
  const note = parseStateNote(raw);
  const instance = typeof note.frontmatter.instance === "string" && note.frontmatter.instance !== "" ? note.frontmatter.instance : `${name}.md`;
  const text = section(note.body, "Fields");
  const fields = text
    .split("\n")
    .filter((l) => l.trim() !== "")
    .map((line) => {
      const m = line.trim().match(/^- (.+?) \| (.+?) \| (required|optional)$/);
      if (!m) throw new Error(`form template ${name}: malformed field line ${JSON.stringify(line.trim())} (want "- name | description | required|optional")`);
      return { name: m[1], description: m[2], required: m[3] === "required" };
    });
  if (fields.length === 0) throw new Error(`form template ${name}: no field lines under "## Fields"`);
  return { form: name, instance, statement: note.statement, fields };
}

export function stripComments(s: string): string {
  return s.replace(/<!--[\s\S]*?-->/g, "");
}

/** The comment blocks of a section — the per-prefill confirm list. */
export function prefills(sectionText: string): string[] {
  return [...sectionText.matchAll(/<!--([\s\S]*?)-->/g)].map((m) => m[1].trim());
}

export interface FieldState {
  name: string;
  description: string;
  required: boolean;
  /** Visible content — comments stripped, trimmed. */
  content: string;
  /** Unconfirmed (commented) prefill blocks, in order. */
  prefills: string[];
  filled: boolean;
}

export interface FormLint {
  met: boolean;
  status: string;
  problems: string[];
  fields: FieldState[];
  files: { name: string; present: boolean }[];
}

export function lintForm(t: FormTemplate, instanceRaw: string | undefined, evidenceDirAbs: string): FormLint {
  if (instanceRaw === undefined) {
    return {
      met: false,
      status: "missing",
      problems: [`no instance yet — create ${t.instance} from the ${t.form} template`],
      fields: t.fields.map((f) => ({ ...f, content: "", prefills: [], filled: false })),
      files: [],
    };
  }
  const note = parseStateNote(instanceRaw);
  const problems: string[] = [];
  const status = typeof note.frontmatter.status === "string" ? note.frontmatter.status : "draft";
  const fields: FieldState[] = t.fields.map((f) => {
    const raw = section(note.body, f.name);
    const content = stripComments(raw).trim();
    const pf = prefills(raw);
    const filled = content !== "";
    if (f.required && !filled) {
      problems.push(
        pf.length > 0
          ? `"${f.name}" holds only unconfirmed prefills — a human confirms each (uncomment), or real content is written`
          : `required section "${f.name}" is empty`,
      );
    }
    return { ...f, content, prefills: pf, filled };
  });
  const fileNames = Array.isArray(note.frontmatter.files) ? note.frontmatter.files.map(String) : [];
  const files = fileNames.map((name) => {
    const present = existsSync(join(evidenceDirAbs, name));
    if (!present) problems.push(`listed file missing from evidence/: ${name}`);
    return { name, present };
  });
  if (status !== "done") problems.push(`status is "${status}" — set status: done when the page stands`);
  return { met: problems.length === 0, status, problems, fields, files };
}

/** A fresh instance from the template — sections empty, ready to fill. */
export function scaffoldInstance(t: FormTemplate, title: string): string {
  return ["---", `form: ${t.form}`, "status: draft", "files:", "---", "", `# ${title}`, "", ...t.fields.flatMap((f) => [`## ${f.name}`, "", ""])].join("\n");
}

/** Replace one section's body. A missing section is appended. */
export function withFieldContent(instanceRaw: string, field: string, content: string): string {
  const lines = instanceRaw.split("\n");
  const start = lines.findIndex((l) => l.trim() === `## ${field}`);
  if (start === -1) return `${instanceRaw.replace(/\n*$/, "\n\n")}## ${field}\n\n${content}\n`;
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    if (lines[i].startsWith("## ")) {
      end = i;
      break;
    }
  }
  return [...lines.slice(0, start + 1), "", content, "", ...lines.slice(end)].join("\n");
}

/** Confirm ONE prefill: its comment markers fall away, the content stands.
 *  The index counts the section's comment blocks in order. */
export function confirmPrefill(instanceRaw: string, field: string, index: number): string {
  const lines = instanceRaw.split("\n");
  const start = lines.findIndex((l) => l.trim() === `## ${field}`);
  if (start === -1) return instanceRaw;
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    if (lines[i].startsWith("## ")) {
      end = i;
      break;
    }
  }
  let n = -1;
  const replaced = lines
    .slice(start + 1, end)
    .join("\n")
    .replace(/<!--([\s\S]*?)-->/g, (m, inner) => {
      n++;
      return n === index ? String(inner).trim() : m;
    });
  return [...lines.slice(0, start + 1), replaced, ...lines.slice(end)].join("\n");
}

/** Flip the frontmatter status; stamp whose hand finished. */
export function withStatus(instanceRaw: string, status: string, by: string): string {
  let out = instanceRaw.replace(/^status: .*$/m, `status: ${status}`);
  if (/^by: /m.test(out)) out = out.replace(/^by: .*$/m, `by: ${by}`);
  else out = out.replace(/^status: .*$/m, (m) => `${m}\nby: ${by}`);
  return out;
}
