// Canvas → MachineDecl — v2's compiler grammar, minus the ledger: the
// drawn machine compiles at load, writes nothing, and refuses with the
// offending element named — a silent misparse would compute the wrong
// `next` confidently.
//
// The drawn form (v2 parity):
//   - states are FILE NODES onto state notes (.md, see engine/notes.ts);
//     a file node onto another .canvas nests that machine
//   - edge role rides styleAttributes.role (absent = normal)
//   - the edge label is the guard
//   - group membership is geometric (presentation only)
//   - text nodes are comments — a drawing may annotate itself
//   - escape and ask-human edges are never drawn — the executor owns them
//   - canvas frontmatter: entry (initial state), reentry (restart|resume)
import { existsSync } from "node:fs";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { loadCanvas, type CanvasElement } from "../canvas.ts";
import { loadStateNote, section, type FrontmatterValue } from "../notes.ts";
import { CONDITION_TYPES, conditionNoteAbs, conditionNotePath } from "../conditions.ts";
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

/**
 * THE STANDARD REVIEW ROUNDS — ported from v2 (which ported them from v1's
 * milestone-review guide). Every gate carries these in addition to its own
 * acceptance items. They are REQUIRED: a review that nothing asks for is a
 * review that never happens — i12 found that three separate times.
 */
export const STANDARD_ROUNDS: EvidenceField[] = [
  {
    name: "verify_round",
    description:
      "BUILT IT RIGHT: every input state since the last gate, its evidence read against its claim. Open what the evidence points at rather than trusting its description of itself — a bless is not proof.",
    required: true,
  },
  {
    name: "validate_round",
    description:
      "BUILT THE RIGHT THING: against the frame and the goal, not merely this step's own plan. List what is missing, wrong or out of scope.",
    required: true,
  },
  {
    name: "redteam_round",
    description:
      "ARGUE THE OPPOSING CASE BEFORE ENDORSING. Cite a rubric, never vibes. Name the KILL-CRITERION: what would have to be true for this to be the wrong call, then look for it. An override is logged WITH its dissent, never as a clean pass.",
    required: true,
  },
  {
    name: "verdict",
    description: "PASS, PASS WITH NOTED OVERRIDES, or REOPEN with the named states and reasons. No silent pass.",
    required: true,
  },
];

function evidenceForm(machineId: string, noteName: string, body: string): EvidenceField[] {
  const text = section(body, "Evidence form");
  if (text === "") return [];
  return text
    .split("\n")
    .filter((l) => l.trim() !== "")
    .map((line) => {
      const m = line.trim().match(/^- (.+?) \| (.+?) \| (required|optional)$/);
      if (!m) {
        throw new MachineCompileError(
          machineId,
          noteName,
          `malformed evidence-form line ${JSON.stringify(line.trim())} (want "- name | description | required|optional")`,
        );
      }
      return { name: m[1], description: m[2], required: m[3] === "required" };
    });
}

/** File refs are VAULT-RELATIVE (the Obsidian vault root is product/ —
 *  owner fix 2026-07-26): "deliverable/machines/states/x.md". Canvas-dir-
 *  relative and root-relative are accepted as fallbacks. */
export function resolveRef(root: string, canvasPath: string, ref: string): string {
  if (isAbsolute(ref)) return ref;
  const vault = join(resolve(root), "product", ref);
  if (existsSync(vault)) return vault;
  const nearCanvas = join(dirname(canvasPath), ref);
  if (existsSync(nearCanvas)) return nearCanvas;
  return join(resolve(root), ref);
}

export function compileMachine(root: string, canvasPath: string): MachineDecl {
  const machineId = canvasPath.replace(/\\/g, "/").split("/").pop()!.replace(/\.canvas$/, "");
  const canvas = loadCanvas(canvasPath);
  const fm = canvas.metadata?.frontmatter ?? {};
  const reentryRaw = fm.reentry ?? "restart";
  const reentry = reentryRaw === "restart" || reentryRaw === "resume" ? reentryRaw : null;
  if (reentry === null) {
    throw new MachineCompileError(machineId, "frontmatter", `reentry must be restart | resume (got ${JSON.stringify(reentryRaw)})`);
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
    if (el.type === "text") continue; // comments
    if (el.type !== "file") {
      throw new MachineCompileError(machineId, `canvas node ${el.id}`, `states are file nodes onto notes (got type ${el.type})`);
    }
    const ref = el.file ?? "";
    let decl: StateDecl;
    if (ref.endsWith(".canvas")) {
      // A drawn machine nested as a state.
      const subId = ref.replace(/\\/g, "/").split("/").pop()!.replace(/\.canvas$/, "");
      decl = {
        id: subId,
        kind: "work",
        statement: `The ${subId} machine.`,
        guidance: `A sub-machine: entering this state enters ${subId} at its start; this state completes when ${subId} reaches its end.`,
        evidence_form: [],
        submachine: ref,
        edges: [],
      };
    } else if (ref.endsWith(".md")) {
      const notePath = resolveRef(root, canvasPath, ref);
      if (!existsSync(notePath)) {
        throw new MachineCompileError(machineId, `canvas node ${el.id}`, `dangling reference: ${ref} not found`);
      }
      decl = stateFromNote(machineId, ref, notePath, root);
    } else {
      throw new MachineCompileError(machineId, `canvas node ${el.id}`, `file ${JSON.stringify(ref)} is neither a state note (.md) nor a machine (.canvas)`);
    }
    if (states.has(decl.id)) {
      throw new MachineCompileError(machineId, `canvas node ${el.id}`, `duplicate state ${decl.id}`);
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
        s.group = g.label;
      }
    }
  }

  for (const edge of canvas.edges ?? []) {
    const from = byElement.get(edge.fromNode);
    const to = byElement.get(edge.toNode);
    if (from === undefined || to === undefined) {
      throw new MachineCompileError(machineId, `canvas edge ${edge.id}`, "both ends must be drawn states");
    }
    const roleRaw = edge.styleAttributes?.role ?? null;
    const role = roleRaw === null ? "normal" : roleRaw;
    if (typeof role !== "string" || !ROLES.has(role)) {
      throw new MachineCompileError(machineId, `canvas edge ${edge.id}`, `unknown role ${JSON.stringify(roleRaw)}`);
    }
    const guard = (edge.label ?? "").trim();
    if (guard !== "") {
      try {
        evalGuard(guard, {});
      } catch {
        throw new MachineCompileError(
          machineId,
          `canvas edge ${edge.id}`,
          `label must be a guard (<counter> <op> <int>), got ${JSON.stringify(guard)}`,
        );
      }
    }
    const decl: EdgeDecl = { to: to.id, role: role as EdgeRole, ...(guard !== "" ? { guard } : {}) };
    from.edges.push(decl);
  }

  // start and end are MECHANICAL: every machine has exactly one of each.
  // The machinery enters at start (no frontmatter entry needed) and the
  // machine is done when end activates.
  const starts = [...states.values()].filter((s) => s.kind === "start");
  const ends = [...states.values()].filter((s) => s.kind === "end");
  if (starts.length !== 1) {
    throw new MachineCompileError(machineId, "machine", `every machine has exactly ONE start state (found ${starts.length})`);
  }
  if (ends.length !== 1) {
    throw new MachineCompileError(machineId, "machine", `every machine has exactly ONE end state (found ${ends.length})`);
  }
  const machine: MachineDecl = {
    id: machineId,
    reentry,
    initial: starts[0].id,
    states: [...states.values()],
  };
  try {
    validateMachine(machine);
  } catch (e) {
    throw new MachineCompileError(machineId, "machine", String((e as Error).message));
  }
  return machine;
}

