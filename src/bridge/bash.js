// The command door. A shell reaches every file a Write reaches, so every rule
// over a command line runs here before the command does.
// [[spec/design_output/bash#what-the-door-reads]]

import { commitIn, findings, skipsTheHook, verbLine, withoutTrailers } from "../../.claude/skills/level0/lib/bash.js";
import { bindsHere } from "../../.claude/skills/level0/lib/guidance.js";
import { NOTES, privateNow } from "../../.claude/skills/level0/lib/private.js";
import { refusedCommand, refusedDelta } from "../../.claude/skills/level0/lib/refuse.js";
import { saysGreen, STAMP, stampOf } from "../../.claude/skills/level0/lib/runs.js";
import { reaches, refusedTodo, taggedIn } from "../../.claude/skills/level0/lib/todo.js";
import { landsOnTrunk, refusedVersion, touchesGit, TRUNK, versionRefs } from "../../.claude/skills/level0/lib/trunk.js";
import { PROSE } from "../../.claude/skills/level0/lib/vale.js";
import { refusedWarnings, warningsOn } from "../../.claude/skills/level0/lib/warnings.js";
import { WORK_BRANCH } from "../scripts/group.js";
import { asks } from "./config.js";
import { readsProse } from "./prose.js";

const COMMIT = "level0-commit.md";
const PASS = { pass: true };
const CLOUD = "---\nenv:\n  - CLAUDE_CODE_REMOTE\n  - SE_CLOUD\n---\n";

export async function onBash(e, box) {
  const command = String(e?.command ?? "");
  const checks = [
    commandRules,
    privateDelta,
    todoOnPush,
    warningsOnPush,
    trunkGuard,
    versionGuard,
  ];
  for (const check of checks) {
    const found = await check(command, e, box);
    if (found) return { result: { deny: found } };
  }
  return PASS;
}

// [[spec/design_output/bash#the-description-names-verbs]]
export function onDescribe(e) {
  if (String(e?.tool ?? "") !== "Bash") return PASS;
  return { after: { description: verbLine() } };
}

// [[spec/design_output/bash#a-shell-writes-nothing]]
async function commandRules(command, _e, box) {
  const found = findings(command, asks(box, "names.words"), { cloud: onACloud() });
  found.push(...(await commitVoice(command, box)));
  if (!onACloud() && skipsTheHook(command)) {
    box.log.say("warn", "private", "a commit steps past the hook", { tool: "Bash", detail: command });
  }
  if (!found.length) return "";
  box.log.say("warn", "bash", `refused ${found.length} rule(s) in a command`, {
    tool: "Bash",
    rule: found[0].rule,
    detail: command,
  });
  return refusedCommand(command, found);
}

// [[spec/design_output/bash#a-commit-message-meets-voice]]
async function commitVoice(command, box) {
  const said = commitIn(command);
  if (!said || !box.vale.stands()) return [];
  let text = String(said.text ?? "");
  if (said.form === "file") {
    try {
      text = String(box.disk.read(said.file));
    } catch {
      return [];
    }
  }
  text = withoutTrailers(text);
  if (!text.trim()) return [];
  const ran = await box.vale.lint(text, COMMIT);
  return ran.ran ? readsProse(box, text, ran.found) : [];
}

// [[spec/design_output/private#two-doors-one-check]]
async function privateDelta(command, _e, box) {
  if (!commitIn(command)) return "";
  const found = await privateNow({
    diff: async () => git(box, ["diff", "--cached", "--unified=0"]),
    box: async () => boxHere(box),
    notes: async () => notesIn(box),
  });
  if (!found.length) return "";
  box.log.say("warn", "private", `refused ${found.length} line(s) in a commit`, {
    tool: "Bash",
    file: found[0].file,
    rule: found[0].rule,
  });
  return refusedDelta(found);
}

// [[spec/design_input/the-agent-pulls-tickets#the-to-do-flag]]
function todoOnPush(command, _e, box) {
  if (!touchesGit(command).pushes) return "";
  const names = git(box, ["log", "--format=", "--name-only", "HEAD", "--not", "--remotes"])
    .split("\n")
    .map((row) => row.trim())
    .filter(reaches);
  const carried = [...new Set(names)]
    .map((name) => ({ name, text: git(box, ["show", `HEAD:${name}`]) }))
    .filter((one) => one.text);
  const found = taggedIn(carried);
  if (!found.length) return "";
  box.log.say("warn", "todo", `refused a push carrying ${found.length} note(s)`, { tool: "Bash", file: found[0] });
  return refusedTodo(found);
}

