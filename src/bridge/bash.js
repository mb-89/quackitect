// The command door. A shell reaches every file a Write reaches, so every rule
// over a command line runs here before the command does.
// [[spec/design_output/bash#what-the-door-reads]]

import { join } from "node:path";
import {
  commitIn,
  findings,
  skipsTheHook,
  verbLine,
  withoutTrailers,
} from "../../.claude/skills/level0/lib/bash.js";
import { bindsHere } from "../../.claude/skills/level0/lib/guidance.js";
import { NOTES, privateNow } from "../../.claude/skills/level0/lib/private.js";
import {
  refusedCommand,
  refusedDelta,
} from "../../.claude/skills/level0/lib/refuse.js";
import { STAMP, saysGreen, stampOf } from "../../.claude/skills/level0/lib/runs.js";
import { fileText } from "../../.claude/skills/level0/lib/scripted.js";
import { refusedTest, untestedIn } from "../../.claude/skills/level0/lib/tested.js";
import {
  reaches,
  refusedTodo,
  taggedIn,
} from "../../.claude/skills/level0/lib/todo.js";
import {
  landsOnTrunk,
  refusedVersion,
  TRUNK,
  touchesGit,
  versionRefs,
} from "../../.claude/skills/level0/lib/trunk.js";
import { WORK_BRANCH } from "../engine/group.js";
import { asks } from "./config.js";
import { readsProse } from "./prose.js";
import { errorsIn } from "./write.js";

const COMMIT = "level0-commit.md";
const PASS = { pass: true };
const CLOUD = "---\nenv:\n  - CLAUDE_CODE_REMOTE\n  - SE_CLOUD\n---\n";

