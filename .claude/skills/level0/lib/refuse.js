// The wording of a refusal, written once and read by every door.
// [[spec/design_output/level0#the-write-door]]

export function refusal(where, found) {
  const lines = [];
  lines.push(`The voice rules refuse this write to ${where}.`);
  lines.push("");

  for (const one of found) {
    lines.push(`  ${where}:${one.line}:${one.column}  ${one.rule}`);
    if (one.said) lines.push(`    wrote: ${cut(one.said)}`);
    lines.push(`    ${one.message}`);
    lines.push("");
  }

  lines.push(taught(found));
  return lines.join("\n");
}

export function taught(found) {
  const names = [...new Set(found.map((f) => f.rule))];
  const list =
    names.length === 1
      ? names[0]
      : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
  return (
    `Hold ${list} for the rest of this turn: apply the same rule to every line you write next, ` +
    "and fix the lines you already wrote if they break it."
  );
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
