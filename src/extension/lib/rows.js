// The log as rows a person reads. The extension holds its own reader, because
// the plugin's lib is a module and the editor loads a script here.
// [[spec/design_output/extension#the-button-prints-the-log]]

const OWN = ["at", "level", "kind", "said"];

function newestIn(names) {
  return [...(names ?? [])].filter((one) => one.endsWith(".jsonl")).sort().pop() ?? "";
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
    String(said.at ?? "").slice(11, 23),
    String(said.level ?? "").padEnd(5),
    String(said.kind ?? "").padEnd(6),
    said.said ?? "",
  ].join(" ");

  const rest = Object.entries(said).filter(([key]) => !OWN.includes(key));
  return rest.length
    ? `${head}\n${" ".repeat(13)}${rest.map(([key, value]) => `${key}=${value}`).join(" ")}`
    : head;
}

module.exports = { newestIn, rowOf, rowsIn };
