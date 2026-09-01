// EVERY PLACE THE EXTENSION STARTS THE ENGINE, COUNTED FROM THE SIDE THAT
// STARTS IT.
//
// THE CLASS THIS CATCHES. A claim that starts with "every" was guarded by a
// check whose entry point was the module the work created. That check drove
// nineteen calls through seventeen builders against the real binary, and it was
// thorough about the module and silent about everything else: seven of the
// eight argument lists the extension sends the engine were still written as
// literals at the call site, and no defect in any of them could reach a check
// that only ever imports engineargs.ts.
//
// SO THIS ONE ENUMERATES FROM THE PRODUCING SIDE. Every spawn of the engine in
// src/extension/*.ts, and each one has to pass an array that came from
// engineargs. A literal array at a call site fails.
//
// WHY A SEARCH AND NOT A TEST. The defect is a literal written in a TypeScript
// file. A test that imports a module cannot see a line that is not in it, and a
// check goes where the defect is, in the language the defect is written in.
//
//   node .se/scratchpad/engine-spawns.mjs <root>
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.argv[2] ?? ".";
const here = join(root, "src", "extension");

let bad = 0;
function say(what, ok, why) {
  if (!ok) bad++;
  console.log((ok ? "  ok   " : "  FAIL ") + what + (ok ? "" : "\n         " + why));
}

// A SPAWN IS THE SECOND ARGUMENT OF spawn(...) OR spawnRaw(...). The engine is
// started nowhere else in this extension, and if it ever is somewhere else this
// check reports fewer spawns than the tree has, which is the next assertion.
// A SPAWN'S ARGUMENTS ARE AN ARRAY OR THE NAME OF ONE, and matching only the
// first shape is how a call site kept its literals. The tree has nine spawns
// and this read eight: the ninth built its array one line above and wrote
// --set at the call site. Putting --form there, which is the defect this whole
// check exists for, answered 8 spawn(s) read, 0 failed.
const spawnCall = /\bspawn(?:Raw)?\s*\(\s*([A-Za-z_$][\w$]*)\s*,\s*(\[[^\]]*\]|[A-Za-z_$][\w$]*)/g;

const found = [];
for (const name of readdirSync(here).filter((f) => f.endsWith(".ts"))) {
  const text = readFileSync(join(here, name), "utf8");
  const lines = text.split("\n");
  for (const m of text.matchAll(spawnCall)) {
    const line = text.slice(0, m.index).split("\n").length;
    // The wrapper in extension.ts is the one spawn that forwards somebody
    // else's array, so it is the door rather than a call through it.
    if (/function spawn\b/.test(lines[line - 1]) || /spawnRaw\(exe, args/.test(m[0])) continue;
    // A NAME IS FOLLOWED BACK TO THE ARRAY IT WAS GIVEN. The nearest assignment
    // above the call is the one. A name with none is reported as unread rather
    // than passed over, because a spawn nobody can read is a spawn nobody is
    // checking, and that is what the missing ninth looked like.
    let args = m[2];
    if (!args.startsWith("[")) {
      const before = text.slice(0, m.index);
      const gives = new RegExp("\\b(?:const|let|var)\\s+" + args + "\\s*(?::[^=]*)?=\\s*(\\[[^\\]]*\\])", "g");
      const assigned = [...before.matchAll(gives)];
      args = assigned.length
        ? assigned[assigned.length - 1][1]
        : "(named " + args + ", and nothing above it gives that name an array)";
    }
    found.push({ where: name + ":" + line, args: args.replace(/\s+/g, " ") });
  }
}

say("the extension starts the engine somewhere", found.length > 0,
  "no spawn was found at all, so this check has nothing to judge and is not doing its job");

// EVERY ONE OF THEM TAKES ITS FLAGS FROM engineargs. A spread of a builder call
// is what that looks like: [...rotateArgs(), "--work", work]. A bare literal
// flag in the array is what it does not.
//
// --work IS THE ONE FLAG A CALL SITE MAY WRITE. Every call ends with the folder
// being worked on, the caller is the only thing that knows it, and it is not a
// flag that can drift: the engine would stop working entirely rather than
// quietly minting nothing. Everything else is the builder's.
for (const one of found) {
  const spread = /\.\.\.\s*[A-Za-z_$][\w$]*/.test(one.args);
  const own = one.args.replace(/\.\.\.\s*[A-Za-z_$][\w$]*\s*(\([^)]*\))?/g, "");
  const literalFlag = [...own.matchAll(/"(--[a-z-]+)"/g)].map((m) => m[1]).filter((f) => f !== "--work");
  say(one.where + " sends " + one.args, spread && literalFlag.length === 0,
    spread
      ? "it writes " + literalFlag.join(" and ") + " at the call site, and only --work belongs there"
      : "it writes the engine's flags at the call site, so nothing reads them against "
        + "the flags the engine has. Put them in src/extension/engineargs.ts and spread the builder");
}

// AND THE BUILDERS IT SPREADS ARE REAL ONES. A call site could spread anything.
const argsSrc = readFileSync(join(here, "engineargs.ts"), "utf8");
const exported = new Set([...argsSrc.matchAll(/export function ([A-Za-z_$][\w$]*)/g)].map((m) => m[1]));
say("engineargs exports builders", exported.size > 5,
  "it exports " + exported.size + ", so this check could pass by the builders having gone");
for (const one of found) {
  for (const m of one.args.matchAll(/\.\.\.\s*([A-Za-z_$][\w$]*)\s*\(/g)) {
    say(one.where + " spreads " + m[1] + ", which engineargs exports", exported.has(m[1]),
      m[1] + " is not exported by src/extension/engineargs.ts, so it is built somewhere else");
  }
}

console.log("\n" + found.length + " spawn(s) read. " + bad + " failed.");
process.exit(bad ? 1 : 0);
