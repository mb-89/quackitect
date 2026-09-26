// The answer door. A prompt or an ask opens a demand for a reply, a call
// inside its grace passes, and every call after asks the bridgehead for the
// texts until one pays. A helper is untouched.
// [[spec/design_output/level0#the-owners-prompt-comes-first]]

import {
  namesNote,
  newestNote,
  notesIn,
  questionsIn,
  warns,
} from "../../.claude/skills/level0/lib/answer.js";
import { SAID } from "../../.claude/skills/level0/lib/log.js";

const OWNER = new Set(["composer", "sdk"]);
const PROMPT_WHY = "The owner sent a prompt";
const REACHES = new Set(["AskUserQuestion", "mcp__level0__report"]);
export const SPOKE = "agent.spoke";

// The owner reads the chat, and the log reads the report, so a mid-turn answer goes to both. [[spec/design_output/level0#the-reply-line]]
export const SAYS = (why) =>
  [
    `${why}, and nothing has answered it. Answer it before the next tool call: write it in the`,
    "chat as text, which pays this door the moment the chat shows it. Call mcp__level0__report",
    "with the same text so the log carries it. Say what you understood and what you do next.",
    "Then work.",
  ].join(" ");

// The skips are the grace: the block rides that many calls, and the next one asks for the reply. [[spec/design_output/stop#the-grace]]
export function demands(box, why, block = "", onPaid = null, skips = 0) {
  box.demand = { why, seen: box.spoken ?? "", skips: Math.max(0, Number(skips) || 0), block, onPaid };
}

// [[spec/design_output/level0#which-prompt-opens-a-turn]]
export function onPromptSubmit(e, box) {
  const from = String(e?.origin?.kind ?? "");
  // A helper's hand-back and a task's notice reach the session as a prompt, and the owner typed neither, so each writes an agent row and asks for no reply. [[spec/design_output/log#a-prompt-is-the-owners]]
  const kind = OWNER.has(from) ? "prompt" : "agent";
  box.log.say("info", kind, String(e?.text ?? ""), {
    detail: from,
    text: String(e?.text ?? ""),
  });
  if (!OWNER.has(from)) return { pass: true };
  // An owner's prompt opens a turn, and the report of the last turn answers nothing in it. [[spec/design_output/stop#a-talk-follows-a-report]]
  box.reported = false;
  // [[spec/design_output/level0#the-first-call-asks]]
  demands(box, PROMPT_WHY);
  box.demand.prompt = true;
  // The newest transcript row the bridgehead found at the prompt keys the demand, so a text from before it pays nothing. [[spec/tickets/a-reply-follows-its-prompt]]
  box.demand.before = String(e?.before ?? "");
  // A prompt asking for a note takes a parked note as its answer. [[spec/design_output/level0#a-note-answers-its-prompt]]
  if (namesNote(String(e?.text ?? ""))) box.demand.notes = notesIn(box);
  box.asks = questionsIn(String(e?.text ?? ""));
  // The answer-first line rides the prompt's own event. [[spec/tickets/a-reply-follows-its-prompt]]
  const { before: _before, ...rest } = e ?? {};
  return { event: { ...rest, text: `${warns(PROMPT_WHY)}\n\n${String(e?.text ?? "")}` } };
}

// One writer of the spoken text, so its stamp stands beside it. [[spec/tickets/a-reply-follows-its-prompt]]
function speaks(box, text) {
  box.spoken = text;
  box.spokenAt = Number(box.clock?.now?.() ?? 0);
}

export function onMessageDisplay(e, box) {
  // A helper's text reaches the agent that started it, and the owner reads none of it. [[spec/design_output/log#a-prompt-is-the-owners]]
  if (e?.agentId || e?.agent_id) return { pass: true };
  const text = String(e?.delta ?? "").trim();
  if (text) speaks(box, text);
  if (!box.demand || !text || box.demand.fits?.(text)) return { pass: true };
  return paid(box, text);
}

// [[spec/design_output/level0#the-owners-prompt-comes-first]]
export function holdsForAnswer(e, box) {
  const demand = box.demand;
  if (!demand || e?.agentId || REACHES.has(String(e?.tool ?? ""))) return null;
  // [[spec/design_output/level0#a-note-answers-its-prompt]]
  if (demand.notes !== undefined && notesIn(box) > demand.notes) {
    paid(box, newestNote(box));
    return null;
  }
  if (demand.skips > 0) {
    demand.skips -= 1;
    return demand.block ? { after: { context: [demand.block] } } : null;
  }
  return { needs: "reply" };
}

