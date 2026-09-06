// EVERY CONTROL, DRIVEN AGAINST THE REAL ENGINE.
//
// A control in the panel sent `se work --form "test"`. The engine has no
// --form, it has --title, so it printed its usage and minted nothing. Somebody
// typed a token and watched it vanish. Nothing noticed, because the two halves
// are two programs and the only thing joining them is an array of strings that
// neither one checks.
//
// SO EVERY ARRAY IS BUILT BY THE EXTENSION AND HANDED TO THE ENGINE. Not to a
// description of the engine, to the binary, in a folder made for this run. A
// flag the engine does not have is caught the day it is typed.
//
// WHAT COUNTS AS A PASS. The engine answers, and it does not answer that a flag
// is undefined and it does not print its usage. A refusal about the CONTENT is
// fine and is not this check's business: a token id that does not exist is a
// real answer to a well-formed call.
//
//   node .se/scratchpad/engine-args.mjs <root>
import { execFileSync, execFile } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, copyFileSync, existsSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { liveEngine } from "./lib/engine.mjs";

const root = process.argv[2] ?? ".";
const here = join(root, "src", "extension");
const out = mkdtempSync(join(tmpdir(), "engineargs-"));
const { build } = await import(
  pathToFileURL(join(here, "node_modules", "esbuild", "lib", "main.js")).href
);
await build({
  entryPoints: [join(here, "engineargs.ts")],
  bundle: true, format: "esm", outdir: out, logLevel: "silent",
  outExtension: { ".js": ".mjs" },
});
const A = await import(pathToFileURL(join(out, "engineargs.mjs")).href);

// A FOLDER OF ITS OWN, so nothing here writes into the tree being checked.
const work = mkdtempSync(join(tmpdir(), "engineargs-work-"));
mkdirSync(join(work, "util", "views"), { recursive: true });
mkdirSync(join(work, "doc", "work"), { recursive: true });
copyFileSync(join(root, "util", "views", "work.base"), join(work, "util", "views", "work.base"));
writeFileSync(join(work, ".gitignore"), ".se/\n");

const exe = join(root, ".bin", process.platform === "win32" ? "se.exe" : "se");
if (!existsSync(exe)) {
  console.log("FAIL the engine is not built at " + exe);
  process.exit(1);
}
// The verbs run in the engine over the folder, so one lives here.
liveEngine(root, work);

// One token to aim the token-shaped controls at, minted through the engine so
// the id is a real one.
const minted = JSON.parse(
  execFileSync(exe, ["work", "--title", "a token to aim",
    "--by", "person", "--work", work], { encoding: "utf8" }),
);
const id = minted.id;

let bad = 0;
const say = (what, ok, why) => {
  if (!ok) bad++;
  console.log((ok ? "ok   " : "FAIL ") + what + (ok || !why ? "" : "\n      " + why));
};

// THE ENGINE'S OWN REFUSALS FOR A MALFORMED CALL. These are the two shapes it
// answers with when the argument list is wrong rather than the request.
const malformed = [/flag provided but not defined/, /^se \w+ - /m, /reads nothing but its flags/];

