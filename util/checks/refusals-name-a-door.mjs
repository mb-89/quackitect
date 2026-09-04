// EVERY REFUSAL THAT NAMES A LANE TOOL NAMES A SHELL COMMAND BESIDE IT.
//
// A cloud session cloned this tree and its tool lane never came up. Every guard
// then refused every call and named an se_ tool that was not there, so each
// guard's only door was held shut by the other and the session had no legal
// move at all. The refusals were correct and the session was dead.
//
// WHAT COUNTS AS AN INSTRUCTION. A literal naming a lane tool is either an
// instruction to the agent or an identifier the engine compares against. The
// instructions are sentences and the identifiers are names, so length tells
// them apart: nothing under this many characters is a sentence.
//
// WHAT COUNTS AS A DOOR. RUNME.sh, because it is the one engine a fresh clone
// carries. se_run is not a door: it is a lane tool, so a refusal naming it as
// the way out of a lane failure names the thing that is missing. Two refusals
// did exactly that and this check is what found them.
//
//   node util/checks/refusals-name-a-door.mjs <root>
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.argv[2] ?? ".";
const where = join(root, "src", "engine");

// A sentence, not a name. "se_answer" is nine characters and an identifier.
const aSentence = 30;
const laneTool = /\bse_(pull|stop|answer|work|apply|run|test|find|ask|claim|said|status)\b/;
const aDoor = /RUNME\.sh|theShellDoor\(/;

let bad = 0;
function say(what, ok, why) {
  if (!ok) bad++;
  console.log((ok ? "  ok   " : "  FAIL ") + what + (ok ? "" : "\n         " + why));
}

// theBlocks cuts a file at its top-level func lines, so a refusal is judged
// beside the door its own function names.
function theBlocks(text) {
  const lines = text.split(/\r?\n/);
  const out = [];
  let name = "(file)";
  let held = [];
  for (const line of lines) {
    const m = /^func (?:\([^)]*\) )?(\w+)/.exec(line);
    if (m) {
      out.push({ name, text: held.join("\n") });
      name = m[1];
      held = [];
    }
    held.push(line);
  }
  out.push({ name, text: held.join("\n") });
  return out;
}

// theSentences answers the interpreted string literals in a block that are long
// enough to be an instruction. A comment is not a literal and does not count.
function theSentences(text) {
  const out = [];
  for (const line of text.split(/\r?\n/)) {
    if (/^\s*\/\//.test(line)) continue;
    for (const m of line.matchAll(/"((?:[^"\\]|\\.)*)"/g)) {
      if (m[1].length >= aSentence) out.push(m[1]);
    }
  }
  return out;
}

let read = 0;
let named = 0;
for (const file of readdirSync(where).sort()) {
  if (!file.endsWith(".go") || file.endsWith("_test.go")) continue;
  read++;
  const text = readFileSync(join(where, file), "utf8");
  for (const block of theBlocks(text)) {
    const sentences = theSentences(block.text).filter((s) => laneTool.test(s));
    if (sentences.length === 0) continue;
    named++;
    const door = aDoor.test(block.text);
    say(file + " " + block.name + " names a lane tool and a shell door", door,
      "it tells the agent to use " + (laneTool.exec(sentences[0]) ?? [])[0]
      + " and names no shell command that does the same job. A session whose lane "
      + "never came up cannot follow it. Add theShellDoor(...) beside it.\n         "
      + JSON.stringify(sentences[0].slice(0, 120)));
  }
}

// A CHECK THAT FINDS NOTHING TO JUDGE IS NOT A GREEN CHECK. Point this at a
// tree whose refusals have been reworded past the pattern and it would answer
// all ok over nothing at all.
say("the engine's source was read (" + read + " files)", read > 0,
  "no source was read, so nothing was judged");
say("refusals naming a lane tool were found (" + named + ")", named > 0,
  "no refusal names a lane tool, so this check has nothing to judge and is not doing its job");

console.log("\n" + read + " file(s) read, " + named + " refusal(s) naming a lane tool. " + bad + " failed.");
process.exit(bad ? 1 : 0);
