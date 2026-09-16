// The magic numbers in a Go file, read the way Biome reads a JavaScript one:
// a bare number carrying a meaning, outside a constant, a string and a test.
// [[spec/design_output/config#the-magic-numbers-take-names]]

import { sizeFaults } from "./size.js";

export const RULE = "MagicNumber";
const GO = /\.go$/i;
const TEST = /_test\.go$/i;
const PLAIN = new Set(["0", "1", "2"]);
const NUMBER = /(^|[^A-Za-z0-9_.[])(\d+(?:\.\d+)?)(?![A-Za-z0-9_])/g;
const QUOTED = /"(?:[^"\\]|\\.)*"|`[^`]*`|'(?:[^'\\]|\\.)*'/g;

export function magicIn(text, where) {
  const out = [];
  const path = String(where ?? "");
  if (!GO.test(path) || TEST.test(path)) return out;
  let inConst = false;
  const lines = String(text ?? "").split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const bare = lines[i].trim();
    if (inConst) {
      inConst = bare !== ")";
      continue;
    }
    if (bare === "const (") {
      inConst = true;
      continue;
    }
    if (bare.startsWith("const ") || bare.startsWith("//")) continue;
    const code = lines[i]
      .replace(QUOTED, (said) => " ".repeat(said.length))
      .replace(/\/\/.*$/, "");
    for (const hit of code.matchAll(NUMBER)) {
      if (PLAIN.has(hit[2])) continue;
      out.push(found(where, i + 1, hit.index + hit[1].length + 1, hit[2]));
    }
  }
  return out;
}

function found(where, line, column, number) {
  return {
    file: where,
    rule: RULE,
    line,
    column,
    said: number,
    message: `${number} carries a meaning here. Name it in the constants block at the top of this file, or under spec/config/level0.json.`,
    severity: "warning",
  };
}

// [[spec/design_output/level0#the-size-ceiling]]
export function codeFaults(text, where, ceilings) {
  return [
    ...sizeFaults(text, where, ceilings).map((one) => ({
      ...one,
      severity: "warning",
    })),
    ...magicIn(text, where),
  ];
}
