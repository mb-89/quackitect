// EVERY COMPILE ERROR COMES BACK IN ONE ROUND.
//
// Deleting the review flow took about twenty rounds of go vet, one undefined
// symbol each, because Go's type checker stops after a batch by default. The
// cost that matters is the round trip and not the call: -gcflags=-e lifts the
// cap, so five planted errors come back in one run instead of five. This holds
// every command that compiles Go in this tree to carrying the flag.
//
//   node util/checks/build-reports-every-error.mjs <root>
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.argv[2] ?? ".";

let bad = 0;
function say(what, ok, why) {
  if (!ok) bad++;
  console.log((ok ? "  ok   " : "  FAIL ") + what + (ok ? "" : "\n         " + why));
}

// THE BATTERY'S COMPILES. A go build, and the one go test that compiles the
// suite with -c. A go test that runs is not a compile round anybody retypes,
// and the words go build inside a quoted report name are not a command.
const battery = readFileSync(join(root, "util", "checks", "battery.sh"), "utf8");
const compiles = battery.split("\n")
  .filter((l) => !l.trim().startsWith("#"))
  .filter((l) => /\bgo build -C\b/.test(l) || (/\bgo test -C\b/.test(l) && / -c /.test(l)));
say("the battery compiles Go somewhere (" + compiles.length + ")", compiles.length > 0,
  "no compile was found in battery.sh, so this has nothing to judge and is not "
  + "doing its job");
for (const line of compiles) {
  say("battery.sh carries -gcflags=-e on: " + line.trim().split(" -o ")[0], line.includes("-gcflags=-e"),
    "without the flag the type checker stops after a batch, and a sweep of "
    + "errors comes back one round at a time");
}

// AND THE INSTALLER'S, which is the build a fresh machine gets.
const setup = readFileSync(join(root, "util", "setup", "main.go"), "utf8");
const cmds = [...setup.matchAll(/exec\.Command\("go", "build"[^)]*\)/g)].map((m) => m[0]);
say("the installer builds Go somewhere (" + cmds.length + ")", cmds.length > 0,
  "no go build was found in util/setup/main.go, so half of what this guards is gone");
for (const cmd of cmds) {
  say("util/setup/main.go carries -gcflags=-e on its go build", cmd.includes("-gcflags=-e"),
    "without the flag the type checker stops after a batch, and a sweep of "
    + "errors comes back one round at a time");
}

console.log("\n" + (compiles.length + cmds.length) + " compile command(s) read. " + bad + " failed.");
process.exit(bad ? 1 : 0);
