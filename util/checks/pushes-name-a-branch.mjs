// A CLOUD BOX WRITES refs/heads AND NOTHING ELSE.
//
// MEASURED, September 2026, one commit object and one session, minutes apart:
// refs/heads created twice, refs/se 403, refs/notes 403, refs/tags 403, and a
// delete of a branch it had just created 403. The git proxy in front of a cloud
// box refuses every namespace but refs/heads.
//
// WHAT THAT COST. claim.go pushed refs/se/claims, put the failure in prose, and
// carried on. So a box took a claim, believed it published, and no other box
// saw it. Two boxes could hold one token and neither would know. The archive
// pushed refs/tags/archive/<id> and lost the only copy of six notes the same
// way.
//
// BOTH ARE FIXED, AND NOTHING WATCHES THEM. A claim rides refs/heads/se/claims
// and the archive is a file on the branch. This fails the day a push names any
// other namespace again, which is the only way that regression is visible: it
// works on every desk and fails on every cloud box.
//
// WHAT IS READ: every non-test .go file anywhere under src. A push is a git
// call carrying push as an argument, and what it sends is every argument after
// the remote. Identifiers are resolved against the const strings the same tree
// declares, and a call is read to its own closing paren.
//
// FIXTURES RUN BESIDE THE TREE. This check went green and was then shown to
// pass over the very push it names. Twice. So each shape it was blind to is
// driven below, in the run that guards the tree.
//
// reads: src/**/*.go
//
//   node util/checks/pushes-name-a-branch.mjs <root>
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.argv[2] ?? ".";

let bad = 0;
function say(what, ok, why) {
  if (!ok) bad++;
  console.log((ok ? "  ok   " : "  FAIL ") + what + (ok ? "" : "\n         " + why));
}

// THE SET IS THE ENGINE'S OWN SOURCE, tests left out: a test drives a fed git
// that pushes nowhere, and naming a ref there is how it proves the rule.
//
// EVERY FOLDER UNDER src IS WALKED. It was three folder names written down, so
// a package added beside them was read by nobody, and a push in it went unseen.
function theSource(root) {
  const out = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const at = join(dir, entry.name);
      if (entry.isDirectory()) walk(at);
      else if (entry.name.endsWith(".go") && !entry.name.endsWith("_test.go")) out.push(at);
    }
  };
  const src = join(root, "src");
  if (existsSync(src) && statSync(src).isDirectory()) walk(src);
  return out.sort();
}

const source = theSource(root);

say("there is source to judge (" + source.length + " file(s))", source.length > 0,
  "no non-test .go was found under " + join(root, "src") + ", so this has nothing "
  + "to judge and is not doing its job");

// THE CONSTANTS ARE RESOLVED, because a push names claimsBranch rather than the
// string. One pass over the same source collects every string const.
const aConst = /(?:^|\s)(\w+)\s*=\s*"([^"]*)"/;
function constantsInto(named, text) {
  for (const line of text.split("\n")) {
    if (!/^\s*(const\s+)?\w+\s*=\s*"/.test(line)) continue;
    const m = line.match(aConst);
    if (m) named.set(m[1], m[2]);
  }
  return named;
}

// theTerms cuts a Go expression at its plus signs, outside string literals. A
// plus inside a literal is part of the text rather than a join.
function theTerms(expr) {
  const out = [];
  let part = "";
  let quote = "";
  for (let i = 0; i < expr.length; i++) {
    const c = expr[i];
    if (quote) {
      part += c;
      if (c === "\\") part += expr[++i] ?? "";
      else if (c === quote) quote = "";
      continue;
    }
    if (c === '"' || c === "`") {
      quote = c;
      part += c;
      continue;
    }
    if (c === "+") {
      out.push(part);
      part = "";
      continue;
    }
    part += c;
  }
  out.push(part);
  return out;
}

// spellOut turns a Go expression into the text it builds, as far as the string
// constants say. What it cannot resolve it leaves as the identifier, and an
// unresolved word is not a refs/ prefix, so it is read as a branch name.
function spellOut(expr, named) {
  return theTerms(expr).map((part) => {
    const bit = part.trim();
    const quoted = bit.match(/^"([^"]*)"$/);
    if (quoted) return quoted[1];
    if (named.has(bit)) return named.get(bit);
    return bit;
  }).join("");
}

// theArguments reads from just after one argument to the call's own closing
// paren, and answers the arguments between.
//
// DEPTH IS COUNTED, so a nested call is passed over and a wrapped call is read
// whole. Cutting at the first closing paren cut short a refspec that a call
// builds. Reading one line glued `); err == nil {` onto the last argument.
// Both answered green over a push that fails on every cloud box.
function theArguments(text, from) {
  const out = [];
  let part = "";
  let depth = 0;
  let quote = "";
  for (let i = from; i < text.length; i++) {
    const c = text[i];
    if (quote) {
      part += c;
      if (c === "\\") part += text[++i] ?? "";
      else if (c === quote) quote = "";
      continue;
    }
    if (c === "/" && text[i + 1] === "/") {
      const nl = text.indexOf("\n", i);
      i = nl < 0 ? text.length : nl;
      continue;
    }
    if (c === '"' || c === "`") {
      quote = c;
      part += c;
      continue;
    }
    if (c === ")" && depth === 0) break;
    if (c === "," && depth === 0) {
      out.push(part);
      part = "";
      continue;
    }
    if (c === "(" || c === "[" || c === "{") depth++;
    if (c === ")" || c === "]" || c === "}") depth--;
    part += c;
  }
  out.push(part);
  return out.map((a) => a.trim()).filter(Boolean);
}