export function onAgentSpoke(e, box) {
  const demand = box.demand;
  if (!demand) return { pass: true };
  const fresh = freshTexts(e, demand);
  const fitting = fresh.filter((one) => !demand.fits?.(one));
  if (fitting.length) return paid(box, fitting.at(-1));
  const newest = fresh.at(-1) ?? "";
  const lacks = newest
    ? `${demand.fits(newest)} The last text seen (${newest.length} characters) reads: "${head(newest)}".`
    : `${SAYS(demand.why)} The last text seen stands from before the ask, and reads: "${head(demand.seen)}".`;
  box.log.say("debug", "gate", `refused ${e?.tool ?? "a call"} before a reply`, {
    tool: String(e?.tool ?? ""),
    detail: lacks,
  });
  return { result: { deny: lacks } };
}

// A prompt's demand reads the transcript past its own row. A transcript carrying no row ids pays a prompt nothing, so the display road pays alone. [[spec/tickets/a-reply-follows-its-prompt]] [[spec/tickets/a-late-count-pays-nothing]]
function freshTexts(e, demand) {
  if (!demand.prompt || !Array.isArray(e?.rows)) return textsSince(e, demand.seen);
  return demand.before ? pastRow(e.rows, demand.before) : [];
}

function pastRow(rows, before) {
  const at = rows.findIndex((one) => one?.id === before);
  if (at < 0) return [];
  const owner = rows.findIndex(
    (one, where) => where > at && one?.role === "user" && !one?.results,
  );
  if (owner < 0) return [];
  return rows
    .slice(owner + 1)
    .filter((one) => one?.role === "assistant")
    .map((one) => String(one?.text ?? "").trim())
    .filter(Boolean);
}

function textsSince(e, seen) {
  const texts = [...(Array.isArray(e?.texts) ? e.texts : []), e?.text ?? ""]
    .map((one) => String(one).trim())
    .filter(Boolean);
  const at = texts.lastIndexOf(seen);
  return (at >= 0 ? texts.slice(at + 1) : texts.filter((one) => one !== seen)).filter(
    (one, where, all) => all.indexOf(one) === where,
  );
}

function head(text) {
  return String(text ?? "")
    .replace(/\s+/g, " ")
    .slice(0, SAID);
}

export function pays(box, text) {
  const demand = box.demand;
  if (!demand) {
    box.log.say("info", "reply", text, { text });
    speaks(box, text);
    return "The reply stands in the log. Nothing asked for one, so carry on, and write it in the chat too where the owner reads it.";
  }
  const lacks = demand.fits?.(text) ?? "";
  if (lacks) return lacks;
  paid(box, text);
  return `The reply stands in the log, and it answers: ${demand.why}. Write it in the chat too, as text, and carry on.`;
}

function paid(box, text) {
  const demand = box.demand;
  box.demand = null;
  speaks(box, text);
  box.log.say("info", "reply", text, { text, detail: `answers: ${demand.why}` });
  if (demand.onPaid) demand.onPaid();
  return { pass: true };
}

export function onTurnEnd(e, box) {
  // A helper's last word answers the agent that started it, so it writes no reply row. [[spec/design_output/log#a-prompt-is-the-owners]]
  if (e?.agentId) return { pass: true };
  const text = String(e?.answer ?? "").trim();
  const demand = box.demand;
  const answered = e?.reason === "answer" && text;
  if (answered && demand && !demand.fits?.(text)) return paid(box, text);
  if (answered && text !== box.spoken) box.log.say("info", "reply", text, { text });
  if (answered) speaks(box, text);
  if (demand && !demand.fits) box.demand = null;
  return { pass: true };
}

export function holdsTurn(e, box) {
  if (e?.agentId) return { pass: true };
  const demand = box.demand;
  const text = String(e?.last_assistant_message ?? "").trim();
  const lacks = demand?.fits ? demand.fits(text) : "";
  if (!lacks) return { pass: true };
  box.log.say("info", "stop", `the turn holds: ${lacks}`, { detail: demand.why });
  return {
    result: { block: `${lacks} ${demand.why}, and the turn ends when it stands.` },
  };
}
