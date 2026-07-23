// The repo layout, in one place (se.structure: ~5 visible per level).
//
//   root/               README, RUNME, workspace/, product/
//   workspace/          agent territory: AGENTS.md, MCP link, deny rules
//   product/spec/       the thinking: ledger, iterations — MCP-only
//   product/deliverable the engine and everything else that ships
//   ~/.se/<project>/    machine-local: call log, toll, live offer
//
// Every engine path derives from here — a future move touches one file.
import { homedir } from "node:os";
import { basename, join, resolve } from "node:path";

/** Machine-local state base. SE_STATE_DIR overrides (tests, odd setups). */
function stateBase(): string {
  return process.env.SE_STATE_DIR ?? join(homedir(), ".se");
}

export const layout = {
  /** The ledger: product/spec/ledger/<module>/<localId>.md */
  ledger: (root: string): string => join(root, "product", "spec", "ledger"),
  /** The deliverable — everything the se.deliverable lane may touch. */
  deliverable: (root: string): string => join(root, "product", "deliverable"),
  /** Machine-local, never committed: call log, toll, live offer. */
  seDir: (root: string): string => join(stateBase(), basename(resolve(root))),
  /** Committed per-iteration record: state + evidence. */
  iterations: (root: string): string => join(root, "product", "spec", "iterations"),
  iterationDir: (root: string, iteration: string): string => join(root, "product", "spec", "iterations", iteration),
  instancePath: (root: string, iteration: string): string =>
    join(root, "product", "spec", "iterations", iteration, "state.json"),
  evidenceDir: (root: string, iteration: string): string =>
    join(root, "product", "spec", "iterations", iteration, "evidence"),
  /** Grants are ledger events; committed beside the iterations. */
  grantsPath: (root: string): string => join(root, "product", "spec", "iterations", "grants.jsonl"),
  /** The live offer is transient: losing it IS dismissal (safe by design). */
  offerPath: (root: string): string => join(layout.seDir(root), "offer.json"),
  /** The session lock: which roots the fence protects (product + imports). */
  lockPath: (root: string): string => join(layout.seDir(root), "lock.json"),
  /** Machine-wide recents: one line per product ever logged onto (picker fuel). */
  recentsPath: (): string => join(stateBase(), "recents.jsonl"),
  /** The product nameplate: { "product": "<name>" } at the repo root. */
  nameplatePath: (root: string): string => join(root, "product.json"),
  /** Notes are PRIVATE: machine-local until drained at a retro, never committed. */
  notesPath: (root: string): string => join(layout.seDir(root), "notes.jsonl"),
  /** Planned-but-unstarted iterations; the board shows them beside open and closed. */
  planPath: (root: string): string => join(root, "product", "spec", "iterations", "plan.json"),
};
