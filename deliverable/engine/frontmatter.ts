// see dsp-trace-corpus.md#the-frontmatter-writer
import { parse, stringify } from "yaml";
import { CLAUSES, Rejection } from "./errors.ts";
import { stripBom } from "./jsonio.ts";

const SRC = "engine/frontmatter.ts";

// lineWidth 0 DISABLES FOLDING, and it is not a preference. The default wraps
// at 80 columns, which would reflow every long `statement` in the vault into a
// multi-line scalar the first time any unrelated key on that note was edited.
const PRINT = { lineWidth: 0 } as const;

export interface NoteSplit {
  /** The frontmatter's own text, fences excluded. Empty when there is none. */
  head: string;
  /**
   * Everything after the closing fence, INCLUDING the newline that ends the
   * fence line itself. Carrying that terminator here is what keeps a blank
   * line between `---` and the first heading — joining the remaining lines
   * without it silently eats one blank line from every note in the vault.
   */
  body: string;
  /** The note's own line ending, so a rewrite does not change every line. */
  eol: string;
  fenced: boolean;
}

/** A FRONTMATTER FENCE, AND IT SITS AT COLUMN ZERO.
 *
 *  BOTH SPLITTERS COMPARED TRIMMED LINES, so a `---` INSIDE a block scalar
 *  closed the frontmatter. The shortened block still parsed as YAML, so nothing
 *  refused and nothing reported: the node loaded with its long field silently
 *  cut, and a reprint would have written that cut back to disk.
 *
 *  MEASURED 2026-08-28. A work token carrying a horizontal rule in its statement
 *  read back at 794 characters where the file held 13,000. The write-time guard
 *  (SE-C-138) cannot see it, because a truncated block is valid YAML.
 *
 *  SWEPT BEFORE THE CHANGE: of 3,849 nodes carrying frontmatter, none closes on
 *  an indented fence, so tightening this breaks nothing that stands.
 *
 *  ONE HOME, TWO CALLERS. notes.ts reads this rule from here rather than
 *  keeping its own copy, which is how the two came to disagree in the first
 *  place. */
export function isFence(line: string): boolean {
  return /^---[ \t]*$/.test(line);
}

export function splitNote(raw: string): NoteSplit {
  const text = stripBom(raw);
  const eol = text.includes("\r\n") ? "\r\n" : "\n";
  const lines = text.split(/\r?\n/);
  if (lines[0] === undefined || !isFence(lines[0])) return { head: "", body: text, eol, fenced: false };
  const end = lines.findIndex((l, i) => i > 0 && isFence(l));
  if (end === -1) return { head: "", body: text, eol, fenced: false };
  const rest = lines.slice(end + 1);
  return {
    head: lines.slice(1, end).join(eol),
    body: rest.length === 0 ? "" : eol + rest.join(eol),
    fenced: true,
    eol,
  };
}

/** The frontmatter as data. A block that is not a mapping is a refusal. */
export function readKeys(raw: string, where: string): Record<string, unknown> {
  const { head, fenced } = splitNote(raw);
  if (!fenced || head.trim() === "") return {};
  let parsed: unknown;
  try {
    parsed = parse(head) as unknown;
  } catch (err) {
    throw new Rejection({
      clause: CLAUSES.REQUIRED_ARGS,
      expected: "frontmatter that parses as YAML",
      got: `${where} — ${String((err as Error).message).split("\n")[0]}`,
      remedy: { tool: "se_file_read", args: { path: where }, note: "fix the YAML by hand; a formatter cannot format what it cannot read" },
      source: SRC,
    });
  }
  if (parsed === null) return {};
  if (typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Rejection({
      clause: CLAUSES.REQUIRED_ARGS,
      expected: "frontmatter that is a mapping of keys to values",
      got: `${where} holds ${Array.isArray(parsed) ? "a list" : typeof parsed}`,
      remedy: { tool: "se_file_read", args: { path: where }, note: "frontmatter is key: value; a bare list has no key to edit" },
      source: SRC,
    });
  }
  return parsed as Record<string, unknown>;
}

