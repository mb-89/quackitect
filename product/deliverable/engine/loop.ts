// The loop (§5): se.loop.next / start / submit / abandon.
// `next` is the entry point — always callable, never errors. Blocking is an
// instruction returned, not an error. The work packet is the evidence-form
// shape adopted from the projection spike (§20): legal moves + recommended +
// guidance + evidence form + filled state + validation findings.
import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { readJsonFile } from "./jsonio.ts";
import { pokeBoard } from "./board.ts";
import { Rejection } from "./errors.ts";
import { CallLog } from "./calllog.ts";
import { runStatus, startRun } from "./run.ts";
import { sleepMs } from "./instance.ts";
import { closeCommitWindow } from "./git.ts";
import { Gate } from "./gate.ts";
import { layout } from "./layout.ts";
import { advance, validateMachine, type MachineDecl, type MachineInstance, type StateDecl } from "./machine.ts";
import { loadIterationMachine, loadMachine } from "./machines/load.ts";

export interface WorkPacket {
  kind: "instruction" | "work" | "gate" | "gate_offered" | "closed" | "escaped" | "running";
  offer_hash?: string;
  /** The background run a "running" packet waits on. */
  run_ref?: string;
  /** Set when the served state belongs to a seeded sub-machine. */
  parent_state?: string;
  brief?: string;
  iteration?: string;
  state?: string;
  statement?: string;
  guidance?: string;
  evidence_form?: { name: string; description: string; required: boolean }[];
  /** Affordances, not recommendations — what is legal now (§7 errors). */
  legal: string[];
  recommended: string;
  /** Engine-filled steps that closed since the last call, with run refs. */
  auto_closed?: { state: string; run_ref: string; ok: boolean }[];
  note?: string;
}

const now = (): string => new Date().toISOString();

export class Loop {
  readonly root: string;
  readonly machine: MachineDecl;
  readonly log: CallLog;

  constructor(root: string, machine: MachineDecl) {
    this.root = root;
    this.machine = machine;
    this.log = new CallLog(layout.seDir(root));
    validateMachine(machine);
  }

  private instancePath(iteration: string): string {
    return layout.instancePath(this.root, iteration);
  }

  private openInstance(): MachineInstance | null {
    const iterations = layout.iterations(this.root);
    if (!existsSync(iterations)) return null;
    for (const dir of readdirSync(iterations, { withFileTypes: true })) {
      if (!dir.isDirectory()) continue;
      const file = layout.instancePath(this.root, dir.name);
      if (!existsSync(file)) continue;
      const inst = readJsonFile<MachineInstance>(file);
      if (inst.status === "open") return inst;
    }
    return null;
  }

  private save(inst: MachineInstance): void {
    mkdirSync(layout.iterationDir(this.root, inst.iteration), { recursive: true });
    writeFileSync(this.instancePath(inst.iteration), JSON.stringify(inst, null, 2) + "\n", "utf8");
  }

  /** The instance's own machine (floor flag 1): an open iteration keeps the
   *  machine it started under, whatever the ledger's current default is. */
  private machineFor(inst: MachineInstance): MachineDecl {
    if (inst.machine === this.machine.id) return this.machine;
    const m = loadMachine(this.root, inst.machine);
    if (m === null) {
      throw new Rejection({
        clause: "SE-C-036",
        expected: `the machine ${inst.machine} (recorded on ${inst.iteration}) in the ledger`,
        got: "no such machine node",
        remedy: { tool: "se_get_search", args: { query: "machine" }, note: "restore the machine the iteration started under" },
        source: "engine/loop.ts machineFor",
      });
    }
    return m;
  }

  private decl(inst: MachineInstance): StateDecl {
    return this.machineFor(inst).states.find((s) => s.id === inst.current)!;
  }

  start(iteration: string): WorkPacket {
    const open = this.openInstance();
    if (open) {
      throw new Rejection({
        clause: "SE-C-031",
        expected: "no open iteration in this worktree (one instance per execution context)",
        got: `${open.iteration} is open at ${open.current}`,
        remedy: { tool: "se_loop_next", args: {}, note: "continue the open iteration, or abandon it first" },
        source: "engine/loop.ts start",
      });
    }
    if (existsSync(this.instancePath(iteration))) {
      throw new Rejection({
        clause: "SE-C-032",
        expected: "a fresh iteration name",
        got: `${iteration} already ran (re-entry: ${this.machine.reentry} does not resurrect closed iterations)`,
        remedy: { tool: "se_loop_start", args: { iteration: `${iteration}-b` }, note: "pick a fresh name" },
        source: "engine/loop.ts start",
      });
    }
    const inst: MachineInstance = {
      machine: this.machine.id, // floor flag 1: policy in force, on the iteration
      iteration,
      current: this.machine.initial,
      counters: {},
      history: [],
      escapes: [],
      status: "open",
    };
    this.save(inst);
    return this.next();
  }

