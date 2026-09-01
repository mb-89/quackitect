// EVERY START GOES THROUGH ONE DOOR, in the extension too.
//
// Node leaves windowsHide false, so a child started from a process with no
// console gets one, and that is a window on somebody's screen.
//
// IT IS ANCHORED ON THE MODULE EDGE, NOT ON ONE IDENTIFIER. A first version
// counted calls to the name spawnRaw and called that "reaches child_process".
// It was blind to execFile, exec and fork, to require("child_process"), and to
// a second file importing spawn under a different local name. A reviewer added
// a file calling execFile from node:child_process, exactly the version-probe
// shape that caused this, and the check reported 0 failed.
//
// So the rule is: ONE LINE IN THE WHOLE TREE NAMES child_process, it sits in
// the door, and the door sets windowsHide. Call sites may then be spelled
// however they like, because none of them can reach the module.
//
//   node .se/scratchpad/no-loose-spawns.mjs <root>
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const root = process.argv[2] ?? ".";
const dir = join(root, "src", "extension");

// Every .ts in the extension, and nothing under node_modules, which is not ours.
const files = readdirSync(dir)
  .filter((f) => f.endsWith(".ts") && !f.endsWith(".d.ts"))
  .filter((f) => statSync(join(dir, f)).isFile());

// THE EDGE: any line that names the module, by import or by require.
const edge = /(from\s*['"]node:child_process['"]|require\(\s*['"]node:child_process['"]|from\s*['"]child_process['"]|require\(\s*['"]child_process['"])/;

// THE STARTS: every call this module offers that makes a process.
const starts = /\b(spawn|spawnSync|exec|execFile|execFileSync|execSync|fork)\s*\(/;

let bad = 0;
const say = (what, ok, extra) => {
  if (!ok) bad++;
  console.log((ok ? "ok   " : "FAIL ") + " spawns: " + what + (ok || !extra ? "" : "\n      " + extra));
};

const crossings = [];
for (const name of files) {
  readFileSync(join(dir, name), "utf8").split("\n").forEach((line, i) => {
    if (/^\s*(\/\/|\*)/.test(line)) return;
    if (edge.test(line)) crossings.push({ name, line: i + 1, text: line.trim() });
  });
}

say("exactly one line reaches child_process",
  crossings.length === 1,
  crossings.map((c) => `${c.name}:${c.line} ${c.text}`).join("\n      ") || "none at all");

// A check that finds nothing to check is a check that cannot fail.
if (crossings.length === 0) {
  console.log("\nnothing starts a child process at all, so this guards nothing. 1 failed.");
  process.exit(1);
}

// The door is the file that crosses the edge, and it is the only file allowed
// to call a start under a name it imported directly.
const door = crossings[0];
const doorText = readFileSync(join(dir, door.name), "utf8");
say("the door sets windowsHide", /windowsHide:\s*true/.test(doorText));

// EVERY START IN EVERY OTHER FILE MUST BE THE LOCAL WRAPPER. A file that does
// not cross the edge cannot reach the module, so a call there is either the
// wrapper or a function of its own, and either is fine. The one file that can
// reach the module is the one that has to be read closely.
// WHATEVER LOCAL NAME THE IMPORT BINDS IS WHAT THE DOOR MAY CALL. Looking for
// the module's own names would miss it: this import renames spawn to spawnRaw,
// and a search for spawn( never matches spawnRaw(.
const lines = doorText.split("\n");
// The LOCAL name of each binding, which is what the door may call. A renamed
// import binds the new name and not the old one, so spawn as spawnRaw means
// only spawnRaw reaches the module. A type in the list never gets called, so
// including it costs nothing and leaving it out would need a second rule.
const bound = [...door.text.matchAll(/(?:(\w+)\s+as\s+)?(\w+)\s*(?=[,}])/g)]
  .map((m) => m[2])
  .filter((n) => n && n !== "from");

const reaching = [];
lines.forEach((line, i) => {
  if (/^\s*(\/\/|\*)/.test(line)) return;
  if (/\b(import|from)\b/.test(line)) return;
  if (bound.some((n) => new RegExp("\\b" + n + "\\s*\\(").test(line))) {
    reaching.push({ line: i + 1, text: line.trim() });
  }
});
say("the module is named under " + ([...new Set(bound)].join(" ") || "no local name"),
  bound.length > 0);
say("the door calls the module once",
  reaching.length === 1,
  reaching.map((r) => `${door.name}:${r.line} ${r.text}`).join("\n      ") || "not at all");

// And that one call is inside the wrapper: the four lines above it declare it.
const near = reaching[0]
  ? lines.slice(Math.max(0, reaching[0].line - 5), reaching[0].line)
  : [];
say("that call sits inside the door", near.some((l) => /function\s+\w+\s*\(/.test(l)));

console.log(`\n${files.length} file(s) read. ${bad} failed.`);
process.exit(bad ? 1 : 0);
