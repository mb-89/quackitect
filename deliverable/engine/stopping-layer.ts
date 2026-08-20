// see dsp-lane-door.md — naming the layer that ended a call.
//
// req-interrupted-call-names-the-stopping-layer. When a lane call ends without
// a normal result, recovery starts from whatever the engineer believes ended
// it. A wrong belief repeats the interruption, and it reads exactly like a
// right one.
//
// SO UNKNOWN IS A FIRST-CLASS ANSWER. An interrupted call is precisely when
// the system knows least. Naming a layer on no evidence would be guessing on
// the calls that matter most.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export type StoppingLayer = "server" | "transport" | "host" | "stop-hook" | "unknown";

export interface Diagnosis {
  layer: StoppingLayer;
  /** The lifecycle line the verdict rests on, verbatim. Empty for unknown. */
  evidence: string;
  /** Why that line means that layer, in one sentence a person can check. */
  why: string;
}

interface Line {
  ts: string;
  event: string;
  raw: string;
}

function lifecycleLines(root: string): Line[] {
  const p = join(root, ".se", "engine.log");
  if (!existsSync(p)) return [];
  const out: Line[] = [];
  for (const raw of readFileSync(p, "utf8").split("\n")) {
    // `<iso> pid=<n> <event> [detail]`
    const m = /^(\S+)\s+pid=\d+\s+(\S+)/.exec(raw);
    if (m === null) continue;
    out.push({ ts: m[1] ?? "", event: m[2] ?? "", raw });
  }
  return out;
}

/** What ended a call that began at `since`.
 *
 *  THE ORDER IS BY HOW CONCLUSIVE THE EVIDENCE IS, not by how likely the cause
 *  is. A recorded exit settles it; a reset only rules the server out. */
export function stoppingLayer(root: string, since: string): Diagnosis {
  const after = lifecycleLines(root).filter((l) => l.ts >= since);

  const exited = after.find((l) => l.event === "exit");
  if (exited !== undefined) {
    return { layer: "server", evidence: exited.raw, why: "the server recorded its own exit after the call began" };
  }

  const blocked = after.find((l) => l.event === "stop-block");
  if (blocked !== undefined) {
    return { layer: "stop-hook", evidence: blocked.raw, why: "the stop hook recorded a block after the call began" };
  }

  const reset = after.find((l) => l.event === "client-reset" || l.event === "client-error");
  if (reset !== undefined) {
    return {
      layer: "transport",
      evidence: reset.raw,
      why: "the client's socket failed and the server recorded no exit, so the process outlived the connection",
    };
  }

  // THE HOST IS THE ONE LAYER NOTHING OBSERVES. A host that cancels its own
  // request tells the server nothing, so there is no line to find. Reporting
  // `host` here would be inference dressed as evidence.
  return {
    layer: "unknown",
    evidence: "",
    why: "no lifecycle event was recorded after the call began, so nothing observed says which layer ended it",
  };
}
