// THE RESOLUTION SEAM (dsp-resolution-seam, el-resolution-seam).
//
// One resolver every verb calls. It does three things and no more.
//
//   RESOLVE — work out the absolute path from the caller's root.
//   REFUSE  — anything falling outside, rather than letting the platform
//             serve it. exp-one-seam measured the platform resolving
//             ..\..\..\..\Users cleanly to a folder outside the project, so
//             this step is load-bearing rather than defensive.
//   SAY     — carry the store and the owner ON the answer, so a wrong
//             resolution is visible at the call rather than at a merge.
//
// THE SAYING IS THE NEW PART. resolveInRoot answers a bare string, so a
// caller cannot tell which tree replied. On 2026-08-14 se_lint and the file
// lane resolved `.se/HANDOVER.md` to two different trees and neither answer
// said which — recorded on raid-risk-a-write-lands-in-the-wrong-tree-silently,
// which is an ISSUE rather than a risk because it has happened.
import { type Owner, resolveForRead, resolveInRoot, routeToOwner } from "./paths.ts";

export interface Resolved {
  /** The absolute path on disk. */
  abs: string;
  /** WHO owns it — routing's answer, carried so the caller can see it. */
  owner: Owner;
  /** WHICH ROOT answered, absolute.
   *
   *  There is exactly one today, because satellites are not built yet. The
   *  field exists anyway: an answer that cannot name its store is an answer
   *  nobody can check, and adding the field later means auditing every
   *  caller instead of none. */
  store: string;
}

/** Resolve a caller's path and say where it landed.
 *
 *  `forRead` opens the declared roots, which are READ surfaces only. The
 *  write lane refuses them, and that refusal lives in resolveInRoot. */
export function resolve(root: string, p: string, source: string, forRead = false): Resolved {
  const abs = forRead ? resolveForRead(root, p, source) : resolveInRoot(root, p, source);
  return { abs, owner: routeToOwner(p), store: root };
}

/** Did a write land where the caller meant? Answered by READING BACK from
 *  the store the answer named, never by the write's own verdict.
 *
 *  req-a-resolution-is-proven-by-read-back wants this shape, and
 *  tsp-read-back-inspection checks that the tests use it. */
export function landedIn(resolved: Resolved, root: string): boolean {
  return resolved.store === root;
}
