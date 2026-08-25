// THE ENUMERABLE KEYS AND THEIR ALLOWED WORDS, read from the item templates
// rather than compiled in here.
//
// WHY THAT MATTERS MORE THAN IT LOOKS. `req-a-check-binds-without-engine-code`
// is a CONSTRAINT, not a preference: the cost of adding a check decides how
// many exist. A vocabulary declared in `machines/items/<type>.md` costs one
// edit to that file and no engine change, which is the whole point.
//
// THE SOURCE IS THE SAME ONE THE SUBMIT CHECK READS. A guard with its own copy
// of the list is a guard that can disagree with the reader it is protecting —
// raid-asm-one-parser-decides-what-parses, one level up from syntax.
//
// req-a-value-outside-its-vocabulary-refuses
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { noteOf } from "./notes.ts";

/** One key that admits a fixed set of words. */
export interface Vocabulary {
  field: string;
  allowed: string[];
}

/** A template's folder, its id prefix and the vocabularies it declares. */
interface ItemTemplate {
  folder: string;
  prefix: string;
  vocabularies: Vocabulary[];
}

const ITEMS_REL = join("deliverable", "machines", "items");

/** THE TEMPLATES ARE STAT-KEYED, not timed. Same rule as the corpus and the
 *  branch listing: recompute when the input moves rather than when a clock
 *  says so. A write happens often and the templates change rarely. */
const CACHE = new Map<string, { stamp: string; templates: ItemTemplate[] }>();

/** STAMP THE FILES, NEVER THE FOLDER. A folder's own size and mtime do not
 *  move when a file inside it is edited — only when one is added or removed.
 *  A folder stamp is therefore blind to exactly the change this cache exists
 *  to see, and an edited template stays out of reach for the process's life.
 *
 *  The sibling stamps do it this way already: rigor-matrix.ts's `rowsStamp`
 *  and trace.ts's `itemTemplate` both stat the files. */
function stampOf(dir: string): string {
  let names: string[];
  try {
    names = readdirSync(dir)
      .filter((n) => n.endsWith(".md"))
      .sort();
  } catch {
    return "gone";
  }
  const parts: string[] = [];
  for (const n of names) {
    try {
      const s = statSync(join(dir, n));
      parts.push(`${n}:${String(s.size)}:${String(s.mtimeMs)}`);
    } catch {
      parts.push(`${n}:gone`);
    }
  }
  return parts.join("|");
}

/** `checks: [{field, one_of: [...]}]` is the declaration. Everything else in
 *  `checks` — ban_words, ban_markers, hints — belongs to other checks and is
 *  read by whoever owns them. */
function vocabulariesOf(frontmatter: Record<string, unknown>): Vocabulary[] {
  const checks = frontmatter.checks;
  if (!Array.isArray(checks)) return [];
  const out: Vocabulary[] = [];
  for (const c of checks) {
    if (typeof c !== "object" || c === null) continue;
    const entry = c as { field?: unknown; one_of?: unknown };
    if (typeof entry.field !== "string") continue;
    if (!Array.isArray(entry.one_of)) continue;
    out.push({ field: entry.field, allowed: entry.one_of.map(String) });
  }
  return out;
}

export function itemTemplates(root: string): ItemTemplate[] {
  const dir = join(root, ITEMS_REL);
  const stamp = stampOf(dir);
  const hit = CACHE.get(root);
  if (hit !== undefined && hit.stamp === stamp) return hit.templates;
  const templates: ItemTemplate[] = [];
  let names: string[] = [];
  try {
    names = readdirSync(dir).filter((n) => n.endsWith(".md"));
  } catch {
    names = [];
  }
  for (const name of names) {
    const fm = noteOf(join(dir, name))?.frontmatter;
    if (fm === undefined) continue;
    const folder = fm.folder;
    if (typeof folder !== "string" || folder === "") continue;
    const prefix = typeof fm.id_prefix === "string" ? fm.id_prefix : "";
    // A TEMPLATE WITH NO VOCABULARY STILL MAPS ITS PREFIX. The two jobs are
    // separate: one says which words a key admits, the other says where an id
    // lives. Dropping a template for lacking the first loses the second.
    templates.push({ folder: folder.replace(/\\/g, "/"), prefix, vocabularies: vocabulariesOf(fm) });
  }
  CACHE.set(root, { stamp, templates });
  return templates;
}

/** WHICH TEMPLATE GOVERNS THIS PATH. The template declares its own `folder`,
 *  so the mapping is the corpus's rather than a table here.
 *
 *  THE LONGEST FOLDER WINS, because a nested type would otherwise be governed
 *  by its parent's list. */
export function vocabulariesFor(root: string, path: string): Vocabulary[] {
  const p = path.replace(/\\/g, "/");
  let best: ItemTemplate | undefined;
  for (const t of itemTemplates(root)) {
    if (!p.startsWith(`${t.folder}/`)) continue;
    if (best === undefined || t.folder.length > best.folder.length) best = t;
  }
  return best?.vocabularies ?? [];
}

/** The first key whose value is outside its list, or undefined where every
 *  declared key is fine. A key the node does not carry is not checked here —
 *  whether it is REQUIRED is a different question and a different check. */
export function outsideVocabulary(
  root: string,
  path: string,
  frontmatter: Record<string, unknown>,
): { field: string; got: string; allowed: string[] } | undefined {
  for (const v of vocabulariesFor(root, path)) {
    const raw = frontmatter[v.field];
    if (raw === undefined || raw === null) continue;
    const got = String(raw).trim();
    if (got === "") continue;
    if (v.allowed.includes(got)) continue;
    return { field: v.field, got, allowed: v.allowed };
  }
  return undefined;
}

/** WHERE AN ID LIVES, from the template that declares its prefix.
 *
 *  THE LONGEST PREFIX WINS, so `raid-asm-x` is not claimed by a shorter
 *  prefix that happens to be its opening characters. */
export function fileForId(root: string, id: string): string | undefined {
  let best: ItemTemplate | undefined;
  for (const t of itemTemplates(root)) {
    if (t.prefix === "" || !id.startsWith(t.prefix)) continue;
    if (best === undefined || t.prefix.length > best.prefix.length) best = t;
  }
  if (best === undefined) return undefined;
  return `${best.folder}/${id}.md`;
}
