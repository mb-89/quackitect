// THE READ GATE: who has read what, at which version, on which channel.
//
// Lifted out of Session whole. It owns three ledgers — the agent's session
// buffer, the agent's standing proofs, and the human's checkboxes — and every
// question asked of them. Session keeps the walk; this keeps the reading.
//
// see dsp-walk-machine.md#the-read-proof
import { existsSync, readFileSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import { CLAUSES, Rejection } from "./errors.ts";
import { contentHash } from "./hash.ts";
import type { MachineDecl, StateDecl } from "./machine.ts";
import { resolveInRoot } from "./paths.ts";
import { pulledFor, type SessionMode, scanGuidance } from "./pull.ts";
import type { Channel } from "./session.ts";

/** THE SESSION'S OWN HAND. Not a spawned one, and the reader every walk uses
 *  until a hand is registered. */
const DEFAULT_READER = "session";

/** What the gate needs of the session it serves: where a document lives, and
 *  the two side effects a credit has. */
export interface ReadGateHost {
  laneRoot(rel?: string): string;
  machineRoot(): string;
  mode(): SessionMode;
  persist(): void;
  notify(): void;
}

export class ReadGate {
  private readonly paths: ReadGateHost;

  constructor(paths: ReadGateHost) {
    this.paths = paths;
  }

  /** The gate's ledgers, restored from and written to the session settings. */
  restore(reads: Record<string, unknown>): void {
    for (const [p, h] of Object.entries(reads)) {
      if (typeof h === "string" && h !== "") this.readBuffer.set(p, h);
    }
  }

  buffered(): Record<string, string> {
    return Object.fromEntries(this.readBuffer);
  }

  credit(path: string, hash: string): void {
    this.readBuffer.set(path, hash);
  }

  /** The document the last pull served, waiting on its probes. */
  serving(): { path: string; hash: string; expect: string[]; outstanding: string[] } | null {
    return this.pendingRead;
  }

  serve(path: string, hash: string, expect: string[]): void {
    // RE-SERVING THE SAME DOCUMENT DOES NOT WIPE WHAT WAS ALREADY ANSWERED.
    // A wrong answer serves the document again, and resetting here would hand
    // back all three probes every time — which is the loop banking exists to
    // end. A DIFFERENT document, or the same one changed under the reader,
    // starts fresh because its probes are different questions.
    const prev = this.pendingRead;
    const same = prev !== null && prev.path === path && prev.hash === hash;
    const outstanding = same && prev !== null ? prev.outstanding : [...expect];
    this.pendingRead = { path, hash, expect, outstanding };
  }

  /** Bank what this attempt answered, and say what is still owed. */
  bankProbes(missed: string[]): string[] {
    if (this.pendingRead !== null) this.pendingRead.outstanding = missed;
    return missed;
  }

  answered(): void {
    this.pendingRead = null;
  }

  // see dsp-walk-machine.md#the-read-proof
  readonly humanChecks = new Map<string, Set<string>>();

  /** The agent's standing ledger: hashes it PRESENTED on a tick that
   *  passed the read gate — per version, like the human's checks. Feeds
   *  the condition status (the mirror's pill) only; never the gate, and
   *  never the checkboxes (those stay the human's alone). */
  readonly agentReads = new Map<string, Set<string>>();
  /** ONE LEDGER PER READER. A reading proof belongs to the HEAD that read,
   *  never to the record. Two hands walking the same record have read
   *  different things, and only one of them can be asked.
   *
   *  IT WAS ONE SHARED LEDGER UNTIL, and that made a freshly
   *  spawned walker inherit credit for pages it had never seen. The gate then
   *  reported the reading as done to a hand holding none of it. That is the
   *  same guarantee the cold reviewer rests on, broken from the other end
   *.
   *
   *  THE LEDGERS DO NOT SURVIVE A RESTART except the default reader's, which
   *  is what `restore` writes into. That is correct rather than a shortcut: a
   *  hand does not survive a restart either, so its reading cannot. */
  private readonly ledgers = new Map<string, Map<string, string>>();

  /** WHOSE HEAD IS READING RIGHT NOW. The session's own hand by default, so
   *  a walk with no spawned hands behaves exactly as it did before. */
  private readerId = DEFAULT_READER;

  /** Session-local read buffer: latest lane hash per path, auto-filled by
   *  se_file_read and re-used for later ticks unless stale. Serves the
   *  ledger of whoever is reading, so every existing caller is unchanged. */
  get readBuffer(): Map<string, string> {
    const held = this.ledgers.get(this.readerId);
    if (held !== undefined) return held;
    const fresh = new Map<string, string>();
    this.ledgers.set(this.readerId, fresh);
    return fresh;
  }

  /** HAND THE READING OVER. A newly spawned hand starts with an empty head,
   *  so it re-owes every document, and the hand it replaced keeps its own
   *  proofs under its own name rather than losing them.
   *
   *  Passing nothing returns the reading to the session's own hand. */
  setReader(id?: string): void {
    this.readerId = id === undefined || id.trim() === "" ? DEFAULT_READER : id;
  }

  /** Who the reading is currently attributed to. */
  currentReader(): string {
    return this.readerId;
  }
  /** The document the last pull served, waiting on its probes.
   *
   *  `outstanding` IS WHAT IS STILL OWED, never the whole set. A probe answered
   *  on one attempt stays answered: an agent told which two it missed sends
   *  those two, and judging that reply against all three would fail it for the
   *  one it had already got right. Measured on the i15 walk, which learned the
   *  rule the expensive way and wrote it into its own field report. */
  pendingRead: { path: string; hash: string; expect: string[]; outstanding: string[] } | null = null;

  rememberRead(path: string, hash: string, ref?: string): void {
    if (ref !== undefined || path.trim() === "" || hash.trim() === "" || path.startsWith("@")) return;
    const lane = this.diskHash(path);
    if (lane !== "" && lane === hash) {
      this.readBuffer.set(path, hash);
      this.paths.persist();
    }
  }

  clearReadBuffer(): void {
    this.readBuffer.clear();
    this.paths.persist();
  }

  /** The agent's proofs, ALL earned by reading: se_file_read credits as it
   *  serves, and the pull credits once the document's tail comes back. Stale
   *  entries are swept here, so an edited doc always asks to be read again. */
  readProofs(channel: Channel): Record<string, string> {
    if (channel !== "agent") return {};
    const merged: Record<string, string> = {};
    for (const [p, h] of this.readBuffer.entries()) merged[p] = h;
    for (const [p, h] of Object.entries(merged)) {
      const lane = this.diskHash(p);
      if (lane !== "" && h === lane) {
        this.readBuffer.set(p, h);
      } else {
        delete merged[p];
        this.readBuffer.delete(p);
      }
    }
    return merged;
  }

  agentProven(path: string): boolean {
    const hash = this.diskHash(path);
    return hash !== "" && (this.agentReads.get(path)?.has(hash) ?? false);
  }

  // see dsp-walk-machine.md#the-proof-hashes-the-doc-the-lane-served
  diskHash(rel: string): string {
    try {
      const abs = resolveInRoot(this.paths.laneRoot(rel), rel, "engine/session.ts reads");
      return contentHash(readFileSync(abs));
    } catch {
      return "";
    }
  }

  /** The copy the MIRROR serves — always the project root, because that is
   *  where the human's checkboxes are made, bound expedition or not. */
  rootDiskHash(rel: string): string {
    try {
      return contentHash(readFileSync(resolveInRoot(this.paths.machineRoot(), rel, "engine/session.ts reads")));
    } catch {
      return "";
    }
  }

  /** The mirror's checkbox: pin the doc AS IT STANDS as read-by-human. */
  humanCheck(path: string): Record<string, unknown> {
    const hash = this.diskHash(path);
    if (hash === "") {
      throw new Rejection({
        clause: CLAUSES.REQUIRED_ARGS,
        expected: "a readable project document",
        got: path,
        remedy: { tool: "se_pull", args: {}, note: "the pulled list names the checkable documents" },
        source: "engine/session.ts reads",
      });
    }
    const set = this.humanChecks.get(path) ?? new Set<string>();
    set.add(hash);
    this.humanChecks.set(path, set);
    this.paths.notify();
    return { path, hash, checked: true };
  }

  humanChecked(path: string, hash: string): boolean {
    return hash !== "" && (this.humanChecks.get(path)?.has(hash) ?? false);
  }

  /** Every doc the human has checked AT ITS CURRENT VERSION — the session's
   *  reading list. Checks of edited (stale) versions drop out. */
  humanCheckedPaths(): string[] {
    return [...this.humanChecks.entries()]
      .filter(([p, set]) => set.has(this.diskHash(p)) || set.has(this.rootDiskHash(p)))
      .map(([p]) => p)
      .sort();
  }

  /** see dsp-the-goal-binds-the-walk.md#one-doc-one-channel-one-verdict */
  readProven(channel: Channel, path: string, supplied: Record<string, string>): boolean {
    const lane = this.diskHash(path);
    if (channel === "agent") return lane !== "" && supplied[path] === lane;
    const set = this.humanChecks.get(path);
    if (set === undefined) return false;
    const root = this.rootDiskHash(path);
    return (lane !== "" && set.has(lane)) || (root !== "" && set.has(root));
  }

  /** Boot is exempt from the pull gate — it is where the first reads
   *  happen; gating entry on them would deadlock the session at start. */
  pullGateExempt(m: MachineDecl, t: StateDecl): boolean {
    if (t.kind === "start" || t.kind === "end") return true;
    if (m.id === "boot") return true;
    if (t.submachine?.includes("boot")) return true;
    return false;
  }

  /** see dsp-walk-machine.md#the-consume-list */
  consumeDemand(s: StateDecl): string[] {
    return (s.exit?.read_consume ?? []).filter((rel) => existsSync(this.consumeAbs(rel)));
  }

  consumeAbs(rel: string): string {
    return join(this.paths.laneRoot(rel), rel);
  }

  /** Leaving the state destroys what it consumed. A briefing that cannot
   *  survive its own reading cannot go stale and cannot be believed twice. */
  consumeDocs(s: StateDecl): void {
    for (const rel of this.consumeDemand(s)) unlinkSync(this.consumeAbs(rel));
  }

  /** see dsp-walk-machine.md#the-written-handover-is-gone */

  /** see dsp-walk-machine.md#one-reading-list */
  reading(m: MachineDecl, s: StateDecl, which: "enter" | "leave"): string[] {
    if (which === "leave") return [...(s.exit?.read ?? []), ...this.consumeDemand(s)];
    return this.entryRequirements(m, s);
  }

  /** The enter half: the state's own entry list plus everything bound to it —
   *  minus its exit list, which is the state's assignment, read INSIDE it
   *  rather than before it. */
  entryRequirements(m: MachineDecl, t: StateDecl): string[] {
    const req = new Set<string>(t.entry?.read ?? []);
    if (!this.pullGateExempt(m, t)) {
      for (const d of pulledFor(this.paths.machineRoot(), scanGuidance(this.paths.machineRoot()), m, t, this.paths.mode())) req.add(d.path);
    }
    for (const p of t.exit?.read ?? []) req.delete(p);
    return [...req];
  }

  bufferedCurrent(path: string): boolean {
    const lane = this.diskHash(path);
    return lane !== "" && this.readBuffer.get(path) === lane;
  }

  /** One neighbor state's entry requirements, minus docs already present in
   *  the current read buffer at their latest hash. */
  unreadEntryRequirements(m: MachineDecl, t: StateDecl): string[] {
    return this.entryRequirements(m, t)
      .filter((p) => !this.bufferedCurrent(p))
      .sort();
  }

  /** The docs worth pre-reading from HERE: every immediate neighbor state's
   *  unread entry requirements, deduplicated and sorted for stable packets. */
  lookaheadRequirements(m: MachineDecl, from: StateDecl): string[] {
    const req = new Set<string>();
    for (const e of from.edges) {
      const t = m.states.find((s) => s.id === e.to);
      if (t === undefined) continue;
      for (const p of this.unreadEntryRequirements(m, t)) req.add(p);
    }
    return [...req].sort();
  }

  refuseReads(which: "exit" | "entry", stateId: string, missing: string[], channel: Channel): never {
    throw new Rejection({
      clause: CLAUSES.CONDITION_UNMET,
      expected: `${which === "exit" ? "leaving" : "entering"} ${stateId} demands proven reading of: ${missing.join(", ")}`,
      got:
        channel === "agent" ? `not read at its current version: ${missing.join(", ")}` : `not checked in the mirror: ${missing.join(", ")}`,
      remedy:
        channel === "agent"
          ? {
              tool: "se_pull",
              args: {},
              note: "pull — it serves each document and asks three fill-in-the-blank questions about it, one document at a time. Reading through se_file_read credits too.",
            }
          : {
              tool: "se_pull",
              args: {},
              note: "check each listed document in the mirror — one check per version; an edited doc asks again",
            },
      source: "engine/session.ts reads",
    });
  }

  /** THE READ GATE, both directions: the current state's exit read list,
   *  and the target's entry requirements (explicit reads + the pull). */
  assertReads(m: MachineDecl, from: StateDecl, targetIds: string[], channel: Channel, supplied: Record<string, string>): void {
    const exitReads = this.reading(m, from, "leave");
    const missingExit = exitReads.filter((p) => !this.readProven(channel, p, supplied));
    if (missingExit.length > 0) this.refuseReads("exit", from.id, missingExit, channel);
    for (const id of targetIds) {
      const t = m.states.find((s) => s.id === id);
      if (t === undefined) continue;
      const missing = this.reading(m, t, "enter").filter((p) => !this.readProven(channel, p, supplied));
      if (missing.length > 0) this.refuseReads("entry", t.id, missing, channel);
    }
    // see dsp-walk-machine.md#the-handover-rule
    this.assertHandover(channel, supplied);
    if (channel === "agent") {
      for (const [p, h] of Object.entries(supplied)) {
        if (h !== "" && h === this.diskHash(p)) {
          const set = this.agentReads.get(p) ?? new Set<string>();
          set.add(h);
          this.agentReads.set(p, set);
        }
      }
    }
  }

  assertHandover(channel: Channel, supplied: Record<string, string>): void {
    if (channel !== "agent") return;
    const owed = this.humanCheckedPaths().filter((p) => !this.readProven("agent", p, supplied));
    if (owed.length === 0) return;
    throw new Rejection({
      clause: CLAUSES.CONDITION_UNMET,
      expected: `your reading to match the human's checked list: ${owed.join(", ")}`,
      got: `no current hash supplied for: ${owed.join(", ")}`,
      remedy: {
        tool: "se_file_read",
        args: { path: owed[0] },
        note: "the human checked these as read while driving — your head must hold them too. Read each through the lane, then repeat the tick with their hashes in read_hashes.",
      },
      source: "engine/session.ts reads",
    });
  }
}
