// A CLASS THE PAGE LEANS ON, WITH NO RULE TO DRAW IT.
//
// The editor draws its tree as one flat run of rows that know their depth,
// because a nested table would break every column width the person set. So the
// indent is a span and the fold is a class, and both are decisions the
// stylesheet has to carry out. Neither was written into the stylesheet.
//
// WHAT THE OWNER SAW. A token with sub-tokens drew its child flush with itself,
// with no indent and nothing marking it as a child, and pressing the fold moved
// nothing at all.
//
// WHY EVERY CHECK WAS GREEN OVER IT. drive-editor.mjs presses the fold and
// reads the class back, in jsdom, which applies no stylesheet. A class that is
// added and removed correctly and draws nothing passes every assertion in that
// file. This is the same hole one-look.mjs exists for over [hidden], and it is
// checked the same way: over the stylesheet the page ships.
//
// THE SETS ARE ASKED FOR, NOT LISTED. One comes from the source, by reading
// every classList call in editor.ts. The other comes from the emitted page, by
// reading every element that carries an inline geometry style. A hand list of
// either is complete on the day it is written and never again.
//
//   node util/checks/drawn-classes-have-rules.mjs <root>
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const root = process.argv[2] ?? ".";
const work = process.argv[3] ?? root;
const here = join(root, "src", "extension");
const out = mkdtempSync(join(tmpdir(), "drawn-"));
const { build } = await import(
  pathToFileURL(join(here, "node_modules", "esbuild", "lib", "main.js")).href
);
await build({
  entryPoints: [join(here, "editor.ts")],
  bundle: true, format: "esm", outdir: out, logLevel: "silent",
  outExtension: { ".js": ".mjs" },
});
const { editorHtml } = await import(pathToFileURL(join(out, "editor.mjs")).href);

const exe = join(root, ".bin", process.env.SE_EXE || (process.platform === "win32" ? "se.exe" : "se"));
const ask = (...a) => JSON.parse(execFileSync(exe, [...a, "--work", work], { encoding: "utf8" }));
const sides = ask("query", "--view", "work", "--panes").panes;
const panes = sides.map((side) => ({ side, table: ask("query", "--view", "work", "--pane", side) }));
const html = editorHtml(panes, ask("query", "--list").views, "work");

const source = readFileSync(join(here, "editor.ts"), "utf8");
const css = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join("\n");
const markup = html.replace(/<style[^>]*>[\s\S]*?<\/style>/g, "");

let bad = 0;
const say = (what, ok, why) => {
  if (!ok) bad++;
  console.log((ok ? "ok   " : "FAIL ") + " drawn: " + what + (ok || !why ? "" : "\n      " + why));
};

// A CHECK THAT FINDS NOTHING TO CHECK REFUSES. Both sets are read out of
// something else, so both can come back empty, and an empty set passes every
// assertion below by having no member to fail one.
const refuse = (why) => { console.error(why); process.exit(1); };

if (css.trim() === "") refuse("the emitted page carries no stylesheet, so this check guards nothing");

// Whether the sheet says anything at all about a class. A rule that mentions it
// is the weakest thing worth asking for: what the rule should say is a design
// decision the stylesheet owns, and this check does not.
const ruled = (name) => new RegExp("\\." + name + "(?![\\w-])").test(css);

// ONE: EVERY CLASS THE SCRIPT TOGGLES. A class the page adds and removes is a
// class the page expects to change what is drawn. If the sheet has never heard
// of it, adding it and removing it are the same thing.
const toggled = new Set(
  [...source.matchAll(/classList\.(?:add|remove|toggle)\('([^']+)'/g)].map((m) => m[1]),
);
if (toggled.size === 0) refuse("no classList call was found in editor.ts, so this check guards nothing");
say("every class the page toggles has a rule (" + [...toggled].sort().join(", ") + ")",
  [...toggled].every(ruled),
  [...toggled].filter((c) => !ruled(c)).join(", ") + " is toggled and the stylesheet never names it");

// TWO: EVERY INLINE ELEMENT DRAWN WITH A SIZE ON IT. An inline width is a
// decision the element has to be able to carry out, and an inline one cannot:
// width and height do nothing on it until a rule changes what it is. A cell or
// a block takes a width by itself and is left alone here.
//
// THE SET COMES OFF THE PAGE rather than out of a list here, so a second span
// given a width tomorrow is asked the same question. WHICH TAGS ARE INLINE is
// the browser's decision and not this file's, so only the ones this page draws
// are named, and the page is what says which those are.
const INLINE = new Set(["span", "a", "em", "strong", "b", "i", "label", "small"]);
const sized = new Map();
for (const tag of markup.matchAll(/<(\w+)\b([^>]*\bclass="([^"]*)"[^>]*)>/g)) {
  if (!INLINE.has(tag[1].toLowerCase())) continue;
  if (!/style="[^"]*\b(?:width|height)\s*:/.test(tag[2])) continue;
  for (const c of tag[3].split(/\s+/).filter(Boolean)) {
    if (!sized.has(c)) sized.set(c, tag[1]);
  }
}
if (sized.size === 0) refuse("no inline element on the page carries a width, so this half guards nothing");
say("every inline element drawn with a size on it has a rule (" + [...sized.keys()].sort().join(", ") + ")",
  [...sized.keys()].every(ruled),
  [...sized.keys()].filter((c) => !ruled(c))
    .map((c) => c + " is a <" + sized.get(c) + "> given a width the stylesheet never lets it take")
    .join(", "));

process.exit(bad === 0 ? 0 : 1);
