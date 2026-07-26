// The session — every server process runs one instance of the MAIN machine
// (product/deliverable/machines/main.canvas). start and end are MECHANICAL
// states every machine has: the machinery auto-advances out of start, and a
// machine is done when end activates.
//
// THE TICK is the universal walk operation (owner ruling 2026-07-26):
//   tick(advance=false) → information about where the machine is
//   tick(advance=true)  → complete the current state, move on (seeding and
//                         closing sub-machines as the walk crosses them)
// The agent's se_boot and se_exit, and the manual walker (se-manual), all
// drive the same tick core — one machinery, several hands.
//
// THE STATE GATE lives here too: what is legal now is the active states'
// `legal_tools` (legal STATES are the machine's edges — the gate is only
// about tools), enforced at dispatch.
//
// State is in-memory: a server restart mid-session drops back to start, and
// the next refused call's remedy re-boots the agent in one turn.
import { join } from "node:path";
import { CLAUSES, Rejection } from "./errors.ts";
import {
  activeStates,
  completeState,
  type MachineDecl,
  type MachineInstance,
  type StateDecl,
} from "./machine.ts";
import { compileMachine, resolveRef } from "./machines/compile.ts";

/** Observability is never gated (v2: "the emit group is always safe to call"). */
const ALWAYS_LEGAL: ReadonlySet<string> = new Set(["se_state"]);
/** The machinery's drivers — legal in mechanical start states. */
const MACHINERY: readonly string[] = ["se_boot"];

export function mainMachinePath(root: string): string {
  return join(root, "product", "deliverable", "machines", "main.canvas");
}

function newInstance(m: MachineDecl): MachineInstance {
  return {
    machine: m.id,
    iteration: "session",
    current: m.initial,
    counters: {},
    history: [],
    escapes: [],
    status: "open",
  };
}

interface SubRun {
  decl: MachineDecl;
  instance: MachineInstance;
  /** The main-machine state this sub fills. */
  parentState: string;
}

export class Session {
  private readonly root: string;
  readonly machine: MachineDecl;
  readonly instance: MachineInstance;
  private sub?: SubRun;
  /** Evidence store: "<machine>/<state>" → what was submitted. */
  private readonly evidence = new Map<string, Record<string, unknown>>();

  constructor(root: string) {
    this.root = root;
    // Fail fast at server start: a misdrawn machine must not silently serve
    // an ungated lane.
    this.machine = compileMachine(root, mainMachinePath(root));
    this.instance = newInstance(this.machine);
  }

  private state(m: MachineDecl, id: string): StateDecl {
    const s = m.states.find((st) => st.id === id);
    if (s === undefined) throw new Error(`undeclared state ${id}`);
    return s;
  }

  /** The sub governs as long as it exists — including its visible end
   *  position; it is cleared when its parent state completes. */
  private inSub(): boolean {
    return this.sub !== undefined;
  }

  /** The machine+states whose legal_tools govern right now. */
  private leaves(): { machine: MachineDecl; ids: string[] } {
    if (this.inSub()) return { machine: this.sub!.decl, ids: activeStates(this.sub!.instance) };
    return { machine: this.machine, ids: activeStates(this.instance) };
  }

  active(): string[] {
    const { ids } = this.leaves();
    return this.inSub() ? ids.map((s) => `${this.sub!.decl.id}/${s}`) : ids;
  }

  /** Where the walk is, machine-wise: ["main"] or ["main", "boot"]. */
  breadcrumb(): string[] {
    return this.inSub() ? [this.machine.id, this.sub!.decl.id] : [this.machine.id];
  }

  /** The machine to DISPLAY: only ever one (owner ruling 2026-07-26). */
  currentMachine(): MachineDecl {
    return this.inSub() ? this.sub!.decl : this.machine;
  }

