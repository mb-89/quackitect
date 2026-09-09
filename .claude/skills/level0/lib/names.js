// A name holds five words: a file, a folder, a branch. Vale counts a heading's
// words, and this counts a name's, because Vale reads what a file holds.
// [[spec/design_output/level0#a-name-holds-five-words]]

export const WORDS = 5;

export function wordsIn(name) {
  return String(name ?? "")
    .replace(/\.[^.]*$/, "")
    .split(/[-_.]+/)
    .filter(Boolean).length;
}

export function overLong(path, most = WORDS) {
  for (const part of String(path ?? "").split(/[/\\]+/)) {
    if (part && wordsIn(part) > most) return part;
  }
  return "";
}
