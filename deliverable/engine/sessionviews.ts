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
import { passEpoch } from "./notes.ts";
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

  private nestedGenerated(container: string, id: string): GeneratedMachine | undefined {
    const generated = this.genFor(container);
    const stateId = Object.entries(generated?.expByState ?? {}).find(([, publicId]) => publicId === id)?.[0];
    const direct = generated?.subGen?.[stateId ?? id];
    return direct?.();
  }

  /** A GENERATED GRANDCHILD, BY ITS OWN NAME. see
   *  dsp-walk-machine.md#a-seeded-container-inside-an-open-record-resolves-without
   *
   *  THE FIRST MATCH ANSWERS. This briefly refused an ambiguous name instead,
   *  on the theory that two open records could both carry a state called
   *  `verification`. ONE ENGINE WALKS ONE RECORD, so they cannot, and the guard
   *  only bought an owner-qualified address that nothing needed. */
  private uniqueGeneratedChild(id: string): GeneratedMachine | undefined {
    for (const container of Views.NESTING_CONTAINERS) {
      for (const make of Object.values(this.genFor(container)?.subGen ?? {})) {
        try {
          const child = make().subGen?.[id];
          if (child !== undefined) return child();
        } catch {
          // an ungenerable child colours nothing
        }
      }
    }
    return undefined;
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
   *  main › expedition_archive › e1-e10. */
  viewChain(id: string): string[] {
    if (id === this.host.machine.id) return [this.host.machine.id];
    const idx = this.host.subs.findIndex((s) => s.decl.id === id);
    if (idx >= 0) return [this.host.machine.id, ...this.host.subs.slice(0, idx + 1).map((s) => s.decl.id)];
    if (this.host.machine.states.some((s) => s.submachine !== undefined && s.id === id)) return [this.host.machine.id, id];
    for (const sub of this.host.subs) {
      if (sub.gen?.subGen?.[id] !== undefined) return [...this.viewChain(sub.decl.id), id];
    }
    for (const cid of Views.NESTING_CONTAINERS) {
      if (this.nestedGenerated(cid, id) !== undefined) return [this.host.machine.id, cid, id];
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
  viewFor(address: string): { decl: MachineDecl; canvas: CanvasData } | undefined {
    const direct = this.generatedView(address);
    if (direct !== undefined) return direct;
    // A record or archive decade is one generated level below its container.
    for (const container of Views.NESTING_CONTAINERS) {
      const child = this.nestedGenerated(container, address);
      if (child !== undefined) return { decl: child.decl, canvas: child.canvas };
    }
    // see dsp-walk-machine.md#a-static-sub-machine-is-a-drawing
    const drawn = this.drawnSubmachine(address);
    if (drawn !== undefined) return drawn;
    const unique = this.uniqueGeneratedChild(address);
    return unique === undefined ? undefined : { decl: unique.decl, canvas: unique.canvas };
  }

  /** EVERY MACHINE THE MIRROR CAN REACH, main first. The walked stack, then
   *  the containers, then each container's generated children — an
   *  iteration's own machine is one of those, and that is where a matrix row
   *  carrying a drawn sub-machine lives. */
  reachableMachines(): MachineDecl[] {
    // BUILT ONCE PER PASS. Every container here is GENERATED, so answering this
    // draws the iteration walk, its pinned canvas and every row and group on it.
    //
    // WHY IT IS WORTH A CACHE. The route search asks `declIteration` about every
    // node it expands, and that falls through to here. Measured on a three-hop
    // sweep: 498 ms, redrawing containers that had not moved since the hop
    // before.
    //
    // THE KEY CARRIES THE STACK, because walking into a sub adds a machine to
    // the answer. A pass is synchronous, so nothing else can move underneath.
    // see dsp-the-walk-knows-what-its-own-hops-cost.md#the-reachable-machines-are-drawn-once-per-pass
    const pass = passEpoch();
    const key = `${this.host.machine.id}::${this.host.subs.map((s) => s.decl.id).join("/")}`;
    if (pass !== 0) {
      const hit = Views.REACHABLE.get(key);
      if (hit?.pass === pass) return hit.value;
    }
    const value = this.reachableMachinesNow();
    if (pass !== 0) Views.REACHABLE.set(key, { pass, value });
    return value;
  }

  private static readonly REACHABLE = new Map<string, { pass: number; value: MachineDecl[] }>();

  private reachableMachinesNow(): MachineDecl[] {
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
