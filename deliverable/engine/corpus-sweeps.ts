// see dsp-the-corpus-sweeps.md#the-shape
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, sep } from "node:path";

/** A CITATION: a path, then an optional `#symbol`, then an optional `:line`.
 *
 *  Group 1 is the path and group 2 is the symbol where one is given. The line
 *  number is read off and thrown away — it moves on every edit above it, and a
 *  check on it would keep the sweep red for no gain. */
const CITATION = /`([A-Za-z0-9_.][A-Za-z0-9_./-]*\.(?:ts|js|mjs|cjs|json|md))(?:#([A-Za-z0-9_.$-]+))?(?::\d+)?`/g;

/** A BACKTICKED SPAN THAT NAMES A FILE: it ends in a dot and a short
 *  extension. What this matches and `CITATION` does not is a citation the
 *  sweep cannot parse, which the requirement says reports as unchecked rather
 *  than passing.
 *
 *  A BARE DIRECTORY IS NOT A CITATION. Requiring the extension is what keeps
 *  `.se/` and `spec/trace` out of the class; without it 248 spans reported
 *  unchecked and almost none of them named a file. */
const PATH_SHAPED = /`([^`\s]*\.[A-Za-z][A-Za-z0-9]{0,4})(?:#[^`\s]+)?(?::\d+)?`/g;

/** A lane verb as it is written in prose. */
const LANE_VERB = /\bse_[a-z][a-z0-9_]*\b/g;

/** THE FRONTMATTER KEYS A NODE POINTS WITH. It mirrors REFERENCE_KEYS in
 *  guard.ts; the two are kept apart so this module stays text-only, and one
 *  case asserts they agree. */
export const POINTING_KEYS = [
  "refines",
  "satisfies",
  "implements",
  "realizes",
  "verifies",
  "depends_on",
  "source_refs",
  "weighs_with",
  "weighs_against",
  "demonstrates",
  "probes",
  "picks",
  "cluster",
];

/** THE THREE SHAPES IN WHICH THE TOOL SURFACE DECLARES A VERB. Each captures
 *  the verb name in group 1. Anything else in those files — a comment, a
 *  string in a message, a call — is a mention and proves nothing. */
const DECLARED_VERB = [/\bname:\s*"(se_[a-z][a-z0-9_]*)"/g, /^\s*"(se_[a-z][a-z0-9_]*)"\s*:/gm, /\bcase\s+"(se_[a-z][a-z0-9_]*)"/g];

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
  // A FENCE OPENS WITH A MARKER AND CLOSES WITH THE SAME ONE. Toggling on any
  // marker let a stray tilde close a backtick fence, and an odd count ran to
  // the end of the file with every heading below it silenced.
  let fence = "";
  for (const line of content.split("\n")) {
    const marker = /^(```+|~~~+)/.exec(line);
    if (marker !== null) {
      if (fence === "") fence = marker[1][0];
      else if (marker[1][0] === fence) fence = "";
      continue;
    }
    const fenced = fence !== "";
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
function markedList(content: string, key: string): Set<string> {
  const out = new Set<string>();
  const head = /^---\n([\s\S]*?)\n---/.exec(content);
  if (head === null) return out;
  const block = new RegExp(`^${key}:[ \\t]*\\n((?:[ \\t]*-[ \\t]+.*\\n?)+)`, "m").exec(`${head[1]}\n`);
  if (block === null) return out;
  for (const line of block[1].split("\n")) {
    const item = /^[ \t]*-[ \t]+(.+?)[ \t]*$/.exec(line);
    if (item !== null) out.add(item[1].replace(/^["']|["']$/g, ""));
  }
  return out;
}

/** THE PATHS THIS NODE DECLARES AS DELIBERATELY GONE. */
function markedUnreachable(content: string): Set<string> {
  return markedList(content, "unreachable_citations");
}

/** THE FILE A CITATION NAMES, or undefined where the tree holds none.
 *
 *  A CITATION NAMES A FILE WHEN SOME FILE IN THE TREE ENDS WITH IT. Citations
 *  are written at the depth a reader needs — `guard.ts`, `engine/guard.ts` and
 *  `deliverable/engine/guard.ts` all name the same file. Resolving against a
 *  fixed set of prefixes reported 169 live files as gone. */
function citedFile(root: string, cited: string): string | undefined {
  // THE TREE WALK SKIPS DOT-DIRECTORIES, which is right for `.git` and wrong
  // for `.se/reading.md`. A citation naming one is answered by looking, and 32
  // such citations reported stale before this line existed.
  const literal = join(root, cited);
  if (existsSync(literal)) return literal;
  const tail = `/${cited}`;
  return treeOf(root).find((abs) => abs.endsWith(tail) || abs === cited);
}

/** THE CITED PATHS THE TREE DOES NOT HOLD, and the symbols the named file does
 *  not carry.
 *
 *  A path the node lists under `unreachable_citations` is left alone.
 *
 *  THE SYMBOL IS CHECKED BY APPEARANCE, not by parsing the language. A symbol
 *  the file never spells is not there; one it spells in a comment is close
 *  enough for a citation to be followable, which is what the requirement asks.
 *
 *  req-a-code-citation-names-something-that-exists */
export function staleCitations(root: string, content: string): string[] {
  const marked = markedUnreachable(content);
  const found: string[] = [];
  for (const m of content.matchAll(CITATION)) {
    const cited = m[1];
    const symbol = m[2];
    if (marked.has(cited)) continue;
    if (machineLocal(cited)) continue;
    const abs = citedFile(root, cited);
    if (abs === undefined) {
      found.push(cited);
      continue;
    }
    if (symbol === undefined) continue;
    if (!symbolIsThere(abs, cited, symbol)) found.push(`${cited}#${symbol}`);
  }
  return unique(found);
}

/** THE SLUG A MARKDOWN HEADING ANSWERS TO, in the shape an anchor is written.
 *  Lowercased, punctuation dropped, spaces hyphenated. */
function headingSlug(heading: string): string {
  return heading
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

/** WHETHER THE CITED FILE CARRIES WHAT COMES AFTER THE HASH.
 *
 *  A MARKDOWN ANCHOR IS A HEADING SLUG, not a word in the text. Comparing it
 *  literally reported a live anchor as stale, because the file carries
 *  "A reopened placeholder is walked to, not through" and the anchor carries
 *  its slug.
 *
 *  IN SOURCE THE SYMBOL IS THE WORD, so appearing anywhere in the file is
 *  enough. This does not parse the language, and it is not meant to: a citation
 *  is followable when the reader can find the name. */
function symbolIsThere(abs: string, cited: string, symbol: string): boolean {
  const text = readFileSync(abs, "utf8");
  if (cited.endsWith(".md")) {
    for (const m of text.matchAll(/^#{1,6}\s+(\S.*?)\s*$/gm)) {
      if (headingSlug(m[1]) === symbol.toLowerCase()) return true;
    }
    return false;
  }
  return new RegExp(`\\b${symbol.replace(/[.$]/g, "\\$&")}\\b`).test(text);
}

/** A PATH THE TREE DOES NOT OWN. `.se/` is machine-local and never committed,
 *  so a clone holds whichever of its files that machine happens to have made.
 *
 *  THE TREE CANNOT ANSWER EITHER WAY, and that is what unchecked is for. Twelve
 *  citations into `.se/` reported stale on a fresh box, and the ones that are
 *  genuinely retired — the handover file among them — look exactly like the
 *  ones that are simply not made yet. */
function machineLocal(cited: string): boolean {
  return cited.startsWith(".se/");
}

/** THE CITATIONS THE SWEEP COULD NOT PARSE, and the ones it may not answer.
 *
 *  A backticked span shaped like a path that `CITATION` does not match is
 *  neither checked nor passed — it is reported as unchecked, so the class list
 *  stays auditable rather than quietly shrinking.
 *
 *  req-a-code-citation-names-something-that-exists */
export function uncheckedCitations(content: string): string[] {
  const parsed = new Set([...content.matchAll(CITATION)].map((m) => m[0]));
  const out: string[] = [];
  for (const m of content.matchAll(PATH_SHAPED)) {
    if (parsed.has(m[0])) continue;
    out.push(m[1]);
  }
  for (const m of content.matchAll(CITATION)) {
    if (machineLocal(m[1])) out.push(m[1]);
  }
  return unique(out);
}

/** THE CITATION MARKERS A NODE DECLARES, and which of them no longer answer
 *  anything because the tree holds the path after all.
 *
 *  THE COUNT IS THE POINT. raid-risk-the-unreachable-marker-becomes-the-cheap-answer
 *  asks for markers counted beside repairs, and a count nobody can re-derive is
 *  a number in a form rather than a fact about the corpus. */
export function citationMarkers(root: string, content: string): { declared: string[]; stale: string[] } {
  const declared = [...markedUnreachable(content)];
  return { declared, stale: declared.filter((cited) => citedFile(root, cited) !== undefined) };
}

const verbCache = new Map<string, Set<string> | undefined>();

/** EVERY VERB THE TOOL SURFACE DECLARES.
 *
 *  THE SURFACE IS THE `tools*.ts` FILES AND NOTHING ELSE, and a DECLARATION is
 *  one of the three shapes those files use. A mention is not a declaration: a
 *  comment saying a verb was retired names it, and reading the whole engine
 *  for any occurrence marked every such name alive.
 *
 *  THAT WAS MEASURED. Reading `tools.ts` alone in one shape reported 292 live
 *  verbs as dead; reading every engine file for any occurrence reported none,
 *  because 67 comment lines across 30 files name a verb. Reading the surface
 *  in all three of its shapes is the answer between them.
 *
 *  With no surface to read, it answers undefined rather than guessing. */
function servedVerbs(root: string): Set<string> | undefined {
  if (verbCache.has(root)) return verbCache.get(root);
  const dir = join(root, ...ENGINE);
  if (!existsSync(dir)) {
    verbCache.set(root, undefined);
    return undefined;
  }
  const files: string[] = [];
  sourceFilesUnder(dir, files);
  const surface = files.filter((f) => /\/tools[a-z-]*\.ts$/.test(f));
  if (surface.length === 0) {
    verbCache.set(root, undefined);
    return undefined;
  }
  const alive = new Set<string>();
  for (const abs of surface) {
    const text = readFileSync(abs, "utf8");
    for (const shape of DECLARED_VERB) {
      for (const m of text.matchAll(shape)) alive.add(m[1]);
    }
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
  const declared = markedList(content, "unreachable_verbs");
  const named = unique([...content.matchAll(LANE_VERB)].map((m) => m[0]));
  return named.filter((verb) => !alive.has(verb) && !declared.has(verb));
}

/** THE VERB-SHAPED NAMES A NODE DECLARES AS SOMETHING ELSE.
 *
 *  NOT EVERY `se_` NAME IS A VERB. `se_version` is a field in the call log and
 *  `se_test_verdict` is an entry the log writes for itself. A node describing
 *  either names something the tool surface will never declare, and the prefix
 *  cannot tell the two apart.
 *
 *  IT IS COUNTED LIKE THE OTHER MARKERS, one entry per name, so a node cannot
 *  quietly opt out of the whole check. */
export function verbMarkers(content: string): string[] {
  return [...markedList(content, "unreachable_verbs")];
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
  // A REFERENCE IS A KEY, NOT A MENTION. The requirement joins the pool against
  // every reference key in the corpus, and asking whether the id appears
  // anywhere in the text counted a token merely named in an evidence document
  // as referenced.
  for (const abs of elsewhere) {
    for (const id of referenceValues(readFileSync(abs, "utf8"))) {
      if (ids.includes(id)) cited.add(id);
    }
  }
  return ids.filter((id) => !cited.has(id));
}

/** EVERY ID THIS NODE POINTS WITH, read off its reference keys.
 *
 *  The keys are read from the frontmatter block by name rather than parsed as
 *  yaml, because this module takes text and nothing else. */
function referenceValues(content: string): string[] {
  const head = /^---\n([\s\S]*?)\n---/.exec(content);
  if (head === null) return [];
  const out: string[] = [];
  for (const key of POINTING_KEYS) {
    const inline = new RegExp(`^${key}:[ \\t]+(\\S.*)$`, "m").exec(head[1]);
    if (inline !== null) out.push(inline[1].trim().replace(/^["']|["']$/g, ""));
    for (const item of markedList(content, key)) out.push(item);
  }
  return out;
}
