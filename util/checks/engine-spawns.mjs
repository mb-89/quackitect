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

// THE DOORS A BUILDER MAY REACH THE ENGINE THROUGH, other than a spawn that
// spreads it. Each one is a function that takes an array and hands it on, and
// each is checked below to be a function in this extension that ends at a
// spawn this check read. Naming the doors is two names. Naming the builders
// that use them would be eighteen, and eighteen is a photograph.
// NOT AN ARGUMENT BUILDER, and named here with its reason so a reader can tell
// an exclusion from an oversight.
const notABuilder = {
  readKind: "reads a kind out of a string. It builds no argument list and is "
    + "called inside engineargs.ts by the one that does",
};

const doors = {
  askEngine: "takes an array and spawns it with --work appended",
  writeView: "takes an array, wraps it in viewArgs, and hands that to askEngine",
};
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
    found.push({ where: name + ":" + line, args: args.replace(/\s+/g, " "),
                 before: text.slice(0, m.index) });
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
  const wrote = whatItWrites(one.args, one.before);
  say(one.where + " sends " + one.args, spread && wrote.length === 0,
    spread
      ? "it writes " + wrote.join(" and ") + " at the call site, and only --work belongs there"
      : "it writes the engine's flags at the call site, so nothing reads them against "
        + "the flags the engine has. Put them in src/extension/engineargs.ts and spread the builder");
}

