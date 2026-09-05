// Every file the engine keeps under .se has a writer in the tree.
//
// tickets.json outlived ticket.go. Nothing read it and nothing wrote it, and
// it sat there looking like state the engine still kept. A reader cannot tell
// live state from a leftover by looking, so the tree is asked instead: the
// name of every entry under .se has to appear in some source under src or
// util, which is where the code that writes it lives.
//
// This is a sweep over names rather than a proof of writing. A name that
// appears only in a comment passes. That is enough for what it is for, which
// is finding the file no source mentions at all.
//
// It reads src and nothing else. .se is written by the engine, and the engine
// is src. Reading util as well made this check unable to fail: the comment
// above names the very file the sweep was written to catch, so the leftover
// looked owned by the check hunting it.
//
//   node util/checks/private-files-have-writers.mjs <root>
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const root = process.argv[2] ?? ".";

let bad = 0;
function say(what, ok, why) {
  if (!ok) bad++;
  console.log((ok ? "  ok   " : "  FAIL ") + what + (ok ? "" : "\n         " + why));
}

// Written beside the database by SQLite rather than by any source of ours, so
// the name to look for is the database's. Named here with the reason, so a
// reader can tell an allowance from an oversight.
const sidecar = /-(shm|wal)$/;

// A WRITE IN FLIGHT IS NOT STATE. The engine builds every temporary under .se
// with os.CreateTemp, which puts a number in the middle of the name, so no
// source can name the file that appears: the source names the pattern. One is
// there for as long as a snapshot, a claim or a test run takes, and the sweep
// takes what a killed process left. So the suffix is the allowance, and a
// temporary that outlives its writer is the sweep's business rather than this
// check's.
const inFlight = /\.tmp$/;

// A DOCUMENT IS NOT STATE. The README says .se holds dated reports and measured
// evidence, and a person writes those. This check hunts the file no source
// mentions, which is a leftover of code that went, and a report is never that:
// no source writes one and none should. Markdown at the top of .se is the
// document, and the engine's own state is JSON and the index beside it.
const aDocument = /\.md$/;

// Where the code that writes the engine's state lives. Anything built or
// fetched is skipped: it is not source, and a name found there proves nothing.
const sourceDirs = ["src"];
const skipDirs = new Set(["node_modules", "out", ".bin", ".git", ".se"]);
// Read as text. A binary would only add noise to a substring search.
const readable = new Set([
  ".go", ".ts", ".tsx", ".js", ".mjs", ".cjs", ".json", ".yaml", ".yml",
  ".md", ".sh", ".ps1", ".py", ".html", ".css", ".base", ".txt",
]);

let sourceRead = 0;
const source = [];
function readSource(dir) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return; // a source folder this copy does not have
  }
  for (const name of entries) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      if (!skipDirs.has(name)) readSource(full);
      continue;
    }
    if (!readable.has(extname(name))) continue;
    try {
      source.push(readFileSync(full, "utf8"));
      sourceRead++;
    } catch { /* unreadable, and it can prove nothing either way */ }
  }
}
for (const dir of sourceDirs) readSource(join(root, dir));
const haystack = source.join("\n");

say("the source was read (" + sourceRead + " files)", sourceRead > 0,
  "no source was read, so every name would look unwritten and this check "
  + "would fail everything for the wrong reason");

let entries;
try {
  entries = readdirSync(join(root, ".se"));
} catch {
  say("there is a .se folder to walk", false,
    "no .se folder under " + root + ", so this has nothing to judge");
  console.log("\n0 entries looked at. " + bad + " failed.");
  process.exit(1);
}

let inFlightSeen = 0;
for (const name of entries.sort()) {
  if (inFlight.test(name)) {
    inFlightSeen++;
    say(name + " is a write in flight, and the sweep owns it", true);
    continue;
  }
  if (aDocument.test(name)) {
    say(name + " is a document a person wrote, and no source writes one", true);
    continue;
  }
  const looksFor = name.replace(sidecar, "");
  const owned = haystack.includes(looksFor);
  const aside = looksFor === name ? "" : ", written beside " + looksFor + " by SQLite";
  say(name + " has a writer in the tree" + aside, owned,
    "no source under " + sourceDirs.join(" or ") + " names " + looksFor
    + ", so nothing reads or writes it and it is a leftover. Delete it, or "
    + "land the code that keeps it");
}

console.log("\n" + entries.length + " entr(y/ies) looked at, " + inFlightSeen
  + " of them a write in flight. " + bad + " failed.");
process.exit(bad ? 1 : 0);
