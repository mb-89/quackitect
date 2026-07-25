// Canvas → MachineDecl (§6 authoring): the drawn machine compiles at load,
// writes nothing, and refuses with the offending element named — a silent
// misparse would compute the wrong `next` confidently.
//
// The drawn form: states are file nodes onto machine_state notes; a file
// node onto another machine's canvas nests that machine; edge role rides
// styleAttributes.role (absent = normal); the edge label is the guard;
// group membership is geometric. Escape and ask-human edges are never
// drawn — the executor owns them.
import type { CanvasData, CanvasElement } from "../canvas.ts";
import type { Ledger } from "../store.ts";
import type { LedgerNode } from "../node.ts";
import {
  evalGuard,
  validateMachine,
  type EdgeDecl,
  type EdgeRole,
  type EvidenceField,
  type MachineDecl,
  type StateDecl,
} from "../machine.ts";

const ROLES: ReadonlySet<string> = new Set(["normal", "alternative", "fallback", "recovery", "approval", "error"]);

export class MachineCompileError extends Error {
  constructor(machine: string, element: string, message: string) {
    super(`${machine}: ${element}: ${message}`);
    this.name = "MachineCompileError";
  }
}

const LEDGER_REF = /(?:^|\/)ledger\/([a-z0-9]+)\/([a-z0-9][a-z0-9-]*)\.(md|canvas)$/;

function section(body: string, title: string): string {
  const lines = body.split("\n");
  const start = lines.findIndex((l) => l.trim() === `## ${title}`);
  if (start === -1) return "";
  const rest = lines.slice(start + 1);
  const end = rest.findIndex((l) => l.startsWith("## "));
  return rest
    .slice(0, end === -1 ? rest.length : end)
    .join("\n")
    .trim();
}

function evidenceForm(machineId: string, note: LedgerNode): EvidenceField[] {
  const text = section(note.body, "Evidence form");
  if (text === "") return [];
  return text
    .split("\n")
    .filter((l) => l.trim() !== "")
    .map((line) => {
      const m = line.trim().match(/^- (.+?) \| (.+?) \| (required|optional)$/);
      if (!m) {
        throw new MachineCompileError(
          machineId,
          note.id,
          `malformed evidence-form line ${JSON.stringify(line.trim())} (want "- name | description | required|optional")`,
        );
      }
      return { name: m[1], description: m[2], required: m[3] === "required" };
    });
}

/**
 * THE STANDARD REVIEW ROUNDS ([[se.meth-review-rounds]], ported from v1's
 * milestone-review guide). Every gate carries these in addition to its own
 * acceptance items, in increasing scrutiny. They are REQUIRED: a review that
 * nothing asks for is a review that never happens — which is exactly what
 * i12 found, three separate times, in three different mechanisms.
 *
 * The rounds cover TWO SETS: this gate's own items, AND every input state
 * feeding it since the last gate. Reviewing only the gate's own fields is the
 * common failure and it is not a review.
 */
const STANDARD_ROUNDS: EvidenceField[] = [
  {
    name: "verify_round",
    description:
      "BUILT IT RIGHT: every input state since the last gate, its evidence read against its claim. Open what the evidence points at rather than trusting its description of itself — a bless is not proof.",
    required: true,
  },
  {
    name: "validate_round",
    description:
      "BUILT THE RIGHT THING: against the frame, the vision and the REQUIREMENT REGISTER, not merely this iteration's own plan. List what is missing, wrong or out of scope — and watch for asks NO check covered, which is where a design drifts from its register.",
    required: true,
  },
  {
    name: "redteam_round",
    description:
      "ARGUE THE OPPOSING CASE BEFORE ENDORSING. Cite a rubric — the criteria, the register, the goal system — never vibes. Name the KILL-CRITERION: what would have to be true for this to be the wrong call, then look for it. An override blesses past an unmet criterion and is logged WITH its dissent, never as a clean pass. Scale to the gate's risk.",
    required: true,
  },
  {
    name: "verdict",
    description: "PASS, PASS WITH NOTED OVERRIDES, or REOPEN with the named states and reasons. No silent pass.",
    required: true,
  },
];

