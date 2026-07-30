// THE PRODUCT NAME IS ONE FACT. It lives in brand.json at the project root
// and nothing else spells it out. Every surface a person reads carries a
// placeholder instead, and this module fills it in.
//
// That is what makes an export a RENAME rather than a find-and-replace: the
// exported tree is the same tree, with one different brand.json.
//
// Internal identifiers ride the same substitution on purpose. The VS Code
// command ids and the webview's message key are invisible to a reader, but
// they surface in the Keyboard Shortcuts editor and in settings.json — a
// rename that left them behind would still leak the old name there.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export interface Brand {
  /** What a person reads: window titles, notifications, the activity bar. */
  name: string;
  /** The slug: extension id, command ids, the message key, folder names. */
  id: string;
  /** Two or three letters for the activity-bar icon. Null keeps the drawn
   *  icon that ships with the source. */
  abbr: string | null;
}

// A MISSING brand.json MUST NOT LEAK A NAME. The fallback is the lane's own
// word, never whichever product this source last belonged to.
const FALLBACK: Brand = { name: "se", id: "se", abbr: null };

export function brandPath(root: string): string {
  return join(root, "brand.json");
}

/** Read live (owner ruling 2026-07-29): a running system holding a stale copy
 *  of the file it calls the single truth is enforcing a lie. */
export function loadBrand(root: string): Brand {
  let raw: string;
  try {
    // A BOM is not a parse error to a person, so it must not be one here.
    // Anything that writes this file on Windows may add one.
    raw = readFileSync(brandPath(root), "utf8").replace(/^﻿/, "");
  } catch {
    return { ...FALLBACK };
  }
  const parsed = JSON.parse(raw) as Partial<Brand>;
  const name = typeof parsed.name === "string" && parsed.name.trim() !== "" ? parsed.name.trim() : FALLBACK.name;
  const id = typeof parsed.id === "string" && parsed.id.trim() !== "" ? slug(parsed.id) : slug(name);
  const abbr = typeof parsed.abbr === "string" && parsed.abbr.trim() !== "" ? parsed.abbr.trim().toUpperCase().slice(0, 3) : null;
  return { name, id, abbr };
}

/** An id has to survive being a folder name, an npm name and a VS Code
 *  command id, so it is reduced to what all three accept. */
export function slug(s: string): string {
  const out = s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return out === "" ? FALLBACK.id : out;
}

export function fill(text: string, b: Brand): string {
  return text
    .split("$PRODUCT_ABBR$").join(b.abbr ?? "")
    .split("$PRODUCT_ID$").join(b.id)
    .split("$PRODUCT$").join(b.name);
}

/** The activity-bar icon, drawn from the abbreviation.
 *
 *  currentColor and a 24x24 box are what VS Code's activity bar expects — it
 *  recolours the icon per theme, so a fixed fill would fight the user's
 *  theme (ux.md: take the colour from the host). */
export function letterIcon(abbr: string): string {
  const size = abbr.length >= 3 ? 8.5 : 11;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
  <text x="12" y="16" text-anchor="middle" font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="${size}" font-weight="600" letter-spacing="0.3">${abbr}</text>
</svg>
`;
}

/** Render an already-copied extension folder in place. The copy is what gets
 *  installed, so the source keeps its placeholders and stays the one tree. */
export function renderExtension(dest: string, b: Brand): void {
  for (const rel of ["package.json", "extension.js", "ATTACH.md"]) {
    const p = join(dest, rel);
    writeFileSync(p, fill(readFileSync(p, "utf8"), b), "utf8");
  }
  if (b.abbr !== null) writeFileSync(join(dest, "media", "icon.svg"), letterIcon(b.abbr), "utf8");
}
