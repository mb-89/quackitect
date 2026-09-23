// The context door. A session past context.handoverAt finishes, writes the
// handover, and ends the turn; the bridgehead clears the conversation there
// and prompts the next one, which reads the handover and the step again.
// [[spec/design_output/stop#the-context-hands-over]]

import { join } from "node:path";
import { HANDOVER, HOLDS } from "../../.claude/skills/level0/lib/folders.js";
import { asks } from "./config.js";

const AT = "context.handoverAt";
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
  if (box.handover || box.standsDown || fill < at) return;
  box.handover = { phase: FINISH, asked: 0 };
  box.log.say(
    "info",
    "handover",
    `the context holds ${fill} tokens, past ${AT} at ${at}, so the session hands over`,
    { tokens: fill, at },
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
  return [
    "# The context hands over",
    "",
    `The context holds ${box.fill ?? "more"} tokens, past \`${AT}\` at ${asks(box, AT)}.`,
    "Bring the work to a point a hand picks up: commit it, hand the step back or",
    "leave it in hand, and start nothing new. Then write",
    `\`${HANDOVER}\`: what stands, what waits, and the ticket and step in hand.`,
    "End the turn there. Level zero clears the conversation, and the next one",
    "reads the handover, the rules and the step again.",
  ].join("\n");
}

// The turn's end of a session due: it holds until the handover stands, then ends whatever the tooth votes. [[spec/design_output/stop#the-context-hands-over]]
export function holdsForHandover(e, box) {
  const due = box.handover;
  if (e?.agentId || due?.phase !== FINISH) return null;
  if (handoverStands(box)) {
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
  box.log.say("info", "handover", `the turn holds until ${HANDOVER} stands`);
  return { result: { block: dueText(box) } };
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