// thePushes answers every ref a file sends, with the line it is sent from.
//
// A PUSH IS AN ARGUMENT rather than any line holding the word. claim.go
// compares a variable against push to decide whether a git call reaches the
// network, and that line sends nothing.
//
// EVERY ARGUMENT AFTER THE REMOTE IS A REF. It was only the ones holding a
// colon, so refs/tags/archive/<id> was dropped before anything judged it.
function thePushes(text, named) {
  const out = [];
  const word = '"push"';
  for (let at = text.indexOf(word); at >= 0; at = text.indexOf(word, at + 1)) {
    let before = at - 1;
    while (before >= 0 && /\s/.test(text[before])) before--;
    if (before < 0 || (text[before] !== "(" && text[before] !== ",")) continue;
    const line = text.slice(0, at).split("\n").length;
    let remote = false;
    for (const arg of theArguments(text, at + word.length)) {
      const spec = spellOut(arg, named);
      if (spec.startsWith("-")) continue;
      if (!remote) {
        remote = true;
        continue;
      }
      out.push({ line, spec });
    }
  }
  return out;
}

// theFarSide is where a refspec lands on the remote. One with a colon lands
// where its right half names, and one without lands where it names. A leading
// plus is the force marker rather than part of a name.
function theFarSide(spec) {
  const at = spec.indexOf(":");
  return (at < 0 ? spec : spec.slice(at + 1)).replace(/^\+/, "").trim();
}

// isRefused answers whether a landing place is one a cloud box is told 403 for.
// Anything outside refs/ is a branch name, and a branch name lands under
// refs/heads.
function isRefused(far) {
  return far.startsWith("refs/") && !far.startsWith("refs/heads/");
}

const named = new Map();
for (const file of source) constantsInto(named, readFileSync(file, "utf8"));

let pushes = 0;
for (const file of source) {
  const name = relative(root, file).replace(/\\/g, "/");
  for (const sent of thePushes(readFileSync(file, "utf8"), named)) {
    pushes++;
    const far = theFarSide(sent.spec);
    say(name + ":" + sent.line + " pushes to a branch", !isRefused(far),
      "it sends " + sent.spec + ", which lands on " + far + ". A cloud box is "
      + "answered 403 for every namespace but refs/heads, and the push fails "
      + "there and nowhere else. Send it to refs/heads/... instead");
  }
}

say("a push was found to judge (" + pushes + ")", pushes > 0,
  "no push was found in the engine's source, so either the claim relay has "
  + "moved or this check no longer finds it. Either way it is guarding nothing");

// THE FIXTURES PROVE THE READER STILL REDDENS. Each drives one shape this
// check was blind to, or one it has to stay quiet over. They run over text
// rather than the tree, so the same reader answers both.
const fixtures = [
  {
    what: "a colonless refspec is judged",
    go: `const archiveRefs = "refs/tags/archive/"
func archive(ctx context.Context, id string) {
	if _, err := gitIn(ctx, r, index.Name(), "push", "origin", archiveRefs+id); err == nil {
	}
}
`,
    reads: 1,
    lands: ["refs/tags/archive/id"],
  },
  {
    what: "a call wrapped over two lines is judged",
    go: `const claimsRef = "refs/se/claims"
const notesRef = "refs/notes/se"
func publish(ctx context.Context) {
	_, err := gitIn(ctx, r, index.Name(), "push", "origin",
		claimsRef+":"+notesRef)
	_ = err
}
`,
    reads: 1,
    lands: ["refs/notes/se"],
  },
  {
    what: "a refspec a call builds is not cut short",
    go: `func publish(ctx context.Context) {
	gitIn(ctx, r, index.Name(), "push", "origin", theRef(id)+":"+"refs/tags/x")
}
`,
    reads: 1,
    lands: ["refs/tags/x"],
  },
  {
    what: "a flag before the remote is passed over",
    go: `func publish(ctx context.Context) {
	gitIn(ctx, r, index.Name(), "push", "--force", "origin", "refs/se/x:refs/se/x")
}
`,
    reads: 1,
    lands: ["refs/se/x"],
  },
  {
    what: "the claim relay as it stands is quiet",
    go: `const claimsRef = "refs/se/claims"
const claimsBranch = "refs/heads/se/claims"
func publish(ctx context.Context) {
	if _, err := gitIn(ctx, r, index.Name(), "push", "origin", claimsRef+":"+claimsBranch); err == nil {
	}
}
`,
    reads: 1,
    lands: [],
  },
  {
    what: "a comparison against push is not a call",
    go: `func reaches(a string) bool {
	return a == "fetch" || a == "push"
}
`,
    reads: 0,
    lands: [],
  },
];

let drove = 0;
for (const f of fixtures) {
  const read = thePushes(f.go, constantsInto(new Map(), f.go));
  const landed = read.map((p) => theFarSide(p.spec));
  const stopped = landed.filter(isRefused);
  const ok = read.length === f.reads && stopped.join(" ") === f.lands.join(" ");
  say("fixture: " + f.what, ok,
    "it read " + read.length + " push(es) landing on [" + landed.join(", ")
    + "] and refused [" + stopped.join(", ") + "]. It was to read " + f.reads
    + " and refuse [" + f.lands.join(", ") + "]");
  drove++;
}

console.log("\n" + pushes + " push(es) read over " + source.length + " file(s), "
  + drove + " fixture(s) driven. " + bad + " failed.");
process.exit(bad ? 1 : 0);
