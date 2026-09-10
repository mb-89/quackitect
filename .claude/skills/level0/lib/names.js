// A name holds the words the config allows: a file, a folder, a branch. Vale
// counts a heading's words, and this counts a name's, because Vale reads what
// a file holds. The caller hands the cap in, and asks the resolver for it.
// [[spec/design_output/level0#a-name-holds-five-words]]

export function wordsIn(name) {
  return String(name ?? "")
    .replace(/\.[^.]*$/, "")
    .split(/[-_.]+/)
    .filter(Boolean).length;
}

export function overLong(path, most) {
  if (!most) return "";
  for (const part of String(path ?? "").split(/[/\\]+/)) {
    if (part && wordsIn(part) > most) return part;
  }
  return "";
}
