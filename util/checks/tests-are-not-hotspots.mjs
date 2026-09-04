// THE SUITE'S OWN HOTSPOTS, FOUND BY ASKING THE INDEX RATHER THAN A PERSON.
//
// THE OWNER'S WORDS: maybe we can even have a test that reads the coverage and
// identifies hotspots like this automatically.
//
// We can, because the engine already measures it. The mapper runs every test
// once under coverage to learn which lines it reaches, and it timed each run and
// threw the number away. It keeps it now, in test.seconds, so ranking the suite
// is a query rather than an afternoon.
//
// WHY THIS IS A CHECK AND NOT A RETRO NOTE. A suite gets slow one test at a
// time. No single test is ever obviously the problem, which is how the whole of
// it gets slow with nothing saying so, and the retro reads it months later. This
// says it the day it happens.
//
// WHAT A HOTSPOT USUALLY IS. The four slowest tests in this tree were each
// compiling a Go module to decide which tests the engine picks from a delta.
// That is our decision and not the compiler's, and it cost forty-nine seconds to
// ask. The answer was a fed toolchain and one test holding the real contract,
// which is testing rule 13.
//
//   node util/checks/tests-are-not-hotspots.mjs <root>
import { existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

const root = process.argv[2] ?? ".";

let bad = 0;
function say(what, ok, why) {
  if (!ok) bad++;
  console.log((ok ? "  ok   " : "  FAIL ") + what + (ok ? "" : "\n         " + why));
}

// A TEST OVER THIS MANY SECONDS IS ASKED ABOUT. It is not a budget for the
// suite: it is the point past which a single test is doing something worth
// naming, and nearly always that something is an external tool.
const tooLong = 8;

// AND THIS MANY OVER IT IS THE SUITE DRIFTING rather than one test being heavy.
const tooMany = 3;

const engine = join(root, ".bin", process.platform === "win32" ? "se.exe" : "se");
if (!existsSync(engine)) {
  console.log("  ok   nothing is built here, so there is nothing to rank");
  process.exit(0);
}

let rows = [];
try {
  const said = execFileSync(engine, ["ask", "--sql",
    "SELECT name, path, seconds FROM test WHERE seconds > 0 ORDER BY seconds DESC LIMIT 20",
    "--work", root], { encoding: "utf8" });
  rows = JSON.parse(said).rows ?? [];
} catch (e) {
  // A TREE WHOSE TESTS HAVE NEVER BEEN MAPPED HAS NOTHING TO SAY, and that is
  // not a failure: the mapper fills the table in the background after a start.
  console.log("  ok   the engine could not be asked, so nothing is ranked");
  process.exit(0);
}

if (rows.length === 0) {
  console.log("  ok   no test has been mapped yet, so nothing is ranked");
  process.exit(0);
}

const slow = rows.filter(([, , seconds]) => seconds > tooLong);
for (const [name, path, seconds] of slow) {
  console.log(`  slow ${name} (${path}) took ${seconds.toFixed(1)}s`);
}

say(`no more than ${tooMany} tests run longer than ${tooLong}s`, slow.length <= tooMany,
  `${slow.length} do. A test this long is almost always driving an external tool: a compiler, ` +
  `git, a network. Testing rule 13 says one test drives the real tool and the rest are fed one. ` +
  `Feed them, or say on a token why this one has to be real.`);

const [slowest, where, worst] = rows[0];
console.log(`  ok   the slowest mapped test is ${slowest} (${where}) at ${worst.toFixed(1)}s`);

console.log(`\n${bad} failed.`);
process.exit(bad === 0 ? 0 : 1);
