// WHAT VS CODE RUNS IS THE BUNDLE, AND THE BUNDLE IS NOT IN GIT.
//
// The extension folder is symlinked into the editor, and what runs is
// out/extension.js, built from the TypeScript beside it. That file is ignored,
// so it never travels. A fix committed on one machine reaches the next machine
// as source and nothing there rebuilds it.
//
// MEASURED, 2026-09-07: the bundle on this box was built on the 4th and its
// sources changed on the 6th. Two days of panel and editor work had never run.
// The panel drew a control declared type count as a labelled box, because the
// running bundle predated count. The owner had seen the same fault fixed on
// another machine and met it again here, which is exactly what an artefact that
// does not travel and is not rebuilt looks like.
//
// SO THE GAP IS MADE LOUD. A silent two-day drift is indistinguishable from a
// bug in the source, and a person cannot tell those apart by looking.

import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const folder = join(root, "src", "extension");
const bundle = join(folder, "out", "extension.js");
let failed = 0;

function say(what, ok, why) {
  console.log("  " + (ok ? "ok  " : "FAIL") + " " + what);
  if (!ok) {
    failed++;
    if (why) console.log("       " + why);
  }
}

say("the extension folder is there to judge", existsSync(folder),
  "src/extension is missing, so nothing was checked");

if (existsSync(folder)) {
  say("the bundle exists", existsSync(bundle),
    "out/extension.js is not there, so the editor is running nothing. " +
    "Build it: cd src/extension and node build.mjs");

  if (existsSync(bundle)) {
    const built = statSync(bundle).mtimeMs;
    const sources = readdirSync(folder)
      .filter((f) => f.endsWith(".ts"))
      .map((f) => ({ name: f, at: statSync(join(folder, f)).mtimeMs }));

    say("there are sources to judge it against (" + sources.length + ")", sources.length > 0,
      "no TypeScript beside the bundle, so this check has nothing to compare");

    const newer = sources.filter((s) => s.at > built).map((s) => s.name).sort();
    say("the bundle is newer than every source beside it", newer.length === 0,
      newer.join(", ") + " changed after the bundle was built, so what the editor " +
      "runs is not what this tree says. The bundle is git-ignored, so a fix " +
      "committed elsewhere arrives here as source and nothing rebuilds it. " +
      "Build it: cd src/extension and node build.mjs");
  }
}

console.log("\n" + failed + " failed.");
process.exit(failed === 0 ? 0 : 1);
