// The repo layout, in one place (se.structure: ~5 visible per level;
// spec = the thinking, product = what ships, machinery in dotfolders).
// Every engine path derives from here — a future move touches one file.
import { join } from "node:path";

export const layout = {
  /** The ledger: spec/ledger/<module>/<localId>.md */
  ledger: (root: string): string => join(root, "spec", "ledger"),
  /** Machine-local, never committed: call log, toll, live offer. */
  seDir: (root: string): string => join(root, ".se"),
  /** Committed per-iteration record: state + evidence. */
  iterations: (root: string): string => join(root, "spec", "iterations"),
  iterationDir: (root: string, iteration: string): string => join(root, "spec", "iterations", iteration),
  instancePath: (root: string, iteration: string): string =>
    join(root, "spec", "iterations", iteration, "state.json"),
  evidenceDir: (root: string, iteration: string): string =>
    join(root, "spec", "iterations", iteration, "evidence"),
  /** Grants are ledger events; committed beside the iterations. */
  grantsPath: (root: string): string => join(root, "spec", "iterations", "grants.jsonl"),
  /** The live offer is transient: losing it IS dismissal (safe by design). */
  offerPath: (root: string): string => join(root, ".se", "offer.json"),
};
