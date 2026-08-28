// THE SESSION'S LIVENESS: the power flags, the idle clock, the keep-awake
// child, the long-poll wait queue, and the mirror's ping.
//
// Lifted out of Session whole. None of it touches the walk — it is about the
// machine the walk runs on and the windows watching it — so it owns its own
// state and Session holds one of these.
//
// see dsp-boot-and-power.md#what-survives-a-reload-and-what-does-not
import { spawn } from "node:child_process";
import { CLAUSES, Rejection } from "./errors.ts";
import { anyJobRunning } from "./run.ts";

/** What the liveness needs of the session it serves: somewhere to save a
 *  flag, and the walk's own account of where it stands. */
export interface LivenessHost {
  persist(): void;
  describe(): Record<string, unknown>;
  /** SAY SOMETHING WITH NO CALL IN FLIGHT. The idle clock runs in the
   *  background, so it has no result to ride and needs a channel of its own. */
  say(line: string): void;
}

export class Liveness {
  private readonly host: LivenessHost;

  constructor(host: LivenessHost) {
    this.host = host;
  }

  /** The two flags, as the settings file carries them. */
  restore(blockSleep: unknown, shutdownAtFrontDesk: unknown): void {
    if (typeof blockSleep === "boolean") this._blockSleep = blockSleep;
    if (typeof shutdownAtFrontDesk === "boolean") this._shutdownAtFrontDesk = shutdownAtFrontDesk;
  }

  /** The session reached end: the keep-awake dies with it. */
  releaseKeepAwake(): void {
    this.keepAwake?.kill();
    this.keepAwake = undefined;
  }

