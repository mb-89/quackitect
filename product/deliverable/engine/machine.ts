// The state machine (§6, P4 §10). `next` is computable, not heuristic.
// A policy IS a machine; tailoring is removing transitions.
//
// Schema rules held here:
// - Edge roles declared, never inferred: normal | alternative | fallback |
//   recovery | approval | error.
// - Failure kinds never conflated: Rejected (never retry) · Failed (opens
//   fallbacks) · Errored (retry with backoff).
// - Priority total: authored > fallback > escape > ask-human.
// - Extended state: counters as variables, guards over them.
// - Escape records which guard was exhausted.
// - Re-entry declared per machine; default restart.
// - filled_by: agent | engine — engine-filled states declare their command
//   on the state; mechanical states fill, never bless.

export type EdgeRole = "normal" | "alternative" | "fallback" | "recovery" | "approval" | "error";

export interface EvidenceField {
  name: string;
  description: string;
  required: boolean;
}

export interface EdgeDecl {
  to: string;
  role: EdgeRole;
  /** Guard over extended state, e.g. "attempts < 3". Absent = always open. */
  guard?: string;
}

export interface StateDecl {
  id: string;
  kind: "work" | "gate" | "terminal";
  /** Diagram grouping, e.g. "boot" — presentation metadata, no run-time meaning. */
  group?: string;
  statement: string;
  filled_by: "agent" | "engine";
  /** Declared on the state, never invented at run time (engine-filled only). */
  command?: string;
  /** Pillar 1 — the method slice for this step, inlined. */
  guidance: string;
  /** The evidence form `submit` must satisfy (shape check; review checks quality). */
  evidence_form: EvidenceField[];
  /** A nested machine: a ledger machine id, or "iteration" — the iteration may provide its own. */
  submachine?: string;
  edges: EdgeDecl[];
}

export interface MachineDecl {
  id: string;
  reentry: "restart" | "resume";
  initial: string;
  states: StateDecl[];
}

export interface MachineInstance {
  machine: string;
  iteration: string;
  current: string;
  /** The token set: every concurrently active state. Absent = [current] (adoption). */
  active?: string[];
  /** Fired edges awaiting consumption by a join, as "from->to" keys. */
  fired?: string[];
  /** Which session holds which active state. */
  claims?: Record<string, string>;
  /** An engine-filled state's background run awaiting completion. */
  pending_run?: { state: string; ref: string };
  /** Extended state: counters as variables. */
  counters: Record<string, number>;
  history: { state: string; outcome: "filled" | "failed" | "escaped" | "abandoned"; evidence?: string; at: string }[];
  /** Escape records which guard was exhausted. */
  escapes: { state: string; exhausted_guard: string; at: string }[];
  status: "open" | "closed" | "abandoned";
}

/** Load-time checks: every state reaches a terminal; edges point at states. */
export function validateMachine(m: MachineDecl): void {
  const byId = new Map(m.states.map((s) => [s.id, s]));
  if (!byId.has(m.initial)) throw new Error(`${m.id}: initial state ${m.initial} undeclared`);
  for (const s of m.states) {
    for (const e of s.edges) {
      if (!byId.has(e.to)) throw new Error(`${m.id}: ${s.id} -> ${e.to} points at an undeclared state`);
    }
    if (s.filled_by === "engine" && !s.command) throw new Error(`${m.id}: ${s.id} is engine-filled but declares no command`);
  }
  // Reverse reachability from terminals.
  const reachesTerminal = new Set(m.states.filter((s) => s.kind === "terminal").map((s) => s.id));
  if (reachesTerminal.size === 0) throw new Error(`${m.id}: no terminal state`);
  let grew = true;
  while (grew) {
    grew = false;
    for (const s of m.states) {
      if (reachesTerminal.has(s.id)) continue;
      if (s.edges.some((e) => reachesTerminal.has(e.to))) {
        reachesTerminal.add(s.id);
        grew = true;
      }
    }
  }
  const dead = m.states.filter((s) => !reachesTerminal.has(s.id));
  if (dead.length > 0) throw new Error(`${m.id}: no path to a terminal from: ${dead.map((s) => s.id).join(", ")}`);
}

/** Guards are a fixed tiny language: `<counter> <op> <int>`. */
export function evalGuard(guard: string | undefined, counters: Record<string, number>): boolean {
  if (!guard) return true;
  const m = guard.match(/^([a-z_]+)\s*(<|<=|>|>=|==)\s*(\d+)$/);
  if (!m) throw new Error(`unparseable guard: ${guard}`);
  const v = counters[m[1]] ?? 0;
  const n = Number(m[3]);
  switch (m[2]) {
    case "<": return v < n;
    case "<=": return v <= n;
    case ">": return v > n;
    case ">=": return v >= n;
    default: return v === n;
  }
}

