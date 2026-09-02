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
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

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
// THE NAME IS ASKED OF THE IMPORT, NOT ASSUMED TO BE THE WORD SPAWN.
//
// Both counts used to require the letters spawn before the parenthesis, so they
// shared one premise and a rename defeated both at once: this very file already
// writes `import { spawn as spawnRaw }`, so `import { spawn as run }` and
// `run(exe, ["--form", ...])` was in neither count, and the check answered N in
// the source, N read, 0 failed with the flag at a call site.
//
// THE SET IS DECLARED IN ONE PLACE THE TREE CAN BE ASKED: what the file binds
// from node:child_process. So the words searched for are those bindings, and a
// binding that is not searched is a failure by name rather than a silence.
const boundToChildProcess = (text) => {
  const names = new Set();
  for (const imp of text.matchAll(/import\s*\{([^}]*)\}\s*from\s*["']node:child_process["']/g)) {
    for (const piece of imp[1].split(",")) {
      const as = piece.trim().match(/^(\w+)(?:\s+as\s+(\w+))?$/);
      if (as && /^(spawn|spawnSync|exec|execFile|execSync|execFileSync|fork)$/.test(as[1])) {
        names.add(as[2] ?? as[1]);
      }
    }
  }
  // AND THE WRAPPER THAT FORWARDS TO ONE. This extension starts the engine
  // through a local function of its own, so the binding alone reads nothing.
  // The wrapper is found by asking which local function calls a bound name,
  // which is one hop and derived, rather than by typing its name here.
  // A FORWARDER IS A FUNCTION WHOSE FIRST ACT IS THE CALL. That is what a
  // wrapper is, and matching anything looser pulls in every function that
  // merely mentions the name: I tried it and the clean tree read twenty-two
  // starts where it has nine.
  for (const n of [...names]) {
    const forwards = new RegExp(
      "function\\s+([A-Za-z_$][\\w$]*)\\s*\\([^)]*\\)[^{]*\\{\\s*return\\s+" + n + "\\s*\\(", "g");
    for (const fn of text.matchAll(forwards)) names.add(fn[1]);
  }
  return names;
};

const spawnCallFor = (names) => new RegExp(
  "\\b(?:" + [...names].join("|") + ")\\s*\\(\\s*([A-Za-z_$][\\w$]*)\\s*,\\s*(\\[[^\\]]*\\]|[A-Za-z_$][\\w$]*)", "g");
const anySpawnFor = (names) => new RegExp("\\b(?:" + [...names].join("|") + ")\\s*\\(", "g");

// EVERY PLACE THE WORD APPEARS, WHICH IS NOT THE SAME SET AS THE ONE ABOVE.
//
// The reading pattern needs a bare identifier and then an array or a name. A
// spawn written any other way is not matched, so it produces no entry, no
// failure, and nothing notices: spawnRaw(binary(context, "se"), ["--form", ...])
// was invisible to both halves of this file, and that is the defect the token
// was minted for. So the count is held against something this check did not
// produce.
// EVERY .ts UNDER THE EXTENSION, INCLUDING ONE IN A FOLDER. Reading only the
// top directory put a file in a subdirectory in neither count.
function everyTs(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === "out") continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...everyTs(full));
    else if (entry.endsWith(".ts")) out.push(full);
  }
  return out;
}

