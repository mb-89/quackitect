// The context door. A session past context.handoverAt finishes, writes the
// handover, and ends the turn; the bridgehead clears the conversation there
// and prompts the next one, which reads the handover and the step again.
// [[spec/design_output/stop#the-context-hands-over]]

import { join } from "node:path";
import { BINDING, QUEUE } from "../../.claude/skills/level0/lib/config.js";
import { HANDOVER, HOLDS, RETRO } from "../../.claude/skills/level0/lib/folders.js";
import { asks } from "./config.js";
import { waitsForOwner } from "./stop.js";

const AT = "context.handoverAt";
const NOW = "context.writeAt";
// A path into the retro folder, with either slash. [[spec/design_output/stop#the-context-hands-over]]
const RETRO_PATH = /\.se[\\/]\.retro[^\s`)|\]]*/;
const MOST = "stop.mostInARow";
export const FINISH = "finish";
export const CLEAR = "clear";

// What the next conversation reads first, as its opening prompt. [[spec/design_output/stop#the-context-hands-over]]
export const RESUME = [
  "Level zero cleared the conversation, because the context passed",
  `\`${AT}\`. The handover block says where the work stands. Read it, run`,
  "`./RUNME.sh ticket pull` where a ticket stands in your hand, so the step and",
  "its guidance reach you again, and carry on.",
].join(" ");

// A fill past the key marks the session due. Every reading lands here, off the call and off the turn's measure alike. [[spec/design_output/stop#the-context-hands-over]]
export function measures(box, tokens) {
  const fill = Number(tokens);
  if (!Number.isFinite(fill) || fill <= 0) return;
  box.fill = fill;
  // The queue alone clears, so a session under god or unbound keeps its conversation and goes due nowhere. [[spec/design_output/stop#the-queue-alone-clears]]
  if (!clearsHere(box)) {
    box.handover = null;
    return;
  }
  const at = Number(asks(box, AT) ?? 0);
  if (!(at > 0)) return;
  // The first reading after a clear is what the next conversation opens on, and a key under it hands over into a loop. [[spec/design_output/stop#the-context-hands-over]]
  if (box.cleared) {
    box.cleared = false;
    if (fill >= at) {
      box.standsDown = true;
      box.log.say(
        "warn",
        "handover",
        `the conversation opens at ${fill} tokens, past ${AT} at ${at}, so it hands over no more this session`,
      );
    }
  }
  if (box.handover) {
    writesNow(box, fill, at);
    return;
  }
  if (box.standsDown || fill < at) return;
  box.handover = { phase: FINISH, asked: 0 };
  box.log.say(
    "info",
    "handover",
    `the context holds ${fill} tokens, past ${AT} at ${at}, so the session hands over`,
    { tokens: fill, at },
  );
  writesNow(box, fill, at);
}

// [[spec/design_output/stop#the-queue-alone-clears]]
export function clearsHere(box) {
  return String(asks(box, BINDING) ?? "") === QUEUE;
}

// A fill past context.writeAt turns the finish into the handover itself: the step stays where it stands. A key at zero, or under the first key, adds no second stage. [[spec/design_output/stop#the-context-hands-over]]
function writesNow(box, fill, at) {
  const now = Number(asks(box, NOW) ?? 0);
  if (box.handover.now || !(now > at) || fill < now) return;
  box.handover.now = true;
  box.log.say(
    "info",
    "handover",
    `the context holds ${fill} tokens, past ${NOW} at ${now}, so the handover gets written now`,
    { tokens: fill, at: now },
  );
}

// [[spec/design_output/stop#the-context-hands-over]]
export function onSessionMeasure(e, box) {
  if (!e?.agentId) measures(box, e?.context?.tokens);
  return { pass: true };
}

// The block rides every call of a session due, so the agent puts the work down before the turn's end asks for the file. [[spec/design_output/stop#the-context-hands-over]]
export function ridesCall(e, box, before = null) {
  if (e?.agentId || box.handover?.phase !== FINISH) return before;
  const context = [...(before?.after?.context ?? []), dueText(box)];
  return { ...(before ?? {}), after: { ...(before?.after ?? {}), context } };
}

export function dueText(box) {
  if (box.handover?.now) {
    return [
      "# Write the handover now",
      "",
      `The context holds ${box.fill ?? "more"} tokens, past \`${NOW}\` at ${asks(box, NOW)}.`,
      "Stop the step where it stands and leave it in hand. Write",
      `\`${HANDOVER}\` now: what stands, what waits, and the ticket and step in hand.`,
      `Name no file under \`${RETRO}\`. End the turn there.`,
    ].join("\n");
  }
  return [
    "# The context hands over",
    "",
    `The context holds ${box.fill ?? "more"} tokens, past \`${AT}\` at ${asks(box, AT)}.`,
    "Finish the step in hand, and start nothing new: commit it, hand the step",
    "back or leave it in hand. Then write",
    `\`${HANDOVER}\`: what stands, what waits, and the ticket and step in hand.`,
    `Name no file under \`${RETRO}\`: the next retro reads that folder, and a hand does not.`,
    "End the turn there. Level zero clears the conversation, and the next one",
    "reads the handover, the rules and the step again.",
  ].join("\n");
}

