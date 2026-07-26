// The session machine — every server process runs one instance of the boot
// machine (product/deliverable/machines/boot.canvas). The STATE GATE lives
// here: what is legal now is decided by the active states' `legal` lists,
// enforced at dispatch — the guard v2 declared in packets but never wired.
//
// State is in-memory: a server restart mid-session drops back to unbooted,
// and the next refused call's remedy re-boots the agent in one turn — the
// gate makes boot inevitable, the SessionStart hook merely makes it prompt.
import { join } from "node:path";
import { CLAUSES, Rejection } from "./errors.ts";
import {
  activeStates,
  completeState,
  type MachineDecl,
  type MachineInstance,
  type StateDecl,
} from "./machine.ts";
import { compileMachine } from "./machines/compile.ts";

/** Observability is never gated (v2: "the emit group is always safe to call"). */
const ALWAYS_LEGAL: ReadonlySet<string> = new Set(["se_state"]);

export function bootMachinePath(root: string): string {
  return join(root, "product", "deliverable", "machines", "boot.canvas");
}

export class Session {
  readonly machine: MachineDecl;
  readonly instance: MachineInstance;

  constructor(root: string) {
    // Fail fast at server start: a misparsed machine must not silently serve
    // an ungated lane.
    this.machine = compileMachine(root, bootMachinePath(root));
    this.instance = {
      machine: this.machine.id,
      iteration: "session",
      current: this.machine.initial,
      counters: {},
      history: [],
      escapes: [],
      status: "open",
    };
  }

  private state(id: string): StateDecl {
    const s = this.machine.states.find((st) => st.id === id);
    if (s === undefined) throw new Error(`undeclared state ${id}`);
    return s;
  }

  active(): string[] {
    return activeStates(this.instance);
  }

  /** The union of the active states' legal lists. */
  legal(): { all: boolean; tools: Set<string> } {
    const tools = new Set<string>();
    let all = false;
    for (const id of this.active()) {
      for (const t of this.state(id).legal ?? []) {
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
        remedy: { tool: "se_state", args: {}, note: "only se_state answers now; a new session starts unbooted" },
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
        ? { tool: "se_boot", args: {}, note: "boot first — then show the user the returned banner verbatim and proceed" }
        : { tool: "se_state", args: {}, note: "see where the machine is and what is legal" },
      source: "engine/session.ts gate",
    });
  }

  boot(): Record<string, unknown> {
    if (!this.active().includes("unbooted")) {
      throw new Rejection({
        clause: CLAUSES.NOT_LEGAL_IN_STATE,
        expected: "an unbooted session",
        got: `se_boot in state [${this.active().join(", ")}]`,
        remedy: { tool: "se_state", args: {}, note: "already booted — carry on through the lane" },
        source: "engine/session.ts boot",
      });
    }
    completeState(this.machine, this.instance, "unbooted", "filled", new Date().toISOString());
    this.instance.history.push({ state: "unbooted", outcome: "filled", at: new Date().toISOString() });
    const idle = this.state("idle");
    return {
      booted: true,
      machine: this.machine.id,
      state: this.active(),
      banner: "🦆 SE v3 booted — session machine 'boot' @ idle. All work runs through the se lane; every call is logged. se_state shows where you are.",
      display: "Show the banner above to the user VERBATIM as your first output, then proceed with their request.",
      guidance: idle.guidance,
    };
  }

  exit(): Record<string, unknown> {
    // Reachable only from a state whose legal list admits se_exit (the gate
    // ran first), but check anyway — guards are cheap, wrong states are not.
    if (!this.active().includes("idle")) {
      throw new Rejection({
        clause: CLAUSES.NOT_LEGAL_IN_STATE,
        expected: "an idle session",
        got: `se_exit in state [${this.active().join(", ")}]`,
        remedy: { tool: "se_state", args: {} },
        source: "engine/session.ts exit",
      });
    }
    completeState(this.machine, this.instance, "idle", "filled", new Date().toISOString());
    this.instance.history.push({ state: "idle", outcome: "filled", at: new Date().toISOString() });
    return {
      closed: true,
      banner: "🦆 SE v3 session closed. The machine is done; a new session starts unbooted.",
    };
  }

  describe(): Record<string, unknown> {
    const { all, tools } = this.legal();
    return {
      machine: this.machine.id,
      active: this.active(),
      status: this.instance.status,
      legal: all ? "all" : [...ALWAYS_LEGAL, ...tools],
      history: this.instance.history.slice(-10),
    };
  }
}
