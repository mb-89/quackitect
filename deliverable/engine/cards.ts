// see dsp-mirror-render.md#the-cards-the-mirror-shows
import { join } from "node:path";
import { noteOf } from "./notes.ts";

export interface Card {
  /** 1-based, and the key that promotes it. Row order, nothing else. */
  n: number;
  /** Stable id for the URL and the DOM. */
  id: string;
  /** What the reader sees on the card head. */
  title: string;
  /** The widget that fills it, or undefined while it is not built. */
  widget?: string;
}

/** Used when the product carries no cards.md — v3's own set. */
const FALLBACK: [string, string][] = [
  ["chat", "terminal"],
  ["state machine", "machine"],
  ["trace graph", ""],
  ["the book", ""],
  ["log", "log"],
  ["details", "details"],
];

function slug(s: string): string {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "card"
  );
}

/** The declared list, as `- card: <name>` with an optional `shows:`. */
function declared(frontmatter: Record<string, unknown>): [string, string][] {
  const raw = frontmatter.cards;
  if (!Array.isArray(raw)) return [];
  const rows: [string, string][] = [];
  for (const entry of raw) {
    if (entry === null || typeof entry !== "object") continue;
    const e = entry as Record<string, unknown>;
    const title = typeof e.card === "string" ? e.card.trim() : "";
    if (title === "") continue;
    rows.push([title, typeof e.shows === "string" ? e.shows.trim() : ""]);
  }
  return rows;
}

export function cardsPath(root: string): string {
  return join(root, "deliverable", "views", "cards.md");
}

export function loadCards(root: string): Card[] {
  const path = cardsPath(root);
  let rows: [string, string][] = FALLBACK;
  // THROUGH THE DOOR, which answers undefined for a file that is not there —
  // the same question existsSync was asking, without a second look at disk.
  const note = noteOf(path);
  if (note !== undefined) {
    const found = declared(note.frontmatter);
    if (found.length > 0) rows = found;
  }
  return rows.map(([title, shows], i) => ({
    n: i + 1,
    id: slug(title),
    title,
    ...(shows === "" ? {} : { widget: shows }),
  }));
}

/** One declared key. The legend RENDERS FROM THIS — never from a hand-kept
 *  list, or the two drift and a stale legend is worse than none. */
export interface Binding {
  /** As the reader presses it. */
  keys: string;
  /** What it does. */
  label: string;
  /** Grouping for the legend. */
  scope: string;
}

/** EVERY key the mirror answers to. Add one here and it appears in the
 *  legend by itself — that is the whole point of a registry. */
export function bindings(cards: Card[]): Binding[] {
  const out: Binding[] = cards.map((c) => ({
    keys: String(c.n),
    label: c.title,
    scope: "cards",
  }));
  out.push({ keys: "same key again", label: "back to the card you came from", scope: "cards" });
  out.push({ keys: "esc", label: "close the expanded card", scope: "view" });
  // SETTING THE TARGET HAD NO SURFACE AT ALL — the blue line could be drawn
  // but not aimed. A key beats a button here: the reader is already clicking
  // states to read them, so the selection they want is the one under their
  // hand. It only aims the line; the agent still has to be told to walk.
  out.push({ keys: "t", label: "aim the blue line at the selected state", scope: "walk" });
  return out;
}
