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
import { dirname } from "node:path";
import { readJsonFile } from "./jsonio.ts";
import { Rejection } from "./errors.ts";
import { sha256 } from "./hash.ts";
import { layout } from "./layout.ts";
import { advance, type MachineDecl, type MachineInstance } from "./machine.ts";
import { importStamps } from "./modules.ts";

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
  evidence: string;
  imports: Record<string, string>;
  as_offered: boolean;
  at: string;
}

const OFFER_TTL_MS = 15 * 60 * 1000; // wall clock, owned by SE (§7)

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
    by: { channel: string; adjudicated_by: string },
  ): GrantRecord {
    const offer = this.current();
    if (!offer) {
      throw new Rejection({
        clause: "SE-C-041",
        expected: "a live offer (offers expire after 15 min; absence is dismissal)",
        got: "no live offer",
        remedy: { tool: "se.loop.next", args: {}, note: "re-reach the gate; a fresh offer carries a fresh hash" },
        source: "engine/gate.ts bless",
      });
    }
    if (hash !== offer.base_hash) {
      throw new Rejection({
        clause: "SE-C-042",
        expected: `the live offer's hash ${offer.base_hash}`,
        got: hash,
        remedy: { tool: "se.loop.next", args: {}, note: "a stale tap cannot match — read the current offer and bless that" },
        source: "engine/gate.ts bless",
      });
    }
    const instPath = layout.instancePath(this.root, offer.iteration);
    const inst = readJsonFile<MachineInstance>(instPath);
    if (inst.current !== offer.state || inst.status !== "open") {
      throw new Rejection({
        clause: "SE-C-043",
        expected: `instance open at ${offer.state}`,
        got: `${inst.iteration} at ${inst.current} (${inst.status})`,
        remedy: { tool: "se.loop.next", args: {}, note: "the machine moved; the offer no longer binds" },
        source: "engine/gate.ts bless",
      });
    }
    const grant: GrantRecord = {
      iteration: offer.iteration,
      state: offer.state,
      hash: offer.base_hash,
      policy: machine.id,
      channel: by.channel,
      adjudicated_by: by.adjudicated_by,
      evidence: offer.evidence_path,
      imports: importStamps(this.root),
      as_offered: true,
      at: new Date(this.now()).toISOString(),
    };
    appendFileSync(this.grantsPath(), JSON.stringify(grant) + "\n", "utf8");
    inst.history.push({ state: offer.state, outcome: "filled", evidence: `grant:${grant.hash.slice(0, 12)}`, at: grant.at });
    advance(machine, inst, "filled", grant.at);
    writeFileSync(instPath, JSON.stringify(inst, null, 2) + "\n", "utf8");
    this.dismiss();
    return grant;
  }
}
