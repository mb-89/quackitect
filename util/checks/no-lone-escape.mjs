// A REGEX BUILT FROM A STRING NEEDS ITS BACKSLASHES DOUBLED.
//
// new RegExp("\b(?:const|let|var)\s+") is not the pattern it looks like. The
// string is read first, so \b becomes a backspace character and \s becomes the
// letter s, and the pattern that reaches RegExp is
// <backspace>(?:const|let|var)s+, which matches nothing anybody meant.
//
// IT FAILS SILENT, WHICH IS WHY IT NEEDS A CHECK. There is no error. The regex
// compiles, runs, and answers no matches, so whatever the pattern was guarding
// is unguarded and every assertion resting on it goes green.
//
// MEASURED. This landed three times in one session: once in a Go test where
// \bTest became a backspace and the check read nothing, and twice in these
// checks, where the second one let a flag written through a local variable
// past a guard whose whole subject was flags written at the call site. Each
// time the reviewer found it, not the tree.
//
//   node util/checks/no-lone-escape.mjs <root>
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const root = process.argv[2] ?? ".";

let bad = 0;
function say(what, ok, why) {
  if (!ok) bad++;
  console.log((ok ? "  ok   " : "  FAIL ") + what + (ok ? "" : "\n         " + why));
}

// THE LETTERS A LONE BACKSLASH TURNS INTO SOMETHING ELSE. Each of these means
// one thing to a regular expression and another to a string, so writing one
// with a single backslash changes what the pattern says without saying so.
const meansSomethingElse = "bsSwWdDnrtvf0";

// WHERE A PATTERN IS BUILT FROM A STRING. Both languages here do it the same
// way, so both are read.
const places = [
  ["util/checks", (f) => f.endsWith(".mjs")],
  ["src/extension", (f) => f.endsWith(".ts")],
  ["src/engine", (f) => f.endsWith(".go")],
];

const found = [];
for (const [where, wanted] of places) {
  let names = [];
  try {
    names = readdirSync(join(root, where)).filter(wanted);
  } catch {
    continue;
  }
  for (const name of names) {
    const p = join(root, where, name);
    if (!statSync(p).isFile()) continue;
    const lines = readFileSync(p, "utf8").split("\n");
    lines.forEach((line, at) => {
      // A COMMENT IS PROSE AND NOT A CALL, including the one at the top of
      // this file explaining the defect, which named itself on the first run.
      if (line.trim().startsWith("//")) return;
      const call = line.match(/(?:new RegExp|regexp.MustCompile)\(\s*(.*)$/);
      if (!call) return;
      // THE ARGUMENT MAY BE ON THE NEXT LINE, which is where the one that
      // mattered was.
      let arg = call[1].trim();
      if (arg === "" && lines[at + 1]) arg = lines[at + 1].trim();
      found.push({ where: where + "/" + name + ":" + (at + 1), arg });
    });
  }
}

say("this reads the places a pattern is built from a string", found.length > 0,
  "no call to new RegExp or regexp.MustCompile was found at all, so this check "
  + "has nothing to judge and is not doing its job");

for (const one of found) {
  // ONLY A DOUBLE-QUOTED ARGUMENT IS AT RISK. A regex literal and a Go raw
  // string both take the backslash as written, so a call opening with a slash
  // or a backtick is left alone rather than read for quotes inside it.
  if (!one.arg.startsWith('"')) continue;
  const lit = one.arg.match(/^"((?:[^"\\]|\\.)*)"/);
  if (!lit) continue;
  const lone = [...lit[1].matchAll(/\\(.)/g)]
    .filter((e) => meansSomethingElse.includes(e[1]))
    .map((e) => "\\" + e[1]);
  if (lone.length === 0) continue;
  say(one.where + " builds a pattern from " + JSON.stringify(lit[0]), false,
    "the string is read before the pattern is, so " + lone.join(" and ")
    + " reaches the matcher as a control character rather than as a pattern. "
    + "Double the backslashes, or write it as a regex literal");
}

console.log("\n" + found.length + " pattern(s) built from a string. " + bad + " failed.");
process.exit(bad ? 1 : 0);
