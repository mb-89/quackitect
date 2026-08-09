// CATALOGUES — a known set of answers, read from where it is WRITTEN.
//
// Owner ruling 2026-08-08: "if you have catalogs, just make them selectables.
// And then if I change the catalog in the markdown, I want the selectables to
// reflect that, so don't hard code it. That goes for everything."
//
// So nothing here names a heuristic, an operator or a parameter. The method
// card declares that it HOLDS a catalogue, and this reads it back:
//
//   catalog: transform_operators
//   catalog_sections: SCAMPER, SIT
//
// A new catalogue is a new card with two frontmatter lines. It is never an
// edit to this file, and that is the whole point of the indirection.
//
// WHY THE CARD AND NOT A DATA FILE: the catalogue and the method that runs it
// must never drift. A person editing the SCAMPER card is editing the offer the
// form makes, in the same breath, without knowing this file exists.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const METHODS = ["project", "deliverable", "machines", "methods"];
const VENDORED_TRIZ = ["project", "deliverable", "vendor", "triz", "triz-matrix.json"];

/** The frontmatter value of one flat key, or "" — the same line-based read the
 *  trace nodes use, so a card needs no parser of its own. */
function frontKey(text: string, key: string): string {
  const lines = text.split("\n");
  const end = lines.indexOf("---", 1);
  const hit = lines.slice(0, end < 0 ? lines.length : end).find((l) => l.startsWith(`${key}:`));
  return hit === undefined ? "" : hit.slice(key.length + 1).trim();
}

/** One catalogue line, reduced to the thing being offered.
 *
 *  `**A**lpha — swap a part` is the operator Alpha with a gloss; the gloss is
 *  help for the reader and never belongs in a cell. A line with no gloss IS
 *  the item, which is what makes a heuristic ("Group what changes together;
 *  separate what changes apart.") come through whole.
 *
 *  THE EXAMPLE IS DELIBERATELY MADE UP. A real operator written here would be
 *  a real operator written in the engine, and catalogs.test.ts refuses that —
 *  which is the whole point of the file. */
function catalogItem(line: string): string {
  const t = line.trim();
  const m = t.match(/^(?:[-*]|\d+\.)\s+(.*)$/);
  if (m === null) return "";
  const plain = m[1]
    .replace(/\*\*/g, "")
    .replace(/^\*(.+)\*$/, "$1")
    .trim();
  const dash = plain.indexOf(" — ");
  return (dash < 0 ? plain : plain.slice(0, dash)).trim();
}

/** The list items under the headings a card names, in the card's own order. */
function sectionItems(body: string, prefixes: string[]): string[] {
  const out: string[] = [];
  let inside = false;
  for (const line of body.split("\n")) {
    if (line.startsWith("#")) {
      const title = line.replace(/^#+\s*/, "").trim();
      inside = prefixes.some((p) => title.toLowerCase().startsWith(p.toLowerCase()));
      continue;
    }
    if (!inside) continue;
    const item = catalogItem(line);
    if (item !== "" && !out.includes(item)) out.push(item);
  }
  return out;
}

/** Every offer in the named catalogue, live off the method card that holds it.
 *
 *  NOTHING IS CACHED. The scan is sixty small files and it runs once per form
 *  render, which is nothing; a cache would be the exact mechanism by which an
 *  edited card stops reaching the selector. */
export function catalogItems(root: string, name: string): string[] {
  const dir = join(root, ...METHODS);
  if (!existsSync(dir)) return [];
  for (const file of readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .sort()) {
    const text = readFileSync(join(dir, file), "utf8");
    if (frontKey(text, "catalog") !== name) continue;
    const prefixes = frontKey(text, "catalog_sections")
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s !== "");
    if (prefixes.length === 0) return [];
    return sectionItems(text, prefixes);
  }
  return [];
}

/** The 39 standard engineering parameters, off the vendored contradiction
 *  matrix rather than a method card.
 *
 *  THIS ONE IS NOT OURS TO EDIT, which is why it reads a different file. The
 *  parameters are Altshuller's and they index the matrix; a card that
 *  paraphrased them would make a cell that no longer looks anything up.
 *
 *  The software equivalent rides along in the value on purpose. It is what the
 *  method's step 2 actually needs, and a datalist matches on substring — so
 *  typing "latency" finds the parameter whose name never says it. */
export function trizParameterItems(root: string): string[] {
  const file = join(root, ...VENDORED_TRIZ);
  if (!existsSync(file)) return [];
  try {
    const raw = JSON.parse(readFileSync(file, "utf8")) as { parameters?: { id: number; name: string; software_equivalent?: string }[] };
    return (raw.parameters ?? []).map((p) => {
      const eq = (p.software_equivalent ?? "").trim();
      return eq === "" ? `${p.id} ${p.name}` : `${p.id} ${p.name} (${eq})`;
    });
  } catch {
    // A vendored file that will not parse offers nothing, and the field falls
    // back to free text rather than the form failing to render at all.
    return [];
  }
}
