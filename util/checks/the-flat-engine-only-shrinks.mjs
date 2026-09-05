// THE FLAT ENGINE PACKAGE ONLY SHRINKS.
//
// src/engine is one flat package, and the collisions that come with it are the
// reason work moves out of it: Go refuses two definitions of one name in one
// package, so the same name wanted twice is a build that fails.
//
// A TOKEN THAT MEANT TO SHRINK IT CLOSED GREEN ON A LINE THAT COULD NOT GO RED.
// It decided its split by searching for two function names and asking that each
// answer one package. That search answers one per package whatever anybody
// does, because the compiler already refuses the other case. Eleven groups did
// move into src/engine/internal, and the flat package grew all the same, from
// the 80 files the token measured to 89.
//
// SO THE TREE IS MEASURED AGAINST ITS OWN HEAD, AND THIS FAILS WHEN IT RISES.
// The floor is what the commit at HEAD holds, read out of git. A tree that
// matches its head passes. A tree that has grown past it is refused, naming
// the files that grew, and that is the hand that grew them: the battery runs
// where a change is made, before it is committed.
//
// THE FLOOR WAS A NUMBER WRITTEN IN HERE, AND THAT NUMBER REDDENED STRANGERS.
// On a branch several hands push to, a rise from one hand failed the next
// battery anybody ran: recorded at 29203 lines, read 29239 an hour later and
// 29730 an hour after that, each rise from a different hand, each a red
// battery for somebody who grew nothing. So the number is not here. The commit
// that last touched the package is named instead, with what it did to the
// count, so a rise that did get committed still has a name on it.
//
// WHAT IS COUNTED: the .go files directly in src/engine that are not tests.
// Nothing under internal, which is where the work is meant to go, and no
// _test.go, which moves with what it tests. A line is a newline, counted the
// way wc -l counts one.
//
//   node util/checks/the-flat-engine-only-shrinks.mjs <root>
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.argv[2] ?? ".";
const flat = "src/engine";

let bad = 0;
function say(what, ok, why) {
  if (!ok) bad++;
  console.log((ok ? "  ok   " : "  FAIL ") + what + (ok ? "" : "\n         " + why));
}

// THE BATCH IS THE WHOLE PACKAGE, and that is past the megabyte a child's
// output is allowed by default, so the allowance is said here.
function git(args, input) {
  return execFileSync("git", ["-C", root, ...args], { input, stdio: ["pipe", "pipe", "pipe"], maxBuffer: 64 * 1024 * 1024 });
}

// counts answers whether a name is one of the counted files.
function counts(name) {
  return name.endsWith(".go") && !name.endsWith("_test.go") && !name.includes("/");
}

// newlines answers how many a buffer holds.
function newlines(buf) {
  let n = 0;
  for (const b of buf) if (b === 0x0a) n++;
  return n;
}

// here answers the counted files on disk, name to lines.
function here() {
  const dir = join(root, flat);
  const out = new Map();
  for (const name of readdirSync(dir).filter(counts)) {
    out.set(name, newlines(readFileSync(join(dir, name))));
  }
  return out;
}

// at answers the counted files a commit holds, name to lines, read out of git
// in one batch rather than one call per file.
function at(commit) {
  const listed = git(["ls-tree", "--name-only", commit, flat + "/"]).toString("utf8");
  const names = listed.split("\n").filter((p) => p.startsWith(flat + "/"))
    .map((p) => p.slice(flat.length + 1)).filter(counts);
  const out = new Map();
  if (names.length === 0) return out;
  const batch = git(["cat-file", "--batch"], names.map((n) => commit + ":" + flat + "/" + n).join("\n") + "\n");
  let pos = 0;
  for (const name of names) {
    const end = batch.indexOf(0x0a, pos);
    const header = batch.slice(pos, end).toString("utf8").split(" ");
    if (header[1] !== "blob") throw new Error(commit + ":" + flat + "/" + name + " is " + header.join(" "));
    const size = Number(header[2]);
    out.set(name, newlines(batch.slice(end + 1, end + 1 + size)));
    pos = end + 1 + size + 1;
  }
  return out;
}

function total(m) {
  let lines = 0;
  for (const n of m.values()) lines += n;
  return { files: m.size, lines };
}

// THE FLOOR IS THE HEAD. A tree with no head has no floor, and a check with
// no floor guards nothing, so it refuses rather than passing.
let floor;
try {
  floor = at("HEAD");
} catch (err) {
  const said = err.stderr && err.stderr.length ? String(err.stderr) : String(err.stack ?? err.message);
  say("the head of " + root + " can be read", false, "it cannot: " + said.trim()
    + ", so there is no floor and this guards nothing");
  process.exit(1);
}

let tree;
try {
  tree = here();
} catch (err) {
  say(flat + " can be read", false, "it cannot: " + err.message
    + ", so nothing was counted and this guards nothing");
  process.exit(1);
}

// A CHECK THAT FINDS NOTHING TO COUNT REFUSES. Pointed at a tree where the
// folder has moved it would count zero, call that a shrink, and say the
// package had emptied itself.
say("there are files in the flat package to count (" + tree.size + ")", tree.size > 0,
  "no non-test .go file sits directly in " + flat + ", so this counted nothing");

// WHAT GREW, BY NAME. The refusal names the files, because the hand that
// reads it is the one that wrote them and a total says nothing about which.
const grew = [];
for (const [name, lines] of tree) {
  const was = floor.get(name);
  if (was === undefined) grew.push(name + " is new, " + lines + " line(s)");
  else if (lines > was) grew.push(name + " +" + (lines - was));
}
const now = total(tree);
const most = total(floor);
const why = "The flat package is what the split is meant to empty. Move what grew "
  + "into a package under " + flat + "/internal: " + grew.join(", ");
say("the flat package holds " + now.files + " file(s), and its head holds " + most.files,
  now.files <= most.files, why);
say("it holds " + now.lines + " line(s), and its head holds " + most.lines,
  now.lines <= most.lines, why);

// AND THE LAST HAND ON IT IS NAMED, WITHOUT FAILING. A rise that was committed
// is past refusing here, and failing on it would redden whoever runs next.
// What it did to the count is said beside its hash, so it has a name on it.
try {
  const last = git(["log", "-1", "--format=%h %s", "HEAD", "--", flat]).toString("utf8").trim();
  const hash = last.split(" ")[0];
  const before = total(at(hash + "^"));
  const moved = most.lines - before.lines;
  console.log("  ok   the last change to the flat package is " + last + ", "
    + (moved > 0 ? "up " + moved : moved < 0 ? "down " + (-moved) : "even") + " at "
    + before.lines + " to " + most.lines + " line(s)");
} catch (err) {
  console.log("  ok   the last change to the flat package has no parent to compare with");
}

console.log("\n" + now.files + " file(s) counted, " + now.lines + " line(s). " + bad + " failed.");
process.exit(bad ? 1 : 0);
