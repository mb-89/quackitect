// A DONE-WHEN LINE NAMES A COMMAND THE AGENT DECIDING IT MAY RUN.
//
// A criterion said "Decided by: go test -C src/engine -run ... -count=1 ./".
// Run in an agent lane it is refused outright, THE ENGINE OWNS THE TESTS, so
// the one hand that has to decide the sentence may not run the command written
// under it. What happens next is a reviewer translating the command by hand and
// a verdict recording a run under a heading naming a call the lane never made.
//
// SO THE GUARDS DECIDE WHAT A CRITERION MAY NAME. The tests guard refuses go
// test, a test binary and a check script inside the tree. The index guard
// refuses a searcher over the tree. The recursive-search guard refuses grep
// reading a tree. A criterion naming any of those names a command nobody
// deciding it can run.
//
// THE PROGRAM NAMES COME FROM THE GUARD RATHER THAN FROM HERE. A second list
// kept by hand drifts from the first one, and a check reading a list that has
// moved on reports on a rule nobody enforces. The lists are read out of
// src/engine/search.go and src/engine/tests.go, and a list that will not read
// is a failure rather than an empty set.
//
// A CLOSED NOTE IS HISTORY. Its criteria were decided while its lane was open,
// under whatever the guards were then, and rewriting them rewrites the record.
// What this guards is the work still to be decided, so it reads the notes that
// are not closed.
//
//   node util/checks/criteria-name-a-runnable-command.mjs <root>
//
// reads: doc/work/*.md, src/engine/search.go, src/engine/tests.go
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";

const root = process.argv[2] ?? ".";
const where = "doc/work";
const here = join(root, where);

let failed = 0;
const die = (why) => {
  console.log("FAIL " + why);
  process.exit(1);
};

// THE LISTS THE GUARD KEEPS, read off the guard.
const guardSource = (rel) => {
  const at = join(root, ...rel.split("/"));
  if (!existsSync(at)) die(rel + " is not there, so the programs the guards refuse cannot be read");
  return readFileSync(at, "utf8");
};

// namesIn answers the quoted words in the part of a Go source a pattern names,
// which is how a case line and a boolean return both spell a list.
const namesIn = (text, pattern, what) => {
  const m = pattern.exec(text);
  if (m === null) {
    die("the engine no longer spells " + what + " the way this check reads it, so the list it judges by would be guesswork");
  }
  const names = [...m[0].matchAll(/"([^"]+)"/g)].map((q) => q[1]);
  if (names.length === 0) die(what + " reads as an empty list, so this check would pass everything");
  return new Set(names);
};

const search = guardSource("src/engine/search.go");
const tests = guardSource("src/engine/tests.go");