  /** Bring the machine into line with whatever the flags now say. */
  sync(): void {
    this.syncKeepAwake();
    this.armIdleTimer();
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

  private _shutdownAtFrontDesk = false;

  private keepAwake?: ReturnType<typeof spawn>;

  private idleTimer?: ReturnType<typeof setInterval>;

  /** Any act at all, by any hand. The idle clock measures from here. */
  private lastActivity = Date.now();

  /** THE AGENT WORKING IS ACTIVITY, and the clock had no way to hear it.
   *
   *  `notifyChange` only fires when the WALK moves. An agent reading, searching
   *  and writing at the front desk moves nothing, so a countdown ran underneath
   *  a session that was plainly busy.
   *
   *  EVERY LANE CALL TOUCHES THIS. It is the cheapest true signal there is: the
   *  agent cannot work without making one.
   *
   *  IT ONLY RECORDS THE TIME. Saying anything here would speak once per call,
   *  which is hundreds of lines an hour. The WATCHDOG decides and the watchdog
   *  speaks — one decider, once a minute. */
  touch(at = Date.now()): void {
    this.lastActivity = at;
  }

  /** How long nothing may happen before an armed idle shutdown fires. */
  static IDLE_MINUTES = 5;
  /** HOW OLD A RUNNING JOB MAY BE AND STILL VETO THE SHUTDOWN.
   *
   *  A JOB THAT NEVER EXITS IS WHY THIS NEVER FIRED. It stays `running` for
   *  ever, and a shutdown any leak can veto is a shutdown that never happens.
   *  Measured: a profiling script kept a watcher alive and held the
   *  machine awake for twenty-four minutes with the walk resting and the log
   *  silent.
   *
   *  AN HOUR IS GENEROUS ON PURPOSE. The longest real job measured here is the
   *  full test battery at about a hundred seconds, so an hour cuts nothing
   *  that is actually working. */
  static JOB_MAX_AGE_MS = 60 * 60_000;

  get power(): { block_sleep: boolean; shutdown_at_front_desk: boolean } {
    return { block_sleep: this._blockSleep, shutdown_at_front_desk: this._shutdownAtFrontDesk };
  }

  setPower(key: string, on: boolean): Record<string, unknown> {
    if (key === "block-auto-sleep") this._blockSleep = on;
    // THE OLD KEY IS STILL ACCEPTED. The control was renamed and
    // a panel served before the rename still posts the old one.
    else if (key === "shutdown-at-front-desk" || key === "shutdown-at-idle") this._shutdownAtFrontDesk = on;
    else {
      throw new Rejection({
        clause: CLAUSES.REQUIRED_ARGS,
        expected: "a power toggle: block-auto-sleep or shutdown-at-front-desk",
        got: key,
        remedy: {
          tool: "se_file_read",
          args: { path: "deliverable/machines/panels/controls.md" },
          note: "the shutdown row names both",
        },
        source: "engine/sessionlive.ts power",
      });
    }
    this.host.persist();
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
  private static readonly RESTING = new Set(["front_desk"]);

  /** PARKED AND QUIET, with nothing of ours still running. The clock's two
   *  non-time conditions, split out so the countdown can ask them without
   *  asking how long it has been. */
  resting(): boolean {
    if (anyJobRunning(Liveness.JOB_MAX_AGE_MS)) return false;
    const active = this.host.describe().active as string[];
    return active.length > 0 && active.every((a) => Liveness.RESTING.has(a.split("/").pop()!));
  }

  /** All three must hold: parked, quiet, and nothing of ours still running. */
  idleFor(ms: number): boolean {
    if (Date.now() - this.lastActivity < ms) return false;
    return this.resting();
  }

  /** WHOLE MINUTES NOTHING HAS HAPPENED, or nothing while something is.
   *  It rides the live payload, so a surface can show it climb. */
  private _inactiveMinutes?: number;

  get inactiveMinutes(): number | undefined {
    return this._inactiveMinutes;
  }

  /** STOP COUNTING, IN SILENCE.
   *
   *  THREE THINGS STOP IT: releasing the toggle, the walk moving, or anything
   *  at all reaching the log. None of them is announced — something happening
   *  is the ordinary case, and a line every time would be the noise this
   *  counter exists to avoid. */
  private standDown(): void {
    if (this._inactiveMinutes === undefined) return;
    this._inactiveMinutes = undefined;
    this.wake();
  }

  /**
   * The timer only exists while the flag is set, so an unarmed machine has no
   * clock running at all and cannot power anything off by accident.
   */
  private armIdleTimer(): void {
    if (this._shutdownAtFrontDesk && this.idleTimer === undefined) {
      // ONCE A MINUTE, because the figure it reports is in whole minutes. A
      // faster tick reports the same number again and again.
      this.idleTimer = setInterval(() => this.checkIdle(), 60_000);
      this.idleTimer.unref?.();
    } else if (!this._shutdownAtFrontDesk && this.idleTimer !== undefined) {
      clearInterval(this.idleTimer);
      this.idleTimer = undefined;
    }
  }

  /** THE WATCHDOG. It runs once a minute and it is the ONLY thing that decides.
   *
   *  IT ASKS ONE QUESTION: how long since anything reached the log.
   *
   *  - Under a minute — something is happening. Nothing counted, nothing said.
   *  - One to four — say how long it has been quiet, once per minute.
   *  - Five — shut the machine down.
   *
   *  A SILENT WAIT AND THEN A DARK MACHINE is indistinguishable from a toggle
   *  that never worked, and that is what the reader reported.
   *
   *  IT REPORTS THE FACT, NEVER THE RULE. "Inactive for 3 of 5 minutes" is
   *  something a reader can check against what they just did. The mechanism
   *  behind it is not their problem.
   *
   *  IT CANNOT FEED ITSELF. What it says goes to the lifecycle log under its
   *  own `shutdown` event; what it listens to is the CALL log. Two files, two
   *  origins, so its own voice is never mistaken for activity.
   *  see dsp-boot-and-power.md#what-survives-a-reload-and-what-does-not */
  private checkIdle(): void {
    if (!this._shutdownAtFrontDesk) {
      this.standDown();
      return;
    }
    if (!this.resting()) {
      // Something is still happening, so hold the computer awake for it.
      this.syncKeepAwake();
      this.standDown();
      return;
    }
    const minutes = Math.floor((Date.now() - this.lastActivity) / 60_000);
    // SOMETHING IS HAPPENING. Nothing counted, nothing said.
    if (minutes < 1) {
      this.standDown();
      return;
    }
    if (minutes !== this._inactiveMinutes) {
      this._inactiveMinutes = minutes;
      this.host.say(`inactive for ${String(minutes)} of ${String(Liveness.IDLE_MINUTES)} minutes`);
      this.wake();
    }
    if (minutes < Liveness.IDLE_MINUTES) return;
    if (process.platform !== "win32" || process.env.SE_POWEROFF_DISABLE === "1") return;
    // Disarm before firing, so a shutdown that the person cancels at the
    // warning does not immediately arm another one behind them.
    this._shutdownAtFrontDesk = false;
    this.armIdleTimer();
    spawn("shutdown.exe", ["/s", "/t", "60", "/c", "se: idle for five minutes"], {
      stdio: "ignore",
      windowsHide: true,
      detached: true,
    }).unref();
  }

  /** THE PING (owner): the agent points at a mirror surface and
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
          "a surface to ping: a card id (its slugged title from deliverable/views/cards.md), the widget a card shows, a drawn state id, or an element id",
        got: "an empty target",
        remedy: { tool: "se_panel", args: { ping: "log" }, note: "name what the reader should look at" },
        source: "engine/sessionlive.ts ping",
      });
    }
    this.ping = { target: t, ...(note === undefined || note.trim() === "" ? {} : { note: note.trim() }), seq: ++this.pingSeq };
    this.notifyChange();
    return { pinged: t, note: "the surface is lit yellow in every open mirror window, and stays lit until the next ping" };
  }

  private syncKeepAwake(): void {
    // Either flag wants the computer awake. Shutdown-at-idle wants it awake
    // while work is happening; once it is not, powering off is the point.
    const want =
      (this._blockSleep || this._shutdownAtFrontDesk) && process.platform === "win32" && process.env.SE_KEEPAWAKE_DISABLE !== "1";
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
  notifyChange(): void {
    // EVERY HAND RESETS THE IDLE CLOCK. A tick, a mirror click, a note, an
    // evidence write — they all pass through here, so the clock measures
    // silence rather than only the agent's silence.
    //
    // THE WATCHDOG USES `wake` INSTEAD, and must. Announcing through here
    // stamped the clock the announcement had just read, so the counter reset
    // itself every time it spoke and could never reach the fifth minute.
    this.lastActivity = Date.now();
    this.wake();
  }

  /** Wake every held wait WITHOUT saying anything happened. For a watcher that
   *  reports on the clock rather than moving it. */
  private wake(): void {
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
}
