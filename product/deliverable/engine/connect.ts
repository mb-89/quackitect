// i8c phone-connect: pair a phone in one gesture. connectPhone generates a
// fresh ntfy topic pair, encodes the topic's ntfy:// DEEP LINK as a QR LOCALLY,
// and writes the machine-local phone.json the i8 lane reads. The topic IS the
// credential (ntfy has no accounts): the deep link is shown on screen to be
// scanned, never sent over the network. The QR is built BEFORE phone.json is
// written, so a failed encode leaves no partial config - pairing is all-or-nothing.
//
// The QR encodes ntfy's OWN deep-link scheme - `ntfy://<host>/<topic>` - NOT an
// https URL and NOT JSON. ntfy documents that https deep-linking on Android is
// "brittle and limited", so scanning ntfy://... opens the ntfy APP directly and
// subscribes; an https link only opens the browser. The bless/dismiss answer
// routing is NOT in the QR - it rides inside each offer notification's action
// buttons (the i8 lane), so the phone only needs the subscribe topic to pair.
// Ref: https://docs.ntfy.sh/subscribe/phone/ (deep links).
import { randomBytes } from "node:crypto";
import { writeFileSync, renameSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { encodeQR } from "./vendor/qrcode.ts";
import { phoneConfigPath, loadPhoneConfig, type PhoneConfig } from "./phone.ts";

// One source of truth for the config path: the i8 lane owns it, connect writes it.
export { phoneConfigPath };

/** ntfy's public service - the lane's default base (adr in i8). */
const NTFY_BASE = "https://ntfy.sh";

export interface ConnectResult {
  /** The QR module matrix to render (true = a dark module). */
  qr: boolean[][];
  /** The generated subscribe topic (also written to phone.json). */
  topic: string;
}

export interface ConnectOptions {
  /** Injectable encoder (defaults to the vendored QR encoder); the encode-failure test drives it. */
  encode?: (text: string) => boolean[][];
}

/** A high-entropy ntfy topic segment - the topic is the only credential, so entropy is the guard. */
function freshTopic(prefix: string): string {
  return prefix + randomBytes(16).toString("hex");
}

/** ntfy's deep link: scanning it opens the ntfy APP and subscribes (https opens only the browser). */
function deepLink(base: string, topic: string): string {
  const host = base.replace(/^https?:\/\//, "").replace(/\/+$/, "");
  return `ntfy://${host}/${topic}`;
}

/**
 * Pair a phone: mint a topic pair, encode its ntfy:// deep link locally as a QR,
 * and enable the lane by writing phone.json. Returns the QR matrix and topic.
 */
export function connectPhone(root: string, opts: ConnectOptions = {}): ConnectResult {
  const encode = opts.encode ?? encodeQR;
  const topic = freshTopic("se-");
  const answer_topic = freshTopic("se-ans-");
  const base = NTFY_BASE;

  // Encode FIRST. A failure here must leave the disk untouched (R5: atomic).
  const qr = encode(deepLink(base, topic));

  const cfg: PhoneConfig = { enabled: true, base, topic, answer_topic };
  const path = phoneConfigPath(root);
  mkdirSync(dirname(path), { recursive: true });
  // Temp-then-rename: a concurrent reader never sees a half-written config.
  const tmp = `${path}.${randomBytes(4).toString("hex")}.tmp`;
  writeFileSync(tmp, JSON.stringify(cfg, null, 2), "utf8");
  renameSync(tmp, path);

  return { qr, topic };
}

export interface PairingQR extends ConnectResult {
  /** true when this call minted a new pairing; false when it re-rendered the existing one. */
  created: boolean;
}

/**
 * The board-facing entry: show a QR for the phone pairing. If a valid pairing
 * already exists, re-render ITS topic (re-clicking must not silently re-pair
 * and invalidate a phone already linked); otherwise mint a fresh pairing.
 */
export function phonePairingQR(root: string, opts: ConnectOptions = {}): PairingQR {
  const existing = loadPhoneConfig(root);
  if (existing !== null && existing.topic && existing.answer_topic) {
    const encode = opts.encode ?? encodeQR;
    const qr = encode(deepLink(existing.base ?? NTFY_BASE, existing.topic));
    return { qr, topic: existing.topic, created: false };
  }
  return { ...connectPhone(root, opts), created: true };
}
