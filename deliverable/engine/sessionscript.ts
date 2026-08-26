// CONDITION SCRIPTS: spawning one, joining an in-flight run, and the progress
// bar it drives.
//
// Lifted out of Session whole. A run is a child process and a promise, not a
// step of the walk — Session asks for one and reads the verdict back out of
// its own evidence store.
//
// see dsp-walk-machine.md#the-suites-spawn-skip
import { spawn } from "node:child_process";
import { CLAUSES, Rejection } from "./errors.ts";
import { contentHash } from "./hash.ts";
import type { MachineDecl, StateDecl } from "./machine.ts";
import { readNode } from "./notes.ts";
import { resolveInRoot, seDir } from "./paths.ts";
import { openOperation, settleOperation } from "./run.ts";
import { evidenceKey } from "./sessionforms.ts";

/** What a script run needs of the walk: two roots, the standing check, where
 *  it stands, the evidence store to write its verdict into, and a way to tell
 *  the mirror something moved. */
export interface ScriptHost {
  workRoot(): string;
  machineRoot(): string;
  assertStanding(stateId: string): void;
  leaves(): { machine: MachineDecl; ids: string[] };
  state(m: MachineDecl, id: string): StateDecl;
  notifyChange(): void;
  /** WRITE A SETTLED JUDGMENT WHERE THE STEP'S OTHER STANDINGS LIVE. The
   *  evidence map below dies with the process; this does not. */
  recordVerdict(m: MachineDecl, s: StateDecl, ok: boolean, stamp?: string): void;
  /** The verdict standing on the step's form, which outlives this process. */
  standingJudgment(m: MachineDecl, s: StateDecl): { verdict: string; stamp: string } | undefined;
  readonly evidence: Map<string, Record<string, unknown>>;
}

export class Scripts {
  private readonly host: ScriptHost;

  constructor(host: ScriptHost) {
    this.host = host;
  }