  /** Always callable, never errors. Runs engine-filled states mechanically. */
  next(): WorkPacket {
    const inst = this.openInstance();
    if (!inst) {
      return {
        kind: "instruction",
        legal: ["se.loop.start { iteration }"],
        recommended: "se.loop.start",
        note: "No iteration open. Open one with se.loop.start; policy selection is a step inside it (bootstrap: systematic only).",
      };
    }
    const autoClosed: { state: string; run_ref: string; ok: boolean }[] = [];
    // Mechanical fill: engine-filled states run their declared command as a
    // BACKGROUND run. Fast commands (under ~1s) keep the synchronous shape;
    // longer ones return a "running" packet — the 1s law holds on the loop.
    for (;;) {
      const state = this.decl(inst);
      if (inst.status !== "open") break;
      if (state.filled_by !== "engine") break;
      let run: { ref: string; ok: boolean; exit: number };
      if (inst.pending_run && inst.pending_run.state === state.id) {
        const st = runStatus(this.root, inst.pending_run.ref);
        if (st.status === "running") return this.runningPacket(inst, state.id, inst.pending_run.ref, autoClosed);
        run = { ref: inst.pending_run.ref, ok: st.ok, exit: st.exit };
        delete inst.pending_run;
      } else {
        const h = startRun(this.root, this.log, state.command!, this.root);
        const deadline = Date.now() + 900;
        let st = runStatus(this.root, h.ref);
        while (st.status === "running" && Date.now() < deadline) {
          sleepMs(50);
          st = runStatus(this.root, h.ref);
        }
        if (st.status === "running") {
          inst.pending_run = { state: state.id, ref: h.ref };
          this.save(inst);
          return this.runningPacket(inst, state.id, h.ref, autoClosed);
        }
        run = { ref: h.ref, ok: st.ok, exit: st.exit };
      }
      this.pinEvidence(inst, state.id, { run_ref: run.ref, command: state.command!, exit: run.exit }, { ref: run.ref });
      const outcome = run.ok ? "filled" : "failed";
      if (!run.ok) inst.counters[`${state.id}_attempts`] = (inst.counters[`${state.id}_attempts`] ?? 0) + 1;
      inst.history.push({ state: state.id, outcome, evidence: run.ref, at: now() });
      const adv = advance(this.machineFor(inst), inst, outcome, now());
      autoClosed.push({ state: state.id, run_ref: run.ref, ok: run.ok });
      this.save(inst);
      if (!adv.moved) {
        return {
          kind: "escaped",
          iteration: inst.iteration,
          state: state.id,
          legal: ["ask the human", "se.loop.abandon { reason }"],
          recommended: "ask the human",
          auto_closed: autoClosed,
          note: `guards exhausted at ${state.id}: ${adv.escaped}. Escape recorded; a human decides.`,
        };
      }
    }
    if (inst.status === "closed") {
      return {
        kind: "closed",
        iteration: inst.iteration,
        legal: ["se.loop.start { iteration }"],
        recommended: "se.loop.start",
        ...(autoClosed.length > 0 ? { auto_closed: autoClosed } : {}),
        note: `Iteration ${inst.iteration} is closed.`,
      };
    }
    const state = this.decl(inst);
    // A seeded state serves its child machine until the child's terminal;
    // then the parent state completes mechanically.
    if (state.kind === "work" && state.filled_by === "agent") {
      const sub = this.childFor(inst, state);
      if (sub !== null) {
        if (sub.child.status === "open") {
          const cs = sub.decl.states.find((s) => s.id === sub.child.current)!;
          return {
            kind: "work",
            iteration: inst.iteration,
            state: cs.id,
            parent_state: state.id,
            statement: cs.statement,
            guidance: cs.guidance,
            evidence_form: cs.evidence_form,
            legal: ["se.loop.submit { evidence }", "se.loop.abandon { reason }"],
            recommended: "se.loop.submit",
            ...(autoClosed.length > 0 ? { auto_closed: autoClosed } : {}),
          };
        }
        const ref = this.pinEvidence(inst, state.id, {
          submachine: sub.decl.id,
          chunks_filled: sub.child.history.filter((h) => h.outcome === "filled").length,
          sub_record: `sub-${state.id}.json`,
        });
        inst.history.push({ state: state.id, outcome: "filled", evidence: ref, at: now() });
        advance(this.machineFor(inst), inst, "filled", now());
        this.save(inst);
        return this.next();
      }
    }
    // A gate with a live offer: the agent parks or waits — never polls a
    // judgment surface (G1).
    if (state.kind === "gate") {
      const offer = new Gate(this.root).current();
      if (offer) {
        pokeBoard(); // something needs the owner: surface the board
        return {
          kind: "gate_offered",
          iteration: inst.iteration,
          state: state.id,
          statement: state.statement,
          offer_hash: offer.base_hash,
          brief: offer.brief,
          legal: ["se.wait { condition: offer }", "park (end the turn; the offer dismisses by absence)"],
          recommended: "se.wait",
          note: "Offer pending. A human blesses via the console (bin/se-gate.ts); the grant records channel + hash.",
        };
      }
    }
    return {
      kind: state.kind === "gate" ? "gate" : "work",
      iteration: inst.iteration,
      state: state.id,
      statement: state.statement,
      guidance: state.guidance,
      evidence_form: state.evidence_form,
      legal: ["se.loop.submit { evidence }", "se.loop.abandon { reason }"],
      recommended: "se.loop.submit",
      ...(autoClosed.length > 0 ? { auto_closed: autoClosed } : {}),
    };
  }

