// se.file.move — move or rename a file and fix every reference in one
// atomic pass. Content references live in three forms:
//   - root-relative paths   (frontmatter read: lists, engine-facing text)
//   - vault-relative paths  (canvas file: refs; the vault root is project/)
//   - wiki links            ([[vault-path-no-extension]] and [[...|label]])
// PROSE files take all three. SOURCE files take the root-relative form only:
// the other two are markdown conventions, and a bare vault-relative substring
// would hit unrelated identifiers in code.
// The whitelist cannot cover every language, so whatever it misses is
// REPORTED rather than passed over — an empty `rewritten` must never be the
// only thing distinguishing "no references" from "references left dangling".
// Nothing is written unless the move itself succeeds.
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { CLAUSES, Rejection } from "./errors.ts";
import { guardRawNul, invalidateContentCache } from "./files.ts";
import { isExcluded, resolveInRoot } from "./paths.ts";

const SRC = "engine/move.ts";

const PROSE_FORMATS = [".md", ".canvas"];
const SOURCE_FORMATS = [".ts", ".ps1", ".json"];

/** How many residual hits travel back before the report starts counting only. */
const RESIDUAL_REPORT_LIMIT = 50;

const NUL = String.fromCharCode(0);

interface RefPair {
  old: string;
  new: string;
  /** vault-relative and wiki forms mean nothing outside markdown. */
  prose_only: boolean;
}

function refPairs(fromRel: string, toRel: string): RefPair[] {
  const pairs: RefPair[] = [{ old: fromRel, new: toRel, prose_only: false }];
  if (fromRel.startsWith("project/") && toRel.startsWith("project/")) {
    const oldVault = fromRel.slice("project/".length);
    const newVault = toRel.slice("project/".length);
    pairs.push({ old: oldVault, new: newVault, prose_only: true });
    if (oldVault.endsWith(".md") && newVault.endsWith(".md")) {
      pairs.push({ old: `[[${oldVault.slice(0, -3)}`, new: `[[${newVault.slice(0, -3)}`, prose_only: true });
    }
  }
  // LONGEST first, so a root-relative hit is never half-eaten by its
  // vault-relative substring.
  return pairs.sort((a, b) => b.old.length - a.old.length);
}

function endsWithAny(name: string, exts: string[]): boolean {
  return exts.some((e) => name.endsWith(e));
}

/**
 * Occurrences of `fromRel` that are NOT part of an occurrence of `toRel`.
 * The exclusion is what makes this usable at all: a move into a subdirectory
 * leaves the old path as a literal substring of every path it just rewrote.
 *
 * Only the ROOT-RELATIVE form is swept. The vault-relative and wiki forms are
 * markdown conventions, already rewritten wherever they are meaningful, and
 * bare enough that sweeping them elsewhere would report coincidences.
 */
function residualHits(content: string, fromRel: string, toRel: string): { line: number; text: string }[] {
  const out: { line: number; text: string }[] = [];
  const lines = content.split("\n");
  for (let l = 0; l < lines.length; l++) {
    const line = lines[l];
    if (!line.includes(fromRel)) continue;
    const covered: [number, number][] = [];
    for (let i = line.indexOf(toRel); i !== -1; i = line.indexOf(toRel, i + 1)) covered.push([i, i + toRel.length]);
    for (let i = line.indexOf(fromRel); i !== -1; i = line.indexOf(fromRel, i + 1)) {
      const end = i + fromRel.length;
      if (covered.some(([s, e]) => i >= s && end <= e)) continue;
      // A longer name that merely ends with the old one is a different file.
      if (i > 0 && /[A-Za-z0-9_.-]/.test(line[i - 1])) continue;
      if (end < line.length && /[A-Za-z0-9]/.test(line[end])) continue;
      out.push({ line: l + 1, text: line.trim().slice(0, 200) });
      break;
    }
  }
  return out;
}

export interface MoveResult {
  moved: { from: string; to: string };
  rewritten: { path: string; replacements: number }[];
  /** References the whitelist could not rewrite. Work the caller still owes. */
  unrewritten: { path: string; line: number; text: string }[];
  unrewritten_total: number;
  /** Files the sweep repaired on its way through, named so nothing is silent. */
  corrected?: string[];
}

