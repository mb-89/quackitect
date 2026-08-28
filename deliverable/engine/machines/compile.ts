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
import { type CanvasElement, loadCanvas } from "../canvas.ts";
import { CONDITION_TYPES, conditionNoteAbs, conditionNotePath } from "../conditions.ts";
import { contentHash } from "../hash.ts";
import {
  type EdgeDecl,
  type EdgeRole,
  type EvidenceField,
  evalGuard,
  type MachineDecl,
  type StateDecl,
  validateMachine,
} from "../machine.ts";
import { loadStateNote, readNode } from "../notes.ts";
import { parseEvidence } from "../rigor-matrix.ts";
import { loadLevels, valueFor } from "../scale.ts";
import { assertCanSupply } from "./supply.ts";

const ROLES: ReadonlySet<string> = new Set(["normal", "alternative", "fallback", "recovery", "approval", "error"]);

export class MachineCompileError extends Error {
  constructor(machine: string, element: string, message: string) {
    super(`${machine}: ${element}: ${message}`);
    this.name = "MachineCompileError";
  }
}

// THE STANDARD REVIEW ROUNDS moved to machine.ts, where BOTH compilers can
// reach one copy. Re-exported so existing importers keep working.
import { roundsFor, STANDARD_ROUNDS } from "../machine.ts";

export { STANDARD_ROUNDS };

// see dsp-method-compilation.md#a-drawn-states-evidence-is-the-matrixs-evidence
function evidenceForm(machineId: string, noteName: string, fm: Record<string, unknown>, body: string): EvidenceField[] {
  try {
    return parseEvidence(fm, noteName, body);
  } catch (e) {
    throw new MachineCompileError(machineId, noteName, e instanceof Error ? e.message : String(e));
  }
}

/** File refs are VAULT-RELATIVE (the Obsidian vault root is the repository
 *  root since the folder levels collapsed —
 *  owner fix ): "deliverable/machines/states/x.md". Canvas-dir-
 *  relative and root-relative are accepted as fallbacks. */
export function resolveRef(root: string, canvasPath: string, ref: string): string {
  if (isAbsolute(ref)) return ref;
  const vault = join(resolve(root), ref);
  if (existsSync(vault)) return vault;
  const nearCanvas = join(dirname(canvasPath), ref);
  if (existsSync(nearCanvas)) return nearCanvas;
  return join(resolve(root), ref);
}

// see dsp-method-compilation.md#the-drawing-is-data-and-data-is-live
const CACHE = new Map<string, { decl: MachineDecl; sources: string[]; stamp: string; epoch: number }>();

// see dsp-method-compilation.md#one-validation-per-call
let EPOCH = 1;

/** How many holds are open. While one is, the drawing is not re-validated.
 *
 *  ONE VALIDATION PER CALL IS WHAT THIS ALWAYS MEANT, and it was being paid per
 *  HOP. A pull that sweeps thirty hops bumped the epoch thirty times, and each
 *  bump re-hashes every source of every cached machine.
 *
 *  MEASURED on one hop that does no work: 3,454 ms of `existsSync` and 1,403 ms
 *  of `readFileUtf8`, which is 55 per cent of it. Thousands of reads to guard
 *  against an edit nobody made.
 *
 *  THE RULING: take the hash, do the work from the warm model, and check the
 *  hash afterwards. Do not throw the model away because something MIGHT change.
 *  The only reason a mid-call edit was a real hazard is that the call took
 *  twenty seconds, and it took twenty seconds because of the guarding.
 *
 *  THE GUARANTEE HOLDS. An edit between calls is seen, because the next call
 *  bumps. An edit DURING one is caught by `drawingChangedUnderUs` at release. */
let HELD = 0;

export function bumpDrawingEpoch(): void {
  if (HELD > 0) return;
  EPOCH++;
}

/** Hold the drawing for the length of one call. Nested holds are counted, so an
 *  inner hold cannot release an outer one. */
export function holdDrawing(): void {
  HELD++;
}

export function releaseDrawing(): void {
  if (HELD > 0) HELD--;
}

/** Did anything the call relied on move underneath it?
 *
 *  THIS IS THE AFTER-CHECK, and it is what makes holding safe. It re-stamps
 *  every cached drawing and answers which ones no longer match. Empty means the
 *  warm model the call worked from was valid the whole way through.
 *
 *  IT COSTS ONE PASS, not one per hop, which is the whole point. */
