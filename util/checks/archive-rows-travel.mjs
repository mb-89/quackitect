// EVERY ROW OF THE ARCHIVE NAMES AN OBJECT A CLONE OF THE BRANCH IS SENT.
//
// archive-rows-name-an-object says a row names something. This says the thing it
// names is there on a box that was handed the branch and nothing else, which is
// what every cloud box is. The two are not the same question, and the first was
// green over a list whose rows a clone could not read.
//
// WHAT A CLONE IS SENT IS WHAT THE BRANCH REACHES. A blob written by the close
// with hash-object is reachable from no tree and no branch, so no clone is ever
// sent it. A tag has to be pushed, and refs/tags answers 403 from the git proxy
// a cloud box runs behind. What travels is on_branch, the note as the branch
// committed it, which is inside a commit every clone has.
//
// SO THE ROWS ARE RESOLVED AGAINST WHAT THE BRANCH REACHES, which is the same
// set of objects a clone made with --no-tags carries, and one this check can
// read without cloning anything.
//
//   node util/checks/archive-rows-travel.mjs <root>
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.argv[2] ?? ".";

let bad = 0;
function say(what, ok, why) {
  if (!ok) bad++;
  console.log((ok ? "  ok   " : "  FAIL ") + what + (ok ? "" : "\n         " + why));
}

const list = join(root, "doc", "work", "archive.jsonl");
if (!existsSync(list)) {
  console.log("  ok   there is no archive yet, so no row has anywhere to travel");
  console.log("\n0 row(s) read. 0 failed.");
  process.exit(0);
}

// A TREE WITH NO HISTORY IS NOT A FAILURE. The archive is about what a clone of
// the branch gets, and a folder nobody cloned has no branch to answer for.
let reachable;
try {
  const said = execFileSync("git", ["rev-list", "--objects", "--no-object-names", "HEAD"],
    { cwd: root, encoding: "utf8", maxBuffer: 1 << 28 });
  reachable = new Set(said.split("\n").map((l) => l.trim()).filter(Boolean));
} catch (e) {
  console.log("  ok   this folder has no branch to read, so nothing is asked of it");
  console.log("\n0 row(s) read. 0 failed.");
  process.exit(0);
}

const lines = readFileSync(list, "utf8").split("\n").filter((l) => l.trim() !== "");
const rows = [];
for (const [i, line] of lines.entries()) {
  try {
    rows.push(JSON.parse(line));
  } catch (e) {
    say("line " + (i + 1) + " of the archive reads as a row", false,
      "it will not parse as JSON, and the list is the record: " + e.message);
  }
}

say("the branch reaches objects to resolve against (" + reachable.size + ")", reachable.size > 0,
  "the walk answered nothing, so this check would pass a list of any shape at all");

for (const row of rows) {
  const named = [row.blob ?? "", row.on_branch ?? ""].filter((o) => o !== "");
  const travels = named.some((o) => reachable.has(o));
  say((row.id ?? "a row with no id") + " names an object a clone of the branch carries", travels,
    "it names " + (named.length === 0 ? "no object at all" : named.join(" and ")) +
    ", and the branch reaches none of that. A clone made with --no-tags reads nothing back " +
    "for this row. Where the branch committed the note, se archive --sweep puts that blob on " +
    "the row as on_branch. Where it never did, there is no copy to travel and the note is on " +
    "this box alone");
}

console.log("\n" + rows.length + " row(s) read. " + bad + " failed.");
process.exit(bad ? 1 : 0);
