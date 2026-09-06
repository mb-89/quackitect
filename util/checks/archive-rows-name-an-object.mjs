// EVERY ROW OF THE ARCHIVE NAMES AN OBJECT THE BRANCH CARRIES.
//
// The archive is doc/work/archive.jsonl, one line per closed token, and the
// list is what travels: a file on the branch, so every box that has the branch
// has the archive. A row names where the note is. blob is what the close wrote
// into the object store, on_branch is what the branch's own history holds, and
// tag is what an older archive left behind.
//
// A TAG IS NOT A COPY THAT TRAVELS. It has to be pushed to leave the box, and
// refs/tags answers HTTP 403 from the git proxy a cloud box runs behind, so a
// row naming only a tag reads on the machines that happen to hold that tag and
// nowhere else. A clone made with --no-tags, or with a filter, gets a row
// pointing at nothing.
//
// SO A ROW NAMES A BLOB OR AN ON_BRANCH. writeArchiveRows folds a tag's object
// into the row the next time a box holding the tags writes the list, and this
// says whether that has happened. Sixty-six rows sat unfolded on the branch
// while the fold was in the code and nobody had run it.
//
//   node util/checks/archive-rows-name-an-object.mjs <root>
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.argv[2] ?? ".";

let bad = 0;
function say(what, ok, why) {
  if (!ok) bad++;
  console.log((ok ? "  ok   " : "  FAIL ") + what + (ok ? "" : "\n         " + why));
}

const list = join(root, "doc", "work", "archive.jsonl");

// A TREE WITH NO ARCHIVE YET IS NOT A FAILURE. Nothing has closed in it, and a
// check that refused an empty tree would refuse a fresh clone of the method.
if (!existsSync(list)) {
  console.log("  ok   there is no archive yet, so no row names anything");
  console.log("\n0 row(s) read. 0 failed.");
  process.exit(0);
}

const lines = readFileSync(list, "utf8").split("\n").filter((l) => l.trim() !== "");

// A LINE THAT WILL NOT PARSE IS A FAILURE AND NEVER A SKIP. The list is the
// record, so passing over one would take a closed token out of the archive in
// silence.
const rows = [];
for (const [i, line] of lines.entries()) {
  try {
    rows.push(JSON.parse(line));
  } catch (e) {
    say("line " + (i + 1) + " of the archive reads as a row", false,
      "it will not parse as JSON, and the list is the record: " + e.message);
  }
}

say("the archive has rows to judge (" + rows.length + ")", rows.length > 0 || lines.length === 0,
  "the file is there and holds no row this can read, so this is not doing its job");

for (const row of rows) {
  const named = (row.blob ?? "") !== "" || (row.on_branch ?? "") !== "";
  say((row.id ?? "a row with no id") + " names a blob or an on_branch", named,
    "it names " + ((row.tag ?? "") !== "" ? "only the tag " + row.tag : "no object at all") +
    ", and a tag does not travel: a clone made with --no-tags reads nothing back for it. " +
    "Run se archive --sweep on a box holding the tags, and commit the list it writes");
}

console.log("\n" + rows.length + " row(s) read. " + bad + " failed.");
process.exit(bad ? 1 : 0);