// The turn's end of a session due: it holds until the handover stands, then ends whatever the tooth votes. [[spec/design_output/stop#the-context-hands-over]]
export function holdsForHandover(e, box) {
  const due = box.handover;
  if (e?.agentId || due?.phase !== FINISH) return null;
  // A stop waiting on the owner holds the clear: the tooth votes, the session stays due, and the next turn's end clears. [[spec/tickets/the-clear-keeps-questions]]
  if (waitsForOwner(e, box)) {
    box.log.say(
      "info",
      "handover",
      "the turn waits on the owner, so the clear waits for the next turn's end",
    );
    return null;
  }
  const retro = namesRetro(box);
  if (handoverStands(box) && !retro) {
    due.phase = CLEAR;
    box.log.say(
      "info",
      "handover",
      `${HANDOVER} stands, so the turn ends and the clear follows`,
    );
    return { pass: true };
  }
  due.asked += 1;
  const most = Number(asks(box, MOST) ?? 0);
  // The same cap the tooth keeps, so a session that writes no handover runs away nowhere. [[spec/design_output/stop#three-in-a-row]]
  if (most > 0 && due.asked > most) {
    box.log.say(
      "warn",
      "handover",
      `no ${HANDOVER} after ${most} asks, so the session hands over nothing`,
    );
    box.handover = null;
    return null;
  }
  if (retro) {
    box.log.say("warn", "handover", `${HANDOVER} names ${retro}, so the turn holds`);
    return { result: { block: retroText(retro) } };
  }
  box.log.say("info", "handover", `the turn holds until ${HANDOVER} stands`);
  return { result: { block: dueText(box) } };
}

// A handover naming the retro folder sends the next conversation to read it. The retro alone reads that folder. [[spec/design_output/stop#the-context-hands-over]]
export function namesRetro(box) {
  const at = join(box.work, ...HANDOVER.split("/"));
  let text = "";
  try {
    text = String(box.disk.read(at));
  } catch {
    return "";
  }
  const found = text.match(RETRO_PATH);
  return found ? found[0] : "";
}

function retroText(found) {
  return [
    "# The handover names the retro",
    "",
    `\`${HANDOVER}\` names \`${found}\`. The next retro reads \`${RETRO}\`, and a hand`,
    "does not, so the next conversation must not read it. Name the ticket or the",
    "class by its name, take the path out, and end the turn again.",
  ].join("\n");
}

export function handoverStands(box) {
  const at = join(box.work, ...HANDOVER.split("/"));
  try {
    return box.disk.exists(at) && String(box.disk.read(at)).trim() !== "";
  } catch {
    return false;
  }
}

// The turn the handover ends asks the bridgehead for the clear and the prompt after it. [[spec/design_output/stop#the-context-hands-over]]
export function clearsAfter(e, box, answer) {
  if (e?.agentId || e?.reason !== "answer" || box.handover?.phase !== CLEAR)
    return answer;
  // A binding changed while the clear stood keeps the conversation. [[spec/design_output/stop#the-queue-alone-clears]]
  if (!clearsHere(box)) {
    box.handover = null;
    return answer;
  }
  box.handover = null;
  box.log.say(
    "info",
    "handover",
    "the turn ends, and the bridgehead clears the conversation",
  );
  return { ...(answer ?? { pass: true }), clear: { prompt: RESUME } };
}

// A clear drops what the conversation held, so the hold forgets the notes it handed and the next pull hands them again. [[spec/design_output/pull#the-hand-and-the-hold]]
export function forgetsReads(box) {
  const folder = join(box.work, ...HOLDS.split("/"));
  let rows = [];
  try {
    rows = box.disk
      .list(folder)
      .filter((one) => one.kind === "file" && one.name.endsWith(".json"));
  } catch {
    return 0;
  }
  let forgot = 0;
  for (const one of rows) {
    const at = join(folder, one.name);
    try {
      const held = JSON.parse(String(box.disk.read(at)));
      if (!Array.isArray(held?.reads) || !held.reads.length) continue;
      box.disk.write(at, `${JSON.stringify({ ...held, reads: [] }, null, 2)}\n`);
      forgot += 1;
    } catch {}
  }
  return forgot;
}
