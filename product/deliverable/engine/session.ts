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
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
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
import { parseStateNote, section } from "./notes.ts";

/** THE TICK is the machinery — one tool, legal in EVERY state. Without
 *  arguments it reports (observability is never gated); with arguments it
 *  advances. se_note is legal everywhere too: a stray is captured where it
 *  strikes, never chased (contract rule 4). */
const ALWAYS_LEGAL: ReadonlySet<string> = new Set(["se_tick", "se_note", "se_panel"]);
/** RESTRICTED tools: "all" does NOT grant these — a state must name them.
 *  se_note_drain stays restricted, so a state earns it by saying so. The
 *  retro and the front desk both name it; what they may DO with it differs,
 *  and that split lives in engine/inbox.ts, not here. */
const RESTRICTED: ReadonlySet<string> = new Set(["se_note_drain"]);
const MACHINERY: readonly string[] = ["se_tick", "se_file_read"];

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
      const s = JSON.parse(readFileSync(join(seDir(root), "settings.json"), "utf8")) as { autonomy?: number; shutdown?: number; session?: string };
      const mine = process.env.SE_SESSION;
      if (mine !== undefined && mine !== "" && s.session === mine) {
        if (typeof s.autonomy === "number" && s.autonomy >= 0 && s.autonomy <= 1) this._autonomy = s.autonomy;
        if (typeof s.shutdown === "number" && Number.isInteger(s.shutdown) && s.shutdown >= 1 && s.shutdown <= 5) this._shutdown = s.shutdown;
      }
    } catch { /* no store yet — the defaults stand */ }
    this.syncKeepAwake();
  }

  private persistSettings(): void {
    try {
      mkdirSync(seDir(this.root), { recursive: true });
      writeFileSync(join(seDir(this.root), "settings.json"), JSON.stringify({ session: process.env.SE_SESSION ?? null, autonomy: this._autonomy, shutdown: this._shutdown }) + "\n", "utf8");
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

  /** SHUTDOWN CONTROL (owner design, five notches): 1 none · 2 keep-awake ·
   *  3 keep-awake + idle-on-done · 4 + end-on-done · 5 + power-off-on-done.
   *  Keep-awake holds the OS awake while the walk runs; level 5 arms a
   *  one-minute OS shutdown when the machine reaches end. */
  private _shutdown = 1;
  private keepAwake?: ReturnType<typeof spawn>;

  /** The mirror's URL when one is listening — the panel se_panel opens. */
  mirrorUrl?: string;

  get shutdown(): number {
    return this._shutdown;
  }

  setShutdown(value: number): Record<string, unknown> {
    if (!Number.isInteger(value) || value < 1 || value > 5) {
      throw new Rejection({
        clause: CLAUSES.REQUIRED_ARGS,
        expected: "a shutdown level 1..5 (none · keep-awake · +idle-on-done · +end-on-done · +power-off-on-done)",
        got: String(value),
        remedy: { tool: "se_tick", args: {}, note: "the mirror's shutdown bar sets it" },
        source: "engine/session.ts shutdown",
      });
    }
    const was = this._shutdown;
    this._shutdown = value;
    this.persistSettings();
    this.syncKeepAwake();
    this.notifyChange();
    return { shutdown: value, was };
  }

  /** THE MILESTONE REVIEW REPORT (owner rulings 2026-07-30): the one thing
   *  a person reads most, so it is the gate's MECHANICAL demand. The
   *  scaffold generates from the gate's OWN evidence fields (the matrix,
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
    const REVIEW_TAIL: readonly { name: string; hint: string }[] = [
      { name: "verify", hint: "did each input deliver against its referent?" },
      { name: "validate", hint: "does the milestone meet the frame and the vision?" },
      { name: "red_team", hint: "argue the opposing case; a significant decision carries a kill criterion" },
    ];
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
        ...s.evidence_form.flatMap((f) => [`## ${f.name}`, "", `<!-- ${f.description}${f.required ? "" : " (optional)"}${f.killer === true ? " (KILLER: unmet alone fails the gate)" : ""} -->`, ""]),
        ...REVIEW_TAIL.flatMap((t) => [`## ${t.name}`, "", `<!-- ${t.hint} -->`, ""]),
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
    for (const t of REVIEW_TAIL) {
      if (filledText(t.name) === "") problems.push(`${t.name} is empty`);
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
    const want = this._shutdown >= 2 && process.platform === "win32" && process.env.SE_KEEPAWAKE_DISABLE !== "1";
    if (want && this.keepAwake === undefined) {
      const src = "Add-Type -TypeDefinition 'using System.Runtime.InteropServices; public class KA { [DllImport(\"kernel32.dll\")] public static extern uint SetThreadExecutionState(uint f); }'; while ($true) { [KA]::SetThreadExecutionState(2147483651) | Out-Null; Start-Sleep -Seconds 30 }";
      this.keepAwake = spawn("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", src], { stdio: "ignore", windowsHide: true });
    } else if (!want && this.keepAwake !== undefined) {
      this.keepAwake.kill();
      this.keepAwake = undefined;
    }
  }

  // ── THE WAIT — how the machine reaches a holding agent. MCP cannot push;
  //    se_tick {wait: true} blocks server-side until the human's hand moves
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

  setAutonomy(value: number): Record<string, unknown> {
    if (typeof value !== "number" || Number.isNaN(value) || value < 0 || value > 1) {
      throw new Rejection({
        clause: CLAUSES.REQUIRED_ARGS,
        expected: "an autonomy between 0 (every step is the human's) and 1 (fully autonomous)",
        got: String(value),
        remedy: { tool: "se_tick", args: {}, note: "the autonomy is set from the mirror's slider or at launch (--autonomy)" },
        source: "engine/session.ts autonomy",
      });
    }
    const was = this._autonomy;
    this._autonomy = value;
    this.persistSettings();
    this.notifyChange(); // a holding agent wakes and re-reads the packet
    return { autonomy: value, was };
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
          remedy: { tool: "se_tick", args: {}, note: "STOP and tell the human PLAINLY: this step waits for their hand (they advance it in the mirror, or raise the slider), and the slider alone cannot wake you — they must SEND YOU A MESSAGE (e.g. 'continue') after changing it. Then end your turn. Never retry the advance blind." },
          source: "engine/session.ts threshold",
        });
      }
    }
  }

  /** ATOMIC TICKS (owner ruling 2026-07-27): the walk can be moved by the
   *  human's hand at any moment, so a moving tick carries `from` — the
   *  position it was planned at. A mismatch refuses the move; the refusal
   *  names the real position. Bare sub-state ids match their prefixed
   *  form. */
  assertFrom(from: string): void {
    const now = this.active()[0] ?? "";
    const bare = now.includes("/") ? now.slice(now.lastIndexOf("/") + 1) : now;
    if (from === now || from === bare) return;
    throw new Rejection({
      clause: CLAUSES.STALE_POSITION,
      expected: `a move from ${now} — where the walk stands`,
      got: `a tick planned from ${from}`,
      remedy: { tool: "se_tick", args: {}, note: "the walk moved (the human's hand does too) — read the fresh packet and continue from the real position; never replay a move planned elsewhere" },
      source: "engine/session.ts atomic",
    });
  }

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
        remedy: { tool: "se_tick", args: {}, note: "walk to idle first, then se_reload" },
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
   *  kickoff compiles the record's blessed change_size from the LIVE matrix
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
        expected: "a change_size in the iteration record (patch | minor | major) — the bless compiles the column and pins the machine",
        got: "no change_size in the record's frontmatter",
        remedy: {
          tool: "se_file_patch",
          args: { ops: [{ path: itRecordRel(it.id), old_string: "status:", new_string: "change_size: <patch | minor | major>\nstatus:" }] },
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
    pinIteration(this.root, it, size);
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
        remedy: { tool: "se_tick", args: {}, note: "enter the expedition via continue_expedition first" },
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
        remedy: { tool: "se_tick", args: { update: { op: "done", node: open[0].id, brief: "<how it resolved>" } }, note: "resolve every point (done | obsolete | revert | defer), then close" },
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

  /** ESCAPE (owner ruling 2026-07-27): always to idle — "we cannot work our
   *  way through this machine". The sub-machine is LEFT STANDING (nothing
   *  fills); the escape is a recorded failure with its reason, and a later
   *  continue re-enters from the beginning, fast-forwarding on stored
   *  evidence. Boot is the one exception — it must complete. */
  escape(reason: string, channel: Channel = "agent", readHashes: Record<string, string> = {}): Record<string, unknown> {
    return this.exitToIdle(reason, channel, readHashes, "escaped");
  }

  /** PAUSE (owner ruling 2026-07-29): escape's move, recorded as ordinary
   *  work. An expedition is a day's bucket and is MEANT to stay open, so
   *  stepping out to pick it up later is normal. Filing that as an escape
   *  writes a false failure — and the retro mines escapes for the real ones. */
  pause(reason: string, channel: Channel = "agent", readHashes: Record<string, string> = {}): Record<string, unknown> {
    return this.exitToIdle(reason, channel, readHashes, "paused");
  }

  private exitToIdle(
    reason: string,
    channel: Channel,
    readHashes: Record<string, string>,
    kind: "escaped" | "paused",
  ): Record<string, unknown> {
    const supplied = this.readProofs(channel, readHashes);
    const verb = kind === "escaped" ? "escape" : "pause";
    if (reason.trim() === "") {
      throw new Rejection({
        clause: CLAUSES.REQUIRED_ARGS,
        expected:
          kind === "escaped"
            ? "a reason — an escape is a recorded failure, never a silent exit"
            : "a reason — say what you are stepping out of, so the walk reads back",
        got: "an empty reason",
        remedy: {
          tool: "se_tick",
          args: kind === "escaped" ? { escape: "<why the walk cannot continue>" } : { pause: "<what you are stepping out of>" },
        },
        source: `engine/session.ts ${verb}`,
      });
    }
    if (!this.inSub()) {
      // THE HATCH ALWAYS WORKS (owner ruling 2026-07-28): a main-machine
      // walk escapes to idle too; only boot's green-proving must complete.
      const stood = this.active();
      if (stood.includes("idle")) {
        throw new Rejection({
          clause: CLAUSES.NOT_LEGAL_IN_STATE,
          expected: "a walk away from idle",
          got: `standing at idle — idle IS the ${verb} target`,
          remedy: { tool: "se_tick", args: {}, note: `nothing to ${verb}; walk on normally` },
          source: `engine/session.ts ${verb}`,
        });
      }
      if (!this.instance.history.some((h) => h.state === "boot" && h.outcome === "filled")) {
        throw new Rejection({
          clause: CLAUSES.NOT_LEGAL_IN_STATE,
          expected: "a booted walk",
          got: `a ${verb} before boot completed [${stood.join(", ")}]`,
          remedy: { tool: "se_tick", args: {}, note: "boot cannot be skipped — it must complete; if it is broken, tell the user" },
          source: `engine/session.ts ${verb}`,
        });
      }
      const nowMain = new Date().toISOString();
      this.gatePriority(this.machine, ["idle"], channel);
      const idleState = this.state(this.machine, "idle");
      const missingMain = this.entryRequirements(this.machine, idleState).filter((p) => !this.readProven(channel, p, supplied));
      if (missingMain.length > 0) this.refuseReads("entry", "idle", missingMain, channel);
      this.assertHandover(channel, supplied);
      const stoodIn = stood[0] ?? "(no state)";
      this.instance.history.push({ state: stoodIn, outcome: kind, at: nowMain });
      if (kind === "escaped") this.instance.escapes.push({ state: stoodIn, exhausted_guard: reason.slice(0, 300), at: nowMain });
      this.instance.active = ["idle"];
      this.instance.current = "idle";
      this.unbind();
      this.notifyChange();
      return {
        ...this.tickInfo(),
        [kind]: { from: stoodIn, reason },
        note:
          kind === "escaped"
            ? "escaped to idle — the walk was left standing. Tell the user PLAINLY what blocked it, then wait for their ruling."
            : "paused to idle — the walk was left standing, and a later continue re-enters it. Nothing failed.",
      };
    }
    if (this.top()!.decl.id === "boot") {
      throw new Rejection({
        clause: CLAUSES.NOT_LEGAL_IN_STATE,
        expected: "a sub-machine other than boot",
        got: `a ${verb} from boot`,
        remedy: { tool: "se_tick", args: {}, note: "boot cannot be skipped — it must complete; if it is broken, tell the user" },
        source: `engine/session.ts ${verb}`,
      });
    }
    const now = new Date().toISOString();
    this.gatePriority(this.machine, ["idle"], channel);
    const idle = this.state(this.machine, "idle");
    const missing = this.entryRequirements(this.machine, idle).filter((p) => !this.readProven(channel, p, supplied));
    if (missing.length > 0) this.refuseReads("entry", "idle", missing, channel);
    this.assertHandover(channel, supplied);
    const stoodIn = this.active()[0];
    const parent = this.subs[0].parentState;
    this.instance.history.push({ state: stoodIn, outcome: kind, at: now });
    if (kind === "escaped") this.instance.escapes.push({ state: parent, exhausted_guard: reason.slice(0, 300), at: now });
    this.instance.active = [...activeStates(this.instance).filter((s) => s !== parent), "idle"];
    this.instance.current = "idle";
    this.subs = [];
    this.unbind();
    this.notifyChange();
    return {
      ...this.tickInfo(),
      [kind]: { from: stoodIn, reason },
      note:
        kind === "escaped"
          ? "escaped to idle — the machine was left standing. Tell the user PLAINLY what blocked the walk, then wait for their ruling."
          : "paused to idle — the machine was left standing, and a later continue re-enters it. Nothing failed.",
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
      remedy: { tool: "se_tick", args: {}, note: "every plain edge into the named state must fire before it activates. If those edges are returns, redraw them (a reverse-of-forward edge compiles as a return) — or walk the other branches first. The walk has not moved." },
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
  private clearTargetIfArrived(): void {
    if (this._target === "") return;
    const r = this.route(this._target);
    if (r.found && r.steps.length === 0) this._target = "";
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
        remedy: { tool: "se_tick", args: { route: "front_desk" }, note: "peek a route before aiming at it; the drawn edges are the only ways" },
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
      if (decl !== undefined && st !== undefined) for (const d of this.pulled(decl, st)) reads.add(d.path);
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

  /** THE SWEEP — the route, walked. It collapses ROUND TRIPS and nothing
   *  else: every hop still enters its state, still weighs the slider, still
   *  proves its reads, still runs its scripts, still writes its own line to
   *  the feed. The first hop that will not pass stops it, and says so.
   *
   *  THE ROUTE IS RECOMPUTED AFTER EVERY HOP, which is the detour: if the
   *  ground moved, the way is worked out again FROM WHERE THE WALK NOW
   *  STANDS rather than followed off a cliff. */
  async sweep(target: string, channel: Channel, readHashes: Record<string, string>): Promise<Record<string, unknown>> {
    const walked: string[] = [];
    for (let guard = 0; guard < 64; guard++) {
      const r = this.route(target);
      if (r.steps.length === 0) {
        return { ...this.tickInfo(), swept: walked, arrived: r.found, ...(r.found ? {} : { note: r.note }) };
      }
      const step = r.steps[0];
      try {
        await this.tickAdvance(step.tick.to === undefined ? undefined : String(step.tick.to), channel, readHashes);
      } catch (e) {
        if (!(e instanceof Rejection)) throw e;
        return {
          ...this.tickInfo(),
          swept: walked,
          arrived: false,
          stopped_at: step.to,
          refusal: e.toJSON(),
          note: `swept ${walked.length} hop(s), then ${step.to} refused — answer it and sweep again; the route recomputes from here`,
        };
      }
      walked.push(step.to);
    }
    return { ...this.tickInfo(), swept: walked, arrived: false, note: "64 hops without arriving — the sweep stops rather than looping" };
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
    if (this.instance.status === "closed") {
      throw new Rejection({
        clause: CLAUSES.NOT_LEGAL_IN_STATE,
        expected: "an open session machine",
        got: `${tool} after the machine closed`,
        remedy: { tool: "se_tick", args: {}, note: "only the tick answers now; a new session starts at the beginning" },
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
      const authored = (which === "leave" ? s.exit : s.entry)?.read ?? [];
      const docs = which === "leave" ? [...authored, ...this.handoverDemand(m, s)] : authored;
      return docs.every((p) => this.readProven("human", p, {}) || this.agentProven(p));
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
        remedy: { tool: "se_tick", args: {}, note: "open the expedition first (continue_expedition binds the lane)" },
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
      const shown = k === "read" && which === "leave" ? [...args, ...this.handoverDemand(m, s)] : args;
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

  private readProofs(channel: Channel, supplied: Record<string, string>): Record<string, string> {
    if (channel !== "agent") return supplied;
    const merged: Record<string, string> = {};
    for (const [p, h] of this.readBuffer.entries()) merged[p] = h;
    for (const [p, h] of Object.entries(supplied)) {
      if (typeof h === "string" && h !== "") merged[p] = h;
    }
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

  /** THE HANDOVER is a BOOT EXIT rule (owner ruling 2026-07-27): a
   *  left-behind .se/HANDOVER.md joins read_contract's read list — read,
   *  and checkable in the mirror, where the session's first reads happen.
   *  Absent, nothing is demanded. */
  private handoverDemand(m: MachineDecl, s: StateDecl): string[] {
    if (m.id !== "boot" || s.id !== "read_contract") return [];
    return existsSync(join(seDir(this.root), "HANDOVER.md")) ? [".se/HANDOVER.md"] : [];
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
    const exitReads = [...(from.exit?.read ?? []), ...this.handoverDemand(m, from)];
    const missingExit = exitReads.filter((p) => !this.readProven(channel, p, supplied));
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
          remedy: { tool: "se_tick", args: {}, note: "the state's other tools are the agent's lane" },
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
    // THE HANDOVER rides boot's reading room — leaving read_contract
    // demands it like the authored list; its checkbox lives here too.
    for (const rel of this.handoverDemand(m, s)) {
      const hash = this.diskHash(rel);
      out.push({ path: rel, sources: ["handover"], hash, checked: this.humanChecked(rel, hash) });
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
    if (key === "no_pending_note") {
      const blockers = this.blockingNotes(args);
      throw new Rejection({
        clause: CLAUSES.CONDITION_UNMET,
        expected: `${which} condition 'no_pending_note' of ${stateId} — no pending note carrying: ${args.join(", ")} (see ${note})`,
        got: blockers.map((b) => `${b.ref}: ${b.text.slice(0, 80)}`).join(" · ") || "unmet",
        remedy: { tool: "se_tick", args: {}, note: "run the RETRO first (idle → retro): its drain dispositions these notes, then this gate opens" },
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
        legal_tools: s.kind === "start" || s.kind === "end" || s.kind === "join" ? [...MACHINERY] : (s.legal_tools ?? []),
        ...(s.entry !== undefined ? { entry: this.conditionStatus(machine, s, "enter") } : {}),
        ...(s.exit !== undefined ? { exit: this.conditionStatus(machine, s, "leave") } : {}),
        exit_met: this.conditionMet(machine, s, "leave"),
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
    return {
      machine: this.machine.id,
      breadcrumb: this.breadcrumb(),
      active: this.active(),
      ...(this.bound !== undefined ? { expedition: this.bound.id } : {}),
      status: this.instance.status,
      autonomy: this._autonomy,
      shutdown: this._shutdown,
      // WHERE THIS IS HEADED. Carried on every packet so neither hand has
      // to ask, and so a walk that drifts off the way is visibly off it.
      target: this._target,
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
    const supplied = this.readProofs(channel, readHashes);
    if (this.instance.status === "closed") {
      throw new Rejection({
        clause: CLAUSES.NOT_LEGAL_IN_STATE,
        expected: "an open machine",
        got: "a tick after end",
        remedy: { tool: "se_tick", args: {}, note: "the machine is done; a new session starts at the beginning" },
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
    if (this.machine.id === "main" && cur === this.machine.initial && target === "boot") this.clearReadBuffer();
    if (target !== undefined) this.gatePriority(this.machine, [target], channel);
    await this.assertConditions(this.machine, this.state(this.machine, cur), to, channel, supplied);
    this.completeGuarded(this.machine, this.instance, cur, "filled", now, to);
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
      legal_tools: s.kind === "start" || s.kind === "end" || s.kind === "join" ? [...MACHINERY] : (s.legal_tools ?? []),
      ...(s.entry !== undefined ? { entry: this.conditionStatus(home, s, "enter") } : {}),
      ...(s.exit !== undefined ? { exit: this.conditionStatus(home, s, "leave") } : {}),
      exit_met: this.conditionMet(home, s, "leave"),
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
  jumpBack(target: string, channel: Channel = "human", readHashes: Record<string, string> = {}): Record<string, unknown> {
    const now = new Date().toISOString();
    const supplied = this.readProofs(channel, readHashes);
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
    const inst = this.top()?.instance ?? this.instance;
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
      this.keepAwake?.kill();
      this.keepAwake = undefined;
      if (this._shutdown === 5 && process.platform === "win32" && process.env.SE_KEEPAWAKE_DISABLE !== "1") {
        spawn("shutdown", ["/s", "/t", "60"], { stdio: "ignore", windowsHide: true, detached: true }).unref();
      }
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
        banner: "🦆 SE v3 booted. Main machine is live. All work runs through the se lane; every call is logged. se_tick shows where you are.",
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
        decl = compileMachine(this.root, resolveRef(this.root, mainMachinePath(this.root), subState.submachine!));
      } catch (e) {
        // A broken drawing refuses TYPED and the engine survives; the next
        // tick retries the seed once the canvas is fixed.
        throw new Rejection({
          clause: CLAUSES.CANVAS_BROKEN,
          expected: `${subState.id}'s canvas compiles`,
          got: String((e as Error).message),
          remedy: { tool: "se_tick", args: { advance: true }, note: "fix the drawing in Obsidian, then tick again — entering retries; back or escape also work" },
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
      shutdown: this._shutdown,
      legal_tools: all ? "all" : [...ALWAYS_LEGAL, ...tools],
      history: this.instance.history.slice(-10),
    };
  }
}