export function fileMove(root: string, from: string, to: string): MoveResult {
  const absFrom = resolveInRoot(root, from, SRC);
  const absTo = resolveInRoot(root, to, SRC);
  if (!existsSync(absFrom)) {
    throw new Rejection({
      clause: CLAUSES.PATH_ESCAPE,
      expected: "an existing file to move",
      got: `${from} (not found)`,
      remedy: { tool: "se_file_list", args: { dir: "." } },
      source: SRC,
    });
  }
  if (existsSync(absTo)) {
    throw new Rejection({
      clause: CLAUSES.CAS_MISMATCH,
      expected: `a free destination`,
      got: `${to} already exists — no silent overwrite`,
      remedy: { tool: "se_file_read", args: { path: to }, note: "read what is there; delete it deliberately if it must go" },
      source: SRC,
    });
  }
  const fromRel = relative(root, absFrom).split(sep).join("/");
  const toRel = relative(root, absTo).split(sep).join("/");
  mkdirSync(dirname(absTo), { recursive: true });
  renameSync(absFrom, absTo);
  invalidateContentCache(absFrom);
  invalidateContentCache(absTo);

  const pairs = refPairs(fromRel, toRel);
  const sourcePairs = pairs.filter((p) => !p.prose_only);

  const rewritten: MoveResult["rewritten"] = [];
  const unrewritten: MoveResult["unrewritten"] = [];
  const corrected: string[] = [];
  let unrewrittenTotal = 0;

  const applyPairs = (content: string, ps: typeof pairs): { after: string; count: number } => {
    let after = content;
    let count = 0;
    for (const p of ps) {
      const parts = after.split(p.old);
      count += parts.length - 1;
      after = parts.join(p.new);
    }
    return { after, count };
  };

  const sweepFile = (abs: string, rel: string, name: string): void => {
    const prose = endsWithAny(name, PROSE_FORMATS);
    const source = endsWithAny(name, SOURCE_FORMATS);
    let content: string;
    try {
      content = readFileSync(abs, "utf8");
    } catch {
      return;
    }
    // A raw NUL used to end the sweep for this file in silence: its
    // references stayed dangling and the report never said so.
    if (content.includes(NUL)) {
      const fixed = guardRawNul(rel, content, false);
      if (fixed.corrected === undefined) return;
      writeFileSync(abs, fixed.content, "utf8");
      invalidateContentCache(abs);
      corrected.push(fixed.corrected);
      content = fixed.content;
    }

    if (prose || source) {
      const r = applyPairs(content, prose ? pairs : sourcePairs);
      if (r.count > 0 && r.after !== content) {
        writeFileSync(abs, r.after, "utf8");
        invalidateContentCache(abs);
        rewritten.push({ path: rel, replacements: r.count });
        content = r.after;
      }
    }

    // Every file is swept, whitelisted or not. What the pass could not
    // reach is the whole point of the report.
    const hits = residualHits(content, fromRel, toRel);
    unrewrittenTotal += hits.length;
    for (const h of hits) {
      if (unrewritten.length < RESIDUAL_REPORT_LIMIT) unrewritten.push({ path: rel, line: h.line, text: h.text });
    }
  };

  const walk = (dir: string): void => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const abs = join(dir, e.name);
      // isExcluded splits on the OS separator; the report wants forward slashes.
      const relOs = relative(root, abs);
      if (isExcluded(relOs)) continue;
      if (e.isDirectory()) {
        walk(abs);
        continue;
      }
      sweepFile(abs, relOs.split(sep).join("/"), e.name);
    }
  };
  walk(root);
  rewritten.sort((a, b) => a.path.localeCompare(b.path));
  unrewritten.sort((a, b) => a.path.localeCompare(b.path) || a.line - b.line);
  return {
    moved: { from: fromRel, to: toRel },
    rewritten,
    unrewritten,
    unrewritten_total: unrewrittenTotal,
    ...(corrected.length > 0 ? { corrected } : {}),
  };
}