  submit(evidence: Record<string, string>): WorkPacket {
    const inst = this.openInstance();
    if (!inst) {
      throw new Rejection({
        clause: "SE-C-033",
        expected: "an open iteration to submit against",
        got: "none",
        remedy: { tool: "se_loop_next", args: {}, note: "next tells you the current step; start an iteration first" },
        source: "engine/loop.ts submit",
      });
    }
    closeCommitWindow(this.root); // a submit is the next work: the bless window ends here
    const state = this.decl(inst);
    if (state.filled_by === "engine") {
      throw new Rejection({
        clause: "SE-C-034",
        expected: "an agent-filled state (engine states fill themselves)",
        got: state.id,
        remedy: { tool: "se_loop_next", args: {}, note: "call next — the engine runs this step mechanically" },
        source: "engine/loop.ts submit",
      });
    }
    // A submit while a seeded child is open routes to the child's state.
    if (state.kind === "work" && state.filled_by === "agent") {
      const sub = this.childFor(inst, state);
      if (sub !== null && sub.child.status === "open") {
        const cs = sub.decl.states.find((s) => s.id === sub.child.current)!;
        const missingSub = cs.evidence_form.filter((f) => f.required && !(evidence[f.name] ?? "").trim());
        if (missingSub.length > 0) {
          throw new Rejection({
            clause: "SE-C-030",
            expected: `evidence fields: ${missingSub.map((f) => `${f.name} (${f.description})`).join("; ")}`,
            got: `missing: ${missingSub.map((f) => f.name).join(", ")}`,
            remedy: {
              tool: "se_loop_submit",
              args: { evidence: { ...evidence, ...Object.fromEntries(missingSub.map((f) => [f.name, "<fill>"])) } },
              note: "fill the named fields and resend — this is the corrected call",
            },
            source: "engine/loop.ts submit",
          });
        }
        const ref = this.pinEvidence(inst, `${state.id}-${cs.id}`, evidence);
        sub.child.history.push({ state: cs.id, outcome: "filled", evidence: ref, at: now() });
        advance(sub.decl, sub.child, "filled", now());
        writeFileSync(sub.path, JSON.stringify(sub.child, null, 2) + "\n", "utf8");
        return this.next();
      }
    }
    // Shape validation: field-targeted, one-turn recoverable. Schema pass is
    // never work pass — review checks quality later.
    const missing = state.evidence_form.filter((f) => f.required && !(evidence[f.name] ?? "").trim());
    if (missing.length > 0) {
      throw new Rejection({
        clause: "SE-C-030",
        expected: `evidence fields: ${missing.map((f) => `${f.name} (${f.description})`).join("; ")}`,
        got: `missing: ${missing.map((f) => f.name).join(", ")}`,
        remedy: {
          tool: "se_loop_submit",
          args: { evidence: { ...evidence, ...Object.fromEntries(missing.map((f) => [f.name, "<fill>"])) } },
          note: "fill the named fields and resend — this is the corrected call",
        },
        source: "engine/loop.ts submit",
      });
    }
    // Gate states: submit's evidence becomes an OFFER, not a close. The
    // bless arrives through a channel the agent doesn't control (§7).
    if (state.kind === "gate") {
      const gate = new Gate(this.root);
      const existing = gate.current();
      if (existing && (existing.iteration !== inst.iteration || existing.state !== state.id)) {
        throw new Rejection({
          clause: "SE-C-044",
          expected: "no live offer for another gate (one offer at a time; one iteration per brief)",
          got: `offer pending for ${existing.iteration}/${existing.state}`,
          remedy: { tool: "se_loop_next", args: {}, note: "the pending offer must resolve (bless / dismiss / expire) first" },
          source: "engine/loop.ts submit",
        });
      }
      // Same gate, fresh evidence: the re-offer REPLACES the live offer.
      const brief = [
        `GATE ${state.id} — iteration ${inst.iteration}`,
        state.statement,
        "",
        ...Object.entries(evidence).map(([k, v]) => `  ${k}: ${v}`),
      ].join("\n");
      const offer = gate.makeOffer(inst, state.id, evidence, brief, this.evidenceRef(inst, state.id));
      this.pinEvidence(inst, state.id, { ...evidence, offer_hash: offer.base_hash });
      this.save(inst);
      pokeBoard(); // a fresh offer: surface the board
      return {
        kind: "gate_offered",
        iteration: inst.iteration,
        state: state.id,
        offer_hash: offer.base_hash,
        brief,
        legal: ["se.wait { condition: offer }", "park (end the turn)"],
        recommended: "se.wait",
        note: "Offer created. A human blesses via the console; the grant records channel + hash.",
      };
    }
    // Pin the referenced run record into the evidence (G2), if present.
    const runRef = evidence.run_ref?.trim();
    const rec = runRef ? this.log.find(runRef) : undefined;
    const ref = this.pinEvidence(inst, state.id, evidence, rec);
    inst.history.push({ state: state.id, outcome: "filled", evidence: ref, at: now() });
    advance(this.machineFor(inst), inst, "filled", now());
    this.save(inst);
    if (inst.status === "closed") {
      return {
        kind: "closed",
        iteration: inst.iteration,
        legal: ["se.loop.start { iteration }"],
        recommended: "se.loop.start",
        note: `Iteration ${inst.iteration} is closed.`,
      };
    }
    return this.next();
  }

