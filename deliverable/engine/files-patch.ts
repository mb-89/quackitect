// THE PATCH OPS: the ways a write can name WHERE it goes without resending
// the file — regex, edge, range and exact, each with its own guard, applied
// against a staged copy.
//
// Split out of files.ts.
//
// see dsp-file-lane.md#a-patch-names-where-it-goes
import { readFileSync } from "node:fs";
import { CLAUSES, Rejection } from "./errors.ts";
import { guardRawNul, guardWriteContent, lintAfterWrite, mustExist, type PatchOp, type PatchResult, SRC } from "./files.ts";
import { contentHash } from "./hash.ts";
import { writeNode } from "./notes.ts";
import { resolveInRoot } from "./paths.ts";

// One patch call, several verbs. Which verb an op is, read from its fields —
// exactly one of these shapes, anything mixed or partial refused BY NAME:
//   exact:   old_string + new_string          (the original verb)
//   regex:   pattern + replacement            (sed, kept inside the lane)
//   append:  append: true + new_string        (harvested: 285 Set-/Add-Content
//   prepend: prepend: true + new_string        shell writes did this job)
//   range:   at: {from_line, to_line} + new_string + base_hash
type OpKind = "exact" | "regex" | "append" | "prepend" | "range";

function opKind(op: PatchOp, i: number, n: number): OpKind {
  const marks: OpKind[] = [];
  if (op.old_string !== undefined) marks.push("exact");
  if (op.pattern !== undefined) marks.push("regex");
  if (op.append === true) marks.push("append");
  if (op.prepend === true) marks.push("prepend");
  if (op.at !== undefined) marks.push("range");
  if (marks.length === 1) return marks[0];
  throw new Rejection({
    clause: CLAUSES.REQUIRED_ARGS,
    expected:
      "ONE verb per op: old_string+new_string | pattern+replacement | append+new_string | prepend+new_string | at+new_string+base_hash",
    got: marks.length === 0 ? `op ${i + 1}/${n} names no verb` : `op ${i + 1}/${n} mixes ${marks.join(" and ")} — nothing was written`,
    remedy: {
      tool: "se_file_patch",
      args: { ops: [{ path: "<path>", old_string: "<exact text>", new_string: "<replacement>" }] },
      note: "split it into one op per verb",
    },
    source: SRC,
  });
}

/** The file's own line-ending convention — what every verb writes in. */
function eolOf(s: string): "\r\n" | "\n" {
  return s.includes("\r\n") ? "\r\n" : "\n";
}
function toEol(s: string, eol: string): string {
  return s.replace(/\r\n/g, "\n").replace(/\n/g, eol);
}

/** Regex flags are a SUBSET on purpose: i, m, s. g is implied (a substitution
 *  that silently stops at the first hit is the sed trap this op exists to
 *  avoid); anything else is refused rather than passed through blind. */
function opRegExp(op: PatchOp, i: number, n: number): RegExp {
  const flags = op.flags ?? "";
  const bad = [...flags].filter((f) => !"ims".includes(f));
  if (bad.length > 0) {
    throw new Rejection({
      clause: CLAUSES.REQUIRED_ARGS,
      expected: "flags from: i (ignore case), m (multiline anchors), s (dot matches newline) — g is always on",
      got: `flag(s) ${bad.join(", ")} (op ${i + 1}/${n})`,
      remedy: { tool: "se_file_patch", args: { ops: [{ path: op.path, pattern: op.pattern, replacement: op.replacement, flags: "im" }] } },
      source: SRC,
    });
  }
  try {
    return new RegExp(op.pattern as string, `g${flags}`);
  } catch (e) {
    throw new Rejection({
      clause: CLAUSES.REQUIRED_ARGS,
      expected: "a pattern that compiles as a JS regex",
      got: `${String((e as Error).message)} (op ${i + 1}/${n})`,
      remedy: { tool: "se_file_patch", args: { ops: [{ path: op.path, pattern: "<fixed pattern>", replacement: op.replacement }] } },
      source: SRC,
    });
  }
}