  legal(): { all: boolean; tools: Set<string> } {
    const { machine, ids } = this.leaves();
    const tools = new Set<string>();
    let all = false;
    for (const id of ids) {
      const s = this.state(machine, id);
      // Mechanical states: the machinery's drivers are what is legal.
      if (s.kind === "start" || s.kind === "end") for (const t of MACHINERY) tools.add(t);
      for (const t of s.legal_tools ?? []) {
        if (t === "all") all = true;
        else tools.add(t);
      }
    }
    return { all, tools };
  }

  /** THE STATE GATE — a dispatch guard, throws the typed refusal. */
  gate(tool: string): void {
    if (ALWAYS_LEGAL.has(tool)) return;
    const { all, tools } = this.legal();
    if (all || tools.has(tool)) return;
    if (this.instance.status === "closed") {
      throw new Rejection({
        clause: CLAUSES.NOT_LEGAL_IN_STATE,
        expected: "an open session machine",
        got: `${tool} after the machine closed`,
        remedy: { tool: "se_state", args: {}, note: "only se_state answers now; a new session starts at the beginning" },
        source: "engine/session.ts gate",
      });
    }
    const active = this.active().join(", ");
    const legalList = [...tools].join(", ") || "(none)";
    throw new Rejection({
      clause: CLAUSES.NOT_LEGAL_IN_STATE,
      expected: `a tool legal in state [${active}]: ${legalList}`,
      got: tool,
      remedy: tools.has("se_boot")
        ? { tool: "se_boot", args: {}, note: "boot first — follow each step it returns, then show the user the booted banner verbatim" }
        : { tool: "se_state", args: {}, note: "see where the machine is and what is legal" },
      source: "engine/session.ts gate",
    });
  }

  // ── CONDITIONS (SCXML-style: authored on the note, evaluated as the
  //    transition's cond — leave_when of the source AND enter_when of the
  //    target must hold) ──────────────────────────────────────────────────

  private evidenceKey(m: MachineDecl, stateId: string): string {
    return `${m.id}/${stateId}`;
  }

  conditionMet(m: MachineDecl, s: StateDecl, which: "enter" | "leave"): boolean {
    const cond = (which === "leave" ? s.leave_when : s.enter_when) ?? "always";
    if (cond === "always") return true;
    if (cond === "read_guidance") {
      return this.evidence.get(this.evidenceKey(m, s.id))?.read_confirmed === true;
    }
    return false;
  }

  /** Record evidence for a state in the CURRENT machine (walk position's machine). */
  submitEvidence(stateId: string, data: Record<string, unknown>): Record<string, unknown> {
    const { machine } = this.leaves();
    const s = this.state(machine, stateId);
    const key = this.evidenceKey(machine, s.id);
    const record = { ...(this.evidence.get(key) ?? {}), ...data, at: new Date().toISOString() };
    this.evidence.set(key, record);
    return { state: `${machine.id}/${s.id}`, evidence: record };
  }

  private assertConditions(m: MachineDecl, from: StateDecl, to?: string): void {
    if (!this.conditionMet(m, from, "leave")) {
      throw new Rejection({
        clause: CLAUSES.CONDITION_UNMET,
        expected: `leave condition of ${from.id}: ${from.leave_when} (read the guidance, then confirm)`,
        got: "no evidence yet",
        remedy: { tool: "se_boot", args: { confirm_read: true }, note: "confirm ONLY after actually reading the guidance — the confirmation is logged as your evidence" },
        source: "engine/session.ts conditions",
      });
    }
    const targetId = to ?? (from.edges.length === 1 ? from.edges[0].to : undefined);
    if (targetId === undefined) return;
    const target = m.states.find((s) => s.id === targetId);
    if (target === undefined) return;
    if (!this.conditionMet(m, target, "enter")) {
      throw new Rejection({
        clause: CLAUSES.CONDITION_UNMET,
        expected: `enter condition of ${target.id}: ${target.enter_when}`,
        got: "no evidence yet",
        remedy: { tool: "se_state", args: {}, note: "the enter condition must hold before this state can activate" },
        source: "engine/session.ts conditions",
      });
    }
  }

