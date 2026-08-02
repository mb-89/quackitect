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
import { existsSync, mkdirSync, readFileSync, statSync, unlinkSync, writeFileSync } from "node:fs";
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
import { compileMachine, compileMachineCached, resolveRef } from "./machines/compile.ts";
import { computeRoute, type RouteNode, type RouteResult } from "./route.ts";
import { conditionNotePath } from "./conditions.ts";
import { drainNote, pendingNotes } from "./inbox.ts";
import { confirmPrefill, formTemplatePath, lintForm, parseFormTemplate, scaffoldInstance, withFieldContent, withStatus, type FormLint, type FormTemplate } from "./forms.ts";
import { pulledFor, scanGuidance, type GuidanceDoc, type PulledDoc } from "./pull.ts";
import { expClose, expFind, expList, expNew, readRecord, type Expedition } from "./worktree.ts";
import { generateContinueExpedition, generateExpeditionArchive, shortId, type GeneratedMachine } from "./expmachine.ts";
import { type CanvasData } from "./canvas.ts";
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { resolveInRoot, seDir } from "./paths.ts";
import { Decisions, replayFile } from "./decisions.ts";
import { generateIterationArchive, generateIterations, itFind, itPinRel, itRecordRel, itSeed, markStarted, pinIteration, readItRecord } from "./iterations.ts";
import { anyJobRunning } from "./run.ts";
import { CHANGE_COLUMNS } from "./rigor-matrix.ts";
import { parseStateNote, section } from "./notes.ts";
import { NARRATION_DEFAULT_CALLS, NARRATION_DEFAULT_MINUTES } from "./toll.ts";

/** THE PULL is the machinery — one verb, legal in EVERY state: the agent
 *  says pull and the machine says what to do. se_note is legal everywhere
 *  too: a stray is captured where it strikes, never chased (contract rule
 *  4). se_reading joins them because a state that gates the reading gates
 *  its own entry — the way out of a state is to read what it demands.
 *  se_note_drain joins them by the same logic as se_note: an inbox you may
 *  only add to is not an inbox. */
const ALWAYS_LEGAL: ReadonlySet<string> = new Set(["se_pull", "se_note", "se_panel", "se_reading", "se_note_drain"]);
/** RESTRICTED tools: "all" does NOT grant these — a state must name them.
 *  Nothing is restricted today.
 *
 *  se_note_drain used to be, so that only the desk and the retro could take
 *  anything OUT of the inbox. The owner struck that (2026-08-01): an obsolete
 *  note is deleted where it is found, and does not wait for a ceremony.
 *
 *  The half that mattered was never here anyway. carried and backlog decide
 *  what work MEANS and when it returns, and engine/inbox.ts still refuses
 *  those outside the retro. done and obsolete are checks anyone can run. */
const RESTRICTED: ReadonlySet<string> = new Set<string>();
const MACHINERY: readonly string[] = ["se_pull", "se_reading", "se_file_read"];

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
  /** The PARENT machine's state this sub fills — one level up the stack. */
  parentState: string;
  /** Present when the machine was GENERATED (continue_expedition): the
   *  synthetic drawing and the state→expedition map ride the run. */
  gen?: GeneratedMachine;
}

/** WHOSE HAND is on the tick. The channel rule (owner ruling 2026-07-26):
 *  HTTP is the human, MCP is the agent. The threshold gates only the
 *  agent's hand — the human always may. */
export type Channel = "human" | "agent";

