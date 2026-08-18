// se-hook-start — THE SESSION-START NOTICE. Not the prompt layer.
//
// KNOW THE DIFFERENCE, because getting it wrong puts a second copy of the
// rules in the tree (owner correction 2026-08-18).
//
// THE PROMPT LAYER IS THE SESSION PROMPT. `engine/promptlayer.ts` assembles
// project/guidance/contract.md, walking.md, method/lane.md and voice.md
// VERBATIM into AGENTS.md, CLAUDE.md and .github/instructions, at agent
// start. No model stands in that path, so a rule cannot come out compressed
// differently on different days. Every rule an agent must hold arrives that
// way, every turn, and survives a compaction.
//
// THIS FILE IS SMALLER THAN THAT. It is the SessionStart hook: a here-and-now
// notice that the first act is a pull. It carries no rules, because rules
// that live in two places drift.
//
// WHAT BELONGS HERE: what is true about THIS start and nothing else.
// WHAT BELONGS IN guidance/: anything that binds the agent.
//
// It is a script rather than an inline `node -e` only so the text can hold
// line breaks and apostrophes. The old inline form worked; it was simply
// hard to edit.
//
// A hook must never break the turn, so this only ever writes to stdout and
// exits clean.

// ── THE PULL ─────────────────────────────────────────────────────────────
//
// The one verb, and the five answers. This is what makes the first action a
// pull rather than a guess, and it has earned its place: without it an agent
// reaches for its own tools and meets a refusal instead of a walk.
//
// The RULES about the walk are guidance/walking.md, which the prompt layer
// already carries. This is the reminder, not the rule.
const OPENING = [
  "[se] PULL: your FIRST action is the se_pull tool with no payload. The machine answers with an instruction:",
  "- read — the document rides along and `prove` names its last words. Read it, then pull again with form: {read: <those words>}.",
  "- fill — the machine built the form. Return it on the next pull as form: {...}. A form you mean to FINISH carries submit: true.",
  "- do — the happy path was walked for you. Do what the guidance asks, then pull again.",
  "- choose — options ride a `do`. Answer form: {choice: <to>} only when a routed goal needs that door.",
  "- wait — STOP and tell the person plainly which step waits. The dial alone cannot wake you; they must send a message, e.g. continue.",
  "You carry no hashes and choose nothing unasked. Pull, do, pull again.",
  "When a result carries a `banner`, show it to the person VERBATIM.",
  "The lane is locked until the machine reaches idle.",
  "",
  "[se] The rules that bind you are in your prompt layer already — AGENTS.md, assembled from project/guidance/. Rule 13 says what to do when the walk reaches the front desk.",
].join("\n");

const COMPACTED = [
  "[se] Context was compacted. What you remember reading is gone from your head, and the machine knows it.",
  "Call se_pull to reorient: it answers `read` for whatever must be read again, handing the documents over one at a time.",
  "The one rule is unchanged: you work through the se MCP server, and you do what it tells you.",
].join("\n");

process.stdout.write(`${process.argv.includes("--compacted") ? COMPACTED : OPENING}\n`);