  // ── THE TICK ────────────────────────────────────────────────────────────

  /** tick without arguments: information about where the machine is. */
  tickInfo(): Record<string, unknown> {
    const { machine, ids } = this.leaves();
    const states = ids.map((id) => {
      const s = this.state(machine, id);
      return {
        id: this.inSub() ? `${machine.id}/${s.id}` : s.id,
        kind: s.kind,
        statement: s.statement,
        guidance: s.guidance,
        legal_tools: s.kind === "start" || s.kind === "end" ? [...MACHINERY] : (s.legal_tools ?? []),
        leave_when: s.leave_when ?? "always",
        leave_met: this.conditionMet(machine, s, "leave"),
        next: s.edges.map((e) => {
          const t = machine.states.find((st) => st.id === e.to);
          return {
            to: e.to,
            role: e.role,
            ...(e.guard !== undefined ? { guard: e.guard } : {}),
            enter_when: t?.enter_when ?? "always",
            enter_met: t === undefined ? true : this.conditionMet(machine, t, "enter"),
          };
        }),
      };
    });
    const { all, tools } = this.legal();
    return {
      machine: this.machine.id,
      breadcrumb: this.breadcrumb(),
      active: this.active(),
      status: this.instance.status,
      legal_tools: all ? "all" : [...ALWAYS_LEGAL, ...tools],
      states,
    };
  }

  /** tick with arguments: complete the current state and move on.
   *  `to` picks the outgoing edge (required only when there are several). */
  tickAdvance(to?: string): Record<string, unknown> {
    const now = new Date().toISOString();
    if (this.instance.status === "closed") {
      throw new Rejection({
        clause: CLAUSES.NOT_LEGAL_IN_STATE,
        expected: "an open machine",
        got: "a tick after end",
        remedy: { tool: "se_state", args: {}, note: "the machine is done; a new session starts at the beginning" },
        source: "engine/session.ts tick",
      });
    }
    // ONE VISIBLE STEP PER TICK (owner ruling 2026-07-26): you are only
    // ever in one state, and a tick moves exactly one position — including
    // the mechanical start/end positions of a sub-machine.
    if (this.inSub()) {
      if (this.sub!.instance.status !== "open") {
        // Standing on the sub's end: this tick returns to the parent.
        completeState(this.machine, this.instance, this.sub!.parentState, "filled", now);
        this.instance.history.push({ state: this.sub!.parentState, outcome: "filled", at: now });
        this.sub = undefined;
        this.seedSubs();
        return this.tickInfo();
      }
      const cur = activeStates(this.sub!.instance)[0];
      this.assertEdge(this.sub!.decl, cur, to);
      this.assertConditions(this.sub!.decl, this.state(this.sub!.decl, cur), to);
      completeState(this.sub!.decl, this.sub!.instance, cur, "filled", now, to);
      this.sub!.instance.history.push({ state: cur, outcome: "filled", at: now });
      this.instance.history.push({ state: `${this.sub!.decl.id}/${cur}`, outcome: "filled", at: now });
      return this.tickInfo();
    }
    const cur = activeStates(this.instance)[0];
    this.assertEdge(this.machine, cur, to);
    this.assertConditions(this.machine, this.state(this.machine, cur), to);
    completeState(this.machine, this.instance, cur, "filled", now, to);
    this.instance.history.push({ state: cur, outcome: "filled", at: now });
    this.seedSubs();
    return this.tickInfo();
  }

  /** A chosen way out must be one of the state's drawn edges. */
  private assertEdge(m: MachineDecl, stateId: string, to?: string): void {
    if (to === undefined) return;
    const s = this.state(m, stateId);
    if (s.edges.some((e) => e.to === to)) return;
    throw new Rejection({
      clause: CLAUSES.NOT_LEGAL_IN_STATE,
      expected: `one of ${stateId}'s next states: ${s.edges.map((e) => e.to).join(", ") || "(none)"}`,
      got: to,
      remedy: { tool: "se_state", args: {}, note: "the drawn edges are the legal next states" },
      source: "engine/session.ts tick",
    });
  }

