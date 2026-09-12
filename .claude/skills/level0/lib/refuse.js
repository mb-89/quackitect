// The wording of a refusal, written once and read by every door.
// [[spec/design_output/level0#the-write-door]]

export function refusal(where, found) {
  return [
    `The voice rules refuse this write to ${where}.`,
    "",
    ...bodyOf(where, found),
    taught(found),
  ].join("\n");
}

// [[spec/design_output/level0#what-the-gate-says]]
export function answerFindings(where, it) {
  const found = it?.found ?? [];
  const score = it?.score ?? 0;
  if (!found.length) {
    return `No finding stands in this answer, so it meets the gate clean.`;
  }
  const head =
    it?.band === "rewrite"
      ? "The voice rules refuse this answer. Write it again."
      : "The voice rules read this answer, and the score stands under the ceiling.";
  return [
    head,
    "",
    `  the score is ${score} findings a thousand words.`,
    "",
    ...bodyOf(where, found),
    taught(found),
  ].join("\n");
}

// [[spec/design_output/level0#the-carry-rides-a-prompt]]
export function carried(found, score) {
  return `The answer before this scored ${score} findings a thousand words. ${taught(found)}`;
}

function bodyOf(where, found) {
  const lines = [];
  for (const one of found ?? []) {
    lines.push(`  ${where}:${one.line}:${one.column}  ${one.rule}`);
    if (one.said) lines.push(`    wrote: ${cut(one.said)}`);
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
  lines.push(`  ran: ${cut(command, 120)}`);
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

function cut(said, at = 72) {
  const flat = String(said ?? "")
    .replace(/\s+/g, " ")
    .trim();
  return flat.length > at ? `${flat.slice(0, at - 3)}...` : flat;
}
