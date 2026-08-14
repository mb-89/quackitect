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
import { machineRootOf, type Owner, resolveForRead, resolveInRoot, routeToOwner } from "./paths.ts";

/** The stores a call can reach. `bound` is absent when no record is bound. */
export interface Roots {
  /** The project root. Session state and shared method live here. */
  machine: string;
  /** The bound record's tree, when one is bound. */
  bound?: string;
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

/** Which store serves this path, decided by what the path IS. */
export function storeFor(roots: Roots, owner: Owner): string {
  // The core owns session state and shared method. One copy, on the machine.
  if (owner.kind === "core") return roots.machine;
  // Everything else rides the bound tree, and falls back to the machine root
  // when nothing is bound.
  return roots.bound ?? roots.machine;
}

/** Resolve a caller's path and say where it landed.
 *
 *  `forRead` opens the declared roots, which are READ surfaces only. The
 *  write lane refuses them, and that refusal lives in resolveInRoot. */
export function resolve(roots: Roots | string, p: string, source: string, forRead = false): Resolved {
  // ONE ROOT IS ENOUGH. A caller that knows only the tree it is standing in
  // still resolves correctly, because the machine root is derivable from a
  // worktree path. That is what makes this seam adoptable one verb at a time
  // instead of all at once.
  const r: Roots = typeof roots === "string" ? { machine: machineRootOf(roots), bound: roots } : roots;
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
