// A COUNT A NOTE STATES NAMES THE COMMAND THAT PRODUCED IT.
//
// Voice rule 13: a number something else answers is never written down, and the
// tree's count is the command that answers it. A number with no command beside
// it cannot be checked, cannot be refreshed, and is cited by the next reader as
// though it were.
//
// MEASURED. wk-4e91c7b3f8's note said TempDir lines in engine test files fall
// from 201 to 126. The change was a pure move of eleven function bodies, so it
// could not have moved that count at all, and it did not: git grep -h TempDir
// -- 'src/engine/*_test.go' answers alike at the commit before it, at it, and
// at HEAD. Neither endpoint was ever a number this tree held. It was the note's
// headline measurement of what the change bought.
//
// THE RULE IS NARROW ON PURPOSE, because the broad one is useless. A first cut
// asked for a command beside any number against a countable noun, and flagged
// 1643 sentences over 361 notes: two applies from two tokens is prose, and
// three findings followed by the three is a list answering its own count, which
// rule 13 allows outright. Digits alone still flagged 165.
//
// AND THE NARROW ONE MISSED THE SENTENCE IT WAS WRITTEN FOR. Asking for a digit
// with the noun next to it flagged fourteen and let "TempDir lines in engine
// test files fall from 201 to 126" through, because that puts its numbers after
// the noun. A rule that cannot catch its own worked example is not a narrow
// rule, it is the wrong one.
//
// SO THE THREE PARTS ARE ASKED FOR ANYWHERE IN THE SENTENCE: a noun this tree
// can be asked to count, a number, and a verb claiming a measurement, in prose
// rather than a table cell or a fence.
//
// A NUMBER THAT IS AN ADDRESS IS NOT A COUNT. step 3, chapter 12, a line
// number, a token id, a date and a commit hash all name a place rather than
// answer how many, so they come out before the sentence is asked.
//
// A CLOSED NOTE IS HISTORY, so only open ones are read. Its criteria and its
// numbers were written under the tree as it stood, and rewriting them rewrites
// the record. criteria-name-a-runnable-command scopes itself the same way and
// for the same reason.
//
// A TABLE CELL IS ITS OWN EVIDENCE. A row reading "| 3 files |" is the answer a
// command already gave, laid out beside what asked it, so it is not prose
// making a claim.
//
//   node util/checks/a-count-names-its-command.mjs <root>
//
// reads: doc/work/*.md
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";

const root = process.argv[2] ?? ".";
const where = "doc/work";
const here = join(root, where);

const die = (why) => {
  console.log("FAIL " + why);
  process.exit(1);
};

// THE NOUNS ARE THINGS THIS TREE CAN BE ASKED TO COUNT. A number against
// anything else measures the world rather than the tree, and no command here
// would answer it.
const nouns = "lines?|files?|tests?|tokens?|notes?|commits?|checks?|hits?"
  + "|matches|rows?|functions?|builders?|words?|sentences?|packages?|modules?";
const aNoun = new RegExp("\\b(?:" + nouns + ")\\b", "i");

// anAddress is every shape of number that names a place rather than a quantity.
const anAddress = /\b(step|chapter|rule|section|level|round|part|version|go|line|item)\s+\d+|\bwk-[0-9a-f]+|\b\d{4}-\d{2}-\d{2}|\b[0-9a-f]{7,}\b|:\d+/gi;
const aNumber = /\b\d+\b/;
const aCount = { test: (said) => aNoun.test(said) && aNumber.test(said.replace(anAddress, " ")) };

// AND THE VERB IS WHAT MAKES IT A CLAIM. Without one the number is usually an
// address or a bound rather than a measurement taken.
const measuring = /\b(answers?|answered|counted?|holds?|held|stands? at|falls? from|fell from|measured|reports?|reported)\b/i;

// A COMMAND BESIDE IT is anything a reader could run to get the number back.
const aCommand = /`[^`]+`|\bse (find|test|ask|run|work|pull|status)\b|\bgit \w+|\bnode \b|\bgo test\b|\bpython3?\b/;

// THE SENTENCE IS THE UNIT, because a command two sentences away is not beside
// the number it is supposed to answer.
const theSentences = (line) => line.split(/(?<=[.;:])\s+/);

if (!existsSync(here)) die(where + " is not there, so this guards nothing");

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
  let fenced = false;
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trimStart().startsWith("```")) { fenced = !fenced; continue; }
    if (fenced || line.trimStart().startsWith("|")) continue;
    for (const said of theSentences(line)) {
      if (!aCount.test(said) || !measuring.test(said)) continue;
      judged++;
      if (aCommand.test(said)) continue;
      console.log(
        "FAIL " + where + "/" + name + ":" + (i + 1) + " states a count with no command "
        + "beside it: \"" + said.trim() + "\". A number something else answers is never "
        + "written down, and the tree's count is the command that answers it",
      );
      failed++;
    }
  }
}

// A CHECK THAT FINDS NOTHING TO JUDGE IS NOT A GREEN CHECK.
if (judged === 0) die("no open note under " + where + " states a count at all, so this check judged nothing");

console.log(read + " open note(s) read, " + judged + " count(s) judged. " + failed + " failed.");
process.exit(failed === 0 ? 0 : 1);
