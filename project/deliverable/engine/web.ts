// The web lane — WebFetch/WebSearch replacements.
// Fetch is dependency-free. Search needs a provider key (owner config):
// set SE_BRAVE_API_KEY to enable; without it the tool exists and refuses
// with the setup instruction — an honest gap beats a fake result.
import { CLAUSES, Rejection } from "./errors.ts";

const FETCH_CAP = 40_000;

/** How much body is read at all. The CAP trims what comes BACK; this bounds
 *  what is ever decoded, which is the half that actually overflowed a host. */
const BODY_CAP = 2_000_000;

/** Content this lane can honestly turn into text. Anything else is refused
 *  by NAME rather than decoded into mojibake and truncated to look fine. */
const READABLE = [
  "text/",
  "application/json",
  "application/xml",
  "application/xhtml",
  "+json",
  "+xml",
  "application/javascript",
  "application/ecmascript",
];

export interface FetchResult {
  url: string;
  status: number;
  content_type: string;
  /** Text content; HTML is reduced to readable text. */
  text: string;
  total_chars: number;
  range?: { offset: number };
  truncated: boolean;
}

export async function webFetch(url: string, opts: { offset?: number } = {}): Promise<FetchResult> {
  const u = new URL(url); // throws on garbage — surfaces as errored, fine
  if (u.protocol !== "http:" && u.protocol !== "https:") {
    throw new Rejection({
      clause: CLAUSES.PATH_ESCAPE,
      expected: "an http(s) URL",
      got: u.protocol,
      remedy: { tool: "se_web_fetch", args: { url: "https://…" } },
      source: "engine/web.ts",
    });
  }
  const res = await fetch(u, {
    redirect: "follow",
    headers: { "user-agent": "se-web-fetch", accept: "text/html,text/plain,application/json;q=0.9,*/*;q=0.5" },
    signal: AbortSignal.timeout(30_000),
  });
  const type = res.headers.get("content-type") ?? "";

  // A PDF IS NOT TEXT, AND PRETENDING OTHERWISE IS WHERE THIS BROKE. res.text()
  // decodes any body as UTF-8, so a binary document became megabytes of
  // mojibake — and the cap below only trimmed what came BACK, long after the
  // whole thing had been decoded into memory. The host fell over before the
  // truncation could help.
  const readable = type === "" || READABLE.some((t) => type.includes(t));
  if (!readable) {
    throw new Rejection({
      clause: CLAUSES.OVERSIZE_READ,
      expected: "a text response this lane can read: html, plain text, json or xml",
      got: `${type} — a binary document, which would decode into mojibake rather than fail honestly`,
      remedy: {
        tool: "se_run",
        args: { command: `# download it and convert it locally, then read the result` },
        note: "the lane has no document converter, so a binary is refused rather than mangled",
      },
      source: "engine/web.ts",
    });
  }

  // Bound what is DECODED, not just what is returned. A server may send no
  // content-length at all, so the body is read incrementally and stopped.
  const declared = Number(res.headers.get("content-length") ?? "0");
  if (declared > BODY_CAP) {
    throw new Rejection({
      clause: CLAUSES.OVERSIZE_READ,
      expected: `a body under ${BODY_CAP} bytes — this one declares ${declared}`,
      got: url,
      remedy: { tool: "se_run", args: { command: `# fetch it with a tool that can stream, then read the part you want` } },
      source: "engine/web.ts",
    });
  }
  const body = await readCapped(res);
  const text = type.includes("html") ? htmlToText(body) : body;
  const offset = Math.max(0, opts.offset ?? 0);
  const slice = text.slice(offset, offset + FETCH_CAP);
  return {
    url,
    status: res.status,
    content_type: type,
    text: slice,
    total_chars: text.length,
    ...(offset > 0 ? { range: { offset } } : {}),
    truncated: offset + FETCH_CAP < text.length,
  };
}

/** Read at most BODY_CAP bytes, whatever the server claims. A missing or
 *  lying content-length is the ordinary case, not the exotic one. */
async function readCapped(res: Response): Promise<string> {
  if (res.body === null) return "";
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let out = "";
  let seen = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    seen += value.byteLength;
    out += decoder.decode(value, { stream: true });
    if (seen >= BODY_CAP) {
      await reader.cancel();
      break;
    }
  }
  return out + decoder.decode();
}

/** Crude but honest HTML→text: scripts/styles dropped, tags stripped, entities decoded, whitespace collapsed. */
export function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(br|\/p|\/div|\/h[1-6]|\/li|\/tr)[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n\s*\n+/g, "\n\n")
    .trim();
}

export interface SearchHit {
  title: string;
  url: string;
  snippet: string;
}

export async function webSearch(query: string, count = 8): Promise<{ query: string; hits: SearchHit[] }> {
  const key = process.env.SE_BRAVE_API_KEY;
  if (key === undefined || key === "") {
    throw new Rejection({
      clause: CLAUSES.NOT_CONFIGURED,
      expected: "SE_BRAVE_API_KEY in the server's environment (free tier: https://brave.com/search/api/)",
      got: "no search provider configured",
      remedy: {
        tool: "se_web_fetch",
        args: { url: "<a specific url>" },
        note: "fetch works without a key — or ask the owner to configure search",
      },
      source: "engine/web.ts",
    });
  }
  const res = await fetch(`https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=${count}`, {
    headers: { "x-subscription-token": key, accept: "application/json" },
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) throw new Error(`search provider: HTTP ${res.status}`);
  const data = (await res.json()) as { web?: { results?: { title: string; url: string; description?: string }[] } };
  return {
    query,
    hits: (data.web?.results ?? []).map((r) => ({ title: r.title, url: r.url, snippet: r.description ?? "" })),
  };
}
