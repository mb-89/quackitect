// THE PULL NOTICE — written once, printed by every hook that greets an agent.
//
// WHY IT IS A MODULE AND NOT A STRING IN EACH HOOK. Two SessionStart hooks
// exist, and they fire for different arrivals:
//
// - `.claude/settings.json` at the REPOSITORY ROOT is committed, so it is the
//   only hook a fresh cloud clone can fire. It runs se-hook-arrive, which
//   performs the arrival and then greets the agent.
// - `project/.claude/settings.json` is PLACED by the arrival or by the editor,
//   so it only ever fires for a session that is already caged. It runs
//   se-hook-start.
//
// Both must tell the agent the same thing about the pull. Until 2026-08-18
// each carried its own hand-written copy, which is two sources for one text
// and the drift that follows.
//
// WHAT DOES NOT BELONG HERE: rules. The rules reach an agent through the
// prompt layer, assembled verbatim from project/guidance/ by promptlayer.ts.
// A hook that restated a rule would be a third source for it. This module
// carries the ONE thing the prompt layer cannot: what to do first, in a
// session that may not have read anything yet.

/** The five answers, and the three habits. Every greeting ends with this. */
export const PULL_NOTICE = [
  "- read — the document rides along and `prove` names its last words. Read it, then pull again with form: {read: <those words>}.",
  "- fill — the machine built the form. Return it on the next pull as form: {...}. A form you mean to FINISH carries submit: true.",
  "- do — the happy path was walked for you. Do what the guidance asks, then pull again.",
  "- choose — options ride a `do`. Answer form: {choice: <to>} only when a routed goal needs that door.",
  "- wait — STOP and tell the person plainly which step waits. The dial alone cannot wake you; they must send a message, e.g. continue.",
  "You carry no hashes and choose nothing unasked. Pull, do, pull again.",
  // MEASURED ON THE i35 CLOUD RUN: a pull can answer `do` and not move,
  // because nothing is routed. Saying so here saves the next agent the
  // guess.
  "A pull that answers `do` and does not move wants an se_aim at where you are going.",
  "When a result carries a `banner`, show it to the person VERBATIM.",
].join("\n");

/** The caged session's opening. The lane is already there. */
export const OPENING = [
  "[se] PULL: your FIRST action is the se_pull tool with no payload. The machine answers with an instruction:",
  PULL_NOTICE,
  "The lane is locked until the machine reaches idle.",
  "",
  "[se] The rules that bind you are in your prompt layer already — AGENTS.md, assembled from project/guidance/. Rule 13 says what to do when the walk reaches the front desk.",
].join("\n");

/** The cloud arrival's opening. The agent may have no `se_` tools of its own,
 *  so the notice names the fallback caller the arrival just wrote. */
export const ARRIVED = [
  "[se] THE LANE IS UP AND YOU ARE THE AGENT ON IT. Your FIRST action is se_pull with no payload — `node .se/se-call.mjs se_pull` if you have no se_ tools of your own.",
  PULL_NOTICE,
  "",
  "[se] The rules that bind you are in project/AGENTS.md, assembled from project/guidance/. Read it if your host did not hand it to you. Rule 13 says what to do when the walk reaches the front desk.",
].join("\n");

/** What a compaction leaves behind, and what to do about it. */
export const COMPACTED = [
  "[se] Context was compacted. What you remember reading is gone from your head, and the machine knows it.",
  "Call se_pull to reorient: it answers `read` for whatever must be read again, handing the documents over one at a time.",
  "The one rule is unchanged: you work through the se MCP server, and you do what it tells you.",
].join("\n");