interface OpWork {
  op: PatchOp;
  i: number;
  n: number;
  current: string;
  eol: string;
  corrected: string[];
}

function requireOpFields(kind: OpKind, op: PatchOp, i: number, n: number): void {
  const needs: Record<OpKind, [keyof PatchOp, string][]> = {
    exact: [["new_string", "the replacement text"]],
    regex: [["replacement", "the substitution text ($1 backrefs work)"]],
    append: [["new_string", "the text to append"]],
    prepend: [["new_string", "the text to prepend"]],
    range: [
      ["new_string", "the replacement lines"],
      ["base_hash", "the hash from se_file_read — a line number only means something against the version you read"],
    ],
  };
  for (const [field, why] of needs[kind]) {
    if (op[field] === undefined) {
      throw new Rejection({
        clause: CLAUSES.REQUIRED_ARGS,
        expected: `${field} on a ${kind} op — ${why}`,
        got: `op ${i + 1}/${n} without it — nothing was written`,
        remedy: { tool: "se_file_patch", args: { ops: [{ path: op.path, [field]: "<value>" }] } },
        source: SRC,
      });
    }
  }
}

function guardCas(op: PatchOp, raw: string, alreadyStaged: boolean, i: number, n: number): void {
  if (op.base_hash === undefined || alreadyStaged) return;
  const disk = contentHash(raw);
  if (disk !== op.base_hash) {
    throw new Rejection({
      clause: CLAUSES.CAS_MISMATCH,
      expected: `base_hash ${disk} for ${op.path}`,
      got: `${op.base_hash} (op ${i + 1}/${n}) — nothing was written`,
      remedy: { tool: "se_file_read", args: { path: op.path } },
      source: SRC,
    });
  }
}

function applyRegexOp(w: OpWork): { next: string; replacements: number } {
  const rx = opRegExp(w.op, w.i, w.n);
  const count = [...w.current.matchAll(rx)].length;
  if (count === 0 || (w.op.expect_count !== undefined && count !== w.op.expect_count)) {
    throw new Rejection({
      clause: CLAUSES.PATCH_AMBIGUOUS,
      expected:
        w.op.expect_count !== undefined
          ? `pattern to match exactly ${w.op.expect_count} time(s) in ${w.op.path}`
          : `pattern to match in ${w.op.path}`,
      got: `${count} matches (op ${w.i + 1}/${w.n}) — nothing was written`,
      remedy: {
        tool: "se_file_search",
        args: { query: w.op.pattern, path: w.op.path },
        note: "see what the pattern really hits, then patch again",
      },
      source: SRC,
    });
  }
  return { next: w.current.replace(rx, w.op.replacement as string), replacements: count };
}

// The joined text arrives in the FILE's line endings, and the seam gets
// exactly one newline — both corrected mechanically and both NAMED,
// because these two fumbles are why appends went through the shell.
function applyEdgeOp(kind: "append" | "prepend", w: OpWork): { next: string; replacements: number } {
  const piece = toEol(w.op.new_string as string, w.eol);
  let next: string;
  if (kind === "append") {
    const seam = w.current === "" || w.current.endsWith("\n") || piece.startsWith("\n") ? "" : w.eol;
    if (seam !== "") w.corrected.push(`op ${w.i + 1}: a newline was added between the file's last line and the appended text`);
    next = w.current + seam + piece;
  } else {
    const seam = piece === "" || piece.endsWith("\n") || w.current.startsWith("\n") || w.current === "" ? "" : w.eol;
    if (seam !== "") w.corrected.push(`op ${w.i + 1}: a newline was added between the prepended text and the file's first line`);
    next = piece + seam + w.current;
  }
  if (w.eol === "\r\n" && (w.op.new_string as string) !== piece)
    w.corrected.push(`op ${w.i + 1}: the text was converted to CRLF — this file's convention`);
  return { next, replacements: 1 };
}

