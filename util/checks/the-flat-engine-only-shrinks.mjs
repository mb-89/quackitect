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
// SO THE SIZE IS WRITTEN DOWN HERE AND THIS FAILS WHEN IT RISES. A split lowers
// the numbers below, watches this go red, and moves files until it is green
// again. A run that finds the package smaller passes and names the numbers to
// write down, so the next rise is caught from the new floor.
//
// WHAT IS COUNTED: the .go files directly in src/engine that are not tests.
// Nothing under internal, which is where the work is meant to go, and no
// _test.go, which moves with what it tests. A line is a newline, counted the
// way wc -l counts one.
//
//   node util/checks/the-flat-engine-only-shrinks.mjs <root>
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.argv[2] ?? ".";

// WHAT THE FLAT PACKAGE HELD WHEN THIS WAS WRITTEN, and the most it may hold.
//
// IT WENT UP ONCE ON PURPOSE, and this is where that is said. The catalog of
// calls sits beside the dispatch it describes, in verbs.go, because a second
// file would be the copy it exists to remove. Everything else since is the
// engine growing, which is what the numbers are here to make somebody answer
// for.
const most = { files: 89, lines: 29378 };

let bad = 0;
function say(what, ok, why) {
  if (!ok) bad++;
  console.log((ok ? "  ok   " : "  FAIL ") + what + (ok ? "" : "\n         " + why));
}

const here = join(root, "src", "engine");
let names;
try {
  names = readdirSync(here);
} catch (err) {
  say("src/engine can be read", false, "it cannot: " + err.message
    + ", so nothing was counted and this guards nothing");
  process.exit(1);
}
const files = names.filter((n) => n.endsWith(".go") && !n.endsWith("_test.go"));

// A CHECK THAT FINDS NOTHING TO COUNT REFUSES. Pointed at a tree where the
// folder has moved it would count zero, call that a shrink, and say the
// package had emptied itself.
say("there are files in the flat package to count (" + files.length + ")", files.length > 0,
  "no non-test .go file sits directly in src/engine, so this counted nothing");

let lines = 0;
for (const name of files) {
  lines += (readFileSync(join(here, name), "utf8").match(/\n/g) ?? []).length;
}

const grew = "The flat package is what the split is meant to empty. Move what "
  + "grew into a package under src/engine/internal, or say here what the new "
  + "number is and why it went up";
say("the flat package holds " + files.length + " file(s), and " + most.files + " is the most it may hold",
  files.length <= most.files, grew);
say("it holds " + lines + " line(s), and " + most.lines + " is the most it may hold",
  lines <= most.lines, grew);

// AND A FLOOR THAT HAS MOVED IS SAID OUT LOUD. A number nobody lowers stops
// catching anything the day after the next split.
if (files.length < most.files || lines < most.lines) {
  console.log("  ok   it has shrunk to " + files.length + " file(s) and " + lines
    + " line(s): write those into this check, so the next rise is caught from there");
}

console.log("\n" + files.length + " file(s) counted, " + lines + " line(s). " + bad + " failed.");
process.exit(bad ? 1 : 0);
