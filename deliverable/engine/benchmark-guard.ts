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
  const spec = join(tree, "spec");
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

/** THE CONCEALMENT. `spec/benchmarks` is invisible while a run is
 *  bound and visible everywhere else.
 *
 *  ASKED AT THE CALL SITES, NEVER ATTACHED TO A LIST. Four exclusion lists
 *  decide what a lane verb may see, they disagree, and `search.ts` consults
 *  none of them — it asks ripgrep and filters the answer itself. A rule riding
 *  one list would hold in one quarter of the lane.
 *
 *  A RULE, NOT A SUBSTRING. `benchmarksomething/` is not the reports folder,
 *  so the match is on a path SEGMENT.
 *
 *  WHY A BOUND RUN MUST NOT SEE THEM. A run that can read the previous run's
 *  numbers can work toward them, and the measurement stops being one. */
export function concealedFromLane(rel: string, bound: boolean): boolean {
  if (!bound) return false;
  const parts = rel.replace(/\\/g, "/").split("/");
  // TWO SEGMENTS, NOT THREE. The run used to open with the opened folder's
  // name; the levels collapsed and it does not. A three-segment rule here
  // matches nothing at all, which fails OPEN — a bound run would read the
  // previous run's numbers and the measurement would stop being one.
  for (let i = 0; i + 1 < parts.length; i += 1) {
    if (parts[i] === "spec" && parts[i + 1] === "benchmarks") return true;
  }
  return false;
}

/** The call sites the mask covers, asserted so a verb added later fails its
 *  check rather than escaping the rule silently. */
export function concealmentCallSites(): string[] {
  return ["engine/files.ts:fileGlob", "engine/files.ts:fileList", "engine/files.ts:fileRead", "engine/search.ts:fileSearch"];
}

/** WHETHER A RUN IS OPEN. Read from disk rather than held in memory, because
 *  the verb that binds a run and the verb that reads a path are different
 *  calls in different modules. */
export function isBound(root: string): boolean {
  return existsSync(join(root, ".se", "benchmark.json"));
}

/* THE OLD NOTE, kept because it records why this waited.
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
