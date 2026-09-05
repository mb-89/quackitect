// NOTHING A CLONE CARRIES CAN REFUSE A CALL.
//
// A cloud session reported that everything was blocked and it could do nothing,
// on a box where no guard had ever run. Whatever refused it, the rule has to be
// that it cannot: a box with no engine has no rules to enforce, so a refusal
// there is some file's own opinion, and the session has no way to argue with it
// and no engine to ask.
//
// THE RULE. A refusal comes from the engine, and only once the engine is up to
// give it. Two things make that true, and this holds both.
//
// ONE: the cage git carries names no event that can refuse. Claude Code lets a
// hook deny on PreToolUse, and end a turn on Stop and UserPromptSubmit. Those
// belong in .claude/settings.local.json, which is not in version control and is
// written by the engine as it starts. So they arrive with the engine and never
// before it.
//
// TWO: every hook the travelling cage does name exits zero when there is no
// engine. A non-zero exit is how a hook refuses, so a script that can fail on a
// tree with nothing built is a script that refuses a session it cannot explain
// itself to.
//
//   node util/checks/the-travelling-cage-cannot-block.mjs <root>
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const root = process.argv[2] ?? ".";

let bad = 0;
const say = (what, ok, why) => {
  if (!ok) bad++;
  console.log((ok ? "  ok   " : "  FAIL ") + what + (ok ? "" : "\n         " + why));
};

// THE EVENTS A HOOK CAN REFUSE ON, named here because the harness decides them
// and this file is where that reading is written down.
const canRefuse = new Set(["PreToolUse", "UserPromptSubmit", "Stop", "SubagentStop", "PreModelSwitch"]);

// WHAT A CLONE CARRIES is what git carries, asked of git rather than of this
// working copy, because an untracked file here is a file no other box has.
const tracked = new Set(
  execFileSync("git", ["-C", root, "ls-files"], { encoding: "utf8" }).split(/\r?\n/).filter(Boolean),
);
say("git was asked what a clone carries (" + tracked.size + " paths)", tracked.size > 0,
  "git listed nothing, so this check is judging an empty set and is not doing its job");

// THE DOOR STAYS OUT OF VERSION CONTROL. It is the file that carries every
// refusing event, and the engine writes it.
say(".claude/settings.local.json is not in version control",
  !tracked.has(".claude/settings.local.json"),
  "the file holding every refusing event is in git, so a clone is caged before "
  + "any engine has decided anything");

// AND THE CAGE THAT DOES TRAVEL NAMES NO REFUSING EVENT.
const cages = [".claude/settings.json", "util/cage/claude-settings.json"];
for (const rel of cages) {
  const path = join(root, rel);
  if (!existsSync(path)) {
    say(rel + " is there to judge", false, "it could not be read");
    continue;
  }
  let hooks;
  try {
    hooks = JSON.parse(readFileSync(path, "utf8")).hooks ?? {};
  } catch (e) {
    say(rel + " reads as JSON", false, e.message);
    continue;
  }
  const events = Object.keys(hooks);
  say(rel + " names events to judge (" + events.join(", ") + ")", events.length > 0,
    "it declares no hook at all, so this has nothing to judge");
  for (const event of events) {
    if (!canRefuse.has(event)) {
      say(rel + " takes " + event + ", which cannot refuse a call", true);
      continue;
    }
    // AN EVENT THAT COULD REFUSE IS ALLOWED ONLY AS THE WAKE, and the wake is
    // driven below to prove it never does.
    //
    // THE WAKE CANNOT LIVE ANYWHERE ELSE. It is what starts the engine, and the
    // file holding every other refusing event is written BY the engine, so a
    // wake kept there would only ever run on a box that no longer needed it.
    // That is the whole reason this event is here, and it is why the exception
    // is a shape rather than a name: it holds only while the hook is the wake.
    const commands = (hooks[event] ?? []).flatMap((h) => h.hooks ?? []).map((h) => h.command ?? h.url ?? "");
    // THE SOURCE WRITES A PLACEHOLDER AND THE PROJECTION FILLS IT IN, so both
    // spellings name the same script and both are read here.
    const allWake = commands.length > 0
      && commands.every((c) => /hook-lane\.mjs/.test(c) || /\{\{hooklane\}\}/.test(c));
    say(rel + " takes " + event + ", which can refuse, only as the wake", allWake,
      "its hooks are " + JSON.stringify(commands) + ". A clone carries this, so a box "
      + "with no engine could be refused by a rule nothing on it has read. Either it is "
      + "the wake, which is driven here and exits zero, or it belongs in "
      + "util/cage/claude-settings-local.json, which the engine writes when it starts");
  }
}

// AND EVERY SCRIPT THE TRAVELLING CAGE RUNS EXITS ZERO WITH NOTHING BUILT.
//
// A hook refuses by exiting non-zero, so this drives each one over a tree that
// carries no .bin and reads the code it answers with. It is the cold case, and
// it is the only one where the answer matters: with an engine there, the engine
// is what decides.
// A TREE WITH THE SCRIPT AND NOTHING BUILT. The wake finds its engine from its
// own path, so the cold case is a copy of the script in a folder with no .bin
// rather than the real one pointed elsewhere.
const cold = mkdtempSync(join(tmpdir(), "cage-cold-"));
mkdirSync(join(cold, "util", "cage"), { recursive: true });
copyFileSync(join(root, "util", "cage", "hook-lane.mjs"), join(cold, "util", "cage", "hook-lane.mjs"));

const ran = (what, argv, cwd, event) => {
  let code = 0;
  try {
    execFileSync("node", argv, { cwd, input: JSON.stringify(event), encoding: "utf8", timeout: 120000 });
  } catch (e) {
    code = e.status ?? 1;
  }
  say(what, code === 0,
    "it exited " + code + ", and a non-zero exit is how a hook refuses. That refuses "
    + "a session against a rule nothing on the box has read");
};

// THE COLD CASE, which is the one a cloud box begins in. The tree it is pointed
// at is a folder with nothing in it, so the scripts find no engine to run.
for (const event of ["SessionStart", "UserPromptSubmit"]) {
  ran("the wake exits zero on " + event + " with nothing built",
    [join(cold, "util", "cage", "hook-lane.mjs"), "hook", "--method", cold, "--wake"],
    cold, { hook_event_name: event, cwd: cold, source: "startup", prompt: "a prompt" });
}

// AND THE WARM CASE, where an engine is built and the wake reaches it. The wake
// starts an engine and decides nothing, so it may not refuse here either, and a
// change that let it judge an event would land exactly here.
if (existsSync(join(root, ".bin"))) {
  for (const event of ["SessionStart", "UserPromptSubmit"]) {
    ran("the wake exits zero on " + event + " against a built tree",
      ["util/cage/hook-lane.mjs", "hook", "--method", ".", "--wake"],
      root, { hook_event_name: event, cwd: root, source: "startup", prompt: "a prompt" });
  }
}

console.log("\n" + bad + " failed.");
process.exit(bad ? 1 : 0);
