// The VOICE LINT — mechanical checks over PROSE, on demand (se_lint) and
// later swept by the overhaul. Catches FORM, never meaning. The rules' LOGIC
// lives here; the rules' PARAMETERS are DATA (owner ruling 2026-07-28,
// guidance/method/engineering.md): machines/lint/voice-lint.md — edit a
// threshold there and the next call uses it, no recompile, no reload.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseStateNote } from "./notes.ts";

/** A LIST MARKER IS NOT A SENTENCE (owner report 2026-08-08). "1." ends in a
 *  full stop, so an unguarded split counted a numbered item's own marker as a
 *  sentence. A three-sentence item measured four and fired. The same marker
 *  also has to make the line an ITEM: a numbered step is a list item exactly
 *  as a dashed one is, and only the dash was recognised. */
const MARKER = /^\s*(?:[-*+]|\d+[.)])\s+/;

const sentencesOf = (t: string): string[] =>
  t
    .replace(MARKER, "")
    .split(/(?<=[.!?])\s+/)
    .filter((x) => x.trim() !== "");

/** A PIPE ROW IS CELLS, NOT ONE STREAM OF SENTENCES (owner report 2026-08-08).
 *  A form field is written `- name | help | required`, and the trailing
 *  `required` was counted as a sentence of the help text. Every field line
 *  measured one sentence more than it had. Lint the LONGEST cell: on a field
 *  row that is the help, and on a table row it is the prose cell. */
const proseOf = (l: string): string => {
  const body = l.replace(MARKER, "");
  if (!body.includes("|")) return body;
  return body
    .split("|")
    .map((c) => c.trim())
    .reduce((a, b) => (b.length > a.length ? b : a), "");
};

/** THE FULL-STOP EVASION (owner ruling 2026-08-07).
 *
 *  The chain rules count separators INSIDE one sentence, so the way around
 *  them is a full stop. "Open it. Read it. Fill both cells." Three steps,
 *  three sentences, not one separator anywhere, and nothing fired.
 *
 *  That was the actual evasion, three times in one afternoon, each time after
 *  being told. A rule an author walks around by changing punctuation is an
 *  advisory, and an advisory is not a rule.
 *
 *  TWO SHAPES, one per surface:
 *
 *  - A PROSE LINE of several short sentences is a list nobody rendered.
 *    SHORT is the discriminator: ordinary prose runs long and varied, while a
 *    buried list runs short and parallel because each sentence is one item.
 *  - A LIST ITEM of several sentences is the same thing one level down.
 *    Rendering the list is half the discipline; one thought per item is the
 *    other half. Items were not linted at all before this. */
function buriedList(l: string, i: number, cfg: Cfg): LintFinding[] {
  const parts = sentencesOf(proseOf(l));
  const item = MARKER.test(l);
  if (item) {
    if (parts.length <= cfg.item_sentences) return [];
    return [
      {
        rule: "item-grew",
        line: i + 1,
        excerpt: l.trim().slice(0, 60),
        hint: `${parts.length} sentences in one item — split it, or nest a sub-list`,
      },
    ];
  }
  if (parts.length <= cfg.sentence_run_items) return [];
  if (!parts.every((x) => x.trim().split(/\s+/).filter(Boolean).length <= cfg.run_sentence_words)) return [];
  return [
    {
      rule: "sentence-run",
      line: i + 1,
      excerpt: l.trim().slice(0, 60),
      hint: `${parts.length} short sentences in one paragraph — render a list`,
    },
  ];
}

export interface LintFinding {
  rule: string;
  line: number;
  excerpt: string;
  hint: string;
  /** WHICH PROSE this is in: a frontmatter key, or "body". A person fixing
   *  `guidance` wants to be sent to that field, not to a line number in a file
   *  they then have to read to work out what they are looking at. */
  where?: string;
}

interface Cfg {
  long_sentence_words: number;
  wall_paragraph_lines: number;
  comma_chain_items: number;
  dash_chain_items: number;
  sentence_run_items: number;
  run_sentence_words: number;
  item_sentences: number;
  pyramid_paragraphs: number;
}

const DEFAULTS: Cfg = {
  long_sentence_words: 28,
  wall_paragraph_lines: 8,
  comma_chain_items: 3,
  dash_chain_items: 3,
  sentence_run_items: 3,
  run_sentence_words: 12,
  item_sentences: 2,
  pyramid_paragraphs: 5,
};

export const LINT_CONFIG = "project/deliverable/machines/lint/voice-lint.md";

/** REFERENCES ARE NOTES (owner ruling 2026-08-04). An external source is ONE
 *  note under this folder, and a claim anywhere else cites that note. Links
 *  spread through the prose are links nobody can keep from rotting. */
export const REFERENCE_HOME = "spec/references/";

function linkFinding(line: string, i: number): LintFinding | undefined {
  const link = line.match(/https?:\/\/[^\s)>\]"']+/);
  if (link === null) return undefined;
  return {
    rule: "external-link",
    line: i + 1,
    excerpt: link[0].slice(0, 60),
    hint: `an external link belongs in ${REFERENCE_HOME} — write a reference note and cite it`,
  };
}

