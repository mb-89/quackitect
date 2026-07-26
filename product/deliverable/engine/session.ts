// The session machine — every server process runs one instance of the MAIN
// machine (product/deliverable/machines/main.canvas): start → boot(sub) →
// idle → done. Future work branches from idle.
//
// THE STATE GATE lives here: what is legal now is decided by the active
// states' `legal_tools` lists (legal STATES are the machine's edges — the
// gate is only about tools), enforced at dispatch.
//
// Boot is a SUB-MACHINE (boot.canvas): read_contract → prepare_idle →
// booted. se_boot drives it: each call completes the current step and
// returns the next step's packet, until the sub closes and the main machine
// lands in idle with the booted banner.
//
// State is in-memory: a server restart mid-session drops back to start, and
// the next refused call's remedy re-boots the agent in one turn — the gate
// makes boot inevitable, the SessionStart hook merely makes it prompt.
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

  /** The states whose legal_tools govern right now: the sub's while one runs. */
  private leaves(): { machine: MachineDecl; ids: string[] } {
    if (this.sub !== undefined && this.sub.instance.status === "open") {
      return { machine: this.sub.decl, ids: activeStates(this.sub.instance) };
    }
    return { machine: this.machine, ids: activeStates(this.instance) };
  }

  active(): string[] {
    const { ids } = this.leaves();
    return this.sub !== undefined && this.sub.instance.status === "open" ? ids.map((s) => `${this.sub!.decl.id}/${s}`) : ids;
  }

  legal(): { all: boolean; tools: Set<string> } {
    const { machine, ids } = this.leaves();
    const tools = new Set<string>();
    let all = false;
    for (const id of ids) {
      for (const t of this.state(machine, id).legal_tools ?? []) {
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
        got: `${tool} after se_exit — the session machine is closed`,
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

  /** One boot step: advance the sequence, return the next packet or the banner. */
  boot(): Record<string, unknown> {
    const now = new Date().toISOString();
    const mainActive = activeStates(this.instance);

    // 1. From start: complete it, seed the boot sub-machine.
    if (this.sub === undefined && mainActive.includes(this.machine.initial)) {
      completeState(this.machine, this.instance, this.machine.initial, "filled", now);
      this.instance.history.push({ state: this.machine.initial, outcome: "filled", at: now });
      const subState = activeStates(this.instance)
        .map((s) => this.state(this.machine, s))
        .find((s) => s.submachine !== undefined);
      if (subState === undefined) {
        // A main machine without a boot sub: land wherever start led.
        return this.bootedPacket();
      }
      const subPath = resolveRef(this.root, mainMachinePath(this.root), subState.submachine!);
      const decl = compileMachine(this.root, subPath);
      this.sub = { decl, instance: newInstance(decl), parentState: subState.id };
      return this.stepPacket();
    }

    // 2. Inside the sub: complete the current step.
    if (this.sub !== undefined && this.sub.instance.status === "open") {
      const current = activeStates(this.sub.instance)[0];
      completeState(this.sub.decl, this.sub.instance, current, "filled", now);
      this.sub.instance.history.push({ state: current, outcome: "filled", at: now });
      this.instance.history.push({ state: `${this.sub.decl.id}/${current}`, outcome: "filled", at: now });
      if (this.sub.instance.status !== "open") {
        // Sub closed: the parent state is filled; the main machine moves on.
        completeState(this.machine, this.instance, this.sub.parentState, "filled", now);
        this.instance.history.push({ state: this.sub.parentState, outcome: "filled", at: now });
        return this.bootedPacket();
      }
      return this.stepPacket();
    }

    throw new Rejection({
      clause: CLAUSES.NOT_LEGAL_IN_STATE,
      expected: "an unbooted session",
      got: `se_boot in state [${this.active().join(", ")}]`,
      remedy: { tool: "se_state", args: {}, note: "already booted — carry on through the lane" },
      source: "engine/session.ts boot",
    });
  }

  private stepPacket(): Record<string, unknown> {
    const stateId = activeStates(this.sub!.instance)[0];
    const s = this.state(this.sub!.decl, stateId);
    return {
      phase: `${this.sub!.decl.id}/${s.id}`,
      statement: s.statement,
      guidance: s.guidance,
      action: "Do what the guidance says, then call se_boot again to complete this step.",
    };
  }

  private bootedPacket(): Record<string, unknown> {
    const idle = this.machine.states.find((s) => activeStates(this.instance).includes(s.id));
    return {
      booted: true,
      machine: this.machine.id,
      state: activeStates(this.instance),
      banner: "🦆 SE v3 booted — main machine @ idle. All work runs through the se lane; every call is logged. se_state shows where you are.",
      display: "Show the banner above to the user VERBATIM as your first output, then proceed with their request.",
      guidance: idle?.guidance ?? "",
    };
  }

  exit(): Record<string, unknown> {
    const now = new Date().toISOString();
    if (!activeStates(this.instance).includes("idle") || (this.sub !== undefined && this.sub.instance.status === "open")) {
      throw new Rejection({
        clause: CLAUSES.NOT_LEGAL_IN_STATE,
        expected: "an idle session",
        got: `se_exit in state [${this.active().join(", ")}]`,
        remedy: { tool: "se_state", args: {} },
        source: "engine/session.ts exit",
      });
    }
    completeState(this.machine, this.instance, "idle", "filled", now);
    this.instance.history.push({ state: "idle", outcome: "filled", at: now });
    return {
      closed: true,
      banner: "🦆 SE v3 session closed. The main machine is done; a new session starts at the beginning.",
    };
  }

  describe(): Record<string, unknown> {
    const { all, tools } = this.legal();
    return {
      machine: this.machine.id,
      active: this.active(),
      ...(this.sub !== undefined && this.sub.instance.status === "open"
        ? { submachine: { id: this.sub.decl.id, active: activeStates(this.sub.instance) } }
        : {}),
      status: this.instance.status,
      legal_tools: all ? "all" : [...ALWAYS_LEGAL, ...tools],
      history: this.instance.history.slice(-10),
    };
  }
}
