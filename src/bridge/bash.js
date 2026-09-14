// The bash door. A shell command meets four checks, and the first one failing
// refuses it with the reason: no shell redirection into a file the rules
// reach, a commit message under the voice rules, a commit whose delta carries
// something private, and the trunk guard, which holds main for a green check
// before a push and shuts it on a cloud box. The Bash description carries the
// verb line, so the agent reaches for the verb before the raw command.
// [[spec/design_output/bash#what-the-door-reads]]

import { commitIn, findings, skipsTheHook, verbLine, withoutTrailers } from "../../.claude/skills/level0/lib/bash.js";
import { bindsHere } from "../../.claude/skills/level0/lib/guidance.js";
import { NOTES, privateNow } from "../../.claude/skills/level0/lib/private.js";
import { refusedCommand, refusedDelta } from "../../.claude/skills/level0/lib/refuse.js";
import { saysGreen, STAMP, stampOf } from "../../.claude/skills/level0/lib/runs.js";
import { reaches, refusedTodo, taggedIn } from "../../.claude/skills/level0/lib/todo.js";
import { landsOnTrunk, touchesGit } from "../../.claude/skills/level0/lib/trunk.js";
import { asks } from "./config.js";

const TRUNK = "main";
// The name Vale reads a commit message under, so the rules for a message apply.
const COMMIT = "level0-commit.md";
const PASS = { pass: true };
const CLOUD = "---\nenv:\n  - CLAUDE_CODE_REMOTE\n  - SE_CLOUD\n---\n";

export async function onBash(e, box) {
  const command = String(e?.command ?? "");
  const checks = [commandRules, privateDelta, todoOnPush, trunkGuard];
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
async function commandRules(command, e, box) {
  const found = findings(command, asks(box, "names.words") ?? 5, { cloud: onACloud() });
  found.push(...(await commitVoice(command, box)));
  if (!onACloud() && skipsTheHook(command)) {
    box.log.say("warn", "private", "a commit steps past the hook", { tool: "Bash", detail: command.slice(0, 120) });
  }
  if (!found.length) return "";
  box.log.say("warn", "bash", `refused ${found.length} rule(s) in a command`, {
    tool: "Bash",
    rule: found[0].rule,
    detail: command.slice(0, 120),
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
  return ran.ran ? ran.found : [];
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
  box.log.say("warn", "bash", `refused a ${how} landing on ${TRUNK}`, { tool: "Bash", detail: command.slice(0, 120) });
  return [
    `A cloud box works a branch, and the harness holds ${TRUNK} shut here.`,
    "",
    how === "commit" ? `You stand on ${TRUNK}, so this commit would land there.` : `This pushes ${TRUNK}, which a cloud box may never move.`,
    "",
    "Run `./RUNME.sh branch take` to take a branch and move onto it. Push that",
    "branch, run `branch done`, and a box off the cloud takes it into trunk.",
  ].join("\n");
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
