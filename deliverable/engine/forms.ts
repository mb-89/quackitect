// see dsp-evidence-forms.md#evidence-forms
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
  return `deliverable/machines/forms/${name}.md`;
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

/** see dsp-evidence-forms.md#a-heading-inside-a-field-stays-inside-the-field */
function demoteHeadings(content: string): string {
  let fenced = false;
  return content
    .split("\n")
    .map((l) => {
      if (/^\s*(```|~~~)/.test(l)) fenced = !fenced;
      return !fenced && /^#{1,2}\s/.test(l) ? `###${l.slice(l.indexOf(" "))}` : l;
    })
    .join("\n");
}

/** Replace one section's body. A missing section is appended. */
export function withFieldContent(instanceRaw: string, field: string, rawContent: string): string {
  const content = demoteHeadings(rawContent);
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

/** ONE SECTION'S BODY, exactly as it stands on disk — the mirror of
 *  withFieldContent, and what an amend's old/new patch matches against.
 *  undefined means the section is not there at all, which is a different
 *  answer from an empty one. */
export function fieldContent(instanceRaw: string, field: string): string | undefined {
  const lines = instanceRaw.split("\n");
  const start = lines.findIndex((l) => l.trim() === `## ${field}`);
  if (start === -1) return undefined;
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    if (lines[i].startsWith("## ")) {
      end = i;
      break;
    }
  }
  return lines
    .slice(start + 1, end)
    .join("\n")
    .trim();
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
  // see dsp-evidence-forms.md#no-space-is-demanded-after-the-colon
  let out = instanceRaw.replace(/^status:.*$/m, `status: ${status}`);
  if (/^by:/m.test(out)) out = out.replace(/^by:.*$/m, `by: ${by}`);
  else out = out.replace(/^status:.*$/m, (m) => `${m}\nby: ${by}`);
  return out;
}

/** Insert a frontmatter line after `status:` where one exists (named
 *  forms), else after `form:` (state forms carry no status). */
const afterAnchor = (instanceRaw: string, line: string): string => {
  // Whitespace-blind, like every other key here — see withStatus.
  if (/^status:/m.test(instanceRaw)) return instanceRaw.replace(/^status:.*$/m, (s) => `${s}\n${line}`);
  if (/^form:/m.test(instanceRaw)) return instanceRaw.replace(/^form:.*$/m, (s) => `${s}\n${line}`);
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
  return instanceRaw.replace(/^authors:.*$/m, () => `authors: ${list.join(", ")}`);
}

/** The sign-off stamp — the claim's date, shown in the headline. */
export function withSignedOff(instanceRaw: string, when: string): string {
  // Signing off IS the re-attestation, so it clears any suspect mark.
  const raw = stripSuspect(instanceRaw);
  // see dsp-evidence-forms.md#the-key-may-be-present-and-empty
  if (/^signed_off:/m.test(raw)) return raw.replace(/^signed_off:.*$/m, `signed_off: ${when}`);
  return afterAnchor(raw, `signed_off: ${when}`);
}

/** see dsp-evidence-forms.md#nothing-writes-a-suspect-mark-any-more */
export function stripSuspect(instanceRaw: string): string {
  return instanceRaw.replace(/^suspect:.*\n?/m, "");
}

/** The ticked inputs — one line like authors, replaced whole on each save. */
export function withChecked(instanceRaw: string, labels: string[]): string {
  const line = `checked: ${labels.join(", ")}`;
  if (/^checked:/m.test(instanceRaw)) return instanceRaw.replace(/^checked:.*$/m, () => line);
  return afterAnchor(instanceRaw, line);
}

/** Who pressed submit — one line beside the sign-off. */
export function withBy(instanceRaw: string, by: string): string {
  // Present-but-empty counts as present — see withSignedOff.
  if (/^by:/m.test(instanceRaw)) return instanceRaw.replace(/^by:.*$/m, () => `by: ${by}`);
  return instanceRaw.replace(/^form:.*$/m, (s) => `${s}\nby: ${by}`);
}

/** see dsp-evidence-forms.md#frontmatter-holds-one-line-per-key-so-a-value */
const oneLine = (s: string): string => s.replace(/\s+/g, " ").trim();

/** see dsp-evidence-forms.md#every-written-value-is-quoted */
const yamlValue = (s: string): string => `"${oneLine(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;

/** see dsp-evidence-forms.md#the-reopen-mark */
export function withReopened(instanceRaw: string, when: string, why: string): string {
  const line = `reopened: ${yamlValue(`${when} — ${why}`)}`;
  // The reason is somebody's prose, and prose is DATA. A string replacement
  // would read a dollar in it as an instruction — see files.ts applyExactOp.
  if (/^reopened:/m.test(instanceRaw)) return instanceRaw.replace(/^reopened:.*$/m, () => line);
  return afterAnchor(instanceRaw, line);
}

/** THE AMEND MARK — the claim stands, the text moved.
 *
 *  An amend is the small fix that must NOT reopen: a renamed reference, a
 *  moved path, a typo. The signature is untouched on purpose, because nothing
 *  it attested to has changed. Reopening for these would invalidate a whole
 *  tree to fix a spelling.
 *
 *  ONE LINE, REPLACED. The latest amend is what a reader of the file needs;
 *  every earlier one is in git, which is where file history already lives. */
export function withAmended(instanceRaw: string, when: string, by: string, why: string): string {
  const line = `amended: ${yamlValue(`${when} by ${by} — ${why}`)}`;
  if (/^amended:/m.test(instanceRaw)) return instanceRaw.replace(/^amended:.*$/m, () => line);
  return afterAnchor(instanceRaw, line);
}

/** Does a reopen stand against this claim? ISO timestamps compare as strings,
 *  so the answer is a string comparison and nothing is remembered. */
export function reopenedAfterSigning(fm: Record<string, unknown>): boolean {
  // The parser hands back the value already unquoted, so nothing here has to
  // undo what yamlValue did.
  const signed = typeof fm.signed_off === "string" ? fm.signed_off.trim() : "";
  const mark = typeof fm.reopened === "string" ? fm.reopened.trim() : "";
  if (mark === "") return false;
  const at = mark.split(" — ")[0].trim();
  // An unsigned claim cannot be re-opened past its signature; it is simply
  // unsigned, and the ordinary owed check already has it.
  return signed !== "" && at > signed;
}

/** see dsp-evidence-forms.md#a-key-owns-its-block */
function keyBlock(key: string): RegExp {
  const esc = key.replace(/[.*+?^{}()|[\]\\]/g, (c) => `\\${c}`);
  return new RegExp(`^${esc}:.*(?:\\n[ \\t]+\\S.*)*`, "m");
}

/** SET ONE FRONTMATTER KEY on any node, creating it if absent.
 *
 *  This is the write half of a bound field: the form's answer for a node
 *  lands here, on the node's own file, where the register keeps its truth.
 *  An empty value CLEARS the key rather than writing a blank line, so a
 *  cleared answer and a never-answered one read the same to every check. */
export function withFrontmatter(raw: string, key: string, value: string): string {
  const has = keyBlock(key);
  if (value.trim() === "") return raw.replace(new RegExp(`${has.source}\\n?`, "m"), "");
  const line = `${key}: ${yamlValue(value)}`;
  // A FUNCTION REPLACEMENT, NEVER A STRING. A value carrying a dollar sign
  // is data, and String.replace reads a dollar in the replacement as an
  // instruction — dollar-backtick alone splices the whole preceding text in.
  return has.test(raw) ? raw.replace(has, () => line) : afterAnchor(raw, line);
}

/** SET ONE FRONTMATTER KEY TO A BLOCK LIST.
 *
 *  A list field written as a comma-joined string reads back as ONE value, so
 *  every consumer that asked for items gets a sentence. The shape has to
 *  match what the item card declares, and for a list that is a block. */
export function withFrontmatterList(raw: string, key: string, values: string[]): string {
  if (values.length === 0) return withFrontmatter(raw, key, "");
  const block = `${key}:\n${values.map((v) => `  - ${yamlValue(v)}`).join("\n")}`;
  const has = keyBlock(key);
  return has.test(raw) ? raw.replace(has, () => block) : afterAnchor(raw, block);
}

/** A changed claim is no longer the submitted claim — the stamp comes off. */
export function stripSignedOff(instanceRaw: string): string {
  return instanceRaw.replace(/^signed_off:.*\n?/m, "").replace(/^by:.*\n?/m, "");
}

/** The gate's bless line — set, replaced, or removed whole. A save removes
 *  it: a changed claim is no longer the claim that was blessed. */
export function withBless(instanceRaw: string, line: string | undefined): string {
  const cleared = instanceRaw.replace(/^bless:.*\n?/m, "");
  if (line === undefined) return cleared;
  return afterAnchor(cleared, `bless: ${line}`);
}