// THE PERMITTED SET, NOT THE FORBIDDEN ONE.
//
// FOUR ROUNDS BOUGHT ONE SHAPE EACH. Seven call sites, then a spawn whose
// arguments were a bare name, then the converse, then two quote characters, and
// each widening was exactly what the last finding named. That is a deny list
// over a set nobody can enumerate: the ways to get a string into an array are
// unbounded, so a check that hunts them needs a round per shape and is behind
// after every one.
//
// WHAT A CALL SITE MAY WRITE IS SHORT AND FINITE. After the spreads are taken
// out, an element is one of two things: the literal --work, however it is
// quoted, or a value the caller owns. A value the caller owns is an expression
// carrying no flag literal, directly or through the name it was given.
//
// SO A VARIABLE, A CONCATENATION, A TEMPLATE AND A QUOTE CHARACTER ARE ONE CASE
// RATHER THAN FOUR, and a fifth shape nobody has thought of is refused before
// anybody writes it.
//
// A LITERAL BEGINNING WITH A DASH IS A FLAG, WHOLE OR IN PIECES. Asking for
// --name let "--" + "form" through, because neither half is a flag by itself
// and the pair is. Anything a call site quotes that opens with a dash is
// refused, and --work is the one exception. If a value ever has to begin with
// a dash, name it here with the reason rather than widening this again.
function whatItWrites(args, before) {
  const inside = args.replace(/^\s*\[/, "").replace(/\]\s*$/, "");
  const wrote = [];
  for (const el of split(inside)) {
    const one = el.trim();
    if (one === "" || one.startsWith("...")) continue;
    // THE ONE FLAG A CALL SITE MAY WRITE. Every call ends with the folder
    // being worked on, the caller is the only thing that knows it, and it is
    // not a flag that can drift: the engine would stop working entirely
    // rather than quietly minting nothing.
    if (/^["'`]--work["'`]$/.test(one)) continue;
    const found = flagIn(one, before);
    if (found) wrote.push(found);
  }
  return wrote;
}

// flagIn answers the flag an element carries, following a bare name back to
// the nearest assignment above the call, or nothing.
function flagIn(one, before) {
  const direct = one.match(/["'`](-[^"'`]*)["'`]/);
  if (direct) return direct[1];
  if (/^[A-Za-z_$][\w$]*$/.test(one)) {
    const gives = new RegExp(
      "\\b(?:const|let|var)\\s+" + one + "\\s*(?::[^=]*)?=\\s*([^;\\n]+)", "g");
    const all = [...(before || "").matchAll(gives)];
    if (all.length) {
      const was = all[all.length - 1][1];
      const held = was.match(/["'`](-[^"'`]*)["'`]/);
      if (held && held[1] !== "--work") return held[1] + " (through " + one + ")";
    }
  }
  return "";
}

// split takes an array's elements apart at the commas that are not inside
// something else. A regular expression cannot do this and get nesting right.
function split(text) {
  const out = [];
  let depth = 0, quote = "", at = 0;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quote) {
      if (c === "\\") i++;
      else if (c === quote) quote = "";
      continue;
    }
    if (c === '"' || c === "'" || c === "`") quote = c;
    else if (c === "(" || c === "[" || c === "{") depth++;
    else if (c === ")" || c === "]" || c === "}") depth--;
    else if (c === "," && depth === 0) {
      out.push(text.slice(at, i));
      at = i + 1;
    }
  }
  out.push(text.slice(at));
  return out;
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

// AND THE CONVERSE, WHICH IS THE SECOND NUMBER THIS CHECK DID NOT PRODUCE.
//
// The loop above asks whether every spread name is exported. It cannot see a
// spawn written in a shape the pattern misses, because a spawn it never read
// is a spawn it never judged. From the other end that spawn shows up as a
// builder nobody spreads, and the builders are enumerated by the language.
//
// A BUILDER THAT REACHES THE ENGINE ANOTHER WAY IS NAMED HERE WITH ITS REASON,
// so a reader can tell an exclusion from an oversight.
const spreadSomewhere = new Set();
for (const one of found) {
  for (const m of one.args.matchAll(/\.{3}\s*([A-Za-z_$][\w$]*)\s*\(/g)) spreadSomewhere.add(m[1]);
}

// A BUILDER HANDED TO A DOOR REACHES THE ENGINE THROUGH IT. The statement is
// the unit: a call to a door and the builder it is given sit in one.
const extSrc = readFileSync(join(here, "extension.ts"), "utf8");
const throughADoor = new Set();

// A NAME IS FOLLOWED BACK TO THE BUILDER THAT GAVE IT, the same way a spawn's
// arguments are. A call site that binds the array first and hands the name to
// the door is the ordinary shape here, and reading only the statement would
// report those builders as unreached.
// THE NEAREST ASSIGNMENT ABOVE THE CALL IS THE ONE. Two call sites both bind a
// local called args, so one map over the file would let the later one answer
// for the earlier, and a builder would be reported as reaching the engine on
// the strength of a different builder's assignment.
function givenBy(name, before) {
  const gives = new RegExp("\\b(?:const|let|var)\\s+NAME\\s*(?::[^=]*)?=\\s*([A-Za-z_$][\\w$]*)\\s*\\(".replace("NAME", name), "g");
  const all = [...before.matchAll(gives)];
  return all.length ? all[all.length - 1][1] : name;
}
for (const door of Object.keys(doors)) {
  for (const m of extSrc.matchAll(new RegExp("NAME\\s*\\(([^;]*)".replace("NAME", door), "g"))) {
    const before = extSrc.slice(0, m.index);
    for (const w of m[1].matchAll(/\b([A-Za-z_$][\w$]*)/g)) {
      const name = givenBy(w[1], before);
      if (exported.has(name)) throughADoor.add(name);
    }
  }
}
for (const [door, why] of Object.entries(doors)) {
  say("the door " + door + " is a function here that " + why,
    new RegExp("function " + door + "\\s*\\(").test(extSrc),
    "nothing in extension.ts declares it, so it is not a door and the builders "
    + "excused through it are excused by nothing");
}
for (const name of exported) {
  if (spreadSomewhere.has(name) || throughADoor.has(name) || name in notABuilder) continue;
  say("engineargs." + name + " reaches the engine", false,
    "no spawn this check read spreads it and no door is handed it. Either a "
    + "spawn is written in a shape the pattern misses, or the builder is dead");
}
say("every builder is spread or excluded, counted from the module ("
  + exported.size + " exported, " + spreadSomewhere.size + " spread, "
  + throughADoor.size + " through a door, "
  + Object.keys(notABuilder).length + " not a builder)",
  [...exported].every((n) => spreadSomewhere.has(n) || throughADoor.has(n) || n in notABuilder));
for (const name of Object.keys(notABuilder)) {
  say("the exclusion " + name + " is still exported", exported.has(name),
    "it is excluded by name and engineargs no longer exports it");
}

console.log("\n" + found.length + " spawn(s) read. " + bad + " failed.");
process.exit(bad ? 1 : 0);