function loadCfg(root: string): Cfg {
  try {
    const fm = parseStateNote(readFileSync(join(root, ...LINT_CONFIG.split("/")), "utf8")).frontmatter;
    const num = (k: keyof Cfg): number => (typeof fm[k] === "number" && (fm[k] as number) > 0 ? (fm[k] as number) : DEFAULTS[k]);
    return {
      long_sentence_words: num("long_sentence_words"),
      wall_paragraph_lines: num("wall_paragraph_lines"),
      comma_chain_items: num("comma_chain_items"),
      dash_chain_items: num("dash_chain_items"),
      sentence_run_items: num("sentence_run_items"),
      run_sentence_words: num("run_sentence_words"),
      item_sentences: num("item_sentences"),
      pyramid_paragraphs: num("pyramid_paragraphs"),
    };
  } catch {
    return { ...DEFAULTS };
  }
}

/** THE PROSE IN FRONTMATTER IS STILL PROSE (owner report 2026-08-08).
 *
 *  The lint used to drop the whole frontmatter block, which meant it never
 *  read a single `guidance:` or `description:` — the exact text a person sees
 *  in an evidence form. voice.md binds those in as many words: "Embedded prose
 *  fields follow the same rules. State guidance, tool descriptions, form help
 *  — short sentences, paragraphs, lists." The one surface the rule names was
 *  the one surface the rule could not see.
 *
 *  It surfaced when a six-line anchor list, written as prose inside a field's
 *  guidance, came back clean.
 *
 *  MASK, NEVER STRIP. The structural half of each line is blanked and the
 *  prose half stays where it is, so every finding keeps its real line number
 *  and a person can go straight to it.
 *
 *  A VALUE THAT IS NOT PROSE IS NOT LINTED. An id, a number, a boolean, a
 *  path, a single word — none of them is a sentence, and complaining about
 *  them would teach people to switch the lint off. */
