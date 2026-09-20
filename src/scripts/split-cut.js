// The ranges a split takes and the cut it makes over text. The verb around
// them stands in split-verb.js, and nothing here reaches the disk.
// [[spec/design_output/level0#the-size-ceiling]]

const RANGE = /^(\d+)-(\d+)$/;

// [[spec/design_output/level0#the-size-ceiling]]
export function cutsIn(argv) {
  const said = argv ?? [];
  const cuts = [];
  let path = "";
  for (let at = 0; at < said.length; at++) {
    if (said[at] === "--to") {
      if (path)
        return { cuts: [], why: `${path} names no range. Add --lines from-to.` };
      path = String(said[at + 1] ?? "");
      at++;
      continue;
    }
    if (said[at] !== "--lines") continue;
    if (!path) return { cuts: [], why: "A range names no target. Add --to path." };
    const found = RANGE.exec(String(said[at + 1] ?? ""));
    if (!found)
      return { cuts: [], why: `${said[at + 1]} reads as no range. Write from-to.` };
    const from = Number(found[1]);
    const to = Number(found[2]);
    if (from < 1)
      return { cuts: [], why: "A file's first line is 1, so a range starts there." };
    if (to < from)
      return {
        cuts: [],
        why: `${from}-${to} reads backwards. Write the smaller first.`,
      };
    cuts.push({ path, from, to });
    path = "";
    at++;
  }
  if (path) return { cuts: [], why: `${path} names no range. Add --lines from-to.` };
  if (!cuts.length)
    return { cuts: [], why: "A split names a target: --to path --lines from-to." };
  return { cuts, why: "" };
}

// [[spec/design_output/level0#the-size-ceiling]]
export function splitText(text, cuts) {
  const lines = String(text ?? "").split("\n");
  const held = lines.at(-1) === "" ? lines.slice(0, -1) : lines;
  const taken = new Map();
  for (const one of cuts ?? []) {
    if (one.to > held.length) {
      return {
        targets: [],
        rest: text,
        why: `${one.path} reaches line ${one.to}, and the file holds ${held.length} line(s).`,
      };
    }
    for (let line = one.from; line <= one.to; line++) {
      if (taken.has(line)) {
        return {
          targets: [],
          rest: text,
          why: `${one.path} and ${taken.get(line)} both reach line ${line}.`,
        };
      }
      taken.set(line, one.path);
    }
  }

  const targets = (cuts ?? []).map((one) => ({
    path: one.path,
    text: `${held.slice(one.from - 1, one.to).join("\n")}\n`,
  }));
  const rest = held.filter((_line, at) => !taken.has(at + 1));
  return { targets, rest: rest.length ? `${rest.join("\n")}\n` : "", why: "" };
}
