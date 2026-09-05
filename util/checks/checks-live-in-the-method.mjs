// THE CHECKS LIVE IN THE METHOD, NOT IN THE FOLDER THE RETRO DRAINS.
//
// A retro empties .se/scratchpad. While the checks lived there, one run took
// the thing that judges the next one, and the battery would have come back
// answering all ok over nothing.
//
// THIS ASKS WHERE THEY ARE, WHICH IS A THING THE TREE CAN ANSWER. A criterion
// once decided this by searching battery.sh for the words "go test", which are
// there whatever the checks are and wherever they sit: a reviewer built the
// forbidden tree, with every check pointed back at the scratchpad, and that
// command exited zero over it.
//
//   node util/checks/checks-live-in-the-method.mjs <root>
import { spawnSync } from "node:child_process";
import { readFileSync, existsSync, readdirSync, realpathSync } from "node:fs";
import { join, resolve } from "node:path";

const root = process.argv[2] ?? ".";

let bad = 0;
function say(what, ok, why) {
  if (!ok) bad++;
  console.log((ok ? "  ok   " : "  FAIL ") + what + (ok ? "" : "\n         " + why));
}

const script = join(root, "util", "checks", "battery.sh");
const text = readFileSync(script, "utf8");

// THE NAMES THE BATTERY ITSELF LISTS, read out of it rather than typed here,
// because a list in two places is a list that disagrees with itself.
const listed = [...text.matchAll(/^for c in ([^;]+); do$/gm)]
  .flatMap((m) => m[1].trim().split(/\s+/));
say("the battery lists the checks it runs (" + listed.length + ")", listed.length > 0,
  "no list of checks was found in battery.sh, so this has nothing to judge and "
  + "is not doing its job");

// AND EVERY PATH IT BUILDS FROM THEM RESOLVES UNDER util/checks.
const paths = [...text.matchAll(/"?([\w./$-]*\$c\.mjs)"?/g)].map((m) => m[1]);
say("the battery builds a path for each of them (" + paths.length + ")", paths.length > 0,
  "no path built from the check's name was found, so where they live is decided "
  + "by nothing this can read");

for (const one of new Set(paths)) {
  say("the battery reads " + one + " from the method", one.startsWith("util/checks/"),
    "it reads a check from " + one + ", and a retro empties .se/scratchpad, so one "
    + "run would take the thing that judges the next one");
}

// AND EACH NAMED CHECK IS ACTUALLY THERE, so this cannot pass by the folder
// having been emptied already.
for (const c of listed) {
  say(c + " is in util/checks", existsSync(join(root, "util", "checks", c + ".mjs")),
    "the battery names it and util/checks does not hold it");
}

// AND GIT CARRIES EVERY ONE OF THEM.
//
// existsSync answers yes on the box that wrote the file. A check written into
// the list and never committed is therefore green on that box and missing on
// every other one, where the battery prints two failures off the one gap: the
// loop's own "it is not there, so it did not run" and this file's "<name> is in
// util/checks". That is what happened at dd2fed69, which listed
// a-refusal-names-a-legal-move while the file stayed out of git, and it stopped
// only because another token's commit swept the file in. The tree is green by
// accident until something asks git.
//
// WHERE THERE IS NO REPOSITORY THIS ASKS NOTHING. The battery also runs over a
// clean archive of a commit, which holds no .git, and git can answer nothing
// there. A check that failed for want of a repository would go red on every
// archive run and say nothing about any check.
//
// AND THE FOLDER HAS TO BE THE REPOSITORY'S OWN ROOT. An archive unpacked
// inside some other checkout is still inside a work tree, and asking that
// checkout about util/checks answers nothing, which would read as every check
// being uncommitted. So the toplevel git names is compared with the root.
const git = (...args) => spawnSync("git", ["-C", root, ...args], { encoding: "utf8" });
const sameFolder = (a, b) => {
  const one = (p) => { try { return realpathSync(resolve(p)); } catch { return resolve(p); } };
  const [x, y] = [one(a), one(b)];
  return process.platform === "win32" ? x.toLowerCase() === y.toLowerCase() : x === y;
};
const top = (git("rev-parse", "--show-toplevel").stdout ?? "").trim();
if (top === "" || !sameFolder(top, root)) {
  console.log("  ok   git carries every check: there is no repository over " + root
    + " to ask, so this says nothing rather than failing an archive run");
} else {
  const tracked = new Set(
    (git("ls-files", "--", "util/checks").stdout ?? "").split("\n").map((s) => s.trim()).filter(Boolean),
  );
  say("git holds checks under util/checks (" + tracked.size + ")", tracked.size > 0,
    "git names no file under util/checks, so this half would call every listed "
    + "check uncommitted and is judging the question rather than the tree");
  const loose = listed.filter((c) => !tracked.has("util/checks/" + c + ".mjs"));
  say("git carries every check the battery lists", loose.length === 0,
    loose.join(", ") + " is in util/checks on this box and in no commit, so it "
    + "reads green here and red on every other box");
}

// AND THE LIST IS THE WHOLE FOLDER, ASKED FOR RATHER THAN DESCRIBED.
//
// The half above walks the battery's list and asks the folder about each name,
// so it catches a check that was deleted and never catches one that was written
// and never listed. A check nobody runs is a check that has quietly stopped
// working, and nothing goes red at the moment it is added, which is the only
// moment anybody would have acted on it.
//
// THE SET IS THE FOLDER, so the folder is what is walked. battery.sh is not a
// check and names itself nowhere in its own list.
const named = new Set(listed);
const onDisk = readdirSync(join(root, "util", "checks"))
  .filter((f) => f.endsWith(".mjs"))
  .map((f) => f.slice(0, -".mjs".length));
say("util/checks holds checks to run (" + onDisk.length + ")", onDisk.length > 0,
  "the folder holds no .mjs at all, so this half has nothing to judge");
const unlisted = onDisk.filter((c) => !named.has(c));
say("the battery runs every check in util/checks", unlisted.length === 0,
  unlisted.join(", ") + " sits in util/checks and the battery never names it, "
  + "so it is a check nobody runs");

console.log("\n" + listed.length + " check(s) named, " + new Set(paths).size
  + " path(s) built. " + bad + " failed.");
process.exit(bad ? 1 : 0);
