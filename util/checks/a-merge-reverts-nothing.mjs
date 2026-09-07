// A MERGE RESOLVES, AND IT DOES NOT REVERT.
//
// A merge writes content that matches neither parent all the time, and that is
// what resolving a conflict looks like. It is a revert only where one side
// never moved the file: there was nothing to choose between, and the merge
// wrote a third thing anyway. That third thing is a mid-edit copy out of a
// shared working tree, and the work on the side that did move is gone.
//
// MEASURED over 159 merges. Seventeen carry a file matching neither parent,
// and fifteen of those had both parents move it, so fifteen are resolutions.
// Two carry a one-sided rewrite, thirteen files between them. See wk-2a591a892a.
//
// THE TWO ARE READ AND RULED, by sha and with the reason, so this names a new
// one rather than the two somebody has already looked at.
//
//   node util/checks/a-merge-reverts-nothing.mjs <root>
import { execFileSync } from "node:child_process";

const root = process.argv[2] ?? ".";
const git = (...a) =>
  execFileSync("git", a, { cwd: root, encoding: "utf8", maxBuffer: 1 << 28, stdio: ["ignore", "pipe", "ignore"] });

// alreadyRead is every one-sided rewrite somebody has read, and what they said.
const alreadyRead = new Map([
  ["ecb7857b45eddab06ee85180c9d19b39a88fcf1b",
    "the cloud session's work is taken, which is what its message says it does"],
  ["b3105cfbcf51e7fc1e08f9b40b7e98fe5d5702e0",
    "one test file, taken from the side that carried the context threading"],
]);

let bad = 0;
function say(what, ok, why) {
  if (!ok) bad++;
  console.log((ok ? "  ok   " : "  FAIL ") + what + (ok ? "" : "\n         " + why));
}

let merges;
try {
  merges = git("rev-list", "--merges", "HEAD").trim().split("\n").filter(Boolean);
} catch (e) {
  console.log("  ok   this folder has no branch to walk, so nothing is asked of it");
  console.log("\n0 merge(s) read. 0 failed.");
  process.exit(0);
}

// EVERY BLOB IN A REV, IN ONE CALL RATHER THAN ONE PER FILE.
//
// This asked git for a single blob at a time, `git rev-parse <rev>:<path>`, four
// revs deep for every file a merge touched.
//
// MEASURED on this tree: 176 merges and 1,324 seconds, which was 92% of the
// whole battery. The other fifty-odd checks run seven at a time underneath it,
// so the battery's length WAS this check. Nothing else was slow, and the machine
// was never the problem.
//
// It is quadratic in the wrong two things: the history only grows, and every run
// walks all of it from the beginning. One `ls-tree -r` answers every path in a
// rev at once, and the four revs of a merge are shared with its neighbours, so
// the process count falls from tens of thousands to a few hundred.
//
// -z, BECAUSE A PATH IS NOT A WORD. Without it git quotes any path holding a
// space or a non-ASCII byte, and the quoted name would never match the one the
// diff reported, so the file would read as absent on both sides and the merge
// would look clean.
const treeOf = new Map();
const treeFor = (rev) => {
  const had = treeOf.get(rev);
  if (had) return had;
  const t = new Map();
  try {
    for (const entry of git("ls-tree", "-r", "-z", rev).split("\0")) {
      const tab = entry.indexOf("\t");
      if (tab < 0) continue;
      t.set(entry.slice(tab + 1), entry.slice(0, tab).split(" ")[2]);
    }
  } catch {
    /* a rev whose tree will not read answers every path as absent, which is
       what the old per-file call did when it threw */
  }
  treeOf.set(rev, t);
  return t;
};

const blob = (rev, path) => treeFor(rev).get(path) ?? "";

for (const m of merges) {
  const parents = git("rev-list", "--parents", "-n1", m).trim().split(" ").slice(1);
  if (parents.length !== 2) continue;
  const [a, b] = parents;
  let base;
  try {
    base = git("merge-base", a, b).trim();
  } catch {
    continue; // no common history, so there is no side that failed to move
  }
  const touched = new Set();
  for (const p of parents) {
    for (const f of git("diff", "--name-only", p, m).trim().split("\n").filter(Boolean)) touched.add(f);
  }
  const reverts = [];
  for (const f of touched) {
    const mm = blob(m, f);
    const aa = blob(a, f);
    const bb = blob(b, f);
    if (mm === aa || mm === bb) continue; // one side's content survived
    const ba = blob(base, f);
    if ((aa === ba) !== (bb === ba)) reverts.push(f); // only one side moved it
  }
  if (reverts.length === 0) continue;
  const ruled = alreadyRead.get(m);
  say(m.slice(0, 8) + " reverts nothing", ruled !== undefined,
    "it writes " + reverts.length + " file(s) that neither parent holds, and only one side " +
    "moved them, so there was nothing to resolve: " + reverts.slice(0, 4).join(", ") +
    (reverts.length > 4 ? " and " + (reverts.length - 4) + " more" : "") +
    ". That is a mid-edit copy out of a shared working tree, and the work on the " +
    "side that moved is gone. Read it against both parents, restore what it dropped, " +
    "and add its sha to alreadyRead with what you found");
}

console.log("\n" + merges.length + " merge(s) read. " + bad + " failed.");
process.exit(bad ? 1 : 0);
