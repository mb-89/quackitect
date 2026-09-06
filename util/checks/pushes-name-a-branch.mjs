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
// WHAT IS READ: every non-test .go file under src, one folder deep per package.
// A push is a git call whose first argument is push, and what it pushes is the
// right-hand side of each local:remote refspec after it. Identifiers are
// resolved against the const strings the same tree declares.
//
// reads: src/engine/*.go, src/mcp/*.go, src/viewer/*.go
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
const source = [];
for (const pkg of ["engine", "mcp", "viewer"]) {
  const dir = join(root, "src", pkg);
  if (!existsSync(dir) || !statSync(dir).isDirectory()) continue;
  for (const name of readdirSync(dir)) {
    if (name.endsWith(".go") && !name.endsWith("_test.go")) source.push(join(dir, name));
  }
}

say("there is source to judge (" + source.length + " file(s))", source.length > 0,
  "no non-test .go was found under " + join(root, "src") + ", so this has nothing "
  + "to judge and is not doing its job");

// THE CONSTANTS ARE RESOLVED, because a push names claimsBranch rather than the
// string. One pass over the same source collects every string const.
const named = new Map();
const aConst = /(?:^|\s)(\w+)\s*=\s*"([^"]*)"/;
for (const file of source) {
  for (const line of readFileSync(file, "utf8").split("\n")) {
    if (!/^\s*(const\s+)?\w+\s*=\s*"/.test(line)) continue;
    const m = line.match(aConst);
    if (m) named.set(m[1], m[2]);
  }
}

// spellOut turns a Go expression into the text it builds, as far as the string
// constants say. What it cannot resolve it leaves as the identifier, and an
// unresolved word is not a refs/ prefix, so it is read as a branch name.
function spellOut(expr) {
  return expr.split("+").map((part) => {
    const bit = part.trim();
    const quoted = bit.match(/^"([^"]*)"$/);
    if (quoted) return quoted[1];
    if (named.has(bit)) return named.get(bit);
    return bit;
  }).join("");
}

// theRefspecs answers what a push line sends, one entry per argument after the
// push and its remote.
//
// THE CALL IS CUT AT ITS OWN CLOSING PAREN. A push in Go sits inside an if,
// so the line runs on into `); err == nil {`. Read whole, that tail stuck to
// the last argument, the argument stopped resolving, and the check answered
// green over a push to refs/se. A check that cannot redden is the finding.
function theRefspecs(line) {
  const at = line.indexOf('"push"');
  if (at < 0) return [];
  const rest = line.slice(at + '"push"'.length).split(")")[0];
  return rest.split(",").map((a) => a.trim()).filter(Boolean)
    .map(spellOut)
    .filter((a) => a.includes(":"));
}

// theFarSide is where a refspec lands on the remote: the half after the colon.
// A refspec carries one, and a leading + is the force marker rather than part
// of a name.
function theFarSide(spec) {
  return spec.slice(spec.indexOf(":") + 1).trim();
}

let pushes = 0;
for (const file of source) {
  const name = relative(root, file).replace(/\\/g, "/");
  const lines = readFileSync(file, "utf8").split("\n");
  lines.forEach((line, i) => {
    if (!line.includes('"push"')) return;
    for (const spec of theRefspecs(line)) {
      pushes++;
      const far = theFarSide(spec);
      const ok = !far.startsWith("refs/") || far.startsWith("refs/heads/");
      say(name + ":" + (i + 1) + " pushes to a branch", ok,
        "it sends " + spec + ", which lands on " + far + ". A cloud box is "
        + "answered 403 for every namespace but refs/heads, and the push fails "
        + "there and nowhere else. Send it to refs/heads/... instead");
    }
  });
}

say("a push was found to judge (" + pushes + ")", pushes > 0,
  "no push was found in the engine's source, so either the claim relay has "
  + "moved or this check no longer finds it. Either way it is guarding nothing");

console.log("\n" + pushes + " push(es) read over " + source.length + " file(s). " + bad + " failed.");
process.exit(bad ? 1 : 0);
