// NO FILE UNDER src/engine/internal HAS A TWIN IN THE FLAT PACKAGE.
//
// The split moves work out of src/engine into packages under
// src/engine/internal. While a move sat uncommitted, a shared index deleted
// the flat files it had already moved, and a put-back restored them beside
// their internal copies: yaml.go and version.go stood twice, one read by
// everything and one read by nothing. Go did not refuse it, because the two
// were in different packages, so the dead twin sat until somebody read the
// callers by hand.
//
// SO THE NAME IS THE HANDLE. A file under src/engine/internal/<pkg>/ whose
// basename is also a file directly in src/engine/ is refused, and the refusal
// names both, because the hand that reads it is the one that has to say which
// of the two is the dead one.
//
// A CHECK THAT FINDS NOTHING TO CHECK REFUSES. Pointed at a tree with no
// internal packages it would compare nothing and call that clean.
//
//   node util/checks/no-flat-twins.mjs <root>
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const root = process.argv[2] ?? ".";
const flat = "src/engine";
const internal = flat + "/internal";

let bad = 0;
function say(what, ok, why) {
  if (!ok) bad++;
  console.log((ok ? "  ok   " : "  FAIL ") + what + (ok ? "" : "\n         " + why));
}

function goFiles(dir) {
  try {
    return readdirSync(join(root, dir)).filter((f) => f.endsWith(".go") && statSync(join(root, dir, f)).isFile());
  } catch {
    return null;
  }
}

function packages() {
  try {
    return readdirSync(join(root, internal)).filter((d) => statSync(join(root, internal, d)).isDirectory());
  } catch {
    return [];
  }
}

const flatFiles = goFiles(flat);
say(flat + " can be read", flatFiles !== null,
  "it cannot, so there is nothing to compare against and this guards nothing");
if (flatFiles === null) process.exit(1);
const flatSet = new Set(flatFiles);

const pkgs = packages();
say("there are packages under " + internal + " to compare (" + pkgs.length + ")", pkgs.length > 0,
  "no package sits under " + internal + ", so this compared nothing");

let compared = 0;
const twins = [];
for (const pkg of pkgs) {
  for (const name of goFiles(internal + "/" + pkg) ?? []) {
    compared++;
    if (flatSet.has(name)) twins.push(internal + "/" + pkg + "/" + name + " and " + flat + "/" + name);
  }
}
say("there are files under " + internal + " to compare (" + compared + ")", compared > 0,
  "no .go file sits under " + internal + ", so this compared nothing");

// THE REFUSAL NAMES BOTH FILES. One of them is dead, and the tree is the
// only place that says which.
say("no file under " + internal + " shares its name with a file in " + flat, twins.length === 0,
  "a name stands twice, once in the flat package and once in a package it was moved "
  + "to. One of each pair is a dead twin: read the callers, and git rm it: " + twins.join("; "));

console.log("\n" + compared + " file(s) compared against " + flatSet.size + " in " + flat + ". " + bad + " failed.");
process.exit(bad ? 1 : 0);
