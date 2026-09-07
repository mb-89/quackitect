// A NOTE THAT CALLS A SNAPSHOT ABSENT IS RIGHT ABOUT IT.
//
// The engine warns a box at session start that the snapshots its tokens name
// were taken elsewhere and are no objects here. That warning is true of a token
// begun on another box and false of one begun on this one, where the engine
// wrote the snapshot itself. Repeated onto a note without asking git, it is a
// claim nobody checked.
//
// MEASURED, 2026-09-07. wk-c7d3a72daa's note said 7b85042f is no object in this
// clone. git cat-file -t 7b85042f answers commit. It was held by
// refs/se/steps/7b85042fb562, written on this box when the work was taken up,
// and git diff over its span was exactly that token's two files. Six notes from
// one session carried the same sentence about a snapshot that resolved, and
// five about one that did not.
//
// THE COST IS PAID BY THE REVIEWER. reviewing tells them to read every hunk of
// the named span, and a note saying the span cannot be read sends them to HEAD
// instead. The authoritative diff was sitting there and the note said it was
// not, so a reviewer who takes the claim at its word has reviewed the note.
//
// SO THE CLAIM IS ASKED OF GIT. Every hexadecimal word in a sentence that calls
// something no object is put to git cat-file -t, and one that answers is the
// failure. A note may still say a snapshot is absent: it may not be wrong.
//
// WHERE THERE IS NO REPOSITORY THIS ASKS NOTHING, the way the head-builds check
// does. The battery also runs over a clean archive of a commit, which holds no
// .git, and a check that failed for want of one would say nothing about any
// note.
//
//   node util/checks/an-absent-snapshot-is-absent.mjs <root>
//
// reads: doc/work/*.md, and the repository over <root>
import { spawnSync } from "node:child_process";
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";

const root = process.argv[2] ?? ".";
const where = "doc/work";
const here = join(root, where);

const die = (why) => {
  console.log("FAIL " + why);
  process.exit(1);
};

if (!existsSync(here)) die(where + " is not there, so this guards nothing");

const git = (...args) => spawnSync("git", ["-C", root, ...args], { encoding: "utf8" });
if ((git("rev-parse", "--git-dir").stdout ?? "").trim() === "") {
  console.log("  ok   there is no repository over " + root + " to ask, so this says nothing");
  process.exit(0);
}

// theClaim is a sentence calling something no object, and anID is the shape of
// a snapshot named in one. Seven is where git's own short hash begins.
const theClaim = /\bno object\b/i;
const anID = /\b[0-9a-f]{7,40}\b/g;
const theSentences = (line) => line.split(/(?<=[.;:])\s+/);

// A QUOTATION IS NOT THE NOTE'S OWN CLAIM. A finding reports the sentence it
// found by writing it out, so a note that exists to say the claim is wrong
// carries it word for word. Read as the note's own it is the very defect being
// reported, and the check would refuse the report rather than the fault.
//
// MEASURED: this check's first run refused wk-20f5fba187, the finding that
// asked for it, on the sentence it was quoting.
const withoutQuotations = (said) => said.replace(/"[^"]*"/g, " ");

// resolves answers whether git knows this id, asked once per id.
const asked = new Map();
const resolves = (id) => {
  if (!asked.has(id)) {
    asked.set(id, git("cat-file", "-t", id).status === 0);
  }
  return asked.get(id);
};

const notes = readdirSync(here)
  .filter((name) => name.endsWith(".md"))
  .filter((name) => !statSync(join(here, name)).isDirectory())
  .sort();
if (notes.length === 0) die(where + " holds no note, so this guards nothing");

let read = 0;
let judged = 0;
let failed = 0;

for (const name of notes) {
  const text = readFileSync(join(here, name), "utf8");
  const status = /^status:[ \t]*(\S+)[ \t]*$/m.exec(text);
  if (status !== null && status[1] === "closed") continue;
  read++;
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    for (const whole of theSentences(lines[i])) {
      const said = withoutQuotations(whole);
      if (!theClaim.test(said)) continue;
      for (const id of said.match(anID) ?? []) {
        judged++;
        if (!resolves(id)) continue;
        console.log(
          "FAIL " + where + "/" + name + ":" + (i + 1) + " calls " + id + " no object, "
          + "and git cat-file -t " + id + " answers it. A reviewer told the span cannot be "
          + "read goes to HEAD instead, and reviews the note rather than the change",
        );
        failed++;
      }
    }
  }
}

// A CHECK THAT READS NOTHING IS NOT A GREEN CHECK, and what it must read is the
// open notes. The claim itself is rare, so a run that finds none of it has
// judged a clean tree rather than judged nothing. Guarding on the claims would
// fail every tree where nobody had made the mistake, which is the tree this
// exists to keep.
if (read === 0) die(where + " holds no open note, so this check read nothing");

console.log(read + " open note(s) read, " + judged + " claim(s) judged. " + failed + " failed.");
process.exit(failed === 0 ? 0 : 1);
