// The refactoring hand: the stop door starts it at a turn's end, and it walks
// the warnings list file by file.
// [[spec/design_output/stop#the-hand-walks-the-list]]

import { join } from "node:path";
import { REFACTORS } from "../../.claude/skills/level0/lib/runs.js";
import {
  drains,
  filesOn,
  standsPast,
  WALK_TOOL,
  walksList,
} from "../../.claude/skills/level0/lib/warnings.js";
import { asks } from "./config.js";
import { holdsFile, releasesHold } from "./refactor-hold.js";

// The refactoring hand this door starts. [[spec/tickets/the-spawn-reaches-its-guidance]]
const REFACTOR = {
  on: "refactor.parallel",
  most: "refactor.mostWarnings",
  atOnce: "refactor.mostAtOnce",
  files: "refactor.mostFiles",
};
// The tier the hand's work takes, which the agent names on a spawn of its own. [[spec/design_output/level0#a-spawn-names-its-tier]]
const TIER = "helper.change";
export const KIND = "refactor";
export const REFACTOR_ANSWERED = "refactor.answered";
const HELPER = "general-purpose";
const SAID = 200;

export const WALK_CALL = `mcp__level0__${WALK_TOOL}`;

// [[spec/design_output/stop#the-hand-walks-the-list]]
export function walkSpec() {
  return {
    name: WALK_TOOL,
    description: [
      "Hands the refactoring hand its next file, and moves the hold to it.",
      "The refactoring hand alone calls it, once the file in hand stands clean or it leaves that file.",
    ].join(" "),
    inputSchema: { type: "object", properties: {} },
  };
}

// Whether a hand still wants to go: the flag on, the list past the number, and this session's count unspent. The vote reads this, because a rule reading the list alone holds every turn open on a tree carrying warnings. [[spec/tickets/the-spawn-reaches-its-guidance]]
export function handWanted(box) {
  if (asks(box, REFACTOR.on) === false) return false;
  if (!standsPast(listHere(box).length, asks(box, REFACTOR.most))) return false;
  const most = Number(asks(box, REFACTOR.atOnce) ?? 0);
  return !(most > 0 && (box.refactors ?? 0) >= most);
}

// The hand the rule starts: its first file, and the count it spends. It walks the rest itself. [[spec/design_output/stop#the-hand-walks-the-list]]
export function refactorHand(box) {
  if (!handWanted(box)) return null;
  const file = nextFile(box);
  if (!file) return null;
  box.refactors = (box.refactors ?? 0) + 1;
  box.walk = { hand: "", taken: [] };
  box.log.say(
    "info",
    "refactor",
    `the refactoring hand spawns, ${listHere(box).length} warnings standing`,
  );
  takes(box, file, "");
  return {
    prompt: walksList(file),
    description: "drain the warnings, file by file",
    subagentType: HELPER,
    kind: KIND,
    file,
  };
}

// The hand asks for its next file here, so one hand walks the list and holds the file it writes alone. [[spec/design_output/stop#the-hand-walks-the-list]]
export function walks(e, box) {
  const hand = String(e?.agentId ?? "");
  const walk = box.walk;
  if (!walk || !hand || (walk.hand && walk.hand !== hand)) {
    return {
      result: {
        deny: "No refactoring walk stands for this hand, so no file waits here.",
      },
    };
  }
  walk.hand = hand;
  releasesHold(box);
  const most = Number(asks(box, REFACTOR.files) ?? 0);
  const file = most > 0 && walk.taken.length >= most ? "" : nextFile(box, walk.taken);
  if (!file) {
    return { result: { result: "No file waits. Answer what you drained, and end." } };
  }
  takes(box, file, hand);
  return { result: { result: drains(file) } };
}

// The hold moves to the file, and the log says the hand starts it. [[spec/design_output/stop#the-hand-walks-the-list]]
function takes(box, file, hand) {
  box.walk.taken.push(file);
  holdsFile(box, file, hand);
  box.log.say(
    "info",
    "refactor",
    `the hand takes ${file}, of ${listHere(box).length} standing`,
    { file },
  );
}

// The walk ends here. A hand that falls writes why at warn, and a hand that ends clean writes nothing. A refused spawn keeps the walk and its hold for the hand the agent spawns. [[spec/design_output/stop#the-agent-spawns-instead]]
export function onRefactorAnswered(e, box) {
  const refused = String(e?.deny ?? "");
  const file = String(e?.file ?? "");
  if (refused && file && box.walk) {
    box.handToSpawn = file;
    box.log.say(
      "warn",
      "refactor",
      "the engine cannot start the refactoring hand, so the agent spawns it",
      {
        file,
        detail: refused.slice(0, SAID),
      },
    );
    return { result: { result: "the agent spawns the refactoring hand" } };
  }
  releasesHold(box);
  box.walk = null;
  const said = refused || (e?.isError ? String(e?.text ?? "") : "");
  if (said) {
    box.log.say("warn", "refactor", "the refactoring hand falls", {
      detail: said.slice(0, SAID),
    });
  }
  return { result: { result: "the refactoring hand answered" } };
}

// The agent's next call carries the spawn the engine leaves unstarted, once. [[spec/design_output/stop#the-agent-spawns-instead]]
export function tellsHand(e, box, before = null) {
  const file = String(box.handToSpawn ?? "");
  if (e?.agentId || !file) return before;
  box.handToSpawn = "";
  const context = [...(before?.after?.context ?? []), spawnText(file, asks(box, TIER))];
  return { ...(before ?? {}), after: { ...(before?.after ?? {}), context } };
}

// [[spec/design_output/stop#the-agent-spawns-instead]]
export function spawnText(file, model) {
  return [
    "# Spawn the refactoring hand",
    "",
    "The engine cannot start the refactoring hand here, so spawn it beside your work:",
    `one \`Agent\` call, \`subagent_type\` ${HELPER}, \`model\` ${model || "sonnet"}, \`run_in_background\` true,`,
    "and the prompt below. Carry on with your own work while it runs.",
    "",
    walksList(file),
  ].join("\n");
}

// The file the hand takes: the next on the list and new to this walk, whatever its age. [[spec/design_output/stop#the-hand-walks-the-list]]
function nextFile(box, taken = []) {
  return filesOn(listHere(box)).find((one) => !taken.includes(one)) ?? "";
}

// The list the lint leaves, one entry a warning, which the hand drains. [[spec/design_output/stop#the-grace]]
function listHere(box) {
  try {
    const said = JSON.parse(String(box.disk.read(join(box.work, REFACTORS))));
    return Array.isArray(said) ? said : [];
  } catch {
    return [];
  }
}