function asString(v: FrontmatterValue | undefined): string | undefined {
  return typeof v === "string" ? v : undefined;
}

function asList(v: FrontmatterValue | undefined): string[] | undefined {
  const s = asString(v);
  if (s === undefined || s === "") return undefined;
  return s.split(",").map((t) => t.trim()).filter((t) => t !== "");
}

/** entry:/exit: dictionaries — key = condition type, value = its arguments. */
function conditionDict(machineId: string, ref: string, root: string, which: string, v: FrontmatterValue | undefined): Record<string, string[]> | undefined {
  if (v === undefined) return undefined;
  if (typeof v === "string") {
    throw new MachineCompileError(machineId, ref, `${which} is a DICTIONARY: an indented "  <type>: <args>" line per condition`);
  }
  const out: Record<string, string[]> = {};
  for (const [key, args] of Object.entries(v)) {
    if (!CONDITION_TYPES.has(key)) {
      throw new MachineCompileError(machineId, ref, `unknown ${which} condition type ${JSON.stringify(key)} — engine types: ${[...CONDITION_TYPES].join(", ")}`);
    }
    if (!existsSync(conditionNoteAbs(root, key))) {
      throw new MachineCompileError(machineId, ref, `condition type ${key} has no note at ${conditionNotePath(key)} — every type is defined by its note`);
    }
    out[key] = args === "" ? [] : args.split(",").map((t) => t.trim()).filter((t) => t !== "");
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

function stateFromNote(machineId: string, ref: string, notePath: string, root: string): StateDecl {
  const note = loadStateNote(notePath);
  const x = note.frontmatter;
  const stateId = asString(x.state);
  if (stateId === undefined || stateId === "") {
    throw new MachineCompileError(machineId, ref, "missing state (the state's id) in frontmatter");
  }
  const KINDS = ["work", "gate", "terminal", "start", "end"];
  const kindRaw = asString(x.state_kind);
  const kind = kindRaw !== undefined && KINDS.includes(kindRaw) ? (kindRaw as "work" | "gate" | "terminal" | "start" | "end") : null;
  if (kind === null) {
    throw new MachineCompileError(machineId, ref, `state_kind must be one of ${KINDS.join(" | ")} (got ${JSON.stringify(x.state_kind)})`);
  }
  // AGENT-FACING lives in FRONTMATTER; the body is prose for humans (owner
  // ruling 2026-07-26). guidance is a frontmatter field — short by design,
  // and NEVER empty: a state with nothing to say is a state that leaves the
  // agent guessing (owner ruling, same day).
  const guidance = asString(x.guidance);
  if (guidance === undefined || guidance.trim() === "") {
    throw new MachineCompileError(machineId, ref, "every state carries guidance (frontmatter `guidance:`)");
  }
  const legalTools = asList(x.legal_tools);
  const entry = conditionDict(machineId, ref, root, "entry", x.entry);
  const exit = conditionDict(machineId, ref, root, "exit", x.exit);
  const tags = asList(x.tags);
  const submachine = asString(x.submachine);
  return {
    id: stateId,
    kind,
    statement: note.statement,
    guidance,
    evidence_form: [...evidenceForm(machineId, ref, note.body), ...(kind === "gate" ? STANDARD_ROUNDS : [])],
    ...(submachine !== undefined && submachine !== "" ? { submachine } : {}),
    ...(legalTools !== undefined ? { legal_tools: legalTools } : {}),
    ...(entry !== undefined ? { entry } : {}),
    ...(exit !== undefined ? { exit } : {}),
    ...(tags !== undefined ? { tags } : {}),
    edges: [],
  };
}
