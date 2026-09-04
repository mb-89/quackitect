// THE FILES THE SYSTEM EXECUTES CARRY NO CARRIAGE RETURN.
//
// sh reads a CRLF script and hands the shell options with a \r stuck to them:
// util/setup/install.sh died on Linux with "set: Illegal option -" because
// this checkout converted its line endings on the way out. .gitattributes now
// pins every .sh to LF; this fails the battery the moment one carries a CR
// anyway, however it got there.
//
//   node util/checks/scripts-are-lf.mjs <root>
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.argv[2] ?? ".";

let bad = 0;
function say(what, ok, why) {
  if (!ok) bad++;
  console.log((ok ? "  ok   " : "  FAIL ") + what + (ok ? "" : "\n         " + why));
}

// THE SET IS EVERY .sh UNDER THE TREE, walked rather than listed, so a new
// script is judged the day it is written. The folders skipped are the ones
// git does not carry.
const skip = new Set([".git", "node_modules", ".bin", ".se"]);
const scripts = [];
function walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      if (!skip.has(name)) walk(full);
    } else if (name.endsWith(".sh")) {
      scripts.push(full);
    }
  }
}
walk(root);

say("the tree holds scripts to judge (" + scripts.length + ")", scripts.length > 0,
  "no .sh was found under " + root + ", so this has nothing to judge and is not "
  + "doing its job");

for (const script of scripts) {
  const name = relative(root, script).replace(/\\/g, "/");
  const cr = readFileSync(script).indexOf(0x0d);
  say(name + " is LF", cr < 0,
    "it carries a carriage return at byte " + cr + ", and sh reads that as part "
    + "of the line, so the script dies on Linux");
}

console.log("\n" + scripts.length + " script(s) judged. " + bad + " failed.");
process.exit(bad ? 1 : 0);
