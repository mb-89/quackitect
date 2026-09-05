// EVERY FLAG AN ENGINE VERB HAS, THE LANE TOOL FOR IT CAN SAY.
//
// The tool lane is a second door onto the same verbs, and an agent uses that
// door. A verb grew a flag and the tool never grew the field, so a lane call
// could not say what the shell could, and the engine refused it for a thing the
// caller had no way to send. MEASURED: se_work carried no tracked, and every
// tracked token of a session was minted through the shell.
//
// TestToolSchemasComeFromTheirStructs holds a struct and its schema together.
// This holds the verb and the tool together, which is the other half of the
// same drift, and nothing held it.
//
// IT IS COLD. The verb's flags are read where they are declared, between
// flag.NewFlagSet("<verb>") and the next flag set in that file. The tool's
// fields are read off util/cage/tools.json, which the lane generates from its
// structs and colddoor_test keeps in step. Nothing is built.
//
// WHAT IS PASSED OVER IS NAMED HERE, WITH WHY. The shell's own flags, which say
// where the shell stands rather than what the verb does. The renames, where the
// lane says the same thing under its own name. The record verbs' actor, because
// the lane speaks as itself and the engine names it. A flag whose own help opens
// "instead of minting", because that is a door of its own the lane never
// claimed, and its companions, whose help opens "with <that door>:". state's
// --json, because a lane call is answered with the structure whatever it says.
// A gap in any of those is a token rather than a red battery.
//
// AND IT HOLDS BOTH WAYS NOW. A verb found its tool by name alone, so a tool
// named unlike its verb fell out of the check in silence: se_status wraps state,
// and state's flags were held to nothing at all. So the tools that wrap a verb
// under another name are named here, and every advertised tool has to name a
// verb, with the one that runs none named too.
//
//   node util/checks/lane-carries-every-flag.mjs <root>
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.argv[2] ?? ".";

let bad = 0;
function say(what, ok, why) {
  if (!ok) bad++;
  console.log((ok ? "  ok   " : "  FAIL ") + what + (ok ? "" : "\n         " + why));
}

// THE SHELL'S OWN. Each says where the shell stands, not what the verb does.
const shells = new Set(["work", "method", "stdin", "from", "template", "help", "h",
  // A FILE HOLDING THE PAYLOAD is a door for a caller with no pipe. The lane
  // sends the payload itself, on the call.
  "manifest"]);
// THE RENAMES. The lane says the same thing under its own name.
const renamed = {
  "*": { by: "actor" },
  se_said: { text: "said" },
  se_answer: { text: "answer" },
};
// THE LANE SPEAKS AS ITSELF on the record verbs, so actor is the engine's to
// fill in and not a field a caller sends.
const speaksAsItself = new Set(["se_said", "se_answer"]);
// THE TOOLS THAT WRAP A VERB UNDER ANOTHER NAME. Everything else finds its verb
// by name, and a tool missing from here whose name matches no verb is a FAIL
// rather than a silence.
const wraps = { se_status: "state" };
// THE ONE TOOL THAT RUNS NO VERB. se_start brings the engine up, which is the
// thing a caller cannot ask a running engine to do for itself.
const runsNoVerb = new Set(["se_start"]);
// WHAT THE LANE ANSWERS WHATEVER THE CALLER SAYS. state's --json chooses the
// structure over the screen, and the lane is always answered the structure, so
// there is no field for a caller to send.
const alwaysAnswered = { se_status: new Set(["json"]) };

const listPath = join(root, "util", "cage", "tools.json");
if (!existsSync(listPath)) {
  say("util/cage/tools.json is here to read", false,
    "the lane's advertised tools are not in the tree, so there is nothing to hold the verbs to");
  console.log("\n" + bad + " failed.");
  process.exit(1);
}
const tools = new Map();
for (const t of JSON.parse(readFileSync(listPath, "utf8")).tools ?? []) {
  const props = (t.inputSchema ?? t.input_schema ?? {}).properties ?? {};
  tools.set(t.name, new Set(Object.keys(props)));
}
say("the lane advertises tools to hold the verbs to (" + tools.size + ")", tools.size > 0,
  "tools.json names no tool, so this check would pass over nothing");

