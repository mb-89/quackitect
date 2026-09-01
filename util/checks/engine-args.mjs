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
import { mkdtempSync, mkdirSync, writeFileSync, copyFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

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

// One token to aim the token-shaped controls at, minted through the engine so
// the id is a real one.
const minted = JSON.parse(
  execFileSync(exe, ["work", "--title", "a token to aim", "--assignee", "human",
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

ask("mint", A.mintArgs("test", "SS·T"));
ask("mint with a detail", A.mintArgs("four words name work / and the rest is the detail", "MS·E"));
ask("edit a cell", A.editCellArgs(id, "title", "a new title here"));
ask("file into a group", A.fileArgs(id, "bucket", "later"));
ask("make a group", A.groupArgs([id]));
ask("rename a group", A.renameGroupArgs("later", "much later"));
ask("hold on", A.holdArgs(false));
ask("hold off", A.holdArgs(true));
ask("the panes", A.panesArgs(file));
ask("one pane", A.paneArgs(file, "left"));
ask("the views", A.viewsArgs());
ask("pin a declared group", A.viewArgs(file, "left", A.pinArgs("backlogged")));
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
    { rows: [{ property: "assignee", operator: "is", value: "main" }] },
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
  const args = A.mintArgs(typed, "SS·T");
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
  const plain = A.mintArgs("no slash at all", "SS·T");
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

// A CHECK THAT FINDS NOTHING TO CHECK REFUSES. If the builders stop being
// exported, every call above becomes a builder that answered nothing and this
// would still have run.
const builders = Object.keys(A).filter((k) => typeof A[k] === "function");
say("the extension exports its argument builders (" + builders.length + ")", builders.length > 5);

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
for (const fine of [["lint"], ["--config"]]) {
  let code = 0;
  try {
    execFileSync(exe, [...fine, "--work", work], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  } catch (e) {
    code = e.status ?? 1;
  }
  say("se " + fine.join(" ") + " still answers", code === 0,
    "the refusal is refusing a call that has nothing left over");
}

console.log("\n" + bad + " failed.");
process.exit(bad ? 1 : 0);
