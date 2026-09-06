// THE CAGE CITES NOTHING A READER CANNOT OPEN.
//
// The two settings files carry a long $comment, and it is the only place a
// reader learns why the cage is shaped the way it is. It ended by naming the
// token the measurement was on, and that token was a private note on another
// box. It never travelled. So every clone shipped a comment pointing at an id
// that resolves to nothing, and the reader has no way to tell a lost source
// from one they simply have not found.
//
// A token this names has to be openable from the tree the comment ships in:
// a note under doc/work or .se/work, or a row in the archive.
//
// A PATH IS A CITATION TOO. The comment names files as well as tokens, and a
// path into the method that no clone carries is the same shut door as a lost
// id. Only the method's own folders are resolved: what the engine writes under
// .claude is absent until it has run, and that is not this check's business.
//
// It reads the folders rather than the index, so it answers on a fresh clone
// where no index has been built yet.
//
//   node util/checks/the-cage-cites-what-is-here.mjs <root>
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.argv[2] ?? ".";

let bad = 0;
function say(what, ok, why) {
  if (!ok) bad++;
  console.log((ok ? "  ok   " : "  FAIL ") + what + (ok ? "" : "\n         " + why));
}

function notesIn(dir) {
  try {
    return readdirSync(dir).filter((n) => n.endsWith(".md")).map((n) => n.slice(0, -3));
  } catch {
    return [];
  }
}

// WHAT A READER CAN OPEN, in the three places a token can be.
const here = new Set([...notesIn(join(root, "doc", "work")), ...notesIn(join(root, ".se", "work"))]);
let archived = 0;
try {
  for (const line of readFileSync(join(root, "doc", "work", "archive.jsonl"), "utf8").split("\n")) {
    if (!line.trim()) continue;
    let row;
    try {
      row = JSON.parse(line);
    } catch {
      continue; // a row nothing can read names no id either way
    }
    if (row && typeof row.id === "string") {
      here.add(row.id);
      archived++;
    }
  }
} catch {
  // no archive on this clone, and the notes alone answer
}

say("there are tokens to resolve against (" + here.size + ")", here.size > 0,
  "no note under doc/work or .se/work and no archive row, so every citation "
  + "would look broken and this check would fail for the wrong reason");

// THE FILES THAT CARRY THE CAGE. The tracked one is what every clone gets and
// the two under .claude are what this box runs, and a citation in any of them
// reaches a reader.
const cages = [
  join(root, "util", "cage", "claude-settings.json"),
  join(root, "util", "cage", "claude-settings-local.json"),
  join(root, ".claude", "settings.json"),
];

const names = /wk-[0-9a-f]{10}/g;
// A path into the method, which is util, doc and src. It ends in an
// extension, so a folder named in passing is not read as a file.
const files = /\b(?:util|doc|src)(?:\/[A-Za-z0-9._-]+)+\.[a-z]+\b/g;

let looked = 0;
for (const path of cages) {
  let text;
  try {
    text = readFileSync(path, "utf8");
  } catch {
    continue; // a file this clone does not carry says nothing either way
  }
  looked++;
  const cited = new Set();
  for (const m of text.matchAll(names)) cited.add(m[0]);
  const lost = [...cited].filter((id) => !here.has(id)).sort();
  say(path + " cites only tokens this tree carries", lost.length === 0,
    path + " names " + lost.join(", ") + ", which "
    + (lost.length === 1 ? "is" : "are") + " in no note under doc/work or "
    + ".se/work and in no archive row. A reader of this comment cannot open "
    + "it. Name a source the tree carries, or say in words what the source held");

  const named = new Set();
  for (const m of text.matchAll(files)) named.add(m[0]);
  const gone = [...named].filter((f) => !existsSync(join(root, f))).sort();
  say(path + " names only files this tree carries", gone.length === 0,
    path + " names " + gone.join(", ") + ", which this tree does not carry. A "
    + "reader of this comment cannot open " + (gone.length === 1 ? "it" : "them")
    + ". Name a file the tree has, or say in words what it held");
}

say("the cage files were found (" + looked + ")", looked > 0,
  "none of the settings files could be read, so nothing was checked");

console.log("\n" + looked + " cage file(s) read against " + here.size
  + " token(s), " + archived + " of them archived. " + bad + " failed.");
process.exit(bad ? 1 : 0);
