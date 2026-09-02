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
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

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
