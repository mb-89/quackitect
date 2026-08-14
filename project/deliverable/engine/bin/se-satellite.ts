// THE SATELLITE'S OTHER SIDE — the code that runs across the boundary.
//
// ONE ENTRY FOR BOTH TRANSPORTS. A worker thread and a child process differ
// only in how a message arrives and how a reply is sent, so this file answers
// both and nothing else about a satellite knows which it is.
//
//   worker thread   parentPort.on("message")   parentPort.postMessage
//   child process   process.on("message")      process.send
//
// EVERY MESSAGE CARRIES AN ID, because both channels are asynchronous and two
// calls can be in flight at once. Without the id the second answer would be
// handed to whoever asked first, and the bug would look like a wrong
// resolution rather than a crossed wire.
//
// A SATELLITE THAT WILL NOT LEVEL SAYS SO AND SERVES NOTHING. The start is
// all-or-nothing (dsp-satellite-lifecycle), so the reply to every later call
// is the same refusal rather than a composition nobody assembled.
import { spawnSync } from "node:child_process";
import { isMainThread, parentPort, workerData } from "node:worker_threads";
import type { GitRun } from "../satellite.ts";
import { gitLaneFor, Satellite } from "../satellite.ts";

/** What one satellite needs to exist, sent across at start. */
export interface SatelliteSpec {
  record: string;
  tree: string;
  recordRel: string;
  trunkBranch: string;
}

/** A request on the wire. */
export interface Request {
  id: number;
  rel: string;
  payload?: unknown;
}

/** A reply on the wire. `error` and `up` are exclusive. */
export interface Reply {
  id: number;
  up?: { store: string; body: unknown };
  error?: string;
}

/** THE REAL GIT, for a satellite that has a repository under it. */
const realGit: GitRun = (args, cwd) => {
  const r = spawnSync("git", args, { cwd, encoding: "utf8" });
  return { ok: r.status === 0, stdout: String(r.stdout ?? ""), stderr: String(r.stderr ?? "") };
};

/** Stand the satellite up and answer calls with it.
 *
 *  Exported so a test can drive the answering without starting a worker or a
 *  child — the logic and the transport are separable, and only the transport
 *  needs a real boundary to prove. */
export function serveWith(spec: SatelliteSpec, git = gitLaneFor(spec.tree, spec.trunkBranch, realGit)): (req: Request) => Reply {
  const sat = new Satellite(spec.record, spec.tree, spec.recordRel);
  const state = sat.start(git);

  return (req: Request): Reply => {
    if (!state.serving) {
      return { id: req.id, error: `${spec.record} did not come up level: ${state.conflict ?? "no reason given"}` };
    }
    try {
      const served = sat.serve(req.rel);
      return { id: req.id, up: { store: sat.tree, body: { abs: served.abs, from: served.from } } };
    } catch (e) {
      return { id: req.id, error: String((e as Error).message) };
    }
  };
}

/** THE WORKER SIDE. `workerData` carries the spec, `parentPort` the traffic. */
function runAsWorker(): void {
  const answer = serveWith(workerData as SatelliteSpec);
  parentPort?.on("message", (req: Request) => parentPort?.postMessage(answer(req)));
}

/** THE CHILD SIDE. The spec rides one argument as JSON, because a child gets
 *  no `workerData` and an environment variable would be read by anything the
 *  child spawns in turn. */
function runAsChild(): void {
  const raw = process.argv[2];
  if (raw === undefined) {
    process.stderr.write("se-satellite: no spec — a child satellite is started with its spec as one JSON argument\n");
    process.exit(1);
  }
  const answer = serveWith(JSON.parse(raw) as SatelliteSpec);
  process.on("message", (req: Request) => process.send?.(answer(req)));
}

// WHICH SIDE AM I. A worker has a parentPort and is not the main thread; a
// child process is the main thread of its own process and has `process.send`.
if (!isMainThread && parentPort !== null) runAsWorker();
else if (typeof process.send === "function") runAsChild();
