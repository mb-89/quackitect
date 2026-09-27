// The formatter a payload meets before the engine merges it: text in, text
// out, so the pull stays cold and reads no Vale. It reads one field's
// answer, and no line of another leaf.
// [[spec/design_output/pull#the-fields-ride-the-payload]]

// A bullet writes as a dash, a line drops its trailing blanks, and a run of blank lines folds to one. The indent a command line opens with stands. [[spec/design_output/pull#the-fields-ride-the-payload]]
export function formatted(said) {
  return String(said ?? "")
    .split(/\r?\n/)
    .map((row) => row.replace(/[ \t]+$/, "").replace(/^(\s*)\* /, "$1- "))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/^\n+/, "")
    .trimEnd();
}
