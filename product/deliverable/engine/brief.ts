// The hosted brief (i8d, E2): a gate's whole text AND ITS CONTROLS, encrypted,
// published to a store the owner's phone can open, and CONFIRMED SERVABLE
// before its link is ever announced. The host holds ciphertext; the key rides
// the URL fragment, which browsers never send to the server
// (se.adr-brief-encrypted-fragment-key).
//
// THE PAGE IS THE ADJUDICATION SURFACE, not a read-only brief (owner ruling
// 2026-07-25; se-v2-design §11 before it — "the SAME rich handover HTML
// (v1-style drill-down, bless controls) on desk and phone", and v1's dry run
// "answer POSTed to the fragment-derived topic"). The notification carries a
// link and nothing else. The blocker for this was closed a month before it was
// built: §16 records CORS on the ntfy fetch() as VERIFIED PASS 2026-07-21,
// "access-control-allow-origin: * on preflight, POST and subscribe — the phone
// bless path survives".
//
// WHAT RIDES WHERE, and why:
//   - the URL fragment carries the KEY only, never sent to any server;
//   - the ANSWER TOPIC and the OFFER HASH ride INSIDE the ciphertext, so the
//     host learns neither — putting them in the fragment would work but would
//     expose them to anything that reads the link's text;
//   - the store TOKEN rides nowhere near this page (R11 forbids a credential
//     in any brief), so the page publishes its answer anonymously.
//
// This element is ALLOWED TO FAIL. Every path returns rather than throws, so a
// store outage degrades the announcement instead of blocking the gate
// (se.adr-ladder-degrades-loudly).
//
// LAYOUT CONTRACT, proven at run-e8599b7b7d2a and stated once because getting
// it wrong fails silently in the browser while every server-side check passes:
//   payload = base64( iv[12] | tag[16] | ciphertext )
//   the key = base64url( 32 bytes ), fragment-only
// Node hands the GCM tag back separately; Web Crypto wants it APPENDED to the
// ciphertext. The opener rejoins as ct||tag. Both sides live in this file.
import { randomBytes, createCipheriv } from "node:crypto";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { readJsonFile } from "./jsonio.ts";
import { layout } from "./layout.ts";

export interface Sealed {
  payload: string;
  key: string;
}

/** Where a brief is published. Injectable: tests never touch a live store. */
export interface BriefStore {
  put(key: string, body: string, ttlS: number): Promise<void>;
  /** Does the published object actually serve yet? Stores are eventually consistent. */
  serves(key: string): Promise<boolean>;
  url(key: string): string;
}

export interface OfferLike {
  iteration: string;
  state: string;
  brief: string;
}

/**
 * What the page needs to BE the decision surface: the gate to read, where to
 * answer, and which offer the answer binds to. Sealed as one object, so all
 * three are ciphertext at the host.
 */
export interface BriefEnvelope {
  html: string;
  /** Absolute http(s) URL of the answer topic — the page POSTs here. */
  answer_url: string;
  /** The live offer's base hash: the correlation id a tap must name. */
  hash: string;
}

/**
 * A brief must not outlive its decision (R7). Six hours is the cap: long
 * enough for an owner who is away, short enough that briefs never accumulate
 * as a readable archive at a third party.
 */
export const MAX_BRIEF_TTL_S = 6 * 60 * 60;

/** The store's floor — most KV stores refuse a shorter expiry. */
const MIN_BRIEF_TTL_S = 60;

/** Bounded confirmation: measured read-after-write was ~1s (run-bfd564ff9add). */
const SERVE_TRIES = 12;
const SERVE_GAP_MS = 500;

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

export function seal(plaintext: string): Sealed {
  const key = randomBytes(32);
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", key, iv);
  const ct = Buffer.concat([c.update(plaintext, "utf8"), c.final()]);
  return {
    payload: Buffer.concat([iv, c.getAuthTag(), ct]).toString("base64"),
    key: key.toString("base64url"),
  };
}

/**
 * The OPENING side, run here through the same Web Crypto API the browser uses
 * — so the page's inline decryptor is testable without a browser. Throws on a
 * wrong key or a tampered payload: GCM authenticates, so a corrupted brief can
 * never render as a plausible one.
 */
export async function unseal(payload: string, key: string): Promise<string> {
  const raw = Uint8Array.from(Buffer.from(payload, "base64"));
  const iv = raw.slice(0, 12);
  const tag = raw.slice(12, 28);
  const ct = raw.slice(28);
  const joined = new Uint8Array(ct.length + tag.length);
  joined.set(ct, 0);
  joined.set(tag, ct.length);
  const ck = await globalThis.crypto.subtle.importKey("raw", Uint8Array.from(Buffer.from(key, "base64url")), "AES-GCM", false, ["decrypt"]);
  const pt = await globalThis.crypto.subtle.decrypt({ name: "AES-GCM", iv }, ck, joined);
  return new TextDecoder().decode(pt);
}

