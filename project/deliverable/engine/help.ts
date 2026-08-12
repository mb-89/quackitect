// se_help — a keyword search over the lane's tools and guidance. Every MISS
// is appended to a durable demand log (.se/help-demand.jsonl), so a retro
// reads a RANKED list of what agents kept failing to find instead of
// hand-mining the shell command history (guidance/method/retro.md step 8).
//
// Requirements: req-help-searches-tools-and-guidance, req-help-miss-is-logged,
// req-help-demand-ranked, req-help-query-logged-with-result (the last one is
// satisfied by construction — se_help is dispatched through the same call
// path as every other lane tool, so it is logged without any code here).
import { appendFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { headline } from "./inbox.ts";
import { stripBom } from "./jsonio.ts";
import type { ToolDef } from "./mcp.ts";
import { parseStateNote } from "./notes.ts";
import { scanGuidance } from "./pull.ts";

export interface HelpMatch {
  kind: "tool" | "guidance";
  /** The tool's wire name, or the guidance doc's root-relative path. */
  name: string;
  score: number;
  snippet: string;
}

export interface HelpResult {
  query: string;
  matches: HelpMatch[];
  miss: boolean;
}

const SNIPPET_CAP = 160;
const MAX_MATCHES = 10;

function words(s: string): string[] {
  return s.toLowerCase().match(/[a-z0-9]+/g) ?? [];
}

/** How many of the query's words appear in the haystack — the whole scoring
 *  rule. Simple on purpose: record.md's own vision says the search half is
 *  the weaker half, so it earns no more machinery than the miss log needs
 *  to have something to log against. */
function overlapScore(queryWords: string[], haystack: string): number {
  const hay = new Set(words(haystack));
  let score = 0;
  for (const w of queryWords) if (hay.has(w)) score += 1;
  return score;
}

function guidanceStatement(root: string, path: string): string {
  const raw = readFileSync(join(root, path), "utf8");
  const note = parseStateNote(raw);
  const fmStatement = note.frontmatter.statement;
  return typeof fmStatement === "string" && fmStatement.trim() !== "" ? fmStatement : note.statement;
}

/** Search tools and guidance for `query`. `tools` is the LIVE registered
 *  set — passed in rather than imported, because the full catalog (session
 *  tools, expedition tools, core tools) only exists once buildServer has
 *  assembled it. A miss is recorded before this returns. */
export function searchHelp(root: string, query: string, tools: ToolDef[]): HelpResult {
  const qWords = words(query);
  const matches: HelpMatch[] = [];
  for (const t of tools) {
    const score = overlapScore(qWords, `${t.name} ${t.title} ${t.description}`);
    if (score > 0) matches.push({ kind: "tool", name: t.name, score, snippet: headline(t.description, SNIPPET_CAP) });
  }
  for (const d of scanGuidance(root)) {
    const statement = guidanceStatement(root, d.path);
    const score = overlapScore(qWords, `${d.path} ${statement}`);
    if (score > 0) matches.push({ kind: "guidance", name: d.path, score, snippet: headline(statement, SNIPPET_CAP) });
  }
  matches.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
  const top = matches.slice(0, MAX_MATCHES);
  const miss = top.length === 0;
  if (miss) recordMiss(root, query);
  return { query, matches: top, miss };
}

function demandPath(root: string): string {
  return join(root, ".se", "help-demand.jsonl");
}

interface DemandRecord {
  query: string;
  at: string;
}

function recordMiss(root: string, query: string): void {
  const p = demandPath(root);
  mkdirSync(dirname(p), { recursive: true });
  appendFileSync(p, `${JSON.stringify({ query, at: new Date().toISOString() } satisfies DemandRecord)}\n`, "utf8");
}

/** Two misses asking the same thing in different words are one demand. The
 *  shape is the query's own words, lowercased and sorted — cheap, and good
 *  enough that "log risks" and "risks log" rank together. */
function demandShape(query: string): string {
  return words(query).sort().join(" ");
}

function readDemand(root: string): DemandRecord[] {
  const p = demandPath(root);
  if (!existsSync(p)) return [];
  const out: DemandRecord[] = [];
  for (const line of stripBom(readFileSync(p, "utf8")).split("\n")) {
    if (line.trim() === "") continue;
    try {
      out.push(JSON.parse(line) as DemandRecord);
    } catch {
      // a torn line from a concurrent write — skip it, never crash the rank
    }
  }
  return out;
}

export interface DemandRank {
  shape: string;
  count: number;
  /** Up to three of the actual queries that made this shape, most recent first. */
  examples: string[];
}

/** The ranked missing-tool demand: every miss, grouped by shape, most
 *  demanded first. This is what a retro reads instead of hand-mining the
 *  shell log (req-help-demand-ranked). */
export function rankDemand(root: string, limit = 20): DemandRank[] {
  const byShape = new Map<string, DemandRecord[]>();
  for (const r of readDemand(root)) {
    const shape = demandShape(r.query);
    const arr = byShape.get(shape) ?? [];
    arr.push(r);
    byShape.set(shape, arr);
  }
  return [...byShape.entries()]
    .map(([shape, recs]) => ({
      shape,
      count: recs.length,
      examples: recs
        .slice(-3)
        .reverse()
        .map((r) => r.query),
    }))
    .sort((a, b) => b.count - a.count || a.shape.localeCompare(b.shape))
    .slice(0, limit);
}
