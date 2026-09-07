// A COMMENT THAT POINTS AT A TOKEN FOR WORK STILL TO COME POINTS AT AN OPEN ONE.
//
// testedgate.go said "wk-5c682f1a25 carries making an absent record a refusal",
// and that token had closed deferring it. A reader who follows the pointer
// finds a closed note and no work, and the sentence in the code is a promise
// nobody is keeping. a2c6b96 moved it to wk-be226f6ab8, which is open.
//
// THE RULE THIS REPLACES ASKED GIT, AND GIT ANSWERS THE WRONG QUESTION. It
// took every id in a src Go file, asked git log -S which commit first put that
// line there, and failed where the commit's subject named the same id. Run over
// the tip at d1aa9e3 it looked at 24 pairs and failed 7.
//
// SIX OF THE SEVEN WERE PROVENANCE A READER WANTS. removal.go:96 says "See
// wk-9875cf128f." and the commit that put it there is wk-9875cf128f's own: the
// code pointing at the evidence that explains it. investigate.go, proxy.go,
// pull.go, schema.go and search.go carry the same shape. A check built on that
// rule reddens the battery over six deliberate comments.
//
// SO THE SENTENCE DECIDES, AND THE TENSE IS THE SIGNAL. "wk-963dbf6898 carried
// an ask of 249 words" is history. "wk-be226f6ab8 carries making an absent
// record a refusal" is a promise. One verb apart, and only the second can be
// broken by the token ending.
//
// THE VOCABULARY IS THE TREE'S OWN, not a list of every word English has for
// it. Measured over src today: carries at pull.go:647, testedgate.go:350 and
// tidy.go:181, and settles at owed.go:104. The siblings below are the same
// promise in another word. A promise made in a verb outside this set is a miss
// rather than a false alarm, which is the direction this check exists to hold.
//
// AND THE RECORD SAYS WHAT ENDED, BECAUSE GIT CANNOT. A note on disk carries
// its status, and doc/work/archive.jsonl carries a row for what has been closed
// and swept.
//
// AN ID THE RECORD DOES NOT KNOW IS LEFT ALONE. The archive carries 127 ids,
// and eight named in src are in neither it nor doc/work: wk-4b67d7126a and
// wk-9875cf128f among them. Nothing here can tell an id lost from the archive
// from one that never existed, and wk-2a0d33d3be and wk-7a32df0461 are open on
// that gap. Calling an unknown id ended would fail this check on the archive's
// defect rather than on the comment's.
//
//   node util/checks/comments-name-open-work.mjs <root>
//
// reads: src/**/*.go, doc/work/*.md, doc/work/archive.jsonl
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";

const root = process.argv[2] ?? ".";

let failed = 0;
const die = (why) => {
  console.log("FAIL " + why);
  process.exit(1);
};

// THE PROMISE VERBS. The first two are measured in the tree, and the rest are
// the same promise in another word.
const promises = new Set([
  "carries", "carry",
  "settles", "settle",
  "holds", "hold",
  "takes", "take",
  "brings", "bring",
  "finishes", "finish",
  "covers", "cover",
]);

const anID = /wk-[0-9a-f]{10}/g;

// theRecord answers which ids have ended, and how many it knows at all. A note
// on disk answers for itself, and the archive answers for what was swept.
function theRecord() {
  const ended = new Set();
  const known = new Set();
  const where = join(root, "doc", "work");
  if (!existsSync(where)) die("doc/work is not there, so nothing says which tokens have ended");
  for (const name of readdirSync(where)) {
    if (!name.endsWith(".md") || statSync(join(where, name)).isDirectory()) continue;
    const id = name.slice(0, -".md".length);
    if (!/^wk-[0-9a-f]{10}$/.test(id)) continue;
    known.add(id);
    const status = /^status:[ \t]*(\S+)[ \t]*$/m.exec(readFileSync(join(where, name), "utf8"));
    if (status !== null && status[1] === "closed") ended.add(id);
  }
  const archive = join(where, "archive.jsonl");
  if (!existsSync(archive)) die("doc/work/archive.jsonl is not there, so nothing says what was swept");
  for (const line of readFileSync(archive, "utf8").split("\n")) {
    if (line.trim() === "") continue;
    let row;
    try { row = JSON.parse(line); } catch { continue; }
    if (typeof row?.id !== "string") continue;
    known.add(row.id);
    ended.add(row.id);
  }
  if (known.size === 0) die("the record names no token at all, so this check would pass everything");
  return { ended, known };
}

// theGoFiles answers every Go file under src that is not a test.
function theGoFiles(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const at = join(dir, name);
    if (statSync(at).isDirectory()) theGoFiles(at, out);
    else if (name.endsWith(".go") && !name.endsWith("_test.go")) out.push(at);
  }
  return out;
}

const aComment = (line) => /^\s*\/\//.test(line);
const theProse = (line) => line.replace(/^\s*\/\/\s?/, "");

// theWordAfter answers the first word following this id, reading on into the
// comment lines that continue the sentence. owed.go puts the id at the end of
// one line and its verb at the start of the next, so a rule reading one line
// would call that sentence silent.
function theWordAfter(lines, at, rest) {
  let text = rest;
  for (let i = at + 1; i < lines.length && aComment(lines[i]) && text.trim() === ""; i++) {
    text += " " + theProse(lines[i]);
  }
  const word = /^[\s",.;:)\]]*([A-Za-z][A-Za-z-]*)/.exec(text);
  return word === null ? "" : word[1].toLowerCase();
}

const { ended, known } = theRecord();

const src = join(root, "src");
if (!existsSync(src)) die("src is not there, so this guards nothing");
const files = theGoFiles(src).sort();
if (files.length === 0) die("src holds no Go file that is not a test, so this guards nothing");

let judged = 0;
let promised = 0;

for (const file of files) {
  const shown = file.replace(/\\/g, "/").slice(root === "." ? 0 : root.length + 1);
  const lines = readFileSync(file, "utf8").split("\n");
  for (let i = 0; i < lines.length; i++) {
    if (!aComment(lines[i])) continue;
    const line = lines[i];
    for (const m of [...line.matchAll(anID)]) {
      judged++;
      const id = m[0];
      const word = theWordAfter(lines, i, line.slice(m.index + id.length));
      if (!promises.has(word)) continue;
      promised++;
      // AN ID NOBODY HAS A RECORD OF IS NOT AN ENDED ONE.
      if (!known.has(id) || !ended.has(id)) continue;
      console.log(
        "FAIL " + shown + ":" + (i + 1) + " says \"" + id + " " + word + "\", and the record "
        + "says " + id + " has ended. A comment pointing at a token for work still to come "
        + "points a reader at a closed note and no work",
      );
      failed++;
    }
  }
}

// A CHECK THAT FINDS NOTHING TO JUDGE IS NOT A GREEN CHECK.
if (judged === 0) die("no comment under src names a token, so this check judged nothing");

console.log(files.length + " file(s) read, " + judged + " mention(s) judged, "
  + promised + " naming work still to come. " + failed + " failed.");
process.exit(failed === 0 ? 0 : 1);