export function drawingChangedUnderUs(): string[] {
  const moved: string[] = [];
  for (const [key, hit] of CACHE) {
    if (stampOf(hit.sources) !== hit.stamp) moved.push(key);
  }
  return moved;
}

// STAMPED BY CONTENT, not by size and mtime. Those two are the usual cheap
// answer and they are wrong here: a priority edited from 0.01 to 0.75 keeps
// the byte count exactly, so a same-size edit inside one filesystem
// timestamp tick would go unseen. Hashing a dozen small notes costs far less
// than the compile it skips, and it cannot miss.
function stampOf(paths: readonly string[]): string {
  return paths
    .map((p) => {
      // THROUGH THE DOOR, which already holds this text for every other
      // reader of the same drawing. The hash is a cache key, so it only has
      // to be STABLE — it is now over the string rather than the bytes.
      const text = readNode(p);
      return text === "" ? `${p}@gone` : `${p}@${contentHash(text)}`;
    })
    .join("|");
}

/** compileMachine, memoised on the files it read. Same answer, same object,
 *  until one of those files moves. */
export function compileMachineCached(root: string, canvasPath: string): MachineDecl {
  const key = `${resolve(root)}::${canvasPath}`;
  const hit = CACHE.get(key);
  if (hit !== undefined) {
    if (hit.epoch === EPOCH) return hit.decl;
    if (stampOf(hit.sources) === hit.stamp) {
      hit.epoch = EPOCH;
      return hit.decl;
    }
  }
  const sources: string[] = [];
  const decl = compileMachine(root, canvasPath, sources);
  CACHE.set(key, { decl, sources, stamp: stampOf(sources), epoch: EPOCH });
  return decl;
}

/** sources, when given, collects every file this compile read — the cache's
 *  watch list. Compiling without it is unchanged. */
/** One drawn FILE node becomes a state: a nested .canvas machine, or a .md
 *  note. Anything else refuses with the node named. */
