// The phone lane (i8, repaired and extended by i8d): a gate the run would
// otherwise WAIT on reaches the owner's phone as a one-tap card, the decision
// is readable behind an encrypted link, and the tap returns a hash-bound,
// channel-stamped grant. Opt-in (seDir/phone.json) and silent without it; the
// outside world is reached only through an injectable Transport, so tests use
// a mock and no build ever touches a live topic.
//
// Authenticity = possession of the correlation id (adr-answer-authenticity,
// owner-ruled accepted risk): the offer's own hash is that id, so a tap
// binds only when it names the live offer.
//
// THE i8d REPAIR, three parts, each a witnessed failure:
//  - Every action URL is ABSOLUTE http(s). The shipped lane wrote
//    "answer:<topic>", which is not a URL scheme; the owner tapped and got
//    "Expected URL scheme HTTP or HTTPS". v1 had this right (ask.go).
//  - The card is published when the RUN PARKS, not when a timer notices an
//    offer. A poller cannot know whether the agent is about to self-bless
//    (se.adr-announce-by-adjudicator).
//  - Every announcement is recorded, success or failure. A broken lane was
//    indistinguishable from a quiet one, which is why the defect survived.
import { existsSync } from "node:fs";
import { join } from "node:path";
import { readJsonFile } from "./jsonio.ts";
import { layout } from "./layout.ts";
import { Gate } from "./gate.ts";
import { requireSystematic } from "./machines/load.ts";
import { briefEnvelope, loadBriefStore, publishBrief, type BriefStore } from "./brief.ts";
import type { CallLog } from "./calllog.ts";

/** An answer read back off the phone channel — one tap. */
export interface PhoneAnswer {
  /** The correlation id the tap carried — must equal the live offer hash to bind. */
  id: string;
  /** "bless" or "dismiss". */
  action: string;
  /** Publish time (ms) — the cursor advances past it. */
  at: number;
}

/**
 * One card. Title, priority and tags make a gate look like a gate (R2).
 *
 * THE MESSAGE IS ONE LINE, AND THAT LINE IS THE LINK (owner ruling
 * 2026-07-25, and se-v2-design §11 before it: "ntfy carries the notification
 * (click URL = page + #key)", explicitly NOT "an editorially compressed
 * brief"). The hosted page is the reading surface; the card is the doorbell.
 * `click` makes tapping the notification body open that page directly.
 */
export interface CardMessage {
  message: string;
  actions: unknown;
  id: string;
  title: string;
  priority: number;
  tags: string[];
  /** Where tapping the notification itself goes (ntfy X-Click). */
  click?: string;
}

/** The outside-world boundary. Real impl talks ntfy; tests inject a mock. */
export interface Transport {
  publish(topic: string, msg: CardMessage): Promise<void>;
  pollSince(topic: string, since: number): Promise<PhoneAnswer[]>;
}

export interface PhoneConfig {
  enabled?: boolean;
  /** The ntfy base URL; defaults to the public service. */
  base?: string;
  topic?: string;
  answer_topic?: string;
  token?: string;
}

/** Machine-local, never committed, holds the secret (adr-phone-secret-machine-local). */
export function phoneConfigPath(root: string): string {
  return join(layout.seDir(root), "phone.json");
}

export function loadPhoneConfig(root: string): PhoneConfig | null {
  const path = phoneConfigPath(root);
  if (!existsSync(path)) return null;
  try {
    const cfg = readJsonFile<PhoneConfig>(path);
    if (cfg.enabled === false || !cfg.topic || !cfg.answer_topic) return null;
    return cfg;
  } catch {
    return null;
  }
}

/**
 * THE FIX (R1, se.adr-absolute-action-urls). An action URL must be something
 * a phone can open: absolute, http(s), built from the configured base and the
 * answer topic. v1's ask.go carries the same rule and names the trap in its
 * own comment — the topic stays BARE in the config and is absolutized HERE,
 * at the moment of sending, never stored pre-joined.
 */
export function answerUrl(base: string, topic: string): string {
  return `${base.replace(/\/+$/, "")}/${topic}`;
}

/** What an announcement did — named, so a degradation is never silent. */
export interface AnnounceResult {
  /** A card reached the transport. */
  announced: boolean;
  /** Whether the rich brief made it: published, degraded (tried and failed), or none (not configured). */
  brief: "published" | "degraded" | "none";
  brief_url?: string;
  error?: string;
}

/** ntfy drops actions past the third SILENTLY — an over-budget card loses the brief. */
const ACTION_BUDGET = 3;

