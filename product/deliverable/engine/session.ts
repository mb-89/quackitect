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
import { dirname, join } from "node:path";
import { CLAUSES, Rejection } from "./errors.ts";
import {
  activeStates,
  completeState,
  reopenStates,
  type MachineDecl,
  type MachineInstance,
  type StateDecl,
} from "./machine.ts";
import { compileMachine, resolveRef } from "./machines/compile.ts";
import { conditionNotePath } from "./conditions.ts";
import { pulledFor, scanGuidance, type GuidanceDoc, type PulledDoc } from "./pull.ts";
import { expClose, expFind, expList, expNew, type Expedition } from "./worktree.ts";
import { spawnSync } from "node:child_process";
import { resolveInRoot } from "./paths.ts";

/** THE TICK is the machinery — one tool, legal in EVERY state. Without
 *  arguments it reports (observability is never gated); with arguments it
 *  advances. */
const ALWAYS_LEGAL: ReadonlySet<string> = new Set(["se_tick"]);
const MACHINERY: readonly string[] = ["se_tick"];

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

/** WHOSE HAND is on the tick. The channel rule (owner ruling 2026-07-26):
 *  HTTP is the human, MCP is the agent. The threshold gates only the
 *  agent's hand — the human always may. */
export type Channel = "human" | "agent";

export class Session {
  private readonly root: string;
  readonly machine: MachineDecl;
  readonly instance: MachineInstance;
  private sub?: SubRun;
  private bannerShown = false;
  /** The bound expedition — while set, the lane works in its worktree. */
  private bound?: Expedition;
  /** Evidence store: "<machine>/<state>" → what was submitted. */
  private readonly evidence = new Map<string, Record<string, unknown>>();
  /** THE THRESHOLD — which states the AGENT may enter by itself: only those
   *  with priority <= threshold. 0 hands every step to the human (manual
   *  mode); 1 is fully autonomous. Content work inside a state is never
   *  gated — only ENTERING is. Live-adjustable (the mirror's slider). */
  private _threshold = 0.5;
  /** Fires once, after the tick that closes the MAIN machine — the server
   *  entry hooks the session shutdown here. */
  onClosed?: () => void;

  constructor(root: string) {
    this.root = root;
    // Fail fast at server start: a misdrawn machine must not silently serve
    // an ungated lane.
    this.machine = compileMachine(root, mainMachinePath(root));
    this.instance = newInstance(this.machine);
  }

  get threshold(): number {
    return this._threshold;
  }

  setThreshold(value: number): Record<string, unknown> {
    if (typeof value !== "number" || Number.isNaN(value) || value < 0 || value > 1) {
      throw new Rejection({
        clause: CLAUSES.REQUIRED_ARGS,
        expected: "a threshold between 0 (every step is the human's) and 1 (fully autonomous)",
        got: String(value),
        remedy: { tool: "se_tick", args: {}, note: "the threshold is set from the mirror's slider or at launch (--threshold)" },
        source: "engine/session.ts threshold",
      });
    }
    const was = this._threshold;
    this._threshold = value;
    return { threshold: value, was };
  }

  /** The threshold gate: an AGENT tick may enter a state only when its
   *  priority <= the session threshold. The human's hand is never gated. */
  private gatePriority(m: MachineDecl, targetIds: string[], channel: Channel): void {
    if (channel !== "agent") return;
    for (const id of targetIds) {
      const t = m.states.find((s) => s.id === id);
      if (t === undefined) continue;
      if (t.priority > this._threshold) {
        throw new Rejection({
          clause: CLAUSES.ABOVE_THRESHOLD,
          expected: `a state within the session threshold ${this._threshold}`,
          got: `${id} weighs ${t.priority} — this step is the human's`,
          remedy: { tool: "se_tick", args: {}, note: "tell the human this step waits for them (they advance it from the mirror, or raise the threshold there) — then WAIT; do not retry" },
          source: "engine/session.ts threshold",
        });
      }
    }
  }

  /** Where the LANE works: the bound expedition's worktree, else the root. */
  workRoot(): string {
    return this.bound?.path ?? this.root;
  }