/**
 * Apply a patch and reprint the whole block. A key set to `undefined` is
 * REMOVED — that is how a property is cleared, and it matches what emptying a
 * field does in Obsidian's own Properties panel.
 *
 * Key ORDER survives: yaml prints an object in its own key order, and parsing
 * gives them back in document order, so an edited key stays where the author
 * put it and a new one lands at the end.
 */
export function setKeys(raw: string, patch: Record<string, unknown>, where: string): string {
  const split = splitNote(raw);
  const data = readKeys(raw, where);
  for (const [k, v] of Object.entries(patch)) {
    if (v === undefined) delete data[k];
    else data[k] = v;
  }
  // An emptied block still keeps its fences: a note that had frontmatter and
  // silently lost it reads as a different KIND of file to every reader here.
  const printed = Object.keys(data).length === 0 ? "" : stringify(data, PRINT).replace(/\n+$/, "");
  const head = printed === "" ? "" : printed.split("\n").join(split.eol) + split.eol;
  const body = split.fenced ? split.body : split.body === "" ? "" : split.eol + split.body;
  return `---${split.eol}${head}---${body}`;
}

/** Reprint a note's frontmatter changing nothing — the format-on-save case. */
export function formatNote(raw: string, where: string): string {
  return setKeys(raw, {}, where);
}

const TRUE = ["true", "yes", "on"];
const FALSE = ["false", "no", "off"];

/**
 * What a line editor's text MEANS, given what the key held before.
 *
 * The previous value is the type, which is the same rule a Qt delegate
 * follows: the model says what kind of thing this is, the editor only says
 * what the person typed. With no previous value the answer is a STRING —
 * guessing a type from the shape of the text is how "1.0" becomes 1 and a
 * version number stops matching itself.
 */
export function coerce(previous: unknown, text: string): unknown {
  const t = text.trim();
  if (Array.isArray(previous)) {
    // The owner's own note grammar already accepts a comma-separated string
    // wherever a list is expected, so a comma is what a person will type.
    return t === ""
      ? []
      : t
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s !== "");
  }
  if (t === "") return undefined;
  if (typeof previous === "boolean") {
    if (TRUE.includes(t.toLowerCase())) return true;
    if (FALSE.includes(t.toLowerCase())) return false;
    throw new Rejection({
      clause: CLAUSES.REQUIRED_ARGS,
      expected: `a yes or no — one of ${[...TRUE, ...FALSE].join(", ")}`,
      got: text,
      remedy: {
        tool: "se_file_read",
        args: { path: "deliverable/engine/frontmatter.ts" },
        note: "the key held a boolean, so the editor may only write one",
      },
      source: SRC,
    });
  }
  if (typeof previous === "number") {
    const n = Number(t);
    if (Number.isNaN(n)) {
      throw new Rejection({
        clause: CLAUSES.REQUIRED_ARGS,
        expected: "a number",
        got: text,
        remedy: {
          tool: "se_file_read",
          args: { path: "deliverable/engine/frontmatter.ts" },
          note: "the key held a number, so the editor may only write one",
        },
        source: SRC,
      });
    }
    return n;
  }
  if (previous !== null && previous !== undefined && typeof previous === "object") {
    throw new Rejection({
      clause: CLAUSES.REQUIRED_ARGS,
      expected: "a key a line editor can write: a string, a number, a yes/no, or a list",
      got: `a nested block (${Object.keys(previous as object).join(", ")})`,
      remedy: {
        tool: "se_file_read",
        args: { path: "deliverable/engine/frontmatter.ts" },
        note: "a nested value needs its own editor; refusing beats flattening somebody's data",
      },
      source: SRC,
    });
  }
  return text.trim();
}

/** What kind of editor a value wants. The metadata decides, never the caller. */
export type CellKind = "text" | "number" | "boolean" | "list" | "nested";

export function kindOf(value: unknown): CellKind {
  if (Array.isArray(value)) return "list";
  if (typeof value === "boolean") return "boolean";
  if (typeof value === "number") return "number";
  if (value !== null && value !== undefined && typeof value === "object") return "nested";
  return "text";
}
