// EVERY CONTROL TAKES THE ONE LOOK, AND NOTHING SAYS A COLOUR OUT LOUD.
//
// The owner has reported a white input four times, on four different controls,
// and each time the answer was to style that control. That is a defect per
// control forever. The rule is what has to hold: a control drawn in either page
// takes the shared stylesheet, and a colour written into a page is a colour
// that will be right in one theme and wrong in every other.
//
// SO THIS REFUSES THREE THINGS.
//
// A control element in either page that the shared stylesheet does not cover.
// A colour written as a literal anywhere in either page's CSS.
// A colour taken from a variable with no fallback, because an undefined
// variable makes the whole declaration invalid and the control falls back to
// whatever the browser draws, which is the white the owner keeps seeing.
//
//   node .se/scratchpad/one-look.mjs <root>
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const root = process.argv[2] ?? ".";
const here = join(root, "src", "extension");
const out = mkdtempSync(join(tmpdir(), "onelook-"));
const { build } = await import(
  pathToFileURL(join(here, "node_modules", "esbuild", "lib", "main.js")).href
);
await build({
  entryPoints: [join(here, "controls.ts")],
  bundle: true, format: "esm", outdir: out, logLevel: "silent",
  outExtension: { ".js": ".mjs" },
});
const { controlCss } = await import(pathToFileURL(join(out, "controls.mjs")).href);
const shared = controlCss();

let bad = 0;
const say = (what, ok, why) => {
  if (!ok) bad++;
  console.log((ok ? "ok   " : "FAIL ") + " look: " + what + (ok || !why ? "" : "\n      " + why));
};

// WHICH ELEMENTS THE SHARED SHEET COVERS, read out of the sheet rather than
// listed here, so a rule removed from it is a rule this stops claiming.
const covers = new Set();
for (const selector of shared.matchAll(/(^|[,{}])\s*([a-z]+)(\[[^\]]*\])?\s*(?=[,{])/g)) {
  covers.add(selector[2]);
}
say("the shared sheet styles some control (" + [...covers].sort().join(", ") + ")", covers.size > 0,
  "nothing was read out of the stylesheet, so this guards nothing");

// THE PAGES, AS THEY ARE EMITTED. A rule about what a page draws is checked on
// what the page draws.
const pages = [];
for (const [file, make] of [["panel.ts", "panelHtml"], ["editor.ts", "editorHtml"]]) {
  const text = readFileSync(join(here, file), "utf8");
  pages.push({ file, text, make });
}

// A CONTROL DRAWN OUTSIDE THE SHARED SHEET.
for (const p of pages) {
  const drawn = new Set();
  for (const tag of p.text.matchAll(/<(input|select|button|textarea)\b/g)) drawn.add(tag[1]);
  for (const tag of p.text.matchAll(/createElement\('(input|select|button|textarea)'\)/g)) drawn.add(tag[1]);
  say(p.file + " draws only controls the shared sheet covers (" + [...drawn].sort().join(", ") + ")",
    [...drawn].every((t) => covers.has(t)),
    [...drawn].filter((t) => !covers.has(t)).join(", ") + " is drawn and not styled");
}

// A COLOUR SAID OUT LOUD. Anything that is not a variable will be right in one
// theme and wrong in every other.
// WHAT COUNTS AS SAYING A COLOUR OUT LOUD. A literal in a property that paints
// the control, and not one inside a var() fallback, which is the shape that
// keeps the theme's variable working and still draws something without it.
//
// A SHADOW IS NOT A THEME COLOUR. It is a black at low opacity and it reads the
// same in every theme, so box-shadow is left alone.
const PAINTS = /(?:^|[;{])\s*(background|background-color|color|border|border-color|outline-color|fill|stroke)\s*:\s*([^;}]*)/g;
const LITERAL = /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(|\b(?:white|black|red|blue|green|grey|gray|yellow|orange|silver|navy)\b/;

function saysAColour(line) {
  for (const paint of line.matchAll(PAINTS)) {
    // A fallback inside var() is the good shape, so it comes out first.
    const value = paint[2].replace(/var\([^)]*\)/g, "");
    if (LITERAL.test(value)) return true;
  }
  return false;
}
for (const p of pages.concat([{ file: "controls.ts", text: shared }])) {
  const found = [];
  p.text.split("\n").forEach((line, i) => {
    // A LINE MAY SAY THE COLOUR IS NOT A THEME'S. There is none today, and the
    // escape is what makes a deliberate one a decision somebody wrote down.
    if (/not a theme colour/.test(line)) return;
    if (/^\s*(\/\/|\*|\/\*)/.test(line)) return;
    if (saysAColour(line)) found.push((i + 1) + ": " + line.trim());
  });
  say(p.file + " writes no colour of its own", found.length === 0, found.slice(0, 5).join("\n      "));
}

// A HIDDEN CONTROL IS HIDDEN.
//
// An author's display rule beats the browser's own [hidden] before specificity
// is looked at, so styling the bare element made every hidden button visible.
// The group and rename buttons showed with nothing ticked, in a bar with no
// room for them, drawn clipped and out of line with their neighbours.
{
  const setsDisplay = /(^|[,{}])\s*(button|input|select|textarea)[^{,]*\{[^}]*display\s*:/.test(shared);
  const saysHidden = /\[hidden\][^{]*\{[^}]*display\s*:\s*none\s*!important/.test(shared);
  say("the shared sheet sets display on a control", setsDisplay,
    "nothing sets display, so this guards nothing");
  say("and it says what hidden means, louder than the browser does", saysHidden,
    "an author rule beats the browser's [hidden], so every hidden control would draw");
}

// A VARIABLE WITH NO FALLBACK. An undefined one makes the whole declaration
// invalid at computed-value time, and the control then draws whatever the
// browser draws, which is a white box on a dark page.
{
  const bare = [];
  for (const use of shared.matchAll(/(background|color)\s*:\s*var\(([^)]*)\)/g)) {
    if (!use[2].includes(",")) bare.push(use[0]);
  }
  say("every colour in the shared sheet falls back when the theme has no such variable",
    bare.length === 0, bare.join("\n      "));
}

console.log("\n" + bad + " failed.");
process.exit(bad ? 1 : 0);
