// THE MIRROR'S DRAWINGS: resolving any machine id to something a window can
// render, and the parent chain that names where it sits.
//
// Lifted out of Session whole. Every question here is about what CAN be drawn,
// never about where the walk stands, so it takes the walk as a read-only host
// and holds no state of its own.
//
// see dsp-walk-machine.md#a-static-sub-machine-is-a-drawing
import type { CanvasData } from "./canvas.ts";
import { type GeneratedMachine, generateContinueExpedition, generateExpeditionArchive } from "./expmachine.ts";
import { generateIterationArchive, generateIterations, pinnedCanvas } from "./iterations-draw.ts";
import type { MachineDecl, MachineInstance } from "./machine.ts";
import { compileMachineCached, resolveRef } from "./machines/compile.ts";
import { mainMachinePath, type SubRun } from "./session.ts";

/** What the drawings need of the walk: where the machines live, which one is
 *  main, and the stack standing under it. */
export interface ViewHost {
  machineRoot(): string;
  readonly machine: MachineDecl;
  readonly subs: SubRun[];
  readonly instance: MachineInstance;
}

export class Views {
  private readonly host: ViewHost;

  constructor(host: ViewHost) {
    this.host = host;
  }

  /** The mirror's view of a GENERATED machine: the walk's own instance
   *  while standing in it, a fresh generation for browsing. */
  generatedView(id: string): { decl: MachineDecl; canvas: CanvasData } | undefined {
    for (const sub of this.host.subs) {
      if (sub.decl.id === id && sub.gen !== undefined) return { decl: sub.gen.decl, canvas: sub.gen.canvas };
    }
    const gen = this.genFor(id);
    return gen === undefined ? undefined : { decl: gen.decl, canvas: gen.canvas };
  }

  genFor(id: string): GeneratedMachine | undefined {
    if (id === "expeditions") return generateContinueExpedition(this.host.machineRoot());
    if (id === "iterations") return generateIterations(this.host.machineRoot());
    if (id === "expedition_archive") return generateExpeditionArchive(this.host.machineRoot());
    if (id === "iteration_archive") return generateIterationArchive(this.host.machineRoot());
    return undefined;
  }

  /** The PARENT CHAIN of a viewable machine, main first — the mirror's
   *  breadcrumbs render it, so a nested decade reads
   *  main › expedition_archive › e1-e10 (owner ruling 2026-07-28). */
  viewChain(id: string): string[] {
    if (id === this.host.machine.id) return [this.host.machine.id];
    const idx = this.host.subs.findIndex((s) => s.decl.id === id);
    if (idx >= 0) return [this.host.machine.id, ...this.host.subs.slice(0, idx + 1).map((s) => s.decl.id)];
    if (this.host.machine.states.some((s) => s.submachine !== undefined && s.id === id)) return [this.host.machine.id, id];
    for (const sub of this.host.subs) {
      if (sub.gen?.subGen?.[id] !== undefined) return [...this.viewChain(sub.decl.id), id];
    }
    for (const cid of Views.NESTING_CONTAINERS) {
      if (this.genFor(cid)?.subGen?.[id] !== undefined) return [this.host.machine.id, cid, id];
    }
    // A drawn sub-machine reads as a child of whatever hangs it, so the
    // breadcrumbs say main > iterations > i1 > enumerate-space rather than
    // dropping the middle two.
    const found = this.drawnHost(id);
    if (found !== undefined && found.host.id !== this.host.machine.id) return [...this.viewChain(found.host.id), id];
    return [this.host.machine.id, id];
  }

  /** Every container whose generated machine nests further generated ones.
   *  The list once held only the archives, so BROWSING into an iteration
   *  (the reader's click, walk elsewhere) fell back to the main drawing. */
  static readonly NESTING_CONTAINERS = ["iterations", "expeditions", "expedition_archive", "iteration_archive"] as const;

  /** Resolve ANY machine id to a viewable drawing: the walked stack
   *  first, then the top-level containers, then their nested generated
   *  sub-machines (archive decades). */
  viewFor(id: string): { decl: MachineDecl; canvas: CanvasData } | undefined {
    const direct = this.generatedView(id);
    if (direct !== undefined) return direct;
    // see dsp-walk-machine.md#a-static-sub-machine-is-a-drawing
    const drawn = this.drawnSubmachine(id);
    if (drawn !== undefined) return drawn;
    for (const sub of this.host.subs) {
      const nested = sub.gen?.subGen?.[id];
      if (nested !== undefined) {
        const g = nested();
        return { decl: g.decl, canvas: g.canvas };
      }
    }
    for (const cid of Views.NESTING_CONTAINERS) {
      const nested = this.genFor(cid)?.subGen?.[id];
      if (nested !== undefined) {
        const g = nested();
        return { decl: g.decl, canvas: g.canvas };
      }
    }
    // see dsp-walk-machine.md#a-seeded-container-inside-an-open-record-resolves-without
    for (const cid of Views.NESTING_CONTAINERS) {
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
  reachableMachines(): MachineDecl[] {
    const out: MachineDecl[] = [this.host.machine, ...this.host.subs.map((s) => s.decl)];
    for (const cid of Views.NESTING_CONTAINERS) {
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
  drawnHost(id: string): { host: MachineDecl; ref: string } | undefined {
    for (const m of this.reachableMachines()) {
      for (const s of m.states) {
        const ref = s.submachine;
        if (ref === undefined || !ref.endsWith(".canvas")) continue;
        if (s.id === id) return { host: m, ref };
      }
    }
    return undefined;
  }

  /** see dsp-walk-machine.md#a-drawn-sub-machine-compiled-and-served-as-its-own */
  drawnSubmachine(id: string): { decl: MachineDecl; canvas: CanvasData } | undefined {
    const found = this.drawnHost(id);
    if (found === undefined) return undefined;
    try {
      const path = resolveRef(this.host.machineRoot(), mainMachinePath(this.host.machineRoot()), found.ref);
      const decl = compileMachineCached(this.host.machineRoot(), path);
      return { decl, canvas: pinnedCanvas(decl) };
    } catch {
      return undefined;
    }
  }

  /** see dsp-walk-machine.md#the-live-run-for-a-machine-view */
  viewRun(declId: string): { done: string[]; completed: boolean } {
    if (declId === this.host.machine.id) {
      return {
        done: this.host.instance.history.filter((h) => h.outcome === "filled" && !h.state.includes("/")).map((h) => h.state),
        completed: this.host.instance.status === "closed",
      };
    }
    for (const sub of this.host.subs) {
      if (sub.decl.id === declId) {
        return {
          done: sub.instance.history.filter((h) => h.outcome === "filled").map((h) => h.state),
          completed: sub.instance.status === "closed",
        };
      }
    }
    return { done: [], completed: false };
  }
}
