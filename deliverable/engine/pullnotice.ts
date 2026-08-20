// see dsp-boot-and-power.md#the-pull-notice

/** The five answers, and the three habits. Every greeting ends with this. */
export const PULL_NOTICE = [
  "- read — the document rides along and `prove` asks three fill-in-the-blank questions about it. Answer all three in one string: form: {read: <the answers>}. Quote generously — the check is containment, not an exact match.",
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
  "[se] The rules that bind you are in your prompt layer already — AGENTS.md, assembled from guidance/. Rule 13 says what to do when the walk reaches the front desk.",
].join("\n");

/** The cloud arrival's opening. The agent may have no `se_` tools of its own,
 *  so the notice names the fallback caller the arrival just wrote. */
export const ARRIVED = [
  "[se] THE LANE IS UP AND YOU ARE THE AGENT ON IT. Your FIRST action is se_pull with no payload — `node .se/se-call.mjs se_pull` if you have no se_ tools of your own.",
  PULL_NOTICE,
  "",
  "[se] The rules that bind you are in AGENTS.md, assembled from guidance/. Read it if your host did not hand it to you. Rule 13 says what to do when the walk reaches the front desk.",
].join("\n");

/** What a compaction leaves behind, and what to do about it. */
export const COMPACTED = [
  "[se] Context was compacted. What you remember reading is gone from your head, and the machine knows it.",
  "Call se_pull to reorient: it answers `read` for whatever must be read again, handing the documents over one at a time.",
  "The one rule is unchanged: you work through the se MCP server, and you do what it tells you.",
].join("\n");
