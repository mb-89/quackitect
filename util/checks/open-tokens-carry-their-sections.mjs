// AN OPEN TOKEN CARRIES THE SECTIONS ITS PROCESS REQUIRES.
//
// A standard token was split in two and the halves were written by hand. Both
// said in their step 2 evidence that they carried the approach unchanged, and
// neither file held an approach heading at all. So two open standard tokens sat
// in the queue offering a detail and a done-when list, and no shape a reader
// could have disagreed with before the work began, which is the one thing the
// standard process asks for over the trivial one.
//
// NOTHING CAUGHT THE CLASS. The process declares its required sections, and the
// declaration is read when a token is minted from a template. A token written
// by hand, split off another, or edited afterwards is read back by a parser
// that keeps whatever headings it finds and asks for none, so a missing section
// round-trips forever and the writer is never told.
//
// SO THE DECLARATION IS THE CHECK. src/processes/<name>.process.yaml names the
// sections that process requires. Every token in doc/work that has not closed
// is read for the ones its own process names, and a missing one is reported
// with its file, its process and the heading.
//
// A CLOSED TOKEN IS NOT JUDGED. What is asked here is that work waiting to be
// taken says what it is, and a token that has already ended is a record rather
// than an offer.
//
// A FENCED BLOCK IS NOT THE TOKEN'S OWN PROSE. A token quoting a markdown
// sample carries the sample's headings, and those belong to the sample, so the
// fences are counted and what sits between them is passed over.
//
//   node util/checks/open-tokens-carry-their-sections.mjs <root>
//
// reads: src/processes/*.process.yaml, doc/work/*.md
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";

const root = process.argv[2] ?? ".";
const processes = join(root, "src", "processes");
const work = join(root, "doc", "work");

let failed = 0;

// A ROOT THAT IS NOT THERE IS A FAILURE AND NOT A SKIP, and so is an empty
// one. A check guarding nothing says so rather than answering green.
function missing(where, why) {
  console.log(`FAIL ${where} ${why}`);
  process.exit(1);
}

if (!existsSync(processes)) missing("src/processes", "is not there, so this guards nothing");
if (!existsSync(work)) missing("doc/work", "is not there, so this guards nothing");

// requiredOf reads one process declaration and answers the sections it
// requires.
//
// THE LIST IS READ, NOT TYPED HERE. A list of required sections written into
// this file would be a second copy of the declaration, and two copies is how a
// rule comes to disagree with itself. The shape read is the one the declaration
// is written in: a sections block, a required key under it, and a dash item per
// section.
//
// AN OPTIONAL SECTION IS NOT READ AT ALL, because a check that named one would
// be refusing what the process says a token may leave out.
function requiredOf(text) {
  const want = [];
  let inSections = false;
  let inRequired = false;
  for (const line of text.split("\n")) {
    if (/^\S/.test(line)) {
      inSections = line.startsWith("sections:");
      inRequired = false;
      continue;
    }
    if (!inSections) continue;
    const key = /^ {2}(\w+):\s*$/.exec(line);
    if (key !== null) {
      inRequired = key[1] === "required";
      continue;
    }
    const item = /^ {4}-\s+(.+?)\s*$/.exec(line);
    if (item === null || !inRequired) continue;
    want.push(item[1].replace(/^"(.*)"$/, "$1").trim());
  }
  return want;
}

const required = new Map();
for (const name of readdirSync(processes).sort()) {
  if (!name.endsWith(".process.yaml")) continue;
  required.set(name.slice(0, -".process.yaml".length), requiredOf(readFileSync(join(processes, name), "utf8")));
}

if (required.size === 0) {
  missing("src/processes", "declares no process, so this guards nothing");
}

// headingsOf answers the second-level headings a token carries, outside fences.
function headingsOf(text) {
  const seen = new Set();
  let fenced = false;
  for (const line of text.split("\n")) {
    if (line.trimStart().startsWith("```")) {
      fenced = !fenced;
      continue;
    }
    if (fenced) continue;
    const head = /^##[ \t]+(\S.*?)[ \t]*$/.exec(line);
    if (head !== null) seen.add(head[1]);
  }
  return seen;
}

// fieldOf answers one front matter field, with the link brackets taken off, so
// process: [[standard]] reads as standard.
function fieldOf(text, key) {
  const found = new RegExp(`^${key}:[ \\t]*(.*?)[ \\t]*$`, "m").exec(text);
  return found === null ? "" : found[1].replace(/^\[\[(.*)\]\]$/, "$1").trim();
}

const tokens = readdirSync(work)
  .filter((name) => name.startsWith("wk-") && name.endsWith(".md"))
  .filter((name) => !statSync(join(work, name)).isDirectory())
  .sort();

if (tokens.length === 0) {
  missing("doc/work", "holds no token, so this guards nothing");
}

let read = 0;
for (const name of tokens) {
  const text = readFileSync(join(work, name), "utf8");
  const status = fieldOf(text, "status");
  if (status === "closed") continue;
  const which = fieldOf(text, "process");
  const want = required.get(which);
  // A PROCESS NOTHING DECLARES IS ITS OWN FAILURE, because the sections such a
  // token owes cannot be read, so nothing here can say it carries them.
  if (want === undefined) {
    console.log(
      `FAIL doc/work/${name} names process "${which}", which src/processes ` +
        `does not declare, so what it must carry cannot be read`,
    );
    failed++;
    continue;
  }
  read++;
  const has = headingsOf(text);
  for (const section of want) {
    if (has.has(section)) continue;
    console.log(
      `FAIL doc/work/${name} is ${status} under the ${which} process and ` +
        `carries no "## ${section}", which that process requires`,
    );
    failed++;
  }
}

console.log(`${read} open token(s) read. ${failed} failed.`);
process.exit(failed === 0 ? 0 : 1);
