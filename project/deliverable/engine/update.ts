// THE UPDATE CHANNEL (dsp-the-update-channel).
//
// TWO ELEMENTS SHARE THIS FILE and only one of them has code.
//
//   el-change-reporter — what did this vehicle make its own. BUILT, below.
//   el-update-runner   — run an arriving update program. NOT BUILT. The
//                        program format is the expensive half and it is not
//                        designed yet, which is what
//                        raid-tripwire-i16-a-structural-migration-cannot-be-written
//                        probes. Writing a runner for a format nobody has
//                        specified would be fabrication, not progress.
//
// THE BASE IS THE VEHICLE'S OWN ROOT COMMIT, and that is the whole reason the
// reporter is cheap.
//
// el-change-reporter said the opposite until it was corrected: "the winning design
// makes a vehicle a clone that keeps the engine's commits... under a vehicle
// sharing no commit with its engine this element could not run at all." That
// was written against a clone. The owner replaced it with a COPY, and the
// element's conclusion did not follow the premise.
//
// A COPY HAS ITS OWN ROOT COMMIT, and that commit IS the engine's content as it
// was vendored. So the base is still local, still exact, and needs nothing of
// the engine's history. What changed is which commit to name, not whether one
// exists.
import { execFileSync } from "node:child_process";
import { CLAUSES, Rejection } from "./errors.ts";

/** WHAT DID YOU MAKE YOUR OWN — never how far have you wandered.
 *
 *  A vehicle's owner changing things is the entire value proposition, so a
 *  report phrased as damage would make the product argue with its own promise.
 *  The framing is a property of the ANSWER rather than of whoever prints it,
 *  which is why the words live here and not on a surface. */
export interface OwnChange {
  /** The path, relative to the vehicle's root. */
  path: string;
  /** `written` for a file the vehicle added, `changed` for one it edited,
   *  `removed` for one it deleted. Three plain words, none of them a verdict. */
  how: "written" | "changed" | "removed";
}

export interface Inventory {
  /** The commit the vehicle was vendored as. */
  since: string;
  /** Everything the vehicle has made its own since then. */
  own: OwnChange[];
}

const HOW: Record<string, OwnChange["how"]> = { A: "written", M: "changed", D: "removed", R: "changed", C: "written", T: "changed" };

function git(tree: string, args: string[], source: string): string {
  try {
    return execFileSync("git", args, { cwd: tree, encoding: "utf8" });
  } catch (e) {
    throw new Rejection({
      clause: CLAUSES.PRODUCE_REFUSED,
      expected: "a tree with a repository in it — the inventory is a repository query",
      got: `git ${args.join(" ")} failed in ${tree}: ${(e as Error).message}`,
      remedy: {
        tool: "se_file_list",
        args: { dir: "." },
        note: "a vehicle is produced with a repository of its own and one commit. A tree without one was not produced by this system, and there is nothing to compare against.",
      },
      source,
    });
  }
}

/** Everything this vehicle has made its own, derived rather than declared.
 *
 *  NOTHING IS MAINTAINED BY HAND, so the answer cannot silently stop being
 *  true. That is why the derived option was picked over a list the vehicle's
 *  owner keeps.
 *
 *  WHICH COMMIT COUNTS AS "THE VERSION IT WAS BUILT FROM" is settled here only
 *  for a vehicle that has taken no updates: the root commit. Once updates land,
 *  the base becomes the last update's commit, and that question belongs to the
 *  runner rather than here — [[if-change-reporter-to-update-runner]] carries it.
 *  There is no update mechanism yet, so there is no second case to get wrong. */
export function inventory(vehicleRoot: string, source = "engine/update.ts"): Inventory {
  // THE ROOT COMMIT IS THE ONE WITH NO PARENT. A produced vehicle has exactly
  // one, because the act makes a fresh repository and commits once.
  const roots = git(vehicleRoot, ["rev-list", "--max-parents=0", "HEAD"], source).trim().split("\n").filter(Boolean);
  if (roots.length !== 1) {
    throw new Rejection({
      clause: CLAUSES.PRODUCE_REFUSED,
      expected: "exactly one root commit — the one the vehicle was vendored as",
      got: `${roots.length} root commits in ${vehicleRoot}`,
      remedy: {
        tool: "se_file_list",
        args: { dir: "." },
        note: "a produced vehicle has one. More than one means history was grafted in, and which commit the vehicle was vendored as is no longer derivable.",
      },
      source,
    });
  }
  const since = roots[0];
  const raw = git(vehicleRoot, ["diff", "--name-status", "-M", since, "HEAD"], source);
  const own: OwnChange[] = [];
  for (const line of raw.split("\n")) {
    if (line.trim() === "") continue;
    const cells = line.split("\t");
    const how = HOW[(cells[0] ?? "").charAt(0)];
    // THE PATH A RENAME LANDS AT is the one that matters — what the vehicle
    // holds now, not what it used to hold.
    const path = cells[cells.length - 1];
    if (how !== undefined && path !== undefined && path !== "") own.push({ path, how });
  }
  own.sort((a, b) => a.path.localeCompare(b.path));
  return { since, own };
}
