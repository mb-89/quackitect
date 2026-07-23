// The session machine (§6 boot, §7 admission, idle as the hub). The boot
// sequence IS these states; iterations run as a nested machine entered
// from idle. The board renders this declaration; the transition law lives
// in boot.ts guards and loop.ts until the machine executor unifies them.
import type { MachineDecl } from "../machine.ts";
import { systematic } from "./systematic.ts";

export const sessionMachine: MachineDecl = {
  id: "session",
  reentry: "restart",
  initial: "lock_on",
  states: [
    {
      id: "lock_on",
      kind: "work",
      group: "boot",
      statement: "Lock onto a product root; the nameplate names it.",
      filled_by: "agent",
      guidance: "se_boot with no arguments returns the project, the contract and its hash.",
      evidence_form: [],
      edges: [{ to: "attest", role: "normal" }],
    },
    {
      id: "attest",
      kind: "work",
      group: "boot",
      statement: "Read the contract; attest its hash.",
      filled_by: "agent",
      guidance: "se_boot with contract_hash admits the session.",
      evidence_form: [],
      edges: [{ to: "admitted", role: "normal" }],
    },
    {
      id: "admitted",
      kind: "work",
      group: "boot",
      statement: "Admission gates the tool surface; the lock and the board exist now.",
      filled_by: "agent",
      guidance: "The fence reads the lock; the handover is a live projection.",
      evidence_form: [],
      edges: [{ to: "idle", role: "normal" }],
    },
    {
      id: "idle",
      kind: "work",
      statement: "No iteration open. The owner picks what happens next.",
      filled_by: "agent",
      guidance: "se_loop_start enters the iteration machine; notes and questions stay legal.",
      evidence_form: [],
      edges: [
        { to: "iteration", role: "normal" },
        { to: "ended", role: "alternative" },
      ],
    },
    {
      id: "iteration",
      kind: "work",
      statement: `An iteration machine (${systematic.id}) runs nested; its close returns here.`,
      filled_by: "agent",
      guidance: "The nested machine's states carry their own statements; browse down one level.",
      evidence_form: [],
      edges: [{ to: "idle", role: "normal" }],
    },
    {
      id: "ended",
      kind: "terminal",
      statement: "The session ended; a new boot starts a new session.",
      filled_by: "agent",
      guidance: "Sessions are per-process: a reconnect or a fresh shell boots again, by design.",
      evidence_form: [],
      edges: [],
    },
  ],
};
