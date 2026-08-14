// THE SATELLITE (dsp-core-and-satellite, el-satellite).
//
// One per agent. It owns ONE record: that record's thin tree, the machine
// composed for it, and the walk standing in it.
//
// ROOTED IN ITS RECORD'S TREE. The satellite's root IS the record's tree, so a
// relative path it is handed cannot address another record by accident. That
// is the property req-a-write-lands-where-it-is-meant asks for, and it is
// structural rather than checked.
//
// IT RE-REALIZES NOTHING. The walk engine still walks, the test runner still
// runs tests, the seam still resolves. The satellite owns which TREE they see.
import { composeForRecord, isOverridable, overridesIn, type Served } from "./delta.ts";
import { type GitLane, type LevelResult, levelRecordTree } from "./supervisor.ts";

/** Whatever actually runs git, injected so the adapter is testable without a
 *  repository — the same shape the rest of this build uses. */
export type GitRun = (args: string[], cwd: string) => { ok: boolean; stdout: string; stderr: string };

/** THE REAL GitLane, over the git lane's allowlist.
 *
 *  IT MERGES, IT DOES NOT REBASE. SE-C-002 forbids a rebase outright, and the
 *  allowlist has no such verb: a diverged branch reconciles by MERGE, which
 *  only adds a revertable commit and leaves superseded content in history.
 *
 *  A CONFLICT IS REPORTED WITH GIT'S OWN WORDS. Summarising it loses the file
 *  names, and the file names are the only part anybody can act on. */
export function gitLaneFor(tree: string, trunkBranch: string, run: GitRun): GitLane {
  return {
    reconcile(): { ok: boolean; conflict?: string } {
      const r = run(["merge", "--no-edit", trunkBranch], tree);
      if (r.ok) return { ok: true };
      const said = `${r.stdout}\n${r.stderr}`;
      const conflicts = said
        .split(/\r?\n/)
        .filter((l) => l.includes("CONFLICT") || l.startsWith("Auto-merging"))
        .join("; ");
      return { ok: false, conflict: conflicts === "" ? said.trim() : conflicts };
    },
    commit(_recordRel: string, message: string): { ok: boolean } {
      // Nothing to commit is not a failure. A levelling that brought no change
      // is still a levelled tree, and git says so with exit 1.
      const staged = run(["add", "-A"], tree);
      if (!staged.ok) return { ok: false };
      const r = run(["commit", "-m", message], tree);
      if (r.ok) return { ok: true };
      return { ok: /nothing to commit|no changes added/i.test(`${r.stdout}\n${r.stderr}`) };
    },
  };
}

export interface SatelliteState {
  /** Level and serving, or stopped with the conflict named. */
  serving: boolean;
  /** Named when the satellite did not come up. */
  conflict?: string;
  /** What this record changes about the machine it runs. */
  overrides: string[];
}

export class Satellite {
  /** The record this satellite owns. One, and only one. */
  readonly record: string;
  /** The record's own tree. The satellite's root, so relative paths land in
   *  it by construction. */
  readonly tree: string;
  /** Where the record's folder sits, relative to the tree. */
  readonly recordRel: string;

  private state: SatelliteState = { serving: false, overrides: [] };

  constructor(record: string, tree: string, recordRel: string) {
    this.record = record;
    this.tree = tree;
    this.recordRel = recordRel;
  }

  /** START, and it is all-or-nothing.
   *
   *  Level the tree first, and serve only if it came up level. A satellite
   *  that starts on an unlevelled tree serves a composition nobody assembled,
   *  which is the mixture req-entry-levels-the-record-tree exists to prevent.
   *
   *  NOTHING IS IN FLIGHT AT A START, so a partial one cannot be observed. */
  start(git: GitLane): SatelliteState {
    const levelled: LevelResult = levelRecordTree(this.tree, this.recordRel, git);
    this.state = levelled.levelled
      ? { serving: true, overrides: levelled.overrides }
      : { serving: false, conflict: levelled.conflict, overrides: levelled.overrides };
    return this.state;
  }

  /** Is this satellite serving? A stopped one answers nothing at all. */
  serving(): boolean {
    return this.state.serving;
  }

  /** Why it is not serving, when it is not. */
  why(): string | undefined {
    return this.state.conflict;
  }

  /** RUN THE RECORD'S COMPOSED MACHINE: its own folder first, trunk second,
   *  never both. A stopped satellite refuses rather than composing. */
  serve(rel: string): Served {
    if (!this.state.serving) {
      throw new Error(`${this.record} is not serving: ${this.state.conflict ?? "it never started"}`);
    }
    return composeForRecord(this.tree, this.recordRel, rel);
  }

  /** May this record override this path? Method and engine only — a record
   *  overriding another record's evidence is a write in the wrong tree. */
  mayOverride(rel: string): boolean {
    return isOverridable(rel);
  }

  /** What this record has done to the machine, readable without diffing. */
  overrides(): string[] {
    return overridesIn(this.tree, this.recordRel);
  }
}
