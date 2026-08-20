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
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { CLAUSES, Rejection } from "./errors.ts";
import { contentHash } from "./hash.ts";
import {
  activeStates,
  branchToReturnTo,
  claimFeeders,
  completeState,
  INPUT_ROLES,
  type MachineDecl,
  type MachineInstance,
  reopenStates,
  type StateDecl,
} from "./machine.ts";
import { bumpDrawingEpoch, compileMachine, compileMachineCached, resolveRef } from "./machines/compile.ts";
import { computeRoute, type RouteNode, type RouteResult, type RouteStep, routeWraps } from "./route.ts";

/** see dsp-walk-machine.md#the-state-a-recorded-visit-names */
export function visitState(visit: string): string {
  return visit.split("@")[0].split("/").pop() ?? "";
}

import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { CallLog, UNREPORTED } from "./calllog.ts";
import type { CanvasData } from "./canvas.ts";
import { conditionNotePath } from "./conditions.ts";
import { Decisions } from "./decisions.ts";
import type { GeneratedMachine } from "./expmachine.ts";
import {
  confirmPrefill,
  type FormLint,
  type FormTemplate,
  formTemplatePath,
  lintForm,
  parseFormTemplate,
  scaffoldInstance,
  withBy,
  withFieldContent,
  withSignedOff,
  withStatus,
} from "./forms.ts";
import { appendNote, drainNote } from "./inbox.ts";
import {
  type Iteration,
  itFind,
  itList,
  itPinRel,
  itRecordRel,
  itSeed,
  itShortId,
  markStarted,
  pinIteration,
  readItRecord,
} from "./iterations.ts";
import { withPass } from "./notes.ts";
import { pathKind, resolveInRoot, seDir } from "./paths.ts";
import { type PulledDoc, pulledFor, scanGuidance } from "./pull.ts";
import { probesMissed, readingProbes } from "./readproof.ts";
import { type Expedition, expClose, expFind, expList, expNew, itCloseShipped, readRecord } from "./records.ts";
import { CHANGE_COLUMNS } from "./rigor-matrix.ts";
import { defaultAutonomy, loadLevels, loadStopAt, notchName, tierOf, valueFor, weightName } from "./scale.ts";
import { requiredDependsOn } from "./seed.ts";
import { Claims } from "./sessionclaims.ts";
import { agentCopy, evidenceKey, kickoffSizeFromForm } from "./sessionforms.ts";
import { Liveness } from "./sessionlive.ts";
import { ReadGate } from "./sessionreads.ts";
import { Scripts } from "./sessionscript.ts";
import { Views } from "./sessionviews.ts";
import { difficultyOf, publish } from "./sizing.ts";
import { NARRATION_DEFAULT_CALLS, NARRATION_DEFAULT_MINUTES } from "./toll.ts";
import type { loadTrace } from "./trace.ts";

/** Legal in every state. see dsp-lane-door.md#always-legal-whatever-the-state */
export interface AmendOp {
  field: string;
  old_string: string;
  new_string: string;
  all?: boolean;
}

/** see dsp-walk-machine.md#sereopen-and-seamend-join-them-because-a-claim-is */
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
/** Nothing is restricted today. see dsp-lane-door.md#nothing-is-restricted-today */
const RESTRICTED: ReadonlySet<string> = new Set<string>();
const MACHINERY: readonly string[] = ["se_pull", "se_file_read"];