const esc = (s: string): string =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/**
 * THE BOARD'S DECISION CARD, rendered for a phone (owner ruling 2026-07-25:
 * "the same thing that is now shown in the decision panel"). Deliberately the
 * same structure as bin/se-board.ts's Decisions pane — "Gate: <iteration>",
 * the brief in a pre-formatted block, then the two controls — so the owner
 * decides against one artifact, not two lookalikes that could drift apart.
 *
 * The brief is escaped rather than trusted: it is ledger prose and may contain
 * markup. `pre` preserves the gate's own line structure, wrapped so a phone
 * never scrolls sideways.
 */
export function briefHtml(offer: OfferLike): string {
  return [`<b>Gate: ${esc(offer.iteration)}</b>`, `<pre>${esc(offer.brief)}</pre>`].join("\n");
}

/** The sealable plaintext: everything the page needs, nothing the host may see. */
export function briefEnvelope(offer: OfferLike & { base_hash: string }, answerUrl: string): string {
  const env: BriefEnvelope = { html: briefHtml(offer), answer_url: answerUrl, hash: offer.base_hash };
  return JSON.stringify(env);
}

// The inline opener, byte-equivalent to unseal above, plus the controls. Kept
// as a plain string so no template interpolation can creep into the browser's
// copy. The answer POST carries a text body and NO custom headers, which keeps
// it a CORS "simple request" — no preflight to fail.
const OPENER = [
  "const D=document.getElementById('c').textContent.trim();",
  "const $=(id)=>document.getElementById(id);",
  "(async()=>{const o=$('o');try{",
  "const k=location.hash.slice(1);",
  "if(!k){o.textContent='This link is missing its key. Open the original link, whole.';return;}",
  "const raw=Uint8Array.from(atob(D),ch=>ch.charCodeAt(0));",
  "const iv=raw.slice(0,12),tag=raw.slice(12,28),ct=raw.slice(28);",
  "const j=new Uint8Array(ct.length+tag.length);j.set(ct,0);j.set(tag,ct.length);",
  "const kb=Uint8Array.from(atob(k.replace(/-/g,'+').replace(/_/g,'/')),ch=>ch.charCodeAt(0));",
  "const ck=await crypto.subtle.importKey('raw',kb,'AES-GCM',false,['decrypt']);",
  "const pt=await crypto.subtle.decrypt({name:'AES-GCM',iv:iv},ck,j);",
  "const env=JSON.parse(new TextDecoder().decode(pt));",
  "o.innerHTML=env.html;",
  "$('act').style.display='flex';",
  "const send=async(what)=>{",
  "$('b').disabled=true;$('d').disabled=true;$('s').textContent='sending\\u2026';",
  "try{const r=await fetch(env.answer_url,{method:'POST',body:what+' '+env.hash});",
  "if(!r.ok)throw new Error('HTTP '+r.status);",
  "$('act').style.display='none';",
  "$('s').className='ok';",
  "$('s').textContent=(what==='bless'?'Blessed':'Dismissed')+'. You can close this page.';",
  "}catch(e){$('s').className='bad';",
  "$('s').textContent='Could not send \\u2014 '+e.message+'. Try again, or bless from the board.';",
  "$('b').disabled=false;$('d').disabled=false;}};",
  "$('b').onclick=()=>send('bless');$('d').onclick=()=>send('dismiss');",
  "}catch(e){o.textContent='Could not decrypt this brief. The link may be truncated or expired.';}})();",
].join("");

const STYLE = [
  "body{font:16px/1.5 system-ui,sans-serif;margin:0;padding:1.2em 1.2em 6em;color:#1e1e1e;background:#fafafa;-webkit-text-size-adjust:100%}",
  // Mirrors the board's decision card: bold gate line, the brief pre-formatted
  // and wrapped so a phone never scrolls sideways.
  "b{display:block;font-size:1.15em;margin-bottom:.6em}",
  "pre{white-space:pre-wrap;word-break:break-word;font:13px/1.5 ui-monospace,monospace;background:#fff;border:1px solid #d0d0d0;border-radius:6px;padding:.7em;margin:0}",
  // The controls sit fixed at the bottom: a long brief must never hide them.
  "#act{position:fixed;left:0;right:0;bottom:0;display:none;gap:.6em;padding:.8em;background:#fff;border-top:1px solid #d0d0d0}",
  "#act button{flex:1;padding:1em;font-size:1.05em;border:1px solid #d0d0d0;border-radius:8px;background:#fff;cursor:pointer}",
  "#act button#b{background:#2e7d32;border-color:#2e7d32;color:#fff;font-weight:600}",
  "#act button:disabled{opacity:.5}",
  "#s{position:fixed;left:0;right:0;bottom:0;padding:1em;text-align:center;background:#fff;border-top:1px solid #d0d0d0}",
  "#s:empty{display:none}",
  "#s.ok{color:#2e7d32}#s.bad{color:#c62828}",
  "@media(prefers-color-scheme:dark){body{background:#161616;color:#e8e8e8}",
  "pre{background:#1e1e1e;border-color:#3a3a3a}",
  "#act,#s{background:#222;border-color:#3a3a3a}#act button{background:#2a2a2a;border-color:#3a3a3a;color:#e8e8e8}}",
].join("");

