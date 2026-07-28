// The VOICE LINT — mechanical checks over PROSE, on demand (se_lint) and
// later swept by pruning. Catches FORM, never meaning. The rules' LOGIC
// lives here; the rules' PARAMETERS are DATA (owner ruling 2026-07-28,
// guidance/method/engineering.md): machines/lint/voice-lint.md — edit a
// threshold there and the next call uses it, no recompile, no reload.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseStateNote } from "./notes.ts";

export interface LintFinding {
  rule: string;
  line: number;
  excerpt: string;
  hint: string;
}

interface Cfg {
  long_sentence_words: number;
  wall_paragraph_lines: number;
  comma_chain_items: number;
  pyramid_paragraphs: number;
}

const DEFAULTS: Cfg = { long_sentence_words: 28, wall_paragraph_lines: 8, comma_chain_items: 3, pyramid_paragraphs: 5 };

export const LINT_CONFIG = "product/deliverable/machines/lint/voice-lint.md";

function loadCfg(root: string): Cfg {
  try {
    const fm = parseStateNote(readFileSync(join(root, ...LINT_CONFIG.split("/")), "utf8")).frontmatter;
    const num = (k: keyof Cfg): number => (typeof fm[k] === "number" && (fm[k] as number) > 0 ? (fm[k] as number) : DEFAULTS[k]);
    return { long_sentence_words: num("long_sentence_words"), wall_paragraph_lines: num("wall_paragraph_lines"), comma_chain_items: num("comma_chain_items"), pyramid_paragraphs: num("pyramid_paragraphs") };
  } catch {
    return { ...DEFAULTS };
  }
}

/** Lint prose text. Frontmatter and code fences are skipped; headings,
 *  list items, quotes and table rows count as structure, never as walls. */
export function lintProse(root: string, text: string): LintFinding[] {
  const cfg = loadCfg(root);
  const findings: LintFinding[] = [];
  const body = text.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "");
  const lines = body.split(/\r?\n/);
  let inCode = false;
  let runStart = -1;
  let run = 0;
  const flushWall = (): void => {
    if (run >= cfg.wall_paragraph_lines) {
      findings.push({ rule: "wall", line: runStart + 1, excerpt: lines[runStart].slice(0, 60), hint: `${run} unbroken lines — split into paragraphs, add small headings` });
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
    const isStructure = l.trim() === "" || /^#{1,6}\s/.test(l) || /^\s*[-*>|]/.test(l) || /^\s*\d+\.\s/.test(l);
    if (isStructure) {
      flushWall();
      return;
    }
    if (runStart < 0) runStart = i;
    run++;
    for (const s of l.split(/(?<=[.!?])\s+/)) {
      const words = s.trim().split(/\s+/).filter(Boolean).length;
      if (words > cfg.long_sentence_words) {
        findings.push({ rule: "long-sentence", line: i + 1, excerpt: s.slice(0, 60), hint: `${words} words — one thought per sentence, split it` });
      }
      if (s.split(/[,;]/).length > cfg.comma_chain_items) {
        findings.push({ rule: "comma-chain", line: i + 1, excerpt: s.slice(0, 60), hint: "chained items are an unrendered list — render a list" });
      }
    }
  });
  flushWall();
  const paragraphs = body.split(/\r?\n\s*\r?\n/).filter((p) => p.trim() !== "");
  const hasHeadings = lines.some((l) => /^#{1,6}\s/.test(l));
  if (paragraphs.length >= cfg.pyramid_paragraphs && !hasHeadings) {
    findings.push({ rule: "pyramid", line: 1, excerpt: paragraphs[0].slice(0, 60), hint: `${paragraphs.length} paragraphs without structure — TLDR on top, headings, detail last (methods/progressive-disclosure.md)` });
  }
  return findings;
}
