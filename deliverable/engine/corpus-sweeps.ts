// see dsp-the-corpus-sweeps.md#the-shape
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, sep } from "node:path";

/** A path a citation may name, with an optional line number that is not checked. */
const CITATION = /`([A-Za-z0-9_][A-Za-z0-9_./-]*\.(?:ts|js|mjs|cjs|json|md))(?::\d+)?`/g;

/** A lane verb as it is written in prose. */
const LANE_VERB = /\bse_[a-z][a-z0-9_]*\b/g;

/** A verb name as it appears anywhere in the engine that serves it. */
const SERVED_VERB = /\bse_[a-z][a-z0-9_]*\b/g;

/** The engine's own files, which are the authority on what a verb is. */
const ENGINE = ["deliverable", "engine"];

function unique(found: string[]): string[] {
  return [...new Set(found)];
}

/** THE HEADINGS A NODE CARRIES MORE THAN ONCE, at the same level.
 *
 *  Two headings at different levels are different headings: `# Detail` over
 *  `## Detail` is a section and its subsection, which is ordinary.
 *
 *  req-a-heading-appears-once-in-a-node */
export function duplicateHeadings(content: string): string[] {
  const seen = new Map<string, number>();
  let fenced = false;
  for (const line of content.split("\n")) {
    if (line.startsWith("```")) {
      fenced = !fenced;
      continue;
    }
    if (fenced) continue;
    const m = /^(#{1,6})\s+(\S.*?)\s*$/.exec(line);
    if (m === null) continue;
    const key = `${m[1]} ${m[2]}`;
    seen.set(key, (seen.get(key) ?? 0) + 1);
  }
  return [...seen.entries()].filter(([, n]) => n > 1).map(([key]) => key);
}

function sourceFilesUnder(dir: string, out: string[]): void {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry.startsWith(".")) continue;
    const abs = join(dir, entry);
    if (statSync(abs).isDirectory()) sourceFilesUnder(abs, out);
    else out.push(abs.split(sep).join("/"));
  }
}

const treeCache = new Map<string, string[]>();

function treeOf(root: string): string[] {
  const held = treeCache.get(root);
  if (held !== undefined) return held;
  const found: string[] = [];
  sourceFilesUnder(root, found);
  treeCache.set(root, found);
  return found;
}

/** A CITATION NAMES A FILE WHEN SOME FILE IN THE TREE ENDS WITH IT.
 *
 *  Citations are written at the depth a reader needs — `guard.ts`,
 *  `engine/guard.ts` and `deliverable/engine/guard.ts` all name the same file.
 *  Resolving against a fixed set of prefixes reported 169 live files as gone,
 *  measured over the trace corpus on 2026-08-28. */
function citationResolves(root: string, cited: string): boolean {
  const tail = `/${cited}`;
  return treeOf(root).some((abs) => abs.endsWith(tail) || abs === cited);
}

/** THE PATHS A NODE DECLARES AS DELIBERATELY GONE.
 *
 *  A node that names a file the tree no longer holds lists it under
 *  `unreachable_citations` in its own frontmatter. History, a deleted spike,
 *  a report never written, an example path — all real, none repairable.
 *
 *  IT IS A DECLARATION AND NOT A SILENCER. The list is in the node, one
 *  entry per path, so a reviewer can count markers against repairs. That
 *  count is what raid-risk-the-unreachable-marker-becomes-the-cheap-answer
 *  asks for.
 *
 *  The list is read with a regex rather than a yaml parser, because this
 *  module takes text and nothing else. */