// Lines are counted the way the READER numbers them — split on \n,
// whatever each line's ending. Splitting on the file's dominant EOL
// let one stray CRLF in an LF file collapse the count to 2, and the
// refusal then described a file that does not exist.
function applyRangeOp(w: OpWork): { next: string; replacements: number } {
  const lines = w.current.split("\n");
  const { from_line: from, to_line: to } = w.op.at as { from_line: number; to_line: number };
  if (!(Number.isInteger(from) && Number.isInteger(to) && from >= 1 && to >= from && to <= lines.length)) {
    throw new Rejection({
      clause: CLAUSES.PATCH_AMBIGUOUS,
      expected: `1 <= from_line <= to_line <= ${lines.length} for ${w.op.path}`,
      got: `from_line ${from}, to_line ${to} (op ${w.i + 1}/${w.n}) — nothing was written`,
      remedy: {
        tool: "se_file_read",
        args: { path: w.op.path, offset: Math.max(1, Number(from) || 1), limit: 40 },
        note: "re-read the range you mean; line numbers ride every read",
      },
      source: SRC,
    });
  }
  const newParts = toEol(w.op.new_string as string, w.eol).split("\n");
  // The seam after the range mirrors the replaced last line's own ending.
  if (lines[to - 1].endsWith("\r")) newParts[newParts.length - 1] += "\r";
  if (/\r\n/.test(w.current) && /(^|[^\r])\n/.test(w.current)) {
    w.corrected.push(`op ${w.i + 1}: ${w.op.path} mixes CRLF and LF — lines were counted the way the reader numbers them`);
  }
  lines.splice(from - 1, to - from + 1, ...newParts);
  return { next: lines.join("\n"), replacements: 1 };
}

// see dsp-write-guard.md#the-engine-corrects-what-is-mechanical-and-says-so
function applyExactOp(w: OpWork): { next: string; replacements: number } {
  let oldStr = (w.op.old_string as string).replace(/^﻿/, "");
  let newStr = w.op.new_string as string;
  let count = w.current.split(oldStr).length - 1;
  if (count === 0) {
    const reOld = toEol(oldStr, w.eol);
    const reCount = w.current.split(reOld).length - 1;
    if (reOld !== oldStr && reCount > 0) {
      oldStr = reOld;
      newStr = toEol(newStr, w.eol);
      count = reCount;
      w.corrected.push(
        `op ${w.i + 1}: old_string matched after line-ending normalisation — this file is ${w.eol === "\r\n" ? "CRLF" : "LF"}; the patch was applied in the file's own endings`,
      );
    }
  }
  if (count === 0 || (count > 1 && w.op.replace_all !== true)) {
    // WHY it did not match, not merely that it did not. This refusal fired
    // twelve times in one period; the whitespace near-miss is still named,
    // because "copy the exact text" is useless advice when the difference
    // cannot be seen.
    let why = "";
    if (count === 0) {
      const flat = (s: string): string => s.replace(/\r\n/g, "\n").replace(/[ \t]+/g, " ");
      if (flat(w.current).includes(flat(oldStr))) {
        why = " — but it MATCHES with runs of spaces and tabs collapsed: the indentation differs";
      }
    }
    throw new Rejection({
      clause: CLAUSES.PATCH_AMBIGUOUS,
      expected:
        count === 0
          ? `old_string to occur in ${w.op.path}`
          : `old_string to occur exactly once in ${w.op.path} (or pass replace_all: true)`,
      got: `${count} occurrences (op ${w.i + 1}/${w.n}) — nothing was written${why}`,
      remedy: {
        tool: "se_file_read",
        args: { path: w.op.path },
        note: count === 0 ? "re-read and copy the exact text, whitespace included" : "widen old_string until unique, or set replace_all",
      },
      source: SRC,
    });
  }
  // see dsp-write-guard.md#a-function-replacement
  const next = w.op.replace_all === true ? w.current.split(oldStr).join(newStr) : w.current.replace(oldStr, () => newStr);
  // see dsp-write-guard.md#the-round-trip-verify
  if (newStr !== "" && !next.includes(newStr)) {
    throw new Rejection({
      clause: CLAUSES.WRITE_TRANSFORMED,
      expected: `new_string to land verbatim in ${w.op.path}`,
      got: `the applied text does not contain the payload (op ${w.i + 1}/${w.n}) — nothing was written`,
      remedy: {
        tool: "se_file_read",
        args: { path: w.op.path },
        note: "the payload was transformed on the way in — the escape-eating class has a new member; report it with the payload that triggered this",
      },
      source: SRC,
    });
  }
  return { next, replacements: w.op.replace_all === true ? count : 1 };
}

