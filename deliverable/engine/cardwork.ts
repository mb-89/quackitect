// see dsp-marking-a-card.md#behavior-and-constraints
//
// A card says which of its parts are work. This reads the mark; it never
// infers from shape. see dsp-marking-a-card.md#the-safety-property-and-it-is-the-whole-design

/** see dsp-marking-a-card.md#the-reserved-word-is-work
 *
 *  The tag takes an optional nested part, `#work/<step>`. Obsidian renders a
 *  slash as tag nesting, so every stamped part still sits under `#work`. */
const MARK = /(?:^|\s)#work(?:\/([A-Za-z0-9_-]+))?(?![\w-])/;
const MARK_ALL = /(?:^|\s)#work(?:\/[A-Za-z0-9_-]+)?(?![\w-])/g;

const HEADING = /^(#{1,6})\s+(.+)$/;
// TWO DIGITS, NOT NINE. CommonMark allows an ordered marker up to nine digits,
// so a wrapped citation ending `2026)` reads as a list item. One line in this
// corpus did exactly that, and the compiler minted a piece of work from prose.
const ITEM = /^(?:[-*+]|\d{1,2}[.)])\s+(.+)$/;
const FENCE = /^\s*(?:```|~~~)/;

/** One marked part of one card, with the extent markdown already gives it. */
export interface CardPart {
  /** The card's own id, off its frontmatter, or "" where it has none. */
  card: string;
  /** The STEP's identity, stamped into the tag, or "" while it is unstamped.
   *
   *  see dsp-the-work-store.md#the-identity-lives-in-the-card-not-in-the-text
   *  It survives a rewording, which the slug and the title do not. */
  step: string;
  /** A stable address within the card. Unique even when two titles match. */
  slug: string;
  /** The opening line's text with the mark taken out. */
  title: string;
  /** Everything markdown gives the opening line, trimmed. */
  body: string;
  /** The line the part opens on, one-indexed. */
  line: number;
  shape: "heading" | "item";
}

/** Which lines sit inside a fenced block, delimiters included.
 *
 *  A hash inside a fence is not a heading and a mark inside one is not a mark.
 *  Both readings below consult this rather than repeating the fence state. */
function fenceMap(lines: string[]): boolean[] {
  const out: boolean[] = [];
  let open = false;
  for (const line of lines) {
    const delim = FENCE.test(line);
    out.push(open || delim);
    if (delim) open = !open;
  }
  return out;
}

/** Where the frontmatter ends, and the id it declares.
 *
 *  A line-based read, the same one the trace nodes use, so a card needs no
 *  parser of its own. */
function frontmatter(lines: string[]): { end: number; id: string } {
  if (lines[0]?.trim() !== "---") return { end: 0, id: "" };
  const close = lines.indexOf("---", 1);
  if (close < 0) return { end: 0, id: "" };
  const hit = lines.slice(1, close).find((l) => l.startsWith("id:"));
  return { end: close + 1, id: hit === undefined ? "" : hit.slice(3).trim() };
}

/** What kind of part this line opens, or null where it opens none.
 *
 *  TWO KINDS OF LINE OPEN A PART. A heading at any level, and a TOP-LEVEL list
 *  item — an indented one belongs to the item above it. */
function openerOf(line: string): { shape: "heading" | "item"; level: number; text: string } | null {
  const heading = line.match(HEADING);
  if (heading !== null) return { shape: "heading", level: heading[1].length, text: heading[2] };
  const item = line.match(ITEM);
  if (item !== null) return { shape: "item", level: 0, text: item[1] };
  return null;
}

/** Whether the line at `at` closes the part opened at `shape`/`level`.
 *
 *  A heading ends at the next heading of the same level or higher. An item
 *  ends at the next line that is neither blank nor indented — its block is
 *  what sits under it. A lazy continuation is read as a new top-level line,
 *  which is the predictable reading rather than the CommonMark one. */
function closesPart(line: string, shape: "heading" | "item", level: number): boolean {
  if (shape === "heading") {
    const next = line.match(HEADING);
    return next !== null && next[1].length <= level;
  }
  return line.trim() !== "" && !/^\s/.test(line);
}

/** A stable address, made unique against what the card has already used. */
function slugFor(title: string, taken: Set<string>): string {
  const base =
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "part";
  if (!taken.has(base)) {
    taken.add(base);
    return base;
  }
  let n = 2;
  while (taken.has(`${base}-${n}`)) n += 1;
  taken.add(`${base}-${n}`);
  return `${base}-${n}`;
}

/** Stamp every unstamped marked part with its own slug.
 *
 *  see dsp-the-work-store.md#the-identity-lives-in-the-card-not-in-the-text
 *
 *  ALREADY-STAMPED PARTS ARE LEFT EXACTLY AS THEY ARE, which is what makes the
 *  act idempotent and what makes a rewording harmless: the stamp is taken from
 *  the wording ONCE and never again. */
export function stampCard(text: string): { text: string; stamped: number } {
  const lines = text.split("\n");
  const parts = cardWork(text);
  // A STAMP ALREADY ON THE CARD IS TAKEN. Without this, a part inserted ABOVE
  // one carrying the same title slugs to the same word and is stamped with it,
  // and two different steps then collapse into one item at the mint.
  const taken = new Set(parts.filter((p) => p.step !== "").map((p) => p.step));
  let stamped = 0;
  for (const part of parts) {
    if (part.step !== "") continue;
    let step = part.slug;
    for (let n = 2; taken.has(step); n += 1) step = `${part.slug}-${n}`;
    taken.add(step);
    lines[part.line - 1] = lines[part.line - 1].replace(MARK, (hit) => `${hit}/${step}`);
    stamped += 1;
  }
  return { text: lines.join("\n"), stamped };
}

/** Every piece of work one card owes.
 *
 *  A CARD WITH NO MARKS RETURNS AN EMPTY ARRAY, and that is the safety
 *  property rather than a degenerate case. An unconverted card reports zero
 *  work; it never falls back to guessing from heading depth. */
export function cardWork(text: string): CardPart[] {
  const lines = text.split("\n");
  const fenced = fenceMap(lines);
  const { end, id } = frontmatter(lines);
  const taken = new Set<string>();
  const out: CardPart[] = [];

  for (let i = end; i < lines.length; i += 1) {
    if (fenced[i]) continue;
    const opener = openerOf(lines[i]);
    if (opener === null) continue;
    const mark = lines[i].match(MARK);
    if (mark === null) continue;

    let stop = lines.length;
    for (let j = i + 1; j < lines.length; j += 1) {
      if (fenced[j]) continue;
      if (closesPart(lines[j], opener.shape, opener.level)) {
        stop = j;
        break;
      }
    }

    const title = opener.text.replace(MARK_ALL, " ").replace(/\s+/g, " ").trim();
    out.push({
      card: id,
      step: mark[1] ?? "",
      slug: slugFor(title, taken),
      title,
      body: lines
        .slice(i + 1, stop)
        .join("\n")
        .trim(),
      line: i + 1,
      shape: opener.shape,
    });
  }
  return out;
}
