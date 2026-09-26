// The context door. A session past context.handoverAt goes due, and the pull
// hands the clear's tickets once the ticket in hand stands done. A held clear
// ends the turn, the bridgehead clears the conversation there, and the next
// one opens on the ticket that reads the handover.
// [[spec/design_output/stop#the-context-hands-over]]

import { join } from "node:path";
import { BINDING, QUEUE } from "../../.claude/skills/level0/lib/config.js";
import { HOLDS } from "../../.claude/skills/level0/lib/folders.js";
import {
  CLEAR as CLEAR_TICKET,
  dropsDue,
  heldAs,
  holdsIn,
  isEphemeral,
  marksDue,
  READ,
} from "../scripts/ephemeral.js";
import { asks } from "./config.js";
import { waitsForOwner } from "./stop.js";

const AT = "context.handoverAt";
const MOST = "stop.mostInARow";
export const FINISH = "finish";
export const CLEAR = "clear";

// What the next conversation reads first, as its opening prompt. [[spec/design_output/stop#the-context-hands-over]]
export const RESUME = [
  "Level zero cleared the conversation, because the context passed",
  `\`${AT}\`. Run \`./RUNME.sh ticket pull\`: \`${READ}\` stands in your hand,`,
  "and the handover block says where the work stands.",
].join(" ");

// A fill past the key marks the session due. Every reading lands here, off the call and off the turn's measure alike. [[spec/design_output/stop#the-context-hands-over]]
export function measures(box, tokens) {
  const fill = Number(tokens);
  if (!Number.isFinite(fill) || fill <= 0) return;
  box.fill = fill;
  // The queue alone clears, so a session under god or unbound keeps its conversation and goes due nowhere. [[spec/design_output/stop#the-queue-alone-clears]]
  if (!clearsHere(box)) {
    box.handover = null;
    dropsDue(box.disk, box.work);
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
  if (box.handover) return;
  if (box.standsDown || fill < at) return;
  box.handover = { phase: FINISH, asked: 0 };
  // The pull runs apart from this server, so the mark stands on disk. [[spec/design_input/the-clear-hands-ephemeral-tickets#the-ticket-ends-first]]
  marksDue(box.disk, box.work, { tokens: fill, at });
  box.log.say(
    "info",
    "handover",
    `the context holds ${fill} tokens, past ${AT} at ${at}, so the session hands over`,
    { tokens: fill, at },
  );
}

// [[spec/design_output/stop#the-queue-alone-clears]]
export function clearsHere(box) {
  return String(asks(box, BINDING) ?? "") === QUEUE;
}

// [[spec/design_output/stop#the-context-hands-over]]
export function onSessionMeasure(e, box) {
  if (!e?.agentId) measures(box, e?.context?.tokens);
  return { pass: true };
}

// What a session due holding nothing reads at the turn's end. [[spec/design_output/stop#the-context-hands-over]]
export function dueText(box) {
  return [
    "# The context hands over",
    "",
    `The context holds ${box.fill ?? "more"} tokens, past \`${AT}\` at ${asks(box, AT)}.`,
    "Run `./RUNME.sh ticket pull`. It hands the handover ticket, then the clear,",
    "and the clear ends the turn.",
  ].join("\n");
}

// The turn's end: a held clear ends it whatever the tooth votes, a ticket in hand leaves it to the tooth, and a session due holding nothing is sent to the pull. [[spec/design_output/stop#the-context-hands-over]]
export function holdsForHandover(e, box) {
  if (e?.agentId) return null;
  const clearing = clearHeld(box);
  if (clearing) {
    // A binding moved off the queue keeps the conversation, so the clear drops. [[spec/design_output/stop#the-queue-alone-clears]]
    if (!clearsHere(box)) {
      dropsClear(box);
      box.handover = null;
      return null;
    }
    if (ownerWaits(e, box)) return null;
    box.handover = { asked: 0, ...(box.handover ?? {}), phase: CLEAR };
    box.log.say("info", "handover", "the clear stands in hand, so the turn ends and the clear follows");
    return { pass: true };
  }
  const due = box.handover;
  if (due?.phase !== FINISH || ownerWaits(e, box)) return null;
  // A ticket is the unit of work, so a hold standing carries the turn through the tooth. [[spec/design_input/the-clear-hands-ephemeral-tickets#the-ticket-ends-first]]
  if (holdsIn(box.disk, box.work).length) return null;
  due.asked += 1;
  const most = Number(asks(box, MOST) ?? 0);
  // The same cap the tooth keeps, so a session that pulls nothing runs away nowhere. [[spec/design_output/stop#three-in-a-row]]
  if (most > 0 && due.asked > most) {
    box.log.say(
      "warn",
      "handover",
      `no pull after ${most} asks, so the session hands over nothing`,
    );
    box.handover = null;
    dropsDue(box.disk, box.work);
    return null;
  }
  box.log.say("info", "handover", "the turn holds until the pull hands the handover ticket");
  return { result: { block: dueText(box) } };
}

// A stop waiting on the owner holds the clear: the tooth votes, and the next turn's end clears. [[spec/tickets/the-clear-keeps-questions]]
function ownerWaits(e, box) {
  if (!waitsForOwner(e, box)) return false;
  box.log.say(
    "info",
    "handover",
    "the turn waits on the owner, so the clear waits for the next turn's end",
  );
  return true;
}

// [[spec/design_input/the-clear-hands-ephemeral-tickets#three-tickets-run-the-clear]]
function clearHeld(box) {
  return holdsIn(box.disk, box.work).some(
    ({ held }) => isEphemeral(held) && held.ticket === CLEAR_TICKET,
  );
}

function dropsClear(box) {
  for (const { at, held } of holdsIn(box.disk, box.work)) {
    if (isEphemeral(held) && held.ticket === CLEAR_TICKET) box.disk.remove(at);
  }
  dropsDue(box.disk, box.work);
}

// The clear closes the clear ticket and puts the one reading the handover in its hand, and the mark drops. [[spec/design_input/the-clear-hands-ephemeral-tickets#three-tickets-run-the-clear]]
export function readsNext(box) {
  let put = 0;
  for (const { at, held } of holdsIn(box.disk, box.work)) {
    if (!isEphemeral(held) || held.ticket !== CLEAR_TICKET) continue;
    box.disk.write(at, `${JSON.stringify(heldAs(READ, held.hand, held.taken), null, 2)}\n`);
    put += 1;
  }
  dropsDue(box.disk, box.work);
  return put;
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
