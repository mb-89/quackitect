// se.file.move — move or rename a file and fix every reference in one
// atomic pass. Content references live in three forms; all are rewritten:
//   - root-relative paths   (frontmatter read: lists, engine-facing text)
//   - vault-relative paths  (canvas file: refs; the vault root is product/)
//   - wiki links            ([[vault-path-no-extension]] and [[...|label]])
// Scanned: every .md and .canvas under the root (junk dirs excluded).
// Nothing is written unless the move itself succeeds.
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { CLAUSES, Rejection } from "./errors.ts";
import { isExcluded, resolveInRoot } from "./paths.ts";

const SRC = "engine/move.ts";

function variants(rootRel: string): string[] {
  const out = [rootRel];
  if (rootRel.startsWith("product/")) {
    const vault = rootRel.slice("product/".length);
    out.push(vault);
    if (vault.endsWith(".md")) out.push(`[[${vault.slice(0, -3)}`);
  }
  return out;
}

export interface MoveResult {
  moved: { from: string; to: string };
  rewritten: { path: string; replacements: number }[];
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

  // Pair old→new reference forms, LONGEST first so a root-relative hit is
  // never half-eaten by its vault-relative substring.
  const pairs = variants(fromRel)
    .map((v, i) => ({ old: v, new: variants(toRel)[i] }))
    .filter((p) => p.new !== undefined)
    .sort((a, b) => b.old.length - a.old.length);

  const rewritten: MoveResult["rewritten"] = [];
  const walk = (dir: string): void => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const abs = join(dir, e.name);
      if (isExcluded(relative(root, abs))) continue;
      if (e.isDirectory()) {
        walk(abs);
        continue;
      }
      if (!e.name.endsWith(".md") && !e.name.endsWith(".canvas")) continue;
      const before = readFileSync(abs, "utf8");
      let after = before;
      let count = 0;
      for (const p of pairs) {
        const parts = after.split(p.old);
        count += parts.length - 1;
        after = parts.join(p.new);
      }
      if (count > 0 && after !== before) {
        writeFileSync(abs, after, "utf8");
        rewritten.push({ path: relative(root, abs).split(sep).join("/"), replacements: count });
      }
    }
  };
  walk(root);
  rewritten.sort((a, b) => a.path.localeCompare(b.path));
  return { moved: { from: fromRel, to: toRel }, rewritten };
}
