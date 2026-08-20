// see dsp-benchmark-guard.md#responsibility
//
// PARTLY BUILT: the ceiling and its control are real. The concealment waits on
// wt-three-separate-lists-decide-which-paths-a-lane-verb-may-see-.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { git } from "./gitlane.ts";

/** THE CEILING, AND IT IS STRUCTURAL RATHER THAN CHECKED.
 *
 *  A commit newer than the rewind point is ABSENT from a depth-1 fetch, so
 *  this asks whether it resolves at all rather than testing ancestry.
 *
 *  WHY THAT SHAPE WON. A checked ceiling costs 4229 microseconds per call —
 *  the cost is the process spawn, so no subcommand is cheaper — and it FAILS
 *  OPEN: when the check errors, the wrong act passes. Here the wrong act
 *  cannot be expressed, so there is no path on which it passes silently. */
export function resolvesInBoundTree(tree: string, commit: string): boolean {
  if (!existsSync(join(tree, ".git"))) return false;
  return git(tree, "rev-parse", "--verify", "--quiet", `${commit}^{commit}`).ok;
}

/** THE POSITIVE CONTROL, and it is part of the design rather than of the test.
 *
 *  An empty fetch and a correct rewind are indistinguishable from inside: both
 *  answer "not there" to everything. So a run proves the tree HAS what it
 *  should — files naming a DIFFERENT iteration, which the rewind was never
 *  supposed to remove.
 *
 *  Measured on i33 during M6: 0 files naming i33 against 71 naming another. */
export function controlFilesPresent(tree: string, otherIteration: string): number {
  const spec = join(tree, "project", "spec");
  if (!existsSync(spec)) return 0;
  let n = 0;
  const walk = (dir: string): void => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (e.name === ".git") continue;
      const p = join(dir, e.name);
      if (e.isDirectory()) {
        walk(p);
        continue;
      }
      if (!statSync(p).isFile() || !e.name.endsWith(".md")) continue;
      if (readFileSync(p, "utf8").includes(otherIteration)) n += 1;
    }
  };
  walk(spec);
  return n;
}

/* THE CONCEALMENT IS NOT BUILT AND CARRIES NO STUB.
 *
 * It used to sit here as two functions returning `false` and `[]`. Nothing
 * called them, so they were dead code that made the design look half-present —
 * and the two tests that exercised them were green from birth for the same
 * reason.
 *
 * WHAT IT WILL BE is on dsp-benchmark-guard.md: one predicate asked at four
 * measured call sites, never attached to any of the four disagreeing exclusion
 * lists. What blocks it is that `search.ts` never reaches the containment seam,
 * so a rule there holds for every verb except the one most likely to find a
 * previous run's numbers.
 *
 * The obligation lives on the spec and the work token, which is where an
 * obligation belongs — not in a function that answers nothing.
 * see wt-three-separate-lists-decide-which-paths-a-lane-verb-may-see- */