export class Session {
  private readonly root: string;
  /** Last good main machine — what the walk stands on when the live one
   *  cannot be had. Read through `machine`, never directly. */
  private _machine: MachineDecl;
  readonly instance: MachineInstance;
  private subs: SubRun[] = [];
  private bannerShown = false;
  /** The bound expedition — while set, the lane works in its worktree. */
  private bound?: Expedition;
  /** Evidence store: "<machine>/<state>" → what was submitted. */
  private readonly evidence = new Map<string, Record<string, unknown>>();
  /** THE AUTONOMY (renamed from "threshold", owner ruling 2026-07-27) —
   *  which states the AGENT may enter by itself: only those with
   *  priority <= autonomy. 0 hands every step to the human (manual mode);
   *  1 is fully autonomous. Content work inside a state is never gated —
   *  only ENTERING is. Live-adjustable (the mirror's slider). */
  private _autonomy = 0.4;
  /** THE TARGET — where the walk is headed, and the blue line the mirror
   *  draws. Every engine start aims at the front desk (owner ruling
   *  2026-07-29): the desk is where a person says what they want, so it is
   *  the destination unless somebody names another. */
  private _target = "front_desk";
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
    this._machine = compileMachine(root, mainMachinePath(root));
    this.instance = newInstance(this._machine);
    this.decisions = new Decisions(seDir(root));
    // SETTINGS SURVIVE THE ENGINE, NOT THE SESSION (owner rulings 2026-07-28).
    // The mirror's sliders restore across a RELOAD like the decision graph —
    // ONE store, restored wholesale, ready for settings still to come. But a
    // session that ended and started again is a NEW session, and takes the
    // defaults.
    //
    // The shim's life is the session, so it stamps each child with a token.
    // Matching it is what tells the two apart, and it fails safe: an absent
    // or unfamiliar stamp simply does not restore. There is no cleanup step
    // to forget, so a crash or a power cut cannot leave the last session's
    // sliders standing either.
    try {
      const s = JSON.parse(readFileSync(join(seDir(root), "settings.json"), "utf8")) as { autonomy?: number; block_sleep?: boolean; shutdown_at_idle?: boolean; narration_minutes?: number; narration_calls?: number; session?: string };
      const mine = process.env.SE_SESSION;
      if (mine !== undefined && mine !== "" && s.session === mine) {
        if (typeof s.autonomy === "number" && s.autonomy >= 0 && s.autonomy <= 1) this._autonomy = s.autonomy;
        if (typeof s.block_sleep === "boolean") this._blockSleep = s.block_sleep;
    if (typeof s.shutdown_at_idle === "boolean") this._shutdownAtIdle = s.shutdown_at_idle;
        if (typeof s.narration_minutes === "number" && Number.isInteger(s.narration_minutes) && s.narration_minutes >= 0) this._narrationMinutes = s.narration_minutes;
        if (typeof s.narration_calls === "number" && Number.isInteger(s.narration_calls) && s.narration_calls >= 0) this._narrationCalls = s.narration_calls;
      }
    } catch { /* no store yet — the defaults stand */ }
    this.syncKeepAwake();
    this.armIdleTimer();
  }

  private persistSettings(): void {
    try {
      mkdirSync(seDir(this.root), { recursive: true });
      writeFileSync(join(seDir(this.root), "settings.json"), JSON.stringify({ session: process.env.SE_SESSION ?? null, autonomy: this._autonomy, block_sleep: this._blockSleep, shutdown_at_idle: this._shutdownAtIdle, narration_minutes: this._narrationMinutes, narration_calls: this._narrationCalls }) + "\n", "utf8");
    } catch { /* a failed save never blocks the slider */ }
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

  get autonomy(): number {
    return this._autonomy;
  }

  /**
   * THE POWER CONTROL — two independent flags, neither implying the other.
   *
   * It was five notches on a slider, which said the settings were a scale.
   * They are not: holding the computer awake and shutting it down when work
   * stops are separate wants, and wanting both at once is the normal case.
   *
   * THE ENGINE IS THIS SERVER. THE MACHINE IS THE COMPUTER. Both flags act on
   * the machine; the engine is only what watches.
   *
   * BLOCK AUTO-SLEEP holds the machine awake, so it does not sleep under a
   * running walk.
   *
   * SHUTDOWN AT IDLE holds it awake while anything is happening, then shuts
   * the machine down once nothing is. The use it exists for: tell the agent
   * to do its work and return to the front desk, flip this, and leave.
   *
   * Neither set means nothing is done about power at all, which is the
   * resting state and where a fresh session starts.
   *
   * THE MACHINE OWNS THE TIMER. The agent neither decides this nor triggers
   * it, and it could not: an agent that has stopped is precisely what idle
   * means, so a shutdown waiting for one to notice would never fire.
   */
  private _blockSleep = false;
  private _shutdownAtIdle = false;
  private keepAwake?: ReturnType<typeof spawn>;
  private idleTimer?: ReturnType<typeof setInterval>;
  /** Any act at all, by any hand. The idle clock measures from here. */
  private lastActivity = Date.now();

  /** How long nothing may happen before an armed idle shutdown fires. */
  static IDLE_MINUTES = 5;

  get power(): { block_sleep: boolean; shutdown_at_idle: boolean } {
    return { block_sleep: this._blockSleep, shutdown_at_idle: this._shutdownAtIdle };
  }

  setPower(key: string, on: boolean): Record<string, unknown> {
    if (key === "block-auto-sleep") this._blockSleep = on;
    else if (key === "shutdown-at-idle") this._shutdownAtIdle = on;
    else {
      throw new Rejection({
        clause: CLAUSES.REQUIRED_ARGS,
        expected: "a power toggle: block-auto-sleep or shutdown-at-idle",
        got: key,
        remedy: { tool: "se_file_read", args: { path: "product/deliverable/machines/panels/controls.md" }, note: "the shutdown row names both" },
        source: "engine/session.ts power",
      });
    }
    this.persistSettings();
    this.syncKeepAwake();
    this.armIdleTimer();
    this.notifyChange();
    return this.power;
  }

  /**
   * RESTING PLACES. The walk standing at either of these means the agent has
   * finished and parked, which is what the person means by "when you're done".
   * A walk standing anywhere else is work in progress, and shutting the
   * machine down under it would strand that work.
   */
  private static readonly RESTING = new Set(["idle", "front_desk"]);

  /** All three must hold: parked, quiet, and nothing of ours still running. */
  idleFor(ms: number): boolean {
    if (Date.now() - this.lastActivity < ms) return false;
    if (anyJobRunning()) return false;
    const active = this.describe().active;
    return active.length > 0 && active.every((a) => Session.RESTING.has(a.split("/").pop()!));
  }

  /**
   * The timer only exists while the flag is set, so an unarmed machine has no
   * clock running at all and cannot power anything off by accident.
   */
  private armIdleTimer(): void {
    if (this._shutdownAtIdle && this.idleTimer === undefined) {
      this.idleTimer = setInterval(() => this.checkIdle(), 30_000);
      this.idleTimer.unref?.();
    } else if (!this._shutdownAtIdle && this.idleTimer !== undefined) {
      clearInterval(this.idleTimer);
      this.idleTimer = undefined;
    }
  }

  private checkIdle(): void {
    if (!this._shutdownAtIdle) return;
    if (!this.idleFor(Session.IDLE_MINUTES * 60_000)) {
      // Something is still happening, so hold the computer awake for it.
      this.syncKeepAwake();
      return;
    }
    if (process.platform !== "win32" || process.env.SE_POWEROFF_DISABLE === "1") return;
    // Disarm before firing, so a shutdown that the person cancels at the
    // warning does not immediately arm another one behind them.
    this._shutdownAtIdle = false;
    this.armIdleTimer();
    spawn("shutdown.exe", ["/s", "/t", "60", "/c", "se: idle for five minutes"], { stdio: "ignore", windowsHide: true, detached: true }).unref();
  }

  /** The mirror's URL when one is listening — the panel se_panel opens. */
  mirrorUrl?: string;


  /** THE UPDATE CADENCE (owner design 2026-07-31, redrawn 2026-08-01): how
   *  often narration is OWED. TWO NUMBERS, not a level — an update every n
   *  minutes at least, or every n calls at least, whichever falls due first.
   *  The reader types them, because a preset list is someone else guessing
   *  which rhythm suits the surface they are watching from.
   *
   *  Zero on either means that clock does not run. Both zero owes nothing. */
  private _narrationMinutes = NARRATION_DEFAULT_MINUTES;
  private _narrationCalls = NARRATION_DEFAULT_CALLS;

  get narrationMinutes(): number {
    return this._narrationMinutes;
  }

  get narrationCalls(): number {
    return this._narrationCalls;
  }

  private static cadence(label: string, value: number): number {
    if (!Number.isInteger(value) || value < 0 || value > 1440) {
      throw new Rejection({
        clause: CLAUSES.REQUIRED_ARGS,
        expected: `${label}: a whole number from 0 to 1440 — 0 stops that clock`,
        got: String(value),
        remedy: { tool: "se_pull", args: {}, note: "the mirror's updates row sets both" },
        source: "engine/session.ts narration",
      });
    }
    return value;
  }

  /** The NOW button: make an update DUE, rather than narrating for the agent. */
  narrationDueNow(): Record<string, unknown> {
    this._narrationDueAt = Date.now();
    this.notifyChange();
    return { due: true };
  }

  private _narrationDueAt = 0;

  get narrationDueAt(): number {
    return this._narrationDueAt;
  }

  setNarration(minutes: number, calls: number): Record<string, unknown> {
    const wasMinutes = this._narrationMinutes;
    const wasCalls = this._narrationCalls;
    this._narrationMinutes = Session.cadence("minutes", minutes);
    this._narrationCalls = Session.cadence("calls", calls);
    this.persistSettings();
    this.notifyChange();
    return { minutes, calls, was: { minutes: wasMinutes, calls: wasCalls } };
  }

  /** THE MILESTONE REVIEW REPORT (owner rulings 2026-07-30): the one thing
   *  a person reads most, so it is the gate's MECHANICAL demand. The
   *  scaffold generates from the gate's OWN evidence fields (the rigor matrix,
   *  live) plus v1's field-tested review tail: verify, validate, red_team,
   *  verdict. Prefilled comments never count as content (the prefill law).
   *
   *  REPORT AND BLESS ARE SEPARATE THINGS. The report is the artifact; the
   *  BLESS is the act of passing the gate on it — the tick, weighed by the
   *  autonomy slider as ever (below the gate's 0.6 the hand is human). The
   *  bless lands DURABLY as a sidecar pinning the report's version and
   *  whose hand it was; an EDITED report drops its bless (one bless per
   *  version), and a standing bless lets a re-walk pass without re-asking. */
  private gateReportRel(gateId: string): string {
    return `product/spec/iterations/${this.bound!.id}/reviews/${gateId}.md`;
  }

  private assertGateReport(gateId: string, s: StateDecl, channel: Channel): void {
    const rel = this.gateReportRel(gateId);
    const abs = join(this.bound!.path, rel);
    // THE ROUNDS ARE NOT WRITTEN TWICE. compileMachine appends STANDARD_ROUNDS
    // (verify_round, validate_round, redteam_round, verdict) to every gate's
    // evidence_form — machines/compile.ts, the `kind === "gate"` clause — so
    // the scaffold below already emits them once, with the fuller v1-derived
    // wording. A second REVIEW_TAIL stood here and emitted verify/validate/
    // red_team AGAIN: seven round sections, three of them the same round under
    // a shorter name, every one of them required non-empty. Nobody ever hit it
    // because no gate report has ever been written.
    if (!existsSync(abs)) {
      const scaffold = [
        "---",
        "form: milestone-review",
        `gate: ${gateId}`,
        "status: draft",
        "by: ",
        "verdict: ",
        "---",
        "",
        `# ${gateId} — milestone review`,
        "",
        ...s.evidence_form.flatMap((f) => [`## ${f.name}`, "", `<!-- ${f.description}${f.required ? "" : " (optional)"} -->`, ""]),
      ].join("\n");
      throw new Rejection({
        clause: CLAUSES.CONDITION_UNMET,
        expected: `the milestone review report — no gate passes without one (${rel})`,
        got: "no review report in the record",
        remedy: { tool: "se_file_write", args: { path: rel, content: scaffold, base_hash: null }, note: "fill every section — this report is what a person reads most; a prefilled comment counts as empty until real text replaces it" },
        source: "engine/session.ts gate",
      });
    }
    const raw = readFileSync(abs, "utf8");
    // A STANDING BLESS passes at once: the sidecar pins the report's exact
    // version — the quick re-walk the owner asked for.
    const blessAbs = abs.replace(/\.md$/, ".bless.json");
    const reportHash = contentHash(Buffer.from(raw, "utf8"));
    if (existsSync(blessAbs)) {
      try {
        const b = JSON.parse(readFileSync(blessAbs, "utf8")) as { hash?: string };
        if (b.hash === reportHash) return;
      } catch {
        // an unreadable bless is no bless — fall through and re-earn it
      }
    }
    const note = parseStateNote(raw);
    const problems: string[] = [];
    const filledText = (name: string): string => section(note.body, name).replace(/<!--[\s\S]*?-->/g, "").trim();
    for (const f of s.evidence_form) {
      if (f.required && filledText(f.name) === "") problems.push(`${f.name} is empty`);
    }
    if (note.frontmatter.status !== "done") problems.push("status is not done");
    const verdict = typeof note.frontmatter.verdict === "string" ? note.frontmatter.verdict.trim().toUpperCase() : "";
    if (!verdict.startsWith("PASS")) problems.push(`the verdict is "${String(note.frontmatter.verdict ?? "")}" — PASS passes, anything else holds the gate`);
    if (problems.length > 0) {
      throw new Rejection({
        clause: CLAUSES.CONDITION_UNMET,
        expected: `a complete, PASSED milestone review at ${rel}`,
        got: problems.join(" · "),
        remedy: { tool: "se_file_read", args: { path: rel }, note: "fill what is empty, set status: done and the verdict, then tick again" },
        source: "engine/session.ts gate",
      });
    }
    // THE BLESS: this passing tick is the act, and it lands durably — the
    // report's version pinned, the hand recorded. Below 0.6 the slider made
    // that hand human; at or above, the delegation is stamped honestly.
    writeFileSync(blessAbs, JSON.stringify({ hash: reportHash, by: channel, at: new Date().toISOString() }) + "\n", "utf8");
  }

  /** THE PING (owner, 2026-07-30): the agent points at a mirror surface and
   *  it pulses YELLOW in every open window — the tour's pointing finger,
   *  and "look HERE" for refusals and diffs. Targets: a card id (machine,
   *  log, details, terminal, chat), a drawn state id, or an element id.
   *  Pointing is advisory — an unknown target pulses nothing and fails
   *  nothing. */
  ping?: { target: string; note?: string; seq: number };
  private pingSeq = 0;
  pingSurface(target: string, note?: string): Record<string, unknown> {
    const t = target.trim();
    if (t === "") {
      throw new Rejection({
        clause: CLAUSES.REQUIRED_ARGS,
        expected: "a surface to ping: a card id (its slugged title from product/cards.md), the widget a card shows, a drawn state id, or an element id",
        got: "an empty target",
        remedy: { tool: "se_panel", args: { ping: "log" }, note: "name what the reader should look at" },
        source: "engine/session.ts ping",
      });
    }
    this.ping = { target: t, ...(note === undefined || note.trim() === "" ? {} : { note: note.trim() }), seq: ++this.pingSeq };
    this.notifyChange();
    return { pinged: t, note: "the surface is lit yellow in every open mirror window, and stays lit until the next ping" };
  }

  private syncKeepAwake(): void {
    // Either flag wants the computer awake. Shutdown-at-idle wants it awake
    // while work is happening; once it is not, powering off is the point.
    const want = (this._blockSleep || this._shutdownAtIdle) && process.platform === "win32" && process.env.SE_KEEPAWAKE_DISABLE !== "1";
    if (want && this.keepAwake === undefined) {
      const src = "Add-Type -TypeDefinition 'using System.Runtime.InteropServices; public class KA { [DllImport(\"kernel32.dll\")] public static extern uint SetThreadExecutionState(uint f); }'; while ($true) { [KA]::SetThreadExecutionState(2147483651) | Out-Null; Start-Sleep -Seconds 30 }";
      this.keepAwake = spawn("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", src], { stdio: "ignore", windowsHide: true });
    } else if (!want && this.keepAwake !== undefined) {
      this.keepAwake.kill();
      this.keepAwake = undefined;
    }
  }

  // ── THE WAIT — how the machine reaches a holding agent. MCP cannot push;
  //    the mirror's long-poll blocks server-side until the human's hand moves
  //    something (slider, tick, evidence) and returns the fresh packet — the
  //    nearest thing to "the machine sends an update to the agent". ────────
  private waiters: Array<() => void> = [];

  // THE CONSOLE QUIT — distinct from reaching end. The walk is unfinished, so
  // the machine's own status stays open and honest; what ended is the SERVER.
  // Conflating the two would record an abandoned walk as a completed one.
  serverGone = false;

  /** Announce the server's departure and wake every held hand at once, so an
   *  open mirror hears it instead of waiting out the death timeout. */
  markServerGone(): void {
    this.serverGone = true;
    this.notifyChange();
  }

  /** Wake every held wait — called on every successful change of the walk. */
  private notifyChange(): void {
    // EVERY HAND RESETS THE IDLE CLOCK. A tick, a mirror click, a note, an
    // evidence write — they all pass through here, so the clock measures
    // silence rather than only the agent's silence.
    this.lastActivity = Date.now();
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

  /**
   * EMERGENCY — the tool gate lifted, everywhere.
   *
   * The gate exists so a state holds the tools its work needs and no more.
   * That is right while the machine is sound, and exactly wrong in the two
   * cases this is for:
   *
   * - REPAIR. When the engine is broken, the gate stands between you and the
   *   fix. The guard becomes the fault.
   * - BUILDING THE LANE WHILE WALKING IT. The first product iteration writes
   *   the machinery it is walking through, in states whose tool lists were
   *   authored before that machinery existed.
   *
   * IT ARMS ONLY FROM THE TOP RUNG, and it drops the moment the rung does.
   * That is the whole safety story: emergency cannot outlive the delegation
   * it was granted under, and the person lowering the autonomy is the same
   * gesture as revoking it.
   *
   * IT IS NOT ADVERTISED. It rides the packet only when it is ON, so nothing
   * about the resting state hints that it exists.
   *
   * IT DOES NOT PERSIST. A new engine life starts without it. An emergency
   * that survives a restart unannounced is a gate quietly missing.
   */
  private _emergency = false;

  get emergency(): boolean {
    return this._emergency;
  }

  setEmergency(on: boolean): Record<string, unknown> {
    if (on && this._autonomy < 1) {
      throw new Rejection({
        clause: CLAUSES.ABOVE_THRESHOLD,
        expected: "the autonomy at its top rung before emergency arms — it is a step past full delegation, never a way around it",
        got: `autonomy ${this._autonomy}`,
        remedy: { tool: "se_pull", args: {}, note: "raise the autonomy to the top rung first" },
        source: "engine/session.ts emergency",
      });
    }
    const was = this._emergency;
    this._emergency = on;
    this.notifyChange();
    return { emergency: on, was };
  }

  setAutonomy(value: number): Record<string, unknown> {
    if (typeof value !== "number" || Number.isNaN(value) || value < 0 || value > 1) {
      throw new Rejection({
        clause: CLAUSES.REQUIRED_ARGS,
        expected: "an autonomy between 0 (every step is the human's) and 1 (fully autonomous)",
        got: String(value),
        remedy: { tool: "se_pull", args: {}, note: "the autonomy is set from the mirror's slider or at launch (--autonomy)" },
        source: "engine/session.ts autonomy",
      });
    }
    const was = this._autonomy;
    this._autonomy = value;
    // Emergency cannot outlive the rung it was granted under. Lowering the
    // autonomy IS revoking it, so there is no second control to remember.
    if (value < 1) this._emergency = false;
    this.persistSettings();
    this.notifyChange(); // a holding agent wakes and re-reads the packet
    return { autonomy: value, was, ...(this._emergency ? { emergency: true } : {}) };
  }

  /** The autonomy gate: an AGENT tick may enter a state only when its
   *  priority <= the session autonomy. The human's hand is never gated. */
  private gatePriority(m: MachineDecl, targetIds: string[], channel: Channel): void {
    if (channel !== "agent") return;
    for (const id of targetIds) {
      const t = m.states.find((s) => s.id === id);
      if (t === undefined) continue;
      if (t.priority > this._autonomy) {
        throw new Rejection({
          clause: CLAUSES.ABOVE_THRESHOLD,
          expected: `a state within the session autonomy ${this._autonomy}`,
          got: `${id} weighs ${t.priority} — this step is the human's`,
          remedy: { tool: "se_pull", args: {}, note: "STOP and tell the human PLAINLY: this step waits for their hand (they advance it in the mirror, or raise the slider), and the slider alone cannot wake you — they must SEND YOU A MESSAGE (e.g. 'continue') after changing it. Then end your turn. A later pull re-weighs the step." },
          source: "engine/session.ts threshold",
        });
      }
    }
  }

  // ATOMIC TICKS RETIRED WITH THE TICK (owner ruling 2026-08-02). The
  // `from` assertion existed because an agent PLANNED a move and the
  // human's hand could shift the walk under it. The pull plans nothing:
  // it recomputes from wherever the walk stands, every call, so the race
  // the assertion guarded against no longer exists to lose.

  /** THE ORDERED RELOAD (owner ruling 2026-07-27): engine swaps fire only
   *  on request — never on their own — and only at idle. The canary
   *  refuses to kill a running engine for a tree that does not load; then
   *  the child exits 42 and the shim respawns it on the new sources. The
   *  walk reboots — by design; boot re-proves the new engine green. */
  requestReload(): Record<string, unknown> {
    const leaf = this.active()[0] ?? "";
    if (leaf !== "idle") {
      throw new Rejection({
        clause: CLAUSES.NOT_LEGAL_IN_STATE,
        expected: "the walk at idle — a reload reboots it, nothing mid-flight may be lost",
        got: `standing in ${leaf || "(nowhere)"}`,
        remedy: { tool: "se_pull", args: {}, note: "reach idle first — answer the offered doors with idle, or ask the person to aim the mirror — then se_reload" },
        source: "engine/session.ts reload",
      });
    }
    const engineDir = dirname(fileURLToPath(import.meta.url));
    const entry = pathToFileURL(join(engineDir, "tools.ts")).href;
    const probe = `import(${JSON.stringify(entry)}).then(()=>process.exit(0),(e)=>{console.error("se canary: "+(e&&e.message||e));process.exit(1)})`;
    const r = spawnSync(process.execPath, ["-e", probe], { encoding: "utf8", timeout: 30_000, windowsHide: true });
    if (r.status !== 0) {
      throw new Rejection({
        clause: CLAUSES.CONDITION_UNMET,
        expected: "sources whose module graph LOADS — the canary never kills a running engine for a broken tree",
        got: (r.stderr || "no canary output").trim().slice(0, 300),
        remedy: { tool: "se_file_read", args: { path: "product/deliverable/engine/tools.ts" }, note: "fix the named error, then se_reload again" },
        source: "engine/session.ts reload",
      });
    }
    if (process.env.SE_RELOAD_DRY === "1") return { reload: "dry", note: "canary green — no exit (SE_RELOAD_DRY)" };
    setTimeout(() => process.exit(42), 400);
    return { reload: "armed", note: "the engine restarts in under a second on the NEW sources — the walk reboots at start; tick when the lane answers" };
  }

  /** Where the LANE works: the bound expedition's worktree, else the root. */
  workRoot(): string {
    return this.bound?.path ?? this.root;
  }

  /** Where the lane resolves ONE path (owner ruling 2026-07-28).
   *
   *  `.se/` is SESSION state, never branch content. The handover, the notes
   *  and the call log belong to the project root, and the NEXT session reads
   *  them there whatever branch this one happened to stand on. Resolving them
   *  into a worktree wrote them where nobody would ever look — silently.
   *
   *  Everything else follows the walk into its worktree, as it always did. */
  laneRoot(rel?: string): string {
    if (rel === undefined) return this.workRoot();
    // A DECLARED ROOT is session state exactly like .se/ — its declaration
    // lives in the project root's .se/roots.json, so a bound worktree must
    // never make the owner's roots read as undeclared (found live 2026-07-30).
    if (rel.startsWith("@")) return this.root;
    return rel.replace(/\\/g, "/").split("/")[0] === ".se" ? this.root : this.workRoot();
  }

  expeditionNew(kind: string, goal: string): Record<string, unknown> {
    const e = expNew(this.root, kind, goal);
    return { created: e.id, branch: e.branch, note: "it stands in the expeditions container — enter there to work" };
  }

  iterationSeed(goal: string, vision: string, inputs: string[] = []): Record<string, unknown> {
    const it = itSeed(this.root, goal, vision, inputs);
    return { seeded: it.id, branch: it.branch, note: "it stands in the iterations container as its kickoff" };
  }

  iterationOpen(id: string): Record<string, unknown> {
    const it = itFind(this.root, id);
    this.bound = it;
    markStarted(this.root, it);
    this.decisions.setExtraSink(join(it.path, "product", "spec", "iterations", it.id, "decisions.jsonl"));
    return { bound: it.id, note: "the lane now works in this iteration's worktree" };
  }

  /** THE BLESS PINS (owner verdicts 2026-07-30): leaving an iteration
   *  kickoff compiles the record's blessed change_size from the LIVE rigor matrix
   *  and pins the machine into the record. No change size, no pass — the
   *  demand is mechanical. An existing same-size pin walks on untouched;
   *  a larger size escalates; pinIteration refuses de-escalation itself. */
  private pinKickoff(fullId: string | undefined): void {
    if (fullId === undefined) return;
    const it = itFind(this.root, fullId);
    const rec = readItRecord(this.root, it);
    const size = typeof rec?.change_size === "string" ? rec.change_size : undefined;
    const pinAbs = join(it.path, itPinRel(it.id));
    if (size === undefined) {
      if (existsSync(pinAbs)) return; // blessed in an earlier pass — walk on
      throw new Rejection({
        clause: CLAUSES.CONDITION_UNMET,
        expected: `a change_size in the iteration record (${CHANGE_COLUMNS.join(" | ")}) — the bless compiles the column and pins the machine`,
        got: "no change_size in the record's frontmatter",
        remedy: {
          tool: "se_file_patch",
          args: { ops: [{ path: itRecordRel(it.id), old_string: "status:", new_string: `change_size: <${CHANGE_COLUMNS.join(" | ")}>\nstatus:` }] },
          note: "prefill it from the goal with its reasoning — the person's bless is the tick itself",
        },
        source: "engine/session.ts kickoff",
      });
    }
    if (existsSync(pinAbs)) {
      try {
        if ((JSON.parse(readFileSync(pinAbs, "utf8")) as { change_size?: string }).change_size === size) return;
      } catch {
        // an unreadable pin falls through and is re-pinned
      }
    }
    const pin = pinIteration(this.root, it, size);
    this.rewalk(pin, `escalated to ${size}`);
  }

  /**
   * THE RE-WALK. One mechanism, several triggers.
   *
   * Escalating an iteration, leaving it and coming back, and reworking it
   * after the matrix changed are the SAME act: walk it again and check whether
   * any evidence still answers what is now asked. So there is no
   * escalation-specific ledger — there is a demand diff, and this.
   *
   * A demand is what a step ASKS FOR: how far it applies, plus its evidence
   * spec. pinIteration computes which steps' demands moved; reopenStates is
   * what acts on that. The two existed and nothing joined them, so the list
   * was written into the pin and read by nobody, and an escalation kept every
   * step it had already passed.
   *
   * PRIOR FILLS ARE SUPERSEDED, NEVER DELETED. reopenStates keeps them on
   * disk and in the history, so a reader sees what was claimed the first time
   * and that it was re-earned.
   */
  private rewalk(pin: Record<string, unknown>, reason: string): { reopened: string[]; cone: string[] } | undefined {
    const owed = Array.isArray(pin.reopened) ? (pin.reopened as unknown[]).map(String) : [];
    if (owed.length === 0) return undefined;
    const run = this.top();
    if (run === undefined) return undefined;
    // A step whose demand moved but which this column does not declare has
    // nothing to reopen. Filtering beats refusing: the pin spans sizes, the
    // compiled machine is one of them.
    const known = owed.filter((id) => run.decl.states.some((s) => s.id === id));
    if (known.length === 0) return undefined;
    const { reopened, cone } = reopenStates(run.decl, run.instance, known, reason, new Date().toISOString());
    this.notifyChange();
    return { reopened, cone };
  }

  expeditionList(): Record<string, unknown> {
    const all = expList(this.root);
    const describe = (e: Expedition): Record<string, unknown> => {
      const fm = readRecord(this.root, e);
      return {
        id: e.id,
        ...(typeof fm?.goal === "string" ? { goal: fm.goal } : {}),
        ...(typeof fm?.status === "string" ? { status: fm.status } : {}),
        // The close RULING (renamed from `report:` — old records still carry that key).
        ...(typeof fm?.ruling === "string" ? { ruling: fm.ruling } : typeof fm?.report === "string" ? { ruling: fm.report } : {}),
      };
    };
    return {
      open: all.filter((e) => e.open).map(describe),
      archive: all.filter((e) => !e.open).map(describe),
    };
  }

  expeditionOpen(id: string): Record<string, unknown> {
    this.bound = expFind(this.root, id);
    // While bound, decision ops ALSO land in the record: the reasoning is
    // part of the persistent walk (owner ruling 2026-07-27), parts per visit.
    this.decisions.setExtraSink(join(this.bound.path, "product", "spec", "expeditions", this.bound.id, "decisions.jsonl"));
    return { bound: this.bound.id, note: "the lane now works in this expedition's worktree" };
  }

  expeditionClose(merge: boolean, override?: string): Record<string, unknown> {
    if (this.bound === undefined) {
      throw new Rejection({
        clause: CLAUSES.NOT_LEGAL_IN_STATE,
        expected: "a bound expedition",
        got: "none open",
        remedy: { tool: "se_pull", args: {}, note: "enter the expedition via continue_expedition first" },
        source: "engine/session.ts expedition",
      });
    }
    // THE GRAPH IS EVIDENCE at the close itself too — the leave gate can
    // be bypassed (close is legal in the work state), the close cannot.
    const open = this.openRecordPoints();
    if (open.length > 0) {
      throw new Rejection({
        clause: CLAUSES.DECISION_UNRESOLVED,
        expected: "no open decision point on this record — the graph is evidence",
        got: open.slice(0, 8).map((n) => `${n.id}: ${n.brief}`).join(" · ") + (open.length > 8 ? ` · …and ${open.length - 8} more` : ""),
        remedy: { tool: "se_pull", args: { update: { op: "done", node: open[0].id, brief: "<how it resolved>" } }, note: "resolve every point (done | obsolete | revert | defer), then close" },
        source: "engine/session.ts close",
      });
    }
    const result = expClose(this.root, this.bound, merge, override);
    this.unbind();
    return {
      ...result,
      note: merge ? "applied — merged to trunk, archived" : "dismissed — archived unmerged",
      ...(result.override === undefined ? {} : { override_note: "the report was NOT confirmed by a person — this close is recorded as an override on the record" }),
    };
  }

  private unbind(): void {
    this.bound = undefined;
    this.decisions.setExtraSink(undefined);
  }

  /** ESCAPE (owner ruling 2026-08-02): ONE hatch, and it lands at the
   *  FRONT DESK — where the person is. Every kind of stepping out is this
   *  same move, told apart only by its reason: the person said stop, the
   *  walk is mechanically stuck, earlier work no longer stands. (pause
   *  and the agent-side back retired with this ruling; the person's back
   *  button remains the invalidating hand.) The walk that was left is
   *  LEFT STANDING; a later walk re-enters it, fast-forwarding on stored
   *  evidence. Boot is the one exception — it must complete.
   *
   *  A QUESTION IS NOT AN ESCAPE (owner, same day): an agent waiting on
   *  an answer stays in its state, asks, and stops — the state holds and
   *  the reply resumes it there. Escaping is for when NO answer could
   *  let the walk continue from here.
   *
   *  THE HATCH IS NEVER GATED: no slider weighing, no read demand. Going
   *  to the desk IS going to ask the person — the andon cord — and a cord
   *  that can refuse to be pulled is no cord. What the desk demands
   *  arrives on the next pull, as `read`. */
  escape(reason: string, channel: Channel = "agent"): Record<string, unknown> {
    if (reason.trim() === "") {
      throw new Rejection({
        clause: CLAUSES.REQUIRED_ARGS,
        expected: "a reason — an escape is recorded with its why, never a silent exit",
        got: "an empty reason",
        remedy: { tool: "se_pull", args: { escape: "<why you are stepping out>" } },
        source: "engine/session.ts escape",
      });
    }
    if (this.instance.status === "closed") {
      throw new Rejection({
        clause: CLAUSES.NOT_LEGAL_IN_STATE,
        expected: "an open machine",
        got: "an escape after end",
        remedy: { tool: "se_pull", args: {}, note: "the machine is done; a new session starts at the beginning" },
        source: "engine/session.ts escape",
      });
    }
    const stood = this.active();
    if (!this.inSub()) {
      if (stood.includes("front_desk")) {
        throw new Rejection({
          clause: CLAUSES.NOT_LEGAL_IN_STATE,
          expected: "a walk away from the desk",
          got: "standing at the front desk — the desk IS the escape target",
          remedy: { tool: "se_pull", args: {}, note: "nothing to escape; talk to the person and pull on" },
          source: "engine/session.ts escape",
        });
      }
      if (!this.instance.history.some((h) => h.state === "boot" && h.outcome === "filled")) {
        throw new Rejection({
          clause: CLAUSES.NOT_LEGAL_IN_STATE,
          expected: "a booted walk",
          got: `an escape before boot completed [${stood.join(", ")}]`,
          remedy: { tool: "se_pull", args: {}, note: "boot cannot be skipped — it must complete; if it is broken, tell the user" },
          source: "engine/session.ts escape",
        });
      }
      const nowMain = new Date().toISOString();
      const stoodIn = stood[0] ?? "(no state)";
      this.instance.history.push({ state: stoodIn, outcome: "escaped", at: nowMain });
      this.instance.escapes.push({ state: stoodIn, exhausted_guard: reason.slice(0, 300), at: nowMain });
      this.instance.active = ["front_desk"];
      this.instance.current = "front_desk";
      this._target = "";
      this.unbind();
      this.notifyChange();
      return {
        ...this.tickInfo(),
        escaped: { from: stoodIn, reason },
        note: "escaped to the front desk — the walk was left standing. Tell the person PLAINLY why, then wait for their word.",
      };
    }
    if (this.top()!.decl.id === "boot") {
      throw new Rejection({
        clause: CLAUSES.NOT_LEGAL_IN_STATE,
        expected: "a sub-machine other than boot",
        got: "an escape from boot",
        remedy: { tool: "se_pull", args: {}, note: "boot cannot be skipped — it must complete; if it is broken, tell the user" },
        source: "engine/session.ts escape",
      });
    }
    const now = new Date().toISOString();
    const stoodIn = this.active()[0];
    const parent = this.subs[0].parentState;
    this.instance.history.push({ state: stoodIn, outcome: "escaped", at: now });
    this.instance.escapes.push({ state: parent, exhausted_guard: reason.slice(0, 300), at: now });
    this.instance.active = [...activeStates(this.instance).filter((s) => s !== parent), "front_desk"];
    this.instance.current = "front_desk";
    this.subs = [];
    this._target = "";
    this.unbind();
    this.notifyChange();
    return {
      ...this.tickInfo(),
      escaped: { from: stoodIn, reason },
      note: "escaped to the front desk — the machine was left standing, and a later walk re-enters it. Tell the person PLAINLY why, then wait for their word.",
    };
  }

  private state(m: MachineDecl, id: string): StateDecl {
    const s = m.states.find((st) => st.id === id);
    if (s === undefined) throw new Error(`undeclared state ${id}`);
    return s;
  }

  /** completeState with the WEDGE GUARD: a move that would leave an open
   *  machine with NO active state is refused with the starving join named —
   *  the walk stands instead of stranding. Found live 2026-07-28: plain
   *  return edges compiled as normal made idle an AND-join, and completing
   *  boot dropped the only token into nowhere. */
  private completeGuarded(m: MachineDecl, inst: MachineInstance, stateId: string, outcome: "filled" | "failed", now: string, only?: string): void {
    const snap = {
      active: inst.active === undefined ? undefined : [...inst.active],
      fired: inst.fired === undefined ? undefined : [...inst.fired],
      current: inst.current,
      status: inst.status,
    };
    completeState(m, inst, stateId, outcome, now, only);
    if (activeStates(inst).length > 0 || inst.status !== "open") return;
    const starving = [...new Set((inst.fired ?? []).map((k) => k.split("->")[1]))];
    inst.active = snap.active;
    inst.fired = snap.fired;
    inst.current = snap.current;
    inst.status = snap.status;
    throw new Rejection({
      clause: CLAUSES.DEAD_END,
      expected: `completing ${stateId} activates a successor`,
      got: `nothing activates — ${starving.join(", ") || "a join"} still waits for other inbound edges (the drawing makes it an AND-join)`,
      remedy: { tool: "se_pull", args: {}, note: "every plain edge into the named state must fire before it activates. If those edges are returns, redraw them (a reverse-of-forward edge compiles as a return) — or walk the other branches first. The walk has not moved." },
      source: "engine/session.ts wedge-guard",
    });
  }

  /** A sub governs as long as it stands — including its visible end
   *  position; it is popped when its parent state completes. Machines
   *  nest to ANY depth (owner order 2026-07-28): the walk is a stack. */
  private inSub(): boolean {
    return this.subs.length > 0;
  }

  private top(): SubRun | undefined {
    return this.subs[this.subs.length - 1];
  }

  /** The machine one level up from the top sub — where its parent state lives. */
  private parentOfTop(): { machine: MachineDecl; instance: MachineInstance } {
    const below = this.subs[this.subs.length - 2];
    return below === undefined ? { machine: this.machine, instance: this.instance } : { machine: below.decl, instance: below.instance };
  }

  /** The machine+states whose legal_tools govern right now. */
  private leaves(): { machine: MachineDecl; ids: string[] } {
    const top = this.top();
    if (top !== undefined) return { machine: top.decl, ids: activeStates(top.instance) };
    return { machine: this.machine, ids: activeStates(this.instance) };
  }

  /** THE MACHINE IS READ LIVE (owner ruling 2026-07-29). Editing a state
   *  note — its legal tools, its priority, its guidance — takes effect on
   *  the next call. The markdown is the single truth, so a running lane
   *  that enforces yesterday's copy of it is enforcing a lie.
   *
   *  se_reload is still the door for ENGINE CODE, which Node caches as
   *  modules and no re-read can reach.
   *
   *  TWO THINGS NEVER MOVE THE GROUND UNDER THE WALK:
   *  - A drawing that will not compile. The last good one stands and the
   *    walk continues — the same bargain SE-C-124 already makes.
   *  - A drawing that no longer holds a state the walk is standing in.
   *    Deleting the active state out from under a live walk would strand
   *    it, so the edit waits until the walk has moved on. */
  get machine(): MachineDecl {
    let fresh: MachineDecl;
    try {
      fresh = compileMachineCached(this.root, mainMachinePath(this.root));
    } catch {
      return this._machine;
    }
    if (fresh === this._machine) return fresh;
    if (this.instance !== undefined && !activeStates(this.instance).every((id) => fresh.states.some((s) => s.id === id))) {
      return this._machine;
    }
    this._machine = fresh;
    return fresh;
  }

  active(): string[] {
    const { ids } = this.leaves();
    if (!this.inSub()) return ids;
    const prefix = this.subs.map((s) => s.decl.id).join("/");
    return ids.map((s) => `${prefix}/${s}`);
  }

  /** Standing in the retro — the one place holding the whole picture, so
   *  the one place that may park a note or carry it (engine/inbox.ts). */
  inRetro(): boolean {
    return this.active().some((id) => id === "retro" || id.endsWith("/retro"));
  }

  /** The machine standing behind a qualified prefix ("" is main). A prefix
   *  segment is a SUBMACHINE's id, which is also its state's id in every
   *  machine drawn so far; a mismatch resolves to nothing and the route
   *  reports no path rather than a wrong one. */
  private declForPrefix(prefix: string): MachineDecl | undefined {
    if (prefix === "") return this.machine;
    let decl = this.machine;
    let gen: GeneratedMachine | undefined;
    for (const seg of prefix.split("/")) {
      const st = decl.states.find((s) => s.id === seg);
      if (st?.submachine === undefined) return undefined;
      const g = gen?.subGen?.[seg]?.() ?? this.genFor(seg);
      if (g !== undefined) {
        decl = g.decl;
        gen = g;
        continue;
      }
      try {
        decl = compileMachineCached(this.root, resolveRef(this.root, mainMachinePath(this.root), st.submachine));
      } catch {
        return undefined;
      }
      gen = undefined;
    }
    return decl;
  }

  private static qual(prefix: string, id: string): string {
    return prefix === "" ? id : `${prefix}/${id}`;
  }

  /** One node of the flattened walk graph, for the route's search. Two
   *  moves are not drawn anywhere and have to be modelled here:
   *  - entering a state that CARRIES a submachine lands on that machine's
   *    own start, not on the state;
   *  - reaching a submachine's END and advancing pops back out and follows
   *    the parent state's edges. One tick, two moves. */
  private expandNode(q: string): RouteNode | undefined {
    const cut = q.lastIndexOf("/");
    const prefix = cut < 0 ? "" : q.slice(0, cut);
    const id = cut < 0 ? q : q.slice(cut + 1);
    const decl = this.declForPrefix(prefix);
    const st = decl?.states.find((s) => s.id === id);
    if (decl === undefined || st === undefined) return undefined;
    const nexts: RouteNode["nexts"] = [];
    for (const e of st.edges) {
      const t = decl.states.find((s) => s.id === e.to);
      if (t === undefined) continue;
      const landed = Session.qual(prefix, t.id);
      if (t.submachine !== undefined) {
        const inner = this.declForPrefix(landed);
        if (inner !== undefined) {
          nexts.push({ to: Session.qual(landed, inner.initial), tick: { from: q, to: e.to } });
          continue;
        }
      }
      nexts.push({ to: landed, tick: { from: q, to: e.to } });
    }
    if (st.kind === "end" && prefix !== "") {
      const pcut = prefix.lastIndexOf("/");
      const pprefix = pcut < 0 ? "" : prefix.slice(0, pcut);
      const pid = pcut < 0 ? prefix : prefix.slice(pcut + 1);
      const pst = this.declForPrefix(pprefix)?.states.find((s) => s.id === pid);
      for (const e of pst?.edges ?? []) nexts.push({ to: Session.qual(pprefix, e.to), tick: { from: q, advance: true } });
    }
    return { priority: st.priority, demands: { ...(st.entry ?? {}) }, exit_demands: { ...(st.exit ?? {}) }, nexts };
  }

  get target(): string {
    return this._target;
  }

  /** A one-shot target clears itself the moment the walk stands on it. */
  /** ARRIVAL IS A COMPARISON, NEVER A SEARCH. This once asked route() whether
   *  the way here was empty, and route() expands the drawing — which for a
   *  generated container means WRITING it, against the project root, on every
   *  packet the engine builds. A bound worktree then walked a container that
   *  was being regenerated underneath it. Reading where you stand must never
   *  change where you stand. */
  private clearTargetIfArrived(): void {
    if (this._target === "") return;
    const here = this.active()[0];
    if (here === undefined) return;
    // A submachine is aimed at by its container name; route() lands on its
    // start, so arrival compares against the same normalised id.
    const decl = this.machine.states.find((s) => s.id === this._target);
    const aim = decl?.submachine !== undefined ? `${this._target}/start` : this._target;
    if (here === aim) this._target = "";
  }

  /** Aim the walk somewhere else. Setting a target moves nothing — it says
   *  where the way is drawn to. An unreachable one is refused rather than
   *  stored, so the blue line never points at nowhere.
   *
   *  Passing an empty string clears the target explicitly. */
  setTarget(to: string): Record<string, unknown> {
    const wanted = to.trim();
    if (wanted === "") {
      this._target = "";
      return { ...this.route(this.active()[0] ?? this.machine.initial), target: this._target };
    }
    const r = this.route(wanted);
    if (!r.found && wanted !== this.active()[0]) {
      throw new Rejection({
        clause: CLAUSES.NOT_LEGAL_IN_STATE,
        expected: "a state the drawing can reach from here",
        got: `${wanted} — ${r.note ?? "no path"}`,
        remedy: { tool: "se_pull", args: {}, note: "aim only at drawn states — pull with no payload and the machine offers the doors it can reach" },
        source: "engine/session.ts target",
      });
    }
    this._target = wanted;
    this.clearTargetIfArrived();
    // The reader's OWN name wins the report. route() answers with the
    // normalised aim so the render can place the dot, and spreading it last
    // would hand "expeditions/start" back to someone who said "expeditions".
    return { ...r, target: this._target };
  }

  /** Conditions no agent can discharge alone. A script it can run; a read
   *  it can prove. A form wants a person's confirmation, by design. */
  private static readonly PERSON_CONDITIONS: ReadonlySet<string> = new Set(["evidence_form"]);

  /** THE BLUE LINE. Where the walk stands, where it is headed, and every
   *  hop between — with what each will ask for. It MOVES NOTHING.
   *
   *  EVERY JUDGMENT IS COLLECTED UP FRONT (owner ruling 2026-07-29). Not
   *  just the first blocker: the whole list, so a person can answer all of
   *  them in one sitting and then leave the walk to run alone. Stopping at
   *  each one in turn is how a five-minute errand becomes an afternoon of
   *  being asked one question at a time. */
  route(target: string): RouteResult & {
    from: string;
    autonomy: number;
    judgments: { at: string; needs: string; why: string }[];
    reads: string[];
    stops_at?: { at: string; why: string };
  } {
    const from = this.active()[0] ?? this.machine.initial;
    // A SUBMACHINE IS NAMED BY ITS CONTAINER, but the search graph never holds
    // that name: expandNode replaces the container with its inner states. So
    // aiming at "expeditions" found no path to a state the reader had just
    // walked into, which made the target useless for half the drawing (found
    // live 2026-07-29, the moment the mirror got a key for setting it).
    // Aim at its start. The render maps that back to the container node, so
    // the destination dot still lands exactly where the reader pointed.
    const decl = this.machine.states.find((s) => s.id === target);
    const aim = decl?.submachine !== undefined ? `${target}/start` : target;
    const r = computeRoute(from, aim, (q) => this.expandNode(q));
    const judgments: { at: string; needs: string; why: string }[] = [];
    for (const s of r.steps) {
      // The slider is weighed HOP BY HOP. A route that walks past a state
      // the agent may not enter is a hole straight through contract rule 3.
      if (s.priority > this._autonomy) {
        judgments.push({
          at: s.to,
          needs: "the slider, or the person's own hand",
          why: `entering ${s.to} weighs ${s.priority}, above the session autonomy ${this._autonomy}`,
        });
      }
      for (const key of Object.keys(s.demands)) {
        if (!Session.PERSON_CONDITIONS.has(key)) continue;
        judgments.push({ at: s.to, needs: key, why: `${s.to} asks for ${key}: ${(s.demands[key] ?? []).join(", ")}` });
      }
    }
    // EVERY DOCUMENT THE WHOLE WAY DEMANDS, gathered once. This is what
    // makes a sweep one call rather than one per hop: read this list, hash
    // it, and hand the lot over. A route is also PULLED guidance, which the
    // entry conditions never name, so both are collected.
    const reads = new Set<string>();
    for (const s of r.steps) {
      for (const p of s.demands.read ?? []) reads.add(p);
      const cut = s.to.lastIndexOf("/");
      const decl = this.declForPrefix(cut < 0 ? "" : s.to.slice(0, cut));
      const st = decl?.states.find((x) => x.id === (cut < 0 ? s.to : s.to.slice(cut + 1)));
      if (decl === undefined || st === undefined) continue;
      for (const d of this.pulled(decl, st)) reads.add(d.path);
      // A consumed document is read like any other. Only one that is really
      // there joins the list — the handover usually is not.
      for (const p of this.consumeDemand(st)) reads.add(p);
    }
    return {
      ...r,
      from,
      autonomy: this._autonomy,
      judgments,
      reads: [...reads].sort(),
      ...(judgments.length > 0 ? { stops_at: { at: judgments[0].at, why: judgments[0].why } } : {}),
    };
  }

  /** The whole way's reading list, for the packet to carry unasked.
   *  Empty with no target, and empty when the way cannot be drawn — a
   *  target no edge reaches must not take the packet down with it. */
  private routeReads(): string[] {
    if (this._target === "") return [];
    try {
      return this.route(this._target).reads;
    } catch {
      return [];
    }
  }

  // ── THE READING (owner design 2026-07-31) ──────────────────────────
  //
  // ONE DOCUMENT, NOT A LIST OF THEM. The engine knows both halves already:
  // what the way ahead demands, and what the head already holds. So it hands
  // over the DIFFERENCE as a single file. One read instead of eight, and
  // reading it credits every document inside it.
  //
  // NAMING THE LIST WAS NOT ENOUGH. route_reads gathered the paths in one
  // place and the reading still cost a call per batch, because a list of
  // eight paths is still eight documents to ask for.
  //
  // ONLY THE UNREAD PART IS GATHERED, so nothing is read twice and the
  // reading shrinks to nothing as the walk proceeds.
  //
  // EACH PART CARRIES ITS OWN HASH in its header, and crediting re-hashes
  // from disk: a document that moved between the gathering and the crediting
  // is skipped and simply demanded again. A stale credit would be a proof of
  // reading something nobody was shown.
  static readonly READING_PATH = ".se/reading.md";

  private readingParts: ReadonlyArray<{ path: string; hash: string; from: number; to: number }> = [];

  /** Every document the way ahead still wants — unread only, in walk order.
   *  With no target set it falls back to where you stand: what this state
   *  pulls, plus what its neighbours demand at entry. */
  readingList(): string[] {
    const want: string[] = [];
    const add = (p: string): void => {
      if (p !== "" && !p.startsWith("@") && !want.includes(p)) want.push(p);
    };
    for (const p of this.routeReads()) add(p);
    if (want.length === 0) {
      const { machine, ids } = this.leaves();
      for (const id of ids) {
        const s = this.state(machine, id);
        for (const d of this.pulled(machine, s)) add(d.path);
        for (const p of this.lookaheadRequirements(machine, s)) add(p);
      }
    }
    // THE HANDOVER RULE JOINS THE LOOP. When the slider rises mid-walk,
    // the agent's advances must prove the reading the human checked — even
    // past transitions the human already walked. The gate has always
    // demanded it; the loop must therefore SERVE it, or the pull would
    // say "read" for a list that cannot satisfy the walk it feeds.
    for (const p of this.humanCheckedPaths()) add(p);
    return want.filter((p) => !this.bufferedCurrent(p));
  }

  /** Write the reading, and remember which lines came from which document. */
  buildReading(): string[] {
    const paths = this.readingList();
    const parts: { path: string; hash: string; from: number; to: number }[] = [];
    const out: string[] = [
      "# The reading",
      "",
      paths.length === 0
        ? "Nothing is owed. Every document the way ahead demands is already in your head."
        : `${paths.length} document(s) the way ahead demands, gathered here. Reading this file credits every one of them: you do not read them again, and you do not send their hashes.`,
      "",
    ];
    for (const rel of paths) {
      let body: string;
      let hash: string;
      try {
        body = readFileSync(resolveInRoot(this.laneRoot(rel), rel, "engine/session.ts reading")).toString("utf8");
        hash = contentHash(body);
      } catch {
        continue; // unreadable here: it stays owed, and says so where it is asked for
      }
      out.push(`<!-- ${rel} · ${hash} -->`, "", `## ${rel}`, "");
      const from = out.length + 1;
      out.push(...body.split("\n"));
      parts.push({ path: rel, hash, from, to: out.length });
      out.push("");
    }
    mkdirSync(seDir(this.root), { recursive: true });
    writeFileSync(join(seDir(this.root), "reading.md"), out.join("\n"), "utf8");
    this.readingParts = parts;
    return paths;
  }

  /** Credit what the served window actually showed. A part counts only when
   *  the window covered ALL of it — half a document is not a read — and only
   *  when it still hashes as it did when gathered. */
  creditReading(offset: number, lines: number): string[] {
    const last = offset + lines - 1;
    const credited: string[] = [];
    for (const p of this.readingParts) {
      if (p.from < offset || p.to > last) continue;
      if (this.diskHash(p.path) !== p.hash) continue;
      this.readBuffer.set(p.path, p.hash);
      credited.push(p.path);
    }
    return credited;
  }

  /** THE PULL — the reading as a LOOP. One call hands over the next guidance
   *  the way ahead demands, as text, already credited; call it again until it
   *  answers done.
   *
   *  WHY A LOOP AND NOT ONE BIG READ. The whole reading is fifty thousand
   *  bytes of guidance. A host that moves a large tool result to disk hands
   *  the agent a PREVIEW instead of the text — and the engine has already
   *  credited it, so the agent stands proven to have read what it never saw.
   *  A page the ENGINE bounds cannot be eaten downstream, and the caller does
   *  no arithmetic: it asks again until told to stop.
   *
   *  ONE DOCUMENT PER CALL (owner ruling). A page bounded by a byte budget
   *  needs a constant nobody can calibrate — the threshold belongs to the
   *  host and is not published. A document is a natural page, it is always
   *  whole, and the largest guidance file is a tenth of what got eaten.
   *
   *  UNREADABLE IS REPORTED, NOT SKIPPED FOREVER. A path that cannot be read
   *  from here is named and left out of the remainder, so the loop still ends
   *  and the refusal that follows can say what is missing. */
  pullReading(): Record<string, unknown> {
    const paths = this.readingList();
    const unreadable: string[] = [];
    const flag = (): Record<string, unknown> =>
      unreadable.length > 0 ? { unreadable, warning: "demanded, but not readable from here. The gate that wants them will say so." } : {};
    for (const rel of paths) {
      let body: string;
      try {
        body = readFileSync(resolveInRoot(this.laneRoot(rel), rel, "engine/session.ts reading")).toString("utf8");
      } catch {
        unreadable.push(rel);
        continue;
      }
      const hash = contentHash(body);
      this.readBuffer.set(rel, hash);
      const remaining = paths.length - unreadable.length - 1;
      return {
        document: { path: rel, hash, content: body },
        remaining,
        done: false,
        ...flag(),
        note: `read it, then call se_reading again — ${remaining} more owed after this one`,
      };
    }
    return {
      remaining: 0,
      done: true,
      ...flag(),
      note: "nothing is owed — every document the way ahead demands is already in your head. Carry on.",
    };
  }

  /** THE SWEEP — the route, walked. It collapses ROUND TRIPS and nothing
   *  else: every hop still enters its state, still weighs the slider, still
   *  proves its reads, still runs its scripts, still writes its own line to
   *  the feed. The first hop that will not pass stops it, and says so.
   *
   *  THE ROUTE IS RECOMPUTED AFTER EVERY HOP, which is the detour: if the
   *  ground moved, the way is worked out again FROM WHERE THE WALK NOW
   *  STANDS rather than followed off a cliff. */
  async sweep(target: string, channel: Channel): Promise<Record<string, unknown>> {
    const walked: string[] = [];
    // A BANNER EARNED MID-SWEEP MUST SURVIVE THE SWEEP. tickAdvance hands
    // its banner back per hop, and a sweep that swallowed it lost the boot
    // banner every time — the harness rule says show banners verbatim, and
    // nobody can show what the machinery ate.
    const banners: string[] = [];
    const carry = (): Record<string, unknown> => (banners.length > 0 ? { banners } : {});
    for (let guard = 0; guard < 64; guard++) {
      const r = this.route(target);
      if (r.steps.length === 0) {
        return { ...this.tickInfo(), swept: walked, arrived: r.found, ...carry(), ...(r.found ? {} : { note: r.note }) };
      }
      const step = r.steps[0];
      try {
        const one = await this.tickAdvance(step.tick.to === undefined ? undefined : String(step.tick.to), channel);
        if (typeof one.banner === "string") banners.push(one.banner);
      } catch (e) {
        if (!(e instanceof Rejection)) throw e;
        return {
          ...this.tickInfo(),
          swept: walked,
          arrived: false,
          stopped_at: step.to,
          refusal: e.toJSON(),
          ...carry(),
          note: `swept ${walked.length} hop(s), then ${step.to} refused — answer it and sweep again; the route recomputes from here`,
        };
      }
      walked.push(step.to);
    }
    return { ...this.tickInfo(), swept: walked, arrived: false, ...carry(), note: "64 hops without arriving — the sweep stops rather than looping" };
  }

  // ── THE PULL (owner design 2026-08-01) — the agent's ONE verb ───────
  //
  // THE LAW IT KEEPS is v2 §6's, and it is the whole point: BLOCKING IS
  // AN INSTRUCTION RETURNED, NOT AN ERROR. The tick refuses. A threshold,
  // an unmet condition and a stale `from` all arrive as rejections the
  // agent has to decode and recover from. Every one of them is really the
  // machine knowing what should happen next, thrown instead of said.
  //
  // So the agent names no target, carries no read hashes, asks for no
  // state and asks for no tool list. It pulls, does what came back, and
  // pulls again. Options appear ONLY where the machine offers them.
  //
  // THERE IS NO SUBMIT VERB. A pull carrying a filled form IS the submit
  // (owner, 2026-08-01). Pulling again without it returns the same form,
  // so there is no way forward except filling it.

  /** The form names the very NEXT hop demands. The machine looks this up
   *  so the agent never goes hunting for which form applies. */
  private pullFormsOwed(): string[] {
    if (this._target === "") return [];
    try {
      const r = this.route(this._target);
      return r.steps.length === 0 ? [] : (r.steps[0].demands.evidence_form ?? []);
    } catch {
      return [];
    }
  }

  /** The ways out of where the walk stands — the machine's own offer at a
   *  branching point. Weight and openness ride along, so choosing costs
   *  no second call. */
  private pullOptions(): Record<string, unknown>[] {
    const { machine, ids } = this.leaves();
    const out: Record<string, unknown>[] = [];
    for (const id of ids) {
      for (const e of this.state(machine, id).edges) {
        const t = machine.states.find((x) => x.id === e.to);
        if (t === undefined) continue;
        const open = this.conditionMet(machine, t, "enter");
        const overWeight = t.priority > this._autonomy;
        out.push({
          to: e.to,
          role: e.role,
          ...(t.statement !== "" ? { statement: t.statement } : {}),
          priority: t.priority,
          open: open && !overWeight,
          ...(overWeight ? { needs: `the person — ${t.priority} is above the session autonomy ${this._autonomy}` } : {}),
          ...(open ? {} : { blocked_by: Object.keys(this.conditionStatus(machine, t, "enter")) }),
        });
      }
    }
    return out;
  }

  /** The step the walk stands on, said small: id, statement, guidance,
   *  the legal tools, and WHAT IT WILL ASK by name and type — the detail
   *  (guidance documents, per-field help) rides se_reading and the form
   *  itself, so a long batch cannot overflow the answer. */
  private pullHere(): Record<string, unknown>[] {
    const { machine, ids } = this.leaves();
    return ids.map((id) => {
      const s = this.state(machine, id);
      return {
        id: this.inSub() ? `${machine.id}/${s.id}` : s.id,
        ...(s.statement !== "" ? { statement: s.statement } : {}),
        guidance: s.guidance,
        legal_tools: s.kind === "start" || s.kind === "end" || s.kind === "join" ? [...MACHINERY] : (s.legal_tools ?? []),
        ...(s.evidence_form.length > 0 ? { asks: s.evidence_form.filter((f) => f.type !== "derived").map((f) => ({ name: f.name, ...(f.type !== undefined ? { type: f.type } : {}), required: f.required !== false })) } : {}),
      };
    });
  }

  /** WHAT THE MACHINE WANTS NEXT. One of five instructions, and never a
   *  refusal for a walk that simply cannot move yet:
   *
   *  - `read`   documents are owed; nothing walks over unread guidance.
   *  - `fill`   the next step wants a form. Built HERE and handed over.
   *  - `choose` the road splits. The options ride along.
   *  - `do`     the happy path, already walked, up to the next branch.
   *  - `wait`   out of work, or the next step is the person's.
   *
   *  THE PAYLOAD IS WHAT THE AGENT STILL OWNS, and it is TWO fields
   *  (owner ruling 2026-08-02). `form` — the filled form the LAST pull
   *  handed over: evidence for the step being left, or the answer to a
   *  choice the machine offered ({choice: "<to>"}). A choice exists ONLY
   *  where one was offered. `escape` — stepping out, with the why: one
   *  hatch for every kind, landing at the front desk. Everything else —
   *  the hop, the proof, the position, the route, invalidating earlier
   *  work — is the machine's or the person's.
   *
   *  A genuinely ILLEGAL call still throws (v2's Rejected kind): a choice
   *  outside the offer, a form nothing asked for. Those are contract
   *  violations, not a machine with nowhere to go. */
  async pull(payload: { form?: Record<string, unknown>; escape?: string } = {}, channel: Channel = "agent"): Promise<Record<string, unknown>> {
    const head = (): Record<string, unknown> => ({
      where: this.active(),
      ...(this.bound !== undefined ? { expedition: this.bound.id } : {}),
      target: this._target,
      autonomy: this._autonomy,
      narration: { minutes: this._narrationMinutes, calls: this._narrationCalls },
    });

    // STEPPING OUT stays the agent's decision — the machine cannot know
    // the work should stop. ONE hatch (owner ruling 2026-08-02), landing
    // at the front desk; the reason is the whole story.
    if (payload.escape !== undefined) {
      const out = this.escape(String(payload.escape), channel);
      return {
        pull: "wait",
        ...head(),
        stepped_out: out.escaped,
        waiting_for: "the person",
        do: "say plainly why you stepped out and STOP — the desk routes on the person's word",
      };
    }

    // THE PAYLOAD IS THE SUBMIT THAT HAS NO VERB — the filled form the
    // LAST pull handed over. WHICH form is never the agent's call:
    // evidence is expected while a step on the way demands it; a CHOICE
    // only where the machine offered one (the road split, no target).
    // Evidence wins when both could read — deterministic, and documented
    // on the tool.
    let saved: Record<string, unknown> | undefined;
    let fanOut: string[] = [];
    if (payload.form !== undefined) {
      const owed = this.pullFormsOwed();
      if (owed.length > 0) {
        saved = this.formSave(owed[0], payload.form as Record<string, string>);
      } else if (this._target === "" && payload.form.choice !== undefined) {
        // A LIST is legal on purpose: the seam for "send three agents, one
        // per lane" must not be designed shut (owner, 2026-08-01). Only
        // the first is walked, because one agent is walking — and every
        // pick must come from the OFFER, because a choice exists only
        // where the machine asked for one (owner, 2026-08-02).
        const offered = this.pullOptions().map((o) => String(o.to));
        const picks = (Array.isArray(payload.form.choice) ? payload.form.choice : [payload.form.choice]).map(String).filter((x) => x !== "");
        if (picks.length === 0) {
          throw new Rejection({
            clause: CLAUSES.REQUIRED_ARGS,
            expected: "a door from the offer, or a list of them",
            got: "an empty choice",
            remedy: { tool: "se_pull", args: {}, note: "pull with no payload to see the offer again" },
            source: "engine/session.ts pull",
          });
        }
        const stray = picks.find((p) => !offered.includes(p));
        if (stray !== undefined) {
          throw new Rejection({
            clause: CLAUSES.NOT_LEGAL_IN_STATE,
            expected: `one of the offered doors: ${offered.join(", ")}`,
            got: stray,
            remedy: { tool: "se_pull", args: {}, note: "a choice exists only where the machine offered one — pull with no payload and answer from its options" },
            source: "engine/session.ts pull",
          });
        }
        this.setTarget(picks[0]);
        fanOut = picks.slice(1);
      } else {
        throw new Rejection({
          clause: CLAUSES.NOT_LEGAL_IN_STATE,
          expected: "a step that asked for a form",
          got: this._target === "" ? "a filled form, but nothing asked for one" : "a filled form, but nothing on the way wants one",
          remedy: { tool: "se_pull", args: {}, note: "pull with no payload — the machine says what it wants before you fill anything" },
          source: "engine/session.ts pull",
        });
      }
    }

    const extra = (): Record<string, unknown> => ({
      ...(saved !== undefined ? { form_saved: saved } : {}),
      ...(fanOut.length > 0 ? { not_walked: fanOut, note: "one agent is walking, so only the first choice was taken — the others are yours to hand out" } : {}),
    });

    // 1. NO TARGET means the machine is not trying to get anywhere. The
    //    doors are the offer; with none open, the work is the person's.
    if (this._target === "") {
      const options = this.pullOptions();
      if (options.length > 0) {
        return { pull: "choose", ...head(), options, do: "pick one and return it on the next pull as form: {\"choice\": \"<to>\"} — a LIST is legal where the work fans out", ...extra() };
      }
      return { pull: "wait", ...head(), waiting_for: "the person", do: "say plainly that nothing is owed and STOP — the slider alone cannot wake you, so ask them to message you", ...extra() };
    }

    let r: ReturnType<Session["route"]>;
    try {
      r = this.route(this._target);
    } catch (e) {
      if (!(e instanceof Rejection)) throw e;
      return { pull: "wait", ...head(), waiting_for: "the person", why: "the way there cannot be drawn from here", refusal: e.toJSON(), ...extra() };
    }

    if (r.steps.length === 0) {
      return { pull: "wait", ...head(), waiting_for: "the person", why: r.found ? "the target is where the walk already stands" : (r.note ?? "no way there"), ...extra() };
    }

    const first = r.steps[0];

    // 2. THE SLIDER, WEIGHED BEFORE THE READING. Order matters here and it
    //    was wrong once: reading first sent the agent through several
    //    documents to prepare for a step it was never allowed to take, and
    //    only then told it to stop. Nothing is owed for a step that is not
    //    the agent's.
    if (first.priority > this._autonomy) {
      return {
        pull: "wait",
        ...head(),
        waiting_for: "the person",
        at: first.to,
        why: `entering ${first.to} weighs ${first.priority}, above the session autonomy ${this._autonomy}`,
        do: "tell them plainly WHICH step waits and STOP — the slider alone cannot wake you, so they must send a message after moving it",
        ...extra(),
      };
    }

    // 3. THE READING. It is credited by se_reading, so the walk below needs
    //    no hashes from the agent at all.
    const owedDocs = this.readingList();
    if (owedDocs.length > 0) {
      return {
        pull: "read",
        ...head(),
        documents: owedDocs.length,
        do: "call se_reading, read what it hands back, and call it again until it answers done — then pull",
        ...extra(),
      };
    }

    // 4. THE FORM, BUILT AND HANDED OVER. The agent never looks one up.
    const unmet = (first.demands.evidence_form ?? []).filter((n) => !this.formsMet([n]));
    if (unmet.length > 0) {
      return {
        pull: "fill",
        ...head(),
        for: first.to,
        forms: unmet.map((n) => this.formGet(n)),
        do: "fill every required section, then return it on the next pull as form: {\"<section>\": \"<text>\"} — there is no submit verb, and pulling without it hands back this same form",
        ...extra(),
      };
    }

    // 5. THE HAPPY PATH, WALKED. Not one hop — every hop to the next
    //    branching point, because start-to-front-desk has no branch in it
    //    and should never cost a round trip per hop.
    const swept = await this.sweep(this._target, channel);
    // A WALL FURTHER ALONG THE WAY IS THE SAME LAW. The route is weighed
    // hop by hop, so a heavy step three hops out only refuses once the
    // sweep reaches it — and it must arrive as the same instruction the
    // first hop would have given, not as a rejection wearing a walk.
    const ref = swept.refusal as { clause?: string; got?: string } | undefined;
    if (ref?.clause === CLAUSES.ABOVE_THRESHOLD) {
      return {
        pull: "wait",
        ...head(),
        walked: swept.swept ?? [],
        waiting_for: "the person",
        at: swept.stopped_at,
        why: ref.got ?? "the next step weighs more than the session autonomy",
        do: "tell them plainly WHICH step waits and STOP — the slider alone cannot wake you, so they must send a message after moving it",
        ...extra(),
      };
    }
    // AN UNMET CONDITION FURTHER ALONG resolves the way it would have at
    // the first hop: the position moved, so the same pre-checks are asked
    // again from where the walk now stands — the answer is read or fill,
    // never a refusal wearing a walk.
    if (ref?.clause === CLAUSES.CONDITION_UNMET) {
      const owedNow = this.readingList();
      if (owedNow.length > 0) {
        return {
          pull: "read",
          ...head(),
          walked: swept.swept ?? [],
          documents: owedNow.length,
          ...(swept.banners !== undefined ? { banners: swept.banners } : {}),
          do: "call se_reading, read what it hands back, and call it again until it answers done — then pull",
          ...extra(),
        };
      }
      const formsNow = this.pullFormsOwed().filter((n) => !this.formsMet([n]));
      if (formsNow.length > 0) {
        return {
          pull: "fill",
          ...head(),
          walked: swept.swept ?? [],
          for: swept.stopped_at,
          forms: formsNow.map((n) => this.formGet(n)),
          ...(swept.banners !== undefined ? { banners: swept.banners } : {}),
          do: "fill every required section, then return it on the next pull as form: {\"<section>\": \"<text>\"} — there is no submit verb, and pulling without it hands back this same form",
          ...extra(),
        };
      }
    }
    return {
      pull: "do",
      ...head(),
      walked: swept.swept ?? [],
      arrived: swept.arrived === true,
      here: this.pullHere(),
      ...(swept.banners !== undefined ? { banners: swept.banners } : {}),
      ...(swept.refusal !== undefined ? { stopped_at: swept.stopped_at, refusal: swept.refusal } : {}),
      do: swept.refusal !== undefined ? "the stopped step says what it wants — do that, then pull again" : "do what the guidance asks, then pull again",
      ...extra(),
    };
  }

  /** THE DOORS — idle's edges of the main machine, with statement, kind
   *  and weight. The switchboard's offer is the system's live vocabulary:
   *  the desk advises FROM it (via the survey), so a lane that lands or
   *  changes shows up without anybody editing a document. */
  doors(): Record<string, unknown>[] {
    const idle = this.machine.states.find((s) => s.id === "idle");
    if (idle === undefined) return [];
    return idle.edges.map((e) => {
      const t = this.machine.states.find((x) => x.id === e.to);
      return t === undefined
        ? { to: e.to }
        : { to: e.to, ...(t.statement !== "" ? { statement: t.statement } : {}), kind: t.kind, priority: t.priority };
    });
  }

  /** Where the walk is, machine-wise: ["main"] or ["main", "boot", …]. */
  breadcrumb(): string[] {
    return [this.machine.id, ...this.subs.map((s) => s.decl.id)];
  }

  /** The machine to DISPLAY: only ever one (owner ruling 2026-07-26). */
  currentMachine(): MachineDecl {
    return this.top()?.decl ?? this.machine;
  }

  /** Entering a GENERATED container's expedition states binds that
   *  expedition's worktree — the click IS the pick (owner design
   *  2026-07-27). The parent-return and escape paths unbind as ever. */
  private autoBind(): void {
    const top = this.top();
    const gen = top?.gen;
    if (top === undefined || gen === undefined) return;
    const leaf = activeStates(top.instance)[0];
    const boundId = leaf === undefined ? undefined : gen.expByState[leaf];
    if (boundId === undefined || this.bound?.id === boundId) return;
    // Only the WORK containers bind — archives browse read-only.
    if (top.decl.id === "iterations") this.iterationOpen(boundId);
    else if (top.decl.id === "expeditions") this.expeditionOpen(boundId);
  }

  /** The mirror's view of a GENERATED machine: the walk's own instance
   *  while standing in it, a fresh generation for browsing. */
  generatedView(id: string): { decl: MachineDecl; canvas: CanvasData } | undefined {
    for (const sub of this.subs) {
      if (sub.decl.id === id && sub.gen !== undefined) return { decl: sub.gen.decl, canvas: sub.gen.canvas };
    }
    const gen = this.genFor(id);
    return gen === undefined ? undefined : { decl: gen.decl, canvas: gen.canvas };
  }

  private genFor(id: string): GeneratedMachine | undefined {
    if (id === "expeditions") return generateContinueExpedition(this.root);
    if (id === "iterations") return generateIterations(this.root);
    if (id === "expedition_archive") return generateExpeditionArchive(this.root);
    if (id === "iteration_archive") return generateIterationArchive(this.root);
    return undefined;
  }

  /** The PARENT CHAIN of a viewable machine, main first — the mirror's
   *  breadcrumbs render it, so a nested decade reads
   *  main › expedition_archive › e1-e10 (owner ruling 2026-07-28). */
  viewChain(id: string): string[] {
    if (id === this.machine.id) return [this.machine.id];
    const idx = this.subs.findIndex((s) => s.decl.id === id);
    if (idx >= 0) return [this.machine.id, ...this.subs.slice(0, idx + 1).map((s) => s.decl.id)];
    if (this.machine.states.some((s) => s.submachine !== undefined && s.id === id)) return [this.machine.id, id];
    for (const sub of this.subs) {
      if (sub.gen?.subGen?.[id] !== undefined) return [...this.viewChain(sub.decl.id), id];
    }
    for (const cid of ["expedition_archive", "iteration_archive"]) {
      if (this.genFor(cid)?.subGen?.[id] !== undefined) return [this.machine.id, cid, id];
    }
    return [this.machine.id, id];
  }

  /** Resolve ANY machine id to a viewable drawing: the walked stack
   *  first, then the top-level containers, then their nested generated
   *  sub-machines (archive decades). */
  viewFor(id: string): { decl: MachineDecl; canvas: CanvasData } | undefined {
    const direct = this.generatedView(id);
    if (direct !== undefined) return direct;
    for (const sub of this.subs) {
      const nested = sub.gen?.subGen?.[id];
      if (nested !== undefined) {
        const g = nested();
        return { decl: g.decl, canvas: g.canvas };
      }
    }
    for (const cid of ["expedition_archive", "iteration_archive"]) {
      const nested = this.genFor(cid)?.subGen?.[id];
      if (nested !== undefined) {
        const g = nested();
        return { decl: g.decl, canvas: g.canvas };
      }
    }
    return undefined;
  }

  /** The LIVE run for a machine view (owner ruling 2026-07-27: re-entry
   *  resets the drawing) — done states and completion of the CURRENT run
   *  only. A machine not being walked shows gray; past passes live in the
   *  main record, not on the drawing. */
  viewRun(declId: string): { done: string[]; completed: boolean } {
    if (declId === this.machine.id) {
      return {
        done: this.instance.history.filter((h) => h.outcome === "filled" && !h.state.includes("/")).map((h) => h.state),
        completed: this.instance.status === "closed",
      };
    }
    for (const sub of this.subs) {
      if (sub.decl.id === declId) {
        return {
          done: sub.instance.history.filter((h) => h.outcome === "filled").map((h) => h.state),
          completed: sub.instance.status === "closed",
        };
      }
    }
    return { done: [], completed: false };
  }

  legal(): { all: boolean; tools: Set<string> } {
    const { machine, ids } = this.leaves();
    const tools = new Set<string>();
    let all = false;
    for (const id of ids) {
      const s = this.state(machine, id);
      // Mechanical states: the machinery's drivers are what is legal.
      if (s.kind === "start" || s.kind === "end") for (const t of MACHINERY) tools.add(t);
      // REPAIR MODE (owner ruling 2026-07-27): while the state's exit
      // script stands RED, its repair tools are legal — the remedy "fix
      // what the output names" must be dischargeable from inside.
      const ev = this.evidence.get(this.evidenceKey(machine, id));
      if ((ev?.script_result as { ok?: boolean } | undefined)?.ok === false) for (const t of s.repair_tools ?? []) tools.add(t);
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
    // EMERGENCY OPENS EVERY DOOR, including on a closed machine — a machine
    // that will not move is precisely when the repair is needed.
    if (this._emergency) return;
    if (this.instance.status === "closed") {
      throw new Rejection({
        clause: CLAUSES.NOT_LEGAL_IN_STATE,
        expected: "an open session machine",
        got: `${tool} after the machine closed`,
        remedy: { tool: "se_pull", args: {}, note: "the machine is done; a new session starts at the beginning" },
        source: "engine/session.ts gate",
      });
    }
    const { all, tools } = this.legal();
    if (tools.has(tool)) return;
    if (all && !RESTRICTED.has(tool)) return;
    const active = this.active().join(", ");
    const legalList = [...tools].join(", ") || "(none)";
    throw new Rejection({
      clause: CLAUSES.NOT_LEGAL_IN_STATE,
      expected: `a tool legal in state [${active}]: ${legalList}`,
      got: tool,
      remedy: { tool: "se_pull", args: {}, note: "pull first — the machine says what to do next, and the lane opens as the walk reaches the states that allow it" },
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
      // The pill greens from EITHER hand: the human's checks, a proof
      // recorded on a passing step, or a CURRENT credit from the reading —
      // in pull-world the reading is earned before any step is taken, and
      // a pill that stayed gray until the walk moved would show the agent
      // as unread while it was reading.
      return docs.every((p) => this.readProven("human", p, {}) || this.agentProven(p) || this.bufferedCurrent(p));
    }
    if (key === "read_consume") {
      return this.consumeDemand(s).every((p) => this.readProven("human", p, {}) || this.agentProven(p) || this.bufferedCurrent(p));
    }
    if (key === "evidence_form") {
      const names = (which === "leave" ? s.exit : s.entry)?.evidence_form ?? [];
      return this.formsMet(names);
    }
    if (key === "no_pending_note") {
      const markers = (which === "leave" ? s.exit : s.entry)?.no_pending_note ?? [];
      return this.blockingNotes(markers).length === 0;
    }
    const ev = this.evidence.get(this.evidenceKey(m, s.id));
    if (key === "script") return (ev?.script_result as { ok?: boolean } | undefined)?.ok === true;
    return false;
  }

  // ── EVIDENCE FORMS (owner design 2026-07-27) — A3-shaped one-pagers in
  //    the bound record; the condition is a MECHANICAL LINT over them.
  //    Both hands use the same machinery: the agent writes the instance
  //    through the lane, the human fills it through the mirror; done runs
  //    the same checks either way. ────────────────────────────────

  private loadFormTemplate(name: string): FormTemplate {
    const tplAbs = join(this.workRoot(), ...formTemplatePath(name).split("/"));
    if (!existsSync(tplAbs)) {
      throw new Rejection({
        clause: CLAUSES.CONDITION_UNMET,
        expected: `a form template at ${formTemplatePath(name)}`,
        got: "not found",
        remedy: { tool: "se_file_glob", args: { glob: "product/deliverable/machines/forms/*" }, note: "the templates that exist" },
        source: "engine/session.ts forms",
      });
    }
    return parseFormTemplate(name, readFileSync(tplAbs, "utf8"));
  }

  private formHome(name: string): { template: FormTemplate; instanceAbs: string; instanceRel: string; evidenceAbs: string; evidenceRel: string } {
    if (this.bound === undefined) {
      throw new Rejection({
        clause: CLAUSES.CONDITION_UNMET,
        expected: "a bound expedition — evidence forms live in its record",
        got: "no expedition bound",
        remedy: { tool: "se_pull", args: {}, note: "open the expedition first (continue_expedition binds the lane)" },
        source: "engine/session.ts forms",
      });
    }
    const template = this.loadFormTemplate(name);
    const recRel = ["product", "spec", "expeditions", this.bound.id];
    return {
      template,
      instanceAbs: join(this.workRoot(), ...recRel, template.instance),
      instanceRel: [...recRel, template.instance].join("/"),
      evidenceAbs: join(this.workRoot(), ...recRel, "evidence"),
      evidenceRel: [...recRel, "evidence"].join("/"),
    };
  }

  private formLint(name: string): FormLint & { instanceRel: string } {
    const h = this.formHome(name);
    const raw = existsSync(h.instanceAbs) ? readFileSync(h.instanceAbs, "utf8") : undefined;
    const lint = { ...lintForm(h.template, raw, h.evidenceAbs), instanceRel: h.instanceRel };
    // THE GRAPH IS EVIDENCE (owner ruling 2026-07-27): no point of this
    // work's decision graph may stand OPEN when the evidence claims done.
    // The RECORD's jsonl is the source — every live op lands there too,
    // so the check survives engine reloads. Attached, never copied.
    const open = this.openRecordPoints();
    if (open.length > 0) {
      lint.problems.push(`the decision graph holds ${open.length} open point(s) — resolve each (done | obsolete | revert | defer) before the evidence stands`);
      lint.met = false;
    }
    return lint;
  }

  /** Open points of the BOUND record's decision graph — the jsonl is the
   *  source, so the check survives engine reloads. Scoped to the work's
   *  own states. */
  private openRecordPoints(): { id: string; visit: string; brief: string }[] {
    const sid = shortId(this.bound!.id);
    const recorded = replayFile(join(this.bound!.path, "product", "spec", "expeditions", this.bound!.id, "decisions.jsonl"));
    return recorded.open.filter((n) => [sid, `${sid}-leave`].some((p) => n.visit === p || n.visit.startsWith(`${p}@`)));
  }

  /** Pending notes whose text carries one of the markers — what a
   *  no_pending_note condition holds against ("needs retro" gates
   *  start_iteration; the retro's drain clears them). */
  private blockingNotes(markers: string[]): { ref: string; text: string }[] {
    return pendingNotes(seDir(this.root))
      .filter((n) => markers.some((m) => n.text.toLowerCase().includes(m.toLowerCase())))
      .map((n) => ({ ref: n.ref, text: n.text }));
  }

  private formsMet(names: string[]): boolean {
    try {
      return names.every((n) => this.formLint(n).met);
    } catch {
      return false; // unbound or missing template — the tick's refusal names it
    }
  }

  formGet(name: string): Record<string, unknown> {
    if (this.bound === undefined) {
      // No expedition bound — the TEMPLATE is still viewable (owner ruling:
      // any form may be inspected at any time); filling needs a bound record.
      const template = this.loadFormTemplate(name);
      return {
        form: name,
        statement: template.statement,
        instance: template.instance,
        evidence_dir: "",
        exists: false,
        preview: true,
        ...lintForm(template, undefined, ""),
        status: "template",
        problems: [],
        met: false,
      };
    }
    const h = this.formHome(name);
    const raw = existsSync(h.instanceAbs) ? readFileSync(h.instanceAbs, "utf8") : undefined;
    return {
      form: name,
      statement: h.template.statement,
      instance: h.instanceRel,
      evidence_dir: h.evidenceRel,
      exists: raw !== undefined,
      // The LINTED truth — the same check the gate runs (graph included).
      ...this.formLint(name),
    };
  }

  formSave(name: string, fields: Record<string, string>): Record<string, unknown> {
    const h = this.formHome(name);
    let raw = existsSync(h.instanceAbs) ? readFileSync(h.instanceAbs, "utf8") : scaffoldInstance(h.template, `${this.bound!.id} — ${name}`);
    for (const [f, content] of Object.entries(fields)) raw = withFieldContent(raw, f, String(content));
    mkdirSync(dirname(h.instanceAbs), { recursive: true });
    writeFileSync(h.instanceAbs, raw, "utf8");
    this.notifyChange();
    return this.formGet(name);
  }

  formConfirm(name: string, field: string, index: number): Record<string, unknown> {
    const h = this.formHome(name);
    if (existsSync(h.instanceAbs)) {
      writeFileSync(h.instanceAbs, confirmPrefill(readFileSync(h.instanceAbs, "utf8"), field, index), "utf8");
      this.notifyChange();
    }
    return this.formGet(name);
  }

  formDone(name: string, by: Channel): Record<string, unknown> {
    const h = this.formHome(name);
    if (!existsSync(h.instanceAbs)) {
      throw new Rejection({
        clause: CLAUSES.CONDITION_UNMET,
        expected: `an instance at ${h.instanceRel}`,
        got: "no instance yet",
        remedy: { tool: "se_file_write", args: { path: h.instanceRel, content: "<the filled page>", base_hash: null }, note: "write the page (or save it from the mirror), then set it done" },
        source: "engine/session.ts forms",
      });
    }
    writeFileSync(h.instanceAbs, withStatus(readFileSync(h.instanceAbs, "utf8"), "done", by), "utf8");
    this.notifyChange();
    return this.formGet(name); // the lint result rides back — problems visible
  }

  formFolder(name: string): Record<string, unknown> {
    const h = this.formHome(name);
    mkdirSync(h.evidenceAbs, { recursive: true });
    const cmd = process.platform === "win32" ? "explorer" : process.platform === "darwin" ? "open" : "xdg-open";
    spawn(cmd, [h.evidenceAbs], { detached: true, stdio: "ignore" }).unref();
    return { opened: h.evidenceRel };
  }

  /** One script, ASYNC — spawnSync would freeze the whole server (and the
   *  mirror with it) for the run's duration; found when the suite's eight
   *  seconds read as a crashed browser window. */
  private spawnScript(abs: string): Promise<{ status: number | null; out: string }> {
    return new Promise((resolve) => {
      const child = spawn("node", [abs, "--root", this.root], { cwd: this.root });
      let out = "";
      let pending = "";
      // A SCRIPT REPORTS ITS OWN PROGRESS on stdout, as
      //   ##progress <done> <total> <label>
      // The lines drive the mirror's bar and never reach the evidence: the
      // reader wants the verdict, not the ticker. A script that says
      // nothing still works — the bar just falls back to indeterminate.
      const eat = (chunk: string): string => {
        pending += chunk;
        const lines = pending.split(/\r?\n/);
        pending = lines.pop() ?? "";
        const keep: string[] = [];
        for (const l of lines) {
          const m = /^##progress\s+(\d+)\s+(\d+)\s*(.*)$/.exec(l);
          if (m === null) { keep.push(l); continue; }
          this.setProgress(Number(m[1]), Number(m[2]), (m[3] ?? "").trim());
        }
        return keep.length === 0 ? "" : `${keep.join("\n")}\n`;
      };
      child.stdout.on("data", (d: Buffer) => { out += eat(String(d)); });
      child.stderr.on("data", (d: Buffer) => { out += d; });
      const timer = setTimeout(() => child.kill(), 120_000);
      child.on("error", (e) => { clearTimeout(timer); this.clearProgress(); resolve({ status: null, out: String(e) }); });
      child.on("close", (code) => { clearTimeout(timer); this.clearProgress(); resolve({ status: code, out: out + pending }); });
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
        remedy: { tool: "se_pull", args: {}, note: "the pull's answer carries the step's demands" },
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

  /** THE WAIT BAR MEASURES SOMETHING (owner ruling, 2026-07-30). A running
   *  script reports its own steps; indeterminate is the FALLBACK, for work
   *  that genuinely cannot count itself, never the default. */
  private progressAt: { done: number; total: number; label: string } | undefined;

  private setProgress(done: number, total: number, label: string): void {
    if (total <= 0) return;
    this.progressAt = { done, total, label };
    this.notifyChange();
  }

  private clearProgress(): void {
    if (this.progressAt === undefined) return;
    this.progressAt = undefined;
    this.notifyChange();
  }

  progress(): { done: number; total: number; label: string } | undefined {
    return this.progressAt;
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
      const shown = k === "read_consume" ? this.consumeDemand(s) : args;
      out[k] = { args: shown, met: this.conditionKeyMet(m, s, k, which), note: conditionNotePath(k) };
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
  /** Session-local read buffer: latest lane hash per path, auto-filled by
   *  se_file_read and re-used for later ticks unless stale. */
  private readonly readBuffer = new Map<string, string>();

  rememberRead(path: string, hash: string, ref?: string): void {
    if (ref !== undefined || path.trim() === "" || hash.trim() === "" || path.startsWith("@")) return;
    const lane = this.diskHash(path);
    if (lane !== "" && lane === hash) this.readBuffer.set(path, hash);
  }

  clearReadBuffer(): void {
    this.readBuffer.clear();
  }

  /** Whether the walk has passed through boot once already. */
  private bootEntered = false;

  /** The agent's proofs, ALL earned by reading: se_file_read and
   *  se_reading fill the buffer as they serve documents. Nothing is ever
   *  handed in — the hash-supplying lane retired with the tick, because a
   *  proof you can type is a proof you can fake. Stale entries are swept
   *  here, so an edited doc always asks to be read again. */
  private readProofs(channel: Channel): Record<string, string> {
    if (channel !== "agent") return {};
    const merged: Record<string, string> = {};
    for (const [p, h] of this.readBuffer.entries()) merged[p] = h;
    for (const [p, h] of Object.entries(merged)) {
      const lane = this.diskHash(p);
      if (lane !== "" && h === lane) {
        this.readBuffer.set(p, h);
      } else {
        delete merged[p];
        this.readBuffer.delete(p);
      }
    }
    return merged;
  }

  private agentProven(path: string): boolean {
    const hash = this.diskHash(path);
    return hash !== "" && (this.agentReads.get(path)?.has(hash) ?? false);
  }

  // THE PROOF HASHES THE DOC THE LANE SERVED (owner ruling 2026-07-28).
  //
  // It used to hash the PROJECT ROOT while se_file_read served the bound
  // worktree. Two consequences, and the second is the serious one:
  //
  //  - Editing a pulled guidance doc inside an expedition made every later
  //    tick refuse, because the hash you could honestly produce was never the
  //    hash the engine wanted. Guidance could not ride a branch, though it
  //    merges exactly like code.
  //  - Worse, when the two trees differed the gate PASSED on the root's hash
  //    for a document the lane never showed you. A proof you can satisfy with
  //    a document you were never given is not a proof. Seen live in e19: a
  //    whole expedition attested to a voice.md it had not read.
  //
  // Guidance is not special. It is branch content like any other file; only
  // the read-proof ever made it look otherwise.
  //
  // The two trees agree whenever trunk is clean — a worktree branches from the
  // last commit — and the close now commits the root's strays to keep it that
  // way. Where they genuinely differ, the doc HAS changed, and a stale check
  // being re-asked is the rule working: one check per version.
  private diskHash(rel: string): string {
    try {
      const abs = resolveInRoot(this.laneRoot(rel), rel, "engine/session.ts reads");
      return contentHash(readFileSync(abs));
    } catch {
      return "";
    }
  }

  /** The copy the MIRROR serves — always the project root, because that is
   *  where the human's checkboxes are made, bound expedition or not. */
  private rootDiskHash(rel: string): string {
    try {
      return contentHash(readFileSync(resolveInRoot(this.root, rel, "engine/session.ts reads")));
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
        remedy: { tool: "se_pull", args: {}, note: "the pulled list names the checkable documents" },
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
      .filter(([p, set]) => set.has(this.diskHash(p)) || set.has(this.rootDiskHash(p)))
      .map(([p]) => p)
      .sort();
  }

  /** One doc, one channel, one verdict.
   *
   *  EACH HAND PROVES THE COPY IT WAS SHOWN (owner ruling 2026-07-28).
   *  The agent reads through the LANE, which serves the bound worktree, so
   *  its supplied hash must match that copy exactly — a stale token proves a
   *  stale read, and a hash from a tree it was never shown proves nothing.
   *
   *  The human checks in the MIRROR, which serves the project root. Their
   *  checkbox counts against either copy. On Windows the two differ by line
   *  endings alone after a checkout (core.autocrlf), so demanding the lane's
   *  hash from a checkbox would void every check the moment an expedition
   *  binds — a false invalidation that teaches people to ignore the gate. */
  private readProven(channel: Channel, path: string, supplied: Record<string, string>): boolean {
    const lane = this.diskHash(path);
    if (channel === "agent") return lane !== "" && supplied[path] === lane;
    const set = this.humanChecks.get(path);
    if (set === undefined) return false;
    const root = this.rootDiskHash(path);
    return (lane !== "" && set.has(lane)) || (root !== "" && set.has(root));
  }

  /** Boot is exempt from the pull gate — it is where the first reads
   *  happen; gating entry on them would deadlock the session at start. */
  private pullGateExempt(m: MachineDecl, t: StateDecl): boolean {
    if (t.kind === "start" || t.kind === "end") return true;
    if (m.id === "boot") return true;
    if (t.submachine !== undefined && t.submachine.includes("boot")) return true;
    return false;
  }

  /** THE CONSUME LIST (condition read_consume) — documents the state reads
   *  and then DESTROYS. A listed path that is not there demands nothing, so
   *  a state may name a document that is only sometimes present; the
   *  session handover is exactly that.
   *
   *  This used to be a hardcoded boot rule. It is a declaration now, so the
   *  drawing says what happens rather than the engine knowing a state by
   *  name (owner ruling 2026-07-31). */
  private consumeDemand(s: StateDecl): string[] {
    return (s.exit?.read_consume ?? []).filter((rel) => existsSync(this.consumeAbs(rel)));
  }

  private consumeAbs(rel: string): string {
    return join(this.laneRoot(rel), rel);
  }

  private handoverPath(): string {
    return join(seDir(this.root), "HANDOVER.md");
  }

  /** Leaving the state destroys what it consumed. A briefing that cannot
   *  survive its own reading cannot go stale and cannot be believed twice. */
  private consumeDocs(s: StateDecl): void {
    for (const rel of this.consumeDemand(s)) unlinkSync(this.consumeAbs(rel));
  }

  /** The other half of the same law: the way OUT writes the next one.
   *  Demanded mechanically, because the duty was prose before and prose is
   *  what kept being skipped. Written BEFORE this session started is a
   *  leftover, not a handover, so the clock decides — not the file's
   *  existence. */
  private assertHandoverWritten(channel: Channel): void {
    const p = this.handoverPath();
    const writtenMs = existsSync(p) ? statSync(p).mtimeMs : -1;
    if (writtenMs >= Date.parse(this.startedTs)) return;
    throw new Rejection({
      clause: CLAUSES.CONDITION_UNMET,
      expected: "a handover written THIS session — ending the session writes .se/HANDOVER.md for the next one",
      got: writtenMs < 0 ? "no .se/HANDOVER.md" : "a .se/HANDOVER.md left over from before this session started",
      remedy: {
        tool: "se_file_write",
        args: { path: ".se/HANDOVER.md", base_hash: null, content: "# Handover — <date>\n\n<what the next session must know>\n" },
        note: "write what the NEXT session cannot get from the repo or the records. It is read once and destroyed at their boot, so nothing here can go stale — but nothing here survives either. Anything durable belongs in guidance, a note or a record.",
      },
      source: "engine/session.ts handover",
    });
  }

  /** ONE READING LIST (owner ruling 2026-07-31). A document a state NAMES
   *  and a document a tag BINDS to it are not two kinds of thing: both are
   *  read, both are proven by the same hash or the same checkbox, both are
   *  refused the same way. Only the PROVENANCE differs, and that rides in
   *  each document's `sources`.
   *
   *  What genuinely differs is WHEN, so that is the only axis left here. */
  private reading(m: MachineDecl, s: StateDecl, which: "enter" | "leave"): string[] {
    if (which === "leave") return [...(s.exit?.read ?? []), ...this.consumeDemand(s)];
    return this.entryRequirements(m, s);
  }

  /** The enter half: the state's own entry list plus everything bound to it —
   *  minus its exit list, which is the state's assignment, read INSIDE it
   *  rather than before it. */
  private entryRequirements(m: MachineDecl, t: StateDecl): string[] {
    const req = new Set<string>(t.entry?.read ?? []);
    if (!this.pullGateExempt(m, t)) {
      for (const d of pulledFor(this.root, scanGuidance(this.root), m, t)) req.add(d.path);
    }
    for (const p of t.exit?.read ?? []) req.delete(p);
    return [...req];
  }

  private bufferedCurrent(path: string): boolean {
    const lane = this.diskHash(path);
    return lane !== "" && this.readBuffer.get(path) === lane;
  }

  /** One neighbor state's entry requirements, minus docs already present in
   *  the current read buffer at their latest hash. */
  private unreadEntryRequirements(m: MachineDecl, t: StateDecl): string[] {
    return this.entryRequirements(m, t).filter((p) => !this.bufferedCurrent(p)).sort();
  }

  /** The docs worth pre-reading from HERE: every immediate neighbor state's
   *  unread entry requirements, deduplicated and sorted for stable packets. */
  private lookaheadRequirements(m: MachineDecl, from: StateDecl): string[] {
    const req = new Set<string>();
    for (const e of from.edges) {
      const t = m.states.find((s) => s.id === e.to);
      if (t === undefined) continue;
      for (const p of this.unreadEntryRequirements(m, t)) req.add(p);
    }
    return [...req].sort();
  }

  private refuseReads(which: "exit" | "entry", stateId: string, missing: string[], channel: Channel): never {
    throw new Rejection({
      clause: CLAUSES.CONDITION_UNMET,
      expected: `${which === "exit" ? "leaving" : "entering"} ${stateId} demands proven reading of: ${missing.join(", ")}`,
      got: channel === "agent" ? `not read at its current version: ${missing.join(", ")}` : `not checked in the mirror: ${missing.join(", ")}`,
      remedy:
        channel === "agent"
          ? { tool: "se_reading", args: {}, note: "call se_reading until it answers done — each document is credited as it is served — then pull. Reading through se_file_read credits too; there is nothing to hand in." }
          : { tool: "se_pull", args: {}, note: "check each listed document in the mirror — one check per version; an edited doc asks again" },
      source: "engine/session.ts reads",
    });
  }

  /** THE READ GATE, both directions: the current state's exit read list,
   *  and the target's entry requirements (explicit reads + the pull). */
  private assertReads(m: MachineDecl, from: StateDecl, targetIds: string[], channel: Channel, supplied: Record<string, string>): void {
    const exitReads = this.reading(m, from, "leave");
    const missingExit = exitReads.filter((p) => !this.readProven(channel, p, supplied));
    if (missingExit.length > 0) this.refuseReads("exit", from.id, missingExit, channel);
    for (const id of targetIds) {
      const t = m.states.find((s) => s.id === id);
      if (t === undefined) continue;
      const missing = this.reading(m, t, "enter").filter((p) => !this.readProven(channel, p, supplied));
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

  /** WHAT still blocks the human's entry into `t` — the locked button's
   *  tooltip names these instead of a bare "not met". */
  entryMissingHuman(m: MachineDecl, t: StateDecl): string[] {
    const out: string[] = [];
    for (const [k, st] of Object.entries(this.conditionStatus(m, t, "enter") ?? {})) {
      if (!st.met && k !== "read") out.push(`condition ${k}`);
    }
    for (const p of this.entryRequirements(m, t)) {
      if (!this.readProven("human", p, {})) out.push(`read ${p}`);
    }
    return out;
  }

  /** The mirror's tool click (the HTML-parity law: the human can run the
   *  machine alone). Same state gate the agent faces; a FIXED dispatch —
   *  never arbitrary execution. */
  humanTool(name: string, args: Record<string, unknown>): Record<string, unknown> {
    this.gate(name);
    switch (name) {
      case "se_seed_expedition":
        return this.expeditionNew(String(args.kind ?? ""), String(args.goal ?? ""));
      case "se_seed_iteration":
        return this.iterationSeed(
          String(args.goal ?? ""),
          String(args.vision ?? ""),
          Array.isArray(args.inputs) ? args.inputs.map(String) : String(args.inputs ?? "").split(",").map((s) => s.trim()).filter((s) => s !== ""),
        );
      case "se_exp_close":
        return this.expeditionClose(args.merge !== false && args.merge !== "false");
      case "se_note_drain":
        // THE CHANNEL RULE: this is the mirror, so it is the person's own
        // hand. Every disposition stands, wherever the walk happens to be.
        return drainNote(seDir(this.root), String(args.ref ?? ""), String(args.disposition ?? ""), args.where === undefined ? undefined : String(args.where), true);
      case "se_reload":
        return this.requestReload();
      default:
        throw new Rejection({
          clause: CLAUSES.NOT_LEGAL_IN_STATE,
          expected: "a human-callable tool: se_seed_expedition, se_seed_iteration, se_exp_close, se_note_drain, se_reload",
          got: name,
          remedy: { tool: "se_pull", args: {}, note: "the state's other tools are the agent's lane" },
          source: "engine/session.ts parity",
        });
    }
  }

  /** THE PULL — derived, never authored; see engine/pull.ts. Re-scanned
   *  every time (no cache): an edited doc must show its fresh hash, or a
   *  stale check could pass forever. `checked` is the human's ledger. */
  pulled(m: MachineDecl, s: StateDecl): (PulledDoc & { checked: boolean })[] {
    const out = pulledFor(this.root, scanGuidance(this.root), m, s).map((d) => {
      const hash = d.hash !== "" ? d.hash : this.diskHash(d.path);
      return { ...d, hash, checked: this.humanChecked(d.path, hash) };
    });
    // A CONSUMED document rides the reading room like the authored list —
    // it is demanded the same way and its checkbox lives here too.
    for (const rel of this.consumeDemand(s)) {
      const hash = this.diskHash(rel);
      out.push({ path: rel, sources: ["consume"], hash, checked: this.humanChecked(rel, hash) });
    }
    return out;
  }

  private assertStanding(stateId: string): void {
    const { ids } = this.leaves();
    if (ids.includes(stateId)) return;
    throw new Rejection({
      clause: CLAUSES.CONDITION_UNMET,
      expected: `to be standing in ${stateId} — conditions are worked only from inside the state`,
      got: `standing in [${this.active().join(", ")}]`,
      remedy: { tool: "se_pull", args: {}, note: "walk to the state first (or jump back to it), then work its conditions" },
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
        remedy: { tool: "se_pull", args: {}, note: "fix what the output names, then pull again — the script re-runs on every attempt" },
        source: "engine/session.ts conditions",
      });
    }
    if (key === "no_pending_note") {
      const blockers = this.blockingNotes(args);
      throw new Rejection({
        clause: CLAUSES.CONDITION_UNMET,
        expected: `${which} condition 'no_pending_note' of ${stateId} — no pending note carrying: ${args.join(", ")} (see ${note})`,
        got: blockers.map((b) => `${b.ref}: ${b.text.slice(0, 80)}`).join(" · ") || "unmet",
        remedy: { tool: "se_pull", args: {}, note: "run the RETRO first (idle → retro): its drain dispositions these notes, then this gate opens" },
        source: "engine/session.ts conditions",
      });
    }
    if (key === "evidence_form") {
      let got = "unmet";
      try {
        got = args
          .map((n) => {
            const l = this.formLint(n);
            return l.met ? `${n}: ok` : `${n} (${l.instanceRel}): ${l.problems.join("; ")}`;
          })
          .join(" · ");
      } catch (e) {
        got = e instanceof Rejection ? `${e.expected} — ${e.got}` : String(e);
      }
      throw new Rejection({
        clause: CLAUSES.CONDITION_UNMET,
        expected: `${which} condition 'evidence_form' of ${stateId} — the page(s) ${args.join(", ")} filled and done (see ${note})`,
        got,
        remedy: {
          tool: "se_file_read",
          args: { path: formTemplatePath(args[0] ?? "") },
          note: "fill every required section with VISIBLE content (comments are prefills — a human confirms each), list real files, then set status: done",
        },
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
      if (key === "read" || key === "read_consume") continue; // channel-proven below, not evidence
      if (!this.conditionKeyMet(m, from, key, "leave")) this.refuseCondition(m, from, "exit", key, args);
    }
    const targetId = to ?? (from.edges.length === 1 ? from.edges[0].to : undefined);
    this.assertReads(m, from, targetId === undefined ? [] : [targetId], channel, supplied);
    // Leaving through the main machine's end is where the next handover is
    // owed. Sub-machines have their own end and owe nothing.
    if (m.id === this.machine.id && targetId === "end") this.assertHandoverWritten(channel);
    if (targetId === undefined) return;
    const target = m.states.find((s) => s.id === targetId);
    if (target === undefined) return;
    for (const [key, args] of Object.entries(target.entry ?? {})) {
      if (key === "read" || key === "read_consume") continue;
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
        legal_tools: s.kind === "start" || s.kind === "end" || s.kind === "join" ? [...MACHINERY] : (s.legal_tools ?? []),
        ...(s.entry !== undefined ? { entry: this.conditionStatus(machine, s, "enter") } : {}),
        ...(s.exit !== undefined ? { exit: this.conditionStatus(machine, s, "leave") } : {}),
        exit_met: this.conditionMet(machine, s, "leave"),
        // WHAT THIS STEP WILL ASK FOR. Without it an agent walked a step
        // never having been told what evidence it wanted, and found out only
        // when a gate refused. Seventy of the hundred and twenty-two fields
        // reached nobody at all, because only gate rows were ever checked.
        //
        // A DERIVED FIELD IS NOT IN THE FORM. The engine computes those and
        // speaks only if they fail, so asking for one would be asking for an
        // answer that is not the agent's to give.
        ...(s.evidence_form.length > 0 ? { evidence_form: s.evidence_form.filter((f) => f.type !== "derived") } : {}),
        // The agent's packet names the pulled docs but NEVER their hashes —
        // the hash is the proof-of-read, obtainable only via se_file_read.
        pulled: this.pulled(machine, s).map((p) => ({ path: p.path, sources: p.sources })),
        // Pre-read map from where you stand: every immediate neighbor's
        // entry requirements, so the head can read once before moving.
        lookahead_read: this.lookaheadRequirements(machine, s),
        // Enough to CHOOSE among several ways forward: what the target is,
        // not just its name (the agent has no other way to peek).
        next: s.edges.map((e) => {
          const t = machine.states.find((st) => st.id === e.to);
          return {
            to: e.to,
            role: e.role,
            ...(e.guard !== undefined ? { guard: e.guard } : {}),
            ...(t !== undefined ? { kind: t.kind, ...(t.statement !== "" ? { statement: t.statement } : {}), priority: t.priority } : {}),
            ...(t?.entry !== undefined ? { entry: this.conditionStatus(machine, t, "enter") } : {}),
            ...(t !== undefined ? { entry_read: this.unreadEntryRequirements(machine, t) } : {}),
            enter_met: t === undefined ? true : this.conditionMet(machine, t, "enter"),
          };
        }),
      };
    });
    this.clearTargetIfArrived();
    const { all, tools } = this.legal();
    // AFTER the arrival check, never before: reaching the target clears it,
    // and a list for a way already walked is worse than none.
    const routeReads = this.routeReads();
    const reading = this.readingList();
    return {
      machine: this.machine.id,
      breadcrumb: this.breadcrumb(),
      active: this.active(),
      ...(this.bound !== undefined ? { expedition: this.bound.id } : {}),
      status: this.instance.status,
      autonomy: this._autonomy,
      // Only when ON. Nothing about the resting packet hints that it exists.
      ...(this._emergency ? { emergency: true } : {}),
      power: this.power,
      narration: { minutes: this._narrationMinutes, calls: this._narrationCalls },
      // WHERE THIS IS HEADED. Carried on every packet so neither hand has
      // to ask, and so a walk that drifts off the way is visibly off it.
      target: this._target,
      // EVERY DOCUMENT THE WAY AHEAD DEMANDS, gathered once and handed over
      // unasked. The target is known, so the reading it takes to reach it is
      // known with it; revealing that one state at a time costs a round trip
      // per wave for nothing.
      ...(routeReads.length > 0 ? { route_reads: routeReads } : {}),
      // AND GATHERED INTO ONE DOCUMENT, so the whole way costs ONE read.
      // Naming the paths was never the expensive part; asking for them was.
      ...(reading.length > 0
        ? {
            reading: {
              tool: "se_reading",
              path: Session.READING_PATH,
              documents: reading.length,
              note: "call se_reading. It hands you the text and credits it; call it again until it answers done. No paths to name, no hashes to carry.",
            },
          }
        : {}),
      // The session's reading list: what the human checked while driving.
      // Your advances must prove the same docs (paths only — the hashes
      // are earned by reading).
      human_checked: this.humanCheckedPaths(),
      legal_tools: all ? "all" : [...ALWAYS_LEGAL, ...tools],
      states,
    };
  }

  /** THE ENGINE'S OWN STEP — complete the current state and move on.
   *  `to` picks the outgoing edge (needed only when there are several);
   *  `channel` is whose hand this is — the threshold gates only the agent's.
   *  The agent's read proofs come from the reading it pulled (se_reading
   *  and se_file_read fill the buffer); the human proves via checkboxes.
   *  Reached through the pull and the mirror — never a tool of its own. */
  async tickAdvance(to?: string, channel: Channel = "human"): Promise<Record<string, unknown>> {
    const now = new Date().toISOString();
    const supplied = this.readProofs(channel);
    if (this.instance.status === "closed") {
      throw new Rejection({
        clause: CLAUSES.NOT_LEGAL_IN_STATE,
        expected: "an open machine",
        got: "a tick after end",
        remedy: { tool: "se_pull", args: {}, note: "the machine is done; a new session starts at the beginning" },
        source: "engine/session.ts tick",
      });
    }
    // Self-heal: a sub refused at entry (broken canvas) stands unseeded on
    // its parent node — retry the seed first. A healed entry IS this tick's
    // one visible step.
    const depthBefore = this.subs.length;
    this.seedSubs();
    if (this.subs.length > depthBefore) {
      this.notifyChange();
      return this.tickInfo();
    }
    // ONE VISIBLE STEP PER TICK (owner ruling 2026-07-26): you are only
    // ever in one state, and a tick moves exactly one position — including
    // the mechanical start/end positions of a sub-machine.
    if (this.inSub()) {
      const top = this.top()!;
      if (top.instance.status !== "open") {
        // Standing on the sub's end: this tick returns to the parent —
        // whatever the parent's edges enter is what the threshold weighs
        // and what the read gate demands proven.
        const { machine: pm, instance: pi } = this.parentOfTop();
        const parent = this.state(pm, top.parentState);
        this.gatePriority(pm, parent.edges.map((e) => e.to), channel);
        this.assertReads(pm, parent, parent.edges.map((e) => e.to), channel, supplied);
        this.completeGuarded(pm, pi, top.parentState, "filled", now);
        this.subs.pop();
        if (pi !== this.instance) pi.history.push({ state: top.parentState, outcome: "filled", at: now });
        const prefix = this.subs.map((s) => s.decl.id).join("/");
        this.instance.history.push({ state: prefix === "" ? top.parentState : `${prefix}/${top.parentState}`, outcome: "filled", at: now });
        if (!this.inSub()) this.unbind(); // leaving the outermost sub leaves the context (worktree stays)
        this.seedSubs();
        return this.landing();
      }
      const cur = activeStates(top.instance)[0];
      this.assertEdge(top.decl, cur, to);
      const subTarget = to ?? this.state(top.decl, cur).edges[0]?.to;
      if (subTarget !== undefined) this.gatePriority(top.decl, [subTarget], channel);
      await this.assertConditions(top.decl, this.state(top.decl, cur), to, channel, supplied);
      if (top.decl.id === "iterations" && (this.state(top.decl, cur).tags?.includes("iteration-kickoff") ?? false)) {
        this.pinKickoff(top.gen?.expByState[cur]);
      }
      // NO GATE PASSES WITHOUT A REVIEW REPORT (owner ruling 2026-07-30):
      // inside a pinned walk, leaving a gate demands its milestone review
      // report — complete and PASSED. The report is the durable bless: a
      // re-walk finds it standing and passes quickly.
      if (this.bound !== undefined && top.decl.id.endsWith("-walk") && this.state(top.decl, cur).kind === "gate") {
        this.assertGateReport(cur, this.state(top.decl, cur), channel);
      }
      this.completeGuarded(top.decl, top.instance, cur, "filled", now, to);
      // Leaving the state is what destroys what it consumed.
      this.consumeDocs(this.state(top.decl, cur));
      top.instance.history.push({ state: cur, outcome: "filled", at: now });
      const prefix = this.subs.map((s) => s.decl.id).join("/");
      this.instance.history.push({ state: `${prefix}/${cur}`, outcome: "filled", at: now });
      this.seedSubs(); // a sub state may itself host a sub-machine — nesting is arbitrary
      this.autoBind();
      this.notifyChange();
      return this.tickInfo();
    }
    const cur = activeStates(this.instance)[0];
    this.assertEdge(this.machine, cur, to);
    const target = to ?? this.state(this.machine, cur).edges[0]?.to;
    // BOOT IS THE READING ROOM, so RE-ENTERING it earns its tokens again: a
    // walk sent back to start proves its reading afresh. The FIRST entry
    // keeps the buffer. The only reads it can hold were made moments ago at
    // start, which is exactly where the packet hands over the reading and
    // asks for them — wiping those made the one-document reading pointless.
    if (this.machine.id === "main" && cur === this.machine.initial && target === "boot") {
      if (this.bootEntered) this.clearReadBuffer();
      this.bootEntered = true;
    }
    if (target !== undefined) this.gatePriority(this.machine, [target], channel);
    await this.assertConditions(this.machine, this.state(this.machine, cur), to, channel, supplied);
    this.completeGuarded(this.machine, this.instance, cur, "filled", now, to);
    this.consumeDocs(this.state(this.machine, cur));
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
        remedy: { tool: "se_pull", args: {}, note: "the pull's answer says where you stand and what to do" },
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
      legal_tools: s.kind === "start" || s.kind === "end" || s.kind === "join" ? [...MACHINERY] : (s.legal_tools ?? []),
      ...(s.entry !== undefined ? { entry: this.conditionStatus(home, s, "enter") } : {}),
      ...(s.exit !== undefined ? { exit: this.conditionStatus(home, s, "leave") } : {}),
      exit_met: this.conditionMet(home, s, "leave"),
      ...(s.evidence_form.length > 0 ? { evidence_form: s.evidence_form.filter((f) => f.type !== "derived") } : {}),
      pulled: this.pulled(home, s).map((p) => ({ path: p.path, sources: p.sources })),
      lookahead_read: this.lookaheadRequirements(home, s),
      ...(s.submachine !== undefined ? { submachine: s.submachine } : {}),
      next: s.edges.map((e) => {
        const t = home.states.find((st) => st.id === e.to);
        return {
          to: e.to,
          role: e.role,
          ...(e.guard !== undefined ? { guard: e.guard } : {}),
          ...(t !== undefined ? { kind: t.kind, statement: t.statement, priority: t.priority } : {}),
          ...(t !== undefined ? { entry_read: this.unreadEntryRequirements(home, t) } : {}),
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
  jumpBack(target: string, channel: Channel = "human"): Record<string, unknown> {
    const now = new Date().toISOString();
    const supplied = this.readProofs(channel);
    if (this.instance.status === "closed") {
      throw new Rejection({
        clause: CLAUSES.NOT_LEGAL_IN_STATE,
        expected: "an open machine",
        got: `a jump back after end`,
        remedy: { tool: "se_pull", args: {}, note: "the machine is done; a new session starts at the beginning" },
        source: "engine/session.ts jump",
      });
    }
    const { machine, ids } = this.leaves();
    const inst = this.top()?.instance ?? this.instance;
    if (ids.includes(target)) {
      throw new Rejection({
        clause: CLAUSES.NOT_LEGAL_IN_STATE,
        expected: "an EARLIER state",
        got: `${target} is where you are standing`,
        remedy: { tool: "se_pull", args: {}, note: "the pull's answer says where you stand" },
        source: "engine/session.ts jump",
      });
    }
    const wasFilled = inst.history.some((h) => h.outcome === "filled" && h.state === target);
    if (!wasFilled) {
      throw new Rejection({
        clause: CLAUSES.NOT_LEGAL_IN_STATE,
        expected: `a state already walked in ${machine.id}`,
        got: target,
        remedy: { tool: "se_pull", args: {}, note: "only a filled state can be returned to" },
        source: "engine/session.ts jump",
      });
    }
    this.gatePriority(machine, [target], channel);
    const back = this.state(machine, target);
    const missing = this.entryRequirements(machine, back).filter((p) => !this.readProven(channel, p, supplied));
    if (missing.length > 0) this.refuseReads("entry", target, missing, channel);
    this.assertHandover(channel, supplied);
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
      this.subs = [];
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
      // Shutdown control at END: the keep-awake dies with the session; at
      // level 5 the machine powers off one minute later.
      // REACHING END IS NOT IDLE. Powering off here would fire the moment a
      // walk completed, with the person still at the keyboard. The idle timer
      // owns that decision and it measures silence, not completion.
      this.keepAwake?.kill();
      this.keepAwake = undefined;
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
        banner: "🦆 SE v3 booted. Main machine is live. All work runs through the se lane; every call is logged. se_pull says what to do next.",
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
        remedy: { tool: "se_pull", args: {}, note: "the pull offers the doors with their statements — answer with choice" },
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

  /** Enter any newly-active sub-machine state AT THE CURRENT LEAF LEVEL —
   *  the position becomes the new sub's mechanical start; nothing inside
   *  is walked yet. Machines nest to any depth: each level pushes. */
  private seedSubs(): void {
    const { machine, ids } = this.leaves();
    const subState = ids.map((s) => this.state(machine, s)).find((s) => s.submachine !== undefined);
    if (subState === undefined) return;
    // The containers are GENERATED from the records — their drawn canvases
    // are stubs (owner design 2026-07-27). A generated machine's own sub
    // states (archive decades) come from its parent's subGen.
    const gen = this.top()?.gen?.subGen?.[subState.id]?.() ?? this.genFor(subState.id);
    let decl: MachineDecl;
    if (gen !== undefined) {
      decl = gen.decl;
    } else {
      try {
        decl = compileMachineCached(this.root, resolveRef(this.root, mainMachinePath(this.root), subState.submachine!));
      } catch (e) {
        // A broken drawing refuses TYPED and the engine survives; the next
        // tick retries the seed once the canvas is fixed.
        throw new Rejection({
          clause: CLAUSES.CANVAS_BROKEN,
          expected: `${subState.id}'s canvas compiles`,
          got: String((e as Error).message),
          remedy: { tool: "se_pull", args: {}, note: "fix the drawing in Obsidian, then pull again — entering retries; back or escape also work" },
          source: "engine/session.ts seed",
        });
      }
    }
    // RE-ENTRY RESETS (owner ruling 2026-07-27): a machine left through its
    // end starts over — evidence from the previous pass is cleared; the old
    // walk stays in the main record, the new walk earns its own.
    for (const key of [...this.evidence.keys()]) {
      if (key.startsWith(`${decl.id}/`)) this.evidence.delete(key);
    }
    this.subs.push({ decl, instance: newInstance(decl), parentState: subState.id, ...(gen !== undefined ? { gen } : {}) });
  }

  // ── The agent's hands on the tick ───────────────────────────────────────

  describe(): Record<string, unknown> {
    const { all, tools } = this.legal();
    return {
      machine: this.machine.id,
      breadcrumb: this.breadcrumb(),
      active: this.active(),
      ...(this.inSub() ? { submachine: { id: this.top()!.decl.id, active: activeStates(this.top()!.instance) } } : {}),
      status: this.instance.status,
      autonomy: this._autonomy,
      ...(this._emergency ? { emergency: true } : {}),
      power: this.power,
      narration: { minutes: this._narrationMinutes, calls: this._narrationCalls },
      legal_tools: this._emergency ? "all" : all ? "all" : [...ALWAYS_LEGAL, ...tools],
      history: this.instance.history.slice(-10),
    };
  }
}
