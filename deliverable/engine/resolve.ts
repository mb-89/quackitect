// see dsp-resolution-seam.md#the-resolution-seam
import { actBoundTree, withActBound } from "./actbound.ts";
import { type Owner, resolveForRead, resolveInActBound, resolveInRoot, routeToOwner } from "./paths.ts";

// THE WAY TO OPEN A BOUND is re-exported from the seam, because the seam is
// where callers already look for resolution. The state itself lives in
// actbound.ts so paths.ts can ask whether a bound is open without the two
// modules importing each other.
export { withActBound };

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

/** see dsp-resolution-seam.md#which-store-serves-this-path */
export function storeFor(roots: Roots, owner: Owner): string {
  void owner;
  return roots.machine;
}

/** Resolve a caller's path and say where it landed.
 *
 *  `forRead` opens EVERY declared root. The write lane opens only the ones
 *  whose declaration says `writable: true`, and refuses the rest — that
 *  refusal lives in resolveInRoot. */
export function resolve(roots: Roots | string, p: string, source: string, forRead = false): Resolved {
  // A BARE STRING IS THE ROOT, never a tree to derive another root from.
  const r: Roots = typeof roots === "string" ? { machine: roots } : roots;
  const owner = routeToOwner(p);
  // THE ACT'S BOUND BEATS THE KIND ROUTING, and only for WRITES.
  //
  // Method and session paths resolve to the machine root whatever tree is
  // bound. That is right during a walk and catastrophic during production: a
  // producing act writes a whole tree, method files included, and kind routing
  // would send those into the ENGINE while the engine was being copied.
  //
  // READS ARE NEVER BOUNDED, because the act copies FROM the engine. Bounding
  // them would leave the act unable to read the thing it is reproducing.
  const bound = forRead ? undefined : actBoundTree();
  if (bound !== undefined) {
    return { abs: resolveInActBound(bound, p, source), owner, store: bound };
  }
  const store = storeFor(r, owner);
  const abs = forRead ? resolveForRead(store, p, source) : resolveInRoot(store, p, source);
  return { abs, owner, store };
}