const found = [];
const sites = [];
const searched = new Set();
const bound = new Set();
for (const full of everyTs(here)) {
  const name = relative(here, full).split("\\").join("/");
  const text = readFileSync(full, "utf8");
  const lines = text.split("\n");
  const names = boundToChildProcess(text);
  for (const n of names) bound.add(n);
  if (names.size === 0) continue;
  for (const n of names) searched.add(n);
  for (const m of text.matchAll(anySpawnFor(names))) {
    const line = text.slice(0, m.index).split("\n").length;
    if (/function spawn\b/.test(lines[line - 1])) continue;
    if (/^spawnRaw\(exe, args/.test(text.slice(m.index, m.index + 20))) continue;
    // KEYED BY WHERE IT IS IN THE FILE AND NOT BY ITS LINE, because two starts
    // on one line collided and left the two counts disagreeing with nothing named.
    sites.push(name + ":" + line + "@" + m.index);
  }
  for (const m of text.matchAll(spawnCallFor(names))) {
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
    found.push({ where: name + ":" + line + "@" + m.index, args: args.replace(/\s+/g, " "),
                 before: text.slice(0, m.index), whole: text });
  }
}

say("the extension starts the engine somewhere", found.length > 0,
  "no spawn was found at all, so this check has nothing to judge and is not doing its job");

// AND EVERY NAME THE EXTENSION BINDS IS ONE OF THE WORDS THIS SEARCHED FOR.
// A binding it does not search is a start it cannot see, and that is the premise
// both counts used to share.
say("every child_process binding is searched for (" + [...bound].sort().join(", ") + ")",
  [...bound].every((n) => searched.has(n)),
  [...bound].filter((n) => !searched.has(n)).join(", ")
    + " is bound from node:child_process and this check never looks for it");
say("the extension binds something to start with", bound.size > 0,
  "nothing imports from node:child_process, so neither count has a word to look for");

// AND EVERY ONE OF THEM WAS READ. A spawn the reading pattern could not match
// is a spawn nothing is checking, and it is silent rather than red: no entry,
// no failure, and the converse loop stays green because every builder is still
// spread somewhere else.
//
// THE TWO COUNTS COME FROM DIFFERENT PLACES ON PURPOSE. One is what the reading
// pattern matched. The other is every occurrence of the word, which this check
// cannot get wrong by being too narrow.
{
  const read = new Set(found.map((one) => one.where));
  const unread = sites.filter((where) => !read.has(where));
  say("every spawn in the tree was read (" + sites.length + " in the source, "
      + found.length + " read)", unread.length === 0,
    unread.join(", ") + " is a spawn this check could not read, so nothing is "
    + "checking its arguments. Write the call with a name as its first argument "
    + "and an array or the name of one as its second");
}

// THE BUILDERS engineargs EXPORTS, read before the walk needs them.
const argsSrc = readFileSync(join(here, "engineargs.ts"), "utf8");
const exported = new Set([...argsSrc.matchAll(/export function ([A-Za-z_$][\w$]*)/g)].map((m) => m[1]));

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
  const wrote = whatItWrites(one.args, one.before, one.whole, exported, doors);
  say(one.where + " sends " + one.args, spread && wrote.length === 0,
    spread
      ? "it writes " + wrote.join(" and ") + " at the call site, and only --work belongs there"
      : "it writes the engine's flags at the call site, so nothing reads them against "
        + "the flags the engine has. Put them in src/extension/engineargs.ts and spread the builder");
}

// THE PERMITTED SET, NOT THE FORBIDDEN ONE, AND AN UNREADABLE ELEMENT IS
// REFUSED RATHER THAN PASSED.
//
// FIVE ROUNDS BOUGHT ONE SHAPE EACH. Seven call sites, then a spawn whose
// arguments were a bare name, then the converse, then two quote characters,
// then a variable and a concatenation. Each widening was exactly what the last
// finding named, because a deny list over a set nobody can enumerate needs a
// round per shape.
//
// AND THE ROUND AFTER THAT FOUND THREE MORE, because the check was still a
// hunter with a longer reach: an element it could not read fell off the end as
// fine. A spread of a name, a spread of an inline array and a property read all
// carried a flag past it. AN ALLOW LIST IS A DEFAULT, NOT A MATCHER.
//
// SO THE DEFAULT IS REFUSE. An element passes when it MATCHES one of the four
// shapes below and for no other reason, so a shape nobody has thought of is
// refused before it is written, and the fix is to write it in a form this can
// read.
//
//   ...builder(...)   a spread of a call to something engineargs exports
//   ...name           a spread of somebody else's array, inside a door
//   "--work"          the one flag a call site may write, however quoted
//   name, a.b         a value carrying no quoted literal of its own
function whatItWrites(args, before, whole, exported, doors) {
  // A DOOR MAY FORWARD SOMEBODY ELSE'S ARRAY AND NOTHING ELSE MAY. Which
  // function the spawn sits in decides that, so it is read here rather than
  // guessed from the name being spread.
  const inADoor = Object.keys(doors).some((d) => enclosing(before) === d);
  const inside = args.replace(/^\s*\[/, "").replace(/\]\s*$/, "");
  const wrote = [];
  for (const el of split(inside)) {
    const one = el.trim();
    if (one === "") continue;
    const why = whyItIsNotAllowed(one, before, whole, exported, inADoor);
    if (why) wrote.push(why);
  }
  return wrote;
}

