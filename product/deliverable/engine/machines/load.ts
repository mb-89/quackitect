// Machines are ledger data: canvas + state notes, compiled at load.
// Absence is honest (null) — a ledger without drawn machines has no loop.
import { existsSync } from "node:fs";
import { join } from "node:path";
import { loadLedger } from "../store.ts";
import { layout } from "../layout.ts";
import { Rejection } from "../errors.ts";
import type { MachineDecl } from "../machine.ts";
import { compileMachine } from "./compile.ts";

export function loadMachine(root: string, short: string): MachineDecl | null {
  const ledger = loadLedger(layout.ledger(root));
  const id = `se.machine-${short}`;
  if (!ledger.nodes.has(id)) return null;
  return compileMachine(ledger, id);
}

/** An iteration-provided drawing for a seeding state (module "it"), or null. */
export function loadIterationMachine(root: string, iteration: string, stateId: string): MachineDecl | null {
  const dir = join(layout.iterationDir(root, iteration), "machines");
  if (!existsSync(dir)) return null;
  const ledger = loadLedger(dir);
  // Ledger localIds forbid underscores; state ids allow them — sanitize.
  const id = `it.machine-${stateId.replace(/_/g, "-")}`;
  if (!ledger.nodes.has(id)) return null;
  return compileMachine(ledger, id);
}

export const loadSystematic = (root: string): MachineDecl | null => loadMachine(root, "systematic");
export const loadSession = (root: string): MachineDecl | null => loadMachine(root, "session");

/** The loop cannot run without its machine; absence refuses with the fix. */
export function requireSystematic(root: string): MachineDecl {
  const m = loadSystematic(root);
  if (m === null) {
    throw new Rejection({
      clause: "SE-C-035",
      expected: "a drawn systematic machine in the ledger (se.machine-systematic)",
      got: "no machine node",
      remedy: {
        tool: "se_get_search",
        args: { query: "machine canvas" },
        note: "author the machine canvas per se.meth-machine-canvas, or restore it",
      },
      source: "engine/machines/load.ts",
    });
  }
  return m;
}
