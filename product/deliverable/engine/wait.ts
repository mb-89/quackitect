// se.wait (§5, G1) — the declared wait lane. Returns when a MECHANICAL
// condition changes (file, offer state) or a timeout passes. Runs no checks:
// nothing on any read path executes checks. Long waits are not waits — the
// agent parks; the offer lives in the ledger; dismissal-by-absence.
import { existsSync, statSync } from "node:fs";
import { Rejection } from "./errors.ts";
import { layout } from "./layout.ts";

export type WaitCondition =
  | { kind: "file"; path: string; until: "exists" | "changes" }
  | { kind: "offer" };

export interface WaitResult {
  outcome: "condition" | "timeout";
  waited_ms: number;
  detail: string;
}

const MAX_WAIT_S = 300; // longer than this is a park, not a wait
const POLL_MS = 250;

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

export interface WaitOpts {
  /** Called ONCE when a wait for the owner's decision begins on a live offer. */
  onPark?: () => Promise<void>;
}

export async function seWait(root: string, condition: WaitCondition, timeoutS: number, opts: WaitOpts = {}): Promise<WaitResult> {
  if (timeoutS > MAX_WAIT_S) {
    throw new Rejection({
      clause: "SE-C-050",
      expected: `a wait of at most ${MAX_WAIT_S}s — longer waits are parks`,
      got: `${timeoutS}s`,
      remedy: {
        tool: "se.wait",
        args: { condition, timeout_s: MAX_WAIT_S },
        note: "wait short, or end the turn: the offer lives in the ledger and a later session resumes (dismissal-by-absence)",
      },
      source: "engine/wait.ts",
    });
  }
  const started = Date.now();
  const offerPath = layout.offerPath(root);

  const initial = ((): string => {
    switch (condition.kind) {
      case "file":
        return existsSync(condition.path) ? String(statSync(condition.path).mtimeMs) : "absent";
      case "offer":
        return existsSync(offerPath) ? "live" : "absent";
    }
  })();

  // THE PARK SEAM (R9, se.adr-announce-by-adjudicator). The owner asked for
  // exactly one rule: push when the agent would otherwise be WAITING for
  // their input. That moment is not something to infer from configuration or
  // from a timer noticing an offer — it IS this call. An agent that will
  // self-bless calls se_gate_bless and never arrives here.
  //
  // WHITELIST (se.law-whitelist-guards): the one state that announces is "a
  // wait for an offer, beginning while an offer is live". Every other wait —
  // a file wait, an offer wait with nothing offered — announces nothing, not
  // because it was excluded but because it was never included.
  if (condition.kind === "offer" && initial === "live" && opts.onPark !== undefined) {
    // Best-effort: a summons that cannot be sent must never wedge the wait.
    // Its failure is recorded by the announcer itself (R12).
    try {
      await opts.onPark();
    } catch (e) {
      console.error("se: park announcement failed —", String((e as Error).message));
    }
  }

  while (Date.now() - started < timeoutS * 1000) {
    await sleep(POLL_MS);
    switch (condition.kind) {
      case "file": {
        const nowState = existsSync(condition.path) ? String(statSync(condition.path).mtimeMs) : "absent";
        if (condition.until === "exists" && nowState !== "absent") {
          return { outcome: "condition", waited_ms: Date.now() - started, detail: "file exists" };
        }
        if (condition.until === "changes" && nowState !== initial) {
          return { outcome: "condition", waited_ms: Date.now() - started, detail: "file changed" };
        }
        break;
      }
      case "offer": {
        const nowState = existsSync(offerPath) ? "live" : "absent";
        if (nowState !== initial) {
          return {
            outcome: "condition",
            waited_ms: Date.now() - started,
            detail: nowState === "absent" ? "offer resolved (blessed or dismissed)" : "offer appeared",
          };
        }
        break;
      }
    }
  }
  return { outcome: "timeout", waited_ms: Date.now() - started, detail: "timeout — park if the wait would continue" };
}
