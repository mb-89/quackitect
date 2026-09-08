// Sentence case for a shouted lead. Vale carries five actions and none folds
// case, so this tree makes the one fix Vale reports and refuses to apply.
// A caller hands in the file text and the findings Vale already named.
// [[spec/design_output/level0#the-fixer-calms-a-shouted-lead]]

export const SHOUTED = "ShoutedLead";

export function sentenceCase(said) {
  const text = String(said ?? "");
  const first = text.search(/\p{L}/u);
  if (first < 0) return text;
  return (
    text.slice(0, first) +
    text[first].toUpperCase() +
    text.slice(first + 1).toLowerCase()
  );
}

export function calmed(text, found) {
  const said = String(text ?? "");
  const starts = lineStarts(said);
  const mine = (found ?? [])
    .filter((one) => one.rule === SHOUTED && one.said)
    .sort((a, b) => b.line - a.line || b.column - a.column);

  let out = said;
  for (const one of mine) {
    const start = starts[one.line - 1];
    if (start === undefined) continue;
    const from = start + one.column - 1;
    const to = from + one.said.length;
    if (out.slice(from, to) !== one.said) continue;
    out = out.slice(0, from) + sentenceCase(one.said) + out.slice(to);
  }
  return out;
}

function lineStarts(said) {
  const out = [0];
  const eol = /\r?\n/g;
  for (let hit = eol.exec(said); hit; hit = eol.exec(said)) {
    out.push(hit.index + hit[0].length);
  }
  return out;
}