export async function onBash(e, box) {
  const command = String(e?.command ?? "");
  const checks = [
    commandRules,
    privateDelta,
    testedDelta,
    todoOnPush,
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

// The box carries no join, so the door hands the reading the work root and the join of the path module. [[spec/tickets/one-door-joins-a-path]]
function reader(box) {
  return { disk: box.disk, root: box.work, join };
}

// [[spec/design_output/bash#a-shell-writes-nothing]]
async function commandRules(command, _e, box) {
  const found = findings(command, asks(box, "names.words"), {
    cloud: onACloud(box),
    script: (path) => fileText(reader(box), path),
  });
  found.push(...(await commitVoice(command, box)));
  if (!onACloud(box) && skipsTheHook(command)) {
    box.log.say("warn", "private", "a commit steps past the hook", {
      tool: "Bash",
      detail: command,
    });
  }
  if (!found.length) return "";
  box.log.say("warn", "bash", `refused ${found.length} rule(s) in a command`, {
    tool: "Bash",
    rule: found[0].rule,
    detail: command,
  });
  return refusedCommand(command, found);
}

// A message meets the voice rules, and a break of form lands the way a write does. [[spec/rationales/voice#11-form-and-substance]]
export async function messageFaults(message, box) {
  if (!box.vale.stands()) return [];
  const text = withoutTrailers(String(message ?? ""));
  if (!text.trim()) return [];
  const ran = await box.vale.lint(text, COMMIT);
  return ran.ran ? errorsIn(readsProse(box, text, ran.found)) : [];
}

// [[spec/design_output/bash#a-commit-message-meets-voice]]
async function commitVoice(command, box) {
  const said = commitIn(command);
  if (!said) return [];
  if (said.form === "file") {
    try {
      return await messageFaults(box.disk.read(said.file), box);
    } catch {
      return [];
    }
  }
  return await messageFaults(said.text, box);
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

// A change and the test proving it land together. [[spec/design_output/tree#the-rules-over-two-files]]
async function testedDelta(command, _e, box) {
  if (!commitIn(command)) return "";
  // Git holds a merge in progress under MERGE_HEAD, so the read asks git where it stands. [[spec/design_output/tree#the-rules-over-two-files]]
  const merging = Boolean(await git(box, ["rev-parse", "-q", "--verify", "MERGE_HEAD"]));
  const found = untestedIn(
    await git(box, ["diff", "--cached", "--unified=0"]),
    (path) => fileText(reader(box), path),
    merging,
  );
  if (!found.length) return "";
  box.log.say("warn", "tested", `refused ${found.length} file(s) with no test`, {
    tool: "Bash",
    file: found[0],
    rule: "EveryModuleTested",
  });
  return refusedTest(found);
}

// [[spec/design_input/the-agent-pulls-tickets#the-to-do-flag]]
function todoOnPush(command, _e, box) {
  if (!touchesGit(command).pushes) return "";
  const names = git(box, [
    "log",
    "--format=",
    "--name-only",
    "HEAD",
    "--not",
    "--remotes",
  ])
    .split("\n")
    .map((row) => row.trim())
    .filter(reaches);
  const carried = [...new Set(names)]
    .map((name) => ({ name, text: git(box, ["show", `HEAD:${name}`]) }))
    .filter((one) => one.text);
  const found = taggedIn(carried);
  if (!found.length) return "";
  box.log.say("warn", "todo", `refused a push carrying ${found.length} note(s)`, {
    tool: "Bash",
    file: found[0],
  });
  return refusedTodo(found);
}

// A warning reads red in the battery, so the trunk guard below holds a push over one without a rule of its own. [[spec/design_output/work#the-battery-answers-first]]

// [[spec/design_output/work#a-version-branch-stands]]
function versionGuard(command, _e, box) {
  const found = versionRefs(command);
  if (!found.length) return "";
  box.log.say("warn", "bash", `refused a ${found[0].how} of ${found[0].name}`, {
    tool: "Bash",
    detail: command,
  });
  return refusedVersion(found);
}

// [[spec/design_output/work#a-box-writes-its-branch]]
function trunkGuard(command, _e, box) {
  // A command making no commit and no push lands nowhere, so git answers nothing for it. [[spec/design_output/work#a-box-writes-its-branch]]
  const touched = touchesGit(command);
  if (!touched.commits && !touched.pushes) return "";
  const how = landsOnTrunk(
    command,
    git(box, ["rev-parse", "--abbrev-ref", "HEAD"]),
    TRUNK,
  );
  if (!how) return "";
  if (how === "push") {
    const battery = batteryHere(box);
    if (!battery.green) {
      box.log.say("warn", "bash", `refused a push to ${TRUNK} on a red battery`, {
        tool: "Bash",
        detail: battery.says,
      });
      return [
        `${TRUNK} takes a green battery, and ${battery.says}.`,
        "",
        "Run `./RUNME.sh check` last, after your final commit. The stamp names",
        "the commit it ran against, so a commit after it reads stale.",
      ].join("\n");
    }
  }
  if (!onACloud(box)) return "";
  if (!takesABranch(box)) return "";
  box.log.say("warn", "bash", `refused a ${how} landing on ${TRUNK}`, {
    tool: "Bash",
    detail: command,
  });
  return [
    `A cloud box holding a work branch hands it back, and ${TRUNK} stays shut here.`,
    "",
    how === "commit"
      ? `You stand on ${TRUNK}, so this commit would land there.`
      : `This pushes ${TRUNK}, and the branch in hand goes back to the queue instead.`,
    "",
    "Run `./RUNME.sh ticket pull`, which takes a branch for a cloud box and moves you onto it.",
    "Push that branch, run `branch done`, and a box off the cloud takes it into trunk.",
  ].join("\n");
}

// A CLOUD BOX HOLDING A WORK BRANCH HANDS IT BACK, AND EVERY OTHER CLOUD SESSION LANDS ITS OWN WORK. The queue owns a work branch, so a cloud box taking one carries it to the hand-back and moves trunk nowhere. A session outside that flow answers to the owner alone, and the green battery is the door it meets. [[spec/design_output/work#a-box-writes-its-branch]]
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
  const env = box.env ?? {};
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
      .map((one) => ({
        name: `${NOTES}/${one.name}`,
        text: box.disk.read(`${box.work}/${NOTES}/${one.name}`),
      }));
  } catch {
    return [];
  }
}

function onACloud(box) {
  const env = box.env ?? {};
  return bindsHere(CLOUD, {
    CLAUDE_CODE_REMOTE: env.CLAUDE_CODE_REMOTE ?? "",
    SE_CLOUD: env.SE_CLOUD ?? "",
  });
}
