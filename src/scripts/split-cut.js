// The ranges a split takes and the cut it makes over text. The verb around
// them stands in split-verb.js, and nothing here reaches the disk.
// [[spec/design_output/level0#the-size-ceiling]]

export function cutsIn(argv) {
  return { cuts: [], why: "" };
}

export function splitText(text, cuts) {
  return { targets: [], rest: text, why: "" };
}