/** When a claim last answered the ground. see dsp-evidence-forms.md#an-amend-does-not-re-grey-a-reopen-does */
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
export const FEEDS_DOWNSTREAM: readonly { readonly state: string; readonly field: string; readonly reads: string }[] = [
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

export interface SubRun {
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
  /** Not private because a private member cannot satisfy a structural
   *  interface, and the drawings read this through ViewHost. */
  subs: SubRun[] = [];
  private bannerShown = false;
  /** The bound expedition — while set, the lane works inside its folder. */
  /** Not private because a private member cannot satisfy a structural
   *  interface, and Claims reads this through ClaimsHost. */
  bound?: Expedition;
  /** Evidence store: "<machine>/<state>" → what was submitted. */
  /** Not private because a private member cannot satisfy a structural
   *  interface, and Scripts reads this through its host. */
  readonly evidence = new Map<string, Record<string, unknown>>();
  /** Which states the agent may enter alone. see dsp-legible-controls.md#the-autonomy-dial */
  private _autonomy = 0;
  /** see dsp-walk-machine.md#every-engine-start-aims-at-the-front-desk */
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
  /** see dsp-walk-machine.md#the-read-proof */
  /** see dsp-boot-and-power.md#what-survives-a-reload-and-what-does-not */
  /** see dsp-walk-machine.md#a-static-sub-machine-is-a-drawing */
  /** see dsp-evidence-forms.md#does-a-standing-claim-still-pass-its-own-form */
  private readonly claims = new Claims(this);

  /** The claim surface the outside asks for. Each is one line, and each names
   *  the part of the session that answers. */
  recordDone(decl: MachineDecl, seen: Set<string> = new Set(), pass: GreenPass = Claims.newPass(), paint = false): string[] {
    return this.claims.recordDone(decl, seen, pass, paint);
  }

  lawProvenStates(decl: MachineDecl): string[] {
    return this.claims.lawProvenStates(decl);
  }

  recordPaint(decl: MachineDecl): string[] {
    return this.claims.recordPaint(decl);
  }

  blessedGates(decl: MachineDecl, painted?: Set<string>): string[] {
    return this.claims.blessedGates(decl, painted);
  }

  suspectStates(decl: MachineDecl): string[] {
    return this.claims.suspectStates(decl);
  }

  reopenClaim(name: string, reason: string, by: string, machineId?: string, confirm?: boolean): Record<string, unknown> {
    return this.claims.reopenClaim(name, reason, by, machineId, confirm);
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
    return this.claims.amendClaim(name, fillsIn, reason, by, machineId, ops, chain);
  }

  formBless(name: string, ok: boolean, by: string, machineId?: string): Record<string, unknown> {
    return this.claims.formBless(name, ok, by, machineId);
  }

  mintInterfaceCell(name: string, source: string, destination: string, machineId?: string): Record<string, unknown> {
    return this.claims.mintInterfaceCell(name, source, destination, machineId);
  }

  flipRuling(name: string, rival: string, winner: string, axis: string, by: string, machineId?: string): Record<string, unknown> {
    return this.claims.flipRuling(name, rival, winner, axis, by, machineId);
  }

  scenarioVerdict(
    name: string,
    kind: string,
    requirement: string,
    extra: { decision?: string; hinge?: string; note?: string },
    by: string,
    machineId?: string,
  ): Record<string, unknown> {
    return this.claims.scenarioVerdict(name, kind, requirement, extra, by, machineId);
  }

  whyGrey(stateId?: string): Record<string, unknown> {
    return this.claims.whyGrey(stateId);
  }

  docRefPaths(p: string): Record<string, string> {
    return this.claims.docRefPaths(p);
  }

  stateFormExport(name: string, machineId?: string): string {
    return this.claims.stateFormExport(name, machineId);
  }

  stateFormIngest(name: string, html: string, machineId?: string): Record<string, unknown> {
    return this.claims.stateFormIngest(name, html, machineId);
  }

  /** Not private because a private member cannot satisfy a structural
   *  interface, and Claims reads this through ClaimsHost. */
  readonly views = new Views(this);
  /** see dsp-walk-machine.md#the-suites-spawn-skip */
  private readonly scripts = new Scripts(this);

  /** The script surface the outside asks for. */
  scriptRun(stateId: string): Promise<Record<string, unknown>> {
    return this.scripts.scriptRun(stateId);
  }

  busy(): boolean {
    return this.scripts.busy();
  }

  progress(): { done: number; total: number; label: string } | undefined {
    return this.scripts.progress();
  }

  scriptStatus(m: MachineDecl, s: StateDecl): { ran: boolean; ok: boolean; output: string; running: boolean } {
    return this.scripts.scriptStatus(m, s);
  }

  /** The drawings the outside asks for. */
  generatedView(id: string): { decl: MachineDecl; canvas: CanvasData } | undefined {
    return this.views.generatedView(id);
  }

  viewChain(id: string): string[] {
    return this.views.viewChain(id);
  }

  viewFor(id: string): { decl: MachineDecl; canvas: CanvasData } | undefined {
    return this.views.viewFor(id);
  }

  viewRun(declId: string): { done: string[]; completed: boolean } {
    return this.views.viewRun(declId);
  }

  private readonly live = new Liveness({
    persist: () => this.persistSettings(),
    describe: () => this.describe(),
  });

  /** The liveness surface the outside reaches for. */
  get power(): { block_sleep: boolean; shutdown_at_idle: boolean } {
    return this.live.power;
  }

  get ping(): { target: string; note?: string; seq: number } | undefined {
    return this.live.ping;
  }

  get serverGone(): boolean {
    return this.live.serverGone;
  }

  setPower(key: string, on: boolean): Record<string, unknown> {
    return this.live.setPower(key, on);
  }

  pingSurface(target: string, note?: string): Record<string, unknown> {
    return this.live.pingSurface(target, note);
  }

  idleFor(ms: number): boolean {
    return this.live.idleFor(ms);
  }

  markServerGone(): void {
    this.live.markServerGone();
  }

  waitForChange(timeoutMs: number): Promise<boolean> {
    return this.live.waitForChange(timeoutMs);
  }

  /** Wake every held wait — called on every successful change of the walk.
   *  Not private because a private member cannot satisfy a structural
   *  interface, and Scripts reads this through its host. */
  notifyChange(): void {
    this.live.notifyChange();
  }

  private readonly reads = new ReadGate({
    laneRoot: (rel?: string) => this.laneRoot(rel),
    machineRoot: () => this.machineRoot(),
    persist: () => this.persistSettings(),
    notify: () => this.notifyChange(),
  });

  /** The three doors the outside opens on the read gate. */
  rememberRead(path: string, hash: string, ref?: string): void {
    this.reads.rememberRead(path, hash, ref);
  }

  humanCheck(path: string): Record<string, unknown> {
    return this.reads.humanCheck(path);
  }

  humanCheckedPaths(): string[] {
    return this.reads.humanCheckedPaths();
  }

  constructor(root: string) {
    this.root = root;
    // Fail fast at server start: a misdrawn machine must not silently serve
    // an ungated lane.
    this._machine = compileMachine(root, mainMachinePath(root));
    this.instance = newInstance(this._machine);
    this.decisions = new Decisions(seDir(root));
    // THE DIAL STARTS AT A NAMED RUNG, looked up in machines/scale.md like
    // any other rung. It is set here rather than at the field because the
    // scale is read from the root, and there is no root at initialiser time.
    // restoreSettings below may overwrite it with what the person last set.
    this._autonomy = defaultAutonomy(root);
    // see dsp-boot-and-power.md#what-survives-a-reload-and-what-does-not
    this.restoreSettings();
    this.live.sync();
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
        this.live.restore(s.block_sleep, s.shutdown_at_idle);
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

  /** see dsp-boot-and-power.md#the-target-survives-a-reload-the-position-does-not */
  private restoreTarget(target: string | undefined, pid: number | undefined): void {
    if (pid === undefined || pid === process.pid) return;
    // see dsp-walk-machine.md#an-empty-target-is-a-deliberate-clear
    if (typeof target === "string") this._target = target;
  }

  /** The ONE place the target moves, so no site can forget to persist it. */
  private aimAt(to: string): void {
    this._target = to;
    this.persistSettings();
  }

  /** see dsp-boot-and-power.md#the-reading-credit-survives-a-reload */
  private restoreReadCredit(reads: Record<string, string> | undefined, pid: number | undefined): void {
    if (pid === undefined || pid === process.pid) return;
    for (const [p, h] of Object.entries(reads ?? {})) {
      if (typeof h === "string" && h !== "") this.reads.credit(p, h);
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
          ...this.live.power,
          narration_minutes: this._narrationMinutes,
          narration_calls: this._narrationCalls,
          reads: this.reads.buffered(),
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

  /** HOW STRONG A HAND THE STEP IN HAND NEEDS — el-sizing's whole outbound
   *  half, riding the pull beside the state and the tier.
   *
   *  THE LANE SAYS AND DOES NOT DO. Publishing is where the machine's part
   *  ends: nothing here starts a process, and nothing downstream of this
   *  value inside the box starts one either
   *  (req-the-machine-names-a-driver-and-starts-nothing).
   *
   *  A RUNG AND THE PAIR IT CAME FROM, NEVER A MODEL. Resolving a rung to a
   *  concrete hand is whoever holds the fleet's business — in our own
   *  deployment, the walking agent, which acts by delegating the step to a
   *  subagent on a stronger hand.
   *
   *  A STEP WITH NO RATING PUBLISHES NOTHING RATHER THAN A GUESS. The field is
   *  absent, and the walk carries on exactly as it did before this existed. A
   *  fallback to whatever is running would be indistinguishable from a working
   *  lookup, which is what
   *  req-an-unmatched-rung-names-itself-and-publishes-no-driver forbids. */
  private strengthNeeded(): Record<string, unknown> {
    try {
      // THE LEAF, NOT THE OUTER MACHINE. `active()` reports a nested id like
      // `iterations/i1/onboard-retro`, and the compiled iteration's own states
      // are named bare. Looking the nested id up in the outer machine found
      // nothing and published nothing — silently, because the catch below
      // treats an unrated step as the ordinary case.
      //
      // FOUND BY A FRESH-EYES TESTER AT i38's verification: deleting this
      // whole call changed no test, because no test ever stood the walk on a
      // rated step. The lookup had never worked.
      const { machine, ids } = this.leaves();
      const id = ids[0];
      if (id === undefined) return {};
      const step = this.state(machine, id);
      if (process.env.SE_DBG_SIZING === "1") console.error("DBG", machine.id, id, Object.keys(step).join(","));
      if (step.submachine !== undefined) return {};
      return { needs: publish(difficultyOf(step)) };
    } catch (e) {
      if (process.env.SE_DBG_SIZING === "1") console.error("DBG-THREW", String((e as Error).message).slice(0, 120));
      // AN UNRATED STEP IS THE COMMON CASE TODAY and it is not an error. The
      // block refuses rather than guessing, and the pull publishes nothing.
      return {};
    }
  }

  /** THE STATE A CALL WAS MADE IN, as a field for the record rather than a
   *  key for the graph — req-every-call-records-the-state-it-was-made-in.
   *  Known where the call is SERVED, which is why it is the one coordinate of
   *  three that is an observation and not a claim. */
  currentState(): string {
    return this.active()[0] ?? UNREPORTED;
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

  /** see dsp-walk-machine.md#where-the-dial-stands */
  get tier(): string {
    return this.tierFor(this._autonomy).tier ?? "";
  }

  /** The mirror's URL when one is listening — the panel se_panel opens. */
  mirrorUrl?: string;

  /** see dsp-walk-machine.md#the-update-cadence */
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

  /** The tool gate lifted, everywhere. see dsp-legible-controls.md#emergency-lifts-the-tool-gate */
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

  setAutonomy(input: number | string): Record<string, unknown> {
    // see dsp-the-goal-binds-the-walk.md#the-rung-arrives-as-a-word-from-every-launch
    let value: number;
    if (typeof input === "string" && !/^-?[0-9]*\.?[0-9]+$/.test(input.trim())) {
      const resolved = valueFor(loadLevels(this.machineRoot()), input);
      if (resolved === undefined) {
        throw new Rejection({
          clause: CLAUSES.REQUIRED_ARGS,
          expected: `one of the rungs in machines/scale.md: ${loadLevels(this.machineRoot())
            .map((l) => l.name.split(" — ")[0])
            .join(", ")}`,
          got: String(input),
          remedy: { tool: "se_pull", args: {}, note: "the autonomy is set from the mirror's rungs or at launch (--autonomy <rung>)" },
          source: "engine/session.ts autonomy",
        });
      }
      value = resolved;
    } else {
      value = Number(input);
    }
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
  /** Not private because a private member cannot satisfy a structural
   *  interface, and Claims reads this through ClaimsHost. */
  tierFor(value: number): Record<string, string> {
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

  // see dsp-walk-machine.md#atomic-ticks-retired-with-the-tick

  /** see dsp-walk-machine.md#the-ordered-reload */
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

  /** see dsp-walk-machine.md#where-the-lane-works */
  workRoot(): string {
    return this.machineRoot();
  }

  /** see dsp-walk-machine.md#one-checkout-owns-every-record */
  machineRoot(): string {
    return this.root;
  }

  /** see dsp-walk-machine.md#the-corpus-a-reader-sees */
  corpora(): { id: string; label: string; path: string }[] {
    // ONE CORPUS, BECAUSE THERE IS ONE TREE (i34, found by the tester at
    // verification). This offered trunk plus one entry per open iteration, so
    // the person could pick which tree they meant. Every entry's path is now
    // the same root, so the picker asked a question with one answer twenty-two
    // times over — and defaulted to the LAST open iteration rather than trunk.
    return [{ id: "trunk", label: "trunk", path: this.machineRoot() }];
  }

  /** Where the lane resolves one path. see dsp-resolution-seam.md#session-state-is-never-branch-content */
  laneRoot(rel?: string): string {
    if (rel === undefined) return this.workRoot();
    // see dsp-walk-machine.md#resolved-by-what-the-path-is
    const kind = pathKind(rel);
    if (kind === "session") return this.machineRoot();
    // see dsp-resolution-seam.md#shared-method-belongs-to-the-machine
    if (kind === "method") return this.machineRoot();
    // A RECORD'S OWN CONTENT IS IN THE SAME TREE AS EVERYTHING ELSE. This
    // used to ask `recordRoot(rel)` which tree owned the record and fall back
    // to the working root; both answers are now the same root, so the question
    // is not asked.
    void rel;
    return this.workRoot();
  }

  // see dsp-walk-machine.md#one-checkout-owns-every-record

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

  /** ENTERING AN ITERATION BINDS IT AND STAMPS IT STARTED. That is all it
   *  does: there is no claim to take. */
  iterationOpen(id: string): Record<string, unknown> {
    const it = itFind(this.machineRoot(), id);
    this.bound = it;
    markStarted(this.machineRoot(), it);
    this.decisions.setExtraSink(join(this.machineRoot(), "project", "spec", "iterations", it.id, "decisions.jsonl"));
    return { bound: it.id, note: "the walk now stands in this iteration" };
  }

  /** see dsp-the-goal-binds-the-walk.md#leaving-a-kickoff-pins-the-blessed-change-size */
  private pinKickoff(fullId: string | undefined): void {
    if (fullId === undefined) return;
    const it = itFind(this.machineRoot(), fullId);
    const rec = readItRecord(this.machineRoot(), it);
    const size = typeof rec?.change_size === "string" ? rec.change_size : kickoffSizeFromForm(it);
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
  /** Not private because a private member cannot satisfy a structural
   *  interface, and Claims reads this through ClaimsHost. */
  repinSwap(): void {
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
  /** Not private because a private member cannot satisfy a structural
   *  interface, and Claims reads this through ClaimsHost. */
  rewalk(pin: Record<string, unknown>, reason: string): { reopened: string[]; cone: string[] } | undefined {
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
    // see dsp-the-goal-binds-the-walk.md#nothing-is-written-onto-the-claims
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
    return { bound: this.bound.id, note: "the lane now works inside this expedition's folder" };
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
    const open = this.claims.openRecordPoints();
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

  /** see dsp-lane-door.md#escape-is-one-hatch */
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

  /** Not private because a private member cannot satisfy a structural
   *  interface, and Scripts reads this through its host. */
  state(m: MachineDecl, id: string): StateDecl {
    const s = m.states.find((st) => st.id === id);
    if (s === undefined) throw new Error(`undeclared state ${id}`);
    return s;
  }

  /** see dsp-walk-machine.md#does-this-state-owe-a-signature-fields-are-the */
  /** Not private because a private member cannot satisfy a structural
   *  interface, and Claims reads this through ClaimsHost. */
  owesASignature(s: StateDecl, it: Iteration): boolean {
    if (s.evidence_form.length > 0) return true;
    if (s.kind !== "work" && s.kind !== "gate") return false;
    return existsSync(this.claims.evidenceAbs(it, s.id));
  }

  /** see dsp-walk-machine.md#completestate-with-the-wedge-guard */
  private completeGuarded(
    m: MachineDecl,
    inst: MachineInstance,
    stateId: string,
    outcome: "filled" | "failed",
    now: string,
    only?: string,
  ): void {
    // see dsp-walk-machine.md#a-claimful-state-completes-on-its-claim
    const decl = this.state(m, stateId);
    // see dsp-evidence-forms.md#fields-are-not-what-makes-a-claim
    const itNow = this.declIteration(m);
    const claimfulNow = outcome === "filled" && itNow !== undefined && this.owesASignature(decl, itNow);
    const done = claimfulNow ? new Set(this.claims.recordDone(m)) : new Set<string>();
    if (claimfulNow && !done.has(stateId)) {
      // see dsp-the-goal-binds-the-walk.md#name-the-claim-that-actually-fell
      const held = this.claims.claimBlockers(stateId, m)[0];
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
    // see dsp-walk-machine.md#a-completion-that-would-open-several-alternatives-chooses-none
    if (only === undefined && outcome === "filled" && decl.edges.filter((e) => e.role === "alternative").length > 1) return;
    const snap = {
      active: inst.active === undefined ? undefined : [...inst.active],
      fired: inst.fired === undefined ? undefined : [...inst.fired],
      current: inst.current,
      status: inst.status,
    };
    completeState(m, inst, stateId, outcome, now, only, () => new Set(this.claims.recordDone(m)));
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

  /** see dsp-walk-machine.md#the-outcome-a-hop-completes-with */
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

  /** Not private because a private member cannot satisfy a structural
   *  interface, and Claims reads this through ClaimsHost. */
  top(): SubRun | undefined {
    return this.subs[this.subs.length - 1];
  }

  /** The machine one level up from the top sub — where its parent state lives. */
  private parentOfTop(): { machine: MachineDecl; instance: MachineInstance } {
    const below = this.subs[this.subs.length - 2];
    return below === undefined ? { machine: this.machine, instance: this.instance } : { machine: below.decl, instance: below.instance };
  }

  /** The machine+states whose legal_tools govern right now. */
  /** Not private because a private member cannot satisfy a structural
   *  interface, and Scripts reads this through its host. */
  leaves(): { machine: MachineDecl; ids: string[] } {
    const top = this.top();
    if (top !== undefined) return { machine: top.decl, ids: activeStates(top.instance) };
    return { machine: this.machine, ids: activeStates(this.instance) };
  }

  /** see dsp-walk-machine.md#the-machine-is-read-live */
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

  /** see dsp-walk-machine.md#the-qualified-name-of-a-state-in-the-machine */
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
      const g = gen?.subGen?.[seg]?.() ?? this.views.genFor(seg);
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
    // see dsp-walk-machine.md#one-rule-for-landing-whichever-move-brought-you
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

  /** see dsp-the-goal-binds-the-walk.md#the-doors-own-weight */
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
   *  packet the engine builds. A bound record then walked a container that
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
   *  walk's shape changes for a reason no drawing records: a record seeded,
   *  bound or released. */
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
      // THE SHORT NAME IS THE NAME. Try it against what is actually reachable
      // before refusing: aiming at `define-actual` from inside i15 means the
      // same thing as aiming at `iterations/i15/define-actual`, and only one
      // of the two used to work.
      const near = this.resolveShort(
        wanted,
        this.pullOptions().map((o) => String(o.to)),
      );
      if (near !== wanted) {
        const alt = this.route(near);
        if (alt.found) {
          this.aimAt(near);
          this.clearTargetIfArrived();
          return { ...alt, target: this._target };
        }
      }
    }
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

  /** see dsp-walk-machine.md#a-submachine-is-named-by-its-container */
  private routeAim(target: string): string {
    const cut = target.lastIndexOf("/");
    const decl = this.declForPrefix(cut < 0 ? "" : target.slice(0, cut))?.states.find(
      (s) => s.id === (cut < 0 ? target : target.slice(cut + 1)),
    );
    return decl?.submachine !== undefined ? Session.qual(target, this.declForPrefix(target)?.initial ?? "start") : target;
  }

  /** see dsp-walk-machine.md#the-route-computes-what-is-needed-not-what-is-nearest */
  private nextObjective(aim: string, pass: GreenPass = Claims.newPass()): string {
    const cut = aim.lastIndexOf("/");
    const prefix = cut < 0 ? "" : aim.slice(0, cut);
    const local = cut < 0 ? aim : aim.slice(cut + 1);
    const decl = this.declForPrefix(prefix);
    if (decl === undefined || !decl.states.some((s) => s.id === local)) return aim;
    const claimful = new Set(decl.states.filter((s) => s.evidence_form.length > 0).map((s) => s.id));
    const done = new Set(this.claims.recordDone(decl, new Set(), pass));
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
      // see dsp-walk-machine.md#a-sub-machines-work-is-not-invisible
      return this.subObjective(decl, prefix, local, pass) ?? aim;
    }
    // THE ONE WITH NOTHING UNMET BEHIND IT. Anything else would send the walk
    // at a state whose own inputs are still owed, which is the very mistake
    // this replaces.
    const owed = new Set(unmet);
    const first = unmet.find((u) => claimFeeders(decl, u, claimful).every((f) => !owed.has(f)));
    return Session.qual(prefix, first ?? unmet[0]);
  }

  /** see dsp-walk-machine.md#the-first-owed-state-inside-a-sub-machine-that-lies */
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

  /** see dsp-walk-machine.md#the-first-owed-claim-in-a-sub-machine */
  private deepOwed(prefix: string, decl: MachineDecl, pass: GreenPass, here: string = this.active()[0] ?? ""): string | undefined {
    const done = new Set(this.claims.recordDone(decl, new Set(), pass));
    for (const s of decl.states) {
      if (s.evidence_form.length > 0 && !done.has(s.id)) return Session.qual(prefix, s.id);
      if (s.submachine === undefined) continue;
      const subPrefix = Session.qual(prefix, s.id);
      // see dsp-walk-machine.md#a-record-is-work-not-a-corridor
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
      for (const p of this.reads.consumeDemand(st)) reads.add(p);
    }
    return [...reads].sort();
  }

  /** see dsp-the-goal-binds-the-walk.md#the-route-collects-every-judgment-up-front-and-moves-nothing */
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
    // see dsp-walk-machine.md#the-route-is-recomputed
    const memoKey = [from, target, this._autonomy, this.subs.map((s) => s.decl.id).join("/"), this.generation].join("::");
    const machineNow = this.machine;
    if (this.routeMemo !== undefined && this.routeMemo.key === memoKey && this.routeMemo.machine === machineNow) {
      return this.routeMemo.value;
    }
    // see dsp-walk-machine.md#the-objective-is-computed-on-a-memo-miss
    const aim = this.routeAim(target);
    // THE ROUTE IS ONE OPERATION, so it collects its input once. Everything
    // below reads the corpus out of this pass rather than fetching its own
    // (software.md, input-process-output).
    const pass = Claims.newPass();
    const objective = this.nextObjective(aim, pass);
    let r = computeRoute(from, objective, (q) => this.expandNode(q, objective));
    // see dsp-walk-machine.md#no-way-forward-is-not-the-same-as-no
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
      // see dsp-walk-machine.md#the-number-is-gone-from-the-answer
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
      const legs = this.claims
        .feedersUnsigned(decl, state)
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

  // see dsp-walk-machine.md#one-document-not-a-list-of-them
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
    // see dsp-walk-machine.md#always-look-ahead
    const { machine, ids } = this.leaves();
    for (const id of ids) {
      const s = this.state(machine, id);
      for (const d of this.pulled(machine, s)) add(d.path);
      for (const p of this.reads.lookaheadRequirements(machine, s)) add(p);
    }
    // THE HANDOVER RULE JOINS THE LOOP. When the slider rises mid-walk,
    // the agent's advances must prove the reading the human checked — even
    // past transitions the human already walked. The gate has always
    // demanded it; the loop must therefore SERVE it, or the pull would
    // say "read" for a list that cannot satisfy the walk it feeds.
    for (const p of this.reads.humanCheckedPaths()) add(p);
    return want.filter((p) => !this.reads.bufferedCurrent(p));
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
        // see dsp-walk-machine.md#name-it-in-the-reading-rather-than-skipping-in
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
      if (this.reads.diskHash(p.path) !== p.hash) continue;
      this.reads.credit(p.path, p.hash);
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
      const probes = readingProbes(body);
      this.reads.serve(rel, contentHash(body), probes.expect);
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

  // THE PROBE MATHS LIVES IN engine/readproof.ts, and nothing here keeps a
  // copy of it (owner, 2026-08-18). The test suite answers the probes from
  // that same module, so the two cannot drift.

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
    const standing = this.claims.standingStateFormOwed();
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
      // see dsp-walk-machine.md#the-word-never-the-number
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

  /** see dsp-walk-machine.md#the-offer-and-the-check-read-one-graph */
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
    const stuck = this.claims.joinStuck();
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

  /** see dsp-walk-machine.md#what-the-machine-wants-next */
  async pull(
    payload: { form?: Record<string, unknown>; escape?: string } = {},
    channel: Channel = "agent",
  ): Promise<Record<string, unknown>> {
    // ONE DRAWING VALIDATION PER WALK STEP — the epoch makes "the next
    // call" the unit of the read-it-live law (see machines/compile.ts).
    bumpDrawingEpoch();
    this.claims.driftReopen();
    // see dsp-walk-machine.md#the-aim-is-read-after-the-payload-lands
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
      ...this.strengthNeeded(),
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
      ...(saved !== undefined ? { form_saved: agentCopy(saved as Record<string, unknown>, true) } : {}),
      ...(fanOut.length > 0
        ? { not_walked: fanOut, note: "one agent is walking, so only the first choice was taken — the others are yours to hand out" }
        : {}),
    });

    const pullTarget = targetNow();

    // see dsp-walk-machine.md#the-machine-says-what-is-wrong-and-what-to
    const standingForm = this.claims.standingStateFormOwed();
    if (standingForm !== undefined) {
      return {
        pull: "fill",
        ...head(),
        ...this.refusedBlock([standingForm]),
        for: standingForm,
        forms: [this.formForAgent(standingForm)],
        do:
          this.fillAdvice(
            [standingForm],
            'work the state, then return fills on the next pull as form: {"<section>": "<text>"} - multi-pass is fine; finish with {"submit": true}: the submit checks the fields and stamps the claim',
          ) + this.drawnNote([standingForm]),
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
          do:
            this.fillAdvice(
              owed,
              'fill every required section, then return it on the next pull as form: {"<section>": "<text>", "submit": true} — there is no submit verb, and a pull without the submit FLAG hands back this same form',
            ) + this.drawnNote(owed),
          ...extra(),
        };
      }
      const stalled = this.claims.stalledClaim(r, head, extra);
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
      return { ...this.waitUnroutable(pullTarget, r.note), ...head(), ...extra() };
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
        ...(readProof === "wrong"
          ? {
              // pendingRead survives a wrong answer — only a correct one clears it.
              note: `${this.readMissed.length} of ${this.reads.serving()?.expect.length ?? 0} probe(s) were not answered — here is the document again`,
              missed: this.readMissed,
              hint: "QUOTE MORE, NOT LESS. The check asks whether your answer CONTAINS each expected run, never whether it matches exactly, so pasting the whole sentence around the anchor always passes. Punctuation is not a word: a dash or a bullet between two words is skipped when the engine counts, which is the usual reason a careful four-word answer misses. Case and line breaks are flattened before comparing.",
            }
          : {}),
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
        do: this.fillAdvice(
          unmet,
          'fill every required section, then return it on the next pull as form: {"<section>": "<text>", "submit": true} — there is no submit verb, and a pull without the submit FLAG hands back this same form',
        ),
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
    const pending = this.reads.serving();
    if (form?.read === undefined || pending === null) return null;
    // WHICH PROBE MISSED, not merely that one did. "That did not answer every
    // probe" over three probes is a one-in-three guess, and the field report
    // of 2026-08-17 names it as friction that cost a round trip each time.
    // JUDGE THE REPLY AGAINST WHAT IS STILL OWED, never against all three.
    // The answer names which probes missed, so an agent sends those — and
    // judging that reply against the whole set fails it for the ones it had
    // already got right, which is a loop with no way out of it. Measured on
    // the i15 walk, which worked the rule out the expensive way.
    this.readMissed = this.reads.bankProbes(probesMissed(pending.outstanding, String(form.read)));
    if (this.readMissed.length === 0) {
      this.reads.credit(pending.path, pending.hash);
      this.persistSettings();
      this.reads.answered();
      return "ok";
    }
    return "wrong";
  }

  /** The probes the last read answer missed, so the retry can name them. */
  private readMissed: string[] = [];

  /** THE PAYLOAD IS THE SUBMIT THAT HAS NO VERB — the filled form the
   *  LAST pull handed over. WHICH form is never the agent's call:
   *  evidence is expected while a step on the way demands it; a CHOICE
   *  only where the machine offered one (the road split, no target).
   *  Evidence wins when both could read — deterministic, and documented
   *  on the tool. */
  private pullSaveOrChoose(form: Record<string, unknown>): { saved?: Record<string, unknown>; fanOut: string[] } {
    // see dsp-walk-machine.md#a-stuck-join-is-the-one-place-a-choice
    if (form.choice !== undefined && Object.keys(form).length === 1) {
      const stuck = this.claims.joinStuck();
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
      // see dsp-walk-machine.md#a-choice-while-a-form-is-owed-is-not
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
      if (bless !== undefined) saved = this.claims.formBless(owed[0], bless === true || bless === "true" || bless === "yes", "agent");
      return { saved, fanOut: [] };
    }
    if (this._target === "" && form.choice !== undefined) {
      return { fanOut: this.pullPickChoice(form.choice) };
    }
    // A CHOICE IS AN AIM, AND SAYING "NOTHING WANTS A FORM" ANSWERS A DIFFERENT
    // QUESTION. The reader was trying to GO somewhere; the answer described the
    // engine’s state and never said where it could go instead.
    //
    // MEASURED ON THE i15 WALK: ten of these, and three in a row were the same
    // door sent three ways — as a list, as a short name, as a long name with a
    // submit flag. Each got the identical generic sentence. The doors were
    // computed on the same pass and withheld.
    if (form.choice !== undefined) {
      const doors = this.pullOptions().map((o) => String(o.to));
      throw new Rejection({
        clause: CLAUSES.NOT_LEGAL_IN_STATE,
        expected:
          doors.length > 0
            ? `one of the doors offered from here: ${doors.join(", ")}`
            : "a branching point, where a choice is what the pull is asking for",
        got: `a choice of ${JSON.stringify(form.choice)}, where the walk is not at a branching point`,
        remedy:
          doors.length > 0
            ? {
                tool: "se_pull",
                args: { form: { choice: doors[0] } },
                note: `these are the doors from here: ${doors.join(", ")}. To aim at somewhere further off, se_aim names the target and the walk routes to it.`,
              }
            : {
                tool: "se_aim",
                args: { target: "<the state you want to reach>" },
                note: "no door is offered from where you stand, so no choice can be taken. se_aim sets a target and the walk routes toward it; a bare pull says what is owed here first.",
              },
        source: "engine/session.ts pull",
      });
    }
    throw new Rejection({
      clause: CLAUSES.NOT_LEGAL_IN_STATE,
      expected: "a step that asked for a form",
      got: this._target === "" ? "a filled form, but nothing asked for one" : "a filled form, but nothing on the way wants one",
      remedy: { tool: "se_pull", args: {}, note: "pull with no payload — the machine says what it wants before you fill anything" },
      source: "engine/session.ts pull",
    });
  }

  /** THE SHORT NAME IS THE NAME (owner ruling). A state is called what its
   *  drawing calls it, and the machine path in front of it is the engine's
   *  bookkeeping rather than the reader's vocabulary.
   *
   *  So anything naming a state takes the short form, and a qualified one is
   *  accepted rather than refused — a walk reads long ids in its own answers
   *  today, and refusing what we just handed it is the worst of both.
   *
   *  AMBIGUITY IS NOT RESOLVED SILENTLY. Where a short name matches two of the
   *  things on offer, nothing is picked and the refusal names both. */
  private resolveShort(pick: string, among: string[]): string {
    if (among.includes(pick)) return pick;
    const hits = among.filter((o) => o.slice(o.lastIndexOf("/") + 1) === pick);
    return hits.length === 1 ? hits[0] : pick;
  }

  /** see dsp-walk-machine.md#a-list-is-legal-on-purpose */
  private pullPickChoice(choice: unknown): string[] {
    const offered = this.pullOptions().map((o) => String(o.to));
    const picks = (Array.isArray(choice) ? choice : [choice])
      .map(String)
      .filter((x) => x !== "")
      .map((x) => this.resolveShort(x, offered));
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
    const stuck = this.claims.joinStuck();
    if (stuck !== undefined) {
      const leg = stuck.feeders.find((f) => this.qualHere(f) === picks[0] || f === picks[0]);
      if (leg !== undefined) {
        this.claims.walkBackTo(leg);
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
          do: 'read the document, then pull again answering every probe in `prove` as form: {"read": "<the answers, in one string>"}',
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
          do: this.fillAdvice(
            formsNow,
            'fill every required section, then return it on the next pull as form: {"<section>": "<text>", "submit": true} — there is no submit verb, and a pull without the submit FLAG hands back this same form',
          ),
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
    // A `do` THAT CANNOT MOVE MUST SAY SO, AND SAY WHAT WOULD MOVE IT.
    //
    // MEASURED ON THE i35 CLOUD RUN, five times: at a blessed kickoff gate,
    // after every build chunk, and at verification. The pull answered `do`
    // with "the stopped step says what it wants" while no step had said
    // anything, and repeated indefinitely. `se_why` often held the whole
    // answer. The cure was an se_aim at a downstream state, and nothing said
    // so.
    //
    // STUCK IS THREE FACTS AT ONCE: no hop was walked, nothing arrived, and
    // no step refused. Any one of those alone is ordinary.
    const hops = Array.isArray(swept.swept) ? swept.swept.length : 0;
    const stuck = hops === 0 && swept.arrived !== true && swept.refusal === undefined;
    // THE DOORS WERE ALWAYS COMPUTED AND WITHHELD AT A BRANCH OF ONE. That
    // withholding is the whole of the silence: one door is exactly the case
    // where the walker cannot guess.
    return {
      pull: "do",
      ...head(),
      walked: swept.swept ?? [],
      arrived: swept.arrived === true,
      ...(branchOpts.length > 1 || (stuck && branchOpts.length > 0) ? { options: branchOpts } : {}),
      here: this.pullHere(),
      ...(swept.banners !== undefined ? { banners: swept.banners } : {}),
      ...(swept.refusal !== undefined ? { stopped_at: swept.stopped_at, refusal: swept.refusal } : {}),
      do: this.doAdvice(swept.refusal !== undefined, stuck, branchOpts.length > 0),
      ...extra(),
    };
  }

  /** WHAT A `do` TELLS THE WALKER TO DO. Lifted out of pullAfterSweep so the
   *  stuck case can say something useful without pushing that function past
   *  its complexity bound. */
  private doAdvice(refused: boolean, stuck: boolean, hasDoors: boolean): string {
    if (refused) return "the stopped step says what it wants — do that, then pull again";
    if (!stuck) return "do what the guidance asks, then pull again";
    const why = this._target === "" ? ", because no target is set" : ` toward ${this._target}`;
    const doors = hasDoors ? " — the doors from here are in `options`" : "";
    return `nothing is owed here and the walk did not move${why}. Aim at where you are going with se_aim${doors}, then pull. se_why names what holds any state grey.`;
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
   *  THE WALK IS ASKED, NEVER A PATH. It has always known the answer. */
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

  /** see dsp-the-goal-binds-the-walk.md#entering-a-generated-containers-record-states-binds-that-records */
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
      const ev = this.evidence.get(evidenceKey(machine, id));
      if ((ev?.script_result as { ok?: boolean } | undefined)?.ok === false) for (const t of s.repair_tools ?? []) tools.add(t);
      for (const t of s.legal_tools ?? []) {
        if (t === "all") all = true;
        else tools.add(t);
      }
    }
    return { all, tools };
  }

  /** THE STATE GATE — a dispatch guard, throws the typed refusal. */
  gate(tool: string, args: Record<string, unknown> = {}): void {
    if (ALWAYS_LEGAL.has(tool)) return;
    // FOLLOWING THE LANE'S OWN CURSOR IS ALWAYS LEGAL. A bounded answer hands
    // back a page and the exact call that fetches the rest. A state that
    // serves one and then forbids the read makes its own answer unreadable —
    // and boot/prepare_idle, which allows no tools at all, does exactly that.
    if (
      tool === "se_file_read" &&
      String(args.path ?? "")
        .replace(/\\/g, "/")
        .startsWith(".se/answers/")
    )
      return;
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
      return docs.every((p) => this.reads.readProven("human", p, {}) || this.reads.agentProven(p) || this.reads.bufferedCurrent(p));
    }
    if (key === "read_consume") {
      return this.reads
        .consumeDemand(s)
        .every((p) => this.reads.readProven("human", p, {}) || this.reads.agentProven(p) || this.reads.bufferedCurrent(p));
    }
    if (key === "evidence_form") {
      const names = (which === "leave" ? s.exit : s.entry)?.evidence_form ?? [];
      return this.formsMet(names);
    }
    if (key === "no_pending_note") {
      const markers = (which === "leave" ? s.exit : s.entry)?.no_pending_note ?? [];
      return this.claims.blockingNotes(markers).length === 0;
    }
    const ev = this.evidence.get(evidenceKey(m, s.id));
    if (key === "script") return (ev?.script_result as { ok?: boolean } | undefined)?.ok === true;
    return false;
  }

  // see dsp-walk-machine.md#both-hands-fill-the-same-evidence-form

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
    // see dsp-walk-machine.md#the-graph-is-evidence
    const open = this.claims.openRecordPoints();
    if (open.length > 0) {
      lint.problems.push(
        `the decision graph holds ${open.length} open point(s) — resolve each (done | obsolete | revert | defer) before the evidence stands`,
      );
      lint.met = false;
    }
    return lint;
  }

  private formsMet(names: string[]): boolean {
    try {
      return names.every((n) => this.formLint(n).met && !this.claims.formReopened(n));
    } catch {
      return false; // unbound or missing template — the tick's refusal names it
    }
  }

  /** see dsp-walk-machine.md#what-the-form-refuses */
  private formForAgent(name: string): Record<string, unknown> {
    return agentCopy(this.formGet(name) as Record<string, unknown>, false);
  }

  /** WHAT A `wait` TELLS THE WALKER, when the route to the target could not be
   *  drawn. Lifted out of pull for the same reason doAdvice was lifted out of
   *  pullAfterSweep: the branch has three cases to say well, and saying them
   *  inline pushes the caller past its complexity bound.
   *
   *  A BRANCH POINT SHOWS ITS DOORS (i34,
   *  req-a-pull-carrying-no-choice-enters-no-iteration). "There is nowhere to
   *  go" is the truth and not the whole of it: standing where several ways
   *  lead on, the walk is waiting FOR A CHOICE, and an answer naming none
   *  leaves the reader to guess a door and read the refusal.
   *
   *  AND THE ENGINE ALREADY KNOWS WHY THE ROUTE FAILED. "nothing routes toward
   *  X from here" is true and useless.
   *
   *  THE SHAPE, NAMED PRECISELY, because the walk that hit it read it as a
   *  routing bug and it is not one. nextObjective redirects the objective to
   *  the first unmet feeder of the aim. Where that feeder is THE STATE THE
   *  WALK IS STANDING ON — stale because something above it was re-signed —
   *  the objective collapses to the current position, computeRoute is handed
   *  start === target, and an empty route comes back. Nothing is broken. The
   *  work is simply HERE, and the answer never said so. The claim guard holds which upstream
   *  claim fell, the chain it starts at, and the call that re-earns it.
   *  Measured on the i15 walk: a re-signed gate-kickoff dropped draft-vision
   *  beneath it, the wait said only that no route existed, and the walk spent
   *  twenty-five calls trying six phrasings of the same offered door before
   *  escaping. `se_why` held all of it.
   *
   *  SO THE BLOCKERS RIDE THE ANSWER rather than being pointed at. A stop is
   *  the one place a second call cannot be assumed: nobody may be there.
   *
   *  A `wait` CARRYING DOORS IS NOT A STOP, and said nothing about it either.
   *  The contract defines `wait` as "stop and name the step that waits", so an
   *  agent obeying it stops while a door stands open beside the answer. The
   *  doors are the agent's ONLY where the routed goal is behind one — rule 9's
   *  line, not this branch's to move — so the advice names both halves rather
   *  than telling anyone to walk.
   *  see dsp-walk-machine.md#every-door-is-shown */
  private waitUnroutable(pullTarget: string, note?: string): Record<string, unknown> {
    const waitingOpts = this.pullOptions();
    const stuckWhy = this.standingOn(pullTarget) ? undefined : this.whyGrey(pullTarget);
    const stuckBlockers = Array.isArray(stuckWhy?.blockers) ? (stuckWhy?.blockers as Record<string, unknown>[]) : [];
    const blocked = stuckBlockers.length > 0;
    return {
      pull: "wait",
      ...(waitingOpts.length > 0 ? { options: waitingOpts } : {}),
      waiting_for: blocked ? "the work the blocker names" : waitingOpts.length > 0 ? "a choice, or the person" : "the person",
      why: this.waitWhy(this.standingOn(pullTarget), waitingOpts.length > 0, pullTarget, note),
      ...(blocked ? { blocked_by: stuckBlockers, blocked_says: stuckWhy?.says } : {}),
      do: blocked
        ? `${pullTarget} is not reachable because something it rests on is not standing, and \`blocked_by\` names it with the exact call that fixes it. Do that first — no door gets past it, and the doors offered here lead elsewhere.`
        : waitingOpts.length > 0
          ? 'THIS IS NOT NECESSARILY A STOP — the doors in `options` are open from here. Where the goal you were routed to lies behind one, take it with form: {"choice": "<to>"} and the walk aims at it. Where none of them serves that goal, name what waits and STOP: taking a door just because it was offered is choosing unasked.'
          : "nothing is owed here and no door leads on — name what waits plainly and STOP, because the dial alone cannot wake you",
    };
  }

  /** WHAT A `fill` ACTUALLY WANTS, and the reason this is not one sentence.
   *
   *  A form comes back for three different reasons and they used to read
   *  identically: sections are still empty, the fields stand but nothing was
   *  stamped, or everything stands and signed and the BLESS is what is owed.
   *  Only the first is the agent's typing. Told to "fill every required
   *  section" while every section is full, an agent either loops or invents
   *  a stop — measured on the i15 walk, where a signed gate
   *  answered `fill` forever and said nothing about the thumb.
   *
   *  A GATE IS NOT DONE UNTIL IT IS BLESSED, and the pull is the bless's only
   *  carrier, so the pull has to say so. */
  /** WHICH SECTIONS THE ENGINE ALREADY DREW, as one sentence for the fill
   *  instruction. A drawn field arrives looking exactly like an empty one, so
   *  the reader cannot tell a computed view from a blank page unless the
   *  instruction says which is which.
   *
   *  MEASURED: 23 of the 86 evidence fields in the rigor matrix are drawn.
   *  The mark rides on each field’s hint already; this puts it where the
   *  walker is actually reading. */
  private drawnNote(names: string[]): string {
    const drawn: string[] = [];
    for (const nm of names) {
      let f: { field_hints?: Record<string, { act?: string }> };
      try {
        f = this.formGet(nm) as typeof f;
      } catch {
        continue;
      }
      for (const [field, hint] of Object.entries(f.field_hints ?? {})) if (hint.act === "rule") drawn.push(field);
    }
    if (drawn.length === 0) return "";
    return ` DRAWN ALREADY, do not write prose into them: ${drawn.join(", ")} — the engine computed each one from what stands elsewhere. Read the drawing, then accept it, reject it or pick among what it offers.`;
  }

  private fillAdvice(names: string[], fallback: string): string {
    for (const n of names) {
      let f: {
        gate?: boolean;
        signed?: boolean;
        bless?: string;
        problems?: string[];
        exists?: boolean;
        fields?: { name: string; required?: boolean; filled?: boolean }[];
      };
      try {
        f = this.formGet(n) as typeof f;
      } catch {
        continue;
      }
      if ((f.problems ?? []).length > 0) continue; // the agent's own work stands out front
      // A FORM THAT WAS NEVER OPENED HAS NO PROBLEMS EITHER, and that is the
      // hole this reads. The linter answers `problems: []` for a missing
      // instance, so an advice keyed on problems alone told a walker standing
      // on an empty form that "every required section is filled" — measured
      // live at iterations/i15/run-demos, whose own `fields` line in the same
      // answer read `current_situation*=N follow_up*=N`.
      //
      // SO ASK THE FIELDS, WHICH CANNOT LIE ABOUT IT. Every advice below says
      // some version of "the writing is done"; none of them is true until the
      // required sections carry content.
      const unfilled = (f.fields ?? []).filter((x) => x.required === true && x.filled !== true);
      if (f.exists !== true || unfilled.length > 0) continue;
      if (f.gate === true && (f.bless ?? "") === "") {
        return f.signed === true
          ? `${n} STANDS SIGNED AND EVERY SECTION IS FULL. Nothing you type moves it — what is owed is the BLESS, the thumb on this gate. Where the dial puts that thumb in your hand, send it as form: {"bless": true} or {"bless": false} with a verdict. Where it does not, name this gate as the step that waits and STOP: the dial alone cannot wake you.`
          : `${n} is a GATE and its sections stand. Stamp it with form: {"submit": true}, then the BLESS is what remains — form: {"bless": true} where the dial allows it, otherwise name this gate as the step that waits and stop.`;
      }
      if (f.signed !== true) {
        return `${n}: every required section is filled and NOTHING IS STAMPED. Send form: {"submit": true} — the submit runs every check and signs. Without it this same form comes back looking untouched.`;
      }
    }
    return fallback;
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
    const fm = this.claims.formMachine(machineId);
    if (this.claims.isStateForm(name, fm)) return this.claims.stateFormGet(name, fm);
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

  /** see dsp-walk-machine.md#a-write-is-what-changes-which-claims-stand */
  forgetRoute(): void {
    this.routeMemo = undefined;
    Claims.forgetVerdicts();
  }

  formSave(name: string, fields: Record<string, string>, by = "agent", machineId?: string): Record<string, unknown> {
    this.forgetRoute();
    const fm = this.claims.formMachine(machineId);
    if (this.claims.isStateForm(name, fm)) return this.claims.stateFormSave(name, fields, by, fm);
    const h = this.formHome(name);
    let raw = existsSync(h.instanceAbs) ? readFileSync(h.instanceAbs, "utf8") : scaffoldInstance(h.template, `${this.bound?.id} — ${name}`);
    for (const [f, content] of Object.entries(fields)) raw = withFieldContent(raw, f, String(content));
    mkdirSync(dirname(h.instanceAbs), { recursive: true });
    writeFileSync(h.instanceAbs, raw, "utf8");
    this.notifyChange();
    return this.formGet(name);
  }

  formConfirm(name: string, field: string, index: number, machineId?: string): Record<string, unknown> {
    const fm = this.claims.formMachine(machineId);
    if (this.claims.isStateForm(name, fm)) {
      const sh = this.claims.stateFormHome(name, fm);
      if (existsSync(sh.instanceAbs)) {
        writeFileSync(sh.instanceAbs, confirmPrefill(readFileSync(sh.instanceAbs, "utf8"), field, index), "utf8");
        this.notifyChange();
      }
      return this.claims.stateFormGet(name, fm);
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
    const fm = this.claims.formMachine(machineId);
    if (this.claims.isStateForm(name, fm)) {
      this.claims.assertStateFormActive(name, fm, "submit");
      // SUBMIT is the checking act: an unmet form THROWS, so the log line
      // wears the ✗ and carries the why — the details stay the definition.
      const sh = this.claims.stateFormHome(name, fm);
      const before = this.claims.stateFormGet(name, fm) as { met?: boolean; problems?: string[] };
      if (!existsSync(sh.instanceAbs) || before.met !== true) {
        throw new Rejection({
          clause: CLAUSES.CONDITION_UNMET,
          expected: `every check green on ${name} — submit stamps only a standing claim`,
          got: (before.problems ?? []).join(" · ") || "nothing saved yet",
          remedy: { tool: "se_pull", args: {}, note: "fix the named fields, save, submit again" },
          source: "engine/session.ts stateform",
        });
      }
      const hereState = this.claims.stateFormState(name, fm);
      const feeders = this.claims.feedersUnsigned(fm, hereState);
      if (feeders.length > 0) {
        // A SIGNED FEEDER IS NOT THE FAULT — see Claims.feederFault. Named
        // alone, a feeder that is signed, complete and correct sends the
        // reader to a state with nothing wrong with it.
        const root = this.claims.feederFault(fm, hereState);
        const upstream =
          root === undefined
            ? ""
            : ` — the break is upstream at ${root.state}${root.why.length > 0 ? `: ${root.why.join(" · ")}` : ", whose form is not signed"}`;
        throw new Rejection({
          clause: CLAUSES.CONDITION_UNMET,
          expected: `a state requires ALL its inputs — every feeder form signed before ${name} may stamp`,
          got: `unsigned feeders: ${feeders.join(", ")}${upstream}`,
          remedy: {
            tool: "se_pull",
            args: {},
            note:
              root === undefined
                ? "walk the named states and submit their forms; this one stamps after"
                : `go to ${root.state} and fix what it names — the feeder above it is already signed, so re-signing it changes nothing`,
          },
          source: "engine/session.ts stateform",
        });
      }
      writeFileSync(sh.instanceAbs, withBy(withSignedOff(readFileSync(sh.instanceAbs, "utf8"), new Date().toISOString()), by), "utf8");
      this.notifyChange();
      return this.claims.stateFormGet(name, fm);
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

  /** see dsp-walk-machine.md#every-trace-nodes-id-against-the-path-that-holds */
  /** INTERNAL to the session pair. sessionforms.ts takes these paths as an
   *  argument, and a private member cannot satisfy a structural interface. */
  traceRoot(it?: Iteration): string {
    return it?.path ?? this.workRoot();
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

  /** see dsp-walk-machine.md#the-iteration-this-machine-belongs-to */
  /** INTERNAL to the session pair — see traceRoot above. */
  declIteration(decl: MachineDecl): Iteration | undefined {
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
      // see dsp-the-goal-binds-the-walk.md#from-the-desk-nothing-is-bound
      const all = this.views.reachableMachines();
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
      const shown = k === "read_consume" ? this.reads.consumeDemand(s) : args;
      out[k] = { args: shown, met: this.conditionKeyMet(m, s, k, which), note: conditionNotePath(k) };
    }
    return out;
  }

  /** Whether the walk has passed through boot once already. */
  private bootEntered = false;

  /** The mirror's ▶ lock: is entering `t` fully proven on the human's
   *  channel (explicit entry conditions AND the pull)? */
  entryReadyHuman(m: MachineDecl, t: StateDecl): boolean {
    if (!this.conditionMet(m, t, "enter")) return false;
    return this.reads.entryRequirements(m, t).every((p) => this.reads.readProven("human", p, {}));
  }

  /** WHAT still blocks the human's entry into `t` — the locked button's
   *  tooltip names these instead of a bare "not met". */
  entryMissingHuman(m: MachineDecl, t: StateDecl): string[] {
    const out: string[] = [];
    for (const [k, st] of Object.entries(this.conditionStatus(m, t, "enter") ?? {})) {
      if (!st.met && k !== "read") out.push(`condition ${k}`);
    }
    for (const p of this.reads.entryRequirements(m, t)) {
      if (!this.reads.readProven("human", p, {})) out.push(`read ${p}`);
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
          args.statement === undefined ? undefined : String(args.statement),
          this.machineRoot(),
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
      const hash = d.hash !== "" ? d.hash : this.reads.diskHash(d.path);
      return { ...d, hash, checked: this.reads.humanChecked(d.path, hash) };
    });
    // A CONSUMED document rides the reading room like the authored list —
    // it is demanded the same way and its checkbox lives here too.
    for (const rel of this.reads.consumeDemand(s)) {
      const hash = this.reads.diskHash(rel);
      out.push({ path: rel, sources: ["consume"], hash, checked: this.reads.humanChecked(rel, hash) });
    }
    return out;
  }

  /** Not private because a private member cannot satisfy a structural
   *  interface, and Scripts reads this through its host. */
  assertStanding(stateId: string): void {
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
    const key = evidenceKey(machine, s.id);
    const record = { ...(this.evidence.get(key) ?? {}), ...data, at: new Date().toISOString() };
    this.evidence.set(key, record);
    // THE STORED FORM IS THE DURABLE COPY (owner rulings 2026-08-04): a
    // state with evidence fields lands every fill in its instance too.
    if (s.evidence_form.length > 0 && this.claims.isStateForm(s.id)) {
      // submit and bless are not sections — they ride the fill as their
      // own keys and land AFTER the save, which strips stale stamps first.
      const { bless, submit, ...fills } = data;
      const strings = Object.fromEntries(Object.entries(fills).map(([k, v]) => [k, typeof v === "string" ? v : JSON.stringify(v)]));
      this.claims.stateFormSave(s.id, strings, "agent");
      if (submit === true || submit === "true" || submit === "yes") this.formDone(s.id, "agent");
      if (bless !== undefined) this.claims.formBless(s.id, bless === true || bless === "true" || bless === "yes", "agent");
    }
    this.notifyChange();
    return { state: `${machine.id}/${s.id}`, evidence: record };
  }

  private refuseCondition(m: MachineDecl, s: StateDecl, which: "exit" | "entry", key: string, args: string[]): never {
    const stateId = s.id;
    const note = conditionNotePath(key);
    if (key === "script") {
      const st = this.scripts.scriptStatus(m, s);
      throw new Rejection({
        clause: CLAUSES.CONDITION_UNMET,
        expected: `${which} condition 'script' of ${stateId} — ${args.join(", ")} exits 0 (see ${note})`,
        got: st.ran ? st.output : "not run yet",
        remedy: { tool: "se_pull", args: {}, note: "fix what the output names, then pull again — the script re-runs on every attempt" },
        source: "engine/session.ts conditions",
      });
    }
    if (key === "no_pending_note") {
      const blockers = this.claims.blockingNotes(args);
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
    // see dsp-walk-machine.md#a-fallback-is-the-drawn-path-for-the-condition
    const escaping = to !== undefined && from.edges.some((e) => e.to === to && (e.role === "fallback" || e.role === "error"));
    if (from.exit?.script !== undefined && !escaping) await this.scripts.scriptRun(from.id); // a tick attempt runs the script
    for (const [key, args] of Object.entries(from.exit ?? {})) {
      if (key === "read" || key === "read_consume") continue; // channel-proven below, not evidence
      if (escaping) continue;
      if (!this.conditionKeyMet(m, from, key, "leave")) this.refuseCondition(m, from, "exit", key, args);
    }
    const targetId = to ?? (from.edges.length === 1 ? from.edges[0].to : undefined);
    this.reads.assertReads(m, from, targetId === undefined ? [] : [targetId], channel, supplied);
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
        lookahead_read: this.reads.lookaheadRequirements(machine, s),
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
            ...(t !== undefined ? { entry_read: this.reads.unreadEntryRequirements(machine, t) } : {}),
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
      // see dsp-walk-machine.md#the-tier-is-the-answer
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
      ...this.strengthNeeded(),
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
              note: "pull. It hands you one document and asks three fill-in-the-blank questions about it; answer them on the next pull and the following document arrives. No paths to name.",
            },
          }
        : {}),
      // The session's reading list: what the human checked while driving.
      // Your advances must prove the same docs (paths only — the hashes
      // are earned by reading).
      human_checked: this.reads.humanCheckedPaths(),
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
    this.reads.assertReads(
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
    if (!this.inSub()) this.unbind(); // leaving the outermost sub leaves the context
    // THE SHIPPED ITERATION ARCHIVES ITSELF (owner ruling 2026-08-11): the
    // walk leaving through the terminal is the trigger; the blessed release
    // gate was the ruling, and the route cannot pass an unblessed gate.
    if (pm.id === "iterations") this.closeShippedIteration(top.parentState);
    this.seedSubs();
    return this.landing();
  }

  /** Close and archive the iteration whose machine the walk just left —
   *  merge, retire the record dir to its branch, and seed the needs-retro
   *  note the shipped row promises. Already-closed
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
    // see dsp-the-goal-binds-the-walk.md#the-kickoff-pins
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
    // see dsp-walk-machine.md#the-exit-is-the-hard-gate
    if (inIteration && this.state(top.decl, cur).evidence_form.length > 0 && !this.claims.takesRepairEdge(top.decl, cur, to)) {
      this.claims.assertStateFormMet(cur);
    }
    const outcome = this.outcomeFor(top.decl, cur, to);
    this.completeGuarded(top.decl, top.instance, cur, outcome, now, to);
    // Leaving the state is what destroys what it consumed.
    this.reads.consumeDocs(this.state(top.decl, cur));
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
      if (this.bootEntered) this.reads.clearReadBuffer();
      this.bootEntered = true;
    }
    if (target !== undefined) this.gatePriority(this.machine, [target], channel);
    await this.assertConditions(this.machine, this.state(this.machine, cur), to, channel, supplied);
    const outcome = this.outcomeFor(this.machine, cur, to);
    this.completeGuarded(this.machine, this.instance, cur, outcome, now, to);
    this.reads.consumeDocs(this.state(this.machine, cur));
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
    const supplied = this.reads.readProofs(channel);
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
      lookahead_read: this.reads.lookaheadRequirements(home, s),
      ...(s.submachine !== undefined ? { submachine: s.submachine } : {}),
      next: s.edges.map((e) => {
        const t = home.states.find((st) => st.id === e.to);
        return {
          to: e.to,
          role: e.role,
          ...(e.guard !== undefined ? { guard: e.guard } : {}),
          ...(t !== undefined ? { kind: t.kind, statement: t.statement, priority: t.priority } : {}),
          ...(t !== undefined ? { entry_read: this.reads.unreadEntryRequirements(home, t) } : {}),
        };
      }),
    };
  }

  private closedFired = false;

  /** see dsp-walk-machine.md#the-ticks-result */
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
      this.live.releaseKeepAwake();
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
    const gen = this.top()?.gen?.subGen?.[subState.id]?.() ?? this.views.genFor(subState.id);
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
    // see dsp-walk-machine.md#a-placeholder-may-be-drawn-and-routed-through
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
      ...this.strengthNeeded(),
      legal_tools: this._emergency ? "all" : all ? "all" : [...ALWAYS_LEGAL, ...tools],
      history: this.instance.history.slice(-10),
    };
  }
}
