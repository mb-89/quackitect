// THE BAR DRAWS THE BURN DOWN, driven rather than read.
//
// BD: three numbers separated by slashes, small, with the detail on hover and
// not on the bar. The page is rendered from an answer this check builds, and
// then from a second one, so a bar that prints numbers of its own fails.
//
// THE FOURTH NUMBER WENT WITH THE REVIEW FLOW. It was the rate at which tokens
// fail reviews, nothing writes a verdict any more, and a rate over no reviews
// reads as nought percent, which is a claim that everything passes.
//
//   node util/checks/burndown.mjs <root>
import { execFileSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const root = resolve(process.argv[2] ?? ".");
const here = join(root, "src", "extension");
const out = mkdtempSync(join(tmpdir(), "burndown-"));
const { build } = await import(
  pathToFileURL(join(here, "node_modules", "esbuild", "lib", "main.js")).href);
await build({
  entryPoints: [join(here, "editor.ts"), join(here, "engineargs.ts")],
  bundle: true, format: "esm", outdir: out, logLevel: "silent", outExtension: { ".js": ".mjs" },
});
const { editorHtml } = await import(pathToFileURL(join(out, "editor.mjs")).href);
const A = await import(pathToFileURL(join(out, "engineargs.mjs")).href);
const { JSDOM } = await import(
  pathToFileURL(join(here, "node_modules", "jsdom", "lib", "api.js")).href);

let failed = 0;
const ok = (said) => console.log("ok    " + said);
const no = (said) => { console.log("FAIL  " + said); failed++; };

// THE ARGUMENTS COME FROM engineargs, so the builder is one engine-args.mjs
// already walks and no flag is written at the call site.
if (typeof A.burndownArgs !== "function") {
  console.error("engineargs declares no burndownArgs, so this check guards nothing");
  process.exit(1);
}
ok("engineargs declares the builder");

const exe = join(root, ".bin", process.platform === "win32" ? "se.exe" : "se");
let live;
try {
  live = JSON.parse(execFileSync(exe, [...A.burndownArgs(), "--work", root], { encoding: "utf8" }));
} catch (e) {
  no("the engine would not answer the builder's call: " + String(e).split("\n")[0]);
}
if (live) {
  for (const field of ["minted", "done", "open", "says", "detail", "window"]) {
    if (live[field] === undefined) no(`the engine's answer carries no ${field}`);
  }
  if (typeof live.says === "string" && live.says.startsWith("BD:")) ok("the engine says BD and three numbers");
  else no(`the engine says ${JSON.stringify(live?.says)} rather than BD and three numbers`);
}

const anAnswer = (n) => ({
  day: "2026-08-3" + n, minted: n, done: n + 1, open: n + 2,
  window: "the window for " + n,
  says: `BD: ${n}/${n + 1}/${n + 2}`,
  detail: `the detail for ${n}`,
});

const pageFor = (b) => editorHtml([{ side: "left", table: { view: "work", columns: [], heads: {}, total: 0 } }],
  ["work"], "work", b);

const first = new JSDOM(pageFor(anAnswer(1)));
const second = new JSDOM(pageFor(anAnswer(5)));

const bd = first.window.document.querySelector(".bd");
if (!bd) { console.log("FAIL  the bar draws no burn down"); process.exit(1); }
ok("the bar draws it");

// BD AND FOUR NUMBERS SEPARATED BY SLASHES.
const text = bd.textContent.trim();
if (!/^BD:\s*\d+\/\d+\/\d+$/.test(text)) {
  no(`the bar reads ${JSON.stringify(text)} rather than BD and three numbers separated by slashes`);
} else ok("BD, three numbers, slashes");

// THE DETAIL IS ON HOVER AND NOT ON THE BAR.
if (bd.getAttribute("title") !== "the detail for 1") {
  no(`the hover reads ${JSON.stringify(bd.getAttribute("title"))} rather than the detail it was handed`);
} else ok("the detail is on hover");
if (text.includes("the detail for 1")) no("the detail is on the bar as well as on the hover");
else ok("the detail is not on the bar");

// AND IT DRAWS WHAT IT WAS HANDED. A bar that prints numbers of its own says
// the same thing over two different answers.
const other = second.window.document.querySelector(".bd");
if (!other || other.textContent.trim() === text) {
  no("the bar says the same over two different answers, so it is not drawing what it was handed");
} else ok("two answers, two bars");
if (other && other.textContent.trim() !== "BD: 5/6/7") {
  no(`the second bar reads ${JSON.stringify(other.textContent.trim())} rather than what it was handed`);
} else ok("the second bar carries its own four numbers");

// AND NO BURN DOWN, NO BAR. A page built before the engine answered draws
// nothing rather than four zeroes, which would read as a quiet day.
const none = new JSDOM(pageFor(undefined));
if (none.window.document.querySelector(".bd")) {
  no("a page built with no answer still draws a burn down, so the numbers are made here");
} else ok("no answer, nothing drawn");

console.log(failed ? `\n${failed} failed.` : "\n0 failed.");
process.exit(failed ? 1 : 0);
