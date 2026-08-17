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
import { CLAUSES, Rejection } from "./errors.ts";
import { contentHash } from "./hash.ts";
import {
  activeStates,
  branchToReturnTo,
  claimFeeders,
  completeState,
  downstreamCone,
  fallenChain,
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
import {
  confirmPrefill,
  type FormLint,
  type FormTemplate,
  fieldContent,
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
import { RUN_MODES, type RunMode, readMode, storedMode, writeMode } from "./mode.ts";
import { parseStateNote, readNode, section, withPass, writeNode } from "./notes.ts";
import { pathKind, resolveInRoot, seDir } from "./paths.ts";
import { mintFlipLines } from "./pugh.ts";
import { type PulledDoc, pulledFor, scanGuidance } from "./pull.ts";
import { CHANGE_COLUMNS } from "./rigor-matrix.ts";
import { anyJobRunning } from "./run.ts";
import { levelName, loadLevels, loadStopAt, notchName, tierOf, weightName } from "./scale.ts";
import { requiredDependsOn } from "./seed.ts";
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
  templateOwed,
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
/** One old→new patch against a submitted form's field. `all` replaces every
 *  occurrence; without it an ambiguous match refuses rather than guessing. */
export interface AmendOp {
  field: string;
  old_string: string;
  new_string: string;
  all?: boolean;
}

/*  se_reopen and se_amend join them because A CLAIM IS FIXED FROM OUTSIDE IT
 *  (owner ruling 2026-08-07). Both act on a state you are not standing in —
 *  that is the whole point, since standing in it means it is already owed and
 *  neither op is needed. Gating them by the current state's legal_tools would
 *  make them reachable only from the one place they are useless.
 *
 *  Their safety is not the gate's. reopenClaim and amendClaim each refuse an
 *  unsubmitted form, and an amend that breaks a check is refused with the file
 *  put back. */
/*  se_why joins them because A DIAGNOSTIC IS NEEDED EXACTLY WHERE THE WALK IS
 *  STUCK. A verb that explains why a state is grey, but is only callable from
 *  states where nothing is grey, is useless at the one moment it exists for.
 *
 *  It was written gated and its own first test caught it: refused at
 *  boot/read_contract, which is precisely the kind of place somebody asks.
 *
 *  IT CHANGES NOTHING. It reads the conditions the walk was about to compute
 *  anyway and returns them. There is no state to corrupt by asking. */
const ALWAYS_LEGAL: ReadonlySet<string> = new Set([
  "se_pull",
  "se_note",
  "se_panel",
  "se_note_drain",
  "se_aim",
  "se_reopen",
  "se_amend",
  "se_why",
]);
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
/** WHEN A CLAIM LAST ANSWERED THE GROUND. It is the SIGNATURE, and only the
 *  signature.
 *
 *  AN AMEND DOES NOT RE-GREY. A REOPEN DOES (owner ruling 2026-08-17, given
 *  twice, the second time to overturn what stood here).
 *
 *  WHAT STOOD HERE WAS THE OPPOSITE, and it is worth keeping the correction
 *  rather than the code alone. It read "an amend counts as freshly as a
 *  signature", and took the later of `amended:` and `signed_off:`. The effect
 *  was that every correction anywhere greyed every claim below it. Fixing one
 *  sentence in a kickoff sent ten signed states back to be re-freshened by
 *  hand, and each of those amends greyed everything below IT in turn. The
 *  walk stopped converging: i33 spent an afternoon re-freshening a chain that
 *  nothing was wrong with.
 *
 *  THE TWO ACTS ARE DIFFERENT ACTS, and that is the whole distinction. An
 *  AMEND corrects a claim that still stands — a wrong figure, a stale
 *  sentence, a typo. The signature is kept because it still attests. Nothing
 *  below it is disturbed, because nothing below it was answering the
 *  corrected words. A REOPEN says the work is WRONG. The claim goes grey, its
 *  form is owed again, and everything downstream falls with it. That is the
 *  ripple, it already exists, and it is the act to reach for when the QUESTION
 *  below has changed.
 *
 *  SO WHERE DOES THAT LEAVE THE i33 HOLE? A gate whose goals list is rewritten
 *  DOES change what every gate below must answer, and an amend would slip that
 *  past them. The answer is not to make amend behave like reopen. It is to
 *  refuse the amend — see FEEDS_DOWNSTREAM below. A field that other forms
 *  READ is not amendable, and the refusal names se_reopen. Both halves stay
 *  true: a correction stays cheap, and a changed question re-earns its
 *  answers. */
export function claimTime(fm: Record<string, unknown>): string {
  return typeof fm.signed_off === "string" ? fm.signed_off.trim() : "";
}

/** THE FIELDS OTHER FORMS READ, and the reason amend has a hard edge at all.
 *
 *  AMENDING ONE OF THESE CHANGES A DIFFERENT STATE'S QUESTION. An amend leaves
 *  every claim below standing, on purpose — so a change here would slip past
 *  every state that answers it, each still green against wording that is gone.
 *  That is the exact hole i33 fell through: the kickoff's one prose goal became
 *  a list of five, and ten signed states below never heard about four of them.
 *
 *  SO IT IS REFUSED, AND THE REFUSAL NAMES THE RIGHT ACT. A changed question is
 *  a reopen. The states below re-earn their answers, which is what the person
 *  wanted when they changed it.
 *
 *  THE LIST IS EXPLICIT AND SHORT BY CONSTRUCTION. A field crosses states only
 *  where a form source resolver reads it out of another state's note, and
 *  stateform.ts has exactly one such resolver today. Adding a second means
 *  adding a row here — the pairing is the point, not the length. */
const FEEDS_DOWNSTREAM: readonly { readonly state: string; readonly field: string; readonly reads: string }[] = [
  { state: "gate-kickoff", field: "goals", reads: "the goals_served round of every gate below it, through $goals" },
];

export interface GreenPass {
  corpus?: Map<string, ReturnType<typeof loadTrace>>;
  version?: Map<string, string>;
  done: Map<string, string[]>;
  /** WHEN EACH CLAIM WAS SIGNED, collected once for the whole operation. One
   *  operation paints more than once, and reading every claim's signature per
   *  call put recordDone at 1117 ms over 200 nodes against a 1000 ms budget —
   *  req-one-operation-reads-its-input-once, caught by this iteration's own
   *  rule on this iteration's own change. */
  times?: Map<string, string>;
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

/** ONE CONDITION HOLDING A STATE GREY, said so somebody can act on it.
 *
 *  It is a Rejection's payload plus a `kind`, on purpose: the walk throws
 *  these and the verb lists them, so what you read when you ask is exactly
 *  what you would have been refused with. */
export interface Blocker {
  /** The machine-readable reason, for a caller that wants to branch. */
  kind:
    | "form_incomplete"
    | "unsubmitted"
    | "unsigned_feeder"
    | "unblessed_gate"
    | "fallen_input"
    | "claim_content"
    | "submachine_unfinished";
  /** THE UPSTREAM STATES THIS BLOCKER IS ABOUT, as data (i6).
   *
   *  The chain walk used to recover these by PARSING `got` — stripping a
   *  prefix off the sentence and splitting on commas. That read one blocker
   *  kind and silently skipped the other, so a walk held by a fallen input
   *  reported no upstream at all and the reader was told the work was here.
   *
   *  A NAME IS DATA. It travels as a list or it does not travel.
   *
   *  req-a-ripple-names-its-root */
  states?: string[];
  clause: string;
  expected: string;
  got: string;
  remedy: { tool: string; args: Record<string, unknown>; note: string };
  source: string;
}

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
  /** THE STOP-AT NOTCH — how far the agent walks before handing back. The
   *  autonomy dial's neighbour: autonomy says what it may DECIDE alone, this
   *  says how far it may GO.
   *
   *  2 IS `agent judgement`, today's behaviour and where a session starts. The
   *  two notches above it unlock one press at a time, exactly like the autonomy
   *  rungs above the resting one. machines/stopat.md holds what each means. */
  private _stopAt = 2;
  /** ONE RELEASE, GRANTED BY THE PERSON. Under `state end` the engine holds
   *  every transition; a press spends one. It is permission, never a move —
   *  the agent's pull is still what walks (req-controls-never-advance-walk). */
  private _released = false;
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
    // THE WRITE LANE NO LONGER LEARNS ABOUT TREES, because there are none to
    // learn about (i34). This used to hand files.ts a mirror callback so a
    // method write could be copied into every open worktree.
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
      const s = JSON.parse(readFileSync(join(seDir(this.machineRoot()), "settings.json"), "utf8")) as {
        autonomy?: number;
        emergency?: boolean;
        block_sleep?: boolean;
        shutdown_at_idle?: boolean;
        narration_minutes?: number;
        narration_calls?: number;
        reads?: Record<string, string>;
        reads_pid?: number;
        target?: string;
        stop_at?: number;
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
        this.restoreTarget(s.target, s.reads_pid);
        // THE NOTCH SURVIVES A RELOAD, and the release does not. Permission is
        // for one transition; carrying it across an engine swap would spend a
        // press the person made for a state that no longer stands.
        if (typeof s.stop_at === "number") this._stopAt = s.stop_at;
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
  /** THE TARGET SURVIVES AN ENGINE RELOAD (owner ruling 2026-08-15): "the point
   *  of boot is to boot the agent, not the machine".
   *
   *  IT DOES NOT CONTRADICT THE DESK RULE. Every engine START still aims at the
   *  front desk (2026-07-29), because a start has no matching session stamp to
   *  restore from. Only a RELOAD restores, on the same two conditions the
   *  reading credit uses: the stamp says this is the same session, and the
   *  process id says the engine actually restarted.
   *
   *  THE POSITION IS STILL NOT REMEMBERED, and req-reload-restarts-clean is
   *  right to forbid it. Evidence gives the position, the target gives the
   *  direction, and the recompute walks back on its own. Before this, a reload
   *  mid-record landed at the desk with nothing aimed, so the agent paid an
   *  aim and a sweep to stand where it already stood.
   *
   *  AN UNREACHABLE RESTORED TARGET IS SAFE. The route simply cannot be drawn
   *  and the pull answers wait, which is the same answer a stale aim has always
   *  produced. */
  private restoreTarget(target: string | undefined, pid: number | undefined): void {
    if (pid === undefined || pid === process.pid) return;
    // AN EMPTY TARGET IS A DELIBERATE CLEAR, NOT A MISSING ONE. `aimAt("")` is
    // how the walk says it arrived and is aimed at nothing, and it persists
    // that empty string faithfully. Refusing to restore it left `_target` at
    // its field default, `front_desk` — so a cleared aim came back pointing at
    // a state BEHIND the walk, and every packet reported the machine headed
    // for the desk while it walked deeper into a record.
    //
    // SEEN LIVE 2026-08-16: `target: front_desk` on every pull inside i11,
    // after a reload, with nobody having aimed there.
    //
    // `undefined` still restores nothing, which is the real "never set".
    if (typeof target === "string") this._target = target;
  }

  /** The ONE place the target moves, so no site can forget to persist it. */
  private aimAt(to: string): void {
    this._target = to;
    this.persistSettings();
  }

  private restoreReadCredit(reads: Record<string, string> | undefined, pid: number | undefined): void {
    if (pid === undefined || pid === process.pid) return;
    for (const [p, h] of Object.entries(reads ?? {})) {
      if (typeof h === "string" && h !== "") this.readBuffer.set(p, h);
    }
  }

  private persistSettings(): void {
    try {
      mkdirSync(seDir(this.machineRoot()), { recursive: true });
      writeFileSync(
        join(seDir(this.machineRoot()), "settings.json"),
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
          target: this._target,
          stop_at: this._stopAt,
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
        // THE WORD, NEVER THE NUMBER (owner ruling 2026-08-14). Three refusal
        // lines still carried the raw dial after i27 moved the rest.
        got: `the autonomy sits at ${this.tierFor(this._autonomy).tier ?? "a lower rung"}`,
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
        remedy: { tool: "se_pull", args: {}, note: "the autonomy is set from the mirror's rungs or at launch (--autonomy)" },
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
    // THE ANSWER IS THE WORD, and the word for what it was (owner ruling
    // 2026-08-14). The person's control sends a number in; nothing sends one
    // back out.
    return { ...this.tierFor(value), was: this.tierFor(was).tier ?? "", ...(this._emergency ? { emergency: true } : {}) };
  }

  /** WHAT IS RUNNING RIGHT NOW, which is not always what is stored.
   *
   *  `--mode` decides THIS RUN and deliberately does not overwrite the stored
   *  choice, so the two can differ. A packet reporting only the stored value
   *  would then lie about the boundary the walk is actually crossing.
   *
   *  Null until the launch says. The stored value is the honest fallback. */
  private _runningMode: RunMode | null = null;

  /** Told by the launch which boundary this process actually got. */
  noteRunningMode(mode: string): void {
    this._runningMode = (RUN_MODES as string[]).includes(mode) ? (mode as RunMode) : null;
  }

  /** What is running now — the launch's answer, or the stored one. */
  runningMode(): RunMode {
    return this._runningMode ?? readMode(this.machineRoot());
  }

  /** THE PACKET'S MODE BLOCK, FROM ONE READ OF THE FILE.
   *
   *  packet() is on the hot path. recordDone paints green across the whole
   *  corpus, so a second read per call is two hundred extra file hits over a
   *  two-hundred-node corpus — which is exactly how it blew the drift
   *  budget. */
  private _storedMode: { mode: RunMode; chosen: boolean } | null = null;

  private runBlock(): { mode: RunMode; stored: RunMode; chosen: boolean } {
    // READ ONCE PER SESSION, never once per packet. recordDone paints green
    // across the whole corpus, so one filesystem hit per call cost 100 ms over
    // two hundred nodes and blew the drift budget — a cost that did not exist
    // before this block did.
    //
    // A SESSION-LIFETIME CACHE CANNOT BE WRONG IN A WAY THAT MATTERS. The
    // stored choice only takes effect at the NEXT launch. setRunMode refreshes
    // it, so this process always reports its own writes.
    this._storedMode ??= storedMode(this.machineRoot());
    const { mode, chosen } = this._storedMode;
    return { mode: this._runningMode ?? mode, stored: mode, chosen };
  }

  /** THE STORED RUN MODE — where satellites run from the NEXT launch on.
   *
   *  IT DOES NOT MOVE THIS RUN, and it does not pretend to. The boundary is
   *  chosen once at start. A server cannot re-spawn its own satellites
   *  underneath a walk in flight. The answer says which launch applies it.
   *
   *  IT EXISTS BECAUSE A HOST HAS NO COMMAND LINE. The VS Code extension
   *  launches from a fixed .mcp.json, so `--mode` never reaches it. Without
   *  this control that host could not flip the mode at all. */
  setRunMode(mode: string): Record<string, unknown> {
    if (!(RUN_MODES as string[]).includes(mode)) {
      throw new Rejection({
        clause: CLAUSES.REQUIRED_ARGS,
        expected: `one of ${RUN_MODES.join(", ")} — where satellites run`,
        got: String(mode),
        remedy: { tool: "se_pull", args: {}, note: "the run mode is set from the mirror, or at launch with --mode" },
        source: "engine/session.ts run mode",
      });
    }
    const was = readMode(this.machineRoot());
    writeMode(this.machineRoot(), mode as RunMode);
    this._storedMode = { mode: mode as RunMode, chosen: true };
    this.notifyChange();
    const running = this.runningMode();
    return { mode, was, running, applies: mode === running ? "already running" : "on the next launch" };
  }

  /** A STATE'S WEIGHT AS A WORD. The dial's own word comes from tierFor; this
   *  is the other direction, and mixing them says "blocked" about the lightest
   *  step in the drawing. */
  private weightFor(priority: number): string {
    try {
      return weightName(loadLevels(this.machineRoot()), priority);
    } catch {
      return "";
    }
  }

  /** THE TIER WORD FOR A VALUE (req-autonomy-is-categorical). The word is
   *  the truth and the number is its transitional carrier, so the two travel
   *  together — a bare number on any surface is the thing that row forbids.
   *  Empty only when the ladder itself cannot be read. */
  private tierFor(value: number): Record<string, string> {
    try {
      return { tier: tierOf(loadLevels(this.machineRoot()), value) };
    } catch {
      return {};
    }
  }

  /** The notch as a number, for the control that draws it. */
  get stopAtValue(): number {
    return this._stopAt;
  }

  /** The notch's bare word. Empty only when stopat.md cannot be read, which
   *  the hook reads as the default rather than as a licence. */
  stopAtName(): string {
    try {
      return notchName(loadStopAt(this.machineRoot()), this._stopAt);
    } catch {
      return "";
    }
  }

  /** THE PERSON'S HAND ON THE NOTCH. Like the autonomy dial, it moves
   *  mid-session and nothing it does advances the walk. */
  setStopAt(to: number | string): Record<string, unknown> {
    const notches = loadStopAt(this.machineRoot());
    const wanted =
      typeof to === "number"
        ? notches.find((n) => n.value === to)
        : notches.find(
            (n) =>
              n.name.split(" — ")[0].toLowerCase() === String(to).trim().toLowerCase() ||
              n.abbr.toLowerCase() === String(to).trim().toLowerCase(),
          );
    if (wanted === undefined) {
      throw new Rejection({
        clause: CLAUSES.CONDITION_UNMET,
        expected: `one of the notches: ${notches.map((n) => n.name.split(" — ")[0]).join(", ")}`,
        got: String(to),
        remedy: { tool: "se_pull", args: {}, note: "the notches are machines/stopat.md; edit that file to change them" },
        source: "engine/session.ts stopAt",
      });
    }
    this._stopAt = wanted.value;
    this._released = false; // a moved notch spends no stale permission
    this.persistSettings();
    this.notifyChange();
    return { stop_at: this.stopAtName() };
  }

  /** The person pressing "go on" under `state end`. One transition, then held
   *  again — which is what "one press, one state" means. */
  releaseOnce(): Record<string, unknown> {
    this._released = true;
    this.notifyChange();
    return { released: true, stop_at: this.stopAtName() };
  }

  /** THE HOLD. Under `state end` the ENGINE refuses to change state, and the
   *  person's press is what stops it refusing.
   *
   *  IT IS NOT AN AUTONOMY RULE. Autonomy weighs a step against a dial and
   *  says whose step it is. This says nothing about whose — it says the agent
   *  hands back at every boundary, whatever the step weighs.
   *
   *  THE PERSON IS NEVER HELD. The hold exists so a person can watch; holding
   *  their own hand would be absurd. */
  private holdsTransition(channel: Channel): boolean {
    if (channel !== "agent") return false;
    if (this.stopAtName() !== "state end") return false;
    if (this._released) {
      this._released = false; // spent
      return false;
    }
    return true;
  }

  /** The autonomy gate: an AGENT tick may enter a state only when its
   *  priority <= the session autonomy. The human's hand is never gated. */
  private gatePriority(m: MachineDecl, targetIds: string[], channel: Channel): void {
    if (channel !== "agent") return;
    // THE HOLD COMES FIRST, and it is a different question from the dial's.
    // Autonomy asks how HEAVY the step is; this asks nothing about the step at
    // all. Under `state end` the agent hands back at every boundary, and the
    // person's press is what stops the engine refusing.
    if (targetIds.length > 0 && this.holdsTransition(channel)) {
      throw new Rejection({
        clause: CLAUSES.ABOVE_THRESHOLD,
        expected: "a released transition — stop @ state end holds every one",
        got: `a walk into ${targetIds.join(", ")} with no release spent`,
        remedy: {
          tool: "se_pull",
          args: {},
          note: "STOP and say plainly which state waits. The person releases the next one in the mirror; one press, one state. Nothing they press moves the walk — your pull still does that, once the hold lifts. They can also move the stop @ notch down.",
        },
        source: "engine/session.ts stopAt",
      });
    }
    for (const id of targetIds) {
      const t = m.states.find((s) => s.id === id);
      if (t === undefined) continue;
      if (t.priority > this._autonomy) {
        throw new Rejection({
          clause: CLAUSES.ABOVE_THRESHOLD,
          expected: `a state within this session's ${this.tierFor(this._autonomy).tier ?? "dial"}`,
          got: `${id} is ${this.tierFor(t.priority).tier ?? "heavier"} work — this step is the person's`,
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
    // NOTHING TO RECONCILE (i34). The reload used to commit both trees, land
    // the branch on trunk and sync trunk back, so the engine came up carrying
    // the change whichever tree it landed on. One tree, one copy, no drift.
    if (process.env.SE_RELOAD_DRY === "1") return { reload: "dry", note: "canary green — no exit (SE_RELOAD_DRY)" };
    setTimeout(() => process.exit(42), 400);
    return {
      reload: "armed",
      note: "the engine restarts in under a second on the NEW sources — the walk reboots at start and walks back to your target, which survives the restart; tick when the lane answers",
    };
  }

  // THE WHOLE LEVELLING MACHINERY IS DELETED (i34). `reconcileTrees`,
  // `backfillMethod` and `backfillInto` existed because several trees held
  // copies of one method file and had to be kept in step — at reload, at
  // entry, and at every write. There is one tree, so nothing can fall behind.

  /** Where the LANE works. ONE TREE, so this is the root and nothing else
   *  (owner ruling 2026-08-16).
   *
   *  IT USED TO READ `this.bound?.path ?? this.machineRoot()`, which is the
   *  same chooser `storeFor` carried, one layer up. A bound record answered
   *  with its own tree, so the same relative path named different files
   *  depending on what was open.
   *
   *  A BOUND RECORD'S path IS THE ROOT NOW, so this could have been left as
   *  it was and would have given the right answer. It is written out anyway:
   *  a chooser that happens to have one branch is still a chooser, and the
   *  requirement asks for the absence of one, not for the right answer. */
  workRoot(): string {
    return this.machineRoot();
  }

  /** THE CHECKOUT THAT OWNS THE WORKTREES, and the machine's own state with
   *  them (owner ruling 2026-08-15).
   *
   *  THREE THINGS BELONG TO THE MACHINE AND NEVER TO A BRANCH.
   *
   *  - Worktree management itself: listing, seeding, finding, landing,
   *    syncing. A tree cannot be asked to enumerate the trees.
   *  - `.se/` session state: the call log, the notes, the handover, settings,
   *    the mode and the autonomy levels. One per machine, not one per record.
   *  - The claim ledger and the machine id, which say WHICH machine this is.
   *
   *  WHY IT IS A METHOD AND NOT THE RAW FIELD. Eighty-seven callers reached
   *  past `workRoot` straight to the field, and most of them were right to
   *  want the repo. One of them was not, and nothing distinguished it: a
   *  state's script condition ran against the repo while every file verb
   *  wrote to the bound worktree, so the check judged a corpus the agent had
   *  no write path to. Naming the intention is what makes the odd one out
   *  visible. */
  machineRoot(): string {
    return this.root;
  }

  /** THE CORPUS A READER SEES. One entry, because there is one tree.
   *
   *  IT USED TO BE A CHOICE (owner ruling 2026-08-06). Trunk was what had
   *  landed, an open record's worktree was a full checkout carrying trunk's
   *  nodes AND that record's own, and a whole-corpus view belonged to no
   *  single record — so the person picked which one they meant instead of the
   *  engine guessing, which it had done three times, differently each time.
   *
   *  i34 GAVE THE QUESTION ONE ANSWER by deleting the second tree. The ruling
   *  is not overturned: nobody guesses. There is simply nothing left to pick
   *  between, so the picker is hidden rather than asked. */
  corpora(): { id: string; label: string; path: string }[] {
    // ONE CORPUS, BECAUSE THERE IS ONE TREE (i34, found by the tester at
    // verification). This offered trunk plus one entry per open iteration, so
    // the person could pick which tree they meant. Every entry's path is now
    // the same root, so the picker asked a question with one answer twenty-two
    // times over — and defaulted to the LAST open iteration rather than trunk.
    return [{ id: "trunk", label: "trunk", path: this.machineRoot() }];
  }

  /** Where the lane resolves ONE path (owner ruling 2026-07-28).
   *
   *  `.se/` is SESSION state, never branch content. The handover, the notes
   *  and the call log belong to the project root, and the NEXT session reads
   *  them there whatever branch this one happened to stand on. Resolving them
   *  into a worktree wrote them where nobody would ever look — silently.
   *
   *  EVERYTHING ELSE RESOLVES TO THE ONE WORKING ROOT. It used to follow the
   *  walk into the bound record's worktree; i34 deleted the worktrees, so the
   *  classification below still runs and every branch of it now lands in the
   *  same tree. The classification is kept because it still separates session
   *  state and shared method from a record's own content, and those are
   *  different things whatever the tree count. */
  laneRoot(rel?: string): string {
    if (rel === undefined) return this.workRoot();
    // RESOLVED BY WHAT THE PATH IS, never by where the walk stands (owner
    // ruling 2026-08-07). paths.ts holds the classification and the reasons.
    //
    // A DECLARED ROOT is session state exactly like .se/ — its declaration
    // lives in the project root's .se/roots.json, so a bound worktree must
    // never make the owner's roots read as undeclared (found live 2026-07-30).
    const kind = pathKind(rel);
    if (kind === "session") return this.machineRoot();
    // SHARED METHOD BELONGS TO THE MACHINE, never to a branch. resolve.ts says
    // the same thing in storeFor: the core owns session state and shared
    // method, so both resolve to the machine root whatever tree is bound.
    //
    // Before this, a method write from inside a record landed in the record's
    // own worktree and fanned out over trunk at the merge. That is the
    // 2026-08-07 accident, and refusing the write was the old answer to it.
    // Resolving the write is the better one: nothing is refused, and the file
    // cannot land in a tree that does not own it.
    if (kind === "method") return this.machineRoot();
    // A RECORD'S OWN CONTENT IS IN THE SAME TREE AS EVERYTHING ELSE. This
    // used to ask `recordRoot(rel)` which tree owned the record and fall back
    // to the working root; both answers are now the same root, so the question
    // is not asked.
    void rel;
    return this.workRoot();
  }

  // `recordRoot` IS DELETED (i34, found by the tester at verification). It
  // answered "which tree owns this record" — the open record's worktree, or
  // undefined for a closed one so the caller fell back to the working root.
  //
  // A CHOOSER THAT HAPPENS TO HAVE ONE BRANCH IS STILL A CHOOSER. Both answers
  // became the same root when the worktrees went, so it returned correctly and
  // kept asking. The requirement demands the ABSENCE of the question, and this
  // was on every lane call for a record path.
  //
  // ITS DOCSTRING WAS ALREADY FALSE, which is how the tester found it: "An
  // OPEN record owns its worktree... A CLOSED one has landed and its tree is
  // gone." Neither sentence describes anything that now exists.

  // `methodTrees` AND `fanOutMethod` ARE DELETED (i34). The first answered
  // "every tree the method lives in"; the second copied a method write into
  // all of them so a change took effect wherever the reader was standing.
  //
  // ONE TREE MAKES BOTH QUESTIONS EMPTY. A write is the file every reader
  // opens, the instant it lands.

  expeditionNew(kind: string, goal: string, dependsOn: string[] = []): Record<string, unknown> {
    const e = expNew(this.machineRoot(), kind, goal, dependsOn);
    this.bumpGeneration(); // a new record changes what the container expands to
    return { created: e.id, branch: e.branch, note: "it stands in the expeditions container — enter there to work" };
  }

  iterationSeed(goal: string, vision: string, inputs: string[] = [], dependsOn: string[] = []): Record<string, unknown> {
    const it = itSeed(this.machineRoot(), goal, vision, inputs, dependsOn);
    this.bumpGeneration(); // a new record changes what the container expands to
    return { seeded: it.id, branch: it.branch, note: "it stands in the iterations container as its kickoff" };
  }

  // `levelTree` IS DELETED (i34). Entry used to copy every method file into
  // the record's tree and commit it there, because a record's worktree drifted
  // from trunk the moment either was edited.
  //
  // ITS OWN COMMENT MEASURED THE COST: 68 to 117 mirrored files sitting
  // uncommitted in 24 of 28 trees, a pre-commit hook type-checking a hundred
  // files that had nothing to do with the commit, and a peer cloning the
  // branch getting none of it — which is how one feature was built twice,
  // differently, on two branches.
  //
  // ONE TREE ENDS ALL THREE.

  /** ENTERING AN ITERATION BINDS IT AND STAMPS IT STARTED. That is all it does
   *  now: no claim to take, and no tree to level. */
  iterationOpen(id: string): Record<string, unknown> {
    const it = itFind(this.machineRoot(), id);
    this.bound = it;
    markStarted(this.machineRoot(), it);
    this.decisions.setExtraSink(join(this.machineRoot(), "project", "spec", "iterations", it.id, "decisions.jsonl"));
    return { bound: it.id, note: "the walk now stands in this iteration" };
  }

  /** THE BLESS PINS (owner verdicts 2026-07-30): leaving an iteration
   *  kickoff compiles the record's blessed change_size from the LIVE rigor matrix
   *  and pins the machine into the record. No change size, no pass — the
   *  demand is mechanical. An existing same-size pin walks on untouched;
   *  a larger size escalates; pinIteration refuses de-escalation itself. */
  private pinKickoff(fullId: string | undefined): void {
    if (fullId === undefined) return;
    const it = itFind(this.machineRoot(), fullId);
    const rec = readItRecord(this.machineRoot(), it);
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
    const pin = pinIteration(this.machineRoot(), it, size);
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
    const all = expList(this.machineRoot());
    const describe = (e: Expedition): Record<string, unknown> => {
      const fm = readRecord(this.machineRoot(), e);
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
    this.bound = expFind(this.machineRoot(), id);
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
    const result = expClose(this.machineRoot(), this.bound, merge, override);
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
      this.aimAt("");
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
    this.aimAt("");
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
    // THE CORPUS LOAD IS PAID ONLY BY A CLAIMFUL COMPLETION. Hoisting it above
    // this condition put a full green recomputation on every mechanical hop and
    // took recordDone to 3683 ms over 200 nodes against a 1000 ms budget —
    // caught by drift.test.ts, three lines under the comment that warned of it.
    const claimfulNow = outcome === "filled" && decl.evidence_form.length > 0;
    const done = claimfulNow ? new Set(this.recordDone(m)) : new Set<string>();
    if (claimfulNow && !done.has(stateId)) {
      // NAME THE CLAIM THAT ACTUALLY FELL (i3, 2026-08-13).
      //
      // recordDone runs a RIPPLE, and says so twenty lines above: green stops
      // at the first input that is not green, because a claim may be word for
      // word fine and still rest on ground that moved.
      //
      // This refusal reported only that the claim does not stand. So a state
      // whose own form is perfect and whose INPUT fell reads as a broken form,
      // and the reader goes to inspect a form with nothing wrong with it.
      //
      // It cost this iteration a long detour. specify-build was submitted,
      // signed, re-submitted, rewritten field by field and reformatted into a
      // table — all of it against a form that was never the problem.
      //
      // The engine knew which input had fallen the whole time.
      //
      // ONE MECHANISM, TWO QUESTIONS (owner instruction 2026-08-14). The
      // ripple and the content check used to live here alone, so se_why —
      // the verb built to explain a grey state — ran neither and answered
      // `standing: true` for a state this guard was dropping. Both now read
      // claimBlockers, so the two answers cannot differ.
      const held = this.claimBlockers(stateId, m)[0];
      if (held !== undefined) {
        throw new Rejection({ clause: held.clause, expected: held.expected, got: held.got, remedy: held.remedy, source: held.source });
      }
      // THE FALLBACK, when nothing nameable holds the claim. A "filled"
      // completion whose claim is neither signed nor standing means the walk
      // simply has not moved, and there is no input and no field to point at.
      throw new Rejection({
        clause: CLAUSES.CONDITION_UNMET,
        expected: `${stateId}'s claim to stand before it completes — it declares ${decl.evidence_form.length} evidence field(s)`,
        got: 'a "filled" completion with the claim neither signed nor standing — the walk has not moved',
        remedy: { tool: "se_pull", args: {}, note: "pull — the machine serves the owed form; submit it and the completion follows" },
        source: "engine/session.ts claim-guard",
      });
    }
    // A COMPLETION THAT WOULD OPEN SEVERAL ALTERNATIVES CHOOSES NONE OF THEM
    // (owner ruling 2026-08-16, req-a-pull-carrying-no-choice-enters-no-iteration).
    //
    // WHAT WENT WRONG WITHOUT IT. completeState fires every alternative edge
    // at once and then takes `inst.active[0]` as the new position. So a state
    // with several open doors did not offer them — it walked through the first
    // one, and "first" meant whatever order the edges were built in.
    //
    // IT COST FIVE ENTRIES INTO THE WRONG ITERATION ON ONE DAY. Each was a
    // bare pull after a dropped connection. Entering BINDS the record and
    // stamps it started, so a connection failure was starting work nobody
    // chose, and nothing recorded that nobody chose it.
    //
    // `only` IS THE CHOICE. The choose path passes the named target through,
    // so a chosen door completes exactly as before. What is refused is the
    // completion that names none.
    //
    // STANDING STILL IS THE ANSWER, not a refusal. The walk stays where it is
    // and the pull reports the doors, which is what an offer IS here — there
    // is no `choose` instruction and there never was.
    //
    // ONE ALTERNATIVE IS NOT A CHOICE. A lone alternative edge is how a return
    // and a single-visit machine are drawn, and both must keep walking through.
    if (only === undefined && outcome === "filled" && decl.edges.filter((e) => e.role === "alternative").length > 1) return;
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

  /** THE OUTCOME A HOP COMPLETES WITH, and it is the drawing that says which.
   *
   *  A `fallback` or `error` edge IS the drawn path for the thing going wrong,
   *  so taking one is not a state finishing its work — it is a state failing
   *  and the machine having somewhere to put it.
   *
   *  WITHOUT THIS THE FALLBACK WAS UNREACHABLE. `completeState` fires fallback
   *  edges only on a non-filled outcome, and every hop completed "filled", so
   *  a fallback edge could never fire at all. verification's exit script would
   *  come back red, the forward door stayed shut on the condition, and the
   *  repair door the drawing put there for exactly that case never opened.
   *  Found live 2026-08-16, with the walk holding read verbs and no legal move.
   *
   *  AND IT LEAVES THE STATE RED (owner ruling 2026-08-16: "if we complete on
   *  failed outcome, then it must be marked red"). `settledStates` counts a
   *  state green only where its LATEST history outcome is "filled", so a
   *  failed completion takes it back out of the green set by construction.
   *  Walking on is not the same as passing, and the record says so. */
  private outcomeFor(m: MachineDecl, cur: string, to: string | undefined): "filled" | "failed" {
    if (to === undefined) return "filled";
    const taken = this.state(m, cur).edges.filter((e) => e.to === to);
    return taken.some((e) => e.role === "fallback" || e.role === "error") ? "failed" : "filled";
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
      fresh = compileMachineCached(this.machineRoot(), mainMachinePath(this.machineRoot()));
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
        decl = compileMachineCached(this.machineRoot(), resolveRef(this.machineRoot(), mainMachinePath(this.machineRoot()), st.submachine));
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
  private expandNode(q: string, objective?: string): RouteNode | undefined {
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
    // A ROUTE NEVER PASSES THROUGH A RECORD WHEN A PLAIN DOOR EXISTS
    // (owner report 2026-08-16, req-a-pull-carrying-no-choice-enters-no-iteration).
    //
    // WHY THIS IS THE ROOT AND THE EDGE ORDER WAS NOT. The container's own
    // guidance promised an offer and the offer was real, but the ROUTER never
    // reads an offer. It searches, and a record was just another node on the
    // way. So a target OUTSIDE the container — the front desk, most often —
    // drew its shortest path straight through whichever record came first,
    // and walking that path ENTERED it, bound it, and stamped it started.
    //
    // THE OWNER SAW BOTH HALVES. Five entries into i4 after dropped sockets,
    // and separately: aiming at the intended iteration "drew a route THROUGH
    // two more — starting those as well".
    //
    // A RECORD IS WORK, NOT A CORRIDOR. Passing through one is never incidental
    // to going somewhere else, because entering it takes it up.
    //
    // THE GUARD IS CONSERVATIVE ON PURPOSE. It only withholds a record when the
    // same state also offers a door that is NOT a record, so no container can
    // be stranded by it — where a record is the only way on, the route still
    // goes through it. The iterations container gained exactly such a door in
    // this iteration: its selection state carries an edge to `end`.
    const recordsSkippable =
      objective !== undefined &&
      st.edges.some((e) => {
        const t = decl.states.find((s) => s.id === e.to);
        return t !== undefined && t.submachine === undefined;
      });
    const land = (pfx: string, t: StateDecl, tick: RouteNode["nexts"][number]["tick"]): void => {
      const at = Session.qual(pfx, t.id);
      if (t.submachine !== undefined) {
        // Only a GENERATED sub is a record. An authored sub-machine is part of
        // the method's own drawing and is walked through as it always was.
        if (recordsSkippable && t.submachine === "generated" && objective !== at && !objective.startsWith(`${at}/`)) return;
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
    return {
      priority: this.entryWeight(prefix, decl, id, st.priority),
      demands: { ...(st.entry ?? {}) },
      exit_demands: { ...(st.exit ?? {}) },
      nexts,
    };
  }

  /** THE DOOR'S OWN WEIGHT, NOT THE ROOM'S (i11's audit of the 2026-08-12
   *  seed, which calls this "THE MAP LIES").
   *
   *  Entering a container lands on its START state, which is mechanical — so a
   *  route into `expeditions` weighed 0.01 while the door weighs 0.4. At a dial
   *  of 0.2 the line drew OPEN the whole way and the walk then stopped, and
   *  `stops_at` came back undefined: nothing told the reader the way was shut.
   *  The gate refused correctly. Only the map was wrong, which is worse than a
   *  refusal because it is silent.
   *
   *  ONLY THE INITIAL STATE PAYS IT. Once inside, the door has been paid, and
   *  charging every state within would shut a container from the inside. */
  private entryWeight(prefix: string, decl: MachineDecl, id: string, own: number): number {
    if (prefix === "" || decl.initial !== id) return own;
    const cut = prefix.lastIndexOf("/");
    const parent = this.declForPrefix(cut < 0 ? "" : prefix.slice(0, cut))?.states.find(
      (s) => s.id === (cut < 0 ? prefix : prefix.slice(cut + 1)),
    );
    return parent?.submachine === undefined ? own : Math.max(own, parent.priority);
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
    if (here === this.routeAim(this._target)) this.aimAt("");
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
      this.aimAt("");
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
    this.aimAt(wanted);
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
  private deepOwed(prefix: string, decl: MachineDecl, pass: GreenPass, here: string = this.active()[0] ?? ""): string | undefined {
    const done = new Set(this.recordDone(decl, new Set(), pass));
    for (const s of decl.states) {
      if (s.evidence_form.length > 0 && !done.has(s.id)) return Session.qual(prefix, s.id);
      if (s.submachine === undefined) continue;
      const subPrefix = Session.qual(prefix, s.id);
      // A RECORD THE WALK IS NOT INSIDE OWES NOTHING (owner ruling 2026-08-16,
      // req-a-pull-carrying-no-choice-enters-no-iteration).
      //
      // THIS IS THE OTHER HALF OF THE 2026-08-11 FIX, and that fix's own
      // comment describes the same failure: "an aim at the desk descended into
      // whatever record stood open: boot marched into i2". Restricting the
      // upstream walk to INPUT edges closed one route in. This closes the
      // other: subObjective deliberately adds the container the walk STANDS
      // in, and from a container's own selection state that meant descending
      // into whichever record came first and calling its work the objective.
      //
      // The router then drew the way there, and walking it ENTERED that
      // record — binding it and stamping it started. Five times on 2026-08-16,
      // every one on a bare pull after a dropped socket.
      //
      // A RECORD'S WORK BEGINS WHEN SOMEBODY CHOOSES IT. Until then it is not
      // a prerequisite of anything, so it is not an objective. Standing INSIDE
      // one, the walk still finds its owed legs, which is what the same day's
      // fix bought and what this must not take away.
      if (s.submachine === "generated" && here !== subPrefix && !here.startsWith(`${subPrefix}/`)) continue;
      const sub = this.declForPrefix(subPrefix);
      if (sub === undefined) continue;
      const nested = this.deepOwed(subPrefix, sub, pass, here);
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
          // THE WORD, NEVER THE NUMBER (owner ruling 2026-08-14). A served
          // string is an answer like any other.
          why: `entering ${s.to} is ${this.tierFor(s.priority).tier ?? "heavier"} work, above this session's ${this.tierFor(this._autonomy).tier ?? "dial"}`,
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
    /** The tier WORD. No number rides an answer (owner ruling 2026-08-14). */
    tier?: string;
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
    tier?: string;
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
    let r = computeRoute(from, objective, (q) => this.expandNode(q, objective));
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
      // THE NUMBER IS GONE FROM THE ANSWER (owner ruling 2026-08-14, final:
      // "that number leaves... there's no call to be made"). The tier WORD is
      // the autonomy, and req-autonomy-is-categorical says so. The cut-over
      // that raid-risk-autonomy-rework-breaks-walking asked for came first and
      // is complete; this is the removal it said would follow.
      ...this.tierFor(this._autonomy),
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
    mkdirSync(seDir(this.machineRoot()), { recursive: true });
    writeFileSync(join(seDir(this.machineRoot()), "reading.md"), out.join("\n"), "utf8");
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

  /** HOW LONG A SWEEP MAY RUN BEFORE IT ANSWERS.
   *
   *  NOT A PERFORMANCE BUDGET. It is the guarantee that the sweep ALWAYS
   *  returns a whole answer, standing on a whole state, inside any caller's
   *  timeout. A sweep that is cut off instead of answering is the one thing
   *  that leaves the walk between two states.
   *
   *  Twenty seconds is well under every timeout the lane has been driven
   *  through, and a forty-four hop route has never taken half of it once the
   *  hops are whole. */
  static readonly SWEEP_BUDGET_MS = 20_000;

  /** THE SWEEP — the route, walked. It collapses ROUND TRIPS and nothing
   *  else: every hop still enters its state, still weighs the slider, still
   *  proves its reads, still runs its scripts, still writes its own line to
   *  the feed. The first hop that will not pass stops it, and says so.
   *
   *  THE ROUTE IS RECOMPUTED AFTER EVERY HOP, which is the detour: if the
   *  ground moved, the way is worked out again FROM WHERE THE WALK NOW
   *  STANDS rather than followed off a cliff. */
  async sweep(target: string, channel: Channel, budgetMs: number = Session.SWEEP_BUDGET_MS): Promise<Record<string, unknown>> {
    const started = Date.now();
    const walked: string[] = [];
    // A BANNER EARNED MID-SWEEP MUST SURVIVE THE SWEEP. advance hands
    // its banner back per hop, and a sweep that swallowed it lost the boot
    // banner every time — the harness rule says show banners verbatim, and
    // nobody can show what the machinery ate.
    const banners: string[] = [];
    const carry = (): Record<string, unknown> => (banners.length > 0 ? { banners } : {});
    for (let guard = 0; guard < 64; guard++) {
      // THE SWEEP MUST ANSWER, NEVER BE CUT OFF. A long route walked past the
      // caller's timeout leaves the walk mid-hop, and the next pull then
      // computes from a position the machine disagrees with — the
      // `completeState: <state> is not active` error, eight times across two
      // sessions (note-c76d90e3c17a).
      //
      // So the budget is checked BETWEEN hops, where the walk always stands
      // on a whole state. Stopping here is not a failure: the route
      // recomputes from wherever it stopped, and the next sweep carries on.
      if (walked.length > 0 && Date.now() - started >= budgetMs) {
        return {
          ...this.packet(),
          swept: walked,
          arrived: false,
          ...carry(),
          note: `swept ${walked.length} hop(s) and stopped ON A STATE at the ${budgetMs} ms budget rather than being cut off mid-hop — sweep again and the route recomputes from here`,
        };
      }
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
      // THE WORD, NEVER THE NUMBER, ON A SERVED SURFACE
      // (req-autonomy-is-categorical; owner, 2026-08-16: "I don't want the old
      // scale anywhere anymore").
      //
      // THIS WAS THE LAST LEAK, and it was the loudest: every door of every
      // pull carried `priority: 0.2`, so the number the answer had stopped
      // saying at the top was said a dozen times just below it. It is where
      // the agent read one and repeated it back to the owner in chat.
      //
      // THE NUMBER STILL RUNS THE COMPARISON one line above. That half is
      // i14's, and raid-risk-autonomy-rework-breaks-walking asked for the
      // cut-over first and the removal second, never both at once.
      weight: this.weightFor(t.priority),
      open: open && !overWeight,
      ...(overWeight
        ? {
            needs: `the person — ${this.weightFor(t.priority) || "heavier"} work is above this session's ${this.tierFor(this._autonomy).tier ?? "dial"}`,
          }
        : {}),
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

  /** Is the walk standing ON the state it is aimed at? Both spellings count:
   *  a leaf id as the machine holds it, and the qualified form a target uses. */
  private standingOn(target: string): boolean {
    const here = this.leaves().ids;
    return here.includes(target) || here.some((id) => this.qualHere(id) === target);
  }

  /** WHY A WAIT IS A WAIT, and it says which of two things is true.
   *
   *  Standing ON the target with nothing owed is one. Standing somewhere the
   *  router cannot draw a route FROM is the other, and it used to borrow the
   *  first one's sentence — which reads as "you have arrived" to an agent that
   *  has not, and hides that a door is right there. */
  private waitWhy(onTarget: boolean, hasDoors: boolean, target: string, note?: string): string {
    if (onTarget) return "the target is where the walk already stands, and it owes nothing";
    const doors = hasDoors ? " — the doors below are what this state offers" : "";
    // THE SPECIFIC CAUSE OUTRANKS THE GENERIC ONE. A broken drawing, an unmet
    // condition, a missing edge: the router's own note names WHICH, and the
    // doors are extra rather than a replacement. Overwriting it cost the
    // diagnostic that tells a broken canvas apart from a missing route.
    if (note !== undefined && note !== "") return `${note}${doors}`;
    if (hasDoors) return `nothing routes toward ${target} from here${doors}`;
    return "no way there";
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
    // A DEFAULT TARGET IS NOT AN AIM (i34, req-a-pull-carrying-no-choice-enters-no-iteration).
    //
    // With nothing aimed, the walk falls back to the front desk so an idle
    // agent drifts home rather than standing nowhere. That fallback WALKED A
    // CHOICE POINT: standing on the iterations container with two records
    // open, a bare pull left through the container's exit and arrived at the
    // desk, because the desk looked like somewhere it had been told to go.
    //
    // THE REQUIREMENT HAS TWO CONJUNCTS and this is the second: the engine
    // "shall enter no iteration AND shall answer with the offer". Leaving
    // satisfies the first and fails the second, which is exactly the half a
    // tester with fresh eyes caught after the builder tested only the first.
    //
    // SO A CHOICE POINT HOLDS THE DEFAULT. Where the walk stands on a state
    // offering more than one alternative and nobody has aimed anywhere, the
    // target is HERE. A real aim still crosses it, because that is somebody
    // saying where they want to be.
    const choiceHere = (): boolean => {
      const here = this.active()[0];
      if (here === undefined) return false;
      const { machine } = this.leaves();
      const bare = here.slice(here.lastIndexOf("/") + 1);
      const decl = machine.states.find((s) => s.id === bare);
      return (decl?.edges.filter((e) => e.role === "alternative").length ?? 0) > 1;
    };
    const targetNow = (): string => {
      if (this._target !== "") return this._target;
      const here = this.active()[0];
      if (here === undefined || here === "front_desk") return this._target;
      return choiceHere() ? here : "front_desk";
    };
    const head = (): Record<string, unknown> => ({
      where: this.active(),
      ...(this.bound !== undefined ? { expedition: this.bound.id } : {}),
      target: targetNow(),
      // The tier word IS the autonomy. No number rides any answer
      // (owner ruling 2026-08-14).
      ...this.tierFor(this._autonomy),
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
      // THE ECHO IS THE AGENT'S COPY TOO. Every `forms:` path already stripped
      // the corpus and this one did not, so a submit answered with the whole
      // record's facts plus the text the agent had just written — 290KB where
      // a receipt was wanted.
      ...(saved !== undefined ? { form_saved: this.agentCopy(saved as Record<string, unknown>, true) } : {}),
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
        forms: [this.formForAgent(standingForm)],
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
      // A RED OBJECTIVE IS WORK, NOT AN ARRIVAL (i3's charter).
      //
      // Standing ON the target with its claim owed used to answer "the target
      // is where the walk already stands" and stop. That is true about
      // POSITION and useless about WORK: the route is empty because there is
      // nowhere to GO, never because there is nothing to DO.
      //
      // The engine held the verdict the whole time. Aiming at a state whose
      // form is owed is the most ordinary thing an agent does, and it was
      // answered with a sentence about geography.
      //
      // SO ASK THE STATE. If it owes a form, that form IS the answer, served
      // exactly as the sweep serves one. Only a target that owes nothing falls
      // through to the wait, and there the sentence is finally true.
      const owed = r.found ? this.pullFormsOwed().filter((n) => !this.formsMet([n])) : [];
      if (owed.length > 0) {
        return {
          pull: "fill",
          ...head(),
          ...this.refusedBlock(owed),
          for: pullTarget,
          forms: owed.map((n) => this.formForAgent(n)),
          do: 'fill every required section, then return it on the next pull as form: {"<section>": "<text>"} — there is no submit verb, and pulling without it hands back this same form',
          ...extra(),
        };
      }
      const stalled = this.stalledClaim(r, head, extra);
      if (stalled !== undefined) return stalled;
      // A WAIT AT A BRANCHING POINT SHOWS ITS DOORS (i34,
      // req-a-pull-carrying-no-choice-enters-no-iteration).
      //
      // This branch answers "there is nowhere to go", which is the truth and
      // not the whole of it. Standing on a state that offers several ways on,
      // the walk is waiting FOR A CHOICE, and an answer that names none leaves
      // the reader to guess a door and read the refusal.
      //
      // THE REQUIREMENT ASKS FOR EXACTLY THIS. A pull carrying no choice
      // "shall enter no iteration AND shall answer with the offer", and the
      // second half was missing while the first passed — which is the half a
      // tester with fresh eyes caught.
      const waitingOpts = this.pullOptions();
      // EVERY DOOR IS SHOWN, INCLUDING A LONE ONE.
      //
      // This read `> 1`, on the reasoning that one way on is not a BRANCH. It
      // is still the way FORWARD, and hiding it turns a signed state with a
      // single outgoing edge into a dead end: no options, no remedy, and a
      // sentence about geography.
      //
      // MEASURED AT i33's trace-design on 2026-08-17. The state was signed,
      // verification stood one edge away, and the walk could not see it. The
      // verb that would have re-aimed is not legal there either, so there was
      // no move at all.
      //
      // A branching point is where several doors are worth WEIGHING. A wait is
      // where the walk needs to know what exists. Those are different
      // questions and only the first one wanted a threshold.
      return {
        pull: "wait",
        ...head(),
        ...(waitingOpts.length > 0 ? { options: waitingOpts } : {}),
        waiting_for: "the person",
        why: this.waitWhy(this.standingOn(pullTarget), waitingOpts.length > 0, pullTarget, r.note),
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
        why: `entering ${first.to} is ${this.tierFor(first.priority).tier ?? "heavier"} work, above this session's ${this.tierFor(this._autonomy).tier ?? "dial"}`,
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
        forms: unmet.map((n) => this.formForAgent(n)),
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
    // A STUCK JOIN IS THE ONE PLACE A CHOICE OUTRANKS EVERYTHING (found live
    // 2026-08-15, and it stopped the walk dead).
    //
    // One agent walks one leg of a fan, arrives at the join, and the join
    // refuses because a parallel leg was never walked. From there:
    //
    // - THE ROUTE TO THAT LEG RUNS THROUGH THE JOIN IT IS BLOCKING, so se_aim
    //   sweeps zero hops however many times it is asked.
    // - A CHOICE WAS REFUSED TWICE OVER: once because the join owed a form,
    //   and again because a target was set.
    // - se_amend, WHICH THE REFUSAL ITSELF RECOMMENDS, cannot run — the leg
    //   has no form on disk, because it was never served.
    //
    // joinStuck and walkBackTo existed for exactly this and could not be
    // reached. Filling the join is pointless while a leg is unwalked, so the
    // leg wins over both guards.
    if (form.choice !== undefined && Object.keys(form).length === 1) {
      const stuck = this.joinStuck();
      const pick = String(Array.isArray(form.choice) ? form.choice[0] : form.choice);
      if (stuck?.feeders.some((f) => this.qualHere(f) === pick || f === pick) === true) {
        return { fanOut: this.pullPickChoice(form.choice) };
      }
    }
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
      const leg = stuck.feeders.find((f) => this.qualHere(f) === picks[0] || f === picks[0]);
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
          forms: formsNow.map((n) => this.formForAgent(n)),
          ...(swept.banners !== undefined ? { banners: swept.banners } : {}),
          do: 'fill every required section, then return it on the next pull as form: {"<section>": "<text>"} — there is no submit verb, and pulling without it hands back this same form',
          ...extra(),
        };
      }
    }
    // A BRANCH POINT SHOWS ITS DOORS. `do` means the happy path was walked up
    // TO the next branch, and the walker then has to know what the branch is.
    //
    // Without this a container full of open iterations answered `do` at its
    // own start with nothing to answer WITH, and the only way to learn the
    // doors was to guess one and read the refusal.
    const branchOpts = this.pullOptions();
    return {
      pull: "do",
      ...head(),
      walked: swept.swept ?? [],
      arrived: swept.arrived === true,
      ...(branchOpts.length > 1 ? { options: branchOpts } : {}),
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
        : {
            to: e.to,
            ...(t.statement !== "" ? { statement: t.statement } : {}),
            kind: t.kind,
            // The desk's offer is a served surface too, and the same rule binds it.
            weight: this.weightFor(t.priority),
          };
    });
  }

  /** WHICH RECORD IS OPEN, or nothing. The minted_in stamp asks this: a trace
   *  node written while a record is bound carries that record's id.
   *
   *  IT USED TO BE READ OFF A PATH — the `<id>` in `.worktrees/<id>` — which
   *  i34 removes. The walk has always known the answer; nothing was asking. */
  boundRecordId(): string | undefined {
    return this.bound?.id;
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
    if (id === "expeditions") return generateContinueExpedition(this.machineRoot());
    if (id === "iterations") return generateIterations(this.machineRoot());
    if (id === "expedition_archive") return generateExpeditionArchive(this.machineRoot());
    if (id === "iteration_archive") return generateIterationArchive(this.machineRoot());
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
      const path = resolveRef(this.machineRoot(), mainMachinePath(this.machineRoot()), found.ref);
      const decl = compileMachineCached(this.machineRoot(), path);
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
    return pendingNotes(seDir(this.machineRoot()))
      .filter((n) => markers.some((m) => n.text.toLowerCase().includes(m.toLowerCase())))
      .map((n) => ({ ref: n.ref, text: n.text }));
  }

  /** A REOPENED CLAIM IS OWED AGAIN, and without this the walk DEADLOCKS.
   *
   *  Three rules meet and close a loop (found live on i3, 2026-08-13):
   *
   *  - A claim reopened after its signature does not stand, so the state
   *    cannot be left.
   *  - `met` asks only whether the fields are FILLED, and they are, so the
   *    pull decides nothing is owed and serves no form.
   *  - A form payload with nothing owed is illegal (SE-C-110).
   *
   *  So the agent that reopened the claim can never re-earn it. Every submit
   *  is refused for having nothing to submit to, and the reopen mark stays.
   *
   *  The contract already says the submit IS the rebless, and that a newer
   *  signature clears the mark by itself. It could not, because no submit was
   *  reachable. This makes the form owed so that sentence can be true.
   *
   *  IT COST MOST OF AN AFTERNOON, and none of it looked like this: the state
   *  was reported as a claim that does not stand, so the form was rewritten,
   *  reformatted and re-submitted repeatedly. The form was never the problem. */
  private formReopened(name: string): boolean {
    try {
      const it = this.declIteration(this.currentMachine());
      if (it === undefined) return false;
      const fm = noteOf(this.evidenceAbs(it, name))?.frontmatter;
      return fm !== undefined && reopenedAfterSigning(fm);
    } catch {
      return false; // an unreadable claim is the tick's refusal to name, not this one's
    }
  }

  /** THE CORPUS CHECK'S VERDICT ON ONE STATE, or an empty list.
   *
   *  A claim can be complete, signed, and still refused: the form lint asks
   *  whether the fields are filled, and the corpus check asks whether what
   *  they say survives against the trace as it now stands. The second is the
   *  one that keeps a walk from leaving a state, and it had no voice anywhere
   *  the walk could hear it.
   *
   *  EMPTY MEANS NOTHING TO SAY — either the claim stands, or the state has no
   *  claim, or it could not be read. None of those is a stall this can explain,
   *  and inventing a reason would be worse than the silence it replaces. */
  private claimStall(stateId: string): string[] {
    try {
      const m = this.currentMachine();
      const bare = stateId.slice(stateId.lastIndexOf("/") + 1);
      const decl = m.states.find((s) => s.id === bare);
      if (decl === undefined || decl.evidence_form.length === 0) return [];
      if (new Set(this.recordDone(m)).has(bare)) return [];
      const it = this.declIteration(m);
      if (it === undefined) return [];
      const body = noteOf(this.evidenceAbs(it, bare))?.body;
      if (body === undefined) return [];
      return claimProblems(this.traceRoot(it), decl, body, loadTrace(this.traceRoot(it)));
    } catch {
      return [];
    }
  }

  /** A CLAIM THAT WILL NOT STAND IS THE OTHER WAY A ZERO-STEP ROUTE HAPPENS.
   *
   *  The objective is the work owed next. When it is the state the walk is
   *  standing IN, the route is legitimately zero steps — and that means one of
   *  two opposite things:
   *
   *  - the state is done, and the walk has arrived;
   *  - the state's claim is refused, so the walk cannot leave it and the
   *    objective can never move off it.
   *
   *  Both used to answer "the target is where the walk already stands". The
   *  second is a STALL wearing an arrival's words, and it is SILENT: no
   *  completion is attempted, so no guard fires to explain it.
   *
   *  i3 sat in exactly this for an afternoon over two unclaimed engine files,
   *  with the sweep's verdict computed on every pull and shown nowhere.
   *
   *  THE FORM LINT CANNOT SEE IT. The form was met and signed; only the corpus
   *  check knows. This is the one place in the pull that can ask. */
  private stalledClaim(
    r: { found: boolean; from?: string },
    head: () => Record<string, unknown>,
    extra: () => Record<string, unknown>,
  ): Record<string, unknown> | undefined {
    if (!r.found) return undefined;
    const at = r.from ?? this.active()[0] ?? "";
    const stalled = this.claimStall(at);
    if (stalled.length === 0) return undefined;
    return {
      pull: "do",
      ...head(),
      stopped_at: at,
      refusal: {
        kind: "rejected",
        clause: CLAUSES.CONDITION_UNMET,
        expected: `${at}'s claim to stand, so the walk can leave it`,
        got: `the route cannot move: ${at} IS the next work owed, and its claim does not pass its own checks — ${stalled.join(" · ")}`,
        remedy: {
          tool: "se_pull",
          args: {},
          note: "fix what is named, then submit the form again — the claim re-stamps and the route opens",
        },
        source: "engine/session.ts route",
      },
      do: "the stopped step says what it wants — do that, then pull again",
      ...extra(),
    };
  }

  private formsMet(names: string[]): boolean {
    try {
      return names.every((n) => this.formLint(n).met && !this.formReopened(n));
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
  /** THE AGENT'S COPY OF A FORM, without the reference corpus.
   *
   *  Every form carries `ref_paths` and `ref_facts`: the path, statement and
   *  breaks_if_removed of EVERY node in the record. The mirror needs them — a
   *  card asking which of two rows matters more cannot be answered from two
   *  ids. That need is real, and it is the MIRROR's.
   *
   *  The agent renders no cards. It reads ids and opens the files itself. So it
   *  was paying for 467 nodes of facts on every single form: measured at about
   *  380,000 characters against 3,700 for an ordinary answer. A hundred times
   *  the size, for something never read.
   *
   *  IT COST A DIAGNOSIS, NOT ONLY TOKENS. The same answer carries `problems`,
   *  naming exactly which check refuses a claim. At that size the host moves
   *  the response to disk and every reader truncates it, so the one field that
   *  explains a stuck state is the one field that never arrives. i3 sat blocked
   *  on precisely that.
   *
   *  THE MIRROR'S COPY IS UNTOUCHED — formGet still returns everything.
   *
   *  THIS IS THE NARROW REPAIR. The general rule the owner ruled on 2026-08-13
   *  is a size limit on every lane answer with a handle to page the rest, so
   *  the class cannot come back somewhere else. That is retro work. */
  private formForAgent(name: string): Record<string, unknown> {
    return this.agentCopy(this.formGet(name) as Record<string, unknown>, false);
  }

  /** EMPTY IS NOT INFORMATION. A key whose value is "", 0, [], {} or null says
   *  nothing the key's absence does not, and it costs a line either way.
   *  `false` is excluded on purpose — it is an answer, not a blank. */
  private static blank(v: unknown): boolean {
    if (v === null || v === undefined) return true;
    if (typeof v === "string") return v === "";
    if (typeof v === "number") return v === 0;
    if (typeof v === "boolean") return false;
    if (Array.isArray(v)) return v.length === 0;
    return Object.keys(v as object).length === 0;
  }

  /** One dictionary with every blank pruned, recursively. Returns undefined
   *  when nothing survives, so the caller can drop the key entirely. */
  private static pruned(rec: unknown): Record<string, unknown> | undefined {
    if (rec === null || typeof rec !== "object" || Array.isArray(rec)) return undefined;
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(rec as Record<string, unknown>)) {
      const kept = v !== null && typeof v === "object" && !Array.isArray(v) ? Session.pruned(v) : Session.blank(v) ? undefined : v;
      if (kept !== undefined) out[k] = kept;
    }
    return Object.keys(out).length === 0 ? undefined : out;
  }

  /** WHAT THE AGENT CAN ACTUALLY USE, and nothing else. Measured on i11's own
   *  walk: one ordinary pull answered 290,280 bytes, of which 5,080 lines out
   *  of 5,311 were things no agent reads.
   *
   *  FOUR THINGS COME OFF, and each is a different kind of waste.
   *
   *  - `ref_paths` and `ref_facts`, the whole record's corpus. The MIRROR needs
   *    them to render a card from two ids; the agent opens the file instead.
   *  - Blank argument slots. A free-form field shipped 27 keys, every one "",
   *    [] or null, because the model carries a slot for every editor there is.
   *  - `template.fields`, which restates `fields` name for name.
   *  - On an ECHO, the field bodies. The agent wrote them one call ago.
   *
   *  THE ECHO IS THE ONLY PLACE BODIES GO. A form that is OWED keeps its
   *  content, because a half-filled form coming back must show what already
   *  stands — that is exactly what stops a recheck being answered from
   *  scratch. What is dropped is the copy handed straight back to whoever
   *  just sent it. */
  private agentCopy(form: Record<string, unknown>, echo: boolean): Record<string, unknown> {
    const { ref_paths: _paths, ref_facts: _facts, field_args, field_hints, template_meta, template, fields, ...rest } = form;
    const out: Record<string, unknown> = { ...rest };
    for (const [key, value] of [
      ["field_args", field_args],
      ["field_hints", field_hints],
      ["template_meta", template_meta],
    ] as const) {
      const kept = Session.pruned(value);
      if (kept !== undefined) out[key] = kept;
    }
    if (template !== null && typeof template === "object") {
      const { fields: _dup, ...restTemplate } = template as Record<string, unknown>;
      const kept = Session.pruned(restTemplate);
      if (kept !== undefined) out.template = kept;
    }
    if (Array.isArray(fields)) {
      out.fields = fields.map((f) => {
        const field = f as Record<string, unknown>;
        if (!echo) return field;
        const { content, prefills: _pre, ...head } = field;
        // THE LENGTH STANDS IN FOR THE BODY. It proves the text landed whole,
        // which is the one thing the sender cannot check for itself.
        return { ...head, chars: typeof content === "string" ? content.length : 0 };
      });
    }
    return out;
  }

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
    if (existsSync(join(this.machineRoot(), formTemplatePath(name)))) return false;
    return m.states.some((s) => s.id === name && s.evidence_form.length > 0);
  }

  /** Where the instance lives: the record whose machine carries the state
   *  (its evidence folder ON ITS BRANCH), the bound record as fallback,
   *  or the session store when neither exists. */
  private stateFormHome(name: string, m: MachineDecl = this.currentMachine()): { instanceAbs: string; instanceRel: string } {
    const it = itList(this.machineRoot()).find((x) => x.open && itShortId(x.id) === m.id);
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
    return { instanceAbs: join(this.machineRoot(), rel), instanceRel: rel };
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
      const b = JSON.parse(readFileSync(join(this.machineRoot(), "project", "deliverable", "brand", "brand.json"), "utf8")) as {
        name?: string;
      };
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
      ...(s !== undefined ? { level: levelName(loadLevels(this.machineRoot()), s.priority) } : {}),
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
        if (n.file !== undefined) out[n.id] = relative(this.machineRoot(), n.file).split(sep).join("/");
      }
    } catch {
      // no corpus, no links — the ids still read
    }
    // THE METHOD CARDS TOO, so a [[link]] in guidance is a link. A pointer
    // the reader cannot follow is decoration: it costs a line, teaches the
    // name of a file, and leaves them to find it by hand.
    for (const dir of ["methods", "items", "forms/templates", "lint"]) {
      const abs = join(this.machineRoot(), "project", "deliverable", "machines", ...dir.split("/"));
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
          : itList(this.machineRoot())
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
      this.machineRoot(),
      scanGuidance(this.machineRoot()),
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
    // AN OWED BOX IS NOT GREEN, AND IT DOES NOT DISAPPEAR (owner ruling
    // 2026-08-13). It never contributes to `problems` once its ref resolves,
    // so it has to ride somewhere else or a debt behind a clean submit would
    // be invisible to the next reader — this is that somewhere else, on the
    // same object a gate reads as the state's verdict.
    const owed = templateOwed(model, fills, this.traceRoot(forIt));
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
      // NAMED, NOT JUST COUNTED. A debt visible only as a number invites a
      // reader to skim past it; the ref is what lets the next person go
      // look (owner ruling 2026-08-13).
      owed_count: owed.length,
      owed,
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
        // THE SIGNATURE TIME COMES OUT OF THIS READ (i33, 2026-08-17). The
        // ripple's time half needs it for every claim, and fetching it in a
        // second pass over the same files put recordDone at 1117 ms over 200
        // nodes against a 1000 ms budget — this iteration's own one-second
        // rule catching this iteration's own change, which is exactly what
        // req-one-operation-reads-its-input-once says.
        //
        // THE TIME IS THE SIGNATURE AND ONLY THE SIGNATURE. An amend does not
        // move it; a reopen followed by a fresh signature does (owner ruling
        // 2026-08-17, given twice). THIS COMMENT SAID THE OPPOSITE for most of
        // a day, four thousand lines from the correction on claimTime itself,
        // and a reader of standingClaims met the wrong one first.
        pass.times ??= new Map();
        pass.times.set(s.id, claimTime(fm));
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

  /** THE FEEDERS THIS CLAIM IS OLDER THAN — the ripple's time half, seen from
   *  one state rather than across the graph. Empty means nothing moved under
   *  it, which is the ordinary answer. */
  private staleFeeders(stateId: string): string[] {
    const m = this.currentMachine();
    const it = this.declIteration(m);
    if (it === undefined) return [];
    const claimful = new Set(m.states.filter((s) => s.evidence_form.length > 0).map((s) => s.id));
    const feeders = claimFeeders(m, stateId, claimful);
    if (feeders.length === 0) return [];
    // ASKED ONCE, ABOUT ONE STATE. This is the diagnostic path rather than the
    // walk's, so it reads only the two ends it compares.
    const times = this.signedTimes(it, [stateId, ...feeders]);
    const mine = times.get(stateId);
    if (mine === undefined) return [];
    return feeders.filter((f) => (times.get(f) ?? "") > mine);
  }

  /** WHEN EACH STANDING CLAIM WAS SIGNED, for the staleness half of the
   *  ripple. ABSENT IS NOT ZERO: a state with no signature is left out of the
   *  map rather than given an empty time, so it can never read as older than
   *  everything. An unsigned claim is not in the green set to begin with. */
  private signedTimes(it: Iteration, ids: Iterable<string>): Map<string, string> {
    const out = new Map<string, string>();
    for (const id of ids) {
      const fm = noteOf(this.evidenceAbs(it, id))?.frontmatter;
      const at = fm === undefined ? "" : claimTime(fm);
      if (at !== "") out.set(id, at);
    }
    return out;
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
    // GROUND THAT MOVED AND CAME BACK GREEN COUNTS TOO (owner ruling
    // 2026-08-17). Colour alone cannot see a feeder that was EDITED and
    // re-signed in the same breath: it is green again before anything
    // downstream looks, so the walk sails through claims that answered the
    // OLD question. i33's kickoff replaced its one prose goal with a list of
    // five, and ten signed states below it never noticed — the walk ran
    // straight through two gates that had never heard of four of the goals.
    //
    // SO THE SECOND COMPARE IS TIME. A claim signed BEFORE its feeder's
    // current signature answered older ground, and stale is not green.
    //
    // Run to a FIXED POINT: knocking one out can knock out what stood on it.
    // ALREADY COLLECTED, by the pass over these same files just above.
    const signedAt = pass.times ?? new Map<string, string>();
    for (let changed = true; changed; ) {
      changed = false;
      for (const id of [...green]) {
        const feeders = claimFeeders(decl, id, claimful);
        const mine = signedAt.get(id);
        const stale = mine !== undefined && feeders.some((f) => (signedAt.get(f) ?? "") > mine);
        if (!stale && feeders.every((f) => green.has(f))) continue;
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

  /** The gates whose claims carry a bless — the thumbs-up overlay's truth.
   *
   *  A BLESS ONLY COUNTS WHILE THE CLAIM STANDS (owner ruling 2026-08-17).
   *  The thumb adjudicates ONE body of work. When the ground under it moves
   *  the adjudication is about something that is no longer there, so the thumb
   *  falls with the green and the person is asked again.
   *
   *  IT IS READ FROM THE GREEN SET, NOT FROM THE FILE. The ripple is a graph
   *  walk and never touches frontmatter, so a stale gate still carries its
   *  `bless:` line on disk — and used to keep painting a thumbs-up over work
   *  that had fallen out from under it. */
  blessedGates(decl: MachineDecl, painted?: Set<string>): string[] {
    const it = this.declIteration(decl);
    if (it === undefined) return [];
    // THE CALLER USUALLY HAS THE SET ALREADY. render.ts computes recordPaint
    // one line above this call, and recomputing it here would be a second
    // full green pass over the same corpus in the same operation — the exact
    // shape i33 exists to remove. Absent, it is computed once.
    const standing = painted ?? new Set(this.recordPaint(decl));
    const out: string[] = [];
    for (const s of decl.states) {
      if (s.kind !== "gate" || !standing.has(s.id)) continue;
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
      const open = itList(this.machineRoot()).filter((x) => x.open);
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
    const moved = iterationDrift(this.machineRoot(), it).filter((id) => decl.states.some((s) => s.id === id));
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
    if (!pinIsStale(this.machineRoot(), it)) return;
    const moved = iterationDrift(this.machineRoot(), it);
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
    repinColumn(this.machineRoot(), it);
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
  reopenClaim(name: string, reason: string, by: string, machineId?: string, confirm?: boolean): Record<string, unknown> {
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
    // SAY WHAT IT WILL DROP, BEFORE DROPPING IT (i27, 2026-08-14).
    //
    // A reopen keeps the SIGNATURE and se_reopen says so. It does not keep
    // the BLESS, and nothing said so. On 2026-08-14 a reopen taken on the
    // engine's own bad advice erased a person's adjudication, and the walk
    // stopped until they were asked again.
    //
    // A signature records who wrote it. A bless records who ADJUDICATED it,
    // and at a low dial only a person can. Losing one silently is not the
    // same kind of loss, so this one is confirmed rather than assumed.
    const blessedBy = parseStateNote(raw).frontmatter.bless;
    const byAPerson = typeof blessedBy === "string" && blessedBy.includes("human");
    if (byAPerson && confirm !== true) {
      const falls = this.wouldFall(name, m);
      throw new Rejection({
        clause: CLAUSES.CONDITION_UNMET,
        expected: "a confirmed reopen — this one destroys a person's adjudication",
        got: `${name} carries "${blessedBy}", and a reopen drops it. ${falls.length} state(s) fall with it: ${falls.join(", ") || "none"}`,
        remedy: {
          tool: "se_reopen",
          args: { state: name, reason, confirm: true },
          note: "if the claim's own content still passes, se_amend fixes the field and LEAVES THE TREE STANDING — the bless with it. Reopen only when the work is genuinely wrong.",
        },
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

  /** WHAT A REOPEN OF THIS STATE WOULD TAKE WITH IT.
   *
   *  Green ripples through the feeders, so everything downstream of a
   *  reopened claim falls. Counting it BEFORE the write is what turns a
   *  surprise into a decision. */
  private wouldFall(name: string, m: MachineDecl): string[] {
    const standing = new Set(this.recordDone(m));
    if (!standing.has(name)) return [];
    const claimful = new Set(m.states.filter((s) => s.evidence_form.length > 0 || s.submachine !== undefined).map((s) => s.id));
    return [...standing].filter((s) => s !== name && claimful.has(s) && claimFeeders(m, s, claimful).includes(name));
  }

  /** THE PATCH HALF OF AN AMEND. `fills` rewrites a field WHOLE, which for a
   *  renamed reference or a typo means resending two thousand characters to
   *  change eleven — and every resend is a chance to lose a paragraph nobody
   *  meant to touch.
   *
   *  SO AN OP IS old_string → new_string, matched against the field as it
   *  stands. It must match EXACTLY ONCE, or the caller says `all: true` and
   *  means every occurrence. Zero matches and an ambiguous match both refuse,
   *  for the reason se_file_patch refuses them: a patch that lands somewhere
   *  other than where its author looked is worse than no patch.
   *
   *  OPS AND FILLS COMPOSE. Several ops against one field chain, each seeing
   *  the last one's result; a `fills` entry for the same field wins, because
   *  a whole rewrite is unambiguous. */
  private amendOps(raw: string, ops: AmendOp[], name: string): Record<string, string> {
    const out: Record<string, string> = {};
    for (const op of ops) {
      const field = String(op.field ?? "");
      const body = out[field] ?? fieldContent(raw, field);
      const refuse = (expected: string, got: string): never => {
        throw new Rejection({
          clause: CLAUSES.CONDITION_UNMET,
          expected,
          got,
          remedy: {
            tool: "se_amend",
            args: {
              state: name,
              ops: [{ field, old_string: "<text as it stands>", new_string: "<what it becomes>" }],
              reason: "<what was wrong>",
            },
            note: "read the field on the pull first — old_string must be the text exactly as the form carries it",
          },
          source: "engine/session.ts amend",
        });
      };
      if (body === undefined) refuse(`a section called ${field} on ${name}`, "no such section in the form");
      const old = String(op.old_string ?? "");
      if (old === "") refuse("old_string — the text being replaced", "an empty old_string");
      const hits = (body as string).split(old).length - 1;
      if (hits === 0) refuse(`old_string to appear in ${field}`, "it does not appear — nothing was changed");
      if (hits > 1 && op.all !== true) {
        refuse(
          `old_string to appear once in ${field}`,
          `it appears ${String(hits)} times — say all: true to replace every one, or give more surrounding text`,
        );
      }
      const next = String(op.new_string ?? "");
      out[field] = op.all === true ? (body as string).split(old).join(next) : (body as string).replace(old, next);
    }
    return out;
  }

  amendClaim(
    name: string,
    fillsIn: Record<string, string>,
    reason: string,
    by: string,
    machineId?: string,
    ops: AmendOp[] = [],
    chain = false,
  ): Record<string, unknown> {
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
    // THE OPS RESOLVE AGAINST THE FILE AS IT STANDS, and become fills. From
    // here down there is one path, so every guard below — the check re-run,
    // the restore, the refusal that names se_reopen — covers both shapes
    // without knowing which was used.
    const fills = { ...this.amendOps(raw, ops, name), ...fillsIn };
    const feeding = FEEDS_DOWNSTREAM.find((f) => name.endsWith(f.state) && fills[f.field] !== undefined);
    if (feeding !== undefined) {
      throw new Rejection({
        clause: CLAUSES.CONDITION_UNMET,
        expected: `an amend to a field this state keeps to itself — ${feeding.field} is read by ${feeding.reads}`,
        got: `an amend to ${feeding.field} — that is a reopen rather than a correction`,
        remedy: {
          tool: "se_reopen",
          args: { state: name, reason: "<what the states below must now answer differently>" },
          note: "an amend leaves every claim below standing, so a change here would slip past every state that answers it. A changed question is a reopen: those states go grey and earn their answers again.",
        },
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
          args: {
            state: name,
            ops: [{ field: "<field>", old_string: "<text as it stands>", new_string: "<what it becomes>" }],
            reason: "<what was wrong>",
          },
          note: "ops patch a field in place; fills rewrite one whole. One of the two, and always a reason",
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
    // AN AMEND LEAVES THE SIGNATURE'S DATE ALONE, and the comment that once
    // stood here argued the opposite from a wrong diagnosis. Both halves of
    // that argument were false, and the correction is kept because the wrong
    // reasoning is easy to reach again.
    //
    // A TIMESTAMP DOES NOW PLAY A PART, and this paragraph is kept with the
    // correction on top (i33, 2026-08-17). It used to end "a date plays no
    // part", which was true until the ripple gained its time half. A claim
    // signed BEFORE its feeder's current claim time is stale, and claimTime
    // counts an amend as freshly as a signature.
    //
    // SO AMENDING A STATE NOW GREYS EVERYTHING BELOW IT. That is the ripple
    // working rather than a defect, and it is why `chain` exists: ten hand
    // amends down one chain, three times in one afternoon, is what it costs
    // without it.
    //
    // WHAT THE PARAGRAPH STILL GETS RIGHT: the guard does not compare the
    // signature against the corpus. standingClaims reads that a signature is
    // PRESENT, that the form is not reopened after signing, and that
    // claimProblems comes back empty.
    //
    // IT CLAIMED SEVEN AMENDS UP A SIX-LEVEL CHAIN CLEARED NOTHING. They
    // cleared nothing because they were aimed at the wrong states. The chain
    // had ONE root: write-stories listed sty-work-on-two-machines, which had
    // been deleted, so its own content genuinely stopped passing. One amend
    // at that root cleared all six levels at once.
    //
    // WHY THE ROOT WAS HARD TO SEE, which is the part worth keeping. A
    // fallen_input names the FIRST fallen input of the state that refused,
    // never the root of the chain, and it attaches fallenRemedy's verdict for
    // THAT state. So the refusal recommended se_amend on a state whose own
    // content was fine, and following it changed nothing. se_why walks one
    // level per call and reaches the root; the refusal does not.
    //
    // AND RE-STAMPING WOULD HAVE BEEN A LIE. The panel shows the signing date
    // to a person. Moving it on every amend destroys when the claim was
    // actually signed, to satisfy a check that never reads it.
    const chained = chain ? this.refreshChain(name, m, reason, by) : {};
    this.notifyChange();
    return { amended: name, fields: Object.keys(fills), why: reason.trim(), by, signature_kept: true, ...chained };
  }

  /** RE-FRESHEN EVERYTHING BELOW A MENDED CLAIM, in one act (owner ask
   *  2026-08-17: one act that re-freshens a whole chain).
   *
   *  WHY IT IS NEEDED. The ripple's time half greys every claim standing on a
   *  state that was just amended. Each is usually fine and each needed a
   *  hand-written amend of its own. i33 walked ten states that way, three
   *  times in one afternoon, writing sentences whose only content was that
   *  nothing had changed.
   *
   *  IT CANNOT WAVE A DEFECT THROUGH, and that is the whole design. A state is
   *  re-freshened only where its OWN checks come back clean. One that does not
   *  is left exactly as it stands and NAMED in the answer, so a real break
   *  surfaces rather than being buried under a bulk stamp.
   *
   *  IT STAMPS `amended:` AND NEVER `signed_off:`, like every other amend. The
   *  signing date is what a person reads off the panel. */
  private refreshChain(from: string, m: MachineDecl, reason: string, by: string): Record<string, unknown> {
    const refreshed: string[] = [];
    const held: string[] = [];
    const why = `carried down from ${from}: ${reason.trim()}`;
    const when = new Date().toISOString();
    for (const id of downstreamCone(m, [from])) {
      const s = m.states.find((x) => x.id === id);
      if (s === undefined || s.evidence_form.length === 0) continue;
      const h = this.stateFormHome(id, m);
      if (!existsSync(h.instanceAbs)) continue;
      // THROUGH THE SHARED READER, never a direct read. readNode gives every
      // other reader in this operation the same parse, and the door's own
      // guard counts a bypass the day it appears.
      const raw = readNode(h.instanceAbs);
      if (raw === "" || typeof parseStateNote(raw).frontmatter.signed_off !== "string") continue;
      let problems: string[];
      try {
        problems = (this.stateFormGet(id, m) as { problems?: string[] }).problems ?? [];
      } catch {
        held.push(`${id} could not be read`);
        continue;
      }
      if (problems.length > 0) {
        held.push(`${id}: ${problems.join(" · ")}`);
        continue;
      }
      writeFileSync(h.instanceAbs, withAmended(raw, when, by, why), "utf8");
      refreshed.push(id);
    }
    return {
      chain: {
        refreshed,
        ...(held.length > 0 ? { held } : {}),
        note:
          held.length > 0
            ? `${String(refreshed.length)} claim(s) re-freshened; ${String(held.length)} left standing because their own checks do not pass — those are defects rather than ripple`
            : `${String(refreshed.length)} claim(s) re-freshened, every one of them clean on its own checks`,
      },
    };
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
        expected: `a hand above this gate's weight — ${this.tierFor(s.priority).tier ?? "heavier"} work, or the person's thumb in the form`,
        got: `the agent stands at ${this.tierFor(this._autonomy).tier ?? "a lower rung"}`,
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
        // ONLY A CELL THAT MOVED IS WRITTEN (owner ruling 2026-08-16, after
        // probe-assumptions could not be submitted without round-tripping
        // twenty-two probe results it was not asked to change).
        //
        // The table is a view over EVERY standing node, so a state answering
        // three empty cells resends two dozen it never touched. Anything that
        // shortens a large payload between the agent and the engine then lands
        // on somebody else's evidence. Comparing before writing makes that
        // whole class impossible: an unchanged cell cannot damage its node,
        // whatever happened to it on the way here.
        let moved = false;
        cols.forEach((c, i) => {
          const v = (cells[i + 1] ?? "").replace(/\\\|/g, "|");
          const isListNow = nodeField(file, c) === "" && nodeList(file, c).length > 0;
          const current = isListNow ? nodeList(file, c).join(" · ") : nodeField(file, c);
          if (v === current) return;
          // A CELL THAT TRAILS OFF NEVER LANDS. Something between the agent
          // and the engine shortens a large table — the engine writes no
          // ellipsis of its own, and the nodes on disk carry none — so a cell
          // ending in one is a fragment of an answer rather than an answer.
          // The submit refuses it separately and says so; this stop is what
          // guarantees the node keeps its intact value meanwhile.
          if (/(?:…|\.\.\.)\s*$/.test(v)) return;
          moved = true;
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
        if (!moved) continue;
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
  /** Is this submachine still the pin's placeholder? The same question the
   *  entry guard asks before refusing to walk into one, asked here so a
   *  placeholder is not counted as an input it can never satisfy. A drawing
   *  that will not compile is not a scaffold — it is broken, and the entry
   *  guard reports that with its own clause. */
  private submachineIsScaffold(name: string): boolean {
    try {
      const decl = compileMachineCached(this.machineRoot(), resolveRef(this.machineRoot(), mainMachinePath(this.machineRoot()), name));
      // Written with ?? rather than an equality on purpose. scaffold-entry's
      // inspection anchors on the entry guard's literal and takes the FIRST
      // match in this file, so a second copy of that phrase up here silently
      // pointed the assertion at the wrong block.
      return decl.scaffold ?? false;
    } catch {
      return false;
    }
  }

  private feedersUnsigned(fm: MachineDecl, state: StateDecl): string[] {
    const REQUIRED = new Set(["normal", "approval"]);
    // A PLACEHOLDER THAT RUNS A SUBMACHINE IS AN INPUT TOO (owner instruction
    // 2026-08-15, after i28 stamped six states on top of an unfinished one).
    //
    // THE TWO GUARDS DISAGREED ABOUT WHAT AN INPUT IS. claimBlockers builds
    // `claimful` as `evidence_form.length > 0 || submachine !== undefined`.
    // This filter tested only the first half, so a `runs:` placeholder was not
    // a feeder here at all and the submit stamped straight over an unseeded
    // fan.
    //
    // THAT IS THE WORST SHAPE AVAILABLE: green everywhere at the submit, and a
    // dead chain found six states later by the claim-guard. The refusal never
    // landed where the work was, so nothing could be fixed while it was cheap.
    // AN UNAUTHORED SCAFFOLD IS NOT AN INPUT, and the line above without this
    // one deadlocked i28 at gate-validation on 2026-08-15.
    //
    // THE SHAPE OF THE DEADLOCK, because it is not obvious. A gate fed by a
    // `runs:` placeholder nobody has authored can never be filled: the gate
    // owes no form while a feeder is unsigned (standingStateFormOwed), and the
    // feeder can never sign, because ENTERING an unauthored scaffold is itself
    // refused a few hundred lines below. The walk had no legal move left.
    //
    // IT ALSO BROKE A RULE THAT HELD BEFORE. i27 shipped through this same
    // gate with demos unauthored, which was legal and still is. Counting the
    // placeholder made a past-legal walk impossible, which is the tell that
    // the widening went one step too far.
    //
    // SO THE TEST IS AUTHORED-NESS, NOT EXISTENCE. An AUTHORED submachine is a
    // real input and still guards — that is the defect the owner reported the
    // same morning, where six states stamped on top of an unfinished fan. An
    // unauthored one means nobody planned that work, and the state that would
    // author it is the real input.
    const feeders = fm.states.filter(
      (p) =>
        (p.evidence_form.length > 0 || (p.submachine !== undefined && !this.submachineIsScaffold(p.submachine))) &&
        p.edges.some((e) => e.to === state.id && REQUIRED.has(e.role ?? "normal")),
    );
    if (feeders.length === 0) return [];
    // A SUBMACHINE STATE HAS NO SIGNATURE TO READ, so it is asked the question
    // the claim-guard asks instead: does the record call it done. An unseeded
    // drawing answers no, because drawingDone catches viewFor's refusal.
    //
    // COMPUTED ONLY WHERE SUCH A FEEDER EXISTS. recordDone paints the whole
    // machine and this runs on the submit path, so it stays off the hot path
    // for every state fed only by ordinary forms.
    let done: Set<string> | undefined;
    const finished = (p: StateDecl): boolean => {
      if (p.evidence_form.length === 0) {
        done ??= new Set(this.recordDone(fm));
        return done.has(p.id);
      }
      try {
        return (this.stateFormGet(p.id, fm) as { signed?: boolean }).signed === true;
      } catch {
        return false;
      }
    };
    const unsigned = feeders.filter((p) => !finished(p));
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

  /** EVERY CONDITION HOLDING A STATE GREY, collected instead of thrown.
   *
   *  The walk has always known this. It computed the conditions one at a time
   *  and threw the FIRST one that failed, so the answer to "why is this grey"
   *  existed for a microsecond and was discarded. Asking it took a cluster of
   *  shell probes against files the lane already holds.
   *
   *  ONE MECHANISM, TWO CALLERS. `assertStateFormMet` throws the first of
   *  these; `se_why` reports all of them. A second copy of the reasoning would
   *  drift, and the drift would be invisible — the verb would explain a state
   *  the walk judges by other rules.
   *
   *  THE ORDER IS THE WALK'S OWN, so the first entry is exactly what the next
   *  pull would refuse with.
   *
   *  WHAT IS NOT HERE, deliberately: the autonomy dial. The dial governs the
   *  HOP, not the state — a step above the dial is not grey, it is waiting for
   *  a person. Reporting it as a blocker would tell somebody to fix a claim
   *  that is already fine. */
  /** WHAT HOLDS A STATE'S CLAIM — the ripple and the content check, computed
   *  once and read by both callers.
   *
   *  THE WHY AND THE GUARD WERE TWO MECHANISMS (owner instruction 2026-08-14,
   *  in emergency). The completion guard ran the ripple over the claim's
   *  feeders and the content check over its fields. se_why ran NEITHER: it
   *  asked the form's own conditions and the feeders' signatures, which is a
   *  weaker question, because a feeder can be signed and still not standing
   *  when ITS feeder fell.
   *
   *  SO THE TWO DISAGREED ABOUT ONE STATE AT ONE MOMENT. i27 stood at
   *  cut-criteria with se_why reporting `standing: true, blockers: []` while
   *  the guard dropped it for an input that was not standing. The verb built
   *  to explain a block reported no block, and the record deadlocked.
   *
   *  ONE MECHANISM NOW INFORMS BOTH QUESTIONS. The guard throws the first
   *  entry; the verb lists them all. Neither computes anything of its own.
   *
   *  WHAT IS NOT HERE: the "neither signed nor standing" case. That is a
   *  completion-time sentence, and for a state simply not walked yet it says
   *  nothing `form_incomplete` has not already said. The guard keeps it as
   *  its own fallback. */
  /** WHAT IS WRONG WITH THIS ONE CLAIM'S OWN CONTENT, ignoring its feeders.
   *
   *  Extracted so the fallen-input remedy can ask it about the state that
   *  FELL, which is how the refusal knows whether to name se_amend or
   *  se_reopen. Asking about feeders here would recurse; the ripple already
   *  walks them. */
  private ownClaimProblems(stateId: string, m: MachineDecl): string[] {
    const decl = m.states.find((s) => s.id === stateId);
    if (decl === undefined) return [];
    try {
      // this.traceRoot(it) IN FULL, not a renamed local. A guard test greps
      // for exactly this spelling, because a claim check resolving against
      // the wrong record is the drift it catches.
      const it = this.declIteration(m);
      if (it === undefined) return [];
      const body = noteOf(this.evidenceAbs(it, stateId))?.body;
      if (body === undefined) return [];
      return claimProblems(this.traceRoot(it), decl, body, loadTrace(this.traceRoot(it)));
    } catch {
      return []; // an unreadable claim falls back to the plain sentence
    }
  }

  /** WHICH VERB FIXES A FALLEN INPUT, decided rather than guessed.
   *
   *  A claim loses its green two ways, and they want different verbs.
   *
   *  - ITS CONTENT STILL PASSES. The ripple dropped it because something
   *    upstream moved. A small correction goes in with se_amend, which LEAVES
   *    THE TREE STANDING.
   *  - ITS CONTENT NO LONGER PASSES. The work is genuinely wrong, and
   *    se_reopen sends it back to be re-earned.
   *
   *  se_reopen on the first case is what cost a bless on 2026-08-14. The
   *  resubmit dropped the person's adjudication and everything downstream
   *  fell with it. */
  private fallenRemedy(fallen: string, m: MachineDecl): { tool: string; args: Record<string, unknown>; note: string } {
    // A THIRD CASE, FOUND WHEN THE REMEDY STARTED NAMING THE ROOT (i6). The
    // first hop is always a state the walk has been through, so it always had
    // a form to amend. A ROOT NEED NOT HAVE ONE: the honest reason a chain
    // starts somewhere is often that nobody has walked there yet.
    //
    // se_amend on a form that was never submitted patches nothing and reads as
    // a refusal. There is no claim to fix — there is a state to walk.
    const signed = (this.stateFormGet(fallen) as { signed?: boolean }).signed === true;
    if (!signed) {
      return {
        tool: "se_aim",
        args: { to: fallen, go: true },
        note: `${fallen} has no standing claim to fix — its form is not submitted. Go there, fill it and submit; nothing between it and here can move first.`,
      };
    }
    const problems = this.ownClaimProblems(fallen, m);
    if (problems.length === 0) {
      // NEITHER CASE IS AN AMEND, and this used to say it was (corrected
      // 2026-08-17). An amend fixes WORDING and leaves the signature where it
      // is — and the signature is what says a claim answers today's ground.
      // A claim that is down with clean content is down for one of two
      // reasons, and amending is the wrong act for both.
      const stale = this.staleFeeders(fallen);
      if (stale.length > 0) {
        return {
          tool: "se_reopen",
          args: { state: fallen, reason: "<what the re-signed input above asks that it did not before>" },
          note: `${fallen}'s own content still passes. It is down because ${stale.join(", ")} was RE-SIGNED after it, so it answered older ground. Re-earning it is cheaper than it sounds: the pull hands the form straight back with a recheck block, body and signature both still on the file. Read what is written, confirm this change did not move it, and submit. The submit is the re-sign.`,
        };
      }
      return {
        tool: "se_why",
        args: { state: fallen },
        note: `${fallen}'s own content still passes and nothing about it needs fixing. It is down because something ABOVE it is down. Ask it what holds it — fixing anything here changes nothing until that root stands.`,
      };
    }
    return {
      tool: "se_reopen",
      args: { state: fallen, reason: "<why it stopped standing>" },
      note: `${fallen}'s own content no longer passes: ${problems.join(" ")}. That is a defect rather than a ripple, so it is re-earned rather than amended.`,
    };
  }

  /** THE RIPPLE NAMES ITS ROOT, NOT ITS FIRST HOP (i6).
   *
   *  A fallen claim usually fell because ITS input fell, and that one because
   *  its own did. The refusal named the first hop, so the reader amended a
   *  state that was merely waiting, watched nothing change, and asked again.
   *
   *  LIVED 2026-08-16, in this iteration: a value outside its vocabulary
   *  trapped the walk for ELEVEN calls four states later. Three amends were
   *  aimed at states that were fine. se_why found it in two, because se_why
   *  already walked the chain and the refusal did not.
   *
   *  A ROOT IS A FALLEN CLAIM WITH NO FALLEN INPUT OF ITS OWN. That is where
   *  work has to happen; everything between it and here is waiting.
   *
   *  THE PATH COMES BACK WITH IT, so the reader can see how a state four hops
   *  away is the reason this one will not go.
   *
   *  A CYCLE RETURNS NO ROOT, and the caller falls back to the first hop
   *  rather than reporting nothing.
   *
   *  req-a-ripple-names-its-root */
  claimBlockers(stateId: string, machine?: MachineDecl): Blocker[] {
    const m = machine ?? this.currentMachine();
    const decl = m.states.find((s) => s.id === stateId);
    if (decl === undefined || decl.evidence_form.length === 0) return [];
    const done = new Set(this.recordDone(m));
    if (done.has(stateId)) return [];
    const expected = `${stateId}'s claim to stand before it completes — it declares ${decl.evidence_form.length} evidence field(s)`;
    // NAME THE CLAIM THAT ACTUALLY FELL (i3, 2026-08-13). recordDone runs a
    // RIPPLE: green stops at the first input that is not green, because a
    // claim may be word for word fine and still rest on ground that moved.
    const claimful = new Set(m.states.filter((s) => s.evidence_form.length > 0 || s.submachine !== undefined).map((s) => s.id));
    const fallen = claimFeeders(m, stateId, claimful).filter((f) => !done.has(f));
    if (fallen.length > 0) {
      // THE ROOT, NOT THE FIRST HOP (i6). A cycle returns no root, and then
      // the first hop is still better than silence.
      const { roots, path } = fallenChain(m, stateId, done, claimful);
      const at = roots[0] ?? fallen[0];
      const chain =
        path.length > 1
          ? ` THE CHAIN STARTS AT ${roots.join(", ")}: ${path.join(" → ")}. Fixing anything between changes nothing until the root stands.`
          : "";
      return [
        {
          kind: "fallen_input",
          // THE NAMES TRAVEL AS DATA, so the chain walk behind se_why follows
          // this kind instead of reading past it.
          states: fallen,
          clause: CLAUSES.CONDITION_UNMET,
          expected,
          got: `${stateId}'s OWN claim may be fine. It is dropped because these inputs are not standing: ${fallen.join(", ")}.${chain}`,
          // NAME THE VERB, never just the word "re-earn" (i27, 2026-08-14).
          // This remedy used to say se_pull with no arguments, which only
          // repeats the refusal. The agent picked the verb whose NAME matched
          // the sentence, chose se_reopen where se_amend was right, and the
          // guess cost a person's bless and a six-milestone cascade.
          //
          // The engine already knows which verb fits, because it can ask the
          // fallen claim whether its OWN content still passes.
          //
          // AND IT ASKS THE ROOT (i6). Asking the first hop picked the verb
          // for a state that is merely waiting, so the answer was right about
          // the wrong subject.
          remedy: this.fallenRemedy(at, m),
          source: "engine/session.ts claim-guard",
        },
      ];
    }
    // AND WHEN NOTHING UPSTREAM FELL, SAY WHAT IS WRONG WITH THIS ONE (owner
    // instruction 2026-08-13). The content check knows which field failed and
    // what it wanted; a check reports in the words of the question IT asked.
    const own = this.ownClaimProblems(stateId, m);
    if (own.length > 0) {
      return [
        {
          kind: "claim_content",
          clause: CLAUSES.CONDITION_UNMET,
          expected,
          got: `${stateId}'s claim does not pass its own checks: ${own.join(" · ")}`,
          remedy: {
            tool: "se_pull",
            args: {},
            note: "fix the named field, then submit again — the claim re-stamps and the completion follows",
          },
          source: "engine/session.ts claim-guard",
        },
      ];
    }
    return [];
  }

  stateBlockers(stateId: string): Blocker[] {
    const out: Blocker[] = [];
    const lint = this.stateFormGet(stateId) as {
      met?: boolean;
      signed?: boolean;
      problems?: string[];
      instance?: string;
      gate?: boolean;
      bless?: string;
    };
    // A PLACEHOLDER OWES NO FORM, so it must never be reported as owing one
    // (owner, 2026-08-15). run-candidates declares `runs:` and no evidence at
    // all. Saying its "evidence form" was unfilled named a path no state ever
    // writes, and the only honest reading of that message is to go and write
    // the file by hand — which is exactly what happened.
    const here = this.currentMachine().states.find((s) => s.id === stateId);
    const owesForm = here === undefined || here.evidence_form.length > 0;
    if (owesForm && lint.met !== true) {
      out.push({
        kind: "form_incomplete",
        clause: CLAUSES.CONDITION_UNMET,
        expected: `the ${stateId} evidence form complete (${String(lint.instance)})`,
        got: (lint.problems ?? []).join(" · ") || "unfilled",
        remedy: { tool: "se_pull", args: {}, note: 'the pull serves the form; fill it, then finish with {"submit": true}' },
        source: "engine/session.ts stateform",
      });
    } else if (lint.signed !== true) {
      // ONLY WHEN COMPLETE. "Fill it" and "submit it" are the same instruction
      // twice on an unfilled form, and a list of two says the state is twice
      // as stuck as it is.
      out.push({
        kind: "unsubmitted",
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
        out.push({
          kind: "unsigned_feeder",
          states: feeders,
          clause: CLAUSES.CONDITION_UNMET,
          expected: `a state requires ALL its inputs — every feeder form signed before ${stateId} passes`,
          got: `unsigned feeders: ${feeders.join(", ")}`,
          remedy: { tool: "se_pull", args: {}, note: "walk the named states and submit their forms; this one passes after" },
          source: "engine/session.ts stateform",
        });
      }
    }
    // WHAT ACTUALLY HOLDS A PLACEHOLDER: its drawing. An unseeded one proves
    // nothing and drawingDone answers false, so the state never goes green and
    // everything under it falls. Naming the drawing points at the state that
    // authors it; naming a form points at a file to write by hand.
    if (here?.submachine !== undefined && !new Set(this.recordDone(this.currentMachine())).has(stateId)) {
      out.push({
        kind: "submachine_unfinished",
        clause: CLAUSES.CONDITION_UNMET,
        expected: `${stateId} runs a drawing — it is finished when every state that drawing declares is green`,
        got: "the drawing is unseeded or its states are not all green",
        remedy: {
          tool: "se_pull",
          args: {},
          note: "walk the state that AUTHORS the drawing and let it seed one; a drawing written by hand is not seeded and proves nothing",
        },
        source: "engine/session.ts stateform",
      });
    }
    // THE CLAIM'S OWN BLOCKERS, from the same mechanism the walk's guard
    // throws with. Before this the verb ran neither the ripple nor the
    // content check, so it answered `standing: true` for a state the guard
    // was dropping (owner instruction 2026-08-14).
    out.push(...this.claimBlockers(stateId));
    if (lint.gate === true && !(lint.bless ?? "").startsWith("blessed")) {
      out.push({
        kind: "unblessed_gate",
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
    return out;
  }

  private assertStateFormMet(stateId: string): void {
    // THE FIRST BLOCKER IS THE REFUSAL, unchanged. The walk refuses exactly
    // where it refused before, with the same clause and the same remedy.
    const first = this.stateBlockers(stateId)[0];
    if (first === undefined) return;
    const { kind: _kind, ...rejection } = first;
    throw new Rejection(rejection);
  }

  /** THE ROOT OF THE RIPPLE, followed to the end in ONE answer.
   *
   *  A grey state is usually grey because a feeder is unsigned, and that feeder
   *  because ITS feeder is. The verb named only the first hop, so finding the
   *  actual cause took one call per hop and the reader had to know to keep
   *  asking.
   *
   *  MEASURED 2026-08-16: four grey states in i11, and the cause was one
   *  register three states upstream naming three deleted requirements. Fixing
   *  three lines turned all four green in a single pull. The hunt for those
   *  three lines was the expensive part, and it was a chain of se_why calls.
   *
   *  A ROOT IS A GREY STATE WITH NO UNSIGNED FEEDER OF ITS OWN. That is where
   *  work actually has to happen; everything between is waiting. */
  private greyRoots(bare: string, seen: Set<string>): { state: string; blockers: Blocker[] }[] {
    if (seen.has(bare)) return [];
    seen.add(bare);
    let blockers: Blocker[];
    try {
      blockers = this.stateBlockers(bare);
    } catch {
      return [];
    }
    if (blockers.length === 0) return [];
    // BOTH KINDS OF UPSTREAM, READ AS DATA (i6). This parsed the feeder names
    // out of one blocker's sentence and ignored `fallen_input` entirely — so a
    // walk held by a ripple was told "the work is here" while the work was
    // three states upstream.
    const feeders = blockers
      .filter((b) => b.kind === "unsigned_feeder" || b.kind === "fallen_input")
      .flatMap((b) => b.states ?? [])
      .map((s) => s.slice(s.lastIndexOf("/") + 1))
      .filter((s) => s !== "");
    if (feeders.length === 0) return [{ state: bare, blockers }];
    const upstream = feeders.flatMap((f) => this.greyRoots(f, seen));
    // A FEEDER THAT READS AS UNSIGNED BUT HOLDS NOTHING leaves this state as
    // the root. Reporting nothing at all would be worse than reporting here.
    return upstream.length === 0 ? [{ state: bare, blockers }] : upstream;
  }

  /** THE VERB'S ANSWER. One state, every condition holding it, and a plain
   *  sentence saying which of the two cases you are in.
   *
   *  NO ARGUMENT MEANS WHERE THE WALK STANDS, which is the question somebody
   *  actually has when they ask. */
  whyGrey(stateId?: string): Record<string, unknown> {
    const at = stateId ?? this.active()[0];
    if (at === undefined) {
      return { state: null, standing: false, blockers: [], says: "the walk stands nowhere" };
    }
    // A QUALIFIED ID NAMES ITS OWN MACHINE. The form lookup takes the bare
    // name, so "iterations/i3/write-requirements" is asked as its last part.
    const bare = at.slice(at.lastIndexOf("/") + 1);
    let blockers: Blocker[];
    try {
      blockers = this.stateBlockers(bare);
    } catch (e) {
      // AN UNKNOWN STATE IS AN ANSWER, not a crash. The verb exists to be
      // asked from a position of not knowing, so it must survive a wrong name.
      return {
        state: at,
        standing: false,
        blockers: [],
        says: `${bare} could not be read as a state of this machine: ${String((e as Error).message)}`,
      };
    }
    if (blockers.length === 0) {
      // CONTENT PASSING IS NOT STANDING. The ripple's time half drops a claim
      // whose own text is fine, and staleness is not a content problem — so
      // this branch used to answer `stands, nothing holds it` for a claim the
      // walk could not step off, and sent the reader looking at the route and
      // the dial, neither of which was the reason.
      //
      // THE READER COULD ONLY FIND IT BY ASKING ABOUT THE STATE BELOW, whose
      // fallen_input names this one as the root. That works exactly one hop
      // from where they stand (owner, 2026-08-17, after ten states unstuck by
      // hand).
      const stale = this.staleFeeders(bare);
      if (stale.length > 0) {
        return {
          state: at,
          standing: false,
          blockers,
          says: `${bare}'s own content passes, and it is NOT standing. It was signed before ${stale.join(", ")} was RE-SIGNED, so it answered ground that has since moved. An amend will not clear this: an amend corrects wording and leaves the signature where it is, and a signature is what says a claim answers today's ground. The act is se_reopen. It is cheaper than it sounds — the pull hands the form straight back with a recheck block, the body and the signature both still on the file, and you read what is written, confirm this change did not move it, and submit. The submit is the re-sign.`,
        };
      }
      return {
        state: at,
        standing: true,
        blockers,
        says: `${bare} stands — nothing holds it. If the walk still will not go there, the reason is the route or the dial, not this state.`,
      };
    }
    // THE WHOLE CHAIN, NOT THE FIRST LINK. Asked about a state whose only
    // problem is an unsigned feeder, the answer used to name that feeder and
    // stop — so the reader asked again, and again, until they reached the
    // state that actually needs work.
    const roots = this.greyRoots(bare, new Set()).filter((r) => r.state !== bare);
    return {
      state: at,
      standing: false,
      blockers,
      ...(roots.length > 0 ? { root: roots } : {}),
      says:
        roots.length === 0
          ? `${bare} is held by ${blockers.length}: ${blockers.map((b) => b.kind).join(", ")}. The first is what the next pull refuses with. Nothing upstream is waiting — the work is here.`
          : `${bare} is WAITING, not broken. The work is at ${roots.map((r) => r.state).join(", ")}, held by ${roots.map((r) => r.blockers.map((b) => b.kind).join("/")).join(" · ")}. Fix that and this goes green with it.`,
    };
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
      this.machineRoot(),
      scanGuidance(this.machineRoot()),
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
        docs.push({ path: i.path, content: readFileSync(join(this.machineRoot(), i.path), "utf8") });
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
      // A CONDITION JUDGES THE TREE THE LANE WRITES TO, never the repo root.
      // It ran with the machine root, so a state's check read trunk while every file
      // verb wrote to the bound worktree. The agent was asked to satisfy a
      // check it had no write path to: i28's rank-unknowns refused on a
      // register node that does not exist in its tree, and no lane verb could
      // reach the file being complained about.
      // TWO ROOTS, BECAUSE A SCRIPT NEEDS BOTH. The corpus it judges is the
      // bound record's, and `.se/` is session state that belongs to the
      // machine — the same split laneRoot already enforces for every path.
      // Handing over only the work tree broke the outward-search check, which
      // reads the call log to prove a search actually ran.
      const where = this.workRoot();
      const child = spawn("node", [abs, "--root", where], {
        cwd: where,
        env: { ...process.env, SE_HOME: seDir(this.machineRoot()) },
      });
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
      // A CONDITION SCRIPT MAY LEGITIMATELY BE LONG. 120 seconds was sized for
      // a check that reads the corpus; verification's script runs the whole
      // battery, which tools.ts already records as "long BY DESIGN now that
      // boot walks read real guidance — 150s killed it mid-run". A cap that
      // kills the battery reads as a red that never happened.
      const timer = setTimeout(() => child.kill(), 600_000);
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
        const abs = resolveInRoot(this.machineRoot(), rel, "engine/session.ts script");
        const r = await this.spawnScript(abs);
        // THE TAIL, BECAUSE ENDS CARRY VERDICTS. A head slice keeps the run's
        // opening banner and drops the failing tests block, which is the only
        // part of a red anybody needs. Seen on this state's own first red:
        // 4000 characters of passing cases and not one failure.
        const whole = r.out.trim();
        const out = whole.length <= 4000 ? whole : `…[${String(whole.length - 4000)} earlier chars]\n${whole.slice(-4000)}`;
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
      return contentHash(readFileSync(resolveInRoot(this.machineRoot(), rel, "engine/session.ts reads")));
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
      for (const d of pulledFor(this.machineRoot(), scanGuidance(this.machineRoot()), m, t)) req.add(d.path);
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
      // THE PERSON'S DOOR IS HELD TO THE SAME DEMAND (i6), and reads the same
      // remedy. The mirror's seed form always sends depends_on, empty box
      // included — the field was shown, so a blank one is a statement rather
      // than a silence. requiredDependsOn takes the empty string as [].
      case "se_seed_expedition":
        return this.expeditionNew(
          String(args.kind ?? ""),
          String(args.goal ?? ""),
          requiredDependsOn("se_seed_expedition", args.depends_on, { kind: args.kind, goal: args.goal }),
        );
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
          requiredDependsOn("se_seed_iteration", args.depends_on, { goal: args.goal, vision: args.vision }),
        );
      case "se_exp_close":
        return this.expeditionClose(args.merge !== false && args.merge !== "false");
      case "se_note_drain":
        // THE CHANNEL RULE: this is the mirror, so it is the person's own
        // hand. Every disposition stands, wherever the walk happens to be.
        return drainNote(
          seDir(this.machineRoot()),
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
    const out = pulledFor(this.machineRoot(), scanGuidance(this.machineRoot()), m, s).map((d) => {
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
    // A FALLBACK IS THE DRAWN PATH FOR THE CONDITION FAILING, so the condition
    // may not guard it (found live 2026-08-16, in the mechanism that had just
    // been built).
    //
    // verification's exit script runs the battery. Its FALLBACK is fix-findings
    // — "Fix the battery's findings: all of them, in one pass" — which exists
    // for precisely the case where that script comes back red. Gating every
    // exit on the script made the repair unreachable exactly when it was
    // needed, and the walk had to step out to the desk to get at it.
    //
    // THE FORWARD EDGES ARE STILL GUARDED, which is the whole point: a red
    // battery may not walk on to the gate. It may only walk to the state whose
    // job is fixing it.
    const escaping = to !== undefined && from.edges.some((e) => e.to === to && (e.role === "fallback" || e.role === "error"));
    if (from.exit?.script !== undefined && !escaping) await this.scriptRun(from.id); // a tick attempt runs the script
    for (const [key, args] of Object.entries(from.exit ?? {})) {
      if (key === "read" || key === "read_consume") continue; // channel-proven below, not evidence
      if (escaping) continue;
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
      // WHERE A SATELLITE RUNS, on every packet so neither hand has to ask.
      // One architecture, three transports — process, thread, inline — and the
      // person flips it. `chosen: false` means the default is answering, which
      // reads differently from a choice somebody made.
      run: this.runBlock(),
      // THE TIER IS THE ANSWER, AND THE NUMBER DOES NOT RIDE WITH IT (owner
      // ruling 2026-08-14: "the number leaves the answer").
      //
      // req-autonomy-is-categorical says no numeric autonomy value survives on
      // any surface. This packet is the surface the agent reads on every call,
      // so it is where the number was most visible and least useful: nothing
      // an agent does with the dial is arithmetic.
      //
      // THE WEIGHING STILL COMPARES NUMBERS INSIDE. That half is i14's — "every
      // numeric priority left in the engine, the scale and the guidance goes" —
      // and the requirement itself says cut over first, then remove, never both
      // in one commit (raid-risk-autonomy-rework-breaks-walking).
      tier: tierOf(loadLevels(this.machineRoot()), this._autonomy),
      // THE NOTCH RIDES EVERY PULL, and it has to: the stop hook's only ground
      // truth is the call log, so a setting the packet does not carry is a
      // setting the hook cannot obey.
      stop_at: this.stopAtName(),
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
      it = itFind(this.machineRoot(), full);
    } catch {
      return;
    }
    if (this.bound?.id === it.id) this.unbind();
    itCloseShipped(this.machineRoot(), it);
    // THE CLAIM IS NOT SPENT HERE ANY MORE, because there is none. A claim was
    // taken at entry and released here; the whole ledger is retired, and the
    // record's own status is what says it shipped.
    appendNote(
      seDir(this.machineRoot()),
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
    const outcome = this.outcomeFor(top.decl, cur, to);
    this.completeGuarded(top.decl, top.instance, cur, outcome, now, to);
    // Leaving the state is what destroys what it consumed.
    this.consumeDocs(this.state(top.decl, cur));
    top.instance.history.push({ state: cur, outcome, at: now });
    const prefix = this.subs.map((s) => s.decl.id).join("/");
    this.instance.history.push({ state: `${prefix}/${cur}`, outcome, at: now });
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
    const outcome = this.outcomeFor(this.machine, cur, to);
    this.completeGuarded(this.machine, this.instance, cur, outcome, now, to);
    this.consumeDocs(this.state(this.machine, cur));
    this.instance.history.push({ state: cur, outcome, at: now });
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
      const last = new CallLog(seDir(this.machineRoot())).lastSession();
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
        decl = compileMachineCached(
          this.machineRoot(),
          resolveRef(this.machineRoot(), mainMachinePath(this.machineRoot()), subState.submachine!),
        );
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
    // A PLACEHOLDER MAY BE DRAWN AND ROUTED THROUGH. IT MAY NOT BE WALKED
    // INTO (owner report 2026-08-13).
    //
    // The pin scaffolds every seeded drawing so the route stays drawable
    // before its authoring state has run. That scaffold compiled to a bare
    // start-to-end pill, and the walk went straight through it without a
    // word — i3 passed specify-build, seeded nothing, and build-steps found
    // the placeholder and reported itself done. A whole build was skipped in
    // silence.
    //
    // THIS IS THE SEAM iterations.ts NAMES. Refusing at compile time breaks
    // the machine view, which must draw a route through a sub-machine nobody
    // has authored yet. Refusing at ENTRY breaks nothing and closes the hole.
    //
    // An AUTHORED none is not a scaffold and walks through as it always did.
    if (decl.scaffold === true) {
      throw new Rejection({
        clause: CLAUSES.CONDITION_UNMET,
        expected: `${subState.submachine} is authored before the walk enters it — the state that seeds it writes the drawing`,
        got: `${subState.submachine} still carries the pin's placeholder, so entering would walk an empty machine and report it done`,
        remedy: {
          tool: "se_pull",
          args: {},
          note: `go back to the state that seeds ${subState.submachine} and author its drawing — one step per piece of work; the run state passes once real steps stand`,
        },
        source: "engine/session.ts seed",
      });
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
      // The tier word, and no number (owner ruling 2026-08-14).
      ...this.tierFor(this._autonomy),
      ...(this._emergency ? { emergency: true } : {}),
      power: this.power,
      narration: { minutes: this._narrationMinutes, calls: this._narrationCalls },
      legal_tools: this._emergency ? "all" : all ? "all" : [...ALWAYS_LEGAL, ...tools],
      history: this.instance.history.slice(-10),
    };
  }
}
