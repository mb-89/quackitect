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
import { bm25, docFrequency, tokenize } from "./bm25.ts";
import { headline } from "./inbox.ts";
import { stripBom } from "./jsonio.ts";
import type { ToolDef } from "./mcp.ts";
import { noteOf } from "./notes.ts";
import { scanGuidance } from "./pull.ts";

export interface HelpMatch {
  kind: "tool" | "guidance";
  /** The tool's wire name, or the guidance doc's root-relative path. A page
   *  answering under one of its own headings carries that heading too, as
   *  `path § heading`. */
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

// A WORD IN THE TOOL'S OWN NAME, or in the page's own path and heading, is a
// far stronger signal than the same word somewhere in the prose.
//
// TWO FIELDS, RANKED SEPARATELY, THEN ADDED. Putting the identity words into
// the body several times was the first attempt and it does not work: the
// ranker measures a document against the average LENGTH, so a name match
// inside a long description is diluted by the description.
//
// MEASURED ON "drain a stray note". Folded together, se_note_drain — whose own
// name carries two of the three query words — came THIRD, behind se_note and a
// guidance section. Scored apart, its identity is three tokens long and two of
// them match, which is exactly the signal that should win.
const IDENTITY_WEIGHT = 3;

// HOW MUCH OF THE QUERY AN ANSWER MUST ACTUALLY COVER. Ranking says which
// answer is best; it never says whether the best one is any good. A nonsense
// query still ranks something, because a couple of its words coincide with a
// corpus this size somewhere.
const MIN_COVERAGE = 0.6;

// AND ONE OF THE COVERED WORDS MUST BE UNCOMMON. Coverage alone is fooled by
// a query built from words that are everywhere: "totally different unmatched
// gibberish query" covers on "different" and "query" and means nothing. A term
// living in more than a quarter of the corpus is not evidence of anything.
const COMMON_TERM_SHARE = 0.25;

/** A page split at its own headings, so an answer can point at a section.
 *
 *  WHY SECTIONS AND NOT PAGES. The refusals page carries every clause the lane
 *  can throw, under one heading each. Unsectioned, a question about one clause
 *  answers "guidance/refusals.md" and leaves the reader to find it. */
function sections(path: string, body: string): { id: string; title: string; text: string }[] {
  const lines = body.split(/\r?\n/);
  const out: { id: string; title: string; text: string }[] = [];
  let title = "";
  let buf: string[] = [];
  const flush = (): void => {
    const text = buf.join("\n").trim();
    if (text === "" && title === "") return;
    out.push({ id: title === "" ? path : `${path} § ${title}`, title, text });
  };
  for (const line of lines) {
    const h = /^#{2,4}\s+(.*\S)\s*$/.exec(line);
    if (h === null) {
      buf.push(line);
      continue;
    }
    flush();
    title = h[1];
    buf = [];
  }
  flush();
  return out;
}

/** THE PAGE, THROUGH THE DOOR EVERY OTHER READER USES. Its own `statement:`
 *  wins over the derived one, and the body comes back from the same parse — a
 *  second readFileSync here would pay for a file the pass is already holding. */
function guidancePage(root: string, path: string): { statement: string; body: string } {
  const note = noteOf(join(root, path));
  if (note === undefined) return { statement: "", body: "" };
  const fm = note.frontmatter.statement;
  const statement = typeof fm === "string" && fm.trim() !== "" ? fm : note.statement;
  return { statement, body: note.body };
}

interface Candidate {
  kind: "tool" | "guidance";
  name: string;
  identity: string;
  body: string;
  snippet: string;
}

function guidanceCandidates(root: string): Candidate[] {
  const out: Candidate[] = [];
  for (const d of scanGuidance(root)) {
    const { statement, body } = guidancePage(root, d.path);
    for (const s of sections(d.path, body)) {
      if (s.text === "") continue;
      out.push({
        kind: "guidance",
        name: s.id,
        identity: `${d.path} ${s.title}`,
        body: `${statement} ${s.text}`,
        snippet: headline(s.text, SNIPPET_CAP),
      });
    }
  }
  return out;
}

/** Search tools and guidance for `query`. `tools` is the LIVE registered
 *  set — passed in rather than imported, because the full catalog (session
 *  tools, expedition tools, core tools) only exists once buildServer has
 *  assembled it. A miss is recorded before this returns. */
export function searchHelp(root: string, query: string, tools: ToolDef[]): HelpResult {
  const q = tokenize(query);
  const candidates: Candidate[] = [
    ...tools.map((t) => ({
      kind: "tool" as const,
      name: t.name,
      identity: `${t.name} ${t.title}`,
      body: t.description,
      snippet: headline(t.description, SNIPPET_CAP),
    })),
    ...guidanceCandidates(root),
  ];
  const idDocs = candidates.map((c) => ({ id: c.name, terms: tokenize(c.identity) }));
  const bodyDocs = candidates.map((c) => ({ id: c.name, terms: tokenize(c.body) }));

  const total = new Map<string, number>();
  for (const r of bm25(q, idDocs, 0)) total.set(r.id, r.score * IDENTITY_WEIGHT);
  for (const r of bm25(q, bodyDocs, 0)) total.set(r.id, (total.get(r.id) ?? 0) + r.score);

  const distinct = [...new Set(q)];
  const df = docFrequency(distinct, bodyDocs);
  const common = Math.max(1, Math.floor(candidates.length * COMMON_TERM_SHARE));
  const needed = Math.max(1, Math.ceil(distinct.length * MIN_COVERAGE));
  const seen = new Map(candidates.map((c, i) => [c.name, new Set([...idDocs[i].terms, ...bodyDocs[i].terms])]));

  const matches: HelpMatch[] = [];
  for (const c of [...candidates].sort((a, b) => (total.get(b.name) ?? 0) - (total.get(a.name) ?? 0))) {
    const score = total.get(c.name) ?? 0;
    if (score <= 0) break;
    const has = seen.get(c.name);
    if (has === undefined) continue;
    const covered = distinct.filter((w) => has.has(w));
    if (covered.length < needed) continue;
    if (!covered.some((w) => (df.get(w) ?? 0) <= common)) continue;
    matches.push({ kind: c.kind, name: c.name, score, snippet: c.snippet });
    if (matches.length >= MAX_MATCHES) break;
  }
  const miss = matches.length === 0;
  if (miss) recordMiss(root, query);
  return { query, matches, miss };
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
  return tokenize(query).sort().join(" ");
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
