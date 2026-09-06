// THE ENGINE'S TREE CARRIES EVERYTHING THE DECLARATION WROTE.
//
// --tree prints the tree AS DECLARED. A field the engine happens not to read is
// still part of what somebody wrote, and the panel reads the engine's answer
// rather than the file, so a field the engine's own struct lacks is a field the
// panel never sees.
//
// IT IS SILENT WHEN IT BREAKS. Measured in September 2026: source and columns
// were not on the struct. The agents table drew a polite sentence saying there
// was no list called present, and the queue count drew nothing. Neither
// errored, and both read as small separate cosmetic faults rather than as one
// field being dropped in transit.
//
// THE ENGINE MAY ADD, AND MAY NOT DROP. It derives keywords, resolves icons and
// fills pickers, so its answer is the declaration plus what it worked out. What
// it may never do is answer with less.
//
//   node util/checks/the-tree-drops-nothing.mjs <root>
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(process.argv[2] ?? ".");
const se = join(root, ".bin", process.env.SE_EXE || (process.platform === "win32" ? "se.exe" : "se"));

let failed = 0;
const ok = (said) => console.log("ok    " + said);
const no = (said) => { console.log("FAIL  " + said); failed++; };
const refuse = (why) => { console.error(why); process.exit(1); };

const declared = JSON.parse(readFileSync(join(root, "util", "parameters.json"), "utf8"));
let answered;
try {
  answered = JSON.parse(execFileSync(se, ["--tree", "--method", root], { encoding: "utf8" }));
} catch (err) {
  refuse("the engine could not be asked for the tree: " + (err.stderr ?? err.message));
}

// THE TWO ARE WALKED TOGETHER, BY NAME. Order is the declaration's and the
// engine keeps it, but matching by name says which node differs rather than
// which position did.
const pairs = [];
(function walk(a, b, path) {
  if (!b) {
    no(path + " is declared and the engine answers no such node");
    return;
  }
  pairs.push([path, a, b]);
  const theirs = new Map((b.children ?? []).map((c) => [c.name, c]));
  for (const c of a.children ?? []) walk(c, theirs.get(c.name), path ? path + "." + c.name : c.name);
})(declared, answered, declared.name);

if (pairs.length < 5) {
  refuse(`only ${pairs.length} node(s) were walked, so this counted almost nothing`);
}
ok(`${pairs.length} nodes walked, declaration against answer`);

// EVERY KEY THE DECLARATION WROTE IS IN THE ANSWER. Children are walked above
// rather than compared here, and a value the engine fills in is its business:
// what is checked is that the key survives at all.
const dropped = [];
for (const [path, a, b] of pairs) {
  for (const k of Object.keys(a)) {
    if (k === "children") continue;
    // A KEY BEGINNING WITH $ IS A NOTE TO A READER, not a field. It is written
    // for whoever opens the declaration and has no business travelling.
    if (k.startsWith("$")) continue;
    if (!(k in b)) dropped.push(path + " lost " + k);
  }
}
if (dropped.length === 0) ok("the engine's answer carries every key the declaration wrote");
else {
  no("the engine drops what somebody wrote, so the panel never sees it:");
  for (const d of dropped.slice(0, 12)) console.log("        " + d);
}

// AND A CONTROL THAT NAMES A LIST STILL NAMES IT. This is the one that broke,
// so it is asserted by name as well as by the sweep above.
const named = pairs.filter(([, a]) => a.source !== undefined);
if (named.length === 0) {
  refuse("nothing in the declaration names a source, so the case that broke is not covered");
}
for (const [path, a, b] of named) {
  if (b.source === a.source) ok(path + " still names its list: " + a.source);
  else no(path + " names " + JSON.stringify(a.source) + " and the engine answers " + JSON.stringify(b.source));
}

console.log(failed ? `\n${failed} failed.` : "\n0 failed.");
process.exit(failed ? 1 : 0);