// wellFormed answers whether the engine took the call, and what it said if not.
function wellFormed(args) {
  let said = "";
  try {
    said = execFileSync(exe, [...args, "--work", work], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  } catch (e) {
    said = String(e.stdout ?? "") + String(e.stderr ?? "");
  }
  const wrong = malformed.find((r) => r.test(said));
  return { ok: !wrong, said: said.split("\n").slice(0, 3).join("\n      ") };
}

function ask(name, args) {
  if (!args) {
    say(name + " builds no call", false, "the builder answered nothing");
    return;
  }
  // EVERY ARGUMENT IS A STRING. Spawning with an undefined in the list throws
  // before the engine is asked, so the control looks alive and does nothing.
  // A pin on a declared group sends no filter, and passing that through anyway
  // put an undefined here.
  const loose = args.findIndex((a) => typeof a !== "string");
  if (loose >= 0) {
    say(name + " sends only strings", false, "argument " + loose + " is " + String(args[loose]));
    return;
  }
  const answer = wellFormed(args);
  say(name + ": se " + args.join(" "), answer.ok, answer.ok ? "" : answer.said);
}

const file = join(work, "util", "views", "work.base");

ask("mint", A.mintArgs("test"));
ask("mint with a detail", A.mintArgs("four words name work / and the rest is the detail"));
ask("file into a group", A.fileArgs(id, "bucket", "later"));
ask("make a group", A.groupArgs([id]));
ask("rename a group", A.renameGroupArgs("later", "much later"));
ask("edit a cell", A.editCellArgs(id, "title", "a new title here"));
ask("hold held", A.holdArgs("held"));
ask("hold finishing", A.holdArgs("finishing"));
ask("hold off", A.holdArgs("off"));
// THE BINDING AND THE ASK ARE THE PERSON'S TWO OTHER BUTTONS. They are driven
// here for the same reason every other builder is: the panel calls them and
// nothing else would notice a flag being renamed under them.
//
// THE ORDER MATTERS. This drives the real engine over a real tree, so god is
// asked for before bound, and the tree is left bound.
ask("what the binding is", A.bindingArgs());
ask("unbind", A.bindArgs("unbound"));
ask("god", A.bindArgs("god"));
ask("bind again", A.bindArgs("bound"));
ask("what is asked", A.askedArgs());
ask("ask the agent", A.askArgs(true));
ask("stop asking", A.askArgs(false));
ask("whether ideation is on", A.ideatingArgs());
ask("let the agent ideate", A.ideationArgs(true));
ask("stop ideating", A.ideationArgs(false));
ask("the panes", A.panesArgs(file));
ask("one pane", A.paneArgs(file, "left"));
ask("the views", A.viewsArgs());
ask("pin a declared group", A.viewArgs(file, "left", A.pinArgs("noted")));
ask("pin an invented group", A.viewArgs(file, "left", A.pinArgs("later", 'bucket == "later"')));
ask("unpin", A.viewArgs(file, "left", A.unpinArgs("later")));
ask("a column width", A.viewArgs(file, "left", A.widthArgs("title", 320)));
ask("the column order", A.viewArgs(file, "left", A.orderArgs(["title", "status"])));
ask("a sort level", A.viewArgs(file, "left", A.levelArgs("sort", 0, "status", "DESC")));
ask("a second sort level", A.viewArgs(file, "left", A.levelArgs("sort", 1, "title", "ASC")));
ask("a group level", A.viewArgs(file, "left", A.levelArgs("group", 0, "bucket", "ASC")));
ask("dropping a level", A.viewArgs(file, "left", A.dropLevelArgs("sort", 1)));
// THE FILTER IS SENT IN THE SHAPE THE PAGE BUILDS. A wrong shape is refused by
// the engine on its content, and a content refusal is a pass here by design, so
// this one is checked by what it did rather than by being taken.
{
  const groups = JSON.stringify([{ rows: [{ property: "status", operator: "is", value: "open" }] }]);
  const args = A.viewArgs(file, "left", A.filterArgs(groups));
  ask("a filter", args);
  let said = {};
  try {
    said = JSON.parse(execFileSync(exe, [...args, "--work", work], { encoding: "utf8" }));
  } catch (e) {
    said = { error: String(e.stdout ?? e) };
  }
  say("the filter the page builds is one the engine takes", said.ok === true,
    "what it answered: " + JSON.stringify(said));
}

// A FILTER GOES BOTH WAYS. It was written as one flat statement while the
// reader reads a structure, so anything past a single condition was written
// correctly and read back wrong, and the page handed the misread filter back to
// the engine on the next touch of the popover.
//
// THIS GOES THROUGH THE BINARY, because the defect was in the verb rather than
// in the function it calls: a test of the function stays green when the verb
// stops calling it.
for (const [what, groups] of [
  ["two groups", [
    { rows: [{ property: "status", operator: "is", value: "open" }] },
    { rows: [{ property: "holder", operator: "is", value: "main" }] },
  ]],
  ["one group of two", [
    { rows: [
      { property: "status", operator: "is", value: "open" },
      { property: "status", operator: "is", value: "in_work" },
    ] },
  ]],
]) {
  const args = A.viewArgs(file, "left", A.filterArgs(JSON.stringify(groups)));
  try {
    execFileSync(exe, [...args, "--work", work], { encoding: "utf8" });
  } catch (e) {
    say(what + " is written", false, String(e.stdout ?? e));
    continue;
  }
  let back = {};
  try {
    back = JSON.parse(execFileSync(exe, [...A.paneArgs(file, "left"), "--work", work],
      { encoding: "utf8" }));
  } catch (e) {
    back = { error: String(e.stdout ?? e) };
  }
  const read = back.filters ?? [];
  const same =
    read.length === groups.length &&
    groups.every((g, i) =>
      (read[i]?.rows ?? []).length === g.rows.length &&
      g.rows.every((r, j) =>
        read[i].rows[j].property === r.property &&
        read[i].rows[j].operator === r.operator &&
        read[i].rows[j].value === r.value));
  say(what + " reads back as what was built", same,
    "built " + JSON.stringify(groups) + " read " + JSON.stringify(read));
}

// AND WHAT THE PERSON TYPED IS WHAT THE TOKEN CARRIES.
//
// A well-formed call is not the same as the right call. Four words before the
// slash name the work and everything after it is the detail, and a builder that
// sent the whole line as a title, or dropped the half after the slash, would
// pass every assertion above.
{
  const typed = "four words name work / and the rest is the detail, whole";
  const args = A.mintArgs(typed);
  let made = {};
  try {
    made = JSON.parse(execFileSync(exe, [...args, "--work", work], { encoding: "utf8" }));
  } catch (e) {
    made = { error: String(e.stdout ?? e) };
  }
  say("the four words before the slash are the title", made.title === "four words name work",
    "the token is titled " + JSON.stringify(made.title ?? made.error));
  say("everything after the slash is the detail",
    (made.detail ?? "") === "and the rest is the detail, whole",
    "the token carries " + JSON.stringify(made.detail ?? made.error));
  const plain = A.mintArgs("no slash at all");
  let bare = {};
  try {
    bare = JSON.parse(execFileSync(exe, [...plain, "--work", work], { encoding: "utf8" }));
  } catch (e) {
    bare = { error: String(e.stdout ?? e) };
  }
  say("a line with no slash is all title and no detail",
    bare.title === "no slash at all" && !bare.detail,
    JSON.stringify(bare));
}

// THE LANGUAGE SERVER ANSWERS THE FIRST THING AN EDITOR ASKS IT.
//
// The verb is reached with the extension's own builder, and the handshake is
// the one an editor sends, so an unwired verb fails here rather than in a
// window nobody is watching. Standard input closes after the message, which is
// how the server is told the conversation is over.
{
  const body = JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} });
  const hello = "Content-Length: " + Buffer.byteLength(body) + "\r\n\r\n" + body;
  let said = "";
  try {
    said = execFileSync(exe, A.lspArgs(work), { input: hello, encoding: "utf8", timeout: 20000 });
  } catch (e) {
    said = String(e.stdout ?? e);
  }
  say("the language server answers initialize with what it can do",
    said.includes("completionProvider") && said.includes("Content-Length"),
    said.slice(0, 200));
}

