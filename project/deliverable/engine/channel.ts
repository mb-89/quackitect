// THE LOCAL CHANNEL (dsp-core-and-satellite, if-core-satellite).
//
// The crossing between the core and one satellite. It carries three kinds of
// traffic and enforces one clause.
//
//   DOWN — a call the core received and a satellite owns.
//   UP   — the answer, NAMING THE STORE it resolved against.
//   BOTH — the heavy-slot lease and the beat.
//
// THE NAMING CLAUSE RIDES THE CROSSING DELIBERATELY. An answer that crossed a
// process boundary is the one a reader cannot check by eye: two trees, two
// processes, and a path that reads the same in both. So the crossing refuses
// an answer that cannot say which store produced it, rather than trusting it.
//
// WHAT IT COSTS. exp-channel-cost measured 144 microseconds per acknowledged
// append against a one-second budget. Twenty satellites serialised behind one
// core spend 0.3 percent of it, by arithmetic on that number.
//
// ATTACK THE FLOOR BEFORE THE CROSSING. The same probe measured a DIRECT
// append at 124.7 microseconds, because the file is opened and closed each
// time. A kept-open handle is worth more than any channel design could win
// back, and the crossing is not what makes it slow.
import type { Core, Lease, Satellite } from "./core.ts";
import { beatVerdict, missedBeats, type WatchVerdict } from "./supervisor.ts";

/** A call on its way DOWN to the satellite that owns it. */
export interface Down {
  record: string;
  /** The path the call is about, which is what decided the routing. */
  rel: string;
  /** Whatever the tool needs. The channel does not read it. */
  payload: unknown;
}

/** An answer on its way UP. */
export interface Up {
  /** WHICH STORE ANSWERED, absolute. An answer that cannot name its store is
   *  an answer nobody can check, and the crossing refuses it. */
  store: string;
  body: unknown;
}

/** Whatever actually carries a message to the other process, injected so the
 *  clause and the routing are testable without two processes. */
export type Crossing = (down: Down) => Up;

/** THE NAMING CLAUSE, as a function, so it reads the same everywhere it is
 *  applied. An answer names a store or it does not cross. */
export function namesItsStore(up: Up | undefined): boolean {
  return typeof up?.store === "string" && up.store.trim() !== "";
}

export interface Delivered {
  /** Who answered. */
  from: "core" | "satellite";
  /** The store the answer named. The core names its own trunk. */
  store: string;
  body: unknown;
  /** The satellite it crossed to, when it crossed. */
  satellite?: Satellite;
}

export class Channel {
  private readonly core: Core;
  private readonly cross: Crossing;

  constructor(core: Core, cross: Crossing) {
    this.core = core;
    this.cross = cross;
  }

  /** SEND A CALL WHERE THE PATH SAYS IT BELONGS.
   *
   *  A call the core owns never crosses at all. Paying 144 microseconds to
   *  ask a satellite about trunk would be a crossing bought for nothing. */
  send(rel: string, payload: unknown, caller?: string): Delivered {
    const routed = this.core.route(rel, caller);
    if (routed.to === "core" || routed.satellite === undefined) {
      return { from: "core", store: this.core.trunk, body: undefined };
    }
    const up = this.cross({ record: routed.satellite.record, rel, payload });
    if (!namesItsStore(up)) {
      throw new Error(
        `${routed.satellite.record} answered without naming its store — an answer that crossed a process boundary and cannot say which tree produced it is one nobody can check`,
      );
    }
    return { from: "satellite", store: up.store, body: up.body, satellite: routed.satellite };
  }

  /** THE LEASE RIDES THE CHANNEL. A satellite asks before spawning a heavy
   *  child and hands the token back after. The child stays the satellite's. */
  requestSlot(record: string): Lease {
    return this.core.takeSlot(record);
  }

  /** Hand a slot back. False for a token nobody holds, so a double return
   *  cannot invent capacity on the far side of a crossing. */
  returnSlot(token: number): boolean {
    return this.core.giveSlot(token);
  }

  /** THE BEAT RIDES IT TOO, and it is an ADDITION to the deadline rather than
   *  a replacement. exp-watchdog measured a satellite answering 8 of 8 beats
   *  while its call never returned, so the beat alone reports the likelier
   *  hang as healthy. What the beat sees and no deadline can is a wedge while
   *  the satellite is IDLE, with no call in flight to time. */
  beat(lastBeatAt: number, now: number): WatchVerdict {
    return beatVerdict(missedBeats(lastBeatAt, now));
  }
}