// The index guard's searchers, from searcherName's case line.
const searchers = namesIn(search, /func searcherName[\s\S]*?case ("[^\n]*)/, "the searchers the index guard refuses");
// The recursive guard's older searchers, from olderSearcher's return.
const older = namesIn(search, /func olderSearcher[\s\S]*?return name ==[^\n]*/, "the searchers the recursive guard refuses");
// The programs that run a file they are handed, from interprets's case lines.
const interpreters = namesIn(tests, /func interprets[\s\S]*?case ("[\s\S]*?):\n/, "the programs that run a file they are handed");
const checksDir = "util/checks";

// pipeline cuts a command into the programs it runs, on the shell's separators,
// so a search behind a pipe is judged the way the guard judges it.
const separators = ["\r\n", "\n", "\r", "&&", "||", "|", ";", "&"];
const pipeline = (command) => {
  let parts = [command];
  for (const sep of separators) parts = parts.flatMap((p) => p.split(sep));
  return parts;
};

// words splits one program's words the way a shell would, so a quoted pattern
// stays one word and never reads as a path.
const words = (part) => {
  const out = [];
  let word = "";
  let quote = "";
  let open = false;
  for (const ch of part) {
    if (quote !== "") {
      if (ch === quote) quote = "";
      else word += ch;
      continue;
    }
    if (ch === "'" || ch === '"') { quote = ch; open = true; continue; }
    if (ch === " " || ch === "\t") {
      if (word !== "" || open) out.push(word);
      word = "";
      open = false;
      continue;
    }
    word += ch;
  }
  if (word !== "" || open) out.push(word);
  return out;
};

// head answers the program a word runs, by the name it is run as.
const head = (word) => {
  let name = word;
  const cut = Math.max(name.lastIndexOf("/"), name.lastIndexOf("\\"));
  if (cut >= 0) name = name.slice(cut + 1);
  return name.toLowerCase().replace(/\.exe$/, "");
};

// inside answers whether a path a criterion names is inside the tree. A note
// writes its paths relative to the root, so one that is not absolute and does
// not climb out of it is inside.
const inside = (path) => {
  if (path === "") return false;
  if (/^([a-zA-Z]:[\\/]|[\\/]|~)/.test(path)) return false;
  return !path.startsWith("..");
};

// readsATree is the recursive guard's question: -r, or a filter over many files.
const readsATree = (args) => {
  let saw = false;
  for (const a of args) {
    if (a.startsWith("-") && !a.startsWith("--")) {
      if (/[rR]/.test(a)) return true;
      continue;
    }
    if (a === "--recursive" || a === "--dereference-recursive") return true;
    if (a.startsWith("--include") || a.startsWith("--exclude")) saw = true;
  }
  return saw;
};

const aPath = (w) => w !== "" && !w.startsWith("-");

// whyRefused answers which guard refuses this command, or nothing.
function whyRefused(command) {
  const parts = pipeline(command);
  for (let i = 0; i < parts.length; i++) {
    const w = words(parts[i]);
    if (w.length === 0) continue;
    const name = head(w[0]);

    if (name === "go" && w[1] === "test") {
      let at = ".";
      for (let j = 0; j < w.length; j++) {
        if (w[j] === "-C" && j + 1 < w.length) at = w[j + 1];
        if (w[j].startsWith("-C=")) at = w[j].slice(3);
      }
      if (inside(at)) return "THE ENGINE OWNS THE TESTS, and se test is the door";
    }
    if (name.endsWith(".test") && inside(w[0])) {
      return "THE ENGINE OWNS THE TESTS, and a test binary in the tree is one it runs";
    }
    if (w[0].replace(/\\/g, "/").includes(checksDir + "/")) {
      return "THE ENGINE OWNS THE TESTS, and a check under " + checksDir + " is one it runs";
    }
    if (interpreters.has(name) && w.slice(1).some((a) => a.replace(/\\/g, "/").includes(checksDir + "/"))) {
      return "THE ENGINE OWNS THE TESTS, and a check under " + checksDir + " is one it runs";
    }

    if (searchers.has(name)) {
      const paths = w.slice(1).filter(aPath);
      const grepLike = name.startsWith("grep") || older.has(name);
      const readsItsInput = paths.length === 0 && (i > 0 || grepLike);
      if (!readsItsInput && (paths.length === 0 || paths.some(inside))) {
        return "THE TREE IS INDEXED, and a search over it goes through se find";
      }
    }
    if (older.has(name) && readsATree(w.slice(1))) {
      return "A RECURSIVE SEARCH OVER THE TREE goes through the searcher the probe found";
    }
  }
  return "";
}

// theCommands answers what a done-when line names as the command deciding it:
// whatever is fenced in backticks, and whatever follows the first "decided by"
// or, failing that, the last colon. Prose after the command is cut at the first
// comma outside quotes, because "which answers 5 today" is a sentence rather
// than an argument, and every bare word after a searcher reads as a path.
function theCommands(line) {
  const out = [];
  for (const m of line.matchAll(/`([^`]+)`/g)) out.push(m[1]);
  const bare = line.replace(/`[^`]*`/g, " ");
  const said = /decided by:?\s+/i.exec(bare);
  if (said !== null) out.push(bare.slice(said.index + said[0].length));
  else {
    const colon = bare.lastIndexOf(": ");
    if (colon >= 0) out.push(bare.slice(colon + 2));
  }
  return out.map(untilTheProse).filter((c) => c.trim() !== "");
}

function untilTheProse(text) {
  let quote = "";
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quote !== "") { if (ch === quote) quote = ""; continue; }
    if (ch === "'" || ch === '"') { quote = ch; continue; }
    if (ch === ",") return text.slice(0, i);
  }
  return text;
}

if (!existsSync(here)) die(where + " is not there, so this guards nothing");

const notes = readdirSync(here)
  .filter((name) => name.endsWith(".md"))
  .filter((name) => !statSync(join(here, name)).isDirectory())
  .sort();
if (notes.length === 0) die(where + " holds no note, so this guards nothing");

let read = 0;
let judged = 0;

for (const name of notes) {
  const text = readFileSync(join(here, name), "utf8");
  const status = /^status:[ \t]*(\S+)[ \t]*$/m.exec(text);
  if (status !== null && status[1] === "closed") continue;
  read++;
  const lines = text.split("\n");
  let inDoneWhen = false;
  let fenced = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].replace(/\r$/, "");
    if (line.trimStart().startsWith("```")) { fenced = !fenced; continue; }
    if (fenced) continue;
    const heading = /^##[ \t]+(\S.*?)[ \t]*$/.exec(line);
    if (heading !== null) { inDoneWhen = heading[1].toLowerCase() === "done when"; continue; }
    if (!inDoneWhen || !line.startsWith("- ")) continue;
    for (const command of theCommands(line)) {
      judged++;
      const why = whyRefused(command);
      if (why === "") continue;
      console.log(
        "FAIL " + where + "/" + name + ":" + (i + 1) + " names \"" + command.trim() + "\", "
        + "which the guards refuse. " + why + ". The hand that has to decide this criterion "
        + "cannot run the command written under it",
      );
      failed++;
    }
  }
}

// A CHECK THAT FINDS NOTHING TO JUDGE IS NOT A GREEN CHECK.
if (judged === 0) die("no done-when line under " + where + " names a command, so this check judged nothing");

console.log(read + " open note(s) read, " + judged + " command(s) judged. " + failed + " failed.");
process.exit(failed === 0 ? 0 : 1);
