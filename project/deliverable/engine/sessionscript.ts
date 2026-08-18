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
import type { MachineDecl, StateDecl } from "./machine.ts";
import { resolveInRoot, seDir } from "./paths.ts";
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
  spawnScript(abs: string): Promise<{ status: number | null; out: string }> {
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
      const where = this.host.workRoot();
      const child = spawn("node", [abs, "--root", where], {
        cwd: where,
        env: { ...process.env, SE_HOME: seDir(this.host.machineRoot()) },
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
  readonly scriptRuns = new Map<string, Promise<Record<string, unknown>>>();

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
      this.host.evidence.set(key, { ...(this.host.evidence.get(key) ?? {}), script_result: result });
      this.host.notifyChange();
      return { state: `${machine.id}/${s.id}`, script_result: result };
    })().finally(() => this.scriptRuns.delete(key));
    this.scriptRuns.set(key, run);
    this.host.notifyChange(); // the mirror learns a run started
    return run;
  }

  /** Any condition script currently running — the mirror's follow signal. */
  busy(): boolean {
    return this.scriptRuns.size > 0;
  }

  /** THE WAIT BAR MEASURES SOMETHING (owner ruling, 2026-07-30). A running
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