  expeditionNew(kind: string, goal: string): Record<string, unknown> {
    const e = expNew(this.root, kind, goal);
    return { created: e.id, branch: e.branch, note: "back at idle, enter continue_expedition to work in it" };
  }

  expeditionList(): Record<string, unknown> {
    const all = expList(this.root);
    return {
      open: all.filter((e) => e.open).map((e) => e.id),
      archive: all.filter((e) => !e.open).map((e) => e.id),
    };
  }

  expeditionOpen(id: string): Record<string, unknown> {
    this.bound = expFind(this.root, id);
    return { bound: this.bound.id, note: "the lane now works in this expedition's worktree" };
  }

  expeditionClose(merge: boolean): Record<string, unknown> {
    if (this.bound === undefined) {
      throw new Rejection({
        clause: CLAUSES.NOT_LEGAL_IN_STATE,
        expected: "a bound expedition",
        got: "none open",
        remedy: { tool: "se_exp_list", args: {}, note: "open one first" },
        source: "engine/session.ts expedition",
      });
    }
    const result = expClose(this.root, this.bound, merge);
    this.bound = undefined;
    return { ...result, note: merge ? "merged back — iterations will replace this with design-input handover" : "left unmerged; the branch is the archive record" };
  }

  private unbind(): void {
    this.bound = undefined;
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
        remedy: { tool: "se_tick", args: {}, note: "only the tick answers now; a new session starts at the beginning" },
        source: "engine/session.ts gate",
      });
    }
    const active = this.active().join(", ");
    const legalList = [...tools].join(", ") || "(none)";
    throw new Rejection({
      clause: CLAUSES.NOT_LEGAL_IN_STATE,
      expected: `a tool legal in state [${active}]: ${legalList}`,
      got: tool,
      remedy: { tool: "se_tick", args: {}, note: "walk the machine first — se_tick without arguments shows where you are and what is legal" },
      source: "engine/session.ts gate",
    });
  }

  // ── CONDITIONS (SCXML-style: authored on the note, evaluated as the
  //    transition's cond — leave_when of the source AND enter_when of the
  //    target must hold) ──────────────────────────────────────────────────

  private evidenceKey(m: MachineDecl, stateId: string): string {
    return `${m.id}/${stateId}`;
  }

  /** One condition key of a state's entry/exit dictionary. */
  conditionKeyMet(m: MachineDecl, s: StateDecl, key: string): boolean {
    const ev = this.evidence.get(this.evidenceKey(m, s.id));
    if (key === "read") return ev?.read_confirmed === true;
    if (key === "script") return (ev?.script_result as { ok?: boolean } | undefined)?.ok === true;
    return false;
  }

  /** RUN a state's condition script — legal only while standing in it.
   *  The result is engine-observed evidence; nobody can claim it. */
  scriptRun(stateId: string): Record<string, unknown> {
    this.assertStanding(stateId);
    const { machine } = this.leaves();
    const s = this.state(machine, stateId);
    const scripts = [...(s.exit?.script ?? []), ...(s.entry?.script ?? [])];
    if (scripts.length === 0) {
      throw new Rejection({
        clause: CLAUSES.CONDITION_UNMET,
        expected: `a script condition on ${stateId}`,
        got: "none declared",
        remedy: { tool: "se_tick", args: { state: stateId }, note: "the state's conditions are in its packet" },
        source: "engine/session.ts script",
      });
    }
    const outputs: string[] = [];
    let ok = true;
    for (const rel of scripts) {
      const abs = resolveInRoot(this.root, rel, "engine/session.ts script");
      const r = spawnSync("node", [abs, "--root", this.root], { cwd: this.root, encoding: "utf8", timeout: 120_000, maxBuffer: 8 * 1024 * 1024 });
      const out = `${r.stdout ?? ""}${r.stderr ?? ""}`.trim().slice(0, 4000);
      outputs.push(`${rel} → exit ${r.status}${out === "" ? "" : `\n${out}`}`);
      if (r.status !== 0) ok = false;
    }
    const result = { ok, output: outputs.join("\n"), at: new Date().toISOString() };
    const key = this.evidenceKey(machine, s.id);
    this.evidence.set(key, { ...(this.evidence.get(key) ?? {}), script_result: result });
    return { state: `${machine.id}/${s.id}`, script_result: result };
  }

  scriptStatus(m: MachineDecl, s: StateDecl): { ran: boolean; ok: boolean; output: string } {
    const r = this.evidence.get(this.evidenceKey(m, s.id))?.script_result as { ok?: boolean; output?: string } | undefined;
    return { ran: r !== undefined, ok: r?.ok === true, output: r?.output ?? "" };
  }

  /** All keys of the dictionary must hold. Absent dictionary = always. */
  conditionMet(m: MachineDecl, s: StateDecl, which: "enter" | "leave"): boolean {
    const dict = which === "leave" ? s.exit : s.entry;
    if (dict === undefined) return true;
    return Object.keys(dict).every((k) => this.conditionKeyMet(m, s, k));
  }

  /** Per-key status — the mirror's bubbles and the agent's packet share it. */
  conditionStatus(m: MachineDecl, s: StateDecl, which: "enter" | "leave"): Record<string, { args: string[]; met: boolean; note: string }> | undefined {
    const dict = which === "leave" ? s.exit : s.entry;
    if (dict === undefined) return undefined;
    const out: Record<string, { args: string[]; met: boolean; note: string }> = {};
    for (const [k, args] of Object.entries(dict)) {
      out[k] = { args, met: this.conditionKeyMet(m, s, k), note: conditionNotePath(k) };
    }
    return out;
  }

  private guidanceCache?: GuidanceDoc[];

  /** THE PULL — derived, never authored; see engine/pull.ts. */
  pulled(m: MachineDecl, s: StateDecl): PulledDoc[] {
    this.guidanceCache ??= scanGuidance(this.root);
    return pulledFor(this.root, this.guidanceCache, m, s);
  }

  private assertStanding(stateId: string): void {
    const { ids } = this.leaves();
    if (ids.includes(stateId)) return;
    throw new Rejection({
      clause: CLAUSES.CONDITION_UNMET,
      expected: `to be standing in ${stateId} — conditions are worked only from inside the state`,
      got: `standing in [${this.active().join(", ")}]`,
      remedy: { tool: "se_tick", args: {}, note: "walk to the state first (or jump back to it), then work its conditions" },
      source: "engine/session.ts standing",
    });
  }

  /** Record evidence — only for a state you are STANDING IN (you may have
   *  to do things on disk first; entering the state is the arming step). */
  submitEvidence(stateId: string, data: Record<string, unknown>): Record<string, unknown> {
    this.assertStanding(stateId);
    const { machine } = this.leaves();
    const s = this.state(machine, stateId);
    const key = this.evidenceKey(machine, s.id);
    const record = { ...(this.evidence.get(key) ?? {}), ...data, at: new Date().toISOString() };
    this.evidence.set(key, record);
    return { state: `${machine.id}/${s.id}`, evidence: record };
  }

  private refuseCondition(m: MachineDecl, s: StateDecl, which: "exit" | "entry", key: string, args: string[]): never {
    const stateId = s.id;
    const note = conditionNotePath(key);
    if (key === "script") {
      const st = this.scriptStatus(m, s);
      throw new Rejection({
        clause: CLAUSES.CONDITION_UNMET,
        expected: `${which} condition 'script' of ${stateId} — ${args.join(", ")} exits 0 (see ${note})`,
        got: st.ran ? st.output : "not run yet",
        remedy: { tool: "se_tick", args: { advance: true }, note: "fix what the output names, then tick again — the script re-runs on every attempt" },
        source: "engine/session.ts conditions",
      });
    }
    if (key === "read") {
      throw new Rejection({
        clause: CLAUSES.CONDITION_UNMET,
        expected: `${which} condition 'read' of ${stateId} — confirmed reading of: ${args.join(", ")} (see ${note})`,
        got: "no evidence yet",
        remedy: { tool: "se_tick", args: { confirm: true }, note: "READ the listed documents first (the lane serves them; during boot they ride the packet) — then confirm; the confirmation is logged as your evidence" },
        source: "engine/session.ts conditions",
      });
    }
    throw new Rejection({
      clause: CLAUSES.CONDITION_UNMET,
      expected: `${which} condition '${key}' of ${stateId} (see ${note})`,
      got: "unmet",
      remedy: { tool: "se_file_read", args: { path: note }, note: "the condition's note says what it wants" },
      source: "engine/session.ts conditions",
    });
  }

  private assertConditions(m: MachineDecl, from: StateDecl, to?: string): void {
    if (from.exit?.script !== undefined) this.scriptRun(from.id); // a tick attempt runs the script
    for (const [key, args] of Object.entries(from.exit ?? {})) {
      if (!this.conditionKeyMet(m, from, key)) this.refuseCondition(m, from, "exit", key, args);
    }
    const targetId = to ?? (from.edges.length === 1 ? from.edges[0].to : undefined);
    if (targetId === undefined) return;
    const target = m.states.find((s) => s.id === targetId);
    if (target === undefined) return;
    for (const [key, args] of Object.entries(target.entry ?? {})) {
      if (!this.conditionKeyMet(m, target, key)) this.refuseCondition(m, target, "entry", key, args);
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
        priority: s.priority,
        legal_tools: s.kind === "start" || s.kind === "end" ? [...MACHINERY] : (s.legal_tools ?? []),
        ...(s.entry !== undefined ? { entry: this.conditionStatus(machine, s, "enter") } : {}),
        ...(s.exit !== undefined ? { exit: this.conditionStatus(machine, s, "leave") } : {}),
        exit_met: this.conditionMet(machine, s, "leave"),
        pulled: this.pulled(machine, s),
        // Enough to CHOOSE among several ways forward: what the target is,
        // not just its name (the agent has no other way to peek).
        next: s.edges.map((e) => {
          const t = machine.states.find((st) => st.id === e.to);
          return {
            to: e.to,
            role: e.role,
            ...(e.guard !== undefined ? { guard: e.guard } : {}),
            ...(t !== undefined ? { kind: t.kind, statement: t.statement, priority: t.priority } : {}),
            ...(t?.entry !== undefined ? { entry: this.conditionStatus(machine, t, "enter") } : {}),
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
      ...(this.bound !== undefined ? { expedition: this.bound.id } : {}),
      status: this.instance.status,
      threshold: this._threshold,
      legal_tools: all ? "all" : [...ALWAYS_LEGAL, ...tools],
      states,
    };
  }

  /** tick with arguments: complete the current state and move on.
   *  `to` picks the outgoing edge (needed only when there are several);
   *  `confirm` records that the current state's `read` list was read;
   *  `channel` is whose hand this is — the threshold gates only the agent's. */
  tickAdvance(to?: string, confirm = false, channel: Channel = "human"): Record<string, unknown> {
    const now = new Date().toISOString();
    if (confirm && this.instance.status === "open") {
      const { ids } = this.leaves();
      this.submitEvidence(ids[0], { read_confirmed: true });
    }
    if (this.instance.status === "closed") {
      throw new Rejection({
        clause: CLAUSES.NOT_LEGAL_IN_STATE,
        expected: "an open machine",
        got: "a tick after end",
        remedy: { tool: "se_tick", args: {}, note: "the machine is done; a new session starts at the beginning" },
        source: "engine/session.ts tick",
      });
    }
    // ONE VISIBLE STEP PER TICK (owner ruling 2026-07-26): you are only
    // ever in one state, and a tick moves exactly one position — including
    // the mechanical start/end positions of a sub-machine.
    if (this.inSub()) {
      if (this.sub!.instance.status !== "open") {
        // Standing on the sub's end: this tick returns to the parent —
        // whatever the parent's edges enter is what the threshold weighs.
        const parent = this.state(this.machine, this.sub!.parentState);
        this.gatePriority(this.machine, parent.edges.map((e) => e.to), channel);
        completeState(this.machine, this.instance, this.sub!.parentState, "filled", now);
        this.instance.history.push({ state: this.sub!.parentState, outcome: "filled", at: now });
        this.sub = undefined;
        this.unbind(); // leaving the sub leaves the context (worktree stays)
        this.seedSubs();
        return this.landing();
      }
      const cur = activeStates(this.sub!.instance)[0];
      this.assertEdge(this.sub!.decl, cur, to);
      const subTarget = to ?? this.state(this.sub!.decl, cur).edges[0]?.to;
      if (subTarget !== undefined) this.gatePriority(this.sub!.decl, [subTarget], channel);
      this.assertConditions(this.sub!.decl, this.state(this.sub!.decl, cur), to);
      completeState(this.sub!.decl, this.sub!.instance, cur, "filled", now, to);
      this.sub!.instance.history.push({ state: cur, outcome: "filled", at: now });
      this.instance.history.push({ state: `${this.sub!.decl.id}/${cur}`, outcome: "filled", at: now });
      return this.tickInfo();
    }
    const cur = activeStates(this.instance)[0];
    this.assertEdge(this.machine, cur, to);
    const target = to ?? this.state(this.machine, cur).edges[0]?.to;
    if (target !== undefined) this.gatePriority(this.machine, [target], channel);
    this.assertConditions(this.machine, this.state(this.machine, cur), to);
    completeState(this.machine, this.instance, cur, "filled", now, to);
    this.instance.history.push({ state: cur, outcome: "filled", at: now });
    this.seedSubs();
    return this.landing();
  }

  /** The agent's "click on a state": full information about any state of
   *  the machine you are in (falling back to the main machine). Looking
   *  never moves. */
  stateInfo(id: string): Record<string, unknown> {
    const { machine } = this.leaves();
    const s = machine.states.find((st) => st.id === id) ?? this.machine.states.find((st) => st.id === id);
    if (s === undefined) {
      throw new Rejection({
        clause: CLAUSES.NOT_LEGAL_IN_STATE,
        expected: `a state of ${machine.id}${machine.id === this.machine.id ? "" : ` or ${this.machine.id}`}: ${[...new Set([...machine.states, ...this.machine.states].map((st) => st.id))].join(", ")}`,
        got: id,
        remedy: { tool: "se_tick", args: {}, note: "se_tick without arguments shows where you are" },
        source: "engine/session.ts state-info",
      });
    }
    const home = machine.states.includes(s) ? machine : this.machine;
    return {
      id: s.id,
      kind: s.kind,
      statement: s.statement,
      guidance: s.guidance,
      priority: s.priority,
      legal_tools: s.kind === "start" || s.kind === "end" ? [...MACHINERY] : (s.legal_tools ?? []),
      ...(s.entry !== undefined ? { entry: this.conditionStatus(home, s, "enter") } : {}),
      ...(s.exit !== undefined ? { exit: this.conditionStatus(home, s, "leave") } : {}),
      exit_met: this.conditionMet(home, s, "leave"),
      pulled: this.pulled(home, s),
      ...(s.submachine !== undefined ? { submachine: s.submachine } : {}),
      next: s.edges.map((e) => {
        const t = home.states.find((st) => st.id === e.to);
        return {
          to: e.to,
          role: e.role,
          ...(e.guard !== undefined ? { guard: e.guard } : {}),
          ...(t !== undefined ? { kind: t.kind, statement: t.statement, priority: t.priority } : {}),
        };
      }),
    };
  }

  /** Jump back to an EARLIER state of the machine you are in. Everything
   *  downstream is superseded (kept in the record, never erased) and its
   *  evidence and checks are invalidated — they are earned again on the
   *  re-walk. Legal for the user and the agent alike, while the machine is
   *  open — the agent's hand is still weighed against the threshold
   *  (jumping back ENTERS the target). */
  jumpBack(target: string, channel: Channel = "human"): Record<string, unknown> {
    const now = new Date().toISOString();
    if (this.instance.status === "closed") {
      throw new Rejection({
        clause: CLAUSES.NOT_LEGAL_IN_STATE,
        expected: "an open machine",
        got: `a jump back after end`,
        remedy: { tool: "se_tick", args: {}, note: "the machine is done; a new session starts at the beginning" },
        source: "engine/session.ts jump",
      });
    }
    const { machine, ids } = this.leaves();
    const inst = this.inSub() ? this.sub!.instance : this.instance;
    if (ids.includes(target)) {
      throw new Rejection({
        clause: CLAUSES.NOT_LEGAL_IN_STATE,
        expected: "an EARLIER state",
        got: `${target} is where you are standing`,
        remedy: { tool: "se_tick", args: {}, note: "se_tick without arguments shows the position" },
        source: "engine/session.ts jump",
      });
    }
    const wasFilled = inst.history.some((h) => h.outcome === "filled" && h.state === target);
    if (!wasFilled) {
      throw new Rejection({
        clause: CLAUSES.NOT_LEGAL_IN_STATE,
        expected: `a state already walked in ${machine.id}`,
        got: target,
        remedy: { tool: "se_tick", args: {}, note: "only a filled state can be returned to" },
        source: "engine/session.ts jump",
      });
    }
    this.gatePriority(machine, [target], channel);
    const { cone } = reopenStates(machine, inst, [target], "jump back", now);
    // Invalidate the cone's evidence and checks — including a nested
    // machine's, when a sub-machine state is inside the cone. And supersede
    // the MAIN record's entries for the cone (the nested walk's included):
    // a green state after a jump back would claim work that no longer stands.
    for (const id of cone) {
      this.evidence.delete(this.evidenceKey(machine, id));
      for (const key of [...this.evidence.keys()]) {
        if (key.startsWith(`${id}/`)) this.evidence.delete(key);
      }
      for (const h of this.instance.history) {
        if (h.outcome !== "filled") continue;
        if (h.state === `${machine.id}/${id}` || h.state.startsWith(`${id}/`)) {
          (h as { outcome: string }).outcome = "superseded";
        }
      }
    }
    if (!this.inSub()) {
      this.sub = undefined;
      this.seedSubs(); // a reopened sub-machine state re-enters at its start
    } else {
      this.instance.history.push({ state: `${machine.id}/${target}`, outcome: "reopened", at: now });
    }
    return this.tickInfo();
  }

  private closedFired = false;

  /** The tick's result — plus the booted banner the first time idle lands.
   *  Reaching end fires onClosed once: the session is OVER — the server
   *  entry shuts the whole session down (owner ruling 2026-07-26). */
  private landing(): Record<string, unknown> {
    if (this.instance.status === "closed" && !this.closedFired) {
      this.closedFired = true;
      const info = this.tickInfo();
      this.onClosed?.();
      return {
        ...info,
        session_over: true,
        banner: "🦆 SE session over — the machine reached end. The server is shutting down.",
        display: "Show the banner above to the user VERBATIM. The session is over; no further calls will answer.",
      };
    }
    const info = this.tickInfo();
    if (!this.bannerShown && !this.inSub() && activeStates(this.instance).includes("idle")) {
      this.bannerShown = true;
      return {
        ...info,
        booted: true,
        banner: "🦆 SE v3 booted — main machine @ idle. All work runs through the se lane; every call is logged. se_tick shows where you are.",
        display: "Show the banner above to the user VERBATIM as your first output, then proceed with their request.",
      };
    }
    return info;
  }

  /** A chosen way out must be one of the state's drawn edges — and with
   *  several ways forward the tick MUST choose (an unnamed advance would
   *  fire every edge at once in the token model). */
  private assertEdge(m: MachineDecl, stateId: string, to?: string): void {
    const s = this.state(m, stateId);
    if (to === undefined) {
      if (s.edges.length <= 1) return;
      throw new Rejection({
        clause: CLAUSES.NOT_LEGAL_IN_STATE,
        expected: `a named way forward — ${stateId} has several: ${s.edges.map((e) => e.to).join(", ")}`,
        got: "an unnamed advance",
        remedy: { tool: "se_tick", args: { to: s.edges[0].to }, note: "pick the edge; se_tick without arguments shows each target's statement" },
        source: "engine/session.ts tick",
      });
    }
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

  describe(): Record<string, unknown> {
    const { all, tools } = this.legal();
    return {
      machine: this.machine.id,
      breadcrumb: this.breadcrumb(),
      active: this.active(),
      ...(this.inSub() ? { submachine: { id: this.sub!.decl.id, active: activeStates(this.sub!.instance) } } : {}),
      status: this.instance.status,
      threshold: this._threshold,
      legal_tools: all ? "all" : [...ALWAYS_LEGAL, ...tools],
      history: this.instance.history.slice(-10),
    };
  }
}
