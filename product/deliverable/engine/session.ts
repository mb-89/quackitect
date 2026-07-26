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
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { contentHash } from "./hash.ts";
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
import { spawn } from "node:child_process";
import { resolveInRoot, seDir } from "./paths.ts";
import { Decisions } from "./decisions.ts";

/** THE TICK is the machinery — one tool, legal in EVERY state. Without
 *  arguments it reports (observability is never gated); with arguments it
 *  advances. se_note is legal everywhere too: a stray is captured where it
 *  strikes, never chased (contract rule 4). */
const ALWAYS_LEGAL: ReadonlySet<string> = new Set(["se_tick", "se_note"]);
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
  /** When this session started — the mirror's log feed is scoped to it. */
  readonly startedTs = new Date().toISOString();
  /** The decision graph — the lane writes it (ops ride the update field),
   *  the mirror reads it (the details pane renders the tree). */
  readonly decisions: Decisions;

  constructor(root: string) {
    this.root = root;
    // Fail fast at server start: a misdrawn machine must not silently serve
    // an ungated lane.
    this.machine = compileMachine(root, mainMachinePath(root));
    this.instance = newInstance(this.machine);
    this.decisions = new Decisions(seDir(root));
  }

  /** Boot is done — the toll arms on this; the reading room pays none. */
  isBooted(): boolean {
    return this.bannerShown;
  }

  /** The decision graph's key: the leaf state the walk stands in, plus how
   *  many times it filled before — a re-walk gets a fresh tree. */
  currentVisit(): string {
    const id = this.active()[0];
    const past = this.instance.history.filter((h) => h.state === id).length;
    return `${id}@${past}`;
  }

  get threshold(): number {
    return this._threshold;
  }

  // ── THE WAIT — how the machine reaches a holding agent. MCP cannot push;
  //    se_tick {wait: true} blocks server-side until the human's hand moves
  //    something (slider, tick, evidence) and returns the fresh packet — the
  //    nearest thing to "the machine sends an update to the agent". ────────
  private waiters: Array<() => void> = [];

  /** Wake every held wait — called on every successful change of the walk. */
  private notifyChange(): void {
    const held = this.waiters;
    this.waiters = [];
    for (const wake of held) wake();
  }

  /** Resolve true when something changes, false on timeout (call again). */
  waitForChange(timeoutMs: number): Promise<boolean> {
    return new Promise((resolve) => {
      const wake = (): void => {
        clearTimeout(timer);
        resolve(true);
      };
      const timer = setTimeout(() => {
        this.waiters = this.waiters.filter((w) => w !== wake);
        resolve(false);
      }, timeoutMs);
      this.waiters.push(wake);
    });
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
    this.notifyChange(); // a holding agent wakes and re-reads the packet
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
          remedy: { tool: "se_tick", args: {}, note: "STOP and tell the human PLAINLY: this step waits for their hand (they advance it in the mirror, or raise the slider), and the slider alone cannot wake you — they must SEND YOU A MESSAGE (e.g. 'continue') after changing it. Then end your turn. Never retry the advance blind." },
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

  /** One condition key of a state's entry/exit dictionary. For `read` a
   *  doc counts on EITHER ledger: the human's checks, or hashes the agent
   *  presented on a passing tick — so the mirror's pill turns green from
   *  the machine too. The GATE stays per-tick; a stored proof never
   *  spares a re-read. */
  conditionKeyMet(m: MachineDecl, s: StateDecl, key: string, which: "enter" | "leave"): boolean {
    if (key === "read") {
      const docs = (which === "leave" ? s.exit : s.entry)?.read ?? [];
      return docs.every((p) => this.readProven("human", p, {}) || this.agentProven(p));
    }
    const ev = this.evidence.get(this.evidenceKey(m, s.id));
    if (key === "script") return (ev?.script_result as { ok?: boolean } | undefined)?.ok === true;
    return false;
  }

  /** One script, ASYNC — spawnSync would freeze the whole server (and the
   *  mirror with it) for the run's duration; found when the suite's eight
   *  seconds read as a crashed browser window. */
  private spawnScript(abs: string): Promise<{ status: number | null; out: string }> {
    return new Promise((resolve) => {
      const child = spawn("node", [abs, "--root", this.root], { cwd: this.root });
      let out = "";
      child.stdout.on("data", (d: Buffer) => { out += d; });
      child.stderr.on("data", (d: Buffer) => { out += d; });
      const timer = setTimeout(() => child.kill(), 120_000);
      child.on("error", (e) => { clearTimeout(timer); resolve({ status: null, out: String(e) }); });
      child.on("close", (code) => { clearTimeout(timer); resolve({ status: code, out }); });
    });
  }

  /** In-flight runs, keyed by state — a second hand (or a second click)
   *  while one runs JOINS it instead of spawning the suite again. Found
   *  when repeated clicks on an unresponsive button queued whole extra
   *  suite runs behind the first. */
  private readonly scriptRuns = new Map<string, Promise<Record<string, unknown>>>();

  /** RUN a state's condition script — legal only while standing in it.
   *  The result is engine-observed evidence; nobody can claim it. */
  async scriptRun(stateId: string): Promise<Record<string, unknown>> {
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
    const key = this.evidenceKey(machine, s.id);
    const inFlight = this.scriptRuns.get(key);
    if (inFlight !== undefined) return inFlight;
    const run = (async () => {
      const outputs: string[] = [];
      let ok = true;
      for (const rel of scripts) {
        const abs = resolveInRoot(this.root, rel, "engine/session.ts script");
        const r = await this.spawnScript(abs);
        const out = r.out.trim().slice(0, 4000);
        outputs.push(`${rel} → exit ${r.status}${out === "" ? "" : `\n${out}`}`);
        if (r.status !== 0) ok = false;
      }
      const result = { ok, output: outputs.join("\n"), at: new Date().toISOString() };
      this.evidence.set(key, { ...(this.evidence.get(key) ?? {}), script_result: result });
      this.notifyChange();
      return { state: `${machine.id}/${s.id}`, script_result: result };
    })().finally(() => this.scriptRuns.delete(key));
    this.scriptRuns.set(key, run);
    this.notifyChange(); // the mirror learns a run started
    return run;
  }

  /** Any condition script currently running — the mirror's follow signal. */
  busy(): boolean {
    return this.scriptRuns.size > 0;
  }

  scriptStatus(m: MachineDecl, s: StateDecl): { ran: boolean; ok: boolean; output: string; running: boolean } {
    const r = this.evidence.get(this.evidenceKey(m, s.id))?.script_result as { ok?: boolean; output?: string } | undefined;
    return {
      ran: r !== undefined,
      ok: r?.ok === true,
      output: r?.output ?? "",
      running: this.scriptRuns.has(this.evidenceKey(m, s.id)),
    };
  }

  /** All keys of the dictionary must hold. Absent dictionary = always. */
  conditionMet(m: MachineDecl, s: StateDecl, which: "enter" | "leave"): boolean {
    const dict = which === "leave" ? s.exit : s.entry;
    if (dict === undefined) return true;
    return Object.keys(dict).every((k) => this.conditionKeyMet(m, s, k, which));
  }

  /** Per-key status — the mirror's bubbles and the agent's packet share it. */
  conditionStatus(m: MachineDecl, s: StateDecl, which: "enter" | "leave"): Record<string, { args: string[]; met: boolean; note: string }> | undefined {
    const dict = which === "leave" ? s.exit : s.entry;
    if (dict === undefined) return undefined;
    const out: Record<string, { args: string[]; met: boolean; note: string }> = {};
    for (const [k, args] of Object.entries(dict)) {
      out[k] = { args, met: this.conditionKeyMet(m, s, k, which), note: conditionNotePath(k) };
    }
    return out;
  }

  // ── THE READ PROOF (owner ruling 2026-07-26). A doc's hash is a TOKEN
  //    held only by reading through the lane: se_file_read returns it, the
  //    agent's packets never print it. The AGENT proves reading by SENDING
  //    hashes on the tick (read_hashes: {path: hash}) — fresh every time,
  //    so after a compaction the tokens are gone from its head and
  //    re-reading is forced by construction (the hook only has to say so).
  //    The HUMAN proves reading by CHECKING the doc in the mirror — once
  //    per VERSION (the check pins the hash; an edited doc unchecks
  //    itself). And THE PULL GATES ENTRY: a state is entered only when its
  //    pulled guidance is proven read — armed outside boot, because boot
  //    IS the reading room where the first tokens are earned. ────────────
  private readonly humanChecks = new Map<string, Set<string>>();

  /** The agent's standing ledger: hashes it PRESENTED on a tick that
   *  passed the read gate — per version, like the human's checks. Feeds
   *  the condition status (the mirror's pill) only; never the gate, and
   *  never the checkboxes (those stay the human's alone). */
  private readonly agentReads = new Map<string, Set<string>>();

  private agentProven(path: string): boolean {
    const hash = this.diskHash(path);
    return hash !== "" && (this.agentReads.get(path)?.has(hash) ?? false);
  }

  private diskHash(rel: string): string {
    try {
      const abs = resolveInRoot(this.root, rel, "engine/session.ts reads");
      return contentHash(readFileSync(abs));
    } catch {
      return "";
    }
  }

  /** The mirror's checkbox: pin the doc AS IT STANDS as read-by-human. */
  humanCheck(path: string): Record<string, unknown> {
    const hash = this.diskHash(path);
    if (hash === "") {
      throw new Rejection({
        clause: CLAUSES.REQUIRED_ARGS,
        expected: "a readable project document",
        got: path,
        remedy: { tool: "se_tick", args: {}, note: "the pulled list names the checkable documents" },
        source: "engine/session.ts reads",
      });
    }
    const set = this.humanChecks.get(path) ?? new Set<string>();
    set.add(hash);
    this.humanChecks.set(path, set);
    this.notifyChange();
    return { path, hash, checked: true };
  }

  humanChecked(path: string, hash: string): boolean {
    return hash !== "" && (this.humanChecks.get(path)?.has(hash) ?? false);
  }

  /** Every doc the human has checked AT ITS CURRENT VERSION — the session's
   *  reading list. Checks of edited (stale) versions drop out. */
  humanCheckedPaths(): string[] {
    return [...this.humanChecks.entries()]
      .filter(([p, set]) => set.has(this.diskHash(p)))
      .map(([p]) => p)
      .sort();
  }

  /** One doc, one channel, one verdict. The agent's supplied hash must
   *  match the doc AS IT STANDS — a stale token proves a stale read. */
  private readProven(channel: Channel, path: string, supplied: Record<string, string>): boolean {
    const hash = this.diskHash(path);
    if (hash === "") return false;
    return channel === "agent" ? supplied[path] === hash : this.humanChecked(path, hash);
  }

  /** Boot is exempt from the pull gate — it is where the first reads
   *  happen; gating entry on them would deadlock the session at start. */
  private pullGateExempt(m: MachineDecl, t: StateDecl): boolean {
    if (t.kind === "start" || t.kind === "end") return true;
    if (m.id === "boot") return true;
    if (t.submachine !== undefined && t.submachine.includes("boot")) return true;
    return false;
  }

  /** What entering `t` demands proven: its entry read list plus its pull —
   *  minus its own exit read list (that is the state's assignment, read
   *  INSIDE it, not before). */
  private entryRequirements(m: MachineDecl, t: StateDecl): string[] {
    const req = new Set<string>(t.entry?.read ?? []);
    if (!this.pullGateExempt(m, t)) {
      for (const d of pulledFor(this.root, scanGuidance(this.root), m, t)) req.add(d.path);
    }
    for (const p of t.exit?.read ?? []) req.delete(p);
    return [...req];
  }

  private refuseReads(which: "exit" | "entry", stateId: string, missing: string[], channel: Channel): never {
    throw new Rejection({
      clause: CLAUSES.CONDITION_UNMET,
      expected: `${which === "exit" ? "leaving" : "entering"} ${stateId} demands proven reading of: ${missing.join(", ")}`,
      got: channel === "agent" ? `no current hash supplied for: ${missing.join(", ")}` : `not checked in the mirror: ${missing.join(", ")}`,
      remedy:
        channel === "agent"
          ? { tool: "se_file_read", args: { path: missing[0] }, note: "read EVERY missing doc through the lane — each result carries its hash — then repeat the tick with read_hashes: {\"<path>\": \"<hash>\", ...}. The hash is your proof; it must match the doc as it stands NOW, every time." }
          : { tool: "se_tick", args: {}, note: "check each listed document in the mirror — one check per version; an edited doc asks again" },
      source: "engine/session.ts reads",
    });
  }

  /** THE READ GATE, both directions: the current state's exit read list,
   *  and the target's entry requirements (explicit reads + the pull). */
  private assertReads(m: MachineDecl, from: StateDecl, targetIds: string[], channel: Channel, supplied: Record<string, string>): void {
    const missingExit = (from.exit?.read ?? []).filter((p) => !this.readProven(channel, p, supplied));
    if (missingExit.length > 0) this.refuseReads("exit", from.id, missingExit, channel);
    for (const id of targetIds) {
      const t = m.states.find((s) => s.id === id);
      if (t === undefined) continue;
      const missing = this.entryRequirements(m, t).filter((p) => !this.readProven(channel, p, supplied));
      if (missing.length > 0) this.refuseReads("entry", t.id, missing, channel);
    }
    // THE HANDOVER RULE (owner ruling 2026-07-26): what the human checked
    // is the SESSION's reading list. A human who walked read_contract on
    // checkboxes and then raised the slider hands the walk to a head that
    // never read — so the agent's every advance must prove the same list,
    // even past transitions the human already spent.
    this.assertHandover(channel, supplied);
    if (channel === "agent") {
      for (const [p, h] of Object.entries(supplied)) {
        if (h !== "" && h === this.diskHash(p)) {
          const set = this.agentReads.get(p) ?? new Set<string>();
          set.add(h);
          this.agentReads.set(p, set);
        }
      }
    }
  }

  private assertHandover(channel: Channel, supplied: Record<string, string>): void {
    if (channel !== "agent") return;
    const owed = this.humanCheckedPaths().filter((p) => !this.readProven("agent", p, supplied));
    if (owed.length === 0) return;
    throw new Rejection({
      clause: CLAUSES.CONDITION_UNMET,
      expected: `your reading to match the human's checked list: ${owed.join(", ")}`,
      got: `no current hash supplied for: ${owed.join(", ")}`,
      remedy: { tool: "se_file_read", args: { path: owed[0] }, note: "the human checked these as read while driving — your head must hold them too. Read each through the lane, then repeat the tick with their hashes in read_hashes." },
      source: "engine/session.ts reads",
    });
  }

  /** The mirror's ▶ lock: is entering `t` fully proven on the human's
   *  channel (explicit entry conditions AND the pull)? */
  entryReadyHuman(m: MachineDecl, t: StateDecl): boolean {
    if (!this.conditionMet(m, t, "enter")) return false;
    return this.entryRequirements(m, t).every((p) => this.readProven("human", p, {}));
  }

  /** THE PULL — derived, never authored; see engine/pull.ts. Re-scanned
   *  every time (no cache): an edited doc must show its fresh hash, or a
   *  stale check could pass forever. `checked` is the human's ledger. */
  pulled(m: MachineDecl, s: StateDecl): (PulledDoc & { checked: boolean })[] {
    return pulledFor(this.root, scanGuidance(this.root), m, s).map((d) => {
      const hash = d.hash !== "" ? d.hash : this.diskHash(d.path);
      return { ...d, hash, checked: this.humanChecked(d.path, hash) };
    });
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
    this.notifyChange();
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
    throw new Rejection({
      clause: CLAUSES.CONDITION_UNMET,
      expected: `${which} condition '${key}' of ${stateId} (see ${note})`,
      got: "unmet",
      remedy: { tool: "se_file_read", args: { path: note }, note: "the condition's note says what it wants" },
      source: "engine/session.ts conditions",
    });
  }

  private async assertConditions(m: MachineDecl, from: StateDecl, to: string | undefined, channel: Channel, supplied: Record<string, string>): Promise<void> {
    if (from.exit?.script !== undefined) await this.scriptRun(from.id); // a tick attempt runs the script
    for (const [key, args] of Object.entries(from.exit ?? {})) {
      if (key === "read") continue; // read is channel-proven below, not evidence
      if (!this.conditionKeyMet(m, from, key, "leave")) this.refuseCondition(m, from, "exit", key, args);
    }
    const targetId = to ?? (from.edges.length === 1 ? from.edges[0].to : undefined);
    this.assertReads(m, from, targetId === undefined ? [] : [targetId], channel, supplied);
    if (targetId === undefined) return;
    const target = m.states.find((s) => s.id === targetId);
    if (target === undefined) return;
    for (const [key, args] of Object.entries(target.entry ?? {})) {
      if (key === "read") continue;
      if (!this.conditionKeyMet(m, target, key, "enter")) this.refuseCondition(m, target, "entry", key, args);
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
        // The agent's packet names the pulled docs but NEVER their hashes —
        // the hash is the proof-of-read, obtainable only via se_file_read.
        pulled: this.pulled(machine, s).map((p) => ({ path: p.path, sources: p.sources })),
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
      // The session's reading list: what the human checked while driving.
      // Your advances must prove the same docs (paths only — the hashes
      // are earned by reading).
      human_checked: this.humanCheckedPaths(),
      legal_tools: all ? "all" : [...ALWAYS_LEGAL, ...tools],
      states,
    };
  }

  /** tick with arguments: complete the current state and move on.
   *  `to` picks the outgoing edge (needed only when there are several);
   *  `channel` is whose hand this is — the threshold gates only the agent's;
   *  `readHashes` is the agent's proof-of-read for this tick (path → hash,
   *  each matching the doc as it stands; the human proves via checkboxes). */
  async tickAdvance(to?: string, channel: Channel = "human", readHashes: Record<string, string> = {}): Promise<Record<string, unknown>> {
    const now = new Date().toISOString();
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
        // whatever the parent's edges enter is what the threshold weighs
        // and what the read gate demands proven.
        const parent = this.state(this.machine, this.sub!.parentState);
        this.gatePriority(this.machine, parent.edges.map((e) => e.to), channel);
        this.assertReads(this.machine, parent, parent.edges.map((e) => e.to), channel, readHashes);
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
      await this.assertConditions(this.sub!.decl, this.state(this.sub!.decl, cur), to, channel, readHashes);
      completeState(this.sub!.decl, this.sub!.instance, cur, "filled", now, to);
      this.sub!.instance.history.push({ state: cur, outcome: "filled", at: now });
      this.instance.history.push({ state: `${this.sub!.decl.id}/${cur}`, outcome: "filled", at: now });
      this.notifyChange();
      return this.tickInfo();
    }
    const cur = activeStates(this.instance)[0];
    this.assertEdge(this.machine, cur, to);
    const target = to ?? this.state(this.machine, cur).edges[0]?.to;
    if (target !== undefined) this.gatePriority(this.machine, [target], channel);
    await this.assertConditions(this.machine, this.state(this.machine, cur), to, channel, readHashes);
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
      pulled: this.pulled(home, s).map((p) => ({ path: p.path, sources: p.sources })),
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
   *  open — the agent's hand is still weighed against the threshold, and
   *  the read gate applies (jumping back ENTERS the target). */
  jumpBack(target: string, channel: Channel = "human", readHashes: Record<string, string> = {}): Record<string, unknown> {
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
    const back = this.state(machine, target);
    const missing = this.entryRequirements(machine, back).filter((p) => !this.readProven(channel, p, readHashes));
    if (missing.length > 0) this.refuseReads("entry", target, missing, channel);
    this.assertHandover(channel, readHashes);
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
    this.notifyChange();
    return this.tickInfo();
  }

  private closedFired = false;

  /** The tick's result — plus the booted banner the first time idle lands.
   *  Reaching end fires onClosed once: the session is OVER — the server
   *  entry shuts the whole session down (owner ruling 2026-07-26). */
  private landing(): Record<string, unknown> {
    this.notifyChange(); // every landing is a change a holding hand should see
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
