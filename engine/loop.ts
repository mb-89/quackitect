// The loop (§5): se.loop.next / start / submit / abandon.
// `next` is the entry point — always callable, never errors. Blocking is an
// instruction returned, not an error. The work packet is the evidence-form
// shape adopted from the projection spike (§20): legal moves + recommended +
// guidance + evidence form + filled state + validation findings.
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { Rejection } from "./errors.ts";
import { CallLog } from "./calllog.ts";
import { runCommand } from "./run.ts";
import { Gate } from "./gate.ts";
import { advance, validateMachine, type MachineDecl, type MachineInstance, type StateDecl } from "./machine.ts";

export interface WorkPacket {
  kind: "instruction" | "work" | "gate" | "gate_offered" | "closed" | "escaped";
  offer_hash?: string;
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
    this.log = new CallLog(join(root, ".se"));
    validateMachine(machine);
  }

  private stateDir(): string {
    return join(this.root, "state");
  }

  private instancePath(iteration: string): string {
    return join(this.stateDir(), `${iteration}.json`);
  }

  private openInstance(): MachineInstance | null {
    if (!existsSync(this.stateDir())) return null;
    for (const f of readdirSync(this.stateDir())) {
      if (!f.endsWith(".json")) continue;
      const inst = JSON.parse(readFileSync(join(this.stateDir(), f), "utf8")) as MachineInstance;
      if (inst.status === "open") return inst;
    }
    return null;
  }

  private save(inst: MachineInstance): void {
    mkdirSync(this.stateDir(), { recursive: true });
    writeFileSync(this.instancePath(inst.iteration), JSON.stringify(inst, null, 2) + "\n", "utf8");
  }

  private decl(inst: MachineInstance): StateDecl {
    return this.machine.states.find((s) => s.id === inst.current)!;
  }

  start(iteration: string): WorkPacket {
    const open = this.openInstance();
    if (open) {
      throw new Rejection({
        clause: "SE-C-031",
        expected: "no open iteration in this worktree (one instance per execution context)",
        got: `${open.iteration} is open at ${open.current}`,
        remedy: { tool: "se.loop.next", args: {}, note: "continue the open iteration, or abandon it first" },
        source: "engine/loop.ts start",
      });
    }
    if (existsSync(this.instancePath(iteration))) {
      throw new Rejection({
        clause: "SE-C-032",
        expected: "a fresh iteration name",
        got: `${iteration} already ran (re-entry: ${this.machine.reentry} does not resurrect closed iterations)`,
        remedy: { tool: "se.loop.start", args: { iteration: `${iteration}-b` }, note: "pick a fresh name" },
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
    // Mechanical fill: engine-filled states run their declared command and
    // close with zero model turns. Failure is a normal Failed.
    for (;;) {
      const state = this.decl(inst);
      if (inst.status !== "open") break;
      if (state.filled_by !== "engine") break;
      const rec = runCommand(this.log, state.command!, this.root);
      this.pinEvidence(inst, state.id, { run_ref: rec.ref, command: state.command!, exit: rec.detail?.exit }, rec);
      const outcome = rec.ok ? "filled" : "failed";
      if (!rec.ok) inst.counters[`${state.id}_attempts`] = (inst.counters[`${state.id}_attempts`] ?? 0) + 1;
      inst.history.push({ state: state.id, outcome: rec.ok ? "filled" : "failed", evidence: rec.ref, at: now() });
      const adv = advance(this.machine, inst, outcome, now());
      autoClosed.push({ state: state.id, run_ref: rec.ref, ok: rec.ok });
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
    // A gate with a live offer: the agent parks or waits — never polls a
    // judgment surface (G1).
    if (state.kind === "gate") {
      const offer = new Gate(this.root).current();
      if (offer) {
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
        remedy: { tool: "se.loop.next", args: {}, note: "next tells you the current step; start an iteration first" },
        source: "engine/loop.ts submit",
      });
    }
    const state = this.decl(inst);
    if (state.filled_by === "engine") {
      throw new Rejection({
        clause: "SE-C-034",
        expected: "an agent-filled state (engine states fill themselves)",
        got: state.id,
        remedy: { tool: "se.loop.next", args: {}, note: "call next — the engine runs this step mechanically" },
        source: "engine/loop.ts submit",
      });
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
          tool: "se.loop.submit",
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
      if (existing) {
        throw new Rejection({
          clause: "SE-C-044",
          expected: "no live offer (one offer at a time; one iteration per brief)",
          got: `offer pending for ${existing.iteration}/${existing.state}`,
          remedy: { tool: "se.loop.next", args: {}, note: "the pending offer must resolve (bless / dismiss / expire) first" },
          source: "engine/loop.ts submit",
        });
      }
      const brief = [
        `GATE ${state.id} — iteration ${inst.iteration}`,
        state.statement,
        "",
        ...Object.entries(evidence).map(([k, v]) => `  ${k}: ${v}`),
      ].join("\n");
      const offer = gate.makeOffer(inst, state.id, evidence, brief);
      this.pinEvidence(inst, state.id, { ...evidence, offer_hash: offer.base_hash });
      this.save(inst);
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
    advance(this.machine, inst, "filled", now());
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

  /** Evidence files commit to the branch; a pinned run record survives call-log cleanup. */
  private pinEvidence(
    inst: MachineInstance,
    stateId: string,
    payload: Record<string, unknown>,
    run?: { ref: string } | undefined,
  ): string {
    const dir = join(this.root, "evidence", inst.iteration);
    mkdirSync(dir, { recursive: true });
    const seq = inst.history.length + 1;
    const file = `${String(seq).padStart(2, "0")}-${stateId}.json`;
    writeFileSync(
      join(dir, file),
      JSON.stringify({ iteration: inst.iteration, state: stateId, at: now(), payload, ...(run ? { pinned_run: run } : {}) }, null, 2) + "\n",
      "utf8",
    );
    return `evidence/${inst.iteration}/${file}`;
  }
}
