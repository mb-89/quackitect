// A COMMIT CARRIES ONE TOKEN'S WORK, AND ITS MESSAGE NAMES THAT TOKEN.
//
// A commit closing one token carried fifteen paths. Four were its own change.
// Eleven were another hand's work in the shared tree: a new file of 180 lines,
// a rewrite of the arrival, and that other token's note. The only commit the
// new file has is a message about notes, so a reader tracing why the pull
// count stopped deciding gone lands on the wrong story, and a revert of the
// one change takes the other with it. git log -p --grep=<id> is how a reviewer
// is told to read a change, and it handed back two changes mixed together.
//
// STAGING BY NAME IS THE RULE ALREADY, AND NOTHING ENFORCED IT. This does, on
// the cheap sign the class leaves: the message names one token, and the paths
// include doc/work/<another id>.md whose note reads open in that commit. A note
// the commit closes and archives is not another hand's work, so a note that
// reads closed is passed over, and so is a merge, which carries everything.
// A commit that mints a finding carries that note on purpose, and it names it.
//
// WHAT IT JUDGES. HEAD alone, run from the battery, because the commit being
// made is the one still cheap to redo. Handed revisions or ranges, it judges
// those instead, so what a push would carry is one command:
//
//   node util/checks/commits-carry-one-token.mjs <root> [rev | from..to ...]
//   node util/checks/commits-carry-one-token.mjs . origin/v4..HEAD
//
// reads: git, the commit messages and doc/work/*.md at each commit
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const root = process.argv[2] ?? ".";
const asked = process.argv.slice(3);

let failed = 0;
function fail(said) {
  failed++;
  console.log("FAIL " + said);
}

// A ROOT THAT IS NOT THERE IS A FAILURE AND NOT A SKIP.
if (!existsSync(join(root, "doc", "work"))) {
  console.log("FAIL doc/work is not there, so this guards nothing");
  process.exit(1);
}

// STDERR IS KEPT, NOT PRINTED. A note absent at a commit makes git show say so,
// and that is an answer this reads rather than noise for the battery.
function git(args) {
  return execFileSync("git", args, {
    cwd: root, encoding: "utf8", maxBuffer: 1 << 28, stdio: ["ignore", "pipe", "pipe"],
  });
}

// A FOLDER WITH NO HISTORY HAS NO COMMIT TO JUDGE.
try {
  git(["rev-parse", "--git-dir"]);
} catch {
  console.log("  ok   this folder has no branch to read, so no commit can be judged");
  console.log("\n0 commit(s) read. 0 failed.");
  process.exit(0);
}

// AN INVENTED ID IS ONE CHARACTER REPEATED, and reads as a fixture rather than
// as a token in the record. See tests-name-no-token.
const minted = /wk-[0-9a-f]{10}/g;
const invented = (id) => new Set(id.slice(3)).size === 1;
const idsIn = (text) => new Set([...(text.match(minted) ?? [])].filter((id) => !invented(id)));

// THE COMMITS, in the order git lists them. A range is a range and a revision
// is one commit, which is what rev-list --no-walk makes of a plain name.
function commitsOf(revs) {
  const out = [];
  for (const rev of revs) {
    const args = rev.includes("..") ? ["rev-list", "--reverse", rev] : ["rev-list", "--no-walk", rev];
    out.push(...git(args).split("\n").map((l) => l.trim()).filter(Boolean));
  }
  return out;
}

let commits = [];
try {
  commits = commitsOf(asked.length > 0 ? asked : ["HEAD"]);
} catch (e) {
  console.log("FAIL the revisions asked for cannot be listed: " + e.message.split("\n")[0]);
  process.exit(1);
}

// noteStatus answers what a note said its status was at a commit, or at the
// parent where the commit removed it, and nothing where neither carries it.
function noteStatus(commit, path) {
  for (const at of [commit, commit + "^"]) {
    let text = "";
    try {
      text = git(["show", at + ":" + path]);
    } catch {
      continue;
    }
    const front = text.split(/^---\s*$/m)[1] ?? "";
    const m = front.match(/^status:\s*(\S+)/m);
    return m ? m[1].trim() : "open";
  }
  return "";
}

let read = 0;
for (const commit of commits) {
  const short = commit.slice(0, 8);
  const parents = git(["rev-list", "--parents", "-n", "1", commit]).trim().split(/\s+/).length - 1;
  if (parents > 1) continue; // a merge carries every side's work, and that is what a merge is
  read++;
  const named = idsIn(git(["log", "-1", "--format=%B", commit]));
  if (named.size === 0) continue; // a sweep or a retro names no token, and that is another rule
  const paths = git(["diff-tree", "--no-commit-id", "--name-only", "-r", "--root", commit])
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  for (const path of paths) {
    const m = path.match(/^doc\/work\/(wk-[0-9a-f]{10})\.md$/);
    if (!m || invented(m[1]) || named.has(m[1])) continue;
    const status = noteStatus(commit, path);
    if (status === "" || status === "closed") continue;
    fail(
      `${short} names ${[...named].join(", ")} and carries ${path}, a token it does not name and ` +
        `whose note reads ${status}. That is another hand's work riding in this commit. ` +
        "Stage by name, so a commit carries one token, or name every token it carries",
    );
  }
}

console.log(`${read} commit(s) read. ${failed} failed.`);
process.exit(failed === 0 ? 0 : 1);