function whyItIsNotAllowed(one, before, whole, exported, inADoor) {
  // A SPREAD OF A BUILDER CALL, and the builder is one engineargs exports.
  const call = one.match(/^\.\.\.\s*([A-Za-z_$][\w$]*)\s*\(/);
  if (call) {
    return exported.has(call[1]) ? ""
      : call[1] + " is spread here and src/extension/engineargs.ts does not export it";
  }
  // A SPREAD OF SOMEBODY ELSE'S ARRAY, which only a door may do. Anywhere
  // else it is an array this check cannot read, and one of those carried a
  // flag past every round of this.
  const pass = one.match(/^\.\.\.\s*([A-Za-z_$][\w$]*)\s*$/);
  if (pass) {
    return inADoor ? ""
      : "..." + pass[1] + " spreads an array this check cannot read, and only a door may forward one";
  }
  if (/^\.\.\./.test(one)) {
    return "a spread of something this check cannot read: " + one;
  }
  // THE ONE FLAG A CALL SITE MAY WRITE. Every call ends with the folder being
  // worked on, the caller is the only thing that knows it, and it cannot
  // drift: the engine would stop working rather than quietly minting nothing.
  if (/^["'`]--work["'`]$/.test(one)) return "";
  // A VALUE THE CALLER OWNS, AND THE CHECK HAS TO BE ABLE TO SAY SO.
  //
  // NOTHING FOUND IS NOT NO FLAG. This branch handed a name, a property read
  // or a call to a reader that answered the empty string both when it had
  // looked and found nothing dangerous and when it could not look at all, and
  // the empty string was read as permitted. So the top-level default refused
  // and the branch under it permitted, which let a property read whose value
  // is a flag, a name pointing at another name, and a call returning a flag
  // all through.
  //
  // IT ANSWERS ONE OF THREE THINGS NOW, and only the middle one passes.
  const said = whatItResolvesTo(one, before, whole, 0);
  if (said === "clean") return "";
  return said + ", so it cannot stand as a value the caller owns";
}

// whatItResolvesTo answers a flag, or clean, or why it could not tell.
//
// CLEAN IS EARNED, NOT ASSUMED. This once answered a flag when it found one,
// followed a bare name, and returned clean for everything else, so nothing
// found was read as no flag one level in: a call returning a flag, an object
// property read through a name, and an array index all walked past it. The
// element already had three answers and the resolver kept two.
//
// SO IT RETURNS CLEAN ONLY WHEN IT FOLLOWED THE ASSIGNMENT TO SOMETHING IT
// COULD READ AND FOUND NO FLAG. Everything else says what it could not do, in
// the same words a spread it cannot read gets, so a call site is told to write
// the value in a form the check can read rather than left to guess.
//
// THE SHAPES IT CAN FOLLOW, which is a list rather than a default: a quoted
// literal, a bare name followed onward, an object or an array literal read for
// a dash literal, a property read or an index resolved through its object, and
// a call whose function this file declares.
function whatItResolvesTo(one, before, whole, depth) {
  if (depth > 5) return "this check will not follow " + one + " any further";
  const name = one.match(/^([A-Za-z_$][\w$]*)\s*(?:[.[][^\]]*\]?|\([^()]*\))?$/);
  if (!name) return "this check cannot read " + one;
  // THE WINDOW IS THE VALUE AND NOT THE LINE.
  //
  // This captured to the first newline, so an object or an array written over
  // two lines was handed on as the single character it opened with. That one
  // character holds no dash literal and starts with a bracket, so it was
  // answered clean, and a flag two lines down reached the call site with
  // nothing failing. The capture now ends where the value ends.
  const opens = new RegExp(
    "\\b(?:const|let|var)\\s+" + name[1] + "\\s*(?::[^=]*)?=\\s*", "g");
  const all = [...(before || "").matchAll(opens)];
  if (!all.length) {
    return "nothing above the call gives " + name[1] + " a value this check can read";
  }
  const at = all[all.length - 1];
  const value = valueAt(before, at.index + at[0].length);
  if (value === null) {
    return name[1] + " is given a bracket this check cannot follow to its end";
  }
  return whatThisIs(value.trim(), before, whole, depth);
}

// valueAt reads one value out of the source, from where it begins.
//
// A BRACKET IS READ TO ITS MATCH AND ANYTHING ELSE TO THE END OF ITS LINE. A
// bracket that never closes in what this can see is answered as unreadable
// rather than classified, because the whole class of defect here is a value
// judged on the part of it that happened to fit in the window.
function valueAt(text, at) {
  const rest = text.slice(at);
  const open = rest[0];
  if (open === "{" || open === "[") {
    const shut = open === "{" ? "}" : "]";
    let depth = 0;
    for (let i = 0; i < rest.length; i++) {
      if (rest[i] === open) depth++;
      else if (rest[i] === shut && --depth === 0) return rest.slice(0, i + 1);
    }
    return null;
  }
  const end = rest.search(/[;\n]/);
  return end < 0 ? rest : rest.slice(0, end);
}

// whatThisIs classifies what a name was given.
function whatThisIs(was, before, whole, depth) {
  // A QUOTED LITERAL OPENING WITH A DASH IS A FLAG, whole or in pieces.
  const held = was.match(/["'`](-[^"'`]*)["'`]/);
  if (held) return held[1] + " reaches the call site through it";
  // AN OBJECT OR AN ARRAY LITERAL IS READ WHOLE, because a flag inside one is
  // a flag however it is taken out again.
  if (was.startsWith("{") || was.startsWith("[")) return "clean";
  // A NAME IS FOLLOWED, and so is a property read or an index through its
  // object, because the flag can be one more hop away in any of them.
  const onward = was.match(/^([A-Za-z_$][\w$]*)\s*(?:[.[][^\]]*\]?)?$/);
  if (onward) return whatItResolvesTo(onward[1], before, whole, depth + 1);
  // A CALL IS FOLLOWED TO THE FUNCTION THIS FILE DECLARES, read over the
  // WHOLE file rather than the text above the call, because the one that
  // vouches for work is declared below the spawns that use it.
  const call = was.match(/^([A-Za-z_$][\w$]*)\s*\(/);
  if (call) {
    const body = bodyOf(whole, call[1]);
    if (body === null) {
      return "nothing in this file declares " + call[1] + ", so this check cannot "
        + "say what it answers";
    }
    const inside = body.match(/["'`](-[^"'`]*)["'`]/);
    return inside ? inside[1] + " comes back from " + call[1] + "()" : "clean";
  }
  return "this check cannot read the value it was given, " + was;
}

// bodyOf answers a function's body, or nothing when the file declares none.
function bodyOf(text, name) {
  const at = text.search(new RegExp("(?:^|\\n)(?:async )?function " + name + "\\s*\\("));
  if (at < 0) return null;
  const open = text.indexOf("{", at);
  if (open < 0) return null;
  let depth = 0, i = open;
  for (; i < text.length; i++) {
    if (text[i] === "{") depth++;
    else if (text[i] === "}") {
      depth--;
      if (depth === 0) break;
    }
  }
  return text.slice(open, i);
}

// enclosing answers the name of the function the call sits in.
function enclosing(before) {
  const all = [...(before || "").matchAll(/(?:^|\n)(?:async )?function ([A-Za-z_$][\w$]*)\s*\(/g)];
  return all.length ? all[all.length - 1][1] : "";
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