// All guards passed — write, whole batch, machine-note and NUL guards on
// every file before the first byte of any of them lands.
function writeStaged(
  root: string,
  staged: { abs: string; path: string; next: string; replacements: number }[],
  corrected: string[],
): PatchResult {
  const byFile = new Map<string, { path: string; next: string; replacements: number }>();
  for (const s of staged) {
    const prev = byFile.get(s.abs);
    byFile.set(s.abs, { path: s.path, next: s.next, replacements: (prev?.replacements ?? 0) + s.replacements });
  }
  for (const f of byFile.values()) {
    guardWriteContent(root, f.path, f.next);
    const nul = guardRawNul(f.path, f.next);
    f.next = nul.content;
    if (nul.corrected !== undefined) corrected.push(nul.corrected);
  }
  const applied = [...byFile.values()].map((f) => {
    const abs = resolveInRoot(root, f.path, SRC);
    writeNode(abs, f.next);
    return { path: f.path, hash: contentHash(f.next), replacements: f.replacements };
  });
  const findings = lintAfterWrite(root, applied, corrected);
  return {
    applied,
    ...(corrected.length > 0 ? { corrected } : {}),
    ...(findings !== undefined ? { lint_findings: findings } : {}),
  };
}

/** Every guard is checked before anything is written — a failure leaves the tree untouched. */
export function filePatch(root: string, ops: PatchOp[]): PatchResult {
  const staged: { abs: string; path: string; next: string; replacements: number }[] = [];
  const contents = new Map<string, string>(); // carries earlier ops' effects within the batch
  const corrected: string[] = [];
  for (const [i, op] of ops.entries()) {
    const kind = opKind(op, i, ops.length);
    requireOpFields(kind, op, i, ops.length);
    const abs = mustExist(root, op.path, SRC);
    const raw = contents.get(abs) ?? readFileSync(abs, "utf8");
    guardCas(op, raw, contents.get(abs) !== undefined, i, ops.length);
    // AN INVISIBLE BYTE-ORDER MARK IS AN ENCODING FACT, NOT CONTENT. It is
    // preserved at the front of the file, ignored for matching on both
    // sides, and a prepend lands after it rather than burying it mid-file.
    const bom = raw.startsWith("﻿") ? "﻿" : "";
    const current = bom === "" ? raw : raw.slice(1);
    if (bom !== "") corrected.push(`op ${i + 1}: ${op.path} carries a UTF-8 byte-order mark — preserved, and ignored for matching`);
    const w: OpWork = { op, i, n: ops.length, current, eol: eolOf(current), corrected };
    const r =
      kind === "regex"
        ? applyRegexOp(w)
        : kind === "append" || kind === "prepend"
          ? applyEdgeOp(kind, w)
          : kind === "range"
            ? applyRangeOp(w)
            : applyExactOp(w);
    contents.set(abs, bom + r.next);
    staged.push({ abs, path: op.path, next: bom + r.next, replacements: r.replacements });
  }
  return writeStaged(root, staged, corrected);
}
