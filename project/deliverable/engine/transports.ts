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
 *  others is what the crossing itself costs.
 *
 *  IT IS ASYNC THOUGH IT NEED NOT BE, for the same reason it marshals though
 *  it need not: the contract is the one a boundary keeps, and a fast path that
 *  keeps a laxer contract is a fast path that breaks the others. */
export function inlineCrossing(satellites: Map<string, Satellite>): Crossing {
  return async (down: Down): Promise<Up> => {
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

// ── THE TWO REAL BOUNDARIES ────────────────────────────────────────────
//
// Both keep a PENDING MAP keyed by an id, because both channels are
// asynchronous and two calls can be in flight at once. Without the id the
// second answer goes to whoever asked first, and the bug reads as a wrong
// resolution rather than a crossed wire.
//
// BOTH REJECT EVERY PENDING CALL WHEN THE FAR SIDE DIES. A caller left
// awaiting a satellite that has exited is the hang exp-watchdog measured the
// deadline for — and a hang nobody answers is worse than an error somebody
// can read.

import { fork } from "node:child_process";
import { fileURLToPath } from "node:url";
import { Worker } from "node:worker_threads";
import type { Reply, Request, SatelliteSpec } from "./bin/se-satellite.ts";

const ENTRY = fileURLToPath(new URL("./bin/se-satellite.ts", import.meta.url));

/** What both boundaries hand back: the crossing, and the way to shut it. */
export interface Boundary {
  cross: Crossing;
  /** REAP. The record closed, so the far side goes. */
  stop: () => Promise<void>;
}

/** The pending-call bookkeeping both transports need, written once. */
function pending(): {
  next: () => number;
  wait: (id: number) => Promise<Reply>;
  settle: (r: Reply) => void;
  killAll: (why: string) => void;
} {
  const waiting = new Map<number, { ok: (r: Reply) => void; no: (e: Error) => void }>();
  let id = 0;
  return {
    next: () => ++id,
    wait: (n) => new Promise<Reply>((ok, no) => waiting.set(n, { ok, no })),
    settle: (r) => {
      const w = waiting.get(r.id);
      if (w === undefined) return; // an answer to a call nobody is waiting for
      waiting.delete(r.id);
      w.ok(r);
    },
    killAll: (why) => {
      for (const [, w] of waiting) w.no(new Error(why));
      waiting.clear();
    },
  };
}

/** Turn a reply into the answer the channel expects, or throw its error. */
function unwrap(spec: SatelliteSpec, reply: Reply): Up {
  if (reply.error !== undefined) throw new Error(reply.error);
  const up = reply.up;
  if (!namesItsStore(up)) throw new Error(`${spec.record} answered without naming its store`);
  return up as Up;
}

/** A WORKER THREAD PER RECORD. Cheaper to start than a process, and a hard
 *  crash takes the machine with it — that is the trade, and it is why this is
 *  a setting rather than a decision. */
export function threadBoundary(spec: SatelliteSpec): Boundary {
  const p = pending();
  const worker = new Worker(ENTRY, { workerData: spec });
  worker.on("message", (r: Reply) => p.settle(r));
  worker.on("error", (e: Error) => p.killAll(`${spec.record}'s worker failed: ${e.message}`));
  worker.on("exit", (code) => p.killAll(`${spec.record}'s worker exited with ${code}`));

  return {
    cross: async (down: Down): Promise<Up> => {
      const id = p.next();
      const answer = p.wait(id);
      worker.postMessage({ id, rel: down.rel, payload: down.payload } satisfies Request);
      return unwrap(spec, await answer);
    },
    stop: async () => {
      p.killAll(`${spec.record}'s satellite was reaped`);
      await worker.terminate();
    },
  };
}

/** A CHILD PROCESS PER RECORD. A crash stays with the record that caused it,
 *  and that isolation is what it is bought for. */
export function processBoundary(spec: SatelliteSpec): Boundary {
  const p = pending();
  const child = fork(ENTRY, [JSON.stringify(spec)], { stdio: ["ignore", "ignore", "pipe", "ipc"] });
  child.on("message", (r) => p.settle(r as Reply));
  child.on("error", (e: Error) => p.killAll(`${spec.record}'s satellite failed: ${e.message}`));
  child.on("exit", (code) => p.killAll(`${spec.record}'s satellite exited with ${code}`));

  return {
    cross: async (down: Down): Promise<Up> => {
      const id = p.next();
      const answer = p.wait(id);
      child.send({ id, rel: down.rel, payload: down.payload } satisfies Request);
      return unwrap(spec, await answer);
    },
    stop: async () => {
      p.killAll(`${spec.record}'s satellite was reaped`);
      child.kill();
    },
  };
}
