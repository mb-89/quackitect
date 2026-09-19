// The log as rows a person reads. The extension holds its own reader, because
// the plugin's lib is a module and the editor loads a script here.
// [[spec/design_output/extension#the-button-prints-the-log]]

const OWN = ["at", "level", "kind", "said"];
const STAMP = { from: 11, to: 23 };
const LEVEL_WIDTH = 5;
const KIND_WIDTH = 6;
const INDENT = STAMP.to - STAMP.from + 1;

function newestIn(names) {
  return (
    [...(names ?? [])]
      .filter((one) => one.endsWith(".jsonl"))
      .sort()
      .pop() ?? ""
  );
}

function rowsIn(text) {
  const out = [];
  for (const line of String(text ?? "").split(/\r?\n/)) {
    if (!line.trim()) continue;
    out.push(rowOf(line));
  }
  return out;
}

function rowOf(line) {
  let said;
  try {
    said = JSON.parse(line);
  } catch {
    return line;
  }

  const head = [
    String(said.at ?? "").slice(STAMP.from, STAMP.to),
    String(said.level ?? "").padEnd(LEVEL_WIDTH),
    String(said.kind ?? "").padEnd(KIND_WIDTH),
    said.said ?? "",
  ].join(" ");

  const rest = Object.entries(said).filter(([key]) => !OWN.includes(key));
  return rest.length
    ? `${head}\n${" ".repeat(INDENT)}${rest.map(([key, value]) => `${key}=${value}`).join(" ")}`
    : head;
}

module.exports = { newestIn, rowOf, rowsIn };