export type StepOutcome = "filled" | "failed";

/** The token set with adoption: an instance without active[] reads as [current]. */
export function activeStates(inst: MachineInstance): string[] {
  return inst.active ?? [inst.current];
}

/**
 * The token op: complete one active state, fire its matching outbound
 * edges, activate every successor whose required inbound edges have ALL
 * fired (consuming them), and keep `current` as the first-token alias.
 */
export function completeState(
  m: MachineDecl,
  inst: MachineInstance,
  stateId: string,
  outcome: StepOutcome,
  now: string,
): { activated: string[] } {
  const state = m.states.find((s) => s.id === stateId);
  if (!state) throw new Error(`completeState: undeclared state ${stateId}`);
  let active = activeStates(inst).slice();
  if (!active.includes(stateId)) throw new Error(`completeState: ${stateId} is not active`);
  active = active.filter((s) => s !== stateId);
  if (inst.claims) delete inst.claims[stateId];
  const roles: EdgeRole[] = outcome === "filled" ? ["normal", "alternative", "approval", "recovery"] : ["fallback", "error"];
  inst.fired ??= [];
  const activated: string[] = [];
  for (const e of state.edges) {
    if (!roles.includes(e.role)) continue;
    if (!evalGuard(e.guard, inst.counters)) continue;
    if (e.role === "normal" || e.role === "approval") {
      // AND-join fuel: the key waits until every required inbound fired.
      const key = `${stateId}->${e.to}`;
      if (!inst.fired.includes(key)) inst.fired.push(key);
    } else if (!active.includes(e.to) && !activated.includes(e.to)) {
      // OR paths (alternative, recovery, fallback, error): activate directly.
      activated.push(e.to);
      const target = m.states.find((s) => s.id === e.to)!;
      if (target.kind === "terminal") inst.status = "closed";
    }
  }
  for (const s of m.states) {
    if (active.includes(s.id) || activated.includes(s.id)) continue;
    // Required inbound: normal and approval edges. Alternatives are OR paths
    // and never hold a join hostage.
    const inbound = m.states.flatMap((src) =>
      src.edges.filter((e) => e.to === s.id && (e.role === "normal" || e.role === "approval")).map(() => `${src.id}->${s.id}`),
    );
    if (inbound.length === 0) continue;
    if (!inbound.every((k) => inst.fired!.includes(k))) continue;
    inst.fired = inst.fired!.filter((k) => !inbound.includes(k)); // consume
    activated.push(s.id);
    if (s.kind === "terminal") inst.status = "closed";
  }
  inst.active = [...active, ...activated];
  inst.current = inst.active[0] ?? stateId;
  void now;
  return { activated };
}

/**
 * Advance the instance after a step outcome. Priority is total:
 * authored (normal/alternative/approval) > fallback/recovery > escape.
 * Returns the escape record when every guard is exhausted.
 */
export function advance(
  m: MachineDecl,
  inst: MachineInstance,
  outcome: StepOutcome,
  now: string,
): { moved: boolean; escaped?: string } {
  const state = m.states.find((s) => s.id === inst.current);
  if (!state) throw new Error(`instance at undeclared state ${inst.current}`);
  // recovery fires on FILLED: a successful repair returns into the verifying
  // state. Failure opens fallbacks and error paths.
  const authored: EdgeRole[] = outcome === "filled" ? ["normal", "alternative", "approval"] : [];
  const fallback: EdgeRole[] = outcome === "filled" ? ["recovery"] : ["fallback", "error"];
  for (const roles of [authored, fallback]) {
    for (const e of state.edges) {
      if (!roles.includes(e.role)) continue;
      if (!evalGuard(e.guard, inst.counters)) continue;
      inst.current = e.to;
      const next = m.states.find((s) => s.id === e.to)!;
      if (next.kind === "terminal") inst.status = "closed";
      return { moved: true };
    }
  }
  // Escape to parent (implicit). Single flat machine at bootstrap: escape
  // closes nothing — it records the exhausted guard and asks the human.
  const guards = state.edges.filter((e) => e.guard).map((e) => e.guard!).join("; ") || "(no guarded edges)";
  inst.escapes.push({ state: state.id, exhausted_guard: guards, at: now });
  return { moved: false, escaped: guards };
}
