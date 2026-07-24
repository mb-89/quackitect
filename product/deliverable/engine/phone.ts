// The phone lane (i8, E1-E4): a gate offer reaches the owner's phone as a
// one-tap action, and the tap returns a hash-bound, channel-stamped grant.
// The whole lane is opt-in (seDir/phone.json) and silent without it; it
// speaks the outside world only through an injectable Transport, so tests
// use a mock and no build ever touches a live topic.
//
// Authenticity = possession of the correlation id (adr-answer-authenticity,
// owner-ruled accepted risk): the offer's own hash is that id, so a tap
// binds only when it names the live offer.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { readJsonFile } from "./jsonio.ts";
import { layout } from "./layout.ts";
import { Gate } from "./gate.ts";
import { requireSystematic } from "./machines/load.ts";
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

/** The outside-world boundary. Real impl talks ntfy; tests inject a mock. */
export interface Transport {
  publish(topic: string, msg: { message: string; actions: unknown; id: string }): Promise<void>;
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

export class PhoneLane {
  private root: string;
  private tx: Transport;
  private log?: CallLog;
  /** Cursor: the publish time of the last answer we consumed. */
  private cursor = 0;
  /** Ids already applied — a redelivery is a no-op (req-phone-idempotent). */
  private applied = new Set<string>();

  constructor(root: string, transport: Transport, log?: CallLog) {
    this.root = root;
    this.tx = transport;
    this.log = log;
  }

  /** Publish the live offer to the phone, if the lane is configured. Best-effort. */
  async announceOffer(): Promise<void> {
    const cfg = loadPhoneConfig(this.root);
    if (cfg === null) return; // graceful-absent
    const offer = new Gate(this.root).current();
    if (offer === null) return;
    const actions = [
      { action: "http", label: "bless", method: "PUT", url: `answer:${cfg.answer_topic}`, body: `bless ${offer.base_hash}` },
      { action: "http", label: "dismiss", method: "PUT", url: `answer:${cfg.answer_topic}`, body: `dismiss ${offer.base_hash}` },
    ];
    try {
      await this.tx.publish(cfg.topic!, {
        message: (offer.brief ?? offer.state).slice(0, 400),
        actions,
        id: offer.base_hash,
      });
    } catch (e) {
      // Notification must never block adjudication (req-phone-best-effort).
      this.log?.append({ tool: "se.phone.publish", args: { topic: cfg.topic }, ok: false, duration_ms: 0, detail: { error: String((e as Error).message) } });
    }
  }

  /** Read new taps; a tap matching the live offer hash blesses or dismisses it. */
  async pollAnswers(): Promise<void> {
    const cfg = loadPhoneConfig(this.root);
    if (cfg === null) return; // graceful-absent: no watcher
    let answers: PhoneAnswer[];
    try {
      answers = await this.tx.pollSince(cfg.answer_topic!, this.cursor);
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
 * The real transport: ntfy over fetch. PUT publishes with X-Actions
 * (adr-ntfy-actions); the since-poll reads. Every request is bounded by an
 * abort timeout (sp1) so a stalled endpoint never wedges the board tick. The
 * token lives only in the Authorization header, never in a returned object.
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

  async publish(topic: string, msg: { message: string; actions: unknown; id: string }): Promise<void> {
    const actions = JSON.stringify(msg.actions);
    await fetch(`${this.base}/${encodeURIComponent(topic)}`, {
      method: "POST",
      headers: this.headers({ "X-Actions": actions, "X-Tags": msg.id }),
      body: msg.message,
      signal: AbortSignal.timeout(this.timeoutMs),
    });
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
