// EVERY COMMAND A REFUSAL OFFERS IS ONE THE GATE ADMITS.
//
// A refusal is a menu, and a menu whose every line the same gate refuses is a
// wall. A session with no tool lane pulled work and could then do none of it:
// the write gate refused Bash and named, as the way out, a command piped into
// se run, which the same gate refuses for the pipe. refusals-name-a-door misses
// this, because it fires on sentences naming an se_ tool and these say se run
// with a space.
//
// THE GATE IS THE JUDGE, NOT A READER. The judgement is a Go test in src/engine
// that builds every refusal it can, in the shape it prints, reads every command
// off it and hands each one to runsTheEngine. This check runs that test rather
// than reading the gate again in JavaScript, which would be a second gate that
// agrees with the first by luck.
//
//   node util/checks/a-refusal-names-a-legal-move.mjs <root>
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.argv[2] ?? ".";
const test = "TestEveryCommandARefusalOffersIsAdmitted";
const judgement = join(root, "src", "engine", "legalmove_test.go");

let bad = 0;
function say(what, ok, why) {
  if (!ok) bad++;
  console.log((ok ? "  ok   " : "  FAIL ") + what + (ok ? "" : "\n         " + why));
}

// THE COMPILER THE INSTALLER PINNED, read the way the battery reads it. The
// engine's SQLite is C, and a go test that built with whatever compiler PATH
// happened to hold would judge a different program from the one that ships.
function cgoEnv() {
  const base = process.env.LOCALAPPDATA
    || process.env.XDG_DATA_HOME
    || join(process.env.HOME ?? "", ".local", "share");
  const file = join(base, "quackitect", "cgo.env");
  const env = {};
  if (!existsSync(file)) return env;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = /^(?:export\s+)?(CC|CGO_ENABLED|GOFLAGS)=(.*)$/.exec(line.trim());
    if (!m) continue;
    let value = m[2].trim();
    // A QUOTED COMPILER PATH IS ONE WORD FOLLOWED BY cc, the way the battery reads it.
    value = value.replace(/^"(.*)" cc$/, "$1 cc").replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");
    env[m[1]] = value;
  }
  return env;
}

// A CHECK THAT FINDS NO JUDGEMENT IS NOT A GREEN CHECK.
say("the judgement is in the tree", existsSync(judgement),
  judgement + " is not there, so there is no test to run and nothing is judged");

if (existsSync(judgement)) {
  const got = spawnSync("go", ["test", "-C", join(root, "src", "engine"), "-count=1", "-run", "^" + test + "$", "."],
    { encoding: "utf8", env: { ...process.env, ...cgoEnv() } });
  const said = String(got.stdout ?? "") + String(got.stderr ?? "");
  const tail = said.trim().split("\n").slice(-40).join("\n         ");
  say("go test ran " + test, got.status !== null && !/no tests to run/.test(said),
    got.status === null ? "go did not run: " + String(got.error ?? "") : "the test was not found, so nothing was judged: " + tail);
  say("every command a refusal offers gets past the gate", got.status === 0,
    "a refusal names a command the gate refuses, so a session with no lane is handed its own wall as its way out:\n         " + tail);
}

console.log("\n1 test driven. " + bad + " failed.");
process.exit(bad ? 1 : 0);