function stateFromNote(machineId: string, note: LedgerNode): StateDecl {
  if (note.kind !== "machine_state") {
    throw new MachineCompileError(machineId, note.id, `a drawn state points at a machine_state note (kind: ${note.kind})`);
  }
  const x = note.extra;
  const stateId = x.state;
  if (typeof stateId !== "string" || stateId === "") {
    throw new MachineCompileError(machineId, note.id, "missing state (the state's id)");
  }
  const kindRaw = x.state_kind;
  const kind = kindRaw === "work" || kindRaw === "gate" || kindRaw === "terminal" ? kindRaw : null;
  if (kind === null) {
    throw new MachineCompileError(machineId, note.id, `state_kind must be work | gate | terminal (got ${JSON.stringify(kindRaw)})`);
  }
  const filledRaw = x.filled_by;
  const filled = filledRaw === "agent" || filledRaw === "engine" ? filledRaw : null;
  if (filled === null) {
    throw new MachineCompileError(machineId, note.id, `filled_by must be agent | engine (got ${JSON.stringify(filledRaw)})`);
  }
  const command = x.command;
  if (filled === "engine" && (typeof command !== "string" || command === "")) {
    throw new MachineCompileError(machineId, note.id, "engine-filled states declare their command");
  }
  const submachine = x.submachine;
  return {
    id: stateId,
    kind,
    statement: note.statement,
    filled_by: filled,
    ...(typeof command === "string" && command !== "" ? { command } : {}),
    guidance: section(note.body, "Guidance"),
    // THE STANDARD ROUNDS ARE INJECTED HERE, at the single source, for EVERY
    // gate (i12/R30). se.meth-gate-review has required verify / validate /
    // redteam / state_of_the_art / verdict since it was written, and said in
    // its own text: "The compiler will inject the standard fields into every
    // gate's form (single source); until then, fill them from here."
    // Nothing ever did — so no evidence form asked for them, and NOT ONE was
    // filled in any gate of any iteration. That is how a requirement (R3) was
    // violated by the design that claimed to satisfy it and no round caught it.
    // A gate's own specifics come FIRST; the rounds evaluate them.
    evidence_form: [...evidenceForm(machineId, note), ...(kind === "gate" ? STANDARD_ROUNDS : [])],
    ...(typeof submachine === "string" && submachine !== "" ? { submachine } : {}),
    edges: [],
  };
}

export function machineShortId(node: LedgerNode): string {
  return node.localId.replace(/^machine-/, "");
}