  /** One script, ASYNC — spawnSync would freeze the whole server (and the
   *  mirror with it) for the run's duration; found when the suite's eight
   *  seconds read as a crashed browser window. */
  spawnScript(abs: string, machineId = ""): Promise<{ status: number | null; out: string }> {
    return new Promise((resolve) => {
      // A CONDITION JUDGES THE CORPUS THE LANE WRITES TO, never the repo
      // root. Judged against the wrong one, the agent is asked to satisfy a
      // check it has no write path to, and no lane verb can reach the file
      // being complained about.
      // TWO ROOTS, BECAUSE A SCRIPT NEEDS BOTH. The corpus it judges is the
      // bound record's, and `.se/` is session state that belongs to the
      // machine — the same split laneRoot already enforces for every path.
      // Handing over only the work tree broke the outward-search check, which
      // reads the call log to prove a search actually ran.
      const where = this.host.workRoot();
      const child = spawn("node", [abs, "--root", where], {
        cwd: where,
        // WHICH RECORD IS BEING JUDGED. A check that reads something the record
        // DECIDED — the kickoff's walker ceiling, say — has to know which record
        // it stands in, and only the walk knows that.
        //
        // IT IS NOT COPIED INTO SESSION STATE. `.se/settings.json` is global to
        // the session, so a per-record number kept there leaks across records
        // and is a second place to disagree with the first.
        env: { ...process.env, SE_HOME: seDir(this.host.machineRoot()), SE_MACHINE: machineId },
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
      //
      // THE RUN ENDS ITSELF, WHICHEVER WAY IT ENDS. Three paths reach the
      // verdict and each has to be able to fire alone, so they share one
      // settle that only the first caller gets through.
      let settled = false;
      let timer: ReturnType<typeof setTimeout> | undefined;
      let abandon: ReturnType<typeof setTimeout> | undefined;
      const end = (status: number | null, text: string): void => {
        if (settled) return;
        settled = true;
        if (timer !== undefined) clearTimeout(timer);
        if (abandon !== undefined) clearTimeout(abandon);
        this.clearProgress();
        resolve({ status, out: text });
      };
      // KILLING THE CHILD IS NOT THE END OF THE STORY. `kill` ends the child
      // and leaves its grandchildren holding the output pipes, so `close` can
      // fail to arrive and the promise never settles at all.
      //
      // A RUN STUCK THAT WAY OUTLIVES EVERYTHING THAT COULD CLEAR IT. The step
      // reads `deciding` for the life of the process, no job record stands
      // behind it, and every later attempt joins the ghost instead of starting
      // a real run.
      //
      // IT WAS MEASURED, NOT IMAGINED. A walk sat at its repair step reporting
      // a battery still running, nineteen minutes after that battery's last
      // case finished, with no battery process alive anywhere on the machine.
      //
      // SO THE KILL ARMS A SECOND CLOCK. Half a minute later the run reports
      // what it has, whatever the pipes are doing.
      timer = setTimeout(() => {
        child.kill();
        abandon = setTimeout(
          () => end(null, `${out}${pending}\nthe run passed its ceiling, was killed, and never closed its output`),
          30_000,
        );
      }, 600_000);
      child.on("error", (e) => end(null, String(e)));
      child.on("close", (code) => end(code, out + pending));
    });
  }

  /** In-flight runs, keyed by state — a second hand (or a second click)
   *  while one runs JOINS it instead of spawning the suite again. Found
   *  when repeated clicks on an unresponsive button queued whole extra
   *  suite runs behind the first. */
  readonly scriptRuns = new Map<string, Promise<Record<string, unknown>>>();

  /** WHEN EACH IN-FLIGHT RUN STARTED. The map above cannot say how old its
   *  entries are, and a run that never settles is indistinguishable from one
   *  that started a second ago. */
  private readonly runStartedAt = new Map<string, number>();

  /** THE AGE PAST WHICH A RUN IS A GHOST. The child is killed at its ceiling
   *  and given half a minute to close; anything older than both ended in a way
   *  no clock inside the run can reach. */
  private static readonly GHOST_MS = 700_000;

  /** FORGET A RUN NOTHING CAN STILL FINISH. Dropping it is what lets the next
   *  attempt start a real run rather than join a promise that will never
   *  resolve — the difference between a slow step and a stuck one. */
  private dropIfGhost(key: string): void {
    const at = this.runStartedAt.get(key);
    if (at === undefined) return;
    if (Date.now() - at < Scripts.GHOST_MS) return;
    this.scriptRuns.delete(key);
    this.runStartedAt.delete(key);
  }

  /** RUN a state's condition script — legal only while standing in it.
   *  The result is engine-observed evidence; nobody can claim it. */
  async scriptRun(stateId: string): Promise<Record<string, unknown>> {
    this.host.assertStanding(stateId);
    const { machine } = this.host.leaves();
    const s = this.host.state(machine, stateId);
    const scripts = [...(s.exit?.script ?? []), ...(s.entry?.script ?? [])];
    if (scripts.length === 0) {
      throw new Rejection({
        clause: CLAUSES.CONDITION_UNMET,
        expected: `a script condition on ${stateId}`,
        got: "none declared",
        remedy: { tool: "se_pull", args: {}, note: "the pull's answer carries the step's demands" },
        source: "engine/sessionscript.ts script",
      });
    }
    const key = evidenceKey(machine, s.id);
    this.dropIfGhost(key);
    const inFlight = this.scriptRuns.get(key);
    if (inFlight !== undefined) return inFlight;
    const run = (async () => {
      // see dsp-walk-machine.md#the-suites-spawn-skip
      if (process.env.SE_SCRIPT_SKIP === "1") {
        const result = {
          ok: true,
          output: scripts.map((rel) => `${rel} → skipped (SE_SCRIPT_SKIP)`).join("\n"),
          at: new Date().toISOString(),
        };
        this.host.evidence.set(key, { ...(this.host.evidence.get(key) ?? {}), script_result: result });
        this.host.notifyChange();
        return { state: `${machine.id}/${s.id}`, script_result: result };
      }
      const outputs: string[] = [];
      let ok = true;
      for (const rel of scripts) {
        const abs = resolveInRoot(this.host.machineRoot(), rel, "engine/session.ts script");
        const r = await this.spawnScript(abs, machine.id);
        // BOTH ENDS, BECAUSE EACH CARRIES HALF THE VERDICT.
        //
        // The TAIL carries the counts — exit codes, totals, units. A head slice
        // alone keeps the opening banner and drops them.
        //
        // The HEAD carries the NAMED FAILURES. battery.ts writes
        // failureSummary(out) before the runner's own output, precisely so a
        // reader learns which files are red without reading the whole run.
        //
        // KEEPING ONLY THE TAIL DROPPED THAT SUMMARY. Measured on i51's own
        // confirm run: `fail 2` arrived with 4000 characters of passing cases
        // and neither failure named. An error that will not say what failed is
        // the blanket error the house rule forbids.
        const whole = r.out.trim();
        const ends = 2500;
        const out =
          whole.length <= ends * 2
            ? whole
            : `${whole.slice(0, ends)}\n…[${String(whole.length - ends * 2)} characters between the named failures and the counts]\n${whole.slice(-ends)}`;
        outputs.push(`${rel} → exit ${r.status}${out === "" ? "" : `\n${out}`}`);
        if (r.status !== 0) ok = false;
      }
      const result = { ok, output: outputs.join("\n"), at: new Date().toISOString(), stamp: this.scriptStamp(scripts) };
      this.host.evidence.set(key, { ...(this.host.evidence.get(key) ?? {}), script_result: result });
      // AND IT LANDS SOMEWHERE THAT OUTLIVES THE PROCESS. The map above is
      // memory; a step left deciding when the session ends needs the verdict on
      // disk or the repository cannot settle the word.
      this.host.recordVerdict(machine, s, ok, result.stamp);
      this.host.notifyChange();
      return { state: `${machine.id}/${s.id}`, script_result: result };
    })().finally(() => {
      this.scriptRuns.delete(key);
      this.runStartedAt.delete(key);
    });
    this.scriptRuns.set(key, run);
    this.runStartedAt.set(key, Date.now());
    // THE JUDGMENT ENTERS THE ONE TABLE, against the step it belongs to. It is
    // registered HERE, where the run is created, rather than in scriptStart.
    // The mirror's own /script endpoint calls this method directly, so a run
    // started from the surface set the step to `deciding` while the account
    // showed nothing running at all. Measured on i51's own verification: a
    // live battery process, and the account reporting it settled 92 seconds
    // earlier. see dsp-the-work-account.md#interface
    const id = `judgment-${machine.id}-${s.id}`;
    openOperation({
      id,
      kind: "judgment",
      command: `the leaving judgment of ${s.id}`,
      state: `${machine.id}/${s.id}`,
      root: this.host.machineRoot(),
    });
    void run.then(
      (r) => settleOperation(id, (r.script_result as { ok?: boolean } | undefined)?.ok === true),
      () => settleOperation(id, false),
    );
    this.host.notifyChange(); // the mirror learns a run started
    return run;
  }

  /** WHAT A VERDICT WAS REACHED WITH, so it can be told apart from a verdict
   *  reached against different scripts. Content, not size and time, for the same
   *  reason the drawing cache stamps that way: a same-size edit inside one
   *  filesystem tick would go unseen.
   *
   *  THROUGH THE DOOR, so a pass reads each script once however many states cite
   *  it. */
  private scriptStamp(scripts: readonly string[]): string {
    return scripts
      .map((rel) => {
        const abs = resolveInRoot(this.host.machineRoot(), rel, "engine/session.ts script");
        const text = readNode(abs);
        return text === "" ? `${rel}@gone` : `${rel}@${contentHash(text)}`;
      })
      .join("|");
  }

  /** START a step's leaving judgment and hand the promise back UNAWAITED.
   *  Returns undefined where the state declares no judgment to start.
   *  The run registers itself in the account; this method only decides
   *  whether there is a judgment to start at all.
   *  see dsp-the-work-account.md#responsibility */
  scriptStart(stateId: string, passingThrough = false): Promise<Record<string, unknown>> | undefined {
    const { machine } = this.host.leaves();
    const s = this.host.state(machine, stateId);
    const scripts = [...(s.exit?.script ?? []), ...(s.entry?.script ?? [])];
    if (scripts.length === 0) return undefined;
    // A GREEN STATE WALKED OVER KEEPS THE VERDICT IT ALREADY HAS.
    //
    // Walking over a state re-judged it, so a fast-forward through finished work
    // paid for every judgment it already had on file. Measured: 2,455 ms of a
    // 6,084 ms three-hop sweep was the call waiting on scripts whose states were
    // already signed.
    //
    // THREE THINGS MUST ALL HOLD, and each closes a way this could turn a red
    // hop green.
    //
    // - THE WALK IS PASSING THROUGH, not landing. A state the walk actually
    //   works always re-judges, because that is where the judgment is about to
    //   be relied on.
    // - THE STANDING VERDICT SAYS PASSED. Anything else re-runs, so a red never
    //   survives on a stale answer.
    // - THE SCRIPTS HAVE NOT MOVED. A verdict reached with a different script is
    //   a verdict about a different question.
    // see dsp-the-walk-knows-what-its-own-hops-cost.md#a-green-state-walked-over-keeps-its-verdict
    if (passingThrough) {
      const stamp = this.scriptStamp(scripts);
      const held = this.host.evidence.get(evidenceKey(machine, s.id))?.script_result as { ok?: boolean; stamp?: string } | undefined;
      if (held?.ok === true && held.stamp === stamp) return undefined;
      // NOTHING IN MEMORY IS THE ORDINARY CASE for a session that re-entered a
      // record. The verdict on the form is the same verdict, reached by the same
      // script, and it outlived the process that reached it.
      const onDisk = held === undefined ? this.host.standingJudgment(machine, s) : undefined;
      if (onDisk?.verdict === "passed" && onDisk.stamp !== "" && onDisk.stamp === stamp) return undefined;
    }
    return this.scriptRun(stateId);
  }

  /** START THE JUDGMENT AND ANSWER INSIDE THE BOUND. The call waits up to `ms`
   *  for a verdict and hands back whatever it has; it is never held for as long
   *  as the judgment runs, which is the defect this record exists to end.
   *  see dsp-the-work-account.md#responsibility */
  async scriptSettleWithin(stateId: string, ms: number, passingThrough = false): Promise<void> {
    const run = this.scriptStart(stateId, passingThrough);
    if (run === undefined) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const capped = new Promise<void>((res) => {
      timer = setTimeout(res, ms);
    });
    await Promise.race([run.then(() => undefined).catch(() => undefined), capped]);
    if (timer !== undefined) clearTimeout(timer);
  }

  /**
   * A VERDICT REACHED AGAINST THESE SCRIPTS THAT OUTLIVED THE PROCESS.
   *
   * THE RUNNER ALREADY CONSULTS IT, in scriptStart, to decide there is nothing
   * to run. A checker that asked only the in-memory evidence then refused
   * forever: the runner said nothing needed running and the checker said nothing
   * had run, so a re-entered record could not leave any state whose exit carries
   * a script. One truth, two readers, and they read different stores.
   *
   * THE STAMP IS COMPARED THE SAME WAY, so a verdict reached against different
   * scripts cannot green a hop.
   */
  scriptPassedOnDisk(m: MachineDecl, s: StateDecl): boolean {
    const scripts = [...(s.exit?.script ?? []), ...(s.entry?.script ?? [])];
    if (scripts.length === 0) return false;
    const onDisk = this.host.standingJudgment(m, s);
    return onDisk?.verdict === "passed" && onDisk.stamp !== "" && onDisk.stamp === this.scriptStamp(scripts);
  }

  /** WHERE A STEP STANDS, one word from a closed set of three.
   *  see dsp-the-work-account.md#behavior-and-constraints */
  scriptStanding(m: MachineDecl, s: StateDecl): "passed" | "not passed" | "deciding" {
    const key = evidenceKey(m, s.id);
    this.dropIfGhost(key);
    if (this.scriptRuns.has(key)) return "deciding";
    const r = this.host.evidence.get(key)?.script_result as { ok?: boolean } | undefined;
    return r?.ok === true ? "passed" : "not passed";
  }

  /** Any condition script currently running — the mirror's follow signal. */
  busy(): boolean {
    return this.scriptRuns.size > 0;
  }

  /** THE WAIT BAR MEASURES SOMETHING. A running
   *  script reports its own steps; indeterminate is the FALLBACK, for work
   *  that genuinely cannot count itself, never the default. */
  progressAt: { done: number; total: number; label: string } | undefined;

  setProgress(done: number, total: number, label: string): void {
    if (total <= 0) return;
    this.progressAt = { done, total, label };
    this.host.notifyChange();
  }

  clearProgress(): void {
    if (this.progressAt === undefined) return;
    this.progressAt = undefined;
    this.host.notifyChange();
  }

  progress(): { done: number; total: number; label: string } | undefined {
    return this.progressAt;
  }

  scriptStatus(m: MachineDecl, s: StateDecl): { ran: boolean; ok: boolean; output: string; running: boolean } {
    const r = this.host.evidence.get(evidenceKey(m, s.id))?.script_result as { ok?: boolean; output?: string } | undefined;
    return {
      ran: r !== undefined,
      ok: r?.ok === true,
      output: r?.output ?? "",
      running: this.scriptRuns.has(evidenceKey(m, s.id)),
    };
  }
}
