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
  /** The how-to for whoever fills it — shown in every render of the field. */
  guidance?: string;
}

export interface FormTemplate {
  form: string;
  /** The instance's filename inside the record (e.g. report.md). */
  instance: string;
  statement: string;
  fields: FormField[];
}

export function formTemplatePath(name: string): string {
  return `project/deliverable/machines/forms/${name}.md`;
}

/** Same line grammar as a state note's evidence form:
 *  "- name | description | required|optional" under "## Fields". */
export function parseFormTemplate(name: string, raw: string): FormTemplate {
  const note = parseStateNote(raw);
  const instance =
    typeof note.frontmatter.instance === "string" && note.frontmatter.instance !== "" ? note.frontmatter.instance : `${name}.md`;
  const text = section(note.body, "Fields");
  const fields = text
    .split("\n")
    .filter((l) => l.trim() !== "")
    .map((line) => {
      const m = line.trim().match(/^- (.+?) \| (.+?) \| (required|optional)$/);
      if (!m)
        throw new Error(
          `form template ${name}: malformed field line ${JSON.stringify(line.trim())} (want "- name | description | required|optional")`,
        );
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
      problems: [],
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
  return [
    "---",
    `form: ${t.form}`,
    "status: draft",
    "files:",
    "---",
    "",
    `# ${title}`,
    "",
    ...t.fields.flatMap((f) => [`## ${f.name}`, "", ""]),
  ].join("\n");
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

/** Insert a frontmatter line after `status:` where one exists (named
 *  forms), else after `form:` (state forms carry no status). */
const afterAnchor = (instanceRaw: string, line: string): string => {
  if (/^status: .*$/m.test(instanceRaw)) return instanceRaw.replace(/^status: .*$/m, (s) => `${s}\n${line}`);
  if (/^form: .*$/m.test(instanceRaw)) return instanceRaw.replace(/^form: .*$/m, (s) => `${s}\n${line}`);
  // NEITHER ANCHOR: the stamp used to VANISH, silently, which is the worst of
  // the three outcomes — the caller believes it stamped and the file says
  // otherwise. The head of the frontmatter is a fine second choice.
  if (/^---\r?\n/.test(instanceRaw)) return instanceRaw.replace(/^---\r?\n/, (s) => `${s}${line}\n`);
  return `---\n${line}\n---\n\n${instanceRaw}`;
};

/** The claim's names: whoever writes joins `authors:`, once. */
export function withAuthor(instanceRaw: string, author: string): string {
  if (author === "") return instanceRaw;
  const m = instanceRaw.match(/^authors:(.*)$/m);
  if (m === null) return afterAnchor(instanceRaw, `authors: ${author}`);
  const list = m[1]
    .split(",")
    .map((x) => x.trim())
    .filter((x) => x !== "");
  if (list.includes(author)) return instanceRaw;
  list.push(author);
  return instanceRaw.replace(/^authors:.*$/m, `authors: ${list.join(", ")}`);
}

/** The sign-off stamp — the claim's date, shown in the headline. */
export function withSignedOff(instanceRaw: string, when: string): string {
  // Signing off IS the re-attestation, so it clears any suspect mark.
  const raw = stripSuspect(instanceRaw);
  if (/^signed_off: /m.test(raw)) return raw.replace(/^signed_off: .*$/m, `signed_off: ${when}`);
  return afterAnchor(raw, `signed_off: ${when}`);
}

/** SUSPECT — v1's design, and the one this project already settled on: when an
 *  input changes under a finished claim, the claim is MARKED, not undone.
 *
 *  Suspect means re-look, then re-approve. The content stays, the authorship
 *  stays, and the reason it fell is written down so the next reader knows what
 *  moved without going hunting.
 *
 *  Tearing the claim back to nothing reads as the tool undoing your work, and
 *  it makes re-earning cost as much as starting over. */
export function withSuspect(instanceRaw: string, why: string): string {
  const cleared = stripSuspect(stripSignedOff(instanceRaw)).replace(/^bless:.*\n?/m, "");
  return afterAnchor(cleared, `suspect: ${why}`);
}

export function stripSuspect(instanceRaw: string): string {
  return instanceRaw.replace(/^suspect:.*\n?/m, "");
}

/** The ticked inputs — one line like authors, replaced whole on each save. */
export function withChecked(instanceRaw: string, labels: string[]): string {
  const line = `checked: ${labels.join(", ")}`;
  if (/^checked:/m.test(instanceRaw)) return instanceRaw.replace(/^checked:.*$/m, line);
  return afterAnchor(instanceRaw, line);
}

/** Who pressed submit — one line beside the sign-off. */
export function withBy(instanceRaw: string, by: string): string {
  if (/^by: /m.test(instanceRaw)) return instanceRaw.replace(/^by: .*$/m, `by: ${by}`);
  return instanceRaw.replace(/^form: .*$/m, (s) => `${s}\nby: ${by}`);
}

/** A changed claim is no longer the submitted claim — the stamp comes off. */
export function stripSignedOff(instanceRaw: string): string {
  return instanceRaw.replace(/^signed_off: .*\n?/m, "").replace(/^by: .*\n?/m, "");
}

/** The gate's bless line — set, replaced, or removed whole. A save removes
 *  it: a changed claim is no longer the claim that was blessed. */
export function withBless(instanceRaw: string, line: string | undefined): string {
  const cleared = instanceRaw.replace(/^bless:.*\n?/m, "");
  if (line === undefined) return cleared;
  return afterAnchor(cleared, `bless: ${line}`);
}
