// A COUNT ON THE PANEL FOLLOWS THE ENGINE, and is not written in once.
//
// The queue depth was rendered into the html from whatever answer the panel
// held when it was built. On a fresh panel that is nothing, so it read zero
// while the engine answered two hundred and fourteen, and it stayed at zero
// for as long as the panel was open.
//
// A NUMBER THAT IS WRONG AND STILL is worse than one that is missing. A person
// watching a bucket empty acts on it, and a stuck zero says the bucket is done.
//
// SO THIS DRIVES THE LIVE PATH. It builds the panel with one answer, asks for
// the pieces with another, and reads the number out of what would be sent. A
// count that is only in the html and never in the message fails here.
//
//   node util/checks/a-count-follows-the-engine.mjs <root>
import { execFileSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const root = resolve(process.argv[2] ?? ".");
const here = join(root, "src", "extension");
const se = join(root, ".bin", process.env.SE_EXE || (process.platform === "win32" ? "se.exe" : "se"));

let failed = 0;
const ok = (said) => console.log("ok    " + said);
const no = (said) => { console.log("FAIL  " + said); failed++; };
const refuse = (why) => { console.error(why); process.exit(1); };

let tree;
try {
  tree = JSON.parse(execFileSync(se, ["--tree", "--method", root], { encoding: "utf8" }));
} catch (err) {
  refuse("the engine could not be asked for the tree: " + (err.stderr ?? err.message));
}

// THE DECLARATION HAS TO CARRY A COUNT, or this counted nothing.
const counts = [];
(function walk(n) {
  if (n.type === "count") counts.push(n);
  for (const c of n.children ?? []) walk(c);
})(tree);
if (counts.length === 0) {
  refuse("the declaration names no count, so there is nothing here to follow the engine");
}
ok(`the declaration names ${counts.length} count(s)`);

const out = mkdtempSync(join(tmpdir(), "count-"));
const { build } = await import("file://" + join(here, "node_modules", "esbuild", "lib", "main.js"));
await build({
  entryPoints: [join(here, "panel.ts")],
  bundle: true, format: "esm", outdir: out, logLevel: "silent", outExtension: { ".js": ".mjs" },
});
const { panelHtml, livePieces } = await import("file://" + join(out, "panel.mjs"));

const shown = (tree.children ?? []).map((c) => c.name);
const nothing = { actors: [], hold: { on: false }, present: [] };

// THE PANEL IS BUILT KNOWING NOTHING, which is how a fresh one is built.
const page = panelHtml(tree, shown, {}, nothing);
for (const n of counts) {
  const where = n.source ?? n.name;
  if (page.includes(`data-count="${where}"`)) ok(`${n.name} draws a cell the beat can fill`);
  else no(`${n.name} draws no data-count cell, so nothing can replace its number`);
}

// AND THE NUMBER ARRIVES ON THE BEAT, from an answer the panel never saw.
const later = { ...nothing, queue: 214 };
const pieces = livePieces(tree, shown, later);
if (!pieces.counts) {
  refuse("livePieces sends no counts at all, so no count can ever follow the engine");
}
for (const n of counts) {
  const where = n.source ?? n.name;
  const got = pieces.counts[where];
  if (got === undefined) no(`${n.name} is in no beat message, so its number is written once and never again`);
  else if (got !== "214") no(`${n.name} sent ${JSON.stringify(got)} for an engine answering 214`);
  else ok(`${n.name} follows the engine: ${got}`);
}

// A SOURCE NOBODY ANSWERS DRAWS NOTHING, NOT A ZERO. Zero is a fact about an
// empty queue and a person acts on it, so a missing answer must not look alike.
const blank = livePieces(tree, shown, nothing);
for (const n of counts) {
  const got = blank.counts[n.source ?? n.name];
  if (got === "0") no(`${n.name} draws 0 when the engine answered nothing, which reads as an empty queue`);
  else ok(`${n.name} draws nothing rather than a zero when there is no answer`);
}

console.log(failed ? `\n${failed} failed.` : "\n0 failed.");
process.exit(failed ? 1 : 0);
