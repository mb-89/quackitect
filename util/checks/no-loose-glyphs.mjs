// NOTHING BUT THE TABLE CARRIES A GLYPH.
//
// A control, a heading or a button names an icon, and util/icons.json decides
// what that name looks like. A glyph written into the source is a second copy
// of that decision, and it goes wrong the moment somebody edits the table: the
// table drew one arrow and a click drew the other.
//
// IT SEARCHES FOR THE PROPERTY AND NOT FOR THE REGISTRY. Reading the table and
// looking for the marks it declares could only ever refuse marks that were
// already in the table, and a mark that is nowhere in it is the actual
// violation. Five went past that way, a gear on a button among them.
//
// SO EVERY CHARACTER ABOVE U+007F IN A FILE THAT DRAWS IS REFUSED, and the
// table is the exemption list rather than the search list. Numeric character
// references are decoded first, because a gear written as &#9881; is the same
// decision as a gear written as the character.
//
// THE NOT AN ICON ESCAPE STAYS. One mark can mean two things, and a line that
// says the character is data is how a separator is told from a mark. It makes
// each of these a decision somebody made rather than one nobody saw.
//
//   node .se/scratchpad/no-loose-glyphs.mjs <root>
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const root = process.argv[2] ?? ".";
const icons = JSON.parse(readFileSync(join(root, "util/icons.json"), "utf8"));

// WHERE A MARK IS DRAWN. Anything else may hold a character above U+007F for
// its own reasons: extension.ts splits on a middle dot as data, and refusing
// that would be refusing a program the right to use a character.
const DRAWS = [
  ["src/extension", ["editor.ts", "panel.ts"]],
  ["src/viewer", null], // every .go file, because any of them may print
  ["src/filter", null], // the log syntax reader, which moved out of the viewer
];

// AN ASCII GLYPH IS NOT SEARCHED FOR. The table names # and {} as column-type
// marks, and those are Go and JavaScript syntax. A check that refused them
// would refuse the language.
const declared = new Map();
for (const [name, entry] of Object.entries(icons)) {
  if (name.startsWith("$") || !entry?.glyph) continue;
  if (![...entry.glyph].some((c) => c.codePointAt(0) > 127)) continue;
  const at = declared.get(entry.glyph) ?? [];
  at.push(name);
  declared.set(entry.glyph, at);
}

// Every character the table spends, so a mark made of two code points is not
// reported one code point at a time after the whole mark has been.
const spent = new Set();
for (const glyph of declared.keys()) {
  for (const c of glyph) spent.add(c);
}

// A gear written as &#9881; is the same decision as a gear written as the
// character, and a search for the character alone misses it in a file that
// generates HTML.
function decoded(line) {
  return line
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#([0-9]+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)));
}

// A glyph the table declares, found in a file that draws, outside a comment.
function looseIn(text) {
  const out = [];
  // A CARRIAGE RETURN IS A LINE TERMINATOR TO A REGULAR EXPRESSION, so a line
  // that kept one never matched the comment rule, and every comment in a file
  // written with CRLF was read as code.
  text.split(/\r?\n/).forEach((line, i) => {
    // A LINE MAY SAY THE CHARACTER IS DATA. One mark can mean two things: the
    // table names a middle dot for an empty value and the log window uses one
    // as a separator. Saying so on the line is how they are told apart.
    if (/not an icon/.test(line)) return;
    const code = decoded(line.replace(/^\s*(\/\/|#).*$/, ""));
    // A DECLARED GLYPH, WHOLE, IS A SECOND COPY OF THE TABLE'S DECISION.
    for (const [glyph, names] of declared) {
      if (code.includes(glyph)) out.push({ line: i + 1, glyph, names });
    }
    // AND ANYTHING ELSE ABOVE U+007F IS A MARK NOBODY DECLARED.
    const already = new Set();
    for (const c of code) {
      if (c.codePointAt(0) <= 127 || spent.has(c) || already.has(c)) continue;
      already.add(c);
      const at = c.codePointAt(0).toString(16).toUpperCase().padStart(4, "0");
      out.push({ line: i + 1, glyph: c, names: ["nothing, and it is at U+" + at] });
    }
  });
  return out;
}

let bad = 0;
const say = (what, ok) => {
  if (!ok) bad++;
  console.log((ok ? "ok   " : "FAIL ") + " glyphs: " + what);
};

// A CHECK THAT FINDS NOTHING TO CHECK REFUSES. With an empty table it read
// every file and asserted nothing about any of them, printing a line of ok for
// each and then zero failed. The day the table moves or its shape changes,
// that is what this would say while nothing at all was guarded.
say("the table declares a glyph to look for", declared.size > 0);

let read = 0;

for (const [dir, only] of DRAWS) {
  const names = only ?? readdirSync(join(root, dir)).filter((f) => f.endsWith(".go") && !f.endsWith("_test.go"));
  for (const name of names) {
    const where = join(dir, name);
    read++;
    const found = looseIn(readFileSync(join(root, where), "utf8"));
    say(where + " carries no glyph the table declares", found.length === 0);
    for (const f of found) {
      console.log(`      ${where}:${f.line} writes ${f.glyph}, which the table names ${f.names.join(" and ")}`);
    }
  }
}

// AND NOTHING TO READ IS THE SAME REFUSAL. A list of folders that names no
// file guards nothing, however many glyphs the table declares.
say("there is a file that draws to read", read > 0);

console.log(`\n${declared.size} glyphs declared, ${read} file(s) read. ${bad} failed.`);
process.exit(bad ? 1 : 0);
