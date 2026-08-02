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
import { existsSync, readFileSync } from "node:fs";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { loadCanvas, type CanvasElement } from "../canvas.ts";
import { contentHash } from "../hash.ts";
import { loadStateNote, section } from "../notes.ts";
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

// THE STANDARD REVIEW ROUNDS moved to machine.ts, where BOTH compilers can
// reach one copy. Re-exported so existing importers keep working.
export { STANDARD_ROUNDS } from "../machine.ts";

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

/** File refs are VAULT-RELATIVE (the Obsidian vault root is project/ —
 *  owner fix 2026-07-26): "deliverable/machines/states/x.md". Canvas-dir-
 *  relative and root-relative are accepted as fallbacks. */
export function resolveRef(root: string, canvasPath: string, ref: string): string {
  if (isAbsolute(ref)) return ref;
  const vault = join(resolve(root), "project", ref);
  if (existsSync(vault)) return vault;
  const nearCanvas = join(dirname(canvasPath), ref);
  if (existsSync(nearCanvas)) return nearCanvas;
  return join(resolve(root), ref);
}

// THE DRAWING IS DATA, AND DATA IS LIVE (owner ruling 2026-07-29). Editing a
// state note used to do nothing until se_reload, which contradicts the law
// that the markdown is the single truth: the file said one thing and the
// running lane enforced another.
//
// Compiling on every gate would re-read a canvas and a dozen notes per call,
// so the result is cached against the SOURCES it was built from. Anything
// the compile touched is watched; a changed size or mtime rebuilds. The
// canvas is always among them, so a state ADDED to the drawing invalidates
// too — which a watch on the notes alone would miss.
const CACHE = new Map<string, { decl: MachineDecl; sources: string[]; stamp: string; epoch: number; at: number }>();

// ONE VALIDATION PER WALK STEP. The stamp stays CONTENT (the law above),
// but one pull validates the same machine dozens of times while routing,
// and re-hashing a dozen notes each time was ~1.5s of every booted walk
// (profiled 2026-08-02). pull and advance bump the epoch, so "the next
// call" still re-verifies; the time window is the backstop for surfaces
// that poll between walk steps — the mirror re-verifies at most once a
// second.
let EPOCH = 1;
export function bumpDrawingEpoch(): void {
  EPOCH++;
}
const TRUST_MS = 1000;

// STAMPED BY CONTENT, not by size and mtime. Those two are the usual cheap
// answer and they are wrong here: a priority edited from 0.01 to 0.75 keeps
// the byte count exactly, so a same-size edit inside one filesystem
// timestamp tick would go unseen. Hashing a dozen small notes costs far less
// than the compile it skips, and it cannot miss.
function stampOf(paths: readonly string[]): string {
  return paths
    .map((p) => {
      try {
        return `${p}@${contentHash(readFileSync(p))}`;
      } catch {
        return `${p}@gone`;
      }
    })
    .join("|");
}

/** compileMachine, memoised on the files it read. Same answer, same object,
 *  until one of those files moves. */
export function compileMachineCached(root: string, canvasPath: string): MachineDecl {
  const key = `${resolve(root)}::${canvasPath}`;
  const hit = CACHE.get(key);
  const now = Date.now();
  if (hit !== undefined) {
    if (hit.epoch === EPOCH && now - hit.at < TRUST_MS) return hit.decl;
    if (stampOf(hit.sources) === hit.stamp) {
      hit.epoch = EPOCH;
      hit.at = now;
      return hit.decl;
    }
  }
  const sources: string[] = [];
  const decl = compileMachine(root, canvasPath, sources);
  CACHE.set(key, { decl, sources, stamp: stampOf(sources), epoch: EPOCH, at: now });
  return decl;
}

/** sources, when given, collects every file this compile read — the cache's
 *  watch list. Compiling without it is unchanged. */