function markedUnreachable(content: string): Set<string> {
  const out = new Set<string>();
  const head = /^---\n([\s\S]*?)\n---/.exec(content);
  if (head === null) return out;
  const block = /^unreachable_citations:[ \t]*\n((?:[ \t]*-[ \t]+.*\n?)+)/m.exec(`${head[1]}\n`);
  if (block === null) return out;
  for (const line of block[1].split("\n")) {
    const item = /^[ \t]*-[ \t]+(.+?)[ \t]*$/.exec(line);
    if (item !== null) out.add(item[1].replace(/^["']|["']$/g, ""));
  }
  return out;
}

/** THE CITED PATHS THE TREE DOES NOT HOLD.
 *
 *  The line number is read off and thrown away. It moves on every edit above
 *  it, so checking it would keep the sweep red for no gain.
 *
 *  A path the node lists under `unreachable_citations` is left alone.
 *
 *  req-a-code-citation-names-something-that-exists */
export function staleCitations(root: string, content: string): string[] {
  const marked = markedUnreachable(content);
  const found: string[] = [];
  for (const m of content.matchAll(CITATION)) {
    const cited = m[1];
    if (marked.has(cited)) continue;
    if (!citationResolves(root, cited)) found.push(cited);
  }
  return unique(found);
}

const verbCache = new Map<string, Set<string> | undefined>();

/** EVERY VERB NAME THE ENGINE MENTIONS. A verb the engine never names is
 *  retired; anything else is alive, whichever file happens to declare it.
 *
 *  Reading one file as the surface reported 292 live verbs as dead, measured
 *  over the trace corpus on 2026-08-28. Only 16 of them are declared in
 *  tools.ts in the shape that check expected. */
function servedVerbs(root: string): Set<string> | undefined {
  if (verbCache.has(root)) return verbCache.get(root);
  const dir = join(root, ...ENGINE);
  if (!existsSync(dir)) {
    verbCache.set(root, undefined);
    return undefined;
  }
  const files: string[] = [];
  sourceFilesUnder(dir, files);
  const alive = new Set<string>();
  for (const abs of files.filter((f) => f.endsWith(".ts"))) {
    for (const m of readFileSync(abs, "utf8").matchAll(SERVED_VERB)) alive.add(m[0]);
  }
  verbCache.set(root, alive);
  return alive;
}

/** THE LANE VERBS NAMED IN PROSE THAT THE TOOL SURFACE DOES NOT DEFINE.
 *
 *  The surface is the authority on what a verb is, so a rename cannot leave
 *  this check asserting against a list of its own.
 *
 *  With no surface to read, it answers nothing rather than guessing.
 *
 *  req-the-dead-vocabulary-sweep-reaches-the-trace */
export function deadLaneVerbs(root: string, content: string): string[] {
  const alive = servedVerbs(root);
  if (alive === undefined) return [];
  const named = unique([...content.matchAll(LANE_VERB)].map((m) => m[0]));
  return named.filter((verb) => !alive.has(verb));
}

function markdownUnder(dir: string, out: string[]): void {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir)) {
    const abs = join(dir, entry);
    if (statSync(abs).isDirectory()) markdownUnder(abs, out);
    else if (entry.endsWith(".md")) out.push(abs);
  }
}

function tokenIds(pool: string): string[] {
  if (!existsSync(pool)) return [];
  return readdirSync(pool)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.slice(0, -3));
}

/** THE WORK TOKENS NO NODE POINTS AT.
 *
 *  It reports and never refuses. A token minted from a note may legitimately
 *  stand alone until something picks it up; what the report buys is that the
 *  pile is visible.
 *
 *  req-a-work-token-nothing-references-is-reported */
export function unreferencedTokens(root: string): string[] {
  const pool = join(root, "spec", "trace", "work-token");
  const ids = tokenIds(pool);
  if (ids.length === 0) return [];
  const files: string[] = [];
  markdownUnder(join(root, "spec"), files);
  const elsewhere = files.filter((abs) => !abs.startsWith(pool));
  const cited = new Set<string>();
  for (const abs of elsewhere) {
    const text = readFileSync(abs, "utf8");
    for (const id of ids) if (text.includes(id)) cited.add(id);
  }
  return ids.filter((id) => !cited.has(id)).sort();
}