function maskFrontmatter(text: string): { text: string; keyOf: string[] } {
  const lines = text.split(/\r?\n/);
  const keyOf: string[] = lines.map(() => "body");
  if (lines[0]?.trim() !== "---") return { text, keyOf };
  const end = lines.findIndex((l, i) => i > 0 && l.trim() === "---");
  if (end < 0) return { text, keyOf };
  const out = lines.slice();
  let blockIndent = -1;
  let blockKey = "body";
  for (let i = 1; i < end; i++) {
    const l = lines[i];
    const indent = l.length - l.trimStart().length;
    // Inside a block scalar the lines ARE the prose, at their own indent.
    if (blockIndent >= 0 && (l.trim() === "" || indent > blockIndent)) {
      keyOf[i] = blockKey;
      continue;
    }
    blockIndent = -1;
    const kv = /^(\s*)([A-Za-z_][\w-]*):\s?(.*)$/.exec(l);
    if (kv === null) {
      // A list item of ids or a stray line. Structure, and the list rules
      // already treat a leading dash as structure.
      out[i] = "";
      continue;
    }
    const value = kv[3].trim();
    if (value === "|" || value === ">" || value === "|-" || value === ">-") {
      blockIndent = kv[1].length;
      blockKey = kv[2];
      out[i] = "";
      continue;
    }
    // PROSE IS A SENTENCE, not a token and not a list of tokens.
    //
    // A LINT THAT CRIES WOLF GETS SWITCHED OFF. `legal_tools: se_file_read,
    // se_file_write, se_file_patch` is a YAML list written inline — it trips
    // the comma-chain rule and there is nothing to fix, because a list of tool
    // names is not an unrendered sentence. Same for a citation with a
    // semicolon in it.
    //
    // A ONE-LINE FIELD IS NOT EXEMPT (owner ruling 2026-08-08). A `statement`
    // that trips the chain rule is a statement carrying too much, and the fix
    // is TWO SHORT SENTENCES rather than an exemption — the readers are not
    // native English speakers, and a nested one-liner is the hardest thing to
    // read there is. An exemption here would have made the lint agree with the
    // text instead of the text agree with the rule.
    const words = value.replace(/^["']|["']$/g, "").trim();
    const parts = words
      .split(/[,;]/)
      .map((p) => p.trim())
      .filter((p) => p !== "");
    const allTokens = parts.length > 1 && parts.every((p) => /^[\w./@-]+$/.test(p));
    const isProse = words.split(/\s+/).length > 1 && !/^[\w./-]+$/.test(words) && !allTokens;
    out[i] = isProse ? " ".repeat(kv[1].length + kv[2].length + 2) + words : "";
    if (isProse) keyOf[i] = kv[2];
  }
  out[0] = "";
  if (end >= 0) out[end] = "";
  return { text: out.join("\n"), keyOf };
}

/** Lint prose text. Code fences are skipped; headings, list items, quotes and
 *  table rows count as structure, never as walls. Frontmatter is MASKED rather
 *  than stripped, so its guidance and descriptions are linted in place.
 *
 *  Pass `rel` where the text HAS a home: the external-link rule needs to
 *  know whether it is reading a reference note. Text with no path is text
 *  with no home, and the rule stays quiet. */
export function lintProse(root: string, text: string, rel?: string): LintFinding[] {
  const cfg = loadCfg(root);
  const findings: LintFinding[] = [];
  const linksAllowed = rel === undefined || rel.replace(/\\/g, "/").includes(REFERENCE_HOME);
  const masked = maskFrontmatter(text);
  const lines = masked.text.split(/\r?\n/);
  // EVERY FINDING SAYS WHICH PROSE IT IS IN. A person fixing `guidance` wants
  // to be sent to that field, not to a line number in a file they then have to
  // read to find out what they are looking at.
  const tag = (f: LintFinding): LintFinding => ({ ...f, where: masked.keyOf[f.line - 1] ?? "body" });
  let inCode = false;
  let runStart = -1;
  let run = 0;
  const flushWall = (): void => {
    if (run >= cfg.wall_paragraph_lines) {
      findings.push({
        rule: "wall",
        line: runStart + 1,
        excerpt: lines[runStart].slice(0, 60),
        hint: `${run} unbroken lines — split into paragraphs, add small headings`,
      });
    }
    run = 0;
    runStart = -1;
  };
  lines.forEach((l, i) => {
    if (/^```/.test(l)) {
      inCode = !inCode;
      flushWall();
      return;
    }
    if (inCode) return;
    if (!linksAllowed) {
      const link = linkFinding(l, i);
      if (link !== undefined) findings.push(link);
    }
    const isStructure = l.trim() === "" || /^#{1,6}\s/.test(l) || /^\s*[-*>|]/.test(l) || /^\s*\d+\.\s/.test(l);
    if (isStructure) {
      flushWall();
      findings.push(...buriedList(l, i, cfg));
      return;
    }
    findings.push(...buriedList(l, i, cfg));
    if (runStart < 0) runStart = i;
    run++;
    for (const s of l.split(/(?<=[.!?])\s+/)) {
      const words = s.trim().split(/\s+/).filter(Boolean).length;
      if (words > cfg.long_sentence_words) {
        findings.push({
          rule: "long-sentence",
          line: i + 1,
          excerpt: s.slice(0, 60),
          hint: `${words} words — one thought per sentence, split it`,
        });
      }
      // A SET OF LITERALS IS NOT AN UNRENDERED LIST. Naming the shapes a
      // canvas accepts (`pill`, `diamond`) or quoting example statements is
      // reference, not prose — nobody wants `pill` on its own bullet. A part
      // that is ENTIRELY a code span or a quoted string does not count.
      // Bare words still do: "alpha, beta, gamma, delta and epsilon" is the
      // list this rule exists to catch.
      const isLiteral = (part: string): boolean =>
        /^`[^`]*`$/.test(part.trim()) || /^"[^"]*"$/.test(part.trim()) || /^'[^']*'$/.test(part.trim());
      // EVERY SEPARATOR, not the two somebody thought of first. The rule was
      // commas and semicolons, so writing the same buried list with middots
      // or slashes walked straight past it (owner, 2026-08-07).
      //
      // A SPAN IS ONE THING, WHATEVER IS INSIDE IT (owner report 2026-08-08).
      // Adding the slash meant `project/spec/trace/raid/` split into five
      // "items", so every card saying where its node lives fired the chain
      // rule on a path. The literal test could not save them: it runs AFTER
      // the split, and by then the span is in pieces. Mask each span to one
      // token first, and the test does what it was written to do.
      const masked = s.replace(/`[^`]*`/g, "`x`").replace(/"[^"]*"/g, '"x"');
      const items = masked.split(/[,;·•/]|\s→\s/).filter((part) => part.trim() !== "" && !isLiteral(part));
      if (items.length > cfg.comma_chain_items) {
        findings.push({
          rule: "comma-chain",
          line: i + 1,
          excerpt: s.slice(0, 60),
          hint: "chained items are an unrendered list — render a list",
        });
      }
      // DASH CHAINS, not dashes. A single dash sets off an aside and is
      // house style; a sentence hinged on several is a run-on wearing
      // punctuation. Flagging every dash would be noise, and an advisory
      // nobody heeds gets deleted rather than obeyed.
      if (s.split(/\s[—–-]\s/).length > cfg.dash_chain_items) {
        findings.push({
          rule: "dash-chain",
          line: i + 1,
          excerpt: s.slice(0, 60),
          hint: "clauses hinged on several dashes — write separate sentences",
        });
      }
    }
  });
  flushWall();
  const paragraphs = lines
    .join("\n")
    .split(/\n\s*\n/)
    .filter((p: string) => p.trim() !== "");
  const hasHeadings = lines.some((l) => /^#{1,6}\s/.test(l));
  if (paragraphs.length >= cfg.pyramid_paragraphs && !hasHeadings) {
    findings.push({
      rule: "pyramid",
      line: 1,
      excerpt: paragraphs[0].slice(0, 60),
      hint: `${paragraphs.length} paragraphs without structure — TLDR on top, headings, detail last (methods/progressive-disclosure.md)`,
    });
  }
  return findings.map(tag);
}