export function compileMachine(ledger: Ledger, machineNodeId: string): MachineDecl {
  const mnode = ledger.nodes.get(machineNodeId);
  if (mnode === undefined) throw new MachineCompileError(machineNodeId, "ledger", "machine node not found");
  if (mnode.kind !== "machine" || mnode.format !== "canvas") {
    throw new MachineCompileError(machineNodeId, "node", `not a canvas machine (kind ${mnode.kind})`);
  }
  const canvas = mnode.canvas as CanvasData;
  const fm = canvas.metadata.frontmatter ?? {};
  const entry = fm.entry;
  if (typeof entry !== "string" || entry === "") {
    throw new MachineCompileError(machineNodeId, "frontmatter", "missing entry (the initial state)");
  }
  const reentryRaw = fm.reentry ?? "restart";
  const reentry = reentryRaw === "restart" || reentryRaw === "resume" ? reentryRaw : null;
  if (reentry === null) {
    throw new MachineCompileError(machineNodeId, "frontmatter", `reentry must be restart | resume (got ${JSON.stringify(reentryRaw)})`);
  }

  const elements = canvas.nodes ?? [];
  const states = new Map<string, StateDecl>();
  const byElement = new Map<string, StateDecl>();
  const groups: CanvasElement[] = [];

  for (const el of elements) {
    if (el.type === "group") {
      groups.push(el);
      continue;
    }
    if (el.type === "text") continue; // comments — a drawing may annotate itself
    if (el.type !== "file") {
      throw new MachineCompileError(machineNodeId, `canvas node ${el.id}`, `states are file nodes onto notes (got type ${el.type})`);
    }
    const m = (el.file ?? "").match(LEDGER_REF);
    if (!m) {
      throw new MachineCompileError(machineNodeId, `canvas node ${el.id}`, `file ${JSON.stringify(el.file)} is not a ledger path`);
    }
    const targetId = `${m[1]}.${m[2]}`;
    const target = ledger.nodes.get(targetId);
    if (target === undefined) {
      throw new MachineCompileError(machineNodeId, `canvas node ${el.id}`, `dangling reference: ${targetId} is not in the ledger`);
    }
    let decl: StateDecl;
    if (m[3] === "canvas") {
      if (target.kind !== "machine") {
        throw new MachineCompileError(machineNodeId, `canvas node ${el.id}`, `${targetId} is a canvas but not a machine`);
      }
      decl = {
        id: machineShortId(target),
        kind: "work",
        statement: target.statement,
        filled_by: "agent",
        guidance: "The nested machine's states carry their own statements; browse down one level.",
        evidence_form: [],
        submachine: target.id,
        edges: [],
      };
    } else {
      decl = stateFromNote(machineNodeId, target);
    }
    if (states.has(decl.id)) {
      throw new MachineCompileError(machineNodeId, `canvas node ${el.id}`, `duplicate state ${decl.id}`);
    }
    states.set(decl.id, decl);
    byElement.set(el.id, decl);
  }

  // Group membership is geometric: a state whose center sits inside the
  // group rectangle carries its label (presentation only).
  for (const el of elements) {
    const s = byElement.get(el.id);
    if (s === undefined) continue;
    const cx = el.x + el.width / 2;
    const cy = el.y + el.height / 2;
    for (const g of groups) {
      if (cx >= g.x && cx <= g.x + g.width && cy >= g.y && cy <= g.y + g.height && typeof g.label === "string" && g.label !== "") {
        (s as { group?: string }).group = g.label;
      }
    }
  }

  for (const edge of canvas.edges ?? []) {
    const from = byElement.get(edge.fromNode);
    const to = byElement.get(edge.toNode);
    if (from === undefined || to === undefined) {
      throw new MachineCompileError(machineNodeId, `canvas edge ${edge.id}`, "both ends must be drawn states");
    }
    const roleRaw = edge.styleAttributes?.role ?? null;
    const role = roleRaw === null ? "normal" : roleRaw;
    if (typeof role !== "string" || !ROLES.has(role)) {
      throw new MachineCompileError(machineNodeId, `canvas edge ${edge.id}`, `unknown role ${JSON.stringify(roleRaw)}`);
    }
    const guard = (edge.label ?? "").trim();
    if (guard !== "") {
      try {
        evalGuard(guard, {});
      } catch {
        throw new MachineCompileError(
          machineNodeId,
          `canvas edge ${edge.id}`,
          `label must be a guard (<counter> <op> <int>), got ${JSON.stringify(guard)}`,
        );
      }
    }
    const decl: EdgeDecl = { to: to.id, role: role as EdgeRole, ...(guard !== "" ? { guard } : {}) };
    from.edges.push(decl);
  }

  const machine: MachineDecl = {
    id: machineShortId(mnode),
    reentry,
    initial: entry,
    states: [...states.values()],
  };
  try {
    validateMachine(machine);
  } catch (e) {
    throw new MachineCompileError(machineNodeId, "machine", String((e as Error).message));
  }
  return machine;
}
