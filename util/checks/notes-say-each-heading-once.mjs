// A NOTE SAYS EACH HEADING ONCE.
//
// A token note carried two "## approach" sections and they disagreed. One said
// both the state of play and se query name a parked token. The other said
// parked work has one surface. A reader could not tell which one the work
// followed, and the step 1 evidence cited "the approach section" as though
// there were one of them.
//
// NOTHING CAUGHT THE CLASS. readBody appends an unknown heading to what it
// keeps, so a second section under a name already used round-trips forever and
// the writer is never told. The schema names the sections a note may carry and
// says nothing about how many times each may appear.
//
// SO THE COUNT IS THE CHECK. Every second-level heading in a note is counted,
// and one that appears more than once is named with its file and its count.
// Whether two sections agree is a reader's judgement. That there are two of
// them is not, and it is the half a program can hold.
//
// A FENCED BLOCK IS NOT THE NOTE'S OWN PROSE. A note quoting a markdown sample
// carries the sample's headings, and those belong to the sample, so the fences
// are counted and what sits between them is passed over.
//
//   node util/checks/notes-say-each-heading-once.mjs <root>
//
// reads: doc/work/*.md
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";

const root = process.argv[2] ?? ".";
const where = "doc/work";
const here = join(root, "doc", "work");

// A ROOT THAT IS NOT THERE IS A FAILURE AND NOT A SKIP, and so is an empty
// one. A check guarding nothing says so rather than answering green.
if (!existsSync(here)) {
  console.log(`FAIL ${where} is not there, so this guards nothing`);
  process.exit(1);
}

const notes = readdirSync(here)
  .filter((name) => name.endsWith(".md"))
  .filter((name) => !statSync(join(here, name)).isDirectory())
  .sort();

if (notes.length === 0) {
  console.log(`FAIL ${where} holds no note, so this guards nothing`);
  process.exit(1);
}

let failed = 0;
let read = 0;

for (const name of notes) {
  read++;
  const seen = new Map();
  let fenced = false;
  for (const line of readFileSync(join(here, name), "utf8").split("\n")) {
    if (line.trimStart().startsWith("```")) {
      fenced = !fenced;
      continue;
    }
    if (fenced) continue;
    const head = /^##[ \t]+(\S.*?)[ \t]*$/.exec(line);
    if (head === null) continue;
    seen.set(head[1], (seen.get(head[1]) ?? 0) + 1);
  }
  for (const [heading, times] of seen) {
    if (times < 2) continue;
    console.log(
      `FAIL ${where}/${name} carries "## ${heading}" ${times} times, ` +
        `so a reader cannot tell which one the work followed`,
    );
    failed++;
  }
}

console.log(`${read} note(s) read. ${failed} failed.`);
process.exit(failed === 0 ? 0 : 1);