// THE VERBS, EACH WITH THE FLAGS DECLARED FOR IT AND WHAT EACH SAYS OF ITSELF.
const engine = join(root, "src", "engine");
const flagsOf = new Map();
const opens = /flag\.NewFlagSet\("([a-z-]+)"/g;
const declares = /fs\.(?:String|Bool|Int|Duration)\("([a-z-]+)",\s*[^,]+,\s*"([^"]*)"|fs\.Var\(&?[\w.]+,\s*"([a-z-]+)",\s*"([^"]*)"/g;
for (const name of readdirSync(engine)) {
  if (!name.endsWith(".go") || name.endsWith("_test.go")) continue;
  const text = readFileSync(join(engine, name), "utf8");
  const starts = [...text.matchAll(opens)];
  starts.forEach((m, i) => {
    const from = m.index;
    const to = i + 1 < starts.length ? starts[i + 1].index : text.length;
    const found = [];
    for (const d of text.slice(from, to).matchAll(declares)) {
      found.push({ flag: d[1] ?? d[3], help: d[2] ?? d[4] ?? "" });
    }
    flagsOf.set(m[1], (flagsOf.get(m[1]) ?? []).concat(found));
  });
}
say("the engine declares verbs with flags (" + flagsOf.size + ")", flagsOf.size > 0,
  "no flag.NewFlagSet was found under src/engine, so there is nothing to hold");

// A DOOR OF ITS OWN, and the flags that go with it. The verb's own help says
// which is which: the door opens "instead of minting", a companion opens
// "with <door>:".
function ownDoors(flags) {
  const doors = new Set(flags.filter((f) => f.help.startsWith("instead of minting")).map((f) => f.flag));
  const skip = new Set(doors);
  for (const f of flags) {
    const m = /^with ([a-z-]+):/.exec(f.help);
    if (m && doors.has(m[1])) skip.add(f.flag);
  }
  return skip;
}

let asked = 0;
const toolOf = new Map(Object.entries(wraps).map(([tool, verb]) => [verb, tool]));
for (const [verb, flags] of flagsOf) {
  const tool = toolOf.get(verb) ?? "se_" + verb;
  if (!tools.has(tool)) continue; // a verb the lane does not wrap is not its business
  const fields = tools.get(tool);
  const own = ownDoors(flags);
  for (const { flag } of flags) {
    if (shells.has(flag) || own.has(flag)) continue;
    if (speaksAsItself.has(tool) && (flag === "actor" || flag === "by")) continue;
    if ((alwaysAnswered[tool] ?? new Set()).has(flag)) {
      say(tool + " is answered the structure, so " + verb + " --" + flag + " is not its to send", true, "");
      continue;
    }
    const field = ((renamed[tool] ?? {})[flag] ?? renamed["*"][flag] ?? flag).replace(/-/g, "_");
    asked++;
    say(tool + " can say --" + flag, fields.has(field),
      "the " + verb + " verb takes --" + flag + " and " + tool + " has no " + field +
      " field, so a lane call cannot say what the shell can and the engine refuses " +
      "it for a thing the caller has no way to send. Add the field to its struct in " +
      "src/mcp/lane.go and regenerate util/cage/tools.json with .bin/se-mcp --tools");
  }
}
say("flags were held to their tools (" + asked + ")", asked > 0,
  "no verb the lane wraps declares a flag, so this check decided nothing");

// AND EVERY TOOL NAMES A VERB. This is the same drift from the other side: a
// tool the map does not name and whose name matches no verb was held to nothing,
// and said so to nobody.
for (const tool of tools.keys()) {
  if (runsNoVerb.has(tool)) {
    say(tool + " runs no engine verb, and that is what it is for", true, "");
    continue;
  }
  const verb = wraps[tool] ?? tool.replace(/^se_/, "");
  say(tool + " names the " + verb + " verb", flagsOf.has(verb),
    tool + " names no verb the engine declares, so nothing holds its fields to any " +
    "flags and the gap is silent. Name the verb it wraps in wraps, or say in " +
    "runsNoVerb why it runs none");
}

console.log("\n" + bad + " failed.");
process.exit(bad ? 1 : 0);
