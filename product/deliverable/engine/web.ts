// The web lane — WebFetch/WebSearch replacements.
// Fetch is dependency-free. Search needs a provider key (owner config):
// set SE_BRAVE_API_KEY to enable; without it the tool exists and refuses
// with the setup instruction — an honest gap beats a fake result.
import { CLAUSES, Rejection } from "./errors.ts";

const FETCH_CAP = 40_000;

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
  const res = await fetch(u, { redirect: "follow", headers: { "user-agent": "quackitect-v3-se", accept: "text/html,text/plain,application/json;q=0.9,*/*;q=0.5" }, signal: AbortSignal.timeout(30_000) });
  const type = res.headers.get("content-type") ?? "";
  const body = await res.text();
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
      remedy: { tool: "se_web_fetch", args: { url: "<a specific url>" }, note: "fetch works without a key — or ask the owner to configure search" },
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