/** A gate outranks an ordinary message on a lock screen (ntfy: 5 = max). */
const GATE_PRIORITY = 5;

export class PhoneLane {
  private root: string;
  private txFor: (cfg: PhoneConfig) => Transport;
  private log?: CallLog;
  /** Cursor: the publish time of the last answer we consumed. */
  private cursor = 0;
  /** Ids already applied — a redelivery is a no-op (req-phone-idempotent). */
  private applied = new Set<string>();

  // The transport is built PER ANNOUNCE from freshly-read config (R10): a
  // pairing restored after start must work without cycling the board.
  constructor(root: string, transportFor: (cfg: PhoneConfig) => Transport, log?: CallLog) {
    this.root = root;
    this.txFor = transportFor;
    this.log = log;
  }

  /** R12: an announcement is never silent, whatever happened to it. */
  private record(ok: boolean, detail: Record<string, unknown>): void {
    // args carry the topic and the outcome — NEVER the token (R11).
    this.log?.append({ tool: "se.phone.announce", args: { topic: detail.topic }, ok, duration_ms: 0, detail });
  }

  /**
   * Summon the owner for the live offer. Best-effort in one direction only:
   * the BRIEF may fail (the link is then simply absent), but the failure of
   * the summons itself is reported to the caller and recorded.
   */
  async announceOffer(opts: { store?: BriefStore | null } = {}): Promise<AnnounceResult> {
    const cfg = loadPhoneConfig(this.root);
    if (cfg === null) return { announced: false, brief: "none" }; // graceful-absent
    const offer = new Gate(this.root).current();
    if (offer === null) return { announced: false, brief: "none" };
    const tx = this.txFor(cfg);

    // Rung 1: the hosted DECISION PAGE - the board's decision card, encrypted,
    // carrying its own bless and dismiss. Allowed to fail; the ladder degrades
    // LOUDLY. The answer topic and the offer hash travel INSIDE the ciphertext,
    // so the host learns neither.
    const store = opts.store === undefined ? loadBriefStore(this.root) : opts.store;
    let briefUrl: string | null = null;
    let briefState: AnnounceResult["brief"] = "none";
    if (store !== null) {
      // R7: a brief never outlives the decision it serves.
      const remainingS = Math.ceil((offer.deadline - Date.now()) / 1000);
      const envelope = briefEnvelope(offer, answerUrl(cfg.base ?? "https://ntfy.sh", cfg.answer_topic!));
      briefUrl = await publishBrief(store, envelope, remainingS);
      briefState = briefUrl === null ? "degraded" : "published";
    }

    // Rung 2: the summons itself. Always attempted, whatever rung 1 did.
    //
    // THE CARD CARRIES NO CONTROLS when a brief exists (owner ruling
    // 2026-07-25): the page is the decision surface, the notification is the
    // doorbell. Buttons here would be a second, poorer place to decide - the
    // exact rubber-stamping this lane exists to prevent, since a card cannot
    // show what is being blessed.
    //
    // WITHOUT a brief there is nothing to open, so the card falls back to
    // carrying the two direct actions rather than summoning the owner to
    // nothing. That fallback is the ladder's floor, not the design.
    const answer = answerUrl(cfg.base ?? "https://ntfy.sh", cfg.answer_topic!);
    const actions: unknown[] =
      briefUrl !== null
        ? []
        : [
            { action: "http", label: "bless", method: "POST", url: answer, body: `bless ${offer.base_hash}` },
            { action: "http", label: "dismiss", method: "POST", url: answer, body: `dismiss ${offer.base_hash}` },
          ];

    // ONE LINE, and that line is the link. Never the brief's prose: deciding
    // from a truncated sentence is the rubber-stamping this whole lane exists
    // to prevent, and the full text is one tap away on the hosted page.
    // Without a store there is no link, so the line says exactly that rather
    // than silently falling back to a wall of text.
    const card: CardMessage = {
      message: briefUrl ?? `no brief link — ${briefState === "degraded" ? "the brief could not be published" : "no brief store configured"}`,
      actions: actions.slice(0, ACTION_BUDGET),
      id: offer.base_hash,
      title: `GATE ${offer.iteration} · ${offer.state}`,
      priority: GATE_PRIORITY,
      tags: ["bangbang"],
      // Tapping the notification body opens the page (se-v2-design §11:
      // "click URL = page + #key").
      ...(briefUrl !== null ? { click: briefUrl } : {}),
    };

    try {
      await tx.publish(cfg.topic!, card);
      this.record(true, { topic: cfg.topic, iteration: offer.iteration, state: offer.state, brief: briefState, hash: offer.base_hash });
      return { announced: true, brief: briefState, ...(briefUrl !== null ? { brief_url: briefUrl } : {}) };
    } catch (e) {
      const error = String((e as Error).message);
      // Q1: after any induced failure there is a card OR a recorded failure —
      // never neither. This is the branch that makes an unreachable owner
      // visible instead of leaving the agent parked in false confidence.
      this.record(false, { topic: cfg.topic, iteration: offer.iteration, state: offer.state, brief: briefState, error });
      return { announced: false, brief: briefState, error };
    }
  }

