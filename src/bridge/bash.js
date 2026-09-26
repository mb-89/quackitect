// The command door. A shell reaches every file a Write reaches, so every rule
// over a command line runs here before the command does.
// [[spec/design_output/bash#what-the-door-reads]]

import { isAbsolute, join } from "node:path";
import {
  commitIn,
  findings,
  freeOfTicket,
  skipsTheHook,
  verbLine,
  withoutTrailers,
} from "../../.claude/skills/level0/lib/bash.js";
import {
  cloudHere,
  deskRefusal,
  onDesk,
} from "../../.claude/skills/level0/lib/cloud.js";
import { linesIn } from "../../.claude/skills/level0/lib/marks.js";
import { relativeTo } from "../../.claude/skills/level0/lib/paths.js";
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
import { formIn, refusesIn, rowOf } from "../../.claude/skills/level0/lib/warnings.js";
import { WORK_BRANCH } from "../engine/group.js";
import { DESCRIPTION_HOW, inHand, ticketFault, ticketOf } from "../engine/named.js";
import { heldTests } from "../scripts/guidance-hand.js";
import { asks } from "./config.js";
import { readsProse } from "./prose.js";
import { marksSeen } from "./write.js";

const COMMIT = "level0-commit.md";
const PASS = { pass: true };

export async function onBash(e, box) {
  const command = String(e?.command ?? "");
  const checks = [
    ticketDoor,
    commandRules,
    privateDelta,
    testedDelta,
    todoOnPush,
    deskGuard,
    trunkGuard,
    versionGuard,
  ];
  const held = {};
  for (const check of checks) {
    const found = await check(command, e, box, held);
    if (found) return { result: { deny: found } };
  }
  marksShown(command, box);
  return messageWarns(held.warned ?? [], box) ?? PASS;
}

// [[spec/design_output/level0#a-shell-names-its-ticket]]
export async function onPowerShell(e, box) {
  const command = String(e?.command ?? "");
  const found = ticketDoor(command, e, box);
  return found ? { result: { deny: found } } : PASS;
}

// [[spec/design_output/level0#a-shell-names-its-ticket]]
function ticketDoor(command, e, box) {
  if (freeOfTicket(command)) return "";
  // A description opening on the working todo's title and a colon names what stands in hand. [[spec/tickets/the-todo-joins-the-queue]]
  const todo = inHand({ disk: box.disk, root: box.work }).todo;
  if (
    todo &&
    String(e?.description ?? "")
      .trim()
      .startsWith(`${todo}:`)
  )
    return "";
  const fault = ticketFault(
    ticketOf(e?.description),
    { disk: box.disk, root: box.work },
    DESCRIPTION_HOW,
  );
  if (!fault) return "";
  box.log.say(
    "warn",
    "ticket",
    `refused a ${e?.tool ?? "Bash"} call naming no open ticket`,
    {
      tool: String(e?.tool ?? "Bash"),
      detail: String(e?.description ?? ""),
    },
  );
  return fault;
}

