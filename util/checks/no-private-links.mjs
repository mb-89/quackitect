// A token that travels names no token that does not.
//
// doc/work is in version control and .se/work is not. A cloud box reads the
// tree out of git, so .se/work is not there at all. A traced token naming a
// private one hands that reader an id it cannot open, and nothing says why. It
// reads as a broken link rather than as a door that is shut.
//
// The rule is one way. A private note may name a traced token, because whoever
// reads the private note has the traced one as well.
//
// It reads the folders rather than the index, so it answers on a fresh clone
// where no index has been built yet.
//
//   node util/checks/no-private-links.mjs <root>
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.argv[2] ?? ".";
const traced = join(root, "doc", "work");
const privateWork = join(root, ".se", "work");

let bad = 0;
function say(what, ok, why) {
  if (!ok) bad++;
  console.log((ok ? "  ok   " : "  FAIL ") + what + (ok ? "" : "\n         " + why));
}

function notesIn(dir) {
  try {
    return readdirSync(dir).filter((n) => n.endsWith(".md"));
  } catch {
    return [];
  }
}

const travels = new Set(notesIn(traced).map((n) => n.slice(0, -3)));
const stays = new Set(notesIn(privateWork).map((n) => n.slice(0, -3)));

say("there are traced tokens to read (" + travels.size + ")", travels.size > 0,
  "no token under doc/work, so every link would look clean and this check "
  + "would pass for the wrong reason");

// A LINK IS THE EDITOR'S BRACKETS. The engine writes every reference that way,
// so this is the one shape to look for.
const link = /\[\[(wk-[0-9a-f]+)\]\]/g;

let looked = 0;
for (const name of notesIn(traced).sort()) {
  const id = name.slice(0, -3);
  let text;
  try {
    text = readFileSync(join(traced, name), "utf8");
  } catch {
    continue; // it went while this ran, and it can prove nothing either way
  }
  looked++;
  const named = new Set();
  for (const m of text.matchAll(link)) named.add(m[1]);
  const shut = [...named].filter((t) => stays.has(t) && !travels.has(t)).sort();
  say(id + " names only tokens that travel", shut.length === 0,
    id + " names " + shut.join(", ") + ", which "
    + (shut.length === 1 ? "stays" : "stay") + " under .se/work and never "
    + "reaches a reader of this one. Take the reference out, or say in words "
    + "what the private note held");
}

console.log("\n" + looked + " traced token(s) read against " + stays.size
  + " private one(s). " + bad + " failed.");
process.exit(bad ? 1 : 0);