// EVERY BUILDER IS DRIVEN, OR IS EXCLUDED BY NAME WITH A REASON.
//
// A COUNT COMPARED WITH NOTHING SAYS NOTHING. This asked builders.length > 5,
// which is true of twenty-six today and true of twenty-seven tomorrow, so a
// builder added and never driven left it green. The number the module produces
// is now held against a number this check did not produce: what the two runners
// actually call, read out of their own source.
//
// AND AN EXCLUSION IS WRITTEN DOWN WITH ITS ANSWER, so a reader can tell one
// from an oversight.
const excluded = {
  askIsOwed: "not an argument builder. It reads what askedArgs answered and says "
    + "whether an update is still owed, so there is no engine call to drive: "
    + "drive-panel.mjs drives it, against a record the real binary wrote, and the "
    + "panel reads the same function so the two cannot disagree about the button",
  isIdeating: "not an argument builder. It reads what ideatingArgs answered the "
    + "way askIsOwed reads the ask, so there is no engine call to drive. The "
    + "engine writes both in the same shape, and the button and KEYWORD:IDEATION "
    + "press one flag through one door",
};
const builders = Object.keys(A).filter((k) => typeof A[k] === "function");
say("the extension exports its argument builders (" + builders.length + ")", builders.length > 5);

const asked = new Set();
for (const runner of ["engine-args.mjs", "engine-args-lifecycle.mjs"]) {
  const src = readFileSync(join(root, "util", "checks", runner), "utf8");
  for (const m of src.matchAll(/\bA\.(\w+)\s*\(/g)) asked.add(m[1]);
}
say("the runners were read for what they call (" + asked.size + ")", asked.size > 5,
  "nothing was read out of the runners, so the comparison below is against nothing");
for (const name of builders) {
  if (asked.has(name) || name in excluded) continue;
  say("engineargs." + name + " is driven against the engine", false,
    "it is exported, no runner calls it, and it is in no exclusion");
}
// AND THE REVERSE, because the census has two sides. A runner asking a builder
// the module no longer exports is a call counted against nothing: the asked
// set grows, every exported name is still covered, and the check stays green
// while a runner drives a ghost.
for (const name of asked) {
  if (builders.includes(name)) continue;
  say("the runners ask engineargs." + name + ", which the module exports", false,
    "a runner calls it and src/extension/engineargs.ts does not export it, so "
    + "the call is counted against nothing");
}
for (const name of Object.keys(excluded)) {
  say("the exclusion " + name + " is still a builder", builders.includes(name),
    "it is excluded by name and the module no longer exports it");
}
say("every builder is driven or excluded, counted a second way ("
  + builders.length + " exported, " + asked.size + " asked, "
  + Object.keys(excluded).length + " excluded)",
  builders.every((n) => asked.has(n) || n in excluded));

// AND THE CHECK CAN SEE A BAD FLAG. A guard nobody has watched catch anything
// is a guard nobody has tested, so one deliberate mistake goes through it.
say("the check itself refuses an unknown flag, tried on se work --form test",
  !wellFormed(["work", "--form", "test"]).ok,
  "a made-up flag was accepted, so this cannot catch the defect it exists for");

// BOTH ENTRY POINTS REFUSE WHAT THEY WILL NOT READ.
//
// The program has two: the verbs, and the flag form that carries --said,
// --answer and --set. The verbs were taken through one door and the flag form
// was not, so se lint /nope refused while se --config /nope answered the
// configuration as though nothing were wrong.
//
// THIS IS DRIVEN RATHER THAN READ. A guard over the source can say where flags
// are parsed and cannot say that a refusal follows, so it stayed green when the
// refusal was taken out of the door itself.
for (const stray of [["lint", "/nope/not-a-file.md"], ["--config", "/nope/not-a-file.md"],
                     ["--tree", "/nope/not-a-file.md"]]) {
  let code = 0;
  try {
    execFileSync(exe, [...stray, "--work", work], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  } catch (e) {
    code = e.status ?? 1;
  }
  say("se " + stray.join(" ") + " refuses a path it will not read", code !== 0,
    "it answered success and read nothing from what it was handed");
}
//
// AND THE OTHER SIDE IS READ BY WHAT IT SAID, NOT BY ITS EXIT CODE. An exit
// code is not the same question: se lint exits non-zero when it has findings,
// which is the verb answering about the tree it read rather than refusing the
// call. The tree it reads here is the method, so this line went red whenever
// anything anywhere in the method tripped a lint rule -- a fact about the
// tree, not about the argument list -- while se --config, which never has
// findings, stayed green beside it and hid that the two were not asking the
// same thing. So the call is judged by the same instrument every line above
// uses, which looks for the engine's two refusal shapes and nothing else.
for (const fine of [["lint"], ["--config"]]) {
  const answer = wellFormed(fine);
  say("se " + fine.join(" ") + " still answers", answer.ok,
    "the refusal is refusing a call that has nothing left over, and it said\n      "
    + answer.said);
}

console.log("\n" + bad + " failed.");
process.exit(bad ? 1 : 0);
