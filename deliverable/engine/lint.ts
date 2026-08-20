// see dsp-quality-toolchain.md#the-voice-lint
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseStateNote } from "./notes.ts";

/** see dsp-quality-toolchain.md#a-list-marker-is-not-a-sentence */
const MARKER = /^\s*(?:[-*+]|\d+[.)])\s+/;

const sentencesOf = (t: string): string[] =>
  t
    .replace(MARKER, "")
    .split(/(?<=[.!?])\s+/)
    .filter((x) => x.trim() !== "");

/** see dsp-quality-toolchain.md#a-pipe-row-is-cells */
const proseOf = (l: string): string => {
  const body = l.replace(MARKER, "");
  if (!body.includes("|")) return body;
  return body
    .split("|")
    .map((c) => c.trim())
    .reduce((a, b) => (b.length > a.length ? b : a), "");
};

/** see dsp-quality-toolchain.md#the-full-stop-evasion */
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
  comma_chain_min_item_words: number;
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
  comma_chain_min_item_words: 2,
  dash_chain_items: 3,
  sentence_run_items: 3,
  run_sentence_words: 12,
  item_sentences: 2,
  pyramid_paragraphs: 5,
};

export const LINT_CONFIG = "deliverable/machines/lint/voice-lint.md";

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
      comma_chain_min_item_words: num("comma_chain_min_item_words"),
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

/** see dsp-quality-toolchain.md#prose-in-frontmatter-is-still-prose */
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
    // see dsp-quality-toolchain.md#a-lint-that-cries-wolf-gets-switched-off
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
      // see dsp-resolution-seam.md#every-separator-not-the-two-somebody-thought-of-first
      const masked = s.replace(/`[^`]*`/g, "`x`").replace(/"[^"]*"/g, '"x"');
      const items = masked.split(/[,;·•/]|\s→\s/).filter((part) => part.trim() !== "" && !isLiteral(part));
      // see dsp-resolution-seam.md#a-part-must-carry-substance-to-count
      const weighty = items.filter((part) => part.trim().split(/\s+/).length >= cfg.comma_chain_min_item_words);
      if (weighty.length > cfg.comma_chain_items) {
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

/** WHICH VOICE RULES REFUSE A SUBMIT, read from the config card.
 *
 *  The lint runs at every form submit. What it DOES with a finding is the
 *  card's decision rather than this engine's, which is the same rule the
 *  thresholds already follow: the logic lives here, the parameters are data.
 *
 *  A rule named in `blocking:` refuses. Everything else is reported beside
 *  the form and lets the submit through.
 *
 *  THE DEFAULT IS `wall` ALONE, because it is already law elsewhere: SE-C-125
 *  refuses a wall of prose at the lane, and no renderer can invent the
 *  paragraphs an author did not write. Naming it here makes one rule behave
 *  the same way in both places.
 *
 *  AN UNREADABLE CARD BLOCKS NOTHING. A missing file must not silently start
 *  refusing every submit in the product. */
export function blockingRules(root: string): string[] {
  let text: string;
  try {
    text = readFileSync(join(root, ...LINT_CONFIG.split("/")), "utf8");
  } catch {
    return [];
  }
  const lines = text.split(/\r?\n/);
  const end = lines.indexOf("---", 1);
  const front = lines.slice(0, end < 0 ? lines.length : end);
  const at = front.findIndex((l) => l.trim() === "blocking:");
  if (at < 0) return [];
  const out: string[] = [];
  for (const l of front.slice(at + 1)) {
    const m = /^\s+-\s+(\S+)\s*$/.exec(l);
    if (m === null) break;
    out.push(m[1]);
  }
  return out;
}