  /** Enter any newly-active sub-machine state — the position becomes the
   *  sub's mechanical start; nothing inside is walked yet. */
  private seedSubs(): void {
    const subState = activeStates(this.instance)
      .map((s) => this.state(this.machine, s))
      .find((s) => s.submachine !== undefined);
    if (subState === undefined) return;
    const subPath = resolveRef(this.root, mainMachinePath(this.root), subState.submachine!);
    const decl = compileMachine(this.root, subPath);
    this.sub = { decl, instance: newInstance(decl), parentState: subState.id };
  }

  // ── The agent's hands on the tick ───────────────────────────────────────

  /** se_boot: one boot step per call — the agent's ticks skip straight
   *  through mechanical start/end positions; banner when idle is reached.
   *  confirm_read: the caller confirms having read the current state's
   *  guidance — recorded as evidence for a read_guidance leave condition. */
  boot(confirmRead = false): Record<string, unknown> {
    if (this.instance.status === "closed" || (!this.inSub() && activeStates(this.instance).includes("idle"))) {
      throw new Rejection({
        clause: CLAUSES.NOT_LEGAL_IN_STATE,
        expected: "an unbooted session",
        got: `se_boot in state [${this.active().join(", ")}]`,
        remedy: { tool: "se_state", args: {}, note: "already booted — carry on through the lane" },
        source: "engine/session.ts boot",
      });
    }
    if (confirmRead) {
      const { ids } = this.leaves();
      this.submitEvidence(ids[0], { read_confirmed: true, by: "agent" });
    }
    // Tick until a non-mechanical position (max a machine's worth of steps).
    for (let i = 0; i < 16; i++) {
      this.tickAdvance();
      const { machine, ids } = this.leaves();
      const kind = this.state(machine, ids[0]).kind;
      if (kind !== "start" && kind !== "end") break;
      if (this.instance.status === "closed") break;
    }
    if (!this.inSub() && activeStates(this.instance).includes("idle")) return this.bootedPacket();
    const { machine, ids } = this.leaves();
    const s = this.state(machine, ids[0]);
    return {
      phase: this.active()[0],
      statement: s.statement,
      guidance: s.guidance,
      action: "Do what the guidance says, then call se_boot again to complete this step.",
    };
  }

  private bootedPacket(): Record<string, unknown> {
    const idle = this.machine.states.find((s) => s.id === "idle");
    return {
      booted: true,
      machine: this.machine.id,
      state: activeStates(this.instance),
      banner: "🦆 SE v3 booted — main machine @ idle. All work runs through the se lane; every call is logged. se_state shows where you are.",
      display: "Show the banner above to the user VERBATIM as your first output, then proceed with their request.",
      guidance: idle?.guidance ?? "",
    };
  }

  /** se_exit: from idle, walk into end. */
  exit(): Record<string, unknown> {
    if (this.inSub() || !activeStates(this.instance).includes("idle")) {
      throw new Rejection({
        clause: CLAUSES.NOT_LEGAL_IN_STATE,
        expected: "an idle session",
        got: `se_exit in state [${this.active().join(", ")}]`,
        remedy: { tool: "se_state", args: {} },
        source: "engine/session.ts exit",
      });
    }
    this.tickAdvance();
    return {
      closed: true,
      banner: "🦆 SE v3 session closed. The main machine reached end; a new session starts at the beginning.",
    };
  }

  describe(): Record<string, unknown> {
    const { all, tools } = this.legal();
    return {
      machine: this.machine.id,
      breadcrumb: this.breadcrumb(),
      active: this.active(),
      ...(this.inSub() ? { submachine: { id: this.sub!.decl.id, active: activeStates(this.sub!.instance) } } : {}),
      status: this.instance.status,
      legal_tools: all ? "all" : [...ALWAYS_LEGAL, ...tools],
      history: this.instance.history.slice(-10),
    };
  }
}
