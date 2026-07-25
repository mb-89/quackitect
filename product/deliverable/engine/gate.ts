// The offer state machine (§7). Three states, two recorded: waiting →
// accepted, or gone. Dismissal requires no write — absence of a live offer
// IS dismissal, so crash, reclaim and interrupt all collapse to the same
// safe state with no liveness assumption.
//
// The grant: the offer's base hash binds the bless to the state it was
// offered against. Every grant records its channel and adjudicator (floor
// flag 2; delegated adjudication is a policy knob — agent blesses are legal
// where enabled and transparently recorded).
import { appendFileSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { readJsonFile } from "./jsonio.ts";
import { Rejection } from "./errors.ts";
import { sha256 } from "./hash.ts";
import { layout } from "./layout.ts";
import { completeState, type MachineDecl, type MachineInstance } from "./machine.ts";
import { loadIterationMachine, loadMachine } from "./machines/load.ts";
import { importStamps } from "./modules.ts";
import { openCommitWindow } from "./git.ts";
import { commitMilestone, iterationTag, openWorktrees, projectRootOf, shipMerge } from "./worktree.ts";

export interface Offer {
  iteration: string;
  state: string;
  brief: string;
  evidence: Record<string, string>;
  /** Ledger-relative path of the evidence file pinned for this gate. */
  evidence_path: string;
  base_hash: string;
  created_at: number;
  deadline: number;
}

// The p4 §3 floor: policy in force, channel + adjudicator, iteration
// provenance, evidence pointer — plus the import stamp (module commit at
// gate time).
export interface GrantRecord {
  iteration: string;
  state: string;
  hash: string;
  policy: string;
  channel: string;
  adjudicated_by: string;
  /** Set on delegated blesses: the decision node granting the delegation. */
  delegated_via?: string;
  evidence: string;
  /** The tag the evidence will be reachable under once the close withholds it. */
  evidence_tag?: string;
  imports: Record<string, string>;
  as_offered: boolean;
  at: string;
}

// 6 hours (owner ruling): an offer must survive a phone conversation away
// from the desk. Safe at any length — the hash binds the bless to the
// offered state, and a moved machine refuses (SE-C-043).
const OFFER_TTL_MS = 6 * 60 * 60 * 1000;

export class Gate {
  private root: string;
  private now: () => number;

  constructor(root: string, opts: { now?: () => number } = {}) {
    this.root = root;
    this.now = opts.now ?? Date.now;
  }

  private offerPath(): string {
    return layout.offerPath(this.root);
  }

  grantsPath(): string {
    return layout.grantsPath(this.root);
  }

  makeOffer(inst: MachineInstance, stateId: string, evidence: Record<string, string>, brief: string, evidencePath: string): Offer {
    const created = this.now();
    const core = { iteration: inst.iteration, state: stateId, evidence, brief, evidence_path: evidencePath };
    const offer: Offer = {
      ...core,
      base_hash: sha256(JSON.stringify(core)),
      created_at: created,
      deadline: created + OFFER_TTL_MS,
    };
    mkdirSync(dirname(this.offerPath()), { recursive: true });
    writeFileSync(this.offerPath(), JSON.stringify(offer, null, 2) + "\n", "utf8");
    return offer;
  }

  /** The live offer, or null. Expiry = dismissal by absence. */
  current(): Offer | null {
    if (!existsSync(this.offerPath())) return null;
    const offer = readJsonFile<Offer>(this.offerPath());
    if (this.now() > offer.deadline) return null;
    return offer;
  }

  /** Human interrupt = dismissal. Removes the offer; no record needed. */
  dismiss(): void {
    rmSync(this.offerPath(), { force: true });
  }

  /**
   * Validate hash against the live offer, record the grant with channel +
   * adjudicator, advance the machine along its approval edge.
   */
  bless(
    machine: MachineDecl,
    hash: string,
    by: { channel: string; adjudicated_by: string; delegated_via?: string },
  ): GrantRecord {
    const offer = this.current();
    if (!offer) {
      throw new Rejection({
        clause: "SE-C-041",
        expected: "a live offer (offers expire after 6 hours; absence is dismissal)",
        got: "no live offer",
        remedy: { tool: "se_loop_next", args: {}, note: "re-reach the gate; a fresh offer carries a fresh hash" },
        source: "engine/gate.ts bless",
      });
    }
    if (hash !== offer.base_hash) {
      throw new Rejection({
        clause: "SE-C-042",
        expected: `the live offer's hash ${offer.base_hash}`,
        got: hash,
        remedy: { tool: "se_loop_next", args: {}, note: "a stale tap cannot match — read the current offer and bless that" },
        source: "engine/gate.ts bless",
      });
    }
    // Child offers carry "iteration#state" — the bless routes to the child record.
    const [iterName, childOf] = offer.iteration.split("#");
    // The iteration may live in a worktree; the bless must advance it there.
    // The caller may be rooted at trunk OR at the worktree itself; both must
    // recognise the same stream, or a worktree iteration silently loses its
    // milestone commits and closes on an empty branch.
    const projectRoot = projectRootOf(this.root);
    const stream = openWorktrees(projectRoot).find((w) => w.iteration === iterName);
    const iterRoot = existsSync(layout.instancePath(this.root, iterName)) ? this.root : stream?.root ?? this.root;
    const instPath =
      childOf !== undefined
        ? join(layout.iterationDir(iterRoot, iterName), `sub-${childOf}.json`)
        : layout.instancePath(iterRoot, offer.iteration);
    const inst = readJsonFile<MachineInstance>(instPath);
    if (inst.current !== offer.state || inst.status !== "open") {
      throw new Rejection({
        clause: "SE-C-043",
        expected: `instance open at ${offer.state}`,
        got: `${inst.iteration} at ${inst.current} (${inst.status})`,
        remedy: { tool: "se_loop_next", args: {}, note: "the machine moved; the offer no longer binds" },
        source: "engine/gate.ts bless",
      });
    }
    // The instance's own machine wins (floor flag 1) — a bless must advance
    // the machine the iteration started under, not the ledger's current default.
    const m =
      childOf !== undefined
        ? loadIterationMachine(iterRoot, iterName, childOf) ?? machine
        : machine.id === inst.machine
          ? machine
          : loadMachine(iterRoot, inst.machine) ?? machine;
    const grant: GrantRecord = {
      iteration: offer.iteration,
      state: offer.state,
      hash: offer.base_hash,
      policy: m.id,
      channel: by.channel,
      adjudicated_by: by.adjudicated_by,
      ...(by.delegated_via !== undefined ? { delegated_via: by.delegated_via } : {}),
      evidence: offer.evidence_path,
      // The tag is deterministic, so the pointer can name it before the close
      // creates it — without this the evidence path dangles once it is withheld.
      ...(stream !== undefined ? { evidence_tag: iterationTag(iterName) } : {}),
      imports: importStamps(this.root),
      as_offered: true,
      at: new Date(this.now()).toISOString(),
    };
    appendFileSync(this.grantsPath(), JSON.stringify(grant) + "\n", "utf8");
    openCommitWindow(this.root, `grant:${grant.hash.slice(0, 12)}`);
    inst.history.push({ state: offer.state, outcome: "filled", evidence: `grant:${grant.hash.slice(0, 12)}`, at: grant.at });
    // A blessed gate fires ALL its approval edges - fanned milestones open in parallel.
    completeState(m, inst, offer.state, "filled", grant.at);
    writeFileSync(instPath, JSON.stringify(inst, null, 2) + "\n", "utf8");
    this.dismiss();
    // The milestone lands on the iteration's OWN branch, after the machine has
    // advanced so the commit captures the blessed state. Best-effort by design:
    // a failed commit must never void a legitimate bless.
    if (stream !== undefined) {
      try {
        // allowSelf mirrors the worktree lane in loop.ts: SE develops itself, so
        // the lane operates on its own repo; SE-C-001 exists to guard se_git.
        commitMilestone(projectRoot, iterName, `${offer.state} blessed (${grant.hash.slice(0, 12)})`, { allowSelf: true });
        // An iteration usually closes on its FINAL GATE, so the split runs here -
        // for every channel, since a board bless comes through this same path.
        // Without it the iteration is marked shipped while the repository records
        // nothing, which is exactly what i8c did.
        // completeState may have closed the instance; the earlier open-guard
        // narrowed the type, so read the mutated value widened.
        const statusAfter: string = inst.status;
        if (statusAfter === "closed" && childOf === undefined) {
          const res = shipMerge(projectRoot, iterName, { allowSelf: true });
          if (!res.merged) {
            console.error(`se: ${iterName} closed but did NOT merge — ${res.refused ?? res.conflict ?? "unknown"}; trunk unchanged`);
          }
        }
      } catch (e) {
        // The grant stands: a legitimate bless is never voided by the split.
        console.error(`se: ${iterName} bless recorded, close/commit failed — ${String((e as Error).message)}`);
      }
    }
    return grant;
  }
}