function stateFromElement(machineId: string, root: string, canvasPath: string, el: CanvasElement, sources?: string[]): StateDecl {
  if (el.type !== "file") {
    throw new MachineCompileError(machineId, `canvas node ${el.id}`, `states are file nodes onto notes (got type ${el.type})`);
  }
  const ref = el.file ?? "";
  if (ref.endsWith(".canvas")) {
    // A drawn machine nested as a state — its priority is declared in the
    // sub-canvas frontmatter (it has no note).
    const subId = ref
      .replace(/\\/g, "/")
      .split("/")
      .pop()!
      .replace(/\.canvas$/, "");
    const subPath = resolveRef(root, canvasPath, ref);
    sources?.push(subPath);
    const subFm = existsSync(subPath) ? (loadCanvas(subPath).metadata?.frontmatter ?? {}) : {};
    const subPriority = asPriority(subFm.priority, root);
    if (subPriority === undefined) {
      throw new MachineCompileError(
        machineId,
        `canvas node ${el.id}`,
        `${subId}.canvas declares no priority in its frontmatter — every state has one, named as a rung from machines/scale.md: mechanical, operational, tactical, strategic, ideation. blocked means the person only.`,
      );
    }
    // A sub-canvas may carry conditions in its frontmatter (flat keys,
    // like a note) — e.g. start_iteration's needs-retro gate.
    const subEntry = conditionDict(machineId, ref, root, "entry", subFm);
    const subExit = conditionDict(machineId, ref, root, "exit", subFm);
    return {
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
  }
  if (ref.endsWith(".md")) {
    const notePath = resolveRef(root, canvasPath, ref);
    sources?.push(notePath);
    if (!existsSync(notePath)) {
      throw new MachineCompileError(machineId, `canvas node ${el.id}`, `dangling reference: ${ref} not found`);
    }
    return stateFromNote(machineId, ref, notePath, root);
  }
  throw new MachineCompileError(
    machineId,
    `canvas node ${el.id}`,
    `file ${JSON.stringify(ref)} is neither a state note (.md) nor a machine (.canvas)`,
  );
}

// Group membership is geometric: a state whose center sits inside the
// group rectangle carries its label (presentation only).
function assignGroups(elements: CanvasElement[], byElement: Map<string, StateDecl>, groups: CanvasElement[]): void {
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
}

type LoadedCanvas = ReturnType<typeof loadCanvas>;
type CanvasEdge = NonNullable<LoadedCanvas["edges"]>[number];

function edgeRoleOf(machineId: string, edge: CanvasEdge): { role: EdgeRole; declared: boolean } {
  const roleRaw = edge.styleAttributes?.role ?? null;
  const role = roleRaw === null ? "normal" : roleRaw;
  if (typeof role !== "string" || !ROLES.has(role)) {
    throw new MachineCompileError(machineId, `canvas edge ${edge.id}`, `unknown role ${JSON.stringify(roleRaw)}`);
  }
  return { role: role as EdgeRole, declared: roleRaw !== null };
}

function edgeGuardOf(machineId: string, edge: CanvasEdge): string {
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
  return guard;
}

function drawnEdgesOf(machineId: string, canvas: LoadedCanvas, byElement: Map<string, StateDecl>): DrawnEdge[] {
  const drawn: DrawnEdge[] = [];
  for (const edge of canvas.edges ?? []) {
    const from = byElement.get(edge.fromNode);
    const to = byElement.get(edge.toNode);
    if (from === undefined || to === undefined) {
      throw new MachineCompileError(machineId, `canvas edge ${edge.id}`, "both ends must be drawn states");
    }
    const { role, declared } = edgeRoleOf(machineId, edge);
    const guard = edgeGuardOf(machineId, edge);
    drawn.push({
      from,
      decl: { to: to.id, role, ...(guard !== "" ? { guard } : {}) },
      declared,
      id: edge.id,
    });
    // see dsp-method-compilation.md#one-arrow-both-ways
    if ((edge as { fromEnd?: string }).fromEnd === "arrow" && ((edge as { toEnd?: string }).toEnd ?? "arrow") === "arrow") {
      drawn.push({
        from: to,
        decl: { to: from.id, role: "normal", ...(guard !== "" ? { guard } : {}) },
        declared: false,
        id: `${edge.id}~return`,
      });
    }
  }
  return drawn;
}

/** sources, when given, collects every file this compile read — the cache's
 *  watch list. Compiling without it is unchanged. */
export function compileMachine(root: string, canvasPath: string, sources?: string[]): MachineDecl {
  const machineId = canvasPath
    .replace(/\\/g, "/")
    .split("/")
    .pop()!
    .replace(/\.canvas$/, "");
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
    const decl = stateFromElement(machineId, root, canvasPath, el, sources);
    if (states.has(decl.id)) {
      throw new MachineCompileError(machineId, `canvas node ${el.id}`, `duplicate state ${decl.id}`);
    }
    states.set(decl.id, decl);
    byElement.set(el.id, decl);
  }

  assignGroups(elements, byElement, groups);
  const drawn = drawnEdgesOf(machineId, canvas, byElement);

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
    // NO STATE DEMANDS WHAT IT CANNOT SUPPLY (i6). Refusing here names the
    // state, the field and the verbs — a fix somebody can make. Refusing at
    // the state names nothing, and the only ways out are an escape or the
    // shell.
    assertCanSupply(root, machine);
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

/** The same pair drawn twice collapses to one edge; an authored role wins.
 *  Conflicting authored roles refuse with every edge named. */
function collapseDuplicatePairs(machineId: string, drawn: DrawnEdge[]): DrawnEdge[] {
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
  return kept;
}

/** Breadth-first depth of every state reachable from start. */
function edgeDepths(kept: DrawnEdge[], initial: string): Map<string, number> {
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
  return depth;
}

/** An undeclared edge running OPPOSITE a forward edge is a RETURN and
 *  compiles as alternative. Equal depth is ambiguous and refuses. */
function markReturnEdges(machineId: string, kept: DrawnEdge[], depth: Map<string, number>): void {
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
}

/** see dsp-method-compilation.md#the-machines-are-drawn-law */
function normalizeDrawnEdges(machineId: string, drawn: DrawnEdge[], initial: string): DrawnEdge[] {
  const kept = collapseDuplicatePairs(machineId, drawn);
  markReturnEdges(machineId, kept, edgeDepths(kept, initial));
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
  return s
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t !== "");
}

/** BLOCKED, AUTHORED ON A STATE. The agent can never enter it, at any
 *  setting; the person always may. The archives are drawn that way.
 *
 *  IT MUST NOT RESOLVE THROUGH THE LADDER, and that is the whole reason this
 *  line stands above the lookup. On the CONTROL, blocked is 0 — the position
 *  where no rung is pressed. As a state's PRIORITY, 0 is the one value that
 *  breaks the promise, because the gate refuses on `priority > autonomy` and
 *  0 > 0 is false. The same word means "nothing gets through" on both sides,
 *  and reaching it needs the opposite end of the range on each. */
const BLOCKED_PRIORITY = 1.5;

