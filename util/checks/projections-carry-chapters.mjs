// A PROJECTION CARRIES ONE CHAPTER, NOT THE WHOLE FILE.
//
// util/projections.json names the one chapter a projected file takes from each
// of its sources, and each source arrives under its own title. An engine built
// before that rule wrote the sources whole, so the projected file grew their
// Motivation and Discussion chapters as well, and an agent read a standing
// layer several times the size it should be. Nothing said so. The file is
// generated, so nobody diffs it, and both shapes look plausible to a reader who
// has not seen the other one.
//
// THE HEADINGS ARE THE WHOLE TEST. What a chapter says is its source's
// business. Which chapters arrived, in which order, is this check's.
//
//   node util/checks/projections-carry-chapters.mjs <root>
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";

const root = process.argv[2] ?? ".";

let bad = 0;
function say(what, ok, why) {
  if (!ok) bad++;
  console.log((ok ? "  ok   " : "  FAIL ") + what + (ok ? "" : "\n         " + why));
}

// A SOURCE'S TITLE IS ITS FILE NAME, kebab-case read back as one sentence.
function titleOf(file) {
  const words = file.replace(/\.md$/, "").split("-");
  return words.map((w, i) => (i === 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w)).join(" ");
}

function headingsOf(text) {
  const out = [];
  for (const line of text.split("\n")) {
    const m = /^(#{1,6}) +(.*?)\s*$/.exec(line);
    if (m) out.push({ depth: m[1].length, text: m[2] });
  }
  return out;
}

// The headings inside one chapter, each by how far it sits below the chapter's
// own line, so a source that is written at one level projects at another.
function chapterOf(text, name) {
  const hs = headingsOf(text);
  const at = hs.findIndex((h) => h.text === name);
  if (at < 0) return null;
  const level = hs[at].depth;
  const out = [];
  for (const h of hs.slice(at + 1)) {
    if (h.depth <= level) break;
    out.push({ depth: h.depth - level, text: h.text });
  }
  return out;
}

const line = (depth, text) => "#".repeat(depth) + " " + text;

const specPath = join(root, "util", "projections.json");
if (!existsSync(specPath)) {
  say("util/projections.json is there", false,
    "without it nothing says which chapter a projection carries");
  console.log("\n0 projection(s) read. " + bad + " failed.");
  process.exit(1);
}
const spec = JSON.parse(readFileSync(specPath, "utf8"));

let read = 0;
for (const p of spec.projections ?? []) {
  // ONLY A CHAPTERED PROJECTION IS THIS CHECK'S BUSINESS. One that copies a
  // whole file names no section, and copying it whole is what it is for.
  if (!p.section || !p.sources_from) continue;
  read++;

  const target = join(root, p.target);
  if (!existsSync(target)) {
    say(p.name + " is in the tree", false,
      p.target + " is named by util/projections.json and is not there");
    continue;
  }

  const want = [];
  if (p.preamble) {
    const pre = join(root, p.preamble);
    if (!existsSync(pre)) {
      say(p.name + " has its preamble", false,
        p.preamble + " is named by util/projections.json and is not there");
      continue;
    }
    for (const h of headingsOf(readFileSync(pre, "utf8"))) want.push(line(h.depth, h.text));
  }

  const dir = join(root, p.sources_from);
  const files = readdirSync(dir)
    .filter((f) => f.endsWith(".md") && statSync(join(dir, f)).isFile())
    .sort();
  let undefinedSource = false;
  for (const f of files) {
    const chapter = chapterOf(readFileSync(join(dir, f), "utf8"), p.section);
    if (chapter === null) {
      say(p.sources_from + "/" + f + " carries a " + p.section + " chapter", false,
        "it is a source of " + p.name + " and has no " + p.section
        + " chapter, so what the projection takes from it is undefined");
      undefinedSource = true;
      continue;
    }
    want.push(line(1, titleOf(f)));
    want.push(line(2, p.section));
    for (const h of chapter) want.push(line(2 + h.depth, h.text));
  }
  if (undefinedSource) continue;

  const got = headingsOf(readFileSync(target, "utf8")).map((h) => line(h.depth, h.text));
  const extra = got.filter((h) => !want.includes(h));
  const absent = want.filter((h) => !got.includes(h));
  const same = got.length === want.length && got.every((h, i) => h === want[i]);

  say(p.target + " carries the " + p.section + " chapters and nothing else", same,
    (extra.length ? "it carries " + extra.length + " heading(s) no source puts there, the first being \"" + extra[0] + "\". " : "")
    + (absent.length ? "it is missing " + absent.length + " heading(s) a source puts there, the first being \"" + absent[0] + "\". " : "")
    + (!extra.length && !absent.length ? "it carries the right headings in the wrong order. " : "")
    + "A projection takes one chapter from each source, under that source's title. Whole sources here mean the build that wrote it predates that rule");
}

say("a chaptered projection was read (" + read + ")", read > 0,
  "util/projections.json named none, so this has nothing to judge and is not doing its job");

console.log("\n" + read + " projection(s) read. " + bad + " failed.");
process.exit(bad ? 1 : 0);