  abandon(reason: string): WorkPacket {
    const inst = this.openInstance();
    if (!inst) {
      return { kind: "instruction", legal: ["se.loop.start { iteration }"], recommended: "se.loop.start", note: "Nothing open to abandon." };
    }
    inst.status = "abandoned";
    inst.history.push({ state: inst.current, outcome: "abandoned", evidence: reason, at: now() });
    this.save(inst);
    return this.next();
  }

  private childPath(iteration: string, stateId: string): string {
    return join(layout.iterationDir(this.root, iteration), `sub-${stateId}.json`);
  }

  /** The seeded sub-machine for a state, instantiating on first entry. No drawing = null (the state serves plain). */
  private childFor(inst: MachineInstance, state: StateDecl): { decl: MachineDecl; child: MachineInstance; path: string } | null {
    if (state.submachine === undefined) return null;
    const decl =
      state.submachine === "iteration"
        ? loadIterationMachine(this.root, inst.iteration, state.id)
        : loadMachine(this.root, state.submachine.replace(/^se\.machine-/, ""));
    if (decl === null) return null;
    const path = this.childPath(inst.iteration, state.id);
    if (existsSync(path)) return { decl, child: readJsonFile<MachineInstance>(path), path };
    const child: MachineInstance = {
      machine: decl.id,
      iteration: `${inst.iteration}#${state.id}`,
      current: decl.initial,
      counters: {},
      history: [],
      escapes: [],
      status: "open",
    };
    writeFileSync(path, JSON.stringify(child, null, 2) + "\n", "utf8");
    return { decl, child, path };
  }

  /** The parked shape while an engine-filled state's background run works. */
  private runningPacket(
    inst: MachineInstance,
    stateId: string,
    ref: string,
    autoClosed: { state: string; run_ref: string; ok: boolean }[],
  ): WorkPacket {
    return {
      kind: "running",
      iteration: inst.iteration,
      state: stateId,
      run_ref: ref,
      legal: [`se.wait { condition: { kind: "file", path: "<seDir>/runs/${ref}.json", until: "exists" } }`, "se.loop.next (poll once, never a loop)"],
      recommended: "se.wait",
      ...(autoClosed.length > 0 ? { auto_closed: autoClosed } : {}),
      note: `${stateId} runs in the background (${ref}); se.loop.next completes it once the run lands.`,
    };
  }

  /** The ledger-relative path the NEXT pinned evidence file will land at. */
  private evidenceRef(inst: MachineInstance, stateId: string): string {
    const seq = inst.history.length + 1;
    const file = `${String(seq).padStart(2, "0")}-${stateId}.json`;
    return `product/spec/iterations/${inst.iteration}/evidence/${file}`;
  }

  /** Evidence files commit to the branch; a pinned run record survives call-log cleanup. */
  private pinEvidence(
    inst: MachineInstance,
    stateId: string,
    payload: Record<string, unknown>,
    run?: { ref: string } | undefined,
  ): string {
    const ref = this.evidenceRef(inst, stateId);
    const dir = layout.evidenceDir(this.root, inst.iteration);
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(dir, basename(ref)),
      JSON.stringify({ iteration: inst.iteration, state: stateId, at: now(), payload, ...(run ? { pinned_run: run } : {}) }, null, 2) + "\n",
      "utf8",
    );
    return ref;
  }
}
