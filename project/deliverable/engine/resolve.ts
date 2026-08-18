// see dsp-resolution-seam.md#the-resolution-seam
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

/** see dsp-resolution-seam.md#which-store-serves-this-path */
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