function asPriority(v: unknown, root: string): number | undefined {
  // A TIER WORD IS THE AUTHORED TRUTH (owner cut-over ruling );
  // its number is the transitional anchor from the drawn scale. Numeric
  // stays legal while the sweep runs.
  if (typeof v === "string" && v.trim() !== "" && Number.isNaN(Number(v))) {
    try {
      const resolved = valueFor(loadLevels(root), v);
      // see dsp-method-compilation.md#match-the-result
      return resolved === 0 ? BLOCKED_PRIORITY : resolved;
    } catch {
      return undefined;
    }
  }
  const n = typeof v === "number" ? v : typeof v === "string" && v !== "" ? Number(v) : NaN;
  // Above 1 = beyond the dial: the agent can never enter, the human
  // always may (the archives browse at 1.5).
  return Number.isFinite(n) && n >= 0 && n <= 1.5 ? n : undefined;
}

/** Conditions are FLAT frontmatter keys — exit_read, exit_script,
 *  entry_<type> — because nested dictionaries render as JSON blobs in
 *  Obsidian Properties. */
function conditionDict(
  machineId: string,
  ref: string,
  root: string,
  which: "entry" | "exit",
  fm: Record<string, unknown>,
): Record<string, string[]> | undefined {
  const out: Record<string, string[]> = {};
  for (const [k, v] of Object.entries(fm)) {
    if (!k.startsWith(`${which}_`)) continue;
    const key = k.slice(which.length + 1);
    if (!CONDITION_TYPES.has(key)) {
      throw new MachineCompileError(
        machineId,
        ref,
        `unknown ${which} condition type ${JSON.stringify(key)} — engine types: ${[...CONDITION_TYPES].join(", ")}`,
      );
    }
    if (!existsSync(conditionNoteAbs(root, key))) {
      throw new MachineCompileError(
        machineId,
        ref,
        `condition type ${key} has no note at ${conditionNotePath(key)} — every type is defined by its note`,
      );
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
  // see dsp-method-compilation.md#agent-facing-lives-in-frontmatter-the-body-is-prose-for
  const guidance = asString(x.guidance);
  if (guidance === undefined || guidance.trim() === "") {
    throw new MachineCompileError(machineId, ref, "every state carries guidance (frontmatter `guidance:`)");
  }
  const priority = asPriority(x.priority, root);
  if (priority === undefined) {
    throw new MachineCompileError(
      machineId,
      ref,
      "every state carries a priority (frontmatter `priority:` — a tier word from machines/scale.md, mechanical .. ideation)",
    );
  }
  const legalTools = asList(x.legal_tools);
  const repairTools = asList(x.repair_tools);
  const entry = conditionDict(machineId, ref, root, "entry", x);
  const exit = conditionDict(machineId, ref, root, "exit", x);
  const tags = asList(x.tags);
  const submachine = asString(x.submachine);
  // see dsp-method-compilation.md#the-bar-is-authored-in-a-drawing-too
  const busbar = x.busbar === true || kind === "join";
  // see dsp-method-compilation.md#a-state-that-runs-a-machine-carries-no-evidence
  const runsMachine = submachine !== undefined && submachine !== "";
  const declared = [...evidenceForm(machineId, ref, x, note.body), ...(kind === "gate" ? roundsFor(stateId) : [])];
  if (runsMachine && declared.length > 0) {
    process.stderr.write(
      `[compile] ${machineId}/${stateId} runs the ${String(submachine)} machine and declared ${declared.length} evidence field(s). ` +
        `A state that runs a machine carries no evidence of its own — the walk never lands on it, so the form could never be served. ` +
        `Dropped. Put the evidence in a state inside ${String(submachine)}.\n`,
    );
  }
  return {
    id: stateId,
    kind,
    // The statement is AUTHORED frontmatter, never derived from the H1 —
    // it exists only when it adds meaning; the mirror shows it under the
    // node's name.
    statement: asString(x.statement) ?? "",
    guidance,
    priority,
    evidence_form: runsMachine ? [] : declared,
    ...(busbar ? { busbar: true } : {}),
    ...(submachine !== undefined && submachine !== "" ? { submachine } : {}),
    ...(legalTools !== undefined ? { legal_tools: legalTools } : {}),
    ...(repairTools !== undefined ? { repair_tools: repairTools } : {}),
    ...(entry !== undefined ? { entry } : {}),
    ...(exit !== undefined ? { exit } : {}),
    ...(tags !== undefined ? { tags } : {}),
    edges: [],
  };
}