// The shell reads that hand the agent a file's lines, each a shape and the span it prints. [[spec/design_output/level0#a-lone-shell-read-marks]]
const SHOWS = [
  { shape: /^cat\s+(\S+)$/, span: () => null },
  { shape: /^head\s+-n\s*(\d+)\s+(\S+)$/, span: (n) => ({ from: 1, to: Number(n) }) },
  {
    shape: /^tail\s+-n\s*(\d+)\s+(\S+)$/,
    span: (n, text) => ({ from: linesIn(text) - Number(n) + 1, to: linesIn(text) }),
  },
  {
    shape: /^sed\s+-n\s+(['"]?)(\d+),(\d+)p\1\s+(\S+)$/,
    span: (_q, from, to) => ({ from: Number(from), to: Number(to) }),
  },
];
// A pipe, a chain or a redirection hands the agent something else than the file. [[spec/design_output/level0#a-lone-shell-read-marks]]
const JOINS = /[|;&<>`$()\n]/;

// A lone shell read hands the agent what it prints, so the mark comes off it. [[spec/design_output/level0#a-lone-shell-read-marks]]
function marksShown(command, box) {
  const line = command.trim();
  if (JOINS.test(line)) return;
  for (const one of SHOWS) {
    const found = line.match(one.shape);
    if (!found) continue;
    const named = found.at(-1).replace(/^['"]|['"]$/g, "");
    const path = isAbsolute(named) ? named : join(box.root, named);
    const where = relativeTo(box.root, path);
    if (!where || where.startsWith("..") || isAbsolute(where)) return;
    try {
      const text = String(box.disk.read(path));
      marksSeen(box, where, text, one.span(...found.slice(1, -1), text));
    } catch {
      // [[spec/design_output/level0#a-lone-shell-read-marks]]
    }
    return;
  }
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
async function commandRules(command, _e, box, held) {
  const found = findings(command, asks(box, "names.words"), {
    cloud: cloudHere(box),
    script: (path) => fileText(reader(box), path),
    subjects: (undo) => subjectsOf(box, undo),
  });
  const voiced = await commitVoice(command, box);
  found.push(...refusesIn(voiced));
  held.warned = formIn(voiced);
  if (!cloudHere(box) && skipsTheHook(command)) {
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

// A revert reads each revision alone, and a reset walks the range it drops. [[spec/design_output/bash#a-pull-commit-stands]]
function subjectsOf(box, undo) {
  const walk = undo.walks ? [] : ["--no-walk"];
  return git(box, ["log", ...walk, "--format=%s", ...undo.revs])
    .split("\n")
    .filter(Boolean);
}

// A message meets the voice rules, and every finding comes back, so the caller warns on form and refuses the rest. [[spec/design_output/bash#a-commit-message-meets-voice]]
export async function messageFaults(message, box) {
  if (!box.vale.stands()) return [];
  const text = withoutTrailers(String(message ?? ""));
  if (!text.trim()) return [];
  const ran = await box.vale.lint(text, COMMIT);
  return ran.ran ? readsProse(box, text, ran.found) : [];
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

// A break of form in a message lands with the commit, and the rows reach the log and the agent. [[spec/design_output/bash#a-commit-message-meets-voice]]
function messageWarns(found, box) {
  if (!found.length) return null;
  const rows = found.map((one) => ({ ...one, file: one?.file || COMMIT }));
  box.log.say(
    "warn",
    "bash",
    `${rows.length} line(s) of a commit message stand at warning`,
    {
      tool: "Bash",
      rule: rows[0]?.rule,
      detail: rows.map(rowOf).join("\n"),
    },
  );
  return { after: { context: [messageNote(rows)] } };
}

// What the agent reads after a commit lands over a break of form. [[spec/design_output/bash#a-commit-message-meets-voice]]
export function messageNote(rows) {
  return [
    `${rows.length} line(s) of the commit message break a rule of form, and the commit lands. Leave it as it stands, carry on with the ask, and hold these rules in the next message.`,
    ...rows.map((one) => `  ${rowOf(one)}`),
  ].join("\n");
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
  const merging = Boolean(
    await git(box, ["rev-parse", "-q", "--verify", "MERGE_HEAD"]),
  );
  const found = untestedIn(
    await git(box, ["diff", "--cached", "--unified=0"]),
    (path) => fileText(reader(box), path),
    merging,
    heldTests(reader(box)),
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

// A desk lands nothing on a work branch, and the verbs read the same answer. [[spec/design_output/work#a-desk-works-on-trunk]]
function deskGuard(command, _e, box) {
  const touched = touchesGit(command);
  if (!touched.commits && !touched.pushes) return "";
  const branch = git(box, ["rev-parse", "--abbrev-ref", "HEAD"]);
  if (!onDesk(box, branch)) return "";
  const how = touched.commits ? "commit" : "push";
  box.log.say("warn", "bash", `refused a ${how} on ${branch} at a desk`, {
    tool: "Bash",
    detail: command,
  });
  return deskRefusal(`this ${how} lands nowhere on ${branch}`).join("\n");
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
  box.log.say("warn", "bash", `refused a ${how} landing on ${TRUNK}`, {
    tool: "Bash",
    detail: command,
  });
  if (!cloudHere(box) || !takesABranch(box)) return throughTheVerb(how);
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

// Each commit carries one helper's work, and the verb's check gates every landing on trunk. [[spec/design_output/work#a-landing-takes-the-verb]]
function throughTheVerb(how) {
  if (how === "push")
    return [
      `This push lands on ${TRUNK} past the push verb.`,
      "",
      "Run `./RUNME.sh push`, which reads the check's stamp and pushes the branch",
      "you stand on once the check answers green on it.",
    ].join("\n");
  return [
    `This ${how} lands on ${TRUNK} past the commit verb.`,
    "",
    'Run `./RUNME.sh commit "<message>"`, which reads the message, runs the tests,',
    "commits, runs the check and pushes the branch you stand on. One helper's work",
    "rides one commit, so one review reads it and one undo takes it back.",
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
