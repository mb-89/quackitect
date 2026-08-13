// The session — every server process runs one instance of the MAIN machine
// (project/deliverable/machines/main.canvas). start and end are MECHANICAL
// states every machine has: the machinery auto-advances out of start, and a
// machine is done when end activates.
//
// THE STATE GATE lives here too: what is legal now is the active states'
// `legal_tools` (legal STATES are the machine's edges — the gate is only
// about tools), enforced at dispatch.
//
// State is in-memory: a server restart mid-session drops back to start, and
// the next refused call's remedy re-boots the agent in one turn.
import { existsSync, mkdirSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { claimEntry, machineId } from "./claims.ts";
import { CLAUSES, Rejection } from "./errors.ts";
import { dirtyLines, git, gitLand, gitSync } from "./gitlane.ts";
import { contentHash } from "./hash.ts";
import {
  activeStates,
  branchToReturnTo,
  claimFeeders,
  completeState,
  downstreamCone,
  INPUT_ROLES,
  type MachineDecl,
  type MachineInstance,
  reopenStates,
  type StateDecl,
} from "./machine.ts";
import { bumpDrawingEpoch, compileMachine, compileMachineCached, resolveRef } from "./machines/compile.ts";
import { chartPlan } from "./morphbox.ts";
import { computeRoute, type RouteNode, type RouteResult, type RouteStep, routeWraps } from "./route.ts";

/** THE STATE A RECORDED VISIT NAMES. A visit is stored qualified and
 *  occurrence-stamped ("expeditions/e30@0"), and the graph-is-evidence check
 *  compared it against the bare state name. It matched nothing, so the check
 *  passed vacuously: every expedition closed so far went unlooked-at, one of
 *  them with nineteen open points standing (measured 2026-08-02).
 *
 *  A flag computed and never compared is this codebase's recurring defect,
 *  and it hides because a check that SEES nothing reports exactly like a
 *  check that FINDS nothing. */
export function visitState(visit: string): string {
  return visit.split("@")[0].split("/").pop() ?? "";
}

import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { mintScenarioLines } from "./atamwalk.ts";
import { CallLog } from "./calllog.ts";
import type { CanvasData } from "./canvas.ts";
import { conditionNotePath } from "./conditions.ts";
import { Decisions, replayFile } from "./decisions.ts";
import { type GeneratedMachine, generateContinueExpedition, generateExpeditionArchive, shortId } from "./expmachine.ts";
import { setMethodMirror } from "./files.ts";
import {
  confirmPrefill,
  type FormLint,
  type FormTemplate,
  formTemplatePath,
  lintForm,
  parseFormTemplate,
  reopenedAfterSigning,
  scaffoldInstance,
  stripComments,
  stripSignedOff,
  withAmended,
  withAuthor,
  withBless,
  withBy,
  withChecked,
  withFieldContent,
  withFrontmatter,
  withFrontmatterList,
  withReopened,
  withSignedOff,
  withStatus,
} from "./forms.ts";
import { appendNote, drainNote, pendingNotes } from "./inbox.ts";
import {
  generateIterationArchive,
  generateIterations,
  type Iteration,
  iterationDrift,
  itFind,
  itList,
  itPinRel,
  itRecordRel,
  itSeed,
  itShortId,
  markStarted,
  pinIsStale,
  pinIteration,
  pinnedCanvas,
  readItRecord,
  repinColumn,
} from "./iterations.ts";
import { parseStateNote, readNode, section, withPass, writeNode } from "./notes.ts";
import { fansOut, methodFilesIn, pathKind, recordOwnerOf, resolveInRoot, seDir } from "./paths.ts";
import { mintFlipLines } from "./pugh.ts";
import { type PulledDoc, pulledFor, scanGuidance } from "./pull.ts";
import { CHANGE_COLUMNS } from "./rigor-matrix.ts";
import { anyJobRunning } from "./run.ts";
import { levelName, loadLevels, tierOf } from "./scale.ts";
import {
  buildPortableForm,
  chosenOption,
  claimProblems,
  type EmbeddedDoc,
  elementMatrixArgs,
  nodeField,
  nodeList,
  parseIsland,
  stateFormFields,
  stateFormModel,
  tableRow,
  templateProblems,
} from "./stateform.ts";
import { NARRATION_DEFAULT_CALLS, NARRATION_DEFAULT_MINUTES } from "./toll.ts";
import { corpusVersion, loadTrace, noteOf, traceDir } from "./trace.ts";
import { type Expedition, expClose, expFind, expList, expNew, itCloseShipped, readRecord } from "./worktree.ts";

/** THE PULL is the machinery — one verb, legal in EVERY state: the agent
 *  says pull and the machine says what to do. se_note is legal everywhere
 *  too: a stray is captured where it strikes, never chased (contract rule
 *  4). se_note_drain joins them by the same logic: an inbox you may only add
 *  to is not an inbox.
 *
 *  se_aim joins them because AIMING IS NOT WORK (owner ruling 2026-08-07).
 *  The engine is born aimed at front_desk by a field initializer, and the
 *  mirror has had a setter since 2026-08-04 — so the capability existed and
 *  simply was not reachable from the lane. An agent that cannot aim can only
 *  take the next offered door, which means it wanders one hop at a time and
 *  no route is ever drawn. That is not a walk; it is guessing with extra
 *  steps. */
/*  se_reopen and se_amend join them because A CLAIM IS FIXED FROM OUTSIDE IT
 *  (owner ruling 2026-08-07). Both act on a state you are not standing in —
 *  that is the whole point, since standing in it means it is already owed and
 *  neither op is needed. Gating them by the current state's legal_tools would
 *  make them reachable only from the one place they are useless.
 *
 *  Their safety is not the gate's. reopenClaim and amendClaim each refuse an
 *  unsubmitted form, and an amend that breaks a check is refused with the file
 *  put back. */
const ALWAYS_LEGAL: ReadonlySet<string> = new Set(["se_pull", "se_note", "se_panel", "se_note_drain", "se_aim", "se_reopen", "se_amend"]);
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
const MACHINERY: readonly string[] = ["se_pull", "se_file_read"];

/** ONE OPERATION'S COLLECTED INPUT, handed down instead of re-fetched.
 *
 *  The corpus and its version are per trace root, because one walk can touch
 *  trunk and a record. `done` is the green answer per machine, so a container
 *  asked about twice in one route is computed once. */
export interface GreenPass {
  corpus?: Map<string, ReturnType<typeof loadTrace>>;
  version?: Map<string, string>;
  done: Map<string, string[]>;
}

export function mainMachinePath(root: string): string {
  return join(root, "project", "deliverable", "machines", "main.canvas");
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
    // THE WRITE LANE LEARNS ABOUT TREES HERE, and only here. files.ts must not
    // know what a worktree is, so the session hands it the mirror instead.
    setMethodMirror(root, (rel, from) => {
      this.fanOutMethod(rel, from);
    });
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
    this.restoreSettings();
    this.syncKeepAwake();
    this.armIdleTimer();
  }

  /** THE LAST ENGINE'S SETTINGS, restored only under the same session stamp.
   *  Its own phase, and its own function: the constructor crossed the
   *  complexity ceiling when the reading credit joined it. */
  private restoreSettings(): void {
    try {
      const s = JSON.parse(readFileSync(join(seDir(this.root), "settings.json"), "utf8")) as {
        autonomy?: number;
        emergency?: boolean;
        block_sleep?: boolean;
        shutdown_at_idle?: boolean;
        narration_minutes?: number;
        narration_calls?: number;
        reads?: Record<string, string>;
        reads_pid?: number;
        session?: string;
      };
      const mine = process.env.SE_SESSION;
      if (mine !== undefined && mine !== "" && s.session === mine) {
        if (typeof s.autonomy === "number" && s.autonomy >= 0 && s.autonomy <= 1) this._autonomy = s.autonomy;
        // Emergency rides its rung: restored only beside a top-rung autonomy.
        if (s.emergency === true && this._autonomy >= 1) this._emergency = true;
        if (typeof s.block_sleep === "boolean") this._blockSleep = s.block_sleep;
        if (typeof s.shutdown_at_idle === "boolean") this._shutdownAtIdle = s.shutdown_at_idle;
        if (typeof s.narration_minutes === "number" && Number.isInteger(s.narration_minutes) && s.narration_minutes >= 0)
          this._narrationMinutes = s.narration_minutes;
        if (typeof s.narration_calls === "number" && Number.isInteger(s.narration_calls) && s.narration_calls >= 0)
          this._narrationCalls = s.narration_calls;
        this.restoreReadCredit(s.reads, s.reads_pid);
      }
    } catch {
      /* no store yet — the defaults stand */
    }
  }

  /** THE READING CREDIT SURVIVES AN ENGINE RELOAD (owner ruling 2026-08-13).
   *  The agent read the words. Replacing the process did not unread them.
   *
   *  TWO CONDITIONS, AND THE SECOND IS THE ONE THAT WAS MISSING. The session
   *  stamp says this is the same session, so a compaction still re-owes the
   *  whole reading. The PROCESS ID says the engine actually restarted —
   *  without it a second Session built inside one process would inherit a
   *  credit it never earned, which is what reads.test.ts exists to forbid.
   *
   *  Freshness is decided nowhere near here. Every entry is re-checked against
   *  disk wherever it is used, so a document whose words moved is owed again
   *  by construction rather than by a second mechanism that could disagree. */
  private restoreReadCredit(reads: Record<string, string> | undefined, pid: number | undefined): void {
    if (pid === undefined || pid === process.pid) return;
    for (const [p, h] of Object.entries(reads ?? {})) {
      if (typeof h === "string" && h !== "") this.readBuffer.set(p, h);
    }
  }

  private persistSettings(): void {
    try {
      mkdirSync(seDir(this.root), { recursive: true });
      writeFileSync(
        join(seDir(this.root), "settings.json"),
        `${JSON.stringify({
          session: process.env.SE_SESSION ?? null,
          autonomy: this._autonomy,
          emergency: this._emergency,
          block_sleep: this._blockSleep,
          shutdown_at_idle: this._shutdownAtIdle,
          narration_minutes: this._narrationMinutes,
          narration_calls: this._narrationCalls,
          reads: Object.fromEntries(this.readBuffer),
          reads_pid: process.pid,
        })}\n`,
        "utf8",
      );
    } catch {
      /* a failed save never blocks the slider */
    }
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
        remedy: {
          tool: "se_file_read",
          args: { path: "project/deliverable/machines/panels/controls.md" },
          note: "the shutdown row names both",
        },
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
    const active = this.describe().active as string[];
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
    spawn("shutdown.exe", ["/s", "/t", "60", "/c", "se: idle for five minutes"], {
      stdio: "ignore",
      windowsHide: true,
      detached: true,
    }).unref();
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
        expected:
          "a surface to ping: a card id (its slugged title from project/deliverable/views/cards.md), the widget a card shows, a drawn state id, or an element id",
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
      const src =
        "Add-Type -TypeDefinition 'using System.Runtime.InteropServices; public class KA { [DllImport(\"kernel32.dll\")] public static extern uint SetThreadExecutionState(uint f); }'; while ($true) { [KA]::SetThreadExecutionState(2147483651) | Out-Null; Start-Sleep -Seconds 30 }";
      this.keepAwake = spawn("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", src], { stdio: "ignore", windowsHide: true });
      // The keepawake must never hold its OWNER open: an un-unref'd child
      // handle kept a test worker's event loop alive forever, wedged the
      // whole battery at its cap four times in one day, and took three
      // instrumented kills to name.
      this.keepAwake.unref();
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
   * IT PERSISTS WITH ITS RUNG (owner ruling 2026-08-04, reversing the
   * earlier no-persist law): engine reloads are routine mid-session, and
   * each one silently revoked the very delegation the fixes were granted
   * under. It restores only beside a persisted TOP-RUNG autonomy, and
   * lowering the dial still revokes it — in this life and the next.
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
    this.persistSettings();
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
          remedy: {
            tool: "se_pull",
            args: {},
            note: "STOP and tell the human PLAINLY: this step waits for their hand (they advance it in the mirror, or raise the dial), and the dial alone cannot wake you — they must SEND YOU A MESSAGE (e.g. 'continue') after changing it. Then end your turn. A later pull re-weighs the step.",
          },
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
   *  walk reboots — by design; boot re-proves the new engine green.
   *
   *  EMERGENCY RELOADS FROM ANY STAND (owner ruling 2026-08-04). Emergency
   *  is repair, and repair is exactly when the walk cannot afford to go
   *  home first: reaching idle costs an escape, and the escape costs the
   *  target. */
  requestReload(): Record<string, unknown> {
    const leaf = this.active()[0] ?? "";
    if (leaf !== "idle" && !this._emergency) {
      throw new Rejection({
        clause: CLAUSES.NOT_LEGAL_IN_STATE,
        expected: "the walk at idle — a reload reboots it, nothing mid-flight may be lost",
        got: `standing in ${leaf || "(nowhere)"}`,
        remedy: {
          tool: "se_pull",
          args: {},
          note: "reach idle first — answer the offered doors with idle, or ask the person to aim the mirror — then se_reload",
        },
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
        remedy: {
          tool: "se_file_read",
          args: { path: "project/deliverable/engine/tools.ts" },
          note: "fix the named error, then se_reload again",
        },
        source: "engine/session.ts reload",
      });
    }
    const reconciled = { ...this.reconcileTrees(), method: this.backfillMethod() };
    if (process.env.SE_RELOAD_DRY === "1") return { reload: "dry", note: "canary green — no exit (SE_RELOAD_DRY)", ...reconciled };
    setTimeout(() => process.exit(42), 400);
    return {
      reload: "armed",
      note: "the engine restarts in under a second on the NEW sources — the walk reboots at start; tick when the lane answers",
      ...reconciled,
    };
  }

  /** RELOAD RECONCILES THE TWO TREES (owner ruling 2026-08-06).
   *
   *  A bound record has its own worktree, and the engine serves ONE tree.
   *  Which one depends on whether a walk is bound at that instant, and the
   *  walk moves. So an edit could land in the tree the person was not
   *  looking at, and it read on screen as a broken feature rather than a
   *  missing merge — four times in one morning.
   *
   *  The tell was always the same: NEW DATA drawn by OLD CODE. Markdown is
   *  read live from whichever tree is served, so a template's raw {token}
   *  would appear beside a description that had already updated.
   *
   *  Reload is the right seam because it is already the verb for "make what
   *  I wrote take effect". It commits what is on disk, lands the branch on
   *  trunk, and syncs trunk back — so whichever tree the engine comes up
   *  on, it carries the change. Nothing here can lose work: a commit is
   *  made before anything moves, and a conflicting merge aborts and says so.
   *
   *  Unbound, there is one tree and nothing to do. */
  private reconcileTrees(): Record<string, unknown> {
    const wt = this.bound?.path;
    if (wt === undefined || wt === this.root) return {};
    try {
      for (const tree of [wt, this.root]) {
        if (dirtyLines(git(tree, "status", "--porcelain").stdout).length === 0) continue;
        git(tree, "add", "-A");
        git(tree, "commit", "-m", "the machine commits what stood on disk at a reload");
      }
      const landed = gitLand(this.root, wt);
      const synced = gitSync(this.root, wt);
      return { trees: { landed: landed.commits ?? [], synced: synced.commits ?? [] } };
    } catch (e) {
      // A RECONCILE THAT FAILS NEVER BLOCKS THE RELOAD. The reload is still
      // correct for the tree it comes up on; the person is told what stayed
      // behind so they can see why a surface looks unchanged.
      return { trees: { failed: e instanceof Error ? e.message : String(e) } };
    }
  }

  /** THE BACKFILL: every METHOD file, trunk to every open worktree, at reload.
   *
   *  The write-time fan-out only catches files that are written. This catches
   *  the rest, so a tree cannot sit half-updated — which is how a worktree
   *  came to hold a new session.ts against an old paths.ts and stopped
   *  compiling.
   *
   *  TRUNK IS THE SOURCE AND NEVER THE DESTINATION. A stale worktree must not
   *  be able to push its old copy back. That direction is not a detail: an
   *  edit made while a record was bound once fanned a stale tools.ts over
   *  trunk and ate two lane verbs.
   *
   *  UNCHANGED FILES ARE NOT REWRITTEN, so this costs a read per file and
   *  nothing else on a tree that is already level. */
  private backfillMethod(): { trees: number; files: number } {
    const trees = this.methodTrees().filter((t) => t !== this.root);
    if (trees.length === 0) return { trees: 0, files: 0 };
    let files = 0;
    for (const rel of methodFilesIn(this.root)) {
      let bytes: string;
      try {
        bytes = readFileSync(join(this.root, rel), "utf8");
      } catch {
        continue;
      }
      for (const tree of trees) {
        const dst = join(tree, rel);
        try {
          if (existsSync(dst) && readFileSync(dst, "utf8") === bytes) continue;
          mkdirSync(dirname(dst), { recursive: true });
          writeFileSync(dst, bytes, "utf8");
          files++;
        } catch {
          // one unreachable tree must never stop the others
        }
      }
    }
    return { trees: trees.length, files };
  }

  /** Where the LANE works: the bound expedition's worktree, else the root. */
  workRoot(): string {
    return this.bound?.path ?? this.root;
  }

  /** THE CORPORA A READER MAY CHOOSE BETWEEN (owner ruling 2026-08-06).
   *
   *  Trunk is what has landed. An OPEN record's worktree is a full checkout,
   *  so it carries trunk's nodes AND everything that record has authored.
   *
   *  A whole-corpus view belongs to no single record, so the person picks
   *  which one they mean instead of the engine guessing — which it did three
   *  times before this existed, differently each time. */
  corpora(): { id: string; label: string; path: string }[] {
    const out = [{ id: "trunk", label: "trunk", path: this.root }];
    try {
      for (const it of itList(this.root).filter((x) => x.open)) {
        out.push({ id: it.id, label: it.id.split("-")[0] ?? it.id, path: it.path });
      }
    } catch {
      // no iterations yet, so trunk is the whole story
    }
    return out;
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
    // RESOLVED BY WHAT THE PATH IS, never by where the walk stands (owner
    // ruling 2026-08-07). paths.ts holds the classification and the reasons.
    //
    // A DECLARED ROOT is session state exactly like .se/ — its declaration
    // lives in the project root's .se/roots.json, so a bound worktree must
    // never make the owner's roots read as undeclared (found live 2026-07-30).
    const kind = pathKind(rel);
    if (kind === "session") return this.root;
    // A RECORD'S OWN CONTENT IS READ FROM THE RECORD'S TREE, bound or not.
    // The mirror painted i1's states out of trunk while i1's worktree held
    // the fall that knocked them down, and both halves were working — they
    // were simply looking at different files.
    if (kind === "record") return this.recordRoot(rel) ?? this.workRoot();
    return this.workRoot();
  }

  /** WHERE ONE RECORD'S OWN CONTENT LIVES.
   *
   *  An OPEN record owns its worktree, so that is the only copy that counts.
   *  A CLOSED one has landed and its tree is gone, so undefined here falls
   *  back to the working root and finds the landed archive. */
  private recordRoot(rel: string): string | undefined {
    const owner = recordOwnerOf(rel);
    if (owner === undefined) return undefined;
    try {
      const found =
        owner.container === "iterations"
          ? itList(this.root).find((x) => x.id === owner.id)
          : expList(this.root).find((x) => x.id === owner.id);
      return found?.open === true ? found.path : undefined;
    } catch {
      // A record list that cannot be read must not take path resolution down
      // with it — the working root is always a legal answer.
      return undefined;
    }
  }

  /** EVERY TREE THE METHOD LIVES IN: trunk, plus each OPEN record's worktree.
   *
   *  A closed record's tree is gone, and its branch is history. Only what is
   *  open can be walked, so only what is open needs the method. */
  methodTrees(): string[] {
    const trees = new Set<string>([this.root]);
    try {
      for (const it of itList(this.root)) if (it.open) trees.add(it.path);
    } catch {
      // no iterations yet — trunk is the whole story
    }
    try {
      for (const e of expList(this.root)) if (e.open) trees.add(e.path);
    } catch {
      // likewise for expeditions
    }
    return [...trees];
  }

  /** A METHOD WRITE LANDS IN EVERY TREE, IN ONE ACT (owner ruling 2026-08-07).
   *
   *  THE FAILURE THIS ENDS, in the owner's words: you apply a change, you want
   *  the state machine to behave differently, and it does not — because the
   *  change went to a tree you are not standing in. Before this, the only
   *  thing that reconciled the trees was reconcileTrees at RELOAD, which
   *  reboots the walk and re-reads the whole of boot. So the cure cost more
   *  than the disease and the divergence just accumulated.
   *
   *  A DELETE FANS OUT TOO. Half the drift was a file that existed in one tree
   *  and not the other, which is what a one-way copy leaves behind.
   *
   *  RECORD CONTENT IS NOT COPIED, ever. An open record's evidence has exactly
   *  one home, and laneRoot sends every read there. One copy cannot disagree
   *  with itself. */
  fanOutMethod(rel: string, from: string): string[] {
    if (!fansOut(rel)) return [];
    const src = join(from, rel);
    const gone = !existsSync(src);
    const bytes = gone ? "" : readFileSync(src, "utf8");
    const reached: string[] = [];
    for (const tree of this.methodTrees()) {
      if (tree === from) continue;
      const dst = join(tree, rel);
      try {
        if (gone) {
          if (existsSync(dst)) unlinkSync(dst);
        } else {
          mkdirSync(dirname(dst), { recursive: true });
          writeFileSync(dst, bytes, "utf8");
        }
        reached.push(tree);
      } catch {
        // One unreachable tree must not stop the others — partial is strictly
        // better than none, and reconcileTrees still backstops at reload.
      }
    }
    return reached;
  }

  expeditionNew(kind: string, goal: string): Record<string, unknown> {
    const e = expNew(this.root, kind, goal);
    this.bumpGeneration(); // a new record changes what the container expands to
    return { created: e.id, branch: e.branch, note: "it stands in the expeditions container — enter there to work" };
  }

  iterationSeed(goal: string, vision: string, inputs: string[] = [], dependsOn: string[] = []): Record<string, unknown> {
    const it = itSeed(this.root, goal, vision, inputs, dependsOn);
    this.bumpGeneration(); // a new record changes what the container expands to
    return { seeded: it.id, branch: it.branch, note: "it stands in the iterations container as its kickoff" };
  }

  iterationOpen(id: string): Record<string, unknown> {
    const it = itFind(this.root, id);
    // The record store opens a record only over a standing claim, and entry
    // is what mints one. A product whose claims branch does not exist yet
    // gets it created by this first entry, so nothing ever runs unclaimed
    // for want of an opening act.
    const mid = machineId(join(this.root, ".se"));
    const gate = claimEntry(this.root, it.id, mid);
    if (!gate.ok) {
      throw new Rejection({
        clause: CLAUSES.CONDITION_UNMET,
        expected: `${it.id} unclaimed, or claimed by this machine (machine-${mid})`,
        got: `claimed by machine-${gate.holder?.machine ?? "?"} since ${gate.holder?.at ?? "?"}`,
        remedy: {
          tool: "se_pull",
          args: {},
          note: "pick another iteration from the claimable listing; a person may force-release a claim judged abandoned",
        },
        source: "engine/session.ts claim-gate",
      });
    }
    this.bound = it;
    markStarted(this.root, it);
    this.decisions.setExtraSink(join(it.path, "project", "spec", "iterations", it.id, "decisions.jsonl"));
    return {
      bound: it.id,
      note: "the lane now works in this iteration's worktree",
      ...(gate.claimed_now === true
        ? { claimed: `machine-${mid}${gate.offline === true ? " (recorded offline; announces at the next opportunity)" : ""}` }
        : {}),
    };
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
    const size = typeof rec?.change_size === "string" ? rec.change_size : this.kickoffSizeFromForm(it);
    const pinAbs = join(it.path, itPinRel(it.id));
    if (size === undefined) {
      if (existsSync(pinAbs)) return; // blessed in an earlier pass — walk on
      throw new Rejection({
        clause: CLAUSES.CONDITION_UNMET,
        expected: `a change_size in the iteration record (${CHANGE_COLUMNS.join(" | ")}) — the bless compiles the column and pins the machine`,
        got: "no change_size in the record's frontmatter",
        remedy: {
          tool: "se_file_patch",
          args: {
            ops: [{ path: itRecordRel(it.id), old_string: "status:", new_string: `change_size: <${CHANGE_COLUMNS.join(" | ")}>\nstatus:` }],
          },
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

  /** The pin RESHAPES the machine under the walk's feet: regenerate the
   *  iteration's machine (pinned now), carry history, counters and the
   *  active kickoff, and swap the frame in place. The machine id and the
   *  state ids are stable, so the evidence store keeps answering.
   *
   *  The compare is the compiled decl's CONTENT, because a widened field —
   *  a new item, a new column, new guidance — leaves the state COUNT
   *  untouched. A regeneration that drops a state the walk stands in is
   *  left alone: the swapped frame would point at nothing. */
  private repinSwap(): void {
    const top = this.top();
    const parent = this.subs[this.subs.length - 2];
    if (top === undefined || parent === undefined) return;
    const regen = parent.gen?.subGen?.[top.parentState]?.();
    if (regen === undefined || JSON.stringify(regen.decl) === JSON.stringify(top.decl)) return;
    const active = [...activeStates(top.instance)];
    const survives = (id: string): boolean => regen.decl.states.some((s) => s.id === id);
    if (!survives(top.instance.current) || !active.every(survives)) return;
    const inst = newInstance(regen.decl);
    inst.history = top.instance.history;
    inst.counters = top.instance.counters;
    inst.current = top.instance.current;
    inst.active = active;
    this.subs[this.subs.length - 1] = { decl: regen.decl, instance: inst, parentState: top.parentState, gen: regen };
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
    // NOTHING IS WRITTEN ONTO THE CLAIMS. The reopen used to strip their
    // signatures and stamp a reason in their place; it does not any more
    // (owner ruling 2026-08-06, built 2026-08-07). The reason belongs in the
    // log, which already has it — this call is logged like every other.
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
    this.decisions.setExtraSink(join(this.bound.path, "project", "spec", "expeditions", this.bound.id, "decisions.jsonl"));
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
        got:
          open
            .slice(0, 8)
            .map((n) => `${n.id}: ${n.brief}`)
            .join(" · ") + (open.length > 8 ? ` · …and ${open.length - 8} more` : ""),
        remedy: {
          tool: "se_pull",
          args: { update: { op: "done", node: open[0].id, brief: "<how it resolved>" } },
          note: "resolve every point (done | obsolete | revert | defer), then close",
        },
        source: "engine/session.ts close",
      });
    }
    const result = expClose(this.root, this.bound, merge, override);
    this.unbind();
    // THE CLOSE DELETES THE STATE THE WALK STANDS ON. Archiving the record
    // takes its states out of the drawing, and a walk left on one can route
    // nowhere: its only exit is the escape hatch, which records a step-out
    // the walk never earned. Whoever removes the ground says where the walk
    // goes, so the close moves it to the hop the leave state's own edge
    // names — the container's end.
    const top = this.top();
    let moved: string | undefined;
    if (top !== undefined) {
      // WALK IT OUT, never assign the position. The drawing counts fired
      // edges, so an end arrived at without them is a join still waiting.
      // The sub holds the drawing the walk entered with, which is the one
      // that still knows the way out of the record being archived.
      const end = top.decl.states.find((s) => s.kind === "end");
      const now = new Date().toISOString();
      try {
        for (let hop = 0; end !== undefined && hop < 4; hop++) {
          const at = activeStates(top.instance)[0];
          if (at === undefined || at === end.id) break;
          this.completeGuarded(top.decl, top.instance, at, "filled", now);
        }
        const landed = activeStates(top.instance)[0];
        if (landed !== undefined && landed === end?.id) moved = this.qualHere(landed);
      } catch {
        // The close stands whatever the walk does. A record that archived and
        // then reported a failure would read as one that did not archive.
      }
      this.notifyChange();
    }
    return {
      ...result,
      note: merge ? "applied — merged to trunk, archived" : "dismissed — archived unmerged",
      ...(moved === undefined
        ? {}
        : { moved_to: moved, moved_note: "the record's states are archived, so the walk stands at the container's end" }),
      ...(result.override === undefined
        ? {}
        : { override_note: "the report was NOT confirmed by a person — this close is recorded as an override on the record" }),
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
  escape(reason: string, _channel: Channel = "agent"): Record<string, unknown> {
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
        ...this.packet(),
        escaped: { from: stoodIn, reason },
        note: "escaped to the front desk — the walk was left standing. Tell the person PLAINLY why, then wait for their word.",
      };
    }
    if (this.top()?.decl.id === "boot") {
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
      ...this.packet(),
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
  private completeGuarded(
    m: MachineDecl,
    inst: MachineInstance,
    stateId: string,
    outcome: "filled" | "failed",
    now: string,
    only?: string,
  ): void {
    // A CLAIMFUL STATE COMPLETES ON ITS CLAIM (owner rule 2026-08-09: the
    // walk once passed build_chart unsigned and reached the gate — a
    // sub-machine skipped whole. subObjective closed that route; this
    // closes the CLASS, at the one gate every completion passes). A
    // "filled" completion of a state that declares evidence, while its
    // claim is not green, is work that was never done. The unchosen leg of
    // a choice is never completed, so a choice machine cannot wedge here.
    // Claimful completions only — mechanical hops stay free of the corpus
    // load this check costs.
    const decl = this.state(m, stateId);
    if (outcome === "filled" && decl.evidence_form.length > 0 && !new Set(this.recordDone(m)).has(stateId)) {
      throw new Rejection({
        clause: CLAUSES.CONDITION_UNMET,
        expected: `${stateId}'s claim to stand before it completes — it declares ${decl.evidence_form.length} evidence field(s)`,
        got: 'a "filled" completion with the claim neither signed nor standing — the walk has not moved',
        remedy: { tool: "se_pull", args: {}, note: "pull — the machine serves the owed form; submit it and the completion follows" },
        source: "engine/session.ts claim-guard",
      });
    }
    const snap = {
      active: inst.active === undefined ? undefined : [...inst.active],
      fired: inst.fired === undefined ? undefined : [...inst.fired],
      current: inst.current,
      status: inst.status,
    };
    completeState(m, inst, stateId, outcome, now, only, () => new Set(this.recordDone(m)));
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
      remedy: {
        tool: "se_pull",
        args: {},
        note: "a busbar waits for every inbound edge whose source is not already filled. Walk the branch that is still owed — the green ones no longer need walking (owner ruling 2026-08-09). If the edges are returns, redraw them: a reverse-of-forward edge compiles as a return. The walk has not moved.",
      },
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
    return this.leaves().ids.map((id) => this.qualHere(id));
  }

  /** The qualified name of a state in the machine that governs now. THE
   *  ROUTE GRAPH SPEAKS QUALIFIED IDS, so everything that hands a state
   *  name outward has to speak them too. An offer that named a bare one
   *  was a door nothing could walk: a freshly seeded expedition came back
   *  as "e31", and every legal answer to it was refused as unreachable
   *  (found live 2026-08-02, on the ordinary path into an expedition). */
  private qualHere(id: string): string {
    return this.inSub() ? `${this.subs.map((s) => s.decl.id).join("/")}/${id}` : id;
  }

  /** Standing in the retro — the one place holding the whole picture, so
   *  the one place that may park a note or carry it (engine/inbox.ts).
   *
   *  A MIRROR IS THE STATE IT MIRRORS. An iteration's onboard-retro carries
   *  same_as: retro, and its own guidance calls it the one legal drain
   *  place, so matching the id alone refused it the only job it has. */
  inRetro(): boolean {
    const { machine, ids } = this.leaves();
    return ids.some((id) => id === "retro" || machine.states.find((s) => s.id === id)?.same_as === "retro");
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
    // ONE RULE FOR LANDING, WHICHEVER MOVE BROUGHT YOU (owner, 2026-08-09).
    // A state that carries a sub-machine is never a position: the position is
    // that machine's own start. The normal edge knew this and the POP did
    // not, so popping out of one container landed ON the next container and
    // the route stepped straight over every state inside it. Five compose
    // states sat outside the search and the walk reported no path to them.
    const land = (pfx: string, t: StateDecl, tick: RouteNode["nexts"][number]["tick"]): void => {
      const at = Session.qual(pfx, t.id);
      if (t.submachine !== undefined) {
        const inner = this.declForPrefix(at);
        if (inner !== undefined) {
          nexts.push({ to: Session.qual(at, inner.initial), tick });
          return;
        }
      }
      nexts.push({ to: at, tick });
    };
    for (const e of st.edges) {
      const t = decl.states.find((s) => s.id === e.to);
      if (t === undefined) continue;
      land(prefix, t, { from: q, to: e.to });
    }
    // A TERMINAL closes the machine exactly as end does (machine.ts), so
    // the pop out of it is a real hop the route must see — without it the
    // walk wedges on a shipped state with no drawn way out.
    if ((st.kind === "end" || st.kind === "terminal") && prefix !== "") {
      const pcut = prefix.lastIndexOf("/");
      const pprefix = pcut < 0 ? "" : prefix.slice(0, pcut);
      const pid = pcut < 0 ? prefix : prefix.slice(pcut + 1);
      const pdecl = this.declForPrefix(pprefix);
      const pst = pdecl?.states.find((s) => s.id === pid);
      for (const e of pst?.edges ?? []) {
        const t = pdecl?.states.find((s) => s.id === e.to);
        if (t === undefined) continue;
        land(pprefix, t, { from: q, advance: true });
      }
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
    // routeAim is the ONE normalisation: a target naming a node that
    // descends means that machine's start. A private main-only copy here
    // missed "iterations/i1" and wedged the walk at the sub's start.
    if (here === this.routeAim(this._target)) this._target = "";
  }

  /** What the route search can see, beyond file content. Bumped wherever the
   *  walk's shape changes for a reason no drawing records: a record seeded, a
   *  worktree bound or released. */
  private generation = 0;
  private routeMemo?: { key: string; machine: MachineDecl; value: ReturnType<Session["route"]> };

  /** Every door that can change what a generated container expands to. */
  bumpGeneration(): void {
    this.generation++;
    this.routeMemo = undefined;
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
        remedy: {
          tool: "se_pull",
          args: {},
          note: "aim only at drawn states — pull with no payload and the machine offers the doors it can reach",
        },
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

  /** A SUBMACHINE IS NAMED BY ITS CONTAINER, but the search graph never holds
   *  that name: expandNode replaces the container with its inner states. So
   *  aiming at "expeditions" found no path to a state the reader had just
   *  walked into, which made the target useless for half the drawing (found
   *  live 2026-07-29, the moment the mirror got a key for setting it).
   *  Aim at its start. The render maps that back to the container node, so
   *  the destination dot still lands exactly where the reader pointed.
   *  The target's OWN machine answers this, never the main one. A door
   *  inside a container is named "expeditions/e31", and looking that up
   *  in main found nothing, so every such door read as not-a-submachine
   *  by accident rather than by test. */
  private routeAim(target: string): string {
    const cut = target.lastIndexOf("/");
    const decl = this.declForPrefix(cut < 0 ? "" : target.slice(0, cut))?.states.find(
      (s) => s.id === (cut < 0 ? target : target.slice(cut + 1)),
    );
    return decl?.submachine !== undefined ? Session.qual(target, this.declForPrefix(target)?.initial ?? "start") : target;
  }

  /** THE ROUTE COMPUTES WHAT IS NEEDED, NOT WHAT IS NEAREST (owner design
   *  2026-08-04 in note-bb6d1cb6b75d, built 2026-08-07).
   *
   *  route.ts says the frame is `make` — name a target, compute what is
   *  needed, run it. It was breadth-first shortest path instead, which is a
   *  different question with a different answer. Two things followed:
   *
   *  - IT WAS BLIND TO GREEN. A state already standing was routed through
   *    exactly like one that still owed work.
   *  - IT WAS BLIND TO THE AND. From one state it found ONE way to a gate.
   *    But a gate collects EVERY input, so a branch the path never mentioned
   *    is still owed — and the walk marched to a gate that then refused,
   *    naming a feeder nobody had been sent to.
   *
   *  DEFAULT IS AND, which is the settled ruling: in most machines every
   *  branch must be covered. So the objective is the first prerequisite that
   *  does NOT yet stand, and the target itself only once they all do.
   *
   *  Transparent states are looked through by claimFeeders, so a waypoint
   *  carrying no claim never becomes an objective.
   *
   *  IT RE-ASKS ON EVERY PULL. Finishing one objective simply makes the next
   *  one the answer, so no plan is stored and none can go stale. */
  private nextObjective(aim: string, pass: GreenPass = Session.newPass()): string {
    const cut = aim.lastIndexOf("/");
    const prefix = cut < 0 ? "" : aim.slice(0, cut);
    const local = cut < 0 ? aim : aim.slice(cut + 1);
    const decl = this.declForPrefix(prefix);
    if (decl === undefined || !decl.states.some((s) => s.id === local)) return aim;
    const claimful = new Set(decl.states.filter((s) => s.evidence_form.length > 0).map((s) => s.id));
    const done = new Set(this.recordDone(decl, new Set(), pass));
    const unmet: string[] = [];
    const seen = new Set<string>([local]);
    const stack = [local];
    while (stack.length > 0) {
      const at = stack.pop() as string;
      for (const f of claimFeeders(decl, at, claimful)) {
        if (seen.has(f)) continue;
        seen.add(f);
        stack.push(f);
        if (!done.has(f)) unmet.push(f);
      }
    }
    if (unmet.length === 0) {
      // A SUB-MACHINE'S WORK IS NOT INVISIBLE (2026-08-09). claimFeeders looks
      // THROUGH a state carrying no claim. That is right for a waypoint and
      // wrong for a CONTAINER: everything drawn inside it disappears from the
      // objective, so a walk aimed past `enumerate-space` ran seven finders
      // and a chart in one hop without being asked for anything.
      //
      // Found when build_chart reached gate-candidates unsigned, with three
      // empty evidence fields and no file on disk at all.
      return this.subObjective(decl, prefix, local, pass) ?? aim;
    }
    // THE ONE WITH NOTHING UNMET BEHIND IT. Anything else would send the walk
    // at a state whose own inputs are still owed, which is the very mistake
    // this replaces.
    const owed = new Set(unmet);
    const first = unmet.find((u) => claimFeeders(decl, u, claimful).every((f) => !owed.has(f)));
    return Session.qual(prefix, first ?? unmet[0]);
  }

  /** THE FIRST OWED STATE INSIDE A SUB-MACHINE THAT LIES UPSTREAM OF THE AIM.
   *
   *  Walks the inbound INPUT edges of THIS machine, and for each container it
   *  meets, asks that machine what it still owes. The first answer wins, in
   *  the sub-machine's own declaration order, so a chart that waits on its
   *  finders is named after them rather than before.
   *
   *  INPUT EDGES ONLY (owner emergency ruling 2026-08-11). Every idle door is
   *  double-headed, and the compiler names each return half alternative.
   *  Counting those as inbound made the WHOLE machine upstream of the front
   *  desk, so an aim at the desk descended into whatever record stood open:
   *  boot marched into i2, parked at a gate, and served the record's reading
   *  as boot's own. The desk is never behind the work.
   *
   *  THE WALK'S OWN CONTAINER STILL ANSWERS. A walk standing inside a record
   *  keeps finding its owed legs — the container it stands in is asked even
   *  though no input edge makes it upstream of the aim. That keeps the same
   *  day's wedge fix: a finished fan leg still learns its owed sibling. */
  private subObjective(decl: MachineDecl, prefix: string, local: string, pass: GreenPass): string | undefined {
    const upstream = new Set<string>();
    const stack = [local];
    while (stack.length > 0) {
      const at = stack.pop() as string;
      for (const src of decl.states) {
        if (upstream.has(src.id) || !src.edges.some((e) => e.to === at && INPUT_ROLES.has(e.role ?? "normal"))) continue;
        upstream.add(src.id);
        stack.push(src.id);
      }
    }
    const here = this.active()[0] ?? "";
    if (prefix === "" && here.includes("/")) upstream.add(here.split("/")[0]);
    for (const id of upstream) {
      const st = decl.states.find((s) => s.id === id);
      if (st?.submachine === undefined) continue;
      const subPrefix = Session.qual(prefix, id);
      const sub = this.declForPrefix(subPrefix);
      if (sub === undefined) continue;
      const owed = this.deepOwed(subPrefix, sub, pass);
      if (owed !== undefined) return owed;
    }
    return undefined;
  }

  /** THE FIRST OWED CLAIM IN A SUB-MACHINE, HOWEVER DEEP (owner ruling
   *  2026-08-11). One level was not enough: aimed at the front desk with a
   *  composer leg owed two containers down, the objective fell back to the
   *  aim, the branch return could not map it into the leg's machine, and the
   *  walk stood on a finished leg answering `do` with nowhere to go. Every
   *  such wedge cost an escape to the desk and a re-aim by hand.
   *
   *  Declaration order is walk order in these machines, so the first undone
   *  claimful state found this way is the same one a person reading the
   *  drawing would name. A container met on the way is asked the same
   *  question before the walk moves past it. */
  private deepOwed(prefix: string, decl: MachineDecl, pass: GreenPass): string | undefined {
    const done = new Set(this.recordDone(decl, new Set(), pass));
    for (const s of decl.states) {
      if (s.evidence_form.length > 0 && !done.has(s.id)) return Session.qual(prefix, s.id);
      if (s.submachine === undefined) continue;
      const subPrefix = Session.qual(prefix, s.id);
      const sub = this.declForPrefix(subPrefix);
      if (sub === undefined) continue;
      const nested = this.deepOwed(subPrefix, sub, pass);
      if (nested !== undefined) return nested;
    }
    return undefined;
  }

  /** PUT THE WALK BACK ON A BRANCHING POINT.
   *
   *  Only ever called for an AND branch, where every leg must be walked and
   *  the join above wants them all. It moves the token and records the move;
   *  it un-fills nothing, because the leg already walked stays walked.
   *
   *  THE FIRED EDGES ARE LEFT ALONE ON PURPOSE. The leg that completed put
   *  its fuel into the join, and that fuel is what the join is waiting to
   *  collect. Clearing it here would make the walk go round for ever. */
  private stepBackTo(branch: string): void {
    const run = this.top();
    const inst = run?.instance ?? this.instance;
    inst.active = [branch];
    inst.current = branch;
    inst.history.push({
      state: branch,
      outcome: "reopened",
      evidence: "returned to the branching point to walk another leg",
      at: new Date().toISOString(),
    });
    this.forgetRoute();
    this.notifyChange();
  }

  /** THE RETURN TO A BRANCHING POINT, drawn as a route.
   *
   *  One hop back to the branch, then forward down the leg that is still
   *  owed. The back hop weighs nothing: it enters no state's work, it only
   *  un-picks a leg the fan handed out.
   *
   *  Returns undefined where there is no AND branch behind the walk that
   *  reaches the objective, which is the honest "no way there from here". */
  private branchReturn(from: string, objective: string): RouteResult | undefined {
    const cut = from.lastIndexOf("/");
    const prefix = cut < 0 ? "" : from.slice(0, cut);
    const decl = this.declForPrefix(prefix);
    if (decl === undefined) return undefined;
    const localFrom = cut < 0 ? from : from.slice(cut + 1);
    const localTo = objective.startsWith(`${prefix}/`) ? objective.slice(prefix.length + 1) : objective;
    const branch = branchToReturnTo(decl, localFrom, localTo);
    if (branch === undefined) return undefined;
    const onward = computeRoute(Session.qual(prefix, branch), objective, (q) => this.expandNode(q));
    if (onward.steps.length === 0) return undefined;
    return {
      ...onward,
      steps: [
        {
          from,
          to: Session.qual(prefix, branch),
          tick: { from: localFrom, back_to: branch },
          priority: 0,
          demands: {},
        },
        ...onward.steps,
      ],
    };
  }

  /** The slider is weighed HOP BY HOP. A route that walks past a state
   *  the agent may not enter is a hole straight through contract rule 3. */
  private routeJudgments(steps: RouteResult["steps"]): { at: string; needs: string; why: string }[] {
    const judgments: { at: string; needs: string; why: string }[] = [];
    for (const s of steps) {
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
    return judgments;
  }

  /** EVERY DOCUMENT THE WHOLE WAY DEMANDS, gathered once. This is what
   *  makes a sweep one call rather than one per hop: read this list, hash
   *  it, and hand the lot over. A route is also PULLED guidance, which the
   *  entry conditions never name, so both are collected. */
  private routeReadList(steps: RouteResult["steps"]): string[] {
    const reads = new Set<string>();
    for (const s of steps) {
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
    return [...reads].sort();
  }

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
    fan: { at: string; legs: string[] }[];
  } {
    // ONE PASS OVER DISK FOR THE WHOLE ROUTE (software.md, input-process-
    // output). Between here and the return the door stats each note ONCE
    // instead of once per access. Entering one record touched the same 328
    // notes about sixty times over — 19,730 stats to answer 328 questions.
    //
    // SYNCHRONOUS ON PURPOSE. Nothing can interleave inside a pass, so no
    // other operation is ever handed this one's held text, and the next lane
    // call re-stats everything. An async wrapper would break exactly that:
    // two overlapping calls would share a pass, and a file written by the
    // first would go unseen by the second.
    return withPass(() => this.routeNow(target));
  }

  private routeNow(target: string): RouteResult & {
    from: string;
    autonomy: number;
    judgments: { at: string; needs: string; why: string }[];
    reads: string[];
    stops_at?: { at: string; why: string };
    fan: { at: string; legs: string[] }[];
  } {
    const from = this.active()[0] ?? this.machine.initial;
    // THE ROUTE IS RECOMPUTED, NEVER RE-DERIVED (measured 2026-08-02: 200 ms
    // a call, and readingList asks for it on EVERY pull). Draining eight
    // documents therefore paid it nine times without one input changing.
    //
    // The key is everything the search can see. The machine is compared by
    // IDENTITY, which is safe because compileMachineCached returns the same
    // object while the drawing's CONTENT is unchanged — so an edited canvas
    // misses the memo, and the truth stays read live. `generation` covers what
    // no file content can: a record seeded or a worktree bound changes what a
    // generated container expands to.
    // THE OBJECTIVE IS PART OF THE KEY, and it is computed BEFORE the memo is
    // consulted. The route used to be pure graph search over the drawing, so
    // the drawing's identity was a complete key. It now depends on which
    // claims stand, and those change under a walk that is filling forms.
    //
    // Caught live 2026-08-07: a claim was signed, the objective should have
    // moved on, and the memo kept handing back the route to the state the
    // walk was already standing in — so the walk had nowhere to go. A stale
    // derived value, which is the exact fault this whole day removed
    // elsewhere.
    //
    // nextObjective reads the evidence files, which is cheap. What stays
    // memoized is expandNode, which WRITES generated containers.
    const memoKey = [from, target, this._autonomy, this.subs.map((s) => s.decl.id).join("/"), this.generation].join("::");
    const machineNow = this.machine;
    if (this.routeMemo !== undefined && this.routeMemo.key === memoKey && this.routeMemo.machine === machineNow) {
      return this.routeMemo.value;
    }
    // THE OBJECTIVE IS COMPUTED ON A MEMO MISS, never before the check.
    //
    // It reads the evidence, and evidence reading is not free. Computing it
    // ahead of the memo put a full green recomputation on EVERY packet, and
    // route() is built into every packet — se_aim measured 2936 ms and the
    // next pull never came back.
    //
    // The staleness that ordering was meant to fix is handled at the other
    // end instead: a WRITE clears this memo. Invalidate on the event, do not
    // recompute on every read.
    //
    // IT USED TO BE FORM WRITES ONLY, on the reasoning that a form write is
    // the only thing that can change which claims stand. That is false, and
    // it wedged the walk on 2026-08-07. A claim's green also depends on the
    // TRACE NODES it references, so repairing a node changed the answer while
    // the memo kept handing back the old objective. The walk stood in a state
    // the router still believed was owed, and re-aiming could not shift it.
    //
    // Every lane write now clears it. The cost is one recomputation after a
    // write, which is exactly when the answer may have moved.
    const aim = this.routeAim(target);
    // THE ROUTE IS ONE OPERATION, so it collects its input once. Everything
    // below reads the corpus out of this pass rather than fetching its own
    // (software.md, input-process-output).
    const pass = Session.newPass();
    const objective = this.nextObjective(aim, pass);
    let r = computeRoute(from, objective, (q) => this.expandNode(q));
    // NO WAY FORWARD IS NOT THE SAME AS NO WAY (owner design 2026-08-07).
    //
    // A fan hands out ONE leg. Walk it to the end and the drawing offers
    // nothing: the other legs are behind you and the join above wants them
    // all. The walk was not stuck, it was facing the wrong way.
    //
    // Until today the only exit was se_pull {escape} — back to the desk, a
    // full re-aim, every owed document served again. It cost two escapes in
    // one session from states that were signed, met and green.
    //
    // So: where no forward path exists, look for an AND branching point
    // behind the walk that reaches the objective, and return to it. An OR
    // branch is never offered, because there the branch is where a DECISION
    // was made and walking backwards would un-make it.
    // A found route that WRAPS out of the shared machine is the loop-the-
    // machine line: prefer the branch return there too.
    const wrapped = r.steps.length > 0 && routeWraps(from, objective, r.steps);
    const back = (r.steps.length === 0 || wrapped) && from !== objective ? this.branchReturn(from, objective) : undefined;
    if (back !== undefined) r = back;
    const judgments = this.routeJudgments(r.steps);
    const value = {
      ...r,
      from,
      // THE LINE GOES TO THE OBJECTIVE, which is the work actually owed next.
      // `aimed_at` keeps the far target visible, so a reader can see both
      // where they are headed and what stands in the way of it.
      ...(objective === aim ? {} : { aimed_at: aim }),
      autonomy: this._autonomy,
      judgments,
      reads: this.routeReadList(r.steps),
      // THE FAN AT A BAR RIDES THE ROUTE (owner, 2026-08-09): one drawn
      // path hid the other legs, and the walk met them one refusal at a
      // time — the three-way join cost an aim per leg before this.
      fan: this.routeFan(r.steps),
      ...(judgments.length > 0 ? { stops_at: { at: judgments[0].at, why: judgments[0].why } } : {}),
    };
    this.routeMemo = { key: memoKey, machine: machineNow, value };
    return value;
  }

  /** A qualified id, split against its drawing. */
  private stateAt(q: string): { prefix: string; decl?: MachineDecl; state?: StateDecl } {
    const cut = q.lastIndexOf("/");
    const prefix = cut < 0 ? "" : q.slice(0, cut);
    const decl = this.declForPrefix(prefix);
    const state = decl?.states.find((s) => s.id === (cut < 0 ? q : q.slice(cut + 1)));
    return { prefix, decl, state };
  }

  /** THE ROUTE STAYS ONE WALKABLE PATH, but a state whose inputs meet at an
   *  AND bar is owed EVERY leg. The unsigned legs the path does not itself
   *  run through ride along here, so the drawing shows the whole fan and
   *  the agent reads all of what is next. Bars worth reporting: ON the
   *  path, or FED by it — the objective is usually one LEG of a fan, and
   *  the bar it feeds owes the rest. */
  private routeFan(steps: RouteStep[]): { at: string; legs: string[] }[] {
    const out: { at: string; legs: string[] }[] = [];
    const onPath = new Set(steps.flatMap((s) => [s.from, s.to]));
    const candidates = new Set<string>(onPath);
    for (const q of onPath) {
      const { prefix, state } = this.stateAt(q);
      for (const e of state?.edges ?? []) candidates.add(prefix === "" ? e.to : `${prefix}/${e.to}`);
    }
    for (const q of candidates) {
      const { prefix, decl, state } = this.stateAt(q);
      if (decl === undefined || state === undefined || state.evidence_form.length === 0) continue;
      const legs = this.feedersUnsigned(decl, state)
        .map((f) => (prefix === "" ? f : `${prefix}/${f}`))
        .filter((ql) => !onPath.has(ql));
      if (legs.length > 0) out.push({ at: q, legs });
    }
    return out;
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
    // ALWAYS LOOK AHEAD — never only when the route gave nothing.
    //
    // THE ROUTE STOPS AT THE STEP IT CANNOT ENTER, so that step is not among
    // its steps and its entry documents were never gathered. When the reason it
    // could not be entered IS an unread document, that document is the only one
    // that matters, and it was the one thing missing from the reading.
    //
    // The old guard made it worse by testing the UNFILTERED list. A route that
    // contributed only documents already in the head counted as not empty, the
    // lookahead was skipped, and the filter below then left the reading EMPTY
    // while the walk stood blocked on a document nobody was shown. The pull
    // answered with a refusal whose own remedy could not be executed: pulling
    // served nothing, and reading the file by hand credits only the gathered
    // reading, never an arbitrary path. Found live 2026-08-06.
    //
    // Gathering more candidates is free: the filter drops everything the head
    // already holds, so nothing is ever read twice.
    const { machine, ids } = this.leaves();
    for (const id of ids) {
      const s = this.state(machine, id);
      for (const d of this.pulled(machine, s)) add(d.path);
      for (const p of this.lookaheadRequirements(machine, s)) add(p);
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
        // NAME IT IN THE READING rather than skipping in silence.
        //
        // An owed document that cannot be read used to leave the reading
        // EMPTY: the header said "1 document(s) the way ahead demands", the
        // body said nothing, and the refusal repeated a name with no way on
        // Earth to satisfy it. The comment here claimed it "says so where it
        // is asked for". It did not.
        //
        // It cost a state its entry on 2026-08-06, and the cause was a row
        // naming a bare id where a PATH is owed — a five-second fix that took
        // an hour to see, because nothing anywhere said which document or why.
        //
        // No part is pushed, so it stays owed and the walk still blocks. It
        // blocks legibly now.
        out.push(
          `## ${rel}`,
          "",
          "NOT READABLE. The walk demands this document and cannot serve it, so the walk stays blocked.",
          "",
          "Whatever names it names it WRONGLY. entry_read and the pulled guidance take a PATH from the project root, never a bare id.",
          "",
        );
        continue;
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
    if (credited.length > 0) this.persistSettings();
    return credited;
  }

  /** THE READING, SERVED BY THE PULL ITSELF. One document per answer; the
   *  next pull proves it before the following one is served.
   *
   *  ONE DOCUMENT AT A TIME. A host that moves a large tool result to disk
   *  hands the agent a PREVIEW instead of the text. A document is a natural
   *  page, always whole, and the largest guidance file is a tenth of what got
   *  eaten.
   *
   *  THREE PROBES, SPREAD ACROSS THE DOCUMENT. Quoting back what was just
   *  served is the only proof an agent can actually compute — it cannot hash,
   *  and a hash the engine handed over would prove only that a message
   *  arrived. But ONE probe at the end is answerable by reading only the end,
   *  and a model doing the least it can get away with will do exactly that.
   *  Anchors at roughly a third, two thirds and the very end mean the whole
   *  document has to be in hand. The last one still catches a truncating
   *  host, because truncation is what drops the end.
   *
   *  UNREADABLE IS REPORTED, NOT SKIPPED FOREVER. A path that cannot be read
   *  from here is named and left out of the remainder, so the loop still ends
   *  and the refusal that follows can say what is missing. */
  private serveReading(): Record<string, unknown> | null {
    const paths = this.readingList();
    const unreadable: string[] = [];
    for (const rel of paths) {
      let body: string;
      try {
        body = readFileSync(resolveInRoot(this.laneRoot(rel), rel, "engine/session.ts reading")).toString("utf8");
      } catch {
        unreadable.push(rel);
        continue;
      }
      const probes = this.readingProbes(body);
      this.pendingRead = { path: rel, hash: contentHash(body), expect: probes.expect };
      return {
        document: { path: rel, content: body },
        remaining: paths.length - unreadable.length - 1,
        prove: {
          quote: probes.ask,
          as: 'form: {"read": "<the answers, in one string, in order>"}',
          why: "they are spread through the document on purpose — all of it has to be in hand",
        },
        ...(unreadable.length > 0
          ? { unreadable, warning: "demanded, but not readable from here. The gate that wants them will say so." }
          : {}),
      };
    }
    return null;
  }

  private readingProbes(body: string): { ask: string[]; expect: string[] } {
    const w = body.split(/\s+/).filter((x) => x !== "");
    if (w.length < 16) return { ask: ["the whole document, verbatim"], expect: [w.join(" ")] };
    const ask: string[] = [];
    const expect: string[] = [];
    for (const at of [0.3, 0.6, 0.92]) {
      const i = Math.min(Math.floor(w.length * at), w.length - 8);
      ask.push(`the 4 words that FOLLOW "${w.slice(i, i + 4).join(" ")}"`);
      expect.push(w.slice(i + 4, i + 8).join(" "));
    }
    return { ask, expect };
  }

  private normWords(s: string): string {
    return s.trim().replace(/\s+/g, " ").toLowerCase();
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
    // A BANNER EARNED MID-SWEEP MUST SURVIVE THE SWEEP. advance hands
    // its banner back per hop, and a sweep that swallowed it lost the boot
    // banner every time — the harness rule says show banners verbatim, and
    // nobody can show what the machinery ate.
    const banners: string[] = [];
    const carry = (): Record<string, unknown> => (banners.length > 0 ? { banners } : {});
    for (let guard = 0; guard < 64; guard++) {
      const r = this.route(target);
      if (r.steps.length === 0) {
        return { ...this.packet(), swept: walked, arrived: r.found, ...carry(), ...(r.found ? {} : { note: r.note }) };
      }
      const step = r.steps[0];
      try {
        // A BACK HOP IS NOT AN EDGE, so advance cannot walk it. It un-picks a
        // leg the fan handed out and puts the walk on the branching point
        // again — see branchReturn.
        if (typeof step.tick.back_to === "string") {
          this.stepBackTo(String(step.tick.back_to));
          walked.push(step.to);
          continue;
        }
        const one = await this.advance(step.tick.to === undefined ? undefined : String(step.tick.to), channel);
        if (typeof one.banner === "string") banners.push(one.banner);
      } catch (e) {
        if (!(e instanceof Rejection)) throw e;
        return {
          ...this.packet(),
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
    return {
      ...this.packet(),
      swept: walked,
      arrived: false,
      ...carry(),
      note: "64 hops without arriving — the sweep stops rather than looping",
    };
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
  //
  // THE FLAG IS NOT THE VERB, and confusing the two cost four round trips on
  // 2026-08-09. `submit` and `bless` ride IN the form as acts rather than
  // sections (pullSaveOrChoose). A fill without `submit` SAVES and does not
  // stamp, which is deliberate — a half-filled form survives to be finished —
  // but it answers with the same form and no problems, so it reads exactly
  // like a refusal. Both flags are named on the tool and in walking.md now.

  /** The form names the very NEXT hop demands. The machine looks this up
   *  so the agent never goes hunting for which form applies. */
  private pullFormsOwed(): string[] {
    const owed: string[] = [];
    const standing = this.standingStateFormOwed();
    if (standing !== undefined) owed.push(standing);
    if (this._target !== "") {
      try {
        const r = this.route(this._target);
        if (r.steps.length > 0) owed.push(...(r.steps[0].demands.evidence_form ?? []));
      } catch {
        // an undrawable way owes nothing extra
      }
    }
    return owed;
  }

  /** One way out, said as an offer: weight, openness and what blocks it. */
  private doorOption(decl: MachineDecl, t: StateDecl, to: string, role: string): Record<string, unknown> {
    const open = this.conditionMet(decl, t, "enter");
    const overWeight = t.priority > this._autonomy;
    return {
      to,
      role,
      ...(t.statement !== "" ? { statement: t.statement } : {}),
      priority: t.priority,
      open: open && !overWeight,
      ...(overWeight ? { needs: `the person — ${t.priority} is above the session autonomy ${this._autonomy}` } : {}),
      ...(open ? {} : { blocked_by: Object.keys(this.conditionStatus(decl, t, "enter") ?? {}) }),
    };
  }

  /** THE OFFER AND THE CHECK READ ONE GRAPH. A sub holds the drawing the
   *  walk entered with; the router re-derives it live. Archiving a record
   *  takes its states out of the live one, so an offer built from the held
   *  copy names doors the router then refuses, and the walk is stranded
   *  with no legal move left (found live 2026-08-02, closing e31). */
  private optionsAt(machine: MachineDecl, id: string): Record<string, unknown>[] {
    const out: Record<string, unknown>[] = [];
    const node = this.expandNode(this.qualHere(id));
    if (node === undefined) return out;
    const walkable = new Set<string>();
    const pops: string[] = [];
    for (const n of node.nexts) {
      const tick = n.tick as { to?: unknown; advance?: unknown };
      if (typeof tick.to === "string") walkable.add(tick.to);
      else if (tick.advance === true) pops.push(n.to);
    }
    for (const e of this.state(machine, id).edges) {
      if (!walkable.has(e.to)) continue;
      const t = machine.states.find((x) => x.id === e.to);
      if (t === undefined) continue;
      out.push(this.doorOption(machine, t, this.qualHere(e.to), e.role));
    }
    // STANDING ON A SUB'S END, the way on is OUT of it, and the router
    // walks exactly that. Left out of the offer it reads as no work left,
    // when the container has merely finished.
    for (const q of pops) {
      const cut = q.lastIndexOf("/");
      const decl = this.declForPrefix(cut < 0 ? "" : q.slice(0, cut));
      const t = decl?.states.find((s) => s.id === (cut < 0 ? q : q.slice(cut + 1)));
      if (decl === undefined || t === undefined) continue;
      out.push(this.doorOption(decl, t, q, "return"));
    }
    return out;
  }

  /** The ways out of where the walk stands — the machine's own offer at a
   *  branching point. Weight and openness ride along, so choosing costs
   *  no second call. */
  private pullOptions(): Record<string, unknown>[] {
    const stuck = this.joinStuck();
    if (stuck !== undefined) {
      return stuck.feeders.flatMap((f) => {
        const t = stuck.machine.states.find((x) => x.id === f);
        return t === undefined ? [] : [this.doorOption(stuck.machine, t, this.qualHere(f), "normal")];
      });
    }
    const { machine, ids } = this.leaves();
    if (this._target === "" && !this.inSub() && ids.length === 1 && ids[0] === "front_desk") {
      // The desk borrows idle's doors, and a borrowed offer loses the hub
      // itself. Idle is the one state with no owed work — the reload's
      // home — and every borrowed door sails PAST it, the nearest being
      // end, which shuts the server down. So the hub is offered too.
      const hub = this.machine.states.find((s) => s.id === "idle");
      const doors = this.optionsAt(this.machine, "idle");
      return hub === undefined ? doors : [this.doorOption(this.machine, hub, "idle", "normal"), ...doors];
    }
    return ids.flatMap((id) => this.optionsAt(machine, id));
  }

  /** The step the walk stands on, said small: id, statement, guidance,
   *  the legal tools, and WHAT IT WILL ASK by name and type — the detail
   *  (guidance documents, per-field help) rides the pull and the form
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
        ...(s.evidence_form.length > 0
          ? {
              asks: s.evidence_form
                .filter((f) => f.type !== "derived")
                .map((f) => ({ name: f.name, ...(f.type !== undefined ? { type: f.type } : {}), required: f.required !== false })),
            }
          : {}),
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
  async pull(
    payload: { form?: Record<string, unknown>; escape?: string } = {},
    channel: Channel = "agent",
  ): Promise<Record<string, unknown>> {
    // ONE DRAWING VALIDATION PER WALK STEP — the epoch makes "the next
    // call" the unit of the read-it-live law (see machines/compile.ts).
    bumpDrawingEpoch();
    this.driftReopen();
    // THE AIM IS READ AFTER THE PAYLOAD LANDS. A CHOICE IS THE ACT OF
    // AIMING, so reading the aim first threw it away: standing at idle,
    // the walk fell back to the front desk and went THERE while the
    // chosen door sat recorded and unwalked. Proven live 2026-08-05 —
    // choice "expeditions" at autonomy 0.2 answered `do` for front_desk.
    const targetNow = (): string =>
      this._target === "" && this.active()[0] !== undefined && this.active()[0] !== "front_desk" ? "front_desk" : this._target;
    const head = (): Record<string, unknown> => ({
      where: this.active(),
      ...(this.bound !== undefined ? { expedition: this.bound.id } : {}),
      target: targetNow(),
      autonomy: this._autonomy,
      ...(() => {
        // The tiers are the vocabulary; the number is the transitional carrier.
        try {
          return { tier: tierOf(loadLevels(this.root), this._autonomy) };
        } catch {
          return {};
        }
      })(),
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

    const readProof = this.takeReadProof(payload.form);
    const { saved, fanOut } =
      payload.form !== undefined && readProof === null ? this.pullSaveOrChoose(payload.form) : { saved: undefined, fanOut: [] };

    const extra = (): Record<string, unknown> => ({
      ...(saved !== undefined ? { form_saved: saved } : {}),
      ...(fanOut.length > 0
        ? { not_walked: fanOut, note: "one agent is walking, so only the first choice was taken — the others are yours to hand out" }
        : {}),
    });

    const pullTarget = targetNow();

    // THE MACHINE SAYS WHAT IS WRONG AND WHAT TO DO (owner ruling 2026-08-07).
    //
    // A `fill` that comes back unchanged IS a refusal, and every refusal in
    // this system carries its remedy. This one did not: the problems sat deep
    // inside the form model, and a big form is moved to disk by the host,
    // which hands back a PREVIEW — the head of the JSON. The problems fell in
    // the part that was dropped.
    //
    // SO THEY RIDE AT THE TOP, beside `pull`, where a preview still shows
    // them. Five calls went on guessing at one word before this existed.
    //
    // IT IS NEVER THE AGENT'S JOB TO ASK WHY. The machine holds the verdict;
    // handing it over is the machine's job, not a question the agent has to
    // know to ask.
    // THE STANDING FORM COMES FIRST (owner rulings 2026-08-04): inside an
    // iteration's state with evidence fields, the stored form IS the work.
    // The pull serves it until it is met; the payload fills it.
    const standingForm = this.standingStateFormOwed();
    if (standingForm !== undefined) {
      return {
        pull: "fill",
        ...head(),
        ...this.refusedBlock([standingForm]),
        for: standingForm,
        forms: [this.formGet(standingForm)],
        do: 'work the state, then return fills on the next pull as form: {"<section>": "<text>"} - multi-pass is fine; finish with {"submit": true}: the submit checks the fields and stamps the claim',
        ...extra(),
      };
    }

    // 1. NO TARGET at the front desk means nothing is owed here. The
    //    doors ride along as options, but the machine does not pick one. Anywhere
    //    else, no-target work comes home to the desk first.
    if (pullTarget === "") {
      const options = this.pullOptions();
      return {
        pull: "wait",
        ...head(),
        ...(options.length > 0 ? { options } : {}),
        waiting_for: "the person",
        do:
          options.length > 0
            ? "say plainly that nothing is owed here and STOP - options are available, but do not take one unless a goal is set or the person routes it"
            : "say plainly that nothing is owed and STOP - the dial alone cannot wake you, so ask them to message you",
        ...extra(),
      };
    }

    let r: ReturnType<Session["route"]>;
    try {
      r = this.route(pullTarget);
    } catch (e) {
      if (!(e instanceof Rejection)) throw e;
      return {
        pull: "wait",
        ...head(),
        waiting_for: "the person",
        why: "the way there cannot be drawn from here",
        refusal: e.toJSON(),
        ...extra(),
      };
    }

    if (r.steps.length === 0) {
      return {
        pull: "wait",
        ...head(),
        waiting_for: "the person",
        why: r.found ? "the target is where the walk already stands" : (r.note ?? "no way there"),
        ...extra(),
      };
    }

    // 2. THE GATES ON THE FIRST STEP: the slider, the reading, the form.
    const gated = this.pullStepGate(r.steps[0], readProof, channel, head, extra);
    if (gated !== undefined) return gated;

    // 3. THE HAPPY PATH, WALKED. Not one hop — every hop to the next
    //    branching point, because start-to-front-desk has no branch in it
    //    and should never cost a round trip per hop.
    const swept = await this.sweep(pullTarget, channel);
    return this.pullAfterSweep(swept, head, extra);
  }

  /** THE THREE GATES ON THE NEXT STEP, in the order they must run, or
   *  undefined when the step is the agent's to take.
   *
   *  THE SLIDER IS WEIGHED BEFORE THE READING, and the order was wrong
   *  once: reading first sent the agent through several documents to
   *  prepare for a step it was never allowed to take, and only then told
   *  it to stop. Nothing is owed for a step that is not the agent's.
   *
   *  The reading is the AGENT's proof. The person proves by checkbox, so
   *  their pull never eats a document. */
  private pullStepGate(
    first: ReturnType<Session["route"]>["steps"][number],
    readProof: "ok" | "wrong" | null,
    channel: Channel,
    head: () => Record<string, unknown>,
    extra: () => Record<string, unknown>,
  ): Record<string, unknown> | undefined {
    if (channel === "agent" && first.priority > this._autonomy) {
      return {
        pull: "wait",
        ...head(),
        waiting_for: "the person",
        at: first.to,
        why: `entering ${first.to} weighs ${first.priority}, above the session autonomy ${this._autonomy}`,
        do: "tell them plainly WHICH step waits and STOP — the dial alone cannot wake you, so they must send a message after moving it",
        ...extra(),
      };
    }

    const served = channel === "agent" ? this.serveReading() : null;
    if (served !== null) {
      return {
        pull: "read",
        ...head(),
        ...served,
        ...(readProof === "wrong" ? { note: "that did not answer every probe — here is the document again" } : {}),
        do: 'read the WHOLE document, then pull again answering every probe in `prove` as form: {"read": "<the answers, in one string>"}',
        ...extra(),
      };
    }

    // THE FORM IS BUILT AND HANDED OVER. The agent never looks one up.
    const unmet = (first.demands.evidence_form ?? []).filter((n) => !this.formsMet([n]));
    if (unmet.length > 0) {
      return {
        pull: "fill",
        ...head(),
        ...this.refusedBlock(unmet),
        for: first.to,
        forms: unmet.map((n) => this.formGet(n)),
        do: 'fill every required section, then return it on the next pull as form: {"<section>": "<text>"} — there is no submit verb, and pulling without it hands back this same form',
        ...extra(),
      };
    }

    return undefined;
  }

  /** THE READING PROOF. The last pull served a document and named its tail;
   *  this is the agent handing that tail back. A form carrying `read` is only
   *  ever this, so it never competes with evidence or a choice. A wrong
   *  answer credits nothing and the same document is served again. */
  private takeReadProof(form: Record<string, unknown> | undefined): "ok" | "wrong" | null {
    if (form?.read === undefined || this.pendingRead === null) return null;
    const pending = this.pendingRead;
    const given = this.normWords(String(form.read));
    if (pending.expect.every((e) => given.includes(this.normWords(e)))) {
      this.readBuffer.set(pending.path, pending.hash);
      this.persistSettings();
      this.pendingRead = null;
      return "ok";
    }
    return "wrong";
  }

  /** THE PAYLOAD IS THE SUBMIT THAT HAS NO VERB — the filled form the
   *  LAST pull handed over. WHICH form is never the agent's call:
   *  evidence is expected while a step on the way demands it; a CHOICE
   *  only where the machine offered one (the road split, no target).
   *  Evidence wins when both could read — deterministic, and documented
   *  on the tool. */
  private pullSaveOrChoose(form: Record<string, unknown>): { saved?: Record<string, unknown>; fanOut: string[] } {
    const owed = this.pullFormsOwed();
    if (owed.length > 0) {
      // submit and bless are ACTS, not sections: the save lands the fills
      // first, then each act runs with its own checks and stamps.
      const { submit, bless, ...fills } = form;
      // A CHOICE WHILE A FORM IS OWED IS NOT A FILL (found live 2026-08-06:
      // a backward choice arrived here, was SAVED as a field named "choice"
      // on the owed form, and the walk stood still — accepted, swallowed,
      // repeated). A payload that is ONLY a choice is a move, and it is
      // refused with both sanctioned ends named: fill the owed form to go
      // forward, or reopen the passed state to go back. A form genuinely
      // declaring a field called "choice" is filled with its siblings, so
      // the one-key test lets it through.
      if (fills.choice !== undefined && Object.keys(fills).length === 1) {
        throw new Rejection({
          clause: CLAUSES.NOT_LEGAL_IN_STATE,
          expected: `the owed form (${owed[0]}) — a choice is read only when nothing is owed`,
          got: `a choice (${String(fills.choice)}) while ${owed[0]}'s form is owed — nothing was saved`,
          remedy: {
            tool: "se_reopen",
            args: { state: "<the passed state>", reason: "<why its claim must be re-earned>" },
            note: "to go BACK to a passed state, reopen it — its form is owed again and green re-earns downstream; to go FORWARD, fill the owed form and pull on",
          },
          source: "engine/session.ts pull",
        });
      }
      let saved = this.formSave(owed[0], fills as Record<string, string>);
      if (submit === true || submit === "true" || submit === "yes") saved = this.formDone(owed[0], "agent");
      if (bless !== undefined) saved = this.formBless(owed[0], bless === true || bless === "true" || bless === "yes", "agent");
      return { saved, fanOut: [] };
    }
    if (this._target === "" && form.choice !== undefined) {
      return { fanOut: this.pullPickChoice(form.choice) };
    }
    throw new Rejection({
      clause: CLAUSES.NOT_LEGAL_IN_STATE,
      expected: "a step that asked for a form",
      got: this._target === "" ? "a filled form, but nothing asked for one" : "a filled form, but nothing on the way wants one",
      remedy: { tool: "se_pull", args: {}, note: "pull with no payload — the machine says what it wants before you fill anything" },
      source: "engine/session.ts pull",
    });
  }

  /** A LIST is legal on purpose: the seam for "send three agents, one
   *  per lane" must not be designed shut (owner, 2026-08-01). Only
   *  the first is walked, because one agent is walking — and every
   *  pick must come from the OFFER, because a choice exists only
   *  where the machine asked for one (owner, 2026-08-02). */
  private pullPickChoice(choice: unknown): string[] {
    const offered = this.pullOptions().map((o) => String(o.to));
    const picks = (Array.isArray(choice) ? choice : [choice]).map(String).filter((x) => x !== "");
    if (picks.length === 0) {
      throw new Rejection({
        clause: CLAUSES.REQUIRED_ARGS,
        expected: "a door from the offer, or a list of them",
        got: "an empty choice",
        remedy: { tool: "se_pull", args: {}, note: "pull with no payload to see the offer again" },
        source: "engine/session.ts pull",
      });
    }
    // TAKING A FAN'S OTHER LEG IS A MOVE, not an aim: there is no edge back
    // to it, so no route could ever be drawn.
    const stuck = this.joinStuck();
    if (stuck !== undefined) {
      const leg = stuck.feeders.find((f) => this.qualHere(f) === picks[0]);
      if (leg !== undefined) {
        this.walkBackTo(leg);
        return [];
      }
    }
    const stray = picks.find((p) => !offered.includes(p));
    if (stray !== undefined) {
      throw new Rejection({
        clause: CLAUSES.NOT_LEGAL_IN_STATE,
        expected: `one of the offered doors: ${offered.join(", ")}`,
        got: stray,
        remedy: {
          tool: "se_pull",
          args: {},
          note: "a choice exists only where the machine offered one — pull with no payload and answer from its options",
        },
        source: "engine/session.ts pull",
      });
    }
    this.setTarget(picks[0]);
    return picks.slice(1);
  }

  /** What the sweep's outcome means to the caller: a wall further along the
   *  way is the same law as at the first hop, and an unmet condition arrives
   *  as read or fill — never as a rejection wearing a walk. */
  private pullAfterSweep(
    swept: Record<string, unknown>,
    head: () => Record<string, unknown>,
    extra: () => Record<string, unknown>,
  ): Record<string, unknown> {
    const ref = swept.refusal as { clause?: string; got?: string } | undefined;
    if (ref?.clause === CLAUSES.ABOVE_THRESHOLD) {
      return {
        pull: "wait",
        ...head(),
        walked: swept.swept ?? [],
        waiting_for: "the person",
        at: swept.stopped_at,
        why: ref.got ?? "the next step weighs more than the session autonomy",
        do: "tell them plainly WHICH step waits and STOP — the dial alone cannot wake you, so they must send a message after moving it",
        ...extra(),
      };
    }
    if (ref?.clause === CLAUSES.CONDITION_UNMET) {
      const servedNow = this.serveReading();
      if (servedNow !== null) {
        return {
          pull: "read",
          ...head(),
          walked: swept.swept ?? [],
          ...servedNow,
          ...(swept.banners !== undefined ? { banners: swept.banners } : {}),
          do: 'read the document, then pull again returning its proof as form: {"read": "<the last words>"}',
          ...extra(),
        };
      }
      const formsNow = this.pullFormsOwed().filter((n) => !this.formsMet([n]));
      if (formsNow.length > 0) {
        return {
          pull: "fill",
          ...head(),
          ...this.refusedBlock(formsNow),
          walked: swept.swept ?? [],
          for: swept.stopped_at,
          forms: formsNow.map((n) => this.formGet(n)),
          ...(swept.banners !== undefined ? { banners: swept.banners } : {}),
          do: 'fill every required section, then return it on the next pull as form: {"<section>": "<text>"} — there is no submit verb, and pulling without it hands back this same form',
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
      do:
        swept.refusal !== undefined
          ? "the stopped step says what it wants — do that, then pull again"
          : "do what the guidance asks, then pull again",
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

  /** Entering a GENERATED container's record states binds that record's
   *  worktree — the click IS the pick (owner design 2026-07-27). The walk
   *  may already stand INSIDE the record's own machine when this runs (an
   *  iteration node descends at once), so every frame is checked and the
   *  deepest frame naming a record wins. The parent-return and escape
   *  paths unbind as ever. */
  private autoBind(): void {
    for (let i = this.subs.length - 1; i >= 0; i--) {
      const frame = this.subs[i];
      const gen = frame.gen;
      if (gen === undefined) continue;
      const pos = i === this.subs.length - 1 ? activeStates(frame.instance)[0] : this.subs[i + 1].parentState;
      const boundId = pos === undefined ? undefined : gen.expByState[pos];
      if (boundId === undefined) continue;
      if (this.bound?.id !== boundId) {
        // Only the WORK containers bind — archives browse read-only.
        if (frame.decl.id === "iterations") this.iterationOpen(boundId);
        else if (frame.decl.id === "expeditions") this.expeditionOpen(boundId);
      }
      return;
    }
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
    for (const cid of Session.NESTING_CONTAINERS) {
      if (this.genFor(cid)?.subGen?.[id] !== undefined) return [this.machine.id, cid, id];
    }
    // A drawn sub-machine reads as a child of whatever hangs it, so the
    // breadcrumbs say main > iterations > i1 > enumerate-space rather than
    // dropping the middle two.
    const found = this.drawnHost(id);
    if (found !== undefined && found.host.id !== this.machine.id) return [...this.viewChain(found.host.id), id];
    return [this.machine.id, id];
  }

  /** Every container whose generated machine nests further generated ones.
   *  The list once held only the archives, so BROWSING into an iteration
   *  (the reader's click, walk elsewhere) fell back to the main drawing. */
  private static readonly NESTING_CONTAINERS = ["iterations", "expeditions", "expedition_archive", "iteration_archive"] as const;

  /** Resolve ANY machine id to a viewable drawing: the walked stack
   *  first, then the top-level containers, then their nested generated
   *  sub-machines (archive decades). */
  viewFor(id: string): { decl: MachineDecl; canvas: CanvasData } | undefined {
    const direct = this.generatedView(id);
    if (direct !== undefined) return direct;
    // A STATIC SUB-MACHINE IS A DRAWING, and a drawing is viewable wherever
    // it hangs (owner report 2026-08-08: clicking enumerate-space landed back
    // on the main machine). Every resolver here knew only GENERATED children,
    // so a state whose submachine names a .canvas was invisible to the mirror
    // even though the walk could descend into it.
    const drawn = this.drawnSubmachine(id);
    if (drawn !== undefined) return drawn;
    for (const sub of this.subs) {
      const nested = sub.gen?.subGen?.[id];
      if (nested !== undefined) {
        const g = nested();
        return { decl: g.decl, canvas: g.canvas };
      }
    }
    for (const cid of Session.NESTING_CONTAINERS) {
      const nested = this.genFor(cid)?.subGen?.[id];
      if (nested !== undefined) {
        const g = nested();
        return { decl: g.decl, canvas: g.canvas };
      }
    }
    // A SEEDED CONTAINER INSIDE AN OPEN RECORD RESOLVES WITHOUT A DESCENT
    // (owner report 2026-08-11): the panel colours from trunk, and a fresh
    // session used to grey every sub-machine the walk had not entered — the
    // ripple then greyed everything downstream of it.
    for (const cid of Session.NESTING_CONTAINERS) {
      let gen: GeneratedMachine | undefined;
      try {
        gen = this.genFor(cid);
      } catch {
        continue;
      }
      for (const make of Object.values(gen?.subGen ?? {})) {
        try {
          const nested = make().subGen?.[id];
          if (nested !== undefined) {
            const g = nested();
            return { decl: g.decl, canvas: g.canvas };
          }
        } catch {
          // an ungenerable child colours nothing
        }
      }
    }
    return undefined;
  }

  /** EVERY MACHINE THE MIRROR CAN REACH, main first. The walked stack, then
   *  the containers, then each container's generated children — an
   *  iteration's own machine is one of those, and that is where a matrix row
   *  carrying a drawn sub-machine lives. */
  private reachableMachines(): MachineDecl[] {
    const out: MachineDecl[] = [this.machine, ...this.subs.map((s) => s.decl)];
    for (const cid of Session.NESTING_CONTAINERS) {
      let gen: GeneratedMachine | undefined;
      try {
        gen = this.genFor(cid);
      } catch {
        continue; // a container that will not generate is not a view
      }
      if (gen === undefined) continue;
      out.push(gen.decl);
      for (const make of Object.values(gen.subGen ?? {})) {
        try {
          out.push(make().decl);
        } catch {
          // A child that refuses to generate is not viewable. Not an error
          // here: the walk reports it properly when somebody enters it.
        }
      }
    }
    return out;
  }

  /** The state carrying a drawn sub-machine of this id, and the machine that
   *  owns that state.
   *
   *  ONE NAME ANSWERS FOR BOTH. A drawn sub-machine takes its canvas's name,
   *  so the state's id and the compiled machine's id are the same string —
   *  the rigor matrix refuses a row where they differ. This looked up two
   *  names for a while, which is what tolerating the mismatch costs. */
  private drawnHost(id: string): { host: MachineDecl; ref: string } | undefined {
    for (const m of this.reachableMachines()) {
      for (const s of m.states) {
        const ref = s.submachine;
        if (ref === undefined || !ref.endsWith(".canvas")) continue;
        if (s.id === id) return { host: m, ref };
      }
    }
    return undefined;
  }

  /** A drawn sub-machine, compiled and served as its own view.
   *
   *  THE DRAWING IS GENERATED, NEVER THE AUTHORED COORDINATES (owner ruling
   *  2026-08-08). Serving the authored canvas laid a hand-drawn machine out
   *  left to right while every compiled machine reads top to bottom, and a
   *  fan's AND bar did not read as a bar. One layout, whatever built the
   *  states. */
  private drawnSubmachine(id: string): { decl: MachineDecl; canvas: CanvasData } | undefined {
    const found = this.drawnHost(id);
    if (found === undefined) return undefined;
    try {
      const path = resolveRef(this.root, mainMachinePath(this.root), found.ref);
      const decl = compileMachineCached(this.root, path);
      return { decl, canvas: pinnedCanvas(decl) };
    } catch {
      return undefined;
    }
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
      remedy: {
        tool: "se_pull",
        args: {},
        note: "pull first — the machine says what to do next, and the lane opens as the walk reaches the states that allow it",
      },
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
        remedy: { tool: "se_file_glob", args: { glob: "project/deliverable/machines/forms/*" }, note: "the templates that exist" },
        source: "engine/session.ts forms",
      });
    }
    return parseFormTemplate(name, readFileSync(tplAbs, "utf8"));
  }

  private formHome(name: string): {
    template: FormTemplate;
    instanceAbs: string;
    instanceRel: string;
    evidenceAbs: string;
    evidenceRel: string;
  } {
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
    const recRel = ["project", "spec", "expeditions", this.bound.id];
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
      lint.problems.push(
        `the decision graph holds ${open.length} open point(s) — resolve each (done | obsolete | revert | defer) before the evidence stands`,
      );
      lint.met = false;
    }
    return lint;
  }

  /** Open points of the BOUND record's decision graph — the jsonl is the
   *  source, so the check survives engine reloads. Scoped to the work's
   *  own states. */
  private openRecordPoints(): { id: string; visit: string; brief: string }[] {
    const sid = shortId(this.bound!.id);
    const recorded = replayFile(join(this.bound!.path, "project", "spec", "expeditions", this.bound!.id, "decisions.jsonl"));
    // A VISIT IS RECORDED QUALIFIED ("expeditions/e30@0"), and this compared
    // it against the bare state name. It matched nothing, so the check passed
    // vacuously and every expedition closed so far was never actually looked
    // at — one of them with nineteen open points standing (measured 2026-08-02).
    //
    // A flag computed and never compared is this codebase's recurring defect,
    // and it is invisible precisely because a check that sees nothing reports
    // the same as a check that finds nothing wrong.
    return recorded.open.filter((n) => visitState(n.visit) === sid || visitState(n.visit) === `${sid}-leave`);
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

  /** WHAT THE FORM REFUSES, AND WHAT TO DO — at the top of the answer.
   *
   *  A `fill` that comes back unchanged IS a refusal, and every refusal in
   *  this system carries its remedy. This one did not: the problems sat deep
   *  inside the form model, and a big form is moved to disk by the host, which
   *  hands back a PREVIEW — the head of the JSON. The problems fell in the
   *  part that was dropped, so the only way left was to guess.
   *
   *  IT IS NEVER THE AGENT'S JOB TO ASK WHY (owner ruling 2026-08-07). The
   *  machine holds the verdict, so handing it over is the machine's job — not
   *  a question the agent has to know to ask. */
  refusedBlock(names: string[]): Record<string, unknown> {
    const problems = names.flatMap((n) => {
      try {
        return ((this.formGet(n) as { problems?: string[] }).problems ?? []).map((p) => `${n}: ${p}`);
      } catch {
        return []; // a form that cannot even be read is the pull's own refusal
      }
    });
    if (problems.length === 0) return {};
    return {
      refused: {
        why: "the form is not met, so the submit did not stamp",
        problems,
        fix: "each line names ONE field and what it wants. Fix those, then pull again with only the corrected sections — nothing else needs re-sending.",
      },
    };
  }

  formGet(name: string, machineId?: string): Record<string, unknown> {
    const fm = this.formMachine(machineId);
    if (this.isStateForm(name, fm)) return this.stateFormGet(name, fm);
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

  /** A WRITE IS WHAT CHANGES WHICH CLAIMS STAND, so it is the one event the
   *  route memo has to hear about. Clearing it here keeps the objective
   *  honest without making every read recompute green.
   *
   *  THE VERDICT CACHE CLEARS WITH IT. Its key covers the corpus, the body
   *  and the form — but trace-design's law reads the ENGINE TREE, an input
   *  no key covers. A dead file deleted after a red verdict served that red
   *  forever (found 2026-08-11, the walk wedged at a green state). */
  forgetRoute(): void {
    this.routeMemo = undefined;
    Session.VERDICTS.clear();
  }

  formSave(name: string, fields: Record<string, string>, by = "agent", machineId?: string): Record<string, unknown> {
    this.forgetRoute();
    const fm = this.formMachine(machineId);
    if (this.isStateForm(name, fm)) return this.stateFormSave(name, fields, by, fm);
    const h = this.formHome(name);
    let raw = existsSync(h.instanceAbs) ? readFileSync(h.instanceAbs, "utf8") : scaffoldInstance(h.template, `${this.bound?.id} — ${name}`);
    for (const [f, content] of Object.entries(fields)) raw = withFieldContent(raw, f, String(content));
    mkdirSync(dirname(h.instanceAbs), { recursive: true });
    writeFileSync(h.instanceAbs, raw, "utf8");
    this.notifyChange();
    return this.formGet(name);
  }

  formConfirm(name: string, field: string, index: number, machineId?: string): Record<string, unknown> {
    const fm = this.formMachine(machineId);
    if (this.isStateForm(name, fm)) {
      const sh = this.stateFormHome(name, fm);
      if (existsSync(sh.instanceAbs)) {
        writeFileSync(sh.instanceAbs, confirmPrefill(readFileSync(sh.instanceAbs, "utf8"), field, index), "utf8");
        this.notifyChange();
      }
      return this.stateFormGet(name, fm);
    }
    const h = this.formHome(name);
    if (existsSync(h.instanceAbs)) {
      writeFileSync(h.instanceAbs, confirmPrefill(readFileSync(h.instanceAbs, "utf8"), field, index), "utf8");
      this.notifyChange();
    }
    return this.formGet(name);
  }

  formDone(name: string, by: Channel, machineId?: string): Record<string, unknown> {
    this.forgetRoute();
    const fm = this.formMachine(machineId);
    if (this.isStateForm(name, fm)) {
      this.assertStateFormActive(name, fm, "submit");
      // SUBMIT is the checking act: an unmet form THROWS, so the log line
      // wears the ✗ and carries the why — the details stay the definition.
      const sh = this.stateFormHome(name, fm);
      const before = this.stateFormGet(name, fm) as { met?: boolean; problems?: string[] };
      if (!existsSync(sh.instanceAbs) || before.met !== true) {
        throw new Rejection({
          clause: CLAUSES.CONDITION_UNMET,
          expected: `every check green on ${name} — submit stamps only a standing claim`,
          got: (before.problems ?? []).join(" · ") || "nothing saved yet",
          remedy: { tool: "se_pull", args: {}, note: "fix the named fields, save, submit again" },
          source: "engine/session.ts stateform",
        });
      }
      const feeders = this.feedersUnsigned(fm, this.stateFormState(name, fm));
      if (feeders.length > 0) {
        throw new Rejection({
          clause: CLAUSES.CONDITION_UNMET,
          expected: `a state requires ALL its inputs — every feeder form signed before ${name} may stamp`,
          got: `unsigned feeders: ${feeders.join(", ")}`,
          remedy: { tool: "se_pull", args: {}, note: "walk the named states and submit their forms; this one stamps after" },
          source: "engine/session.ts stateform",
        });
      }
      writeFileSync(sh.instanceAbs, withBy(withSignedOff(readFileSync(sh.instanceAbs, "utf8"), new Date().toISOString()), by), "utf8");
      this.notifyChange();
      return this.stateFormGet(name, fm);
    }
    const h = this.formHome(name);
    if (!existsSync(h.instanceAbs)) {
      throw new Rejection({
        clause: CLAUSES.CONDITION_UNMET,
        expected: `an instance at ${h.instanceRel}`,
        got: "no instance yet",
        remedy: {
          tool: "se_file_write",
          args: { path: h.instanceRel, content: "<the filled page>", base_hash: null },
          note: "write the page (or save it from the mirror), then set it done",
        },
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

  // ── State forms (owner rulings 2026-08-04): form = f(state), stored ──

  /** ANY state's form is always fetchable (owner ruling 2026-08-04) —
   *  for export to a colleague wherever the walk stands. The machine on
   *  display resolves the name; the walk's machine is the default. */
  private formMachine(machineId?: string): MachineDecl {
    if (machineId === undefined || machineId === "" || machineId === this.currentMachine().id) return this.currentMachine();
    return this.viewFor(machineId)?.decl ?? this.currentMachine();
  }

  /** The dispatch between the two form kinds: a state of the machine on
   *  display with evidence fields, unshadowed by a named template. */
  private isStateForm(name: string, m: MachineDecl = this.currentMachine()): boolean {
    if (existsSync(join(this.root, formTemplatePath(name)))) return false;
    return m.states.some((s) => s.id === name && s.evidence_form.length > 0);
  }

  /** Where the instance lives: the record whose machine carries the state
   *  (its evidence folder ON ITS BRANCH), the bound record as fallback,
   *  or the session store when neither exists. */
  private stateFormHome(name: string, m: MachineDecl = this.currentMachine()): { instanceAbs: string; instanceRel: string } {
    const it = itList(this.root).find((x) => x.open && itShortId(x.id) === m.id);
    if (it !== undefined) {
      const rel = `project/spec/iterations/${it.id}/evidence/${name}.md`;
      return { instanceAbs: join(it.path, rel), instanceRel: rel };
    }
    if (this.bound !== undefined) {
      const kind = this.bound.branch.startsWith("it/") ? "iterations" : "expeditions";
      const rel = `project/spec/${kind}/${this.bound.id}/evidence/${name}.md`;
      return { instanceAbs: join(this.workRoot(), rel), instanceRel: rel };
    }
    const rel = `.se/forms/${name}.md`;
    return { instanceAbs: join(this.root, rel), instanceRel: rel };
  }

  private stateFormState(name: string, m: MachineDecl = this.currentMachine()): StateDecl {
    const s = m.states.find((x) => x.id === name);
    if (s === undefined) {
      throw new Rejection({
        clause: CLAUSES.NOT_LEGAL_IN_STATE,
        expected: `a state of ${m.id} with an evidence form`,
        got: name,
        remedy: { tool: "se_pull", args: {}, note: "the walk's own states carry the forms" },
        source: "engine/session.ts stateform",
      });
    }
    return s;
  }

  private brandName(): string {
    try {
      const b = JSON.parse(readFileSync(join(this.root, "project", "deliverable", "brand", "brand.json"), "utf8")) as { name?: string };
      return typeof b.name === "string" ? b.name : "se";
    } catch {
      return "se";
    }
  }

  private stateFormHeader(name: string, raw: string | undefined, m: MachineDecl = this.currentMachine()): Record<string, string> {
    const fm = raw === undefined ? ({} as Record<string, unknown>) : parseStateNote(raw).frontmatter;
    // The priority wears its RUNG NAME (owner ruling 2026-08-04) — the
    // numerical scale stays internal.
    const s = m.states.find((st) => st.id === name);
    return {
      project: this.brandName(),
      state: `${m.id}/${name}`,
      ...(s !== undefined ? { level: levelName(loadLevels(this.root), s.priority) } : {}),
      ...(this.bound !== undefined ? { record: this.bound.id } : {}),
      "signed off": typeof fm.signed_off === "string" ? fm.signed_off.slice(0, 10) : "",
      by: typeof fm.by === "string" ? fm.by : "",
    };
  }

  /** Every trace node's id against the path that holds it, root-relative —
   *  what a surface needs to turn a reference into something clickable. */
  /** WHERE THE TRACE CORPUS IS READ FROM. ONE answer, for every reader.
   *
   *  It used to be two. The form check read the project root while the walk
   *  WROTE to the bound record's worktree, so a node the lane had just
   *  authored resolved to nothing — and the green light read the root as
   *  well, so a form could pass its own submit while the state stayed grey.
   *  Two readers, one path, two answers, and nothing caught it.
   *
   *  The value is the root of the RECORD BEING CHECKED, because a standing
   *  artifact lands on trunk when its record closes and lives in that
   *  record's worktree until then (owner ruling 2026-08-06).
   *
   *  IT IS THE RECORD'S ROOT, NEVER THE SESSION'S BINDING. The green light
   *  runs for an iteration whether or not the walk is standing in it — the
   *  mirror renders from the desk — so reading the corpus from wherever the
   *  session happens to be bound made the same claim green from inside the
   *  record and grey from outside it. */
  private traceRoot(it?: Iteration): string {
    return it?.path ?? this.workRoot();
  }

  private refPaths(it?: Iteration): Record<string, string> {
    const out: Record<string, string> = {};
    const root = this.traceRoot(it);
    try {
      // THE PATH IS WRITTEN FROM THE PROJECT ROOT, because the HOST opens it
      // from there. A node living in a record's worktree comes out under
      // .worktrees/, which opens. The record-relative path LOOKED right and
      // pointed into the wrong tree, so every link on an open record's form
      // reported a file that is not there.
      for (const n of loadTrace(root)) {
        if (n.file !== undefined) out[n.id] = relative(this.root, n.file).split(sep).join("/");
      }
    } catch {
      // no corpus, no links — the ids still read
    }
    // THE METHOD CARDS TOO, so a [[link]] in guidance is a link. A pointer
    // the reader cannot follow is decoration: it costs a line, teaches the
    // name of a file, and leaves them to find it by hand.
    for (const dir of ["methods", "items", "forms/templates", "lint"]) {
      const abs = join(this.root, "project", "deliverable", "machines", ...dir.split("/"));
      try {
        for (const e of readdirSync(abs)) {
          if (!e.endsWith(".md")) continue;
          const id = e.replace(/\.md$/, "");
          // A TRACE NODE WINS. Its path is the record's own copy, and that is
          // the one the reader means when both exist.
          if (out[id] === undefined) out[id] = `project/deliverable/machines/${dir}/${e}`;
        }
      } catch {
        // a folder that is not there contributes nothing
      }
    }
    return out;
  }

  /** The id→path map for a DOCUMENT's own record — the /doc renderer's
   *  wiki-link pass (owner report 2026-08-09: a [[cand-…]] in a free-form
   *  field rendered as dead text). A doc under a record resolves that
   *  record's corpus; everything else reads the working root's. */
  docRefPaths(p: string): Record<string, string> {
    try {
      const m = /(?:^|[\\/])iterations[\\/]([^\\/]+)[\\/]/.exec(p) ?? /(?:^|[\\/])\.worktrees[\\/]([^\\/]+)[\\/]/.exec(p);
      const own =
        m === null
          ? undefined
          : itList(this.root)
              .filter((x) => x.open)
              .find((x) => x.id === m[1]);
      return this.refPaths(own);
    } catch {
      return {};
    }
  }

  /** WHAT A CARD NEEDS TO JUDGE BY, per node. The statement is what the row
   *  demands; breaks_if_removed is what losing it costs. Those two carry the
   *  judgment, and everything else is one click away behind the link. */
  private refFacts(it?: Iteration): Record<string, { statement: string; breaks_if_removed: string; name: string; coupling: string }> {
    const out: Record<string, { statement: string; breaks_if_removed: string; name: string; coupling: string }> = {};
    try {
      for (const n of loadTrace(this.traceRoot(it))) {
        if (n.file === undefined) continue;
        out[n.id] = {
          statement: n.statement,
          breaks_if_removed: nodeField(n.file, "breaks_if_removed"),
          name: nodeField(n.file, "name"),
          coupling: nodeField(n.file, "coupling"),
        };
      }
    } catch {
      // no corpus, no facts — the card still renders its ids
    }
    return out;
  }

  /** The READ half of a bound field: one line per listed node, carrying that
   *  node's own frontmatter value. Empty where the node has none, which is
   *  precisely what makes the per-item check refuse the submit. */
  private bindView(
    s: StateDecl,
    model: { field_args: Record<string, { items: string[]; columns: string[] }> },
    m: MachineDecl,
  ): Record<string, string> {
    const bound = s.evidence_form.filter((f) => f.template === "node-table");
    if (bound.length === 0) return {};
    const byId = new Map(loadTrace(this.traceRoot(this.declIteration(m))).map((n) => [n.id, n]));
    const out: Record<string, string> = {};
    for (const f of bound) {
      const cols = model.field_args[f.name]?.columns ?? [];
      const head = [`| ${f.of ?? "node"} | ${cols.join(" | ")} |`, `| ${["---", ...cols.map(() => "---")].join(" | ")} |`];
      const rows = (model.field_args[f.name]?.items ?? []).map((id) => {
        const file = byId.get(id)?.file;
        // A LIST-VALUED KEY reads empty through the scalar reader, so the
        // list reader answers where the scalar one has nothing — joined
        // with · for the one-line cell, split on it by the write half.
        const cells = cols.map((c) => {
          if (file === undefined) return "";
          const scalar = nodeField(file, c);
          const v = scalar !== "" ? scalar : nodeList(file, c).join(" · ");
          return v.replace(/\|/g, "\\|");
        });
        return `| [[${id}]] | ${cells.join(" | ")} |`;
      });
      out[f.name] = [...head, ...rows].join("\n");
    }
    return out;
  }

  stateFormGet(name: string, m: MachineDecl = this.currentMachine()): Record<string, unknown> {
    const s = this.stateFormState(name, m);
    const h = this.stateFormHome(name, m);
    const raw = existsSync(h.instanceAbs) ? readFileSync(h.instanceAbs, "utf8") : undefined;
    const model = stateFormModel(
      this.root,
      scanGuidance(this.root),
      m,
      s,
      this.stateFormHeader(name, raw, m),
      raw,
      this.traceRoot(this.declIteration(m)),
      h.instanceAbs,
    );
    // The section lint plus the TEMPLATE checks — generic engine code,
    // configured per field in the templates' own markdown. One verdict
    // for both hands: the page's problems list and the gate's refusal.
    // The named-form lint judges a status line; state forms have none —
    // a synthetic one keeps the SECTION checks and mutes the dead field.
    // A LEGACY instance may still carry its own; never inject a second.
    const lint = lintForm(
      model.template,
      raw === undefined || /^status: /m.test(raw) ? raw : raw.replace(/^---\n/, "---\nstatus: done\n"),
      "",
    );
    const fills: Record<string, string> = {};
    if (raw !== undefined) {
      const body = parseStateNote(raw).body;
      for (const f of model.template.fields) fills[f.name] = stripComments(section(body, f.name)).trim();
    }
    // A BOUND FIELD IS REBUILT FROM THE NODES, and whatever the file holds is
    // ignored. That is the read half of the two-way view: edit the note and
    // the form agrees at the next look, with nothing to synchronise.
    //
    // It also settles the check. `met` asks whether every line has an answer,
    // and the lines now come from the register — so the state stands exactly
    // while every standing node carries its frontmatter, which is the claim
    // the state was making all along.
    const boundFills = this.bindView(s, model, m);
    Object.assign(fills, boundFills);
    // THE FORM'S OWN RECORD, not the session's binding. The mirror renders an
    // iteration's form from the desk with nothing bound, so resolving against
    // the binding made a node the record owns invisible on screen while the
    // same form passed its submit from inside the walk.
    const forIt = this.declIteration(m);
    const tp = templateProblems(model, fills, this.traceRoot(forIt));
    const fmData = raw === undefined ? ({} as Record<string, unknown>) : parseStateNote(raw).frontmatter;
    return {
      state_form: true,
      ...model,
      // A REFERENCE IS AN ADDRESS, so the surface can open it. Without the
      // path the reader sees an id and has to go hunting for the file it
      // names, which is the whole reason references were hard to review.
      ref_paths: this.refPaths(forIt),
      // AND THE FACTS BEHIND THEM. A card asking which of two rows matters
      // more cannot be answered from two ids, and opening both notes for
      // every question is how a sixty-pair pass becomes a two-hour errand.
      ref_facts: this.refFacts(forIt),
      machine: m.id,
      checked: this.stateFormChecked(raw),
      active: this.stateFormActive(name, m),
      gate: s.kind === "gate",
      // A present-but-EMPTY signed_off is unsigned. Reading the key's mere
      // presence as a stamp is the same defect as withSignedOff's, mirrored.
      signed: typeof fmData.signed_off === "string" && fmData.signed_off.trim() !== "",
      // THE SIGNATURE SURVIVES A REOPEN, so the two are reported apart. The
      // page still shows who signed and when; `reopened_after` is what makes
      // the form owed again and the state grey.
      reopened: typeof fmData.reopened === "string" ? fmData.reopened : "",
      reopened_after: reopenedAfterSigning(fmData),
      // A RECHECK IS NOT A REWRITE (owner ruling 2026-08-07). A reopened claim
      // arrived looking exactly like a fresh one, so the agent answered it from
      // scratch — re-deriving evidence that had already been earned and signed.
      //
      // THE PACKET NOW SAYS WHICH IT IS. The body is still on the file, the
      // signature is still on the file, and the only open question is whether
      // the named change moved any of it. Where it did not, the submit IS the
      // rebless: it re-runs every check and stamps a newer signature, and the
      // newer signature clears the mark by itself.
      //
      // THE CHECKS ARE NOT SKIPPED and cannot be. A submit refuses unless every
      // condition is green against the corpus AS IT NOW STANDS, so a claim the
      // change did break cannot be waved through by calling it a recheck.
      recheck: reopenedAfterSigning(fmData)
        ? {
            was_signed: typeof fmData.signed_off === "string" ? fmData.signed_off : "",
            why: typeof fmData.reopened === "string" ? fmData.reopened : "",
            do: "THIS CLAIM STOOD BEFORE. Read what is already written, decide only whether the change above moved it, and submit if it still holds. Rewrite ONLY the fields the change actually touched. Submitting re-runs every check and re-signs.",
          }
        : undefined,
      amended: typeof fmData.amended === "string" ? fmData.amended : "",
      bless: typeof fmData.bless === "string" ? fmData.bless : "",
      instance: h.instanceRel,
      exists: raw !== undefined,
      ...lint,
      // THE BOUND FIELDS REACH THE SURFACE TOO. The lint reads the raw file,
      // which for a bound field holds nothing — the derived table is the
      // content, and without this override the mirror drew every cell empty.
      fields: lint.fields.map((f) =>
        boundFills[f.name] === undefined ? f : { ...f, content: boundFills[f.name], filled: boundFills[f.name].trim() !== "" },
      ),
      problems: [...lint.problems, ...tp],
      met: lint.met && tp.length === 0,
    };
  }

  /** GREEN FROM THE RECORD (owner ruling 2026-08-04): a record-backed
   *  state is done when its stored claim STANDS — signed, and blessed
   *  where it is a gate. Session runs die with the engine life; the
   *  record does not. States without records stay uncoloured. */
  /** Where a state's stored claim lives, in the record's own worktree. */
  private evidenceAbs(it: Iteration, state: string): string {
    return join(it.path, `project/spec/iterations/${it.id}/evidence/${state}.md`);
  }

  /** WHAT STANDS ON ITS OWN MERIT — computed from the file, every time.
   *
   *  Three things, and nothing is remembered between looks:
   *
   *  - a signature is present,
   *  - the claim still passes its own form NOW, not merely once,
   *  - and where it is a gate, the bless stands.
   *
   *  A stamp says it passed once. Green says it passes now. */
  /** Claim verdicts, keyed to their inputs. Module-scoped on purpose: it is a
   *  pure function of (corpus, body, form), so two sessions on one root reach
   *  the same answer and there is nothing session-shaped about it. */
  private static readonly VERDICTS = new Map<string, boolean>();

  private standingClaims(decl: MachineDecl, it: Iteration, claimful: Set<string>, pass: GreenPass, paint = false): Set<string> {
    // THE CORPUS IS LOADED ONCE, NOT ONCE PER STATE. claimProblems takes it as
    // an argument for exactly this reason and recordDone was not passing it,
    // so every claimful state re-read the whole trace — about fifteen full
    // corpus loads per paint.
    //
    // That was survivable while recordDone only ran when something painted. It
    // stopped being survivable the moment the ROUTE started calling it, which
    // put it on every packet: se_aim measured 2936 ms and the next pull never
    // returned. The engine is single-threaded, so a synchronous scan that long
    // does not slow the server down — it stops it answering.
    const traceRoot = this.traceRoot(it);
    // ONCE PER OPERATION, not once per machine. Both of these sweep the whole
    // corpus; the pass carries them so the sweep happens on the first machine
    // and nowhere after it.
    pass.corpus ??= new Map();
    let corpus = pass.corpus.get(traceRoot);
    if (corpus === undefined) {
      corpus = loadTrace(traceRoot);
      pass.corpus.set(traceRoot, corpus);
    }
    // THE VERDICT IS KEYED TO ITS INPUTS — v1's adr-verdict-cache, reapplied
    // (owner ruling 2026-08-09). Stamping the corpus took entering an
    // iteration from 274 s to 66 s; the rest is THIS check, re-run for every
    // claimful state, for every machine, at every hop of the walk.
    //
    // A CHECK WHOSE INPUTS HAVE NOT MOVED HAS NOT CHANGED ITS MIND. The inputs
    // are the corpus, the claim's own body, and the form the state declares.
    // All three are in the key, so an edit to any of them recomputes and
    // nothing else does.
    pass.version ??= new Map();
    let version = pass.version.get(traceRoot);
    if (version === undefined) {
      version = corpusVersion(traceRoot);
      pass.version.set(traceRoot, version);
    }
    const standing = new Set<string>();
    for (const s of decl.states) {
      if (!claimful.has(s.id)) continue;
      const abs = this.evidenceAbs(it, s.id);
      if (!existsSync(abs)) continue;
      try {
        const note = noteOf(abs);
        if (note === undefined) continue;
        const fm = note.frontmatter;
        if (typeof fm.signed_off !== "string") continue;
        // A REOPEN IS THE FOURTH WAY A CLAIM STOPS STANDING. The other three
        // are the claim's own doing; this one is somebody deciding it must be
        // re-earned. The downstream ripple is free — the fixed point below
        // drops everything fed by a state that just left this set.
        if (reopenedAfterSigning(fm)) continue;
        const key = [traceRoot, s.id, version, contentHash(note.body), contentHash(JSON.stringify(s.evidence_form))].join("\0");
        let failed = Session.VERDICTS.get(key);
        if (failed === undefined) {
          // this.traceRoot(it) IN FULL, not the local. A guard test greps for
          // exactly this spelling, because a claim check resolving against
          // the wrong record is the drift it exists to catch.
          failed = claimProblems(this.traceRoot(it), s, note.body, corpus).length > 0;
          Session.VERDICTS.set(key, failed);
        }
        if (failed) continue;
        // GREEN MEANS SUBMITTED (owner ruling 2026-08-11): for the PAINT a
        // signed gate whose checks stand is green, and the bless rides as
        // the thumbs-up mark. The ROUTE keeps demanding the bless — an
        // unblessed gate is still the walk's next objective.
        if (!paint && s.kind === "gate" && !(typeof fm.bless === "string" && fm.bless.startsWith("blessed"))) continue;
        standing.add(s.id);
      } catch {
        // an unreadable claim colours nothing
      }
    }
    for (const id of this.lawProvenClaims(decl, it, corpus, version, traceRoot)) standing.add(id);
    return standing;
  }

  /** A LAW-PROVEN STATE HAS NO FORM TO SIGN — its claim IS its law
   *  (rigor-matrix's refuseBadRow names the set). Green is the law passing,
   *  recomputed against the corpus like any other verdict. */
  private lawProvenClaims(
    decl: MachineDecl,
    it: Iteration,
    corpus: ReturnType<typeof loadTrace>,
    version: string,
    traceRoot: string,
  ): Set<string> {
    const standing = new Set<string>();
    for (const s of decl.states) {
      if (s.evidence_form.length > 0 || s.submachine !== undefined) continue;
      if (!s.id.endsWith("fill-story-evidence")) continue;
      const key = [traceRoot, s.id, version, "law-only"].join("\0");
      let failed = Session.VERDICTS.get(key);
      if (failed === undefined) {
        failed = claimProblems(this.traceRoot(it), s, "", corpus).length > 0;
        Session.VERDICTS.set(key, failed);
      }
      if (!failed) standing.add(s.id);
    }
    return standing;
  }

  /** GREEN IS CALCULATED, NEVER STORED (owner ruling 2026-08-07, v1's design).
   *
   *  THE FAILURE THIS ENDS. A `suspect:` line used to be WRITTEN into a claim
   *  when an input moved, and writing it STRIPPED the signature, the author
   *  and the bless. Two things went wrong with that, and both were seen live:
   *
   *  - A derived value on disk goes stale. It was written by a pass that runs
   *    at some moments and not others, so between them the file and the truth
   *    disagreed. States painted green that had fallen, and one that had not
   *    fallen painted grey.
   *  - It destroyed the one fact that genuinely had to be stored. A signature
   *    is a person's act. A computed check may refuse to paint it green; it
   *    may never erase it. One claim lost its signature to a merge and no
   *    longer says who signed it or when.
   *
   *  v1 SETTLED THIS AND WE DRIFTED OFF IT. adr-verdict-cache, at ref main:
   *  verdicts live keyed by input hash outside the spec, because "a cache is
   *  never truth and the repo must stay cache-free". adr-evidence-hash: the
   *  gate folds its evidence hash into its own, so editing blessed evidence
   *  flips it suspect — a COMPARISON made at look time, never a written mark.
   *
   *  So there is nothing to go stale here. Every look recomputes. */
  /** IS THIS CONTAINER'S DRAWING FINISHED? Every claim inside it stands, and
   *  every container inside it is finished too.
   *
   *  A CONTAINER IS A CLAIM LIKE ANY OTHER (owner ruling 2026-08-09). It used
   *  to be painted by the RENDERER, from its own interior, with no regard for
   *  its inputs — so enumerate-space drew green while derive-criteria feeding
   *  it drew grey. Green that ignores the ripple is not green. It is a second
   *  rule, and two rules is how the drawing came to contradict itself.
   *
   *  IT NESTS BY CONSTRUCTION, because it asks recordDone, which asks this
   *  again for whatever containers that machine holds. */
  private drawingDone(id: string, seen: Set<string>, pass: GreenPass, paint = false): boolean {
    if (seen.has(id)) return false; // a cycle proves nothing
    seen.add(id);
    // AN UNSEEDED DRAWING PROVES NOTHING, and asking for one THROWS: viewFor
    // raises the typed refusal that tells an agent to seed it. That refusal is
    // right where the walk asked to enter, and wrong here — this is only
    // colouring a box, and a question about green must never take the walk
    // down with it.
    let sub: MachineDecl | undefined;
    try {
      sub = this.viewFor(id)?.decl;
    } catch {
      return false;
    }
    if (sub === undefined) return false;
    const done = new Set(this.recordDone(sub, seen, pass, paint));
    for (const s of sub.states) {
      if (s.evidence_form.length === 0 && s.submachine === undefined) continue;
      if (!done.has(s.id)) return false;
    }
    // AN EMPTY DRAWING IS VACUOUSLY FINISHED (owner ruling 2026-08-11). Zero
    // spikes is a sanctioned outcome, and returning provable-only made the
    // empty spike machine an unmet feeder forever: run-spikes drew grey, the
    // ripple knocked signed fold-back out of green, the objective pinned on
    // the standing state and the route to gate-prototype computed empty. The
    // ripple still guards a vacuous container through its own feeders, and an
    // UNSEEDED drawing still proves nothing — viewFor throws above.
    return true;
  }

  /** COLLECT THE INPUT ONCE, PROCESS, OUTPUT (owner ruling 2026-08-09,
   *  software.md). One operation — a route, a render, a pull — makes ONE of
   *  these and hands it down. Every machine and every container it touches
   *  reads the same corpus and the same version out of it.
   *
   *  WHAT IT REPLACES. Entering one record asked for the same 328-node corpus
   *  SIXTY-SIX times, because each hop asked what was green and each green pass
   *  fetched its own inputs. Stamping made each ask cost 4 ms instead of 300 —
   *  and left the sixty-six.
   *
   *  IT IS A PARAMETER, NOT A CACHE, and that is the point. It lives on the
   *  stack for one operation, so it cannot outlive its inputs, cannot go stale
   *  and needs no invalidation. It is the version of a cache that cannot be
   *  wrong — unlike the two I built today that could. */
  static newPass(): GreenPass {
    return { done: new Map() };
  }

  recordDone(decl: MachineDecl, seen: Set<string> = new Set(), pass: GreenPass = Session.newPass(), paint = false): string[] {
    const memoKey = paint ? `${decl.id}\0paint` : decl.id;
    const memo = pass.done.get(memoKey);
    if (memo !== undefined) return memo;
    const it = this.declIteration(decl);
    if (it === undefined) return [];
    // THE RIPPLE COVERS CONTAINERS TOO, so claimFeeders must not look THROUGH
    // one. A container carries no evidence of its own and used to read as a
    // waypoint, which is what let the objective skip a whole sub-machine.
    const claimful = new Set(decl.states.filter((s) => s.evidence_form.length > 0).map((s) => s.id));
    const green = this.standingClaims(decl, it, claimful, pass, paint);
    for (const s of decl.states) {
      if (s.submachine === undefined) continue;
      claimful.add(s.id);
      if (this.drawingDone(s.id, seen, pass, paint)) green.add(s.id);
    }
    // GREEN STOPS AT THE FIRST INPUT THAT IS NOT GREEN. This is the ripple,
    // and it is a graph walk rather than a mark on a file. A claim may be word
    // for word fine and still rest on ground that moved.
    //
    // Run to a FIXED POINT: knocking one out can knock out what stood on it.
    for (let changed = true; changed; ) {
      changed = false;
      for (const id of [...green]) {
        if (claimFeeders(decl, id, claimful).every((f) => green.has(f))) continue;
        green.delete(id);
        changed = true;
      }
    }
    const done = [...green];
    // The mechanical start was necessarily walked on the way to any claim.
    if (done.length > 0) done.push("start");
    pass.done.set(memoKey, done);
    return done;
  }

  /** The panel's colour truth: green means SUBMITTED (owner ruling
   *  2026-08-11) — a signed gate paints before its bless, and the bless
   *  rides as the thumbs-up. The route never reads this. */
  recordPaint(decl: MachineDecl): string[] {
    return this.recordDone(decl, new Set(), Session.newPass(), true);
  }

  /** The gates whose claims carry a bless — the thumbs-up overlay's truth. */
  blessedGates(decl: MachineDecl): string[] {
    const it = this.declIteration(decl);
    if (it === undefined) return [];
    const out: string[] = [];
    for (const s of decl.states) {
      if (s.kind !== "gate") continue;
      try {
        const fm = noteOf(this.evidenceAbs(it, s.id))?.frontmatter;
        if (fm !== undefined && typeof fm.signed_off === "string" && typeof fm.bless === "string" && fm.bless.startsWith("blessed"))
          out.push(s.id);
      } catch {
        // an unreadable claim marks nothing
      }
    }
    return out;
  }

  /** THE ITERATION THIS MACHINE BELONGS TO, if there is one and it is open.
   *
   *  IT USED TO ASK WHETHER THE DECL *IS* AN ITERATION (2026-08-09). That is
   *  true of `i1` and false of every drawn sub-machine inside it, so for
   *  `enumerate-space` it returned undefined, recordDone returned an empty
   *  green set, and NOTHING INSIDE A SUB-MACHINE WAS EVER GREEN.
   *
   *  The walk then pinned its objective on the sub-machine's first state
   *  forever. Seven finder forms stood signed and the join above them would
   *  not open, because the router could not see that any of them was done. */
  private declIteration(decl: MachineDecl): Iteration | undefined {
    if (decl.id === this.machine.id) return undefined;
    try {
      const open = itList(this.root).filter((x) => x.open);
      const own = open.find((x) => itShortId(x.id) === decl.id);
      if (own !== undefined) return own;
      // A SUB-MACHINE BELONGS TO WHATEVER RECORD IS BOUND. Its evidence lands
      // in that record's folder, which is exactly where the green check looks.
      const boundId = this.bound?.id;
      const bound = boundId === undefined ? undefined : open.find((x) => x.id === boundId);
      if (bound !== undefined) return bound;
      // FROM THE DESK NOTHING IS BOUND, and the bound fallback alone left a
      // drawn sub-machine's whole interior grey when browsed from trunk
      // (owner report 2026-08-09: i1 read "not done" though its claims stood).
      // The host chain answers instead: whichever machine carries this drawing
      // as a state, climbed until one of them IS an open iteration.
      const all = this.reachableMachines();
      let at = decl.id;
      for (let hop = 0; hop < 8; hop++) {
        const host = all.find((h) => h.states.some((s) => s.submachine !== undefined && s.id === at));
        if (host === undefined) return undefined;
        const under = open.find((x) => itShortId(x.id) === host.id);
        if (under !== undefined) return under;
        at = host.id;
      }
      return undefined;
    } catch {
      return undefined; // no git, no records — nothing to check
    }
  }

  /** THE DRIFT (owner ruling 2026-08-05): which states were passed against a
   *  demand that has since moved, plus everything downstream of them.
   *
   *  GREEN MUST MEAN STILL GREEN NOW. The demand diff used to run only when a
   *  pin was rewritten, and a pin is only rewritten on an escalation. So
   *  editing a matrix row under a standing iteration changed what its steps
   *  ask for and left every one of them green against a question that no
   *  longer existed.
   *
   *  IT WRITES NOTHING. Somebody opening the machine to look must never
   *  change the record, so the view calls this and paints. The walk calls
   *  driftReopen, which is the only writer.
   *
   *  ONE WORD FOR ONE IDEA. A trace node standing on moved ground is suspect
   *  too, by the same mechanism and wearing the same mark — see
   *  trace.ts traceSuspects. */
  suspectStates(decl: MachineDecl): string[] {
    const it = this.declIteration(decl);
    if (it === undefined) return [];
    const moved = iterationDrift(this.root, it).filter((id) => decl.states.some((s) => s.id === id));
    if (moved.length === 0) return [];
    // ONLY A PASS CAN LAPSE (owner, 2026-08-05). The cone runs to the end of
    // the machine, and most of it was never walked. Emptying those cards
    // marks steps that had nothing to lose and drowns the ones that did —
    // seen live, as the whole tail of the machine going blank at once.
    const green = new Set(this.recordDone(decl));
    const cone = downstreamCone(decl, moved);
    return [...green].filter((id) => cone.has(id));
  }

  /** THE WRITER'S HALF: the walk arrives, so the drift stops being a mark on
   *  a picture and becomes an actual reopen. Reusing rewalk means the drift
   *  and the escalation reopen by exactly one mechanism.
   *
   *  Nothing to reopen is the normal case and costs one hash. */
  private driftReopen(): void {
    const run = this.top();
    if (run === undefined) return;
    const it = this.declIteration(run.decl);
    if (it === undefined) return;
    // NO STALE PASS ANY MORE. It used to walk every claim and WRITE a suspect
    // mark onto the ones that had stopped passing. recordDone re-runs those
    // same form checks on every look, so the mark bought nothing and cost a
    // signature each time it fired.
    // THE PIN CATCHES UP WHENEVER THE MATRIX MOVED, and steps reopen only
    // where a demand moved with it. Returning early on an empty reopen list
    // left the record walking a snapshot taken before the correction, which
    // is how i3 kept skipping a state the column already required.
    if (!pinIsStale(this.root, it)) return;
    const moved = iterationDrift(this.root, it);
    // ONLY A STANDING CLAIM CAN BE REOPENED, and standing is the RECORD's
    // word, not this session's. Reading the instance's own history instead
    // meant a drift could only ever reopen steps filled since the last engine
    // start — so after a restart, nothing reopened at all.
    const done = new Set(this.recordDone(run.decl));
    const owed = moved.filter((id) => done.has(id));
    if (owed.length > 0) this.rewalk({ reopened: owed }, "the rigor matrix moved under the pin");
    // CONSUME IT EITHER WAY. The walk has now seen this move, whether or not
    // anything was standing to reopen. Leaving the pin stale would re-fire it
    // on the next pull, and the re-earned step would reopen forever.
    repinColumn(this.root, it);
    // The frame under the walk's feet is the OLD machine until it is swapped,
    // so the reopened step would still serve the form it was reopened for.
    this.repinSwap();
  }

  /** The walk STANDS in the state — the one moment its questions are in
   *  order. Saves are welcome from anywhere; submit and bless are not:
   *  the steps before a step are where its answers become visible, and
   *  no lint can see what a skipped step would have shown. */
  private stateFormActive(name: string, m: MachineDecl): boolean {
    const { machine, ids } = this.leaves();
    return machine.id === m.id && ids.includes(name);
  }

  private assertStateFormActive(name: string, m: MachineDecl, verb: string): void {
    if (this.stateFormActive(name, m)) return;
    throw new Rejection({
      clause: CLAUSES.NOT_LEGAL_IN_STATE,
      expected: `the walk standing in ${name} — questions are answered in ORDER, and a ${verb} out of order skips the steps that feed it`,
      got: "the walk stands elsewhere",
      remedy: { tool: "se_pull", args: {}, note: "save keeps working from anywhere; the state's own moment is when it submits" },
      source: "engine/session.ts stateform",
    });
  }

  /** TWO OPERATIONS ON A STANDING CLAIM (owner ruling 2026-08-07), because
   *  there was ONE and it was neither of these: a submitted form could not be
   *  touched at all. A typo in it was permanent, and the only reopens were the
   *  gate's vote and the pin's drift, neither of which an agent can reach.
   *
   *  REOPEN says the claim must be re-earned. The work is wrong, or its ground
   *  moved. Everything downstream falls with it — free, because green ripples
   *  through the feeders already.
   *
   *  AMEND says the claim stands and its TEXT moved. A renamed reference, a
   *  path that changed, a typo. The signature is untouched because nothing it
   *  attested to has changed, and reopening a tree to fix a spelling is the
   *  cost that made people leave the spelling wrong.
   *
   *  WHICH ONE IS A JUDGMENT and the engine does not make it. What the engine
   *  guarantees is that an amend cannot smuggle a reopen past the checks: the
   *  form is re-checked after the edit, and an amend that breaks a check is
   *  refused with the file untouched. */
  reopenClaim(name: string, reason: string, by: string, machineId?: string): Record<string, unknown> {
    this.forgetRoute();
    const m = this.formMachine(machineId);
    this.stateFormState(name, m); // refuses an undeclared or form-less state
    const h = this.stateFormHome(name, m);
    const raw = existsSync(h.instanceAbs) ? readFileSync(h.instanceAbs, "utf8") : undefined;
    if (raw === undefined || typeof parseStateNote(raw).frontmatter.signed_off !== "string") {
      throw new Rejection({
        clause: CLAUSES.CONDITION_UNMET,
        expected: `${name} submitted — a reopen sends a STANDING claim back to be re-earned`,
        got: raw === undefined ? "no form on disk" : "never submitted",
        remedy: { tool: "se_pull", args: {}, note: "an unsubmitted form is already owed; walk to it and fill it" },
        source: "engine/session.ts reopen",
      });
    }
    if (reason.trim() === "") {
      throw new Rejection({
        clause: CLAUSES.CONDITION_UNMET,
        expected: "a reason — a reopen throws away accepted work and the record says why",
        got: "empty",
        remedy: { tool: "se_reopen", args: { state: name, reason: "<what stopped standing>" }, note: "one line is enough" },
        source: "engine/session.ts reopen",
      });
    }
    writeFileSync(h.instanceAbs, withReopened(raw, new Date().toISOString(), reason), "utf8");
    this.notifyChange();
    // The walk's tokens follow the file. reopenStates handles the join re-arming
    // that a bare token move gets wrong; a machine that does not declare this
    // state simply has no tokens to move, which is not an error.
    const run = this.top();
    if (run?.decl.states.some((s) => s.id === name)) {
      reopenStates(run.decl, run.instance, [name], reason, new Date().toISOString());
    }
    return { reopened: name, why: reason.trim(), by, still_green: this.recordDone(m) };
  }

  amendClaim(name: string, fills: Record<string, string>, reason: string, by: string, machineId?: string): Record<string, unknown> {
    this.forgetRoute();
    const m = this.formMachine(machineId);
    this.stateFormState(name, m);
    const h = this.stateFormHome(name, m);
    const raw = existsSync(h.instanceAbs) ? readFileSync(h.instanceAbs, "utf8") : undefined;
    if (raw === undefined || typeof parseStateNote(raw).frontmatter.signed_off !== "string") {
      throw new Rejection({
        clause: CLAUSES.CONDITION_UNMET,
        expected: `${name} submitted — an amend edits a STANDING claim without disturbing it`,
        got: raw === undefined ? "no form on disk" : "never submitted",
        remedy: { tool: "se_pull", args: {}, note: "an unsubmitted form is owed; fill it on the pull instead" },
        source: "engine/session.ts amend",
      });
    }
    if (reason.trim() === "" || Object.keys(fills).length === 0) {
      throw new Rejection({
        clause: CLAUSES.CONDITION_UNMET,
        expected: "at least one field, and a reason — an amend that says nothing is an untracked edit",
        got: Object.keys(fills).length === 0 ? "no fields" : "no reason",
        remedy: {
          tool: "se_amend",
          args: { state: name, fills: { "<field>": "<text>" }, reason: "<what was wrong>" },
          note: "both are required",
        },
        source: "engine/session.ts amend",
      });
    }
    const before = (this.stateFormGet(name, m) as { problems?: string[] }).problems ?? [];
    let next = raw;
    for (const [f, content] of Object.entries(fills)) next = withFieldContent(next, f, String(content));
    next = withAmended(next, new Date().toISOString(), by, reason);
    writeFileSync(h.instanceAbs, next, "utf8");
    // AN AMEND MAY NOT BREAK WHAT THE SIGNATURE COVERS. Written first and
    // judged after, because the check reads the file; a failure puts the
    // original back, so a refused amend leaves nothing behind.
    //
    // ANY FAILURE RESTORES, not only a failed check (found 2026-08-07). The
    // re-read itself can THROW — an unparseable frontmatter is not a
    // "problem" in the list, it is an exception — and that path used to
    // escape without restoring, leaving the file corrupt and the caller told
    // only that something errored.
    let after: string[];
    try {
      after = (this.stateFormGet(name, m) as { problems?: string[] }).problems ?? [];
    } catch (e) {
      writeFileSync(h.instanceAbs, raw, "utf8");
      throw new Rejection({
        clause: CLAUSES.CONDITION_UNMET,
        expected: "an amend the form can still be read after — nothing was changed",
        got: e instanceof Error ? e.message : String(e),
        remedy: {
          tool: "se_amend",
          args: { state: name, fills: { "<field>": "<text>" }, reason: "<what was wrong>" },
          note: "the file was put back; try again",
        },
        source: "engine/session.ts amend",
      });
    }
    const broke = after.filter((p) => !before.includes(p));
    if (broke.length > 0) {
      writeFileSync(h.instanceAbs, raw, "utf8");
      throw new Rejection({
        clause: CLAUSES.CONDITION_UNMET,
        expected: "an amend that leaves the claim standing — nothing was changed",
        got: broke.join(" · "),
        remedy: {
          tool: "se_reopen",
          args: { state: name, reason: "<why the claim itself must be re-earned>" },
          note: "a change this size is a reopen, not an amend",
        },
        source: "engine/session.ts amend",
      });
    }
    this.notifyChange();
    return { amended: name, fields: Object.keys(fills), why: reason.trim(), by, signature_kept: true };
  }

  /** THE BLESS (owner design 2026-08-04, v1's thumbs reborn): a gate's
   *  submitted form needs a hand ABOVE it — the human always, or an agent
   *  whose autonomy stands strictly above the gate's own weight. */
  formBless(name: string, ok: boolean, by: string, machineId?: string): Record<string, unknown> {
    this.forgetRoute();
    const m = this.formMachine(machineId);
    const s = this.stateFormState(name, m);
    this.assertStateFormActive(name, m, "bless");
    if (s.kind !== "gate") {
      throw new Rejection({
        clause: CLAUSES.NOT_LEGAL_IN_STATE,
        expected: "a GATE state — only gates carry a bless",
        got: `${name} (${s.kind})`,
        remedy: { tool: "se_pull", args: {}, note: "work states complete by their form alone" },
        source: "engine/session.ts bless",
      });
    }
    if (by !== "human" && this._autonomy <= s.priority) {
      throw new Rejection({
        clause: CLAUSES.ABOVE_THRESHOLD,
        expected: `a hand above this gate's weight — autonomy > ${s.priority}, or the human's thumb in the form`,
        got: `agent at autonomy ${this._autonomy}`,
        remedy: { tool: "se_pull", args: {}, note: "present the gate to the person and stop — their bless resumes the walk" },
        source: "engine/session.ts bless",
      });
    }
    const h = this.stateFormHome(name, m);
    const braw = existsSync(h.instanceAbs) ? readFileSync(h.instanceAbs, "utf8") : undefined;
    if (braw === undefined || typeof parseStateNote(braw).frontmatter.signed_off !== "string") {
      throw new Rejection({
        clause: CLAUSES.CONDITION_UNMET,
        expected: `the ${name} form submitted — the thumbs judge a STAMPED claim`,
        got: "not submitted yet",
        remedy: { tool: "se_pull", args: {}, note: 'fill, then {"submit": true} — the bless follows the stamp' },
        source: "engine/session.ts bless",
      });
    }
    writeFileSync(h.instanceAbs, withBless(braw, `${ok ? "blessed" : "dismissed"} by ${by}`), "utf8");
    this.notifyChange();
    return this.stateFormGet(name, m);
  }

  private stateFormChecked(raw: string | undefined): string[] {
    if (raw === undefined) return [];
    const v = parseStateNote(raw).frontmatter.checked;
    return typeof v === "string"
      ? v
          .split(",")
          .map((x) => x.trim())
          .filter((x) => x !== "")
      : [];
  }

  private stateFormScaffold(name: string, t: FormTemplate): string {
    return [
      "---",
      `form: ${name}`,
      "authors:",
      "files:",
      "---",
      "",
      `# Evidence form / ${name}`,
      "",
      ...t.fields.flatMap((f) => [`## ${f.name}`, "", ""]),
    ].join("\n");
  }

  /** One or many fields into the stored instance — multi-pass by law.
   *  A save never stamps: SUBMIT is the one checking, stamping act. */
  /** THE FORM WRITES THROUGH TO THE NODES (owner ruling 2026-08-07).
   *
   *  A `node-table` field is a two-way view. The form shows what each node's
   *  frontmatter says; what is typed in a cell lands back on that node.
   *  Edit the note and the form agrees at the next look. Edit the form and
   *  the note agrees at once. Nothing is stored twice, so nothing can
   *  disagree with itself.
   *
   *  A LINE NAMING AN UNKNOWN ID IS IGNORED, never refused. The list is live,
   *  and an entry closed since the form was last opened would otherwise make
   *  the save impossible until somebody hand-edited a section. */
  private bindThrough(name: string, fields: Record<string, string>, m: MachineDecl): string[] {
    const s = this.stateFormState(name, m);
    // A CHART WRITES NOTES, and it is the only field that CREATES and DELETES
    // them. Drawing a line mints a candidate; deleting the row throws the note
    // away (owner ruling 2026-08-08).
    const charted: string[] = [];
    for (const f of s.evidence_form.filter((x) => x.template === "morph-box" && fields[x.name] !== undefined)) {
      charted.push(...this.bindChart(String(fields[f.name]), m));
    }
    const bound = s.evidence_form.filter((f) => f.template === "node-table" && fields[f.name] !== undefined);
    if (bound.length === 0) return charted;
    const byId = new Map(loadTrace(this.traceRoot(this.declIteration(m))).map((n) => [n.id, n]));
    const touched: string[] = [];
    for (const f of bound) {
      const cols = f.columns ?? [];
      for (const line of String(fields[f.name]).split("\n")) {
        const cells = tableRow(line);
        // The header and its rule have no node in the first cell, so they
        // fall out here without needing to be counted or skipped by position.
        const id = (cells[0] ?? "").replace(/^\[\[|\]\]$/g, "").trim();
        const file = byId.get(id)?.file;
        if (file === undefined) continue;
        let raw = readFileSync(file, "utf8");
        cols.forEach((c, i) => {
          const v = (cells[i + 1] ?? "").replace(/\\\|/g, "|");
          // A key that is a LIST on disk stays a list: the cell splits on
          // the · the read half joined with. The yaml writer quotes each
          // entry itself, so a colon in a test name cannot break the node.
          const isList = nodeField(file, c) === "" && nodeList(file, c).length > 0;
          raw =
            isList || v.includes(" · ")
              ? withFrontmatterList(
                  raw,
                  c,
                  v
                    .split(" · ")
                    .map((x) => x.trim())
                    .filter((x) => x !== ""),
                )
              : withFrontmatter(raw, c, v);
        });
        writeFileSync(file, raw, "utf8");
        touched.push(id);
      }
    }
    return touched.concat(charted);
  }

  /** THE CHART'S LINES ARE NOTES (owner ruling 2026-08-08).
   *
   *  A drawn line becomes a [[candidate]] note, so it can be opened, given
   *  prose, and referenced by everything downstream. Removing the row removes
   *  the note — the table and the register never hold different sets.
   *
   *  A PRUNE LANDS ON THE OPTION, not on the chart. The reason belongs where
   *  the option is, so a reader of the note learns why it is out without
   *  finding the form that struck it.
   *
   *  AN EMPTY FIELD DELETES NOTHING. A form opened and saved before anything
   *  is drawn would otherwise wipe every candidate, which is a destructive act
   *  nobody asked for. */
  private bindChart(content: string, m: MachineDecl): string[] {
    const nodes = loadTrace(this.traceRoot(this.declIteration(m)));
    const byId = new Map(nodes.map((n) => [n.id, n]));
    const plan = chartPlan(
      content,
      nodes.filter((n) => n.type === "candidate").map((n) => n.id),
    );
    // THE FOLDER IS DERIVED FROM A SIBLING, never guessed. A record owns its
    // trace in its own worktree, so the only reliable answer is where the
    // options already sit.
    const sibling = nodes.find((n) => n.type === "option" && n.file !== undefined)?.file;
    const folder = sibling === undefined ? undefined : join(dirname(dirname(sibling)), "candidate");
    const touched: string[] = [];
    for (const w of plan.write) {
      const file = byId.get(w.id)?.file ?? (folder === undefined ? undefined : join(folder, `${w.id}.md`));
      if (file === undefined) continue;
      let raw = existsSync(file)
        ? readFileSync(file, "utf8")
        : ["---", `id: ${w.id}`, 'type: "[[candidate]]"', "name:", "statement:", "picks:", "---", "", "## Why this one", "", ""].join("\n");
      raw = withFrontmatter(raw, "name", w.name);
      raw = withFrontmatter(raw, "statement", w.statement);
      // PICKS IS A LIST, SO IT IS WRITTEN AS ONE. The item card declares a
      // block, and a comma-joined scalar reads back as a single pick.
      raw = withFrontmatterList(
        raw,
        "picks",
        w.picks.map((p) => `[[${p}]]`),
      );
      mkdirSync(dirname(file), { recursive: true });
      writeFileSync(file, raw, "utf8");
      touched.push(w.id);
    }
    for (const id of plan.remove) {
      const file = byId.get(id)?.file;
      if (file === undefined) continue;
      unlinkSync(file);
      touched.push(id);
    }
    for (const p of plan.prune) {
      const file = byId.get(p.id)?.file;
      if (file === undefined) continue;
      writeFileSync(file, withFrontmatter(readFileSync(file, "utf8"), "pruned_because", p.why), "utf8");
      touched.push(p.id);
    }
    return touched;
  }

  /** ONE OWED CELL, ONE SKELETON (owner design 2026-08-10). The element
   *  matrix's NAME button posts a cell; the interface node mints with the
   *  crossing flows already in carries, and the judgment fields arrive as
   *  comments per the house convention — answering them is the authoring.
   *  Idempotent: a standing node is never overwritten. */
  mintInterfaceCell(name: string, source: string, destination: string, machineId?: string): Record<string, unknown> {
    const m = this.formMachine(machineId);
    const traceRoot = this.traceRoot(this.declIteration(m));
    const cell = elementMatrixArgs(traceRoot).cells.find((c) => c.source === source && c.destination === destination);
    const id = `if-${source.replace(/^el-/, "")}-to-${destination.replace(/^el-/, "")}`;
    const abs = join(traceDir(traceRoot), "interface", `${id}.md`);
    if (!existsSync(abs) && cell !== undefined) {
      mkdirSync(dirname(abs), { recursive: true });
      writeNode(
        abs,
        [
          "---",
          `id: ${id}`,
          'type: "[[interface]]"',
          "statement: <!-- the contract in one sentence -->",
          `source: ${source}`,
          `destination: ${destination}`,
          "carries:",
          ...(cell.missing.length > 0 ? cell.missing : cell.owed).map((f) => `  - ${f}`),
          "form: <!-- call | file | protocol | shared store -- concretely -->",
          "source_refs:",
          "  - decompose-structure, the element matrix's owed cell",
          "---",
          "",
          "<!-- the contract's detail -- direction, cadence, failure behavior -->",
        ].join("\n"),
      );
    }
    return this.stateFormGet(name, m);
  }

  /** ONE CLICK, ONE TRIPWIRE (owner ruling 2026-08-10). The flip deck posts
   *  a ruling as it is made; the line lands in the sensitivity section and
   *  the save mints its node before the page redraws. Idempotent: a cell
   *  already ruled answers with the standing form. The field name is the
   *  method's own — the deck lives on the sensitivity reading. */
  flipRuling(name: string, rival: string, winner: string, axis: string, by: string, machineId?: string): Record<string, unknown> {
    const m = this.formMachine(machineId);
    const h = this.stateFormHome(name, m);
    // Through the door — the read ratchet holds, and the door already knows
    // this file if anything else looked at it this pass.
    const raw = readNode(h.instanceAbs);
    const current = raw === "" ? "" : section(parseStateNote(raw).body, "sensitivity").trim();
    if (current.includes(`[[${rival}]]`) && current.includes(`[[${axis}]]`)) return this.stateFormGet(name, m);
    const line = `- credible: [[${rival}]] over [[${winner}]] on [[${axis}]]`;
    return this.stateFormSave(name, { sensitivity: current === "" ? line : `${current}\n${line}` }, by, m);
  }

  /** ONE CLICK, ONE VERDICT (owner ruling 2026-08-10). The scenario deck
   *  posts a verdict as it is made; the line lands in the walk section and
   *  the save mints the register entry for at-risk and unaddressed before
   *  the page redraws. A fitness click files the requirement in
   *  fitness_candidates instead. Idempotent: a scenario already ruled
   *  answers with the standing form. */
  scenarioVerdict(
    name: string,
    kind: string,
    requirement: string,
    extra: { decision?: string; hinge?: string; note?: string },
    by: string,
    machineId?: string,
  ): Record<string, unknown> {
    const m = this.formMachine(machineId);
    const h = this.stateFormHome(name, m);
    const raw = readNode(h.instanceAbs);
    const field = kind === "fitness" ? "fitness_candidates" : "walk";
    const current = raw === "" ? "" : section(parseStateNote(raw).body, field).trim();
    // THE FLAG LIVES ON THE REQUIREMENT NODE (owner ruling 2026-08-10):
    // fitness_candidate: true in its frontmatter, so the mark outlives the
    // form. The list line below shows the same fact where the reader is.
    if (kind === "fitness") {
      const nodeAbs = join(traceDir(this.traceRoot(this.declIteration(m))), "requirement", `${requirement}.md`);
      const nodeRaw = readNode(nodeAbs);
      if (nodeRaw !== "" && !nodeRaw.includes("fitness_candidate:"))
        writeNode(nodeAbs, withFrontmatter(nodeRaw, "fitness_candidate", "true"));
    }
    const already = kind === "fitness" ? current.includes(requirement) : current.includes(`[[${requirement}]]`);
    if (already) return this.stateFormGet(name, m);
    // The note stays one line by construction — a newline would break the
    // verdict grammar the mint reads back.
    const note = (extra.note ?? "").replace(/\s+/g, " ").trim();
    // NOT EVERY QUALITY NEEDS A DECISION (owner ruling 2026-08-10). A
    // scenario the structure delivers by plain construction is addressed
    // with the path as its evidence; the decision ref is named only where
    // a recorded choice is why it holds.
    const line =
      kind === "addressed"
        ? `- [[${requirement}]] — addressed${(extra.decision ?? "") === "" ? "" : ` by [[${extra.decision}]]`}`
        : kind === "at-risk"
          ? `- at risk: [[${requirement}]] hinges on [[${extra.hinge ?? ""}]] — ${note === "" ? "the tradeoff is unstated" : note}`
          : kind === "unaddressed"
            ? `- unaddressed: [[${requirement}]]`
            : `- ${requirement}`;
    return this.stateFormSave(name, { [field]: current === "" ? line : `${current}\n${line}` }, by, m);
  }

  /** The scenario walk's at-risk and unaddressed verdicts become register
   *  entries at the moment they are saved (owner rulings 2026-08-10): a risk
   *  naming its hinge, an issue the gate must see. One node per scenario; a
   *  re-save reuses the standing node. breaks_how_badly INHERITS the
   *  requirement's own grade — the risk grades the same failure. how_likely
   *  stays a minted comment, answered at the register review. */
  private mintScenarioEntries(fields: Record<string, string>, m: MachineDecl, by: string): void {
    const traceRoot = this.traceRoot(this.declIteration(m));
    const gradeOf = (req: string): string => {
      const fm = noteOf(join(traceDir(traceRoot), "requirement", `${req}.md`))?.frontmatter;
      return typeof fm?.breaks_how_badly === "string" ? fm.breaks_how_badly : "";
    };
    for (const [f, content] of Object.entries(fields)) {
      fields[f] = mintScenarioLines(String(content), ({ kind, requirement, hinge, note }) => {
        const slug = requirement.replace(/^req-/, "");
        const id = kind === "at-risk" ? `raid-ar-${slug}` : `raid-un-${slug}`;
        const abs = join(traceDir(traceRoot), "raid", `${id}.md`);
        if (!existsSync(abs)) {
          mkdirSync(dirname(abs), { recursive: true });
          const grade = gradeOf(requirement);
          const gradeLine =
            grade === ""
              ? "breaks_how_badly: <!-- the damage grade — the words live in meth-damage-scale -->"
              : `breaks_how_badly: ${grade}`;
          writeNode(
            abs,
            kind === "at-risk"
              ? [
                  "---",
                  `id: ${id}`,
                  'type: "[[raid]]"',
                  "kind: risk",
                  `statement: The architecture leaves ${requirement} at risk — the response hinges on ${hinge}.`,
                  "owner: the adjudicator",
                  `trigger: any change to ${hinge}, or to the scenario on ${requirement}`,
                  "status: open",
                  `impact: ${note === "" ? "The scenario misses its measure when the hinge moves." : note}`,
                  gradeLine,
                  "how_likely: <!-- the likelihood grade — the words live in meth-likelihood-scale, graded at the register review -->",
                  "source_refs:",
                  "  - evaluate-architecture, the scenario walk's verdict",
                  `  - ${requirement}`,
                  `  - ${hinge}`,
                  "---",
                  "",
                  `Walked at evaluate-architecture by ${by}. The scenario's response forms`,
                  `at ${hinge}; the tradeoff on the verdict line is what a wrong turn there`,
                  "costs. The damage grade inherits from the requirement it protects.",
                ].join("\n")
              : [
                  "---",
                  `id: ${id}`,
                  'type: "[[raid]]"',
                  "kind: issue",
                  `statement: The structure does not address ${requirement} — nothing carries its scenario.`,
                  "owner: the adjudicator",
                  `trigger: any change to the element set, or to ${requirement}`,
                  "status: open",
                  "impact: The quality goes unprotected into the build.",
                  gradeLine,
                  "how_likely: expected",
                  "source_refs:",
                  "  - evaluate-architecture, the scenario walk's verdict",
                  `  - ${requirement}`,
                  "---",
                  "",
                  `Found unaddressed at evaluate-architecture by ${by}. Either the`,
                  "structure grows a carrier for this scenario, or the requirement moves —",
                  "the gate adjudicates which.",
                ].join("\n"),
          );
        }
        return id;
      });
    }
  }

  /** The sensitivity card's credible rulings become RAID tripwires at the
   *  moment they are saved (owner ruling 2026-08-10). One node per ruled
   *  cell; a ruling whose node already stands reuses it, so a re-save never
   *  duplicates. The line is rewritten with the minted ref, and the card
   *  renders the tripwire link from then on. */
  private mintFlipTripwires(fields: Record<string, string>, m: MachineDecl, by: string): void {
    const traceRoot = this.traceRoot(this.declIteration(m));
    const shortId = (id: string): string => id.replace(/^cand-/, "").replace(/^req-/, "");
    for (const [f, content] of Object.entries(fields)) {
      fields[f] = mintFlipLines(String(content), ({ rival, winner, axis }) => {
        const id = `raid-flip-${shortId(rival)}-on-${shortId(axis)}`;
        const abs = join(traceDir(traceRoot), "raid", `${id}.md`);
        if (!existsSync(abs)) {
          mkdirSync(dirname(abs), { recursive: true });
          writeNode(
            abs,
            [
              "---",
              `id: ${id}`,
              'type: "[[raid]]"',
              "kind: risk",
              `statement: The convergence flips — ${rival} passes ${winner} if ${axis} moves by one point, and that story was ruled credible.`,
              "owner: the adjudicator",
              `trigger: any change to the scores on ${axis}, or new evidence on either candidate`,
              "status: open",
              "impact: The winner of the convergence changes, and everything downstream of it re-earns.",
              "source_refs:",
              "  - reverse-sensitivity, the sensitivity card's ruling",
              `  - ${rival}`,
              `  - ${winner}`,
              `  - ${axis}`,
              "---",
              "",
              `Ruled credible by ${by} at reverse-sensitivity. The cell stands one`,
              "point from flipping the convergence; the fallback is the run that",
              "re-converges after the flip, with the losers still on record.",
              "",
              "## Probe",
              "",
              `Re-run the convergence with ${axis} moved one point toward ${rival}.`,
              "The trigger above brings this entry back the moment the ground moves.",
            ].join("\n"),
          );
        }
        return id;
      });
    }
  }

  stateFormSave(name: string, fields: Record<string, string>, by: string, m: MachineDecl = this.currentMachine()): Record<string, unknown> {
    const t = stateFormFields(this.stateFormState(name, m));
    const h = this.stateFormHome(name, m);
    let raw = existsSync(h.instanceAbs) ? readFileSync(h.instanceAbs, "utf8") : this.stateFormScaffold(name, t);
    // inputs_checked is the checkbox column, not a section — both hands
    // (the page's boxes, the agent's fill) send it through this one door.
    const { inputs_checked, ...rest } = fields;
    // A CREDIBLE RULING MINTS ITS TRIPWIRE ON SAVE (owner ruling 2026-08-10).
    // The sensitivity card's buttons emit ruling lines; each new one becomes
    // a RAID node here and the line is rewritten with the minted ref, so the
    // card renders the tripwire link on the next look. Idempotent: a line
    // already carrying its ref is left alone.
    this.mintFlipTripwires(rest, m, by);
    // The scenario walk's verdicts mint the same way — see mintScenarioEntries.
    this.mintScenarioEntries(rest, m, by);
    // BOUND FIELDS LAND ON THE NODES FIRST. The section is written too, so a
    // reader of the file still sees what was answered — but the NODES are
    // what the check reads and what the next look rebuilds the section from.
    this.bindThrough(name, rest, m);
    for (const [f, content] of Object.entries(rest)) raw = withFieldContent(raw, f, String(content));
    // The dead fields migrate out as legacy instances are touched.
    raw = raw.replace(/^status: .*\n?/m, "").replace(/^opened: .*\n?/m, "");
    // A changed claim is neither the submitted nor the blessed claim.
    if (Object.keys(fields).length > 0) raw = stripSignedOff(withBless(raw, undefined));
    if (inputs_checked !== undefined) {
      raw = withChecked(
        raw,
        String(inputs_checked)
          .split("\n")
          .map((x) => x.trim())
          .filter((x) => x !== ""),
      );
    }
    raw = withAuthor(raw, by);
    mkdirSync(dirname(h.instanceAbs), { recursive: true });
    writeFileSync(h.instanceAbs, raw, "utf8");
    this.notifyChange();
    return this.stateFormGet(name, m);
  }

  /** The state form the walk itself owes: standing in an iteration's
   *  state with evidence fields, the stored form IS the work.
   *
   *  MEMBERSHIP, NOT DEPTH (2026-08-09). This asked whether the SECOND-FROM-TOP
   *  sub was `iterations`, which is true at exactly one level of nesting and
   *  false one level deeper. A drawn sub-machine inside an iteration — the
   *  finders under enumerate-space — therefore owed no form at all: the walk
   *  stood on the state, the packet listed its asks, and the submit refused
   *  with "nothing on the way wants one".
   *
   *  It only surfaced there because the route was ALSO empty, the chart above
   *  being a starved join. Anywhere else the route's own demand covered for
   *  the missing standing form, so the fault sat hidden behind it. */
  private standingStateFormOwed(): string | undefined {
    if (!this.subs.some((s) => s.decl.id === "iterations")) return undefined;
    const { machine, ids } = this.leaves();
    const s = machine.states.find((x) => x.id === ids[0]);
    if (s === undefined || s.evidence_form.length === 0) return undefined;
    try {
      // Owed until SUBMITTED and still COMPLETE — a live input growing back
      // (a new inbox item) re-opens a signed form instead of leaving it
      // unpullable while the next state's entry refuses.
      const f = this.stateFormGet(s.id) as { signed?: boolean; met?: boolean; gate?: boolean; bless?: string; reopened_after?: boolean };
      // A GATE IS NOT DONE UNTIL IT IS BLESSED. Dropping it from the owed list
      // at the submit left the bless with no carrier — the pull stopped asking,
      // and a bless only rides a pull that is asking. The mirror's thumbs still
      // worked, so the gap was invisible to a person and total for an agent.
      // A GATE MISSING AN INPUT OWES NOTHING. Its form cannot be finished, and
      // owing it swallows every choice that would fetch the missing leg.
      //
      // THIS STAYS GATE-ONLY, and widening it was a deadlock. A work state
      // whose feeder is unsigned would owe no form, so it could never be
      // filled, so its feeder could never become signed either. The rule that
      // every input must be met belongs at the SUBMIT, where formDone checks
      // it. Owing a form and being allowed to stamp it are different questions.
      if (f.gate === true && this.feedersUnsigned(machine, s).length > 0) return undefined;
      const blessed = f.gate !== true || (f.bless ?? "") !== "";
      // A REOPENED CLAIM IS OWED AGAIN even though it is still signed. Without
      // this the reopen moved the walk's tokens and nothing else: the form
      // stayed unpullable, so the state could never be re-earned.
      if (f.reopened_after === true) return s.id;
      return f.signed === true && f.met === true && blessed ? undefined : s.id;
    } catch {
      return undefined;
    }
  }

  /** THE FAN'S OTHER LEGS.
   *
   *  A fan hands out one leg and reports the rest as not_walked, for the day
   *  several agents walk them at once. ONE agent then reaches the join with
   *  the other legs unwalked, and is stuck for good: the gate owes a form it
   *  cannot finish, and a choice is only read when nothing is owed, so every
   *  attempt to aim elsewhere is swallowed as a fill.
   *
   *  So where the walk stands stuck the unsigned feeders ARE the offer, and
   *  taking one puts the walk back on that leg. One agent walks a fan leg by
   *  leg; the list form still serves several agents unchanged. */
  private joinStuck(): { machine: MachineDecl; feeders: string[] } | undefined {
    const { machine, ids } = this.leaves();
    const here = machine.states.find((s) => s.id === ids[0]);
    // A STATE THAT OWES NO FORM CANNOT BE STUCK OWING ONE. start and end
    // collect edges like anything else, but they never wait on them, so
    // offering their feeders as an escape stops a sweep that was fine.
    if (here === undefined || here.evidence_form.length === 0) return undefined;
    const feeders = this.feedersUnsigned(machine, here);
    return feeders.length === 0 ? undefined : { machine, feeders };
  }

  /** Put the walk back on a leg it never took. No history is superseded:
   *  nothing downstream was earned, because the join was never passed. */
  private walkBackTo(id: string): void {
    const top = this.top();
    if (top === undefined) return;
    top.instance.active = [id];
    top.instance.current = id;
    top.instance.status = "open";
    this.notifyChange();
  }

  /** EVERY STATE REQUIRES ALL ITS INPUTS (owner ruling, 2026-08-06). Each
   *  feeder carrying an evidence form must be SIGNED before this state may
   *  stamp or pass. No state is an exception, and a gate was never special —
   *  it was only the one place the rule happened to be written down.
   *
   *  THE LINE THAT USED TO STAND HERE was `if (gate.kind !== "gate") return
   *  []`, and it was the whole defect. Several incoming edges met as an OR:
   *  one signed feeder let the state through and the panel went green over a
   *  hole. The owner caught it on generalize-use-cases, standing green with
   *  an unsigned write-stories directly above it.
   *
   *  FALLBACK AND RECOVERY EDGES ARE NOT INPUTS. A fallback hangs off its
   *  dependency as the guard-failure path, and the recovery edge points back
   *  the way it came. Neither is something the state waits for. */
  private feedersUnsigned(fm: MachineDecl, state: StateDecl): string[] {
    const REQUIRED = new Set(["normal", "approval"]);
    const feeders = fm.states.filter(
      (p) => p.evidence_form.length > 0 && p.edges.some((e) => e.to === state.id && REQUIRED.has(e.role ?? "normal")),
    );
    if (feeders.length === 0) return [];
    const unsigned = feeders.filter((p) => {
      try {
        return (this.stateFormGet(p.id, fm) as { signed?: boolean }).signed !== true;
      } catch {
        return true;
      }
    });
    // THE BAR IS THE AND: every input signed, or the state does not stamp.
    if (state.busbar === true) return unsigned.map((p) => p.id);
    // NO BAR IS THE OR, and the OR still demands ONE. A state waits until an
    // input actually arrives; it just does not care which.
    //
    // WITH A SINGLE INPUT THE TWO RULES MEET. One of one is all of one, so a
    // lone predecessor binds without any bar being drawn. That is the case
    // that was wide open: generalize-use-cases has exactly one input, so no
    // bar could have saved it and no OR excused it — nothing was checking a
    // work state's inputs at all.
    return unsigned.length === feeders.length ? unsigned.map((p) => p.id) : [];
  }

  private assertStateFormMet(stateId: string): void {
    const lint = this.stateFormGet(stateId) as {
      met?: boolean;
      signed?: boolean;
      problems?: string[];
      instance?: string;
      gate?: boolean;
      bless?: string;
    };
    if (lint.met !== true) {
      throw new Rejection({
        clause: CLAUSES.CONDITION_UNMET,
        expected: `the ${stateId} evidence form complete (${String(lint.instance)})`,
        got: (lint.problems ?? []).join(" · ") || "unfilled",
        remedy: { tool: "se_pull", args: {}, note: 'the pull serves the form; fill it, then finish with {"submit": true}' },
        source: "engine/session.ts stateform",
      });
    }
    if (lint.signed !== true) {
      throw new Rejection({
        clause: CLAUSES.CONDITION_UNMET,
        expected: `the ${stateId} form SUBMITTED — the submit checks the fields and stamps the claim`,
        got: "complete but not submitted",
        remedy: { tool: "se_pull", args: {}, note: 'return {"submit": true} on the fill, or press submit in the form' },
        source: "engine/session.ts stateform",
      });
    }
    {
      const m = this.currentMachine();
      const gs = m.states.find((x) => x.id === stateId);
      const feeders = gs === undefined ? [] : this.feedersUnsigned(m, gs);
      if (feeders.length > 0) {
        throw new Rejection({
          clause: CLAUSES.CONDITION_UNMET,
          expected: `a state requires ALL its inputs — every feeder form signed before ${stateId} passes`,
          got: `unsigned feeders: ${feeders.join(", ")}`,
          remedy: { tool: "se_pull", args: {}, note: "walk the named states and submit their forms; this one passes after" },
          source: "engine/session.ts stateform",
        });
      }
    }
    if (lint.gate === true && !(lint.bless ?? "").startsWith("blessed")) {
      throw new Rejection({
        clause: CLAUSES.CONDITION_UNMET,
        expected: `the ${stateId} gate blessed — the 👍 in the form, by the human or a hand above the gate's rung`,
        got: (lint.bless ?? "") === "" ? "submitted, awaiting the bless" : String(lint.bless),
        remedy: {
          tool: "se_pull",
          args: {},
          note: 'present the gate and stop; a fill of {"bless": true} blesses only from above its weight',
        },
        source: "engine/session.ts bless",
      });
    }
  }

  /** The blessed size may live in the kickoff's own stored form. */
  private kickoffSizeFromForm(it: Iteration): string | undefined {
    const abs = join(it.path, `project/spec/iterations/${it.id}/evidence/gate-kickoff.md`);
    if (!existsSync(abs)) return undefined;
    const txt = stripComments(section(parseStateNote(readFileSync(abs, "utf8")).body, "change_size")).toLowerCase();
    return chosenOption(txt, CHANGE_COLUMNS);
  }

  /** ONE self-contained HTML: the sheet, the fills, the reading and the
   *  templates baked in — the island is what travels back. */
  stateFormExport(name: string, machineId?: string): string {
    const m = this.formMachine(machineId);
    const s = this.stateFormState(name, m);
    const h = this.stateFormHome(name, m);
    const raw = existsSync(h.instanceAbs) ? readFileSync(h.instanceAbs, "utf8") : undefined;
    const model = stateFormModel(
      this.root,
      scanGuidance(this.root),
      m,
      s,
      this.stateFormHeader(name, raw, m),
      raw,
      this.traceRoot(this.declIteration(m)),
      h.instanceAbs,
    );
    const fills: Record<string, string> = {};
    if (raw !== undefined) {
      const body = parseStateNote(raw).body;
      for (const f of model.template.fields) fills[f.name] = stripComments(section(body, f.name)).trim();
    }
    // A BOUND FIELD IS REBUILT FROM THE NODES, and whatever the file holds is
    // ignored. That is the read half of the two-way view: edit the note and
    // the form agrees at the next look, with nothing to synchronise.
    //
    // It also settles the check. `met` asks whether every line has an answer,
    // and the lines now come from the register — so the state stands exactly
    // while every standing node carries its frontmatter, which is the claim
    // the state was making all along.
    Object.assign(fills, this.bindView(s, model, m));
    const docs: EmbeddedDoc[] = [];
    for (const i of model.inputs) {
      if (i.path === undefined) continue;
      try {
        docs.push({ path: i.path, content: readFileSync(join(this.root, i.path), "utf8") });
      } catch {
        docs.push({ path: i.path, content: "(unreadable at export time)" });
      }
    }
    return buildPortableForm(model, fills, docs, this.stateFormChecked(raw));
  }

  /** The returned copy's island lands as fills, marked imported — a
   *  claim like every other, judged at the gate. */
  stateFormIngest(name: string, html: string, machineId?: string): Record<string, unknown> {
    const m = this.formMachine(machineId);
    const island = parseIsland(html);
    if (island === undefined || island.form !== name) {
      throw new Rejection({
        clause: CLAUSES.REQUIRED_ARGS,
        expected: `a returned portable form carrying the se-form island for ${name}`,
        got: island === undefined ? "no island in the file" : `an island for ${island.form}`,
        remedy: { tool: "se_pull", args: {}, note: "export first, have it filled and saved, ingest that file" },
        source: "engine/session.ts stateform",
      });
    }
    const author = island.author === "" ? "imported" : `${island.author} (imported)`;
    const fields = { ...island.fields, inputs_checked: island.checked.join("\n") };
    return { ingested: name, author, ...this.stateFormSave(name, fields, author, m) };
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
          if (m === null) {
            keep.push(l);
            continue;
          }
          this.setProgress(Number(m[1]), Number(m[2]), (m[3] ?? "").trim());
        }
        return keep.length === 0 ? "" : `${keep.join("\n")}\n`;
      };
      child.stdout.on("data", (d: Buffer) => {
        out += eat(String(d));
      });
      child.stderr.on("data", (d: Buffer) => {
        out += d;
      });
      const timer = setTimeout(() => child.kill(), 120_000);
      child.on("error", (e) => {
        clearTimeout(timer);
        this.clearProgress();
        resolve({ status: null, out: String(e) });
      });
      child.on("close", (code) => {
        clearTimeout(timer);
        this.clearProgress();
        resolve({ status: code, out: out + pending });
      });
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
      // THE SUITE'S SPAWN-SKIP (SE_SCRIPT_SKIP). A condition script is a
      // node spawn, a booted walk runs two, and the battery boots ~200
      // walks — a third of its whole clock went here (measured 2026-08-02).
      // The skip answers green WITHOUT spawning and SAYS SO in the
      // evidence; the test files whose job is proving the scripts delete
      // the guard at their top.
      if (process.env.SE_SCRIPT_SKIP === "1") {
        const result = {
          ok: true,
          output: scripts.map((rel) => `${rel} → skipped (SE_SCRIPT_SKIP)`).join("\n"),
          at: new Date().toISOString(),
        };
        this.evidence.set(key, { ...(this.evidence.get(key) ?? {}), script_result: result });
        this.notifyChange();
        return { state: `${machine.id}/${s.id}`, script_result: result };
      }
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
  conditionStatus(
    m: MachineDecl,
    s: StateDecl,
    which: "enter" | "leave",
  ): Record<string, { args: string[]; met: boolean; note: string }> | undefined {
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
  /** The document the last pull served, waiting on its probes. */
  private pendingRead: { path: string; hash: string; expect: string[] } | null = null;

  rememberRead(path: string, hash: string, ref?: string): void {
    if (ref !== undefined || path.trim() === "" || hash.trim() === "" || path.startsWith("@")) return;
    const lane = this.diskHash(path);
    if (lane !== "" && lane === hash) {
      this.readBuffer.set(path, hash);
      this.persistSettings();
    }
  }

  clearReadBuffer(): void {
    this.readBuffer.clear();
    this.persistSettings();
  }

  /** Whether the walk has passed through boot once already. */
  private bootEntered = false;

  /** The agent's proofs, ALL earned by reading: se_file_read credits as it
   *  serves, and the pull credits once the document's tail comes back. Stale
   *  entries are swept here, so an edited doc always asks to be read again. */
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
    if (t.submachine?.includes("boot")) return true;
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

  /** Leaving the state destroys what it consumed. A briefing that cannot
   *  survive its own reading cannot go stale and cannot be believed twice. */
  private consumeDocs(s: StateDecl): void {
    for (const rel of this.consumeDemand(s)) unlinkSync(this.consumeAbs(rel));
  }

  /** THE WRITTEN HANDOVER IS GONE (owner ruling 2026-08-07).
   *
   *  It used to be demanded here, on the way out through `end`. The owner
   *  settled it in one sentence: they kill the session, so the gate never
   *  fired and there was never a handover. A duty that only discharges on the
   *  tidy path is not a duty, it is a wish.
   *
   *  The log already records what happened, so boot DERIVES the briefing
   *  instead of asking anyone to write it. See lastSessionBriefing below and
   *  CallLog.lastSession. Nothing to forget, nothing to go stale. */

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
    return this.entryRequirements(m, t)
      .filter((p) => !this.bufferedCurrent(p))
      .sort();
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
      got:
        channel === "agent" ? `not read at its current version: ${missing.join(", ")}` : `not checked in the mirror: ${missing.join(", ")}`,
      remedy:
        channel === "agent"
          ? {
              tool: "se_pull",
              args: {},
              note: "pull — it serves each document and names the last words to hand back, one document at a time. Reading through se_file_read credits too.",
            }
          : {
              tool: "se_pull",
              args: {},
              note: "check each listed document in the mirror — one check per version; an edited doc asks again",
            },
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
      remedy: {
        tool: "se_file_read",
        args: { path: owed[0] },
        note: "the human checked these as read while driving — your head must hold them too. Read each through the lane, then repeat the tick with their hashes in read_hashes.",
      },
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
          Array.isArray(args.inputs)
            ? args.inputs.map(String)
            : String(args.inputs ?? "")
                .split(",")
                .map((s) => s.trim())
                .filter((s) => s !== ""),
        );
      case "se_exp_close":
        return this.expeditionClose(args.merge !== false && args.merge !== "false");
      case "se_note_drain":
        // THE CHANNEL RULE: this is the mirror, so it is the person's own
        // hand. Every disposition stands, wherever the walk happens to be.
        return drainNote(
          seDir(this.root),
          String(args.ref ?? ""),
          String(args.disposition ?? ""),
          args.where === undefined ? undefined : String(args.where),
          true,
        );
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
      remedy: { tool: "se_pull", args: {}, note: "walk to the state first, then work its conditions" },
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
    // THE STORED FORM IS THE DURABLE COPY (owner rulings 2026-08-04): a
    // state with evidence fields lands every fill in its instance too.
    if (s.evidence_form.length > 0 && this.isStateForm(s.id)) {
      // submit and bless are not sections — they ride the fill as their
      // own keys and land AFTER the save, which strips stale stamps first.
      const { bless, submit, ...fills } = data;
      const strings = Object.fromEntries(Object.entries(fills).map(([k, v]) => [k, typeof v === "string" ? v : JSON.stringify(v)]));
      this.stateFormSave(s.id, strings, "agent");
      if (submit === true || submit === "true" || submit === "yes") this.formDone(s.id, "agent");
      if (bless !== undefined) this.formBless(s.id, bless === true || bless === "true" || bless === "yes", "agent");
    }
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
        remedy: {
          tool: "se_pull",
          args: {},
          note: "run the RETRO first (idle → retro): its drain dispositions these notes, then this gate opens",
        },
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

  private async assertConditions(
    m: MachineDecl,
    from: StateDecl,
    to: string | undefined,
    channel: Channel,
    supplied: Record<string, string>,
  ): Promise<void> {
    if (from.exit?.script !== undefined) await this.scriptRun(from.id); // a tick attempt runs the script
    for (const [key, args] of Object.entries(from.exit ?? {})) {
      if (key === "read" || key === "read_consume") continue; // channel-proven below, not evidence
      if (!this.conditionKeyMet(m, from, key, "leave")) this.refuseCondition(m, from, "exit", key, args);
    }
    const targetId = to ?? (from.edges.length === 1 ? from.edges[0].to : undefined);
    this.assertReads(m, from, targetId === undefined ? [] : [targetId], channel, supplied);
    // Leaving through the main machine's end is where the next handover is
    // owed. Sub-machines have their own end and owe nothing.
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
  packet(): Record<string, unknown> {
    // The packet is a public read of the drawing — "the next call" includes
    // it, so it opens a fresh epoch too (see machines/compile.ts).
    bumpDrawingEpoch();
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
      tier: tierOf(loadLevels(this.root), this._autonomy),
      // The server's clock, so no hand ever shells for the time (note-8acddaec).
      now: new Date().toISOString(),
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
              tool: "se_pull",
              path: Session.READING_PATH,
              documents: reading.length,
              note: "pull. It hands you one document and names its last words; return those on the next pull and the following document arrives. No paths to name.",
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

  /** Standing on the sub's end: this tick returns to the parent —
   *  whatever the parent's edges enter is what the threshold weighs
   *  and what the read gate demands proven. */
  private advanceOutOfSub(channel: Channel, supplied: Record<string, string>, now: string): Record<string, unknown> {
    const top = this.top()!;
    const { machine: pm, instance: pi } = this.parentOfTop();
    const parent = this.state(pm, top.parentState);
    this.gatePriority(
      pm,
      parent.edges.map((e) => e.to),
      channel,
    );
    this.assertReads(
      pm,
      parent,
      parent.edges.map((e) => e.to),
      channel,
      supplied,
    );
    this.completeGuarded(pm, pi, top.parentState, "filled", now);
    this.subs.pop();
    if (pi !== this.instance) pi.history.push({ state: top.parentState, outcome: "filled", at: now });
    const prefix = this.subs.map((s) => s.decl.id).join("/");
    this.instance.history.push({ state: prefix === "" ? top.parentState : `${prefix}/${top.parentState}`, outcome: "filled", at: now });
    if (!this.inSub()) this.unbind(); // leaving the outermost sub leaves the context (worktree stays)
    // THE SHIPPED ITERATION ARCHIVES ITSELF (owner ruling 2026-08-11): the
    // walk leaving through the terminal is the trigger; the blessed release
    // gate was the ruling, and the route cannot pass an unblessed gate.
    if (pm.id === "iterations") this.closeShippedIteration(top.parentState);
    this.seedSubs();
    return this.landing();
  }

  /** Close and archive the iteration whose machine the walk just left —
   *  merge, retire the record dir to its branch, drop the worktree, and
   *  seed the needs-retro note the shipped row promises. Already-closed
   *  or unknown records pass silently: the walk stands either way. */
  private closeShippedIteration(state: string): void {
    const full = this.top()?.gen?.expByState[state];
    if (full === undefined) return;
    let it: Iteration;
    try {
      it = itFind(this.root, full);
    } catch {
      return;
    }
    if (this.bound?.id === it.id) this.unbind();
    itCloseShipped(this.root, it);
    appendNote(
      seDir(this.root),
      `needs retro — iteration ${it.id} shipped and archived; the next kickoff's onboard-retro drains it.`,
      "agent",
      `needs retro: ${itShortId(it.id)} shipped`,
      "should",
    );
    this.bumpGeneration();
  }

  /** One step inside the sub the walk stands in. */
  private async advanceInSub(
    to: string | undefined,
    channel: Channel,
    supplied: Record<string, string>,
    now: string,
  ): Promise<Record<string, unknown>> {
    const entered = this.top()!;
    const cur = activeStates(entered.instance)[0];
    // THE KICKOFF PINS, AND THE MACHINE GROWS IN PLACE (owner ruling
    // 2026-08-04): leaving a blessed kickoff compiles the column and swaps
    // the M0 seed machine for the pinned walk BEFORE the step is weighed —
    // same machine id, same state ids, so evidence and history carry.
    if (this.state(entered.decl, cur).tags?.includes("iteration-kickoff") ?? false) {
      this.pinKickoff(this.subs[this.subs.length - 2]?.gen?.expByState[entered.parentState]);
      this.repinSwap();
    }
    const top = this.top()!;
    this.assertEdge(top.decl, cur, to);
    const subTarget = to ?? this.state(top.decl, cur).edges[0]?.to;
    if (subTarget !== undefined) this.gatePriority(top.decl, [subTarget], channel);
    await this.assertConditions(top.decl, this.state(top.decl, cur), to, channel, supplied);
    const inIteration = this.subs[this.subs.length - 2]?.decl.id === "iterations";
    // THE EXIT IS THE HARD GATE (owner ruling 2026-08-04): a state with
    // evidence fields leaves only on a COMPLETE stored form — the claim
    // stands in the record before the walk moves.
    if (inIteration && this.state(top.decl, cur).evidence_form.length > 0) this.assertStateFormMet(cur);
    this.completeGuarded(top.decl, top.instance, cur, "filled", now, to);
    // Leaving the state is what destroys what it consumed.
    this.consumeDocs(this.state(top.decl, cur));
    top.instance.history.push({ state: cur, outcome: "filled", at: now });
    const prefix = this.subs.map((s) => s.decl.id).join("/");
    this.instance.history.push({ state: `${prefix}/${cur}`, outcome: "filled", at: now });
    this.seedSubs(); // a sub state may itself host a sub-machine — nesting is arbitrary
    this.autoBind();
    this.notifyChange();
    return this.packet();
  }

  /** One step on the main machine. */
  private async advanceMain(
    to: string | undefined,
    channel: Channel,
    supplied: Record<string, string>,
    now: string,
  ): Promise<Record<string, unknown>> {
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

  /** THE ENGINE'S OWN STEP — complete the current state and move on.
   *  `to` picks the outgoing edge (needed only when there are several);
   *  `channel` is whose hand this is — the threshold gates only the agent's.
   *  The agent's read proofs come from the reading it pulled (se_reading
   *  and se_file_read fill the buffer); the human proves via checkboxes.
   *  Reached through the pull and the mirror — never a tool of its own. */
  async advance(to?: string, channel: Channel = "human"): Promise<Record<string, unknown>> {
    bumpDrawingEpoch();
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
      return this.packet();
    }
    // ONE VISIBLE STEP PER TICK (owner ruling 2026-07-26): you are only
    // ever in one state, and a tick moves exactly one position — including
    // the mechanical start/end positions of a sub-machine.
    if (!this.inSub()) return this.advanceMain(to, channel, supplied, now);
    if (this.top()!.instance.status !== "open") return this.advanceOutOfSub(channel, supplied, now);
    return this.advanceInSub(to, channel, supplied, now);
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

  private closedFired = false;

  /** The tick's result — plus the booted banner the first time idle lands.
   *  Reaching end fires onClosed once: the session is OVER — the server
   *  entry shuts the whole session down (owner ruling 2026-07-26). */
  /** THE HANDOVER, DERIVED FROM THE LOG (owner ruling 2026-08-07).
   *
   *  Rides the boot banner, which the harness rule already shows VERBATIM. So
   *  it costs no extra document, no reading proof and no extra hop — the
   *  owner's condition was that boot must not get slower, and this adds one
   *  tail scan of a file the engine writes anyway.
   *
   *  A BRIEFING THAT CANNOT BE BUILT MUST NEVER BLOCK BOOT. A first-ever
   *  session has nothing behind it, and that is normal rather than an error. */
  private lastSessionBriefing(): string | undefined {
    try {
      const last = new CallLog(seDir(this.root)).lastSession();
      if (last === undefined) return undefined;
      const when = `${last.from.slice(0, 10)} ${last.from.slice(11, 16)}–${last.to.slice(11, 16)}`;
      const lines = [`Last session (${when}): ${last.calls} calls.`];
      if (last.ended_at !== undefined) lines.push(`It stopped at ${last.ended_at}.`);
      const refused = Object.entries(last.refusals ?? {});
      if (refused.length > 0) lines.push(`Refused: ${refused.map(([c, n]) => `${c} ×${n}`).join(", ")}.`);
      if (last.notes !== undefined) lines.push(`Notes captured: ${last.notes.length}. Answers recorded: ${(last.answers ?? []).length}.`);
      return lines.join("\n");
    } catch {
      return undefined;
    }
  }

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
      const info = this.packet();
      this.onClosed?.();
      return {
        ...info,
        session_over: true,
        banner: "🦆 SE session over — the machine reached end. The server is shutting down.",
        display: "Show the banner above to the user VERBATIM. The session is over; no further calls will answer.",
      };
    }
    const info = this.packet();
    if (!this.bannerShown && !this.inSub() && activeStates(this.instance).includes("idle")) {
      this.bannerShown = true;
      const brief = this.lastSessionBriefing();
      return {
        ...info,
        booted: true,
        banner:
          "🦆 SE v3 booted. Main machine is live. All work runs through the se lane; every call is logged. se_pull says what to do next." +
          (brief === undefined ? "" : `\n\n${brief}`),
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
      remedy: {
        tool: "se_pull",
        args: {},
        note: "the drawn edges are the legal next states — pull with no payload and take one of the doors it offers",
      },
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
          remedy: {
            tool: "se_pull",
            args: {},
            note: "fix the drawing in Obsidian, then pull again — entering retries; back or escape also work",
          },
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