/**
 * One self-contained page: its ciphertext, its decryptor, its controls.
 * Nothing is fetched to render it; the only network call it ever makes is the
 * owner's own answer.
 */
export function briefPage(payload: string): string {
  return [
    "<!doctype html>",
    '<html lang="en"><head><meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width,initial-scale=1">',
    "<title>se brief</title>",
    `<style>${STYLE}</style></head><body>`,
    '<div id="o">decrypting…</div>',
    '<div id="act"><button id="b">bless as offered</button><button id="d">dismiss</button></div>',
    '<div id="s"></div>',
    `<script type="text/plain" id="c">${payload}</script>`,
    `<script>${OPENER}</script>`,
    "</body></html>",
  ].join("");
}

/**
 * Seal, publish, and CONFIRM IT SERVES before handing back a link (R6): an
 * announced 404 is worse than no link at all. Returns the openable URL with
 * the key in its fragment, or null — never throws, because this whole path is
 * allowed to fail (R8).
 */
export async function publishBrief(store: BriefStore, plaintext: string, ttlS: number): Promise<string | null> {
  try {
    const { payload, key } = seal(plaintext);
    const id = randomBytes(9).toString("hex");
    const ttl = Math.max(MIN_BRIEF_TTL_S, Math.min(MAX_BRIEF_TTL_S, Math.floor(ttlS)));
    await store.put(id, briefPage(payload), ttl);
    for (let i = 0; i < SERVE_TRIES; i++) {
      if (await store.serves(id)) return `${store.url(id)}#${key}`;
      await sleep(SERVE_GAP_MS);
    }
    return null; // published but never served: do not announce a dead link
  } catch {
    return null; // degrade, never block the summons
  }
}

/** Cloudflare Workers KV, the transport verified live at run-bfd564ff9add. */
export interface KvConfig {
  account: string;
  namespace: string;
  token: string;
  /** The worker serving the namespace, e.g. https://se-brief.<name>.workers.dev */
  serve: string;
}

export class KvBriefStore implements BriefStore {
  private cfg: KvConfig;
  private timeoutMs: number;

  constructor(cfg: KvConfig, opts: { timeoutMs?: number } = {}) {
    this.cfg = { ...cfg, serve: cfg.serve.replace(/\/+$/, "") };
    this.timeoutMs = opts.timeoutMs ?? 10000;
  }

  async put(key: string, body: string, ttlS: number): Promise<void> {
    const url =
      `https://api.cloudflare.com/client/v4/accounts/${this.cfg.account}` +
      `/storage/kv/namespaces/${this.cfg.namespace}/values/${encodeURIComponent(key)}?expiration_ttl=${ttlS}`;
    const res = await fetch(url, {
      method: "PUT",
      // The token lives in this header and nowhere else — never in a returned
      // object, never in a logged arg, never in the page (R11).
      headers: { Authorization: `Bearer ${this.cfg.token}`, "Content-Type": "text/plain" },
      body,
      signal: AbortSignal.timeout(this.timeoutMs),
    });
    if (!res.ok) throw new Error(`kv put ${res.status}`);
  }

  async serves(key: string): Promise<boolean> {
    try {
      const res = await fetch(this.url(key), { signal: AbortSignal.timeout(this.timeoutMs) });
      // WHITELIST (se.law-whitelist-guards): the one accepted state is 200
      // with an HTML content type — anything else is not servable, whatever
      // it is. A page served as text/plain downloads instead of rendering.
      return res.status === 200 && (res.headers.get("content-type") ?? "").includes("text/html");
    } catch {
      return false;
    }
  }

  url(key: string): string {
    return `${this.cfg.serve}/${key}`;
  }
}

/**
 * The store is opt-in and machine-local, beside the pairing it serves
 * (se.adr-phone-secret-machine-local). Absent or incomplete config means no
 * store — the lane then runs at the link-less rung, which is a legal rung.
 */
export function loadBriefStore(root: string): BriefStore | null {
  const path = join(layout.seDir(root), "brief.json");
  if (!existsSync(path)) return null;
  try {
    const cfg = readJsonFile<Partial<KvConfig> & { enabled?: boolean }>(path);
    if (cfg.enabled === false) return null;
    // WHITELIST: all four fields present and well-formed, or no store at all.
    if (typeof cfg.account !== "string" || cfg.account === "") return null;
    if (typeof cfg.namespace !== "string" || cfg.namespace === "") return null;
    if (typeof cfg.token !== "string" || cfg.token === "") return null;
    if (typeof cfg.serve !== "string" || !/^https?:\/\//.test(cfg.serve)) return null;
    return new KvBriefStore({ account: cfg.account, namespace: cfg.namespace, token: cfg.token, serve: cfg.serve });
  } catch {
    return null;
  }
}
