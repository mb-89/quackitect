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
import { noteOf } from "./notes.ts";
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

// Function words carry no search intent and are common enough to coincide
// with unrelated prose across a corpus this size — left in, "nothing" alone
// would false-match any nonsense query against se_file_read's own
// description ("nothing is ever silently truncated").
const STOPWORDS = new Set([
  "a",
  "an",
  "the",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "to",
  "of",
  "in",
  "on",
  "at",
  "by",
  "for",
  "with",
  "from",
  "as",
  "and",
  "or",
  "but",
  "nor",
  "so",
  "if",
  "then",
  "than",
  "this",
  "that",
  "these",
  "those",
  "it",
  "its",
  "not",
  "no",
  "do",
  "does",
  "did",
  "have",
  "has",
  "had",
  "what",
  "which",
  "who",
  "whom",
  "when",
  "where",
  "why",
  "how",
]);

function words(s: string): string[] {
  return (s.toLowerCase().match(/[a-z0-9]+/g) ?? []).filter((w) => !STOPWORDS.has(w));
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

// A word living in the tool's OWN NAME/title, or the guidance doc's OWN
// PATH, is a far stronger relevance signal than the same word turning up
// somewhere in the body prose — weighted so "drain a stray note" ranks
// se_note_drain (drain+note in its own name) over se_note (note only,
// drain absent, tied by body prose alone) on merit, not an alphabetical
// coin-flip.
const IDENTITY_WEIGHT = 3;

// A word or two shared with a huge corpus by accident is noise, not a
// match — require most of the query's distinct words to turn up (identity
// or body, either counts once), scaled to the query's own length rather
// than a flat count. A flat floor of 2 let se_help's own description (it
// talks about "matches" and a miss scoring "nothing") false-hit a
// five-word nonsense query on two coincidental words; 60% asks for three
// of five there while still asking for only two of three on a short,
// real query ("drain a stray note" only ever lands two of its three
// content words on any single candidate).
function minMatches(queryWords: string[]): number {
  return Math.max(1, Math.ceil(queryWords.length * 0.6));
}

function distinctMatches(queryWords: string[], identity: string, body: string): number {
  const idHay = new Set(words(identity));
  const bodyHay = new Set(words(body));
  let n = 0;
  for (const w of queryWords) if (idHay.has(w) || bodyHay.has(w)) n += 1;
  return n;
}

function guidanceStatement(root: string, path: string): string {
  const note = noteOf(join(root, path));
  if (note === undefined) return "";
  const fmStatement = note.frontmatter.statement;
  return typeof fmStatement === "string" && fmStatement.trim() !== "" ? fmStatement : note.statement;
}

/** Search tools and guidance for `query`. `tools` is the LIVE registered
 *  set — passed in rather than imported, because the full catalog (session
 *  tools, expedition tools, core tools) only exists once buildServer has
 *  assembled it. A miss is recorded before this returns. */
export function searchHelp(root: string, query: string, tools: ToolDef[]): HelpResult {
  const qWords = words(query);
  const floor = minMatches(qWords);
  const matches: HelpMatch[] = [];
  for (const t of tools) {
    const identity = `${t.name} ${t.title}`;
    if (distinctMatches(qWords, identity, t.description) < floor) continue;
    const score = overlapScore(qWords, identity) * IDENTITY_WEIGHT + overlapScore(qWords, t.description);
    matches.push({ kind: "tool", name: t.name, score, snippet: headline(t.description, SNIPPET_CAP) });
  }
  for (const d of scanGuidance(root)) {
    const statement = guidanceStatement(root, d.path);
    if (distinctMatches(qWords, d.path, statement) < floor) continue;
    const score = overlapScore(qWords, d.path) * IDENTITY_WEIGHT + overlapScore(qWords, statement);
    matches.push({ kind: "guidance", name: d.path, score, snippet: headline(statement, SNIPPET_CAP) });
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
