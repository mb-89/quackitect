// The wording of a refusal, written once and read by every door.
// [[spec/design_output/level0#the-write-door]]

import { TERMS } from "./vocabulary.js";

// [[spec/design_output/vocabulary#the-vocabulary-is-three-lists]]
export const VOCABULARY = "Vocabulary";
const SHOWN = 5;
const COMMAND = 120;
const LINE = 72;
const ELLIPSIS = "...";

export function refusal(where, found) {
  return [
    `The voice rules refuse this write to ${where}.`,
    "",
    ...bodyOf(where, found),
    taught(found),
    ...road(found),
  ].join("\n");
}

// A word off the list has two roads, and the refusal names both. [[spec/design_output/vocabulary#the-vocabulary-is-three-lists]]
export function grown(found) {
  const words = outsideIn(found);
  if (!words.length) return "";
  return [
    `A word outside the core is jargon until a term says what it means. Write a core word, or`,
    `add ${namesThe(words)} to ${TERMS} with one line that says what it means, as`,
    '`- {word: <the word>, means: "<one line>"}` in core words and other terms,',
    "and write the line again. The next write reads the new rule.",
  ].join("\n");
}

// [[spec/design_output/vocabulary#the-vocabulary-is-three-lists]]
function road(found) {
  const said = grown(found);
  return said ? ["", said] : [];
}

// [[spec/design_output/vocabulary#the-vocabulary-is-three-lists]]
function outsideIn(found) {
  const out = new Set();
  for (const one of found ?? []) {
    if (!String(one?.rule ?? "").endsWith(VOCABULARY)) continue;
    const said = String(one?.said ?? "")
      .trim()
      .toLowerCase();
    if (said) out.add(said);
  }
  return [...out];
}

function namesThe(words) {
  const shown = words.slice(0, SHOWN).map((one) => `\`${one}\``);
  const tail = words.length > SHOWN ? `, and ${words.length - SHOWN} more` : "";
  return `${shown.join(", ")}${tail}`;
}

// The score reaches the log alone, because a number names nothing to fix. [[spec/design_output/level0#what-the-gate-says]]
export function answerFindings(where, it) {
  const found = it?.found ?? [];
  if (!found.length) {
    return `No finding stands in this answer, so it meets the gate clean.`;
  }
  const head =
    it?.band === "rewrite"
      ? "The voice rules refuse this answer. Write it again."
      : "The voice rules read this answer, and it stands under the ceiling.";
  return [head, "", ...bodyOf(where, found), taught(found), ...road(found)].join("\n");
}

// The answer stands as sent, so the note teaches and asks for nothing. [[spec/design_output/level0#the-findings-ride-the-call]]
export function gateNote(where, it) {
  const found = it?.found ?? [];
  return [
    `The gate read your last answer at ${it?.band ?? "carry"}, and it stands as sent.`,
    "",
    ...bodyOf(where, found),
    taught(found),
    ...road(found),
  ].join("\n");
}

function bodyOf(where, found) {
  const lines = [];
  for (const one of found ?? []) {
    lines.push(`  ${where}:${one.line}:${one.column}  ${one.rule}`);
    if (one.said) lines.push(`    wrote: ${cut(one.said)}`);
    if (one.context) lines.push(`    in: ${one.context}`);
    lines.push(`    ${one.message}`);
    lines.push("");
  }
  return lines;
}

// [[spec/design_output/bash#what-every-refusal-owes]]
export function refusedCommand(command, found) {
  const lines = [];
  lines.push("Level zero refuses this command.");
  lines.push("");
  lines.push(`  ran: ${cut(command, COMMAND)}`);
  lines.push("");

  for (const one of found) {
    lines.push(`  ${one.rule}`);
    if (one.said) lines.push(`    reads: ${cut(one.said)}`);
    lines.push(`    ${one.message}`);
    lines.push("");
  }

  lines.push(`Hold ${namesOf(found)} for the rest of this turn.`);
  return lines.join("\n");
}

// [[spec/design_output/private#two-doors-one-check]]
export function refusedDelta(found) {
  const lines = [];
  lines.push("This commit carries something private, so the door holds it here.");
  lines.push("");

  for (const one of found) {
    lines.push(`  ${one.file}:${one.line}:${one.column}  ${one.rule}`);
    lines.push(`    adds: ${cut(one.said)}`);
    lines.push(`    ${one.message}`);
    lines.push("");
  }

  lines.push(
    "Take the line out of the delta, stage the file again, and commit. A line " +
      "the delta removes passes always, so a leak leaves this tree the same way.",
  );
  return lines.join("\n");
}

export function taught(found) {
  return (
    `Hold ${namesOf(found)} for the rest of this turn: apply the same rule to every line you write next, ` +
    "and fix the lines you already wrote if they break it."
  );
}

function namesOf(found) {
  const names = [...new Set(found.map((f) => f.rule))];
  if (names.length === 1) return names[0];
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

export function line(one, where) {
  return `${where}:${one.line}:${one.column}: ${one.rule}: ${one.message}`;
}

function cut(said, at = LINE) {
  const flat = String(said ?? "")
    .replace(/\s+/g, " ")
    .trim();
  return flat.length > at ? `${flat.slice(0, at - ELLIPSIS.length)}${ELLIPSIS}` : flat;
}
