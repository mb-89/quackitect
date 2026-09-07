// EVERY COMMAND UNDER .claude/commands IS THE ENGINE'S ANSWER, UNCHANGED.
//
// The files are generated from util/parameters.json, and they are in version
// control, so a clone carries them and a cloud box has the menu without
// starting anything. That is only true while what is committed is what the
// tree answers. A hand-edited command would send a message that reaches no
// control, and the menu would offer it as though it worked.
//
// NOTHING HERE DERIVES A WORD. A second implementation in JavaScript would be
// the very drift this exists to catch. The check asks the engine to project,
// then asks git whether anything moved. What the engine writes is the answer
// by definition, so a difference is a file somebody edited or a projection
// nobody ran.

import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
let failed = 0;

function say(what, ok, why) {
  console.log("  " + (ok ? "ok  " : "FAIL") + " " + what);
  if (!ok) {
    failed++;
    if (why) console.log("       " + why);
  }
}

const folder = join(root, ".claude", "commands");
say(".claude/commands is there to judge", existsSync(folder),
  "the folder is missing, so no console has a menu and nothing was checked");

if (existsSync(folder)) {
  const files = readdirSync(folder).filter((f) => f.endsWith(".md"));
  say("there are commands to judge (" + files.length + ")", files.length > 0,
    "the folder is empty, so this check is judging nothing and is not doing its job");

  // EVERY FILE SENDS A MESSAGE THE MATCHER TAKES. The body is the whole of
  // what the harness submits, so a mark that leaked into it would stop the
  // line matching, and the command would read as an instruction instead.
  for (const name of files) {
    const text = readFileSync(join(folder, name), "utf8");
    const body = text.split(/^---\s*$/m).pop().trim();
    say(name + " sends one keyword message", /^KEYWORD:[A-Z0-9_]+(=.*)?$/.test(body),
      "its body is " + JSON.stringify(body) + ", and the matcher takes the whole message or none of it");
    say(name + " says it is generated", /description:.*GENERATED/.test(text),
      "nothing in it warns a reader that an edit here is written over");
  }
}

// AND WHAT IS COMMITTED IS WHAT THE TREE ANSWERS. The engine writes the files
// again, and git says whether that changed anything.
const engine = join(root, ".bin", process.platform === "win32" ? "se.exe" : "se");
if (!existsSync(engine)) {
  say("the engine is built, so the files can be projected again", false,
    "no program at .bin, so whether the committed files match the tree was not checked");
} else {
  let projected = true;
  try {
    execFileSync(engine, ["--project"], { cwd: root, stdio: "pipe" });
  } catch (e) {
    projected = false;
    say("the projection ran", false, e.message);
  }
  if (projected) {
    const moved = execFileSync("git", ["status", "--porcelain", "--", ".claude/commands"],
      { cwd: root, encoding: "utf8" }).trim();
    say("the committed commands are what the tree answers", moved === "",
      "projecting changed " + JSON.stringify(moved) + ". Either a command was edited by hand, "
      + "or the tree moved and nobody projected. Run the engine and commit what it wrote");
  }
}

console.log("\n" + failed + " failed.");
process.exit(failed === 0 ? 0 : 1);