// [[spec/tickets/one-list-holds-the-warnings]]
async function warningsOnPush(command, _e, box) {
  if (!touchesGit(command).pushes) return "";
  const names = [
    ...new Set(
      git(box, ["log", "--format=", "--name-only", "HEAD", "--not", "--remotes"])
        .split("\n")
        .map((row) => row.trim())
        .filter(Boolean),
    ),
  ];
  const found = warningsOn(await lintedHere(box, names), names);
  if (!found.length) return "";
  box.log.say("warn", "bash", `refused a push over ${found[0].rule}`, {
    tool: "Bash",
    file: found[0].file,
  });
  return refusedWarnings(found);
}

// [[spec/tickets/one-list-holds-the-warnings]]
async function lintedHere(box, names) {
  const read = names.filter((one) => PROSE.test(one));
  if (!read.length || !box.vale?.stands()) return [];
  const found = [];
  for (const name of read) {
    const whole = textAt(box, name);
    if (!whole) continue;
    const said = await box.vale.lint(whole, name);
    if (said.ran) found.push(...readsProse(box, whole, said.found).map((one) => ({ ...one, file: name })));
  }
  return found;
}

function textAt(box, name) {
  try {
    return String(box.disk.read(`${box.work}/${name}`));
  } catch {
    return "";
  }
}

// [[spec/design_output/work#a-version-branch-stands]]
function versionGuard(command, _e, box) {
  const found = versionRefs(command);
  if (!found.length) return "";
  box.log.say("warn", "bash", `refused a ${found[0].how} of ${found[0].name}`, { tool: "Bash", detail: command });
  return refusedVersion(found);
}

// [[spec/design_output/work#a-red-battery-pushes-nothing]]
function trunkGuard(command, _e, box) {
  const how = landsOnTrunk(command, git(box, ["rev-parse", "--abbrev-ref", "HEAD"]), TRUNK);
  if (!how) return "";
  if (how === "push") {
    const battery = batteryHere(box);
    if (!battery.green) {
      box.log.say("warn", "bash", `refused a push to ${TRUNK} on a red battery`, { tool: "Bash", detail: battery.says });
      return [
        `${TRUNK} takes a green battery, and ${battery.says}.`,
        "",
        "Run `./RUNME.sh check` last, after your final commit. The stamp names",
        "the commit it ran against, so a commit after it reads stale.",
      ].join("\n");
    }
  }
  if (!onACloud()) return "";
  if (!takesABranch(box)) return "";
  box.log.say("warn", "bash", `refused a ${how} landing on ${TRUNK}`, { tool: "Bash", detail: command });
  return [
    `A cloud box holding a work branch hands it back, and ${TRUNK} stays shut here.`,
    "",
    how === "commit" ? `You stand on ${TRUNK}, so this commit would land there.` : `This pushes ${TRUNK}, and the branch in hand goes back to the queue instead.`,
    "",
    "Run `./RUNME.sh ticket pull`, which takes a branch for a cloud box and moves you onto it.",
    "Push that branch, run `branch done`, and a box off the cloud takes it into trunk.",
  ].join("\n");
}

// A CLOUD BOX HOLDING A WORK BRANCH HANDS IT BACK, AND EVERY OTHER CLOUD SESSION LANDS ITS OWN WORK. The queue owns a work branch, so a cloud box taking one carries it to the hand-back and moves trunk nowhere. A session outside that flow answers to the owner alone, and the green battery is the door it meets. [[spec/design_output/work#a-red-battery-pushes-nothing]]
function takesABranch(box) {
  return git(box, ["rev-parse", "--abbrev-ref", "HEAD"]).startsWith(WORK_BRANCH);
}

function batteryHere(box) {
  let text = "";
  try {
    text = String(box.disk.read(`${box.work}/${STAMP}`));
  } catch {
    return { green: false, says: "no check has run here" };
  }
  return saysGreen(stampOf(text), git(box, ["rev-parse", "HEAD"]));
}

function git(box, args) {
  try {
    const ran = box.proc.run(["git", ...args], { cwd: box.work, timeoutMs: 10000 });
    return String(ran.stdout ?? "").trim();
  } catch {
    return "";
  }
}

function boxHere(box) {
  const env = process.env;
  return {
    user: env.USER || env.USERNAME || env.LOGNAME || "",
    home: env.HOME || env.USERPROFILE || "",
    name: git(box, ["config", "--get", "user.name"]),
    email: git(box, ["config", "--get", "user.email"]),
  };
}

function notesIn(box) {
  try {
    return box.disk
      .list(`${box.work}/${NOTES}`)
      .filter((one) => one.kind === "file" && one.name.endsWith(".md"))
      .map((one) => ({ name: `${NOTES}/${one.name}`, text: box.disk.read(`${box.work}/${NOTES}/${one.name}`) }));
  } catch {
    return [];
  }
}

function onACloud() {
  return bindsHere(CLOUD, { CLAUDE_CODE_REMOTE: process.env.CLAUDE_CODE_REMOTE ?? "", SE_CLOUD: process.env.SE_CLOUD ?? "" });
}
