// THE CORE (dsp-core-and-satellite, el-core).
//
// One process owns what must be ONE thing on a machine: trunk, the ledgers,
// the routing table, and the count of heavy slots.
//
// WHY A CORE AT ALL. The shared state gets an OWNER by design. That is the one
// thing cand-os-rooted pays for and does not price: machine-wide state is
// single, so several engine processes must either share it or hand it to one
// owner. Neither is free, and only one of them is designed.
//
// IT DEGENERATES CLEANLY. One core and one satellite is a working system, so
// the shape costs nothing until a second agent arrives.
import { type Owner, routeToOwner } from "./paths.ts";

/** THE LEDGERS THE CORE OWNS, named in one place so "who owns what" is
 *  readable rather than inferred from call sites.
 *
 *  Each is machine-wide and single. Two writers with no owner is
 *  raid-risk-many-writers-one-ledger. */
// `.se/claims.jsonl` WAS THE FIRST OF THESE AND i34 REMOVED IT with the
// machine-locking specification. Nothing writes it and nothing reads it.
export const CORE_LEDGERS = [".se/notes.jsonl", ".se/calls.jsonl"] as const;

/** THE CALL LOG IS THE EXCEPTION, and it is deliberate.
 *
 *  if-satellite-to-account: a satellite APPENDS to the call log directly
 *  rather than routing through the core. A log that depends on the core being
 *  reachable loses exactly the entries written when something is wrong — the
 *  ones worth having.
 *
 *  exp-channel-cost measured the floor: a direct append costs 124.7
 *  microseconds because the file is opened and closed each time, against 144
 *  for an acknowledged crossing. The crossing is not what makes it slow. */
export const APPENDED_DIRECTLY = ".se/calls.jsonl";

/** One agent's satellite: the record it owns and the tree that record stands
 *  in. */
export interface Satellite {
  record: string;
  root: string;
}

export interface Routed {
  /** Who answers. */
  to: "core" | "satellite";
  /** Named when a satellite answers. */
  satellite?: Satellite;
  /** WHY this answer, so a wrong routing is visible at the call rather than
   *  at a merge. */
  why: string;
}

export interface Lease {
  granted: boolean;
  /** The token to hand back. Named only when granted. */
  token?: number;
  /** Named when refused. */
  why?: string;
}

/** THE CORE, holding the three things the chunk names plus trunk itself.
 *
 *  The state is injected as constructor arguments and nothing here touches the
 *  filesystem or a process, so the routing and the lease are testable before
 *  either process exists. supervisor.ts sets the same pattern with GitLane. */
export class Core {
  /** TRUNK. The core owns it, and every satellite reads shared method from it
   *  rather than keeping a copy. */
  readonly trunk: string;

  private readonly satellites = new Map<string, Satellite>();
  private readonly slots: number;
  private readonly held = new Map<number, string>();
  private nextToken = 1;

  /** `heavySlots` HAS NO MEASURED DEFAULT, so the caller states it. Nothing in
   *  this record measured how many heavy children a machine should run at
   *  once, and a number invented here would read as one that was. */
  constructor(trunk: string, heavySlots: number) {
    this.trunk = trunk;
    this.slots = Math.max(0, Math.floor(heavySlots));
  }

  // ------------------------------------------------------ the routing table

  /** Register a satellite for one record. A second attach for the same record
   *  REPLACES the first, because a record has exactly one owner and a stale
   *  entry routing to a dead process is worse than none. */
  attach(satellite: Satellite): void {
    this.satellites.set(satellite.record, satellite);
  }

  /** Remove a satellite. Answers the one that went, or undefined. */
  detach(record: string): Satellite | undefined {
    const gone = this.satellites.get(record);
    this.satellites.delete(record);
    return gone;
  }

  /** Every satellite currently attached, by record id. */
  attached(): Satellite[] {
    return [...this.satellites.values()].sort((a, b) => a.record.localeCompare(b.record));
  }

  /** WHO ANSWERS THIS PATH, and why.
   *
   *  The decision is the PATH's, never the caller's ambient root — the same
   *  rule resolve.ts states in storeFor. The core answers for itself when it
   *  owns the path, and when the record that owns it has no satellite
   *  attached. */
  route(rel: string, caller?: string): Routed {
    const owner: Owner = routeToOwner(rel);
    if (owner.kind === "core") return { to: "core", why: "shared method and session state are the core's" };
    // A BOUND path names no record of its own. It belongs to whatever record
    // the CALLER has bound, so the path alone cannot route it and guessing
    // would send one agent's work into another agent's tree.
    const id = owner.kind === "bound" ? caller : owner.id;
    if (id === undefined) {
      return { to: "core", why: "the path is the caller's own record and no caller was named" };
    }
    const satellite = this.satellites.get(id);
    if (satellite === undefined) {
      return { to: "core", why: `no satellite is attached for ${id}, so the core answers from trunk` };
    }
    return { to: "satellite", satellite, why: `${id} is owned by an attached satellite` };
  }

  /** Does the core hold this ledger itself? */
  ownsLedger(rel: string): boolean {
    return (CORE_LEDGERS as readonly string[]).includes(rel.replace(/\\/g, "/"));
  }

  // -------------------------------------------------------- the heavy slots

  /** TAKE A SLOT before spawning a heavy child, and hand it back after.
   *
   *  IT IS A LEASE, NEVER A WORKER POOL. The child stays the satellite's, so
   *  it inherits the working directory and runs that record's own composition.
   *  A shared worker is nobody's child: it inherits no working directory, runs
   *  no record's engine, and would outlive the satellite that asked — which
   *  if-satellite-supervisor-to-test-runner forbids outright. */
  takeSlot(record: string): Lease {
    if (this.held.size >= this.slots) {
      return { granted: false, why: `all ${this.slots} heavy slots are held` };
    }
    const token = this.nextToken++;
    this.held.set(token, record);
    return { granted: true, token };
  }

  /** Hand a slot back. Answers false for a token nobody holds, so a double
   *  return cannot invent capacity. */
  giveSlot(token: number): boolean {
    return this.held.delete(token);
  }

  /** How many heavy slots are free right now. */
  freeSlots(): number {
    return this.slots - this.held.size;
  }

  /** Which record holds each outstanding slot — the answer a stuck machine
   *  needs, and the reason the map holds a record rather than a count. */
  slotHolders(): string[] {
    return [...this.held.values()].sort();
  }
}