  /** Read new taps; a tap matching the live offer hash blesses or dismisses it. */
  async pollAnswers(): Promise<void> {
    const cfg = loadPhoneConfig(this.root);
    if (cfg === null) return; // graceful-absent: no watcher
    let answers: PhoneAnswer[];
    try {
      answers = await this.txFor(cfg).pollSince(cfg.answer_topic!, this.cursor);
    } catch (e) {
      this.log?.append({ tool: "se.phone.poll", args: { topic: cfg.answer_topic }, ok: false, duration_ms: 0, detail: { error: String((e as Error).message) } });
      return; // best-effort: a failed/stalled read never wedges the caller
    }
    for (const a of answers) {
      if (a.at > this.cursor) this.cursor = a.at;
      if (this.applied.has(a.id)) continue; // duplicate
      const gate = new Gate(this.root);
      const offer = gate.current();
      if (offer === null || offer.base_hash !== a.id) continue; // stale / mismatch
      if (a.action === "dismiss") {
        gate.dismiss();
        this.applied.add(a.id);
      } else if (a.action === "bless") {
        gate.bless(requireSystematic(this.root), a.id, { channel: "phone", adjudicated_by: "owner" });
        this.applied.add(a.id);
      }
    }
  }
}

/**
 * The real transport: ntfy over fetch. The card's title, priority, tags and
 * actions ride as headers (adr-ntfy-actions); the since-poll reads. Every
 * request is bounded by an abort timeout (sp1) so a stalled endpoint never
 * wedges the caller. The token lives only in the Authorization header, never
 * in a returned object.
 */
export class NtfyTransport implements Transport {
  private base: string;
  private token?: string;
  private timeoutMs: number;

  constructor(base: string, opts: { token?: string; timeoutMs?: number } = {}) {
    this.base = base.replace(/\/$/, "");
    this.token = opts.token;
    this.timeoutMs = opts.timeoutMs ?? 8000;
  }

  private headers(extra: Record<string, string> = {}): Record<string, string> {
    return { ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}), ...extra };
  }

  async publish(topic: string, msg: CardMessage): Promise<void> {
    const res = await fetch(`${this.base}/${encodeURIComponent(topic)}`, {
      method: "POST",
      headers: this.headers({
        "X-Actions": JSON.stringify(msg.actions),
        "X-Title": msg.title,
        "X-Priority": String(msg.priority),
        "X-Tags": msg.tags.join(","),
        // Tapping the notification body opens the brief (se-v2-design §11).
        ...(msg.click !== undefined ? { "X-Click": msg.click } : {}),
      }),
      body: msg.message,
      signal: AbortSignal.timeout(this.timeoutMs),
    });
    // WHITELIST (se.law-whitelist-guards): 2xx is the one accepted outcome.
    // A silently-swallowed 4xx is how a card goes missing with no symptom.
    if (!res.ok) throw new Error(`ntfy publish ${res.status}`);
  }

  async pollSince(topic: string, since: number): Promise<PhoneAnswer[]> {
    const sinceParam = since > 0 ? Math.floor(since / 1000) : "all";
    const res = await fetch(`${this.base}/${encodeURIComponent(topic)}/json?poll=1&since=${sinceParam}`, {
      headers: this.headers(),
      signal: AbortSignal.timeout(this.timeoutMs),
    });
    const text = await res.text();
    const out: PhoneAnswer[] = [];
    for (const line of text.split("\n")) {
      if (line.trim() === "") continue;
      try {
        const m = JSON.parse(line) as { message?: string; time?: number };
        const body = (m.message ?? "").trim();
        const sp = body.indexOf(" ");
        if (sp === -1) continue;
        out.push({ action: body.slice(0, sp), id: body.slice(sp + 1), at: (m.time ?? 0) * 1000 });
      } catch {
        continue;
      }
    }
    return out;
  }
}