export function compileMachine(root: string, canvasPath: string, sources?: string[]): MachineDecl {
  const machineId = canvasPath.replace(/\\/g, "/").split("/").pop()!.replace(/\.canvas$/, "");
  sources?.push(canvasPath);
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
      // A drawn machine nested as a state — its priority is declared in the
      // sub-canvas frontmatter (it has no note).
      const subId = ref.replace(/\\/g, "/").split("/").pop()!.replace(/\.canvas$/, "");
      const subPath = resolveRef(root, canvasPath, ref);
      sources?.push(subPath);
      const subFm = existsSync(subPath) ? (loadCanvas(subPath).metadata?.frontmatter ?? {}) : {};
      const subPriority = asPriority(subFm.priority);
      if (subPriority === undefined) {
        throw new MachineCompileError(machineId, `canvas node ${el.id}`, `${subId}.canvas declares no priority in its frontmatter — every state has one (0.01 mechanical .. 0.8 killer; 1 ideation; above 1 human-only)`);
      }
      // A sub-canvas may carry conditions in its frontmatter (flat keys,
      // like a note) — e.g. start_iteration's needs-retro gate.
      const subEntry = conditionDict(machineId, ref, root, "entry", subFm);
      const subExit = conditionDict(machineId, ref, root, "exit", subFm);
      decl = {
        id: subId,
        kind: "work",
        statement: typeof subFm.statement === "string" ? subFm.statement : "",
        guidance: `A sub-machine: entering this state enters ${subId} at its start; this state completes when ${subId} reaches its end.`,
        evidence_form: [],
        submachine: ref,
        priority: subPriority,
        ...(subEntry !== undefined ? { entry: subEntry } : {}),
        ...(subExit !== undefined ? { exit: subExit } : {}),
        edges: [],
      };
    } else if (ref.endsWith(".md")) {
      const notePath = resolveRef(root, canvasPath, ref);
      sources?.push(notePath);
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

  const drawn: DrawnEdge[] = [];
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
    drawn.push({ from, decl: { to: to.id, role: role as EdgeRole, ...(guard !== "" ? { guard } : {}) }, declared: roleRaw !== null, id: edge.id });
    // ONE ARROW, BOTH WAYS (owner ruling 2026-07-28). Drawing a forward edge
    // and a return edge as two separate arrows is what Obsidian makes
    // tedious; a DOUBLE-HEADED arrow is what a person naturally draws
    // instead, and Obsidian offers it in its own editor. So it means exactly
    // that pair.
    //
    // The return half is left UNDECLARED on purpose, so the depth rule below
    // names it: forward is whichever end lies deeper from start, and the
    // other way round is the return. Nothing new decides anything.
    if ((edge as { fromEnd?: string }).fromEnd === "arrow" && ((edge as { toEnd?: string }).toEnd ?? "arrow") === "arrow") {
      drawn.push({ from: to, decl: { to: from.id, role: "normal", ...(guard !== "" ? { guard } : {}) }, declared: false, id: `${edge.id}~return` });
    }
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
  for (const d of normalizeDrawnEdges(machineId, drawn, starts[0].id)) d.from.edges.push(d.decl);
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

interface DrawnEdge {
  from: StateDecl;
  decl: EdgeDecl;
  /** true when the drawing carries an explicit styleAttributes.role. */
  declared: boolean;
  id: string;
}

/** THE MACHINES-ARE-DRAWN LAW (owner ruling 2026-07-28): the engine accepts
 *  what a person naturally draws in Obsidian — no invisible metadata.
 *  - The same pair drawn twice collapses to one edge; an authored role wins.
 *  - An undeclared edge running OPPOSITE a forward edge is a RETURN and
 *    compiles as alternative. Forward is the edge whose target lies deeper
 *    from start; equal depth is ambiguous and refuses with the edge named. */
function normalizeDrawnEdges(machineId: string, drawn: DrawnEdge[], initial: string): DrawnEdge[] {
  const byPair = new Map<string, DrawnEdge[]>();
  for (const d of drawn) {
    const key = `${d.from.id}->${d.decl.to}`;
    const group = byPair.get(key);
    if (group === undefined) byPair.set(key, [d]);
    else group.push(d);
  }
  const kept: DrawnEdge[] = [];
  for (const [key, group] of byPair) {
    if (group.length === 1) {
      kept.push(group[0]);
      continue;
    }
    const authored = group.filter((d) => d.declared);
    const roles = new Set(authored.map((d) => d.decl.role));
    if (roles.size > 1) {
      throw new MachineCompileError(
        machineId,
        `canvas edges ${group.map((d) => d.id).join(", ")}`,
        `${key} is drawn ${group.length} times with conflicting roles (${[...roles].join(" vs ")})`,
      );
    }
    kept.push(authored[0] ?? group[0]);
  }
  const depth = new Map<string, number>([[initial, 0]]);
  let frontier = [initial];
  while (frontier.length > 0) {
    const next: string[] = [];
    for (const id of frontier) {
      for (const d of kept) {
        if (d.from.id !== id || depth.has(d.decl.to)) continue;
        depth.set(d.decl.to, (depth.get(id) ?? 0) + 1);
        next.push(d.decl.to);
      }
    }
    frontier = next;
  }
  const forward = (from: string, to: string) =>
    kept.some((d) => d.from.id === from && d.decl.to === to && (d.decl.role === "normal" || d.decl.role === "approval"));
  for (const d of kept) {
    if (d.declared || d.decl.role !== "normal") continue;
    if (!forward(d.decl.to, d.from.id)) continue;
    const df = depth.get(d.from.id) ?? Infinity;
    const dt = depth.get(d.decl.to) ?? Infinity;
    if (dt < df) {
      d.decl.role = "alternative";
      continue;
    }
    if (df < dt) continue;
    throw new MachineCompileError(
      machineId,
      `canvas edge ${d.id}`,
      `${d.from.id} and ${d.decl.to} point at each other and neither lies closer to start — give the return edge a role`,
    );
  }
  return kept;
}

function asString(v: unknown): string | undefined {
  return typeof v === "string" ? v : undefined;
}

/** A list may be a YAML list (Obsidian chips) or a comma-separated string. */
function asList(v: unknown): string[] | undefined {
  if (Array.isArray(v)) {
    const out = v.map((x) => String(x).trim()).filter((x) => x !== "");
    return out.length > 0 ? out : undefined;
  }
  const s = asString(v);
  if (s === undefined || s === "") return undefined;
  return s.split(",").map((t) => t.trim()).filter((t) => t !== "");
}

function asPriority(v: unknown): number | undefined {
  const n = typeof v === "number" ? v : typeof v === "string" && v !== "" ? Number(v) : NaN;
  // Above 1 = beyond the slider: the agent can never enter, the human
  // always may (the archives browse at 1.5).
  return Number.isFinite(n) && n >= 0 && n <= 1.5 ? n : undefined;
}

/** Conditions are FLAT frontmatter keys — exit_read, exit_script,
 *  entry_<type> — because nested dictionaries render as JSON blobs in
 *  Obsidian Properties (owner ruling: Obsidian-editable). */
function conditionDict(machineId: string, ref: string, root: string, which: "entry" | "exit", fm: Record<string, unknown>): Record<string, string[]> | undefined {
  const out: Record<string, string[]> = {};
  for (const [k, v] of Object.entries(fm)) {
    if (!k.startsWith(`${which}_`)) continue;
    const key = k.slice(which.length + 1);
    if (!CONDITION_TYPES.has(key)) {
      throw new MachineCompileError(machineId, ref, `unknown ${which} condition type ${JSON.stringify(key)} — engine types: ${[...CONDITION_TYPES].join(", ")}`);
    }
    if (!existsSync(conditionNoteAbs(root, key))) {
      throw new MachineCompileError(machineId, ref, `condition type ${key} has no note at ${conditionNotePath(key)} — every type is defined by its note`);
    }
    out[key] = asList(v) ?? [];
  }
  if (fm[which] !== undefined) {
    throw new MachineCompileError(machineId, ref, `${which}: is not a field — conditions are FLAT keys (${which}_read, ${which}_script)`);
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

export function stateFromNote(machineId: string, ref: string, notePath: string, root: string): StateDecl {
  const note = loadStateNote(notePath);
  const x = note.frontmatter;
  const stateId = asString(x.state);
  if (stateId === undefined || stateId === "") {
    throw new MachineCompileError(machineId, ref, "missing state (the state's id) in frontmatter");
  }
  const KINDS = ["work", "gate", "terminal", "start", "end", "join"];
  const kindRaw = asString(x.state_kind);
  const kind = kindRaw !== undefined && KINDS.includes(kindRaw) ? (kindRaw as StateDecl["kind"]) : null;
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
  const priority = asPriority(x.priority);
  if (priority === undefined) {
    throw new MachineCompileError(machineId, ref, "every state carries a priority (frontmatter `priority:` 0.01 mechanical .. 0.8 killer)");
  }
  const legalTools = asList(x.legal_tools);
  const repairTools = asList(x.repair_tools);
  const entry = conditionDict(machineId, ref, root, "entry", x);
  const exit = conditionDict(machineId, ref, root, "exit", x);
  const tags = asList(x.tags);
  const submachine = asString(x.submachine);
  return {
    id: stateId,
    kind,
    // The statement is AUTHORED frontmatter, never derived from the H1 —
    // it exists only when it adds meaning; the mirror shows it under the
    // node's name.
    statement: asString(x.statement) ?? "",
    guidance,
    priority,
    evidence_form: [...evidenceForm(machineId, ref, note.body), ...(kind === "gate" ? STANDARD_ROUNDS : [])],
    ...(submachine !== undefined && submachine !== "" ? { submachine } : {}),
    ...(legalTools !== undefined ? { legal_tools: legalTools } : {}),
    ...(repairTools !== undefined ? { repair_tools: repairTools } : {}),
    ...(entry !== undefined ? { entry } : {}),
    ...(exit !== undefined ? { exit } : {}),
    ...(tags !== undefined ? { tags } : {}),
    edges: [],
  };
}
