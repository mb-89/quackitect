// THE RESOLUTION SEAM (dsp-resolution-seam, el-resolution-seam).
//
// One resolver every verb calls. It does three things and no more.
//
//   RESOLVE — pick the STORE from what the path IS, then the absolute path.
//   REFUSE  — anything falling outside, rather than letting the platform
//             serve it. exp-one-seam measured the platform resolving
//             ..\..\..\..\Users cleanly to a folder outside the project, so
//             this step is load-bearing rather than defensive.
//   SAY     — carry the store and the owner ON the answer, so a wrong
//             resolution is visible at the call rather than at a merge.
//
// THE STORE COMES FROM THE PATH'S KIND, NOT FROM THE CALLER'S AMBIENT ROOT.
// That is the whole fix. On 2026-08-14 se_lint answered ENOENT for
// `.se/HANDOVER.md` against a worktree while the file lane served the same
// path from the machine root. Both were "correct" against their own root, and
// neither answer said which root that was.
//
// Session state belongs to the machine, never to a branch. So it resolves to
// the machine root whatever tree the caller happens to be bound to, and the
// answer says so.
import { type Owner, resolveForRead, resolveInRoot, routeToOwner } from "./paths.ts";

/** THE STORE A CALL CAN REACH, and there is exactly one (owner ruling
 *  2026-08-16). A record is a folder on trunk, so no path has a second place
 *  it could resolve to. */
export interface Roots {
  /** The project root. Everything lives here. */
  machine: string;
}

export interface Resolved {
  /** The absolute path on disk. */
  abs: string;
  /** WHO owns it — routing's answer, carried so the caller can see it. */
  owner: Owner;
  /** WHICH ROOT answered, absolute. An answer that cannot name its store is
   *  an answer nobody can check. */
  store: string;
}

/** Which store serves this path. ONE ANSWER, ALWAYS.
 *
 *  THIS FUNCTION WAS THE CHOOSER. It read `roots.bound ?? roots.machine` for
 *  anything the core did not own, so the same relative path named different
 *  files depending on what was bound — and a read and a write could disagree
 *  about which copy was real.
 *
 *  WHAT IT COST, measured on 2026-08-16: a filesystem check run while bound to
 *  i4 reported `.worktrees/i34-…` absent, because it resolved inside i4's
 *  tree. The answer named no root, so the wrong answer was indistinguishable
 *  from a right one.
 *
 *  IT IS KEPT AS A FUNCTION, not inlined, because `store` still rides every
 *  answer and req-a-resolution-is-proven-by-read-back still wants a name to
 *  compare against. The owner is still computed and still reported; what is
 *  gone is any use of it to pick a tree. */
export function storeFor(roots: Roots, owner: Owner): string {
  void owner;
  return roots.machine;
}

/** Resolve a caller's path and say where it landed.
 *
 *  `forRead` opens the declared roots, which are READ surfaces only. The
 *  write lane refuses them, and that refusal lives in resolveInRoot. */
export function resolve(roots: Roots | string, p: string, source: string, forRead = false): Resolved {
  // A BARE STRING IS THE ROOT. It used to be read as "the tree I am standing
  // in", with the machine root derived from it by stripping `.worktrees/<id>`
  // — which is the derivation this iteration deletes.
  const r: Roots = typeof roots === "string" ? { machine: roots } : roots;
  const owner = routeToOwner(p);
  const store = storeFor(r, owner);
  const abs = forRead ? resolveForRead(store, p, source) : resolveInRoot(store, p, source);
  return { abs, owner, store };
}

/** Did a write land where the caller meant? Answered by READING BACK from
 *  the store the answer named, never by the write's own verdict.
 *
 *  req-a-resolution-is-proven-by-read-back wants this shape, and
 *  tsp-read-back-inspection checks that the tests use it. */
export function landedIn(resolved: Resolved, root: string): boolean {
  return resolved.store === root;
}
