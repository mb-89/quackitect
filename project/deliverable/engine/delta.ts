// THE ENGINE DELTA (dsp-engine-delta, el-engine-delta).
//
// Two-level resolution and nothing else: the record's own folder first, trunk
// second. Never both.
//
// WHY IT EXISTS. A record's tree is thin, so it holds no copy of shared
// method or of the engine. A record must still be able to change the machine
// it runs. A whole copy per record contradicts the thin tree and priced
// twenty-seven engines on disk; a DELTA keeps both true.
//
// WHAT A RECORD HOLDS is the files it changed and nothing more. Most records
// hold none, and the list of the ones that do IS what that record has done to
// the machine — readable without diffing anything.
import { existsSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { METHOD_PREFIXES } from "./paths.ts";

/** Where one file came from, and the absolute path to it. */
export interface Served {
  abs: string;
  from: "record" | "trunk";
}

/** The folder a record keeps its overrides in, relative to the root. */
export const deltaDirOf = (recordRel: string): string => join(recordRel, "delta");

/** RECORD FIRST, TRUNK SECOND, NEVER BOTH.
 *
 *  A file is served from one store or the other. A composed file assembled
 *  from both is a mixture nobody assembled, and a walk beginning in it starts
 *  from a tree that does not compile. So nothing here merges.
 *
 *  req-entry-levels-the-record-tree carried this rule and was retired by i34
 *  with the record trees. The harm is stated here because the rule outlived
 *  its citation. */
export function composeForRecord(root: string, recordRel: string, rel: string): Served {
  const override = join(root, deltaDirOf(recordRel), rel);
  if (existsSync(override)) return { abs: override, from: "record" };
  return { abs: join(root, rel), from: "trunk" };
}

/** THE OVERRIDE LIST, which travels with the machine.
 *
 *  Without it, N satellites run N compositions and nothing says which is
 *  which. That is the hole cand-os-rooted leaves open in its own text.
 *
 *  It is short by construction: usually empty, and never larger than what one
 *  agent has changed. A list that has grown long is a record that has quietly
 *  become a fork, and that is worth seeing on the panel. */
export function overridesIn(root: string, recordRel: string): string[] {
  const base = join(root, deltaDirOf(recordRel));
  if (!existsSync(base)) return [];
  const out: string[] = [];
  for (const e of readdirSync(base, { recursive: true, withFileTypes: true })) {
    if (!e.isFile()) continue;
    const dir = (e as { parentPath?: string; path?: string }).parentPath ?? (e as { path?: string }).path ?? base;
    out.push(relative(base, join(dir, e.name)).replace(/\\/g, "/"));
  }
  return out.sort();
}

/** Is this path one a record is ALLOWED to override?
 *
 *  Method and engine only. A record overriding another record's evidence is
 *  not a delta; it is a write in the wrong tree, and the seam refuses it. */
export function isOverridable(rel: string): boolean {
  const p = rel.replace(/\\/g, "/");
  return METHOD_PREFIXES.some((pre) => p.startsWith(pre));
}
