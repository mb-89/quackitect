// A NOTE TAKEN OFF THE DISK HAS AN ARCHIVE ROW, OR IT IS NAMED HERE.
//
// Measured at 19:10 on the box that minted this. git status over doc/work
// named 112 notes deleted from the working tree and not committed. 91 of them
// had a row in doc/work/archive.jsonl, so those deletions were a close doing
// its job. Twenty of the rest were still in HEAD, every one status open with
// no disposition. Nothing said who took them off the disk, or why.
//
// A CLOSE MOVES TWO THINGS TOGETHER. It deletes the note and it writes the
// archive row. A deletion with no row is either a close whose row write
// failed, which NotArchived is meant to surface, or a hand or a sweep taking
// live work away. Either way the backlog shrinks and nobody is told.
//
// SO THE DISK IS COMPARED WITH GIT. A note git carries, in HEAD or in the
// index, and the disk does not, is gone. Gone with a row is a close. Gone with
// no row is named here, with its id, while the deletion is still uncommitted
// and one checkout puts it back.
//
// HISTORY IS OUT OF SCOPE, AND THAT WAS MEASURED. 458 note names have left
// doc/work across the whole history and 345 of them have no row, because most
// of them predate the archive list. Judging those would hold this red forever
// and say nothing about the deletion happening now.
//
//   node util/checks/deleted-notes-have-a-row.mjs <root>
//
// reads: doc/work/*.md, doc/work/archive.jsonl, git
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const root = process.argv[2] ?? ".";
const where = "doc/work";
const here = join(root, "doc", "work");

let failed = 0;
function fail(said) {
  failed++;
  console.log("FAIL " + said);
}

// A ROOT THAT IS NOT THERE IS A FAILURE AND NOT A SKIP. A check guarding
// nothing says so rather than answering green.
if (!existsSync(here)) {
  console.log(`FAIL ${where} is not there, so this guards nothing`);
  process.exit(1);
}

function git(args) {
  return execFileSync("git", args, { cwd: root, encoding: "utf8", maxBuffer: 1 << 28 });
}

// A FOLDER WITH NO HISTORY HAS NO DELETION TO JUDGE. The question is what git
// holds and the disk does not, and a copy of the method with no branch holds
// nothing to compare against.
try {
  git(["rev-parse", "--git-dir"]);
} catch {
  console.log("  ok   this folder has no branch to read, so no deletion can be judged");
  console.log("\n0 note(s) off the disk. 0 failed.");
  process.exit(0);
}

function names(args) {
  let said = "";
  try {
    said = git(args);
  } catch {
    // An empty repository has no HEAD to list, and that is not a deletion.
    return new Set();
  }
  return new Set(
    said
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => /^doc\/work\/[^/]+\.md$/.test(line))
      .map((line) => line.slice("doc/work/".length, -".md".length)),
  );
}

// BOTH DOORS, BECAUSE A DELETION CAN BE STAGED. A note removed from the disk
// alone sits in the index. One removed with git rm is out of the index and
// still in HEAD, and that is the shape that ends up committed.
const tracked = new Set([
  ...names(["ls-tree", "-r", "--name-only", "HEAD", "--", "doc/work"]),
  ...names(["ls-files", "--", "doc/work"]),
]);

const onDisk = new Set(
  readdirSync(here)
    .filter((name) => name.endsWith(".md"))
    .filter((name) => !statSync(join(here, name)).isDirectory())
    .map((name) => name.slice(0, -".md".length)),
);

if (tracked.size === 0) {
  console.log(`FAIL git carries no note under ${where}, so this guards nothing`);
  process.exit(1);
}

// THE ROWS ARE THE RECORD OF A CLOSE. A line that will not parse is a failure
// and never a skip, because passing over one would excuse a deletion.
const list = join(here, "archive.jsonl");
const rows = new Set();
if (existsSync(list)) {
  const lines = readFileSync(list, "utf8").split("\n").filter((l) => l.trim() !== "");
  for (const [i, line] of lines.entries()) {
    try {
      const row = JSON.parse(line);
      if (typeof row.id === "string") rows.add(row.id);
    } catch (e) {
      fail(`line ${i + 1} of ${where}/archive.jsonl will not parse, and the list is the record: ${e.message}`);
    }
  }
}

// A TAG IS NOT A ROW, AND IT SAYS WHICH FAILURE THIS IS. An archive tag with
// no row is a close whose list write did not land. No tag and no row is a hand
// or a sweep.
let tags = new Set();
try {
  tags = new Set(
    git(["tag", "-l", "archive/*"])
      .split("\n")
      .map((t) => t.trim())
      .filter(Boolean)
      .map((t) => t.slice("archive/".length)),
  );
} catch {
  // A checkout with no tags is normal, and the rows answer the question.
}

const gone = [...tracked].filter((id) => !onDisk.has(id)).sort();

for (const id of gone) {
  if (rows.has(id)) continue;
  const cause = tags.has(id)
    ? "an archive tag names it and the list does not, so the close wrote no row"
    : "nothing archived it, so a hand or a sweep took it off the disk";
  fail(
    `${where}/${id}.md is gone from the disk and git still carries it, with no row in ` +
      `${where}/archive.jsonl. ${cause}. Put it back with git checkout -- ${where}/${id}.md, ` +
      "or close it so the archive says where it went",
  );
}

console.log(`${gone.length} note(s) off the disk. ${failed} failed.`);
process.exit(failed === 0 ? 0 : 1);
