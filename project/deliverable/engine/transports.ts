// THE THREE CROSSINGS (if-core-satellite, dsp-core-and-satellite).
//
// One architecture, three transports. `Channel` takes its crossing as an
// injected function, so a process, a worker thread and a direct call are three
// implementations of one contract and nothing above them knows the difference.
//
// THE RULE THAT KEEPS ALL THREE HONEST: EVERY CROSSING MARSHALS.
//
// An inline crossing could hand back the satellite's own live object. It would
// work, it would be faster, and it would make the other two transports fail at
// the moment somebody switched — because a process boundary serialises whether
// you meant it to or not. That is the classic fast path that quietly stops
// obeying the contract the slow paths keep, and the failure lands on whoever
// flips the setting rather than on whoever wrote the shortcut.
//
// So `marshal` runs on every answer, including the one that did not have to
// leave the thread. Inline is allowed to be FASTER. It is not allowed to be
// LAXER.
import type { Crossing, Down, Up } from "./channel.ts";
import { namesItsStore } from "./channel.ts";
import type { Satellite } from "./satellite.ts";

/** A VALUE THAT COULD HAVE CROSSED A PROCESS BOUNDARY.
 *
 *  The round trip is the point rather than a cost: it proves the answer holds
 *  nothing a boundary would have refused to carry — a function, a class
 *  instance, a circular reference, a live handle. */
export function marshal<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/** What a satellite hands back for one call, before it is marshalled. */
export interface Serving {
  abs: string;
  from: "record" | "trunk";
}

/** THE INLINE CROSSING: no boundary, same contract.
 *
 *  This is the BASELINE the other two are measured against, not "the old
 *  behaviour". Same core, same satellite, same routing, same naming clause,
 *  and the transport subtracted. What is left when you compare it against the
 *  others is what the crossing itself costs. */
export function inlineCrossing(satellites: Map<string, Satellite>): Crossing {
  return (down: Down): Up => {
    const sat = satellites.get(down.record);
    if (sat === undefined) {
      throw new Error(`no satellite is attached for ${down.record} — the core routed a call to a record nothing is serving`);
    }
    if (!sat.serving()) {
      throw new Error(`${down.record} is not serving: ${sat.why() ?? "it never started"}`);
    }
    const served = sat.serve(down.rel);
    const up: Up = { store: sat.tree, body: { abs: served.abs, from: served.from } satisfies Serving };
    // THE CLAUSE IS CHECKED ON THE WAY OUT TOO, not only on the way in. A
    // transport that forgot to name its store would otherwise be caught for
    // the process and the thread and missed for the one that never left.
    if (!namesItsStore(up)) throw new Error(`${down.record} answered without naming its store`);
    return marshal(up);
  };
}
